import api from './api';
import { requireAuthSession, requireAuthUser } from '../utils/authReliability.js';

export const registerUser = (data) => api.post('/auth/register', data).then((res) => requireAuthSession(res.data));

export const loginUser = (data) => api.post('/auth/login', data).then((res) => requireAuthSession(res.data));

export const getCurrentUser = () => api.get('/auth/me').then((res) => requireAuthUser(res.data.user));
export const getRecoveryStatus = () => api.get('/auth/recovery-status').then(res => res.data.available === true);
export const requestPasswordReset = email => api.post('/auth/forgot-password', { email });
export const completePasswordReset = data => api.post('/auth/reset-password', data);
