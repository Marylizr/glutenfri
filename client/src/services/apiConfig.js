// Centralización de API URL — mismo patrón que SweatMate.
// En Capacitor (móvil), import.meta.env.VITE_API_URL debe apuntar al backend
// desplegado (Koyeb/Render), NUNCA a localhost, porque el WebView de
// Capacitor no puede resolver localhost del host.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default API_URL;
