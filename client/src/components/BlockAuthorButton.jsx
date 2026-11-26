import { useRef, useState } from 'react';
import { useLanguage } from '../i18n/index.jsx';
import api from '../services/api.js';

export default function BlockAuthorButton({ review, auth, onBlocked }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef(false);
  if (!auth?.user || !review.user?._id || String(review.user._id) === String(auth.user.id || auth.user._id)) return null;
  async function block() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(false);
    try {
      await api.post(`/reviews/${review._id}/block-author`);
      onBlocked?.(review.user._id);
    } catch { setError(true); }
    finally { pending.current = false; setBusy(false); }
  }
  return <span><button type="button" className="place-open" disabled={busy} onClick={block}>{t('blockAuthor')}</button>{error && <span role="alert">{t('blockFailed')}</span>}</span>;
}
