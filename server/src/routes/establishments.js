const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const {
  listEstablishments,
  getEstablishment,
  listReviews,
  createReview,
  createInformationReport,
  getEstablishmentPhoto,
} = require('../controllers/establishmentsController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { reviewLimiter, informationReportLimiter } = require('../middleware/rateLimiters');
const { REPORT_REASONS } = require('../models/EstablishmentReport');

const ESTABLISHMENT_TYPES = ['restaurant', 'store', 'pharmacy', 'bakery', 'supermarket'];
const STAFF_UNDERSTANDING_VALUES = ['poor', 'okay', 'excellent'];
const RISK_LEVEL_VALUES = ['none', 'low', 'moderate', 'high'];

router.get(
  '/',
  [
    query('type').optional().isIn(ESTABLISHMENT_TYPES).withMessage('type inválido'),
    query('certifiedOnly').optional().isBoolean().withMessage('certifiedOnly debe ser boolean'),
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit debe ser un entero entre 1 y 200'),
  ],
  validate,
  listEstablishments
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  getEstablishment
);

router.get(
  '/:id/reviews',
  optionalAuth,
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  listReviews
);

router.get(
  '/:id/photo',
  [
    param('id').isMongoId().withMessage('id inválido'),
    query('w').optional().isInt({ min: 100, max: 1600 }).withMessage('w debe ser un entero entre 100 y 1600'),
  ],
  validate,
  getEstablishmentPhoto
);

router.post(
  '/:id/reviews',
  requireAuth,
  reviewLimiter,
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating debe ser un entero entre 1 y 5'),
    body('comment').optional({ nullable: true }).isString().isLength({ max: 1000 }).withMessage('comment demasiado largo'),
    body('staffUnderstanding')
      .isIn(STAFF_UNDERSTANDING_VALUES)
      .withMessage('staffUnderstanding inválido'),
    body('hasDedicatedMenu').isBoolean().withMessage('hasDedicatedMenu debe ser boolean'),
    body('dedicatedKitchen').isBoolean().withMessage('dedicatedKitchen debe ser boolean'),
    body('riskLevel').isIn(RISK_LEVEL_VALUES).withMessage('riskLevel inválido'),
  ],
  validate,
  createReview
);

router.post(
  '/:id/reports',
  informationReportLimiter,
  [
    param('id').isMongoId().withMessage('id inválido'),
    body('reason').isIn(REPORT_REASONS).withMessage('reason inválido'),
    body('comment')
      .optional({ values: 'falsy' })
      .isString()
      .trim()
      .isLength({ max: 800 })
      .withMessage('comment demasiado largo'),
    body('contact')
      .optional({ values: 'falsy' })
      .isString()
      .trim()
      .isLength({ max: 254 })
      .withMessage('contact demasiado largo'),
    body('submissionId')
      .isString()
      .trim()
      .matches(/^[a-zA-Z0-9-]{16,80}$/)
      .withMessage('submissionId inválido'),
  ],
  validate,
  createInformationReport
);

module.exports = router;
