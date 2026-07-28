export function getCanonicalPlaceUrl(id, origin = window.location.origin) {
  return `${origin.replace(/\/$/, '')}/lugar/${encodeURIComponent(id)}`;
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
  const url = getCanonicalPlaceUrl(id, environment.location.origin);
  if (environment.navigator?.share) {
    await environment.navigator.share({ title: name, text, url });
    return { method: 'share', url };
  }
  await copyText(url, environment);
  return { method: 'copy', url };
}
