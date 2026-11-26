# GlutenFri — preparación para App Store y Google Play

Fecha de revisión: 24/11/2026. **Preparación local; no enviada a ninguna tienda.**

Actualización: [QA nativo real y correcciones](mobile-native-qa-2026-11-24.md).
Hay validación parcial en iOS/Android y pruebas autenticadas por API local;
los límites históricos de esta preparación no equivalen a QA completo actual.

## Decisión y alcance

Capacitor 8.6.2 estable con proyectos nativos versionables en `client/ios` y
`client/android`. Se conserva el identificador del placeholder existente:
`pt.pixeltrendstudio.glutenfreeapp`. Nombre: GlutenFri. Primera versión propuesta:
1.0.0, build 1; confirmar que no existan versiones previas antes de firmar.

La configuración se trasladó de la raíz a `client/capacitor.config.json`, junto
al paquete npm que realmente compila. No es un sitio remoto cargado con
`server.url`: los archivos se incluyen en `client/dist-native`. La web conserva
`client/dist`, sus rutas y su despliegue habitual. No hay actualizaciones remotas
de código ni cambios en la clasificación o procedencia de los establecimientos.

La API móvil está restringida a `https://glutenfri.netlify.app/api`. No se admiten
HTTP, otras apps, credenciales en URL ni parámetros de acceso. La app necesita
conexión para el catálogo; no se afirma disponibilidad offline de los locales.

## Implementado

- iOS 15+ y Android 7/API 24+; target/compile Android 36.
- Ubicación aproximada solo tras acción del usuario. Android pide
  `ACCESS_COARSE_LOCATION`, no precisión fina ni segundo plano. iOS tiene los
  textos requeridos por el plugin en PT-PT, ES y EN, sin capacidad de background.
- Compartir nativo con URL pública, nunca `capacitor://localhost` ni
  `https://localhost`. Cancelar mantiene el comportamiento silencioso existente.
- Atrás de Android respeta diálogos, navega por rutas y minimiza desde Inicio o
  Explorar. Se eliminan listeners al desmontar.
- Service worker desactivado en el build nativo; sigue disponible en la web.
- Android deshabilita copias de seguridad y tráfico HTTP. No se añadieron permisos
  de cámara, micrófono, contactos, almacenamiento general, tracking o publicidad.
- Manifest de privacidad iOS incorporado al target. Incluye datos de cuenta,
  contenido y actividad que sí procesa el backend; no afirma «no se recogen datos».
  Es una base técnica que **requiere revisión junto a todos los proveedores**.
- Iconos y splash compilados desde el favicon SVG ya existente. Son una propuesta
  técnica, no un nuevo logotipo ni una aprobación creativa de Mary. No hay branding
  de Capacitor ni badges institucionales. El logo dentro de la app se conserva.
- Borradores de tienda en `store/metadata/{pt-PT,es,en}.json` y notas de revisión en
  `store/review-notes.txt`, sin credenciales. No son archivos de subida automática.

## Comandos, sin abrir aplicaciones

Usar Node 24.22.3, según `.nvmrc`, desde este proyecto. No cambiar herramientas de
otros proyectos. No ejecutar `cap open`, `cap run`, simuladores ni navegadores.

```sh
npm ci --prefix client
npm run mobile:doctor --prefix client
npm run mobile:build --prefix client
npm run mobile:sync --prefix client
npm run mobile:assets --prefix client
npm run mobile:verify --prefix client
npm run mobile:build:ios:unsigned --prefix client
npm run mobile:build:android:unsigned --prefix client
```

Los proyectos ya existen: no repetir `mobile:add:ios/android`. Para regenerarlos
en otro clon solo si faltan: esos scripts crean las plataformas, no las abren.
`mobile:assets` permite regenerar iconos; conserva los tres PNG de plantilla sin
uso en `.netlify/mobile-assets/scaffold-backup` en vez de dejarlos como warnings.

`mobile:verify` compara hashes de todos los archivos del build con las dos copias
nativas. No demuestra funcionamiento en un dispositivo. `mobile:doctor --network`
solo lee el health público con los orígenes nativos y no envía credenciales.

Las compilaciones usan hasta dos trabajos. Gradle se limita a 1536 MB y almacena
su caché en `.netlify/mobile-cache/gradle`; iOS usa DerivedData y paquetes SPM en
`.netlify`. No se instalan herramientas globales ni se selecciona otra Xcode.
JDK 21 y SDK Android 36 ya estaban instalados. Se conserva el lock SPM resuelto.

## Resultados técnicos

- Build iOS Release sin firma: pasado con Xcode 27.2 / SDK iPhoneOS 27.2. Nombre,
  bundle ID, versión 1.0.0/build 1, manifest y tres localizaciones comprobados en
  el `.app`. Los avisos de dispositivo genérico de Xcode no impidieron compilar.
- Bundle Android Release sin firma: compilado con JDK 21, Gradle 8.14.3 y API 36.
  El task `signReleaseBundle` de Gradle no prueba que el AAB esté firmado: verificar
  con `jarsigner`; no se configuró firma ni se creó un keystore de publicación.
- Los warnings `flatDir` y algunos avisos Java provienen de la plantilla/SDK de
  Capacitor; no se silenciaron ni se cambiaron dependencias de otros proyectos.
- Plists, proyecto Xcode y localizaciones: `plutil -lint`, pasado.
- Iconos y splash generados: 74 recursos Android y 7 iOS.
- Pruebas de adaptadores nativos con mocks; no GPS, compartir ni cuentas reales.

Validación final de esta entrega:

- `npm test --prefix client`: 112 pruebas aprobadas, 0 fallos, 0 omitidas.
  `client/test/nativePreparation.test.js` añade 8 pruebas de configuración,
  ubicación, permisos, compartir/cancelación, separación web/nativo y textos de tienda.
- `npm run lint --prefix client`: salida 0, con 17 advertencias existentes;
  no se ocultaron ni se corrigieron mediante cambios ajenos al alcance.
- `npm run i18n:audit --prefix client`: sin fallos; 173 claves públicas y 408
  entradas administrativas por idioma.
- Build web de producción y `mobile:build`/sincronización: aprobados.
- `npm run mobile:verify --prefix client`: 126 archivos comparados por hash
  entre el build y las dos plataformas; firma, envío y QA visual siguen en falso.
- `git diff --check`: aprobado. Sin cambios en `server` ni `netlify.toml`.
- `codesign -dv` confirma que el `.app` no está firmado (salida 1 esperada);
  `jarsigner -verify` indica que el AAB no está firmado.

Archivos afectados: configuración y dependencias de `client`, scripts de build,
adaptadores en `client/src/native`, integración mínima en App/ubicación/API/share/SW,
fuentes nativas iOS/Android, pruebas, README, ignores y borradores de `store`.
No se modificaron deliberadamente backend, configuración de producción, datos,
ranking, clasificación de confianza ni lógica comercial. No existe validación
visual o funcional en dispositivos en esta entrega.

Artefactos locales, excluidos de Git:

- iOS: `.netlify/mobile-build/ios/Build/Products/Release-iphoneos/App.app`.
- Android: `client/android/app/build/outputs/bundle/release/app-release.aab`.

No son una IPA firmada ni un AAB listo para subir. No se instalaron en dispositivos.

## Bloqueos para publicar — no marcar como resueltos por compilar

1. **CORS — desplegado y validado por HTTP**: el 24/11, con
   autorización de Mary, se actualizó únicamente `CORS_ORIGINS` del sitio Netlify
   `glutenfri` (`1bae5a51-3a69-429f-9d91-f2ed616b49d4`). El valor anterior era
   `glutenfri.netlify.app`, sin esquema, y no coincidía con un origen completo.
   El nuevo valor es
   `https://glutenfri.netlify.app,capacitor://localhost,https://localhost`.
   Se conservaron los scopes existentes; Netlify guardó el mismo valor en los
   contextos dev, branch-deploy, deploy-preview y production. La herramienta
   devolvió 422 pese a guardar los valores: una lectura posterior directa de
   esta única variable confirmó el resultado, sin repetir la escritura.
   No se usó `*`, cookies con credenciales, proxy ni bypass HTTP nativo.
   Tras autorización expresa de deploy se reconstruyó el SHA estable
   `327b07c78ba39c7c94d235246133c02875cde25a` en contexto production, sin incluir
   cambios locales móviles. Deploy `6b0614d90520b62b2fe85516`, publicado el
   24/11/2026 a las 22:51 UTC (Lisboa), estado ready.
   Los tres orígenes devuelven el `Access-Control-Allow-Origin` exacto en health
   HTTP 200 y preflight HTTP 204. CORS deja de ser un bloqueo; falta probar los
   recorridos completos en dispositivos reales. Ninguna base de datos ni secreto
   se modificó.
2. **Titularidad y firma**: confirmar Apple Developer y Play Console, entidad
   vendedora, propiedad del app ID, categoría, países, clasificación por edades,
   versión/build y contacto. No crear cuentas, pagar cuotas ni acceder al llavero
   sin autorización. Guardar certificados y keystores fuera del repositorio.
3. **Pruebas físicas**: navegación, teclado, permisos concedidos/denegados,
   ubicación aproximada, sin GPS, compartir/cancelar, enlaces externos, safe areas,
   red lenta/offline y reanudación. Revisar accesibilidad en VoiceOver/TalkBack y
   texto ampliado. No se abrieron Chrome, Xcode, Android Studio ni simuladores.
4. **Cuenta y datos**: el Perfil ya incluye exportación y eliminación con
   confirmación. Probar con cuentas desechables, nunca borrar una cuenta real de
   Mary. Validar específicamente la descarga Blob de exportación en WKWebView;
   si no funciona, requiere una implementación nativa antes del envío. La URL web
   de eliminación ya existe y ofrece el proceso y contacto manual.
5. **UGC/moderación**: hay reportes, administración y suspensión, pero no se
   encontró un bloqueo de autores desde el usuario ni un filtro preventivo de
   contenido objetable. Resolver y revisar el flujo y tiempos de respuesta antes
   de presentar la app como conforme con la guía 1.2. No se amplió aquí el backend.
6. **Privacidad/seguridad**: confirmar responsable y datos legales pendientes en
   `LEGAL_CONFIG`, base y retención, proveedores, transferencias y respuesta a
   derechos. El JWT sigue en el almacenamiento web existente: revisar el modelo
   de sesión y almacenamiento nativo antes de afirmar seguridad de publicación.
7. **Data safety/App Privacy/Health declarations**: revisión humana obligatoria.
   No copiar «sin datos» porque no hay anuncios. Examinar contenido de reseñas y
   reportes, posibles datos de salud aportados por usuarios, Google Places/Play
   Services, fuentes y mapas. Definir la declaración de salud pertinente sin
   presentar GlutenFri como consejo médico ni entidad certificadora.
8. **Creatividad y ficha**: aprobar icono, capturas de dispositivos reales, textos
   y accesos del equipo revisor. No se inventaron capturas ni usuarios de prueba.
9. **Revisión de tienda**: las funciones nativas y el catálogo no garantizan
   aceptación. Apple evalúa funcionalidad suficiente (4.2). Un empaquetado no es
   una aprobación, publicación, adopción ni conversión comercial.

## Inventario de datos — borrador para revisar, no formulario enviado

| Flujo | Datos/uso observado | Revisión pendiente |
| --- | --- | --- |
| Cuenta | Nombre, email, ID; autenticación y perfil | Sesión, retención y declaraciones de ambas tiendas |
| Guardados | Locales asociados a cuenta | Actividad/product interaction |
| Reseñas/reportes | Texto, valoración y autor; reportes | UGC, moderación y datos sensibles que puedan incluirse |
| Fichas comerciales | Rol, email, teléfono opcional y pruebas | Minimización, acceso y retención |
| Ubicación | Opcional y efímera; distancia/mapa local | SDK y proveedores cartográficos, incluido dato técnico |
| Proveedores | API/fotos, fuentes tipográficas, mapas | IP y tráfico técnico de Netlify, Google y OpenStreetMap |

El manifest nativo no sustituye App Privacy de Apple, Data safety de Google ni una
política de privacidad revisada. No hay ATT/IDFA, HealthKit, campañas ni pagos
activados en esta preparación. Las ofertas de PixelTrend siguen separadas de la
información, confianza, certificación y ranking del directorio.

## Fuentes oficiales consultadas

- [Capacitor — entorno](https://capacitorjs.com/docs/getting-started/environment-setup),
  [iOS](https://capacitorjs.com/docs/ios), [Android](https://capacitorjs.com/docs/android)
  y [configuración](https://capacitorjs.com/docs/config). Paquetes npm fijados a
  versiones estables, no a Capacitor 9 preliminar.
- [Ubicación](https://capacitorjs.com/docs/apis/geolocation),
  [App/back](https://capacitorjs.com/docs/apis/app),
  [Share](https://capacitorjs.com/docs/apis/share) e
  [iconos](https://capacitorjs.com/docs/guides/splash-screens-and-icons).
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/):
  revisar 1.2, 4.2, 5.1.1 y 5.1.5 para contenido de usuarios, funcionalidad,
  privacidad, cuenta y ubicación.
- [Apple — categorías del privacy manifest](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacycollecteddatatypes).
- [Google Play — target API](https://support.google.com/googleplay/android-developer/answer/11926878):
  nuevas apps de teléfono, API 36 desde el 31/08/2026.
- [Google Play — eliminación de cuenta](https://support.google.com/googleplay/android-developer/answer/13327111):
  recorrido dentro de la app y recurso web para solicitar eliminación.

## Límites de esta entrega

Trabajo solo en GlutenFri. Sin commit, push, merge, PR, deploy, publicación,
provisioning, certificados, migraciones, cambios de secretos ni escritura en BD.
No se modificaron backend, pagos, ranking orgánico, reseñas ni certificaciones.
Independencia de GlutenFri frente a APC/Biotrab preservada.

### Seguimiento CORS · 24/11/2026

Cambio de seguimiento limitado a la variable Netlify indicada, esta documentación
y `server/test/app.test.js`. El middleware existente ya admite una allowlist
exacta: no fue necesario modificar código de servidor, rutas o autenticación.
La prueba nueva cubre GET/preflight con Authorization y Content-Type para web,
iOS y Android, sin cookies, y rechaza seis orígenes ajenos o variantes inseguras.

- Pruebas HTTP afectadas: 9/9 aprobadas. Primer intento bloqueado por sandbox
  (`listen EPERM`); ejecución autorizada en loopback aprobada.
- `npm test --prefix server`, con `MONGODB_TEST_URI` vacía: 56 aprobadas,
  0 fallos, 1 integración Mongo omitida deliberadamente; sin conexión a BD real.
- `npm run lint --prefix client`: salida 0, 17 warnings existentes.
- `npm run i18n:audit --prefix client`: sin fallos.
- `node --check server/test/app.test.js` y `git diff --check`: aprobados.
- No se repitieron builds web/nativos: no cambió código de ejecución ni assets
  desde los builds aprobados de preparación móvil; no se verificó ningún nuevo
  artefacto de producción.
- Sin Chrome, commit, push, deploy, migraciones ni acciones en otros proyectos.

### Deploy CORS autorizado · 24/11/2026

- Build Netlify `6b0614d90520b62b2fe85514`, deploy
  `6b0614d90520b62b2fe85516`, contexto production, SHA fijado a `327b07c`.
  No se reconstruyó el HEAD de main (distinto del código que estaba publicado),
  ni se subieron las modificaciones locales pendientes.
- Comprobaciones HTTP en `https://glutenfri.netlify.app`: iOS
  `capacitor://localhost`, Android `https://localhost` y web
  `https://glutenfri.netlify.app` autorizados con origen exacto, sin cookies.
- GET `/api/health`: 200, Mongo connected, para los tres orígenes.
- OPTIONS `/api/establishments` (GET) y `/api/auth/login` (POST): 204 para
  los tres orígenes, con Authorization y Content-Type permitidos.
- Orígenes `https://other-project.example`, `https://localhost.evil.test` y
  `null`: sin autorización CORS tanto en GET como en OPTIONS.
- No se enviaron credenciales, no se hizo login ni se escribieron registros.
  No se abrieron Chrome, dispositivos, simuladores ni IDEs. No se modificaron
  otros proyectos. Sin commit, push, merge ni migraciones.
- Esta comprobación valida la política HTTP desplegada, no sustituye QA nativo
  de autenticación, ubicación, compartir o catálogo en dispositivos.
