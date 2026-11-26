// Synthetic U0 contract matrix, not imported or presented as real businesses.
export const PILOT_CITY = 'Porto'; // Proposed editorial depth, not a product boundary.
export const utilityFixtures = ['restaurant', 'bakery', 'store', 'pharmacy', 'supermarket'].flatMap((type, i) => {
  const complete = { _id: `qa-${type}`, name: `QA ${type}`, type,
    city: PILOT_CITY, address: 'Morada sintética QA', lat: 41.15 + i / 100, lng: -8.61,
    phone: '+351000000000', menuUrl: 'https://example.invalid/menu',
    glutenFreeScope: 'Oferta sintética para testes, não representa um local real.',
    informationCategory: type === 'pharmacy' || type === 'supermarket' ? 'point_of_sale' : 'business_declared_gluten_free',
    sourceType: 'business_provided', sourceName: 'Fonte sintética QA',
    sourceUrl: 'https://example.invalid/source', confidenceLevel: 'source_pending_review',
    lastInformationUpdate: '2026-11-01T12:00:00Z', timezone: 'Europe/Lisbon',
    weeklyHours: { mon: [{ start: '10:00', end: '18:00' }] }, informationStatus: 'active',
  };
  return [
    { scenario: 'complete', ...complete },
    { scenario: 'incomplete', _id: `qa-${type}-unknown`, name: `QA ${type} incompleto`, type },
    { scenario: 'outdated', ...complete, _id: `qa-${type}-outdated`, confidenceLevel: 'source_outdated' },
    { scenario: 'closed', ...complete, _id: `qa-${type}-closed`, informationStatus: 'closed_or_removed' },
    { scenario: 'unsupported-certification', ...complete, _id: `qa-${type}-unsupported`,
      certified: true, source: 'APC', externalCertificationAuthorized: false },
  ];
});

export function completeness(record) {
  return {
    offer: Boolean(record.glutenFreeScope), city: Boolean(record.city),
    coordinates: Number.isFinite(record.lat) && Number.isFinite(record.lng),
    contact: Boolean(record.phone || record.websiteUrl), menu: Boolean(record.menuUrl),
    hours: Boolean(record.timezone && record.weeklyHours),
    provenance: Boolean(record.sourceName && record.sourceUrl), date: Boolean(record.lastInformationUpdate),
  };
}
