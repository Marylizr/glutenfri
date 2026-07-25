import { useLanguage } from '../i18n/index.jsx';

export default function CategoryChips({ value, onChange }) {
  const { t } = useLanguage();
  const chips = [
    { value: undefined, label: t('all') },
    { value: 'restaurant', label: t('restaurants') },
    { value: 'bakery', label: t('bakeries') },
    { value: 'store', label: t('stores') },
    { value: 'pharmacy', label: t('pharmacies') },
    { value: 'supermarket', label: t('supermarkets') },
  ];
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
      {chips.map((chip) => {
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
