import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { NPC_MATTE_APERTURES_V164 } from './npc-matte-aperture-data-v164.js';

export { NPC_MATTE_APERTURES_V164 } from './npc-matte-aperture-data-v164.js';

/** A separate, explicit alpha policy for reviewed internal voids. V134 keeps
 * its original RGB-only edge correction and opaque-material guarantees. */
export const NPC_MATTE_RUNTIME_POLICY_V164 = Object.freeze({
  schema: 164, cacheEntries: 4, cacheBytes: 16 * 1024 * 1024,
  sourcePngsChanged: false, reviewedAssets: 4, maskedFrames: 16,
  maskedPixels: 1584, scope: 'exact-reviewed-opaque-internal-pockets'
});

const admitted = new Map(NPC_MATTE_APERTURES_V164.map(policy => [policy.path, policy]));
const compiled = new Map();
const cache = new Map();
const portraits = new WeakMap();
const stats = { preparations: 0, cacheHits: 0, drawRequests: 0, correctedDrawRequests: 0,
  failures: 0, sourceMismatches: 0, evictions: 0, retainedBytes: 0,
  changedPixels: 0, domRequests: 0, domCorrections: 0, domFallbacks: 0 };

function sourcePath(source) {
  if (typeof source !== 'string' || !source) return null;
  try { return new URL(source, 'http://npc-sprite.invalid').pathname; } catch { return null; }
}
function imagePath(image) { return sourcePath(image?.currentSrc || image?.src); }
function ready(image, policy) {
  return Boolean(policy && image?.complete && imagePath(image) === policy.path
    && image.naturalWidth === policy.width && image.naturalHeight === policy.height);
}
function compile(policy) {
  if (compiled.has(policy)) return compiled.get(policy);
  const indices = [], expected = [];
  for (const frame of policy.frames) for (const region of frame.regions) {
    let offset = 0;
    for (const [y, x0, x1] of region.runs) for (let x = x0; x < x1; x++) {
      indices.push((y * policy.width + x) * 4);
      for (let channel = 0; channel < 4; channel++, offset += 2) {
        expected.push(Number.parseInt(region.expectedRgbaHex.slice(offset, offset + 2), 16));
      }
    }
  }
  const result = { indices, expected: new Uint8ClampedArray(expected) };
  compiled.set(policy, result);
  return result;
}

/** Compare every admitted original RGBA byte before making a copy. Only the
 * alpha of the listed opaque background pixels changes; no colour key runs. */
export function repairNpcMatteAperturePixelsV164(pixels, policy) {
  if (!pixels || typeof pixels !== 'object') return null;
  const { data, width, height } = pixels;
  if (!policy || admitted.get(policy.path) !== policy || width !== policy.width || height !== policy.height
    || !ArrayBuffer.isView(data) || data.BYTES_PER_ELEMENT !== 1 || data.length !== width * height * 4) return null;
  const { indices, expected } = compile(policy);
  for (let pixel = 0; pixel < indices.length; pixel++) for (let channel = 0; channel < 4; channel++) {
    if (data[indices[pixel] + channel] !== expected[pixel * 4 + channel]) {
      return { data, changedPixels: 0, status: 'source-pixels-mismatch',
        sourceSignatureMatched: false, alphaChanged: false };
    }
  }
  const corrected = new Uint8ClampedArray(data);
  for (const at of indices) corrected[at + 3] = 0;
  return { data: corrected, changedPixels: indices.length, status: 'corrected',
    sourceSignatureMatched: true, alphaChanged: true };
}

function canvasFor(policy) {
  const canvas = globalThis.document?.createElement?.('canvas');
  if (!canvas?.getContext) return null;
  canvas.width = policy.width; canvas.height = policy.height;
  return canvas;
}
function touch(path, entry) { cache.delete(path); cache.set(path, entry); }
function admit(path, entry) {
  cache.set(path, entry); stats.retainedBytes += entry.bytes;
  while (cache.size > NPC_MATTE_RUNTIME_POLICY_V164.cacheEntries
    || stats.retainedBytes > NPC_MATTE_RUNTIME_POLICY_V164.cacheBytes) {
    const oldest = cache.keys().next().value, victim = cache.get(oldest);
    cache.delete(oldest); stats.retainedBytes -= victim.bytes; stats.evictions++;
  }
}
function prepare(image, edgeDrawable) {
  const policy = admitted.get(imagePath(image));
  if (!ready(image, policy)) return null;
  const existing = cache.get(policy.path);
  if (existing) { stats.cacheHits++; touch(policy.path, existing); return existing; }
  const fallback = { path: policy.path, width: policy.width, height: policy.height,
    drawable: null, bytes: 0, changedPixels: 0, sourceSignatureMatched: false,
    maskedFrames: [], status: 'unavailable' };
  try {
    const canvas = canvasFor(policy), ctx = canvas?.getContext?.('2d', { willReadFrequently: true });
    if (!ctx?.getImageData || !ctx?.putImageData) throw new Error('No readable canvas');
    ctx.drawImage(edgeDrawable || resolveSpriteDrawableV134(image), 0, 0);
    const pixels = ctx.getImageData(0, 0, policy.width, policy.height);
    const result = repairNpcMatteAperturePixelsV164(pixels, policy);
    if (!result || result.status !== 'corrected') {
      stats.sourceMismatches++;
      const entry = { ...fallback, status: result?.status || 'invalid-pixels' };
      admit(policy.path, entry); return entry;
    }
    pixels.data.set(result.data); ctx.putImageData(pixels, 0, 0);
    const entry = { ...fallback, drawable: canvas, bytes: policy.width * policy.height * 4,
      changedPixels: result.changedPixels, sourceSignatureMatched: true,
      maskedFrames: policy.frames.map(frame => frame.index), status: 'corrected' };
    stats.preparations++; stats.changedPixels += result.changedPixels;
    admit(policy.path, entry); return entry;
  } catch {
    stats.failures++; admit(policy.path, fallback); return fallback;
  }
}

/** Keep native Image readiness/geometry and share a bounded corrected drawable. */
export function resolveHumanSpriteDrawableV164(image) {
  stats.drawRequests++;
  const edgeDrawable = resolveSpriteDrawableV134(image);
  const entry = prepare(image, edgeDrawable);
  if (entry?.drawable) { stats.correctedDrawRequests++; return entry.drawable; }
  return edgeDrawable;
}

function maskSource(policy) {
  // An opaque black SVG is still opaque in alpha-mask mode. Instead the path
  // uses genuine holes, one disjoint source-pixel run at a time.
  const holes = policy.frames.flatMap(frame => frame.regions.flatMap(region => region.runs
    .map(([y, x0, x1]) => `M${x0} ${y}H${x1}V${y + 1}H${x0}Z`))).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${policy.width}" height="${policy.height}" viewBox="0 0 ${policy.width} ${policy.height}"><path fill="white" fill-rule="evenodd" d="M0 0H${policy.width}V${policy.height}H0Z${holes}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const maskSources = new Map(NPC_MATTE_APERTURES_V164.map(policy => [policy.path, maskSource(policy)]));
function clearMask(image) {
  if (!image?.style) return;
  for (const key of ['maskImage', 'webkitMaskImage', 'maskSize', 'webkitMaskSize',
    'maskMode', 'maskRepeat', 'webkitMaskRepeat']) image.style[key] = '';
}

/** Keep the existing img/src and its cell-0 CSS. Each new portrait invalidates
 * its preceding load callback and removes the old mask before assigning src. */
export function setNpcPortraitSourceV164(image, source) {
  if (!image) return false;
  stats.domRequests++;
  portraits.get(image)?.cleanup();
  clearMask(image);
  const policy = admitted.get(sourcePath(source));
  const token = { applied: false, cleanup: () => {} };
  const cleanup = () => {
    image.removeEventListener?.('load', onLoad);
    image.removeEventListener?.('error', onError);
  };
  const onError = () => {
    if (portraits.get(image) !== token) return;
    cleanup(); clearMask(image); stats.domFallbacks++;
  };
  const onLoad = () => {
    if (portraits.get(image) !== token || token.applied
      || sourcePath(image.src) !== policy?.path || imagePath(image) !== policy?.path || !image.complete) return;
    cleanup();
    if (!ready(image, policy)) { stats.domFallbacks++; return; }
    const entry = prepare(image);
    if (!entry?.sourceSignatureMatched || entry.status !== 'corrected') { stats.domFallbacks++; return; }
    token.applied = true;
    image.style.maskImage = image.style.webkitMaskImage = maskSources.get(policy.path);
    image.style.maskSize = image.style.webkitMaskSize = '100% 100%';
    image.style.maskMode = 'alpha';
    image.style.maskRepeat = image.style.webkitMaskRepeat = 'no-repeat';
    stats.domCorrections++;
  };
  token.cleanup = cleanup;
  portraits.set(image, token);
  if (policy) {
    image.addEventListener?.('load', onLoad);
    image.addEventListener?.('error', onError);
  }
  image.src = source;
  if (policy) onLoad();
  return Boolean(policy);
}

/** Read-only diagnostics. No mutation, cache-reset or game-state hook. */
export function getNpcMatteApertureSnapshotV164() {
  return { schema: 164, ...stats, retainedEntries: cache.size,
    assets: [...cache.values()].map(({ drawable, ...entry }) => ({ ...entry,
      maskedFrames: [...entry.maskedFrames], correctedDrawable: Boolean(drawable) })) };
}
