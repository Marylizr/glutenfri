// Esquema local para QA y futura instrumentación interna. No transmite ni
// persiste datos: excluye deliberadamente IP, user-agent, email y contenido
// de formularios. Cualquier proveedor o activación futura requerirá revisión.
export const COMMERCIAL_ANALYTICS_EVENTS = Object.freeze([
  'business_claim_started',
  'business_claim_submitted',
  'commercial_profile_viewed',
  'commercial_cta_clicked',
  'services_page_viewed',
  'digital_diagnosis_clicked',
  'digital_diagnosis_requested',
  'service_selected',
  'commercial_request_submitted',
  'sponsored_content_viewed',
  'sponsored_content_clicked',
]);

export function recordCommercialAnalyticsEvent(type, context = {}) {
  if (!COMMERCIAL_ANALYTICS_EVENTS.includes(type) || typeof window === 'undefined') return;
  const detail = {
    type,
    establishmentId: typeof context.establishmentId === 'string' ? context.establishmentId : undefined,
    source: context.source === 'sponsored' ? 'sponsored' : 'organic',
    occurredAt: new Date().toISOString(),
  };
  window.dispatchEvent(new CustomEvent('glutenfri:commercial-analytics', { detail }));
}
