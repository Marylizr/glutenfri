import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('el backoffice incluye una sección explícita para calidad de datos', () => {
  const shell = read('../src/admin/AdminShell.jsx');
  const view = read('../src/admin/views/DataQualityView.jsx');
  assert.match(shell, /path: '\/admin\/data-quality'/);
  assert.match(shell, /pathname\.includes\('\/calidad'\)/);
  assert.match(shell, /<DataQualityView \/>/);
  assert.match(view, /role="tablist"/);
  assert.match(view, /aria-selected=\{tab === key\}/);
});

test('los flujos cubren reportes, cierres, duplicados, fuentes e historial', () => {
  const service = read('../src/services/admin.js');
  const view = read('../src/admin/views/DataQualityView.jsx');
  for (const path of [
    '/admin/establishment-reports',
    '/admin/data-quality/duplicates',
    '/quality',
    '/history',
  ]) assert.ok(service.includes(path));
  assert.match(view, /markClosed/);
  assert.match(view, /duplicateOf/);
  assert.match(view, /getEstablishmentHistory/);
  assert.match(view, /visibleEstablishments/);
  assert.match(view, /qualityReviewStatus/);
  assert.match(view, /confidenceLevel/);
});

test('la revisión exige motivo y no ofrece autocertificación externa', () => {
  const view = read('../src/admin/views/DataQualityView.jsx');
  const copy = read('../src/admin/adminCopy.js');
  assert.match(view, /reason\.trim\(\)\.length >= 3/);
  assert.doesNotMatch(view, /external_certification/);
  assert.match(copy, /Uma certificação externa não pode ser criada neste painel/);
});

test('la vista de calidad se adapta a móvil sin ancho fijo', () => {
  const css = read('../src/admin/admin.css');
  assert.match(css, /\.admin-quality-layout\s*\{[\s\S]*grid-template-columns:\s*minmax\(320px/);
  assert.match(css, /@media \(max-width:\s*767px\)[\s\S]*\.admin-quality-layout,[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(min-width:\s*768px\) and \(max-width:\s*1100px\)[\s\S]*\.admin-quality-layout,[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});
