const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const { listReportedReviews, hideReview, unhideReview } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/reviews/reported', requireAdmin, listReportedReviews);

router.patch(
  '/reviews/:id/hide',
  requireAdmin,
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  hideReview
);

router.patch(
  '/reviews/:id/unhide',
  requireAdmin,
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  unhideReview
);

module.exports = router;
