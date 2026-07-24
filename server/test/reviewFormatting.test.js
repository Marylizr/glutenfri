const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parsePagination,
  toPublicReview,
  visibilityFilter,
} = require('../src/utils/reviewFormatting');

test('parsePagination aplica defaults y límites seguros', () => {
  assert.deepEqual(parsePagination({ query: {} }), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(parsePagination({ query: { page: '3', limit: '999' } }), {
    page: 3,
    limit: 50,
    skip: 100,
  });
  assert.deepEqual(parsePagination({ query: { page: '-2', limit: '0' } }), {
    page: 1,
    limit: 20,
    skip: 0,
  });
});

test('toPublicReview nunca expone apellido ni email', () => {
  const result = toPublicReview({
    _id: 'review-1',
    comment: 'Muy bien',
    user: { _id: 'user-1', name: 'María Fernández', email: 'maria@example.com' },
  });
  assert.deepEqual(result.user, { _id: 'user-1', name: 'María' });
  assert.equal(result.user.email, undefined);
});

test('visibilityFilter oculta reseñas moderadas salvo para el autor', () => {
  assert.deepEqual(visibilityFilter({ establishment: 'est-1' }), {
    establishment: 'est-1',
    hidden: false,
  });
  assert.deepEqual(visibilityFilter({ establishment: 'est-1' }, 'user-1'), {
    establishment: 'est-1',
    $or: [{ hidden: false }, { user: 'user-1' }],
  });
});
