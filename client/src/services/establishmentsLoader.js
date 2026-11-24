import { normalizeEstablishmentPayload } from '../utils/trustStatus.js';

export function createEstablishmentsLoader(request) {
  let inFlight = null;

  return (params = {}, { force = false } = {}) => {
    const key = JSON.stringify(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
    );
    if (!force && inFlight?.key === key) return inFlight.promise;

    const promise = request(params)
      .then(async (payload) => {
        const first = normalizeEstablishmentPayload(payload);
        if (params.page !== undefined || Array.isArray(payload) || payload.totalPages == null) return first;
        const totalPages = payload.totalPages;
        if (!Number.isInteger(totalPages) || totalPages < 0 || totalPages > 100) {
          throw new TypeError('Invalid directory pagination');
        }
        const records = [...first];
        for (let page = 2; page <= totalPages; page += 1) {
          const next = await request({ ...params, page, limit: payload.limit || params.limit || 100 });
          if (next.page !== page) throw new TypeError('Unexpected directory page');
          records.push(...normalizeEstablishmentPayload(next));
        }
        const seen = new Set();
        return records.filter((record) => {
          if (!record._id) return true;
          if (seen.has(record._id)) return false;
          seen.add(record._id);
          return true;
        });
      })
      .finally(() => {
        if (inFlight?.promise === promise) inFlight = null;
      });
    inFlight = { key, promise };
    return promise;
  };
}
