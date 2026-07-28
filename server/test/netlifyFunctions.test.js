const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const { createServerlessHandler } = require('../netlify/serverlessAdapter');

test('las imágenes de Functions se codifican como base64 sin corromper sus bytes', async () => {
  const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const app = express();
  app.get('/photo', (_req, res) => {
    res.type('image/jpeg').send(imageBytes);
  });

  const handler = createServerlessHandler(app);
  const response = await handler(
    {
      httpMethod: 'GET',
      path: '/photo',
      headers: { host: 'localhost' },
      multiValueHeaders: {},
      requestContext: { identity: { sourceIp: '127.0.0.1' } },
    },
    {}
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.isBase64Encoded, true);
  assert.equal(response.headers['content-type'], 'image/jpeg');
  assert.deepEqual(Buffer.from(response.body, 'base64'), imageBytes);
});

test('Netlify enruta la API, limita auth y ejecuta Places en segundo plano', async () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousCorsOrigins = process.env.CORS_ORIGINS;
  process.env.JWT_SECRET = 'prueba'.repeat(8);
  process.env.CORS_ORIGINS = 'https://app.example';

  try {
    const [api, auth, background] = await Promise.all([
      import('../netlify/functions/api.mjs'),
      import('../netlify/functions/auth.mjs'),
      import('../netlify/functions/refresh-google-places-background.mjs'),
    ]);

    assert.equal(api.config.rateLimit.windowLimit, 200);
    assert.equal(auth.config.rateLimit.windowLimit, 10);
    assert.equal(background.config.background, true);
    assert.equal(typeof api.handler, 'function');
    assert.equal(typeof auth.handler, 'function');
    assert.equal(typeof background.handler, 'function');
  } finally {
    if (previousJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousJwtSecret;
    if (previousCorsOrigins === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = previousCorsOrigins;
  }
});

test('los redirects de API se evalúan antes que el fallback de la SPA', () => {
  const config = fs.readFileSync(path.resolve(__dirname, '../../netlify.toml'), 'utf8');
  const authRedirect = config.indexOf('from = "/api/auth/*"');
  const apiRedirect = config.indexOf('from = "/api/*"');
  const spaFallback = config.indexOf('from = "/*"');

  assert.ok(authRedirect >= 0);
  assert.ok(apiRedirect > authRedirect);
  assert.ok(spaFallback > apiRedirect);
  assert.match(config, /to = "\/\.netlify\/functions\/auth\/:splat"/);
  assert.match(config, /to = "\/\.netlify\/functions\/api\/:splat"/);
});

test('el sitemap dinámico se evalúa antes que el fallback de la SPA', () => {
  const config = fs.readFileSync(path.join(__dirname, '../../netlify.toml'), 'utf8');
  const sitemapIndex = config.indexOf('from = "/sitemap.xml"');
  const spaIndex = config.indexOf('from = "/*"');
  assert.ok(sitemapIndex >= 0);
  assert.ok(spaIndex > sitemapIndex);
});
