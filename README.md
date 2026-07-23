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
- [ ] Wrap Capacitor (Fase 4) — `capacitor.config.json` es solo placeholder

## Notas técnicas

- **API URL centralizada** en `client/src/services/apiConfig.js` — mismo patrón que SweatMate, para que la migración a Capacitor no requiera tocar cada componente.
- **Token de auth** guardado en `localStorage` por ahora; migrar a Capacitor Preferences en Fase 4 (mismo playbook que SweatMate).
- **CORS**: en producción, `CORS_ORIGINS` debe incluir el origen de Capacitor (`capacitor://localhost` en iOS, `http://localhost` en Android) además del dominio web.
- **Atribución Google Places**: los 43 establecimientos con `source: "Google"` necesitan atribución visible ("Powered by Google") en cualquier vista de mapa/lista antes de producción.
