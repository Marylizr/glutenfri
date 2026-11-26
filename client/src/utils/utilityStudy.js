// QA only. No storage, listener, network, identifiers or timestamps by default.
export const STUDY_TASKS = Object.freeze(['city', 'compare', 'source', 'contact', 'empty', 'save', 'report']);
export const STUDY_EVENTS = Object.freeze(['intent', 'results', 'empty', 'detail', 'menu', 'phone', 'directions', 'report']);
export function studyEvent(type, context = {}) {
  if (!STUDY_EVENTS.includes(type)) return null;
  const detail = { type };
  if (['eat', 'bakery', 'shop', 'all'].includes(context.intent)) detail.intent = context.intent;
  if (['zero', 'one', 'many'].includes(context.results)) detail.results = context.results;
  return detail;
}
export function summarizeStudy(rows = []) {
  // Input is observer-coded task outcomes, not harvested app traffic.
  const valid = rows.filter((row) => STUDY_TASKS.includes(row.task) && typeof row.success === 'boolean' && typeof row.understoodSource === 'boolean' && Number.isFinite(row.seconds) && row.seconds >= 0);
  return STUDY_TASKS.map((task) => {
    const attempts = valid.filter((row) => row.task === task);
    const times = attempts.map((row) => row.seconds).sort((a, b) => a - b);
    return { task, attempts: attempts.length, success: attempts.filter((r) => r.success).length, understoodSource: attempts.filter((r) => r.understoodSource).length,
      medianSeconds: times.length ? (times[Math.floor((times.length - 1) / 2)] + times[Math.ceil((times.length - 1) / 2)]) / 2 : null };
  });
}
