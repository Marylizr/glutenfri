import { Link } from 'react-router-dom';
import { formatVerificationDate, useLanguage } from '../i18n/index.jsx';
import TrustBadge from './TrustBadge.jsx';

export default function TrustDetails({ establishment }) {
  const { language, t } = useLanguage();
  const date = formatVerificationDate(establishment.lastVerifiedAt, language);
  const source = establishment.sourceName || t('sourceMissing');
  const validSourceUrl = /^https:\/\//i.test(establishment.sourceUrl || '');

  return (
    <section className="trust-panel" aria-labelledby="trust-heading">
      <h2 id="trust-heading" style={{ fontSize: 17, marginBottom: 10 }}>{t('safetyPageTitle')}</h2>
      <TrustBadge establishment={establishment} />
      <dl className="trust-metadata">
        <div>
          <dt>{t('source')}</dt>
          <dd>
            {validSourceUrl ? (
              <a href={establishment.sourceUrl} target="_blank" rel="noopener noreferrer">
                {source}
              </a>
            ) : source}
          </dd>
        </div>
        <div>
          <dt>{t('lastChecked')}</dt>
          <dd>{date || t('dateMissing')}</dd>
        </div>
      </dl>
      <p className="trust-notice">{t('informationNotice')}</p>
      <Link to="/informacion-sin-gluten" className="trust-learn-link">
        {t('understandCategory')}
      </Link>
    </section>
  );
}
