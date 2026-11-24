import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import BrandLogo from './BrandLogo.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';

export default function PublicFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <BrandLogo className="brand-logo--footer" />
          <p>{t('footerDescription')}</p>
          <nav className="public-footer__project" aria-label={t('about')}>
            <Link to="/proyecto">{t('about')}</Link>
            <Link to="/servicios-digitales">{t('footerServices')}</Link>
            <Link to="/informacion-sin-gluten">{t('footerSafety')}</Link>
          </nav>
        </div>

        <div className="public-footer__navigation">
          <nav aria-label={t('footerExplore')}>
            <strong>{t('footerExplore')}</strong>
            <Link to="/explorar">{t('home')}</Link>
            <Link to="/mapa">{t('map')}</Link>
            <Link to="/guardados">{t('saved')}</Link>
            <Link to="/reseñas">{t('reviews')}</Link>
          </nav>

          <nav aria-label={t('footerLegal')}>
            <strong>{t('footerLegal')}</strong>
            <Link to="/legal">{t('legalCenter')}</Link>
            <Link to="/privacidad">{t('privacy')}</Link>
            <Link to="/terminos">{t('terms')}</Link>
            <Link to="/eliminacion-de-datos">{t('dataDeletion')}</Link>
            <Link to="/contacto">{t('contact')}</Link>
          </nav>
        </div>

        <div className="public-footer__bottom">
          <p>{t('footerDisclaimer')}</p>
          <small>
            {t('footerCopyright', { year })}{' '}
            <a
              className="public-footer__credit"
              href="https://pixeltrendstudio.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('footerOperator', { operator: LEGAL_CONFIG.operatorName })}
            </a>
          </small>
        </div>
      </div>
    </footer>
  );
}
