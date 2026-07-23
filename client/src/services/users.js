import api from './api';

export const exportMyData = () => api.get('/users/me/export').then((res) => res.data);

export const deleteMyAccount = () => api.delete('/users/me');
