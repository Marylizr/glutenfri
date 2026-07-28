const BusinessClaim = require('../models/BusinessClaim');
const Establishment = require('../models/Establishment');
const EstablishmentManager = require('../models/EstablishmentManager');
const EstablishmentChangeRequest = require('../models/EstablishmentChangeRequest');
const EstablishmentAuditLog = require('../models/EstablishmentAuditLog');
const { pickBusinessChanges } = require('./businessController');
const { BUSINESS_REVIEW_DAYS } = require('../config/business');

const CLAIM_TRANSITIONS = Object.freeze({
  pending: new Set(['needs_information', 'approved', 'rejected']),
  needs_information: new Set(['approved', 'rejected']),
  approved: new Set(['revoked']),
  rejected: new Set(),
  revoked: new Set(),
  cancelled: new Set(),
});

async function listClaims(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const query = req.query.status ? { status: req.query.status } : {};
  const [data, total] = await Promise.all([
    BusinessClaim.find(query)
      .populate('establishment', 'name type address')
      .populate('claimant', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BusinessClaim.countDocuments(query),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function updateClaimStatus(req, res) {
  const claim = await BusinessClaim.findById(req.params.claimId);
  if (!claim) return res.status(404).json({ error: 'Solicitud no encontrada' });
  const previous = claim.status;
  const status = req.body.status;
  if (!CLAIM_TRANSITIONS[previous]?.has(status)) {
    return res.status(409).json({
      error: `No se puede cambiar una solicitud de ${previous} a ${status}`,
    });
  }
  if (status === 'approved') {
    const otherManager = await EstablishmentManager.exists({
      establishment: claim.establishment,
      user: { $ne: claim.claimant },
      status: 'active',
    });
    if (otherManager) {
      return res.status(409).json({
        error: 'El establecimiento ya tiene otra gestión aprobada',
      });
    }
    await EstablishmentManager.findOneAndUpdate(
      { establishment: claim.establishment, user: claim.claimant },
      {
        establishment: claim.establishment,
        user: claim.claimant,
        claim: claim._id,
        role: 'owner',
        status: 'active',
        grantedBy: req.user.id,
        $unset: { revokedAt: 1, revokedBy: 1, revocationReason: 1 },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
  }
  if (status === 'revoked') {
    await EstablishmentManager.updateMany(
      { establishment: claim.establishment, user: claim.claimant, status: 'active' },
      {
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy: req.user.id,
        revocationReason: req.body.reason,
      }
    );
  }
  claim.status = status;
  claim.adminReason = req.body.reason;
  claim.reviewedBy = req.user.id;
  claim.reviewedAt = new Date();
  if (['rejected', 'revoked', 'cancelled'].includes(status)) claim.activeKey = undefined;
  await claim.save();
  await EstablishmentAuditLog.create({
    establishment: claim.establishment,
    actor: req.user.id,
    action: `claim_${status}`,
    targetType: 'business_claim',
    targetId: claim._id,
    fromStatus: previous,
    toStatus: status,
    reason: req.body.reason,
  });
  res.json(claim);
}

async function listChangeRequests(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const query = req.query.status ? { status: req.query.status } : {};
  const [data, total] = await Promise.all([
    EstablishmentChangeRequest.find(query)
      .populate('establishment')
      .populate('requestedBy', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    EstablishmentChangeRequest.countDocuments(query),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function reviewChangeRequest(req, res) {
  const request = await EstablishmentChangeRequest.findById(req.params.changeId);
  if (!request) return res.status(404).json({ error: 'Solicitud de cambio no encontrada' });
  if (request.status !== 'pending_review') {
    return res.status(409).json({ error: 'La solicitud no está pendiente de revisión' });
  }
  const status = req.body.status;
  if (status === 'published') {
    const published = pickBusinessChanges(request.changes);
    const now = new Date();
    const establishment = await Establishment.findByIdAndUpdate(
      request.establishment,
      {
        ...published,
        lastBusinessReviewAt: now,
        lastPublishedUpdateAt: now,
        nextReviewDueAt: new Date(
          now.getTime() + BUSINESS_REVIEW_DAYS.nextReview * 24 * 60 * 60 * 1000
        ),
      },
      { runValidators: true }
    );
    if (!establishment) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }
  }
  request.status = status;
  request.reviewReason = req.body.reason;
  request.reviewedBy = req.user.id;
  request.reviewedAt = new Date();
  await request.save();
  await EstablishmentAuditLog.create({
    establishment: request.establishment,
    actor: req.user.id,
    action: status === 'published' ? 'change_published' : 'change_rejected',
    targetType: 'change_request',
    targetId: request._id,
    fromStatus: 'pending_review',
    toStatus: status,
    reason: req.body.reason,
    metadata: { fields: request.fields },
  });
  res.json(request);
}

async function listManagers(req, res) {
  const data = await EstablishmentManager.find({ establishment: req.params.id })
    .populate('user', 'name email')
    .sort('-updatedAt')
    .lean();
  res.json({ data });
}

async function setSponsorship(req, res) {
  if (
    req.body.active &&
    req.body.startsAt &&
    req.body.endsAt &&
    new Date(req.body.startsAt) >= new Date(req.body.endsAt)
  ) {
    return res.status(400).json({ error: 'La fecha de fin debe ser posterior al inicio' });
  }
  const establishment = await Establishment.findByIdAndUpdate(
    req.params.id,
    {
      sponsorship: {
        status: req.body.active ? 'active' : 'inactive',
        startsAt: req.body.active ? req.body.startsAt || new Date() : undefined,
        endsAt: req.body.active ? req.body.endsAt || undefined : undefined,
        updatedBy: req.user.id,
      },
    },
    { returnDocument: 'after', runValidators: true }
  );
  if (!establishment) return res.status(404).json({ error: 'Establecimiento no encontrado' });
  await EstablishmentAuditLog.create({
    establishment: establishment._id,
    actor: req.user.id,
    action: req.body.active ? 'sponsorship_activated' : 'sponsorship_deactivated',
    targetType: 'establishment',
    targetId: establishment._id,
    reason: req.body.reason,
    metadata: { endsAt: req.body.endsAt || null, source: 'manual_admin' },
  });
  res.json({ sponsorship: establishment.sponsorship });
}

async function listCommercialAudit(req, res) {
  const query = req.query.establishment ? { establishment: req.query.establishment } : {};
  const data = await EstablishmentAuditLog.find(query)
    .populate('actor', 'name email')
    .populate('establishment', 'name')
    .sort('-createdAt')
    .limit(200)
    .lean();
  res.json({ data });
}

module.exports = {
  listChangeRequests,
  listClaims,
  listCommercialAudit,
  listManagers,
  reviewChangeRequest,
  setSponsorship,
  updateClaimStatus,
};
