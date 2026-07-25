import BrandLogo from './BrandLogo';
import { REGION_NAME } from '../config/brand.js';

export default function PublicPageHeader({ title, action, children, className = '' }) {
  return (
    <header className={`public-page-header ${className}`.trim()}>
      <div className="public-page-header__inner">
      <div className="public-brand-line">
        <BrandLogo className="brand-logo--public-header" />
        <span className="public-brand-line__region">
          <span className="material-symbols-outlined" aria-hidden="true">distance</span>
          <span>{REGION_NAME}</span>
        </span>
      </div>

      <div className="public-page-header__title-row">
        <h1>{title}</h1>
        {action}
      </div>

      {children && <div className="public-page-header__content">{children}</div>}
      </div>
    </header>
  );
}
