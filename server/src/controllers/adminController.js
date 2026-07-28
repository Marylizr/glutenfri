const mongoose = require('mongoose');
const { normalizeEstablishmentTrust } = require('../utils/trustStatus');
const Review = require('../models/Review');
const User = require('../models/User');
const Establishment = require('../models/Establishment');
const AdminAction = require('../models/AdminAction');
const { EstablishmentReport } = require('../models/EstablishmentReport');
const { recordAdminAction } = require('../services/adminAudit');
const { deleteUserData } = require('./usersController');
const {
  claimGooglePlacesRefresh,
  getRefreshJobState,
  markRefreshFailed,
  startGooglePlacesRefresh,
} = require('../services/googlePlacesRefreshJob');

const REPORT_REASON_LABELS = {
  incorrect_safety: 'Información de seguridad incorrecta',
  offensive: 'Contenido ofensivo',
  spam: 'Spam o promoción',
  personal_data: 'Datos personales',
  other: 'Otro motivo',
};

function escapeRegExp(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function activeSuspensionQuery() {
  return {
    suspendedAt: { $ne: null },
    $or: [{ suspendedUntil: null }, { suspendedUntil: { $gt: new Date() } }],
  };
}

async function dashboard(req, res) {
  const reportQuery = {
    $or: [{ 'reports.0': { $exists: true } }, { 'reportedBy.0': { $exists: true } }],
  };
  const [users, reviews, establishments, reportsPending, suspendedUsers, recentActions] =
    await Promise.all([
      User.countDocuments(),
      Review.countDocuments(),
      Establishment.countDocuments(),
      Review.countDocuments(reportQuery),
      User.countDocuments(activeSuspensionQuery()),
      AdminAction.find()
        .sort('-createdAt')
        .limit(8)
        .populate('actor', 'name email')
        .lean(),
    ]);

  res.json({
    metrics: { users, reviews, establishments, reportsPending, suspendedUsers },
    recentActions,
  });
}

async function listReportedReviews(req, res) {
  const query = {
    $or: [{ 'reports.0': { $exists: true } }, { 'reportedBy.0': { $exists: true } }],
  };
  if (req.query.status === 'visible') query.hidden = false;
  if (req.query.status === 'hidden') query.hidden = true;
  if (req.query.reason) query['reports.reason'] = req.query.reason;

  const reviews = await Review.find(query)
    .sort('-updatedAt')
    .limit(200)
    .populate('establishment', 'name type address riskLevel certified')
    .populate('user', 'name email suspendedAt suspendedUntil')
    .populate('reports.reporter', 'name email')
    .lean();

  const data = reviews
    .map((review) => {
      const reports =
        review.reports?.length > 0
          ? review.reports.map((report) => ({
              ...report,
              reasonLabel: REPORT_REASON_LABELS[report.reason] || REPORT_REASON_LABELS.other,
            }))
          : (review.reportedBy || []).map((reporter) => ({
              reporter,
              reason: 'other',
              reasonLabel: 'Reporte anterior sin motivo registrado',
              details: null,
              createdAt: review.updatedAt,
            }));
      return { ...review, reports, reportsCount: reports.length };
    })
    .sort((a, b) => b.reportsCount - a.reportsCount);

  res.json({ data });
}

async function hideReview(req, res) {
  const review = await Review.findByIdAndUpdate(req.params.id, { hidden: true }, { new: true })
    .populate('establishment', 'name')
    .lean();
  if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
  await recordAdminAction({
    actorId: req.user.id,
    action: 'review_hidden',
    targetType: 'review',
    targetId: review._id,
    targetLabel: review.establishment?.name,
    reason: req.body.reason,
  });
  res.json(review);
}

async function unhideReview(req, res) {
  const review = await Review.findByIdAndUpdate(req.params.id, { hidden: false }, { new: true })
    .populate('establishment', 'name')
    .lean();
  if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
  await recordAdminAction({
    actorId: req.user.id,
    action: 'review_restored',
    targetType: 'review',
    targetId: review._id,
    targetLabel: review.establishment?.name,
    reason: req.body.reason,
  });
  res.json(review);
}

async function listUsers(req, res) {
  const query = {};
  if (req.query.search) {
    const search = new RegExp(escapeRegExp(req.query.search), 'i');
    query.$or = [{ name: search }, { email: search }];
  }
  if (req.query.role === 'admin') query.isAdmin = true;
  if (req.query.role === 'user') query.isAdmin = false;
  if (req.query.status === 'suspended') query.$and = [activeSuspensionQuery()];
  if (req.query.status === 'active') {
    query.$and = [
      {
        $or: [
          { suspendedAt: null },
          { suspendedAt: { $exists: false } },
          { suspendedUntil: { $lte: new Date() } },
        ],
      },
    ];
  }

  const users = await User.find(query)
    .select(
      'name email isAdmin createdAt suspendedAt suspendedUntil suspensionReason savedEstablishments'
    )
    .sort({ isAdmin: -1, createdAt: -1 })
    .limit(200)
    .lean();

  const reviewCounts = await Review.aggregate([
    { $match: { user: { $in: users.map((user) => user._id) } } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const countByUser = new Map(reviewCounts.map((item) => [item._id.toString(), item.count]));

  res.json({
    data: users.map((user) => ({
      ...user,
      reviewsCount: countByUser.get(user._id.toString()) || 0,
      savedCount: user.savedEstablishments?.length || 0,
      isSuspended:
        Boolean(user.suspendedAt) &&
        (!user.suspendedUntil || new Date(user.suspendedUntil) > new Date()),
      savedEstablishments: undefined,
    })),
  });
}

async function setAdminRole(req, res) {
  const { isAdmin } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  if (user.isAdmin && !isAdmin) {
    if (user._id.toString() === req.user.id) {
      return res.status(409).json({ error: 'Otro administrador debe retirar tu acceso' });
    }
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return res.status(409).json({ error: 'No se puede quitar el último administrador' });
    }
  }

  user.isAdmin = isAdmin;
  await user.save();
  await recordAdminAction({
    actorId: req.user.id,
    action: isAdmin ? 'admin_granted' : 'admin_revoked',
    targetType: 'user',
    targetId: user._id,
    targetLabel: user.email,
  });
  res.json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
  });
}

async function setUserSuspension(req, res) {
  const { suspended, reason, suspendedUntil } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user._id.toString() === req.user.id) {
    return res.status(409).json({ error: 'No puedes suspender tu propia cuenta' });
  }
  if (user.isAdmin && suspended) {
    return res.status(409).json({ error: 'Retira primero el rol de administrador' });
  }

  user.suspendedAt = suspended ? new Date() : null;
  user.suspendedUntil = suspended && suspendedUntil ? new Date(suspendedUntil) : null;
  user.suspensionReason = suspended ? reason : null;
  await user.save();
  await recordAdminAction({
    actorId: req.user.id,
    action: suspended ? 'user_suspended' : 'user_restored',
    targetType: 'user',
    targetId: user._id,
    targetLabel: user.email,
    reason,
    metadata: suspendedUntil ? { suspendedUntil } : undefined,
  });
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuspended: suspended,
      suspendedAt: user.suspendedAt,
      suspendedUntil: user.suspendedUntil,
      suspensionReason: user.suspensionReason,
    },
  });
}

async function updateUserProfile(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const changedFields = [];
  if (req.body.name !== undefined && req.body.name !== user.name) {
    user.name = req.body.name;
    changedFields.push('name');
  }
  if (req.body.email !== undefined) {
    const email = req.body.email.trim().toLowerCase();
    if (email !== user.email) {
      const duplicate = await User.exists({ _id: { $ne: user._id }, email });
      if (duplicate) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
      user.email = email;
      changedFields.push('email');
    }
  }

  if (changedFields.length === 0) {
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  }

  try {
    await user.save();
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }
    throw error;
  }
  await recordAdminAction({
    actorId: req.user.id,
    action: 'user_updated',
    targetType: 'user',
    targetId: user._id,
    targetLabel: user.email,
    metadata: { changedFields },
  });
  res.json({
    user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
  });
}

async function deleteUser(req, res) {
  const user = await User.findById(req.params.id).select('email isAdmin');
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user._id.toString() === req.user.id) {
    return res.status(409).json({ error: 'No puedes eliminar tu propia cuenta desde el panel' });
  }
  if (req.body.confirmEmail.trim().toLowerCase() !== user.email) {
    return res.status(400).json({ error: 'El email de confirmación no coincide' });
  }
  if (user.isAdmin) {
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount <= 1) {
      return res.status(409).json({ error: 'No se puede eliminar el último administrador' });
    }
  }

  await deleteUserData(user._id);
  await recordAdminAction({
    actorId: req.user.id,
    action: 'user_deleted',
    targetType: 'user',
    targetLabel: 'Cuenta eliminada',
    reason: req.body.reason,
    metadata: { wasAdmin: user.isAdmin },
  });
  res.status(204).end();
}

async function listAdminEstablishments(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
  const query = {};
  if (req.query.search) {
    const search = new RegExp(escapeRegExp(req.query.search), 'i');
    query.$or = [{ name: search }, { address: search }];
  }
  if (req.query.type) query.type = req.query.type;
  if (req.query.source) query.source = req.query.source;
  if (req.query.riskLevel) query.riskLevel = req.query.riskLevel;
  if (req.query.certified === 'true') query.certified = true;
  if (req.query.certified === 'false') query.certified = false;
  if (req.query.trustStatus) query.trustStatus = req.query.trustStatus;

  const [data, total] = await Promise.all([
    Establishment.find(query)
      .sort('name')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Establishment.countDocuments(query),
  ]);
  res.json({
    data: data.map(normalizeEstablishmentTrust),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

function establishmentPayload(body) {
  const allowed = [
    'name',
    'type',
    'address',
    'lat',
    'lng',
    'phone',
    'email',
    'facebook',
    'source',
    'certified',
    'trustStatus',
    'sourceName',
    'sourceUrl',
    'lastVerifiedAt',
    'discount',
    'tags',
    'notes',
    'dedicatedKitchen',
    'dedicatedGlutenFreeMenu',
    'staffTrained',
    'riskLevel',
    'images',
    'logoUrl',
    'certificationBody',
    'certificationDate',
    'websiteUrl',
    'menuUrl',
    'reservationUrl',
    'orderUrl',
    'whatsapp',
    'timezone',
    'weeklyHours',
    'crossContactMeasures',
    'dedicatedArea',
    'delivery',
    'takeaway',
    'accessibilityFeatures',
    'serviceLanguages',
    'glutenFreeScope',
    'informationSources',
    'lastInformationUpdate',
  ];
  const payload = Object.fromEntries(
    allowed.filter((key) => body[key] !== undefined).map((key) => [key, body[key]])
  );
  if (body.trustStatus) {
    payload.certified = body.trustStatus === 'CERTIFIED_APC_BIOTRAB';
  }
  return payload;
}

async function listEstablishmentReports(req, res) {
  const query = req.query.status ? { status: req.query.status } : {};
  const reports = await EstablishmentReport.find(query)
    .populate('establishment', 'name type address')
    .sort('-createdAt')
    .limit(200)
    .lean();
  res.json(reports);
}

async function createEstablishment(req, res) {
  const establishment = await Establishment.create({
    ...establishmentPayload(req.body),
    source: req.body.source || 'user',
  });
  await recordAdminAction({
    actorId: req.user.id,
    action: 'establishment_created',
    targetType: 'establishment',
    targetId: establishment._id,
    targetLabel: establishment.name,
  });
  res.status(201).json(establishment);
}

async function updateEstablishment(req, res) {
  const establishment = await Establishment.findByIdAndUpdate(
    req.params.id,
    establishmentPayload(req.body),
    { new: true, runValidators: true }
  );
  if (!establishment) return res.status(404).json({ error: 'Establecimiento no encontrado' });
  await recordAdminAction({
    actorId: req.user.id,
    action: 'establishment_updated',
    targetType: 'establishment',
    targetId: establishment._id,
    targetLabel: establishment.name,
    metadata: { fields: Object.keys(establishmentPayload(req.body)) },
  });
  res.json(establishment);
}

async function listAuditLog(req, res) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const query = {};
  if (req.query.action) query.action = req.query.action;
  if (req.query.targetType) query.targetType = req.query.targetType;

  const [data, total] = await Promise.all([
    AdminAction.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'name email')
      .lean(),
    AdminAction.countDocuments(query),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function systemStatus(req, res) {
  const cutoff = new Date(Date.now() - 23 * 24 * 60 * 60 * 1000);
  const [placesTotal, placesStale, lastRefresh, job] = await Promise.all([
    Establishment.countDocuments({ placeId: { $exists: true, $ne: null } }),
    Establishment.countDocuments({
      placeId: { $exists: true, $ne: null },
      $or: [
        { googlePlaceRefreshedAt: { $lt: cutoff } },
        { googlePlaceRefreshedAt: { $exists: false } },
      ],
    }),
    Establishment.findOne({ googlePlaceRefreshedAt: { $ne: null } })
      .sort('-googlePlaceRefreshedAt')
      .select('googlePlaceRefreshedAt')
      .lean(),
    getRefreshJobState(),
  ]);

  res.json({
    api: {
      status: 'operational',
      runtime: process.env.NETLIFY ? 'serverless' : 'server',
      uptimeSeconds: process.env.NETLIFY ? null : Math.floor(process.uptime()),
    },
    mongo: {
      status: mongoose.connection.readyState === 1 ? 'operational' : 'degraded',
      database: mongoose.connection.name,
    },
    googlePlaces: {
      status: placesStale > 0 ? 'attention' : 'operational',
      total: placesTotal,
      stale: placesStale,
      lastRefreshAt: lastRefresh?.googlePlaceRefreshedAt || null,
      job,
    },
  });
}

async function triggerPlacesRefresh(req, res) {
  let started;

  if (process.env.NETLIFY) {
    started = await claimGooglePlacesRefresh();
    if (started) {
      try {
        const secret = process.env.NETLIFY_BACKGROUND_JOB_SECRET;
        const siteUrl = process.env.URL;
        if (!secret || !siteUrl) {
          throw new Error(
            'Faltan NETLIFY_BACKGROUND_JOB_SECRET o la URL del sitio de Netlify.'
          );
        }
        const response = await fetch(
          `${siteUrl}/.netlify/functions/refresh-google-places-background`,
          {
            method: 'POST',
            headers: { 'x-job-secret': secret },
          }
        );
        if (!response.ok) {
          throw new Error(`Netlify no aceptó el proceso en segundo plano (${response.status}).`);
        }
      } catch (error) {
        await markRefreshFailed(error);
        throw error;
      }
    }
  } else {
    started = await startGooglePlacesRefresh();
  }

  if (!started) return res.status(409).json({ error: 'El refresco ya está en curso' });
  await recordAdminAction({
    actorId: req.user.id,
    action: 'places_refresh_started',
    targetType: 'system',
    targetLabel: 'Google Places',
  });
  res.status(202).json({ started: true, job: await getRefreshJobState() });
}

module.exports = {
  dashboard,
  listReportedReviews,
  hideReview,
  unhideReview,
  listUsers,
  setAdminRole,
  setUserSuspension,
  updateUserProfile,
  deleteUser,
  listAdminEstablishments,
  createEstablishment,
  updateEstablishment,
  listAuditLog,
  systemStatus,
  triggerPlacesRefresh,
  listEstablishmentReports,
};
