const test = require('node:test');
const assert = require('node:assert/strict');
const {
  TRUST_STATUS,
  normalizeTrustStatus,
  normalizeEstablishmentTrust,
} = require('../src/utils/trustStatus');

test('un estado desconocido cae en PENDING_VALIDATION', () => {
  assert.equal(
    normalizeTrustStatus({ trustStatus: 'VERIFIED', source: 'Google' }),
    TRUST_STATUS.PENDING_VALIDATION
  );
});

test('un verified antiguo sin evidencia no se convierte en certificado', () => {
  assert.equal(
    normalizeTrustStatus({ certified: true, source: 'Google' }),
    TRUST_STATUS.PENDING_VALIDATION
  );
});

test('solo el legado APC explícito conserva certificación y fuente oficial', () => {
  const normalized = normalizeEstablishmentTrust({ certified: true, source: 'APC' });
  assert.equal(normalized.trustStatus, TRUST_STATUS.CERTIFIED_APC_BIOTRAB);
  assert.equal(normalized.sourceName, 'Associação Portuguesa de Celíacos (APC)');
  assert.match(normalized.sourceUrl, /^https:\/\/www\.celiacos\.org\.pt\//);
  assert.equal(normalized.lastVerifiedAt, null);
});

test('un alta comunitaria queda explícitamente como no certificada', () => {
  assert.equal(
    normalizeTrustStatus({ source: 'user' }),
    TRUST_STATUS.COMMUNITY_REPORTED
  );
});
