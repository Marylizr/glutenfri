import { useState } from 'react';
import { getEstablishmentPhotoUrl } from '../services/establishments';

const TYPE_META = {
  restaurant: { emoji: '🍽️', gradient: 'linear-gradient(135deg, #e9dfc9, #d8c9a3)' },
  bakery: { emoji: '🥐', gradient: 'linear-gradient(135deg, #f0ddd0, #e3c3ad)' },
  store: { emoji: '🌿', gradient: 'linear-gradient(135deg, #dce6d6, #c3d4b8)' },
  pharmacy: { emoji: '💊', gradient: 'linear-gradient(135deg, #d9e3e6, #b9cdd2)' },
  supermarket: { emoji: '🛒', gradient: 'linear-gradient(135deg, #e6ded0, #cfc2a8)' },
};

// Si el establecimiento tiene una foto real de Google (hasPhoto), la
// pedimos al backend, que la resuelve en vivo — nunca la persistimos acá
// ni del lado del servidor. Si falla la carga (foto removida, error de
// red, etc.) cae al ícono genérico en vez de romper el layout.
export default function PhotoPlaceholder({ type, establishmentId, hasPhoto, height = 140 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const meta = TYPE_META[type] || TYPE_META.restaurant;

  if (hasPhoto && establishmentId && !imageFailed) {
    return (
      <img
        src={getEstablishmentPhotoUrl(establishmentId, height >= 200 ? 800 : 400)}
        alt={type}
        onError={() => setImageFailed(true)}
        style={{
          height,
          width: '100%',
          objectFit: 'cover',
          borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      style={{
        height,
        borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
        background: meta.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
      }}
      role="img"
      aria-label={type}
    >
      {meta.emoji}
    </div>
  );
}
