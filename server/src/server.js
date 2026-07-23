require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const establishmentsRoutes = require('./routes/establishments');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');

const app = express();

// CORS: en producción, restringir a orígenes conocidos (web + Capacitor).
// Capacitor en Android usa el origen "http://localhost" o "capacitor://localhost"
// según plataforma — hay que añadirlos explícitamente en Fase 4.
app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  })
);
app.use(express.json());

app.use('/api/establishments', establishmentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});
