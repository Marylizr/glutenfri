import { isNativeRuntime } from '../native/platform.js';
import { PUBLIC_SITE_ORIGIN } from '../native/config.js';

export function getCanonicalPlaceUrl(id, origin = window.location.origin, native = isNativeRuntime()) {
  const publicOrigin = native ? PUBLIC_SITE_ORIGIN : origin;
  return `${publicOrigin.replace(/\/$/, '')}/lugar/${encodeURIComponent(id)}`;
}

export async function copyText(text, environment = { navigator, document }) {
  if (environment.navigator?.clipboard?.writeText) {
    await environment.navigator.clipboard.writeText(text);
    return;
  }
  const textarea = environment.document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  environment.document.body.appendChild(textarea);
  textarea.select();
  const copied = environment.document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy_failed');
}

export async function sharePlace({ id, name, text }, environment = { navigator, document, location }) {
  const native = environment.native ?? isNativeRuntime();
  const url = getCanonicalPlaceUrl(id, environment.location.origin, native);
  if (native) {
    const { Share } = await (environment.loadNativeShare || (() => import('@capacitor/share')))();
    try { await Share.share({ title: name, text, url }); }
    catch (error) {
      // Both installed native implementations use this exact cancellation message.
      if (error?.message === 'Share canceled') throw Object.assign(new Error('Share canceled'), { name: 'AbortError' });
      throw error;
    }
    return { method: 'share', url };
  }
  if (environment.navigator?.share) {
    await environment.navigator.share({ title: name, text, url });
    return { method: 'share', url };
  }
  await copyText(url, environment);
  return { method: 'copy', url };
}
