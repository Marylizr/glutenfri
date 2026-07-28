const SCHEMA_TYPES = {
  restaurant: 'Restaurant',
  bakery: 'Bakery',
  store: 'Store',
  pharmacy: 'Pharmacy',
  supermarket: 'GroceryStore',
};

export function buildPlaceStructuredData(establishment, canonicalUrl) {
  return {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPES[establishment.type] || 'LocalBusiness',
    name: establishment.name,
    url: canonicalUrl,
    ...(establishment.address ? { address: establishment.address } : {}),
    ...(establishment.phone ? { telephone: establishment.phone } : {}),
    ...(establishment.websiteUrl ? { sameAs: [establishment.websiteUrl] } : {}),
    ...(Number.isFinite(establishment.lat) && Number.isFinite(establishment.lng)
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: establishment.lat,
            longitude: establishment.lng,
          },
        }
      : {}),
  };
}
