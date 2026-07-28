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

// Reseñas — por usuario autenticado, no por IP (la ruta ya exige login
// vía requireAuth, que corre antes que este limiter en la cadena de
// middlewares, así que req.user.id ya está disponible acá).
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.id,
  message: { error: 'Has alcanzado el límite de reseñas por hora. Intenta más tarde.' },
});

const informationReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has alcanzado el límite de reportes por hora. Intenta más tarde.' },
});

const businessSensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has alcanzado el límite de solicitudes. Intenta más tarde.' },
});

module.exports = {
  apiLimiter,
  authLimiter,
  reviewLimiter,
  informationReportLimiter,
  businessSensitiveLimiter,
};
