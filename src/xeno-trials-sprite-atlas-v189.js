import { XENO_TRIALS_SPRITE_ATLAS_DATA_V189 } from './xeno-trials-sprite-atlas-data-v189.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_SPRITE_REFERENCES_V188, XENO_TRIALS_SPRITE_FRAME_IDS_V188,
  getXenoTrialsSpriteEnvelopeV188 } from './xeno-trials-sprite-atlas-v188.js';

const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const positive = value => Number.isFinite(value) && value > 0;
const tuple = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);
export const XENO_TRIALS_MOTION_FRAME_IDS_V189 = freeze([...Array.from({ length: 8 }, (_, index) => `walk-${index}`), 'air-rise', 'air-fall']);
export const XENO_TRIALS_COMBAT_FRAME_IDS_V189 = XENO_TRIALS_SPRITE_FRAME_IDS_V188;
export const XENO_TRIALS_PRIMARY_ACTIONS_V189 = freeze({ queen: 'foreclaw', 'crusher-acm': 'armored-head-contact', ravager: 'forearm-blade', burster: 'low-body-contact' });
export const XENO_TRIALS_SPRITE_REFERENCES_V189 = freeze({ ...XENO_TRIALS_SPRITE_REFERENCES_V188,
  queen: { profileId: 'castes-film_queen_aliens_1986', path: '/assets/user/castes-v87/film_queen_aliens_1986.png',
    sha256: '985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991', width: 1536, height: 1024, facing: 1,
    alphaBounds: [22, 26, 1525, 999], anatomy: 'crowned-biped', work: 'Aliens (1986)' },
  'crusher-acm': { profileId: 'castes-game_acm_crusher', path: '/assets/user/castes-v87/game_acm_crusher.png',
    sha256: 'eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa', width: 1536, height: 1024, facing: 1,
    alphaBounds: [12, 128, 1519, 907], anatomy: 'armored-quadruped', work: 'Aliens: Colonial Marines (2013)' },
  ravager: { profileId: 'castes-game_avp_extinction_ravager', path: '/assets/user/castes-v87/game_avp_extinction_ravager.png',
    sha256: '7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe', width: 1536, height: 1024, facing: 1,
    alphaBounds: [32, 49, 1502, 974], anatomy: 'blade-armed-biped', work: 'Aliens vs. Predator: Extinction (2003)' },
  burster: { profileId: 'castes-game_afe_burster', path: '/assets/user/castes-v87/game_afe_burster.png',
    sha256: 'b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13', width: 1536, height: 1024, facing: 1,
    alphaBounds: [21, 90, 1511, 945], anatomy: 'sac-bearing-quadruped', work: 'Aliens: Fireteam Elite (2021)' }
});
const constructed = new WeakSet();
const motionIds = new Set(Object.keys(XENO_TRIALS_SPRITE_REFERENCES_V188));
const visibleHeight = (atlas, metrics) => metrics?.visibleHeight ?? metrics?.height
  * (atlas.sourcePose.alphaBounds[3] - atlas.sourcePose.alphaBounds[1]) / atlas.sourcePose.height;

/** All poses share one scale. Air anchors retain the logical ground projection
 * under the pelvis; their free feet are never moved back onto the arena floor. */
export function createXenoTrialsSpriteAtlasV189(input) {
  const fail = message => { throw new Error(`Invalid Trials sprite atlas V189: ${message}`); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('input');
  const d = JSON.parse(JSON.stringify(input)), source = XENO_TRIALS_SPRITE_REFERENCES_V189[d.fighterId];
  const motion = d.kind === 'motion', combat = d.kind === 'combat';
  if (!source || d.profileId !== source.profileId || !(motion && motionIds.has(d.fighterId) || combat && Object.hasOwn(XENO_TRIALS_PRIMARY_ACTIONS_V189, d.fighterId))) fail('fighter identity or kind');
  if (!d.sourcePose || Object.keys(d.sourcePose).length !== Object.keys(source).length
    || Object.entries(source).some(([key, value]) => JSON.stringify(d.sourcePose[key]) !== JSON.stringify(value))) fail('source plate');
  if (d.reviewStatus !== 'accepted-drawn-atlas' || d.identityVerified !== true || d.alphaVerified !== true
    || d.anchorsVerified !== true || d.wholeBodyVerified !== true || d.canonExact !== false || d.fullLocomotion !== false
    || d.fullProne !== combat || d.movementCoverage !== (motion ? 'eight-step-loop-two-air-poses' : 'two-step-combat-keys')) fail('review or scope');
  if (combat && d.primaryAction !== XENO_TRIALS_PRIMARY_ACTIONS_V189[d.fighterId] || motion && d.primaryAction !== null) fail('anatomical primary action');
  if (!d.provenance || !['generation', 'reference'].every(key => typeof d.provenance[key] === 'string' && d.provenance[key].trim())) fail('provenance');
  const texture = d.texture;
  if (!texture || texture.path !== `/assets/openai/sprites/xeno-trials-v189/${d.fighterId}-${motion ? 'motion' : 'combat'}-sheet.png`
    || !hash(texture.sha256) || ![texture.width, texture.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192)
    || texture.width * texture.height > 16777216 || texture.facing !== 1) fail('texture');
  if (d.alphaBoundsThreshold !== 16 || d.cutEdgeAlphaMax !== 1 || d.supportAlphaMin !== 128
    || !Number.isFinite(d.lowAlphaMassFraction) || d.lowAlphaMassFraction < 0 || d.lowAlphaMassFraction >= .008) fail('alpha measurement');
  const ids = motion ? XENO_TRIALS_MOTION_FRAME_IDS_V189 : XENO_TRIALS_COMBAT_FRAME_IDS_V189;
  if (!positive(d.referenceHeight) || !Array.isArray(d.frames) || d.frames.length !== ids.length) fail('frames');
  for (const [index, frame] of d.frames.entries()) {
    if (!frame || frame.id !== ids[index]) fail('frame order');
    if (!tuple(frame.rect, 4) || !frame.rect.every(Number.isInteger)) fail('frame rectangle');
    const [x, y, w, h] = frame.rect;
    if (x < 0 || y < 0 || w < 4 || h < 4 || x + w > texture.width || y + h > texture.height) fail('rectangle bounds');
    const b = frame.alphaBounds, air = frame.id.startsWith('air-');
    if (!tuple(b, 4) || !b.every(Number.isInteger) || b[0] < 1 || b[1] < 1 || b[2] <= b[0] || b[3] <= b[1]
      || b[2] > w - 1 || b[3] > h - 1) fail('alpha bounds or clipped silhouette');
    if (!tuple(frame.anchor, 2) || frame.anchor[0] < 0 || frame.anchor[0] > w || frame.anchor[1] < 0 || frame.anchor[1] >= h
      || (!air && (frame.anchor[1] < b[3] - 1 || frame.anchor[1] > b[3] + 2))) fail('logical root anchor');
    if (motion && (!tuple(frame.pelvis, 2) || frame.pelvis[0] < b[0] || frame.pelvis[0] >= b[2]
      || frame.pelvis[1] < b[1] || frame.pelvis[1] >= b[3] || frame.anchor[0] !== frame.pelvis[0])) fail('pelvis registration');
    if (air && Math.abs(frame.anchor[1] - (frame.pelvis[1] + d.frames[0].anchor[1] - d.frames[0].pelvis[1])) > 1e-8) fail('air pelvis projection');
    if (!Array.isArray(frame.supports) || (air ? frame.supports.length !== 0 : frame.supports.length < 1 || frame.supports.length > 4)
      || frame.supports.some(p => !tuple(p, 2) || p[0] < b[0] || p[0] >= b[2] || p[1] < b[1] || p[1] >= b[3]
        || Math.abs(p[1] - frame.anchor[1]) > 4)) fail('support contacts');
    if (d.frames.slice(0, index).some(other => { const [xx, yy, ww, hh] = other.rect; return x < xx + ww && x + w > xx && y < yy + hh && y + h > yy; })) fail('overlapping frames');
  }
  const reference = d.frames[0].alphaBounds;
  if (Math.abs(d.referenceHeight - (reference[3] - reference[1])) > 1e-8) fail('neutral reference height');
  freeze(d); constructed.add(d); return d;
}
export const XENO_TRIALS_SPRITE_ATLASES_V189 = freeze(XENO_TRIALS_SPRITE_ATLAS_DATA_V189.map(createXenoTrialsSpriteAtlasV189));
const admitted = new Map(XENO_TRIALS_SPRITE_ATLASES_V189.map(atlas => [atlas.fighterId, atlas]));
export function getXenoTrialsSpriteAtlasV189(fighter, art) {
  const atlas = admitted.get(fighter?.id), source = atlas?.sourcePose;
  if (!atlas || getXenoTrialsFighterV96(fighter.id)?.profileId !== atlas.profileId
    || fighter.profileId !== undefined && fighter.profileId !== atlas.profileId
    || art?.id !== atlas.profileId || art.path !== source.path || art.sourceWidth !== source.width
    || art.sourceHeight !== source.height || art.sourceFacing !== source.facing || art.sha256 && art.sha256 !== source.sha256) return null;
  return atlas;
}
export function sampleXenoTrialsSpriteAtlasV189(atlas, fighter, options = {}) {
  if (!constructed.has(atlas) || fighter?.id !== atlas.fighterId || !Number.isFinite(fighter.hp)
    || !Number.isFinite(fighter.y) || fighter.y < 0 || options.blocked) return null;
  let id, phase;
  const cue = options.cue, height = visibleHeight(atlas, options.metrics);
  if (atlas.kind === 'motion') {
    if (fighter.hp <= 0 || fighter.attack || fighter.guard || fighter.stun > 0 || fighter.hitFlash > 0
      || ['hurt', 'guard-break', 'recover', 'ko'].includes(cue?.state)) return null;
    if (fighter.y > 0) {
      if (!Number.isFinite(fighter.vy)) return null;
      id = fighter.vy > 0 ? 'air-rise' : 'air-fall'; phase = id;
    } else {
      if (!options.moving || !Number.isFinite(options.distance) || !positive(height)) return null;
      const cycle = ((options.distance / (height * .66)) % 1 + 1) % 1;
      id = `walk-${options.reducedMotion ? 0 : Math.min(7, Math.floor(cycle * 8))}`; phase = 'move';
    }
  } else {
    if (fighter.y !== 0) return null;
    id = 'idle'; phase = 'idle';
    if (fighter.hp <= 0) {
      const p = cue?.state === 'ko' && Number.isFinite(cue.progress) ? cue.progress : 1;
      id = options.reducedMotion || p >= .65 ? 'ko-ground' : 'ko-fall'; phase = 'ko';
    } else if (['hurt', 'guard-break'].includes(cue?.state)) { id = 'hit-recoil'; phase = 'hurt'; }
    else if (fighter.attack) {
      const attack = fighter.attack, spec = options.spec;
      if (!['light', 'heavy'].includes(attack.kind) || !Number.isFinite(attack.age) || attack.age < 0
        || ![spec?.startup, spec?.active, spec?.recovery].every(positive) || attack.age >= spec.startup + spec.active + spec.recovery) return null;
      phase = attack.age < spec.startup ? 'windup' : attack.age < spec.startup + spec.active ? 'contact' : 'recovery';
      id = { windup: 'attack-windup', contact: 'attack-impact', recovery: 'attack-recovery' }[phase];
    } else if (fighter.guard) { id = 'guard'; phase = 'guard'; }
    else if (options.moving && fighter.stun <= 0 && !options.reducedMotion) {
      if (!Number.isFinite(options.distance) || !positive(height)) return null;
      const step = ((options.distance / (height * .33)) % 2 + 2) % 2; id = step < 1 ? 'walk-a' : 'walk-b'; phase = 'move';
    }
  }
  return Object.freeze({ atlas, frame: atlas.frames.find(frame => frame.id === id), phase, renderKind: 'drawn-sprite-atlas-v189', reducedMotion: options.reducedMotion === true });
}
export function getXenoTrialsSpriteLayoutV189(atlas, frame, metrics, { x, y, facing = 1 } = {}) {
  const height = atlas && visibleHeight(atlas, metrics);
  if (!constructed.has(atlas) || !atlas.frames.includes(frame) || ![x, y].every(Number.isFinite) || ![-1, 1].includes(facing) || !positive(height)) return null;
  const scale = height / atlas.referenceHeight, flip = facing === atlas.texture.facing ? 1 : -1;
  const [left, top, right, bottom] = frame.alphaBounds, [ax, ay] = frame.anchor;
  const a = (left - ax) * scale * flip, b = (right - ax) * scale * flip;
  return freeze({ scale, flip, x, y, bounds: { left: x + Math.min(a, b), right: x + Math.max(a, b), top: y + (top - ay) * scale, bottom: y + (bottom - ay) * scale },
    supports: frame.supports.map(p => [x + (p[0] - ax) * scale * flip, y + (p[1] - ay) * scale]) });
}
const ready = (image, atlas) => Boolean(image && image.complete !== false && Number(image.naturalWidth || image.width) === atlas.texture.width && Number(image.naturalHeight || image.height) === atlas.texture.height);
const browserLoad = path => new Promise((resolve, reject) => {
  if (typeof globalThis.Image !== 'function') { reject(new Error('Image unavailable')); return; }
  const image = new globalThis.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = path;
});
const requested = new WeakMap();
export function requestXenoTrialsSpriteAtlasV189(images, fighter, art, loadImage = browserLoad, isActive = () => true) {
  const atlas = getXenoTrialsSpriteAtlasV189(fighter, art);
  if (!atlas || !images?.get || !images?.set || typeof loadImage !== 'function' || typeof isActive !== 'function') return Promise.resolve(false);
  const path = atlas.texture.path;
  if (ready(images.get(path), atlas)) return Promise.resolve(true);
  let attempts = requested.get(images); if (!attempts) { attempts = new Map(); requested.set(images, attempts); }
  if (attempts.has(path)) return attempts.get(path);
  const attempt = Promise.resolve().then(() => isActive() ? loadImage(path) : null).then(image => {
    if (!isActive() || !ready(image, atlas)) return false; images.set(path, image); return true;
  }).catch(() => false);
  attempts.set(path, attempt); return attempt;
}
export function drawXenoTrialsSpriteAtlasV189(ctx, fighter, art, images, options = {}) {
  const atlas = getXenoTrialsSpriteAtlasV189(fighter, art), image = atlas && images?.get?.(atlas.texture.path);
  const selected = atlas && sampleXenoTrialsSpriteAtlasV189(atlas, fighter, options);
  if (!selected || !ready(image, atlas)) return null;
  const frame = selected.frame, layout = getXenoTrialsSpriteLayoutV189(atlas, frame, options.metrics, {
    x: options.x ?? fighter.x, y: options.y ?? 450 - fighter.y,
    facing: ['windup', 'contact', 'recovery'].includes(selected.phase) ? fighter.attack?.facing ?? options.facing ?? fighter.facing : options.facing ?? fighter.facing });
  if (!layout) return null;
  ctx.save(); ctx.translate(layout.x, layout.y); ctx.scale(layout.flip, 1);
  ctx.drawImage(image, ...frame.rect, -frame.anchor[0] * layout.scale, -frame.anchor[1] * layout.scale, frame.rect[2] * layout.scale, frame.rect[3] * layout.scale); ctx.restore();
  return { drawn: true, animation: 'drawn-sprite-atlas-v189', bounds: layout.bounds, supports: layout.supports,
    spriteAtlasV189: { fighterId: fighter.id, profileId: atlas.profileId, kind: atlas.kind, frameId: frame.id, phase: selected.phase,
      path: atlas.texture.path, sha256: atlas.texture.sha256, scale: layout.scale, grounded: fighter.y === 0,
      canonExact: false, fullLocomotion: false, fullProne: frame.id === 'ko-ground', movementCoverage: atlas.movementCoverage,
      primaryAction: atlas.primaryAction, reducedMotion: selected.reducedMotion } };
}
export function getXenoTrialsSpriteEnvelopeV189(fighter, art, metrics) {
  const old = getXenoTrialsSpriteEnvelopeV188(fighter, art, metrics), atlas = getXenoTrialsSpriteAtlasV189(fighter, art);
  if (!atlas) return old;
  const layouts = atlas.frames.map(frame => getXenoTrialsSpriteLayoutV189(atlas, frame, metrics, { x: fighter.x, y: -fighter.y, facing: fighter.facing }));
  if (layouts.some(layout => !layout)) return old;
  return { left: Math.min(old?.left ?? Infinity, ...layouts.map(layout => layout.bounds.left)), right: Math.max(old?.right ?? -Infinity, ...layouts.map(layout => layout.bounds.right)),
    top: Math.max(old?.top ?? -Infinity, -Math.min(...layouts.map(layout => layout.bounds.top))), bottom: Math.min(old?.bottom ?? Infinity, fighter.y) };
}
