import { NavLink } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import { PUBLIC_NAV_ITEMS } from '../config/publicNavigation.js';

export default function BottomNav() {
  const { t } = useLanguage();
  const iconByPath = {
    '/explorar': 'home',
    '/mapa': 'distance',
    '/guardados': 'favorite',
    '/reseñas': 'edit_square',
    '/perfil': 'for_you',
  };

  return (
    <nav className="bottom-nav" aria-label={t('primaryNavigation')}>
      {PUBLIC_NAV_ITEMS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
        >
          <span className="material-symbols-outlined bottom-nav__icon" aria-hidden="true">
            {iconByPath[tab.to]}
          </span>
          <span>{t(tab.labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
