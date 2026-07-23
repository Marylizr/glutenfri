const { validationResult } = require('express-validator');

// Corre después de los validadores de express-validator en cada ruta;
// si hay errores, corta con 400 antes de llegar al controller.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos inválidos', details: errors.array().map((e) => e.msg) });
  }
  next();
}

module.exports = { validate };
