import { useLanguage } from '../i18n';

export default function SearchBar({ value, onChange, placeholder }) {
  const { t } = useLanguage();
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
      <span className="material-symbols-outlined search-bar__icon" aria-hidden="true">search</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('search')}
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
