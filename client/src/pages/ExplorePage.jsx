import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CategoryChips from '../components/CategoryChips';
import PublicPageHeader from '../components/PublicPageHeader';
import RestaurantCard from '../components/RestaurantCard';
import MasonryGrid from '../components/MasonryGrid.jsx';
import ErrorState from '../components/ErrorState';
import { useLanguage } from '../i18n/index.jsx';
import PublicFooter from '../components/PublicFooter.jsx';
import useDiscovery from '../hooks/useDiscovery.js';
import DiscoveryIntent from '../components/DiscoveryIntent.jsx';
import ExploreFiltersButton from '../components/ExploreFiltersButton.jsx';
import { clearRefinements, getAdvancedFilterCount } from '../utils/establishmentFilters.js';

export default function ExplorePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const { t, tp } = useLanguage();
  const { establishments, loading, error, reload, state, position, status: locationStatus, requestLocation, available, filtered, updateState, search } = useDiscovery();

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
        <DiscoveryIntent value={state.intent} onChange={(intent) => updateState({ intent, type: undefined })} />
        <div className="explore-controls__categories">
          <CategoryChips value={state.type} onChange={(type) => updateState({ type, intent: undefined })} />
        </div>
        <Link to={`/mapa?${search}`}>{t('mapResults')}</Link>
        {state.openNowOnly && <p>{t('openUnknownNotice')}</p>}
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
              <p>{t(establishments.length === 0 ? 'emptyCatalogue' : 'noMatchesQuery')}</p>
              {establishments.length > 0 && (state.type || state.intent || getAdvancedFilterCount(state) > 0) && <button className="place-open" type="button" onClick={() => updateState(clearRefinements(state))}>{t('clearRefinements')}</button>}
            </div>
          )}

          {filtered.length > 0 && <MasonryGrid>{filtered.map((e) => (
            <RestaurantCard
              key={e._id || e.name}
              establishment={e}
              userPosition={position}
              onSelect={onSelectEstablishment}
              saved={savedIds?.has(e._id)}
              onToggleSaved={onToggleSaved}
            />
          ))}</MasonryGrid>}
          {!loading && !error && <PublicFooter />}
        </main>
      </div>
    </div>
  );
}
