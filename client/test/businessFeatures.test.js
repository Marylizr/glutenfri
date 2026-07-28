import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../src/business/BusinessShell.jsx', import.meta.url), 'utf8');
const claimDialog = readFileSync(
  new URL('../src/components/BusinessClaimDialog.jsx', import.meta.url),
  'utf8'
);
const detail = readFileSync(
  new URL('../src/pages/EstablishmentDetailPage.jsx', import.meta.url),
  'utf8'
);
const seo = readFileSync(new URL('../src/components/EstablishmentSeo.jsx', import.meta.url), 'utf8');
const admin = readFileSync(
  new URL('../src/admin/views/CommercialView.jsx', import.meta.url),
  'utf8'
);
const styles = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const adminStyles = readFileSync(new URL('../src/admin/admin.css', import.meta.url), 'utf8');

test('las rutas comerciales y administrativas exigen sesión antes de renderizar', () => {
  assert.ok(app.includes('path="/negocio/*"'));
  assert.ok(app.includes('auth.user ? ('));
  assert.ok(app.includes('<Navigate to="/perfil" replace />'));
  assert.ok(app.includes('auth.user?.isAdmin'));
});

test('el diálogo de reclamación evita doble envío y gestiona foco, Escape y consentimiento', () => {
  assert.match(claimDialog, /aria-modal="true"/);
  assert.ok(claimDialog.includes("event.key === 'Escape'"));
  assert.match(claimDialog, /querySelectorAll/);
  assert.ok(claimDialog.includes('triggerRef.current?.focus'));
  assert.ok(claimDialog.includes("disabled={status === 'loading'}"));
  assert.ok(claimDialog.includes('checked={form.consent}'));
  assert.match(claimDialog, /required/);
});

test('el panel comercial contiene PT-PT, inglés y español y estados honestos', () => {
  assert.ok(shell.includes("'pt-PT': {"));
  assert.ok(shell.includes('en: {'));
  assert.ok(shell.includes('es: {'));
  assert.match(shell, /never_reviewed/);
  assert.match(shell, /noStats/);
  assert.match(shell, /backendError/);
  assert.ok(shell.includes('useBlocker(dirty)'));
  assert.doesNotMatch(shell, />undefined</);
  assert.doesNotMatch(shell, />null</);
});

test('patrocinio, landing y canonical reutilizan exclusivamente la ficha pública', () => {
  assert.ok(app.includes('path="/empresa/:id"'));
  assert.match(app, /<EstablishmentDetailRoute/);
  assert.ok(detail.includes("sponsorship?.status === 'active'"));
  assert.ok(detail.includes('<EstablishmentSeo establishment={establishment}'));
  assert.ok(seo.includes('getCanonicalPlaceUrl(establishment._id)'));
});

test('la administración filtra estados y compara valores antes de publicar', () => {
  const copy = readFileSync(new URL('../src/admin/adminCopy.js', import.meta.url), 'utf8');
  assert.ok(admin.includes('params: status ? { status } : {}'));
  assert.match(copy, /current: 'Atual'/);
  assert.match(copy, /current: 'Current'/);
  assert.match(copy, /current: 'Actual'/);
  assert.match(admin, /copy\.current/);
  assert.match(admin, /copy\.proposed/);
  assert.ok(admin.includes('window.confirm'));
  assert.ok(admin.includes("item.status === 'pending'"));
});

test('los estilos comerciales evitan anchos fijos y adaptan modal, panel y admin móvil', () => {
  assert.ok(styles.includes('width: min(100%, 580px)'));
  assert.ok(styles.includes('max-height: calc(100dvh - 32px)'));
  assert.ok(styles.includes('@media (max-width: 720px)'));
  assert.ok(adminStyles.includes('@media (max-width: 900px)'));
  assert.match(adminStyles, /min-width: 0/);
  assert.match(adminStyles, /grid-template-columns: 1fr/);
});
