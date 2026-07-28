export const COMMUNITY_STATE = Object.freeze({
  YES: 'yes',
  NO: 'no',
  UNREPORTED: 'unreported',
  RISK_NONE: 'risk-none',
  RISK_LOW: 'risk-low',
  RISK_MODERATE: 'risk-moderate',
  RISK_HIGH: 'risk-high',
});

export function getBooleanCommunityState(value) {
  if (value === true) return COMMUNITY_STATE.YES;
  if (value === false) return COMMUNITY_STATE.NO;
  return COMMUNITY_STATE.UNREPORTED;
}

export function getRiskCommunityState(value) {
  return {
    none: COMMUNITY_STATE.RISK_NONE,
    low: COMMUNITY_STATE.RISK_LOW,
    moderate: COMMUNITY_STATE.RISK_MODERATE,
    high: COMMUNITY_STATE.RISK_HIGH,
  }[value] || COMMUNITY_STATE.UNREPORTED;
}

