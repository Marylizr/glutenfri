import {
  normalizeCoordinate,
  normalizePhone,
  normalizeStringList,
  normalizeWeeklyHours,
  normalizeWhatsApp,
  validHttpUrl,
  validTimeZone,
} from './establishmentData.js';

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
  const certificationDate = record.certificationDate ? new Date(record.certificationDate) : null;
  const informationDate = record.lastInformationUpdate ? new Date(record.lastInformationUpdate) : null;
  const phone = normalizePhone(record.phone);
  const whatsapp = normalizeWhatsApp(record.whatsapp);
  const lat = normalizeCoordinate(record.lat, -90, 90);
  const lng = normalizeCoordinate(record.lng, -180, 180);

  return {
    ...record,
    trustStatus: normalizeTrustStatus({ ...record, sourceName }),
    sourceName,
    sourceUrl,
    lastVerifiedAt: date && !Number.isNaN(date.getTime()) ? record.lastVerifiedAt : null,
    certificationDate:
      certificationDate && !Number.isNaN(certificationDate.getTime())
        ? record.certificationDate
        : null,
    lastInformationUpdate:
      informationDate && !Number.isNaN(informationDate.getTime())
        ? record.lastInformationUpdate
        : null,
    lat,
    lng,
    phone: phone?.display || null,
    phoneHref: phone?.tel || null,
    whatsapp,
    images: normalizeStringList(record.images).map(validHttpUrl).filter(Boolean),
    logoUrl: validHttpUrl(record.logoUrl),
    websiteUrl: validHttpUrl(record.websiteUrl),
    menuUrl: validHttpUrl(record.menuUrl),
    reservationUrl: validHttpUrl(record.reservationUrl),
    orderUrl: validHttpUrl(record.orderUrl),
    timezone: validTimeZone(record.timezone),
    weeklyHours: normalizeWeeklyHours(record.weeklyHours),
    dedicatedKitchen:
      typeof record.dedicatedKitchen === 'boolean' ? record.dedicatedKitchen : null,
    dedicatedGlutenFreeMenu:
      typeof record.dedicatedGlutenFreeMenu === 'boolean'
        ? record.dedicatedGlutenFreeMenu
        : null,
    staffTrained: typeof record.staffTrained === 'boolean' ? record.staffTrained : null,
    dedicatedArea: typeof record.dedicatedArea === 'boolean' ? record.dedicatedArea : null,
    delivery: typeof record.delivery === 'boolean' ? record.delivery : null,
    takeaway: typeof record.takeaway === 'boolean' ? record.takeaway : null,
    riskLevel: ['none', 'low', 'moderate', 'high'].includes(record.riskLevel)
      ? record.riskLevel
      : null,
    certificationBody:
      typeof record.certificationBody === 'string' && record.certificationBody.trim()
        ? record.certificationBody.trim()
        : null,
    glutenFreeScope:
      typeof record.glutenFreeScope === 'string' && record.glutenFreeScope.trim()
        ? record.glutenFreeScope.trim()
        : null,
    crossContactMeasures: normalizeStringList(record.crossContactMeasures),
    accessibilityFeatures: normalizeStringList(record.accessibilityFeatures),
    serviceLanguages: normalizeStringList(record.serviceLanguages),
    informationSources: Array.isArray(record.informationSources)
      ? record.informationSources
          .map((source) => ({
            label: typeof source?.label === 'string' ? source.label.trim() : '',
            url: validHttpUrl(source?.url),
          }))
          .filter((source) => source.label && source.url)
      : [],
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
