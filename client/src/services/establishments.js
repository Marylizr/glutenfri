import api from './api';

export const getEstablishments = (params = {}) =>
  api.get('/establishments', { params }).then((res) => res.data);

export const getEstablishmentById = (id) =>
  api.get(`/establishments/${id}`).then((res) => res.data);

export const getReviews = (establishmentId) =>
  api.get(`/establishments/${establishmentId}/reviews`).then((res) => res.data);

export const postReview = (establishmentId, review) =>
  api.post(`/establishments/${establishmentId}/reviews`, review).then((res) => res.data);
