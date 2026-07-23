const TYPE_META = {
  restaurant: { emoji: '🍽️', gradient: 'linear-gradient(135deg, #e9dfc9, #d8c9a3)' },
  bakery: { emoji: '🥐', gradient: 'linear-gradient(135deg, #f0ddd0, #e3c3ad)' },
  store: { emoji: '🌿', gradient: 'linear-gradient(135deg, #dce6d6, #c3d4b8)' },
  pharmacy: { emoji: '💊', gradient: 'linear-gradient(135deg, #d9e3e6, #b9cdd2)' },
  supermarket: { emoji: '🛒', gradient: 'linear-gradient(135deg, #e6ded0, #cfc2a8)' },
};

export default function PhotoPlaceholder({ type, height = 140 }) {
  const meta = TYPE_META[type] || TYPE_META.restaurant;
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
