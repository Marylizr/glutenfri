import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('la hamburguesa compacta el bloque superior sin cambiar la base ni el orden de montaje', async () => {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  });
  try {
    const { default: HamburgerAssembly } = await vite.ssrLoadModule('/src/components/HamburgerAssembly.jsx');
    const html = renderToStaticMarkup(createElement(HamburgerAssembly, {
      badge: 'Información sobre opciones sin gluten',
      alt: 'Hamburguesa por capas',
    }));
    const layers = [...html.matchAll(/<image\b[^>]*>/g)].map(([tag]) => ({
      name: tag.match(/href="\/images\/([^".]+)\.png"/)[1],
      y: Number(tag.match(/\by="([\d.]+)"/)[1]),
    }));
    assert.deepEqual(layers, [
      { name: 'plato', y: 214 },
      { name: 'pan-bottom', y: 180 },
      { name: 'salsa', y: 172 },
      { name: 'carne', y: 151 },
      { name: 'queso', y: 128 },
      { name: 'tomate', y: 106 },
      { name: 'rucula', y: 91 },
      { name: 'pan', y: 10 },
    ]);
    assert.match(html, /role="img" aria-label="Hamburguesa por capas"/);
    assert.match(html, /Información sobre opciones sin gluten/);
    // El dibujo ancla el plato al final del SVG y la píldora va en el flujo
    // posterior: puede ocupar dos líneas sin superponerse a la hamburguesa.
    assert.match(html, /preserveAspectRatio="xMidYMax meet"/);
    assert.match(html, /\.gf-burger-badge \{\s+position: relative;\s+z-index: 2;\s+flex: 0 0 auto;\s+margin: 4px auto 0;/);
    assert.match(html, /flex-direction: column/);
    assert.match(html, /max-width: calc\(100% - 24px\)/);
    assert.match(html, /prefers-reduced-motion: reduce/);
  } finally {
    await vite.close();
  }
});
