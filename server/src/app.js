const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const establishmentsRoutes = require('./routes/establishments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const { apiLimiter } = require('./middleware/rateLimiters');
const { errorHandler } = require('./middleware/errorHandler');

function resolveTrustProxy(environment, rawValue) {
  if (rawValue === undefined || rawValue === '') {
    return environment === 'production' ? 1 : false;
  }
  if (rawValue === false || rawValue === 'false') return false;

  const hops = Number(rawValue);
  if (!Number.isInteger(hops) || hops < 0) {
    throw new Error('TRUST_PROXY_HOPS debe ser un entero mayor o igual a 0.');
  }
  return hops;
}

function isDevelopmentLoopbackOrigin(origin) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
      /^\d+$/.test(url.port)
    );
  } catch {
    return false;
  }
}

function buildCorsOptions(corsOrigins, environment) {
  const allowedOrigins = new Set(
    corsOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
  );
  return {
    origin(origin, callback) {
      const allowed =
        !origin ||
        allowedOrigins.has(origin) ||
        (environment === 'development' && isDevelopmentLoopbackOrigin(origin));
      callback(null, allowed);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  };
}

function createApp({
  environment = process.env.NODE_ENV || 'development',
  corsOrigins = process.env.CORS_ORIGINS,
  trustProxyHops = process.env.TRUST_PROXY_HOPS,
} = {}) {
  if (!corsOrigins) {
    throw new Error('CORS_ORIGINS no está configurado en .env; es obligatorio y no tiene un valor abierto por defecto.');
  }

  const app = express();
  app.set('trust proxy', resolveTrustProxy(environment, trustProxyHops));

  // La API y las fotos se consumen desde el origen del frontend. CORP no
  // concede acceso por sí mismo: CORS sigue limitando qué orígenes pueden
  // leer las respuestas.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  // Evita persistir IP y User-Agent en los logs del proveedor. El rate
  // limiter usa la IP en memoria durante su ventana, pero no la escribe.
  app.use(morgan(environment === 'production' ? ':method :url :status :response-time ms' : 'dev'));
  app.use(
    cors(buildCorsOptions(corsOrigins, environment))
  );
  app.use(express.json());
  app.use(apiLimiter);

  app.use('/api/establishments', establishmentsRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/reviews', reviewsRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    const mongoConnected = mongoose.connection.readyState === 1;
    res.status(mongoConnected ? 200 : 503).json({
      status: mongoConnected ? 'ok' : 'degraded',
      mongo: mongoConnected ? 'connected' : 'disconnected',
    });
  });

  app.use(errorHandler);
  return app;
}

module.exports = {
  buildCorsOptions,
  createApp,
  isDevelopmentLoopbackOrigin,
  resolveTrustProxy,
};
