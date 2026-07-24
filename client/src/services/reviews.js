import api from './api';
import { requirePaginated } from './responseValidation';

export const getRecentReviews = (params = {}) =>
  api
    .get('/reviews/recent', { params })
    .then((res) => requirePaginated(res.data, 'lista paginada de reseñas'));

export const getMyReviews = (params = {}) =>
  api
    .get('/users/me/reviews', { params })
    .then((res) => requirePaginated(res.data, 'lista paginada de reseñas'));

export const reportReview = (reviewId, data) =>
  api.post(`/reviews/${reviewId}/report`, data).then((res) => res.data);
