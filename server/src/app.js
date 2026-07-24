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

  app.use(helmet());
  // Evita persistir IP y User-Agent en los logs del proveedor. El rate
  // limiter usa la IP en memoria durante su ventana, pero no la escribe.
  app.use(morgan(environment === 'production' ? ':method :url :status :response-time ms' : 'dev'));
  app.use(
    cors({
      origin: corsOrigins.split(',').map((origin) => origin.trim()),
    })
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

module.exports = { createApp, resolveTrustProxy };
