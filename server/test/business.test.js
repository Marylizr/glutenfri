const test = require('node:test');
const assert = require('node:assert/strict');
const BusinessClaim = require('../src/models/BusinessClaim');
const EstablishmentManager = require('../src/models/EstablishmentManager');
const EstablishmentChangeRequest = require('../src/models/EstablishmentChangeRequest');
const { EstablishmentAnalyticsEvent } = require('../src/models/EstablishmentAnalyticsEvent');
const {
  pickBusinessChanges,
  normalizeHttpsUrl,
  promotionResources,
  sponsoredNow,
} = require('../src/controllers/businessController');
const { businessFreshness } = require('../src/utils/businessFreshness');

test('la edición comercial aplica allowlist y excluye campos de confianza y comunidad', () => {
  const result = pickBusinessChanges({
    name: 'Nome publicado',
    websiteUrl: 'https://example.test/',
    certified: true,
    trustStatus: 'CERTIFIED_APC_BIOTRAB',
    riskLevel: 'none',
    avgRating: 5,
  });
  assert.deepEqual(result, {
    name: 'Nome publicado',
    websiteUrl: 'https://example.test/',
  });
});

test('las URLs comerciales se normalizan y rechazan credenciales o protocolos inseguros', () => {
  assert.equal(
    normalizeHttpsUrl('https://EXAMPLE.test/menu#today'),
    'https://example.test/menu'
  );
  assert.throws(() => normalizeHttpsUrl('http://example.test'), /URL HTTPS/);
  assert.throws(() => normalizeHttpsUrl('https://user:secret@example.test'), /URL HTTPS/);
  assert.deepEqual(
    pickBusinessChanges({
      businessImages: [{ url: 'https://CDN.example.test/photo.jpg#x', alt: 'Fachada' }],
      socialLinks: [{ network: 'instagram', url: 'https://INSTAGRAM.com/example#bio' }],
    }),
    {
      businessImages: [{ url: 'https://cdn.example.test/photo.jpg', alt: 'Fachada' }],
      socialLinks: [{ network: 'instagram', url: 'https://instagram.com/example' }],
    }
  );
});

test('la vigencia comercial usa fechas reales y distingue nunca revisada y desactualizada', () => {
  assert.equal(businessFreshness({}).status, 'never_reviewed');
  assert.equal(
    businessFreshness(
      { lastBusinessReviewAt: new Date('2025-01-01T00:00:00Z') },
      new Date('2025-07-10T00:00:00Z')
    ).status,
    'stale'
  );
  assert.equal(
    businessFreshness(
      { lastBusinessReviewAt: new Date('2025-07-01T00:00:00Z') },
      new Date('2025-07-10T00:00:00Z')
    ).status,
    'current'
  );
});

test('el patrocinio solo está activo dentro de las fechas autorizadas', () => {
  const now = new Date('2026-01-15T00:00:00Z');
  assert.equal(sponsoredNow({ sponsorship: { status: 'inactive' } }, now), false);
  assert.equal(
    sponsoredNow({
      sponsorship: {
        status: 'active',
        startsAt: new Date('2026-01-01T00:00:00Z'),
        endsAt: new Date('2026-02-01T00:00:00Z'),
      },
    }, now),
    true
  );
  assert.equal(
    sponsoredNow({
      sponsorship: { status: 'active', endsAt: new Date('2026-01-01T00:00:00Z') },
    }, now),
    false
  );
});

test('el sello no usa contenido dinámico del negocio ni afirma certificación', () => {
  const resources = promotionResources(
    { _id: '507f1f77bcf86cd799439011', name: '<script>alert(1)</script>' },
    'https://glutenfri.example'
  );
  assert.doesNotMatch(resources.badge.svg, /script|certificad/i);
  assert.match(resources.note, /Não representa certificação/);
  assert.match(resources.canonicalUrl, /\/lugar\/507f1f77bcf86cd799439011$/);
});

test('los modelos comerciales tienen índices para duplicados, permisos y analítica', () => {
  assert.ok(BusinessClaim.schema.indexes().some(([fields, options]) => fields.activeKey === 1 && options.unique));
  assert.ok(EstablishmentManager.schema.indexes().some(([fields, options]) => fields.establishment === 1 && fields.user === 1 && options.unique));
  assert.ok(EstablishmentChangeRequest.schema.indexes().some(([fields]) => fields.establishment === 1 && fields.status === 1));
  assert.ok(EstablishmentAnalyticsEvent.schema.indexes().some(([fields]) => fields.establishment === 1 && fields.occurredAt === -1));
});
