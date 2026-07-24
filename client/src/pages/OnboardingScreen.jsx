const FEATURES = [
  { icon: '✓', text: 'Lugares sin gluten verificados' },
  { icon: '★', text: 'Reseñas de la comunidad celíaca' },
  { icon: '⚲', text: 'Filtros pensados para celíacos' },
];

export default function OnboardingScreen({ onStart, onLogin }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'linear-gradient(180deg, #e9dfc9 0%, var(--color-bg) 55%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          alignSelf: 'flex-start',
          background: 'var(--color-accent-soft)',
          color: 'var(--color-accent)',
          fontSize: '12px',
          fontWeight: 700,
          padding: '6px 12px',
          borderRadius: 'var(--radius-pill)',
          marginBottom: 'auto',
          marginTop: '40px',
        }}
      >
        🌿 100% sin gluten
      </div>

      <h1 style={{ fontSize: '30px', lineHeight: 1.2, marginBottom: '12px' }}>
        Encuentra lugares seguros sin gluten en Braga
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginBottom: '20px' }}>
        Descubre restaurantes, tiendas y farmacias sin gluten en el norte de Portugal, con reseñas
        reales de la comunidad celíaca.
      </p>

      <div style={{ marginBottom: '28px' }}>
        {FEATURES.map((f) => (
          <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0,
              }}
            >
              {f.icon}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{f.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 'var(--radius-input)',
          border: 'none',
          background: 'var(--color-accent)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '12px',
        }}
      >
        Empezar a explorar →
      </button>

      <button
        onClick={onLogin}
        style={{
          width: '100%',
          padding: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
}
