// En Netlify, frontend y API comparten dominio y /api apunta a Functions.
// En desarrollo se mantiene Express en el puerto 4000.
// En Capacitor sí hay que definir VITE_API_URL con la URL pública completa.
import { validateMobileApiUrl } from '../native/config.js';

const runtimeEnv = import.meta.env || {};
const API_URL =
  runtimeEnv.VITE_API_URL ||
  (runtimeEnv.DEV ? 'http://localhost:4000/api' : '/api');

if (runtimeEnv.VITE_NATIVE_APP === 'true') validateMobileApiUrl(API_URL);

export default API_URL;
