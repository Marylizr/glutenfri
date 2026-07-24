import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/auth';
import { deleteMyAccount, exportMyData } from '../services/users';
import ConfirmModal from '../components/ConfirmModal';

const inputStyle = {
  width: '100%',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-input)',
  padding: '12px 14px',
  fontSize: '15px',
  marginBottom: '10px',
};

function AccountPanel({ auth }) {
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
      link.download = `mis-datos-gluten-free-app-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('No pudimos generar tu exportación. Intenta de nuevo.');
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
      setDeleteError('No pudimos eliminar tu cuenta. Intenta de nuevo.');
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
        Cerrar sesión
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
          Abrir panel de moderación
        </Link>
      )}

      <h2 style={{ fontSize: '15px', marginBottom: '10px' }}>Tus datos</h2>

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
        {exporting ? 'Generando…' : 'Descargar mis datos'}
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
        Eliminar mi cuenta
      </button>
      {deleteError && (
        <div style={{ color: 'var(--color-warn)', fontSize: '13px', marginTop: '10px' }}>
          {deleteError}
        </div>
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="¿Eliminar tu cuenta?"
          message="Se borra tu perfil y todas tus reseñas de forma permanente. Esta acción no se puede deshacer."
          confirmLabel="Eliminar cuenta"
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
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (auth.user) {
    return <AccountPanel auth={auth} />;
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
    } catch (err) {
      setError(err.response?.data?.error || 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px' }}>
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
          {auth.sessionMessage || 'Tu sesión ha expirado. Inicia sesión de nuevo.'}
        </div>
      )}

      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>
        {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
      </h1>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            style={inputStyle}
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          style={inputStyle}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            style={{ ...inputStyle, marginBottom: 0, paddingRight: '92px' }}
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
            {showPassword ? 'Ocultar' : 'Mostrar'}
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
              He leído y acepto la{' '}
              <Link to="/privacidad" style={{ color: 'var(--color-accent)' }}>
                política de privacidad
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
          {submitting ? 'Enviando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
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
        {mode === 'login' ? '¿No tienes cuenta? Crea una' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>

      <div style={{ marginTop: '24px' }}>
        <Link to="/privacidad" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
          Política de privacidad
        </Link>
      </div>
    </div>
  );
}
