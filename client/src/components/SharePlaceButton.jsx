import { useState } from 'react';
import { sharePlace } from '../utils/share.js';
import { useLanguage } from '../i18n/index.jsx';

export default function SharePlaceButton({ establishment, onShared }) {
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState('');

  const handleShare = async () => {
    try {
      const result = await sharePlace({
        id: establishment._id,
        name: establishment.name,
        text: t('shareText', { name: establishment.name }),
      });
      onShared?.();
      setFeedback(t(result.method === 'copy' ? 'linkCopied' : 'shareOpened'));
    } catch (error) {
      if (error?.name !== 'AbortError') setFeedback(t('shareError'));
    }
  };

  return (
    <span className="share-place">
      <button
        type="button"
        className="icon-action"
        onClick={handleShare}
        aria-label={t('sharePlace')}
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.5 6.8-4" />
          <path d="m8.6 13.5 6.8 4" />
        </svg>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{feedback}</span>
    </span>
  );
}
