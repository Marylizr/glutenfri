const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApcImportPlan, toApcDocument } = require('../src/utils/apcImportPlan');
const catalog = require('../data/apc-portugal.json');

test('el catálogo nacional conserva fuentes e islas sin atribuir certificaciones', () => {
  assert.equal(catalog.establishments.length, catalog.totalReferences);
  assert.equal(catalog.totalReferences, 205);
  const regions = new Set(catalog.establishments.map((item) => item.provenance.region));
  for (const region of ['Lisboa', 'Algarve', 'Norte', 'Centro', 'Região Autónoma da Madeira', 'Região Autónoma dos Açores']) {
    assert.ok(regions.has(region));
  }
  for (const reference of catalog.establishments) {
    const doc = toApcDocument(reference);
    assert.ok(doc.name);
    assert.match(doc.sourceUrl, /^https:\/\/www\.celiacos\.org\.pt\//);
    assert.equal(doc.confidenceLevel, 'source_pending_review');
    assert.notEqual(doc.informationCategory, 'external_certification');
    assert.equal(doc.certified, undefined);
    assert.equal(doc.lastVerifiedAt, undefined);
    assert.equal(doc.externalCertificationAuthorized, undefined);
    if (reference.provenance.onlineOnly) assert.equal(doc.lat, undefined);
    if (doc.lat !== undefined) {
      assert.ok(doc.lat >= 30 && doc.lat <= 43);
      assert.ok(doc.lng >= -32 && doc.lng <= -6);
    }
  }
});

test('la importación no sobrescribe existentes ni duplica referencias repetidas', () => {
  const first = catalog.establishments[0];
  const existing = [{ ...first, confidenceLevel: 'source_verified' }];
  const snapshot = JSON.stringify(existing);
  const plan = buildApcImportPlan(existing, [first, first]);
  assert.equal(plan.insert.length, 0);
  assert.equal(plan.matched.length, 1);
  assert.equal(JSON.stringify(existing), snapshot);
});

test('teléfono compartido o coordenadas cercanas requieren revisión sin fusionar locales', () => {
  const ref = catalog.establishments[0];
  const plan = buildApcImportPlan([{ name: 'Nombre diferente', phone: ref.phone }], [ref]);
  assert.equal(plan.review.length, 1);
  assert.equal(plan.insert.length, 0);
});
