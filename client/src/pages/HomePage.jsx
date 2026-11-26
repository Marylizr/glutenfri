import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LazyMapView from '../components/LazyMapView';
import RestaurantCard from '../components/RestaurantCard';
import ExploreFiltersButton from '../components/ExploreFiltersButton.jsx';
import SearchBar from '../components/SearchBar.jsx';
import DiscoveryIntent from '../components/DiscoveryIntent.jsx';
import PublicPageHeader from '../components/PublicPageHeader';
import PublicFooter from '../components/PublicFooter.jsx';
import ErrorState from '../components/ErrorState';
import { useLanguage } from '../i18n/index.jsx';
import useDiscovery from '../hooks/useDiscovery.js';
import { clearRefinements, getAdvancedFilterCount } from '../utils/establishmentFilters.js';
import { getMappableEstablishments } from '../utils/trustStatus.js';

// Vista "Map" del bottom nav: mapa + lista debajo (mobile-first,
// a diferencia del layout de dos columnas fijas de la versión anterior).
export default function HomePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const { t } = useLanguage();
  const { loading, error, reload, filtered, state, updateState, available, position, mapCenter, status, requestLocation, search } = useDiscovery();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!selectedId) return;
    document
      .querySelector(`[data-establishment-id="${CSS.escape(selectedId)}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedId]);

  if (loading) return <div role="status" style={{ padding: 24 }}>{t('loading')}</div>;

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="map-page">
      <PublicPageHeader
        title={t('map')}
        action={<ExploreFiltersButton filters={state} available={available} onChange={updateState} sort={state.sort} onSortChange={(sort) => updateState({ sort })} locationStatus={status} onRequestLocation={requestLocation} />}
        className="map-page__header"
      ><SearchBar value={state.query} onChange={(query) => updateState({ query }, true)} placeholder={t('search')} /></PublicPageHeader>
      <DiscoveryIntent value={state.intent} onChange={(intent) => updateState({ intent, type: undefined })} />
      <Link to={`/explorar?${search}`}>{t('listResults')}</Link>
      {state.openNowOnly && <p>{t('openUnknownNotice')}</p>}
      {getMappableEstablishments(filtered).length < filtered.length && <p>{t('mapMissing')}</p>}

      <div className="map-page__surface" role="region" aria-label={t('mapRegionLabel')}>
        <LazyMapView
          establishments={filtered}
          center={mapCenter}
          onSelectEstablishment={onSelectEstablishment}
          selectedId={selectedId}
          onHighlightEstablishment={(establishment) => setSelectedId(establishment._id)}
        />
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
            selected={selectedId === e._id}
            onHighlight={(establishment) => setSelectedId(establishment._id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 16, color: 'var(--color-text-muted)' }}>
            {t('noResults')}
            {(state.type || state.intent || getAdvancedFilterCount(state) > 0) && <button className="place-open" type="button" onClick={() => updateState(clearRefinements(state))}>{t('clearRefinements')}</button>}
          </div>
        )}
        <PublicFooter />
      </div>
    </div>
  );
}
