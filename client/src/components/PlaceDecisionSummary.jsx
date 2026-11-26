import { useLanguage } from '../i18n/index.jsx';
import { booleanFact, decisionFacts } from '../utils/placeDecision.js';
import { getOpenStatus } from '../utils/openingHours.js';
import useMinuteClock from '../hooks/useMinuteClock.js';

export default function PlaceDecisionSummary({ establishment }) {
  const { t } = useLanguage();
  const facts = decisionFacts(establishment);
  const now = useMinuteClock();
  const status = getOpenStatus(establishment, now).status;
  return (
    <section className="place-decision" aria-label={t('practicalSummary')}>
      <h2>{t('practicalSummary')}</h2>
      {facts.closed && <p role="status">{t('placeUnavailable')}</p>}
      <dl>
        <div><dt>{t('offerLabel')}</dt><dd>{facts.offer || t('factUnknown')}</dd></div>
        <div><dt>{t('dedicatedMenuFact')}</dt><dd>{t(booleanFact(establishment.dedicatedGlutenFreeMenu))}</dd></div>
        <div><dt>{t('dedicatedKitchenFact')}</dt><dd>{t(booleanFact(establishment.dedicatedKitchen))}</dd></div>
        <div><dt>{t('contactFact')}</dt><dd>{establishment.phone || t('factUnknown')}</dd></div>
        <div><dt>{t('menuFact')}</dt><dd>{establishment.menuUrl ? <a href={establishment.menuUrl} target="_blank" rel="noopener noreferrer">{t('menuFact')}</a> : t('factUnknown')}</dd></div>
        <div><dt>{t('hoursFact')}</dt><dd>{t(status === 'open' ? 'openNowFact' : status === 'closed' ? 'closedNowFact' : 'factUnknown')}</dd></div>
      </dl>
      <p>{t('factsAttributed')}</p>
      <p>{t('noCertificationNotice')}</p>
    </section>
  );
}
