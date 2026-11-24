import { Link } from 'react-router-dom';
import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';
import { LEGAL_COPY } from '../config/legalCopy.js';
import { useLanguage } from '../i18n/index.jsx';

export default function LegalHubPage() {
  const { language, t } = useLanguage();
  const copy = LEGAL_COPY[language];
  return (
    <LegalPageLayout title={t('legalCenter')}>
      <p>{copy.intro}</p>
      <section>
        <h2>{copy.identity}</h2>
        <dl className="trust-metadata">
          <div><dt>{copy.operator}</dt><dd>{LEGAL_CONFIG.operatorName}</dd></div>
          <div><dt>{copy.controller}</dt><dd>{LEGAL_CONFIG.dataControllerName}</dd></div>
          <div><dt>{copy.developer}</dt><dd>{LEGAL_CONFIG.developerName}</dd></div>
          <div><dt>{t('contact')}</dt><dd><a href={`mailto:${LEGAL_CONFIG.contactEmail}`}>{LEGAL_CONFIG.contactEmail}</a></dd></div>
        </dl>
        {LEGAL_CONFIG.detailsNeedFormalConfirmation && <p className="institutional-notice">{copy.confirmation}</p>}
      </section>
      <nav aria-label={copy.documents}>
        <h2>{copy.documents}</h2>
        <ul className="legal-links">
          <li><Link to="/terminos">{t('terms')}</Link></li>
          <li><Link to="/privacidad">{t('privacy')}</Link></li>
          <li><Link to="/eliminacion-de-datos">{t('dataDeletion')}</Link></li>
          <li><Link to="/contacto">{t('contact')}</Link></li>
          <li><Link to="/informacion-sin-gluten">{t('safetyPageTitle')}</Link></li>
        </ul>
      </nav>
      <p className="institutional-notice">{t('footerDisclaimer')}</p>
    </LegalPageLayout>
  );
}
