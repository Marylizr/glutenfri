import { useLanguage } from '../i18n/index.jsx';
export default function DiscoveryIntent({ value, onChange }) {
  const { t } = useLanguage();
  return <nav className="discovery-intents" aria-label={t('intentLabel')}>
    {[[undefined, 'intentAll'], ['eat', 'intentEat'], ['bakery', 'intentBakery'], ['shop', 'intentShop']].map(([intent, label]) => (
      <button key={label} type="button" aria-pressed={value === intent} onClick={() => onChange(intent)}>{t(label)}</button>
    ))}
  </nav>;
}
