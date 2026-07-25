import { lazy, Suspense } from 'react';
import { useLanguage } from '../i18n/index.jsx';

const MapView = lazy(() => import('./MapView.jsx'));

export default function LazyMapView(props) {
  const { t } = useLanguage();

  return (
    <Suspense
      fallback={<div className="map-loading" role="status">{t('loading')}</div>}
    >
      <MapView {...props} />
    </Suspense>
  );
}
