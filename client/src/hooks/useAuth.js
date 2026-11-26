import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '../services/auth';
import { readStoredSession } from '../utils/authReliability.js';

// Mismas keys que el interceptor de services/api.js.
const TOKEN_KEY = 'gf_auth_token';
const USER_KEY = 'gf_auth_user';

function readStoredUser() {
  return readStoredSession(localStorage);
}

export function useAuth() {
  const [user, setUser] = useState(readStoredUser);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionMessage, setSessionMessage] = useState(null);
  const generation = useRef(0);

  const setSession = useCallback(({ token, user }) => {
    generation.current += 1;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
    setSessionExpired(false);
    setSessionMessage(null);
  }, []);

  const logout = useCallback(() => {
    generation.current += 1;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // services/api.js dispara este evento cuando un 401 llega con un token
  // guardado — significa que el JWT venció (o quedó inválido), no que el
  // usuario nunca inició sesión.
  useEffect(() => {
    const handleExpired = (event) => {
      generation.current += 1;
      setUser(null);
      setSessionExpired(true);
      setSessionMessage(event.detail || 'Tu sesión ha expirado. Inicia sesión de nuevo.');
    };
    window.addEventListener('gf:session-expired', handleExpired);
    return () => window.removeEventListener('gf:session-expired', handleExpired);
  }, []);

  // Revalida el perfil al montar para recoger cambios de rol (por ejemplo,
  // una cuenta promovida a admin) sin confiar en el objeto de localStorage.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    const current = ++generation.current;
    getCurrentUser()
      .then((currentUser) => {
        if (generation.current !== current) return;
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        // El interceptor global se ocupa de limpiar y notificar los 401.
      });
    return () => { generation.current += 1; };
  }, []);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
    setSessionMessage(null);
  }, []);

  return { user, setSession, logout, sessionExpired, sessionMessage, clearSessionExpired };
}
