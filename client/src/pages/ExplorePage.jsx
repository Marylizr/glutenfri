import { useEffect, useState, useMemo, useCallback } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import RestaurantCard from '../components/RestaurantCard';
import ErrorState from '../components/ErrorState';
import { getEstablishments } from '../services/establishments';
import { useUserLocation } from '../hooks/useUserLocation';

export default function ExplorePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState(undefined);
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
      if (type && e.type !== type) return false;
      if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [establishments, type, query]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 8px' }}>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginBottom: '2px',
          }}
        >
          📍 Braga, Portugal
        </div>
        <h1 style={{ fontSize: '22px', marginBottom: '14px' }}>Explora sin gluten</h1>
        <SearchBar value={query} onChange={setQuery} />
      </header>

      <div style={{ padding: '0 16px' }}>
        <CategoryChips value={type} onChange={setType} />
      </div>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {loading && <div style={{ color: 'var(--color-text-muted)' }}>Cargando…</div>}

        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', padding: '24px 0', textAlign: 'center' }}>
            No encontramos sitios con esos filtros.
          </div>
        )}

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
      </main>
    </div>
  );
}
