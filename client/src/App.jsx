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
import SafetyInformationPage from './pages/SafetyInformationPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import BottomNav from './components/BottomNav';
import DesktopHeader from './components/DesktopHeader';
import { useAuth } from './hooks/useAuth';
import { useSaved } from './hooks/useSaved';
import './index.css';

const AdminShell = lazy(() => import('./admin/AdminShell'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [onboarded, setOnboarded] = useState(false);
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

  // La portada es la entrada de cada carga nueva de la app pública y solo
  // avanza cuando la persona pulsa uno de sus CTA. No se persiste el estado
  // "visto"; /admin y /privacidad permanecen accesibles por URL directa.
  const publicInformationRoutes = [
    '/privacidad',
    '/terminos',
    '/contacto',
    '/proyecto',
    '/informacion-sin-gluten',
  ];
  const isInformationRoute = publicInformationRoutes.includes(location.pathname);
  const isPublicEntry = !location.pathname.startsWith('/admin') && !isInformationRoute;

  if (!onboarded && isPublicEntry) {
    return (
      <div className="onboarding-shell">
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
    <div className={`app-shell${isAdminRoute ? ' app-shell--admin' : ''}`}>
      {!isAdminRoute && <DesktopHeader />}
      <div className="app-shell__content">
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
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/proyecto" element={<AboutPage />} />
          <Route path="/informacion-sin-gluten" element={<SafetyInformationPage />} />
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
        !isInformationRoute && <BottomNav />}
    </div>
  );
}

export default App;
