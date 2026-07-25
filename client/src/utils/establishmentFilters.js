import { normalizeTrustStatus, TRUST_STATUS } from './trustStatus.js';

export function filterEstablishments(
  establishments,
  {
    type,
    query = '',
    language = 'pt-PT',
    certifiedOnly = false,
    discountOnly = false,
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
    if (discountOnly && !establishment.discount) return false;
    if (normalizedQuery) {
      const searchable = `${establishment.name || ''} ${establishment.address || ''}`
        .toLocaleLowerCase(language);
      if (!searchable.includes(normalizedQuery)) return false;
    }
    return true;
  });
}

export function getAdvancedFilterCount({ certifiedOnly = false } = {}) {
  return certifiedOnly ? 1 : 0;
}
