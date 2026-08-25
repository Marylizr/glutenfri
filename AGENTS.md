# AGENTS.md — GlutenFri

## 1. Propósito del producto

GlutenFri es un producto digital independiente desarrollado por PixelTrend Studio para ayudar a las personas a descubrir establecimientos, restaurantes, tiendas y puntos de venta relacionados con opciones sin gluten.

GlutenFri también funciona como caso de estudio de PixelTrend Studio en:

- estrategia de producto;
- UX/UI;
- desarrollo frontend y backend;
- directorios y búsqueda local;
- mapas y fichas comerciales;
- accesibilidad;
- internacionalización;
- presencia digital y growth.

No presentar GlutenFri como una plataforma oficial de la Associação Portuguesa de Celíacos (APC), Biotrab, Gluten Free Map ni de ninguna entidad certificadora, salvo que exista una autorización escrita y documentada.

## 2. Principios no negociables

### 2.1 Independencia institucional

- GlutenFri no certifica establecimientos.
- GlutenFri no concede, modifica, suspende ni revoca certificaciones.
- No afirmar afiliación, validación, colaboración o respaldo de APC/Biotrab sin autorización escrita.
- No utilizar logotipos, distintivos o elementos gráficos oficiales de terceros sin autorización escrita.
- No presentar información pública de terceros como si hubiera sido validada directamente por GlutenFri.
- Las referencias a fuentes externas deben indicar claramente su origen y, cuando sea posible, incluir enlace y fecha de consulta.

### 2.2 Separación entre información y negocio

La clasificación, confianza, fuente y seguridad nunca pueden depender de un pago.

- Un negocio no puede pagar para obtener una certificación.
- Un negocio no puede pagar para convertirse en “seguro”.
- Contratar PixelTrend Studio no puede mejorar artificialmente una clasificación.
- El contenido patrocinado debe estar claramente etiquetado como “Patrocinado”.
- La publicidad nunca debe parecer una certificación.
- Un establecimiento que no contrate servicios comerciales conserva su ficha básica y su clasificación correcta.

### 2.3 Seguridad alimentaria y lenguaje

No prometer que un local es seguro basándose únicamente en una declaración, valoración o reseña.

Usar lenguaje preciso:

- “Información fornecida pelo estabelecimento”.
- “Fonte pública consultada”.
- “Informação da comunidade”.
- “Informação ainda não confirmada”.
- “Certificação atribuída por [entidad]”, únicamente si existe una fuente válida y autorizada.

Evitar:

- “Seguro” sin una fuente que lo justifique.
- “Certificado por GlutenFri”.
- “Aprovado pela APC” sin autorización.
- “Sem risco de contaminação cruzada”.
- Cualquier redacción que garantice la seguridad del consumo.

Las fichas deben recordar que el usuario debe confirmar directamente los ingredientes, protocolos y disponibilidad antes de consumir.

## 3. Modelo de confianza y procedencia

La aplicación debe distinguir, como mínimo, entre:

- `business_declared_gluten_free`: información declarada por el establecimiento.
- `specialized_gluten_free_business`: negocio especializado, sin implicar certificación.
- `point_of_sale`: punto de venta de productos relacionados.
- `community_information`: información aportada por usuarios.
- `source_verified`: fuente revisada por GlutenFri según un procedimiento documentado.
- `source_pending_review`: fuente pendiente de revisión.
- `source_outdated`: información que requiere actualización.
- `closed_or_removed`: local cerrado, retirado o no disponible.
- `external_certification`: certificación de una entidad externa, solo cuando la fuente y la autorización sean válidas.

No asumir que todos los establecimientos de una lista externa pertenecen a la misma categoría. Una fuente puede incluir certificados, puntos de venta, descuentos u otros registros.

Cada dato institucional o externo debe poder asociarse, cuando exista, a:

- entidad emisora o fuente;
- URL de origen;
- fecha de consulta;
- fecha de última verificación;
- estado de vigencia;
- responsable de la revisión;
- historial de cambios.

Nunca inventar fechas, estados, fuentes o enlaces.

## 4. Relación con APC/Biotrab

Mientras no exista autorización escrita:

- no utilizar el badge “Certificado APC/Biotrab” como badge propio;
- no mostrar logotipos oficiales;
- no afirmar que GlutenFri está integrada con APC/Biotrab;
- no presentar el directorio de GlutenFri como directorio oficial de APC;
- no usar la credibilidad de APC como argumento comercial para PixelTrend.

Si se conserva una referencia a una fuente pública, debe mostrarse de forma neutral, por ejemplo:

> Fonte pública consultada: Associação Portuguesa de Celíacos (APC).

La fuente no debe convertirse automáticamente en una certificación visible.

Si en el futuro existe un acuerdo institucional, debe implementarse mediante una fuente y categoría explícitas, con procedimiento para altas, renovaciones, suspensiones y revocaciones.

## 5. Arquitectura comercial

GlutenFri puede monetizarse sin comprometer la neutralidad del producto.

### Funciones comerciales permitidas

- Reclamar una ficha.
- Corregir datos básicos.
- Añadir menú, fotografías y enlaces.
- Gestionar horarios y servicios.
- Perfil comercial ampliado.
- Reservas y contacto.
- Estadísticas de perfil.
- Contenido patrocinado claramente identificado.

### Servicios de PixelTrend Studio

PixelTrend puede ofrecer, de forma independiente:

- websites;
- branding;
- UX/UI;
- SEO local;
- menús digitales;
- reservas;
- automatizaciones;
- analítica;
- campañas y growth;
- desarrollo de productos digitales.

La contratación de PixelTrend nunca puede modificar una categoría institucional ni una clasificación de confianza.

No implementar pagos reales, suscripciones comerciales o campañas automatizadas sin una especificación aprobada para esa fase.

## 6. Reglas de reclamación de fichas

Un establecimiento puede solicitar la gestión de su ficha, pero no puede:

- autodeclararse certificado;
- cambiar la fuente institucional;
- modificar vigencia o estado de una certificación externa;
- eliminar información comunitaria legítima sin revisión;
- pagar para ocultar información relevante;
- alterar el nivel de confianza.

Los cambios institucionales requieren revisión administrativa y registro de:

- actor;
- rol;
- fecha;
- campo anterior;
- campo nuevo;
- motivo;
- fuente utilizada.

## 7. UX/UI y diseño

### 7.1 Objetivo de experiencia

La interfaz debe permitir que una persona entienda rápidamente:

1. qué tipo de local está viendo;
2. de dónde procede la información;
3. cuándo fue actualizada;
4. qué puede y qué no puede inferir;
5. cómo contactar o llegar al establecimiento.

### 7.2 Principios visuales

- Diseño claro, editorial y confiable.
- Jerarquía visual fuerte.
- Nada de badges que parezcan certificaciones oficiales si no lo son.
- Color no debe ser el único indicador de estado.
- Etiquetas legibles en móvil.
- Evitar tarjetas saturadas.
- No mostrar porcentajes de descuentos aislados como si fueran ratings.
- Separar visualmente información, publicidad y patrocinio.
- Mantener consistencia entre lista, mapa y ficha.
- Utilizar componentes reutilizables y tokens existentes.
- No cambiar toda la identidad visual sin una fase explícita de rediseño.

### 7.3 Recorridos prioritarios

Todo cambio debe considerar estos recorridos:

- descubrir un local por ciudad;
- buscar por nombre;
- filtrar por tipo de información;
- abrir una ficha;
- entender la fuente;
- llamar o abrir indicaciones;
- guardar y compartir;
- reportar información desactualizada;
- reclamar una ficha;
- solicitar servicios digitales.

## 8. Internacionalización

Idiomas soportados:

- `pt-PT` — idioma predeterminado;
- `es` — español internacional;
- `en` — inglés natural y consistente.

Reglas:

- Nunca usar portugués de Brasil.
- Usar “utilizador”, “telemóvel”, “ficheiro”, “palavra-passe” e “iniciar sessão” cuando corresponda.
- No traducir nombres propios, direcciones, teléfonos, emails, URLs ni contenido de establecimientos.
- No añadir textos directamente en JSX/TSX si deben traducirse.
- Mantener interpolaciones idénticas en los tres idiomas.
- No concatenar fragmentos traducidos para construir frases.
- No dejar claves i18n visibles.
- Actualizar correctamente `<html lang>`.

## 9. Accesibilidad y responsive

Cada cambio visible debe comprobar:

- navegación por teclado;
- foco visible;
- nombres accesibles de botones e iconos;
- `aria-label`, `aria-description`, `alt` y `title`;
- contraste suficiente;
- estados que no dependan únicamente del color;
- textos ampliables sin romper el layout;
- modales utilizables en móvil;
- ausencia de scroll horizontal;
- safe areas en dispositivos móviles;
- filtros y formularios accesibles.

Viewports prioritarios:

- 375 × 812;
- 430 × 932;
- 768 × 1024;
- 1440 × 900.

No afirmar validación visual si no se utilizó un navegador o herramienta visual real.

## 10. Procedimiento obligatorio antes de modificar código

Antes de cualquier cambio:

1. Leer `AGENTS.md` y las instrucciones del repositorio.
2. Ejecutar `git status --short`.
3. Identificar el stack y los scripts reales.
4. Localizar componentes, servicios, modelos, rutas y traducciones afectados.
5. Revisar pruebas relacionadas.
6. Explicar el plan de la fase.
7. No modificar archivos fuera del alcance.

No hacer refactorizaciones masivas, cambios de rutas, migraciones o cambios de modelo no relacionados sin aprobación explícita.

## 11. Desarrollo por fases

### Fase 0 — Auditoría

- Inventariar arquitectura.
- Localizar referencias institucionales.
- Revisar categorías y fuentes.
- Identificar datos potencialmente mal clasificados.
- Documentar riesgos.

### Fase 1 — Reposicionamiento independiente

- Retirar badges y logos no autorizados.
- Actualizar homepage, footer, SEO, términos y página del proyecto.
- Explicar independencia de GlutenFri.
- Presentar PixelTrend como desarrollador.

### Fase 2 — Modelo de procedencia

- Separar categorías.
- Separar fuente, confianza y patrocinio.
- Añadir fecha y enlace de origen.
- Impedir autocertificación.

### Fase 3 — Producto público

- Mejorar homepage.
- Mejorar búsqueda, filtros, mapa y fichas.
- Añadir reportes de información desactualizada.
- Mantener una experiencia útil sin depender de APC.

### Fase 4 — Fichas comerciales

- Reclamar ficha.
- Editar datos básicos.
- Añadir fotografías, menú y enlaces.
- Preparar perfiles gestionados y patrocinados.
- Mantener intactos los campos de confianza.

### Fase 5 — Servicios PixelTrend

- Página de servicios.
- Solicitud de diagnóstico digital.
- CTA para websites, branding, SEO, reservas y growth.
- Separación visual y legal entre GlutenFri y PixelTrend.

### Fase 6 — Administración y calidad de datos

- Moderación.
- Historial de cambios.
- Reportes.
- Duplicados.
- Locales cerrados.
- Fuentes y revisiones.

### Fase 7 — Internacionalización y QA

- PT-PT, ES y EN.
- Accesibilidad.
- Responsive.
- SEO.
- Tests.
- Validación visual real.

### Fase 8 — Monetización

Solo después de validar el producto:

- planes comerciales;
- patrocinio;
- pagos;
- analítica comercial;
- facturación;
- campañas.

No mezclar la monetización con certificaciones o niveles de confianza.

### Fase 9 — Integraciones institucionales futuras

Solo si existe acuerdo escrito:

- fuente institucional específica;
- importación controlada;
- panel de revisión;
- vigencias;
- revocaciones;
- historial;
- reglas de uso de marca;
- responsabilidades de cada entidad.

No asumir que una colaboración será aprobada ni construir integraciones institucionales antes de conocer sus requisitos.

## 12. Calidad técnica

Después de cada fase ejecutar los comandos reales del proyecto:

- auditoría i18n;
- lint;
- tests afectados;
- suite completa cuando corresponda;
- build de producción;
- typecheck si existe;
- `git diff --check`;
- `git status --short`.

Si un comando falla:

- investigar la causa;
- distinguir fallos nuevos de preexistentes;
- corregir únicamente los fallos introducidos por la fase;
- no ocultar warnings ni reducir aserciones;
- no afirmar que una validación pasó si no pudo ejecutarse.

## 13. Seguridad y datos

- No escribir en producción sin autorización explícita.
- No ejecutar migraciones contra bases reales durante una fase de diseño.
- No usar Atlas ni credenciales reales para pruebas locales.
- No recopilar IP, User-Agent o datos personales innecesarios.
- Aplicar minimización de datos y GDPR.
- No enviar emails, leads o campañas automáticamente sin aprobación.
- No compartir la base de establecimientos con PixelTrend para campañas indiscriminadas.
- No introducir secretos en el repositorio.

## 14. Entrega obligatoria de cada fase

Codex debe entregar:

1. Objetivo de la fase.
2. Archivos modificados.
3. Archivos no modificados deliberadamente.
4. Decisiones de producto.
5. Tests añadidos o modificados.
6. Comandos ejecutados y resultado exacto.
7. Problemas pendientes.
8. Riesgos que requieren decisión humana.
9. Confirmación de que no se hizo commit, push, PR, deploy ni migración, salvo solicitud explícita.
10. Confirmación de que se respetó la independencia de GlutenFri respecto a APC/Biotrab.

## 15. Regla final

Si una solicitud puede hacer que GlutenFri parezca una entidad certificadora, una plataforma oficial de APC/Biotrab o un canal comercial encubierto, detenerse y pedir una decisión explícita antes de implementarla.
