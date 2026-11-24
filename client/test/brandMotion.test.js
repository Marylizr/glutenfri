import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { MemoryRouter } from 'react-router-dom';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('Roboto usa cuerpo normal y titulares semibold también en administración', () => {
  const tokens = read('../src/styles/tokens.css');
  const css = read('../src/index.css');
  const admin = read('../src/admin/admin.css');
  const html = read('../index.html');
  assert.match(tokens, /--font-display: 'Roboto'/);
  assert.match(tokens, /--font-body: 'Roboto'/);
  assert.match(css, /font-family: var\(--font-body\);\s+font-weight: 400/);
  assert.match(css, /h1, h2, h3, h4, h5, h6 \{\s+font-family: var\(--font-display\);\s+font-weight: 600/);
  assert.match(admin, /font-family: var\(--font-body\)/);
  assert.match(css, /\.app-shell \.leaflet-container \{\s+font-family: var\(--font-body\)/);
  assert.doesNotMatch(tokens + css + admin + html, /Fraunces|Georgia|font-family: Inter/);
  assert.match(html, /family=Roboto:wght@400;600;700;800&display=swap/);
  assert.match(tokens, /--color-brand: #7d2e1b/i);
  assert.match(admin, /--admin-orange: var\(--color-brand\)/);
});

test('el titular conserva su entrada escalonada y respeta movimiento reducido', () => {
  const css = read('../src/index.css');
  assert.match(css, /animation: onboardingTitleIn 620ms/);
  assert.match(css, /animation-delay: 80ms/);
  assert.match(css, /animation-delay: 280ms/);
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{\s+\.onboarding-screen__copy[\s\S]*?\n\}/)[0];
  assert.match(reduced, /animation: none/);
  assert.match(reduced, /opacity: 1/);
});

test('la intro muestra solo titular corto, ilustración y explorar, sin pie ni textos secundarios', async () => {
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { default: OnboardingScreen } = await vite.ssrLoadModule('/src/pages/OnboardingScreen.jsx');
    const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/index.jsx');
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(LanguageProvider, null, createElement(OnboardingScreen))));
    assert.doesNotMatch(html, /onboarding-feature|onboarding-screen__description|public-footer|onboarding-login/);
    assert.match(html, /class="gf-burger-badge"/);
    assert.match(html, /Informação sobre opções sem glúten/);
    assert.match(html, /Encontra locais<\/span>/);
    assert.match(html, /class="onboarding-title__lead"/);
    assert.match(html, /class="onboarding-title__accent"/);
    assert.match(html, /Explorar locais/);
    const { default: LanguageSelector } = await vite.ssrLoadModule('/src/components/LanguageSelector.jsx');
    const selector = renderToStaticMarkup(createElement(LanguageProvider, null, createElement(LanguageSelector)));
    assert.match(selector, /aria-label="Idioma" title="Português"/);
    assert.match(selector, /aria-label="Português" selected="">PT<\/option>/);
    assert.match(selector, /aria-label="Español">ES<\/option>/);
    assert.match(selector, /aria-label="English">EN<\/option>/);
  } finally {
    await vite.close();
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
