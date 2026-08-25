const TRUST_STATUS = Object.freeze({
  CERTIFIED_APC_BIOTRAB: 'CERTIFIED_APC_BIOTRAB',
  COMMUNITY_REPORTED: 'COMMUNITY_REPORTED',
  PENDING_VALIDATION: 'PENDING_VALIDATION',
});

const TRUST_STATUSES = Object.freeze(Object.values(TRUST_STATUS));
const INFORMATION_CATEGORIES = Object.freeze([
  'business_declared_gluten_free',
  'specialized_gluten_free_business',
  'point_of_sale',
  'retail_store',
  'community_information',
  'external_certification',
]);
const SOURCE_TYPES = Object.freeze([
  'business_provided',
  'public_source',
  'community_experience',
  'source_not_identified',
]);
const CONFIDENCE_LEVELS = Object.freeze([
  'source_pending_review',
  'source_verified',
  'source_outdated',
]);
const INFORMATION_STATUSES = Object.freeze(['active', 'closed_or_removed']);
const APC_SOURCE_NAME = 'Associação Portuguesa de Celíacos (APC)';
const APC_SOURCE_URL =
  'https://www.celiacos.org.pt/pontos-de-venda-e-estabelecimentos-certificados-apc-biotrab-norte/';

function hasExplicitLegacyCertification(establishment) {
  return (
    establishment?.certified === true &&
    (establishment?.source === 'APC' || establishment?.source === 'APC+Google')
  );
}

function normalizeTrustStatus(establishment = {}) {
  if (establishment.trustStatus === TRUST_STATUS.CERTIFIED_APC_BIOTRAB) {
    const hasEvidence =
      Boolean(establishment.sourceName) &&
      (Boolean(establishment.sourceUrl) || hasExplicitLegacyCertification(establishment));
    return hasEvidence ? TRUST_STATUS.CERTIFIED_APC_BIOTRAB : TRUST_STATUS.PENDING_VALIDATION;
  }
  if (establishment.trustStatus === TRUST_STATUS.COMMUNITY_REPORTED) {
    return TRUST_STATUS.COMMUNITY_REPORTED;
  }
  if (establishment.trustStatus === TRUST_STATUS.PENDING_VALIDATION) {
    return TRUST_STATUS.PENDING_VALIDATION;
  }
  if (hasExplicitLegacyCertification(establishment)) {
    return TRUST_STATUS.CERTIFIED_APC_BIOTRAB;
  }
  if (establishment.source === 'user') {
    return TRUST_STATUS.COMMUNITY_REPORTED;
  }
  return TRUST_STATUS.PENDING_VALIDATION;
}

function normalizeEstablishmentTrust(establishment = {}) {
  const trustStatus = normalizeTrustStatus(establishment);
  const certified = trustStatus === TRUST_STATUS.CERTIFIED_APC_BIOTRAB;
  return {
    ...establishment,
    trustStatus,
    certified,
    sourceName:
      establishment.sourceName ||
      (certified ? APC_SOURCE_NAME : establishment.source === 'Google' ? 'Google Places' : null),
    sourceUrl: establishment.sourceUrl || (certified ? APC_SOURCE_URL : null),
    lastVerifiedAt: establishment.lastVerifiedAt || null,
  };
}

function validValue(value, values) {
  return values.includes(value) ? value : null;
}

function deriveInformationCategory(establishment = {}) {
  const explicit = validValue(establishment.informationCategory, INFORMATION_CATEGORIES);
  if (explicit === 'external_certification') {
    const authorized =
      establishment.externalCertificationAuthorized === true &&
      Boolean(establishment.sourceName) &&
      /^https:\/\//i.test(establishment.sourceUrl || '');
    return authorized ? explicit : 'community_information';
  }
  if (explicit) return explicit;
  if (establishment.source === 'user') return 'community_information';
  if (['pharmacy', 'supermarket'].includes(establishment.type)) return 'point_of_sale';
  if (establishment.type === 'store') return 'retail_store';
  // No inferimos que un negocio sea especializado o que haya declarado su
  // oferta a partir de una antigua fuente institucional.
  return 'community_information';
}

function deriveSourceType(establishment = {}) {
  const explicit = validValue(establishment.sourceType, SOURCE_TYPES);
  if (explicit) return explicit;
  if (establishment.source === 'user') return 'community_experience';
  if (establishment.sourceName || ['APC', 'Google', 'APC+Google'].includes(establishment.source)) {
    return 'public_source';
  }
  return 'source_not_identified';
}

function deriveConfidenceLevel(establishment = {}, now = new Date()) {
  const explicit = validValue(establishment.confidenceLevel, CONFIDENCE_LEVELS);
  if (explicit) return explicit;
  const checkedAt = establishment.lastInformationUpdate || establishment.lastVerifiedAt;
  if (!checkedAt) return 'source_pending_review';
  const parsed = new Date(checkedAt);
  if (Number.isNaN(parsed.getTime())) return 'source_pending_review';
  const ageDays = (now.getTime() - parsed.getTime()) / 86_400_000;
  return ageDays > 365 ? 'source_outdated' : 'source_verified';
}

function normalizePublicInformation(establishment = {}, now = new Date()) {
  return {
    informationCategory: deriveInformationCategory(establishment),
    sourceType: deriveSourceType(establishment),
    confidenceLevel: deriveConfidenceLevel(establishment, now),
    informationStatus:
      validValue(establishment.informationStatus, INFORMATION_STATUSES) ||
      (establishment.temporarilyClosed ? 'closed_or_removed' : 'active'),
    informationUpdatedAt:
      establishment.lastInformationUpdate || establishment.lastVerifiedAt || null,
  };
}

module.exports = {
  TRUST_STATUS,
  TRUST_STATUSES,
  APC_SOURCE_NAME,
  APC_SOURCE_URL,
  hasExplicitLegacyCertification,
  normalizeTrustStatus,
  normalizeEstablishmentTrust,
  INFORMATION_CATEGORIES,
  SOURCE_TYPES,
  CONFIDENCE_LEVELS,
  INFORMATION_STATUSES,
  normalizePublicInformation,
};
