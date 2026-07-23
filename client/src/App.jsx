import { useState } from 'react';
import ExplorePage from './pages/ExplorePage';
import HomePage from './pages/HomePage'; // vista mapa (Fase 2, ya existente)
import EstablishmentDetailPage from './pages/EstablishmentDetailPage';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';
import OnboardingScreen from './pages/OnboardingScreen';
import BottomNav from './components/BottomNav';
import { useAuth } from './hooks/useAuth';
import { useSaved } from './hooks/useSaved';
import './index.css';

const ONBOARDED_KEY = 'gf_onboarded';

// Placeholder simple para tabs que aún no tienen pantalla propia.
function ComingSoon({ label }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--color-text-muted)',
      }}
    >
      {label} — próximamente
    </div>
  );
}

function App() {
  const [tab, setTab] = useState('home');
  const [selected, setSelected] = useState(null);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARDED_KEY) === 'true');
  const auth = useAuth();
  const saved = useSaved(auth.user);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setOnboarded(true);
  };

  const handleToggleSaved = (establishmentId) => {
    if (!auth.user) {
      setTab('profile');
      return;
    }
    saved.toggle(establishmentId);
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        boxShadow: '0 0 40px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {!onboarded ? (
          <OnboardingScreen
            onStart={finishOnboarding}
            onLogin={() => {
              finishOnboarding();
              setTab('profile');
            }}
          />
        ) : selected ? (
          <EstablishmentDetailPage
            establishment={selected}
            onBack={() => setSelected(null)}
            saved={saved.savedIds.has(selected._id)}
            onToggleSaved={handleToggleSaved}
          />
        ) : (
          <>
            {tab === 'home' && (
              <ExplorePage
                onSelectEstablishment={setSelected}
                savedIds={saved.savedIds}
                onToggleSaved={handleToggleSaved}
              />
            )}
            {tab === 'map' && (
              <HomePage
                onSelectEstablishment={setSelected}
                savedIds={saved.savedIds}
                onToggleSaved={handleToggleSaved}
              />
            )}
            {tab === 'saved' && (
              <SavedPage
                auth={auth}
                saved={saved}
                onSelectEstablishment={setSelected}
                onGoToProfile={() => setTab('profile')}
              />
            )}
            {tab === 'reviews' && <ComingSoon label="Reseñas" />}
            {tab === 'profile' && <ProfilePage auth={auth} />}
          </>
        )}
      </div>
      {onboarded && !selected && <BottomNav active={tab} onChange={setTab} />}
    </div>
  );
}

export default App;
