import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import BrandLogo from './BrandLogo.jsx';

export default function PublicFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer">
      <div className="public-footer__inner">
        <div className="public-footer__brand">
          <BrandLogo className="brand-logo--footer" />
          <p>{t('footerDescription')}</p>
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
            <Link to="/informacion-sin-gluten">{t('safetyPageTitle')}</Link>
            <Link to="/privacidad">{t('privacy')}</Link>
            <Link to="/terminos">{t('terms')}</Link>
            <Link to="/contacto">{t('contact')}</Link>
            <Link to="/proyecto">{t('about')}</Link>
          </nav>
        </div>

        <div className="public-footer__bottom">
          <p>{t('footerDisclaimer')}</p>
          <small>
            © {year} GlutenFri ·{' '}
            <a
              className="public-footer__credit"
              href="https://pixeltrendstudio.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              PixelTrend Studio
            </a>
          </small>
        </div>
      </div>
    </footer>
  );
}
