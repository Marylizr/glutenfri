# GlutenFri — plan de utilidad por fases

Fecha inicial: 25/11/2026. Estado inicial: propuesta documentada.

Actualización del 26/11/2026, autorizada por Mary: **U2/U3 implementadas en local;
U4 con herramientas y procedimiento; U5 con protocolo y analizador; U6 con
moderación y candidato técnico sin publicación.** El piloto editorial real,
el estudio con participantes, la validación física y las decisiones de release
siguen pendientes: no se presenta el plan completo como cerrado.
Entrega y resultados en [informe U2–U6](u2-u6-validacion-2026-11-26.md),
[operación U4](operacion-editorial-u4.md), [estudio U5](estudio-utilidad-u5.md)
y [puertas U6](release-utilidad-u6.md).

Actualización posterior del 25/11/2026, autorizada por Mary: **U0 completada y U1
implementada/validada en QA local**, sin publicación ni envío real de recuperación.
Resultados, límites visuales y decisiones pendientes en
[informe U0/U1](u0-u1-validacion-2026-11-25.md). U2–U6 estaban pendientes entonces. La frase de
estado anterior corresponde a la entrega inicial del plan, no al estado actual.

## 1. Resultado que buscamos

Ayudar a una persona a elegir dónde comer o comprar en Portugal, entendiendo qué
ofrece cada establecimiento, de dónde sale la información y qué debe confirmar.
La propuesta no es garantizar seguridad alimentaria ni actuar como certificadora.

Primer recorrido prioritario: **buscar ciudad o proximidad → comparar fichas →
entender oferta y fuente → consultar menú, llamar o abrir indicaciones**.

Hipótesis a validar: información práctica y mantenida reduce más la incertidumbre
que aumentar el número de registros, imágenes o funcionalidades comerciales.
No se presenta esta hipótesis como demanda o conversión demostrada.

## 2. Alcance y reglas de ejecución

- Solo `/Users/marymarquez/Projects/gluten-free-app`. No consultar ni modificar
  otros proyectos, bases, usuarios de infraestructura o configuraciones compartidas.
- La entrega inicial creó únicamente este plan. Mary autorizó posteriormente
  U0/U1 y después el resto de la implementación local, sin publicación.
- Las etapas U0–U6 son una nueva iteración de utilidad; no renumeran ni reabren
  automáticamente las fases históricas del proyecto o las definidas en AGENTS.md.
- Conservar todos los cambios existentes, incluidos preparación móvil, recuperación
  admin, pie compacto y cabecera. No dar por desplegado lo que solo está local.
- No commit, push, merge, nuevas ramas, PR, deploy, subida TestFlight/Play,
  migraciones, backfills ni escrituras reales sin autorización específica.
- QA con fixtures y Mongo local aislado, nunca Atlas ni credenciales reales.
- Sin Chrome. Validación visual en navegador integrado o herramientas nativas
  disponibles; cerrar los procesos propios al terminar.
- Sin pagos, campañas, comunicaciones automáticas, CRM ni integraciones institucionales.
- El pago nunca modifica confianza, fuente, certificación, reseñas ni ranking orgánico.
- No usar distintivos institucionales sin autorización escrita documentada. No
  convertir pertenencia a una lista o un descuento en certificación.

## 3. Punto de partida comprobado en el código local

| Área | Ya existe | Trabajo necesario |
| --- | --- | --- |
| Acceso | Login, rol admin, suspensión y recuperación manual local | Recuperación autoservicio segura y errores accionables; no rehacer el login |
| Carga | Validación de respuestas, clasificación de errores, reintento y control de respuestas obsoletas | Completar resiliencia y comprobar mensajes y estados reales |
| Cards | Ciudad, distancia opcional, fuentes, fechas, fotos y guardado | Jerarquizar utilidad; distinguir oferta, rating externo y descuentos |
| Ficha | Contacto, menú, enlaces, procedencia y señales comunitarias | Presentar información práctica y desconocidos de forma consistente |
| Búsqueda | Nombre/dirección/ciudad sin acentos; filtros; estado en URL; ordenación | Accesos por intención y coherencia con mapa, sin duplicar motores |
| Horarios | Modelo semanal/especial, zona horaria y cálculo de apertura | Probar datos incompletos, festivos, medianoche y Açores antes de destacarlo |
| Calidad | Reportes, duplicados, cierres, historial y revisión administrativa | Organizar un ciclo editorial con responsables y evidencias |
| Comunidad | Reseñas, señales estructuradas y moderación | Medir utilidad y cerrar brechas de bloqueo/filtro antes de ampliar participación |
| Comercial | Reclamación y cambios sometidos a revisión | Reutilizar el flujo; no permitir al negocio editar campos de confianza |

Referencias principales: `client/src/components/RestaurantCard.jsx`,
`client/src/pages/EstablishmentDetailPage.jsx`, `client/src/hooks/useEstablishmentList.js`,
`client/src/utils/establishmentFilters.js`, `client/src/utils/openingHours.js`,
`server/src/models/Establishment.js`, rutas de auth y administración.
Existencia en código no acredita cobertura real del catálogo, publicación o QA físico.

## 4. Secuencia y entregables

**U0 → U1 → U2 → U3 → U4 → U5 → U6**.
La definición de las fichas (U2) puede prepararse mientras se resuelve una decisión
externa de U1, pero no se declara cerrada la fiabilidad si quedan pendientes.

### U0 · Baseline y alcance del piloto — P0

**Objetivo:** saber qué funciona, qué datos faltan y qué cambios pertenecen a cada entrega.

- Inventario de cambios locales y diferencia frente a la versión pública/nativa,
  sin hacer commit, stash o descartar trabajo.
- Ejecutar baseline de tests, lint, i18n y build; registrar fallos previos aparte.
- Definir fixtures de restaurante, panadería, tienda, farmacia y supermercado:
  completas, incompletas, desactualizadas, cerradas y con certificación no acreditada.
- Crear una matriz de completitud: oferta, ciudad, coordenadas, contacto, menú,
  horarios, procedencia y fecha. No extraer un catálogo real sin permiso de lectura.
- Elegir una zona piloto para profundidad editorial, manteniendo la cobertura y
  el lenguaje de toda Portugal. No reintroducir «zona norte» como límite del producto.

**Salida:** baseline reproducible, backlog priorizado y contratos de información.
**Cierre:** se distinguen claramente desconocidos, bugs y decisiones pendientes;
ninguna cantidad de fichas activas se toma de documentos históricos como si fuera actual.

### U1 · Fiabilidad, acceso y recuperación — P0

**Objetivo:** que cargar, volver a entrar y recuperarse de un error sea predecible.

- Mensajes PT-PT/ES/EN para credenciales inválidas, sesión expirada, suspensión,
  rate limit, timeout y servicio no disponible. Nunca revelar si existe un correo.
- Mantener reintentos explícitos y limitados; impedir duplicados al enviar formularios.
- Comprobar mala red, API caída, respuesta inválida, carga lenta, cambio de idioma,
  caché obsoleta y volver del detalle conservando búsqueda/scroll.
- Diseñar e implementar recuperación autoservicio cuando esté autorizada: respuesta
  no enumerable, token aleatorio almacenado como hash, caducidad, uso único,
  límites de intentos y revocación de sesiones de la cuenta afectada. Sin rotar
  JWT_SECRET global ni afectar otras cuentas. Evaluar cambios aditivos del modelo
  y solicitar aparte cualquier migración real que resulte necesaria.
- Probar emails únicamente en un buzón local de QA. Selección de proveedor,
  remitente y comunicaciones reales requieren decisión/autorización separada.
- El script de recuperación manual no se convierte en endpoint público, bypass
  de login ni credencial incrustada. No volver a restablecer la cuenta ya recuperada.

**Superficies:** ProfilePage, useAuth, servicios API, estado de peticiones,
controlador/rutas auth y middleware de sesión; cambios mínimos según baseline.
**Cierre:** los errores tienen acción comprensible, ningún secreto aparece en UI/logs,
sesiones y recuperación pasan pruebas negativas. Si falta el proveedor, marcar
recuperación «validada localmente, envío real pendiente», no «operativa en producción».

### U2 · Cards y fichas que permiten decidir — P1

**Objetivo:** entender qué es un local, qué ofrece y qué se sabe antes de desplazarse.

- Card: nombre → ciudad/distancia opcional → oferta/categoría → procedencia y
  actualización → acción clara para abrir ficha. Imagen secundaria, sin rediseño global.
- Mantener masonry, guardado, accesibilidad y atribución de fotografías externas.
- Etiquetar fotos ilustrativas. No presentar descuento como rating ni puntuación
  externa como evaluación de protocolos sin gluten.
- Ficha: resumen práctico, contacto/indicaciones/menú disponibles, información sobre
  oferta y preparación atribuida a su fuente, última revisión y vía de corrección.
- Separar «declarado por el negocio», «experiencia comunitaria», «especializado» y
  «certificación externa documentada» usando la taxonomía existente, no otra paralela.
- Mostrar desconocidos explícitos en los campos decisivos. `false`, no informado y
  ausencia de dato no son equivalentes. No inferir falta de protocolos de un campo vacío.
- Diferenciar actualización comercial, consulta de fuente y revisión de certificación.
  No inventar ni intercambiar fechas. Fuente revisada no significa consumo garantizado.
- Exponer horarios/apertura solo con datos suficientes; si no, «horario no informado».
  Mantener recordatorio de confirmar directamente ingredientes, preparación y disponibilidad.

**Superficies:** RestaurantCard, TrustBadge/TrustDetails, detalle, utilidades de
procedencia/horarios/ciudad y catálogos i18n. Reutilizar campos existentes antes de añadir otros.
**Cierre:** una persona distingue tipo de oferta y procedencia sin abrir una explicación
legal extensa; mapa, card y ficha no se contradicen; datos incompletos no generan garantías.

### U3 · Búsqueda y filtros orientados a intención — P1

**Objetivo:** llegar a opciones relevantes sin aprender la estructura del directorio.

- Accesos iniciales: comer, pan/pastelería y comprar productos. Son combinaciones
  explícitas de los tipos existentes, no categorías institucionales nuevas.
- Buscar por ciudad o nombre conservando normalización de acentos y enlaces compartibles.
  No añadir geocodificación de pago ni enviar consultas a terceros sin decisión específica.
- Cerca de mí opcional; permiso rechazado ofrece ciudad manual. No persistir ni
  enviar coordenadas exactas a analítica. Sin ubicación, no ordenar por distancia inventada.
- Un único estado de filtros y una sola lógica de resultados para lista/mapa;
  conservar query, filtros y posición al abrir ficha, volver o compartir URL.
- «Abierto ahora» solo incluye apertura conocida; comunicar que los horarios
  desconocidos no se pueden incluir. No etiquetarlos como cerrados.
- Resultado vacío distingue ausencia de coincidencias, filtros restrictivos y error
  de carga. Ofrecer quitar filtros sin borrar arbitrariamente ciudad o consulta.
- Mantener orden por defecto estable. Cualquier cambio de relevancia orgánica
  requiere especificación y autorización explícitas; patrocinio queda separado.

**Superficies:** ExplorePage, HomePage, SearchBar, CategoryChips, filtros,
establishmentFilters, openingHours y hooks/servicios existentes.
**Cierre:** nombres con/sin acentos, varias ciudades, posición denegada, datos sin
coordenadas, festivos, medianoche y zonas horarias producen resultados explicables;
lista y mapa reciben el mismo conjunto y nunca equiparan fuente con certificación.

### U4 · Mantenimiento editorial y piloto de fichas — P1

**Objetivo:** que la información no quede abandonada después de publicarla.

- Reutilizar el panel de Calidad de datos y su historial; no rehacerlo.
- Cola por datos esenciales ausentes, reportes, antigüedad de revisión y cierres.
- Definir responsable, motivo, evidencia, próxima revisión y tiempo objetivo de
  respuesta como política editorial; no inventar fechas de verificaciones anteriores.
- Negocios confirman datos comerciales mediante el flujo de cambios existente;
  campos de fuente/confianza/certificación siguen reservados a revisión autorizada.
- Revisar manualmente duplicados y cierres: no fusionar, borrar o ocultar en masa.
- Preparar un piloto orientativo de 30–50 fichas completas si la capacidad lo permite.
  Es alcance propuesto, no un número obligatorio ni fichas ya verificadas.

**Cierre:** cada ficha del piloto tiene evidencia o ausencia explícita, un responsable
y un recorrido de corrección. Documentar pendientes en vez de simular completitud.
**Límite:** verificar/contactar negocios o publicar correcciones reales se autoriza
aparte. Hasta entonces, procedimiento y fixtures de QA, sin importación masiva.

### U5 · Validación de utilidad y aprendizaje — P2

**Objetivo:** comprobar si las mejoras cambian una decisión real, no solo la apariencia.

- Probar primero con tareas simuladas en QA y 10–15 participantes voluntarios
  cuando se autorice su reclutamiento. Muestra exploratoria, no representativa.
- Tareas: buscar ciudad; comparar ofertas; explicar fuente y limitaciones; encontrar
  menú/contacto; resolver resultado vacío; guardar y volver; reportar un dato incorrecto.
- Entrevistas breves: qué faltó, por qué descartó un local, qué tuvo que comprobar fuera.
- Reutilizar analítica first-party donde sirva; no mezclar el embudo de descubrimiento
  con solicitudes comerciales de PixelTrend ni añadir otro SDK.
- Eventos QA propuestos: intención seleccionada, búsqueda completada, resultado vacío,
  ficha abierta, menú/contacto/indicaciones y reporte. Solo valores cerrados y campos
  mínimos; no texto libre de consultas, email, contraseña, diagnóstico médico, IP,
  User-Agent ni ubicación exacta. Consentimiento, retención y despliegue real por aprobar.

**Métricas:** éxito de tarea, tiempo hasta candidato, comprensión de procedencia,
porcentaje de fichas con información decisiva, búsquedas sin resultado y acciones
prácticas por ficha. Medir retorno solo con método y permisos adecuados.

**Cierre propuesto, no benchmark:** 8 de cada 10 participantes completan la tarea
principal y explican correctamente fuente/limitaciones, sin errores críticos.
Revisar el umbral y las tareas antes del piloto; una muestra pequeña no demuestra
seguridad alimentaria ni adecuación al mercado. Un clic no acredita llamada o visita.

### U6 · Candidato de release y siguientes apuestas — P2

- Consolidar evidencia por versión y plataforma; no mezclar código local con release pública.
- QA autenticado con cuentas sintéticas y backend aislado accesible para dispositivos.
  El candidato nativo anterior usa API pública: no es un entorno de pruebas con escrituras.
- Pruebas físicas iOS/Android de permisos, sesión, guardado, navegación atrás, retorno
  desde mapas/teléfono y exportación; cubrir safe areas, teclado y ampliación de texto.
- Cerrar privacidad/moderación pendientes antes de ampliar participación: bloqueo de
  autores, filtro de contenido objetable, reportes y política operativa. Revisar,
  no declarar cumplimiento de tiendas solo porque el build compile.
- Preparar nota de versión, alcance exacto y recuperación/rollback por plataforma.
  Una reversión web no revierte una app instalada. Cada publicación exige permiso propio.

**Cierre:** candidato identificado, QA y limitaciones documentados; aún sin deploy.
Después, evaluar por evidencia listas de viaje/offline, mejoras comunitarias y
servicios comerciales. No iniciar pagos, IA o suscripciones como consecuencia automática.

## 5. Calidad transversal: criterio de cada fase implementada

- PT-PT predeterminado, ES y EN completos, sin traducir nombres propios ni crear
  mensajes nuevos fuera de los catálogos. Mantener `<html lang>` y las interpolaciones.
- Teclado, foco, etiquetas, contraste, lectura ampliada y sin dependencia exclusiva del color.
- Validación visual real en 375×812, 430×932, 768×1024 y 1440×900, sin scroll
  horizontal; registrar dimensiones efectivas si la herramienta no las reproduce.
- Ejecutar comandos reales: `npm test --prefix client`, `npm run lint --prefix client`,
  `npm run i18n:audit --prefix client`, `npm run build --prefix client`,
  tests de servidor afectados y suite completa cuando cambie auth/modelos/contratos,
  `git diff --check` y `git status --short`. Usar Node según engines vigente.
- Las suites con DB usan exclusivamente Mongo local aislado y variables de QA
  explícitas; no lanzar scripts seed ni cargas/migraciones contra datos reales.
- Revisar las suites existentes de carga, responsive, producto, procedencia,
  auth, recuperación, calidad administrativa y recorridos nativos; añadir casos
  funcionales/componente/integración, no limitar QA a expresiones sobre código fuente.
- Build y sincronización nativos solo en fases que cambien el cliente móvil;
  ninguna compilación, firma o subida significa prueba física o aprobación de tienda.
- Entrega por fase: objetivo, archivos propios, cambios previos preservados,
  decisiones, pruebas, resultados exactos, bloqueos y autorización pendiente.

## 6. Decisiones y estimación inicial

Decisiones antes de ejecutar: alcance de la primera fase; método de recuperación
y proveedor de email; zona piloto/capacidad editorial; autorización para revisión
de catálogo real; participantes; métricas/retención; entorno QA de dispositivos.
Ninguna implica contratar servicios, tocar producción o enviar comunicaciones.

Orden recomendado de autorización: **U0 y U1 primero; luego U2 y U3**.
U4 mantiene lo construido; U5 determina qué conviene ampliar; U6 prepara, no publica.

Estimación orientativa de trabajo efectivo de una persona, pendiente de U0:
U0 1–2 días; U1 3–6; U2 3–5; U3 3–5; U4 2–4 de herramientas/procedimiento
más revisión editorial según fichas; U5 3–5 más disponibilidad de participantes;
U6 2–4 más disponibilidad de dispositivos. No es una fecha comprometida: tiempos
externos, nuevos riesgos de seguridad y aprobación editorial quedan fuera.

## 7. Registro de la entrega inicial (25/11/2026)

Único archivo creado en esta tarea: este documento. Se inspeccionaron AGENTS.md,
estado Git, componentes, modelo, filtros y pruebas existentes. No se editó código,
configuración, dependencias, cuentas ni datos. `git diff --check` se ejecuta para
esta entrega documental; no se atribuyen nuevos resultados de tests, lint, build o
QA visual a este plan. No hay nuevas validaciones de producto realizadas aquí.
GlutenFri permanece independiente de APC/Biotrab y de los servicios de PixelTrend.
