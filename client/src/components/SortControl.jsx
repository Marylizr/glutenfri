import { SORT_OPTIONS } from '../utils/establishmentFilters.js';
import { useLanguage } from '../i18n/index.jsx';

export default function SortControl({ value, onChange, locationStatus, onRequestLocation }) {
  const { t } = useLanguage();
  return (
    <div className="sort-control">
      <label>
        <span>{t('sortBy')}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value={SORT_OPTIONS.DEFAULT}>{t('sortDefault')}</option>
          <option value={SORT_OPTIONS.DISTANCE}>{t('sortDistance')}</option>
          <option value={SORT_OPTIONS.CERTIFICATION}>{t('sortCertification')}</option>
          <option value={SORT_OPTIONS.CATEGORY}>{t('sortCategory')}</option>
        </select>
      </label>
      {value === SORT_OPTIONS.DISTANCE && locationStatus !== 'granted' && (
        <div className="sort-control__status" role="status">
          <span>
            {locationStatus === 'requesting'
              ? t('requestingLocation')
              : locationStatus === 'denied'
                ? t('locationDenied')
                : t('locationExplanation')}
          </span>
          {['idle', 'denied'].includes(locationStatus) && (
            <button type="button" onClick={onRequestLocation}>{t('useMyLocation')}</button>
          )}
        </div>
      )}
    </div>
  );
}
