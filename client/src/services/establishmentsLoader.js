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
      .then((payload) => normalizeEstablishmentPayload(payload))
      .finally(() => {
        if (inFlight?.promise === promise) inFlight = null;
      });
    inFlight = { key, promise };
    return promise;
  };
}
