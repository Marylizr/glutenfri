import PhotoPlaceholder from './PhotoPlaceholder';
import ScoreBadge from './ScoreBadge';
import SaveButton from './SaveButton';
import { distanceKm, formatDistance } from '../utils/distance';

export function Badge({ establishment }) {
  // Prioridad: certificación oficial APC > señal de Google no verificada.
  if (establishment.certified) {
    return (
      <span
        style={{
          background: 'var(--color-accent-soft)',
          color: 'var(--color-accent)',
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: 'var(--radius-pill)',
        }}
      >
        ✓ Certificado APC
      </span>
    );
  }
  if (establishment.notes) {
    return (
      <span
        style={{
          background: 'var(--color-warn-soft)',
          color: 'var(--color-warn)',
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: 'var(--radius-pill)',
        }}
      >
        Sin verificar
      </span>
    );
  }
  return null;
}

export default function RestaurantCard({
  establishment,
  userPosition,
  onSelect,
  saved,
  onToggleSaved,
}) {
  const km = distanceKm(userPosition, establishment);

  return (
    <div
      onClick={() => onSelect?.(establishment)}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative' }}>
        <PhotoPlaceholder type={establishment.type} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <Badge establishment={establishment} />
        </div>
        {onToggleSaved && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <SaveButton saved={saved} onToggle={() => onToggleSaved(establishment._id)} />
          </div>
        )}
        {establishment.avgRating && (
          <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
            <ScoreBadge rating={establishment.avgRating} size={36} />
          </div>
        )}
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '4px',
          }}
        >
          {establishment.name}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
          }}
        >
          {km != null && <span>{formatDistance(km)}</span>}
          {establishment.discount && (
            <>
              {km != null && <span>·</span>}
              <span style={{ color: 'var(--color-accent)' }}>{establishment.discount}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
