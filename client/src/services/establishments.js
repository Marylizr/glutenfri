import api from './api';

// El backend pagina (page/limit) y devuelve { data, page, limit, total,
// totalPages }. El frontend hoy no tiene UI de paginación — con el default
// limit=100 del backend, esto sigue trayendo todo el dataset actual (72)
// en una sola llamada, igual que antes.
export const getEstablishments = (params = {}) =>
  api.get('/establishments', { params }).then((res) => res.data.data);

export const getEstablishmentById = (id) =>
  api.get(`/establishments/${id}`).then((res) => res.data);

export const getReviews = (establishmentId) =>
  api.get(`/establishments/${establishmentId}/reviews`).then((res) => res.data);

export const postReview = (establishmentId, review) =>
  api.post(`/establishments/${establishmentId}/reviews`, review).then((res) => res.data);
