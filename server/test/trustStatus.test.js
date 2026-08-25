const test = require('node:test');
const assert = require('node:assert/strict');
const {
  TRUST_STATUS,
  normalizeTrustStatus,
  normalizeEstablishmentTrust,
  normalizePublicInformation,
} = require('../src/utils/trustStatus');
const { toPublicEstablishment } = require('../src/controllers/establishmentsController');

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

test('la taxonomía pública separa categoría, fuente, confianza y estado', () => {
  const current = normalizePublicInformation(
    {
      type: 'store',
      source: 'Google',
      lastInformationUpdate: '2026-08-01T00:00:00Z',
    },
    new Date('2026-08-23T00:00:00Z')
  );
  assert.deepEqual(current, {
    informationCategory: 'retail_store',
    sourceType: 'public_source',
    confidenceLevel: 'source_verified',
    informationStatus: 'active',
    informationUpdatedAt: '2026-08-01T00:00:00Z',
  });

  assert.equal(
    normalizePublicInformation(
      { source: 'user', lastVerifiedAt: '2024-01-01T00:00:00Z' },
      new Date('2026-08-23T00:00:00Z')
    ).confidenceLevel,
    'source_outdated'
  );
  assert.equal(normalizePublicInformation({}).confidenceLevel, 'source_pending_review');
  assert.equal(
    normalizePublicInformation({ temporarilyClosed: true }).informationStatus,
    'closed_or_removed'
  );
  assert.equal(
    normalizePublicInformation({ informationCategory: 'external_certification' }).informationCategory,
    'community_information'
  );
  assert.equal(
    normalizePublicInformation({
      informationCategory: 'external_certification',
      externalCertificationAuthorized: true,
      sourceName: 'Entidade externa',
      sourceUrl: 'https://example.test/source',
    }).informationCategory,
    'external_certification'
  );
});

test('la respuesta pública no expone clasificación institucional heredada', () => {
  const record = toPublicEstablishment({
    _id: 'legacy',
    name: 'Local',
    type: 'restaurant',
    source: 'APC',
    certified: true,
    trustStatus: 'CERTIFIED_APC_BIOTRAB',
    certificationBody: 'Entidad',
    certificationDate: '2026-01-01T00:00:00Z',
    discount: '10% desconto APC',
  });
  assert.equal('certified' in record, false);
  assert.equal('trustStatus' in record, false);
  assert.equal('certificationBody' in record, false);
  assert.equal('certificationDate' in record, false);
  assert.equal(record.discount, undefined);
  assert.equal(record.sourceType, 'public_source');
});
