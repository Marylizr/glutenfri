const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const { requireAuth } = require('../middleware/auth');
const { rateLimit } = require('express-rate-limit');
const recovery = require('../services/passwordRecovery');
const recoveryLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 5,
  standardHeaders: true, legacyHeaders: false, message: { code: 'RATE_LIMITED' } });

router.get('/recovery-status', (req, res) => res.set('Cache-Control', 'no-store').json({ available: Boolean(recovery.available(req)) }));
router.post('/forgot-password', recoveryLimiter,
  [body('email').isEmail().normalizeEmail()], validate, recovery.requestReset);
router.post('/reset-password', recoveryLimiter, [
  body('token').isString().matches(/^[a-f0-9]{64}$/),
  body('password').isString().isLength({ min: 12 }).custom(value => Buffer.byteLength(value, 'utf8') <= 72),
  body('confirmation').custom((value, { req }) => value === req.body.password),
], validate, recovery.completeReset);

router.get('/me', requireAuth, me);

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Nombre requerido'),
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    // GDPR: no confiar en que el checkbox del frontend ya lo validó — si
    // no llega exactamente `true`, se rechaza el registro acá también.
    body('privacyAccepted')
      .custom((value) => value === true)
      .withMessage('Debes aceptar la política de privacidad'),
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
