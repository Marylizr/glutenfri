import HamburgerAssembly from '../components/HamburgerAssembly';
import { useLanguage } from '../i18n/index.jsx';

export default function OnboardingScreen({ onStart, onLogin }) {
  const { t } = useLanguage();
  const features = [t('heroFeature1'), t('heroFeature2'), t('heroFeature3')];

  return (
    <div className="onboarding-screen">
      <div className="onboarding-screen__layout">
        <div className="onboarding-screen__visual">
          <HamburgerAssembly badge={t('heroBadge')} alt={t('animationAlt')} />
        </div>

        <div className="onboarding-screen__copy">
          <h1>
            {t('heroTitle')}
            <span>{t('heroAccent')}</span>
          </h1>
          <p className="onboarding-screen__description">{t('heroDescription')}</p>

          <div className="onboarding-screen__features">
            {features.map((feature) => (
              <div key={feature}>
                <span aria-hidden="true">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="onboarding-screen__actions">
            <button onClick={onStart} className="onboarding-primary">
              {t('start')} &nbsp;→
            </button>
            <button onClick={onLogin} className="onboarding-login">
              {t('loginPrompt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
