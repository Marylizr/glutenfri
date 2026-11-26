const { randomBytes, createHash } = require('node:crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isSuspended } = require('../middleware/auth');
const { setTimeout: delay } = require('node:timers/promises');

const hashToken = token => createHash('sha256').update(token).digest('hex');
const GENERIC_REPLY = { message: 'Si la cuenta puede recuperarse, recibirás instrucciones.' };

// A private in-memory mailbox, NOT an email provider or public API. Only loopback QA.
function createLocalRecovery({ databaseUri, frontendOrigin }) {
  const db = new URL(databaseUri);
  const origin = new URL(frontendOrigin);
  if (db.protocol !== 'mongodb:' || db.hostname !== '127.0.0.1' || db.port !== '27189' ||
      db.pathname !== '/glutenfri_u1_auth_qa' || db.username || db.password ||
      origin.protocol !== 'http:' || origin.hostname !== '127.0.0.1' ||
      origin.pathname !== '/' || origin.username || origin.password || origin.search || origin.hash) {
    throw new Error('Recovery mailbox requires isolated GlutenFri loopback QA.');
  }
  const messages = [];
  return {
    databaseUri, frontendOrigin: origin.origin,
    messages,
    async deliver(message) { messages.push(message); },
  };
}

function available(req) {
  const config = req.app.locals.passwordRecovery;
  // Binding is checked against the actual active DB, not just an environment flag.
  return config && User.db.name === 'glutenfri_u1_auth_qa' &&
    User.db.host === '127.0.0.1' && User.db.port === 27189 ? config : null;
}

async function requestReset(req, res) {
  const config = available(req);
  if (!config) return res.status(503).json({ code: 'RECOVERY_UNAVAILABLE' });
  const started = Date.now();
  try {
    const token = randomBytes(32).toString('hex');
    const now = new Date();
    const account = await User.findOneAndUpdate({
      email: req.body.email,
      $or: [{ passwordResetRequestedAt: { $exists: false } },
        { passwordResetRequestedAt: { $lte: new Date(now - 5 * 60_000) } }],
    }, { $set: { passwordResetHash: hashToken(token),
      passwordResetExpiresAt: new Date(now.getTime() + 15 * 60_000), passwordResetRequestedAt: now } }, { returnDocument: 'after' });
    if (account && !isSuspended(account)) {
      await config.deliver({ to: account.email, kind: 'password-reset',
        url: `${config.frontendOrigin}/perfil#reset=${token}` });
    }
  } catch {
    // Same response for delivery/lookup errors; never expose account state.
    console.error('GLUTENFRI_RECOVERY_REQUEST_FAILED');
  }
  await delay(Math.max(0, 300 - (Date.now() - started)));
  res.set('Cache-Control', 'no-store').status(202).json(GENERIC_REPLY);
}

async function completeReset(req, res) {
  const config = available(req);
  if (!config) return res.status(503).json({ code: 'RECOVERY_UNAVAILABLE' });
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  // Atomic compare-and-consume: racing requests cannot reuse the same token.
  const account = await User.findOneAndUpdate({ passwordResetHash: hashToken(req.body.token),
    passwordResetExpiresAt: { $gt: new Date() } }, {
    $set: { passwordHash }, $inc: { sessionVersion: 1 },
    $unset: { passwordResetHash: '', passwordResetExpiresAt: '' },
  }, { returnDocument: 'after' });
  if (!account) return res.status(400).json({ code: 'RESET_INVALID' });
  // Notification remains in the same private QA sink, with no password or token.
  try { await config.deliver({ to: account.email, kind: 'password-changed' }); }
  catch { console.error('GLUTENFRI_RECOVERY_NOTIFICATION_FAILED'); }
  res.set('Cache-Control', 'no-store').status(200).json({ code: 'PASSWORD_RESET_COMPLETE' });
}

module.exports = { createLocalRecovery, available, requestReset, completeReset };
