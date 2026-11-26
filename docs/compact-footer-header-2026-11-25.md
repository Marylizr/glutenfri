# Pie y cabecera compactos · 25/11/2026

Objetivo: juntar los enlaces del pie y colocar el icono de ubicación y Portugal
junto al logo global, eliminando su fila independiente sobre los títulos.

## Cambios limitados

- `client/src/components/DesktopHeader.jsx`: agrupa logo y región; icono decorativo.
- `client/src/components/PublicPageHeader.jsx`: elimina la fila duplicada de región.
- `client/src/styles/glass.css`: enlaces inline con separación de 10px y altura
  mínima de 24px, sin columnas repartidas; padding de 12px, logo pequeño y crédito
  inline. Conserva foco, enlaces legales, cookies y el aviso de independencia.
- `client/test/responsiveLayout.test.js` y `client/test/trustAndLocalization.test.js`:
  comprueban la composición compacta y que Portugal esté solo en la cabecera global.

La guía emil-design-eng orientó el ajuste de espacios y legibilidad, sin añadir
animaciones ni dependencias. No se cambiaron textos traducidos, navegación,
backend, datos, certificaciones, permisos, icono de instalación ni firma nativa.
Se conservaron todos los cambios previos de preparación móvil.

## Validación

Node 24, comandos desde la raíz:

- `npm test --prefix client`: 118 aprobados, 0 fallos, 0 omitidos, salida 0.
  El primer intento restringido no permitía los servidores de test; se repitió
  con permiso para localhost y pasó la suite completa.
- `npm run lint --prefix client`: salida 0; avisos preexistentes, sin silenciarlos.
- `npm run i18n:audit --prefix client`: sin fallos; 173 claves públicas y 408 hojas
  administrativas por idioma.
- `npm run build --prefix client`: salida 0.
- `git diff --check`: salida 0.

Validación visual real del build local en navegador integrado, sin Chrome,
en `/guardados` sin sesión. Se comprobaron PT, ES y EN, logo/región, wrapping
de enlaces y apertura/cierre del aviso mediante el botón del pie.

Dimensiones CSS efectivamente medidas (el zoom del navegador integrado afectaba
a la correspondencia entre el tamaño solicitado y el real):

| Ventana real | Altura del pie | Ancho del documento |
| --- | --- | --- |
| 375 × 812, PT | 202px | 375px |
| 430 × 931, ES | 202px | 430px |
| 769 × 1024, EN | 147px | 769px |
| 1440 × 900, EN | 123px | 1440px |

Sin scroll horizontal en las vistas observadas. No se afirma prueba física ni
validación exacta a 430 × 932 o 768 × 1024. No se ha vuelto a compilar, instalar
ni subir el paquete nativo: el build ya instalado de TestFlight no cambia.
Pendiente de autorización una nueva distribución si se desea verlo allí.

Sin commit, push, PR, deploy, migraciones ni cambios en otros proyectos.
Se mantiene la independencia respecto a APC/Biotrab.
