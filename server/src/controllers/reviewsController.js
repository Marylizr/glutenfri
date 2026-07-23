const Review = require('../models/Review');
const { parsePagination, toPublicReview } = require('../utils/reviewFormatting');

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
    data: data.map(toPublicReview),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

module.exports = { listRecentReviews };
