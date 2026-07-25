import { useEffect, useState, useCallback } from 'react';
import { Badge } from '../components/RestaurantCard';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import ScoreBadge from '../components/ScoreBadge';
import SaveButton from '../components/SaveButton';
import GoogleAttribution from '../components/GoogleAttribution';
import { isGoogleSourced } from '../utils/googlePlaces';
import SafetyReviewFlow from '../components/SafetyReviewFlow';
import ErrorState from '../components/ErrorState';
import ReportButton from '../components/ReportButton';
import { getReviews } from '../services/establishments';
import TrustDetails from '../components/TrustDetails.jsx';
import { useLanguage } from '../i18n/index.jsx';

const DETAIL_COPY = {
  'pt-PT': {
    staff: { poor: 'Fraca', okay: 'Razoável', excellent: 'Excelente' },
    risk: { none: 'Nenhum', low: 'Baixo', moderate: 'Moderado', high: 'Alto' },
    communityTitle: 'Informação comunicada pela comunidade',
    communityNotice: 'Estas respostas descrevem experiências individuais e não constituem uma verificação nem uma garantia.',
    dedicatedKitchen: 'Cozinha dedicada declarada',
    dedicatedMenu: 'Menu específico sem glúten declarado',
    staffUnderstanding: 'Compreensão da equipa reportada',
    riskLevel: 'Nível de risco reportado',
    user: 'Utilizador',
    staffLabel: 'Equipa',
    yes: 'Sim',
    no: 'Não',
    editReview: 'Editar a minha avaliação',
    leaveReview: 'Partilhar uma experiência',
    communityReviews: 'Experiências da comunidade',
    reviewError: 'Não foi possível carregar as avaliações. Tenta novamente.',
    noReviews: 'Ainda não existem experiências publicadas.',
    directions: 'Como chegar',
    call: 'Ligar',
  },
  en: {
    staff: { poor: 'Poor', okay: 'Fair', excellent: 'Excellent' },
    risk: { none: 'None', low: 'Low', moderate: 'Moderate', high: 'High' },
    communityTitle: 'Information shared by the community',
    communityNotice: 'These answers describe individual experiences and are not verification or a guarantee.',
    dedicatedKitchen: 'Dedicated kitchen reported',
    dedicatedMenu: 'Specific gluten-free menu reported',
    staffUnderstanding: 'Staff understanding reported',
    riskLevel: 'Reported risk level',
    user: 'User',
    staffLabel: 'Staff',
    yes: 'Yes',
    no: 'No',
    editReview: 'Edit my review',
    leaveReview: 'Share an experience',
    communityReviews: 'Community experiences',
    reviewError: 'We could not load the reviews. Please try again.',
    noReviews: 'No community experiences have been published yet.',
    directions: 'Directions',
    call: 'Call',
  },
  es: {
    staff: { poor: 'Mala', okay: 'Regular', excellent: 'Excelente' },
    risk: { none: 'Ninguno', low: 'Bajo', moderate: 'Moderado', high: 'Alto' },
    communityTitle: 'Información comunicada por la comunidad',
    communityNotice: 'Estas respuestas describen experiencias individuales y no constituyen una verificación ni una garantía.',
    dedicatedKitchen: 'Cocina dedicada declarada',
    dedicatedMenu: 'Menú específico sin gluten declarado',
    staffUnderstanding: 'Comprensión del personal reportada',
    riskLevel: 'Nivel de riesgo reportado',
    user: 'Usuario',
    staffLabel: 'Personal',
    yes: 'Sí',
    no: 'No',
    editReview: 'Editar mi reseña',
    leaveReview: 'Compartir una experiencia',
    communityReviews: 'Experiencias de la comunidad',
    reviewError: 'No pudimos cargar las reseñas. Intenta de nuevo.',
    noReviews: 'Todavía no hay experiencias publicadas.',
    directions: 'Cómo llegar',
    call: 'Llamar',
  },
};

const PROTOCOL_FIELDS = ['dedicatedKitchen', 'dedicatedGlutenFreeMenu', 'staffTrained', 'riskLevel'];

function ProtocolRow({ icon, label, active }) {
  if (active === undefined || active === null) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>
      <span
        style={{
          marginLeft: 'auto',
          color: active ? 'var(--color-accent)' : 'var(--color-warn)',
          fontWeight: 700,
        }}
      >
        {active ? '✓' : '✕'}
      </span>
    </div>
  );
}

function CommunityExperienceSignals({ establishment, copy }) {
  const hasAny = PROTOCOL_FIELDS.some((k) => establishment[k] !== undefined && establishment[k] !== null);
  if (!hasAny) return null;

  return (
    <>
      <h2 style={{ fontSize: '16px', marginBottom: '4px' }}>{copy.communityTitle}</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 12, lineHeight: 1.45 }}>
        {copy.communityNotice}
      </p>
      <div style={{ marginBottom: '20px' }}>
        <ProtocolRow icon="🍳" label={copy.dedicatedKitchen} active={establishment.dedicatedKitchen} />
        <ProtocolRow icon="📋" label={copy.dedicatedMenu} active={establishment.dedicatedGlutenFreeMenu} />
        <ProtocolRow icon="🎓" label={copy.staffUnderstanding} active={establishment.staffTrained} />
        {establishment.riskLevel != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{copy.riskLevel}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-text)' }}>
              {copy.risk[establishment.riskLevel] || establishment.riskLevel}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

function ReviewItem({ review, auth, copy }) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.user?.name || copy.user}</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>⭐ {review.rating}</span>
      </div>
      {review.comment && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text)',
            margin: '0 0 10px',
            fontStyle: 'italic',
          }}
        >
          “{review.comment}”
        </p>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '11px',
            background: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {copy.staffLabel}: {copy.staff[review.staffUnderstanding] || '—'}
        </span>
        <span
          style={{
            fontSize: '11px',
            background: 'var(--color-surface-alt)',
            color: 'var(--color-text-muted)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {copy.dedicatedMenu}: {review.hasDedicatedMenu ? copy.yes : copy.no}
        </span>
        <span
          style={{
            fontSize: '11px',
            background: 'var(--color-surface-alt)',
            color: 'var(--color-text-muted)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {copy.dedicatedKitchen}: {review.dedicatedKitchen ? copy.yes : copy.no}
        </span>
        <span
          style={{
            fontSize: '11px',
            background: 'var(--color-warn-soft)',
            color: 'var(--color-warn)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          {copy.riskLevel}: {copy.risk[review.riskLevel] || '—'}
        </span>
      </div>
      <div style={{ marginTop: '10px', textAlign: 'right' }}>
        <ReportButton reviewId={review._id} auth={auth} />
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '13px',
        borderRadius: 'var(--radius-input)',
        border: primary ? 'none' : '1px solid var(--color-border)',
        background: primary ? 'var(--color-accent)' : 'var(--color-surface)',
        color: primary ? '#fff' : 'var(--color-text)',
        fontSize: '15px',
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

export default function EstablishmentDetailPage({ establishment, onBack, saved, onToggleSaved, auth }) {
  const { language, t } = useLanguage();
  const copy = DETAIL_COPY[language];
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const loadReviews = useCallback(() => {
    setLoadingReviews(true);
    setReviewsError(null);
    getReviews(establishment._id)
      .then(setReviews)
      .catch(() => setReviewsError(copy.reviewError))
      .finally(() => setLoadingReviews(false));
  }, [copy.reviewError, establishment._id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Una reseña por usuario por establecimiento (el backend hace upsert) —
  // si ya dejó una, el Safety Review se abre precargado para editarla en
  // vez de arrancar en blanco.
  const myReview = auth?.user
    ? reviews.find((r) => r.user?._id === auth.user.id)
    : null;

  if (showReview) {
    return (
      <SafetyReviewFlow
        establishmentId={establishment._id}
        existingReview={myReview}
        onCancel={() => setShowReview(false)}
        onComplete={() => {
          setShowReview(false);
          loadReviews();
        }}
      />
    );
  }

  const handleDirections = () => {
    const query =
      establishment.lat && establishment.lng
        ? `${establishment.lat},${establishment.lng}`
        : establishment.address;
    if (!query) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ position: 'relative' }}>
          <PhotoPlaceholder
            type={establishment.type}
            establishmentId={establishment._id}
            hasPhoto={establishment.hasPhoto}
            name={establishment.name}
            height={220}
          />
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              color: 'var(--color-text)',
              fontSize: '16px',
              boxShadow: 'var(--shadow-card)',
            }}
            aria-label={t('back')}
          >
            ←
          </button>
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onToggleSaved && (
              <SaveButton saved={saved} onToggle={() => onToggleSaved(establishment._id)} />
            )}
            <Badge establishment={establishment} />
          </div>
          {establishment.avgRating && (
            <div style={{ position: 'absolute', bottom: -18, left: 16 }}>
              <ScoreBadge rating={establishment.avgRating} size={44} />
            </div>
          )}
        </div>

        <div style={{ padding: '28px 16px 16px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{establishment.name}</h1>
          {establishment.address && (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '4px' }}>
              {establishment.address}
            </p>
          )}
          {establishment.discount && (
            <p style={{ color: 'var(--color-accent)', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              {establishment.discount}
            </p>
          )}
          {isGoogleSourced(establishment) && (
            <div style={{ marginBottom: '16px' }}>
              <GoogleAttribution />
            </div>
          )}

          <TrustDetails establishment={establishment} />
          <CommunityExperienceSignals establishment={establishment} copy={copy} />

          <button
            onClick={() => setShowReview(true)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 'var(--radius-input)',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {myReview ? copy.editReview : copy.leaveReview}
          </button>

          <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>{copy.communityReviews}</h2>
          {loadingReviews && <div style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>}
          {!loadingReviews && reviewsError && (
            <ErrorState message={reviewsError} onRetry={loadReviews} />
          )}
          {!loadingReviews && !reviewsError && reviews.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              {copy.noReviews}
            </div>
          )}
          {reviews.map((r) => (
            <ReviewItem key={r._id} review={r} auth={auth} copy={copy} />
          ))}
        </div>
      </div>

      {(establishment.phone || establishment.lat) && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            padding: '12px 16px max(12px, env(safe-area-inset-bottom))',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <ActionButton primary onClick={handleDirections}>
            {copy.directions}
          </ActionButton>
          {establishment.phone && (
            <ActionButton onClick={() => window.open(`tel:${establishment.phone}`, '_self')}>
              {copy.call}
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}
