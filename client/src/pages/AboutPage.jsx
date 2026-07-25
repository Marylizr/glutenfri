import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';
import { useLanguage } from '../i18n/index.jsx';

const text = {
  'pt-PT': 'GlutenFri ajuda a descobrir estabelecimentos com informação sobre oferta sem glúten em Portugal. É um projeto independente desenvolvido pela PixelTrend Studio.',
  en: 'GlutenFri helps people discover establishments with information about gluten-free offerings in Portugal. It is an independent project developed by PixelTrend Studio.',
  es: 'GlutenFri ayuda a descubrir establecimientos con información sobre oferta sin gluten en Portugal. Es un proyecto independiente desarrollado por PixelTrend Studio.',
};

export default function AboutPage() {
  const { language, t } = useLanguage();
  return (
    <LegalPageLayout title={t('about')}>
      <p>{text[language]}</p>
      <p>{t('footerDisclaimer')}</p>
      <p><strong>{LEGAL_CONFIG.developerName}</strong></p>
    </LegalPageLayout>
  );
}
