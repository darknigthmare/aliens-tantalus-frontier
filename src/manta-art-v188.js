// Original Tantalus hull, measured from the unchanged generated PNG. The
// chapter owns motion, collisions, access, weapons and persistence.
export const MANTA_ART_V188 = Object.freeze({
  id: 'manta-6-hull', imageKey: 'mantaHullV188',
  path: '/assets/abyss/v188/manta-6-hull.png', width: 1813, height: 868,
  sourceRect: Object.freeze([0, 0, 1813, 868]),
  anchor: Object.freeze([906.5, 434]), sourceFacing: 1,
  sha256: '9aa46795758c27e5871fdb561e3508e5298d6771109c9f5014618a287d629a07',
  canonExact: false, animationStatus: 'static-hull'
});
const loading = new WeakMap();

function ownsSource(image) {
  const source = image?.currentSrc || image?.src;
  if (typeof source !== 'string' || source.includes('\\')) return false;
  try {
    const origin = globalThis.location?.origin;
    const url = new URL(source, origin && origin !== 'null' ? `${origin}/` : 'https://manta.invalid/');
    return ['http:', 'https:'].includes(url.protocol) && !url.search && !url.hash && !url.username && !url.password
      && (!origin || origin === 'null' || url.origin === origin) && url.pathname === MANTA_ART_V188.path;
  } catch { return false; }
}

/** A same-size image with a foreign owner is never a valid replacement. */
export function mantaArtReadyV188(image) {
  return Boolean(image?.complete && image.naturalWidth === MANTA_ART_V188.width
    && image.naturalHeight === MANTA_ART_V188.height && ownsSource(image));
}

/** Call only on admitted abyss entry. Re-entry shares a pending/ready source;
 * an error may be retried there. Callbacks never draw or start a game loop. */
export function preloadMantaArtV188(images, { ImageCtor = globalThis.Image } = {}) {
  if (!(images instanceof Map) || typeof ImageCtor !== 'function') return;
  const prior = images.get(MANTA_ART_V188.imageKey);
  if (mantaArtReadyV188(prior)
    || prior && ownsSource(prior) && loading.get(prior) !== 'error' && !prior.complete) return;
  let image;
  try { image = new ImageCtor(); } catch { return; }
  images.set(MANTA_ART_V188.imageKey, image); loading.set(image, 'loading'); image.decoding = 'async';
  const finish = state => {
    if (loading.get(image) !== 'loading') return;
    loading.set(image, state);
    image.removeEventListener?.('load', loaded); image.removeEventListener?.('error', failed);
    if (!image.addEventListener) { image.onload = null; image.onerror = null; }
  };
  const loaded = () => finish(mantaArtReadyV188(image) ? 'ready' : 'error'), failed = () => finish('error');
  if (image.addEventListener) { image.addEventListener('load', loaded); image.addEventListener('error', failed); }
  else { image.onload = loaded; image.onerror = failed; }
  try { image.src = MANTA_ART_V188.path; } catch { failed(); }
  if (mantaArtReadyV188(image)) loaded();
}

/** Contain the full source, including its faint alpha margin. The source is
 * never cropped or stretched to make its opaque pixels fill the body box. */
export function mantaArtFitV188(body) {
  if (!body || ![body.x, body.y, body.w, body.h].every(Number.isFinite) || body.w <= 0 || body.h <= 0) return null;
  const scale = Math.min(body.w / MANTA_ART_V188.width, body.h / MANTA_ART_V188.height);
  return { x: body.x + body.w / 2, y: body.y + body.h / 2, scale,
    facing: body.facing < 0 ? -1 : 1,
    width: MANTA_ART_V188.width * scale, height: MANTA_ART_V188.height * scale };
}

export function drawMantaArtV188(ctx, images, body) {
  const fit = body?.active && mantaArtFitV188(body), image = images?.get?.(MANTA_ART_V188.imageKey);
  if (!fit || !mantaArtReadyV188(image)) return false;
  ctx.save();
  try {
    ctx.translate(fit.x, fit.y); ctx.scale(fit.scale * fit.facing, fit.scale);
    ctx.drawImage(image, ...MANTA_ART_V188.sourceRect, -MANTA_ART_V188.anchor[0], -MANTA_ART_V188.anchor[1],
      MANTA_ART_V188.width, MANTA_ART_V188.height);
  } finally { ctx.restore(); }
  return true;
}
