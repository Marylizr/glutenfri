function normalizeIdentity(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function distanceMeters(first, second) {
  if (![first.lat, first.lng, second.lat, second.lng].every(Number.isFinite)) return null;
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latDelta = radians(second.lat - first.lat);
  const lngDelta = radians(second.lng - first.lng);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(radians(first.lat)) * Math.cos(radians(second.lat)) * Math.sin(lngDelta / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findDuplicateCandidates(establishments = []) {
  const candidates = [];
  for (let index = 0; index < establishments.length; index += 1) {
    const first = establishments[index];
    const firstName = normalizeIdentity(first.name);
    if (!firstName) continue;
    for (let next = index + 1; next < establishments.length; next += 1) {
      const second = establishments[next];
      if (firstName !== normalizeIdentity(second.name)) continue;
      const sameAddress =
        normalizeIdentity(first.address) &&
        normalizeIdentity(first.address) === normalizeIdentity(second.address);
      const distance = distanceMeters(first, second);
      const nearby = distance !== null && distance <= 150;
      if (!sameAddress && !nearby) continue;
      candidates.push({
        first,
        second,
        reasons: [sameAddress ? 'same_name_address' : null, nearby ? 'same_name_nearby' : null].filter(Boolean),
        distanceMeters: distance === null ? null : Math.round(distance),
      });
    }
  }
  return candidates;
}

module.exports = { distanceMeters, findDuplicateCandidates, normalizeIdentity };
