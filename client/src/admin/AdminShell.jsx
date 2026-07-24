import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowSquareOut,
  Buildings,
  ClockCounterClockwise,
  GearSix,
  House,
  MagnifyingGlass,
  ShieldCheck,
  Star,
  Users,
} from '@phosphor-icons/react';
import DashboardView from './views/DashboardView';
import EstablishmentsView from './views/EstablishmentsView';
import ModerationView from './views/ModerationView';
import UsersView from './views/UsersView';
import AuditView from './views/AuditView';
import SystemView from './views/SystemView';
import './admin.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Resumen', icon: House, path: '/admin' },
  { key: 'establishments', label: 'Establecimientos', icon: Buildings, path: '/admin/establecimientos' },
  { key: 'moderation', label: 'Reseñas', icon: Star, path: '/admin/moderacion' },
  { key: 'users', label: 'Usuarios', icon: Users, path: '/admin/usuarios' },
  { key: 'audit', label: 'Actividad', icon: ClockCounterClockwise, path: '/admin/actividad' },
  { key: 'system', label: 'Sistema', icon: GearSix, path: '/admin/sistema' },
];

function activeSection(pathname) {
  if (pathname.includes('/establecimientos')) return 'establishments';
  if (pathname.includes('/moderacion')) return 'moderation';
  if (pathname.includes('/usuarios')) return 'users';
  if (pathname.includes('/actividad')) return 'audit';
  if (pathname.includes('/sistema')) return 'system';
  return 'dashboard';
}

export default function AdminShell({ auth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const active = activeSection(location.pathname);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    []
  );

  const submitSearch = (event) => {
    event.preventDefault();
    const query = globalSearch.trim();
    navigate(query ? `/admin/establecimientos?q=${encodeURIComponent(query)}` : '/admin/establecimientos');
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <button className="admin-brand" type="button" onClick={() => navigate('/admin')}>
          <span className="admin-brand-kicker">Gluten Free</span>
          <strong>PORTO</strong>
          <span className="admin-brand-admin">ADMIN</span>
        </button>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          {NAV_ITEMS.map(({ key, label, icon: Icon, path }) => (
            <button
              key={key}
              type="button"
              className={`admin-nav-item ${active === key ? 'is-active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={21} weight={active === key ? 'fill' : 'regular'} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-nav-item" onClick={() => navigate('/')}>
            <ArrowSquareOut size={20} />
            <span>Volver a la app</span>
          </button>
          <div className="admin-profile-mini">
            <span className="admin-avatar">{auth.user.name.slice(0, 2).toUpperCase()}</span>
            <span>
              <strong>{auth.user.name}</strong>
              <small>Administradora</small>
            </span>
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <form className="admin-global-search" onSubmit={submitSearch}>
            <MagnifyingGlass size={20} />
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Buscar establecimientos, usuarios, reseñas…"
              aria-label="Buscar en el backoffice"
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="admin-topbar-meta">
            <span className="admin-date">{today}</span>
            <span className="admin-health">
              <ShieldCheck size={18} weight="fill" />
              Protegido
            </span>
          </div>
        </header>

        <div className="admin-content">
          {active === 'dashboard' && <DashboardView auth={auth} navigate={navigate} />}
          {active === 'establishments' && <EstablishmentsView />}
          {active === 'moderation' && <ModerationView />}
          {active === 'users' && <UsersView currentUser={auth.user} />}
          {active === 'audit' && <AuditView />}
          {active === 'system' && <SystemView />}
        </div>
      </div>
    </div>
  );
}
