import { useState, useEffect } from 'react';

// Coordenadas por defecto: centro aproximado de Porto, para no dejar el mapa
// vacío mientras se resuelve el permiso de geolocalización.
const DEFAULT_POSITION = { lat: 41.1496, lng: -8.6109 };

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
