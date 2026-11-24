# Roboto, color y entrada secuencial · 24/11/2026

## Resultado

Roboto para toda la interfaz: titulares en 600 (SemiBold), cuerpo en 400 (normal). Los pesos de énfasis de controles y etiquetas se conservan. Los tokens públicos y las excepciones de administración y mapa usan la misma familia. El logotipo y los iconos se conservan.

El acento cálido es #7D2E1B, centralizado en --color-brand y reutilizado en los anteriores textos, botones, indicadores y focos terracota. Se conservan el verde, los fondos claros y los estados semánticos. Contraste calculado: blanco sobre el nuevo acento 9,22:1; acento sobre crema #FFFBED, 8,90:1.

## Decisiones de movimiento

Se aplicó la guía emil-design-eng para una entrada ocasional de portada, sin bucles ni bloqueo de botones. Animación CSS sin librerías nuevas: entrada de titulares con desplazamiento y opacidad; caída de cada beneficio; dibujo SVG de su check únicamente después del aterrizaje. La siguiente caída espera a que termine el check anterior. No es una edición de vídeo.

| Elemento | Entrada / caída | Dibujo del check |
| --- | --- | --- |
| Primer bloque del titular | 0,08–0,70 s | — |
| Acento del titular | 0,28–0,90 s | — |
| Beneficio 1 | 1,10–1,46 s | 1,46–1,68 s |
| Beneficio 2 | 1,78–2,14 s | 2,14–2,36 s |
| Beneficio 3 | 2,46–2,82 s | 2,82–3,04 s |

Con prefers-reduced-motion: reduce, titulares y beneficios aparecen directamente y los checks están completos. Esta alternativa se verificó mediante código y pruebas; no se emuló la preferencia del sistema en navegador.

## Archivos de esta tarea

- client/index.html: sustituir la carga de Fraunces/Inter por Roboto, manteniendo el proveedor Google Fonts ya utilizado.
- client/src/styles/tokens.css: familia tipográfica y acento cálido.
- client/src/index.css: pesos globales, mapa, color y coreografía de portada.
- client/src/admin/admin.css: eliminar excepciones Georgia/Inter, titulares 600 y nuevo acento.
- client/src/pages/OnboardingScreen.jsx: bloques animables del titular, índice de secuencia y checks SVG decorativos.
- client/test/brandMotion.test.js: tres pruebas de estilos globales, orden temporal y renderizado SSR.
- Este informe y docs/qa/2026-11-24/roboto-motion-{375,430,768,1440}.jpg.

Se preservaron los cambios anteriores del repositorio. No se cambiaron traducciones, textos comerciales, imágenes, hamburguesa, rutas, dependencias, lógica comercial, autenticación, modelos, confianza, certificación, ranking o reseñas.

## Verificación real

Chrome, build local en http://127.0.0.1:4189/. Roboto cargada mediante document.fonts.check para pesos 400 y 600; estilos computados del cuerpo 400 y h1 600. Color computado rgb(125,46,27).

Portada revisada a 375×812, 430×932, 768×1024 y 1440×900: scrollWidth igual al ancho del viewport; capturas guardadas. PT-PT, ES y EN revisados en portada; navegación por Tab comprobada. La sección de servicios también presenta h1/h2/h3 en Roboto 600. El acceso /admin sin sesión redirige a Perfil; no se afirma QA visual del panel autenticado. Los estilos administrativos sí se actualizaron y están cubiertos por prueba.

Muestreo de estilos durante 3,3 segundos tras recargar: titulares visibles antes del primer beneficio; caída y check separados; ningún beneficio inicia su entrada antes de que el check anterior esté completo; los tres terminan visibles con stroke-dashoffset: 0.

Node 24.22.3:

- Cliente npm test -- --test-reporter=spec: 89 correctos, 0 fallidos.
- npm run lint: exit 0, 17 advertencias existentes, ninguna en los archivos de esta tarea.
- npm run i18n:audit: exit 0, sin fallos en pt-PT/es/en, 162 claves por idioma.
- npm run build: exit 0.
- git diff --check: exit 0.
- git status --short: revisado; cambios previos preservados.

La prueba SSR nueva inicialmente necesitó un mock de localStorage, coherente con las pruebas existentes; se corrigió el entorno de prueba sin alterar la aplicación. No hay script typecheck en el cliente. No se ejecutaron tests del servidor porque no se modificó backend.

## Límites

No se hizo commit, push, PR, deploy, migración, acceso a Atlas ni escritura en datos reales. El incidente previo del directorio queda fuera de este cambio visual y no se considera resuelto. No se realizó una auditoría completa de todos los flujos autenticados. La aprobación estética final corresponde a Mary.

Se mantiene la independencia de GlutenFri respecto a APC/Biotrab y la separación respecto a los servicios de PixelTrend Studio.
