/** The visible ship controls accept pointer, held keyboard and assistive click
 * input. Each press has an owner, so a cancelled touch cannot remain held or
 * release another finger's press. Runtime eligibility belongs to the caller. */
export function bindHubControlV133(button, { activate, release, canActivate = () => true, windowRef = globalThis,
  documentRef = globalThis.document } = {}) {
  const sources = new Set();
  const control = button.dataset.hubControl;
  const begin = source => {
    if (button.disabled || button.hidden || sources.has(source) || !canActivate()) return;
    const first = sources.size === 0;
    sources.add(source);
    if (first) activate(control);
  };
  const end = source => {
    if (!sources.delete(source)) return;
    if (!sources.size) release(control);
  };
  const clear = () => {
    if (!sources.size) return;
    sources.clear(); release(control);
  };
  const down = event => {
    if (event.button != null && event.button !== 0 || button.disabled || button.hidden) return;
    event.preventDefault();
    begin(`pointer:${event.pointerId}`);
    try { button.setPointerCapture?.(event.pointerId); } catch { /* A removed pointer needs no capture. */ }
  };
  const up = event => end(`pointer:${event.pointerId}`);
  const keydown = event => {
    if (!['Enter', 'Space'].includes(event.code)) return;
    event.preventDefault(); event.stopPropagation();
    if (!event.repeat) begin(`key:${event.code}`);
  };
  const keyup = event => {
    if (!['Enter', 'Space'].includes(event.code)) return;
    event.preventDefault(); event.stopPropagation(); end(`key:${event.code}`);
  };
  const click = event => {
    // Pointer presses were handled already. A screen-reader click has no
    // pointer sequence and receives the same single action as a keyboard tap.
    if (event.detail !== 0 || sources.size) return;
    begin('assistive-click'); end('assistive-click');
  };
  const buttonBlur = () => {
    for (const source of [...sources]) if (source.startsWith('key:')) end(source);
  };
  const visibility = () => { if (documentRef?.hidden) clear(); };
  const listeners = [['pointerdown', down], ['pointerup', up], ['pointercancel', up],
    ['lostpointercapture', up], ['keydown', keydown], ['keyup', keyup], ['click', click], ['blur', buttonBlur]];
  for (const [name, fn] of listeners) button.addEventListener(name, fn);
  windowRef.addEventListener?.('blur', clear);
  documentRef?.addEventListener?.('visibilitychange', visibility);
  return { clear, destroy() {
    clear();
    for (const [name, fn] of listeners) button.removeEventListener(name, fn);
    windowRef.removeEventListener?.('blur', clear);
    documentRef?.removeEventListener?.('visibilitychange', visibility);
  } };
}
