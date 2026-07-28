const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const {
  EstablishmentReport,
  REPORT_REASONS,
} = require('../src/models/EstablishmentReport');

test('el reporte conserva motivo estructurado, estado pendiente y límites', async () => {
  const valid = new EstablishmentReport({
    establishment: new mongoose.Types.ObjectId(),
    reason: 'incorrect_hours',
    submissionId: '12345678-1234-1234-1234-123456789012',
  });
  await valid.validate();
  assert.equal(valid.status, 'pending');
  assert.ok(REPORT_REASONS.includes(valid.reason));

  const invalid = new EstablishmentReport({
    establishment: new mongoose.Types.ObjectId(),
    reason: 'inventado',
    comment: 'x'.repeat(801),
    submissionId: 'valid-submission-id-1234',
  });
  await assert.rejects(
    invalid.validate(),
    (error) => Boolean(error.errors.reason && error.errors.comment)
  );
});

test('submissionId tiene un índice único contra reenvíos accidentales', () => {
  const uniqueIndex = EstablishmentReport.schema.indexes().find(
    ([fields, options]) => fields.submissionId === 1 && options.unique
  );
  assert.ok(uniqueIndex);
});
