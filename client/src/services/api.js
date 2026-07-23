import axios from 'axios';
import API_URL from './apiConfig';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token unificado — mismo patrón de storage que SweatMate para que
// la migración a Capacitor (Preferences API) sea directa más adelante.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gf_auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
