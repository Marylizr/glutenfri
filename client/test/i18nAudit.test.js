import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { ADMIN_COPY } from '../src/admin/adminCopy.js';
import { normalizeLanguage, persistLanguage, readStoredLanguage } from '../src/i18n/language.js';

test('la auditoría reproducible de i18n no detecta huecos ni literales administrativos', () => {
  const output = execFileSync(process.execPath, ['scripts/audit-i18n.mjs'], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });
  const report = JSON.parse(output);
  assert.deepEqual(report.mainCatalogKeys, { 'pt-PT': 140, en: 140, es: 140 });
  assert.equal(report.adminCatalogLeaves['pt-PT'], report.adminCatalogLeaves.en);
  assert.equal(report.adminCatalogLeaves['pt-PT'], report.adminCatalogLeaves.es);
  assert.equal(report.hardcodedAdminCandidates, 0);
  assert.ok(report.localizedModulesChecked >= 10);
  assert.deepEqual(report.failures, []);
});

test('idioma inválido vuelve a PT-PT y las preferencias válidas se conservan', () => {
  assert.equal(normalizeLanguage('fr'), 'pt-PT');
  assert.equal(readStoredLanguage({ getItem: () => 'en' }), 'en');
  assert.equal(readStoredLanguage({ getItem: () => 'es' }), 'es');
  assert.equal(readStoredLanguage({ getItem: () => 'pt' }), 'pt-PT');
});

test('el cambio de idioma persiste y actualiza html lang con fallback seguro', () => {
  const values = new Map();
  const storage = { setItem: (key, value) => values.set(key, value) };
  const documentElement = { lang: '' };
  assert.equal(persistLanguage('en', storage, documentElement), 'en');
  assert.equal(values.get('gf_language'), 'en');
  assert.equal(documentElement.lang, 'en');
  assert.equal(persistLanguage('fr', storage, documentElement), 'pt-PT');
  assert.equal(documentElement.lang, 'pt-PT');
});

test('el catálogo administrativo conserva interpolaciones y terminología PT-PT', () => {
  assert.match(ADMIN_COPY['pt-PT'].establishments.search, /morada/);
  assert.match(ADMIN_COPY['pt-PT'].users.title, /Utilizadores/);
  assert.match(ADMIN_COPY['pt-PT'].dashboard.greeting, /\{name\}/);
  assert.match(ADMIN_COPY.en.dashboard.greeting, /\{name\}/);
  assert.match(ADMIN_COPY.es.dashboard.greeting, /\{name\}/);
});
