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
    'pt-PT': { error: 'Não foi possível carregar este local. Tenta novamente.', missing: 'Não encontrámos este local.', home: 'Voltar ao início' },
    en: { error: 'We could not load this place. Please try again.', missing: 'We could not find this place.', home: 'Back to home' },
    es: { error: 'No pudimos cargar este lugar. Intenta de nuevo.', missing: 'No encontramos este lugar.', home: 'Volver al inicio' },
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
  // historial propio), no hay a dónde volver dentro de la app — Inicio.
  const handleBack = () => {
    if (location.state?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>{t('loading')}</div>;
  }

  if (error || !establishment) {
    return (
      <div style={{ padding: '16px' }}>
        <ErrorState message={error || copy.missing} onRetry={load} />
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'block',
            margin: '12px auto 0',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
          }}
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
