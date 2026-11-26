const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Review = require('../src/models/Review');
const Establishment = require('../src/models/Establishment');
const AdminAction = require('../src/models/AdminAction');
const { screenReview } = require('../src/utils/contentModeration');
const { visibilityFilter, toPublicReview } = require('../src/utils/reviewFormatting');
const uri = process.env.GLUTENFRI_UTILITY_QA_URI;

test('moderation holds all free text and media, including obfuscated abuse; public serialization excludes reporter identities', () => {
  assert.deepEqual(screenReview({ comment: '' }), []);
  assert.ok(screenReview({ comment: 'f.u.c.k' }).includes('text_review'));
  assert.ok(screenReview({ comment: 'person@example.invalid +351 900 000 000' }).includes('possible_personal_data'));
  assert.ok(screenReview({ photos: ['https://example.invalid/photo.jpg'] }).includes('media_review'));
  const result = toPublicReview({ user: { _id: 'u', name: 'First Last', email: 'private' }, reports: ['private'], reportedBy: ['private'], moderationFlags: ['private'] });
  assert.deepEqual(result, { user: { _id: 'u', name: 'First' } });
  assert.deepEqual(visibilityFilter({}, 'u', ['b']).user, { $nin: ['b'] });
});

test('U6 API: private idempotent block, unblock, moderation queue, authorization, export and deletion', { skip: !uri }, async (t) => {
  assert.equal(uri, 'mongodb://127.0.0.1:27189/glutenfri_utility_qa');
  process.env.JWT_SECRET = 'glutenfri-utility-qa-synthetic-secret';
  await mongoose.connect(uri);
  t.after(() => mongoose.disconnect());
  const suffix = new mongoose.Types.ObjectId().toString();
  const users = await User.create(['reader', 'author', 'admin'].map((name) => ({ name, email: `${name}-${suffix}@example.invalid`, passwordHash: 'synthetic-unused', privacyAcceptedAt: new Date(), isAdmin: name === 'admin' })));
  const [reader, author, admin] = users;
  const place = await Establishment.create({ name: 'Synthetic moderation QA', type: 'restaurant', source: 'user' });
  const published = await Review.create({ establishment: place.id, user: author.id, rating: 4, comment: 'Previously approved synthetic content', staffUnderstanding: 'okay', hasDedicatedMenu: false, dedicatedKitchen: false, riskLevel: 'moderate' });
  const app = createApp({ environment: 'test', corsOrigins: 'capacitor://localhost,https://localhost' });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const request = async (path, user, method = 'GET', body) => {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, { method,
      headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${jwt.sign({ id: user.id }, process.env.JWT_SECRET)}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    const text = await res.text(); return { status: res.status, body: text ? JSON.parse(text) : null };
  };
  try {
    assert.equal((await request(`/reviews/${published.id}/block-author`, null, 'POST')).status, 401);
    assert.equal((await request(`/reviews/${published.id}/block-author`, author, 'POST')).status, 400);
    for (let i = 0; i < 2; i++) assert.equal((await request(`/reviews/${published.id}/block-author`, reader, 'POST')).status, 204);
    assert.equal((await request('/users/me/blocked-authors', reader)).body.length, 1);
    assert.equal((await request('/reviews/recent', reader)).body.total, 0);
    assert.equal((await request(`/establishments/${place.id}/reviews`, reader)).body.length, 0);
    assert.equal((await request('/reviews/recent', admin)).body.total, 1);
    assert.equal((await request('/reviews/recent')).body.total, 1);
    assert.equal((await request('/users/me/export', reader)).body.user.blockedAuthors.length, 1);
    assert.equal((await request(`/users/me/blocked-authors/${author.id}`, reader, 'DELETE')).status, 204);
    assert.equal((await request('/reviews/recent', reader)).body.total, 1);
    const quality = { qualityReviewStatus: 'reviewed', nextReviewDueAt: '2027-01-01T23:59:59.999Z', reason: 'Synthetic editorial scheduling' };
    assert.equal((await request(`/admin/establishments/${place.id}/quality`, reader, 'PATCH', quality)).status, 403);
    assert.equal((await request(`/admin/establishments/${place.id}/quality`, admin, 'PATCH', { ...quality, nextReviewDueAt: 'not-a-date' })).status, 400);
    const scheduled = await request(`/admin/establishments/${place.id}/quality`, admin, 'PATCH', quality);
    assert.equal(scheduled.status, 200); assert.equal(scheduled.body.nextReviewDueAt, quality.nextReviewDueAt);
    const audit = await AdminAction.findOne({ actor: admin._id, targetId: place._id }).lean();
    assert.ok(audit.metadata.changes.some((change) => change.field === 'nextReviewDueAt'));
    assert.equal((await request(`/admin/establishments/${place.id}/quality`, admin, 'PATCH', { confidenceLevel: 'source_verified', reason: 'Synthetic missing evidence' })).status, 400);
    const submitted = await request(`/establishments/${place.id}/reviews`, reader, 'POST', { rating: 5, comment: 'texto sintético pendiente', staffUnderstanding: 'excellent', hasDedicatedMenu: true, dedicatedKitchen: true, riskLevel: 'none' });
    assert.equal(submitted.status, 201); assert.equal(submitted.body.hidden, true);
    assert.equal((await request(`/establishments/${place.id}/reviews`)).body.length, 1);
    assert.equal((await request(`/establishments/${place.id}/reviews`, reader)).body.length, 2);
    assert.equal((await request('/admin/reviews/reported', reader)).status, 403);
    const queue = await request('/admin/reviews/reported', admin);
    assert.ok(queue.body.data.some((r) => r._id === submitted.body._id && r.moderationFlags.includes('text_review')));
    assert.equal((await request(`/admin/reviews/${submitted.body._id}/unhide`, admin, 'PATCH', { reason: 'No version' })).status, 409);
    assert.equal((await request(`/admin/reviews/${submitted.body._id}/unhide`, admin, 'PATCH', { reason: 'Stale version', expectedUpdatedAt: '2020-01-01T00:00:00.000Z' })).status, 409);
    assert.equal((await request(`/admin/reviews/${submitted.body._id}/unhide`, admin, 'PATCH', { reason: 'Synthetic editorial approval', expectedUpdatedAt: submitted.body.updatedAt })).status, 200);
    assert.equal((await request(`/establishments/${place.id}/reviews`)).body.length, 2);
    assert.equal((await Establishment.findById(place.id).lean()).avgRating, 4.5);
    assert.equal((await request(`/admin/reviews/${submitted.body._id}/hide`, admin, 'PATCH', { reason: 'Synthetic removal' })).status, 200);
    assert.equal((await Establishment.findById(place.id).lean()).avgRating, 4);
    const editHeld = await request(`/establishments/${place.id}/reviews`, reader, 'POST', { rating: 5, comment: '', staffUnderstanding: 'excellent', hasDedicatedMenu: true, dedicatedKitchen: true, riskLevel: 'none' });
    assert.equal(editHeld.body.hidden, true);
    await request(`/reviews/${published.id}/block-author`, reader, 'POST');
    assert.equal((await request('/users/me', author, 'DELETE')).status, 204);
    assert.equal((await request('/users/me/blocked-authors', reader)).body.length, 0);
  } finally {
    await Review.deleteMany({ establishment: place.id }); await Establishment.deleteOne({ _id: place.id });
    await AdminAction.deleteMany({ actor: { $in: users.map((u) => u._id) } });
    await User.deleteMany({ _id: { $in: users.map((u) => u._id) } });
    await new Promise((resolve) => server.close(resolve)); await mongoose.disconnect();
  }
});
