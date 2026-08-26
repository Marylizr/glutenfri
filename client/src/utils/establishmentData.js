export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function validHttpUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizePhone(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const display = String(value).trim();
  const digits = display.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return { display, tel: display.startsWith('+') ? `+${digits}` : digits, digits };
}

export function normalizeWhatsApp(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const display = String(value).trim();
  const digits = display.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  if (display.startsWith('+')) return digits;
  if (display.startsWith('00')) return digits.slice(2);
  return null;
}

export function normalizeCoordinate(value, min, max) {
  if (value === '' || value == null) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

export function normalizeStringList(value, maxItems = 20) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .slice(0, maxItems);
}

export function getEstablishmentCity(establishment) {
  const explicitCity = typeof establishment?.city === 'string' ? establishment.city.trim() : '';
  if (explicitCity) return explicitCity;

  const address = typeof establishment?.address === 'string' ? establishment.address.trim() : '';
  if (!address) return null;

  const afterPostalCode = address.match(/\b\d{4}-\d{3}\s+([^,]+)/u)?.[1]?.trim();
  if (afterPostalCode) return afterPostalCode;

  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return null;
  const last = parts.at(-1);
  const city = /^(portugal|pt)$/iu.test(last) ? parts.at(-2) : last;
  return city && !/^\d{4}-\d{3}$/u.test(city) ? city : null;
}

function validTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function normalizeWeeklyHours(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const normalized = {};
  for (const day of WEEK_DAYS) {
    if (!Array.isArray(value[day])) continue;
    normalized[day] = value[day]
      .filter((interval) => interval && validTime(interval.start) && validTime(interval.end))
      .map(({ start, end }) => ({ start, end }))
      .slice(0, 4);
  }
  return Object.values(normalized).some((intervals) => intervals.length) ? normalized : null;
}

export function validTimeZone(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return value;
  } catch {
    return null;
  }
}

export function buildMapsUrl(establishment) {
  const hasCoordinates =
    Number.isFinite(establishment?.lat) && Number.isFinite(establishment?.lng);
  const query = hasCoordinates
    ? `${establishment.lat},${establishment.lng}`
    : establishment?.address;
  return query
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
    : null;
}
