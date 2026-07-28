const EstablishmentManager = require('../models/EstablishmentManager');

async function requireEstablishmentManager(req, res, next) {
  const establishmentId = req.params.id || req.params.establishmentId;
  const manager = await EstablishmentManager.findOne({
    establishment: establishmentId,
    user: req.user.id,
    status: 'active',
  }).lean();
  if (!manager) {
    return res.status(403).json({ error: 'No tienes acceso a este establecimiento' });
  }
  req.establishmentManager = manager;
  next();
}

module.exports = { requireEstablishmentManager };
