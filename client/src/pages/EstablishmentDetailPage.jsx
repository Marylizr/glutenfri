import { useEffect, useState, useCallback } from 'react';
import { Badge } from '../components/RestaurantCard';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import ScoreBadge from '../components/ScoreBadge';
import SaveButton from '../components/SaveButton';
import GoogleAttribution, { isGoogleSourced } from '../components/GoogleAttribution';
import SafetyReviewFlow from '../components/SafetyReviewFlow';
import ErrorState from '../components/ErrorState';
import { getReviews } from '../services/establishments';

const STAFF_LABELS = {
  poor: 'Malo',
  okay: 'Regular',
  excellent: 'Excelente',
};

const RISK_LABELS = {
  none: 'Ninguno',
  low: 'Bajo',
  moderate: 'Moderado',
  high: 'Alto',
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

function SafetyProtocols({ establishment }) {
  const hasAny = PROTOCOL_FIELDS.some((k) => establishment[k] !== undefined && establishment[k] !== null);
  if (!hasAny) return null;

  return (
    <>
      <h2 style={{ fontSize: '16px', marginBottom: '4px' }}>Protocolos de seguridad celíaca</h2>
      <div style={{ marginBottom: '20px' }}>
        <ProtocolRow icon="🍳" label="Cocina dedicada" active={establishment.dedicatedKitchen} />
        <ProtocolRow icon="📋" label="Menú 100% sin gluten" active={establishment.dedicatedGlutenFreeMenu} />
        <ProtocolRow icon="🎓" label="Personal capacitado" active={establishment.staffTrained} />
        {establishment.riskLevel != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Nivel de riesgo</span>
            <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-text)' }}>
              {RISK_LABELS[establishment.riskLevel] || establishment.riskLevel}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

function ReviewItem({ review }) {
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
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{review.user?.name || 'Usuario'}</span>
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
          Personal: {STAFF_LABELS[review.staffUnderstanding] || '—'}
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
          Menú dedicado: {review.hasDedicatedMenu ? 'Sí' : 'No'}
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
          Cocina dedicada: {review.dedicatedKitchen ? 'Sí' : 'No'}
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
          Riesgo: {RISK_LABELS[review.riskLevel] || '—'}
        </span>
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
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const loadReviews = useCallback(() => {
    setLoadingReviews(true);
    setReviewsError(null);
    getReviews(establishment._id)
      .then(setReviews)
      .catch(() => setReviewsError('No pudimos cargar las reseñas. Intenta de nuevo.'))
      .finally(() => setLoadingReviews(false));
  }, [establishment._id]);

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
          <PhotoPlaceholder type={establishment.type} height={220} />
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
            aria-label="Volver"
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

          <SafetyProtocols establishment={establishment} />

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
            {myReview ? 'Editar mi reseña' : 'Dejar reseña (Safety Review)'}
          </button>

          <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Reseñas de la comunidad</h2>
          {loadingReviews && <div style={{ color: 'var(--color-text-muted)' }}>Cargando…</div>}
          {!loadingReviews && reviewsError && (
            <ErrorState message={reviewsError} onRetry={loadReviews} />
          )}
          {!loadingReviews && !reviewsError && reviews.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Todavía no hay reseñas. ¡Sé la primera en dejar una!
            </div>
          )}
          {reviews.map((r) => (
            <ReviewItem key={r._id} review={r} />
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
            Cómo llegar
          </ActionButton>
          {establishment.phone && (
            <ActionButton onClick={() => window.open(`tel:${establishment.phone}`, '_self')}>
              Llamar
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}
