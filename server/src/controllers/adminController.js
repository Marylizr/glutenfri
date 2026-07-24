const Review = require('../models/Review');

// Reseñas con al menos 1 reporte, más reportadas primero. Vista de admin:
// a diferencia de toPublicReview, acá se expone el nombre completo y el
// email de quien escribió — quien modera necesita poder identificar a la
// persona, no la versión recortada que ve el público.
async function listReportedReviews(req, res) {
  const reviews = await Review.aggregate([
    // $ifNull porque las reseñas creadas antes de agregar este campo al
    // schema no lo tienen guardado en el documento — $size solo (sin
    // fallback) rompe con "must be an array, but was of type: missing".
    { $addFields: { reportsCount: { $size: { $ifNull: ['$reportedBy', []] } } } },
    { $match: { reportsCount: { $gt: 0 } } },
    { $sort: { reportsCount: -1, updatedAt: -1 } },
    {
      $lookup: {
        from: 'establishments',
        localField: 'establishment',
        foreignField: '_id',
        as: 'establishment',
      },
    },
    { $unwind: '$establishment' },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        rating: 1,
        comment: 1,
        hidden: 1,
        reportsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        staffUnderstanding: 1,
        hasDedicatedMenu: 1,
        dedicatedKitchen: 1,
        riskLevel: 1,
        'establishment._id': 1,
        'establishment.name': 1,
        'establishment.type': 1,
        'user._id': 1,
        'user.name': 1,
        'user.email': 1,
      },
    },
  ]);

  res.json({ data: reviews });
}

async function hideReview(req, res) {
  const review = await Review.findByIdAndUpdate(req.params.id, { hidden: true }, { new: true });
  if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
  res.json(review);
}

async function unhideReview(req, res) {
  const review = await Review.findByIdAndUpdate(req.params.id, { hidden: false }, { new: true });
  if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });
  res.json(review);
}

module.exports = { listReportedReviews, hideReview, unhideReview };
