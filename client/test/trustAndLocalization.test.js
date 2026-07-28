import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readStoredLanguage } from '../src/i18n/language.js';
import { TRUST_STATUS, normalizeTrustStatus } from '../src/utils/trustStatus.js';

test('portugués de Portugal es el idioma inicial', () => {
  assert.equal(readStoredLanguage({ getItem: () => null }), 'pt-PT');
});

test('se conserva una preferencia compatible de inglés o español', () => {
  assert.equal(readStoredLanguage({ getItem: () => 'en' }), 'en');
  assert.equal(readStoredLanguage({ getItem: () => 'es' }), 'es');
  assert.equal(readStoredLanguage({ getItem: () => 'pt' }), 'pt-PT');
});

test('los estados desconocidos y legacy sin evidencia caen de forma segura', () => {
  assert.equal(normalizeTrustStatus({ trustStatus: 'VERIFIED' }), TRUST_STATUS.PENDING_VALIDATION);
  assert.equal(
    normalizeTrustStatus({ certified: true, source: 'Google' }),
    TRUST_STATUS.PENDING_VALIDATION
  );
  assert.equal(
    normalizeTrustStatus({ certified: true, source: 'APC' }),
    TRUST_STATUS.CERTIFIED_APC_BIOTRAB
  );
});

test('las tres traducciones públicas de confianza están presentes', () => {
  const source = fs.readFileSync(new URL('../src/i18n/index.jsx', import.meta.url), 'utf8');
  assert.match(source, /Certificado APC\/Biotrab/);
  assert.match(source, /APC\/Biotrab certified/);
  assert.match(source, /Reportado pela comunidade — não certificado/);
  assert.match(source, /Information pending validation/);
  assert.match(source, /Información pendiente de validación/);
});

test('las rutas públicas, el disclaimer y los fallbacks visuales están conectados', () => {
  const app = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const footer = fs.readFileSync(new URL('../src/components/PublicFooter.jsx', import.meta.url), 'utf8');
  const photo = fs.readFileSync(new URL('../src/components/PhotoPlaceholder.jsx', import.meta.url), 'utf8');
  const animation = fs.readFileSync(new URL('../src/components/HamburgerAssembly.jsx', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../src/components/HamburgerAssembly.jsx', import.meta.url), 'utf8');

  for (const route of ['/privacidad', '/terminos', '/contacto', '/proyecto', '/informacion-sin-gluten']) {
    assert.match(app, new RegExp(route.replaceAll('/', '\\/')));
  }
  assert.match(footer, /footerDisclaimer/);
  assert.match(photo, /onError/);
  assert.match(photo, /photoFallback/);
  assert.match(animation, /onError/);
  assert.match(css, /prefers-reduced-motion/);
});

test('las tarjetas omiten metadata ausente y el detalle conserva los fallbacks informativos', () => {
  const card = fs.readFileSync(new URL('../src/components/RestaurantCard.jsx', import.meta.url), 'utf8');
  const details = fs.readFileSync(new URL('../src/components/TrustDetails.jsx', import.meta.url), 'utf8');
  const translations = fs.readFileSync(new URL('../src/i18n/index.jsx', import.meta.url), 'utf8');

  assert.match(card, /hasTrustMetadata/);
  assert.match(card, /hasSource &&/);
  assert.match(card, /lastChecked &&/);
  assert.doesNotMatch(card, /sourceMissing/);
  assert.match(details, /sourceName \|\| t\('sourceMissing'\)/);
  assert.match(details, /date \|\| t\('dateMissing'\)/);
  assert.match(translations, /Data de verificação indisponível/);
  assert.match(translations, /Verification date unavailable/);
  assert.match(translations, /Fecha de verificación no disponible/);
});

test('la interfaz pública no contiene garantías absolutas prohibidas', () => {
  const files = [
    '../src/pages/OnboardingScreen.jsx',
    '../src/components/RestaurantCard.jsx',
    '../src/components/TrustBadge.jsx',
    '../src/components/TrustDetails.jsx',
    '../src/pages/SafetyInformationPage.jsx',
  ];
  const source = files
    .map((file) => fs.readFileSync(new URL(file, import.meta.url), 'utf8'))
    .join('\n')
    .toLowerCase();

  for (const forbidden of ['100% seguro', 'safe for celiacs', 'celiac-safe', 'seguro para celíacos']) {
    assert.doesNotMatch(source, new RegExp(forbidden));
  }
});

test('la animación conserva una composición estática y evita recursos infinitos', () => {
  const animation = fs.readFileSync(new URL('../src/components/HamburgerAssembly.jsx', import.meta.url), 'utf8');
  assert.match(animation, /gf-burger-plate/);
  assert.match(animation, /LAYERS\.map/);
  assert.match(animation, /animation: none !important/);
  assert.match(animation, /opacity: 1 !important/);
  assert.match(animation, /currentTarget\.style\.display = 'none'/);
});

test('el logo oficial está centralizado y se muestra en las superficies de marca', () => {
  const brand = fs.readFileSync(new URL('../src/config/brand.js', import.meta.url), 'utf8');
  const logo = fs.readFileSync(new URL('../src/components/BrandLogo.jsx', import.meta.url), 'utf8');
  const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  assert.match(brand, /v\d+\/logo-glutenFri_mxse6m\.webp/);
  assert.match(brand, /v1784991668\/icon-glutenFri_ilsloa\.webp/);
  assert.match(logo, /APP_LOGO_URL/);
  assert.match(logo, /onError/);
  assert.match(index, /type="image\/webp"/);
  assert.match(index, /rel="icon"[\s\S]*v1784991668\/icon-glutenFri_ilsloa\.webp/);
  assert.match(index, /property="og:image"[\s\S]*v1784991659\/logo-glutenFri_mxse6m\.webp/);

  for (const file of [
    '../src/components/DesktopHeader.jsx',
    '../src/admin/AdminShell.jsx',
  ]) {
    const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(source, /BrandLogo/);
  }

  const publicHeader = fs.readFileSync(new URL('../src/components/PublicPageHeader.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(publicHeader, /BrandLogo/);
  assert.match(publicHeader, /REGION_NAME/);
  for (const file of [
    '../src/pages/ExplorePage.jsx',
    '../src/pages/HomePage.jsx',
    '../src/pages/SavedPage.jsx',
    '../src/pages/ReviewsPage.jsx',
    '../src/pages/ProfilePage.jsx',
  ]) {
    const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(source, /PublicPageHeader/);
  }
});

test('el menú fijo usa los cinco Material Symbols definidos para cada sección', () => {
  const navigation = fs.readFileSync(new URL('../src/components/BottomNav.jsx', import.meta.url), 'utf8');
  const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  for (const icon of ['home', 'distance', 'favorite', 'edit_square', 'for_you']) {
    assert.match(navigation, new RegExp(`: '${icon}'`));
    assert.match(index, new RegExp(icon));
  }
  assert.match(navigation, /material-symbols-outlined bottom-nav__icon/);
});

test('el mapa tiene cabecera de marca y filtros visuales accesibles', () => {
  const page = fs.readFileSync(new URL('../src/pages/HomePage.jsx', import.meta.url), 'utf8');
  const filters = fs.readFileSync(new URL('../src/components/Filters.jsx', import.meta.url), 'utf8');

  assert.match(page, /PublicPageHeader/);
  assert.match(page, /map-page__surface/);
  assert.match(filters, /instant_mix/);
  assert.match(filters, /explore-filter__panel/);
  assert.match(filters, /certifiedOnly/);
  assert.match(filters, /discountOnly/);
  assert.match(filters, /aria-label/);
});

test('Explorar ubica el filtro con contador en la fila del título', () => {
  const page = fs.readFileSync(new URL('../src/pages/ExplorePage.jsx', import.meta.url), 'utf8');
  const button = fs.readFileSync(new URL('../src/components/ExploreFiltersButton.jsx', import.meta.url), 'utf8');

  assert.match(page, /<PublicPageHeader[\s\S]*action=/);
  assert.match(page, /action=\{\([\s\S]*<ExploreFiltersButton/);
  assert.doesNotMatch(page, /<SortControl/);
  assert.match(button, /<SortControl/);
  assert.match(button, /explore-filter__count/);
  assert.match(button, /activeCount > 0/);
});
