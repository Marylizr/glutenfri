// No transforma fechas comerciales en revisiones de fuentes ni valores vacíos en «no».
export function decisionFacts(place = {}) {
  return {
    offer: place.glutenFreeScope?.trim() || null,
    sourceReviewedAt: place.sourceReviewedAt || place.lastVerifiedAt || null,
    businessUpdatedAt: place.lastPublishedUpdateAt || place.lastBusinessReviewAt || null,
    closed: place.informationStatus === 'closed_or_removed' || place.temporarilyClosed === true,
  };
}

export function booleanFact(value) {
  return value === true ? 'factYes' : value === false ? 'factNo' : 'factUnknown';
}
