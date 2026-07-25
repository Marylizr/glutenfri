// En Netlify, frontend y API comparten dominio y /api apunta a Functions.
// En desarrollo se mantiene Express en el puerto 4000.
// En Capacitor sí hay que definir VITE_API_URL con la URL pública completa.
const runtimeEnv = import.meta.env || {};
const API_URL =
  runtimeEnv.VITE_API_URL ||
  (runtimeEnv.DEV ? 'http://localhost:4000/api' : '/api');

export default API_URL;
