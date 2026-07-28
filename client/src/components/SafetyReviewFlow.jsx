import { useState } from 'react';
import { postReview } from '../services/establishments';
import { loginUser } from '../services/auth';
import { useLanguage } from '../i18n/index.jsx';

const TOTAL_STEPS = 5;
const FLOW_COPY = {
  'pt-PT': {
    back: 'Atrás', staffTitle: 'Como respondeu a equipa às tuas necessidades relacionadas com o glúten?',
    staffSubtitle: 'Descreve apenas a tua experiência nesta visita.', poor: 'Fraca — não compreenderam ou ignoraram o pedido',
    okay: 'Razoável — compreenderam, mas com dúvidas', excellent: 'Excelente — responderam com clareza',
    menuTitle: 'Foi apresentado um menu específico sem glúten?', menuSubtitle: 'Pode ser um menu dedicado, marcado ou separado.',
    kitchenTitle: 'Foi indicada uma área ou preparação dedicada sem glúten?', kitchenSubtitle: 'Responde apenas com base no que observaste ou te comunicaram; isto não verifica o protocolo.',
    riskTitle: 'Que nível de risco de contacto cruzado percecionaste?', riskSubtitle: 'Considera a preparação, o manuseamento e a separação de ingredientes.',
    none: 'Nenhum observado', low: 'Baixo', moderate: 'Moderado', high: 'Alto', yes: 'Sim', no: 'Não',
    ratingTitle: 'Para terminar, como avalias esta experiência?', stars: 'estrelas',
    comment: 'Conta mais sobre a tua experiência (opcional)', authError: 'Precisas de iniciar sessão para publicar uma avaliação.',
    saveError: 'Não foi possível guardar a avaliação. Tenta novamente.', sending: 'A enviar…', update: 'Atualizar avaliação', submit: 'Publicar avaliação',
    email: 'Email', password: 'Palavra-passe', login: 'Iniciar sessão', loginError: 'Não foi possível iniciar sessão. Confirma os teus dados.',
  },
  en: {
    back: 'Back', staffTitle: 'How did staff respond to your gluten-related needs?', staffSubtitle: 'Describe only your experience during this visit.',
    poor: 'Poor — they did not understand or ignored the request', okay: 'Fair — they understood, but had doubts', excellent: 'Excellent — they responded clearly',
    menuTitle: 'Was a specific gluten-free menu provided?', menuSubtitle: 'This may be a dedicated, marked or separate menu.',
    kitchenTitle: 'Was a dedicated gluten-free area or preparation reported?', kitchenSubtitle: 'Answer only from what you observed or were told; this does not verify the protocol.',
    riskTitle: 'What level of cross-contact risk did you perceive?', riskSubtitle: 'Consider preparation, handling and separation of ingredients.',
    none: 'None observed', low: 'Low', moderate: 'Moderate', high: 'High', yes: 'Yes', no: 'No',
    ratingTitle: 'Finally, how do you rate this experience?', stars: 'stars', comment: 'Tell us more about your experience (optional)',
    authError: 'You need to log in to publish a review.', saveError: 'We could not save the review. Please try again.',
    sending: 'Sending…', update: 'Update review', submit: 'Publish review',
    email: 'Email', password: 'Password', login: 'Log in', loginError: 'We could not log you in. Check your details.',
  },
  es: {
    back: 'Atrás', staffTitle: '¿Cómo respondió el personal a tus necesidades relacionadas con el gluten?', staffSubtitle: 'Describe únicamente tu experiencia durante esta visita.',
    poor: 'Mala — no entendieron o ignoraron la petición', okay: 'Regular — entendieron, pero con dudas', excellent: 'Excelente — respondieron con claridad',
    menuTitle: '¿Te ofrecieron un menú específico sin gluten?', menuSubtitle: 'Puede ser un menú dedicado, marcado o separado.',
    kitchenTitle: '¿Te indicaron un área o preparación dedicada sin gluten?', kitchenSubtitle: 'Responde solo según lo que observaste o te comunicaron; esto no verifica el protocolo.',
    riskTitle: '¿Qué nivel de riesgo de contacto cruzado percibiste?', riskSubtitle: 'Considera la preparación, manipulación y separación de ingredientes.',
    none: 'Ninguno observado', low: 'Bajo', moderate: 'Moderado', high: 'Alto', yes: 'Sí', no: 'No',
    ratingTitle: 'Para terminar, ¿cómo valoras esta experiencia?', stars: 'estrellas', comment: 'Cuéntanos más sobre tu experiencia (opcional)',
    authError: 'Necesitas iniciar sesión para publicar una reseña.', saveError: 'No pudimos guardar la reseña. Intenta de nuevo.',
    sending: 'Enviando…', update: 'Actualizar reseña', submit: 'Publicar reseña',
    email: 'Email', password: 'Contraseña', login: 'Iniciar sesión', loginError: 'No pudimos iniciar sesión. Revisa tus datos.',
  },
};

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

function StepShell({ step, title, subtitle, onBack, backLabel, children }) {
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
          ← {backLabel}
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

export default function SafetyReviewFlow({ establishmentId, existingReview, onCancel, onComplete, auth }) {
  const { language } = useLanguage();
  const copy = FLOW_COPY[language];
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
  const [needsLogin, setNeedsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const reviewPayload = {
    rating,
    comment,
    staffUnderstanding,
    hasDedicatedMenu,
    dedicatedKitchen,
    riskLevel,
  };

  const publishReview = async () => {
    await postReview(establishmentId, reviewPayload);
    onComplete();
  };

  const handleSubmit = async () => {
    setError(null);
    if (!auth?.user) {
      setNeedsLogin(true);
      setError(copy.authError);
      return;
    }
    setSubmitting(true);
    try {
      await publishReview();
    } catch (err) {
      if (err.response?.status === 401) {
        setNeedsLogin(true);
        setError(copy.authError);
      } else {
        setError(copy.saveError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInlineLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = await loginUser({ email, password });
      auth.setSession(session);
      await publishReview();
    } catch (err) {
      setError(err.response?.status === 401 ? copy.loginError : copy.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <StepShell
        step={1}
        title={copy.staffTitle}
        subtitle={copy.staffSubtitle}
        onBack={goBack}
        backLabel={copy.back}
      >
        <ChoiceButton active={staffUnderstanding === 'poor'} onClick={() => handleStaffAnswer('poor')}>
          {copy.poor}
        </ChoiceButton>
        <ChoiceButton active={staffUnderstanding === 'okay'} onClick={() => handleStaffAnswer('okay')}>
          {copy.okay}
        </ChoiceButton>
        <ChoiceButton
          active={staffUnderstanding === 'excellent'}
          onClick={() => handleStaffAnswer('excellent')}
        >
          {copy.excellent}
        </ChoiceButton>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={2}
        title={copy.menuTitle}
        subtitle={copy.menuSubtitle}
        onBack={goBack}
        backLabel={copy.back}
      >
        <ChoiceButton active={hasDedicatedMenu === true} onClick={() => handleMenuAnswer(true)}>
          {copy.yes}
        </ChoiceButton>
        <ChoiceButton active={hasDedicatedMenu === false} onClick={() => handleMenuAnswer(false)}>
          {copy.no}
        </ChoiceButton>
      </StepShell>
    );
  }

  if (step === 3) {
    return (
      <StepShell
        step={3}
        title={copy.kitchenTitle}
        subtitle={copy.kitchenSubtitle}
        onBack={goBack}
        backLabel={copy.back}
      >
        <ChoiceButton active={dedicatedKitchen === true} onClick={() => handleKitchenAnswer(true)}>
          {copy.yes}
        </ChoiceButton>
        <ChoiceButton active={dedicatedKitchen === false} onClick={() => handleKitchenAnswer(false)}>
          {copy.no}
        </ChoiceButton>
      </StepShell>
    );
  }

  if (step === 4) {
    return (
      <StepShell
        step={4}
        title={copy.riskTitle}
        subtitle={copy.riskSubtitle}
        onBack={goBack}
        backLabel={copy.back}
      >
        <ChoiceButton active={riskLevel === 'none'} onClick={() => handleRiskAnswer('none')}>
          {copy.none}
        </ChoiceButton>
        <ChoiceButton active={riskLevel === 'low'} onClick={() => handleRiskAnswer('low')}>
          {copy.low}
        </ChoiceButton>
        <ChoiceButton active={riskLevel === 'moderate'} onClick={() => handleRiskAnswer('moderate')}>
          {copy.moderate}
        </ChoiceButton>
        <ChoiceButton active={riskLevel === 'high'} onClick={() => handleRiskAnswer('high')}>
          {copy.high}
        </ChoiceButton>
      </StepShell>
    );
  }

  return (
    <StepShell
      step={5}
      title={copy.ratingTitle}
      onBack={goBack}
      backLabel={copy.back}
    >
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            aria-label={`${n} ${copy.stars}`}
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
        placeholder={copy.comment}
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
        <div role="alert" style={{ color: 'var(--color-warn)', fontSize: '13px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      {needsLogin ? (
        <form className="review-inline-login" onSubmit={handleInlineLogin}>
          <label>
            <span>{copy.email}</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            <span>{copy.password}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? copy.sending : copy.login}
          </button>
        </form>
      ) : (
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
          {submitting ? copy.sending : isEditing ? copy.update : copy.submit}
        </button>
      )}
    </StepShell>
  );
}
