// Original Port-Méridien residents, authored from the project bible §2.3.
// These are project designs, not franchise actor likenesses. Source PNGs keep
// their generated alpha; the existing primitive portraits remain the fallback.
import { getPlaceholderPortraitV188 } from './placeholder-portraits-v188.js';

const portrait = (slug, name, width, height) => Object.freeze({
  id: `colony-${slug}`, name, fallbackId: `placeholder-${slug}`,
  sign: getPlaceholderPortraitV188(`placeholder-${slug}`).sign,
  source: `/assets/colony/v188/${slug}.png`, sourceWidth: width, sourceHeight: height,
  framing: 'head-and-shoulders', sourcePixelsChanged: false
});

export const COLONY_PORTRAITS_V188 = Object.freeze([
  portrait('tomas-wren', 'TOMAS WREN', 1254, 1254),
  portrait('lucia-ferro', 'LUCIA FERRO', 1254, 1254),
  portrait('adele-sarrazin', 'ADÈLE SARRAZIN', 1254, 1254)
]);
const byId = new Map(COLONY_PORTRAITS_V188.map(entry => [entry.id, entry]));
const byFallback = new Map(COLONY_PORTRAITS_V188.map(entry => [entry.fallbackId, entry]));

/** Reuse the existing accent/case-tolerant speaker resolver, preserving IDs. */
export function getColonyPortraitV188(nameOrId) {
  return byId.get(nameOrId) || byFallback.get(getPlaceholderPortraitV188(nameOrId)?.id) || null;
}

function sourcePath(source) {
  try { return typeof source === 'string' && source ? new URL(source, 'http://portrait.invalid').pathname : null; }
  catch { return null; }
}

/** Paint exactly the admitted resident, uniformly scaled inside the frame.
 * Ownership of image loading stays with the dialogue and cinematic players;
 * no second cache, mask, tint, backdrop or source-pixel mutation is introduced. */
export function drawColonyPortraitV188(ctx, image, profile,
  { x = 0, y = 0, width = 384, height = width } = {}) {
  if (!ctx?.drawImage || byId.get(profile?.id) !== profile || !image?.complete
    || image.naturalWidth !== profile.sourceWidth || image.naturalHeight !== profile.sourceHeight
    || sourcePath(image.currentSrc || image.src) !== profile.source
    || ![x, y, width, height].every(Number.isFinite) || !(width > 0 && height > 0)) return null;
  const scale = Math.min(width / profile.sourceWidth, height / profile.sourceHeight);
  const target = { x: x + Math.max(0, (width - profile.sourceWidth * scale) / 2),
    y: y + Math.max(0, (height - profile.sourceHeight * scale) / 2),
    w: profile.sourceWidth * scale, h: profile.sourceHeight * scale };
  ctx.save();
  try {
    ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 0, 0, profile.sourceWidth, profile.sourceHeight,
      target.x, target.y, target.w, target.h);
  } finally { ctx.restore(); }
  return { kind: 'colony-portrait', id: profile.id, name: profile.name, sign: profile.sign,
    source: profile.source, sourceRect: [0, 0, profile.sourceWidth, profile.sourceHeight],
    target, scaleX: scale, scaleY: scale, sourcePixelsChanged: false };
}
