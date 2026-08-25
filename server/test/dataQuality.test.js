const test = require('node:test');
const assert = require('node:assert/strict');
const { distanceMeters, findDuplicateCandidates, normalizeIdentity } = require('../src/utils/dataQuality');
const Establishment = require('../src/models/Establishment');
const { EstablishmentReport } = require('../src/models/EstablishmentReport');

test('normaliza identidad sin depender de mayúsculas, acentos o puntuación', () => {
  assert.equal(normalizeIdentity('  Pão & Companhia! '), 'pao companhia');
});

test('propone duplicados por nombre y dirección sin fusionarlos automáticamente', () => {
  const records = [
    { _id: 'a', name: 'Casa Sem Glúten', address: 'Rua da Alegria, 10' },
    { _id: 'b', name: 'casa sem gluten', address: 'Rua da Alegria 10' },
    { _id: 'c', name: 'Casa Sem Glúten', address: 'Outra Rua, 4' },
  ];
  const candidates = findDuplicateCandidates(records);
  assert.equal(candidates.length, 1);
  assert.deepEqual(candidates[0].reasons, ['same_name_address']);
  assert.equal(candidates[0].first._id, 'a');
  assert.equal(candidates[0].second._id, 'b');
});

test('propone nombres iguales próximos y rechaza coincidencias lejanas', () => {
  const records = [
    { _id: 'a', name: 'Loja Norte', address: 'A', lat: 41.1496, lng: -8.6109 },
    { _id: 'b', name: 'Loja Norte', address: 'B', lat: 41.1497, lng: -8.6108 },
    { _id: 'c', name: 'Loja Norte', address: 'C', lat: 38.7223, lng: -9.1393 },
  ];
  assert.ok(distanceMeters(records[0], records[1]) < 150);
  const candidates = findDuplicateCandidates(records);
  assert.equal(candidates.length, 1);
  assert.deepEqual(candidates[0].reasons, ['same_name_nearby']);
});

test('el modelo conserva revisión, responsable y relación de duplicado como datos internos', () => {
  const paths = Establishment.schema.paths;
  assert.deepEqual(paths.qualityReviewStatus.enumValues, ['pending', 'in_review', 'reviewed']);
  assert.equal(paths.qualityReviewedBy.options.ref, 'User');
  assert.equal(paths.sourceReviewedBy.options.ref, 'User');
  assert.equal(paths.duplicateOf.options.ref, 'Establishment');
});

test('los reportes registran resolución y responsable sin ampliar los datos del denunciante', () => {
  const paths = EstablishmentReport.schema.paths;
  assert.equal(paths.reviewedBy.options.ref, 'User');
  assert.equal(paths.resolutionNote.options.maxlength, 1000);
  assert.ok(paths.reviewedAt);
});
