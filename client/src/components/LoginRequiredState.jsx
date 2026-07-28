import { useLanguage } from '../i18n/index.jsx';

export default function LoginRequiredState({ icon, title, message, onGoToProfile }) {
  const { language } = useLanguage();
  const label = { 'pt-PT': 'Iniciar sessão', en: 'Log in', es: 'Iniciar sesión' }[language];
  return (
    <div
      className="login-required-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
      <h1 style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onGoToProfile}
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
        {label}
      </button>
    </div>
  );
}
