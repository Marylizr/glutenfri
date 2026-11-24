import { useLanguage } from '../i18n/index.jsx';

export default function SaveButton({ saved, onToggle, size = 44 }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className="save-button"
      aria-pressed={Boolean(saved)}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={saved ? t('removeSaved') : t('savePlace')}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size <= 34 ? '16px' : '18px',
        color: saved ? 'var(--color-warn)' : 'var(--color-text-muted)',
        flexShrink: 0,
      }}
    >
      <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
    </button>
  );
}
