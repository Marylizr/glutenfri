const Review = require('../models/Review');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parsePagination(req) {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

// Feed público — solo el primer nombre del usuario, nunca el email ni el
// apellido completo. Es una vista de toda la comunidad dentro de la app,
// no un perfil, así que cuidamos privacidad básica aunque sea un piloto cerrado.
function toFeedItem(review) {
  return {
    ...review,
    user: review.user ? { _id: review.user._id, name: review.user.name.split(' ')[0] } : null,
  };
}

async function listRecentReviews(req, res) {
  const { page, limit, skip } = parsePagination(req);

  const [data, total] = await Promise.all([
    Review.find({})
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('establishment', 'name type')
      .populate('user', 'name')
      .lean(),
    Review.countDocuments({}),
  ]);

  res.json({
    data: data.map(toFeedItem),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

module.exports = { listRecentReviews, parsePagination, toFeedItem };
