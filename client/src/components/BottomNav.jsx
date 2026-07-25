import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';

export default function BottomNav() {
  const { t } = useLanguage();
  const tabs = [
    { to: '/', label: t('home'), icon: 'home', end: true },
    { to: '/mapa', label: t('map'), icon: 'distance' },
    { to: '/guardados', label: t('saved'), icon: 'favorite' },
    { to: '/reseñas', label: t('reviews'), icon: 'edit_square' },
    { to: '/perfil', label: t('profile'), icon: 'for_you' },
  ];
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
          style={({ isActive }) => ({
            background: 'none',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
            fontSize: '11px',
            fontWeight: isActive ? 600 : 400,
            textDecoration: 'none',
          })}
        >
          <span className="material-symbols-outlined bottom-nav__icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
