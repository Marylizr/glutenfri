import api from './api';

export const getSaved = () => api.get('/users/me/saved').then((res) => res.data);

export const saveEstablishment = (id) => api.post(`/users/me/saved/${id}`).then((res) => res.data);

export const unsaveEstablishment = (id) =>
  api.delete(`/users/me/saved/${id}`).then((res) => res.data);
