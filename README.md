# Gluten Free Porto/Famalicão

Aplicación para unificar información de lugares sin gluten (restaurantes, tiendas,
farmacias, pastelerías) en el Norte de Portugal, con reseñas de usuarios.

## Estructura

```
gluten-free-app/
├── client/          React + Vite (web, y base para el wrap Capacitor)
├── server/          Node/Express + MongoDB
│   └── data/        merged_dataset.json (semilla APC + Google Places)
└── capacitor.config.json   (placeholder — Fase 4 del roadmap)
```

## Ejecutar en local

### Backend
```bash
cd server
cp .env.example .env      # y completa MONGODB_URI real
npm install
npm run seed               # carga merged_dataset.json en Mongo
npm run dev                 # http://localhost:4000
```

MongoDB local vía Homebrew (opción usada en el setup actual):
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb/brew/mongodb-community@7.0
```

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## Estado actual (correspondiente a Fase 1-2 del roadmap)

- [x] Dataset semilla (72 establecimientos tras fusión: 30 certificados APC + 42 vía Google Places)
- [x] Schema Mongo (Establishment, Review, User)
- [x] API REST: `/api/establishments`, `/api/establishments/:id/reviews`, `/api/auth`
- [x] Frontend: vista mapa (Leaflet) + lista + filtros (tipo, certificado, descuento)
- [x] Fusión manual: "Pastelaria Soul" (APC) + "Soul - Alimentação Saudável e do Bem" (Google) fusionados en un solo registro (`source: "APC+Google"`, certified: true, dirección/coords/rating tomados de Google)
- [x] Flujo Safety Review (3 pantallas estilo Typeform): entendimiento del personal (Poor/Okay/Excellent), menú dedicado sin gluten (Sí/No), rating + comentario. Extiende `Review` con `staffUnderstanding` y `hasDedicatedMenu`, además de `rating`/`comment` que ya existían
- [x] Pantalla de detalle de establecimiento (`EstablishmentDetailPage`) — muestra info + lista de reviews + botón para iniciar el Safety Review
- [x] Auth conectado en el frontend: `ProfilePage` con login/registro, token guardado vía `useAuth` (mismas keys `gf_auth_token`/`gf_auth_user` que ya usaba el interceptor de `services/api.js`)
- [x] Alineación visual con el mockup de Stitch: badge circular de score (`ScoreBadge`), pines custom del mapa (salvia/terracota), detail page con hero photo + barra de acciones fija (Cómo llegar / Llamar, usando lat/lng y phone reales)
- [x] Guardados ("Your Safe Spots"): ligado a la cuenta — `savedEstablishments` en `User`, endpoints `/api/users/me/saved` (GET/POST/DELETE), tab "Saved" conectado, corazón de guardar en cards y detail page
- [x] Celiac Safety Protocols en la detail page: `dedicatedKitchen`, `dedicatedGlutenFreeMenu`, `staffTrained` (Boolean opcionales) y `riskLevel` (enum opcional) en `Establishment` — la sección solo se muestra si hay datos cargados
- [x] Safety Review (5 pasos) conectado a los Celiac Safety Protocols: al enviar una reseña, `createReview` actualiza `dedicatedGlutenFreeMenu`/`dedicatedKitchen`/`riskLevel` (respuestas directas del flujo) y `staffTrained` (derivado: `true` solo si `staffUnderstanding === 'excellent'`) en el `Establishment`. **La reseña más reciente sobrescribe estos campos** — no se promedia entre reseñas de distintos usuarios
- [x] Pantalla de onboarding/landing (`OnboardingScreen`) — se muestra solo una vez (flag `gf_onboarded` en localStorage)
- [x] Tab "Map" ahora también abre la pantalla de detalle al tocar una card (antes tenía un estado `selected` local sin conectar)
- [x] **Seguridad backend** (rumbo a producción):
  - `helmet` para headers de seguridad
  - `express-rate-limit`: límite general (200 req/15min) + límite agresivo compartido en `/api/auth/register` y `/api/auth/login` (10 req/15min por IP)
  - `express-validator` en todas las rutas: emails válidos, password mínimo 8 chars, rating 1-5, enums de `type`/`staffUnderstanding`/`riskLevel`, `:id` como Mongo ObjectId válido, etc. — nada confía en que el frontend ya validó
  - `JWT_EXPIRES_IN` bajado de 30d a **7d** (configurable por env). Deuda técnica documentada en `authController.js`: sin refresh token, revisar si la app escala
  - `CORS_ORIGINS` ahora es **obligatorio**: el servidor no arranca sin él (antes tenía `'*'` como valor predeterminado). `.env.example` incluye un dominio de ejemplo (`https://gluten-free-app.netlify.app`) que debe sustituirse por el dominio real antes de desplegar
  - Error handler centralizado (`middleware/errorHandler.js`) — nunca expone stack traces ni errores crudos de Mongo al cliente
  - `/api/health` ahora chequea la conexión real a Mongo (antes devolvía `200` fijo)
- [x] **Base de datos en MongoDB Atlas**: `server/.env` ya apunta al clúster real (`gluten-free-app.nexxyse.mongodb.net`), con 72 establecimientos cargados. Se verificaron `seed` y `npm run dev` contra la base de datos remota. `.env` permanece fuera del repositorio.
- [x] **Logging con minimización de datos** (`morgan`) — stdout sin IP ni User-Agent en producción; formato `dev` en desarrollo
- [x] **Error handler verificado con Express 5**: confirmado en vivo que un error async sin try/catch en un controller SÍ llega al `errorHandler` (Express 5 reenvía promesas rechazadas automáticamente) y el cliente solo ve `{"error":"Error interno del servidor"}`, nunca el mensaje real ni el stack trace
- [x] **Paginación** en `GET /api/establishments` (`?page`/`?limit`, default `limit=100`, máx `200`) — responde `{ data, page, limit, total, totalPages }`. El frontend (`services/establishments.js`) desenvuelve `.data` así que no cambió nada visible con el dataset actual (72 entra en una sola página)
- [x] **Índices de Mongo revisados**: se agregó `{ certified: 1 }` en `Establishment` (usado por el filtro `certifiedOnly`). Los campos de Celiac Safety Protocols no tienen índice porque hoy nada los usa como filtro — agregar si en algún momento sumamos algo tipo `?riskLevel=low`. `savedEstablishments` del `User` no necesita índice propio (son lookups por `_id`, ya indexado por default)
- [x] **Atribución "Google Maps"** agregada en las 3 vistas que muestran establecimientos con `source: "Google"` o `"APC+Google"` (componente `GoogleAttribution`): debajo de la card en la lista, en la detail page, y en el pie del mapa (junto a la atribución de OpenStreetMap) + dentro de cada popup de pin
- [x] **Compliance de Google Places resuelto** — se persiste `place_id`, las fotos se resuelven en vivo y las coordenadas se refrescan automáticamente con margen antes de 30 días. El hallazgo original se conserva abajo como referencia histórica.
- [x] **Estados de error y robustez del frontend**:
  - Componente `ErrorState` reutilizable (mensaje + botón "Reintentar"), conectado en `ExplorePage`, `HomePage`, `SavedPage` y la lista de reseñas de `EstablishmentDetailPage` — si el backend/Atlas no responde, el usuario ve un mensaje claro y puede reintentar, en vez de una lista vacía engañosa o un spinner colgado. Probado matando el backend a propósito y confirmando la recuperación con "Reintentar"
  - **Sesión expirada manejada globalmente**: interceptor de respuesta en `services/api.js` detecta un 401 cuando SÍ había un token guardado (JWT vencido/inválido, no un anónimo), limpia la sesión y dispara un evento que `useAuth` escucha; `App.jsx` redirige a la pantalla de acceso con el mensaje "Tu sesión ha expirado. Inicia sesión de nuevo." Probado corrompiendo el token manualmente y confirmando la redirección — sin quedar bloqueado ni mostrar un error técnico en la consola
  - **Bug real encontrado y corregido**: `useSaved.toggle()` no tenía `try/catch` — si el token vencía mientras alguien tocaba el corazón de guardar, la promesa quedaba rechazada sin manejar (unhandled rejection silenciosa). Ahora atrapa el error y deja que el interceptor global maneje el 401
  - **Auditoría de textos en inglés** corregida: dropdown de tipos en `Filters.jsx` mostraba los valores crudos del enum (`restaurant`, `store`, etc.) en vez de traducirlos como ya hacía `CategoryChips`; "Your Safe Spots" → "Tus lugares seguros"; labels Poor/Okay/Excellent → Malo/Regular/Excelente (tanto en las respuestas del Safety Review como en los badges de reseñas); "Celiac Safety Protocols" → "Protocolos de seguridad celíaca"; bottom nav Home/Map/Saved/Reviews/Profile → Inicio/Mapa/Guardados/Reseñas/Perfil
- [x] **Deploy preparado** (Procfile, `engines`, `netlify.toml`, checklist de env vars) — ver sección dedicada abajo. **No desplegado todavía.**
- [x] **Requisitos técnicos de GDPR + política publicada** — `/privacidad`, enlazada desde registro y perfil; ver sección dedicada abajo. Se recomienda revisión jurídica antes del lanzamiento público.
- [x] **`react-router-dom` activado con rutas reales** (antes estaba instalado pero sin usar) — ver sección dedicada abajo
- [x] **Moderación y administración** — panel `/admin` para revisar reportes, ocultar/restaurar reseñas y gestionar roles; ver sección dedicada abajo
- [x] **Backoffice de escritorio** — dashboard operativo, CRUD de establecimientos, buscador y filtros, motivos de reporte, suspensión de usuarios, auditoría de acciones y estado/refresco de API, Atlas y Google Places
- [x] **Pruebas automatizadas** — `npm test` en `server/`: seguridad de proxy, CORS, health, validación de rutas, privacidad y visibilidad de reseñas
- [ ] Wrap Capacitor (Fase 4) — `capacitor.config.json` es solo placeholder

## ✅ Google Places: compliance de caché — RESUELTO (2026-07-24)

**Actualización:** el riesgo de compliance descrito abajo ya no aplica.
Conseguiste la API key de Places API (New) con billing habilitado, y los
46 establecimientos con datos de Google ya tienen su `place_id` guardado
(único dato de Google cacheable indefinidamente según el ToS). Detalle
completo en la sección "Google Places: fotos reales + place_id" más abajo.
Queda el hallazgo original tal cual se documentó, como referencia de la
investigación que llevó a la decisión de diseño actual.

## ⚠️ Google Places: hallazgo de compliance sobre caché de datos (histórico)

Investigué los términos oficiales de Google Maps Platform (Service Specific
Terms, sección 5.4, y las Places API Policies) antes de escribir cualquier
"política de TTL". Lo que dicen, citado:

> "Customer can temporarily cache latitude (lat) and longitude (lng) values
> from the Places API for up to 30 consecutive calendar days, after which
> Customer must delete the cached latitude and longitude values. Customer
> can cache Places API Place ID (place_id) values [...] indefinitely."

Y la regla general en las Places API Policies: **"You must not pre-fetch,
cache, or store Places API content beyond the allowed exceptions."**

Las únicas dos excepciones documentadas son:
- `place_id` → cacheable indefinidamente
- `lat`/`lng` → cacheable hasta 30 días, después hay que borrarlo

**Todo lo demás (nombre, dirección, teléfono, rating) no tiene excepción
de caché — no debería guardarse a largo plazo tal como lo estamos
haciendo hoy.**

Revisé `merged_dataset.json`: ninguno de los 46 registros con datos de
Google (43 originales + los que se fusionaron) tiene `place_id` capturado.
Sin `place_id` no hay forma de re-consultar la Places API para refrescar
esos datos de forma conforme a los términos — estamos reteniendo
name/address/lat/lng/rating de Google indefinidamente, sin place_id y sin
mecanismo de refresco, desde que se armó el dataset semilla.

**No implementé un `lastRefreshedAt` cosmético porque no resolvería el
problema real.** Esto necesita una decisión de producto/infraestructura:
tener una API key de Google Maps Platform con billing habilitado y un
proceso que re-consulte por `place_id`.

**Decisión histórica (2026-07-23):** en ese momento se continuó en modo
MVP con el riesgo documentado. Al día siguiente se consiguió la API key,
se poblaron los 46 `place_id` y se implementó el refresco; este bloqueo ya
no está vigente.

## Google Places: fotos reales + place_id (2026-07-24)

### Compliance, primero

Antes de guardar nada, confirmé contra la documentación oficial (Places
API Policies) que **la referencia de foto (`photos[].name`) no está en la
lista de excepciones de caché** — solo `place_id` (indefinido) y `lat`/`lng`
(≤30 días) lo están. Guardar la referencia de foto en Mongo hubiera
repetido el mismo problema que ya habíamos documentado con name/address/
rating. Por eso el diseño final es distinto de lo pedido literalmente en
un detalle: **el script guarda solo `place_id`; la foto se resuelve en
vivo en cada request**, nunca se persiste.

### `server/src/services/googlePlaces.js`

Wrapper delgado sobre Places API (New), un método por operación:
- `textSearchPlace(query)` — Text Search, FieldMask `id,displayName,formattedAddress,photos`. `id` es tier Essentials; `displayName`/`formattedAddress`/`photos` son tier Pro (mismo precio entre sí) — se agregaron `displayName`/`formattedAddress` para poder verificar el match a ojo sin subir de tier. **Nunca se pide `rating`/`userRatingCount`** (tier Enterprise, más caro).
- `getPlacePhotoName(placeId)` — Place Details, FieldMask `photos` únicamente, dispara el tier más barato ("Place Details Essentials IDs Only" según la documentación).
- `fetchPlacePhotoMedia(photoName, { maxWidthPx })` — Photo Media, devuelve los bytes de la imagen.
- `getPlaceLocation(placeId)` — Place Details, FieldMask `location`, para el job de refresco de lat/lng.

### `server/src/scripts/fetchGooglePlaceIds.js`

Matching por `Text Search` con `"${nombre}, ${dirección}"`. Salvaguarda
contra falsos positivos: normaliza (minúsculas, sin acentos/puntuación) y
compara nombre nuestro vs. nombre de Google — si no hay suficiente
superposición de palabras significativas, **no guarda el match** y lo
marca para revisión manual en vez de asumir que es correcto. Guarda el
resultado en Mongo (`placeId`, `hasPhoto`, `googlePlaceRefreshedAt`) y
también en `merged_dataset.json`, porque `npm run seed` borra y recrea
toda la colección desde ese archivo — sin este segundo guardado, un
reseed futuro hubiera borrado todos los `place_id` conseguidos hoy.

**Probado primero con `--limit=3`** antes de correr contra el resto, como
pediste: los 3 matches salieron perfectos (dirección idéntica en los 3
casos). Encontré en el camino que la key no tenía "Places API (New)"
habilitada en Google Cloud; se resolvió desde la configuración del proyecto.
Con la API habilitada, el proceso se ejecutó contra los 43 restantes:
**43/43 guardados, 0 falsos positivos marcados, 0 sin resultados, 0
errores.** Los 46 establecimientos Google/APC+Google del dataset
completo tienen `place_id` y `hasPhoto` ahora.

Los registros que vienen únicamente de APC se procesan de forma explícita
con `npm run fetch-place-ids -- --include-apc`. Como varios no tienen
dirección, el script solicita hasta cinco resultados y puntúa el nombre,
la sucursal incluida después del guion y la dirección devuelta por Google.
Solo guarda una coincidencia cuando supera el umbral y se diferencia
claramente de la segunda opción; los resultados ambiguos se imprimen como
`REVISAR` y no modifican Mongo. Para una primera comprobación acotada:
`npm run fetch-place-ids -- --include-apc --limit=3`.

Cuando un registro APC se vincula correctamente, su origen pasa a
`APC+Google`. El script persiste `placeId` y `hasPhoto` tanto en Mongo
como en `merged_dataset.json`, para que un `npm run seed` posterior no
elimine la asociación.

### `GET /api/establishments/:id/photo`

Resuelve la foto en vivo: `placeId` (Mongo) → `getPlacePhotoName` (con un
caché en memoria de proceso de 1 hora, nunca en Mongo, para no pegarle a
Place Details en cada request de imagen) → `fetchPlacePhotoMedia` →
proxea los bytes al cliente. 404 si no hay `placeId` o no se puede
resolver la foto — el frontend cae al ícono genérico.

**Bug encontrado y corregido en el camino**: `helmet` pone
`Cross-Origin-Resource-Policy: same-origin` por default, que bloqueaba
que el `<img>` del frontend (puerto/dominio distinto del backend) cargara
la imagen. Se agregó `Cross-Origin-Resource-Policy: cross-origin`
explícito solo en esta ruta — es una foto pública, pensada para
consumirse cross-origin.

### Frontend

`PhotoPlaceholder.jsx` recibe `establishmentId`/`hasPhoto`: si hay foto,
renderiza `<img src={.../photo}>` con `onError` que cae al ícono genérico
(gradiente + emoji por tipo) si la carga falla — nunca rompe el layout.
`RestaurantCard` y `EstablishmentDetailPage` pasan esos props.

Probado en el navegador: fotos reales cargando en la lista y en el
detalle (fachada de "Com Cuore" con su cartel visible), y confirmado que
los establecimientos sin `place_id` siguen mostrando el ícono genérico
sin errores.

### `server/src/scripts/refreshGooglePlacesData.js` — automatizado

Re-consulta `lat`/`lng` (única excepción de caché además de `place_id`)
para establecimientos con `googlePlaceRefreshedAt` de más de 23 días o
sin refrescar nunca. `.github/workflows/refresh-google-places.yml` se
ejecuta semanalmente, dejando margen ante retrasos del scheduler para no
superar 30 días. También puede dispararse manualmente desde GitHub Actions.
Requiere los secrets del repositorio `MONGODB_URI` y
`GOOGLE_PLACES_API_KEY`. A mano: `npm run refresh-google-places`, o
`--force` para ignorar el corte.

### Variable de entorno nueva

`GOOGLE_PLACES_API_KEY` en `server/.env` (no en `.env.example`, mismo
patrón que `MONGODB_URI`). Agregala también a los secretos del proveedor
cuando deployes — sin ella, el script de matching y el endpoint de fotos
fallan (pero el resto de la app sigue funcionando normal, con el ícono
genérico como fallback).

## Deploy: checklist de producción (preparado, no ejecutado)

### Ya está listo en el código

- **`server/Procfile`**: `web: node src/server.js`
- **`server/package.json`**: agregado `"engines": { "node": "20.x" }` — coincide con la versión local (`node --version` → v20.20.2)
- **`netlify.toml`** (raíz del repo): `base = "client"`, `command = "npm run build"`, `publish = "dist"`, más el redirect `/* → /index.html` (200) para que el SPA no dé 404 al refrescar una ruta. Ahora que hay routing real (ver sección dedicada), este redirect ya tiene efecto práctico: sin él, refrescar directamente en `/mapa` o `/lugar/:id` en producción daría 404 en vez de servir el SPA
- Confirmado `npm run build` en `client/` — compila sin errores (`dist/` generado, ~131 KB gzipped)

### Variables de entorno para producción

| Variable | Estado | Detalle |
|---|---|---|
| `MONGODB_URI` | ✅ Listo | El clúster de Atlas ya está funcionando |
| `JWT_SECRET` | ⏳ Crear al desplegar | Generar un valor exclusivo con `openssl rand -hex 32`. Nunca documentarlo, commitearlo ni reutilizar el de desarrollo. El servidor rechaza secretos ausentes, cortos o con valores de ejemplo. |
| `JWT_EXPIRES_IN` | ✅ Opcional | El valor predeterminado es `7d`; solo debes configurarlo si necesitas otro periodo |
| `CORS_ORIGINS` | ⏳ Pendiente | Actualmente contiene `https://gluten-free-app.netlify.app` como ejemplo en `.env.example`. Actualízalo con el dominio real asignado por Netlify antes de conectar el frontend con el backend en producción |
| `TRUST_PROXY_HOPS` | ✅ Preparado | `1` para Koyeb/Render; permite que el rate limiter use la IP original detrás del reverse proxy |
| `PORT` | ✅ No hace falta setearlo | La plataforma de hosting lo inyecta automáticamente |
| `GOOGLE_PLACES_API_KEY` | ✅ Listo | La clave ya tiene la facturación habilitada. Sin ella, el script de asociación y `/establishments/:id/photo` fallan, pero el resto de la aplicación sigue funcionando con un icono genérico como alternativa |

### Pasos externos para desplegar la beta

1. **Koyeb**: crear un Web Service conectado a `Marylizr/glutenfri`, rama `main`, Buildpack, work directory `server`, comando `npm start`, instancia Free y región Frankfurt.
2. Cargar `MONGODB_URI`, un `JWT_SECRET` nuevo, `CORS_ORIGINS`, `TRUST_PROXY_HOPS=1`, `NODE_ENV=production` y `GOOGLE_PLACES_API_KEY`.
3. Configurar el health check como `/api/health`.
4. **Netlify**: conectar el repo; `netlify.toml` configura el build. Cargar `VITE_API_URL=https://TU-SERVICIO.koyeb.app/api`.
5. Actualizar `CORS_ORIGINS` con el dominio final de Netlify.
6. **GitHub → Settings → Secrets and variables → Actions**: agregar `MONGODB_URI` y `GOOGLE_PLACES_API_KEY` para el refresco programado.
7. Probar registro/login, guardados, Safety Review, moderación, exportación y borrado de cuenta.

## GDPR: requisitos técnicos implementados

### Auditoría previa (confirmada antes de tocar código)

- **Geolocalización**: `useUserLocation.js` nunca sale del navegador — se usa solo para centrar el mapa y calcular distancias client-side (`utils/distance.js`, matemática pura). Ningún `services/*.js` la manda al backend.
- **Campos del `User`**: `name`, `email`, `passwordHash` (hash bcrypt, nunca el password crudo), `savedEstablishments`, `privacyAcceptedAt` (nuevo), `createdAt`/`updatedAt`. El campo `avatar` estaba muerto (nadie lo completaba ni lo mostraba) — **se eliminó del schema** en este mismo cambio.
- **Logging de password**: confirmado que ningún `console.log`/`console.error` ni el formato de `morgan` loguean `req.body` o el password. Los errores de validación de `express-validator` solo devuelven `.msg`, nunca `.value`.
- **Región de los datos**: Atlas confirmado en AWS `eu-central-1` (Frankfurt). Para la beta, el backend está preparado para una instancia Koyeb en Frankfurt y el frontend para Netlify.

### Implementado

- **Derecho al olvido** — `DELETE /api/users/me` (protegido): borra el `User`, todas sus `Review` en cascada, y recalcula `avgRating` de cada establecimiento afectado (agregación sobre las reseñas restantes; `null` si no queda ninguna). `savedEstablishments` vive solo en el propio `User`, así que se limpia solo al borrar el documento.
  - **Bug encontrado y corregido en el camino**: `requireAuth` solo verificaba la firma/vencimiento del JWT, no si el usuario seguía existiendo. Un token emitido antes del borrado seguía "válido" hasta sus 7 días de expiración aunque la cuenta ya no existiera — lo que rompía con un 500 crudo (o peor, permitiría crear reseñas con un `user` inexistente). Ahora `requireAuth` confirma que el usuario exista en la base en cada request autenticada; si no existe, devuelve 401 (lo que además dispara el flujo de "sesión expirada" que ya existía en el frontend).
  - Frontend: botón "Eliminar mi cuenta" en `ProfilePage.jsx` con un modal de confirmación real (`ConfirmModal.jsx`, no `window.confirm()`) — "¿Eliminar tu cuenta? Se borra tu perfil y todas tus reseñas de forma permanente. Esta acción no se puede deshacer."
- **Portabilidad** — `GET /api/users/me/export` (protegido): devuelve `{ exportedAt, user (sin passwordHash), reviews, savedEstablishments (documentos completos, no solo ids) }`. Frontend: botón "Descargar mis datos" que dispara la descarga de un `.json`.
- **Información y aceptación** — checkbox obligatorio enlazado a `/privacidad` en el formulario de registro, con `required` nativo del navegador. El backend **no confía en eso**: `express-validator` rechaza el registro con 400 si `privacyAccepted` no llega como `true` exactamente, y `User.privacyAcceptedAt` (`required` a nivel de schema) guarda cuándo se aceptó la versión informada. Si cambia materialmente la política, comparar esa fecha contra la vigencia de la nueva versión para saber a quién volver a informar.

Todo probado en vivo: registro sin checkbox (bloqueado en el navegador y rechazado por el backend si se salta esa validación), export con `passwordHash` confirmado ausente, borrado en cascada con una reseña real (`avgRating` volvió a `null` tras el borrado), y el caso del token "zombie" post-borrado devolviendo 401 limpio.

### Política y revisión jurídica

- La política está publicada en `/privacidad`, con responsable, contacto,
  datos, finalidades, bases jurídicas, proveedores, conservación, derechos
  y enlace de reclamación ante la CNPD. El registro enlaza directamente a
  esta versión.
- Antes de un lanzamiento público, una revisión jurídica debe confirmar la
  identidad formal del responsable, transferencias de cada proveedor y si
  aplica representante UE (Art. 27 GDPR).

## Piloto cerrado: puntos rojos de seguridad/usabilidad

### 0. Investigación previa

- Tab "Reviews" del bottom nav: confirmado que sigue siendo el placeholder original (`<ComingSoon label="Reseñas" />`) — nadie lo construyó en ninguna sesión.
- Servicio de email: nada configurado en este proyecto (sin `SENDGRID_API_KEY`/`RESEND_API_KEY`, sin `nodemailer`/`resend` en ningún `package.json`). Encontrado en `SweatMateApp-migrate` un servicio de email con **Resend** ya en producción (llamado por HTTP directo, sin SDK — `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`) y un flujo completo de forgot/reset password ya probado ahí, reutilizable como referencia de diseño.

### 1. "Olvidé mi contraseña" — **pausado**

A la espera de que consigas un dominio para verificar en Resend. Se retoma cuando lo tengas — avisame y seguimos desde ahí con el mismo patrón ya validado en SweatMate.

### 2. Una reseña por usuario por establecimiento — hecho

- Antes de tocar nada: revisé Atlas por reseñas de prueba duplicadas de sesiones anteriores — **la colección `reviews` estaba en cero** (las reseñas de prueba anteriores se habían borrado en cascada al eliminar las cuentas de prueba con el flujo de GDPR). No hubo nada que limpiar.
- Índice único compuesto `{ establishment: 1, user: 1 }` en `Review` — confirmado creado en Atlas (`db.reviews.getIndexes()`).
- **Decisión de producto aplicada**: reenviar el Safety Review **actualiza** la reseña existente (upsert vía `findOneAndUpdate`) en vez de rechazar con 409 — devuelve `200` si actualizó, `201` si creó.
- `avgRating` se recalcula igual en los tres casos (crear, editar, borrar) — probado explícitamente: reseña con rating 2 → `avgRating: 2` → misma reseña editada a rating 5 → `avgRating: 5` (no promedia 2 y 5, refleja el estado actual).
- Frontend: `EstablishmentDetailPage` detecta si el usuario logueado ya tiene una reseña propia (comparando `auth.user.id` contra `reviews[].user._id`) y cambia el botón a "Editar mi reseña"; `SafetyReviewFlow` recibe esa reseña como `existingReview` y precarga las 4 respuestas + rating + comentario, con el botón final como "Actualizar reseña". Probado en vivo el flujo completo: crear reseña (2★, botón "Enviar reseña") → volver a la card (botón ya dice "Editar mi reseña") → reabrir y confirmar que las 4 respuestas y el rating vienen precargados → cambiar a 5★ y confirmar ("Actualizar reseña") → la card de reseña sigue siendo una sola, actualizada.

### 3. Rate limiting en reseñas — hecho

- `POST /establishments/:id/reviews`: 10 reseñas por hora **por usuario autenticado** (no por IP — `keyGenerator` usa `req.user.id`, que ya está disponible porque `requireAuth` corre antes en la cadena de middlewares).
- Probado enviando 15 requests seguidos con el mismo usuario: los primeros 10 pasaron (200/201), del 11° en adelante `429` — límite exacto confirmado.

## Tab "Reviews": feed de actividad de la comunidad

Reemplaza el placeholder "próximamente". `ReviewsPage.jsx` con toggle
**Comunidad** (default) / **Mis reseñas**, mismo feed, filtro distinto.

**Backend**:
- `GET /api/reviews/recent` (público) — reseñas de todos los establecimientos, `createdAt` descendente, paginado (`?page`/`?limit`, default 20, máx 50, mismo shape `{ data, page, limit, total, totalPages }` que `/establishments`). Cada item trae `establishment: { _id, name, type }` y `user: { _id, name }` poblados.
- `GET /api/users/me/reviews` (protegido) — mismo shape, filtrado a las reseñas del usuario autenticado.
- **Privacidad, criterio unificado**: el nombre del usuario se recorta al primer nombre únicamente (`"Maria Fernandez"` → `"Maria"`) antes de salir del servidor, en **los tres** endpoints que devuelven reseñas — `/api/reviews/recent`, `/api/users/me/reviews`, y también `GET /establishments/:id/reviews` (el del detalle de cada lugar, que antes devolvía el nombre completo). La lógica vive en un solo lugar, `server/src/utils/reviewFormatting.js` (`toPublicReview` + `parsePagination`), importado por los tres controllers — si el criterio de privacidad cambia el día de mañana, se cambia una sola vez. `GET /users/me/export` (portabilidad GDPR) sigue devolviendo las reseñas del usuario **sin truncar** a propósito — es su propio export completo, no una vista pública.

**Frontend**:
- Cada card: ícono + nombre del establecimiento (clickeable → trae el establecimiento completo vía `getEstablishmentById` y abre su detalle), nombre del usuario, rating, comentario recortado a 2 líneas (`-webkit-line-clamp`), badge de nivel de riesgo si la reseña lo incluyó, tiempo relativo.
- Tiempo relativo: no había ninguna librería de fechas instalada (ni date-fns ni similar) — se armó `utils/time.js`, una función simple, para no sumar una dependencia por esto.
- Paginación: botón "Cargar más" (no scroll infinito) — es lo que menos código nuevo pedía dado que el proyecto no tenía ningún patrón de scroll infinito para reutilizar.
- **Estados vacíos** (el foco del diseño, no un afterthought):
  - Comunidad vacía: "Sé la primera en dejar una reseña esta semana" + botón "Explorar lugares" → tab Inicio.
  - Mis reseñas vacío (con sesión): "Todavía no dejaste ninguna reseña" + mismo botón.
  - Mis reseñas sin sesión: mismo componente `LoginRequiredState` que ya usaba `SavedPage.jsx` — se extrajo de ahí a un componente compartido en vez de duplicar el bloque, como pediste.

**Antes de probar el estado vacío real** se encontraron 9 reseñas de prueba residuales de la sesión anterior (limitación de solicitudes, cuentas "Upsert Test" y "Edit Flow Test") que no se habían limpiado. Se solicitó confirmación antes de eliminarlas y se utilizó el mismo `DELETE /api/users/me` (borrado en cascada y recálculo de `avgRating`) para las 2 cuentas. Con ello se probó el feed real: primero vacío y después con una reseña real de un usuario nuevo ("Maria Fernandez" se muestra como "Maria"), confirmando el nombre abreviado, el tiempo relativo, el comentario recortado, la etiqueta de riesgo y que seleccionar el nombre del establecimiento abre su detalle completo.

**Unificación posterior**: confirmé con `curl` que `GET /establishments/:id/reviews` devuelve `"Maria"` en vez de `"Maria Fernandez"` tras el cambio, y volví a abrir el detalle de "Pastelaria Soul" en el navegador para confirmar visualmente que la sección "Reseñas de la comunidad" se sigue viendo igual (nombre, estrellas, comentario, badges de personal/menú/cocina/riesgo) — el único cambio es el nombre truncado.

## Routing real con react-router-dom (2026-07-24)

`react-router-dom` estaba en `package.json` desde el principio pero nunca
se usó — toda la navegación vivía en `useState` (`tab`/`selected`) dentro
de `App.jsx`, sin URLs reales. Esto significaba: el botón atrás del
navegador no hacía nada útil (o cerraba la app/salía del historial), y no
había forma de compartir un link directo a un establecimiento.

### Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Explore (Home) |
| `/mapa` | Vista Map |
| `/guardados` | Saved |
| `/reseñas` | Reviews |
| `/perfil` | Profile |
| `/lugar/:id` | Detalle de establecimiento |

`client/src/main.jsx` envuelve `<App />` en `<BrowserRouter>`.
`BottomNav.jsx` se reescribió para usar `NavLink` (resalta el tab activo
según la URL real vía `isActive`, no un estado interno) en vez de recibir
`active`/`onChange` por props.

### Patrón "background location" para el detalle

El requisito difícil era: entrar al detalle desde Explore, Map o Reviews
(incluyendo el feed de comunidad) y que "atrás" vuelva **exactamente** a
la pantalla de origen con su estado intacto (ej. un filtro aplicado en
Map, no resetear a Explore). Lift-state-up de todos los filtros locales a
`App.jsx` hubiera funcionado pero es invasivo y frágil a futuro.

En cambio, `openEstablishment` (en `App.jsx`) navega a `/lugar/:id`
pasando `state: { backgroundLocation: location, establishment }`. Con
eso, `App.jsx` renderiza **dos** `<Routes>`: el de fondo usa
`backgroundLocation || location` (así la pantalla de origen sigue
montada, nunca se desmonta, y su estado local —filtros, scroll— se
conserva tal cual), y un segundo `<Routes>` con solo la ruta
`/lugar/:id` se dibuja como overlay absoluto encima cuando hay
`backgroundLocation`. El botón atrás propio de la pantalla de detalle
llama `navigate(-1)`, que hace pop del historial y vuelve al
`backgroundLocation` — y el botón atrás **nativo del navegador** hace
exactamente lo mismo sin código adicional, porque es el mismo mecanismo
de historial.

`pages/EstablishmentDetailRoute.jsx` es el componente que cuelga de
`/lugar/:id`: si `location.state.establishment` ya viene (abierto desde
un click dentro de la app), lo usa directo sin refetch. Si no hay state
(carga directa por URL — link compartido, o un refresh de página en
`/lugar/:id`), hace `getEstablishmentById(id)` contra el backend. El
botón atrás ahí mismo revisa si hay `backgroundLocation`: si sí,
`navigate(-1)`; si no (no hay a dónde volver dentro de la app), manda a
`/`.

### Login/registro: se quedó en `/perfil`, sin rutas propias

Evalué agregar `/login` y `/registro` como pedía el brief, pero decidí no
hacerlo: `/perfil` ya no es un modal, es una pantalla de página completa
(`ProfilePage.jsx`) que alterna internamente entre el formulario de
login/registro y `AccountPanel` según `auth.user` — no hay nada "modal"
que necesite poder cerrarse con atrás ni un flujo que se beneficie de una
URL separada. Partirlo en rutas solo hubiera agregado redirecciones sin
un beneficio real de UX o de compartibilidad (nadie comparte un link a
"iniciar sesión").

### Sesión expirada

El flujo existente (`useAuth` escucha el evento `gf:session-expired` que
dispara el interceptor 401 de `services/api.js`) sigue funcionando igual:
un `useEffect` en `App.jsx` observa `auth.sessionExpired` y hace
`navigate('/perfil', { replace: true })` — `replace` para no dejar en el
historial una pantalla que ya no se puede usar con la sesión vencida.

### Probado en el navegador

- Navegación entre las 5 pantallas principales vía `BottomNav` — URL y
  resaltado del tab activo correctos en cada una.
- Detalle abierto desde Explore (con una búsqueda activa) → atrás →
  vuelve a `/` con la búsqueda todavía en el input.
- Detalle abierto desde Map **con un filtro de tipo aplicado**
  (`Restaurante`) → atrás → vuelve a `/mapa` con el mismo filtro
  seleccionado, no resetea a Explore. Este era el caso que más importaba
  probar.
- Detalle abierto desde el feed de Reviews (Comunidad) → atrás → vuelve a
  `/reseñas`.
- Atrás **nativo del navegador** (no el botón propio de la pantalla)
  probado explícitamente desde el detalle abierto desde Reviews — mismo
  comportamiento que el botón in-app, vuelve a `/reseñas`.
- Carga directa (no un click dentro de la app) de una URL `/lugar/:id` en
  una pestaña nueva — carga ese establecimiento vía fetch por id, sin
  romper; su botón atrás manda a `/` (no hay historial propio de la app
  al cual volver).
- Sesión expirada simulada (evento `gf:session-expired`) — sigue
  redirigiendo a `/perfil` y mostrando el banner "Tu sesión expiró.
  Inicia sesión de nuevo."
- `BottomNav` confirmado oculto mientras se ve `/lugar/:id`, tanto en el
  caso overlay como en el de carga directa.

## Moderación básica de reseñas (2026-07-24)

Diseñado para andar igual en un piloto chico de confianza que en uno más
abierto — reportar nunca oculta nada automáticamente, así que no hace
falta decidir de antemano cuánto se confía en la comunidad.

### Modelo

`Review` suma dos campos: `hidden` (Boolean, default `false`) y
`reportedBy` (array de `ObjectId` de `User`) — quién ya reportó esta
reseña, para que la misma persona no pueda reportarla dos veces.
`User` suma `isAdmin` (Boolean, default `false`). El primer administrador
se crea con el script seguro `npm run set-admin -- correo@ejemplo.com`;
después, los roles se gestionan desde el propio panel.

### Reportar — `POST /api/reviews/:id/report` (autenticado)

Agrega el `userId` a `reportedBy` si no estaba ya ahí. Si la misma
persona intenta reportar la misma reseña de nuevo, **no es
silenciosamente idempotente** — rechaza con `409` y
`{"error":"Ya reportaste esta reseña"}`, para que el frontend pueda
distinguir "primera vez" de "ya la habías reportado" y reflejarlo en la
UI (botón "Reportado" deshabilitado).

### Ocultar de los feeds públicos, visible para el autor

`GET /reviews/recent`, `GET /establishments/:id/reviews` y
`GET /users/me/reviews` son los tres endpoints que devuelven reseñas.
Los primeros dos ahora corren `optionalAuth` (nuevo middleware en
`middleware/auth.js`: intenta decodificar el token si viene, pero nunca
corta la request si no hay uno o es inválido — quedan públicos para
anónimos) y filtran `hidden: true` **excepto** cuando el usuario
autenticado es el autor de esa reseña puntual (`visibilityFilter` en
`utils/reviewFormatting.js`: `{ hidden: false }` si no hay sesión,
`{ $or: [{ hidden: false }, { user: userId }] }` si la hay). Así, si tu
propia reseña queda oculta para el resto, pero puedes seguir viéndola en el
feed de comunidad y en el detalle del establecimiento.

`GET /users/me/reviews` ("Mis reseñas") **no filtra por `hidden` en
absoluto** — a propósito: ahí todas las reseñas son siempre del propio
usuario, así que no hay nada que esconderle a nadie; el autor tiene que
poder seguir viendo (y editando) su reseña oculta desde ahí también.

### Rol de admin y sus endpoints

`requireAdmin` (en `middleware/auth.js`) es `[requireAuth, checkIsAdmin]`
— reutiliza `requireAuth` y agrega una verificación de `isAdmin` **contra
la base**, no contra el JWT: el payload del token no lleva `isAdmin`
(se firma en login/registro, antes de que exista el flag), así que si
marcás a alguien como admin en Atlas, el cambio aplica en su próxima
request sin necesidad de que vuelva a loguearse.

- `GET /api/admin/reviews/reported` — reseñas con al menos 1 reporte,
  más reportadas primero (agregación con `$lookup` a `establishment` y
  `user` — a diferencia de los feeds públicos, acá se expone el nombre
  completo y el email de quien escribió, porque quien modera necesita
  identificar a la persona, no la versión recortada que ve el público).
- `PATCH /api/admin/reviews/:id/hide` — marca `hidden: true`.
- `PATCH /api/admin/reviews/:id/unhide` — revierte.

**Bug encontrado y corregido en el camino**: la agregación de
`reported` usaba `{ $size: '$reportedBy' }` para contar reportes, que
rompe con `"must be an array, but was of type: missing"` en cualquier
`Review` creada antes de agregar el campo al schema (no se
retroalimenta a documentos existentes). Cambiado a
`{ $size: { $ifNull: ['$reportedBy', []] } }`.

### Panel y acceso administrativo

`/admin` lista las reseñas reportadas, permite ocultarlas/restaurarlas y
gestiona los roles de las cuentas. El backend vuelve a comprobar
`isAdmin` en cada petición; ocultar la ruta en el frontend no es el
control de seguridad.

**1. Crear el primer administrador** (una vez):

```bash
cd server
npm run set-admin -- tu-email@ejemplo.com
```

Para retirarlo por CLI: `npm run set-admin -- tu-email@ejemplo.com --remove`.
El panel impide quitar al último administrador.

**2. Obtener tu JWT**: inicia sesión normalmente en la aplicación (`/perfil`) y
copia el token de `localStorage.getItem('gf_auth_token')` desde la
consola del navegador, o inicia sesión mediante curl:

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@ejemplo.com","password":"tu-password"}'
```

**3. Listar reseñas reportadas**:

```bash
curl -s http://localhost:4000/api/admin/reviews/reported \
  -H "Authorization: Bearer TU_JWT" | python3 -m json.tool
```

**4. Ocultar una reseña** (usa el `_id` devuelto en el paso anterior):

```bash
curl -s -X PATCH http://localhost:4000/api/admin/reviews/REVIEW_ID/hide \
  -H "Authorization: Bearer TU_JWT"
```

**5. Restaurarla**:

```bash
curl -s -X PATCH http://localhost:4000/api/admin/reviews/REVIEW_ID/unhide \
  -H "Authorization: Bearer TU_JWT"
```

### Frontend

`ReportButton.jsx` (componente compartido) — solo se renderiza si hay
sesión iniciada (`auth.user`); reportar sin cuenta no tiene sentido
porque no hay a quién atribuirle el reporte. Al tocarlo, confirma con
`ConfirmModal` (mismo patrón que "Eliminar mi cuenta" — nada de
`window.confirm()`), llama a `reportReview(reviewId)`
(`services/reviews.js`), y cambia a un estado "Reportado" deshabilitado.
Un `409` del backend (ya lo habías reportado, ej. en otra pestaña) se
trata igual que un éxito visualmente — el estado final que le importa
al usuario es el mismo. El estado "Reportado" vive en memoria del
componente, no se persiste — es válido para esta sesión del navegador,
consistente con lo pedido.

Conectado en los dos lugares donde aparece una reseña: `ReviewItem` en
`EstablishmentDetailPage.jsx` (detalle de establecimiento) y
`ReviewFeedCard` en `ReviewsPage.jsx` (feed de Reviews).

### Probado end-to-end (vía curl, documentado arriba en detalle)

Reportar una reseña de prueba → confirmar que un segundo reporte del
mismo usuario da `409` → aparece en `GET /admin/reviews/reported` con
`reportsCount: 1` → ocultarla → confirmado que desaparece de
`GET /establishments/:id/reviews` y `GET /reviews/recent` para un
usuario anónimo o distinto del autor, pero el autor la sigue viendo en
ambos endpoints (por ser el autor) y en `GET /users/me/reviews` — →
restaurarla → reaparece en los feeds públicos y sigue apareciendo en
`reported` (el historial de reportes no se borra al restaurar). Probado
también en el navegador: botón "⚑ Reportar" → confirmación → estado
"Reportado" deshabilitado, sin poder reportar dos veces desde la misma
sesión. Cuentas y reseñas de prueba borradas al terminar (mismo
`DELETE /api/users/me` de siempre).

## Notas técnicas

- **API URL centralizada** en `client/src/services/apiConfig.js` — mismo patrón que SweatMate, para que la migración a Capacitor no requiera tocar cada componente.
- **Token de auth** guardado en `localStorage` por ahora; migrar a Capacitor Preferences en Fase 4 (mismo playbook que SweatMate).
- **CORS**: `CORS_ORIGINS` es obligatorio (el server no arranca sin él). En producción debe incluir el dominio real del frontend y, cuando lleguemos a Fase 4, el origen de Capacitor (`capacitor://localhost` en iOS, `http://localhost` en Android).
- **Atribución Google Places**: los 42 establecimientos con `source: "Google"` (43 originales, uno se fusionó con un registro APC) necesitan atribución visible ("Powered by Google") en cualquier vista de mapa/lista antes de producción — pendiente, requisito de sus ToS.
