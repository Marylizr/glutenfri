import api from './api';

export const getAdminDashboard = () =>
  api.get('/admin/dashboard').then((response) => response.data);

export const getReportedReviews = (params = {}) =>
  api.get('/admin/reviews/reported', { params }).then((response) => response.data.data);

export const hideReview = (reviewId, reason) =>
  api.patch(`/admin/reviews/${reviewId}/hide`, { reason }).then((response) => response.data);

export const restoreReview = (reviewId, reason) =>
  api.patch(`/admin/reviews/${reviewId}/unhide`, { reason }).then((response) => response.data);

export const getUsers = (params = {}) =>
  api.get('/admin/users', { params }).then((response) => response.data.data);

export const setUserAdmin = (userId, isAdmin) =>
  api
    .patch(`/admin/users/${userId}/admin`, { isAdmin })
    .then((response) => response.data.user);

export const setUserSuspension = (userId, data) =>
  api.patch(`/admin/users/${userId}/suspension`, data).then((response) => response.data.user);

export const getAdminEstablishments = (params = {}) =>
  api.get('/admin/establishments', { params }).then((response) => response.data);

export const createAdminEstablishment = (data) =>
  api.post('/admin/establishments', data).then((response) => response.data);

export const updateAdminEstablishment = (establishmentId, data) =>
  api.patch(`/admin/establishments/${establishmentId}`, data).then((response) => response.data);

export const getAuditLog = (params = {}) =>
  api.get('/admin/audit', { params }).then((response) => response.data);

export const getSystemStatus = () => api.get('/admin/system').then((response) => response.data);

export const triggerGooglePlacesRefresh = () =>
  api.post('/admin/system/google-places/refresh').then((response) => response.data);
