import { useCallback, useEffect, useState } from 'react';

// Mismas keys que el interceptor de services/api.js.
const TOKEN_KEY = 'gf_auth_token';
const USER_KEY = 'gf_auth_user';

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function useAuth() {
  const [user, setUser] = useState(readStoredUser);
  const [sessionExpired, setSessionExpired] = useState(false);

  const setSession = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
    setSessionExpired(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // services/api.js dispara este evento cuando un 401 llega con un token
  // guardado — significa que el JWT venció (o quedó inválido), no que el
  // usuario nunca inició sesión.
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setSessionExpired(true);
    };
    window.addEventListener('gf:session-expired', handleExpired);
    return () => window.removeEventListener('gf:session-expired', handleExpired);
  }, []);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  return { user, setSession, logout, sessionExpired, clearSessionExpired };
}
