require('dotenv').config();
const connectDB = require('./config/db');
const { validateRuntimeEnv } = require('./config/runtimeEnv');
const { createApp } = require('./app');

const PORT = process.env.PORT || 4000;
validateRuntimeEnv();
const app = createApp();

connectDB()
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((error) => {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exitCode = 1;
  });
