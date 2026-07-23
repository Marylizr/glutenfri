const Establishment = require('../models/Establishment');
const Review = require('../models/Review');

async function listEstablishments(req, res) {
  const { type, certifiedOnly } = req.query;
  const query = {};
  if (type) query.type = type;
  if (certifiedOnly === 'true') query.certified = true;

  // Paginación preparada para cuando el dataset crezca más allá de un
  // puñado de cientos de registros. Default limit=100 cubre el dataset
  // actual (72) en una sola página, así que no cambia el comportamiento
  // para clientes que todavía no mandan page/limit.
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 200);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Establishment.find(query).skip(skip).limit(limit).lean(),
    Establishment.countDocuments(query),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function getEstablishment(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment) return res.status(404).json({ error: 'No encontrado' });
  res.json(establishment);
}

async function listReviews(req, res) {
  const reviews = await Review.find({ establishment: req.params.id })
    .populate('user', 'name')
    .sort('-createdAt')
    .lean();
  res.json(reviews);
}

async function createReview(req, res) {
  const {
    rating,
    comment,
    photos,
    staffUnderstanding,
    hasDedicatedMenu,
    dedicatedKitchen,
    riskLevel,
  } = req.body;

  // Una reseña por usuario por establecimiento (índice único en Review):
  // si ya tenía una, la actualiza en vez de rechazar — la gente cambia de
  // opinión sobre un lugar, no tiene sentido bloquearla.
  const existing = await Review.findOne({ establishment: req.params.id, user: req.user.id });

  const review = await Review.findOneAndUpdate(
    { establishment: req.params.id, user: req.user.id },
    {
      rating,
      comment,
      photos,
      staffUnderstanding,
      hasDedicatedMenu,
      dedicatedKitchen,
      riskLevel,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Recalcular avgRating del establecimiento — corre igual al crear, editar
  // o (en deleteAccount) borrar una reseña, siempre sobre lo que quedó.
  const agg = await Review.aggregate([
    { $match: { establishment: review.establishment } },
    { $group: { _id: '$establishment', avg: { $avg: '$rating' } } },
  ]);

  // Celiac Safety Protocols: la reseña más reciente sobrescribe los campos
  // del establecimiento (decisión de producto — no se promedia entre reseñas).
  // staffTrained se deriva de staffUnderstanding: solo "excellent" cuenta como
  // personal capacitado.
  await Establishment.findByIdAndUpdate(review.establishment, {
    ...(agg.length ? { avgRating: Math.round(agg[0].avg * 10) / 10 } : {}),
    dedicatedGlutenFreeMenu: hasDedicatedMenu,
    dedicatedKitchen,
    staffTrained: staffUnderstanding === 'excellent',
    riskLevel,
  });

  res.status(existing ? 200 : 201).json(review);
}

module.exports = { listEstablishments, getEstablishment, listReviews, createReview };
