export function requireList(payload, label = 'lista') {
  const list = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(list)) {
    throw new TypeError(`La API devolvió una ${label} inválida.`);
  }
  return list;
}

export function requirePaginated(payload, label = 'respuesta paginada') {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.data)) {
    throw new TypeError(`La API devolvió una ${label} inválida.`);
  }
  return payload;
}
