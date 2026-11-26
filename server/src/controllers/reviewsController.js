const Review = require('../models/Review');
const User = require('../models/User');
const { parsePagination, toPublicReview, visibilityFilter } = require('../utils/reviewFormatting');

async function listRecentReviews(req, res) {
  const { page, limit, skip } = parsePagination(req);
  const query = visibilityFilter({}, req.user?.id, req.account?.blockedAuthors);

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

  const alreadyReported =
    review.reportedBy.some((id) => id.toString() === req.user.id) ||
    review.reports.some((report) => report.reporter.toString() === req.user.id);
  if (alreadyReported) {
    return res.status(409).json({ error: 'Ya reportaste esta reseña' });
  }

  review.reportedBy.push(req.user.id);
  review.reports.push({
    reporter: req.user.id,
    reason: req.body.reason,
    details: req.body.details,
  });
  await review.save();
  res.json({ reported: true, reportsCount: review.reports.length });
}

async function blockReviewAuthor(req, res) {
  const review = await Review.findById(req.params.id).select('user').lean();
  if (!review) return res.status(404).json({ code: 'REVIEW_NOT_FOUND' });
  if (String(review.user) === req.user.id) return res.status(400).json({ code: 'CANNOT_BLOCK_SELF' });
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedAuthors: review.user } });
  res.status(204).end();
}

module.exports = { listRecentReviews, reportReview, blockReviewAuthor };
