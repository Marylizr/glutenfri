import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from '../i18n/index.jsx';
import { PUBLIC_NAV_ITEMS } from '../config/publicNavigation.js';

export default function DesktopHeader() {
  const { t } = useLanguage();

  return (
    <header className="desktop-header">
      <div className="desktop-header__inner">
        <NavLink to="/" className="desktop-header__brand" aria-label={t('home')}>
          <BrandLogo className="brand-logo--desktop-header" priority />
        </NavLink>

        <nav className="desktop-header__nav" aria-label={t('primaryNavigation')}>
          {PUBLIC_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `desktop-header__link${isActive ? ' is-active' : ''}`}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <LanguageSelector className="desktop-header__language" />
      </div>
    </header>
  );
}
