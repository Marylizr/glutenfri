import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  normalizeEstablishmentPayload,
  normalizeEstablishmentRecord,
  TRUST_STATUS,
} from '../src/utils/trustStatus.js';
import { getOpenStatus } from '../src/utils/openingHours.js';
import {
  filterEstablishments,
  parseExploreParams,
  serializeExploreParams,
  sortEstablishments,
  SORT_OPTIONS,
} from '../src/utils/establishmentFilters.js';
import { getCanonicalPlaceUrl, sharePlace } from '../src/utils/share.js';
import { buildPlaceStructuredData } from '../src/utils/seo.js';
import {
  COMMUNITY_STATE,
  getBooleanCommunityState,
  getRiskCommunityState,
} from '../src/utils/communitySignals.js';

test('la normalización aditiva descarta acciones y datos prácticos inválidos', () => {
  const record = normalizeEstablishmentRecord({
    _id: 'place',
    name: 'Lugar',
    lat: 200,
    lng: -8.4,
    phone: 'no disponible',
    menuUrl: 'javascript:alert(1)',
    reservationUrl: 'https://example.test/reserve',
    weeklyHours: { mon: [{ start: '09:00', end: '18:00' }, { start: 'mañana', end: 'tarde' }] },
    timezone: 'Europe/Lisbon',
    serviceLanguages: ['Português', null, ''],
  });

  assert.equal(record.lat, null);
  assert.equal(record.lng, -8.4);
  assert.equal(record.phone, null);
  assert.equal(record.menuUrl, null);
  assert.match(record.reservationUrl, /^https:/);
  assert.deepEqual(record.weeklyHours.mon, [{ start: '09:00', end: '18:00' }]);
  assert.deepEqual(record.serviceLanguages, ['Português']);
});

test('las señales comunitarias conservan afirmativo, negativo y no reportado', () => {
  assert.equal(getBooleanCommunityState(true), COMMUNITY_STATE.YES);
  assert.equal(getBooleanCommunityState(false), COMMUNITY_STATE.NO);
  assert.equal(getBooleanCommunityState(null), COMMUNITY_STATE.UNREPORTED);
  assert.equal(getBooleanCommunityState(undefined), COMMUNITY_STATE.UNREPORTED);
  assert.equal(getBooleanCommunityState('false'), COMMUNITY_STATE.UNREPORTED);

  const normalized = normalizeEstablishmentRecord({
    dedicatedKitchen: true,
    dedicatedGlutenFreeMenu: false,
  });
  assert.equal(normalized.dedicatedKitchen, true);
  assert.equal(normalized.dedicatedGlutenFreeMenu, false);
  assert.equal(normalized.staffTrained, null);
});

test('el riesgo comunitario distingue los niveles reales y neutraliza desconocidos', () => {
  assert.equal(getRiskCommunityState('none'), COMMUNITY_STATE.RISK_NONE);
  assert.equal(getRiskCommunityState('low'), COMMUNITY_STATE.RISK_LOW);
  assert.equal(getRiskCommunityState('moderate'), COMMUNITY_STATE.RISK_MODERATE);
  assert.equal(getRiskCommunityState('high'), COMMUNITY_STATE.RISK_HIGH);
  assert.equal(getRiskCommunityState(null), COMMUNITY_STATE.UNREPORTED);
  assert.equal(getRiskCommunityState('internal-unknown'), COMMUNITY_STATE.UNREPORTED);
});

test('la sección comunitaria usa texto, estados accesibles e iconos lineales sin cruces ni emojis', () => {
  const detail = fs.readFileSync(
    new URL('../src/pages/EstablishmentDetailPage.jsx', import.meta.url),
    'utf8'
  );
  const styles = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  for (const icon of ['dining', 'menu_book_2', 'chef_hat', 'warning']) {
    assert.match(detail, new RegExp(`icon: '${icon}'`));
    assert.match(html, new RegExp(icon));
  }
  for (const text of [
    'O que a comunidade partilhou',
    'Lo que compartió la comunidad',
    'What the community shared',
    'Não reportado',
    'No reportado',
    'Not reported',
  ]) {
    assert.match(detail, new RegExp(text));
  }
  assert.match(detail, /<section className="community-signals"/);
  assert.match(detail, /<dl className="community-signals__list"/);
  assert.match(detail, /aria-hidden="true"/);
  assert.doesNotMatch(detail, /🍳|📋|🎓|⚠️|✕/);
  assert.match(styles, /\.community-signal__status\.is-yes/);
  assert.match(styles, /\.community-signal__status\.is-unreported/);
  assert.match(styles, /\.community-signal__status\.is-risk-high/);
  assert.doesNotMatch(
    detail.slice(detail.indexOf('function CommunityExperienceSignals'), detail.indexOf('function ReviewItem')),
    /certificad|certif/i
  );
});

test('abierto ahora distingue intervalos normales, días cerrados y cruce de medianoche', () => {
  const place = {
    timezone: 'UTC',
    weeklyHours: {
      mon: [{ start: '09:00', end: '18:00' }],
      tue: [],
      fri: [{ start: '22:00', end: '02:00' }],
    },
  };
  assert.equal(getOpenStatus(place, new Date('2024-01-01T10:00:00Z')).status, 'open');
  assert.equal(getOpenStatus(place, new Date('2024-01-02T10:00:00Z')).status, 'closed');
  assert.equal(getOpenStatus(place, new Date('2024-01-06T01:00:00Z')).status, 'open');
  assert.equal(getOpenStatus({ weeklyHours: place.weeklyHours }, new Date()).status, 'unavailable');
});

test('filtros combinados, orden estable y query parameters usan códigos internos', () => {
  const places = [
    { _id: 'a', name: 'A', type: 'restaurant', trustStatus: TRUST_STATUS.PENDING_VALIDATION, delivery: true, lat: 41, lng: -8 },
    { _id: 'b', name: 'B', type: 'bakery', trustStatus: TRUST_STATUS.CERTIFIED_APC_BIOTRAB, sourceName: 'APC', sourceUrl: 'https://apc.test', delivery: true, lat: 42, lng: -8 },
    { _id: 'c', name: 'C', type: 'bakery', trustStatus: TRUST_STATUS.CERTIFIED_APC_BIOTRAB, sourceName: 'APC', sourceUrl: 'https://apc.test', delivery: false },
  ];
  const matches = filterEstablishments(places, { certifiedOnly: true, deliveryOnly: true });
  assert.deepEqual(matches.map(({ _id }) => _id), ['b']);
  assert.deepEqual(
    sortEstablishments(places, SORT_OPTIONS.CERTIFICATION).map(({ _id }) => _id),
    ['b', 'c', 'a']
  );
  assert.deepEqual(
    sortEstablishments(places, SORT_OPTIONS.DISTANCE, { lat: 41, lng: -8 }).map(({ _id }) => _id),
    ['a', 'b', 'c']
  );

  const state = parseExploreParams(new URLSearchParams('categoria=bakery&certificado=true&orden=certification&desconocido=x'));
  assert.equal(state.type, 'bakery');
  assert.equal(state.certifiedOnly, true);
  assert.equal(state.sort, SORT_OPTIONS.CERTIFICATION);
  assert.equal(serializeExploreParams(state).get('categoria'), 'bakery');
  assert.equal(parseExploreParams(new URLSearchParams('categoria=traducida&orden=mal')).type, undefined);
});

test('compartir usa URL canónica y copia como fallback', async () => {
  let copied = '';
  const environment = {
    location: { origin: 'https://glutenfri.example' },
    navigator: { clipboard: { writeText: async (value) => { copied = value; } } },
    document: {},
  };
  const result = await sharePlace({ id: 'abc 123', name: 'Lugar', text: 'Texto' }, environment);
  assert.equal(result.method, 'copy');
  assert.equal(result.url, 'https://glutenfri.example/lugar/abc%20123');
  assert.equal(copied, result.url);
  assert.equal(getCanonicalPlaceUrl('id', 'https://glutenfri.example/'), 'https://glutenfri.example/lugar/id');
});

test('JSON-LD solo incorpora propiedades respaldadas por datos reales', () => {
  const minimal = buildPlaceStructuredData(
    { name: 'Lugar', type: 'bakery', phone: null, avgRating: 5 },
    'https://glutenfri.example/lugar/id'
  );
  assert.equal(minimal['@type'], 'Bakery');
  assert.equal('telephone' in minimal, false);
  assert.equal('aggregateRating' in minimal, false);
  assert.equal('openingHours' in minimal, false);
});

test('los 72 establecimientos heredados reales siguen siendo procesables', () => {
  const legacy = JSON.parse(
    fs.readFileSync(new URL('../../server/data/merged_dataset.json', import.meta.url), 'utf8')
  );
  assert.equal(legacy.total_establishments, 72);
  assert.equal(legacy.establishments.length, 72);
  assert.equal(normalizeEstablishmentPayload(legacy.establishments).length, 72);
});

test('manifest, service worker y sitemap mantienen contratos seguros', () => {
  const manifest = JSON.parse(
    fs.readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8')
  );
  const worker = fs.readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
  const sitemap = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert.equal(manifest.start_url, '/explorar');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
  assert.ok(worker.includes("url.pathname.startsWith('/api/')"));
  assert.match(worker, /request\.mode === 'navigate'/);
  assert.doesNotMatch(sitemap, /undefined|null|Invalid Date/);
  assert.ok(sitemap.includes('https://glutenfri.netlify.app/explorar'));
});

test('todo texto funcional nuevo existe en PT, EN y ES', () => {
  const translations = fs.readFileSync(
    new URL('../src/i18n/index.jsx', import.meta.url),
    'utf8'
  );
  for (const key of [
    'sortBy',
    'useMyLocation',
    'sharePlace',
    'reportInformation',
    'openNow',
    'offlineNotice',
    'mapUnavailable',
    'certificationBody',
  ]) {
    assert.equal(
      translations.match(new RegExp(`\\b${key}:`, 'g'))?.length,
      3,
      `${key} debe existir en tres idiomas`
    );
  }
});
