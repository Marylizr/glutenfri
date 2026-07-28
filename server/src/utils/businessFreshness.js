const { BUSINESS_REVIEW_DAYS } = require('../config/business');

const DAY_MS = 24 * 60 * 60 * 1000;

function businessFreshness(establishment, now = new Date()) {
  const reviewedAt = establishment.lastBusinessReviewAt
    ? new Date(establishment.lastBusinessReviewAt)
    : null;
  if (!reviewedAt || Number.isNaN(reviewedAt.getTime())) {
    return { status: 'never_reviewed', reviewedAt: null, nextReviewDueAt: null };
  }

  const ageDays = Math.floor((now.getTime() - reviewedAt.getTime()) / DAY_MS);
  const status =
    ageDays >= BUSINESS_REVIEW_DAYS.stale
      ? 'stale'
      : ageDays >= BUSINESS_REVIEW_DAYS.reviewSoon
        ? 'review_soon'
        : 'current';
  const nextReviewDueAt =
    establishment.nextReviewDueAt ||
    new Date(reviewedAt.getTime() + BUSINESS_REVIEW_DAYS.nextReview * DAY_MS);
  return { status, reviewedAt, nextReviewDueAt, ageDays };
}

module.exports = { businessFreshness };
