import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import { useLanguage } from '../i18n/index.jsx';
import { PUBLIC_NAV_ITEMS } from '../config/publicNavigation.js';
import { REGION_NAME } from '../config/brand.js';

export default function DesktopHeader() {
  const { t } = useLanguage();

  return (
    <header className="desktop-header">
      <div className="desktop-header__inner">
        <div className="desktop-header__identity">
          <NavLink to="/" className="desktop-header__brand" aria-label={t('home')}>
            <BrandLogo className="brand-logo--desktop-header" priority />
          </NavLink>
          <span className="desktop-header__region">
            <span className="material-symbols-outlined" aria-hidden="true">distance</span>
            <span>{REGION_NAME}</span>
          </span>
        </div>

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
