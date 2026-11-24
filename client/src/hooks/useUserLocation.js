import { useCallback, useState } from 'react';

// Vista nacional sin solicitar ubicación; las islas se incluyen al ajustar
// el mapa a los establecimientos que tengan coordenadas publicadas.
const DEFAULT_POSITION = { lat: 39.5, lng: -8 };

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
