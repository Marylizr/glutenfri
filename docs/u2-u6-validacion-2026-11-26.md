# GlutenFri — entrega local U2–U6

26/11/2026. Autorización: continuar el resto del plan, manteniendo el trabajo
local, sin Chrome, otros proyectos ni publicación. Rama conservada
`codex/mongodb-connection-diagnostics`, HEAD de partida y de entrega
`327b07c78ba39c7c94d235246133c02875cde25a`.

## Estado real, sin confundir preparación con ejecución

| Fase | Entrega local | Qué falta para su cierre completo |
| --- | --- | --- |
| U2 | Cards y resumen práctico; desconocidos, fechas y procedencia separados | Revisión del catálogo real, no autorizada en esta tarea |
| U3 | Intenciones, filtros URL comunes, lista/mapa coherentes, horarios corregidos | QA física y las dos dimensiones exactas que el navegador no reprodujo |
| U4 | Cola priorizada, carga paginada, agenda auditada y procedimiento | Responsable/capacidad y piloto editorial real; no se han verificado 30–50 negocios |
| U5 | Tareas, criterios y analizador de observaciones preparados y probados | Reclutamiento/consentimiento y sesiones reales; cero participantes, sin métricas reales |
| U6 | Bloqueo, premoderación, privacidad de reseñas y candidato técnico | Recorridos autenticados visuales/ físicos completos, responsables, privacidad y aprobación de release |

**El plan no está cerrado de extremo a extremo.** Las partes externas no se
simulan ni se sustituyen por tests que compilan. U1 conserva su limitación:
recuperación por email validada solo con buzón QA, sin proveedor real activado.

## Decisiones y cambios por fase

### U2 — Entender una ficha

- Mantiene masonry, imágenes, favoritos y atribución. Añade oferta/categoría,
  localidad desconocida explícita, descuento etiquetado y acción «Ver ficha».
- La puntuación se describe como valoración general, no puntuación de protocolos
  sin gluten. Las imágenes ilustrativas siguen identificadas como tales.
- Resumen del detalle: oferta, menú, cocina exclusiva, teléfono y horario. `false`
  se distingue de ausencia; esta última no se convierte en «no».
- Revisión de fuente y actualización comercial utilizan fechas diferentes. Una
  actualización o fecha reciente por sí sola ya no concede `source_verified`.
  Una revisión explícita requiere fuente y enlace; el estado sigue sin garantizar consumo.
- Cierre o indisponibilidad explícitos conservan aviso, sin borrado automático.

### U3 — Buscar y volver

- `useDiscovery` comparte el contrato URL y la misma función de resultados entre
  lista y mapa. Cambiar de vista por los enlaces conserva consulta e intención.
- Intenciones cerradas: comer → restaurante, pan/pastelería → panadería,
  comprar → tienda/supermercado/farmacia. Las categorías detalladas se mantienen.
- Conserva normalización de acentos y orden por defecto; no se añade ranking,
  geocodificador, SDK ni envío de búsquedas o coordenadas a terceros.
- Vacío distingue catálogo vacío de ausencia de coincidencias. Quitar filtros
  conserva la consulta; un fallo de servicio sigue teniendo reintento explícito.
- «Abierto ahora» usa horario semanal, excepciones por fecha, zona horaria y
  arrastre nocturno. Un día ausente o inválido no se convierte en cerrado.
  Cerrado explícito `[]` se conserva. Excepciones de cierre prevalecen.
  Recalcula cada minuto sin volver a solicitar datos a la API.
- Corregido un bucle observado tras caducar sesión: el aviso dirige al login
  una sola vez y después permite explorar sin iniciar sesión.

### U4 — Mantenimiento

La cola interna prioriza reportes, cierres, revisión vencida y datos esenciales
ausentes, sin cambiar el orden público. Carga todas las páginas dentro de un
límite explícito y rechaza truncamiento silencioso. La fecha `nextReviewDueAt`
existente ahora se edita en Calidad de datos y se incluye en el historial con
anterior/nuevo valor y actor. Se mantienen los permisos comerciales existentes.

Procedimiento, responsables pendientes, evidencia y cadencia propuesta:
[operación editorial](operacion-editorial-u4.md).

### U5 — Medición preparada, no activa

El protocolo contiene siete tareas y criterios observables. `utilityStudy.js`
valida tipos cerrados, descarta contexto libre y calcula resultados solo con
observaciones entregadas. No está conectado a la UI, no almacena ni envía eventos.
Pruebas sintéticas del analizador no son entrevistas realizadas ni evidencia de
éxito comercial. [Protocolo completo](estudio-utilidad-u5.md).

### U6 — Moderación y candidato

- Bloqueo por cuenta: idempotente, privado, reversible y efectivo en comunidad y
  detalle. Perfil permite consultar/desbloquear; la exportación incluye solo la
  lista propia y el borrado elimina referencias a autores borrados.
- Comentarios escritos y fotografías nuevos se retienen para revisión humana.
  El autor ve que están ocultos o pendientes. Las reglas auxiliares no se venden
  como detección infalible. Editar no permite levantar una ocultación.
- Aprobación administrativa compara `expectedUpdatedAt`; una versión ausente o
  obsoleta devuelve 409, no publica una versión distinta de la revisada.
- Recalcula resumen comunitario con reseñas públicas al publicar, ocultar,
  restaurar o eliminar una cuenta. Un bloqueo personal no cambia el promedio.
- No expone identidades de denunciantes ni marcas internas en los feeds,
  respuestas propias de edición o exportación del autor.
- Política de privacidad actualizada en tres idiomas; no equivale a revisión
  jurídica ni a aprobación de Apple/Google.

Puertas de publicación, moderación operativa, notas y rollback:
[candidato U6](release-utilidad-u6.md).

## Archivos propios de esta continuación

Nuevos:

- `client/src/components/{PlaceDecisionSummary,DiscoveryIntent,BlockAuthorButton,BlockedAuthors}.jsx`.
- `client/src/hooks/{useDiscovery,useMinuteClock}.js`.
- `client/src/utils/{placeDecision,editorialQueue,utilityStudy}.js`.
- `client/test/utilityRemaining.test.js`.
- `server/src/utils/contentModeration.js`, `server/src/services/communitySummary.js`.
- `server/test/utilityModeration.test.js`.
- Este informe, `docs/operacion-editorial-u4.md`, `docs/estudio-utilidad-u5.md`
  y `docs/release-utilidad-u6.md`.

Modificados de forma focalizada:

- Cliente: `App.jsx`; `admin/views/{DataQualityView,ModerationView}.jsx`;
  `components/{RestaurantCard,ScoreBadge,TrustDetails,SafetyReviewFlow}.jsx`;
  `pages/{ExplorePage,HomePage,EstablishmentDetailPage,ReviewsPage,ProfilePage,PrivacyPage}.jsx`;
  `services/admin.js`, `i18n/index.jsx`, `styles/glass.css`;
  `utils/{establishmentData,establishmentFilters,openingHours,trustStatus}.js`.
- Auditoría y tests cliente: `scripts/audit-i18n.mjs`,
  `test/{i18nAudit,establishmentsLoading,productFeatures,responsiveLayout,trustAndLocalization}.test.js`.
- Servidor: `controllers/{adminController,establishmentsController,reviewsController,usersController}.js`;
  `middleware/auth.js`; `models/{User,Review}.js`; `routes/{admin,reviews,users}.js`;
  `utils/{reviewFormatting,trustStatus}.js`; `test/trustStatus.test.js`;
  `scripts/runUtilityQa.js` solo para rutas de fixtures locales.
- Plan actualizado con estado histórico y actual separados. Sin editar AGENTS.md.
- `mobile:sync` actualizó los bundles nativos generados dentro de GlutenFri.

## Cambios previos preservados

El checkout ya estaba modificado: preparación móvil/dependencias, recuperación
manual y U1, cabecera/pie compactos y otros archivos. No se hizo stash, reset,
restauración ni limpieza de esos cambios. No se cambiaron dependencias, versiones,
lockfiles, configuración de proveedores, secreto JWT o credenciales en esta tarea.
Las ediciones de Perfil, App, i18n, auth y CSS conservaron exportación, borrado,
recuperación, navegación nativa y compactación anteriores. No se cambió el icono,
no se volvió a restablecer la cuenta admin y no se consultó su contraseña.

## Validaciones reales

Node 24.22.3 según `engines`. Mongo temporal `127.0.0.1:27189`, dbpath propio
`.netlify/u2-u6/mongo`, sin `.env`, Atlas ni credenciales reales.

Manifiesto de fuentes, tests y scripts (no del repositorio completo):
`.netlify/u2-u6/source-manifest.txt`, SHA-256
`cfc7dbde9f522e8ca9128f44404af4cf6694bc372d38abd3b9839f2ede065eb3`.
Identifica este estado local sin confundirlo con un commit ni un deploy.

| Comando | Resultado |
| --- | --- |
| `npm test --prefix client` | 129 aprobadas, 0 fallos, 0 omitidas |
| `npm test --prefix server` con cuatro URI QA explícitas | 83 aprobadas, 0 fallos, 0 omitidas |
| `npm run lint --prefix client` | exit 0, 15 avisos previos; ninguno nuevo |
| `npm run i18n:audit --prefix client` | 239 claves por idioma, 408 hojas admin por idioma, sin fallos |
| `npm run build --prefix client` | exit 0 |
| `npm run mobile:sync --prefix client` | exit 0, web/Android/iOS sincronizados |
| `npm run mobile:verify --prefix client` | 130 ficheros verificados; API pública configurada, sin firma/envío/QA física |
| `node client/scripts/build-native-unsigned.mjs ios` | exit 0; avisos de destino genérico de Xcode, sin errores de compilación |
| `node client/scripts/build-native-unsigned.mjs android` | exit 0, BUILD SUCCESSFUL |
| `git diff --check` | exit 0 |
| `git status --short` | árbol modificado esperado; sin operación Git de publicación |

No existe script typecheck separado. Logs locales ignorados en
`.netlify/u2-u6/`: `client-final.log`, `server-final.log`, `lint-final.log`,
`i18n-final.log`, `build-final.log`, `mobile-sync.log`, `mobile-verify.log`,
`ios-build-final.log`, `android-build-final.log`. No contienen claves reales.

Las bases de pruebas explícitas fueron `glutenfri_mobile_qa`,
`glutenfri_mobile_accounts_qa`, `glutenfri_u1_auth_qa` y `glutenfri_utility_qa`,
siempre en el mismo loopback aislado. No se ejecutaron migraciones, backfills,
índices de producción ni seed contra bases reales.

Invocación de la suite completa del servidor, con Node 24 en PATH:

```sh
MONGODB_TEST_URI=mongodb://127.0.0.1:27189/glutenfri_mobile_qa \
GLUTENFRI_MOBILE_QA_URI=mongodb://127.0.0.1:27189/glutenfri_mobile_accounts_qa \
GLUTENFRI_U1_QA_URI=mongodb://127.0.0.1:27189/glutenfri_u1_auth_qa \
GLUTENFRI_UTILITY_QA_URI=mongodb://127.0.0.1:27189/glutenfri_utility_qa \
npm test --prefix server
```

Pruebas nuevas incluyen falsos/desconocidos, fechas no intercambiables, no ascenso
automático de confianza, intenciones, query compartible, horarios especiales,
Açores, medianoche, cambios de hora, paginación editorial completa, esquema mínimo
del estudio y API real local de bloqueo/moderación/exportación/borrado. Prueban
aprobación obsoleta rechazada y que editar no levanta una ocultación.
Se actualizaron expectativas anteriores de «ocultar metadata ausente» porque el
nuevo contrato exige desconocidos explícitos; no se eliminó el test ni se redujeron
las aserciones de procedencia. La fixture incompleta inicial y un horario mixto
inválido causaron fallos durante el desarrollo y se corrigieron, no se ignoraron.

## Revisión visual real, exclusivamente navegador integrado

- Búsqueda Porto + comprar: 12 fixtures; mapa conserva consulta/intención y muestra
  el mismo conjunto de marcadores/tarjetas. No son 12 locales reales revisados.
- Buscar «incompleto», abrir ficha y volver conserva consulta y cinco fixtures.
- Detalle con seis desconocidos explícitos y fuente ausente, en PT/ES/EN.
- Búsqueda sin coincidencias distinta de fallo; limpiar filtros conserva texto.
- Aviso de horarios desconocidos en «abierto ahora»; Escape cierra panel y el
  teclado muestra foco visible (outline sólido de aproximadamente 3 px).
- Se detectó y corrigió compresión de categorías en tablet, y se volvió a
  inspeccionar su composición corregida.

Dimensiones efectivas: **375×812 y 1440×900 exactas**; **430×931 y 769×1024
aproximadas**, por escala del navegador integrado. Sin scroll horizontal en esas
lecturas. No atribuir la revisión a 430×932 o 768×1024 exactos. Las capturas se
inspeccionaron en herramienta; no se inventan rutas de PNG persistentes.
No se han comprobado todas las vistas con lector de pantalla o texto ampliado.
Los últimos avisos/controles de moderación están cubiertos técnicamente; no se
declara un recorrido visual autenticado completo de moderación ni prueba física.

El override se retiró y la pestaña QA temporal se cerró. Los procesos QA propios
se cierran al terminar; no se cierra ningún proceso ajeno ni se abre Chrome.

## Pendientes y decisiones humanas

Responsable editorial/moderación, capacidad de respuesta y consentimiento del
estudio; permiso para consultar catálogo/contactar negocios; proveedor/remitente
de recuperación; dispositivos y backend QA accesible; revisión humana de
privacidad/moderación/metadatos/icono. La premoderación no revisa contenido anterior
retroactivamente. Revisar el catálogo y sus campos heredados requiere trabajo
editorial real: un test con fixtures no acredita su exactitud.

Sin commit, push, merge, rama nueva, PR, firma, subida, deploy, migración ni
escrituras de producción. Sin tocar otros proyectos. Sin pagos o campañas.
Se preserva la independencia de GlutenFri respecto a APC/Biotrab y la separación
entre confianza y contratación de PixelTrend.

Documentación técnica consultada para navegación:
[React Router 7.18.6 — useSearchParams](https://reactrouter.com/7.18.6/api/hooks/useSearchParams).
Se aplicó la guía read-docs para verificar el contrato URL, no para inferir QA.
