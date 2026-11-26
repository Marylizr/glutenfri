export function editorialIssues(place, reports = [], now = new Date()) {
  const issues = [];
  const missing = !place.glutenFreeScope || !place.city || !place.phone || !place.sourceName || !place.sourceUrl;
  if (reports.some((r) => String(r.establishment?._id || r.establishment) === String(place._id) && ['pending', 'reviewing'].includes(r.status))) issues.push('qualityReports');
  if (place.informationStatus === 'closed_or_removed') issues.push('qualityClosed');
  const date = place.sourceReviewedAt || place.lastVerifiedAt;
  if (!date || !Number.isFinite(new Date(date).getTime())) issues.push('qualityUnknownDate');
  if ((date && now - new Date(date) > 180 * 86400000) || (place.nextReviewDueAt && new Date(place.nextReviewDueAt) <= now) || place.confidenceLevel === 'source_outdated') issues.push('qualityOverdue');
  if (missing) issues.push('qualityMissing');
  return issues;
}

export function editorialQueue(places, reports = [], now = new Date()) {
  const weights = { qualityReports: 16, qualityClosed: 8, qualityOverdue: 4, qualityUnknownDate: 2, qualityMissing: 1 };
  return places.map((place, index) => {
    const issues = editorialIssues(place, reports, now);
    return { place, issues, index, score: issues.reduce((total, issue) => total + weights[issue], 0) };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
}

export async function loadEditorialCatalogue(fetchPage, maxPages = 20) {
  const first = await fetchPage({ page: 1, limit: 100 });
  if (!Array.isArray(first?.data) || !Number.isInteger(first.totalPages) || first.totalPages < 0 || first.totalPages > maxPages) throw new TypeError('Incomplete editorial catalogue');
  const pages = [first.data];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchPage({ page, limit: 100 });
    if (!Array.isArray(next?.data) || next.totalPages !== first.totalPages) throw new TypeError('Editorial catalogue changed; retry explicitly');
    pages.push(next.data);
  }
  return [...new Map(pages.flat().map((place) => [place._id, place])).values()];
}
