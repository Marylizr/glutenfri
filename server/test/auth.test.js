const test = require('node:test');
const assert = require('node:assert/strict');
const { isSuspended } = require('../src/middleware/auth');

test('isSuspended distingue suspensiones activas, indefinidas y vencidas', () => {
  assert.equal(isSuspended({ suspendedAt: null }), false);
  assert.equal(isSuspended({ suspendedAt: new Date(), suspendedUntil: null }), true);
  assert.equal(
    isSuspended({
      suspendedAt: new Date(),
      suspendedUntil: new Date(Date.now() + 60_000),
    }),
    true
  );
  assert.equal(
    isSuspended({
      suspendedAt: new Date(Date.now() - 120_000),
      suspendedUntil: new Date(Date.now() - 60_000),
    }),
    false
  );
});
