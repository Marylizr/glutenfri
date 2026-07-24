import RestaurantCard from '../components/RestaurantCard';
import ErrorState from '../components/ErrorState';
import LoginRequiredState from '../components/LoginRequiredState';
import { useUserLocation } from '../hooks/useUserLocation';
import { APP_NAME, REGION_NAME } from '../config/brand';

export default function SavedPage({ auth, saved, onSelectEstablishment, onGoToProfile }) {
  const { position } = useUserLocation();

  if (!auth.user) {
    return (
      <LoginRequiredState
        icon="♡"
        title="Guarda tus lugares seguros"
        message="Inicia sesión para guardar restaurantes, tiendas y farmacias sin gluten."
        onGoToProfile={onGoToProfile}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
          {APP_NAME} · 📍 {REGION_NAME}
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
            Todavía no has guardado ningún lugar. Selecciona el ♡ de una tarjeta para guardarlo.
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
