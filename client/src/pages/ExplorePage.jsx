import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import PublicPageHeader from '../components/PublicPageHeader';
import RestaurantCard from '../components/RestaurantCard';
import ErrorState from '../components/ErrorState';
import { useUserLocation } from '../hooks/useUserLocation';
import { useLanguage } from '../i18n/index.jsx';
import PublicFooter from '../components/PublicFooter.jsx';
import useEstablishmentList from '../hooks/useEstablishmentList.js';
import { filterEstablishments } from '../utils/establishmentFilters.js';
import ExploreFiltersButton from '../components/ExploreFiltersButton.jsx';
import { getOpenStatus } from '../utils/openingHours.js';
import {
  parseExploreParams,
  serializeExploreParams,
  sortEstablishments,
} from '../utils/establishmentFilters.js';

export default function ExplorePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const { language, t, tp } = useLanguage();
  const { establishments, loading, error, reload } = useEstablishmentList();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseExploreParams(searchParams), [searchParams]);
  const { position, status: locationStatus, requestLocation } = useUserLocation();
  const available = useMemo(() => ({
    discount: establishments.some(
      (item) => Boolean(item.discount) && ['APC', 'APC+Google'].includes(item.source)
    ),
    delivery: establishments.some((item) => typeof item.delivery === 'boolean'),
    takeaway: establishments.some((item) => typeof item.takeaway === 'boolean'),
    hours: establishments.some((item) => item.weeklyHours && item.timezone),
  }), [establishments]);

  useEffect(() => {
    const canonical = serializeExploreParams(state);
    if (canonical.toString() !== searchParams.toString()) {
      setSearchParams(canonical, { replace: true });
    }
  }, [searchParams, setSearchParams, state]);

  useEffect(() => {
    if (loading) return;
    const patch = {};
    if (state.discountOnly && !available.discount) patch.discountOnly = false;
    if (state.deliveryOnly && !available.delivery) patch.deliveryOnly = false;
    if (state.takeawayOnly && !available.takeaway) patch.takeawayOnly = false;
    if (state.openNowOnly && !available.hours) patch.openNowOnly = false;
    if (Object.keys(patch).length) {
      setSearchParams(serializeExploreParams({ ...state, ...patch }), { replace: true });
    }
  }, [available, loading, setSearchParams, state]);
  const openStatusById = useMemo(
    () => Object.fromEntries(
      establishments.map((item) => [item._id, getOpenStatus(item).status])
    ),
    [establishments]
  );

  const updateState = (patch, replace = false) => {
    setSearchParams(serializeExploreParams({ ...state, ...patch }), { replace });
  };

  const filtered = useMemo(() => {
    const matches = filterEstablishments(establishments, {
      ...state,
      language,
      openStatusById,
    });
    return sortEstablishments(matches, state.sort, position);
  }, [establishments, language, openStatusById, position, state]);

  return (
    <div className="explore-page">
      <PublicPageHeader
        title={t('explore')}
        className="explore-page__header"
        action={(
          <ExploreFiltersButton
            filters={state}
            available={available}
            onChange={(patch) => updateState(patch)}
            sort={state.sort}
            onSortChange={(sort) => updateState({ sort })}
            locationStatus={locationStatus}
            onRequestLocation={requestLocation}
          />
        )}
      >
        <SearchBar
          value={state.query}
          onChange={(query) => updateState({ query }, true)}
          placeholder={t('search')}
        />
      </PublicPageHeader>

      <div className="explore-controls">
        <div className="explore-controls__categories">
          <CategoryChips value={state.type} onChange={(type) => updateState({ type })} />
        </div>
      </div>

      <div className="explore-page__body">
        <main className="explore-results" aria-live="polite">
          {!loading && !error && (
            <p className="explore-results__count">{tp('resultsCount', filtered.length)}</p>
          )}

          {loading && (
            <div className="explore-results__message" role="status" style={{ color: 'var(--color-text-muted)' }}>
              {t('loading')}
            </div>
          )}

          {!loading && error && (
            <div className="explore-results__message">
              <ErrorState message={error} onRetry={reload} />
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div
              className="explore-results__message"
              style={{ color: 'var(--color-text-muted)', padding: '24px 0', textAlign: 'center' }}
            >
              {t('noResults')}
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
          {!loading && !error && <PublicFooter />}
        </main>
      </div>
    </div>
  );
}
