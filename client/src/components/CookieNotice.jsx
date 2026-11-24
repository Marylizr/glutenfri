import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import { acknowledgeCookieNotice, hasAcknowledgedCookieNotice, COOKIE_NOTICE_OPEN } from '../utils/cookieNotice.js';

export default function CookieNotice() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(() => {
    try { return !hasAcknowledgedCookieNotice(window.localStorage); }
    catch { return true; }
  });
  const trigger = useRef(null);
  const dismissButton = useRef(null);

  useEffect(() => {
    const open = () => {
      trigger.current = document.activeElement;
      setVisible(true);
    };
    window.addEventListener(COOKIE_NOTICE_OPEN, open);
    return () => window.removeEventListener(COOKIE_NOTICE_OPEN, open);
  }, []);

  useEffect(() => {
    if (visible && trigger.current) dismissButton.current?.focus();
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    try { acknowledgeCookieNotice(window.localStorage); } catch { /* Storage can be blocked. */ }
    setVisible(false);
    trigger.current?.focus();
    trigger.current = null;
  };

  return (
    <section className="cookie-notice" aria-labelledby="cookie-notice-title">
      <div className="cookie-notice__copy">
        <h2 id="cookie-notice-title">{t('cookieTitle')}</h2>
        <p>{t('cookieDescription')}</p>
      </div>
      <div className="cookie-notice__actions">
        <Link to="/privacidad">{t('privacy')}</Link>
        <button ref={dismissButton} type="button" onClick={dismiss}>{t('cookieDismiss')}</button>
      </div>
    </section>
  );
}
