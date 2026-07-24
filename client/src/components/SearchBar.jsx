export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-input)',
        padding: '10px 14px',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="var(--color-text-muted)" strokeWidth="2" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Buscar restaurantes sin gluten…'}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          flex: 1,
          fontSize: '15px',
          color: 'var(--color-text)',
        }}
      />
    </div>
  );
}
