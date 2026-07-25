// Requisito de las Places API Policies de Google: cualquier vista que
// muestre contenido derivado de la Places API debe atribuirlo a "Google
// Maps" (no alcanza con "Google" solo). Se muestra solo cuando el
// establishment.source indica datos de Google ('Google' o 'APC+Google').

import { useLanguage } from '../i18n/index.jsx';

export default function GoogleAttribution({ compact = false }) {
  const { t } = useLanguage();
  return (
    <span
      style={{
        fontSize: compact ? '10px' : '12px',
        color: 'var(--color-text-muted)',
      }}
    >
      {t('googleAttribution')}
    </span>
  );
}
