// Explicit synthetic QA launcher. No .env loading, email transport or production URI.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { createApp } = require('../app');
const User = require('../models/User');
const { createLocalRecovery } = require('../services/passwordRecovery');
const express = require('express');

const uri = 'mongodb://127.0.0.1:27189/glutenfri_u1_auth_qa';
const origin = 'http://127.0.0.1:4192';
process.env.JWT_SECRET = 'glutenfri-u1-local-qa-only-not-a-production-secret';
async function run() {
  await mongoose.connect(uri, { autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
  const email = 'qa-admin@example.invalid';
  if (!await User.exists({ email })) await User.create({ email, name: 'Synthetic QA Admin',
    passwordHash: await bcrypt.hash('GlutenFri-QA-only-2026!', 10), privacyAcceptedAt: new Date(), isAdmin: true });
  const mailbox = createLocalRecovery({ databaseUri: uri, frontendOrigin: origin });
  const main = createApp({ environment: 'test', corsOrigins: origin, passwordRecovery: mailbox });
  const app = express();
  const { utilityFixtures } = await import('../../../client/test/fixtures/utilityPilot.js');
  let scenario = 'normal';
  app.post('/qa/scenario/:scenario', (req, res) => {
    if (!['normal', 'empty', 'http', 'invalid', 'slow'].includes(req.params.scenario)) return res.sendStatus(400);
    scenario = req.params.scenario; res.sendStatus(204);
  });
  app.get('/api/establishments', async (_req, res) => {
    res.set('Access-Control-Allow-Origin', origin).set('Cache-Control', 'no-store');
    if (scenario === 'http') return res.status(503).json({ code: 'QA_SERVICE_UNAVAILABLE' });
    if (scenario === 'invalid') return res.json({ invalidFixture: true });
    if (scenario === 'slow') await new Promise(resolve => setTimeout(resolve, 17000));
    return res.json(scenario === 'empty' ? [] : utilityFixtures);
  });
  app.get('/api/establishments/:id/reviews', (req, res, next) => {
    if (!utilityFixtures.some((place) => place._id === req.params.id)) return next();
    res.set('Access-Control-Allow-Origin', origin).set('Cache-Control', 'no-store').json([]);
  });
  app.get('/api/establishments/:id', (req, res, next) => {
    const place = utilityFixtures.find((item) => item._id === req.params.id);
    if (!place) return next();
    res.set('Access-Control-Allow-Origin', origin).set('Cache-Control', 'no-store').json(place);
  });
  // Local inspection only. Never included in createApp or the deployed Functions.
  app.get('/qa/mailbox', (_req, res) => {
    const tokenLinks = mailbox.messages.filter(message => message.kind === 'password-reset')
      .map((message, index) => `<p><a href="${message.url}">QA reset ${index + 1}</a></p>`).join('');
    res.set('Cache-Control', 'no-store').set('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'")
      .type('html').send(`<h1>GlutenFri local QA mailbox</h1>${tokenLinks || '<p>No messages</p>'}`);
  });
  // Fixtures only. Fault modes are deliberately limited to this QA launcher.
  app.use(main);
  const server = app.listen(4191, '127.0.0.1', () => console.log('GlutenFri QA API: loopback 4191. Private synthetic mailbox: /qa/mailbox.'));
  const stop = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
}
run().catch(() => { console.error('GlutenFri local QA could not start.'); process.exit(1); });
