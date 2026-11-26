import PhotoPlaceholder from './PhotoPlaceholder';
import ScoreBadge from './ScoreBadge';
import SaveButton from './SaveButton';
import GoogleAttribution from './GoogleAttribution';
import { isGoogleSourced } from '../utils/googlePlaces';
import { distanceKm, formatDistance } from '../utils/distance';
import TrustBadge from './TrustBadge.jsx';
import { Link } from 'react-router-dom';
import { formatVerificationDate, useLanguage } from '../i18n/index.jsx';
import { getEstablishmentCity } from '../utils/establishmentData.js';
import { decisionFacts } from '../utils/placeDecision.js';

export function Badge({ establishment }) {
  return <TrustBadge establishment={establishment} />;
}

export default function RestaurantCard({
  establishment,
  userPosition,
  onSelect,
  saved,
  onToggleSaved,
  selected = false,
  onHighlight,
}) {
  const { language, t } = useLanguage();
  const km = distanceKm(userPosition, establishment);
  const facts = decisionFacts(establishment);
  const lastChecked = formatVerificationDate(
    facts.sourceReviewedAt,
    language
  );
  const hasSource = Boolean(establishment.sourceName);
  const hasTrustMetadata = hasSource || Boolean(lastChecked);
  const city = getEstablishmentCity(establishment);

  return (
    <div
      className={`restaurant-card${selected ? ' is-selected' : ''}`}
      data-establishment-id={establishment._id}
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect?.(establishment)}
      onMouseEnter={() => onHighlight?.(establishment)}
      style={{
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div className="restaurant-card__media" style={{ position: 'relative' }}>
        <PhotoPlaceholder
          type={establishment.type}
          establishmentId={establishment._id}
          hasPhoto={establishment.hasPhoto}
          name={establishment.name}
        />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge establishment={establishment} />
        </div>
        {onToggleSaved && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <SaveButton saved={saved} onToggle={() => onToggleSaved(establishment._id)} />
          </div>
        )}
        {Number.isFinite(establishment.avgRating) && establishment.avgRating > 0 && (
          <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
            <ScoreBadge rating={establishment.avgRating} size={36} label={t('generalRating')} />
          </div>
        )}
      </div>

      <div className="restaurant-card__content" style={{ padding: '12px 14px' }}>
        <button
          type="button"
          className="restaurant-card__title"
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.(establishment);
          }}
          onFocus={() => onHighlight?.(establishment)}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '4px',
          }}
        >
          {establishment.name}
        </button>

        {city && (
          <p className="restaurant-card__location" aria-label={`${t('address')}: ${city}`}>
            <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
            <span>{city}</span>
          </p>
        )}
        {!city && <p>{t('cityUnknown')}</p>}
        <p className="restaurant-card__offer">{facts.offer || t(`category_${establishment.informationCategory || 'community_information'}`)}</p>
        {facts.closed && <p className="place-unavailable">{t('placeUnavailable')}</p>}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
          }}
        >
          {km != null && <span>{formatDistance(km, language)}</span>}
          {establishment.discount && (
            <>
              {km != null && <span>·</span>}
              <span style={{ color: 'var(--color-accent)' }}>{t('commercialDiscount')}: {establishment.discount}</span>
            </>
          )}
        </div>

        {isGoogleSourced(establishment) && (
          <div style={{ marginTop: '4px' }}>
            <GoogleAttribution compact />
          </div>
        )}
        {hasTrustMetadata && (
          <div className="restaurant-card__metadata">
            {hasSource && <div><strong>{t('source')}:</strong> {establishment.sourceName}</div>}
            <div><strong>{t('sourceReviewDate')}:</strong> {lastChecked || t('dateMissing')}</div>
          </div>
        )}
        {!hasTrustMetadata && <p className="restaurant-card__metadata">{t('sourceMissing')} · {t('dateMissing')}</p>}
        <button className="place-open" type="button" onClick={(event) => { event.stopPropagation(); onSelect?.(establishment); }}>{t('openPlace')}</button>
        <Link
          to="/informacion-sin-gluten"
          onClick={(event) => event.stopPropagation()}
          style={{ display: 'inline-block', marginTop: 8, color: 'var(--color-accent)', fontSize: 12 }}
        >
          {t('understandCategory')}
        </Link>
      </div>
    </div>
  );
}
