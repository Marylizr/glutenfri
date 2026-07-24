import { useState, useEffect } from 'react';

// Centro aproximado del corredor Braga–Porto. Así, sin permiso de ubicación,
// el mapa representa la cobertura regional en vez de una sola ciudad.
const DEFAULT_POSITION = { lat: 41.32, lng: -8.55 };

export function useUserLocation() {
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPermissionDenied(true)
    );
  }, []);

  return { position, permissionDenied };
}
