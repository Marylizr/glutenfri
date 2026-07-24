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
  const [reason, setReason] = useState('incorrect_safety');
  const [details, setDetails] = useState('');

  if (!auth?.user) return null;

  const handleConfirm = () => {
    setStatus('reporting');
    reportReview(reviewId, { reason, details: details.trim() || undefined })
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
          message="Cuéntanos el motivo. Un moderador la revisará; no se ocultará automáticamente."
          confirmLabel="Reportar"
          danger
          confirming={status === 'reporting'}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        >
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
            Motivo
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-input)',
                background: 'var(--color-surface)',
              }}
            >
              <option value="incorrect_safety">Información de seguridad incorrecta</option>
              <option value="offensive">Contenido ofensivo</option>
              <option value="spam">Spam o promoción</option>
              <option value="personal_data">Datos personales</option>
              <option value="other">Otro motivo</option>
            </select>
          </label>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '18px' }}>
            Detalle opcional
            <textarea
              value={details}
              maxLength={500}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Ayúdanos a entender qué debería revisar el equipo."
              style={{
                width: '100%',
                minHeight: '76px',
                resize: 'vertical',
                marginTop: '6px',
                padding: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-input)',
                font: 'inherit',
              }}
            />
          </label>
        </ConfirmModal>
      )}
    </>
  );
}
