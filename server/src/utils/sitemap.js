const STATIC_PATHS = [
  '/',
  '/explorar',
  '/mapa',
  '/informacion-sin-gluten',
  '/proyecto',
  '/contacto',
  '/privacidad',
  '/terminos',
];

function buildSitemapXml(establishments = [], origin = 'https://glutenfri.netlify.app') {
  const cleanOrigin = origin.replace(/\/$/, '');
  const entries = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...establishments.map((item) => ({
      path: `/lugar/${encodeURIComponent(String(item._id))}`,
      lastmod: item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : item.updatedAt
          ? new Date(item.updatedAt).toISOString()
          : null,
    })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(({ path, lastmod }) =>
      `  <url><loc>${cleanOrigin}${path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    )
    .join('\n')}\n</urlset>`;
}

module.exports = { buildSitemapXml, STATIC_PATHS };
