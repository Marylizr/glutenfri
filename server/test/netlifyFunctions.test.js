const test = require('node:test');
const assert = require('node:assert/strict');

test('Netlify enruta la API, limita auth y ejecuta Places en segundo plano', async () => {
  const previousJwtSecret = process.env.JWT_SECRET;
  const previousCorsOrigins = process.env.CORS_ORIGINS;
  process.env.JWT_SECRET = 'secreto-de-prueba-seguro-con-mas-de-32-caracteres';
  process.env.CORS_ORIGINS = 'https://app.example';

  try {
    const [api, auth, background] = await Promise.all([
      import('../netlify/functions/api.mjs'),
      import('../netlify/functions/auth.mjs'),
      import('../netlify/functions/refresh-google-places-background.mjs'),
    ]);

    assert.equal(api.config.path, '/api/*');
    assert.equal(api.config.excludedPath, '/api/auth/*');
    assert.equal(api.config.rateLimit.windowLimit, 200);
    assert.equal(auth.config.path, '/api/auth/*');
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
