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
- [ ] **Política de caché de datos de Google Places — BLOQUEANTE, no resuelto.** Ver sección dedicada abajo.
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
proceso que re-consulte por `place_id`. Como hoy no tenemos ni el
`place_id` ni la key, no puedo cerrar este punto sin tu decisión sobre
cómo seguir.

## Notas técnicas

## Notas técnicas

- **API URL centralizada** en `client/src/services/apiConfig.js` — mismo patrón que SweatMate, para que la migración a Capacitor no requiera tocar cada componente.
- **Token de auth** guardado en `localStorage` por ahora; migrar a Capacitor Preferences en Fase 4 (mismo playbook que SweatMate).
- **CORS**: `CORS_ORIGINS` es obligatorio (el server no arranca sin él). En producción debe incluir el dominio real del frontend y, cuando lleguemos a Fase 4, el origen de Capacitor (`capacitor://localhost` en iOS, `http://localhost` en Android).
- **Atribución Google Places**: los 42 establecimientos con `source: "Google"` (43 originales, uno se fusionó con un registro APC) necesitan atribución visible ("Powered by Google") en cualquier vista de mapa/lista antes de producción — pendiente, requisito de sus ToS.
