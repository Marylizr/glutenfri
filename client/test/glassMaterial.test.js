import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
const css = read('../src/styles/glass.css');

test('el material glass tiene fallback sólido y respeta transparencia, contraste y movimiento reducidos', () => {
  assert.match(css, /@supports \(\(backdrop-filter:/);
  assert.match(css, /prefers-reduced-transparency: reduce/);
  assert.match(css, /prefers-contrast: more/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /backdrop-filter: none/);
  assert.match(css, /\.restaurant-card\s*\{[^}]*background:[^}]*box-shadow:/);
  assert.doesNotMatch(css, /\.restaurant-card\s*\{[^}]*backdrop-filter/);
  assert.match(read('../src/main.jsx'), /import '\.\/styles\/glass\.css'/);
});

test('el logo suministrado se conserva en PNG de alta resolución, sin depender de terceros', () => {
  const png = fs.readFileSync(new URL('../public/brand/logo-glutenfri.png', import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 3300);
  assert.equal(png.readUInt32BE(20), 1712);
  assert.ok(png.length < 200_000);
  assert.match(read('../src/components/BrandLogo.jsx'), /alt=\{APP_NAME\}/);
});

test('los controles reutilizan el material y mantienen targets y nombres accesibles', () => {
  const save = read('../src/components/SaveButton.jsx');
  assert.match(save, /size = 44/);
  assert.match(save, /aria-label=\{saved \?/);
  assert.match(css, /\.save-button:focus-visible/);
  assert.match(css, /\.search-bar input\s*\{[^}]*min-width: 0/);
});

test('el contorno de los campos alcanza 3:1 sobre el fondo más oscuro del material', () => {
  const luminance = (hex) => hex.match(/../g).map(c => Number.parseInt(c, 16) / 255)
    .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
    .reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
  const edge = css.match(/--glass-control-edge: #([a-f0-9]{6})/)[1];
  assert.ok((luminance('e8efea') + .05) / (luminance(edge) + .05) >= 3);
});
