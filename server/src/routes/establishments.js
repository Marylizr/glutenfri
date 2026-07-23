const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const {
  listEstablishments,
  getEstablishment,
  listReviews,
  createReview,
} = require('../controllers/establishmentsController');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const ESTABLISHMENT_TYPES = ['restaurant', 'store', 'pharmacy', 'bakery', 'supermarket'];
const STAFF_UNDERSTANDING_VALUES = ['poor', 'okay', 'excellent'];
const RISK_LEVEL_VALUES = ['none', 'low', 'moderate', 'high'];

router.get(
  '/',
  [
    query('type').optional().isIn(ESTABLISHMENT_TYPES).withMessage('type inválido'),
    query('certifiedOnly').optional().isBoolean().withMessage('certifiedOnly debe ser boolean'),
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
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  listReviews
);

router.post(
  '/:id/reviews',
  requireAuth,
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

module.exports = router;
