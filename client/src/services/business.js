import api from './api';

export const createBusinessClaim = (establishmentId, data) =>
  api.post(`/business/establishments/${establishmentId}/claims`, data).then((response) => response.data);
export const getBusinessClaims = () =>
  api.get('/business/claims').then((response) => response.data);
export const addBusinessClaimInformation = (claimId, data) =>
  api.patch(`/business/claims/${claimId}/information`, data).then((response) => response.data);
export const getManagedEstablishments = () =>
  api.get('/business/establishments').then((response) => response.data);
export const getBusinessDashboard = (id) =>
  api.get(`/business/establishments/${id}`).then((response) => response.data);
export const createBusinessChange = (id, changes, submit = true) =>
  api.post(`/business/establishments/${id}/changes`, { changes, submit }).then((response) => response.data);
export const getBusinessAnalytics = (id, period = '30d') =>
  api.get(`/business/establishments/${id}/analytics`, { params: { period } }).then((response) => response.data);
export const getBusinessPromotion = (id) =>
  api.get(`/business/establishments/${id}/promotion`).then((response) => response.data);

function eventId(type, establishmentId) {
  const random = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${type}:${establishmentId}:${random}`.replace(/[^a-zA-Z0-9:_-]/g, '');
}

export const recordBusinessEvent = (establishmentId, type, fixedId) =>
  api
    .post(`/business/analytics/establishments/${establishmentId}/events`, {
      type,
      eventId: fixedId || eventId(type, establishmentId),
    })
    .catch(() => null);
