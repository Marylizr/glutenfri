const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSitemapXml } = require('../src/utils/sitemap');

test('el sitemap incluye rutas reales y fichas estables sin propiedades inventadas', () => {
  const xml = buildSitemapXml(
    [{ _id: 'abc123', updatedAt: new Date('2026-07-01T00:00:00Z') }],
    'https://glutenfri.example/'
  );
  assert.match(xml, /https:\/\/glutenfri\.example\/explorar/);
  assert.match(xml, /https:\/\/glutenfri\.example\/lugar\/abc123/);
  assert.match(xml, /2026-07-01T00:00:00\.000Z/);
  assert.doesNotMatch(xml, /undefined|null|rating|openingHours/);
});
