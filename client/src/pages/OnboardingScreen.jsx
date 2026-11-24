import HamburgerAssembly from '../components/HamburgerAssembly';
import { useLanguage } from '../i18n/index.jsx';
import { recordCommercialAnalyticsEvent } from '../utils/commercialAnalytics.js';
import PublicFooter from '../components/PublicFooter.jsx';

export default function OnboardingScreen({ onStart, onOwner }) {
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
            <span className="onboarding-title__lead">{t('heroTitle')}</span>
            <span className="onboarding-title__accent">{t('heroAccent')}</span>
          </h1>
          <p className="onboarding-screen__description">{t('heroDescription')}</p>

          <div className="onboarding-screen__features">
            {features.map((feature, index) => (
              <div key={feature} style={{ '--feature-index': index }}>
                <span aria-hidden="true">
                  <svg className="onboarding-feature__check" viewBox="0 0 16 16" fill="none">
                    <path d="m3.5 8 3 3 6-6" pathLength="1" />
                  </svg>
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="onboarding-screen__actions">
            <button onClick={onStart} className="onboarding-primary">
              {t('start')} &nbsp;→
            </button>
            <button onClick={() => { recordCommercialAnalyticsEvent('commercial_cta_clicked'); onOwner(); }} className="onboarding-login">
              {t('ownerCta')}
            </button>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
