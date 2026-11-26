# U6 — Candidato local y puertas de publicación

26/11/2026. Estado: **candidato local no publicado; NO listo para declarar envío
a tiendas**. La revisión técnica no sustituye pruebas físicas ni revisión humana.

## Cambios del candidato

- Fichas con información práctica y desconocidos explícitos; fechas separadas.
- Intenciones comer, pan/pastelería y productos; estado URL común a lista/mapa.
- Apertura con horarios especiales y días desconocidos tratados sin inferir cierre.
- Cola editorial priorizada y fecha futura de revisión auditada.
- Bloqueo privado y reversible de autores en comunidad y ficha. No afecta las
  reseñas visibles para otras personas ni las utiliza para modificar confianza.
- Todos los comentarios escritos y fotos nuevos se retienen para moderación.
  Reglas auxiliares marcan lenguaje ofensivo, enlaces y posibles datos personales;
  no se afirma que una lista de palabras detecte todo contenido dañino.
- Moderación administrativa existente aprueba u oculta y registra actor/motivo.
  La aprobación compara la versión revisada: si el texto cambió, exige recargar
  en lugar de publicar contenido que el moderador no ha visto.
  Las señales agregadas solo usan reseñas públicas; ocultar/restaurar y eliminar
  una cuenta recalcula dichas señales. Un bloqueo individual no altera promedios.
- Identidades de denunciantes y marcas internas no aparecen en respuestas públicas.
  Perfil permite desbloquear y exporta la lista privada de bloqueos propia.

## Política operativa antes de ampliar comunidad

Designar moderador y suplente, horario de atención y contacto de soporte real.
Documentar criterio para amenazas, odio, acoso, spam, datos personales y fotografías
no autorizadas, así como recurso de una decisión. El autor puede ver su contenido
retenido; editarlo no levanta una ocultación previa. No se han enviado avisos ni
se ha suspendido o bloqueado ninguna cuenta real durante esta tarea.

La premoderación se aplica a nuevos envíos cuando se publique el código; no revisa
retroactivamente todo lo publicado. Auditar el contenido existente requiere permiso
para lectura y un trabajo editorial separado. No se ha ejecutado un backfill.

## Puertas pendientes obligatorias

- [ ] Autorizar QA de dispositivos y disponer de iPhone y Android físicos.
- [ ] Backend QA accesible desde esos dispositivos, con cuentas sintéticas y sin
  escrituras a la API pública. Los paquetes móviles normales apuntan a producción.
- [ ] Probar sesión, permisos rechazados, teclado, texto ampliado, safe areas,
  guardado, compartir, atrás y regreso desde teléfono/mapas en ambas plataformas.
- [ ] Probar bloqueo/desbloqueo y moderación desde la interfaz autenticada real.
  Las pruebas HTTP locales no sustituyen este recorrido visual.
- [ ] Ejecutar el piloto editorial real y el estudio U5 si se quieren afirmar sus resultados.
- [ ] Decidir proveedor/remitente de recuperación y validar entrega real con
  autorización; el transporte de recuperación continúa desactivado en producción.
- [ ] Revisar con responsable humano privacidad, moderación, condiciones y fichas
  de privacidad de ambas tiendas; no se declara cumplimiento jurídico o aprobación.
- [ ] Nuevo icono oficial y metadatos/capturas de tienda, con aprobación visual.
  El icono anterior no se cambió dentro de esta iteración de utilidad.
- [ ] Autorizar por separado commit, push, firma, subida TestFlight/Play y deploy.

## Recuperación y rollback

No hay un release público nuevo que revertir. No ejecutar `git reset`, restaurar
el árbol o borrar trabajo para deshacer esta iteración: el checkout contiene
cambios anteriores de Mary. Identificar y revisar un diff autorizado antes de
preparar una entrega Git.

En una publicación futura: registrar SHA, manifiesto de assets, identificadores
de deploy y build nativo exactos. Una reversión web no revierte una app instalada;
un arreglo nativo necesita otro build. Los campos aditivos no requieren migración
ejecutada aquí; cualquier índice, backfill o cambio de datos reales debe aprobarse
por separado. No rotar el secreto JWT global ni restablecer cuentas para un rollback.

## Decisión

No activar pagos, campañas, integraciones institucionales ni promesas de seguridad.
GlutenFri es independiente de APC/Biotrab. La ficha y la fuente ayudan a decidir
qué confirmar; no garantizan los ingredientes ni los protocolos de un local.
