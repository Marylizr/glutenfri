import { useState, useMemo } from 'react';
import MapView from '../components/MapView';
import RestaurantCard from '../components/RestaurantCard';
import Filters from '../components/Filters';
import PublicPageHeader from '../components/PublicPageHeader';
import ErrorState from '../components/ErrorState';
import { useUserLocation } from '../hooks/useUserLocation';
import { useLanguage } from '../i18n/index.jsx';
import useEstablishmentList from '../hooks/useEstablishmentList.js';
import { filterEstablishments } from '../utils/establishmentFilters.js';

// Vista "Map" del bottom nav: mapa + lista debajo (mobile-first,
// a diferencia del layout de dos columnas fijas de la versión anterior).
export default function HomePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const { t } = useLanguage();
  const { establishments, loading, error, reload } = useEstablishmentList();
  const [filters, setFilters] = useState({});
  const { position } = useUserLocation();

  const filtered = useMemo(() => {
    return filterEstablishments(establishments, filters);
  }, [establishments, filters]);

  if (loading) return <div role="status" style={{ padding: 24 }}>{t('loading')}</div>;

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="map-page">
      <PublicPageHeader
        title={t('map')}
        action={<Filters filters={filters} onChange={setFilters} />}
        className="map-page__header"
      />

      <div className="map-page__surface">
        <MapView establishments={filtered} center={position} />
      </div>

      <div className="map-page__results">
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
            {t('noResults')}
          </div>
        )}
      </div>
    </div>
  );
}
