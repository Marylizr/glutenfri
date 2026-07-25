import { useLanguage } from '../i18n/index.jsx';

export default function ErrorState({ message, onRetry }) {
  const { t } = useLanguage();
  return (
    <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚠️</div>
      <p style={{ marginBottom: onRetry ? '16px' : 0, fontSize: '14px' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-input)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {t('retry')}
        </button>
      )}
    </div>
  );
}
