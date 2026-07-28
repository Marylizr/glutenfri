import { normalizeTrustStatus, TRUST_STATUS } from './trustStatus.js';
import { distanceKm } from './distance.js';

export const SORT_OPTIONS = Object.freeze({
  DEFAULT: 'default',
  DISTANCE: 'distance',
  CERTIFICATION: 'certification',
  CATEGORY: 'category',
});
const VALID_TYPES = new Set(['restaurant', 'bakery', 'store', 'pharmacy', 'supermarket']);
const VALID_SORTS = new Set(Object.values(SORT_OPTIONS));
const CATEGORY_ORDER = ['bakery', 'restaurant', 'store', 'supermarket', 'pharmacy'];

export function filterEstablishments(
  establishments,
  {
    type,
    query = '',
    language = 'pt-PT',
    certifiedOnly = false,
    discountOnly = false,
    deliveryOnly = false,
    takeawayOnly = false,
    openNowOnly = false,
    openStatusById = {},
  } = {}
) {
  if (!Array.isArray(establishments)) return [];
  const normalizedQuery = String(query).trim().toLocaleLowerCase(language);

  return establishments.filter((establishment) => {
    if (!establishment || typeof establishment !== 'object') return false;
    if (type && establishment.type !== type) return false;
    if (
      certifiedOnly &&
      normalizeTrustStatus(establishment) !== TRUST_STATUS.CERTIFIED_APC_BIOTRAB
    ) {
      return false;
    }
    if (
      discountOnly &&
      !(establishment.discount && ['APC', 'APC+Google'].includes(establishment.source))
    ) {
      return false;
    }
    if (deliveryOnly && establishment.delivery !== true) return false;
    if (takeawayOnly && establishment.takeaway !== true) return false;
    if (openNowOnly && openStatusById[establishment._id] !== 'open') return false;
    if (normalizedQuery) {
      const searchable = `${establishment.name || ''} ${establishment.address || ''}`
        .toLocaleLowerCase(language);
      if (!searchable.includes(normalizedQuery)) return false;
    }
    return true;
  });
}

export function sortEstablishments(establishments, sort, userPosition) {
  if (!Array.isArray(establishments)) return [];
  const indexed = establishments.map((establishment, index) => ({ establishment, index }));
  const stable = (comparison, left, right) => comparison || left.index - right.index;

  if (sort === SORT_OPTIONS.DISTANCE && userPosition) {
    return indexed
      .sort((left, right) => {
        const a = distanceKm(userPosition, left.establishment);
        const b = distanceKm(userPosition, right.establishment);
        const comparison =
          a == null && b == null ? 0 : a == null ? 1 : b == null ? -1 : a - b;
        return stable(comparison, left, right);
      })
      .map(({ establishment }) => establishment);
  }
  if (sort === SORT_OPTIONS.CERTIFICATION) {
    return indexed
      .sort((left, right) => stable(
        Number(normalizeTrustStatus(right.establishment) === TRUST_STATUS.CERTIFIED_APC_BIOTRAB) -
          Number(normalizeTrustStatus(left.establishment) === TRUST_STATUS.CERTIFIED_APC_BIOTRAB),
        left,
        right
      ))
      .map(({ establishment }) => establishment);
  }
  if (sort === SORT_OPTIONS.CATEGORY) {
    return indexed
      .sort((left, right) => stable(
        CATEGORY_ORDER.indexOf(left.establishment.type) -
          CATEGORY_ORDER.indexOf(right.establishment.type),
        left,
        right
      ))
      .map(({ establishment }) => establishment);
  }
  return establishments.slice();
}

export function parseExploreParams(searchParams) {
  const type = searchParams.get('categoria');
  const sort = searchParams.get('orden');
  return {
    query: searchParams.get('q')?.slice(0, 120) || '',
    type: VALID_TYPES.has(type) ? type : undefined,
    certifiedOnly: searchParams.get('certificado') === 'true',
    discountOnly: searchParams.get('descuento') === 'true',
    deliveryOnly: searchParams.get('entrega') === 'true',
    takeawayOnly: searchParams.get('takeaway') === 'true',
    openNowOnly: searchParams.get('abierto') === 'true',
    sort: VALID_SORTS.has(sort) ? sort : SORT_OPTIONS.DEFAULT,
  };
}

export function serializeExploreParams(state) {
  const params = new URLSearchParams();
  if (state.query) params.set('q', state.query);
  if (state.type) params.set('categoria', state.type);
  if (state.certifiedOnly) params.set('certificado', 'true');
  if (state.discountOnly) params.set('descuento', 'true');
  if (state.deliveryOnly) params.set('entrega', 'true');
  if (state.takeawayOnly) params.set('takeaway', 'true');
  if (state.openNowOnly) params.set('abierto', 'true');
  if (state.sort && state.sort !== SORT_OPTIONS.DEFAULT) params.set('orden', state.sort);
  return params;
}

export function getAdvancedFilterCount(filters = {}) {
  return [
    filters.certifiedOnly,
    filters.discountOnly,
    filters.deliveryOnly,
    filters.takeawayOnly,
    filters.openNowOnly,
  ].filter(Boolean).length;
}
