import { useState } from 'react';
import { loginUser, registerUser } from '../services/auth';

const inputStyle = {
  width: '100%',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-input)',
  padding: '12px 14px',
  fontSize: '15px',
  marginBottom: '10px',
};

export default function ProfilePage({ auth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (auth.user) {
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
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const action = mode === 'login' ? loginUser : registerUser;
      const payload = mode === 'login' ? { email, password } : { name, email, password };
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
          Tu sesión expiró. Iniciá sesión de nuevo.
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
        <input
          style={inputStyle}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

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
        {mode === 'login' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Iniciá sesión'}
      </button>
    </div>
  );
}
