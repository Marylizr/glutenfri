# GlutenFri · U0 y U1 · 25/11/2026

## Resultado y límite exacto

**U0 completada. U1 implementada y validada en el alcance local/QA autorizado.**
La recuperación por correo real no está activada ni se declara operativa en
producción. La cuenta real de Mary no se consultó ni modificó en estas fases.
U2 y siguientes no se han iniciado.

La matriz visual real tiene dos aproximaciones de un píxel por la escala del
navegador integrado: se documentan abajo. No se afirma validación exacta completa
en las cuatro resoluciones objetivo ni nuevas pruebas físicas.

## U0 · Baseline y contrato de datos

- Rama conservada: `codex/mongodb-connection-diagnostics`; HEAD de partida
  `327b07c78ba39c7c94d235246133c02875cde25a`.
- Estado y diff previos registrados en `.netlify/u0-u1/baseline-status.txt` y
  `baseline-tracked.patch`. No se hizo stash, checkout, reset o commit.
- Existían cambios de preparación móvil, recuperación manual, pie y cabecera:
  se preservaron y no se atribuyen a U0/U1. Las modificaciones sobre ProfilePage
  conservan exportación nativa, borrado, visibilidad de clave y paneles existentes.
- La publicación web y TestFlight anteriores son entregas diferentes del working
  tree. No se consultó ni actualizó el proveedor durante esta ejecución. No se
  identifica el número histórico de locales como tamaño actual del catálogo.
- Piloto editorial propuesto: profundidad en Porto, sujeto a revisión real en U4.
  No modifica cobertura nacional, copy de Portugal ni selección de locales reales.
- Se añadieron 25 fixtures sintéticas: cinco tipos × cinco estados. Están en
  `client/test/fixtures/utilityPilot.js`; no se importaron en la base pública.

### Matriz de completitud estructural

Campos: oferta, ciudad, coordenadas, contacto, menú, horarios, procedencia y fecha.

| Estado, repetido para cada tipo | Campos presentes | Interpretación |
| --- | --- | --- |
| Completa | 8/8 | Solo estructura sintética, no certifica calidad o vigencia |
| Incompleta | 0/8 | Ausencia explícita, no convertir en `false` |
| Desactualizada | 8/8 | Completitud no equivale a actualidad |
| Cerrada | 8/8 | Completitud no equivale a disponibilidad |
| Certificación no acreditada | 8/8 | Un booleano legado no concede certificación |

Tipos: restaurante, panadería, tienda, farmacia y supermercado. Todas las fuentes,
contactos, fechas y nombres son fixtures QA; no representan comprobaciones reales.

### Backlog delimitado

P0/U1: errores genéricos de acceso; falta de recuperación autoservicio; JSON de
sesión corrupto; rol cacheado no revalidado; respuesta tardía de sesión; mensajes
de carga ligados al idioma y reintentos duplicados.
P1/U2–U4: jerarquía de la card, distinción entre información y disponibilidad,
datos decisivos ausentes, revisión editorial, cierres y duplicados. Las fixtures
cerradas siguen exponiendo límites de presentación existentes: no se cambió la
taxonomía ni la publicación de esos estados en una fase de fiabilidad.

## U1 · Cambios realizados

### Acceso y carga

- Mensajes PT-PT/ES/EN para credenciales incorrectas, suspensión, rate limit,
  timeout, red, servicio, enlace inválido y recuperación no disponible.
- Login verifica la clave antes de revelar suspensión. Cuenta ausente y clave
  incorrecta comparten respuesta y coste bcrypt comparable.
- Datos de sesión corruptos no rompen el render inicial; el rol cacheado nunca
  concede UI admin antes de revalidarse. Respuestas de hidratación anteriores a
  login/logout no pueden reemplazar una sesión más reciente.
- Respuestas de login/registro/perfil se validan antes de guardarse.
- Los formularios evitan dobles envíos con guardia síncrona y estado deshabilitado.
- El directorio conserva su gate de respuestas tardías y deduplicación; bloquea
  reintentos simultáneos y traduce errores sin volver a consultar por cambiar idioma.
- Errores del servidor registran etiquetas fijas, no objetos del driver, payloads,
  tokens o claves. Logging HTTP limitado a método/estado/tiempo, no URL/query/body.

### Recuperación segura, solo QA

- Rutas: `GET /api/auth/recovery-status`, `POST /api/auth/forgot-password`,
  `POST /api/auth/reset-password`.
- Por defecto desactivada. `createApp` descarta el transporte en producción,
  incluso si se le proporciona; sin transporte el estado es false y las acciones
  devuelven 503, sin simular que se envió un correo.
- El buzón en memoria requiere Mongo loopback 127.0.0.1:27189, base exacta
  `glutenfri_u1_auth_qa` y frontend loopback. Se comprueba también la conexión
  realmente activa. No hay SMTP, API de correo ni comunicación externa.
- Solicitud: respuesta 202 genérica para cuentas ausentes/existentes, suelo temporal
  de 300ms, rate limit y cooldown persistido de cinco minutos por cuenta. No bloquea login.
- Token aleatorio de 32 bytes; solo SHA-256 persistido; caducidad de 15 minutos.
  El enlace usa fragmento y se elimina de la URL al abrir el formulario.
- Consumo atómico del token con cambio bcrypt y aumento de sessionVersion en la
  misma operación; no hay auto-login. El replay o una segunda petición concurrente fallan.
- Sesiones previas de esa cuenta, incluidos JWT antiguos sin versión, dejan de
  autenticar después del reset. Otras cuentas conservan sus sesiones y permisos.
- Hash/token/estado interno no aparecen en perfil público ni exportación personal.
- Modelado aditivo: no se ejecutaron migraciones, backfills ni índices reales.
  La recuperación manual previa no se volvió a ejecutar y no se le atribuye esta
  nueva revocación de sesiones: el cambio automático pertenece al flujo QA nuevo.

Decisión de producto: reset exige 12 caracteres y máximo 72 bytes por bcrypt.
El registro previo mantiene su contrato existente; homogeneizar su política,
verificar emails y revisar enumeración a través del registro son decisiones
de seguridad adicionales antes de un lanzamiento abierto, no garantías de esta fase.

## Pruebas y resultados

Entorno Node 24 según engines. Mongo temporal propio, dbpath
`.netlify/u0-u1/mongo`, sin `.env`, Atlas o credenciales reales para los tests.

| Validación | Baseline | Resultado final |
| --- | --- | --- |
| Tests cliente | 118 aprobados | 123 aprobados, 0 fallos/omitidos |
| Tests servidor, integración local incluida | 74 aprobados | 81 aprobados, 0 fallos/omitidos |
| Lint cliente | salida 0, 17 avisos | salida 0, 15 avisos previos; sin reglas silenciadas |
| i18n | sin fallos | sin fallos; 194 claves públicas y 408 hojas admin por idioma |
| Build web producción | salida 0 | salida 0 |
| Sync iOS/Android | no repetido como baseline | salida 0 |
| Verificación móvil | no repetida como baseline | 134 archivos verificados; no firmado/subido |
| Build iOS Release sin firma | no repetido como baseline | salida 0, `codesign -dv` confirma sin firma |
| Bundle Android Release | no repetido como baseline | salida 0, BUILD SUCCESSFUL; sin firmas JAR en el AAB |
| diff check | correcto | salida 0 |

Los contadores de tests son los del runner, incluyendo fixtures que Node descubre
como módulo de test. No equivalen a número de recorridos de interfaz.

Comandos principales:

```sh
npm test --prefix client
npm run lint --prefix client
npm run i18n:audit --prefix client
npm run build --prefix client
MONGODB_TEST_URI=mongodb://127.0.0.1:27189/glutenfri_mobile_qa \
GLUTENFRI_MOBILE_QA_URI=mongodb://127.0.0.1:27189/glutenfri_mobile_accounts_qa \
GLUTENFRI_U1_QA_URI=mongodb://127.0.0.1:27189/glutenfri_u1_auth_qa \
npm test --prefix server
npm run mobile:sync --prefix client
npm run mobile:verify --prefix client
node client/scripts/build-native-unsigned.mjs ios
node client/scripts/build-native-unsigned.mjs android
git diff --check
```

Logs en `.netlify/u0-u1/`: `baseline-*.log`, `client-final.log`,
`server-final.log`, `lint-final.log`, `i18n-final.log`, `build-final.log`,
`native-sync.log`, `native-verify.log`, `ios-build.log`, `android-build.log`.
Se corrigieron durante la fase el conteo esperado de nuevas claves i18n y las
opciones de Mongoose deprecadas introducidas inicialmente. No se ocultaron fallos.
Xcode conserva avisos sobre destino genérico sin versión; salió 0. No es firma,
archive de distribución, prueba física ni build nuevo disponible en TestFlight.

### Pruebas nuevas

`client/test/utilityBaseline.test.js`: matriz de fixtures, límites de certificación,
errores tipados, almacenamiento corrupto, respuesta inválida y retirada del token.
`server/test/passwordRecovery.test.js`: aislamiento del sink, respuesta genérica,
cooldown, token hasheado, exportación sin secretos, validación/mismatch, token
incorrecto, concurrencia, uso único, caducidad, revocación individual incluyendo
JWT legado, login posterior, rate limit, suspensión y producción fail-closed.
Se mantiene la aserción estricta de igualdad de claves en `i18nAudit.test.js`.

## Evidencia visual real y límites

Build QA separado en `.netlify/u0-u1/web-qa`, API 4191 y preview 4192, todo loopback.
`runUtilityQa.js` carga solo fixtures y buzón sintético en memoria. Sus controles
de fallos y `/qa/mailbox` no forman parte de createApp ni de las Functions.

Observado con navegador integrado, sin Chrome:

- Error de login con cuenta sintética; acceso correcto y enlace al panel admin.
- Solicitud de recuperación, controles deshabilitados mientras se envía, mensaje
  no enumerable y apertura del formulario desde el buzón privado.
- Token retirado de la URL; labels, campos ocultos, traducciones y foco de teclado.
- La sustitución de clave y revocación se probaron por integración HTTP, no se
  afirma haber pulsado «guardar nueva clave» en la revisión visual.
- Error 503 de catálogo, cambio EN→PT conservando el fallo, reintento recuperando
  resultados, respuesta inválida diferenciada de catálogo vacío y timeout a 15s
  ante respuesta QA de 17s, sin bucle automático.
- Búsqueda `incompleto` → ficha → volver conserva URL y consulta; la ficha QA
  carece de reseñas reales y su error de reseñas no se presenta como un bug nuevo.

| Dimensión CSS real | Vista/idioma | Scroll horizontal |
| --- | --- | --- |
| 375 × 812 | Login/error y recuperación PT | No |
| 430 × 931 | Formulario reset ES | No |
| 769 × 1024 | Formulario reset EN; foco visible | No |
| 1440 × 900 | Login autenticado, catálogo/error | No |

La herramienta escala las dimensiones enteras; quedan pendientes las medidas
exactas 430×932 y 768×1024. No hay prueba física nueva, teclado nativo, VoiceOver,
zoom de texto 200% ni submit visual end-to-end del reset; no se afirma QA total.
Desconexión completa y caché se cubren por clasificación/tests existentes y no
se declaran nuevos ensayos visuales offline. La prueba física corresponde a U6.

## Archivos propios y cambios preservados

Modificados en esta fase: `server/src/{app.js,models/User.js,routes/auth.js,
controllers/authController.js,middleware/auth.js,middleware/errorHandler.js}`;
`client/src/{hooks/useAuth.js,hooks/useEstablishmentList.js,services/api.js,
services/auth.js,i18n/index.jsx,pages/ProfilePage.jsx,styles/glass.css,
utils/requestState.js}`; `client/test/i18nAudit.test.js` y estado del plan.

Nuevos: servicio `passwordRecovery.js`, script `runUtilityQa.js`, componente
`PasswordRecovery.jsx`, utilidad `authReliability.js`, fixtures, los dos tests
nuevos descritos arriba y este informe. Recursos móviles generados/sincronizados.

No se cambiaron por U0/U1: dependencias/lockfiles, ranking, fuentes, certificación,
modelos de establecimientos/reseñas, pagos, campañas, integraciones, configuración
de Netlify/MongoDB real, script de reset manual o cuentas reales. Se conservaron
los cambios previos de esas áreas sin hacerlos propios de la fase.

## Pendientes que necesitan decisión o alcance posterior

1. Seleccionar proveedor/remitente de recuperación y aprobar comunicaciones reales,
   retención, tratamiento de datos y transporte de producción. Hoy se desactiva.
2. Antes de habilitar transporte real: revisar durabilidad/idempotencia de entrega,
   índices apropiados, límites distribuidos y observabilidad sin PII. No basta
   sustituir el buzón QA por una llamada a un proveedor.
3. QA visual exacto indicado arriba y pruebas físicas/autenticadas de U6.
4. Revisar catálogo real y contactar negocios solo con permiso separado en U4.

La recomendación siguiente es U2: fichas útiles, sin activar todavía envíos reales.
Se cerraron el API, preview y Mongo temporal propios al terminar; no se eliminaron
artefactos ni datos de otros proyectos. Sin commit, push, merge, PR, deploy,
subidas a tiendas, migraciones ni comunicaciones externas. Se mantiene la
independencia de GlutenFri respecto a APC/Biotrab y PixelTrend comercial.

## Fuentes técnicas consultadas

- [OWASP · recuperación de contraseña](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).
- [Mongoose · actualización atómica y returnDocument](https://mongoosejs.com/docs/tutorials/findoneandupdate.html).

La guía read-docs orientó las comprobaciones de uso único, respuestas genéricas y
actualización atómica. No sustituye revisión de seguridad previa a activar producción.
