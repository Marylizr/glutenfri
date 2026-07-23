const express = require('express');
const { query } = require('express-validator');
const router = express.Router();
const { listRecentReviews } = require('../controllers/reviewsController');
const { validate } = require('../middleware/validate');

router.get(
  '/recent',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit debe ser un entero entre 1 y 50'),
  ],
  validate,
  listRecentReviews
);

module.exports = router;
