const express = require('express');
const { param } = require('express-validator');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  listSaved,
  saveEstablishment,
  unsaveEstablishment,
} = require('../controllers/usersController');

router.get('/me/saved', requireAuth, listSaved);

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
