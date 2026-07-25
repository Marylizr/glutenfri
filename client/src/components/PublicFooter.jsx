import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';

export default function PublicFooter() {
  const { t } = useLanguage();
  return (
    <footer className="public-footer">
      <nav aria-label="Legal">
        <Link to="/informacion-sin-gluten">{t('safetyPageTitle')}</Link>
        <Link to="/privacidad">{t('privacy')}</Link>
        <Link to="/terminos">{t('terms')}</Link>
        <Link to="/contacto">{t('contact')}</Link>
        <Link to="/proyecto">{t('about')}</Link>
      </nav>
      <p>{t('footerDisclaimer')}</p>
    </footer>
  );
}
