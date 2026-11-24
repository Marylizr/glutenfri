# Imágenes de categorías · 24/11/2026

## Resultado y alcance

Tres escenas editoriales nuevas generadas con IA (modo generación, no edición): tienda de barrio, panadería y restaurante portugueses ficticios. No son fotografías de los establecimientos, ni evidencia de certificación o seguridad alimentaria. Se identifican como imágenes ilustrativas en pt-PT/es/en. Se conservan las fotos reales existentes y la imagen de farmacia; supermercado y categoría desconocida utilizan la tienda.

Se eliminó el recorte por altura fija de las imágenes ilustrativas en Explorar. El contenedor conserva 16:9 y utiliza object-fit: contain. Recursos JPEG optimizados a 1200 × 675, aproximadamente 183–208 KiB cada uno. Una imagen por categoría seguirá repitiéndose dentro de esa categoría; no se generan falsas fotos de cada negocio.

## Archivos de esta tarea

- client/src/assets/fallbacks/{store,bakery,restaurant}-v2.jpg
- client/src/assets/fallbackImages.js
- client/src/components/PhotoPlaceholder.jsx
- client/src/index.css
- client/src/i18n/index.jsx
- client/test/establishmentsLoading.test.js
- client/test/i18nAudit.test.js
- Este informe y docs/qa/2026-11-24/category-images-{375,430,768,1440}.jpg

No se alteraron en esta tarea dependencias, modelos, ranking, confianza, certificaciones, reseñas, pagos o datos reales. Se preservaron cambios previos del repositorio.

## Validación

Build local servido con VITE_API_URL=http://127.0.0.1:4188/api contra el servidor QA sintético existente, sin Atlas. Validación real en Chrome a 375×812, 430×932, 768×1024 y 1440×900. Todas las imágenes cargaron; proporción 16:9, object-fit contain y scrollWidth igual a viewport en los cuatro casos. Capturas guardadas en la ruta indicada. El navegador integrado no mostró contenido; se utilizó Chrome para la verificación efectiva.

Filtro Lojas probado: 2 resultados sintéticos, URL categoria=store, sin error. Etiquetas en español e inglés comprobadas en navegador y html lang actualizado. PT-PT comprobado en capturas. Estos resultados no acreditan conectividad de producción.

Node 24.22.3. Cliente npm test: 85 correctos, 0 fallidos. npm run lint: exit 0, 17 advertencias existentes. npm run i18n:audit: exit 0, 162 claves por idioma, sin fallos. npm run build: exit 0. git diff --check: correcto. No se ejecutó la suite del servidor en esta tarea porque no se cambió código del servidor.

## Bloqueo de producción

Comprobación de https://glutenfri.netlify.app/api/health: HTTP 502, el 24/11/2026. El incidente del servicio continúa sin resolver. El diagnóstico anterior identificó problemas de resolución/conectividad MongoDB y el acceso de la organización Atlas para herramientas de IA está bloqueado; no se ha reintentado ni eludido ese bloqueo. Recuperar la conectividad requiere acceso autorizado del propietario a la configuración específica de GlutenFri. No se ocultó la caída sustituyendo datos reales por el catálogo QA.

No se hizo commit, push, PR, deploy, migración ni escritura en producción. GlutenFri mantiene su independencia respecto a APC/Biotrab.

## Prompts completos

### store

Archivo: client/src/assets/fallbacks/store-v2.jpg

Use case: photorealistic-natural. Asset type: GlutenFri directory card fallback, category grocery shop. Create one wide landscape 16:9 editorial photograph of a small contemporary Portuguese neighbourhood grocery interior. Warm white walls, oak shelves, a modest selection of unbranded pantry jars and packaged goods, fresh seasonal vegetables, olive-green details, softly lit tiled floor. Camera from entrance, spacious human-scale room, calm authentic daylight, real tactile materials, clean but lived-in. The SHOP SPACE is the subject, NOT an isolated bag of groceries or food still-life. All essential objects contained within central 65% of composition with generous breathing room above and below so it survives a wide mobile card. No people, no text, no logos, no certification marks, no wheat stalks, no repeated kraft shopping bags, no collage, no UI. Premium natural architectural photography, not illustration, not 3D. Distinct from a bakery or restaurant. Fictitious generic place, not an identifiable real business.

### bakery

Archivo: client/src/assets/fallbacks/bakery-v2.jpg

Use case: photorealistic-natural. Asset type: GlutenFri directory card fallback, category bakery. Create one wide landscape 16:9 editorial photograph of a Portuguese artisan bakery counter by a large window: several small golden rice-flour rolls, a few delicate pastries and one rustic round loaf sitting well inside a wide pale stone counter, shelving softly out of focus, warm terracotta wall and subtle blue ceramic accents. Camera at counter height, intimate bright morning scene, understated high-end food-and-interior photography. This is a BAKERY SPACE, not a floating still life. All main baked goods fully visible and located within central 60% horizontally and central 50% vertically; generous blank breathing room around edges for cards without cropping bread. No text, no signage, no people, no wheat stalks, no bags, no logos or certification symbols, no collage, no UI. Photographic, not illustration or 3D. Distinct warm terracotta mood, different from grocery-shop shelving. Fictitious generic scene.

### restaurant

Archivo: client/src/assets/fallbacks/restaurant-v2.jpg

Use case: photorealistic-natural. Asset type: GlutenFri directory card fallback, category restaurant. Create one wide landscape 16:9 editorial photograph of a welcoming small Portuguese restaurant dining room opening onto a sunny courtyard. Two simple well-spaced oak tables, off-white linen, green ceramic plates, water glasses, one understated bowl with a colourful vegetable-and-rice lunch; softly defocused blue-white azulejo accent and a leafy olive tree outside. View at seated eye level, architectural lifestyle photography with natural afternoon light. The DINING PLACE and atmosphere are the subject rather than an isolated plate. Keep both tables and all primary objects comfortably inside central 65% of image with generous breathing room all around; clean edges suitable for shallow directory card. No people, text, logos, signage, certification marks, bread baskets, shopping bags, collage or UI. Natural credible photo, not painting/3D. Different composition from grocery and bakery. Fictitious generic place, not an identifiable real business.
