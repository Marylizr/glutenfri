# Ajuste de hamburguesa y etiqueta · 24/11/2026

## Objetivo y cambios

Corregir el hueco entre queso y carne al terminar el montaje y centrar la etiqueta respecto a la ilustración. Cambios limitados a `client/src/components/HamburgerAssembly.jsx`, nueva prueba `client/test/hamburgerAssembly.test.js`, este informe y capturas `docs/qa/2026-11-24/burger-*.jpg`.

| Antes | Después | Motivo |
| --- | --- | --- |
| Bloque superior con queso en y=118 | Queso, tomate, rúcula y pan superior 10 unidades SVG más abajo | Cerrar el hueco manteniendo el encaje interno de las cuatro capas |
| Etiqueta con left:7% | left:50% y translate:-50% 0 | Centrado independiente del transform animado |
| Texto forzado a una línea | Ancho limitado al contenedor y texto centrado con salto cuando hace falta | Evitar desbordamiento en tableta y traducciones largas |

Se aplicó la guía emil-design-eng: conservar la animación CSS de entrada ocasional, separar el centrado del transform animado y mantener la alternativa de movimiento reducido. No se modificaron recursos gráficos, tiempos, secuencia de entrada, textos, traducciones, navegación, dependencias o servidor. Se preservaron los cambios previos del repositorio. No es una producción ni modificación de vídeo.

## Verificación

- Navegador real Chrome, build local en http://127.0.0.1:4189/, sin necesitar MongoDB.
- 375×812, 430×932, 768×1024 y 1440×900: sin scroll horizontal; etiqueta dentro del viewport; diferencia entre el centro de la etiqueta y el contenedor de la ilustración de 0 a 0,004 píxeles.
- Capturas de composición final en los cuatro tamaños; revisión visual de queso sobre carne. Captura adicional del inicio y lectura de estilos durante el montaje: capas con retrasos de 0 a 0,6 segundos, desplazamiento inicial y opacidad progresiva conservados.
- Movimiento reducido: regla CSS preservada y cubierta por pruebas estáticas; no se emuló esa preferencia en navegador.
- Prueba nueva de renderizado SSR: posiciones finales de las ocho imágenes, orden de pintura, nombre accesible y reglas de centrado independiente de transform.
- Node 24.22.3, cliente `npm test -- --test-reporter=spec`: 86 correctos, 0 fallidos.
- `npm run lint`: exit 0, 17 advertencias existentes fuera del componente modificado.
- `npm run i18n:audit`: exit 0, sin fallos, 162 claves por idioma.
- `npm run build`: exit 0.
- `git diff --check`: exit 0.
- No se ejecutaron tests del servidor: no se modificó backend. No existe script typecheck en el cliente.

## Límites y pendientes

No se validó producción ni se intervino en el incidente previo de conexión del directorio: este ajuste es exclusivamente visual y local. No se hicieron commit, push, PR, deploy, migraciones ni escrituras en bases de datos. No hay decisiones humanas pendientes para este ajuste. La aprobación estética final corresponde a Mary.

Se mantiene la independencia de GlutenFri respecto a APC/Biotrab; no se modificaron certificaciones, confianza, fuentes, ranking, reseñas ni servicios comerciales.
