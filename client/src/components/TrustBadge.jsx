import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import { getTrustPresentation } from '../utils/trustStatus.js';

export default function TrustBadge({ establishment, contextualLink = false }) {
  const { t } = useLanguage();
  const trust = getTrustPresentation(establishment, t);

  return (
    <span>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: trust.background,
          color: trust.color,
          fontSize: '11px',
          lineHeight: 1.25,
          fontWeight: 700,
          padding: '5px 8px',
          borderRadius: 'var(--radius-pill)',
          maxWidth: '270px',
        }}
      >
        <span aria-hidden="true">{trust.icon}</span>
        {trust.label}
      </span>
      {contextualLink && (
        <Link
          to="/informacion-sin-gluten"
          style={{ display: 'block', color: 'var(--color-accent)', fontSize: 12, marginTop: 7 }}
        >
          {t('understandCategory')}
        </Link>
      )}
    </span>
  );
}
