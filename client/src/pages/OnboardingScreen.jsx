import HamburgerAssembly from '../components/HamburgerAssembly';
import BrandLogo from '../components/BrandLogo';
import { LANGUAGES, useLanguage } from '../i18n/index.jsx';

export default function OnboardingScreen({ onStart, onLogin }) {
  const { language, setLanguage, t } = useLanguage();
  const features = [t('heroFeature1'), t('heroFeature2'), t('heroFeature3')];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fffbed',
        padding: '10px 30px 24px',
        overflowY: 'auto',
      }}
    >
      <div style={{ minHeight: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <BrandLogo className="brand-logo--onboarding" priority />
        <label className="language-picker">
          <span aria-hidden="true">🌐</span>
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
      </div>

      <HamburgerAssembly badge={t('heroBadge')} alt={t('animationAlt')} />

      <h1 style={{ fontSize: '30px', lineHeight: 1.16, margin: '4px 0 14px', textAlign: 'center', letterSpacing: '-0.025em' }}>
        {t('heroTitle')}
        <span style={{ display: 'block', color: '#a8462f' }}>{t('heroAccent')}</span>
      </h1>
      <p style={{ color: '#65504a', fontSize: '15px', lineHeight: 1.5, margin: '0 auto 20px', maxWidth: '360px', textAlign: 'center' }}>
        {t('heroDescription')}
      </p>

      <div style={{ width: '100%', maxWidth: '350px', margin: '0 auto 18px' }}>
        {features.map((feature) => (
          <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '9px' }}>
            <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
              ✓
            </span>
            <span style={{ fontSize: '14px', lineHeight: 1.4, color: '#65504a' }}>{feature}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart} className="onboarding-primary">
        {t('start')} &nbsp;→
      </button>
      <button onClick={onLogin} className="onboarding-login">
        {t('loginPrompt')}
      </button>
    </div>
  );
}
