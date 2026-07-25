import { useLanguage } from '../i18n/index.jsx';

export default function CategoryChips({ value, onChange }) {
  const { t } = useLanguage();
  const chips = [
    { value: undefined, label: t('all') },
    { value: 'restaurant', label: t('restaurants') },
    { value: 'bakery', label: t('bakeries') },
    { value: 'store', label: t('stores') },
    { value: 'pharmacy', label: t('pharmacies') },
    { value: 'supermarket', label: t('supermarkets') },
  ];
  return (
    <div className="category-chips">
      {chips.map((chip) => {
        const active = value === chip.value;
        return (
          <button
            key={chip.label}
            type="button"
            className={`category-chips__item${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(chip.value)}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
