import { useCallback, useState } from 'react';
import { requestUserPosition } from '../native/location.js';

// Vista nacional sin solicitar ubicación; las islas se incluyen al ajustar
// el mapa a los establecimientos que tengan coordenadas publicadas.
const DEFAULT_POSITION = { lat: 39.5, lng: -8 };

export function useUserLocation() {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('idle');

  const requestLocation = useCallback(async () => {
    setStatus('requesting');
    try {
      setPosition(await requestUserPosition());
      setStatus('granted');
    } catch (error) {
      setStatus(error.code === 'unavailable' ? 'unavailable' : 'denied');
    }
  }, []);

  return {
    position,
    mapCenter: position || DEFAULT_POSITION,
    status,
    permissionDenied: status === 'denied',
    requestLocation,
  };
}
