import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { useLanguage } from '../i18n/index.jsx';

const copy = {
  'pt-PT': [
    ['Como funciona a classificação', 'GlutenFri organiza categoria, procedência, estado de revisão e data de atualização. Estes elementos descrevem a informação disponível; não são uma certificação do estabelecimento.'],
    ['Fonte pública consultada', 'Identifica informação encontrada numa fonte externa. A fonte aparece como procedência e não como validação ou certificação emitida por GlutenFri.'],
    ['Informação fornecida pelo estabelecimento', 'Descreve dados declarados pelo próprio negócio. A origem fica identificada e os campos de confiança continuam sob revisão da equipa.'],
    ['Opções sem glúten', 'A existência de opções sem glúten não significa necessariamente ausência de contacto cruzado. Ingredientes, preparação, superfícies, utensílios, fritadeiras e procedimentos podem variar.'],
    ['Reportado pela comunidade', 'Descreve uma experiência ou informação partilhada por utilizadores. Não é uma certificação nem uma verificação independente.'],
    ['Fonte pendente ou desatualizada', 'Indica que a procedência ainda não foi revista ou que a última atualização já não é recente.'],
    ['Antes de visitar ou consumir', 'Contacta diretamente o estabelecimento e pergunta sobre ingredientes, preparação, superfícies, utensílios, fritadeiras e protocolos. A informação pode mudar.'],
    ['Comunicar informação incorreta', 'Utiliza a opção de reportar numa avaliação ou contacta o projeto pela página de contacto, indicando o estabelecimento e a informação a rever.'],
  ],
  en: [
    ['How classification works', 'GlutenFri organises category, provenance, review status and update date. These describe the available information; they are not establishment certification.'],
    ['Public source consulted', 'This identifies information found in an external source. The source is shown as provenance, not as validation or certification issued by GlutenFri.'],
    ['Information provided by the establishment', 'This describes data declared by the business. Its origin stays visible and trust fields remain under team review.'],
    ['Gluten-free options', 'Having gluten-free options does not necessarily mean there is no cross-contact. Ingredients, preparation, surfaces, utensils, fryers and procedures may vary.'],
    ['Community reported', 'This describes an experience or information shared by users. It is not certification or independent verification.'],
    ['Pending or outdated source', 'This means the provenance has not yet been reviewed or the latest update is no longer recent.'],
    ['Before visiting or eating', 'Contact the establishment directly and ask about ingredients, preparation, surfaces, utensils, fryers and protocols. Information may change.'],
    ['Report incorrect information', 'Use the report option on a review or contact the project through the contact page, naming the establishment and information that needs review.'],
  ],
  es: [
    ['Cómo funciona la clasificación', 'GlutenFri organiza categoría, procedencia, estado de revisión y fecha de actualización. Estos elementos describen la información disponible; no son una certificación del establecimiento.'],
    ['Fuente pública consultada', 'Identifica información encontrada en una fuente externa. La fuente se muestra como procedencia, no como validación o certificación emitida por GlutenFri.'],
    ['Información proporcionada por el establecimiento', 'Describe datos declarados por el propio negocio. El origen queda identificado y los campos de confianza continúan bajo revisión del equipo.'],
    ['Opciones sin gluten', 'Tener opciones sin gluten no significa necesariamente ausencia de contacto cruzado. Los ingredientes, preparación, superficies, utensilios, freidoras y procedimientos pueden variar.'],
    ['Reportado por la comunidad', 'Describe una experiencia o información compartida por usuarios. No es una certificación ni una verificación independiente.'],
    ['Fuente pendiente o desactualizada', 'Indica que la procedencia todavía no se ha revisado o que la última actualización ya no es reciente.'],
    ['Antes de visitar o consumir', 'Contacta directamente con el establecimiento y pregunta por ingredientes, preparación, superficies, utensilios, freidoras y protocolos. La información puede cambiar.'],
    ['Comunicar información incorrecta', 'Utiliza la opción de reportar en una reseña o contacta con el proyecto desde la página de contacto, indicando el establecimiento y la información que debe revisarse.'],
  ],
};

export default function SafetyInformationPage() {
  const { language, t } = useLanguage();
  return (
    <LegalPageLayout title={t('safetyPageTitle')}>
      {copy[language].map(([title, text]) => (
        <section key={title}><h2>{title}</h2><p>{text}</p></section>
      ))}
      <p className="institutional-notice">{t('footerDisclaimer')}</p>
    </LegalPageLayout>
  );
}
