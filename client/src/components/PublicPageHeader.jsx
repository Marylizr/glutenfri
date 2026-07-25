import BrandLogo from './BrandLogo';
import { REGION_NAME } from '../config/brand.js';

export default function PublicPageHeader({ title, action, children, className = '' }) {
  return (
    <header className={`public-page-header ${className}`.trim()}>
      <div className="public-brand-line">
        <BrandLogo className="brand-logo--public-header" />
        <span>📍 {REGION_NAME}</span>
      </div>

      <div className="public-page-header__title-row">
        <h1>{title}</h1>
        {action}
      </div>

      {children && <div className="public-page-header__content">{children}</div>}
    </header>
  );
}
