import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowSquareOut,
  Buildings,
  Briefcase,
  ClockCounterClockwise,
  DotsThree,
  GearSix,
  House,
  MagnifyingGlass,
  ShieldCheck,
  Star,
  Users,
  X,
} from '@phosphor-icons/react';
import DashboardView from './views/DashboardView';
import EstablishmentsView from './views/EstablishmentsView';
import ModerationView from './views/ModerationView';
import UsersView from './views/UsersView';
import AuditView from './views/AuditView';
import SystemView from './views/SystemView';
import CommercialView from './views/CommercialView';
import BrandLogo from '../components/BrandLogo';
import { useLanguage } from '../i18n';
import { ADMIN_COPY } from './adminCopy';
import './admin.css';

const NAV_ITEMS = [
  { key: 'dashboard', icon: House, path: '/admin' },
  { key: 'establishments', icon: Buildings, path: '/admin/establecimientos' },
  { key: 'commercial', icon: Briefcase, path: '/admin/negocios' },
  { key: 'moderation', icon: Star, path: '/admin/moderacion' },
  { key: 'users', icon: Users, path: '/admin/usuarios' },
  { key: 'audit', icon: ClockCounterClockwise, path: '/admin/actividad' },
  { key: 'system', icon: GearSix, path: '/admin/sistema' },
];

const MOBILE_PRIMARY_ITEMS = NAV_ITEMS.slice(0, 4);
const MOBILE_MORE_ITEMS = NAV_ITEMS.slice(4);

function activeSection(pathname) {
  if (pathname.includes('/establecimientos')) return 'establishments';
  if (pathname.includes('/negocios')) return 'commercial';
  if (pathname.includes('/moderacion')) return 'moderation';
  if (pathname.includes('/usuarios')) return 'users';
  if (pathname.includes('/actividad')) return 'audit';
  if (pathname.includes('/sistema')) return 'system';
  return 'dashboard';
}

export default function AdminShell({ auth }) {
  const { language } = useLanguage();
  const copy = ADMIN_COPY[language].shell;
  const location = useLocation();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const moreButtonRef = useRef(null);
  const morePanelRef = useRef(null);
  const active = activeSection(location.pathname);
  const moreActive = MOBILE_MORE_ITEMS.some((item) => item.key === active);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [language]
  );

  useEffect(() => {
    setMobileMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (desktopQuery.matches) setMobileMoreOpen(false);
    };
    desktopQuery.addEventListener('change', closeOnDesktop);
    return () => desktopQuery.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileMoreOpen) return undefined;

    const trigger = moreButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    morePanelRef.current?.querySelector('button')?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMoreOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...morePanelRef.current.querySelectorAll('button:not(:disabled)')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [mobileMoreOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = globalSearch.trim();
    navigate(query ? `/admin/establecimientos?q=${encodeURIComponent(query)}` : '/admin/establecimientos');
  };

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <button className="admin-brand" type="button" onClick={() => navigate('/admin')}>
          <BrandLogo className="admin-brand-logo" />
          <strong>NORTE</strong>
          <span className="admin-brand-admin">ADMIN</span>
        </button>

        <nav className="admin-nav" aria-label={copy.adminNavigation}>
          {NAV_ITEMS.map(({ key, icon: Icon, path }) => (
            <button
              key={key}
              type="button"
              className={`admin-nav-item ${active === key ? 'is-active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={21} weight={active === key ? 'fill' : 'regular'} />
              <span>{copy.nav[key]}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-nav-item" onClick={() => navigate('/')}>
            <ArrowSquareOut size={20} />
            <span>{copy.backToApp}</span>
          </button>
          <div className="admin-profile-mini">
            <span className="admin-avatar">{auth.user.name.slice(0, 2).toUpperCase()}</span>
            <span>
              <strong>{auth.user.name}</strong>
              <small>{copy.adminRole}</small>
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
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchLabel}
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="admin-topbar-meta">
            <span className="admin-date">{today}</span>
            <span className="admin-health">
              <ShieldCheck size={18} weight="fill" />
              {copy.protected}
            </span>
          </div>
        </header>

        <div className="admin-content">
          {active === 'dashboard' && <DashboardView auth={auth} navigate={navigate} />}
          {active === 'establishments' && <EstablishmentsView />}
          {active === 'commercial' && <CommercialView />}
          {active === 'moderation' && <ModerationView />}
          {active === 'users' && <UsersView currentUser={auth.user} />}
          {active === 'audit' && <AuditView />}
          {active === 'system' && <SystemView />}
        </div>
      </div>

      <nav className="admin-mobile-nav" aria-label={copy.mobileNavigation}>
        {MOBILE_PRIMARY_ITEMS.map(({ key, icon: Icon, path }) => (
          <button
            key={key}
            type="button"
            className={`admin-mobile-nav-item ${active === key ? 'is-active' : ''}`}
            aria-current={active === key ? 'page' : undefined}
            onClick={() => navigate(path)}
          >
            <Icon size={22} weight={active === key ? 'fill' : 'regular'} aria-hidden="true" />
            <span>{key === 'establishments' ? copy.places : copy.nav[key]}</span>
          </button>
        ))}
        <button
          ref={moreButtonRef}
          type="button"
          className={`admin-mobile-nav-item ${moreActive ? 'is-active' : ''}`}
          aria-expanded={mobileMoreOpen}
          aria-controls="admin-mobile-more"
          onClick={() => setMobileMoreOpen((open) => !open)}
        >
          <DotsThree size={22} weight={moreActive ? 'fill' : 'bold'} aria-hidden="true" />
          <span>{copy.more}</span>
        </button>
      </nav>

      {mobileMoreOpen && (
        <div
          className="admin-mobile-more-backdrop"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setMobileMoreOpen(false);
          }}
        >
          <section
            ref={morePanelRef}
            id="admin-mobile-more"
            className="admin-mobile-more"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-mobile-more-title"
          >
            <div className="admin-mobile-more-header">
              <strong id="admin-mobile-more-title">{copy.moreOptions}</strong>
              <button
                type="button"
                className="admin-icon-button"
                aria-label={copy.closeMore}
                onClick={() => setMobileMoreOpen(false)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label={copy.secondaryNavigation}>
              {MOBILE_MORE_ITEMS.map(({ key, icon: Icon, path }) => (
                <button
                  key={key}
                  type="button"
                  className={`admin-mobile-more-item ${active === key ? 'is-active' : ''}`}
                  aria-current={active === key ? 'page' : undefined}
                  onClick={() => navigate(path)}
                >
                  <Icon size={21} weight={active === key ? 'fill' : 'regular'} aria-hidden="true" />
                  <span>{copy.nav[key]}</span>
                </button>
              ))}
              <button type="button" className="admin-mobile-more-item" onClick={() => navigate('/')}>
                <ArrowSquareOut size={21} aria-hidden="true" />
                <span>{copy.backToApp}</span>
              </button>
            </nav>
          </section>
        </div>
      )}
    </div>
  );
}
