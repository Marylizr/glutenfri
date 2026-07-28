import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('el shell administrativo elimina los mínimos de escritorio que causaban overflow', () => {
  const css = read('../src/admin/admin.css');

  assert.doesNotMatch(css, /min-width:\s*1198px/);
  assert.doesNotMatch(css, /grid-template-columns:\s*218px minmax\(980px/);
  assert.match(css, /grid-template-columns:\s*218px minmax\(0,\s*1fr\)/);
  assert.match(css, /\.admin-table-wrap\s*\{[\s\S]*overflow-x:\s*auto/);
  assert.match(css, /\.admin-content\s*\{[\s\S]*min-width:\s*0/);
});

test('mobile oculta la sidebar y muestra una navegación inferior con safe area', () => {
  const shell = read('../src/admin/AdminShell.jsx');
  const css = read('../src/admin/admin.css');

  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*\.admin-sidebar\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*\.admin-mobile-nav\s*\{[\s\S]*position:\s*fixed/);
  assert.match(css, /\.admin-mobile-nav\s*\{[\s\S]*safe-area-inset-bottom/);
  assert.match(shell, /MOBILE_PRIMARY_ITEMS\.map/);
  assert.match(shell, /aria-current=\{active === key \? 'page'/);
  assert.match(shell, /aria-label=\{copy\.mobileNavigation\}/);
});

test('el menú Más es accesible y se cierra por Escape, fondo y cambio de ruta', () => {
  const shell = read('../src/admin/AdminShell.jsx');

  assert.match(shell, /aria-expanded=\{mobileMoreOpen\}/);
  assert.match(shell, /aria-controls="admin-mobile-more"/);
  assert.match(shell, /event\.key === 'Escape'/);
  assert.match(shell, /event\.target === event\.currentTarget/);
  assert.match(shell, /\[location\.pathname\]/);
  assert.match(shell, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(shell, /role="dialog"/);
  assert.match(shell, /aria-modal="true"/);
});

test('tablet y mobile convierten grids rígidos en columnas flexibles sin alterar desktop', () => {
  const css = read('../src/admin/admin.css');

  assert.match(css, /@media \(max-width:\s*1250px\)[\s\S]*\.admin-dashboard-grid\s*\{[\s\S]*minmax\(0,\s*1fr\)/);
  assert.match(css, /@media \(max-width:\s*1100px\)[\s\S]*\.admin-split-layout,[\s\S]*\.admin-review-layout/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*\.admin-kpis\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /font-size:\s*16px/);
  assert.match(css, /outline:\s*2px solid #fff/);
  assert.match(css, /box-shadow:\s*0 0 0 4px var\(--admin-sage\)/);
});

test('los iconos de las métricas permanecen centrados dentro de sus círculos', () => {
  const css = read('../src/admin/admin.css');

  assert.match(css, /\.admin-kpi \.admin-kpi-icon\s*\{[^}]*display:\s*grid[^}]*place-items:\s*center/);
  assert.match(css, /\.admin-kpi-icon svg\s*\{[^}]*display:\s*block/);
});

test('los filtros móviles caben en el viewport y la lista conserva scroll táctil', () => {
  const shell = read('../src/admin/AdminShell.jsx');
  const css = read('../src/admin/admin.css');

  assert.doesNotMatch(shell, /admin-mobile-brand/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*\.admin-app\s*\{[^}]*height:\s*100%[^}]*overflow:\s*auto/);
  assert.match(css, /\.admin-filter-bar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(css, /\.admin-search-field,[\s\S]*\.admin-filter-select,[\s\S]*width:\s*100%/);
  assert.match(css, /\.admin-table-wrap\s*\{[^}]*overflow:\s*auto[^}]*-webkit-overflow-scrolling:\s*touch/);
});

test('la gestión de usuarios permite editar y eliminar con confirmación explícita', () => {
  const view = read('../src/admin/views/UsersView.jsx');
  const service = read('../src/services/admin.js');

  assert.match(view, /updateAdminUser\(selected\._id/);
  assert.match(view, /deleteAdminUser\(selected\._id/);
  assert.match(view, /deleteConfirmation\.trim\(\)\.toLowerCase\(\) !== selected\.email\.toLowerCase\(\)/);
  assert.match(view, /copy\.cannotDeleteSelf/);
  assert.match(view, /formatAdminCopy\(common\.editNamed/);
  assert.match(service, /patch\(`\/admin\/users\/\$\{userId\}`/);
  assert.match(service, /delete\(`\/admin\/users\/\$\{userId\}`,\s*\{ data \}\)/);
});
