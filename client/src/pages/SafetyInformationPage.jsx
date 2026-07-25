import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { useLanguage } from '../i18n/index.jsx';

const copy = {
  'pt-PT': [
    ['Certificação APC/Biotrab', 'Esta categoria identifica informação atribuída à certificação APC/Biotrab e remete para a fonte indicada. GlutenFri não emite nem renova certificações. Consulta sempre a listagem oficial para confirmar o estado atual.'],
    ['Opções sem glúten', 'A existência de opções sem glúten não significa necessariamente ausência de contacto cruzado. Ingredientes, preparação, superfícies, utensílios, fritadeiras e procedimentos podem variar.'],
    ['Reportado pela comunidade', 'Descreve uma experiência ou informação partilhada por utilizadores. Não é uma certificação nem uma verificação independente.'],
    ['Informação pendente de validação', 'Não existe evidência suficiente e atual para classificar a informação noutra categoria.'],
    ['Antes de visitar ou consumir', 'Contacta diretamente o estabelecimento e pergunta sobre ingredientes, preparação, superfícies, utensílios, fritadeiras e protocolos. A informação pode mudar.'],
    ['Comunicar informação incorreta', 'Utiliza a opção de reportar numa avaliação ou contacta o projeto pela página de contacto, indicando o estabelecimento e a informação a rever.'],
  ],
  en: [
    ['APC/Biotrab certification', 'This category identifies information attributed to APC/Biotrab certification and links to the stated source. GlutenFri does not issue or renew certifications. Always consult the official listing to confirm current status.'],
    ['Gluten-free options', 'Having gluten-free options does not necessarily mean there is no cross-contact. Ingredients, preparation, surfaces, utensils, fryers and procedures may vary.'],
    ['Community reported', 'This describes an experience or information shared by users. It is not certification or independent verification.'],
    ['Information pending validation', 'There is not enough current evidence to place the information in another category.'],
    ['Before visiting or eating', 'Contact the establishment directly and ask about ingredients, preparation, surfaces, utensils, fryers and protocols. Information may change.'],
    ['Report incorrect information', 'Use the report option on a review or contact the project through the contact page, naming the establishment and information that needs review.'],
  ],
  es: [
    ['Certificación APC/Biotrab', 'Esta categoría identifica información atribuida a la certificación APC/Biotrab y enlaza la fuente indicada. GlutenFri no emite ni renueva certificaciones. Consulta siempre el listado oficial para confirmar el estado actual.'],
    ['Opciones sin gluten', 'Tener opciones sin gluten no significa necesariamente ausencia de contacto cruzado. Los ingredientes, preparación, superficies, utensilios, freidoras y procedimientos pueden variar.'],
    ['Reportado por la comunidad', 'Describe una experiencia o información compartida por usuarios. No es una certificación ni una verificación independiente.'],
    ['Información pendiente de validación', 'No existe evidencia actual suficiente para clasificar la información en otra categoría.'],
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
