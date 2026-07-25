import test from 'node:test';
import assert from 'node:assert/strict';
import { createEstablishmentsLoader } from '../src/services/establishmentsLoader.js';
import {
  getMappableEstablishments,
  normalizeEstablishmentPayload,
  TRUST_STATUS,
} from '../src/utils/trustStatus.js';
import {
  classifyEstablishmentError,
  createRequestGate,
} from '../src/utils/requestState.js';
import {
  filterEstablishments,
  getAdvancedFilterCount,
} from '../src/utils/establishmentFilters.js';

const complete = {
  _id: '1',
  name: 'Local certificado',
  trustStatus: TRUST_STATUS.CERTIFIED_APC_BIOTRAB,
  sourceName: 'APC',
  sourceUrl: 'https://example.test/source',
  lastVerifiedAt: '2026-07-01T00:00:00.000Z',
};

test('acepta un array directo y el wrapper paginado real', () => {
  assert.equal(normalizeEstablishmentPayload([complete]).length, 1);
  assert.equal(normalizeEstablishmentPayload({ data: [complete], page: 1, total: 1 }).length, 1);
  assert.deepEqual(normalizeEstablishmentPayload({ data: [] }), []);
});

test('normaliza registros completos, heredados, nulos y desconocidos', () => {
  const [certified, legacy, nullable, unknown] = normalizeEstablishmentPayload({
    data: [
      complete,
      { _id: '2', name: 'Legado APC', certified: true, source: 'APC' },
      { _id: '3', name: 'Sin metadatos', trustStatus: null },
      { _id: '4', name: 'Estado antiguo', trustStatus: 'VERIFIED' },
      null,
    ],
  });

  assert.equal(certified.trustStatus, TRUST_STATUS.CERTIFIED_APC_BIOTRAB);
  assert.equal(legacy.trustStatus, TRUST_STATUS.CERTIFIED_APC_BIOTRAB);
  assert.equal(nullable.trustStatus, TRUST_STATUS.PENDING_VALIDATION);
  assert.equal(unknown.trustStatus, TRUST_STATUS.PENDING_VALIDATION);
  assert.equal(nullable.sourceName, null);
  assert.equal(nullable.sourceUrl, null);
  assert.equal(nullable.lastVerifiedAt, null);
});

test('una certificación nueva sin fuente comprobable cae en pendiente', () => {
  const [record] = normalizeEstablishmentPayload([
    {
      trustStatus: TRUST_STATUS.CERTIFIED_APC_BIOTRAB,
      sourceName: 'Texto sin enlace',
      sourceUrl: null,
    },
  ]);
  assert.equal(record.trustStatus, TRUST_STATUS.PENDING_VALIDATION);
});

test('deduplica solicitudes simultáneas de StrictMode', async () => {
  let calls = 0;
  let resolveRequest;
  const loader = createEstablishmentsLoader(() => {
    calls += 1;
    return new Promise((resolve) => {
      resolveRequest = resolve;
    });
  });

  const first = loader();
  const second = loader();
  assert.equal(first, second);
  assert.equal(calls, 1);
  resolveRequest({ data: [complete] });
  assert.equal((await second).length, 1);
});

test('distingue cancelación, HTTP, respuesta inválida y red', () => {
  assert.equal(classifyEstablishmentError({ code: 'ERR_CANCELED' }), 'cancelled');
  assert.equal(classifyEstablishmentError({ response: { status: 503 } }), 'http');
  assert.equal(classifyEstablishmentError(new TypeError('payload inválido')), 'invalid');
  assert.equal(classifyEstablishmentError(new Error('Network Error')), 'network');
});

test('una respuesta anterior no puede sobrescribir la solicitud vigente', () => {
  const gate = createRequestGate();
  const older = gate.next();
  const current = gate.next();
  assert.equal(gate.isCurrent(older), false);
  assert.equal(gate.isCurrent(current), true);
  gate.invalidate();
  assert.equal(gate.isCurrent(current), false);
});

test('los marcadores ignoran registros o coordenadas defectuosas sin lanzar excepciones', () => {
  const result = getMappableEstablishments([
    null,
    { name: 'Sin coordenadas' },
    { name: 'Inválido', lat: 'norte', lng: -8.6 },
    { name: 'Válido heredado', lat: '41.55', lng: '-8.42', trustStatus: null },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Válido heredado');
});

test('el filtro certificado excluye pendientes, comunitarios y falsos certificados heredados', () => {
  const result = filterEstablishments(
    [
      complete,
      { name: 'APC heredado', certified: true, source: 'APC' },
      { name: 'Google no basta', certified: true, source: 'Google' },
      { name: 'Comunidad', trustStatus: TRUST_STATUS.COMMUNITY_REPORTED },
      { name: 'Pendiente', trustStatus: null },
    ],
    { certifiedOnly: true }
  );

  assert.deepEqual(result.map((item) => item.name), ['Local certificado', 'APC heredado']);
});

test('el filtro certificado se combina con categoría y búsqueda', () => {
  const result = filterEstablishments(
    [
      { ...complete, name: 'Pastelaria Porto', type: 'bakery' },
      { ...complete, _id: '2', name: 'Restaurante Porto', type: 'restaurant' },
      { ...complete, _id: '3', name: 'Pastelaria Braga', type: 'bakery' },
    ],
    { certifiedOnly: true, type: 'bakery', query: 'porto', language: 'pt-PT' }
  );
  assert.deepEqual(result.map((item) => item.name), ['Pastelaria Porto']);
});

test('Explorar usa el botón instant_mix para abrir tipo y certificación', async () => {
  const fs = await import('node:fs');
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const button = fs.readFileSync(
    new URL('../src/components/ExploreFiltersButton.jsx', import.meta.url),
    'utf8'
  );
  const page = fs.readFileSync(new URL('../src/pages/ExplorePage.jsx', import.meta.url), 'utf8');

  assert.match(html, /icon_names=[^"]*instant_mix/);
  assert.match(button, />instant_mix</);
  assert.match(button, /certificationFilter/);
  assert.doesNotMatch(button, /filterOptions|placeType|<select/);
  assert.match(button, /aria-expanded/);
  assert.match(button, /aria-controls/);
  assert.match(button, /event\.key === 'Escape'/);
  assert.match(button, /contains\(event\.target\)/);
  assert.match(page, /ExploreFiltersButton/);
});

test('el contador avanzado ignora la categoría y cuenta solo certificación', () => {
  assert.equal(getAdvancedFilterCount({ certifiedOnly: false, type: 'restaurant' }), 0);
  assert.equal(getAdvancedFilterCount({ certifiedOnly: true, type: 'restaurant' }), 1);
});

test('una tarjeta heredada se renderiza con estado y fallbacks sin excepción', async () => {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { MemoryRouter } = await import('react-router-dom');
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  try {
    const { LanguageProvider } = await vite.ssrLoadModule('/src/i18n/index.jsx');
    const { default: RestaurantCard } = await vite.ssrLoadModule('/src/components/RestaurantCard.jsx');
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          LanguageProvider,
          null,
          React.createElement(RestaurantCard, {
            establishment: {
              _id: 'legacy',
              name: 'Restaurante legado',
              type: 'restaurant',
              trustStatus: null,
              sourceName: null,
              sourceUrl: null,
              lastVerifiedAt: null,
            },
          })
        )
      )
    );

    assert.match(html, /Restaurante legado/);
    assert.match(html, /Informação pendente de validação/);
    assert.match(html, /Fonte não indicada/);
    assert.match(html, /Data de verificação indisponível/);
    assert.match(html, /restaurant\.jpg/);
  } finally {
    await vite.close();
  }
});

test('las imágenes fallback se asignan por categoría y supermercado usa la general', async () => {
  const fs = await import('node:fs');
  const source = fs.readFileSync(
    new URL('../src/assets/fallbackImages.js', import.meta.url),
    'utf8'
  );
  const component = fs.readFileSync(
    new URL('../src/components/PhotoPlaceholder.jsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /restaurant:\s*restaurantFallback/);
  assert.match(source, /bakery:\s*bakeryFallback/);
  assert.match(source, /store:\s*storeFallback/);
  assert.match(source, /pharmacy:\s*pharmacyFallback/);
  assert.match(source, /supermarket:\s*generalFallback/);
  assert.match(source, /default:\s*generalFallback/);
  assert.match(component, /onError=\{\(\) => setFallbackFailed\(true\)\}/);
});
