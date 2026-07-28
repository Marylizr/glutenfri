const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const {
  createApp,
  isDevelopmentLoopbackOrigin,
  resolveTrustProxy,
} = require('../src/app');

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

test('trust proxy usa un salto en producción y ninguno en desarrollo', () => {
  assert.equal(resolveTrustProxy('production'), 1);
  assert.equal(resolveTrustProxy('development'), false);
  assert.equal(resolveTrustProxy('production', '2'), 2);
  assert.throws(() => resolveTrustProxy('production', 'todos'), /TRUST_PROXY_HOPS/);
});

test('health informa 503 cuando Mongo está desconectado', async () => {
  const app = createApp({ corsOrigins: 'https://app.example', environment: 'test' });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: 'degraded', mongo: 'disconnected' });
  });
});

test('CORS autoriza solo los orígenes configurados', async () => {
  const app = createApp({ corsOrigins: 'https://app.example', environment: 'test' });
  await withServer(app, async (baseUrl) => {
    const allowed = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://app.example' },
    });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://app.example');

    const blocked = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://evil.example' },
    });
    assert.equal(blocked.headers.get('access-control-allow-origin'), null);
  });
});

test('CORS admite puertos loopback variables solo durante desarrollo', async () => {
  assert.equal(isDevelopmentLoopbackOrigin('http://localhost:5174'), true);
  assert.equal(isDevelopmentLoopbackOrigin('http://127.0.0.1:4173'), true);
  assert.equal(isDevelopmentLoopbackOrigin('https://localhost:5174'), false);
  assert.equal(isDevelopmentLoopbackOrigin('http://localhost.evil.test:5174'), false);

  const developmentApp = createApp({
    corsOrigins: 'http://localhost:5173',
    environment: 'development',
  });
  await withServer(developmentApp, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5174' },
    });
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5174');
    assert.equal(response.headers.get('cross-origin-resource-policy'), 'cross-origin');
  });

  const productionApp = createApp({
    corsOrigins: 'https://glutenfri.example',
    environment: 'production',
  });
  await withServer(productionApp, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:5174' },
    });
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  });
});

test('el preflight autoriza GET, Content-Type y Authorization para un origen permitido', async () => {
  const app = createApp({ corsOrigins: 'https://app.example', environment: 'test' });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/establishments`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://app.example',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://app.example');
    assert.match(response.headers.get('access-control-allow-methods'), /GET/);
    assert.match(response.headers.get('access-control-allow-headers'), /Authorization/i);
  });
});

test('registro inválido se rechaza antes de acceder a Mongo', async () => {
  const app = createApp({ corsOrigins: 'https://app.example', environment: 'test' });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'incorrecto',
        password: 'corta',
        privacyAccepted: false,
      }),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Datos inválidos');
    assert.ok(body.details.length >= 4);
  });
});

test('un id de establecimiento inválido devuelve 400', async () => {
  const app = createApp({ corsOrigins: 'https://app.example', environment: 'test' });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/establishments/no-es-un-object-id`);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, 'Datos inválidos');
  });
});

test('un reporte de información inválido se rechaza antes de acceder a Mongo', async () => {
  const app = createApp({ corsOrigins: 'https://app.example', environment: 'test' });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/establishments/no-es-un-id/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'inventado',
        submissionId: 'corto',
        comment: 'x'.repeat(801),
      }),
    });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Datos inválidos');
    assert.ok(body.details.length >= 4);
  });
});
