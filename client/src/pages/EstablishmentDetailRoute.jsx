import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import EstablishmentDetailPage from './EstablishmentDetailPage';
import ErrorState from '../components/ErrorState';
import { getEstablishmentById } from '../services/establishments';
import { useLanguage } from '../i18n/index.jsx';

// Traduce /lugar/:id a la pantalla de detalle. Si llegamos acá desde un
// click dentro de la app (RestaurantCard, feed de reseñas), el
// establecimiento ya viene completo en location.state — evita un fetch
// redundante. Si es una carga directa por URL (link compartido, refresh),
// no hay state y lo pedimos al backend.
export default function EstablishmentDetailRoute({ auth, savedIds, onToggleSaved }) {
  const { language, t } = useLanguage();
  const copy = {
    'pt-PT': { error: 'Não foi possível carregar este local. Tenta novamente.', missing: 'Não encontrámos este local.', home: 'Voltar a explorar' },
    en: { error: 'We could not load this place. Please try again.', missing: 'We could not find this place.', home: 'Back to explore' },
    es: { error: 'No pudimos cargar este lugar. Intenta de nuevo.', missing: 'No encontramos este lugar.', home: 'Volver a explorar' },
  }[language];
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedEstablishment =
    location.state?.establishment?._id === id ? location.state.establishment : null;

  const [establishment, setEstablishment] = useState(passedEstablishment);
  const [loading, setLoading] = useState(!passedEstablishment);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getEstablishmentById(id)
      .then(setEstablishment)
      .catch(() => setError(copy.error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (establishment?._id === id) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Si vinimos de dentro de la app (hay backgroundLocation en el state),
  // "atrás" saca del historial del navegador y vuelve exactamente a la
  // pantalla y estado de donde salimos. Si es carga directa (sin
  // historial propio), no hay a dónde volver dentro de la app — Explorar.
  const handleBack = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate('/explorar', { replace: true });
    }
  };

  if (loading) {
    return <div className="establishment-detail-state" role="status">{t('loading')}</div>;
  }

  if (error || !establishment) {
    return (
      <div className="establishment-detail-state">
        <ErrorState message={error || copy.missing} onRetry={load} />
        <button
          type="button"
          className="establishment-detail-state__back"
          onClick={() => navigate('/explorar', { replace: true })}
        >
          {copy.home}
        </button>
      </div>
    );
  }

  return (
    <EstablishmentDetailPage
      establishment={establishment}
      onBack={handleBack}
      saved={savedIds?.has(establishment._id)}
      onToggleSaved={onToggleSaved}
      auth={auth}
    />
  );
}
