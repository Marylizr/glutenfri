import test from 'node:test';
import assert from 'node:assert/strict';
import { handleNativeBack } from '../src/native/back.js';
import { downloadAccountExport } from '../src/native/exportData.js';

function environment({ pathname = '/explorar', historyIndex = 0, dialog = false, consumeEscape = false } = {}) {
  const actions = [];
  return {
    actions, pathname, historyIndex,
    document: {
      querySelector: () => dialog ? {} : null,
      dispatchEvent: event => { if (consumeEscape) event.preventDefault(); },
    },
    makeEscape: () => new Event('keydown', { cancelable: true }),
    navigate: (...args) => actions.push(['navigate', ...args]),
    minimize: async () => actions.push(['minimize']),
  };
}

test('Atrás consume el cierre de filtros antes de minimizar o navegar', () => {
  for (const pathname of ['/explorar', '/mapa']) {
    const env = environment({ pathname, historyIndex: 3, consumeEscape: true });
    handleNativeBack(env);
    assert.deepEqual(env.actions, []);
  }
});

test('Atrás no abandona una confirmación modal, incluso si está ocupada', () => {
  const env = environment({ pathname: '/perfil', historyIndex: 3, dialog: true });
  handleNativeBack(env);
  assert.deepEqual(env.actions, []);
});

test('Atrás minimiza solo desde inicio y vuelve por historial desde un detalle', () => {
  const home = environment();
  handleNativeBack(home);
  assert.deepEqual(home.actions, [['minimize']]);
  const detail = environment({ pathname: '/lugar/qa', historyIndex: 1 });
  handleNativeBack(detail);
  assert.deepEqual(detail.actions, [['navigate', -1]]);
  const cold = environment({ pathname: '/perfil' });
  handleNativeBack(cold);
  assert.deepEqual(cold.actions, [['navigate', '/explorar', { replace: true }]]);
});

for (const outcome of ['success', 'cancel', 'failure']) {
  test(`exportación nativa borra el archivo temporal tras ${outcome}`, async () => {
    const calls = [];
    const run = () => downloadAccountExport({ name: 'QA synthetic' }, {
      native: true, now: () => new Date('2026-11-24T00:00:00Z'),
      loadFilesystem: async () => ({ Directory: { Cache: 'CACHE' }, Encoding: { UTF8: 'utf8' }, Filesystem: {
        writeFile: async options => { calls.push(['write', options]); return { uri: 'file:///private/qa.json' }; },
        deleteFile: async options => calls.push(['delete', options]),
      } }),
      loadShare: async () => ({ Share: { share: async options => {
        calls.push(['share', options]);
        if (outcome !== 'success') throw new Error(outcome === 'cancel' ? 'Share canceled' : 'native_failure');
      } } }),
    });
    if (outcome === 'failure') await assert.rejects(run, /native_failure/);
    else await run();
    assert.deepEqual(calls.map(item => item[0]), ['write', 'share', 'delete']);
    assert.equal(calls[0][1].directory, 'CACHE');
    assert.equal(calls[0][1].encoding, 'utf8');
    assert.deepEqual(calls[1][1], { files: ['file:///private/qa.json'] });
    assert.equal(calls[2][1].path, calls[0][1].path);
    assert.equal(calls[2][1].directory, 'CACHE');
  });
}
