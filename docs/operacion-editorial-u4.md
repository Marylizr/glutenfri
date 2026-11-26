# U4 — Operación editorial de GlutenFri

26/11/2026. Procedimiento y herramientas locales. **No se han revisado negocios
reales, contactado establecimientos ni publicado correcciones.**

## Responsabilidades y alcance

- El responsable editorial del piloto debe designarse antes de iniciarlo. No se
  asume que Mary u otra persona pueda atender una cola permanentemente.
- La cuenta administrativa que guarda una revisión queda registrada como actor;
  `qualityReviewedBy` y `sourceReviewedBy` identifican revisiones realizadas, no
  constituyen una asignación futura ni una acreditación profesional.
- Porto continúa como propuesta de profundidad editorial. La app mantiene su
  cobertura nacional; no se ha aprobado ni completado un piloto de 30–50 fichas.

## Cola y criterio de prioridad

Calidad de datos → Fuentes conserva sus filtros y el historial existentes.
Ahora ordena primero reportes pendientes, cierres, revisiones vencidas, revisiones
sin fecha y ausencia de datos esenciales. Este orden es exclusivamente interno:
no cambia el ranking público ni utiliza pago, patrocinio o contratación comercial.
La carga recorre las páginas del catálogo administrativo: límite preventivo de
20 páginas de 100. Si se supera o el contrato cambia, falla explícitamente, sin
presentar las primeras 100 como el catálogo completo. Los reportes y duplicados
conservan los límites y controles de sus endpoints existentes.

Regla de triaje de QA: falta oferta, ciudad, teléfono, nombre de fuente o enlace;
señal de antigüedad a los 180 días, o antes si `nextReviewDueAt` vence. Esto propone
una revisión: **no convierte automáticamente la ficha en falsa, cerrada o insegura**.

## Recorrido por ficha

1. Revisar reporte, ficha original y su historial antes de modificar nada.
2. Anotar dato, fuente, URL, fecha de consulta real y alcance de la evidencia.
   Una foto o una reseña no demuestra los protocolos actuales del negocio.
3. Distinguir actualización comercial, consulta de fuente y certificación externa.
   No rellenar una fecha histórica a partir de `updatedAt` ni de la fecha de hoy.
4. Si falta evidencia, conservar ausencia explícita y estado pendiente. Marcar
   una fuente revisada exige nombre y enlace; no garantiza el consumo.
5. Guardar con motivo concreto y la próxima revisión editorial. La fecha del
   formulario vence al final del día UTC y puede retirarse; se audita su cambio.
6. Revisar duplicados comparando identidad, dirección y coordenadas. No fusionar,
   borrar, cerrar u ocultar en masa. El cierre exige decisión administrativa.
7. Un negocio propone cambios comerciales por el flujo de reclamación existente;
   no puede editar procedencia, confianza o certificación externa.

Cadencia inicial propuesta: revisar datos cambiantes en 90 días; incidencias
abiertas antes que revisiones rutinarias. Objetivo operativo propuesto: triaje en
dos días laborables, urgencias cuando haya una persona responsable disponible.
No es un SLA publicado, ni se han activado avisos, tareas programadas o emails.

## Piloto real pendiente de autorización

Antes de leer el catálogo real, seleccionar fichas o contactar negocios se necesita
autorización específica. Registrar por ficha: identificador, responsable asignado,
campos pendientes, evidencia real, decisión, motivo y próxima revisión.
Revisar completitud de oferta, ciudad, coordenadas, contacto, menú, horarios,
procedencia y fechas; lo desconocido no equivale a «no».

Las 25 fixtures de U0 son únicamente material sintético de QA. No son 25 negocios
verificados, y no se importan en Atlas. GlutenFri sigue siendo independiente de
APC/Biotrab y no certifica establecimientos.
