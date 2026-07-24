import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { reportReview } from '../services/reviews';

// Botón discreto de moderación básica — solo visible con sesión iniciada
// (reportar requiere saber quién reporta). "Reportado" es estado de esta
// sesión del navegador: el backend igual rechaza un segundo reporte del
// mismo usuario con 409, así que si vuelve a cargar la página y lo toca
// de nuevo, el resultado es el mismo, solo sin el estado visual previo.
export default function ReportButton({ reviewId, auth }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | reporting | reported

  if (!auth?.user) return null;

  const handleConfirm = () => {
    setStatus('reporting');
    reportReview(reviewId)
      .then(() => setStatus('reported'))
      .catch((err) => {
        // 409 = ya la había reportado antes (en otra sesión) — lo tratamos
        // igual como "reportado" en vez de dejar el botón en un estado raro.
        if (err?.response?.status === 409) {
          setStatus('reported');
        } else {
          setStatus('idle');
        }
      })
      .finally(() => setShowConfirm(false));
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={status !== 'idle'}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: '11px',
          fontWeight: 600,
          color: status === 'reported' ? 'var(--color-text-muted)' : 'var(--color-warn)',
          cursor: status === 'idle' ? 'pointer' : 'default',
        }}
      >
        {status === 'reported' ? 'Reportado' : status === 'reporting' ? 'Reportando…' : '⚑ Reportar'}
      </button>

      {showConfirm && (
        <ConfirmModal
          title="¿Reportar esta reseña?"
          message="Un moderador la va a revisar. No se oculta automáticamente."
          confirmLabel="Reportar"
          danger
          confirming={status === 'reporting'}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
