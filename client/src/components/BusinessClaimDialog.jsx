import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createBusinessClaim } from '../services/business';
import { useLanguage } from '../i18n';

const COPY = {
  'pt-PT': {
    eyebrow: 'É o proprietário deste estabelecimento?',
    action: 'Reclamar este estabelecimento',
    title: 'Gerir esta ficha no GlutenFri',
    intro: 'A reclamação permite propor informação comercial. Não permite alterar certificação, avaliações ou dados da comunidade.',
    login: 'Iniciar sessão para reclamar',
    name: 'Nome da pessoa responsável', relation: 'Cargo ou relação com o local',
    email: 'Email profissional', phone: 'Telefone (opcional)', url: 'Website ou rede social oficial',
    method: 'Método de verificação', evidence: 'Explique como podemos confirmar a relação',
    comment: 'Comentário adicional (opcional)', consent: 'Autorizo o tratamento destes dados para verificar e gerir esta solicitação.',
    send: 'Enviar para revisão', sending: 'A enviar…', cancel: 'Cancelar',
    success: 'Solicitação enviada. A equipa irá rever a evidência antes de conceder acesso.',
    error: 'Não foi possível enviar. Verifica os dados ou tenta novamente.',
    close: 'Fechar',
    methods: {
      official_domain_email: 'Email do domínio oficial',
      public_contact_code: 'Código num contacto público',
      manual_business_evidence: 'Evidência comercial descrita',
      administrative_review: 'Revisão administrativa',
    },
  },
  en: {
    eyebrow: 'Do you own this establishment?', action: 'Claim this establishment',
    title: 'Manage this listing on GlutenFri',
    intro: 'A claim lets you propose business information. It does not allow changes to certification, reviews or community data.',
    login: 'Log in to claim', name: 'Responsible person’s name', relation: 'Role or relationship',
    email: 'Professional email', phone: 'Phone (optional)', url: 'Official website or social profile',
    method: 'Verification method', evidence: 'Explain how we can verify the relationship',
    comment: 'Additional comment (optional)', consent: 'I consent to processing these data to verify and manage this request.',
    send: 'Send for review', sending: 'Sending…', cancel: 'Cancel',
    success: 'Request sent. The team will review the evidence before granting access.',
    error: 'We could not send it. Check the data or try again.',
    close: 'Close',
    methods: {
      official_domain_email: 'Official domain email',
      public_contact_code: 'Code sent to a public contact',
      manual_business_evidence: 'Described business evidence',
      administrative_review: 'Administrative review',
    },
  },
  es: {
    eyebrow: '¿Eres propietario de este establecimiento?', action: 'Reclamar este establecimiento',
    title: 'Gestionar esta ficha en GlutenFri',
    intro: 'La reclamación permite proponer información comercial. No permite cambiar certificación, reseñas ni datos comunitarios.',
    login: 'Iniciar sesión para reclamar', name: 'Nombre de la persona responsable', relation: 'Cargo o relación con el local',
    email: 'Email profesional', phone: 'Teléfono (opcional)', url: 'Web o red social oficial',
    method: 'Método de verificación', evidence: 'Explica cómo podemos confirmar la relación',
    comment: 'Comentario adicional (opcional)', consent: 'Autorizo el tratamiento de estos datos para verificar y gestionar la solicitud.',
    send: 'Enviar a revisión', sending: 'Enviando…', cancel: 'Cancelar',
    success: 'Solicitud enviada. El equipo revisará la evidencia antes de conceder acceso.',
    error: 'No se pudo enviar. Revisa los datos o inténtalo de nuevo.',
    close: 'Cerrar',
    methods: {
      official_domain_email: 'Email del dominio oficial',
      public_contact_code: 'Código en un contacto público',
      manual_business_evidence: 'Evidencia comercial descrita',
      administrative_review: 'Revisión administrativa',
    },
  },
};

export default function BusinessClaimDialog({ establishment, auth }) {
  const { language } = useLanguage();
  const copy = COPY[language];
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    responsibleName: auth?.user?.name || '', relationship: '',
    professionalEmail: auth?.user?.email || '', phone: '', officialUrl: '',
    verificationMethod: 'official_domain_email', evidenceDescription: '',
    additionalComment: '', consent: false,
  });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return undefined;
    dialogRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const focusable = [...dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      )];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const submit = async (event) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    try {
      await createBusinessClaim(establishment._id, form);
      setStatus('success');
    } catch {
      setError(copy.error);
      setStatus('idle');
    }
  };

  return (
    <section className="business-claim-card">
      <p>{copy.eyebrow}</p>
      <button ref={triggerRef} type="button" className="button-secondary" onClick={() => setOpen(true)}>{copy.action}</button>
      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
          <div ref={dialogRef} className="business-dialog" role="dialog" aria-modal="true" aria-labelledby="claim-title" tabIndex="-1">
            <button type="button" className="business-dialog__close" onClick={close} aria-label={copy.close}>×</button>
            <h2 id="claim-title">{copy.title}</h2>
            <p>{copy.intro}</p>
            {!auth?.user ? (
              <Link className="button-primary" to="/perfil">{copy.login}</Link>
            ) : status === 'success' ? (
              <div className="business-success" role="status">{copy.success}</div>
            ) : (
              <form onSubmit={submit}>
                <label>{copy.name}<input value={form.responsibleName} onChange={(e) => update('responsibleName', e.target.value)} required minLength="2" /></label>
                <label>{copy.relation}<input value={form.relationship} onChange={(e) => update('relationship', e.target.value)} required minLength="2" /></label>
                <label>{copy.email}<input type="email" value={form.professionalEmail} onChange={(e) => update('professionalEmail', e.target.value)} required /></label>
                <label>{copy.phone}<input value={form.phone} onChange={(e) => update('phone', e.target.value)} /></label>
                <label>{copy.url}<input type="url" placeholder="https://" value={form.officialUrl} onChange={(e) => update('officialUrl', e.target.value)} required /></label>
                <label>{copy.method}
                  <select value={form.verificationMethod} onChange={(e) => update('verificationMethod', e.target.value)}>
                    {Object.entries(copy.methods).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>{copy.evidence}<textarea value={form.evidenceDescription} onChange={(e) => update('evidenceDescription', e.target.value)} required minLength="10" /></label>
                <label>{copy.comment}<textarea value={form.additionalComment} onChange={(e) => update('additionalComment', e.target.value)} /></label>
                <label className="business-checkbox"><input type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} required /><span>{copy.consent}</span></label>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="business-dialog__actions">
                  <button type="button" className="button-secondary" onClick={close}>{copy.cancel}</button>
                  <button type="submit" className="button-primary" disabled={status === 'loading'}>{status === 'loading' ? copy.sending : copy.send}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
