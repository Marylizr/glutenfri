import axios from 'axios';
import API_URL from './apiConfig';

const TOKEN_KEY = 'gf_auth_token';
const USER_KEY = 'gf_auth_user';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token unificado — mismo patrón de storage que SweatMate para que
// la migración a Capacitor (Preferences API) sea directa más adelante.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sesión expirada: si YA había un token guardado y el backend devuelve 401,
// es porque el JWT venció (o es inválido) — no un usuario anónimo que nunca
// inició sesión (esos casos ya se filtran antes de llamar a la API, o se
// manejan en el propio componente con un mensaje inline). Limpiamos el
// token guardado y avisamos a useAuth vía evento para que redirija a login
// con un mensaje claro, en vez de dejar la promesa rechazada sin manejar.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const hadToken = !!localStorage.getItem(TOKEN_KEY);
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event('gf:session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
