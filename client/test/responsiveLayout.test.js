import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PUBLIC_NAV_ITEMS } from '../src/config/publicNavigation.js';
import { normalizeEstablishmentPayload } from '../src/utils/trustStatus.js';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('la navegación móvil y desktop comparten destinos y se alternan por CSS', () => {
  assert.deepEqual(
    PUBLIC_NAV_ITEMS.map((item) => item.to),
    ['/', '/mapa', '/guardados', '/reseñas', '/perfil']
  );

  const app = read('../src/App.jsx');
  const mobile = read('../src/components/BottomNav.jsx');
  const desktop = read('../src/components/DesktopHeader.jsx');
  const css = read('../src/index.css');

  assert.match(app, /<DesktopHeader/);
  assert.match(app, /<BottomNav/);
  assert.match(mobile, /PUBLIC_NAV_ITEMS/);
  assert.match(desktop, /PUBLIC_NAV_ITEMS/);
  assert.match(css, /\.desktop-header\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*\.desktop-header\s*\{[\s\S]*display:\s*block/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*\.bottom-nav\s*\{\s*display:\s*none/);
});

test('Explorar presenta los resultados filtrados sin duplicar el mapa', () => {
  const explore = read('../src/pages/ExplorePage.jsx');
  const css = read('../src/index.css');

  assert.match(explore, /filterEstablishments\(establishments/);
  assert.match(explore, /filtered\.map/);
  assert.doesNotMatch(explore, /LazyMapView/);
  assert.match(explore, /<CategoryChips/);
  assert.match(explore, /<ExploreFiltersButton/);
  assert.match(css, /\.explore-results\s*\{[\s\S]*grid-template-columns:\s*repeat\(3/);
  assert.match(css, /grid-auto-rows:\s*max-content/);
  assert.match(css, /\.explore-results \.restaurant-card\s*\{[\s\S]*height:\s*460px/);
});

test('Mapa conserva una única estructura filtrada para marcadores y tarjetas', () => {
  const page = read('../src/pages/HomePage.jsx');

  assert.match(page, /filterEstablishments\(establishments, filters\)/);
  assert.match(page, /<LazyMapView[\s\S]*establishments=\{filtered\}/);
  assert.match(page, /filtered\.map/);
});

test('los 72 establecimientos heredados siguen siendo normalizables', () => {
  const legacy = Array.from({ length: 72 }, (_, index) => ({
    _id: String(index + 1),
    name: `Local ${index + 1}`,
    trustStatus: index % 3 === 0 ? null : 'VERIFIED',
    lat: index % 4 === 0 ? null : 41.5,
    lng: index % 4 === 0 ? null : -8.4,
  }));

  const normalized = normalizeEstablishmentPayload(legacy);
  assert.equal(normalized.length, 72);
  assert.ok(normalized.every((item) => item && item.name));
});

test('la ficha solo presenta acciones respaldadas por datos reales', () => {
  const detail = read('../src/pages/EstablishmentDetailPage.jsx');

  assert.match(detail, /establishment\.phone \|\| establishment\.lat \|\| establishment\.address/);
  assert.match(detail, /establishment\.phone &&/);
  assert.doesNotMatch(detail, /disabled[^=]*=.*(?:menu|reserv)/i);
});

test('las nuevas claves responsive existen en los tres idiomas', () => {
  const translations = read('../src/i18n/index.jsx');
  for (const key of [
    'primaryNavigation',
    'footerDescription',
    'footerExplore',
    'footerLegal',
    'resultsCount',
    'viewDetails',
  ]) {
    const occurrences = translations.match(new RegExp(`\\b${key}:`, 'g')) || [];
    assert.equal(occurrences.length, 3, `${key} debe existir en PT, EN y ES`);
  }
});

test('los controles responsive principales conservan nombres accesibles', () => {
  const desktop = read('../src/components/DesktopHeader.jsx');
  const mobile = read('../src/components/BottomNav.jsx');
  const filters = read('../src/components/ExploreFiltersButton.jsx');
  const map = read('../src/components/MapView.jsx');

  assert.match(desktop, /aria-label=\{t\('primaryNavigation'\)\}/);
  assert.match(mobile, /aria-label=\{t\('primaryNavigation'\)\}/);
  assert.match(filters, /aria-expanded=\{open\}/);
  assert.match(filters, /aria-controls=\{panelId\}/);
  assert.match(map, /type="button"/);
});
