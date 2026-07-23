// Manejo de errores centralizado. Express 5 reenvía automáticamente las
// promesas rechazadas de los controllers async hasta acá — no hace falta
// envolver cada controller en try/catch.
//
// Nunca exponemos stack traces ni mensajes crudos de Mongo/Mongoose al
// cliente; eso queda solo en el log del servidor.
function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Identificador inválido' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  res.status(err.status || 500).json({ error: 'Error interno del servidor' });
}

module.exports = { errorHandler };
