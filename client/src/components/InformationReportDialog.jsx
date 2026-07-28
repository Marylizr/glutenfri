import { useEffect, useId, useRef, useState } from 'react';
import { reportEstablishmentInformation } from '../services/establishments.js';
import { useLanguage } from '../i18n/index.jsx';

const REASONS = [
  'closed_business',
  'incorrect_address',
  'incorrect_hours',
  'incorrect_contact',
  'incorrect_certification',
  'menu_unavailable',
  'incorrect_cross_contact',
  'other',
];

const createSubmissionId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export default function InformationReportDialog({ establishmentId, onClose }) {
  const { t } = useLanguage();
  const titleId = useId();
  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [contact, setContact] = useState('');
  const [submissionId] = useState(createSubmissionId);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const previous = document.activeElement;
    firstFieldRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusable = [...(dialogRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
        ) || [])];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    if (!reason || status === 'submitting' || status === 'success') return;
    setStatus('submitting');
    setError('');
    try {
      await reportEstablishmentInformation(establishmentId, {
        reason,
        comment: comment.trim() || undefined,
        contact: contact.trim() || undefined,
        submissionId,
      });
      setStatus('success');
    } catch {
      setStatus('error');
      setError(t('reportInformationError'));
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        ref={dialogRef}
        className="information-report-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="information-report-dialog__header">
          <h2 id={titleId}>{t('reportInformation')}</h2>
          <button type="button" className="icon-action" onClick={onClose} aria-label={t('close')}>
            ×
          </button>
        </div>
        {status === 'success' ? (
          <div role="status">
            <p>{t('reportInformationSuccess')}</p>
            <button type="button" className="secondary-action" onClick={onClose}>{t('close')}</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              <span>{t('reportReason')}</span>
              <select ref={firstFieldRef} required value={reason} onChange={(event) => setReason(event.target.value)}>
                <option value="">{t('selectReason')}</option>
                {REASONS.map((value) => (
                  <option key={value} value={value}>{t(`reportReason_${value}`)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('optionalComment')}</span>
              <textarea maxLength={800} value={comment} onChange={(event) => setComment(event.target.value)} />
            </label>
            <label>
              <span>{t('optionalContact')}</span>
              <input maxLength={254} value={contact} onChange={(event) => setContact(event.target.value)} />
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="information-report-dialog__actions">
              <button type="button" className="secondary-action" onClick={onClose}>{t('cancel')}</button>
              <button type="submit" className="primary-action" disabled={!reason || status === 'submitting'}>
                {status === 'submitting' ? t('sending') : t('sendReport')}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
