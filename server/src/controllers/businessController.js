const BusinessClaim = require('../models/BusinessClaim');
const Establishment = require('../models/Establishment');
const EstablishmentManager = require('../models/EstablishmentManager');
const EstablishmentChangeRequest = require('../models/EstablishmentChangeRequest');
const EstablishmentAuditLog = require('../models/EstablishmentAuditLog');
const {
  ANALYTICS_EVENTS,
  EstablishmentAnalyticsEvent,
} = require('../models/EstablishmentAnalyticsEvent');
const {
  BUSINESS_EDITABLE_FIELDS,
  BUSINESS_URL_FIELDS,
  SENSITIVE_BUSINESS_FIELDS,
} = require('../config/business');
const { businessFreshness } = require('../utils/businessFreshness');

const ACTION_EVENTS = ANALYTICS_EVENTS.filter((type) => type !== 'detail_impression');

function activeClaimKey(userId, establishmentId) {
  return `${userId}:${establishmentId}`;
}

function normalizeHttpsUrl(value) {
  const normalized = new URL(value);
  if (normalized.protocol !== 'https:' || normalized.username || normalized.password) {
    throw new TypeError('URL HTTPS inválida');
  }
  normalized.hash = '';
  return normalized.toString();
}

function safeClaim(claim) {
  return {
    _id: claim._id,
    establishment: claim.establishment,
    responsibleName: claim.responsibleName,
    relationship: claim.relationship,
    officialUrl: claim.officialUrl,
    verificationMethod: claim.verificationMethod,
    additionalComment: claim.additionalComment,
    status: claim.status,
    adminReason: claim.adminReason,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
  };
}

function pickBusinessChanges(body = {}) {
  return Object.fromEntries(
    BUSINESS_EDITABLE_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => {
        const value = body[field] === '' ? null : body[field];
        if (!value) return [field, value];
        if (BUSINESS_URL_FIELDS.includes(field)) return [field, normalizeHttpsUrl(value)];
        if (field === 'businessImages') {
          return [
            field,
            value.map((image) => ({ ...image, url: normalizeHttpsUrl(image.url) })),
          ];
        }
        if (field === 'socialLinks') {
          return [
            field,
            value.map((link) => ({ ...link, url: normalizeHttpsUrl(link.url) })),
          ];
        }
        return [field, value];
      })
  );
}

function sponsoredNow(establishment, now = new Date()) {
  const sponsorship = establishment?.sponsorship;
  if (sponsorship?.status !== 'active') return false;
  if (sponsorship.startsAt && new Date(sponsorship.startsAt) > now) return false;
  if (sponsorship.endsAt && new Date(sponsorship.endsAt) < now) return false;
  return true;
}

function businessEstablishmentView(establishment) {
  return {
    ...establishment,
    sponsorship: establishment.sponsorship
      ? {
          status: sponsoredNow(establishment) ? 'active' : 'inactive',
          startsAt: establishment.sponsorship.startsAt,
          endsAt: establishment.sponsorship.endsAt,
        }
      : undefined,
  };
}

async function createClaim(req, res) {
  const establishment = await Establishment.findById(req.params.id).select('_id name').lean();
  if (!establishment) return res.status(404).json({ error: 'Establecimiento no encontrado' });

  const existingManager = await EstablishmentManager.exists({
    establishment: establishment._id,
    status: 'active',
  });
  if (existingManager) {
    return res.status(409).json({ error: 'Este establecimiento ya tiene una gestión aprobada' });
  }

  const activeKey = activeClaimKey(req.user.id, establishment._id);
  try {
    const claim = await BusinessClaim.create({
      establishment: establishment._id,
      claimant: req.user.id,
      responsibleName: req.body.responsibleName,
      relationship: req.body.relationship,
      professionalEmail: req.body.professionalEmail,
      phone: req.body.phone || undefined,
      officialUrl: normalizeHttpsUrl(req.body.officialUrl),
      verificationMethod: req.body.verificationMethod,
      evidenceDescription: req.body.evidenceDescription,
      additionalComment: req.body.additionalComment || undefined,
      consentAt: new Date(),
      activeKey,
    });
    await EstablishmentAuditLog.create({
      establishment: establishment._id,
      actor: req.user.id,
      action: 'claim_created',
      targetType: 'business_claim',
      targetId: claim._id,
      toStatus: 'pending',
    });
    res.status(201).json(safeClaim(claim.toObject()));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Ya existe una solicitud activa para este local' });
    }
    throw error;
  }
}

async function listMyClaims(req, res) {
  const claims = await BusinessClaim.find({ claimant: req.user.id })
    .select('-professionalEmail -phone -evidenceDescription -consentAt -activeKey')
    .populate('establishment', 'name type address')
    .sort('-createdAt')
    .lean();
  res.json({ data: claims.map(safeClaim) });
}

async function getMyClaim(req, res) {
  const claim = await BusinessClaim.findOne({ _id: req.params.claimId, claimant: req.user.id })
    .select('-activeKey -reviewedBy')
    .populate('establishment', 'name type address')
    .lean();
  if (!claim) return res.status(404).json({ error: 'Solicitud no encontrada' });
  res.json(safeClaim(claim));
}

async function addClaimInformation(req, res) {
  const claim = await BusinessClaim.findOne({ _id: req.params.claimId, claimant: req.user.id });
  if (!claim) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (claim.status !== 'needs_information') {
    return res.status(409).json({ error: 'La solicitud no admite información adicional' });
  }
  claim.evidenceDescription = req.body.evidenceDescription;
  claim.additionalComment = req.body.additionalComment || claim.additionalComment;
  claim.status = 'pending';
  claim.adminReason = undefined;
  await claim.save();
  await EstablishmentAuditLog.create({
    establishment: claim.establishment,
    actor: req.user.id,
    action: 'claim_information_added',
    targetType: 'business_claim',
    targetId: claim._id,
    fromStatus: 'needs_information',
    toStatus: 'pending',
  });
  res.json(safeClaim(claim.toObject()));
}

async function cancelClaim(req, res) {
  const claim = await BusinessClaim.findOne({ _id: req.params.claimId, claimant: req.user.id });
  if (!claim) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (!['pending', 'needs_information'].includes(claim.status)) {
    return res.status(409).json({ error: 'Esta solicitud ya no puede cancelarse' });
  }
  const fromStatus = claim.status;
  claim.status = 'cancelled';
  claim.activeKey = undefined;
  await claim.save();
  await EstablishmentAuditLog.create({
    establishment: claim.establishment,
    actor: req.user.id,
    action: 'claim_cancelled',
    targetType: 'business_claim',
    targetId: claim._id,
    fromStatus,
    toStatus: 'cancelled',
  });
  res.json({ status: claim.status });
}

async function listManagedEstablishments(req, res) {
  const [managers, claims] = await Promise.all([
    EstablishmentManager.find({ user: req.user.id, status: 'active' })
      .populate('establishment')
      .sort('-updatedAt')
      .lean(),
    BusinessClaim.find({
      claimant: req.user.id,
      status: { $in: ['pending', 'needs_information', 'rejected'] },
    })
      .select('-professionalEmail -phone -evidenceDescription -consentAt -activeKey')
      .populate('establishment', 'name type address')
      .sort('-updatedAt')
      .lean(),
  ]);
  res.json({
    data: managers.map(({ establishment, role }) => ({
      ...businessEstablishmentView(establishment),
      managerRole: role,
      freshness: businessFreshness(establishment),
      sponsored: sponsoredNow(establishment),
    })),
    claims: claims.map(safeClaim),
  });
}

async function getBusinessDashboard(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment) return res.status(404).json({ error: 'Establecimiento no encontrado' });
  const pendingChanges = await EstablishmentChangeRequest.countDocuments({
    establishment: establishment._id,
    status: { $in: ['draft', 'pending_review'] },
  });
  const fields = ['businessDescription', 'phone', 'websiteUrl', 'weeklyHours', 'logoUrl'];
  const complete = fields.filter((field) => Boolean(establishment[field])).length;
  res.json({
    establishment: businessEstablishmentView(establishment),
    freshness: businessFreshness(establishment),
    pendingChanges,
    completeness: { completed: complete, total: fields.length, percent: complete * 20 },
    sponsored: sponsoredNow(establishment),
    plan: { status: sponsoredNow(establishment) ? 'sponsored_manual' : 'claimed' },
  });
}

async function createChangeRequest(req, res) {
  const submittedFields = Object.keys(req.body.changes || {});
  const protectedFields = submittedFields.filter(
    (field) => !BUSINESS_EDITABLE_FIELDS.includes(field)
  );
  if (protectedFields.length) {
    return res.status(400).json({
      error: 'La solicitud contiene campos protegidos',
      fields: protectedFields,
    });
  }
  const changes = pickBusinessChanges(req.body.changes);
  const fields = Object.keys(changes);
  if (!fields.length) return res.status(400).json({ error: 'No hay cambios permitidos' });
  const sensitiveFields = fields.filter((field) => SENSITIVE_BUSINESS_FIELDS.includes(field));
  const status = req.body.submit === true ? 'pending_review' : 'draft';
  const request = await EstablishmentChangeRequest.create({
    establishment: req.params.id,
    requestedBy: req.user.id,
    changes,
    fields,
    sensitiveFields,
    status,
  });
  await EstablishmentAuditLog.create({
    establishment: req.params.id,
    actor: req.user.id,
    action: status === 'draft' ? 'change_draft_created' : 'change_submitted',
    targetType: 'change_request',
    targetId: request._id,
    toStatus: status,
    metadata: { fields },
  });
  res.status(201).json(request);
}

async function listChanges(req, res) {
  const data = await EstablishmentChangeRequest.find({
    establishment: req.params.id,
    requestedBy: req.user.id,
  })
    .sort('-createdAt')
    .lean();
  res.json({ data });
}

function periodDates(rawPeriod = '30d') {
  const days = Math.min(Math.max(parseInt(rawPeriod, 10) || 30, 7), 90);
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return { days, start, end };
}

async function getAnalytics(req, res) {
  const { days, start, end } = periodDates(req.query.period);
  const rows = await EstablishmentAnalyticsEvent.aggregate([
    { $match: { establishment: req.establishmentManager.establishment, occurredAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((row) => [row._id, row.count]));
  const impressions = counts.detail_impression || 0;
  const actions = ACTION_EVENTS.reduce((sum, type) => sum + (counts[type] || 0), 0);
  res.json({
    period: { days, start, end, timezone: 'UTC' },
    impressions,
    actions: Object.fromEntries(ACTION_EVENTS.map((type) => [type, counts[type] || 0])),
    conversionRate: impressions ? Math.round((actions / impressions) * 1000) / 10 : null,
    definition: 'Acciones registradas divididas por impresiones de la ficha.',
    insufficientData: impressions < 10,
  });
}

async function recordAnalyticsEvent(req, res) {
  const userAgent = req.get('user-agent') || '';
  if (/bot|crawler|spider|slurp|headless/i.test(userAgent)) return res.status(202).json({ recorded: false });
  const establishment = await Establishment.findById(req.params.id).select('_id sponsorship').lean();
  if (!establishment) return res.status(404).json({ error: 'Establecimiento no encontrado' });
  const source =
    req.body.type === 'sponsored_click' && sponsoredNow(establishment) ? 'sponsored' : 'organic';
  try {
    await EstablishmentAnalyticsEvent.create({
      establishment: establishment._id,
      eventId: req.body.eventId,
      type: req.body.type,
      source,
    });
    res.status(201).json({ recorded: true });
  } catch (error) {
    if (error?.code === 11000) return res.status(200).json({ recorded: false, duplicate: true });
    throw error;
  }
}

function promotionResources(establishment, origin) {
  const canonicalUrl = `${origin.replace(/\/$/, '')}/lugar/${establishment._id}`;
  const label = 'Veja a nossa informação no GlutenFri';
  const note =
    'O selo confirma que o estabelecimento gere uma ficha no GlutenFri. Não representa certificação de segurança alimentar.';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="96" viewBox="0 0 360 96" role="img" aria-labelledby="title desc"><title id="title">${label}</title><desc id="desc">${note}</desc><rect width="360" height="96" rx="16" fill="#3d5a45"/><text x="24" y="40" fill="#fff" font-family="Arial,sans-serif" font-size="18" font-weight="700">GlutenFri</text><text x="24" y="66" fill="#fff" font-family="Arial,sans-serif" font-size="14">${label}</text></svg>`;
  return {
    canonicalUrl,
    label,
    note,
    badge: { svg, filename: `glutenfri-${establishment._id}.svg` },
    snippet: `<a href="${canonicalUrl}" rel="noopener"><img src="URL_DO_SELO" alt="${label}"></a>`,
    googleProfileKit: {
      shortDescription: establishment.businessDescription?.slice(0, 250) || '',
      longDescription: establishment.businessDescription || '',
      services: establishment.services || [],
      menuUrl: establishment.menuUrl || '',
      websiteUrl: establishment.websiteUrl || '',
      phone: establishment.phone || '',
      missing: [
        !establishment.businessDescription && 'descrição',
        !establishment.weeklyHours && 'horário',
        !establishment.websiteUrl && 'website',
      ].filter(Boolean),
      disclaimer: 'Material de preparação. O GlutenFri não publica nem representa o Google Business Profile.',
    },
  };
}

async function getPromotion(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment) return res.status(404).json({ error: 'Establecimiento no encontrado' });
  const origin = process.env.PUBLIC_SITE_URL || 'https://glutenfri.netlify.app';
  res.json(promotionResources(establishment, origin));
}

module.exports = {
  addClaimInformation,
  cancelClaim,
  createChangeRequest,
  createClaim,
  getAnalytics,
  getBusinessDashboard,
  getMyClaim,
  getPromotion,
  listChanges,
  listManagedEstablishments,
  listMyClaims,
  normalizeHttpsUrl,
  pickBusinessChanges,
  promotionResources,
  recordAnalyticsEvent,
  safeClaim,
  sponsoredNow,
};
