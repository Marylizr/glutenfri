export function classifyEstablishmentError(error) {
  if (error?.code === 'ERR_CANCELED' || error?.name === 'AbortError') return 'cancelled';
  if (error instanceof TypeError) return 'invalid';
  if (error?.response) return 'http';
  return 'network';
}

export function establishmentErrorKey(error) {
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return 'authTimeout';
  if (error?.response?.status === 429) return 'authRateLimited';
  if (error?.response?.status >= 500) return 'authUnavailable';
  return { http: 'loadHttpError', invalid: 'loadDataError', network: 'loadNetworkError' }[classifyEstablishmentError(error)];
}

export function createRequestGate() {
  let current = 0;
  return {
    next() {
      current += 1;
      return current;
    },
    isCurrent(id) {
      return id === current;
    },
    invalidate() {
      current += 1;
    },
  };
}
