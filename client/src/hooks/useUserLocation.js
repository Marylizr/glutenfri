import { useCallback, useState } from 'react';

// Centro aproximado del corredor Braga–Porto. Así, sin permiso de ubicación,
// el mapa representa la cobertura regional en vez de una sola ciudad.
const DEFAULT_POSITION = { lat: 41.32, lng: -8.55 };

export function useUserLocation() {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('idle');

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ lat: result.coords.latitude, lng: result.coords.longitude });
        setStatus('granted');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return {
    position,
    mapCenter: position || DEFAULT_POSITION,
    status,
    permissionDenied: status === 'denied',
    requestLocation,
  };
}
