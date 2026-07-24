import api from './api';

export const getRecentReviews = (params = {}) =>
  api.get('/reviews/recent', { params }).then((res) => res.data);

export const getMyReviews = (params = {}) =>
  api.get('/users/me/reviews', { params }).then((res) => res.data);

export const reportReview = (reviewId, data) =>
  api.post(`/reviews/${reviewId}/report`, data).then((res) => res.data);
