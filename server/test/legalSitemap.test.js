const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSitemapXml } = require('../src/utils/sitemap');

test('el sitemap enlaza el centro jurídico y eliminación en el dominio propio', () => {
  const xml = buildSitemapXml([], 'https://glutenfri.test');
  assert.ok(xml.includes('<loc>https://glutenfri.test/legal</loc>'));
  assert.ok(xml.includes('<loc>https://glutenfri.test/eliminacion-de-datos</loc>'));
  assert.ok(!xml.includes('sweatmateapp.com'));
});
