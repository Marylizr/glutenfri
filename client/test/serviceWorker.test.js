import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

function worker({ fetch, caches }) {
  const listeners = {};
  vm.runInNewContext(source, {
    self: { location: { origin: 'https://example.test' }, clients: { claim: async () => {} },
      addEventListener: (name, callback) => { listeners[name] = callback; } },
    URL, fetch, caches,
  });
  return listeners;
}

test('offline conserva el recurso cacheado sin rechazos sin gestionar', async () => {
  const cached = new Response('cached script');
  const pending = [];
  let response;
  const listeners = worker({
    fetch: async () => { throw new Error('offline'); },
    caches: { match: async () => cached },
  });
  listeners.fetch({
    request: { method: 'GET', url: 'https://example.test/assets/app.js', destination: 'script' },
    respondWith: (promise) => { response = promise; },
    waitUntil: (promise) => { pending.push(promise); },
  });
  assert.equal(await (await response).text(), 'cached script');
  await Promise.all(pending);
});

test('una navegación fallida no reemplaza el shell válido guardado', async () => {
  let writes = 0;
  const pending = [];
  let response;
  const listeners = worker({
    fetch: async () => new Response('gateway error', { status: 502 }),
    caches: { open: async () => ({ put: async () => { writes++; } }) },
  });
  listeners.fetch({
    request: { method: 'GET', url: 'https://example.test/explorar', mode: 'navigate' },
    respondWith: (promise) => { response = promise; },
    waitUntil: (promise) => { pending.push(promise); },
  });
  assert.equal((await response).status, 502);
  await Promise.all(pending);
  assert.equal(writes, 0);
});

test('activar el worker solo elimina sus propias caches obsoletas', async () => {
  const removed = [];
  let completion;
  const listeners = worker({ caches: {
    keys: async () => ['glutenfri-shell-v1', 'glutenfri-shell-v2', 'another-app-cache'],
    delete: async (key) => { removed.push(key); },
  } });
  listeners.activate({ waitUntil: (promise) => { completion = promise; } });
  await completion;
  assert.deepEqual(removed, ['glutenfri-shell-v1']);
});
