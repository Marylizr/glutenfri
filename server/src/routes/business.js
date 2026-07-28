const express = require('express');
const { body, param, query } = require('express-validator');
const {
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
  recordAnalyticsEvent,
} = require('../controllers/businessController');
const { requireAuth } = require('../middleware/auth');
const { requireEstablishmentManager } = require('../middleware/businessAccess');
const { validate } = require('../middleware/validate');
const { ANALYTICS_EVENTS } = require('../models/EstablishmentAnalyticsEvent');
const { businessSensitiveLimiter } = require('../middleware/rateLimiters');
const { BUSINESS_EDITABLE_FIELDS } = require('../config/business');

const router = express.Router();
const TIME_VALUE = /^([01]\d|2[0-3]):[0-5]\d$/;
const mongoId = (field) => param(field).isMongoId().withMessage(`${field} inválido`);
const httpsUrl = (path) =>
  body(path)
    .optional({ nullable: true })
    .isURL({ protocols: ['https'], require_protocol: true })
    .custom((value) => {
      if (!value) return true;
      const parsed = new URL(value);
      if (parsed.username || parsed.password) throw new Error('La URL no admite credenciales');
      return true;
    });
const validTimezone = (value) => {
  if (!value) return true;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch {
    throw new Error('Zona horaria inválida');
  }
};
const validateIntervals = (intervals, max = 4) => {
  if (!Array.isArray(intervals) || intervals.length > max) throw new Error('Horario inválido');
  const sorted = [...intervals].sort((a, b) => String(a?.start).localeCompare(String(b?.start)));
  for (let index = 0; index < sorted.length; index += 1) {
    const interval = sorted[index];
    if (!TIME_VALUE.test(interval?.start) || !TIME_VALUE.test(interval?.end) || interval.start >= interval.end) {
      throw new Error('Intervalo de horario inválido');
    }
    if (index > 0 && sorted[index - 1].end > interval.start) {
      throw new Error('Los intervalos no pueden solaparse');
    }
  }
  return true;
};
const validHours = (hours) => {
  if (!hours || typeof hours !== 'object' || Array.isArray(hours)) {
    throw new Error('Horario inválido');
  }
  const days = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  for (const [day, intervals] of Object.entries(hours)) {
    if (!days.has(day)) throw new Error('Horario inválido');
    validateIntervals(intervals);
  }
  return true;
};
const claimFields = [
  body('responsibleName').trim().isLength({ min: 2, max: 120 }),
  body('relationship').trim().isLength({ min: 2, max: 120 }),
  body('professionalEmail').isEmail().normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 40 }),
  body('officialUrl')
    .isURL({ protocols: ['https'], require_protocol: true })
    .custom((value) => {
      const parsed = new URL(value);
      if (parsed.username || parsed.password) throw new Error('La URL no admite credenciales');
      return true;
    }),
  body('verificationMethod').isIn([
    'official_domain_email',
    'public_contact_code',
    'manual_business_evidence',
    'administrative_review',
  ]),
  body('evidenceDescription').trim().isLength({ min: 10, max: 1500 }),
  body('additionalComment').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }),
  body('consent').custom((value) => value === true).withMessage('Consentimiento requerido'),
];

router.post(
  '/analytics/establishments/:id/events',
  businessSensitiveLimiter,
  [
    mongoId('id'),
    body('eventId').matches(/^[a-zA-Z0-9:_-]{16,100}$/),
    body('type').isIn(ANALYTICS_EVENTS),
  ],
  validate,
  recordAnalyticsEvent
);

router.use(requireAuth);
router.get('/claims', listMyClaims);
router.get('/claims/:claimId', [mongoId('claimId')], validate, getMyClaim);
router.post('/establishments/:id/claims', businessSensitiveLimiter, [mongoId('id'), ...claimFields], validate, createClaim);
router.patch(
  '/claims/:claimId/information',
  businessSensitiveLimiter,
  [
    mongoId('claimId'),
    body('evidenceDescription').trim().isLength({ min: 10, max: 1500 }),
    body('additionalComment').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }),
  ],
  validate,
  addClaimInformation
);
router.patch('/claims/:claimId/cancel', [mongoId('claimId')], validate, cancelClaim);
router.get('/establishments', listManagedEstablishments);
router.get('/establishments/:id', [mongoId('id')], validate, requireEstablishmentManager, getBusinessDashboard);
router.get('/establishments/:id/changes', [mongoId('id')], validate, requireEstablishmentManager, listChanges);
router.post(
  '/establishments/:id/changes',
  businessSensitiveLimiter,
  [
    mongoId('id'),
    body('changes').isObject().custom((changes) => {
      const fields = Object.keys(changes);
      if (!fields.length || fields.some((field) => !BUSINESS_EDITABLE_FIELDS.includes(field))) {
        throw new Error('La solicitud contiene campos no permitidos');
      }
      if (JSON.stringify(changes).length > 30_000) throw new Error('La solicitud es demasiado grande');
      if (changes.businessImages?.length > 10) throw new Error('Máximo 10 imágenes');
      return true;
    }),
    body('changes.businessDescription').optional({ nullable: true }).isString().isLength({ max: 2000 }),
    body('changes.name').optional({ nullable: true }).isString().trim().isLength({ min: 1, max: 200 }),
    body('changes.address').optional({ nullable: true }).isString().trim().isLength({ max: 300 }),
    body('changes.lat').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
    body('changes.lng').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
    body('changes.publicEmail').optional({ nullable: true }).isEmail().normalizeEmail(),
    ...['logoUrl', 'websiteUrl', 'menuUrl', 'reservationUrl', 'orderUrl'].map((field) =>
      httpsUrl(`changes.${field}`)
    ),
    body('changes.phone').optional({ nullable: true }).custom((value) => {
      if (!value) return true;
      const digits = String(value).replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) throw new Error('Teléfono inválido');
      return true;
    }),
    body('changes.whatsapp').optional({ nullable: true }).custom((value) => {
      if (!value) return true;
      const raw = String(value).trim();
      const digits = raw.replace(/\D/g, '');
      if ((!raw.startsWith('+') && !raw.startsWith('00')) || digits.length < 10 || digits.length > 17) {
        throw new Error('WhatsApp inválido');
      }
      return true;
    }),
    body('changes.timezone').optional({ nullable: true }).custom(validTimezone),
    body('changes.weeklyHours').optional({ nullable: true }).custom(validHours),
    body('changes.delivery').optional({ nullable: true }).isBoolean(),
    body('changes.takeaway').optional({ nullable: true }).isBoolean(),
    body('changes.temporarilyClosed').optional({ nullable: true }).isBoolean(),
    body('changes.accessibilityFeatures').optional().isArray({ max: 20 }),
    body('changes.accessibilityFeatures.*').optional().isString().trim().isLength({ max: 120 }),
    body('changes.serviceLanguages').optional().isArray({ max: 20 }),
    body('changes.serviceLanguages.*').optional().isString().trim().isLength({ max: 40 }),
    body('changes.services').optional().isArray({ max: 30 }),
    body('changes.services.*').optional().isString().trim().isLength({ max: 80 }),
    body('changes.businessImages').optional().isArray({ max: 10 }),
    httpsUrl('changes.businessImages.*.url'),
    body('changes.businessImages.*.alt').optional().trim().isLength({ min: 2, max: 180 }),
    body('changes.businessImages.*.credit').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
    body('changes.socialLinks').optional().isArray({ max: 12 }),
    body('changes.socialLinks.*.network').optional().trim().isLength({ min: 1, max: 40 }),
    httpsUrl('changes.socialLinks.*.url'),
    body('changes.specialHours').optional().isArray({ max: 60 }).custom((entries) => {
      entries.forEach((entry) => {
        if (!entry.closed) validateIntervals(entry.intervals || []);
      });
      return true;
    }),
    body('changes.specialHours.*.date').optional().isISO8601({ strict: true }),
    body('changes.specialHours.*.closed').optional().isBoolean(),
    body('changes.specialHours.*.note').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
    body('submit').optional().isBoolean(),
  ],
  validate,
  requireEstablishmentManager,
  createChangeRequest
);
router.get(
  '/establishments/:id/analytics',
  [mongoId('id'), query('period').optional().matches(/^(7|30|60|90)d?$/)],
  validate,
  requireEstablishmentManager,
  getAnalytics
);
router.get('/establishments/:id/promotion', [mongoId('id')], validate, requireEstablishmentManager, getPromotion);

module.exports = router;
