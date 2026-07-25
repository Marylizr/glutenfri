import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';
import { useLanguage } from '../i18n/index.jsx';

const text = {
  'pt-PT': 'Para exercer direitos de proteção de dados ou comunicar informação incorreta, escreve para:',
  en: 'To exercise data protection rights or report incorrect information, write to:',
  es: 'Para ejercer derechos de protección de datos o comunicar información incorrecta, escribe a:',
};

export default function ContactPage() {
  const { language, t } = useLanguage();
  return (
    <LegalPageLayout title={t('contact')}>
      <p>{text[language]}</p>
      <p><a href={`mailto:${LEGAL_CONFIG.contactEmail}`}>{LEGAL_CONFIG.contactEmail}</a></p>
      <p className="institutional-notice">{t('independentShort')}</p>
    </LegalPageLayout>
  );
}
