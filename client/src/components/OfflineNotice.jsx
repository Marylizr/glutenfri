import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/index.jsx';

export default function OfflineNotice() {
  const { t } = useLanguage();
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return offline ? (
    <div className="offline-notice" role="status" aria-live="polite">
      {t('offlineNotice')}
    </div>
  ) : null;
}
