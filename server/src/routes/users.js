const express = require('express');
const { param, query } = require('express-validator');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  listSaved,
  saveEstablishment,
  unsaveEstablishment,
  deleteAccount,
  exportData,
  listMyReviews,
} = require('../controllers/usersController');

router.get('/me/saved', requireAuth, listSaved);
router.get('/me/export', requireAuth, exportData);
router.delete('/me', requireAuth, deleteAccount);

router.get(
  '/me/reviews',
  requireAuth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit debe ser un entero entre 1 y 50'),
  ],
  validate,
  listMyReviews
);

router.post(
  '/me/saved/:id',
  requireAuth,
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  saveEstablishment
);

router.delete(
  '/me/saved/:id',
  requireAuth,
  [param('id').isMongoId().withMessage('id inválido')],
  validate,
  unsaveEstablishment
);

module.exports = router;
