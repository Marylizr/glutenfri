import LegalPageLayout from '../components/LegalPageLayout.jsx';
import { LEGAL_CONFIG } from '../config/legal.js';
import { useLanguage } from '../i18n/index.jsx';

const content = {
  'pt-PT': {
    intro: 'GlutenFri é um produto independente desenvolvido pela PixelTrend Studio para tornar mais simples a descoberta e avaliação de informação sobre opções sem glúten.',
    sections: [
      ['Problema', 'A informação está dispersa, muda ao longo do tempo e pode confundir procedência com garantia. O produto reúne locais, fontes e experiências sem substituir a confirmação direta.'],
      ['Objetivo e contexto', 'Criar uma experiência pública útil, móvel e multilingue que também demonstre capacidade real em UX/UI, plataformas, diretórios, mapas e qualidade de dados.'],
      ['Decisões de produto', 'Mapa e lista sincronizados, pesquisa e filtros, fichas acionáveis, guardados, reportes e reclamação de fichas. Categoria, fonte, confiança e conteúdo comercial permanecem separados.'],
      ['Arquitetura e stack', 'React, Vite e Leaflet no frontend; Node.js, Express e MongoDB no backend; API REST, autenticação, moderação e backoffice administrativo.'],
      ['Idiomas e acessibilidade', 'Português de Portugal como idioma principal, com versões em inglês e espanhol, navegação por teclado, nomes acessíveis e layouts responsivos.'],
      ['Resultados reais', 'Existe um diretório funcional com mapa, fichas, comunidade, guardados, reclamações, reportes e administração. Não publicamos métricas de impacto sem medição verificável.'],
      ['Próximos passos', 'Continuar a rever fontes, melhorar a cobertura e validar o produto com utilizadores e estabelecimentos, sem ativar pagamentos ou integrações institucionais nesta etapa.'],
    ],
  },
  en: {
    intro: 'GlutenFri is an independent product developed by PixelTrend Studio to make it easier to discover and assess information about gluten-free options.',
    sections: [
      ['Problem', 'Information is fragmented, changes over time and can blur provenance with guarantees. The product brings together places, sources and experiences without replacing direct confirmation.'],
      ['Goal and context', 'Build a useful, mobile and multilingual public experience that also demonstrates real capability in UX/UI, platforms, directories, maps and data quality.'],
      ['Product decisions', 'Synchronised map and list, search and filters, actionable listings, saves, reports and listing claims. Category, source, confidence and commercial content remain separate.'],
      ['Architecture and stack', 'React, Vite and Leaflet on the frontend; Node.js, Express and MongoDB on the backend; REST API, authentication, moderation and an admin back office.'],
      ['Languages and accessibility', 'European Portuguese as the primary language, with English and Spanish versions, keyboard navigation, accessible names and responsive layouts.'],
      ['Real outcomes', 'A working directory with a map, listings, community experiences, saves, claims, reports and administration. We do not publish impact metrics without verifiable measurement.'],
      ['Next steps', 'Continue reviewing sources, improve coverage and validate the product with users and establishments, without enabling payments or institutional integrations at this stage.'],
    ],
  },
  es: {
    intro: 'GlutenFri es un producto independiente desarrollado por PixelTrend Studio para simplificar el descubrimiento y la evaluación de información sobre opciones sin gluten.',
    sections: [
      ['Problema', 'La información está dispersa, cambia con el tiempo y puede confundir procedencia con garantía. El producto reúne lugares, fuentes y experiencias sin sustituir la confirmación directa.'],
      ['Objetivo y contexto', 'Crear una experiencia pública útil, móvil y multilingüe que también demuestre capacidad real en UX/UI, plataformas, directorios, mapas y calidad de datos.'],
      ['Decisiones de producto', 'Mapa y lista sincronizados, búsqueda y filtros, fichas accionables, guardados, reportes y reclamación de fichas. Categoría, fuente, confianza y contenido comercial permanecen separados.'],
      ['Arquitectura y stack', 'React, Vite y Leaflet en el frontend; Node.js, Express y MongoDB en el backend; API REST, autenticación, moderación y panel administrativo.'],
      ['Idiomas y accesibilidad', 'Portugués de Portugal como idioma principal, con versiones en inglés y español, navegación por teclado, nombres accesibles y layouts responsive.'],
      ['Resultados reales', 'Existe un directorio funcional con mapa, fichas, comunidad, guardados, reclamaciones, reportes y administración. No publicamos métricas de impacto sin medición verificable.'],
      ['Próximos pasos', 'Continuar revisando fuentes, mejorar la cobertura y validar el producto con usuarios y establecimientos, sin activar pagos ni integraciones institucionales en esta etapa.'],
    ],
  },
};

export default function AboutPage() {
  const { language, t } = useLanguage();
  const page = content[language];
  return (
    <LegalPageLayout title={t('about')}>
      <p className="services-lead">{page.intro}</p>
      {page.sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
      <p>{t('footerDisclaimer')}</p>
      <p><strong>{LEGAL_CONFIG.developerName}</strong></p>
    </LegalPageLayout>
  );
}
