import test from 'node:test';
import assert from 'node:assert/strict';
import { requireList, requirePaginated } from '../src/services/responseValidation.js';

test('requireList acepta respuestas paginadas y listas directas', () => {
  const list = [{ id: 1 }];
  assert.equal(requireList(list), list);
  assert.equal(requireList({ data: list }), list);
});

test('requireList rechaza HTML y respuestas sin lista', () => {
  assert.throws(() => requireList('<!doctype html>'), /inválida/);
  assert.throws(() => requireList({ status: 'ok' }), /inválida/);
});

test('requirePaginated exige un objeto con data como lista', () => {
  const payload = { data: [], page: 1, totalPages: 1 };
  assert.equal(requirePaginated(payload), payload);
  assert.throws(() => requirePaginated(undefined), /inválida/);
  assert.throws(() => requirePaginated({ data: null }), /inválida/);
});
