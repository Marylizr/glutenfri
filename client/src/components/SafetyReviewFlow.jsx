import { useState } from 'react';
import { postReview } from '../services/establishments';

const TOTAL_STEPS = 5;

function ProgressDots({ step }) {
  return (
    <div style={{ display: 'flex', gap: '6px', padding: '16px 20px 0' }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: '4px',
            borderRadius: 'var(--radius-pill)',
            background: i < step ? 'var(--color-accent)' : 'var(--color-border)',
          }}
        />
      ))}
    </div>
  );
}

function ChoiceButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '16px 18px',
        borderRadius: 'var(--radius-input)',
        border: active ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
        background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
        color: 'var(--color-text)',
        fontSize: '16px',
        fontWeight: active ? 600 : 400,
        marginBottom: '10px',
      }}
    >
      {children}
    </button>
  );
}

function StepShell({ step, title, subtitle, onBack, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ProgressDots step={step} />
      <div style={{ padding: '8px 20px 0' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            padding: '8px 0',
          }}
        >
          ← Atrás
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 20px' }}>
        <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>{title}</h2>
        {subtitle && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

export default function SafetyReviewFlow({ establishmentId, existingReview, onCancel, onComplete }) {
  const isEditing = !!existingReview;
  const [step, setStep] = useState(1);
  const [staffUnderstanding, setStaffUnderstanding] = useState(existingReview?.staffUnderstanding ?? null);
  const [hasDedicatedMenu, setHasDedicatedMenu] = useState(existingReview?.hasDedicatedMenu ?? null);
  const [dedicatedKitchen, setDedicatedKitchen] = useState(existingReview?.dedicatedKitchen ?? null);
  const [riskLevel, setRiskLevel] = useState(existingReview?.riskLevel ?? null);
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const goBack = () => {
    if (step === 1) return onCancel();
    setStep((s) => s - 1);
  };

  const handleStaffAnswer = (value) => {
    setStaffUnderstanding(value);
    setStep(2);
  };

  const handleMenuAnswer = (value) => {
    setHasDedicatedMenu(value);
    setStep(3);
  };

  const handleKitchenAnswer = (value) => {
    setDedicatedKitchen(value);
    setStep(4);
  };

  const handleRiskAnswer = (value) => {
    setRiskLevel(value);
    setStep(5);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await postReview(establishmentId, {
        rating,
        comment,
        staffUnderstanding,
        hasDedicatedMenu,
        dedicatedKitchen,
        riskLevel,
      });
      onComplete();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Necesitas iniciar sesión para dejar una reseña.'
          : 'No pudimos guardar tu reseña. Intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <StepShell
        step={1}
        title="¿El personal entendió tus necesidades gluten-free?"
        subtitle="Pensá en cómo respondieron cuando explicaste tu situación."
        onBack={goBack}
      >
        <ChoiceButton active={staffUnderstanding === 'poor'} onClick={() => handleStaffAnswer('poor')}>
          Malo — no entendieron o ignoraron el pedido
        </ChoiceButton>
        <ChoiceButton active={staffUnderstanding === 'okay'} onClick={() => handleStaffAnswer('okay')}>
          Regular — entendieron, pero con dudas
        </ChoiceButton>
        <ChoiceButton
          active={staffUnderstanding === 'excellent'}
          onClick={() => handleStaffAnswer('excellent')}
        >
          Excelente — muy claros y seguros
        </ChoiceButton>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={2}
        title="¿Había un menú específico sin gluten?"
        subtitle="Un menú dedicado, marcado o una carta aparte cuentan como sí."
        onBack={goBack}
      >
        <ChoiceButton active={hasDedicatedMenu === true} onClick={() => handleMenuAnswer(true)}>
          Sí
        </ChoiceButton>
        <ChoiceButton active={hasDedicatedMenu === false} onClick={() => handleMenuAnswer(false)}>
          No
        </ChoiceButton>
      </StepShell>
    );
  }

  if (step === 3) {
    return (
      <StepShell
        step={3}
        title="¿Había un área de cocina dedicada sin gluten?"
        subtitle="Zona o utensilios separados para evitar contaminación cruzada."
        onBack={goBack}
      >
        <ChoiceButton active={dedicatedKitchen === true} onClick={() => handleKitchenAnswer(true)}>
          Sí
        </ChoiceButton>
        <ChoiceButton active={dedicatedKitchen === false} onClick={() => handleKitchenAnswer(false)}>
          No
        </ChoiceButton>
      </StepShell>
    );
  }

  if (step === 4) {
    return (
      <StepShell
        step={4}
        title="¿Cómo calificarías el riesgo de contaminación cruzada?"
        subtitle="Pensá en la preparación, el manejo y la separación de ingredientes."
        onBack={goBack}
      >
        <ChoiceButton active={riskLevel === 'none'} onClick={() => handleRiskAnswer('none')}>
          Ninguno
        </ChoiceButton>
        <ChoiceButton active={riskLevel === 'low'} onClick={() => handleRiskAnswer('low')}>
          Bajo
        </ChoiceButton>
        <ChoiceButton active={riskLevel === 'moderate'} onClick={() => handleRiskAnswer('moderate')}>
          Moderado
        </ChoiceButton>
        <ChoiceButton active={riskLevel === 'high'} onClick={() => handleRiskAnswer('high')}>
          Alto
        </ChoiceButton>
      </StepShell>
    );
  }

  return (
    <StepShell
      step={5}
      title="Para cerrar, ¿cómo calificás la experiencia?"
      onBack={goBack}
    >
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            aria-label={`${n} estrellas`}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '32px',
              padding: 0,
              color: n <= rating ? 'var(--color-accent)' : 'var(--color-border)',
            }}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Contanos más sobre tu experiencia (opcional)"
        maxLength={1000}
        rows={4}
        style={{
          width: '100%',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-input)',
          padding: '12px 14px',
          fontSize: '15px',
          fontFamily: 'inherit',
          resize: 'vertical',
          marginBottom: '16px',
        }}
      />

      {error && (
        <div style={{ color: 'var(--color-warn)', fontSize: '13px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-input)',
          border: 'none',
          background: rating === 0 ? 'var(--color-border)' : 'var(--color-accent)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
        }}
      >
        {submitting ? 'Enviando…' : isEditing ? 'Actualizar reseña' : 'Enviar reseña'}
      </button>
    </StepShell>
  );
}
