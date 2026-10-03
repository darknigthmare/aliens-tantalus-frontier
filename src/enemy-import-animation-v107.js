import { ENEMY_IMPORT_ANIMATION_DATA_V108 } from './enemy-import-animation-data-v108.js';
import { ENEMY_IMPORT_ANIMATION_DATA_V114 } from './enemy-import-animation-data-v114.js';
import { ENEMY_IMPORT_ANIMATION_DATA_V118 } from './enemy-import-animation-data-v118.js';
import { ENEMY_IMPORT_ANIMATION_DATA_V122 } from './enemy-import-animation-data-v122.js';
// Presentation only: authored atlas poses never change actors, collisions or damage.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const positive = n => Number.isFinite(n) && n > 0;
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

/** Rectangles and alpha bounds are right/bottom-exclusive; pivots are frame-local. */
export function createEnemyImportAnimationV107(input) {
  const d = JSON.parse(JSON.stringify(input));
  const fail = message => { throw new Error(`Invalid imported animation: ${message}`); };
  if (d.reviewStatus !== 'accepted-multi-pose-adaptation' || d.posesVerified !== true || d.alphaVerified !== true) fail('unreviewed');
  if (!/^pose-/.test(d.profileId || '') || !hash(d.sourcePoseSha256) || !hash(d.sha256)) fail('identity');
  if (!/^\/assets\/openai\/sprites\/animated-import-v(?:10[78]|114|118|122)\/[a-z0-9-]+\.png$/.test(d.path || '')) fail('path');
  if (![d.sourceWidth, d.sourceHeight].every(n => Number.isInteger(n) && n > 0) || !positive(d.referenceHeight)
    || ![-1, 1].includes(d.sourceFacing)) fail('geometry');
  if (!Array.isArray(d.frames) || d.frames.length < 2 || new Set(d.frames.map(f => f.id)).size !== d.frames.length) fail('frames');
  for (const [index, frame] of d.frames.entries()) {
    if (!Array.isArray(frame.rect) || frame.rect.length !== 4 || !frame.rect.every(Number.isInteger)) fail('rectangle');
    const [x, y, w, h] = frame.rect;
    if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > d.sourceWidth || y + h > d.sourceHeight) fail('rectangle bounds');
    const b = frame.alphaBounds;
    if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isInteger)
      || b[0] < 0 || b[1] < 0 || b[2] <= b[0] || b[3] <= b[1] || b[2] > w || b[3] > h) fail('alpha bounds');
    if (!frame.pivot || ![frame.pivot.x, frame.pivot.y].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) fail('pivot');
    if (d.frames.slice(0, index).some(other => {
      const [xx, yy, ww, hh] = other.rect;
      return x < xx + ww && x + w > xx && y < yy + hh && y + h > yy;
    })) fail('overlapping frames');
  }
  // V107 admits only a reviewed walk. Other actions retain their original pose.
  const clip = d.clips?.move;
  if (Object.keys(d.clips || {}).some(name => name !== 'move') || !clip || !positive(clip.fps) || clip.fps > 30
    || clip.loop !== true || !Array.isArray(clip.frames) || new Set(clip.frames).size < 2
    || clip.frames.some(id => !d.frames.some(f => f.id === id))) fail('move clip');
  return freeze(d);
}

export const ENEMY_IMPORT_ANIMATIONS_V107 = Object.freeze([createEnemyImportAnimationV107({
  id: 'animation-v107-game-afe-synth-warden-walk', profileId: 'pose-v106-import-game-afe-synth-warden',
  path: '/assets/openai/sprites/animated-import-v107/game-afe-synth-warden-walk.png',
  sha256: '0b10074dc4d92e9b7cb5274cd7d8b846b0207ff0f0525c190451cc78ae4b4232',
  sourcePoseSha256: '019e4e3a3c1c184b8ded522ce17d129ba844965abbfbcb62d61d0f7598d9462e',
  sourceWidth: 1536, sourceHeight: 1024, sourceFacing: -1, referenceHeight: 495,
  reviewStatus: 'accepted-multi-pose-adaptation', posesVerified: true, alphaVerified: true,
  label: 'Marche : 4 poses adaptées ; autres actions fixes', canonExact: false,
  frames: [
    { id: 'walk-0', rect: [0, 0, 405, 512], alphaBounds: [37, 11, 388, 506], pivot: { x: 210 / 405, y: 506 / 512 } },
    { id: 'walk-1', rect: [405, 0, 360, 512], alphaBounds: [12, 11, 300, 506], pivot: { x: 191 / 360, y: 506 / 512 } },
    { id: 'walk-2', rect: [765, 0, 380, 512], alphaBounds: [28, 12, 369, 505], pivot: { x: 211 / 380, y: 505 / 512 } },
    { id: 'walk-3', rect: [1145, 0, 391, 512], alphaBounds: [27, 11, 338, 505], pivot: { x: 215 / 391, y: 505 / 512 } }
  ], clips: { move: { frames: ['walk-0', 'walk-1', 'walk-2', 'walk-3'], fps: 7, loop: true } }
})]);

export const ENEMY_IMPORT_ANIMATIONS_V108 = Object.freeze(ENEMY_IMPORT_ANIMATION_DATA_V108.map(createEnemyImportAnimationV107));
export const ENEMY_IMPORT_ANIMATIONS_V114 = Object.freeze(ENEMY_IMPORT_ANIMATION_DATA_V114.map(createEnemyImportAnimationV107));
export const ENEMY_IMPORT_ANIMATIONS_V118 = Object.freeze(ENEMY_IMPORT_ANIMATION_DATA_V118.map(createEnemyImportAnimationV107));
export const ENEMY_IMPORT_ANIMATIONS_V122 = Object.freeze(ENEMY_IMPORT_ANIMATION_DATA_V122.map(createEnemyImportAnimationV107));
const animations = Object.freeze([...ENEMY_IMPORT_ANIMATIONS_V107, ...ENEMY_IMPORT_ANIMATIONS_V108, ...ENEMY_IMPORT_ANIMATIONS_V114, ...ENEMY_IMPORT_ANIMATIONS_V118, ...ENEMY_IMPORT_ANIMATIONS_V122]);

export function getEnemyImportAnimationV107(definition) {
  return animations.find(d => d.profileId === definition?.id && d.sourcePoseSha256 === definition.sha256) || null;
}

export function getEnemyImportAnimationFrameV107(animation, action, timeSeconds, reducedMotion = false) {
  const clip = animation?.clips?.[action];
  if (!clip || !Number.isFinite(timeSeconds) || timeSeconds < 0) return null;
  const index = reducedMotion ? 0 : Math.floor(timeSeconds * clip.fps) % clip.frames.length;
  return animation.frames.find(frame => frame.id === clip.frames[index]) || null;
}

export function isEnemyImportAnimationImageReadyV107(image, animation) {
  return Boolean(image && image.complete !== false && animation
    && Number(image.naturalWidth || image.width) === animation.sourceWidth
    && Number(image.naturalHeight || image.height) === animation.sourceHeight);
}

const attempted = new WeakMap();
const browserLoad = path => new Promise((resolve, reject) => {
  if (typeof globalThis.Image !== 'function') { reject(new Error('Image unavailable')); return; }
  const image = new globalThis.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = path;
});
/** At most one optional request per image store. Failure never blocks a fixed pose. */
export function requestEnemyImportAnimationV107(images, definition, loadImage = browserLoad, isActive = () => true) {
  const animation = getEnemyImportAnimationV107(definition);
  if (!animation || !images?.get || !images?.set) return;
  let keys = attempted.get(images); if (!keys) { keys = new Set(); attempted.set(images, keys); }
  if (keys.has(animation.path) || images.has(animation.path)) return;
  keys.add(animation.path);
  Promise.resolve().then(() => isActive() ? loadImage(animation.path) : null).then(image => {
    if (isActive() && isEnemyImportAnimationImageReadyV107(image, animation)) images.set(animation.path, image);
  }).catch(() => {});
}

/** Trials moves x directly. Track observed displacement without adding save fields. */
export function createEnemyImportMotionTrackerV107() {
  const previous = new WeakMap();
  return (actor, timeSeconds) => {
    const old = previous.get(actor);
    if (old && timeSeconds === old.time) return old.moving;
    const moving = Boolean(old && timeSeconds > old.time && Math.abs(actor.x - old.x) > .01);
    previous.set(actor, { x: actor.x, time: timeSeconds, moving }); return moving;
  };
}

/** Draw actual atlas frames at constant stature, never stretch/warp the fixed PNG. */
export function drawEnemyImportAnimationV107(ctx, definition, images, options = {}) {
  const animation = getEnemyImportAnimationV107(definition);
  const frame = getEnemyImportAnimationFrameV107(animation, options.action, options.timeSeconds, options.reducedMotion);
  const image = animation && images?.get(animation.path);
  if (!frame || !isEnemyImportAnimationImageReadyV107(image, animation)) return false;
  return drawEnemyImportAnimationFrameV107(ctx, definition, image, animation, frame, options);
}

/** Shared presentation geometry for reviewed walks and engine-timed Trials attacks. */
export function drawEnemyImportAnimationFrameV107(ctx, definition, image, animation, frame, options = {}) {
  if (!frame || !animation?.frames?.includes(frame) || !isEnemyImportAnimationImageReadyV107(image, animation)) return false;
  const height = options.height ?? definition.renderHeight;
  const b = definition.alphaBounds || [0, 0, definition.sourceWidth, definition.sourceHeight];
  let scale = height * (b[3] - b[1]) / definition.sourceHeight / animation.referenceHeight;
  const extent = Math.max(...animation.frames.flatMap(f => [Math.abs(f.alphaBounds[0] - f.pivot.x * f.rect[2]), Math.abs(f.alphaBounds[2] - f.pivot.x * f.rect[2])]));
  if (positive(options.maxHorizontalExtent)) scale = Math.min(scale, options.maxHorizontalExtent / extent);
  if (!positive(scale) || ![options.x, options.y].every(Number.isFinite)) return false;
  const [sx, sy, sw, sh] = frame.rect;
  ctx.save(); ctx.translate(options.x, options.y);
  ctx.scale((options.facing === -1 ? -1 : 1) * animation.sourceFacing, 1);
  ctx.drawImage(image, sx, sy, sw, sh, -frame.pivot.x * sw * scale, -frame.pivot.y * sh * scale, sw * scale, sh * scale);
  ctx.restore(); return true;
}
