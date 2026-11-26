const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const User = require('../src/models/User');
const { createLocalRecovery } = require('../src/services/passwordRecovery');
const uri = process.env.GLUTENFRI_U1_QA_URI;

test('recovery cannot enable external sinks or non-QA databases', () => {
  for (const databaseUri of ['mongodb+srv://example.invalid/glutenfri_u1_auth_qa',
    'mongodb://127.0.0.1:27189/production', 'mongodb://127.0.0.1:27189/gluten-free-app']) {
    assert.throws(() => createLocalRecovery({ databaseUri, frontendOrigin: 'http://127.0.0.1:4192' }));
  }
});

test('U1: recovery lifecycle, anti-enumeration, expiry, concurrency, session revocation and isolation', { skip: !uri }, async t => {
  assert.equal(uri, 'mongodb://127.0.0.1:27189/glutenfri_u1_auth_qa');
  process.env.JWT_SECRET = 'glutenfri-u1-isolated-test-secret-never-production';
  await mongoose.connect(uri);
  await User.deleteMany({ email: { $in: ['recover@example.invalid', 'other@example.invalid'] } });
  const mailbox = createLocalRecovery({ databaseUri: uri, frontendOrigin: 'http://127.0.0.1:4192' });
  const app = createApp({ environment: 'test', corsOrigins: mailbox.frontendOrigin, trustProxyHops: 1, passwordRecovery: mailbox });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let counter = 0;
  const request = async (path, body, token, ip) => {
    const response = await fetch(base + path, { method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip || `127.0.1.${++counter}`,
        ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, body: await response.json() };
  };
  try {
    const oldPassword = 'Synthetic-old-password-123';
    const newPassword = 'Synthetic-new-password-456';
    const a = await request('/auth/register', { name: 'QA', email: 'recover@example.invalid', password: oldPassword, privacyAccepted: true });
    const b = await request('/auth/register', { name: 'Other QA', email: 'other@example.invalid', password: oldPassword, privacyAccepted: true });
    await t.test('same response and no token exposure for absent/existing accounts; cooldown', async () => {
      const existing = await request('/auth/forgot-password', { email: 'recover@example.invalid' });
      const absent = await request('/auth/forgot-password', { email: 'absent@example.invalid' });
      assert.equal(existing.status, 202); assert.deepEqual(existing, absent);
      assert.equal(mailbox.messages.length, 1);
      await request('/auth/forgot-password', { email: 'recover@example.invalid' });
      assert.equal(mailbox.messages.length, 1);
      const stored = await User.findOne({ email: 'recover@example.invalid' }).select('+passwordResetHash +passwordResetExpiresAt');
      const raw = mailbox.messages[0].url.split('#reset=')[1];
      assert.notEqual(stored.passwordResetHash, raw); assert.equal(stored.passwordResetHash.length, 64);
      assert.equal(stored.toObject().sessionVersion, undefined);
      assert.ok(!JSON.stringify(existing).includes(raw));
      const exported = await request('/users/me/export', null, a.body.token);
      assert.equal(exported.status, 200);
      for (const key of ['passwordHash', 'passwordResetHash', 'passwordResetExpiresAt', 'passwordResetRequestedAt', 'sessionVersion']) {
        assert.equal(exported.body.user[key], undefined);
      }
    });
    const rawToken = mailbox.messages[0].url.split('#reset=')[1];
    await t.test('mismatch and invalid tokens do not update password', async () => {
      assert.equal((await request('/auth/reset-password', { token: rawToken, password: newPassword, confirmation: 'different' })).status, 400);
      assert.equal((await request('/auth/reset-password', { token: 'b'.repeat(64), password: newPassword, confirmation: newPassword })).status, 400);
      assert.equal((await request('/auth/login', { email: 'recover@example.invalid', password: oldPassword })).status, 200);
    });
    await t.test('single atomic use; only this account loses sessions', async () => {
      const body = { token: rawToken, password: newPassword, confirmation: newPassword };
      const responses = await Promise.all([request('/auth/reset-password', body), request('/auth/reset-password', body)]);
      assert.deepEqual(responses.map(r => r.status).sort(), [200, 400]);
      assert.equal((await request('/auth/me', null, a.body.token)).status, 401);
      const legacy = jwt.sign({ id: a.body.user.id }, process.env.JWT_SECRET);
      assert.equal((await request('/auth/me', null, legacy)).status, 401);
      assert.equal((await request('/auth/me', null, b.body.token)).status, 200);
      assert.equal((await request('/auth/login', { email: 'recover@example.invalid', password: oldPassword })).status, 401);
      assert.equal((await request('/auth/login', { email: 'recover@example.invalid', password: newPassword })).status, 200);
      assert.equal((await request('/auth/reset-password', body)).status, 400);
    });
    await t.test('expired links, rate limiting and production fail-closed', async () => {
      await User.updateOne({ email: 'recover@example.invalid' }, { $unset: { passwordResetRequestedAt: '' } });
      await request('/auth/forgot-password', { email: 'recover@example.invalid' });
      const token = mailbox.messages.findLast(m => m.kind === 'password-reset').url.split('#reset=')[1];
      await User.updateOne({ email: 'recover@example.invalid' }, { passwordResetExpiresAt: new Date(0) });
      assert.equal((await request('/auth/reset-password', { token, password: newPassword, confirmation: newPassword })).status, 400);
      for (let i = 0; i < 5; i++) await request('/auth/forgot-password', { email: 'absent@example.invalid' }, null, '127.0.9.1');
      assert.equal((await request('/auth/forgot-password', { email: 'absent@example.invalid' }, null, '127.0.9.1')).status, 429);
      app.locals.passwordRecovery = null;
      assert.equal((await request('/auth/recovery-status')).body.available, false);
      assert.equal((await request('/auth/forgot-password', { email: 'recover@example.invalid' })).status, 503);
      const production = createApp({ environment: 'production', corsOrigins: mailbox.frontendOrigin, passwordRecovery: mailbox });
      assert.equal(production.locals.passwordRecovery, null);
    });
    await t.test('login does not disclose suspension until credentials match', async () => {
      await User.updateOne({ email: 'other@example.invalid' }, { suspendedAt: new Date() });
      const wrong = await request('/auth/login', { email: 'other@example.invalid', password: 'wrong' });
      const absent = await request('/auth/login', { email: 'absent@example.invalid', password: 'wrong' });
      assert.equal(wrong.status, 401); assert.deepEqual(wrong, absent);
      assert.equal((await request('/auth/login', { email: 'other@example.invalid', password: oldPassword })).status, 403);
    });
  } finally {
    await new Promise(resolve => server.close(resolve));
    await User.deleteMany({ email: { $in: ['recover@example.invalid', 'other@example.invalid'] } });
    await mongoose.disconnect();
  }
});
