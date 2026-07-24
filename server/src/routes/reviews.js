const express = require('express');
const { param, query } = require('express-validator');
const router = express.Router();
const { listRecentReviews, reportReview } = require('../controllers/reviewsController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get(
  '/recent',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit debe ser un entero entre 1 y 50'),
  ],
  validate,
  listRecentReviews
);

router.post(
  '/:id/report',
  requireAuth,
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  reportReview
);

module.exports = router;
