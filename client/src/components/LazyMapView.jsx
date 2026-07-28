import { Component, lazy, Suspense } from 'react';
import { useLanguage } from '../i18n/index.jsx';

const MapView = lazy(() => import('./MapView.jsx'));

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function LazyMapView(props) {
  const { t } = useLanguage();

  return (
    <MapErrorBoundary
      fallback={<div className="map-loading" role="status">{t('mapUnavailable')}</div>}
    >
      <Suspense
        fallback={<div className="map-loading" role="status">{t('loading')}</div>}
      >
        <MapView {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
}
