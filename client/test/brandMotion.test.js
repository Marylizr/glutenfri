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

test('cada beneficio termina de caer y dibujar su check antes del siguiente', () => {
  const css = read('../src/index.css');
  const ms = (name) => Number(css.match(new RegExp(`--${name}: (\\d+)ms`))[1]);
  const start = ms('feature-start');
  const step = ms('feature-step');
  const fall = ms('feature-fall-duration');
  const check = ms('feature-check-duration');
  assert.ok(start > 280 + 620, 'Los titulares terminan antes del primer beneficio');
  assert.ok(step > fall + check, 'El check termina antes de iniciar la siguiente caída');
  assert.match(css, /var\(--feature-index\) \* var\(--feature-step\)/);
  assert.match(css, /calc\(var\(--feature-delay\) \+ var\(--feature-fall-duration\)\)/);
  assert.match(css, /@keyframes onboardingCheckDraw[\s\S]*?from \{ stroke-dashoffset: 1; \}[\s\S]*?to \{ stroke-dashoffset: 0; \}/);
  const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{\s+\.onboarding-screen__copy[\s\S]*?\n\}/)[0];
  assert.match(reduced, /animation: none/);
  assert.match(reduced, /opacity: 1/);
  assert.match(reduced, /stroke-dashoffset: 0/);
});

test('la portada renderiza los tres beneficios y checks SVG decorativos en secuencia', async () => {
  const previousStorage = globalThis.localStorage;
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { default: OnboardingScreen } = await vite.ssrLoadModule('/src/pages/OnboardingScreen.jsx');
    const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/index.jsx');
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(LanguageProvider, null, createElement(OnboardingScreen))));
    for (const index of [0, 1, 2]) assert.match(html, new RegExp(`--feature-index:${index}`));
    assert.equal([...html.matchAll(/class="onboarding-feature__check"/g)].length, 3);
    assert.equal([...html.matchAll(/pathLength="1"/g)].length, 3);
    assert.match(html, /<span aria-hidden="true"><svg class="onboarding-feature__check"/);
    assert.match(html, /class="onboarding-title__lead"/);
    assert.match(html, /class="onboarding-title__accent"/);
    assert.match(html, /Explorar locais/);
  } finally {
    await vite.close();
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
