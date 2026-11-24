// Informational acknowledgement only: no optional trackers are enabled here.
export const COOKIE_NOTICE_KEY = 'gf_cookie_notice_v1';
export const COOKIE_NOTICE_OPEN = 'glutenfri:cookie-notice-open';

export function hasAcknowledgedCookieNotice(storage) {
  try { return storage?.getItem(COOKIE_NOTICE_KEY) === 'acknowledged'; }
  catch { return false; }
}

export function acknowledgeCookieNotice(storage) {
  try { storage?.setItem(COOKIE_NOTICE_KEY, 'acknowledged'); }
  catch { /* The notice can still close for this visit when storage is unavailable. */ }
}
