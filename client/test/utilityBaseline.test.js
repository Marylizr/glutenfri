import test from 'node:test';
import assert from 'node:assert/strict';
import { utilityFixtures, completeness } from './fixtures/utilityPilot.js';
import { normalizeEstablishmentRecord } from '../src/utils/trustStatus.js';
import { authErrorKey, readStoredSession, consumeResetToken, requireAuthSession } from '../src/utils/authReliability.js';
import { establishmentErrorKey } from '../src/utils/requestState.js';

test('U0: 25 fixtures cover five types, absent data remains unknown and certification is not invented', () => {
  assert.equal(utilityFixtures.length, 25);
  for (const fixture of utilityFixtures) {
    const fields = Object.values(completeness(fixture));
    if (fixture.scenario === 'complete') assert.ok(fields.every(Boolean));
    if (fixture.scenario === 'incomplete') assert.ok(fields.every(value => !value));
    if (fixture.scenario === 'unsupported-certification') {
      assert.notEqual(normalizeEstablishmentRecord(fixture).informationCategory, 'external_certification');
    }
  }
});

test('U1: errors are actionable fixed translation keys, not raw server messages', () => {
  for (const [status, key] of [[401, 'authInvalidCredentials'], [403, 'authSuspended'],
    [429, 'authRateLimited'], [503, 'authUnavailable'], [400, 'authInvalidInput']]) {
    assert.equal(authErrorKey({ response: { status, data: { error: 'private payload' } } }), key);
  }
  assert.equal(authErrorKey({ code: 'ECONNABORTED' }), 'authTimeout');
  assert.equal(authErrorKey({}), 'authNetwork');
  assert.throws(() => requireAuthSession({ token: 'synthetic', user: null }), TypeError);
  assert.throws(() => requireAuthSession({}), TypeError);
  assert.equal(authErrorKey(new TypeError('private data')), 'loadDataError');
  assert.equal(establishmentErrorKey({ code: 'ECONNABORTED' }), 'authTimeout');
  assert.equal(establishmentErrorKey({ response: { status: 503 } }), 'authUnavailable');
  assert.equal(establishmentErrorKey({ response: { status: 429 } }), 'authRateLimited');
  assert.equal(authErrorKey({ response: { data: { code: 'RESET_INVALID' } } }), 'authResetInvalid');
});

test('U1: corrupt storage never crashes; cached admin role is untrusted', () => {
  assert.equal(readStoredSession({ getItem() { throw Error('storage unavailable'); } }), null);
  assert.equal(readStoredSession({ getItem: () => 'invalid-json' }), null);
  assert.equal(readStoredSession({ getItem: () => null }), null);
  const storage = { getItem: key => key === 'gf_auth_token' ? 'synthetic-token' : JSON.stringify({ id: 'qa', name: 'QA', email: 'qa@example.invalid', isAdmin: true }) };
  assert.equal(readStoredSession(storage).isAdmin, false);
});

test('U1: recovery token is consumed from fragment, not kept in navigable URL', () => {
  const token = 'a'.repeat(64);
  const calls = [];
  assert.equal(consumeResetToken({ hash: `#reset=${token}`, pathname: '/perfil', search: '' },
    { replaceState: (...args) => calls.push(args) }), token);
  assert.equal(calls[0][2], '/perfil');
  assert.ok(!calls[0].join().includes(token));
});
