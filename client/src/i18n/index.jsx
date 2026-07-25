/* oxlint-disable react/only-export-components -- contexto y helpers forman una única API de i18n */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeLanguage, readStoredLanguage } from './language.js';

export const LANGUAGE_KEY = 'gf_language';
export const LANGUAGES = [
  { value: 'pt-PT', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const messages = {
  'pt-PT': {
    language: 'Idioma',
    start: 'Começar a explorar',
    loginPrompt: 'Já tens conta? Inicia sessão',
    heroBadge: 'Informação sobre opções sem glúten',
    heroTitle: 'Descobre opções sem glúten',
    heroAccent: 'no norte de Portugal',
    heroDescription: 'Consulta informação, fontes e experiências da comunidade antes de escolher um local.',
    heroFeature1: 'Categorias de informação claramente identificadas',
    heroFeature2: 'Fontes e datas apresentadas quando disponíveis',
    heroFeature3: 'Experiências da comunidade não substituem certificação',
    explore: 'Explorar opções sem glúten',
    search: 'Procurar local ou cidade…',
    loading: 'A carregar…',
    loadError: 'Não foi possível carregar os estabelecimentos. Tenta novamente.',
    loadNetworkError: 'Não foi possível contactar o serviço. Verifica a ligação e tenta novamente.',
    loadHttpError: 'O serviço de estabelecimentos respondeu com um erro. Tenta novamente.',
    loadDataError: 'Os dados recebidos não têm um formato válido. Tenta novamente mais tarde.',
    noResults: 'Não encontrámos locais com estes filtros.',
    retry: 'Tentar novamente',
    all: 'Todos',
    home: 'Início',
    restaurants: 'Restaurantes',
    bakeries: 'Pastelarias',
    stores: 'Lojas',
    pharmacies: 'Farmácias',
    supermarkets: 'Supermercados',
    map: 'Mapa',
    saved: 'Guardados',
    reviews: 'Avaliações',
    profile: 'Perfil',
    certificationFilter: 'Apenas certificados pela APC/Biotrab',
    filters: 'Filtros',
    trustInformation: 'Informação de confiança',
    clearFilters: 'Limpar',
    discountFilter: 'Com desconto',
    allTypes: 'Todos os tipos',
    trustCertified: 'Certificado APC/Biotrab',
    trustCommunity: 'Reportado pela comunidade — não certificado',
    trustPending: 'Informação pendente de validação',
    source: 'Fonte',
    sourceMissing: 'Fonte não indicada',
    lastChecked: 'Última verificação',
    dateMissing: 'Data de verificação indisponível',
    understandCategory: 'Compreender esta categoria',
    photoAlt: 'Fotografia de {name}',
    photoFallback: 'Fotografia indisponível para {name}',
    informationNotice: 'Confirma diretamente com o estabelecimento os ingredientes e protocolos antes de consumir.',
    independentShort: 'Projeto independente, sem afiliação à APC, Biotrab ou entidades certificadoras.',
    safetyPageTitle: 'Como interpretamos a informação sem glúten',
    privacy: 'Política de privacidade',
    terms: 'Termos e condições',
    contact: 'Contacto',
    about: 'Sobre o projeto',
    footerDisclaimer: 'GlutenFri é um projeto independente desenvolvido pela PixelTrend Studio. Não representa, não pertence e não está afiliado à Associação Portuguesa de Celíacos (APC), à Biotrab ou a qualquer entidade certificadora. As referências a certificações destinam-se apenas a identificar informação proveniente das fontes indicadas.',
    back: 'Voltar',
    metaTitle: 'GlutenFri · Informação sobre opções sem glúten no norte de Portugal',
    metaDescription: 'Descobre estabelecimentos e consulta fontes, categorias de confiança e experiências da comunidade sobre opções sem glúten.',
    animationAlt: 'Ilustração de uma hambúrguer montada em camadas sobre um prato',
    googleAttribution: 'Dados de localização: Google Maps',
  },
  en: {
    language: 'Language',
    start: 'Start exploring',
    loginPrompt: 'Already have an account? Log in',
    heroBadge: 'Information about gluten-free options',
    heroTitle: 'Discover gluten-free options',
    heroAccent: 'in northern Portugal',
    heroDescription: 'Review information, sources and community experiences before choosing a place.',
    heroFeature1: 'Clearly identified information categories',
    heroFeature2: 'Sources and dates shown when available',
    heroFeature3: 'Community experiences do not replace certification',
    explore: 'Explore gluten-free options',
    search: 'Search place or city…',
    loading: 'Loading…',
    loadError: 'We could not load the establishments. Please try again.',
    loadNetworkError: 'We could not reach the service. Check your connection and try again.',
    loadHttpError: 'The establishment service returned an error. Please try again.',
    loadDataError: 'The received data has an invalid format. Please try again later.',
    noResults: 'No places match these filters.',
    retry: 'Try again',
    all: 'All',
    home: 'Home',
    restaurants: 'Restaurants',
    bakeries: 'Bakeries',
    stores: 'Shops',
    pharmacies: 'Pharmacies',
    supermarkets: 'Supermarkets',
    map: 'Map',
    saved: 'Saved',
    reviews: 'Reviews',
    profile: 'Profile',
    certificationFilter: 'APC/Biotrab certified only',
    filters: 'Filters',
    trustInformation: 'Trust information',
    clearFilters: 'Clear',
    discountFilter: 'With discount',
    allTypes: 'All types',
    trustCertified: 'APC/Biotrab certified',
    trustCommunity: 'Community reported — not certified',
    trustPending: 'Information pending validation',
    source: 'Source',
    sourceMissing: 'Source not provided',
    lastChecked: 'Last checked',
    dateMissing: 'Verification date unavailable',
    understandCategory: 'Understand this category',
    photoAlt: 'Photo of {name}',
    photoFallback: 'Photo unavailable for {name}',
    informationNotice: 'Confirm ingredients and preparation protocols directly with the establishment before consuming.',
    independentShort: 'Independent project, not affiliated with APC, Biotrab or any certification body.',
    safetyPageTitle: 'How we interpret gluten-free information',
    privacy: 'Privacy policy',
    terms: 'Terms and conditions',
    contact: 'Contact',
    about: 'About the project',
    footerDisclaimer: 'GlutenFri is an independent project developed by PixelTrend Studio. It does not represent, belong to, or have an affiliation with the Portuguese Celiac Association (APC), Biotrab, or any certification body. References to certifications are provided solely to identify information obtained from the stated sources.',
    back: 'Back',
    metaTitle: 'GlutenFri · Gluten-free information in northern Portugal',
    metaDescription: 'Discover establishments and review sources, trust categories and community experiences about gluten-free options.',
    animationAlt: 'Illustration of a layered burger assembling over a plate',
    googleAttribution: 'Location data: Google Maps',
  },
  es: {
    language: 'Idioma',
    start: 'Empezar a explorar',
    loginPrompt: '¿Ya tienes cuenta? Inicia sesión',
    heroBadge: 'Información sobre opciones sin gluten',
    heroTitle: 'Descubre opciones sin gluten',
    heroAccent: 'en el norte de Portugal',
    heroDescription: 'Consulta información, fuentes y experiencias de la comunidad antes de elegir un lugar.',
    heroFeature1: 'Categorías de información claramente identificadas',
    heroFeature2: 'Fuentes y fechas visibles cuando están disponibles',
    heroFeature3: 'Las experiencias comunitarias no sustituyen una certificación',
    explore: 'Explorar opciones sin gluten',
    search: 'Buscar lugar o ciudad…',
    loading: 'Cargando…',
    loadError: 'No pudimos cargar los establecimientos. Intenta de nuevo.',
    loadNetworkError: 'No pudimos contactar con el servicio. Comprueba la conexión e inténtalo de nuevo.',
    loadHttpError: 'El servicio de establecimientos respondió con un error. Inténtalo de nuevo.',
    loadDataError: 'Los datos recibidos no tienen un formato válido. Inténtalo más tarde.',
    noResults: 'No encontramos lugares con esos filtros.',
    retry: 'Reintentar',
    all: 'Todos',
    home: 'Inicio',
    restaurants: 'Restaurantes',
    bakeries: 'Pastelerías',
    stores: 'Tiendas',
    pharmacies: 'Farmacias',
    supermarkets: 'Supermercados',
    map: 'Mapa',
    saved: 'Guardados',
    reviews: 'Reseñas',
    profile: 'Perfil',
    certificationFilter: 'Solo certificados por APC/Biotrab',
    filters: 'Filtros',
    trustInformation: 'Información de confianza',
    clearFilters: 'Limpiar',
    discountFilter: 'Con descuento',
    allTypes: 'Todos los tipos',
    trustCertified: 'Certificado APC/Biotrab',
    trustCommunity: 'Reportado por la comunidad — no certificado',
    trustPending: 'Información pendiente de validación',
    source: 'Fuente',
    sourceMissing: 'Fuente no indicada',
    lastChecked: 'Última verificación',
    dateMissing: 'Fecha de verificación no disponible',
    understandCategory: 'Comprender esta categoría',
    photoAlt: 'Fotografía de {name}',
    photoFallback: 'Fotografía no disponible para {name}',
    informationNotice: 'Confirma directamente con el establecimiento los ingredientes y protocolos antes de consumir.',
    independentShort: 'Proyecto independiente, sin afiliación con APC, Biotrab ni entidades certificadoras.',
    safetyPageTitle: 'Cómo interpretamos la información sin gluten',
    privacy: 'Política de privacidad',
    terms: 'Términos y condiciones',
    contact: 'Contacto',
    about: 'Sobre el proyecto',
    footerDisclaimer: 'GlutenFri es un proyecto independiente desarrollado por PixelTrend Studio. No representa, no pertenece ni está afiliado a la Asociación Portuguesa de Celíacos (APC), Biotrab ni a ninguna entidad certificadora. Las referencias a certificaciones se incluyen únicamente para identificar información procedente de las fuentes indicadas.',
    back: 'Volver',
    metaTitle: 'GlutenFri · Información sobre opciones sin gluten en el norte de Portugal',
    metaDescription: 'Descubre establecimientos y consulta fuentes, categorías de confianza y experiencias comunitarias sobre opciones sin gluten.',
    animationAlt: 'Ilustración de una hamburguesa montándose por capas sobre un plato',
    googleAttribution: 'Datos de ubicación: Google Maps',
  },
};

export function getInitialLanguage(storage = localStorage) {
  return readStoredLanguage(storage);
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);
  const setLanguage = (nextLanguage) => setLanguageState(normalizeLanguage(nextLanguage));

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    document.title = messages[language].metaTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', messages[language].metaDescription);
  }, [language]);

  const value = useMemo(() => {
    const translate = (key, variables = {}) => {
      const template = messages[language][key] ?? messages['pt-PT'][key] ?? key;
      return Object.entries(variables).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
        template
      );
    };
    return { language, setLanguage, t: translate };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  return context;
}

export function formatVerificationDate(value, language) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(date);
}

export { messages, normalizeLanguage };
