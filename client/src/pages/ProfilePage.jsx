import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/auth';
import { deleteMyAccount, exportMyData } from '../services/users';
import ConfirmModal from '../components/ConfirmModal';
import PublicPageHeader from '../components/PublicPageHeader';
import { useLanguage } from '../i18n/index.jsx';

const PROFILE_COPY = {
  'pt-PT': {
    logout: 'Terminar sessão', admin: 'Abrir painel de moderação', data: 'Os teus dados',
    exportBusy: 'A gerar…', export: 'Descarregar os meus dados', exportError: 'Não foi possível gerar a exportação. Tenta novamente.',
    delete: 'Eliminar a minha conta', deleteError: 'Não foi possível eliminar a conta. Tenta novamente.',
    deleteTitle: 'Eliminar a tua conta?', deleteMessage: 'O perfil e todas as avaliações serão eliminados permanentemente. Esta ação não pode ser anulada.',
    deleteConfirm: 'Eliminar conta', sessionExpired: 'A tua sessão expirou. Inicia sessão novamente.',
    login: 'Iniciar sessão', register: 'Criar conta', name: 'Nome', email: 'Email', password: 'Palavra-passe',
    hidePassword: 'Ocultar palavra-passe', showPassword: 'Mostrar palavra-passe', hide: 'Ocultar', show: 'Mostrar',
    acceptPrefix: 'Li e aceito a', privacy: 'política de privacidade', genericError: 'Ocorreu um erro. Tenta novamente.',
    sending: 'A enviar…', enter: 'Entrar', noAccount: 'Ainda não tens conta? Cria uma', hasAccount: 'Já tens conta? Inicia sessão',
  },
  en: {
    logout: 'Log out', admin: 'Open moderation panel', data: 'Your data',
    exportBusy: 'Generating…', export: 'Download my data', exportError: 'We could not generate your export. Please try again.',
    delete: 'Delete my account', deleteError: 'We could not delete your account. Please try again.',
    deleteTitle: 'Delete your account?', deleteMessage: 'Your profile and all reviews will be permanently deleted. This cannot be undone.',
    deleteConfirm: 'Delete account', sessionExpired: 'Your session has expired. Please log in again.',
    login: 'Log in', register: 'Create account', name: 'Name', email: 'Email', password: 'Password',
    hidePassword: 'Hide password', showPassword: 'Show password', hide: 'Hide', show: 'Show',
    acceptPrefix: 'I have read and accept the', privacy: 'privacy policy', genericError: 'Something went wrong. Please try again.',
    sending: 'Sending…', enter: 'Log in', noAccount: 'No account yet? Create one', hasAccount: 'Already have an account? Log in',
  },
  es: {
    logout: 'Cerrar sesión', admin: 'Abrir panel de moderación', data: 'Tus datos',
    exportBusy: 'Generando…', export: 'Descargar mis datos', exportError: 'No pudimos generar tu exportación. Intenta de nuevo.',
    delete: 'Eliminar mi cuenta', deleteError: 'No pudimos eliminar tu cuenta. Intenta de nuevo.',
    deleteTitle: '¿Eliminar tu cuenta?', deleteMessage: 'Se borrarán tu perfil y todas tus reseñas de forma permanente. Esta acción no se puede deshacer.',
    deleteConfirm: 'Eliminar cuenta', sessionExpired: 'Tu sesión ha expirado. Inicia sesión de nuevo.',
    login: 'Iniciar sesión', register: 'Crear cuenta', name: 'Nombre', email: 'Email', password: 'Contraseña',
    hidePassword: 'Ocultar contraseña', showPassword: 'Mostrar contraseña', hide: 'Ocultar', show: 'Mostrar',
    acceptPrefix: 'He leído y acepto la', privacy: 'política de privacidad', genericError: 'Algo salió mal. Intenta de nuevo.',
    sending: 'Enviando…', enter: 'Entrar', noAccount: '¿No tienes cuenta? Crea una', hasAccount: '¿Ya tienes cuenta? Inicia sesión',
  },
};

const inputStyle = {
  width: '100%',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-input)',
  padding: '12px 14px',
  fontSize: '15px',
  marginBottom: '10px',
};

function AccountPanel({ auth }) {
  const { language } = useLanguage();
  const copy = PROFILE_COPY[language];
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const data = await exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mis-datos-glutenfri-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(copy.exportError);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount();
      auth.logout();
    } catch {
      setDeleteError(copy.deleteError);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>{auth.user.name}</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
        {auth.user.email}
      </p>

      <button
        onClick={auth.logout}
        style={{
          padding: '12px 20px',
          borderRadius: 'var(--radius-input)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontSize: '14px',
          marginBottom: '32px',
          display: 'block',
        }}
      >
        {copy.logout}
      </button>

      {auth.user.isAdmin && (
        <Link
          to="/admin"
          style={{
            display: 'block',
            padding: '12px 20px',
            borderRadius: 'var(--radius-input)',
            background: 'var(--color-accent-soft)',
            color: 'var(--color-accent)',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            margin: '-20px 0 24px',
          }}
        >
          {copy.admin}
        </Link>
      )}

      <h2 style={{ fontSize: '15px', marginBottom: '10px' }}>{copy.data}</h2>

      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-input)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '10px',
        }}
      >
        {exporting ? copy.exportBusy : copy.export}
      </button>
      {exportError && (
        <div style={{ color: 'var(--color-warn)', fontSize: '13px', marginBottom: '10px' }}>
          {exportError}
        </div>
      )}

      <button
        onClick={() => setShowDeleteModal(true)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-input)',
          border: '1px solid var(--color-warn)',
          background: 'var(--color-warn-soft)',
          color: 'var(--color-warn)',
          fontSize: '14px',
          fontWeight: 600,
        }}
      >
        {copy.delete}
      </button>
      {deleteError && (
        <div style={{ color: 'var(--color-warn)', fontSize: '13px', marginTop: '10px' }}>
          {deleteError}
        </div>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title={copy.deleteTitle}
          message={copy.deleteMessage}
          confirmLabel={copy.deleteConfirm}
          danger
          confirming={deleting}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default function ProfilePage({ auth }) {
  const { language, t } = useLanguage();
  const copy = PROFILE_COPY[language];
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (auth.user) {
    return (
      <div className="public-section-page">
        <PublicPageHeader title={t('profile')} />
        <main className="public-section-page__body">
          <AccountPanel auth={auth} />
        </main>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const action = mode === 'login' ? loginUser : registerUser;
      const payload =
        mode === 'login'
          ? { email, password }
          : { name, email, password, privacyAccepted: acceptedPrivacy };
      const data = await action(payload);
      auth.setSession(data);
    } catch {
      setError(copy.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="public-section-page">
      <PublicPageHeader title={t('profile')} />
      <main className="public-section-page__body" style={{ padding: '12px 16px 24px' }}>
      {auth.sessionExpired && (
        <div
          style={{
            background: 'var(--color-warn-soft)',
            color: 'var(--color-warn)',
            fontSize: '13px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-input)',
            marginBottom: '16px',
          }}
        >
          {copy.sessionExpired}
        </div>
      )}

      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>
        {mode === 'login' ? copy.login : copy.register}
      </h1>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            style={inputStyle}
            placeholder={copy.name}
            aria-label={copy.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          style={inputStyle}
          type="email"
          placeholder={copy.email}
          aria-label={copy.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            style={{ ...inputStyle, marginBottom: 0, paddingRight: '92px' }}
            type={showPassword ? 'text' : 'password'}
            placeholder={copy.password}
            aria-label={copy.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? copy.hidePassword : copy.showPassword}
            aria-pressed={showPassword}
            style={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              color: 'var(--color-accent)',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px',
              cursor: 'pointer',
            }}
          >
            {showPassword ? copy.hide : copy.show}
          </button>
        </div>

        {mode === 'register' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '13px',
              color: 'var(--color-text)',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              required
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            <span>
              {copy.acceptPrefix}{' '}
              <Link to="/privacidad" style={{ color: 'var(--color-accent)' }}>
                {copy.privacy}
              </Link>
            </span>
          </label>
        )}

        {error && (
          <div style={{ color: 'var(--color-warn)', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 'var(--radius-input)',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          {submitting ? copy.sending : mode === 'login' ? copy.enter : copy.register}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
        }}
      >
        {mode === 'login' ? copy.noAccount : copy.hasAccount}
      </button>

      <div style={{ marginTop: '24px' }}>
        <Link to="/privacidad" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
          {t('privacy')}
        </Link>
      </div>
      </main>
    </div>
  );
}
