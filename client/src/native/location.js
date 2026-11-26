import { isNativeRuntime } from './platform.js';

export async function requestUserPosition({
  native = isNativeRuntime(),
  webGeolocation = globalThis.navigator?.geolocation,
  loadNative = () => import('@capacitor/geolocation'),
} = {}) {
  let position;
  if (native) {
    const { Geolocation } = await loadNative();
    const permission = await Geolocation.requestPermissions({ permissions: ['coarseLocation'] });
    if (permission.coarseLocation !== 'granted' && permission.location !== 'granted') {
      throw Object.assign(new Error('location_denied'), { code: 'denied' });
    }
    position = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  } else {
    if (!webGeolocation) throw Object.assign(new Error('location_unavailable'), { code: 'unavailable' });
    position = await new Promise((resolve, reject) => webGeolocation.getCurrentPosition(
      resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    ));
  }
  // Kept in memory only. Coordinates are never sent to the backend.
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}
