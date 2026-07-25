import { LANGUAGES, useLanguage } from '../i18n/index.jsx';

export default function LanguageSelector({ className = '' }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={`language-picker ${className}`.trim()}>
      <span className="material-symbols-outlined language-picker__icon" aria-hidden="true">
        language
      </span>
      <select
        aria-label={t('language')}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {LANGUAGES.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
