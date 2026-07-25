import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { reportReview } from '../services/reviews';
import { useLanguage } from '../i18n/index.jsx';

const REPORT_COPY = {
  'pt-PT': {
    reported: 'Reportado', reporting: 'A reportar…', report: 'Reportar', title: 'Reportar esta avaliação?',
    message: 'Indica o motivo. A equipa de moderação irá rever o conteúdo; este não será ocultado automaticamente.',
    reason: 'Motivo', incorrect: 'Informação sobre glúten incorreta', offensive: 'Conteúdo ofensivo',
    spam: 'Spam ou promoção', personal: 'Dados pessoais', other: 'Outro motivo', detail: 'Detalhe opcional',
    placeholder: 'Ajuda-nos a compreender o que deve ser revisto.',
  },
  en: {
    reported: 'Reported', reporting: 'Reporting…', report: 'Report', title: 'Report this review?',
    message: 'Tell us why. The moderation team will review it; it will not be hidden automatically.',
    reason: 'Reason', incorrect: 'Incorrect gluten-related information', offensive: 'Offensive content',
    spam: 'Spam or promotion', personal: 'Personal data', other: 'Other reason', detail: 'Optional details',
    placeholder: 'Help us understand what the team should review.',
  },
  es: {
    reported: 'Reportado', reporting: 'Reportando…', report: 'Reportar', title: '¿Reportar esta reseña?',
    message: 'Cuéntanos el motivo. El equipo de moderación la revisará; no se ocultará automáticamente.',
    reason: 'Motivo', incorrect: 'Información sobre gluten incorrecta', offensive: 'Contenido ofensivo',
    spam: 'Spam o promoción', personal: 'Datos personales', other: 'Otro motivo', detail: 'Detalle opcional',
    placeholder: 'Ayúdanos a entender qué debería revisar el equipo.',
  },
};

// Botón discreto de moderación básica — solo visible con sesión iniciada
// (reportar requiere saber quién reporta). "Reportado" es estado de esta
// sesión del navegador: el backend igual rechaza un segundo reporte del
// mismo usuario con 409, así que si vuelve a cargar la página y lo toca
// de nuevo, el resultado es el mismo, solo sin el estado visual previo.
export default function ReportButton({ reviewId, auth }) {
  const { language } = useLanguage();
  const copy = REPORT_COPY[language];
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
        {status === 'reported' ? copy.reported : status === 'reporting' ? copy.reporting : `⚑ ${copy.report}`}
      </button>

      {showConfirm && (
        <ConfirmModal
          title={copy.title}
          message={copy.message}
          confirmLabel={copy.report}
          danger
          confirming={status === 'reporting'}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        >
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
            {copy.reason}
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
              <option value="incorrect_safety">{copy.incorrect}</option>
              <option value="offensive">{copy.offensive}</option>
              <option value="spam">{copy.spam}</option>
              <option value="personal_data">{copy.personal}</option>
              <option value="other">{copy.other}</option>
            </select>
          </label>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '18px' }}>
            {copy.detail}
            <textarea
              value={details}
              maxLength={500}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={copy.placeholder}
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
