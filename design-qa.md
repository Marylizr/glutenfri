# Design QA — Backoffice administrativo

- Source visual truth: `client/design-references/admin-dashboard-reference.png`
- Source dimensions: 1487 × 1058 px
- Intended implementation viewport: 1440 × 1024 CSS px, device scale factor 1
- Implementation route: `/admin`
- State: authenticated administrator, dashboard/resumen
- Implementation screenshot: unavailable
- Browser-rendered evidence: unavailable
- Primary interactions tested in browser: unavailable
- Browser console checked: unavailable

## Findings

- [P0] Browser-rendered comparison is unavailable
  - Location: complete `/admin` dashboard.
  - Evidence: the in-app browser runtime returned no available browser surfaces.
  - Impact: typography, spacing, overflow, icon alignment and responsive behavior cannot be truthfully compared against the selected visual.
  - Fix: connect an in-app browser, open the local frontend at the dashboard route with an authenticated administrator, capture at 1440 × 1024, and run the full comparison.

## Required fidelity surfaces

- Fonts and typography: blocked pending rendered capture.
- Spacing and layout rhythm: blocked pending rendered capture.
- Colors and visual tokens: source palette was implemented in `client/src/admin/admin.css`; visual comparison remains blocked.
- Image quality and asset fidelity: the selected dashboard contains no photographic assets; standard UI icons use Phosphor Icons. Rendered verification remains blocked.
- Copy and content: implemented in Spanish with realistic live API data; visual wrapping and truncation remain blocked.

## Full-view comparison evidence

Blocked: source visual is available, but no implementation screenshot could be captured.

## Focused region comparison evidence

Blocked for the same reason. Required regions when a browser becomes available:

1. Sidebar + topbar.
2. KPI row.
3. Moderation table.
4. System status + recent activity column.

## Comparison history

- Initial pass: blocked before comparison because no browser surface was available.

## Implementation checklist

1. Connect the in-app browser.
2. Authenticate an administrator and open `/admin`.
3. Capture the 1440 × 1024 dashboard.
4. Compare source and implementation together.
5. Fix all P0/P1/P2 findings and repeat.

## Follow-up polish

None classified until the first rendered comparison is possible.

final result: blocked

---

# Design QA — Sección Mapa

- Source visual truth: captura de la sección Mapa adjunta en la conversación (ruta local no expuesta)
- Source dimensions: 970 × 1660 px
- Intended implementation viewport: viewport móvil responsive equivalente
- Implementation route: `/mapa`
- State: listado cargado, filtros sin seleccionar
- Implementation screenshot: unavailable
- Browser-rendered evidence: unavailable
- Primary interactions tested in browser: unavailable
- Browser console checked: unavailable

## Findings

- [P0] No hay una superficie de navegador disponible para la comparación visual
  - Location: cabecera, filtros, mapa y primer resultado de `/mapa`.
  - Evidence: el runtime del navegador integrado devolvió una lista vacía de superficies disponibles.
  - Impact: no se puede confirmar visualmente el ajuste responsive, el desplazamiento horizontal de filtros ni la alineación del mapa.
  - Fix: abrir la vista previa local cuando el navegador integrado esté disponible y capturar `/mapa` en el mismo estado y proporción que la referencia.

## Required fidelity surfaces

- Fonts and typography: se reutilizan Fraunces e Inter del sistema existente; validación visual bloqueada.
- Spacing and layout rhythm: se implementaron cabecera, chips, tarjeta de mapa y lista; validación visual bloqueada.
- Colors and visual tokens: se reutilizan los tokens existentes de superficie, borde, texto y acento; validación visual bloqueada.
- Image quality and asset fidelity: se reutilizan el logo oficial, Leaflet/OpenStreetMap y las imágenes reales/fallback existentes; validación visual bloqueada.
- Copy and content: se mantiene la traducción activa y los nombres actuales de filtros; validación de wrapping bloqueada.

## Full-view comparison evidence

Blocked: la referencia está disponible en la conversación, pero no fue posible capturar la implementación.

## Focused region comparison evidence

Blocked. La siguiente revisión debe comprobar:

1. Logo, región y título.
2. Selector de categoría y chips de certificación/descuento.
3. Bordes, controles y atribución del mapa.
4. Transición entre mapa y tarjetas.

## Comparison history

- Initial pass: blocked antes de la comparación porque no había navegador integrado disponible.

## Implementation checklist

1. Abrir `/mapa` en la vista previa local.
2. Verificar activación y desactivación de los dos chips.
3. Verificar el selector de categorías.
4. Comprobar que la atribución de Leaflet no desborda.
5. Capturar y comparar con la referencia.

final result: blocked
