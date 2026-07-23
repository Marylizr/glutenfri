const Establishment = require('../models/Establishment');
const Review = require('../models/Review');

async function listEstablishments(req, res) {
  const { type, certifiedOnly } = req.query;
  const query = {};
  if (type) query.type = type;
  if (certifiedOnly === 'true') query.certified = true;

  const establishments = await Establishment.find(query).lean();
  res.json(establishments);
}

async function getEstablishment(req, res) {
  const establishment = await Establishment.findById(req.params.id).lean();
  if (!establishment) return res.status(404).json({ error: 'No encontrado' });
  res.json(establishment);
}

async function listReviews(req, res) {
  const reviews = await Review.find({ establishment: req.params.id })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .lean();
  res.json(reviews);
}

async function createReview(req, res) {
  const { rating, comment, photos, staffUnderstanding, hasDedicatedMenu } = req.body;
  const review = await Review.create({
    establishment: req.params.id,
    user: req.user.id, // viene del middleware de auth
    rating,
    comment,
    photos,
    staffUnderstanding,
    hasDedicatedMenu,
  });

  // Recalcular avgRating del establecimiento
  const agg = await Review.aggregate([
    { $match: { establishment: review.establishment } },
    { $group: { _id: '$establishment', avg: { $avg: '$rating' } } },
  ]);
  if (agg.length) {
    await Establishment.findByIdAndUpdate(review.establishment, {
      avgRating: Math.round(agg[0].avg * 10) / 10,
    });
  }

  res.status(201).json(review);
}

module.exports = { listEstablishments, getEstablishment, listReviews, createReview };
