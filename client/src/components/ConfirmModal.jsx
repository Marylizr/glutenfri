import { useEffect, useId, useRef } from 'react';
import { useLanguage } from '../i18n/index.jsx';

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
  confirming,
  children,
}) {
  const { language } = useLanguage();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const cancelAction = useRef(onCancel);
  const busy = useRef(confirming);
  useEffect(() => {
    cancelAction.current = onCancel;
    busy.current = confirming;
  }, [onCancel, confirming]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!busy.current) cancelAction.current();
      }
      if (event.key !== 'Tab') return;
      const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')];
      if (!controls.length) { event.preventDefault(); dialogRef.current.focus(); return; }
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);
  const labels = {
    'pt-PT': { cancel: 'Cancelar', wait: 'Um momento…' },
    en: { cancel: 'Cancel', wait: 'One moment…' },
    es: { cancel: 'Cancelar', wait: 'Un momento…' },
  }[language];
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(43, 38, 32, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          padding: '22px',
          maxWidth: '360px',
          width: '100%',
        }}
      >
        <h2 id={titleId} style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h2>
        <p id={descriptionId} style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          {message}
        </p>
        {children}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={confirming}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-input)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {labels.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-input)',
              border: 'none',
              background: danger ? 'var(--color-warn)' : 'var(--color-accent)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {confirming ? labels.wait : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
