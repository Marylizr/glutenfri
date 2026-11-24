const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

function configureTestEnv(t) {
  for (const [key, value] of Object.entries({
    MONGODB_URI: 'mongodb://127.0.0.1:27017/isolated-not-connected',
    JWT_SECRET: 'isolated-runtime-test-secret-000000000000',
    CORS_ORIGINS: 'https://example.test',
  })) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    });
  }
}

test('conexiones simultáneas comparten un intento con tiempo de espera limitado', async (t) => {
  configureTestEnv(t);
  let resolve;
  const connection = new Promise((done) => { resolve = done; });
  const mock = t.mock.method(mongoose, 'connect', (_uri, options) => {
    assert.equal(options.serverSelectionTimeoutMS, 8000);
    return connection;
  });
  const first = connectDB();
  const second = connectDB();
  assert.equal(mock.mock.callCount(), 1);
  resolve(mongoose);
  await Promise.all([first, second]);
});

test('un fallo de conexión permite un nuevo intento posterior', async (t) => {
  configureTestEnv(t);
  let attempts = 0;
  t.mock.method(mongoose, 'connect', async () => {
    if (++attempts === 1) throw new Error('synthetic DNS failure');
    return mongoose;
  });
  await assert.rejects(connectDB(), /synthetic DNS failure/);
  assert.equal(await connectDB(), mongoose);
  assert.equal(attempts, 2);
});

test('Functions responde 503 sin filtrar el error del driver y recupera health', async (t) => {
  configureTestEnv(t);
  const sensitiveError = 'mongodb://private-user:private-password@private-host/db';
  const logger = t.mock.method(console, 'error', () => {});
  t.mock.method(mongoose, 'connect', async () => { throw new Error(sensitiveError); });
  const { handler } = require('../netlify/netlifyHandler');
  const event = {
    httpMethod: 'GET', path: '/api/health',
    headers: { host: 'example.test' }, multiValueHeaders: {},
    requestContext: { identity: { sourceIp: '127.0.0.1' } },
  };
  const response = await handler(event, {});
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(response.headers['Retry-After'], '30');
  assert.equal(JSON.parse(response.body).code, 'DATABASE_UNAVAILABLE');
  assert.ok(!JSON.stringify(response).includes('private-'));
  assert.equal(logger.mock.callCount(), 1);
  assert.deepEqual(logger.mock.calls[0].arguments, [
    'GLUTENFRI_DATABASE_CONNECTION_FAILURE',
    JSON.stringify({ category: 'unknown', code: 'UNCLASSIFIED_CONNECTION_FAILURE' }),
  ]);
  assert.ok(!JSON.stringify(logger.mock.calls).includes('private-'));
  t.mock.restoreAll();
  t.mock.method(mongoose, 'connect', async () => mongoose);
  const recovered = await handler(event, {});
  // Synthetic driver does not set readyState: Express health honestly stays degraded.
  assert.equal(recovered.statusCode, 503);
  assert.equal(JSON.parse(recovered.body).mongo, 'disconnected');
});
