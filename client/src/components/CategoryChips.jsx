const CHIPS = [
  { value: undefined, label: 'Todos' },
  { value: 'restaurant', label: 'Restaurantes' },
  { value: 'bakery', label: 'Pastelerías' },
  { value: 'store', label: 'Tiendas' },
  { value: 'pharmacy', label: 'Farmacias' },
  { value: 'supermarket', label: 'Supermercados' },
];

export default function CategoryChips({ value, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '2px 0 4px',
        scrollbarWidth: 'none',
      }}
    >
      {CHIPS.map((chip) => {
        const active = value === chip.value;
        return (
          <button
            key={chip.label}
            onClick={() => onChange(chip.value)}
            style={{
              flexShrink: 0,
              border: active ? 'none' : '1px solid var(--color-border)',
              background: active ? 'var(--color-accent)' : 'var(--color-surface)',
              color: active ? '#fff' : 'var(--color-text)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
