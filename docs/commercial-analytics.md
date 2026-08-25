# Eventos comerciales internos

Este contrato describe instrumentación preparada para QA y para una futura
analítica interna. La implementación actual es local al navegador: no envía
eventos a terceros, no persiste formularios y no activa campañas, pagos ni
patrocinios.

## Esquema mínimo

Cada evento contiene únicamente:

- `type`: uno de los valores listados a continuación;
- `establishmentId`: identificador opcional de la ficha cuando el recorrido lo
  necesita;
- `source`: `organic` o `sponsored`;
- `occurredAt`: fecha ISO del navegador.

Nunca incluir IP, user-agent, email, teléfono, nombre, contenido de formularios
ni datos de confianza, certificación o procedencia.

## Eventos

| Evento | Momento |
| --- | --- |
| `business_claim_started` | La persona abre la reclamación de una ficha. |
| `business_claim_submitted` | La reclamación se guarda para revisión. |
| `commercial_profile_viewed` | Se abre una ficha con contenido comercial. |
| `commercial_cta_clicked` | Se pulsa el CTA hacia los servicios digitales. |
| `services_page_viewed` | Se abre la página de servicios digitales. |
| `digital_diagnosis_clicked` | Se pulsa el CTA para preparar el diagnóstico local. |
| `digital_diagnosis_requested` | Se prepara localmente un diagnóstico digital. |
| `service_selected` | Se selecciona un servicio de interés, sin guardar su valor. |
| `commercial_request_submitted` | Se valida el formulario comercial de forma local. |
| `sponsored_content_viewed` | Se visualiza contenido marcado como patrocinado vigente. |
| `sponsored_content_clicked` | Se pulsa una acción comercial de contenido patrocinado vigente. |

Los estados comerciales y de patrocinio se mantienen separados de categoría,
fuente, confianza, certificación, reseñas y orden orgánico. Cualquier envío,
agregación, proveedor analítico o activación comercial futura requiere una
especificación y revisión de privacidad separadas.
