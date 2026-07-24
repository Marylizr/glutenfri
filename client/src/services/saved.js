import api from './api';
import { requireList } from './responseValidation';

export const getSaved = () =>
  api.get('/users/me/saved').then((res) => requireList(res.data, 'lista de guardados'));

export const saveEstablishment = (id) => api.post(`/users/me/saved/${id}`).then((res) => res.data);

export const unsaveEstablishment = (id) =>
  api.delete(`/users/me/saved/${id}`).then((res) => res.data);
