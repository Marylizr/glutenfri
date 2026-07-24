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

// Para endpoints públicos que igual quieren saber quién pregunta cuando
// hay sesión (ej. mostrarle al autor su propia reseña oculta en un feed
// público) — nunca corta la request, un token ausente/inválido/vencido
// simplemente deja req.user sin setear y sigue como anónimo.
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();

  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const exists = await User.exists({ _id: payload.id });
    if (exists) req.user = payload;
  } catch (err) {
    // token inválido/vencido — seguimos como anónimo, no es un error acá.
  }
  next();
}

// isAdmin no viaja en el JWT (se puede marcar después de emitido el
// token), así que se confirma contra la base en cada request en vez de
// confiar en el payload.
async function checkIsAdmin(req, res, next) {
  const user = await User.findById(req.user.id).select('isAdmin').lean();
  if (!user?.isAdmin) return res.status(403).json({ error: 'Requiere permisos de administrador' });
  next();
}

const requireAdmin = [requireAuth, checkIsAdmin];

module.exports = { requireAuth, optionalAuth, requireAdmin };
