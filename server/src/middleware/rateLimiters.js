const rateLimit = require('express-rate-limit');

// Límite general de la API — generoso para uso normal, corta abuso grueso.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
});

// Login/registro — mucho más agresivo para frenar fuerza bruta y
// registro masivo de cuentas. Por IP, no por cuenta (MVP simple).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.' },
});

module.exports = { apiLimiter, authLimiter };
