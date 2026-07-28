const BUSINESS_REVIEW_DAYS = Object.freeze({
  reviewSoon: 120,
  stale: 180,
  nextReview: 150,
});

const BUSINESS_EDITABLE_FIELDS = Object.freeze([
  'name',
  'businessDescription',
  'logoUrl',
  'businessImages',
  'phone',
  'publicEmail',
  'websiteUrl',
  'socialLinks',
  'address',
  'lat',
  'lng',
  'timezone',
  'weeklyHours',
  'specialHours',
  'temporarilyClosed',
  'menuUrl',
  'reservationUrl',
  'orderUrl',
  'delivery',
  'takeaway',
  'whatsapp',
  'accessibilityFeatures',
  'serviceLanguages',
  'services',
]);

const SENSITIVE_BUSINESS_FIELDS = Object.freeze(['name', 'address', 'lat', 'lng']);
const BUSINESS_URL_FIELDS = Object.freeze([
  'logoUrl',
  'websiteUrl',
  'menuUrl',
  'reservationUrl',
  'orderUrl',
]);

module.exports = {
  BUSINESS_EDITABLE_FIELDS,
  BUSINESS_REVIEW_DAYS,
  BUSINESS_URL_FIELDS,
  SENSITIVE_BUSINESS_FIELDS,
};
