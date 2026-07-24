import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoginRequiredState from '../components/LoginRequiredState';
import ReportButton from '../components/ReportButton';
import { getEstablishmentById } from '../services/establishments';
import { getMyReviews, getRecentReviews } from '../services/reviews';
import { formatRelativeTime } from '../utils/time';

const TYPE_EMOJI = {
  restaurant: '🍽️',
  bakery: '🥐',
  store: '🌿',
  pharmacy: '💊',
  supermarket: '🛒',
};

const RISK_LABELS = {
  none: 'Sin riesgo',
  low: 'Riesgo bajo',
  moderate: 'Riesgo moderado',
  high: 'Riesgo alto',
};

function RiskBadge({ level }) {
  if (!level) return null;
  const isHigh = level === 'moderate' || level === 'high';
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: 'var(--radius-pill)',
        background: isHigh ? 'var(--color-warn-soft)' : 'var(--color-accent-soft)',
        color: isHigh ? 'var(--color-warn)' : 'var(--color-accent)',
      }}
    >
      {RISK_LABELS[level] || level}
    </span>
  );
}

function ReviewFeedCard({ review, onOpenEstablishment, auth }) {
  const est = review.establishment;
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        padding: '14px 16px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <button
          onClick={() => est?._id && onOpenEstablishment(est._id)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--color-text)',
            textAlign: 'left',
          }}
        >
          <span>{TYPE_EMOJI[est?.type] || '📍'}</span>
          <span>{est?.name || 'Establecimiento'}</span>
        </button>
        <span style={{ marginLeft: 'auto', color: 'var(--color-accent)', fontWeight: 600, fontSize: '14px' }}>
          ⭐ {review.rating}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          marginBottom: '8px',
        }}
      >
        <span>{review.user?.name || 'Usuario'}</span>
        <span>·</span>
        <span>{formatRelativeTime(review.createdAt)}</span>
      </div>

      {review.comment && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text)',
            margin: '0 0 8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {review.comment}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <RiskBadge level={review.riskLevel} />
        <ReportButton reviewId={review._id} auth={auth} />
      </div>
    </div>
  );
}

export default function ReviewsPage({ auth, onSelectEstablishment, onGoToProfile, onGoToExplore }) {
  const [mode, setMode] = useState('community'); // 'community' | 'mine'
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchPage = mode === 'mine' ? getMyReviews : getRecentReviews;

  const load = useCallback(() => {
    if (mode === 'mine' && !auth.user) return;
    setLoading(true);
    setError(null);
    fetchPage({ page: 1 })
      .then((res) => {
        setReviews(res.data);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => setError('No pudimos cargar las reseñas. Intenta de nuevo.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, auth.user]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = () => {
    setLoadingMore(true);
    fetchPage({ page: page + 1 })
      .then((res) => {
        setReviews((prev) => [...prev, ...res.data]);
        setPage(res.page);
        setTotalPages(res.totalPages);
      })
      .catch(() => setError('No pudimos cargar más reseñas. Intenta de nuevo.'))
      .finally(() => setLoadingMore(false));
  };

  const handleOpenEstablishment = (id) => {
    getEstablishmentById(id).then(onSelectEstablishment);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ fontSize: '22px', marginBottom: '14px' }}>Reseñas</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'community', label: 'Comunidad' },
            { key: 'mine', label: 'Mis reseñas' },
          ].map((t) => {
            const active = mode === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                style={{
                  flex: 1,
                  border: active ? 'none' : '1px solid var(--color-border)',
                  background: active ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: active ? '#fff' : 'var(--color-text)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
        {mode === 'mine' && !auth.user ? (
          <LoginRequiredState
            icon="✎"
            title="Tus reseñas en un solo lugar"
            message="Iniciá sesión para ver las reseñas que dejaste."
            onGoToProfile={onGoToProfile}
          />
        ) : (
          <>
            {loading && <div style={{ color: 'var(--color-text-muted)' }}>Cargando…</div>}

            {!loading && error && <ErrorState message={error} onRetry={load} />}

            {!loading && !error && reviews.length === 0 && mode === 'community' && (
              <EmptyState
                icon="✎"
                title="Sé la primera en dejar una reseña esta semana"
                message="Todavía no hay reseñas de la comunidad. Explorá un lugar y contá cómo te fue."
                actionLabel="Explorar lugares"
                onAction={onGoToExplore}
              />
            )}

            {!loading && !error && reviews.length === 0 && mode === 'mine' && (
              <EmptyState
                icon="✎"
                title="Todavía no dejaste ninguna reseña"
                message="Explorá un lugar y contá tu experiencia — ayuda a otros celíacos a elegir con confianza."
                actionLabel="Explorar lugares"
                onAction={onGoToExplore}
              />
            )}

            {!loading &&
              !error &&
              reviews.map((r) => (
                <ReviewFeedCard
                  key={r._id}
                  review={r}
                  onOpenEstablishment={handleOpenEstablishment}
                  auth={auth}
                />
              ))}

            {!loading && !error && reviews.length > 0 && page < totalPages && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginTop: '4px',
                }}
              >
                {loadingMore ? 'Cargando…' : 'Cargar más'}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
