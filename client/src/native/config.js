export const MOBILE_APP_ID = 'pt.pixeltrendstudio.glutenfreeapp';
export const PUBLIC_SITE_ORIGIN = 'https://glutenfri.netlify.app';
export const MOBILE_API_URL = `${PUBLIC_SITE_ORIGIN}/api`;

export function validateMobileApiUrl(value) {
  const url = new URL(value);
  if (url.origin !== PUBLIC_SITE_ORIGIN || url.pathname !== '/api' || url.username || url.password || url.search || url.hash) {
    throw new Error('Native builds must use the approved GlutenFri HTTPS API.');
  }
  return url.href;
}
