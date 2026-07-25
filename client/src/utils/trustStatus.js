export const TRUST_STATUS = Object.freeze({
  CERTIFIED_APC_BIOTRAB: 'CERTIFIED_APC_BIOTRAB',
  COMMUNITY_REPORTED: 'COMMUNITY_REPORTED',
  PENDING_VALIDATION: 'PENDING_VALIDATION',
});

export function normalizeTrustStatus(establishment = {}) {
  if (Object.values(TRUST_STATUS).includes(establishment.trustStatus)) {
    if (
      establishment.trustStatus === TRUST_STATUS.CERTIFIED_APC_BIOTRAB &&
      !(
        (establishment.sourceName &&
          typeof establishment.sourceUrl === 'string' &&
          /^https:\/\//i.test(establishment.sourceUrl)) ||
        establishment.certified === true &&
        ['APC', 'APC+Google'].includes(establishment.source)
      )
    ) {
      return TRUST_STATUS.PENDING_VALIDATION;
    }
    return establishment.trustStatus;
  }
  if (
    establishment.certified === true &&
    ['APC', 'APC+Google'].includes(establishment.source)
  ) {
    return TRUST_STATUS.CERTIFIED_APC_BIOTRAB;
  }
  if (establishment.source === 'user') return TRUST_STATUS.COMMUNITY_REPORTED;
  return TRUST_STATUS.PENDING_VALIDATION;
}

export function normalizeEstablishmentRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;

  const sourceName =
    typeof record.sourceName === 'string' && record.sourceName.trim()
      ? record.sourceName.trim()
      : null;
  const sourceUrl =
    typeof record.sourceUrl === 'string' && /^https:\/\//i.test(record.sourceUrl)
      ? record.sourceUrl
      : null;
  const date = record.lastVerifiedAt ? new Date(record.lastVerifiedAt) : null;

  return {
    ...record,
    trustStatus: normalizeTrustStatus({ ...record, sourceName }),
    sourceName,
    sourceUrl,
    lastVerifiedAt: date && !Number.isNaN(date.getTime()) ? record.lastVerifiedAt : null,
  };
}

export function normalizeEstablishmentPayload(payload) {
  const list = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(list)) {
    throw new TypeError('La API devolvió una lista de establecimientos inválida.');
  }
  return list.map(normalizeEstablishmentRecord).filter(Boolean);
}

export function getMappableEstablishments(establishments) {
  if (!Array.isArray(establishments)) return [];
  return establishments.filter(
    (establishment) =>
      establishment &&
      Number.isFinite(Number(establishment.lat)) &&
      Number.isFinite(Number(establishment.lng))
  );
}

export function getTrustPresentation(establishment, t) {
  const status = normalizeTrustStatus(establishment);
  const presentations = {
    [TRUST_STATUS.CERTIFIED_APC_BIOTRAB]: {
      label: t('trustCertified'),
      background: '#e3ead9',
      color: '#31513b',
      icon: '◆',
    },
    [TRUST_STATUS.COMMUNITY_REPORTED]: {
      label: t('trustCommunity'),
      background: '#f6ead8',
      color: '#7a5420',
      icon: '●',
    },
    [TRUST_STATUS.PENDING_VALIDATION]: {
      label: t('trustPending'),
      background: '#ece9e2',
      color: '#5f5a50',
      icon: '◷',
    },
  };
  return { status, ...presentations[status] };
}
