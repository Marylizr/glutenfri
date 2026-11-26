/** Let overlays consume Back as Escape before navigating or minimizing. */
export function handleNativeBack({ document, pathname, historyIndex, navigate, minimize, makeEscape = () => new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }) }) {
  const escape = makeEscape();
  const hasDialog = Boolean(document.querySelector('[role="dialog"], [aria-modal="true"]'));
  document.dispatchEvent(escape);
  if (escape.defaultPrevented || hasDialog) return;
  if (pathname === '/' || pathname === '/explorar') void minimize().catch(() => {});
  else if (Number(historyIndex) > 0) navigate(-1);
  else navigate('/explorar', { replace: true });
}
