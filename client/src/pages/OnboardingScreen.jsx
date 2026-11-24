import HamburgerAssembly from '../components/HamburgerAssembly';
import { useLanguage } from '../i18n/index.jsx';

export default function OnboardingScreen({ onStart }) {
  const { t } = useLanguage();

  return (
    <main className="onboarding-screen">
      <div className="onboarding-screen__layout">
        <div className="onboarding-screen__visual">
          <HamburgerAssembly badge={t('heroBadge')} alt={t('animationAlt')} />
        </div>

        <div className="onboarding-screen__copy">
          <h1>
            <span className="onboarding-title__lead">{t('heroTitle')}</span>
            <span className="onboarding-title__accent">{t('heroAccent')}</span>
          </h1>
          <div className="onboarding-screen__actions">
            <button onClick={onStart} className="onboarding-primary">
              {t('start')} &nbsp;→
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
