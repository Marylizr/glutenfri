import { Link } from 'react-router-dom';
import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';
import { LEGAL_COPY } from '../config/legalCopy.js';
import { useLanguage } from '../i18n/index.jsx';

export default function DataDeletionPage() {
  const { language, t } = useLanguage();
  const copy = LEGAL_COPY[language];
  return (
    <LegalPageLayout title={t('dataDeletion')}>
      <p>{copy.deletionIntro}</p>
      <ol>{copy.deletionSteps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p><Link to="/perfil">{copy.profile}</Link></p>
      {copy.deletionSections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
      <p><a href={`mailto:${LEGAL_CONFIG.contactEmail}`}>{LEGAL_CONFIG.contactEmail}</a></p>
      <p><Link to="/privacidad">{t('privacy')}</Link></p>
      <p><a href="https://www.cnpd.pt/cidadaos/direitos/direito-ao-apagamento-dos-dados/" rel="noopener noreferrer" target="_blank">{copy.authority}</a></p>
    </LegalPageLayout>
  );
}
