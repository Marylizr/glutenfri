require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const establishmentsRoutes = require('./routes/establishments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const { apiLimiter } = require('./middleware/rateLimiters');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());

// Logs de requests a stdout — es lo que Heroku espera para sus propios
// logs. 'combined' en producción (formato estándar Apache, útil para
// parsear después); 'dev' en desarrollo (conciso, coloreado, con tiempos).
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS: restringido a los orígenes reales. CORS_ORIGINS es obligatorio y
// sin default a '*' — si no está seteado, más vale que arranque roto en
// vez de aceptar cualquier origen en producción. Cuando lleguemos a
// Capacitor (Fase 4), sumar "capacitor://localhost" / "http://localhost"
// a la lista según plataforma.
if (!process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS no está seteado en .env — requerido, sin default abierto.');
}
app.use(
  cors({
    origin: process.env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  })
);
app.use(express.json());
app.use(apiLimiter);

app.use('/api/establishments', establishmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  res.status(mongoConnected ? 200 : 503).json({
    status: mongoConnected ? 'ok' : 'degraded',
    mongo: mongoConnected ? 'connected' : 'disconnected',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});
