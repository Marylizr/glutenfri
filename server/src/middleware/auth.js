const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No autenticado' });

  const token = header.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // El JWT puede seguir siendo "válido" (no vencido) aunque la cuenta ya
  // no exista más — por ejemplo, justo después de un borrado GDPR (derecho
  // al olvido). Confirmamos que el usuario siga existiendo antes de dejar
  // pasar la request, para no dejar operar con una identidad borrada.
  const exists = await User.exists({ _id: payload.id });
  if (!exists) return res.status(401).json({ error: 'No autenticado' });

  req.user = payload;
  next();
}

module.exports = { requireAuth };
