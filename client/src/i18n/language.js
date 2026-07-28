export const DEFAULT_LANGUAGE = 'pt-PT';
export const SUPPORTED_LANGUAGES = ['pt-PT', 'en', 'es'];

export function normalizeLanguage(value) {
  if (value === 'pt') return 'pt-PT';
  return SUPPORTED_LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
}

export function readStoredLanguage(storage) {
  return normalizeLanguage(storage?.getItem?.('gf_language'));
}

export function persistLanguage(language, storage, documentElement) {
  const normalized = normalizeLanguage(language);
  storage?.setItem?.('gf_language', normalized);
  if (documentElement) documentElement.lang = normalized;
  return normalized;
}
