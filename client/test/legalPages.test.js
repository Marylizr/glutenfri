import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { LEGAL_COPY } from '../src/config/legalCopy.js';
import { LEGAL_CONFIG } from '../src/config/legal.js';

test('los textos legales tienen estructura equivalente en PT-PT, ES y EN', () => {
  for (const locale of ['pt-PT', 'es', 'en']) {
    assert.deepEqual(Object.keys(LEGAL_COPY[locale]), Object.keys(LEGAL_COPY['pt-PT']));
    assert.equal(LEGAL_COPY[locale].deletionSteps.length, 3);
    assert.equal(LEGAL_COPY[locale].deletionSections.length, 4);
    assert.equal(LEGAL_COPY[locale].termsSections.length, 6);
  }
});

test('centro jurídico, términos y eliminación renderizan enlaces propios y un contacto manual', async () => {
  const oldStorage = globalThis.localStorage;
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/index.jsx');
    const names = ['LegalHubPage', 'DataDeletionPage', 'TermsPage', 'PrivacyPage', 'ContactPage'];
    const modules = await Promise.all(names
      .map((name) => vite.ssrLoadModule(`/src/pages/${name}.jsx`)));
    for (const locale of ['pt-PT', 'es', 'en']) {
      globalThis.localStorage = { getItem: () => locale, setItem: () => {} };
      for (const [index, { default: Page }] of modules.entries()) {
        const html = renderToStaticMarkup(createElement(MemoryRouter, null,
          createElement(LanguageProvider, null, createElement(Page))));
        for (const path of ['/legal', '/terminos', '/privacidad', '/eliminacion-de-datos', '/contacto']) {
          assert.ok(html.includes(`href="${path}"`), `${locale}: falta ${path}`);
        }
        assert.doesNotMatch(html, /sweatmateapp\.com/);
        assert.match(html, /<article><h1>[^<]+<\/h1><p>[^<]*PixelTrend Studio LLC\.<\/p>/);
        assert.match(html, /class="public-footer__credit"[^>]*>[^<]*PixelTrend Studio LLC\.<\/a>/);
        if (['LegalHubPage', 'DataDeletionPage', 'ContactPage'].includes(names[index])) {
          assert.match(html, /href="mailto:/);
        }
        assert.match(html, /© \d{4} GlutenFri/);
        assert.equal([...html.matchAll(/href="https:\/\/pixeltrendstudio.com\/"/g)].length, 1);
      }
    }
    const source = fs.readFileSync(new URL('../src/pages/DataDeletionPage.jsx', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /deleteMyAccount|fetch\(|axios|onClick/);
    assert.match(source, /to="\/perfil"/);
  } finally {
    await vite.close();
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
  }
});

test('la operadora confirmada no sustituye por inferencia al responsable de datos', () => {
  assert.equal(LEGAL_CONFIG.operatorName, 'PixelTrend Studio LLC');
  assert.equal(LEGAL_CONFIG.developerName, 'PixelTrend Studio');
  assert.equal(LEGAL_CONFIG.detailsNeedFormalConfirmation, true);
  assert.notEqual(LEGAL_CONFIG.operatorName, LEGAL_CONFIG.dataControllerName);
});
