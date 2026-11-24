# Centro jurídico propio de GlutenFri

## Resultado y alcance

Implementación local de un pie legal y páginas propias de GlutenFri en pt-PT, es y en. Sin enlaces jurídicos a SweatMate. El centro reúne términos, privacidad, eliminación de datos, contacto y explicación de información sin gluten. Los textos están preparados para revisión, no constituyen una certificación de cumplimiento jurídico.

Rutas: `/legal`, `/terminos`, `/privacidad`, `/eliminacion-de-datos` y `/contacto`. Se conservaron las rutas existentes, se añadieron las dos nuevas al sitemap y el pie público se incorporó a la portada sin modificar la coreografía del titular o la hamburguesa.

El copyright usa el año actual y «GlutenFri. Todos os direitos reservados». Tras la confirmación expresa de Mary, la entidad operadora es PixelTrend Studio LLC. El pie muestra «Operado pela PixelTrend Studio LLC» y el encabezado compartido de las páginas legales identifica la misma entidad en pt-PT/es/en. PixelTrend Studio se conserva como marca desarrolladora. La operadora se centraliza en `LEGAL_CONFIG.operatorName`; no se infiere que también sea el responsable del tratamiento. La identificación de ese responsable, el domicilio y los datos de registro siguen pendientes de confirmación formal.

## Decisiones y contenido

Los términos distinguen información orientativa, consumo, contenido comunitario, derechos de terceros, gestión de fichas y servicios comerciales. No convierten una ficha, valoración o contratación comercial en certificación ni excluyen derechos imperativos.

La privacidad existente se amplió con campos de reclamaciones, contactos opcionales de reportes, preparación local de solicitudes QA y recursos externos de Google Fonts, Cloudinary y OpenStreetMap. No se añadieron proveedores o envíos de datos en esta tarea.

La página de eliminación explica exportación previa y eliminación desde Perfil, sin ejecutar operaciones por visitarla. La revisión de `server/src/controllers/usersController.js` confirma borrado de cuenta, reseñas, reclamaciones, permisos y solicitudes vinculadas; también confirma que solo determinadas referencias de auditoría se retiran. Los reportes de establecimientos pueden contener contacto independiente, según `EstablishmentReport.js`. Por eso no se promete que el botón borre todos los registros, correspondencia, información pública o copias técnicas. El contacto por email sigue siendo manual; no se envió ninguno.

Fuente oficial consultada el 24/11/2026: [CNPD, derecho al apagamiento de datos](https://www.cnpd.pt/cidadaos/direitos/direito-ao-apagamento-dos-dados/). Su orientación permite distinguir la solicitud de supresión de una garantía absoluta de borrado y enlazar la vía de reclamación. La guía Firecrawl se utilizó para esta consulta, no para copiar condiciones de otro producto.

## Archivos de esta tarea

- `client/src/components/PublicFooter.jsx`: enlaces internos, copyright y crédito traducidos.
- `client/src/pages/OnboardingScreen.jsx`: pie compartido en la portada.
- `client/src/App.jsx`: rutas públicas del centro y eliminación.
- `client/src/pages/LegalHubPage.jsx` y `DataDeletionPage.jsx`: páginas nuevas.
- `client/src/config/legalCopy.js`: contenido propio en tres idiomas.
- `client/src/pages/TermsPage.jsx`, `PrivacyPage.jsx` y `ContactPage.jsx`: adaptación y ampliación.
- `client/src/i18n/index.jsx`: cuatro claves nuevas, con interpolaciones equivalentes.
- `client/src/index.css`: legibilidad y foco legal, copyright adaptable y rejillas del pie sin desbordamiento interno; altura del bloque de portada preservada antes del nuevo pie.
- `server/src/utils/sitemap.js`: únicamente dos rutas estáticas nuevas.
- `client/test/legalPages.test.js`: estructura trilingüe, renderizado de las cinco páginas en tres idiomas, enlaces propios, crédito único y contacto manual.
- `client/test/i18nAudit.test.js`, `responsiveLayout.test.js` y `brandMotion.test.js`: expectativas actualizadas y contexto de router para el pie nuevo.
- `server/test/legalSitemap.test.js`: enlaces propios del sitemap.
- Este informe y capturas de `docs/qa/2026-11-24/legal-*.jpg`, `legal-footer-1440.jpg` y `data-deletion-375.jpg`.

No se modificaron en esta tarea modelos, endpoints de borrado, autenticación, dependencias, clasificación, ranking, confianza, certificación, reseñas o pagos. Los cambios de tareas anteriores se preservaron.

## Pruebas y resultados

Node 24.22.3:

- Cliente `npm test -- --test-reporter=spec`: 91 correctos, 0 fallidos.
- Servidor `env -u MONGODB_TEST_URI ... npm test -- --test-reporter=spec`: 50 correctos, 0 fallidos, 1 integración omitida por no usar MongoDB de pruebas. Los tests que abren puertos locales requirieron ejecución fuera del sandbox; el primer intento limitado falló por EPERM y la repetición autorizada pasó.
- Cliente `npm run lint`: exit 0, 17 advertencias existentes. No se desactivaron reglas.
- Cliente `npm run i18n:audit`: exit 0, 166 claves por idioma, 13 módulos localizados, sin fallos.
- Cliente `npm run build`: exit 0.
- `git diff --check`: exit 0.
- `git status --short`: revisado; cambios previos preservados.
- No existe script typecheck en el cliente.

Chrome, build local en http://127.0.0.1:4189/: centro jurídico revisado visualmente a 375×812, 430×932, 768×1024 y 1440×900. Sin scroll horizontal de página ni desbordamiento interno del pie tras corregir las rejillas. Portada con pie comprobada en los cuatro tamaños. Los cinco enlaces del centro abren las páginas propias y ninguno apunta a SweatMate. Cambio de idioma PT-PT/ES/EN y `<html lang>` comprobados; navegación por Tab alcanza Privacidad con foco de 3 píxeles. Eliminación revisada en móvil. No se ejecutó un borrado real ni se validó la entrega de email.

## Pendientes antes de publicación jurídica definitiva

1. La entidad operadora PixelTrend Studio LLC está confirmada por Mary. Falta confirmar responsable del tratamiento, domicilio y datos de registro aplicables; no se copian datos de SweatMate ni se infieren datos registrales.
2. Revisión jurídica de bases de legitimación, finalidades y datos de contacto exigibles. La implementación técnica no establece por sí sola esas bases.
3. Confirmar plazos por categoría, retención de logs y copias, datos libres de auditoría y reportes independientes de la cuenta. No se ha auditado el borrado integral en proveedores.
4. Verificar acuerdos, localizaciones y garantías de transferencias con proveedores; no se presume residencia europea o adecuación por usar un proveedor conocido.
5. Revisar minimización de información sensible en texto libre y el procedimiento manual para derechos, identificación y reclamaciones.
6. Confirmar la disponibilidad del servicio antes de validar exportación y eliminación en un entorno autorizado. No se declara resuelto el incidente previo de conexión.

No se hizo commit, push, PR, deploy, migración ni escritura en bases reales. Se mantiene la independencia de GlutenFri respecto a APC/Biotrab y la separación comercial de PixelTrend Studio. El informe permanece dentro del repositorio conforme al destino documental de este proyecto.

## Confirmación de la entidad operadora

Mary confirmó expresamente PixelTrend Studio LLC como entidad operadora. Se actualizaron `client/src/config/legal.js`, `components/PublicFooter.jsx`, `components/LegalPageLayout.jsx`, `pages/LegalHubPage.jsx`, `config/legalCopy.js` e `i18n/index.jsx`. El nombre aparece en el pie compartido y en el encabezado de todas las páginas que usan el layout legal. Las traducciones indican «Operado pela», «Operado por» y «Operated by». Se mantiene la distinción respecto a la marca desarrolladora y al responsable de datos previamente indicado; confirmar la operación no confirma automáticamente ese otro rol. No se inventaron domicilio, jurisdicción, número de registro ni datos fiscales.

Se actualizaron `client/test/legalPages.test.js` y `responsiveLayout.test.js`, incluyendo prueba de la entidad en encabezado y pie de las cinco páginas en los tres idiomas. Nueva ejecución con Node 24.22.3: 92 tests correctos; i18n, build y diff check correctos; lint exit 0 con las mismas 17 advertencias. No se repitieron tests del servidor porque esta actualización no modifica backend. Git status revisado y cambios anteriores preservados.

Chrome local: nombre confirmado visible en centro y pie, traducciones ES/EN comprobadas, 375×812, 430×932, 768×1024 y 1440×900 sin scroll horizontal de página ni del pie. Capturas `docs/qa/2026-11-24/operator-legal-{375,430,768,1440}.jpg` y `operator-footer-1440.jpg`. No se modificaron diseños, fuentes, modelos, clasificación o relaciones institucionales. No se hizo commit, push, PR, deploy ni migración. Continúan pendientes los demás datos jurídicos enumerados arriba.
