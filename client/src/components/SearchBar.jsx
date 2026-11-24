import { useLanguage } from '../i18n';

export default function SearchBar({ value, onChange, placeholder }) {
  const { t } = useLanguage();
  return (
    <div
      className="search-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
      }}
    >
      <span className="material-symbols-outlined search-bar__icon" aria-hidden="true">search</span>
      <input
        type="search"
        aria-label={placeholder || t('search')}
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
