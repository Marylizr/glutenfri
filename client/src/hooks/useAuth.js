import { useCallback, useState } from 'react';

// Mismas keys que el interceptor de services/api.js.
const TOKEN_KEY = 'gf_auth_token';
const USER_KEY = 'gf_auth_user';

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function useAuth() {
  const [user, setUser] = useState(readStoredUser);

  const setSession = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return { user, setSession, logout };
}
