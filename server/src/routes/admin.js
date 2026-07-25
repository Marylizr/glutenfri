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
  listAdminEstablishments,
  createEstablishment,
  updateEstablishment,
  listAuditLog,
  systemStatus,
  triggerPlacesRefresh,
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { TRUST_STATUSES } = require('../utils/trustStatus');

const ESTABLISHMENT_TYPES = ['restaurant', 'store', 'pharmacy', 'bakery', 'supermarket'];
const SOURCES = ['APC', 'Google', 'APC+Google', 'user'];
const RISK_LEVELS = ['none', 'low', 'moderate', 'high'];
const REPORT_REASONS = ['incorrect_safety', 'offensive', 'spam', 'personal_data', 'other'];

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
