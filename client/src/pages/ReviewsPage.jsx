import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoginRequiredState from '../components/LoginRequiredState';
import ReportButton from '../components/ReportButton';
import PublicPageHeader from '../components/PublicPageHeader';
import PublicFooter from '../components/PublicFooter.jsx';
import { getEstablishmentById } from '../services/establishments';
import { getMyReviews, getRecentReviews } from '../services/reviews';
import { formatRelativeTime } from '../utils/time';
import { useLanguage } from '../i18n/index.jsx';

const TYPE_EMOJI = {
  restaurant: '🍽️',
  bakery: '🥐',
  store: '🌿',
  pharmacy: '💊',
  supermarket: '🛒',
};

const REVIEWS_COPY = {
  'pt-PT': {
    risk: { none: 'Nenhum risco observado', low: 'Risco baixo reportado', moderate: 'Risco moderado reportado', high: 'Risco alto reportado' },
    place: 'Estabelecimento', user: 'Utilizador', title: 'Avaliações', community: 'Comunidade', mine: 'As minhas avaliações',
    loadError: 'Não foi possível carregar as avaliações. Tenta novamente.', moreError: 'Não foi possível carregar mais avaliações. Tenta novamente.',
    loginTitle: 'As tuas avaliações num só lugar', loginMessage: 'Inicia sessão para veres as avaliações que publicaste.',
    firstTitle: 'Ainda não existem experiências publicadas', firstMessage: 'Explora um local e partilha a tua experiência individual.',
    mineTitle: 'Ainda não publicaste avaliações', mineMessage: 'Explora um local e partilha a tua experiência com a comunidade.',
    explore: 'Explorar locais', more: 'Carregar mais',
  },
  en: {
    risk: { none: 'No risk observed', low: 'Low risk reported', moderate: 'Moderate risk reported', high: 'High risk reported' },
    place: 'Establishment', user: 'User', title: 'Reviews', community: 'Community', mine: 'My reviews',
    loadError: 'We could not load the reviews. Please try again.', moreError: 'We could not load more reviews. Please try again.',
    loginTitle: 'Your reviews in one place', loginMessage: 'Log in to view reviews you have published.',
    firstTitle: 'No experiences have been published yet', firstMessage: 'Explore a place and share your individual experience.',
    mineTitle: 'You have not published any reviews yet', mineMessage: 'Explore a place and share your experience with the community.',
    explore: 'Explore places', more: 'Load more',
  },
  es: {
    risk: { none: 'Ningún riesgo observado', low: 'Riesgo bajo reportado', moderate: 'Riesgo moderado reportado', high: 'Riesgo alto reportado' },
    place: 'Establecimiento', user: 'Usuario', title: 'Reseñas', community: 'Comunidad', mine: 'Mis reseñas',
    loadError: 'No pudimos cargar las reseñas. Intenta de nuevo.', moreError: 'No pudimos cargar más reseñas. Intenta de nuevo.',
    loginTitle: 'Tus reseñas en un solo lugar', loginMessage: 'Inicia sesión para ver las reseñas que has publicado.',
    firstTitle: 'Todavía no hay experiencias publicadas', firstMessage: 'Explora un lugar y comparte tu experiencia individual.',
    mineTitle: 'Todavía no has publicado reseñas', mineMessage: 'Explora un lugar y comparte tu experiencia con la comunidad.',
    explore: 'Explorar lugares', more: 'Cargar más',
  },
};

function RiskBadge({ level, labels }) {
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
      {labels[level] || level}
    </span>
  );
}

function ReviewFeedCard({ review, onOpenEstablishment, auth, copy, language }) {
  const est = review.establishment;
  return (
    <div
      className="review-feed-card"
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
          <span>{est?.name || copy.place}</span>
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
        <span>{review.user?.name || copy.user}</span>
        <span>·</span>
        <span>{formatRelativeTime(review.createdAt, language)}</span>
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
        <RiskBadge level={review.riskLevel} labels={copy.risk} />
        <ReportButton reviewId={review._id} auth={auth} />
      </div>
    </div>
  );
}

export default function ReviewsPage({ auth, onSelectEstablishment, onGoToProfile, onGoToExplore }) {
  const { language, t } = useLanguage();
  const copy = REVIEWS_COPY[language];
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
      .catch(() => setError(copy.loadError))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, auth.user, copy.loadError]);

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
      .catch(() => setError(copy.moreError))
      .finally(() => setLoadingMore(false));
  };

  const handleOpenEstablishment = (id) => {
    getEstablishmentById(id).then(onSelectEstablishment);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PublicPageHeader title={copy.title}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'community', label: copy.community },
            { key: 'mine', label: copy.mine },
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
      </PublicPageHeader>

      <main className="reviews-page__content">
        {mode === 'mine' && !auth.user ? (
          <LoginRequiredState
            icon="✎"
            title={copy.loginTitle}
            message={copy.loginMessage}
            onGoToProfile={onGoToProfile}
          />
        ) : (
          <>
            {loading && <div style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>}

            {!loading && error && <ErrorState message={error} onRetry={load} />}

            {!loading && !error && reviews.length === 0 && mode === 'community' && (
              <EmptyState
                icon="✎"
                title={copy.firstTitle}
                message={copy.firstMessage}
                actionLabel={copy.explore}
                onAction={onGoToExplore}
              />
            )}

            {!loading && !error && reviews.length === 0 && mode === 'mine' && (
              <EmptyState
                icon="✎"
                title={copy.mineTitle}
                message={copy.mineMessage}
                actionLabel={copy.explore}
                onAction={onGoToExplore}
              />
            )}

            {!loading && !error && reviews.length > 0 && (
              <div className="reviews-page__grid">
              {reviews.map((r) => (
                <ReviewFeedCard
                  key={r._id}
                  review={r}
                  onOpenEstablishment={handleOpenEstablishment}
                  auth={auth}
                  copy={copy}
                  language={language}
                />
              ))}
              </div>
            )}

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
                {loadingMore ? t('loading') : copy.more}
              </button>
            )}
          </>
        )}
        <PublicFooter />
      </main>
    </div>
  );
}
