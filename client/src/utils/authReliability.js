export function authErrorKey(error, reset = false) {
  if (error instanceof TypeError) return 'loadDataError';
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  if (code === 'RECOVERY_UNAVAILABLE') return 'authRecoveryUnavailable';
  if (code === 'RESET_INVALID') return 'authResetInvalid';
  if (status === 401) return 'authInvalidCredentials';
  if (status === 403) return 'authSuspended';
  if (status === 429) return 'authRateLimited';
  if (status >= 500) return 'authUnavailable';
  if (status === 400 || status === 409) return reset ? 'authPasswordPolicy' : 'authInvalidInput';
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return 'authTimeout';
  if (!error?.response) return 'authNetwork';
  return 'authUnavailable';
}

export function requireAuthUser(user) {
  if (!user || typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string' ||
      typeof user.isAdmin !== 'boolean') throw new TypeError('Invalid account response');
  return user;
}

export function requireAuthSession(payload) {
  if (!payload || typeof payload.token !== 'string' || !payload.token) throw new TypeError('Invalid session response');
  requireAuthUser(payload.user);
  return payload;
}

export function readStoredSession(storage) {
  try {
    if (!storage.getItem('gf_auth_token')) return null;
    const user = JSON.parse(storage.getItem('gf_auth_user'));
    if (!user || typeof user.id !== 'string' || typeof user.name !== 'string' || typeof user.email !== 'string') return null;
    // Cached roles never grant admin UI before /auth/me confirms them.
    return { ...user, isAdmin: false };
  } catch { return null; }
}

export function consumeResetToken(location, history) {
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get('reset');
  if (!token) return '';
  // Fragments are not sent in HTTP; remove before requesting other resources.
  history.replaceState(history.state, '', location.pathname + location.search);
  return /^[a-f0-9]{64}$/.test(token) ? token : 'invalid';
}
