# Gluten Free Porto/Famalicão

App para unificar información de sitios gluten-free (restaurantes, tiendas,
farmacias, pastelerías) en el Norte de Portugal, con reseñas de usuarios.

## Estructura

```
gluten-free-app/
├── client/          React + Vite (web, y base para el wrap Capacitor)
├── server/          Node/Express + MongoDB
│   └── data/        merged_dataset.json (semilla APC + Google Places)
└── capacitor.config.json   (placeholder — Fase 4 del roadmap)
```

## Levantar en local

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
  - `CORS_ORIGINS` ahora es **obligatorio** — el servidor no arranca sin él (antes tenía default `'*'`). `.env.example` trae un placeholder de producción (`https://gluten-free-app.netlify.app`) que hay que reemplazar por el dominio real antes de deployar
  - Error handler centralizado (`middleware/errorHandler.js`) — nunca expone stack traces ni errores crudos de Mongo al cliente
  - `/api/health` ahora chequea la conexión real a Mongo (antes devolvía `200` fijo)
- [x] **Base de datos en MongoDB Atlas** — `server/.env` ya apunta al cluster real (`gluten-free-app.nexxyse.mongodb.net`), seed corrido ahí (72 establecimientos), confirmado `seed` + `npm run dev` levantando sin error contra la nube. `.env` sigue sin commitear.
- [x] **Logging** (`morgan`) — a stdout (lo que espera Heroku): formato `combined` en producción, `dev` en desarrollo
- [x] **Error handler verificado con Express 5**: confirmado en vivo que un error async sin try/catch en un controller SÍ llega al `errorHandler` (Express 5 reenvía promesas rechazadas automáticamente) y el cliente solo ve `{"error":"Error interno del servidor"}`, nunca el mensaje real ni el stack trace
- [x] **Paginación** en `GET /api/establishments` (`?page`/`?limit`, default `limit=100`, máx `200`) — responde `{ data, page, limit, total, totalPages }`. El frontend (`services/establishments.js`) desenvuelve `.data` así que no cambió nada visible con el dataset actual (72 entra en una sola página)
- [x] **Índices de Mongo revisados**: se agregó `{ certified: 1 }` en `Establishment` (usado por el filtro `certifiedOnly`). Los campos de Celiac Safety Protocols no tienen índice porque hoy nada los usa como filtro — agregar si en algún momento sumamos algo tipo `?riskLevel=low`. `savedEstablishments` del `User` no necesita índice propio (son lookups por `_id`, ya indexado por default)
- [x] **Atribución "Google Maps"** agregada en las 3 vistas que muestran establecimientos con `source: "Google"` o `"APC+Google"` (componente `GoogleAttribution`): debajo de la card en la lista, en la detail page, y en el pie del mapa (junto a la atribución de OpenStreetMap) + dentro de cada popup de pin
- [ ] **Política de caché de datos de Google Places — riesgo de compliance conocido, aceptado para MVP, sin resolver.** No lanzar públicamente sin volver a este punto. Ver sección dedicada abajo.
- [x] **Estados de error y robustez del frontend**:
  - Componente `ErrorState` reutilizable (mensaje + botón "Reintentar"), conectado en `ExplorePage`, `HomePage`, `SavedPage` y la lista de reseñas de `EstablishmentDetailPage` — si el backend/Atlas no responde, el usuario ve un mensaje claro y puede reintentar, en vez de una lista vacía engañosa o un spinner colgado. Probado matando el backend a propósito y confirmando la recuperación con "Reintentar"
  - **Sesión expirada manejada globalmente**: interceptor de respuesta en `services/api.js` detecta un 401 cuando SÍ había un token guardado (JWT vencido/inválido, no un anónimo), limpia la sesión y dispara un evento que `useAuth` escucha; `App.jsx` redirige a la pantalla de login con el mensaje "Tu sesión expiró. Iniciá sesión de nuevo." Probado corrompiendo el token manualmente y confirmando la redirección — sin quedar colgado, sin error crudo en consola
  - **Bug real encontrado y corregido**: `useSaved.toggle()` no tenía `try/catch` — si el token vencía mientras alguien tocaba el corazón de guardar, la promesa quedaba rechazada sin manejar (unhandled rejection silenciosa). Ahora atrapa el error y deja que el interceptor global maneje el 401
  - **Auditoría de textos en inglés** corregida: dropdown de tipos en `Filters.jsx` mostraba los valores crudos del enum (`restaurant`, `store`, etc.) en vez de traducirlos como ya hacía `CategoryChips`; "Your Safe Spots" → "Tus lugares seguros"; labels Poor/Okay/Excellent → Malo/Regular/Excelente (tanto en las respuestas del Safety Review como en los badges de reseñas); "Celiac Safety Protocols" → "Protocolos de seguridad celíaca"; bottom nav Home/Map/Saved/Reviews/Profile → Inicio/Mapa/Guardados/Reseñas/Perfil
- [x] **Deploy preparado** (Procfile, `engines`, `netlify.toml`, checklist de env vars) — ver sección dedicada abajo. **No desplegado todavía.**
- [x] **Requisitos técnicos de GDPR** — ver sección dedicada abajo. Falta publicar la política de privacidad real (la estás armando con tu abogado) y decidir el representante UE si aplica
- [ ] Wrap Capacitor (Fase 4) — `capacitor.config.json` es solo placeholder

## ⚠️ Google Places: hallazgo de compliance sobre caché de datos

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

**Decisión (2026-07-23):** por ahora seguimos en modo MVP — se documenta
el riesgo acá y no se bloquea el resto del checklist de producción. Es un
riesgo de compliance asumido conscientemente, no resuelto. **No lanzar
públicamente sin volver a este punto** — conseguir la API key de Google
Maps Platform, re-popular los 46 registros con su `place_id`, y armar el
job de refresco antes de un lanzamiento real.

## Deploy: checklist de producción (preparado, no ejecutado)

### Ya está listo en el código

- **`server/Procfile`**: `web: node src/server.js`
- **`server/package.json`**: agregado `"engines": { "node": "20.x" }` — coincide con la versión local (`node --version` → v20.20.2)
- **`netlify.toml`** (raíz del repo): `base = "client"`, `command = "npm run build"`, `publish = "dist"`, más el redirect `/* → /index.html` (200) para que el SPA no dé 404 al refrescar una ruta. Nota: hoy la app no usa rutas de URL reales (`react-router-dom` está en `package.json` pero no se usa en ningún componente — toda la navegación es estado en memoria dentro de `App.jsx`), así que el redirect no tiene efecto práctico todavía, pero es lo correcto para cuando se agregue routing real
- Confirmado `npm run build` en `client/` — compila sin errores (`dist/` generado, ~131 KB gzipped)

### Variables de entorno para producción

| Variable | Estado | Detalle |
|---|---|---|
| `MONGODB_URI` | ✅ Listo | Ya tenés el cluster de Atlas funcionando |
| `JWT_SECRET` | ✅ El valor actual de tu `.env` local es suficientemente fuerte | Es un hex de 64 caracteres (256 bits) generado con `openssl rand -hex 32` — cumple el mínimo recomendado para HS256. **Igual generá uno *distinto* para producción** (no reuses el de dev): si en algún momento se filtra el `.env` local, no querés que ese mismo secreto firme también los tokens de producción. Ejemplo de uno nuevo, generado ahora: `ea8e39b04042355bdcdcbb74d947a8889465454b9163e31dab61ff60a1276460` — usalo o generá el tuyo con `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | ✅ Opcional | Default ya es `7d` en el código; solo hace falta setearlo si querés otro valor |
| `CORS_ORIGINS` | ⏳ Pendiente de vos | Hoy tiene el placeholder `https://gluten-free-app.netlify.app` en `.env.example`. Actualizalo con el dominio real que te dé Netlify antes de que el frontend pueda hablarle al backend en producción |
| `PORT` | ✅ No hace falta setearlo | Heroku lo inyecta automáticamente |

### Lo que te falta a VOS (no lo puedo hacer yo)

1. **Heroku**: crear cuenta si no tenés, crear la app, conectarla al repo de GitHub (`Marylizr/glutenfri`) o configurar el remoto de `git push heroku main`. Elegí que el deploy sea desde la carpeta `server/` (Heroku necesita que el `Procfile` esté en la raíz del repo que le apuntes — si conectás el monorepo completo, puede que necesites un buildpack tipo `heroku-buildpack-subdir` o desplegar `server/` como su propio repo/submódulo; decime cómo preferís organizarlo y lo ajusto)
2. **Heroku → Settings → Config Vars**: cargar `MONGODB_URI`, `JWT_SECRET` (el nuevo, no el de dev), `CORS_ORIGINS` (placeholder por ahora, lo actualizás después)
3. **Netlify**: crear cuenta si no tenés, conectar el repo — Netlify debería detectar `netlify.toml` solo
4. **Netlify → Site settings → Environment variables**: cargar `VITE_API_URL` apuntando a la URL real que te dé Heroku (ej. `https://tu-app.herokuapp.com/api`)
5. Una vez que Netlify te dé el dominio final, **volver a Heroku y actualizar `CORS_ORIGINS`** con ese dominio real (reemplazando el placeholder)
6. Después de todo eso, probar el flujo completo en producción antes de anunciarlo — especialmente registro/login (rate limiting agresivo real) y el flujo de Safety Review completo

## GDPR: requisitos técnicos implementados

### Auditoría previa (confirmada antes de tocar código)

- **Geolocalización**: `useUserLocation.js` nunca sale del navegador — se usa solo para centrar el mapa y calcular distancias client-side (`utils/distance.js`, matemática pura). Ningún `services/*.js` la manda al backend.
- **Campos del `User`**: `name`, `email`, `passwordHash` (hash bcrypt, nunca el password crudo), `savedEstablishments`, `privacyAcceptedAt` (nuevo), `createdAt`/`updatedAt`. El campo `avatar` estaba muerto (nadie lo completaba ni lo mostraba) — **se eliminó del schema** en este mismo cambio.
- **Logging de password**: confirmado que ningún `console.log`/`console.error` ni el formato de `morgan` loguean `req.body` o el password. Los errores de validación de `express-validator` solo devuelven `.msg`, nunca `.value`.
- **Región de los datos**: Atlas confirmado en AWS `eu-central-1` (Frankfurt) vía DNS de los tres shards del cluster. Heroku y Netlify todavía no están desplegados — Heroku crea apps en US por defecto salvo que se pase `--region eu` explícitamente al crearla. **Recordatorio para cuando crees la app de Heroku: usar `--region eu`.**

### Implementado

- **Derecho al olvido** — `DELETE /api/users/me` (protegido): borra el `User`, todas sus `Review` en cascada, y recalcula `avgRating` de cada establecimiento afectado (agregación sobre las reseñas restantes; `null` si no queda ninguna). `savedEstablishments` vive solo en el propio `User`, así que se limpia solo al borrar el documento.
  - **Bug encontrado y corregido en el camino**: `requireAuth` solo verificaba la firma/vencimiento del JWT, no si el usuario seguía existiendo. Un token emitido antes del borrado seguía "válido" hasta sus 7 días de expiración aunque la cuenta ya no existiera — lo que rompía con un 500 crudo (o peor, permitiría crear reseñas con un `user` inexistente). Ahora `requireAuth` confirma que el usuario exista en la base en cada request autenticada; si no existe, devuelve 401 (lo que además dispara el flujo de "sesión expirada" que ya existía en el frontend).
  - Frontend: botón "Eliminar mi cuenta" en `ProfilePage.jsx` con un modal de confirmación real (`ConfirmModal.jsx`, no `window.confirm()`) — "¿Eliminar tu cuenta? Se borra tu perfil y todas tus reseñas de forma permanente. Esta acción no se puede deshacer."
- **Portabilidad** — `GET /api/users/me/export` (protegido): devuelve `{ exportedAt, user (sin passwordHash), reviews, savedEstablishments (documentos completos, no solo ids) }`. Frontend: botón "Descargar mis datos" que dispara la descarga de un `.json`.
- **Consentimiento explícito** — checkbox obligatorio "Acepto la política de privacidad y los términos de uso" en el formulario de registro (`ProfilePage.jsx`), con `required` nativo del navegador (bloquea el submit sin marcarlo). El backend **no confía en eso**: `express-validator` rechaza el registro con 400 si `privacyAccepted` no llega como `true` exactamente, y `User.privacyAcceptedAt` (`required` a nivel de schema) guarda cuándo lo aceptó. Si el día de mañana cambia la política, comparar esa fecha contra la fecha de la nueva política para saber a quién re-pedirle consentimiento.

Todo probado en vivo: registro sin checkbox (bloqueado en el navegador y rechazado por el backend si se salta esa validación), export con `passwordHash` confirmado ausente, borrado en cascada con una reseña real (`avgRating` volvió a `null` tras el borrado), y el caso del token "zombie" post-borrado devolviendo 401 limpio.

### Pendiente de tu lado

- Publicar la política de privacidad real una vez que el abogado la revise (hoy el checkbox del registro no linkea a ninguna página porque todavía no existe la política publicada — cuando la tengas, avisame y agrego el link)
- Decidir si necesitás un representante UE (Art. 27 GDPR) — depende de dónde esté constituida la empresa
- Cuando crees la app de Heroku: `heroku create --region eu` (no lo puedo hacer yo, es un paso manual tuyo)

## Notas técnicas

- **API URL centralizada** en `client/src/services/apiConfig.js` — mismo patrón que SweatMate, para que la migración a Capacitor no requiera tocar cada componente.
- **Token de auth** guardado en `localStorage` por ahora; migrar a Capacitor Preferences en Fase 4 (mismo playbook que SweatMate).
- **CORS**: `CORS_ORIGINS` es obligatorio (el server no arranca sin él). En producción debe incluir el dominio real del frontend y, cuando lleguemos a Fase 4, el origen de Capacitor (`capacitor://localhost` en iOS, `http://localhost` en Android).
- **Atribución Google Places**: los 42 establecimientos con `source: "Google"` (43 originales, uno se fusionó con un registro APC) necesitan atribución visible ("Powered by Google") en cualquier vista de mapa/lista antes de producción — pendiente, requisito de sus ToS.
