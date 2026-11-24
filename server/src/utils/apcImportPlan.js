const normalize = (value) => String(value || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const phone = (value) => String(value || '').replace(/\D/g, '');

function buildApcImportPlan(existing, references) {
  const insert = [];
  const matched = [];
  const review = [];
  const seen = new Set();
  for (const reference of references) {
    if (seen.has(reference.sourceUrl)) continue;
    seen.add(reference.sourceUrl);
    const candidates = [...existing, ...insert];
    const exact = candidates.some((item) => (
      item.sourceUrl === reference.sourceUrl && normalize(item.name) === normalize(reference.name)
    ) || (
      normalize(item.name) === normalize(reference.name) &&
      normalize(item.address) && normalize(item.address) === normalize(reference.address)
    ));
    if (exact) { matched.push(reference); continue; }
    const ambiguous = candidates.some((item) => (
      normalize(item.name) === normalize(reference.name) && (!item.address || !reference.address)
    ) || (phone(reference.phone) && phone(item.phone) === phone(reference.phone)) || (
      Number.isFinite(item.lat) && Number.isFinite(reference.lat) &&
      Math.abs(item.lat - reference.lat) < 0.0005 && Math.abs(item.lng - reference.lng) < 0.0005
    ));
    if (ambiguous) { review.push(reference); continue; }
    insert.push(reference);
  }
  return { insert, matched, review };
}

function toApcDocument(reference) {
  const { provenance, ...document } = reference;
  return {
    ...document,
    // Consultation is not verification or certification.
    informationSources: [{ label: `APC — consulta ${provenance.consultedAt}`, url: reference.sourceUrl }],
  };
}

module.exports = { buildApcImportPlan, toApcDocument };
