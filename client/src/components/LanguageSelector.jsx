import { LANGUAGES, useLanguage } from '../i18n/index.jsx';

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage, t } = useLanguage();
  const labels = { 'pt-PT': 'PT', es: 'ES', en: 'EN' };

  return (
    <label className={`language-picker ${className}`.trim()}>
      <span className="material-symbols-outlined language-picker__icon" aria-hidden="true">
        language
      </span>
      <select
        aria-label={t('language')}
        title={LANGUAGES.find((option) => option.value === language)?.label}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {['pt-PT', 'es', 'en'].map((value) => (
          <option key={value} value={value} aria-label={LANGUAGES.find((option) => option.value === value)?.label}>{labels[value]}</option>
        ))}
      </select>
    </label>
  );
}
