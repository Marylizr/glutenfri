import RestaurantCard from '../components/RestaurantCard';
import ErrorState from '../components/ErrorState';
import { useUserLocation } from '../hooks/useUserLocation';

export default function SavedPage({ auth, saved, onSelectEstablishment, onGoToProfile }) {
  const { position } = useUserLocation();

  if (!auth.user) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>♡</div>
        <h1 style={{ fontSize: '18px', marginBottom: '8px' }}>Guardá tus lugares seguros</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Iniciá sesión para guardar restaurantes, tiendas y farmacias gluten-free.
        </p>
        <button
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
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
          📍 Braga, Portugal
        </div>
        <h1 style={{ fontSize: '22px' }}>Tus lugares seguros</h1>
      </header>

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {saved.loading && <div style={{ color: 'var(--color-text-muted)' }}>Cargando…</div>}

        {!saved.loading && saved.error && <ErrorState message={saved.error} onRetry={saved.reload} />}

        {!saved.loading && !saved.error && saved.establishments.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', padding: '24px 0', textAlign: 'center' }}>
            Todavía no guardaste ningún lugar. Tocá el ♡ en una card para agregarla acá.
          </div>
        )}

        {saved.establishments.map((e) => (
          <RestaurantCard
            key={e._id}
            establishment={e}
            userPosition={position}
            onSelect={onSelectEstablishment}
            saved={saved.savedIds.has(e._id)}
            onToggleSaved={saved.toggle}
          />
        ))}
      </main>
    </div>
  );
}
