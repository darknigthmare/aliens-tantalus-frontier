// V188 — opening credit before the title screen: "A fan game by Darknigthmare"
// on the title's own starfield. The title screen is prepared underneath and
// its images are decoded while the credit plays, so the menu is revealed by a
// cross-fade and never pops in. Any key, click or touch skips to the fade.

export const INTRO_SESSION_KEY_V188 = 'atf-intro-seen-v188';
export const INTRO_TIMING_V188 = Object.freeze({
  // Full credit on the first load of a browser session; a short starfield fade on reloads.
  full: Object.freeze({ hold: 4200 }),
  short: Object.freeze({ hold: 600 }),
  textOut: 700,
  fade: 1100,
  maxWait: 8000
});

export function introModeV188(storage) {
  try { return storage?.getItem?.(INTRO_SESSION_KEY_V188) === '1' ? 'short' : 'full'; } catch { return 'full'; }
}

/** Every bitmap the title screen shows: <img> sources and CSS background images. */
export function collectTitleImageUrlsV188(root, getStyle = globalThis.getComputedStyle?.bind(globalThis)) {
  const urls = new Set();
  if (!root?.querySelectorAll) return [];
  for (const element of [root, ...root.querySelectorAll('*')]) {
    if (element.tagName === 'IMG' && !element.hidden) { const src = element.currentSrc || element.src; if (src) urls.add(src); }
    const background = getStyle ? getStyle(element)?.backgroundImage : '';
    for (const match of String(background || '').matchAll(/url\(["']?([^"')]+)["']?\)/g)) if (!match[1].startsWith('data:')) urls.add(match[1]);
  }
  return [...urls];
}

/** Resolves when every image is decoded (or failed), or after `timeout` ms. */
export function preloadImagesV188(urls, { timeout = INTRO_TIMING_V188.maxWait, createImage = () => new Image(), setTimer = setTimeout } = {}) {
  const jobs = urls.map(url => new Promise(resolve => {
    const image = createImage();
    image.onload = image.onerror = () => resolve(url);
    image.src = url;
    if (typeof image.decode === 'function') image.decode().then(() => resolve(url), () => resolve(url));
  }));
  return Promise.race([Promise.all(jobs), new Promise(resolve => setTimer(() => resolve(null), timeout))]);
}

const wait = (ms, setTimer) => new Promise(resolve => setTimer(resolve, ms));

/**
 * Plays the credit over `overlay`, waits for the title images, then fades out
 * and removes the overlay. `prepareTitle` shows the title screen underneath.
 */
export async function playIntroV188({ overlay, prepareTitle = () => {}, titleRoot = null, storage = globalThis.sessionStorage,
  reducedMotion = false, setTimer = setTimeout, target = globalThis, getStyle } = {}) {
  if (!overlay) { prepareTitle(); return 'no-overlay'; }
  const mode = introModeV188(storage);
  overlay.dataset.mode = mode;
  overlay.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
  overlay.dataset.phase = 'credit';
  let skip = null;
  const skipped = new Promise(resolve => { skip = resolve; });
  const swallow = event => {
    // The credit owns the input until it has faded: no key reaches the title menu underneath.
    event.preventDefault?.(); event.stopImmediatePropagation?.();
    if (event.type === 'keydown' && ['Tab', 'F5', 'F12'].includes(event.key)) return;
    skip('skipped');
  };
  target.addEventListener?.('keydown', swallow, true);
  overlay.addEventListener?.('pointerdown', swallow);
  try {
    prepareTitle();
    const urls = collectTitleImageUrlsV188(titleRoot, getStyle);
    const loaded = preloadImagesV188(urls, { setTimer });
    const hold = Promise.all([wait(INTRO_TIMING_V188[mode].hold, setTimer), loaded]);
    const how = await Promise.race([hold.then(() => 'complete'), skipped]);
    try { storage?.setItem?.(INTRO_SESSION_KEY_V188, '1'); } catch { /* Session memory is optional. */ }
    if (mode === 'full' && how === 'complete') { overlay.dataset.phase = 'text-out'; await wait(INTRO_TIMING_V188.textOut, setTimer); }
    overlay.dataset.phase = 'fade';
    await wait(INTRO_TIMING_V188.fade, setTimer);
    return how;
  } finally {
    target.removeEventListener?.('keydown', swallow, true);
    overlay.removeEventListener?.('pointerdown', swallow);
    overlay.remove?.();
  }
}
