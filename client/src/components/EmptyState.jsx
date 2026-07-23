// Estado vacío invitador — para feeds/listas donde "no hay nada todavía"
// es una invitación a actuar, no un error ni una pantalla rota.
export default function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <h2 style={{ fontSize: '17px', marginBottom: '6px' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: onAction ? '20px' : 0 }}>
        {message}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-input)',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
