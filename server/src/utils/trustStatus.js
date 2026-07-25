const TRUST_STATUS = Object.freeze({
  CERTIFIED_APC_BIOTRAB: 'CERTIFIED_APC_BIOTRAB',
  COMMUNITY_REPORTED: 'COMMUNITY_REPORTED',
  PENDING_VALIDATION: 'PENDING_VALIDATION',
});

const TRUST_STATUSES = Object.freeze(Object.values(TRUST_STATUS));
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

module.exports = {
  TRUST_STATUS,
  TRUST_STATUSES,
  APC_SOURCE_NAME,
  APC_SOURCE_URL,
  hasExplicitLegacyCertification,
  normalizeTrustStatus,
  normalizeEstablishmentTrust,
};
