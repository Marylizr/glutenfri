// Manejo de errores centralizado. Express 5 reenvía automáticamente las
// promesas rechazadas de los controllers async hasta acá — no hace falta
// envolver cada controller en try/catch.
//
// Nunca exponemos stack traces ni mensajes crudos de Mongo/Mongoose al
// cliente ni a los logs del servidor. Solo se registran etiquetas fijas.
function errorHandler(err, req, res, _next) {
  // Fixed labels only: driver/validator errors can carry credentials or tokens.
  console.error('GLUTENFRI_REQUEST_FAILED', ['ValidationError', 'CastError', 'JsonWebTokenError', 'TokenExpiredError'].includes(err.name) ? err.name : 'INTERNAL_ERROR');

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
