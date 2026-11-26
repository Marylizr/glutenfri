export function registerServiceWorker() {
  if (import.meta.env.VITE_NATIVE_APP === 'true') return;
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {
      // La aplicación continúa completamente funcional sin service worker.
    });
  });
}
