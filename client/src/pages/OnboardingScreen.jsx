import HamburgerAssembly from '../components/HamburgerAssembly';

const FEATURES = [
  'Lugares sin gluten verificados',
  'Reseñas de seguridad de la comunidad',
  'Filtros pensados para personas celíacas',
];

export default function OnboardingScreen({ onStart, onLogin }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fffbed',
        padding: '10px 30px 24px',
        overflowY: 'auto',
      }}
    >
      <HamburgerAssembly />

      <h1
        style={{
          fontSize: '30px',
          lineHeight: 1.16,
          margin: '4px 0 14px',
          textAlign: 'center',
          letterSpacing: '-0.025em',
        }}
      >
        Encuentra lugares seguros
        <span style={{ display: 'block', color: '#a8462f' }}>sin gluten en el norte</span>
      </h1>
      <p
        style={{
          color: '#65504a',
          fontSize: '15px',
          lineHeight: 1.5,
          margin: '0 auto 20px',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        Descubre restaurantes, cafeterías, tiendas y pastelerías de Braga, Porto, Maia,
        Matosinhos y alrededores.
      </p>

      <div style={{ width: '100%', maxWidth: '330px', margin: '0 auto 18px' }}>
        {FEATURES.map((feature) => (
          <div
            key={feature}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                color: 'var(--color-accent)',
                border: '1.5px solid var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <span style={{ fontSize: '14px', color: '#65504a' }}>{feature}</span>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px',
        }}
      >
        <span style={{ width: 44, height: 8, borderRadius: 999, background: '#a8462f' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d9b9b0' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d9b9b0' }} />
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '999px',
          border: 'none',
          background: '#a8462f',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '12px',
          boxShadow: '0 10px 22px rgba(168, 70, 47, 0.22)',
        }}
      >
        Empezar a explorar&nbsp;&nbsp; →
      </button>

      <button
        onClick={onLogin}
        style={{
          width: '100%',
          padding: '8px',
          background: 'none',
          border: 'none',
          color: '#65504a',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
}
