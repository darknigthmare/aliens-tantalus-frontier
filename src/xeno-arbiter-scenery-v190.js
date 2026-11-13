import { getXenoTrialsCorporateStageV190, getXenoTrialsStageAtlasPlanesV190 } from './xeno-trials-stage-scenes-v190.js';

// These five chapter settings reuse the four existing ARBITER atlases. They
// are not five new illustrations or canonical Weyland-Yutani architecture.
const assignments = [
  ['special-arbiter-02-gallery', 'xt190-executive-gallery'],
  ['special-arbiter-03-custody', 'xt190-executive-gallery'],
  ['special-arbiter-04-arbitration', 'xt190-adjudication-vault'],
  ['special-arbiter-05-isolation', 'xt190-evidence-stack'],
  ['special-arbiter-06-local', 'xt190-specimen-transfer']
];
export const ARBITER_SCENERY_V190 = Object.freeze(assignments.map(([campaignId, stageId]) => {
  const stage = getXenoTrialsCorporateStageV190(stageId);
  return Object.freeze({ campaignId, stageId, path: stage.backdrop, background: stage.background,
    accent: stage.accent, floor: stage.floor, width: 1280, height: 720, groundY: 570,
    source: 'four-reused-arbiter-atlases', canonExact: false, affectsGameplay: false });
}));
const scenery = new Map(ARBITER_SCENERY_V190.map(entry => [entry.campaignId, entry]));
const empty = Object.freeze([]);
export const getArbiterSceneryV190 = campaignId => scenery.get(campaignId) || null;
export const getArbiterSceneryAssetsV190 = campaignId => scenery.has(campaignId)
  ? Object.freeze([scenery.get(campaignId).path]) : empty;
const imageReady = image => Boolean(image?.complete === true && Number.isInteger(image.naturalWidth)
  && Number.isInteger(image.naturalHeight) && image.naturalWidth > 0 && image.naturalHeight > 0 && image.naturalHeight % 3 === 0);
const requests = new WeakMap();

/** The owning mission provides a dedicated path->Image Map and cancels this
 * handle at stop/start. No listener, closure, RAF or timer survives cancellation;
 * a late image event cannot repopulate a different mission's map. Failure is
 * optional scenery failure, so ready always resolves a boolean, never rejects.
 */
export function requestArbiterSceneryV190(images, campaignId, { ImageCtor = globalThis.Image, isActive = () => true } = {}) {
  const config = scenery.get(campaignId);
  const inert = loaded => Object.freeze({ path: config?.path || null, ready: Promise.resolve(loaded), cancel() {} });
  const active = () => { try { return isActive() === true; } catch { return false; } };
  if (!config || !images || typeof images.get !== 'function' || typeof images.set !== 'function'
    || typeof images.delete !== 'function' || !active()) return inert(false);
  const cached = images.get(config.path);
  if (imageReady(cached)) return inert(true);
  const pending = requests.get(images)?.get(config.path);
  if (cached && pending?.image === cached) return pending.handle;
  if (typeof ImageCtor !== 'function') return inert(false);
  let resolveReady, image = null, settled = false;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const cleanup = remove => {
    if (image) { image.onload = null; image.onerror = null; }
    if (remove && images.get(config.path) === image) images.delete(config.path);
    const owned = requests.get(images);
    if (owned?.get(config.path)?.handle === handle) owned.delete(config.path);
    if (owned?.size === 0) requests.delete(images);
  };
  const finish = successful => {
    if (settled) return;
    const loaded = Boolean(successful && active() && images.get(config.path) === image && imageReady(image));
    settled = true; cleanup(!loaded); resolveReady(loaded);
  };
  const handle = Object.freeze({ path: config.path, ready, cancel() {
    cleanup(true);
    if (!settled) { settled = true; resolveReady(false); }
  } });
  try {
    image = new ImageCtor();
    if (!active()) { finish(false); return handle; }
    image.decoding = 'async';
    image.onload = () => finish(true); image.onerror = () => finish(false);
    images.set(config.path, image);
    if (!requests.has(images)) requests.set(images, new Map());
    requests.get(images).set(config.path, { image, handle });
    image.src = config.path;
    // Cached browser resources may already be complete after assigning src.
    if (imageReady(image)) finish(true);
  } catch { finish(false); }
  return handle;
}

const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
function viewport(config, camera, options) {
  const width = clamp(finite(options.width, config.width), 320, 4096);
  const height = clamp(finite(options.height, config.height), 240, 2160);
  const x = finite(camera?.x, 0), y = finite(camera?.y, 0), floorWorld = finite(options.floor, config.groundY);
  return { width, height, camera: Object.freeze({ x, y }), floorWorld,
    floorScreen: clamp(floorWorld - y, 0, height), reducedMotion: options.reducedMotion === true };
}
function clip(ctx, box) { ctx.beginPath(); ctx.rect(box.x, box.y, box.width, box.height); ctx.clip(); }
function paintPlanes(ctx, config, image, screen, front) {
  if (!imageReady(image)) return empty;
  const drawn = [];
  for (const plane of getXenoTrialsStageAtlasPlanesV190(config.stageId, image)) {
    if ((plane.id === 'foreground') !== front) continue;
    const parallax = plane.id === 'far' ? .075 : front ? 1.12 : .32;
    const factor = Math.max(screen.width * 1.08 / plane.sw,
      (front ? Math.min(150, screen.height * .22) : screen.floorScreen) / plane.sh);
    const width = plane.sw * factor, height = plane.sh * factor;
    const y = front ? screen.height - height : screen.floorScreen - height;
    const origin = (screen.width - width) / 2 - screen.camera.x * parallax;
    const start = ((origin % width) + width) % width - width, xPositions = [];
    ctx.globalAlpha = plane.opacity;
    for (let x = start; x < screen.width; x += width) {
      ctx.drawImage(image, plane.sx, plane.sy, plane.sw, plane.sh, x, y, width, height); xPositions.push(x);
    }
    drawn.push(Object.freeze({ id: plane.id, path: config.path,
      sourceRect: Object.freeze([plane.sx, plane.sy, plane.sw, plane.sh]), parallax,
      destination: Object.freeze({ width, height, y, xPositions: Object.freeze(xPositions) }), tiles: xPositions.length }));
  }
  return Object.freeze(drawn);
}
function fallbackInterior(ctx, config, screen) {
  const floor = screen.floorScreen;
  ctx.fillStyle = '#142026'; ctx.fillRect(0, 0, screen.width, floor);
  ctx.fillStyle = '#1d2b2e'; ctx.fillRect(0, floor * .18, screen.width, floor * .68);
  ctx.fillStyle = '#0b1419'; ctx.fillRect(0, floor * .13, screen.width, 15);
  ctx.strokeStyle = config.accent; ctx.lineWidth = 2; ctx.globalAlpha = .24;
  const span = 290, offset = ((screen.camera.x * .32) % span + span) % span;
  for (let x = -span - offset; x < screen.width; x += span) {
    ctx.strokeRect(x + 30, floor * .25, 175, floor * .38);
    ctx.fillStyle = '#101c21'; ctx.fillRect(x + 34, floor * .25 + 4, 167, floor * .38 - 8);
    ctx.fillStyle = config.accent; ctx.fillRect(x + 85, floor * .16, 62, 3);
  }
}
function receipt(config, screen, image, drawnPlanes, clipBox) {
  return Object.freeze({ campaignId: config.campaignId, stageId: config.stageId, path: config.path,
    source: config.source, ...screen, loaded: drawnPlanes.length > 0,
    proceduralFallback: drawnPlanes.length === 0, imageWidth: imageReady(image) ? image.naturalWidth : 0,
    imageHeight: imageReady(image) ? image.naturalHeight : 0,
    drawnPlanes, clip: Object.freeze(clipBox), canonExact: false, affectsGameplay: false });
}

/** Screen-space backdrop: far and middle planes precede all mission bodies.
 * Mission 1 and unrelated campaigns return null, preserving their native draw.
 * Missing interior images draw opaque interior architecture, never the colony.
 */
export function drawArbiterBackdropV190(ctx, campaignId, images, camera = {}, options = {}) {
  const config = scenery.get(campaignId); if (!config) return null;
  const screen = viewport(config, camera, options), image = images?.get?.(config.path);
  const clipBox = { x: 0, y: 0, width: screen.width, height: screen.floorScreen };
  ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = config.background; ctx.fillRect(0, 0, screen.width, screen.height);
  ctx.save(); clip(ctx, clipBox);
  const drawnPlanes = paintPlanes(ctx, config, image, screen, false);
  if (!drawnPlanes.length) fallbackInterior(ctx, config, screen);
  ctx.restore(); ctx.globalAlpha = 1;
  ctx.fillStyle = config.floor; ctx.fillRect(0, screen.floorScreen, screen.width, screen.height - screen.floorScreen);
  ctx.fillStyle = config.accent; ctx.globalAlpha = .25; ctx.fillRect(0, screen.floorScreen, screen.width, 2);
  ctx.restore(); return receipt(config, screen, image, drawnPlanes, clipBox);
}

/** Only the bottom of the reused near plane is submitted after bodies. The
 * physical 570px floor, ladders, gate, player and mission state are untouched.
 */
export function drawArbiterForegroundV190(ctx, campaignId, images, camera = {}, options = {}) {
  const config = scenery.get(campaignId); if (!config) return null;
  const screen = viewport(config, camera, options), image = images?.get?.(config.path);
  const top = Math.min(screen.height, screen.floorScreen + 8);
  const clipBox = { x: 0, y: top, width: screen.width, height: screen.height - top };
  ctx.save(); clip(ctx, clipBox);
  const drawnPlanes = paintPlanes(ctx, config, image, screen, true);
  if (!drawnPlanes.length) {
    ctx.globalAlpha = 1; ctx.fillStyle = '#101b20'; ctx.fillRect(0, screen.height - 18, screen.width, 18);
    ctx.strokeStyle = config.accent; ctx.globalAlpha = .18; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, screen.height - 22); ctx.lineTo(screen.width, screen.height - 22); ctx.stroke();
  }
  ctx.restore(); return receipt(config, screen, image, drawnPlanes, clipBox);
}
