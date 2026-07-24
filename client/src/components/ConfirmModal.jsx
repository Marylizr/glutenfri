export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
  confirming,
  children,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(43, 38, 32, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          padding: '22px',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          {message}
        </p>
        {children}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={confirming}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-input)',
              border: 'none',
              background: danger ? 'var(--color-warn)' : 'var(--color-accent)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {confirming ? 'Un momento…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
