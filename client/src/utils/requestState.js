export function classifyEstablishmentError(error) {
  if (error?.code === 'ERR_CANCELED' || error?.name === 'AbortError') return 'cancelled';
  if (error instanceof TypeError) return 'invalid';
  if (error?.response) return 'http';
  return 'network';
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
