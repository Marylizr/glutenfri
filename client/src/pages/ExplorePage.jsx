import { useState, useMemo } from 'react';
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

export default function ExplorePage({ onSelectEstablishment, savedIds, onToggleSaved }) {
  const { language, t } = useLanguage();
  const { establishments, loading, error, reload } = useEstablishmentList();
  const [query, setQuery] = useState('');
  const [type, setType] = useState(undefined);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const { position } = useUserLocation();

  const filtered = useMemo(() => {
    return filterEstablishments(establishments, {
      type,
      query,
      language,
      certifiedOnly,
    });
  }, [establishments, type, query, language, certifiedOnly]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PublicPageHeader
        title={t('explore')}
        action={(
          <ExploreFiltersButton
            certifiedOnly={certifiedOnly}
            onCertifiedChange={setCertifiedOnly}
          />
        )}
      >
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t('search')}
        />
      </PublicPageHeader>

      <div className="explore-controls">
        <div className="explore-controls__categories">
          <CategoryChips value={type} onChange={setType} />
        </div>
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
        {loading && <div role="status" style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>}

        {!loading && error && <ErrorState message={error} onRetry={reload} />}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', padding: '24px 0', textAlign: 'center' }}>
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
  );
}
