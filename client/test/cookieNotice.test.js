import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import { acknowledgeCookieNotice, hasAcknowledgedCookieNotice, COOKIE_NOTICE_KEY } from '../src/utils/cookieNotice.js';

test('el aviso guarda solo el acuse y tolera almacenamiento bloqueado o versiones desconocidas', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  assert.equal(hasAcknowledgedCookieNotice(storage), false);
  storage.setItem(COOKIE_NOTICE_KEY, 'other');
  assert.equal(hasAcknowledgedCookieNotice(storage), false);
  acknowledgeCookieNotice(storage);
  assert.equal(hasAcknowledgedCookieNotice(storage), true);
  assert.deepEqual([...values], [[COOKIE_NOTICE_KEY, 'acknowledged']]);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(hasAcknowledgedCookieNotice(blocked), false);
  assert.doesNotThrow(() => acknowledgeCookieNotice(blocked));
});

test('el aviso aparece en los tres idiomas, con privacidad y sin consentimiento publicitario ficticio', async () => {
  const previousStorage = globalThis.localStorage;
  const previousWindow = globalThis.window;
  const vite = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  try {
    const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/index.jsx');
    const { default: CookieNotice } = await vite.ssrLoadModule('/src/components/CookieNotice.jsx');
    for (const locale of ['pt-PT', 'es', 'en']) {
      globalThis.localStorage = { getItem: () => locale };
      globalThis.window = { localStorage: { getItem: () => null } };
      const render = () => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(LanguageProvider, null, createElement(CookieNotice))));
      const html = render();
      assert.match(html, /aria-labelledby="cookie-notice-title"/);
      assert.match(html, /href="\/privacidad"/);
      assert.match(html, /<button type="button">/);
      assert.doesNotMatch(html, /Aceitar tudo|Accept all|Aceptar todo|cookieTitle|cookieDescription/);
      globalThis.window.localStorage.getItem = () => 'acknowledged';
      assert.equal(render(), '');
    }
  } finally {
    await vite.close();
    if (previousStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = previousStorage;
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  }
});
