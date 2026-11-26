import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/index.jsx';
import { getRecoveryStatus, requestPasswordReset, completePasswordReset } from '../services/auth.js';
import { authErrorKey } from '../utils/authReliability.js';

export default function PasswordRecovery({ token, onBack }) {
  const { t } = useLanguage();
  const [available, setAvailable] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    getRecoveryStatus().then(value => { if (active) setAvailable(value); })
      .catch(() => { if (active) setAvailable(false); });
    return () => { active = false; };
  }, []);
  const submit = async event => {
    event.preventDefault();
    if (pending.current || done || !available) return;
    if (token && (password !== confirmation || password.length < 12 || new TextEncoder().encode(password).length > 72)) {
      setError('authPasswordPolicy'); return;
    }
    pending.current = true; setBusy(true); setError(null);
    try {
      if (token) await completePasswordReset({ token, password, confirmation });
      else await requestPasswordReset(email);
      setPassword(''); setConfirmation(''); setDone(true);
    } catch (failure) { setError(authErrorKey(failure, true)); }
    finally { pending.current = false; setBusy(false); }
  };
  return <section className="password-recovery" aria-labelledby="recovery-heading">
    <h2 id="recovery-heading">{t(token ? 'authResetTitle' : 'authForgot')}</h2>
    {available === null && <p role="status">{t('loading')}</p>}
    {available === false && <p role="status">{t('authRecoveryUnavailable')} <Link to="/contacto">{t('contact')}</Link></p>}
    {available && !done && <form onSubmit={submit} aria-busy={busy}>
      {!token && <label>{t('authEmail')}<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={busy} /></label>}
      {token && <><p>{t('authPasswordPolicy')}</p>
        <label>{t('authNewPassword')}<input type="password" autoComplete="new-password" minLength={12} value={password} onChange={e => setPassword(e.target.value)} required disabled={busy} /></label>
        <label>{t('authConfirmPassword')}<input type="password" autoComplete="new-password" minLength={12} value={confirmation} onChange={e => setConfirmation(e.target.value)} required disabled={busy} /></label></>}
      {error && <p role="alert">{t(error)}</p>}
      <button type="submit" disabled={busy}>{t(busy ? 'authSending' : token ? 'authReset' : 'authSend')}</button>
    </form>}
    {done && <p role="status">{t(token ? 'authResetDone' : 'authRecoverySent')}</p>}
    <button type="button" onClick={onBack} disabled={busy}>{t('authBack')}</button>
  </section>;
}
