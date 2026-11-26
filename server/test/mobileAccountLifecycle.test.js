const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const Establishment = require('../src/models/Establishment');
const Review = require('../src/models/Review');

// Explicit opt-in only. Never inherit MONGODB_URI or touch a provider database.
const uri = process.env.GLUTENFRI_MOBILE_QA_URI;
test('cuentas móviles: consentimiento, login, sesión, guardados, reseña, exportación y borrado aislados', { skip: !uri }, async t => {
  const parsed = new URL(uri);
  assert.equal(parsed.protocol, 'mongodb:');
  assert.equal(parsed.hostname, '127.0.0.1');
  assert.equal(parsed.port, '27189');
  assert.equal(parsed.pathname, '/glutenfri_mobile_accounts_qa');
  assert.equal(parsed.username, '');
  assert.equal(parsed.password, '');
  const secret = 'glutenfri-local-mobile-qa-only-not-a-production-secret';
  process.env.JWT_SECRET = secret;
  await mongoose.connect(uri);
  const fixture = await Establishment.create({ name: 'Local sintético QA', type: 'restaurant', source: 'user' });
  const server = createApp({ environment: 'test', corsOrigins: 'capacitor://localhost,https://localhost' }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const users = [];
  try {
    for (const origin of ['capacitor://localhost', 'https://localhost']) {
      await t.test(origin, async () => {
        const email = `mobile-qa-${new mongoose.Types.ObjectId()}@example.invalid`;
        const password = 'Only-local-QA-12345';
        const request = async (path, method = 'GET', body, token) => {
          const response = await fetch(`${base}/api${path}`, { method, headers: {
            Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }, ...(body ? { body: JSON.stringify(body) } : {}) });
          assert.equal(response.headers.get('access-control-allow-origin'), origin);
          const text = await response.text();
          return { status: response.status, data: text ? JSON.parse(text) : null };
        };
        assert.equal((await request('/auth/register', 'POST', { name: 'QA', email, password, privacyAccepted: false })).status, 400);
        assert.equal(await User.countDocuments({ email }), 0);
        const registered = await request('/auth/register', 'POST', { name: 'QA', email, password, privacyAccepted: true });
        assert.equal(registered.status, 201);
        const id = registered.data.user.id;
        users.push(id);
        assert.equal((await request('/auth/login', 'POST', { email, password: 'wrong' })).status, 401);
        const loggedIn = await request('/auth/login', 'POST', { email, password });
        assert.equal(loggedIn.status, 200);
        const token = loggedIn.data.token;
        assert.equal((await request('/auth/me', 'GET', undefined, token)).data.user.id, id);
        const expired = jwt.sign({ id }, secret, { expiresIn: -1 });
        assert.equal((await request('/auth/me', 'GET', undefined, expired)).status, 401);
        assert.equal((await request(`/users/me/saved/${fixture.id}`, 'POST', undefined, token)).status, 204);
        assert.equal((await request('/users/me/saved', 'GET', undefined, token)).data.length, 1);
        assert.equal((await request(`/users/me/saved/${fixture.id}`, 'DELETE', undefined, token)).status, 204);
        assert.equal((await request('/users/me/saved', 'GET', undefined, token)).data.length, 0);
        const review = await request(`/establishments/${fixture.id}/reviews`, 'POST', {
          rating: 4, comment: 'Contenido exclusivamente sintético de QA', staffUnderstanding: 'okay', hasDedicatedMenu: false, dedicatedKitchen: false, riskLevel: 'moderate',
        }, token);
        assert.equal(review.status, 201);
        const exported = await request('/users/me/export', 'GET', undefined, token);
        assert.equal(exported.status, 200);
        assert.equal(exported.data.user.email, email);
        assert.equal(exported.data.user.passwordHash, undefined);
        assert.equal(exported.data.reviews.length, 1);
        assert.equal((await request('/users/me', 'DELETE', undefined, token)).status, 204);
        assert.equal(await User.countDocuments({ _id: id }), 0);
        assert.equal(await Review.countDocuments({ user: id }), 0);
        assert.equal((await request('/auth/me', 'GET', undefined, token)).status, 401);
      });
    }
  } finally {
    await Review.deleteMany({ establishment: fixture._id });
    await User.deleteMany({ _id: { $in: users } });
    await Establishment.deleteOne({ _id: fixture._id });
    await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
  }
});
