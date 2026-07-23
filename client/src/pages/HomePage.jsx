import { useEffect, useState, useMemo, useCallback } from 'react';
import MapView from '../components/MapView';
import RestaurantCard from '../components/RestaurantCard';
import Filters from '../components/Filters';
import ErrorState from '../components/ErrorState';
import { getEstablishments } from '../services/establishments';
import { useUserLocation } from '../hooks/useUserLocation';

// Vista "Map" del bottom nav: mapa + lista debajo (mobile-first,
// a diferencia del layout de dos columnas fijas de la versión anterior).
export default function HomePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const [establishments, setEstablishments] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { position } = useUserLocation();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getEstablishments()
      .then(setEstablishments)
      .catch(() => setError('No pudimos cargar los establecimientos. Intenta de nuevo.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return establishments.filter((e) => {
      if (filters.type && e.type !== filters.type) return false;
      if (filters.certifiedOnly && !e.certified) return false;
      if (filters.discountOnly && !e.discount) return false;
      return true;
    });
  }, [establishments, filters]);

  if (loading) return <div style={{ padding: 24 }}>Cargando establecimientos…</div>;

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Filters filters={filters} onChange={setFilters} />
      <div style={{ height: '45%', minHeight: '200px' }}>
        <MapView establishments={filtered} center={position} />
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {filtered.map((e) => (
          <RestaurantCard
            key={e._id || e.name}
            establishment={e}
            userPosition={position}
            onSelect={onSelectEstablishment}
            saved={savedIds?.has(e._id)}
            onToggleSaved={onToggleSaved}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 16, color: 'var(--color-text-muted)' }}>
            Sin resultados con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
