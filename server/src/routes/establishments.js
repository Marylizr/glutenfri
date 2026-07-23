const express = require('express');
const router = express.Router();
const {
  listEstablishments,
  getEstablishment,
  listReviews,
  createReview,
} = require('../controllers/establishmentsController');
const { requireAuth } = require('../middleware/auth');

router.get('/', listEstablishments);
router.get('/:id', getEstablishment);
router.get('/:id/reviews', listReviews);
router.post('/:id/reviews', requireAuth, createReview);

module.exports = router;
