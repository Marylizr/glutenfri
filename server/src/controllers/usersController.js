const mongoose = require('mongoose');
const User = require('../models/User');
const Establishment = require('../models/Establishment');
const Review = require('../models/Review');
const { parsePagination, toFeedItem } = require('./reviewsController');

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

// GDPR — derecho al olvido. Borra el User, todas sus Reviews, y
// recalcula avgRating de cada establecimiento que tenía una reseña de
// este usuario (borrar la reseña cambia el promedio). savedEstablishments
// vive únicamente en el propio User (ningún otro documento lo referencia
// "desde afuera"), así que borrar el User ya lo limpia sin pasos extra.
async function deleteAccount(req, res) {
  const userId = req.user.id;

  const reviews = await Review.find({ user: userId }).select('establishment').lean();
  const affectedEstablishmentIds = [...new Set(reviews.map((r) => r.establishment.toString()))];

  await Review.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);

  await Promise.all(
    affectedEstablishmentIds.map(async (estId) => {
      const agg = await Review.aggregate([
        { $match: { establishment: new mongoose.Types.ObjectId(estId) } },
        { $group: { _id: '$establishment', avg: { $avg: '$rating' } } },
      ]);
      await Establishment.findByIdAndUpdate(estId, {
        avgRating: agg.length ? Math.round(agg[0].avg * 10) / 10 : null,
      });
    })
  );

  res.status(204).end();
}

// GDPR — portabilidad. Todo lo que tenemos de este usuario en un JSON
// descargable: perfil (sin passwordHash), reseñas, y establecimientos
// guardados con sus datos completos (no solo los ids).
async function exportData(req, res) {
  const userId = req.user.id;

  const [user, reviews] = await Promise.all([
    User.findById(userId).select('-passwordHash').lean(),
    Review.find({ user: userId }).sort('-createdAt').lean(),
  ]);

  const savedEstablishments = await Establishment.find({
    _id: { $in: user.savedEstablishments || [] },
  }).lean();

  const { savedEstablishments: _savedIds, ...userWithoutSavedIds } = user;

  res.json({
    exportedAt: new Date().toISOString(),
    user: userWithoutSavedIds,
    reviews,
    savedEstablishments,
  });
}

// Reseñas del usuario autenticado, en todos los establecimientos donde
// escribió — mismo shape que /api/reviews/recent (tab "Mis reseñas" del
// feed usa el mismo componente de card en el frontend).
async function listMyReviews(req, res) {
  const { page, limit, skip } = parsePagination(req);
  const query = { user: req.user.id };

  const [data, total] = await Promise.all([
    Review.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('establishment', 'name type')
      .populate('user', 'name')
      .lean(),
    Review.countDocuments(query),
  ]);

  res.json({
    data: data.map(toFeedItem),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

module.exports = {
  listSaved,
  saveEstablishment,
  unsaveEstablishment,
  deleteAccount,
  exportData,
  listMyReviews,
};
