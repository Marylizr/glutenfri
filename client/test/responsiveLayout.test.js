import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PUBLIC_NAV_ITEMS } from '../src/config/publicNavigation.js';
import { normalizeEstablishmentPayload } from '../src/utils/trustStatus.js';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('el header global está presente en todas las rutas y la navegación se adapta por CSS', () => {
  assert.deepEqual(
    PUBLIC_NAV_ITEMS.map((item) => item.to),
    ['/explorar', '/mapa', '/guardados', '/reseñas', '/perfil']
  );

  const app = read('../src/App.jsx');
  const mobile = read('../src/components/BottomNav.jsx');
  const desktop = read('../src/components/DesktopHeader.jsx');
  const css = read('../src/index.css');

  assert.match(app, /<DesktopHeader \/>/);
  assert.doesNotMatch(app, /\{[^}]*<DesktopHeader/);
  assert.match(app, /<BottomNav/);
  assert.match(mobile, /PUBLIC_NAV_ITEMS/);
  assert.match(desktop, /PUBLIC_NAV_ITEMS/);
  assert.match(css, /\.desktop-header\s*\{[^}]*display:\s*block/);
  assert.match(css, /\.desktop-header\s*\{[^}]*overflow:\s*hidden/);
  assert.match(
    css,
    /\.desktop-header \.brand-logo--desktop-header\s*\{[^}]*max-width:\s*104px[^}]*max-height:\s*48px/,
  );
  assert.match(css, /\.desktop-header__nav\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*\.desktop-header\s*\{[\s\S]*display:\s*block/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*\.desktop-header__nav\s*\{[\s\S]*display:\s*flex/);
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
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax/);
  assert.match(css, /grid-auto-rows:\s*max-content/);
  assert.match(css, /\.explore-results \.restaurant-card\s*\{[\s\S]*height:\s*auto/);
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

test('la ficha conserva la barra inferior original y solo la muestra con datos accionables', () => {
  const detail = read('../src/pages/EstablishmentDetailPage.jsx');

  assert.match(detail, /establishment\.phone \|\| establishment\.lat \|\| establishment\.address/);
  assert.match(detail, /className="establishment-detail__actions"/);
  assert.match(detail, /handleDirections/);
  assert.match(detail, /copy\.directions/);
  assert.match(detail, /establishment\.phone &&/);
  assert.match(detail, /copy\.call/);
  assert.doesNotMatch(detail, /establishment-detail__primary-actions/);
});

test('las nuevas claves responsive existen en los tres idiomas', () => {
  const translations = read('../src/i18n/index.jsx');
  for (const key of [
    'primaryNavigation',
    'footerDescription',
    'footerExplore',
    'footerLegal',
    'resultsCount_one',
    'resultsCount_other',
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
  assert.match(map, /alt=\{t\([\s\S]*mapMarkerLabel/);
  assert.match(map, /keyboard/);
});

test('Explorar y el detalle tienen rutas estables independientes del onboarding', () => {
  const app = read('../src/App.jsx');
  const detailRoute = read('../src/pages/EstablishmentDetailRoute.jsx');
  const navigation = read('../src/config/publicNavigation.js');

  assert.match(app, /path="[/]explorar"/);
  assert.match(app, /path="[/]lugar[/]:id"/);
  assert.ok(app.includes("onStart={() => navigate('/explorar')}"));
  assert.doesNotMatch(app, /!onboarded && isPublicEntry/);
  assert.ok(detailRoute.includes("navigate('/explorar', { replace: true })"));
  assert.ok(navigation.includes("to: '/explorar'"));
});

test('el header global reserva safe area y el hero no duplica su altura', () => {
  const css = read('../src/index.css');
  const tokens = read('../src/styles/tokens.css');

  assert.match(tokens, /--app-header-height-mobile:\s*4\.5rem/);
  assert.match(tokens, /--app-header-height-desktop:/);
  assert.match(css, /flex:\s*0 0 calc\(var\(--app-header-height\) \+ env\(safe-area-inset-top, 0px\)\)/);
  assert.match(css, /\.establishment-detail__hero\s*\{[^}]*isolation:\s*isolate/);
  assert.doesNotMatch(
    css,
    /\.establishment-detail__hero\s*\{[^}]*padding-top:\s*calc\([^}]*app-header-height-mobile/,
  );
});

test('la reseña permite iniciar sesión en el último paso sin abandonar el borrador', () => {
  const flow = read('../src/components/SafetyReviewFlow.jsx');
  const detail = read('../src/pages/EstablishmentDetailPage.jsx');

  assert.match(flow, /className="review-inline-login"/);
  assert.match(flow, /loginUser\(\{ email, password \}\)/);
  assert.match(flow, /auth\.setSession\(session\)/);
  assert.match(flow, /await publishReview\(\)/);
  assert.match(flow, /autoComplete="current-password"/);
  assert.match(detail, /auth=\{auth\}/);
});

test('Guardados coloca un footer compacto después del main sin estirar el estado vacío', () => {
  const saved = read('../src/pages/SavedPage.jsx');
  const loginState = read('../src/components/LoginRequiredState.jsx');
  const footer = read('../src/components/PublicFooter.jsx');
  const css = read('../src/index.css');

  assert.ok(saved.indexOf('</main>') < saved.indexOf('<PublicFooter />'));
  assert.match(saved, /className="saved-page__scroll"/);
  assert.match(saved, /<main className="saved-page__results">/);
  assert.doesNotMatch(loginState, /height:\s*'100%'/);
  assert.match(css, /\.saved-page__scroll\s*\{[^}]*overflow-y:\s*auto/);
  assert.match(css, /\.saved-page__results\s*\{[^}]*flex:\s*1 0 auto/);
  assert.match(css, /\.public-footer\s*\{[^}]*height:\s*auto[^}]*min-height:\s*0/);
  assert.doesNotMatch(css, /\.public-footer\s*\{[^}]*(?:100vh|100dvh)/);
  assert.match(
    css,
    /\.public-footer__inner\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column[^}]*justify-content:\s*flex-start/,
  );
  assert.match(
    css,
    /\.public-footer__navigation\s*\{[^}]*grid-template-columns:\s*repeat\(2[^}]*grid-auto-rows:\s*max-content/,
  );
  assert.doesNotMatch(
    css,
    /\.public-footer(?:__inner|__brand|__navigation)?\s*\{[^}]*(?:flex-grow:\s*1|flex:\s*1|height:\s*100%|margin-top:\s*auto|space-between)/,
  );
  assert.ok(footer.indexOf('<BrandLogo') < footer.indexOf("t('footerDescription')"));
  assert.ok(footer.indexOf("t('footerDescription')") < footer.indexOf('public-footer__navigation'));
  assert.ok(footer.indexOf('public-footer__navigation') < footer.indexOf('public-footer__bottom'));
  assert.match(footer, /<nav aria-label=\{t\('footerExplore'\)\}>/);
  assert.match(footer, /<nav aria-label=\{t\('footerLegal'\)\}>/);
  assert.match(css, /\.public-footer nav a\s*\{[^}]*min-height:\s*44px/);
  assert.match(
    css,
    /@media \(min-width: 768px\)[\s\S]*\.public-footer__inner\s*\{[^}]*display:\s*grid/,
  );
});

test('la barra móvil reserva su altura y safe area fuera del flujo del footer', () => {
  const app = read('../src/App.jsx');
  const footer = read('../src/components/PublicFooter.jsx');
  const tokens = read('../src/styles/tokens.css');
  const css = read('../src/index.css');

  assert.match(tokens, /--bottom-nav-height-mobile:\s*4rem/);
  assert.match(
    css,
    /\.bottom-nav\s*\{[^}]*flex:\s*0 0 calc\([^}]*bottom-nav-height-mobile[^}]*safe-area-inset-bottom/,
  );
  assert.match(css, /\.bottom-nav\s*\{[^}]*min-height:\s*calc\([^}]*safe-area-inset-bottom/);
  assert.match(
    css,
    /\.public-footer\s*\{[^}]*padding:[^}]*bottom-nav-height-mobile[^}]*safe-area-inset-bottom/,
  );
  assert.doesNotMatch(footer, /BottomNav|bottom-nav/);
  assert.ok(app.indexOf('<div className="app-shell__content">') < app.indexOf('<BottomNav />'));
  assert.match(css, /\.saved-page__scroll\s*\{[^}]*overflow-x:\s*hidden/);
  assert.match(css, /@media \(min-width: 768px\)[\s\S]*\.bottom-nav\s*\{\s*display:\s*none/);
});

test('el footer acredita una sola vez a PixelTrend Studio con enlace externo seguro', () => {
  const footer = read('../src/components/PublicFooter.jsx');

  assert.equal(footer.match(/https:\/\/pixeltrendstudio\.com\//g)?.length, 1);
  assert.equal(footer.match(/PixelTrend Studio/g)?.length, 1);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noopener noreferrer"/);
});
