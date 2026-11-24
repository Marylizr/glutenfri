const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyDatabaseFailure } = require('../src/utils/databaseFailure');

test('categoriza DNS, autenticación, autorización, red y TLS sin registrar mensajes', () => {
  for (const [code, category] of [
    ['ENOTFOUND', 'dns'], ['EAI_AGAIN', 'dns'], [18, 'authentication'],
    [13, 'authorization'], ['ECONNRESET', 'network'],
    ['ERR_TLS_CERT_ALTNAME_INVALID', 'tls'],
  ]) {
    assert.deepEqual(classifyDatabaseFailure({ code, message: 'private-host:secret' }), { code, category });
  }
});

test('encuentra errores anidados en la topología de selección del servidor', () => {
  const error = {
    name: 'MongooseServerSelectionError',
    reason: { servers: new Map([['private-host', { error: { cause: { code: 'ECONNREFUSED' } } }]]) },
  };
  assert.deepEqual(classifyDatabaseFailure(error), { category: 'network', code: 'ECONNREFUSED' });
});

test('solo devuelve etiquetas constantes ante códigos desconocidos, ciclos y errores vacíos', () => {
  const error = { name: 'private-host', code: 'private-password', message: 'mongodb://user:secret@host/db' };
  error.cause = error;
  for (const input of [error, undefined, null, 'private-password']) {
    assert.deepEqual(classifyDatabaseFailure(input), {
      category: 'unknown', code: 'UNCLASSIFIED_CONNECTION_FAILURE',
    });
  }
});

test('diferencia opciones inválidas de selección sin causa identificable', () => {
  assert.deepEqual(classifyDatabaseFailure({ name: 'MongoParseError' }), {
    category: 'configuration', code: 'INVALID_CONNECTION_OPTIONS',
  });
  assert.deepEqual(classifyDatabaseFailure({ name: 'MongoServerSelectionError' }), {
    category: 'server_selection', code: 'NO_REACHABLE_SERVER',
  });
});

test('clasifica autenticación envuelta en respuesta genérica sin exponer el mensaje', () => {
  const result = classifyDatabaseFailure({
    name: 'MongoServerError', code: 8000,
    message: 'bad auth : authentication failed mongodb://private-user:private-password@private-host/db',
  });
  assert.deepEqual(result, { category: 'authentication', code: 'SERVER_AUTHENTICATION_FAILED' });
  assert.ok(!JSON.stringify(result).includes('private-'));
  assert.deepEqual(classifyDatabaseFailure({ name: 'MongoServerError', code: 8000 }), {
    category: 'unknown', code: 'MongoServerError',
  });
});
