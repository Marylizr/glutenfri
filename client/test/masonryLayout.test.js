import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeMasonryLayout } from '../src/utils/masonryLayout.js';

test('masonry ocupa la columna más corta sin huecos de filas ni cambiar el orden', () => {
  const heights = [200, 320, 240, 160, 210, 180];
  const result = computeMasonryLayout(heights, 3, 16);
  assert.deepEqual(result.positions, [
    { column: 0, top: 0 }, { column: 1, top: 0 }, { column: 2, top: 0 },
    { column: 0, top: 216 }, { column: 2, top: 256 }, { column: 1, top: 336 },
  ]);
  assert.equal(result.height, 516);
  for (let column = 0; column < 3; column++) {
    const indices = result.positions.flatMap((position, index) => position.column === column ? [index] : []);
    indices.slice(1).forEach((index, offset) => {
      const previous = indices[offset];
      assert.equal(result.positions[index].top - result.positions[previous].top - heights[previous], 16);
    });
  }
});

test('una columna mantiene la secuencia y el contenedor abarca la tarjeta más baja', () => {
  assert.deepEqual(computeMasonryLayout([120, 80, 240], 1, 16), {
    positions: [{ column: 0, top: 0 }, { column: 0, top: 136 }, { column: 0, top: 232 }], height: 472,
  });
  assert.deepEqual(computeMasonryLayout([], 5, 16), { positions: [], height: 0 });
  assert.equal(computeMasonryLayout([120], 5, 16).height, 120);
  assert.equal(computeMasonryLayout([40, 60], 0, -1).height, 100);
  assert.equal(computeMasonryLayout([40, NaN], NaN, NaN).height, 40);
});

test('el grid mide cambios de altura y conserva fallback y DOM sin librerías ni reordenación', () => {
  const read = file => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const component = read('../src/components/MasonryGrid.jsx');
  const css = read('../src/components/MasonryGrid.css');
  const explore = read('../src/pages/ExplorePage.jsx');
  assert.match(component, /ResizeObserver/);
  assert.match(component, /observer\.disconnect\(\)/);
  assert.match(component, /cancelAnimationFrame\(frame\)/);
  assert.match(component, /Children\.toArray\(children\)\.map/);
  assert.doesNotMatch(component, /\.sort\(|tabIndex|aria-hidden/);
  assert.match(css, /grid-template-columns: repeat\(auto-fill/);
  assert.match(explore, /<MasonryGrid>\{filtered\.map/);
  assert.ok(explore.indexOf('</MasonryGrid>') < explore.indexOf('<PublicFooter />'));
});
