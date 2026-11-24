# GlutenFri — acabado glass y logo local

Fecha: 24/11/2026. Alcance: implementación y QA locales; no publicación.

## Objetivo y decisiones

Actualizar los materiales visuales sin modificar rutas, búsqueda, fuentes, confianza, certificaciones, reseñas ni negocio. Conservar Roboto 400 para cuerpo, 600 para titulares, verde salvia y el acento aprobado `#7D2E1B`.

Apple Design orientó las capas translúcidas, el peso de los materiales y las alternativas de accesibilidad. La referencia de design-taste fue `pastel-consumer`, semilla `1412586308`, conservando paleta y tipografía. Su prohibición general de glass se exceptúa por petición expresa de Mary. No se sustituyen los recorridos existentes por la composición genérica de la referencia.

El desenfoque se limita a navegación, controles flotantes y filtros. Las tarjetas repetidas no usan backdrop blur: tienen fondo legible, borde de luz y sombra suave para evitar un coste innecesario de scroll. Foco visible, alternativa sólida con alto contraste/transparencia reducida y reducción de movimiento.

El PNG adjunto se copia sin regenerarlo ni editarlo: 3300 × 1712, aproximadamente 104 KB. SHA-256 de original y copia: `9964709740972875a27755ab5b6a8d00b7dd9fce675a71350c44be94c048699e`. BrandLogo sirve el recurso local en todas sus superficies, incluido el panel administrativo. Open Graph y Twitter apuntan al mismo recurso; el favicon/PWA conserva el icono SVG local existente.

## Archivos

- `client/src/styles/glass.css`: tokens y materiales compartidos.
- `client/src/main.jsx`: carga del material tras los estilos base.
- `client/src/index.css`: tamaño del logo y legibilidad de la etiqueta de imagen ilustrativa.
- `client/src/config/brand.js`, `client/src/components/BrandLogo.jsx`, `client/public/brand/logo-glutenfri.png`, `client/index.html`: logo local y metadatos.
- `client/src/components/RestaurantCard.jsx`, `SearchBar.jsx`, `SaveButton.jsx`, `GoogleAttribution.jsx`: presentación reutilizable, guardar de 44 px con estado accesible e icono coherente, texto auxiliar mínimo de 11 px.
- `client/test/glassMaterial.test.js`: cuatro pruebas nuevas de material, logo, controles y contraste.
- `client/test/responsiveLayout.test.js`, `trustAndLocalization.test.js`: expectativas actualizadas a las nuevas dimensiones y recursos locales.

No se modificaron dependencias, lockfiles, traducciones, modelos, servicios de datos ni lógica comercial. Los cambios pendientes del diagnóstico MongoDB en `server/` se preservan y no forman parte del rediseño. No se cambió configuración de Netlify ni se accedió al llavero durante esta tarea.

## Comprobaciones

- `npm test --prefix client`: 98/98 pasan. Algunas ejecuciones muestran el aviso de Vite sobre el puerto HMR 24678 ya ocupado; no se detuvieron procesos ajenos ni se cambiaron las pruebas para ocultarlo.
- `npm run lint --prefix client`: exit 0; permanecen 17 warnings preexistentes.
- `npm run i18n:audit --prefix client`: exit 0, sin fallos en PT-PT, ES y EN.
- `VITE_API_URL=/api npm run build --prefix client`: exit 0. El build usa la API del mismo origen, no localhost.
- `git diff --check`: correcto.
- Inspector de diseño sobre el build final: exit 0, cero FAIL en 1440 × 900, 768 × 1024 y 375 × 812, con excepciones explícitas `gradient`, `glass`, `button-fx` para el material solicitado. No es una aprobación creativa de Mary.
- Advertencias de diseño conservadas: tamaño de titular existente, metadatos de 11–12 px, numerales tabulares, alturas variables de tarjetas y listado largo de 72 locales. No se ocultan registros ni se inventan datos para satisfacer el inspector.
- El lint estético estático sin excepciones marca los dos gradientes neutros y advierte sobre sombras/glass: son elecciones explícitas del material, no fallos del lint de código.

Playwright comprueba las dimensiones exactas 375 × 812, 430 × 932, 768 × 1024 y 1440 × 900: sin scroll horizontal; logo local con anchura natural de 3300; 72 tarjetas cargadas. Comprueba foco visible, abrir filtros por teclado y cerrar por Escape, búsqueda sin coincidencias, filtro Lojas (21 locales), PT-PT/ES/EN con `html lang`, alto contraste y navegación a ficha con regreso al directorio.

Preview de QA con GET al catálogo público, sin credenciales ni conexión directa de pruebas a Atlas. Los POST de analítica se simulan únicamente en el navegador de QA y nunca se envían a producción. Las capturas esperan a las fotos visibles y al final de la animación del filtro. El inspector asigna una altura incorrecta a anchuras no predefinidas como 430; esa vista se valida con Playwright a 430 × 932, no con su captura de 430 × 269.

Evidencias locales, excluidas de Git: `.netlify/design-qa/final/report.json`, `glass-375.png`, `glass-430.png`, `glass-768.png`, `glass-1440.png`, `glass-filters.png` y `browser-checks.js`.

## Revisión visual

ROUND final

- Visto en un segundo: directorio de locales con navegación ligera y marca nítida.
- Idea: la información y procedencia de los locales permanece sobre superficies legibles, mientras la navegación utiliza un material de cristal salvia.
- Elemento interactivo: búsqueda por ciudad y filtros reales del catálogo existente.
- Composición: cabecera / controles / catálogo fotográfico / pie editorial existente.
- Valoración interna orientativa: diseño 7, usabilidad 8, creatividad 7, contenido 8; total ponderado 7,4. No equivale a aprobación del usuario.
- Problemas principales abordados: recurso externo del logo, superficies planas, metadatos de 10 px. Se conservan las alturas naturales de las tarjetas para no introducir grandes huecos en registros breves.

No se validó visualmente una sesión administrativa autenticada ni se crearon cuentas para este cambio. El logo de administración comparte el componente y está cubierto por las comprobaciones de integración de código, no por una afirmación de QA autenticado.

## Estado al cerrar la validación local

Sin commit, push, PR, merge, deploy, migraciones ni escrituras de datos. Se conserva la independencia de GlutenFri respecto de APC/Biotrab y la separación de PixelTrend Studio. La aprobación visual y cualquier publicación quedan pendientes de Mary.

Este apartado registra el cierre del QA local, anterior a la autorización posterior de commit, push y deploy. No representa el estado de una publicación posterior.
