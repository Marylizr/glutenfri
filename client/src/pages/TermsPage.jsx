import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { useLanguage } from '../i18n/index.jsx';

const content = {
  'pt-PT': ['GlutenFri disponibiliza informação orientativa sobre estabelecimentos e experiências da comunidade.', 'A informação pode mudar e não substitui a confirmação direta com o estabelecimento nem aconselhamento profissional.', 'Não publiques dados pessoais, conteúdo ilícito ou alegações que não possas sustentar. O conteúdo pode ser moderado.', 'A utilização do serviço não cria qualquer relação de certificação, representação ou afiliação com APC, Biotrab ou terceiros.'],
  en: ['GlutenFri provides guidance about establishments and community experiences.', 'Information may change and does not replace direct confirmation with the establishment or professional advice.', 'Do not publish personal data, unlawful content or claims you cannot support. Content may be moderated.', 'Using the service does not create a certification, representation or affiliation relationship with APC, Biotrab or third parties.'],
  es: ['GlutenFri proporciona información orientativa sobre establecimientos y experiencias de la comunidad.', 'La información puede cambiar y no sustituye la confirmación directa con el establecimiento ni el asesoramiento profesional.', 'No publiques datos personales, contenido ilícito o afirmaciones que no puedas sostener. El contenido puede moderarse.', 'El uso del servicio no crea ninguna relación de certificación, representación o afiliación con APC, Biotrab o terceros.'],
};

export default function TermsPage() {
  const { language, t } = useLanguage();
  return <LegalPageLayout title={t('terms')}>{content[language].map((text) => <p key={text}>{text}</p>)}</LegalPageLayout>;
}
