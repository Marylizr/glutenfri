const User = require('../models/User');
const Establishment = require('../models/Establishment');

async function listSaved(req, res) {
  const user = await User.findById(req.user.id).populate('savedEstablishments').lean();
  res.json(user.savedEstablishments || []);
}

async function saveEstablishment(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment) return res.status(404).json({ error: 'No encontrado' });

  await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedEstablishments: req.params.id } });
  res.status(204).end();
}

async function unsaveEstablishment(req, res) {
  await User.findByIdAndUpdate(req.user.id, { $pull: { savedEstablishments: req.params.id } });
  res.status(204).end();
}

module.exports = { listSaved, saveEstablishment, unsaveEstablishment };
