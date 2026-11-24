import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ExplorePage from './pages/ExplorePage';
import OnboardingScreen from './pages/OnboardingScreen';
import RouteBoundary from './components/RouteBoundary.jsx';
import BottomNav from './components/BottomNav';
import DesktopHeader from './components/DesktopHeader';
import CookieNotice from './components/CookieNotice.jsx';
import { useAuth } from './hooks/useAuth';
import { useSaved } from './hooks/useSaved';
import { useLanguage } from './i18n';
import './index.css';

const AdminShell = lazy(() => import('./admin/AdminShell'));
const BusinessShell = lazy(() => import('./business/BusinessShell'));
const HomePage = lazy(() => import('./pages/HomePage'));
const EstablishmentDetailRoute = lazy(() => import('./pages/EstablishmentDetailRoute'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const SafetyInformationPage = lazy(() => import('./pages/SafetyInformationPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'));
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'));
const LegalHubPage = lazy(() => import('./pages/LegalHubPage.jsx'));
const DataDeletionPage = lazy(() => import('./pages/DataDeletionPage.jsx'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const saved = useSaved(auth.user);
  const { t } = useLanguage();

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

  // Si el JWT venció, useAuth ya limpió la sesión (evento
  // 'gf:session-expired' desde services/api.js) — acá mandamos a la
  // pantalla de login con el mensaje que muestra ProfilePage. `replace`
  // para no dejar en el historial una pantalla que ya no puede usarse.
  useEffect(() => {
    if (auth.sessionExpired) {
      navigate('/perfil', { replace: true });
    }
  }, [auth.sessionExpired, navigate]);

  const publicInformationRoutes = [
    '/legal',
    '/eliminacion-de-datos',
    '/privacidad',
    '/terminos',
    '/contacto',
    '/proyecto',
    '/informacion-sin-gluten',
    '/servicios-digitales',
  ];
  const isInformationRoute = publicInformationRoutes.includes(location.pathname);
  const isDetailRoute =
    location.pathname.startsWith('/lugar/') || location.pathname.startsWith('/empresa/');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBusinessRoute = location.pathname.startsWith('/negocio');

  return (
    <div className={`app-shell${isAdminRoute ? ' app-shell--admin' : ''}`}>
      <DesktopHeader />
      <div className="app-shell__content">
        <RouteBoundary message={t('loadNetworkError')}>
        <Suspense fallback={<div className="establishment-detail-state" role="status">{t('loading')}</div>}>
        <Routes location={backgroundLocation || location}>
          <Route
            path="/"
            element={
              <OnboardingScreen
                onStart={() => navigate('/explorar')}
              />
            }
          />
          <Route
            path="/explorar"
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
                onGoToExplore={() => navigate('/explorar')}
              />
            }
          />
          <Route path="/perfil" element={<ProfilePage auth={auth} />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/legal" element={<LegalHubPage />} />
          <Route path="/eliminacion-de-datos" element={<DataDeletionPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/proyecto" element={<AboutPage />} />
          <Route path="/servicios-digitales" element={<ServicesPage />} />
          <Route path="/informacion-sin-gluten" element={<SafetyInformationPage />} />
          <Route
            path="/admin/*"
            element={
              auth.user?.isAdmin ? (
                <Suspense fallback={<div style={{ padding: '32px' }}>{t('panelLoading')}</div>}>
                  <AdminShell auth={auth} />
                </Suspense>
              ) : (
                <Navigate to="/perfil" replace />
              )
            }
          />
          <Route
            path="/negocio/*"
            element={
              auth.user ? (
                <Suspense fallback={<div style={{ padding: '32px' }}>{t('panelLoading')}</div>}>
                  <BusinessShell />
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
          <Route
            path="/empresa/:id"
            element={
              <EstablishmentDetailRoute
                auth={auth}
                savedIds={saved.savedIds}
                onToggleSaved={handleToggleSaved}
              />
            }
          />
          <Route path="*" element={<Navigate to="/explorar" replace />} />
        </Routes>

        {backgroundLocation && (
          <div className="detail-route-overlay">
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
        </Suspense>
        </RouteBoundary>
      </div>
      {!isDetailRoute &&
        !isAdminRoute &&
        !isBusinessRoute &&
        location.pathname !== '/' &&
        !isInformationRoute && <BottomNav />}
      <CookieNotice />
    </div>
  );
}

export default App;
