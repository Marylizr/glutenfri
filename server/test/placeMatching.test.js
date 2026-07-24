const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalize,
  getBranchHint,
  scoreCandidate,
  selectCandidate,
} = require('../src/utils/placeMatching');

const place = (name, address = '') => ({
  id: name,
  displayName: { text: name },
  formattedAddress: address,
  photos: [],
});

test('normalize elimina acentos y puntuación', () => {
  assert.equal(normalize('Farmácia — São João'), 'farmacia sao joao');
});

test('extrae la sucursal después del guion', () => {
  assert.equal(getBranchHint('Celeiro - Via Catarina'), 'Via Catarina');
});

test('usa la dirección del candidato para confirmar una sucursal', () => {
  const result = scoreCandidate(
    'Celeiro - Via Catarina',
    place('Celeiro', 'Rua de Santa Catarina 312, Porto')
  );

  assert.equal(result.branchScore, 0.5);
  assert.ok(result.score >= 0.7);
});

test('elige la sucursal correcta entre establecimientos de la misma cadena', () => {
  const selection = selectCandidate('Celeiro - Via Catarina', [
    place('Celeiro', 'Alameda das Antas, Porto'),
    place('Celeiro', 'Rua de Santa Catarina 312, Porto'),
    place('Celeiro', 'NorteShopping, Matosinhos'),
  ]);

  assert.equal(selection.accepted, true);
  assert.equal(selection.best.candidate.formattedAddress, 'Rua de Santa Catarina 312, Porto');
});

test('rechaza una cadena cuando no puede confirmar la sucursal', () => {
  const selection = selectCandidate('Celeiro - Via Catarina', [
    place('Celeiro', 'Alameda das Antas, Porto'),
  ]);

  assert.equal(selection.accepted, false);
  assert.equal(selection.reason, 'sucursal no confirmada');
});

test('rechaza resultados cercanos y ambiguos', () => {
  const selection = selectCandidate('Jardim Verde - Braga', [
    place('Jardim Verde', 'Centro de Braga, Portugal'),
    place('Jardim Verde', 'Avenida Central, Braga, Portugal'),
  ]);

  assert.equal(selection.accepted, false);
  assert.equal(selection.reason, 'resultados ambiguos');
});
