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
import SharePlaceButton from '../components/SharePlaceButton.jsx';
import BusinessClaimDialog from '../components/BusinessClaimDialog.jsx';
import { recordBusinessEvent } from '../services/business.js';
import EstablishmentSeo from '../components/EstablishmentSeo.jsx';
import {
  getBooleanCommunityState,
  getRiskCommunityState,
} from '../utils/communitySignals.js';

const DETAIL_COPY = {
  'pt-PT': {
    staff: { poor: 'Fraca', okay: 'Razoável', excellent: 'Excelente' },
    risk: { none: 'Nenhum', low: 'Baixo', moderate: 'Moderado', high: 'Elevado' },
    communityTitle: 'O que a comunidade partilhou',
    communityNotice: 'Estas informações refletem experiências individuais e não substituem a confirmação direta com o estabelecimento.',
    dedicatedKitchen: 'Cozinha exclusiva sem glúten',
    dedicatedMenu: 'Menu sem glúten disponível',
    staffUnderstanding: 'Equipa preparada para atender',
    riskLevel: 'Risco indicado pela comunidade',
    communityStates: {
      yes: 'Sim', no: 'Não', unreported: 'Não reportado',
      'risk-none': 'Nenhum indicado', 'risk-low': 'Baixo',
      'risk-moderate': 'Moderado', 'risk-high': 'Elevado',
    },
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
    sponsored: 'Patrocinado',
    website: 'Website', menu: 'Menu', reserve: 'Reservar', order: 'Encomendar', whatsapp: 'WhatsApp',
  },
  en: {
    staff: { poor: 'Poor', okay: 'Fair', excellent: 'Excellent' },
    risk: { none: 'None', low: 'Low', moderate: 'Moderate', high: 'High' },
    communityTitle: 'What the community shared',
    communityNotice: 'This information reflects individual experiences and does not replace checking directly with the establishment.',
    dedicatedKitchen: 'Dedicated gluten-free kitchen',
    dedicatedMenu: 'Gluten-free menu available',
    staffUnderstanding: 'Staff prepared to assist',
    riskLevel: 'Risk indicated by the community',
    communityStates: {
      yes: 'Yes', no: 'No', unreported: 'Not reported',
      'risk-none': 'None indicated', 'risk-low': 'Low',
      'risk-moderate': 'Moderate', 'risk-high': 'High',
    },
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
    sponsored: 'Sponsored',
    website: 'Website', menu: 'Menu', reserve: 'Reserve', order: 'Order', whatsapp: 'WhatsApp',
  },
  es: {
    staff: { poor: 'Mala', okay: 'Regular', excellent: 'Excelente' },
    risk: { none: 'Ninguno', low: 'Bajo', moderate: 'Moderado', high: 'Elevado' },
    communityTitle: 'Lo que compartió la comunidad',
    communityNotice: 'Esta información refleja experiencias individuales y no sustituye la confirmación directa con el establecimiento.',
    dedicatedKitchen: 'Cocina exclusiva sin gluten',
    dedicatedMenu: 'Menú sin gluten disponible',
    staffUnderstanding: 'Equipo preparado para atender',
    riskLevel: 'Riesgo indicado por la comunidad',
    communityStates: {
      yes: 'Sí', no: 'No', unreported: 'No reportado',
      'risk-none': 'Ninguno indicado', 'risk-low': 'Bajo',
      'risk-moderate': 'Moderado', 'risk-high': 'Elevado',
    },
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
    sponsored: 'Patrocinado',
    website: 'Web', menu: 'Menú', reserve: 'Reservar', order: 'Pedir', whatsapp: 'WhatsApp',
  },
};

const PROTOCOL_FIELDS = ['dedicatedKitchen', 'dedicatedGlutenFreeMenu', 'staffTrained', 'riskLevel'];

function CommunitySignalRow({ icon, label, state, stateLabel }) {
  return (
    <div className="community-signal">
      <dt>
        <span className="material-symbols-outlined community-signal__icon" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </dt>
      <dd>
        <span className={`community-signal__status is-${state}`}>{stateLabel}</span>
      </dd>
    </div>
  );
}

function CommunityExperienceSignals({ establishment, copy }) {
  const hasAny = PROTOCOL_FIELDS.some((k) => establishment[k] !== undefined && establishment[k] !== null);
  if (!hasAny) return null;

  const rows = [
    {
      key: 'kitchen',
      icon: 'dining',
      label: copy.dedicatedKitchen,
      state: getBooleanCommunityState(establishment.dedicatedKitchen),
    },
    {
      key: 'menu',
      icon: 'menu_book_2',
      label: copy.dedicatedMenu,
      state: getBooleanCommunityState(establishment.dedicatedGlutenFreeMenu),
    },
    {
      key: 'staff',
      icon: 'chef_hat',
      label: copy.staffUnderstanding,
      state: getBooleanCommunityState(establishment.staffTrained),
    },
    {
      key: 'risk',
      icon: 'warning',
      label: copy.riskLevel,
      state: getRiskCommunityState(establishment.riskLevel),
    },
  ];

  return (
    <section className="community-signals" aria-labelledby="community-signals-heading">
      <h2 id="community-signals-heading">{copy.communityTitle}</h2>
      <p className="community-signals__notice">
        {copy.communityNotice}
      </p>
      <dl className="community-signals__list">
        {rows.map((row) => (
          <CommunitySignalRow
            key={row.key}
            icon={row.icon}
            label={row.label}
            state={row.state}
            stateLabel={copy.communityStates[row.state]}
          />
        ))}
      </dl>
    </section>
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
        {copy.staff[review.staffUnderstanding] && (
          <span style={{ fontSize: '11px', background: 'var(--color-accent-soft)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
            {copy.staffLabel}: {copy.staff[review.staffUnderstanding]}
          </span>
        )}
        {typeof review.hasDedicatedMenu === 'boolean' && (
          <span style={{ fontSize: '11px', background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
            {copy.dedicatedMenu}: {review.hasDedicatedMenu ? copy.yes : copy.no}
          </span>
        )}
        {typeof review.dedicatedKitchen === 'boolean' && (
          <span style={{ fontSize: '11px', background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
            {copy.dedicatedKitchen}: {review.dedicatedKitchen ? copy.yes : copy.no}
          </span>
        )}
        {copy.risk[review.riskLevel] && (
          <span style={{ fontSize: '11px', background: 'var(--color-warn-soft)', color: 'var(--color-warn)', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>
            {copy.riskLevel}: {copy.risk[review.riskLevel]}
          </span>
        )}
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

  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    const key = `gf:impression:${establishment._id}:${day}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    recordBusinessEvent(
      establishment._id,
      'detail_impression',
      `detail:${establishment._id}:${day}:${crypto.randomUUID?.() || Date.now()}`
    );
  }, [establishment._id]);

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
        auth={auth}
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
    recordBusinessEvent(establishment._id, 'directions_click');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="establishment-detail">
      <EstablishmentSeo establishment={establishment} />
      <div className="establishment-detail__scroll">
        <div className="establishment-detail__hero">
          <PhotoPlaceholder
            type={establishment.type}
            establishmentId={establishment._id}
            hasPhoto={establishment.hasPhoto}
            name={establishment.name}
            height={220}
          />
          <button
            type="button"
            className="establishment-detail__back"
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
          <div className="establishment-detail__hero-tools">
            <SharePlaceButton establishment={establishment} onShared={() => recordBusinessEvent(establishment._id, 'share_click')} />
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

        <div className="establishment-detail__content" style={{ padding: '28px 16px 16px' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>{establishment.name}</h1>
          {establishment.sponsorship?.status === 'active' && (
            <span className="sponsored-label">{copy.sponsored}</span>
          )}
          {establishment.businessDescription && (
            <p className="establishment-detail__description">{establishment.businessDescription}</p>
          )}
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
          {(establishment.websiteUrl || establishment.menuUrl || establishment.reservationUrl ||
            establishment.orderUrl || establishment.whatsapp) && (
            <nav className="establishment-detail__commercial-links" aria-label={t('placeActions')}>
              {[
                ['websiteUrl', copy.website, 'website_click'],
                ['menuUrl', copy.menu, 'menu_click'],
                ['reservationUrl', copy.reserve, 'reservation_click'],
                ['orderUrl', copy.order, 'order_click'],
              ].map(([field, label, eventType]) => establishment[field] && (
                <a
                  key={field}
                  className="establishment-detail__action"
                  href={establishment[field]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordBusinessEvent(establishment._id, eventType)}
                >
                  {label}
                </a>
              ))}
              {establishment.whatsapp && (
                <a
                  className="establishment-detail__action"
                  href={`https://wa.me/${String(establishment.whatsapp).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordBusinessEvent(establishment._id, 'whatsapp_click')}
                >
                  {copy.whatsapp}
                </a>
              )}
            </nav>
          )}
          <CommunityExperienceSignals establishment={establishment} copy={copy} />
          <BusinessClaimDialog establishment={establishment} auth={auth} />

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

      {(establishment.phone || establishment.lat || establishment.address) && (
        <div
          className="establishment-detail__actions"
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
            <ActionButton onClick={() => {
              recordBusinessEvent(establishment._id, 'phone_click');
              window.open(`tel:${establishment.phone}`, '_self');
            }}>
              {copy.call}
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}
