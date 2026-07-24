const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isSuspended } = require('../middleware/auth');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
  };
}

async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email ya registrado' });

  const passwordHash = await bcrypt.hash(password, 10);
  // privacyAccepted ya lo validó el validator de la ruta (rechaza si no es
  // exactamente `true`) — acá solo queda registrar cuándo lo aceptó.
  const user = await User.create({ name, email, passwordHash, privacyAcceptedAt: new Date() });
  // Sin refresh token todavía — expiresIn corto acota la ventana de un
  // token comprometido. Deuda técnica: si la app escala, agregar refresh
  // tokens y volver a subir expiresIn para no forzar logins frecuentes.
  const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  res.status(201).json({ token, user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  if (isSuspended(user)) {
    return res.status(403).json({
      error: 'Cuenta suspendida',
      suspendedUntil: user.suspendedUntil,
      reason: user.suspensionReason,
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  // Sin refresh token todavía — expiresIn corto acota la ventana de un
  // token comprometido. Deuda técnica: si la app escala, agregar refresh
  // tokens y volver a subir expiresIn para no forzar logins frecuentes.
  const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  res.json({ token, user: publicUser(user) });
}

async function me(req, res) {
  const user = await User.findById(req.user.id).select('name email isAdmin').lean();
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ user: publicUser(user) });
}

module.exports = { register, login, me };
