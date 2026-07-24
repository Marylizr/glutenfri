const Review = require('../models/Review');
const { parsePagination, toPublicReview, visibilityFilter } = require('../utils/reviewFormatting');

async function listRecentReviews(req, res) {
  const { page, limit, skip } = parsePagination(req);
  const query = visibilityFilter({}, req.user?.id);

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
    data: data.map(toPublicReview),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

// Idempotente pero no silencioso: si el usuario ya había reportado esta
// reseña, rechaza con un mensaje claro en vez de aceptar el duplicado sin
// avisar — así el frontend puede distinguir "primera vez" de "ya la habías
// reportado" y reflejarlo en la UI.
async function reportReview(req, res) {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ error: 'Reseña no encontrada' });

  const alreadyReported = review.reportedBy.some((id) => id.toString() === req.user.id);
  if (alreadyReported) {
    return res.status(409).json({ error: 'Ya reportaste esta reseña' });
  }

  review.reportedBy.push(req.user.id);
  await review.save();
  res.json({ reported: true, reportsCount: review.reportedBy.length });
}

module.exports = { listRecentReviews, reportReview };
