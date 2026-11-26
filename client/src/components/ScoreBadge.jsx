// General rating only; never a food-safety score.
export default function ScoreBadge({ rating, size = 40, label }) {
  if (!Number.isFinite(rating) || rating <= 0) return null;

  const color = rating >= 4.5 ? 'var(--color-accent)' : 'var(--color-warn)';
  const softColor = rating >= 4.5 ? 'var(--color-accent-soft)' : 'var(--color-warn-soft)';

  return (
    <div
      aria-label={label ? `${label}: ${rating.toFixed(1)}` : undefined}
      title={label}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: softColor,
        border: `2px solid ${color}`,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size <= 32 ? '12px' : '14px',
        boxShadow: 'var(--shadow-card)',
        flexShrink: 0,
      }}
    >
      {rating.toFixed(1)}
    </div>
  );
}
