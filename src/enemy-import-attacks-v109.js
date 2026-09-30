import { ENEMY_IMPORT_ATTACK_DATA_V109 } from './enemy-import-attack-data-v109.js';
import { drawEnemyImportAnimationFrameV107, isEnemyImportAnimationImageReadyV107 } from './enemy-import-animation-v107.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const positive = value => Number.isFinite(value) && value > 0;
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

/** Rectangles and alpha bounds are right/bottom-exclusive, with normalized torso/ground pivots. */
export function createEnemyImportAttackV109(input) {
  const fail = message => { throw new Error(`Invalid imported attack: ${message}`); };
  if (!input || typeof input !== 'object') fail('input');
  const d = JSON.parse(JSON.stringify(input));
  if (d.reviewStatus !== 'accepted-multi-pose-adaptation' || d.posesVerified !== true || d.alphaVerified !== true
    || d.canonExact !== false) fail('unreviewed');
  if (!/^pose-/.test(d.profileId || '') || !hash(d.sourcePoseSha256) || !hash(d.sha256)) fail('identity');
  if (!/^\/assets\/openai\/sprites\/animated-import-v109\/[a-z0-9-]+\.png$/.test(d.path || '')) fail('path');
  if (d.action !== 'light' || d.clips !== undefined || d.loop !== undefined || d.fps !== undefined) fail('action');
  if (![d.sourceWidth, d.sourceHeight].every(n => Number.isInteger(n) && n > 0)
    || !positive(d.referenceHeight) || ![-1, 1].includes(d.sourceFacing)) fail('geometry');
  if (!Array.isArray(d.frames) || d.frames.length !== 4 || new Set(d.frames.map(f => f?.id)).size !== 4) fail('frames');
  const phases = ['preparation', 'windup', 'extension', 'recovery'];
  for (const [index, frame] of d.frames.entries()) {
    if (!frame || frame.id !== `light-${index}` || frame.phase !== phases[index]) fail('phase');
    if (!Array.isArray(frame.rect) || frame.rect.length !== 4 || !frame.rect.every(Number.isInteger)) fail('rectangle');
    const [x, y, w, h] = frame.rect;
    if (x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > d.sourceWidth || y + h > d.sourceHeight) fail('rectangle bounds');
    const b = frame.alphaBounds;
    if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isInteger)
      || b[0] < 0 || b[1] < 0 || b[2] <= b[0] || b[3] <= b[1] || b[2] > w || b[3] > h) fail('alpha bounds');
    if (!frame.pivot || ![frame.pivot.x, frame.pivot.y].every(n => Number.isFinite(n) && n >= 0 && n <= 1)
      || frame.pivot.x * w < b[0] || frame.pivot.x * w > b[2]
      || Math.abs(frame.pivot.y * h - b[3]) > 1e-8) fail('pivot');
    if (d.frames.slice(0, index).some(other => {
      const [xx, yy, ww, hh] = other.rect;
      return x < xx + ww && x + w > xx && y < yy + hh && y + h > yy;
    })) fail('overlapping frames');
  }
  // Only the identity and native pixels actually approved in V109 may enter this registry.
  if (d.profileId !== 'pose-v103-import-synth-workingjoe-classic'
    || d.sourcePoseSha256 !== 'c22e85f1bce901d74cd62f5616413ba0d1d365a354e3b5d601eb8d1c9a37f422'
    || d.sha256 !== 'fc69f1c078f66d69fd28091ce26dddffe70a880a552cd7681e7d17d7c950cbf7'
    || d.path !== '/assets/openai/sprites/animated-import-v109/synth-workingjoe-classic-light.png') fail('not admitted');
  const measured = [
    [[0, 0, 627, 627], [234, 12, 489, 618], [385 / 627, 618 / 627]],
    [[627, 0, 627, 627], [212, 12, 470, 618], [343.5 / 627, 618 / 627]],
    [[0, 627, 627, 627], [92, 10, 531, 614], [406 / 627, 614 / 627]],
    [[627, 627, 627, 627], [194, 11, 468, 614], [352.5 / 627, 614 / 627]]
  ];
  if (d.id !== 'attack-v109-workingjoe-classic-light' || d.sourceWidth !== 1254 || d.sourceHeight !== 1254
    || d.sourceFacing !== -1 || d.referenceHeight !== 606
    || d.label !== 'Xeno Trials : frappe légère 4 poses adaptées ; autres attaques fixes'
    || d.frames.some((f, index) => JSON.stringify([f.rect, f.alphaBounds, [f.pivot.x, f.pivot.y]])
      !== JSON.stringify(measured[index]))) fail('unreviewed geometry or qualification');
  return freeze(d);
}

export const ENEMY_IMPORT_ATTACKS_V109 = Object.freeze(ENEMY_IMPORT_ATTACK_DATA_V109.map(createEnemyImportAttackV109));

export function getEnemyImportAttackV109(definition) {
  return ENEMY_IMPORT_ATTACKS_V109.find(atlas => atlas.profileId === definition?.id
    && atlas.sourcePoseSha256 === definition.sha256) || null;
}

/** Read the real combat clock once; never start a separate timer or loop a strike. */
export function getEnemyImportAttackFrameV109(atlas, attack, spec, reducedMotion = false) {
  if (reducedMotion || atlas?.action !== 'light' || attack?.kind !== 'light'
    || !Number.isFinite(attack.age) || attack.age < 0
    || ![spec?.startup, spec?.active, spec?.recovery].every(positive)) return null;
  const total = spec.startup + spec.active + spec.recovery;
  if (!Number.isFinite(total) || attack.age >= total) return null;
  const index = attack.age < spec.startup / 2 ? 0 : attack.age < spec.startup ? 1
    : attack.age < spec.startup + spec.active ? 2 : 3;
  return atlas.frames?.[index] || null;
}

const attempted = new WeakMap();
const browserLoad = path => new Promise((resolve, reject) => {
  if (typeof globalThis.Image !== 'function') { reject(new Error('Image unavailable')); return; }
  const image = new globalThis.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = path;
});

/** Optional, once per image store, and guarded against a result arriving after runtime stop. */
export function requestEnemyImportAttackV109(images, definition, loadImage = browserLoad, isActive = () => true) {
  const atlas = getEnemyImportAttackV109(definition);
  if (!atlas || typeof images?.get !== 'function' || typeof images?.set !== 'function'
    || typeof images?.has !== 'function' || typeof loadImage !== 'function' || typeof isActive !== 'function') return;
  let keys = attempted.get(images); if (!keys) { keys = new Set(); attempted.set(images, keys); }
  if (keys.has(atlas.path) || images.has(atlas.path)) return;
  keys.add(atlas.path);
  Promise.resolve().then(() => isActive() ? loadImage(atlas.path) : null).then(image => {
    if (isActive() && isEnemyImportAnimationImageReadyV107(image, atlas)) images.set(atlas.path, image);
  }).catch(() => {});
}

/** Fixed-pose fallback remains the caller's responsibility whenever this returns false. */
export function drawEnemyImportAttackV109(ctx, definition, images, options = {}) {
  const atlas = getEnemyImportAttackV109(definition);
  const frame = getEnemyImportAttackFrameV109(atlas, options.attack, options.spec, options.reducedMotion);
  const image = atlas && images?.get(atlas.path);
  if (!frame || !isEnemyImportAnimationImageReadyV107(image, atlas)) return false;
  return drawEnemyImportAnimationFrameV107(ctx, definition, image, atlas, frame, options);
}
