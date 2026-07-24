require('dotenv').config();
const connectDB = require('./config/db');
const { createApp } = require('./app');

function validateRuntimeEnv() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe existir y tener al menos 32 caracteres.');
  }
  if (/cambia-esto|ejemplo|placeholder/i.test(process.env.JWT_SECRET)) {
    throw new Error('JWT_SECRET conserva un valor de ejemplo y debe rotarse.');
  }
}

const PORT = process.env.PORT || 4000;
validateRuntimeEnv();
const app = createApp();

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
});

module.exports = { validateRuntimeEnv };
