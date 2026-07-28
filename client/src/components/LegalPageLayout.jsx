import { Link } from 'react-router-dom';
import { LANGUAGES, useLanguage } from '../i18n/index.jsx';
import PublicFooter from './PublicFooter.jsx';

export default function LegalPageLayout({ title, children }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link to="/explorar" aria-label={t('back')}>← {t('back')}</Link>
        <label className="language-picker">
          <span aria-hidden="true">🌐</span>
          <select aria-label={t('language')} value={language} onChange={(event) => setLanguage(event.target.value)}>
            {LANGUAGES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </header>
      <article>
        <h1>{title}</h1>
        {children}
      </article>
      <PublicFooter />
    </main>
  );
}
