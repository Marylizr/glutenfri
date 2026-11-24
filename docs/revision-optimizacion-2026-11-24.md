# GlutenFri — revisión, optimización y utilidad del producto

Fecha: 24/11/2026. Cambios locales sobre `main`, partiendo de `e4188f2`.

## Resultado y límite principal

El mantenimiento local está implementado y probado. Producción todavía no está operativa: la web devuelve HTTP 200, pero `/api/health` devuelve HTTP 502. El recorrido público de Explorar muestra un error del servicio. No se ha recuperado MongoDB ni se afirma que el producto completo esté listo para publicar.

El conector Atlas respondió que el acceso MCP está deshabilitado para todas las organizaciones de la cuenta consultada. Un Organization Owner debe habilitar el acceso para poder revisar el proyecto GlutenFri. No se inspeccionaron otros proyectos ni se consultaron documentos de producción. No se volvieron a solicitar todas las variables de Netlify.

## Cambios implementados

- Node 24.22.3 en Netlify, workflow, engines y `.nvmrc`; pruebas ejecutadas con ese runtime temporal, sin cambiar el Node global del equipo.
- Dependencias directas actualizadas a los `latest` estables consultados en npm, y transitivas actualizadas dentro de sus restricciones. Ambos `npm outdated --json` devolvieron `{}` y ambas auditorías devolvieron 0 vulnerabilidades conocidas.
- Carga diferida de mapa, detalle, perfil, guardados, reseñas y páginas informativas/comerciales. Cabecera y navegación permanecen disponibles mientras carga una pantalla. Un error de renderizado o descarga de módulo ofrece recargar.
- Tiempo límite de 15 segundos para peticiones del cliente y 8 segundos de selección de servidor MongoDB.
- Functions captura los errores de conexión y devuelve 503 con `DATABASE_UNAVAILABLE`, `no-store` y `Retry-After`, sin devolver la excepción del driver. Esto mejora la respuesta ante una caída; no repara un clúster inaccesible.
- Service worker: una respuesta HTML fallida no reemplaza el shell válido; los fallos de actualización de recursos cacheados se gestionan durante el modo offline; solo se eliminan caches antiguas de GlutenFri. No se guardan respuestas de API.
- Búsqueda sin acentos, también por el campo explícito `city`: `pao` encuentra `Pão`, `famalicao` encuentra `Famalicão`.
- Buscador con nombre accesible, tipo `search` y foco visible.
- Dos columnas entre 768 y 1023 px para evitar tarjetas excesivamente anchas en tablet.
- API QA existente ampliada con rutas públicas que reutilizan sus locales ficticios; origen CORS local configurable.

### Medición comparable de descarga

Se reconstruyó el `App.jsx` de HEAD en memoria, con las mismas dependencias actuales, para compararlo con el nuevo enrutamiento. No se reemplazaron los archivos de trabajo. Se sumaron el script de entrada y todos los módulos precargados desde `index.html`; no se confundió la reducción del archivo principal con la descarga total.

| JavaScript inicial | Antes | Después | Reducción |
| --- | ---: | ---: | ---: |
| Sin comprimir | 482.523 bytes | 389.019 bytes | 19,4 % |
| gzip local | 151.080 bytes | 127.045 bytes | 15,9 % |

No se midieron Core Web Vitals en dispositivos reales ni se garantiza un porcentaje equivalente de mejora de tiempo de carga.

## Recorrido inspeccionado en navegador

Se utilizó el navegador integrado inicialmente y Chrome tras quedar aquel indisponible. QA local usa exclusivamente cuatro registros ficticios. Las capturas no prueban el contenido ni la disponibilidad de los establecimientos reales.

1. **Inicio público — accesible.** La propuesta y el botón de explorar son visibles en 375 × 812. La introducción consume casi toda la primera pantalla; se recomienda priorizar la búsqueda en una siguiente fase.
   ![Inicio público](qa/2026-11-24/01-production-start-375.png)
2. **Explorar público — bloqueado.** El servicio real devuelve un error y no permite elegir un local. Es el problema de mayor prioridad.
   ![Error público de Explorar](qa/2026-11-24/02-production-explore-error-375.png)
3. **Explorar en QA — funcional en el alcance comprobado.** Se confirmó ciudad legible, búsqueda `pao`, resultado vacío, recuperación mediante reintento, filtro de fuente revisada activado/desactivado y cierre de filtros con Escape. A 375, 430, 768 y 1440 px el ancho del documento coincide con el viewport; no se encontró scroll horizontal de página. Las categorías móviles conservan su desplazamiento horizontal intencional.
   ![Explorar móvil con locales ficticios](qa/2026-11-24/03-local-explore-375.png)
   ![Explorar tablet optimizado](qa/2026-11-24/03-local-explore-768.png)
4. **Ficha y regreso en QA — funcional en el alcance comprobado.** Abrir Pão Claro y volver conserva `q=pao`. Se muestran procedencia, vigencia desconocida y la acción de indicaciones. No se activaron llamadas, mapas externos, envíos ni formularios reales.
   ![Ficha QA](qa/2026-11-24/04-local-detail-375.png)
5. **Carga diferida en build de producción local — smoke check correcto.** Contacto y Guardados anónimo renderizaron después de cargar sus módulos. La validación visual principal con datos se hizo en el servidor de desarrollo QA.

Límites: no se completó un recorrido con datos reales, login real, reseñas reales, panel administrativo autenticado, contraste instrumental o lector de pantalla. No se afirma conformidad WCAG completa. La ficha superpuesta mantiene contenido del listado en el árbol accesible: conviene revisar la gestión de foco y el aislamiento del fondo en una fase específica de accesibilidad.

## Diagnóstico de utilidad con evidencia

El archivo local `server/data/merged_dataset.json` contiene 72 registros: 45 restaurantes, 21 tiendas, 4 pastelerías, 1 farmacia y 1 supermercado. Se contaron campos sin exponer datos de contacto:

| Campo disponible | Registros |
| --- | ---: |
| Dirección | 46/72 |
| Coordenadas | 46/72 |
| Teléfono | 69/72 |
| Horario estructurado | 0/72 |
| `menuUrl` | 0/72 |
| `websiteUrl` | 0/72 |
| `informationUpdatedAt` | 0/72 |
| `lastVerifiedAt` | 0/72 |
| `sourceUrl` | 0/72 |

Estas cifras describen el archivo local de importación, no la base de producción. No se infiere que datos ausentes en ese archivo falten también en Atlas.

### Propuesta de producto, por orden de impacto

**P0 — Recuperar disponibilidad.** Identificar el clúster correcto de GlutenFri y su estado en Atlas con acceso mínimo, verificar DNS y configuración específica de MongoDB, y comprobar health y directorio tras la corrección autorizada. No cambiar credenciales ni crear clústeres a ciegas. Hasta entonces ninguna mejora comercial compensa un listado inaccesible.

**P1 — Cubrir una zona pequeña con datos útiles y mantenidos.** Completar municipio, dirección, coordenadas, horario, teléfono, menú y fecha de revisión en un grupo acotado de establecimientos. El tamaño del piloto se decide con la capacidad editorial real. Medir cobertura y antigüedad antes de ampliar el catálogo. No usar fechas o fuentes inventadas.

**P1 — Responder «¿me sirve este local?» en la card.** Mantener ciudad y mostrar, cuando estén respaldados, tipo de oferta, abierto/cerrado, distancia solicitada por el usuario, disponibilidad de menú y última revisión. Las imágenes de categoría son ilustrativas; evitar que parezcan fotografías del negocio. La ficha debe priorizar información práctica y acciones, dejando el detalle de procedencia accesible.

**P1 — Separar evidencia de certificación.** Distinguir oferta declarada, negocio especializado y certificación externa documentada. «No consta certificación» no equivale a «no certificado». Un filtro destacado de APC necesita autorización documentada, identificación por local y vigencia; no equivale a garantizar «100 % sin gluten» o ausencia de contaminación cruzada. No se ha implementado el badge ni alterado estas clasificaciones.

**P2 — Descubrir cerca y decidir rápidamente.** Entrada por ciudad o ubicación voluntaria, abierto ahora solo con horarios fiables, y resultados vacíos que permitan quitar filtros. Las preferencias no deben depender del patrocinio. Revisar paginación completa: el servicio devuelve páginas y el cliente actual consume la primera; el contador debe seguir siendo honesto cuando el directorio supere 100 registros.

**P2 — Crear un ciclo de actualización.** Reportar «cerrado», «horario incorrecto» o «ya no ofrece opciones», asignar revisión administrativa y mostrar resultado/fecha. Aprovechar los reportes e historial existentes. Ofrecer al propietario actualización de datos sin concederle control de confianza o certificación.

**P2 — Hacer que guardar resulte útil.** Considerar favoritos locales sin registro y sincronización opcional después. Hoy Guardados pide sesión antes de aportar valor; es una hipótesis de fricción que debe validarse con usuarios. Mantener privacidad, consentimiento y borrado claros.

### Cómo evaluar si mejora

La métrica principal propuesta es «búsquedas que terminan en una acción útil sobre un local»: consultar menú, llamar, obtener indicaciones o guardar. Definir el evento y denominador antes de medir; un clic no demuestra una visita física ni consumo seguro.

Complementar con porcentaje de búsquedas sin resultados, tiempo hasta encontrar un candidato, cobertura de datos por ciudad, días desde la revisión, tasa de errores de API, tiempo de resolución de reportes y usuarios que vuelven a usar guardados. Son métricas propuestas, no resultados observados. No activar terceros, IP, ubicación precisa ni identificadores personales para medirlas sin diseño de privacidad aprobado.

## Validaciones ejecutadas

Todos los comandos de aplicación se ejecutaron con Node 24.22.3:

- Cliente `npm test`: 82 correctos, 0 fallidos.
- Servidor `npm test`: 46 correctos, 0 fallidos, 1 integración omitida por ausencia de Mongo local de pruebas.
- Cliente `npm run lint`: exit 0; 17 advertencias en código existente de hooks/pureza detectadas por el analizador actualizado. No se suprimieron reglas.
- Cliente `npm run i18n:audit`: exit 0, sin fallos en pt-PT/es/en.
- Cliente `npm run build`: exit 0, Vite 8.3.8.
- `npm outdated --json` en ambos paquetes: `{}`.
- `npm audit --json` en ambos paquetes: 0 vulnerabilidades conocidas.
- `git diff --check`: correcto.
- Smoke checks manuales del build local, búsqueda, filtro, resultado vacío y detalle/regreso descritos arriba.

Pruebas nuevas: tres de service worker, tres de conexión/errores de MongoDB con mocks y una de búsqueda sin acentos. La prueba de reconexión usa datos sintéticos; no acredita conectividad con Atlas.

## Archivos y alcance

- Runtime/dependencias: `.nvmrc`, `netlify.toml`, `.github/workflows/refresh-google-places.yml`, ambos `package.json` y ambos `package-lock.json`.
- Cliente: `src/App.jsx`, `src/components/RouteBoundary.jsx`, `src/components/SearchBar.jsx`, `src/index.css`, `src/services/api.js`, `src/utils/establishmentFilters.js`, `public/sw.js`.
- Servidor: `src/config/db.js`, `netlify/netlifyHandler.js`.
- QA: `client/scripts/data-quality-qa-api.mjs`, `client/test/serviceWorker.test.js`, `client/test/productFeatures.test.js`, `server/test/dbConnection.test.js`, este informe y sus capturas.

No se modificaron los documentos del dataset, modelos, índices, ranking, confianza, certificaciones, pagos, campañas o integraciones institucionales. No se hicieron commit, push, PR, deploy ni migraciones durante esta revisión. GlutenFri mantiene su independencia de APC/Biotrab y de los servicios comerciales de PixelTrend Studio.

La decisión pendiente más urgente es habilitar acceso mínimo de lectura a Atlas para diagnosticar exclusivamente el proyecto GlutenFri. También quedan pendientes la revisión específica de accesibilidad de la ficha, las advertencias de hooks existentes y el ciclo editorial de datos.
