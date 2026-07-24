import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage';
import HomePage from './pages/HomePage'; // vista mapa (Fase 2, ya existente)
import EstablishmentDetailRoute from './pages/EstablishmentDetailRoute';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';
import ReviewsPage from './pages/ReviewsPage';
import OnboardingScreen from './pages/OnboardingScreen';
import PrivacyPage from './pages/PrivacyPage';
import BottomNav from './components/BottomNav';
import { useAuth } from './hooks/useAuth';
import { useSaved } from './hooks/useSaved';
import './index.css';

const ONBOARDED_KEY = 'gf_onboarded';
const AdminShell = lazy(() => import('./admin/AdminShell'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARDED_KEY) === 'true');
  const auth = useAuth();
  const saved = useSaved(auth.user);

  // "Background location": si /lugar/:id se abrió desde un click dentro de
  // la app (no una carga directa por URL), la pantalla de origen sigue
  // montada detrás y el detalle se dibuja como overlay encima — así no se
  // pierden filtros ni scroll, y "atrás" (botón propio o el del navegador)
  // vuelve exactamente a donde estaba.
  const backgroundLocation = location.state?.backgroundLocation;

  const openEstablishment = (establishment) => {
    navigate(`/lugar/${establishment._id}`, {
      state: { backgroundLocation: location, establishment },
    });
  };

  const handleToggleSaved = (establishmentId) => {
    if (!auth.user) {
      navigate('/perfil');
      return;
    }
    saved.toggle(establishmentId);
  };

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setOnboarded(true);
  };

  // Si el JWT venció, useAuth ya limpió la sesión (evento
  // 'gf:session-expired' desde services/api.js) — acá mandamos a la
  // pantalla de login con el mensaje que muestra ProfilePage. `replace`
  // para no dejar en el historial una pantalla que ya no puede usarse.
  useEffect(() => {
    if (auth.sessionExpired) {
      navigate('/perfil', { replace: true });
    }
  }, [auth.sessionExpired, navigate]);

  if (!onboarded && location.pathname !== '/privacidad' && !location.pathname.startsWith('/admin')) {
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
        <OnboardingScreen
          onStart={() => {
            finishOnboarding();
            navigate('/');
          }}
          onLogin={() => {
            finishOnboarding();
            navigate('/perfil');
          }}
        />
      </div>
    );
  }

  const isDetailRoute = location.pathname.startsWith('/lugar/');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div
      style={{
        maxWidth: isAdminRoute ? 'none' : '480px',
        margin: isAdminRoute ? 0 : '0 auto',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        boxShadow: '0 0 40px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Routes location={backgroundLocation || location}>
          <Route
            path="/"
            element={
              <ExplorePage
                onSelectEstablishment={openEstablishment}
                savedIds={saved.savedIds}
                onToggleSaved={handleToggleSaved}
              />
            }
          />
          <Route
            path="/mapa"
            element={
              <HomePage
                onSelectEstablishment={openEstablishment}
                savedIds={saved.savedIds}
                onToggleSaved={handleToggleSaved}
              />
            }
          />
          <Route
            path="/guardados"
            element={
              <SavedPage
                auth={auth}
                saved={saved}
                onSelectEstablishment={openEstablishment}
                onGoToProfile={() => navigate('/perfil')}
              />
            }
          />
          <Route
            path="/reseñas"
            element={
              <ReviewsPage
                auth={auth}
                onSelectEstablishment={openEstablishment}
                onGoToProfile={() => navigate('/perfil')}
                onGoToExplore={() => navigate('/')}
              />
            }
          />
          <Route path="/perfil" element={<ProfilePage auth={auth} />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route
            path="/admin/*"
            element={
              auth.user?.isAdmin ? (
                <Suspense fallback={<div style={{ padding: '32px' }}>Cargando backoffice…</div>}>
                  <AdminShell auth={auth} />
                </Suspense>
              ) : (
                <Navigate to="/perfil" replace />
              )
            }
          />
          <Route
            path="/lugar/:id"
            element={
              <EstablishmentDetailRoute
                auth={auth}
                savedIds={saved.savedIds}
                onToggleSaved={handleToggleSaved}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {backgroundLocation && (
          <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)' }}>
            <Routes>
              <Route
                path="/lugar/:id"
                element={
                  <EstablishmentDetailRoute
                    auth={auth}
                    savedIds={saved.savedIds}
                    onToggleSaved={handleToggleSaved}
                  />
                }
              />
            </Routes>
          </div>
        )}
      </div>
      {!isDetailRoute &&
        !isAdminRoute &&
        location.pathname !== '/privacidad' && <BottomNav />}
    </div>
  );
}

export default App;
