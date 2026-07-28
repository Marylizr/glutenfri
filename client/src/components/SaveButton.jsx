import { useLanguage } from '../i18n/index.jsx';

export default function SaveButton({ saved, onToggle, size = 34 }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
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
        background: 'rgba(255,255,255,0.9)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size <= 34 ? '16px' : '18px',
        color: saved ? 'var(--color-warn)' : 'var(--color-text-muted)',
        flexShrink: 0,
      }}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}
