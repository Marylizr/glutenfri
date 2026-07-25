import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';
import { useLanguage } from '../i18n/index.jsx';

const sections = {
  'pt-PT': [
    ['Responsável', `O responsável indicado no projeto é ${LEGAL_CONFIG.dataControllerName}. Contacto: ${LEGAL_CONFIG.contactEmail}.`],
    ['Dados tratados', 'Conta: nome, email, hash da palavra-passe e data de registo. Atividade: locais guardados, avaliações, respostas comunitárias e denúncias. Não solicitamos diagnósticos ou historial clínico.'],
    ['Localização', 'Com autorização, a localização é utilizada apenas no dispositivo para centrar o mapa e calcular distâncias. Não é enviada para a API nem associada à conta.'],
    ['Armazenamento local e fornecedores', 'O navegador guarda o token de sessão, dados básicos da conta e preferência de idioma. MongoDB Atlas aloja a base de dados; Netlify aloja a aplicação e Functions; Google Places fornece dados e fotografias de locais.'],
    ['Finalidades e direitos', 'Os dados permitem prestar o serviço, moderar conteúdo e prevenir abuso. Podes pedir acesso, correção, eliminação, limitação, portabilidade ou oposição através do contacto indicado. O Perfil permite exportar dados e eliminar a conta.'],
    ['Conservação e segurança', 'Conta, guardados e avaliações são mantidos enquanto a conta existir, sem prejuízo de cópias técnicas limitadas do fornecedor. Utilizamos HTTPS, hashing de palavras-passe, validação, controlo de acesso e limitação de pedidos.'],
  ],
  en: [
    ['Controller', `The controller currently identified by the project is ${LEGAL_CONFIG.dataControllerName}. Contact: ${LEGAL_CONFIG.contactEmail}.`],
    ['Data processed', 'Account: name, email, password hash and registration date. Activity: saved places, reviews, community answers and reports. We do not request diagnoses or medical histories.'],
    ['Location', 'With permission, location is used only on the device to centre the map and calculate distances. It is not sent to the API or linked to the account.'],
    ['Local storage and providers', 'The browser stores the session token, basic account data and language preference. MongoDB Atlas hosts the database; Netlify hosts the app and Functions; Google Places provides place data and photos.'],
    ['Purposes and rights', 'Data is used to provide the service, moderate content and prevent abuse. You may request access, correction, deletion, restriction, portability or objection through the stated contact. Profile also allows export and account deletion.'],
    ['Retention and security', 'Account, saved places and reviews are retained while the account exists, subject to limited technical provider backups. We use HTTPS, password hashing, validation, access control and request rate limiting.'],
  ],
  es: [
    ['Responsable', `La persona responsable indicada actualmente por el proyecto es ${LEGAL_CONFIG.dataControllerName}. Contacto: ${LEGAL_CONFIG.contactEmail}.`],
    ['Datos tratados', 'Cuenta: nombre, email, hash de contraseña y fecha de registro. Actividad: lugares guardados, reseñas, respuestas comunitarias y reportes. No solicitamos diagnósticos ni historiales médicos.'],
    ['Ubicación', 'Con permiso, la ubicación se usa únicamente en el dispositivo para centrar el mapa y calcular distancias. No se envía a la API ni se asocia a la cuenta.'],
    ['Almacenamiento local y proveedores', 'El navegador guarda el token de sesión, datos básicos de la cuenta y preferencia de idioma. MongoDB Atlas aloja la base de datos; Netlify aloja la aplicación y Functions; Google Places proporciona datos y fotografías de lugares.'],
    ['Finalidades y derechos', 'Los datos permiten prestar el servicio, moderar contenido y prevenir abusos. Puedes solicitar acceso, corrección, eliminación, limitación, portabilidad u oposición mediante el contacto indicado. Perfil también permite exportar datos y eliminar la cuenta.'],
    ['Conservación y seguridad', 'Cuenta, guardados y reseñas se conservan mientras exista la cuenta, sin perjuicio de copias técnicas limitadas del proveedor. Usamos HTTPS, hash de contraseñas, validación, control de acceso y limitación de solicitudes.'],
  ],
};

export default function PrivacyPage() {
  const { language, t } = useLanguage();
  return (
    <LegalPageLayout title={t('privacy')}>
      {sections[language].map(([title, body]) => (
        <section key={title}><h2>{title}</h2><p>{body}</p></section>
      ))}
      <p className="institutional-notice">{t('footerDisclaimer')}</p>
    </LegalPageLayout>
  );
}
