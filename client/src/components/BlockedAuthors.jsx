import { useCallback, useEffect, useState } from 'react';
import api from '../services/api.js';
import { useLanguage } from '../i18n/index.jsx';
export default function BlockedAuthors() {
  const { t } = useLanguage();
  const [authors, setAuthors] = useState(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try { const { data } = await api.get('/users/me/blocked-authors'); if (!Array.isArray(data)) throw new TypeError(); setAuthors(data); setError(false); }
    catch { setError(true); }
  }, []);
  useEffect(() => {
    let active = true;
    api.get('/users/me/blocked-authors').then(({ data }) => {
      if (!Array.isArray(data)) throw new TypeError();
      if (active) setAuthors(data);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);
  async function unblock(id) {
    if (busy) return;
    setBusy(true); setError(false);
    try { await api.delete(`/users/me/blocked-authors/${id}`); setAuthors((items) => items.filter((a) => a._id !== id)); }
    catch { setError(true); } finally { setBusy(false); }
  }
  return <section><h2>{t('blockedAuthors')}</h2>
    {error && <p role="alert">{t('blockFailed')} <button type="button" onClick={load}>{t('retry')}</button></p>}
    {authors?.length === 0 && <p>{t('noBlockedAuthors')}</p>}
    {authors?.map((author) => <p key={author._id}>{author.name} <button className="place-open" type="button" disabled={busy} onClick={() => unblock(author._id)}>{t('unblockAuthor')}</button></p>)}
  </section>;
}
