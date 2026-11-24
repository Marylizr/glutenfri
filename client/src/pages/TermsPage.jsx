import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { useLanguage } from '../i18n/index.jsx';
import { LEGAL_COPY } from '../config/legalCopy.js';

export default function TermsPage() {
  const { language, t } = useLanguage();
  return <LegalPageLayout title={t('terms')}>{LEGAL_COPY[language].termsSections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}</LegalPageLayout>;
}
