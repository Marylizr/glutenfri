const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  validate,
  login
);

module.exports = router;
