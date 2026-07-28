const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { TRUST_STATUSES } = require('../utils/trustStatus');
const {
  listChangeRequests,
  listClaims,
  listCommercialAudit,
  listManagers,
  reviewChangeRequest,
  setSponsorship,
  updateClaimStatus,
} = require('../controllers/commercialAdminController');

const ESTABLISHMENT_TYPES = ['restaurant', 'store', 'pharmacy', 'bakery', 'supermarket'];
const SOURCES = ['APC', 'Google', 'APC+Google', 'user'];
const RISK_LEVELS = ['none', 'low', 'moderate', 'high'];
const REPORT_REASONS = ['incorrect_safety', 'offensive', 'spam', 'personal_data', 'other'];
const URL_FIELDS = ['logoUrl', 'websiteUrl', 'menuUrl', 'reservationUrl', 'orderUrl'];
const TIME_VALUE = /^([01]\d|2[0-3]):[0-5]\d$/;

const establishmentValidators = [
  body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Nombre inválido'),
  body('type').optional().isIn(ESTABLISHMENT_TYPES).withMessage('Tipo inválido'),
  body('source').optional().isIn(SOURCES).withMessage('Fuente inválida'),
  body('riskLevel').optional({ nullable: true }).isIn(RISK_LEVELS).withMessage('Riesgo inválido'),
  body('certified').optional().isBoolean().withMessage('certified debe ser boolean'),
  body('trustStatus').optional().isIn(TRUST_STATUSES).withMessage('Estado de confianza inválido'),
  body('sourceName').optional({ nullable: true }).isString().isLength({ max: 200 }),
  body('sourceUrl').optional({ nullable: true }).isURL({ protocols: ['https'], require_protocol: true }),
  body('lastVerifiedAt').optional({ nullable: true }).isISO8601().withMessage('Fecha inválida'),
  body('certificationDate').optional({ nullable: true }).isISO8601().withMessage('Fecha de certificación inválida'),
  body('lastInformationUpdate').optional({ nullable: true }).isISO8601().withMessage('Fecha de actualización inválida'),
  ...URL_FIELDS.map((field) =>
    body(field).optional({ nullable: true }).isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
    }).withMessage(`${field} inválida`)
  ),
  body('images').optional().isArray({ max: 20 }).withMessage('images inválido'),
  body('images.*').optional().isURL({ protocols: ['http', 'https'], require_protocol: true }),
  body('phone').optional({ nullable: true }).custom((value) => {
    if (!value) return true;
    const digits = String(value).replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) throw new Error('Teléfono inválido');
    return true;
  }),
  body('whatsapp').optional({ nullable: true }).custom((value) => {
    if (!value) return true;
    const raw = String(value).trim();
    const digits = raw.replace(/\D/g, '');
    if (
      (!raw.startsWith('+') && !raw.startsWith('00')) ||
      digits.length < 10 ||
      digits.length > 17
    ) {
      throw new Error('WhatsApp inválido');
    }
    return true;
  }),
  body('informationSources').optional().isArray({ max: 20 }),
  body('informationSources.*.label').optional().isString().isLength({ min: 1, max: 120 }),
  body('informationSources.*.url').optional().isURL({
    protocols: ['http', 'https'],
    require_protocol: true,
  }),
  body('delivery').optional({ nullable: true }).isBoolean(),
  body('takeaway').optional({ nullable: true }).isBoolean(),
  body('dedicatedArea').optional({ nullable: true }).isBoolean(),
  body('crossContactMeasures').optional().isArray({ max: 20 }),
  body('crossContactMeasures.*').optional().isString().isLength({ max: 240 }),
  body('accessibilityFeatures').optional().isArray({ max: 20 }),
  body('accessibilityFeatures.*').optional().isString().isLength({ max: 120 }),
  body('serviceLanguages').optional().isArray({ max: 20 }),
  body('serviceLanguages.*').optional().isString().isLength({ max: 40 }),
  body('glutenFreeScope').optional({ nullable: true }).isString().isLength({ max: 500 }),
  body('certificationBody').optional({ nullable: true }).isString().isLength({ max: 160 }),
  body('timezone').optional({ nullable: true }).custom((value) => {
    if (!value) return true;
    try {
      new Intl.DateTimeFormat('en', { timeZone: value }).format();
      return true;
    } catch {
      throw new Error('Zona horaria inválida');
    }
  }),
  body('weeklyHours').optional({ nullable: true }).custom((hours) => {
    if (!hours || typeof hours !== 'object' || Array.isArray(hours)) {
      throw new Error('weeklyHours inválido');
    }
    const validDays = new Set(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
    return Object.entries(hours).every(([day, intervals]) =>
      validDays.has(day) &&
      Array.isArray(intervals) &&
      intervals.length <= 4 &&
      intervals.every((interval) => TIME_VALUE.test(interval?.start) && TIME_VALUE.test(interval?.end))
    );
  }),
  body().custom((_, { req }) => {
    if (
      req.body.trustStatus === 'CERTIFIED_APC_BIOTRAB' &&
      (!req.body.sourceName || !req.body.sourceUrl)
    ) {
      throw new Error('Una certificación requiere nombre y URL HTTPS de la fuente');
    }
    return true;
  }),
  body('dedicatedKitchen').optional({ nullable: true }).isBoolean(),
  body('dedicatedGlutenFreeMenu').optional({ nullable: true }).isBoolean(),
  body('staffTrained').optional({ nullable: true }).isBoolean(),
  body('lat').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
  body('lng').optional({ nullable: true }).isFloat({ min: -180, max: 180 }),
  body('notes').optional({ nullable: true }).isString().isLength({ max: 2000 }),
];

router.use(requireAdmin);

router.get('/dashboard', dashboard);

router.get(
  '/business/claims',
  [
    query('status').optional().isIn([
      'pending', 'needs_information', 'approved', 'rejected', 'revoked', 'cancelled',
    ]),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listClaims
);
router.patch(
  '/business/claims/:claimId',
  [
    param('claimId').isMongoId(),
    body('status').isIn(['needs_information', 'approved', 'rejected', 'revoked']),
    body('reason').trim().isLength({ min: 3, max: 1000 }),
  ],
  validate,
  updateClaimStatus
);
router.get(
  '/business/changes',
  [
    query('status').optional().isIn(['draft', 'pending_review', 'published', 'rejected', 'cancelled']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listChangeRequests
);
router.patch(
  '/business/changes/:changeId',
  [
    param('changeId').isMongoId(),
    body('status').isIn(['published', 'rejected']),
    body('reason').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }),
  ],
  validate,
  reviewChangeRequest
);
router.get(
  '/business/establishments/:id/managers',
  [param('id').isMongoId()],
  validate,
  listManagers
);
router.patch(
  '/business/establishments/:id/sponsorship',
  [
    param('id').isMongoId(),
    body('active').isBoolean(),
    body('startsAt').optional({ nullable: true }).isISO8601(),
    body('endsAt').optional({ nullable: true }).isISO8601(),
    body('reason').trim().isLength({ min: 3, max: 1000 }),
  ],
  validate,
  setSponsorship
);
router.get(
  '/business/audit',
  [query('establishment').optional().isMongoId()],
  validate,
  listCommercialAudit
);

router.get(
  '/establishment-reports',
  [query('status').optional().isIn(['pending', 'reviewing', 'resolved', 'dismissed'])],
  validate,
  listEstablishmentReports
);

router.get(
  '/reviews/reported',
  [
    query('reason').optional().isIn(REPORT_REASONS).withMessage('Motivo inválido'),
    query('status').optional().isIn(['visible', 'hidden']).withMessage('Estado inválido'),
  ],
  validate,
  listReportedReviews
);

router.patch(
  '/reviews/:id/hide',
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('reason').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  hideReview
);

router.patch(
  '/reviews/:id/unhide',
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('reason').optional().isString().isLength({ max: 500 }),
  ],
  validate,
  unhideReview
);

router.get(
  '/users',
  [
    query('search').optional().isString().isLength({ max: 100 }),
    query('role').optional().isIn(['admin', 'user']).withMessage('Rol inválido'),
    query('status').optional().isIn(['active', 'suspended']).withMessage('Estado inválido'),
  ],
  validate,
  listUsers
);

router.patch(
  '/users/:id',
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('name').optional().trim().isLength({ min: 2, max: 120 }).withMessage('Nombre inválido'),
    body('email').optional().trim().isEmail().isLength({ max: 254 }).withMessage('Email inválido'),
    body().custom((value) => {
      if (value.name === undefined && value.email === undefined) {
        throw new Error('Indica al menos un campo para actualizar');
      }
      return true;
    }),
  ],
  validate,
  updateUserProfile
);

router.delete(
  '/users/:id',
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('confirmEmail').trim().isEmail().isLength({ max: 254 }).withMessage('Confirma el email'),
    body('reason').trim().isLength({ min: 3, max: 500 }).withMessage('Indica el motivo'),
  ],
  validate,
  deleteUser
);

router.patch(
  '/users/:id/admin',
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('isAdmin').isBoolean().withMessage('isAdmin debe ser boolean'),
  ],
  validate,
  setAdminRole
);

router.patch(
  '/users/:id/suspension',
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('suspended').isBoolean().withMessage('suspended debe ser boolean'),
    body('reason')
      .if(body('suspended').equals('true'))
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Indica el motivo'),
    body('suspendedUntil').optional({ nullable: true }).isISO8601().withMessage('Fecha inválida'),
  ],
  validate,
  setUserSuspension
);

router.get(
  '/establishments',
  [
    query('search').optional().isString().isLength({ max: 150 }),
    query('type').optional().isIn(ESTABLISHMENT_TYPES).withMessage('Tipo inválido'),
    query('source').optional().isIn(SOURCES).withMessage('Fuente inválida'),
    query('riskLevel').optional().isIn(RISK_LEVELS).withMessage('Riesgo inválido'),
    query('certified').optional().isBoolean().withMessage('Certificación inválida'),
    query('trustStatus').optional().isIn(TRUST_STATUSES).withMessage('Estado de confianza inválido'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  listAdminEstablishments
);

router.post(
  '/establishments',
  [
    body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Nombre requerido'),
    body('type').isIn(ESTABLISHMENT_TYPES).withMessage('Tipo requerido'),
    ...establishmentValidators,
  ],
  validate,
  createEstablishment
);

router.patch(
  '/establishments/:id',
  [param('id').isMongoId().withMessage('id inválido'), ...establishmentValidators],
  validate,
  updateEstablishment
);

router.get(
  '/audit',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('targetType')
      .optional()
      .isIn(['review', 'user', 'establishment', 'system'])
      .withMessage('Objetivo inválido'),
  ],
  validate,
  listAuditLog
);

router.get('/system', systemStatus);
router.post('/system/google-places/refresh', triggerPlacesRefresh);

module.exports = router;
