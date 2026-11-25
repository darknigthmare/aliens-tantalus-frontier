import { XENO_TRIALS_SPRITE_ATLAS_DATA_V188 } from './xeno-trials-sprite-atlas-data-v188.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';

const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const positive = value => Number.isFinite(value) && value > 0;
const clamp = value => Math.max(0, Math.min(1, value));
export const XENO_TRIALS_SPRITE_FRAME_IDS_V188 = freeze(['idle', 'walk-a', 'walk-b', 'attack-windup',
  'attack-impact', 'attack-recovery', 'guard', 'hit-recoil', 'ko-fall', 'ko-ground']);
// Exact existing fan-made plates; the new drawings do not certify a film/game
// reconstruction or alter those historical PNGs, collision or biological size.
export const XENO_TRIALS_SPRITE_REFERENCES_V188 = freeze({
  warrior: { profileId: 'castes-film_warrior_aliens_1986', path: '/assets/user/castes-v87/film_warrior_aliens_1986.png',
    sha256: 'c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f', width: 1536, height: 1024, facing: 1,
    alphaBounds: [65, 26, 1465, 1002], anatomy: 'biped', work: 'Aliens (1986)' },
  runner: { profileId: 'castes-film_runner_alien3_1992', path: '/assets/user/castes-v87/film_runner_alien3_1992.png',
    sha256: 'f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3', width: 1536, height: 1024, facing: 1,
    alphaBounds: [48, 248, 1510, 841], anatomy: 'quadruped', work: 'Alien 3 (1992)' },
  prowler: { profileId: 'castes-game_afe_prowler', path: '/assets/user/castes-v87/game_afe_prowler.png',
    sha256: '48edd1af2710048a065433b9e2c8dc20a03b05bc0a46a47394704f3a0c8bd544', width: 1536, height: 1024, facing: 1,
    alphaBounds: [38, 10, 1511, 1011], anatomy: 'quadruped', work: 'Aliens: Fireteam Elite (2021)' },
  spitter: { profileId: 'castes-game_acm_spitter', path: '/assets/user/castes-v87/game_acm_spitter.png',
    sha256: 'c281ad7c020999e2796af1c904be45c028bd8643e45bfc45b93edaf5ba4642c7', width: 1536, height: 1024, facing: 1,
    alphaBounds: [22, 19, 1510, 1003], anatomy: 'biped', work: 'Aliens: Colonial Marines (2013)' }
});
const constructed = new WeakSet();
const tuple = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);

/** Rectangles and alpha bounds are right/bottom-exclusive. A single measured
 * idle height determines ALL frame scales, including the horizontal corpse.
 * The factory validates a contract; only the separate reviewed registry admits
 * a sheet to runtime lookup. A factory result alone cannot replace a fighter.
 */
export function createXenoTrialsSpriteAtlasV188(input) {
  const fail = message => { throw new Error(`Invalid Trials sprite atlas: ${message}`); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('input');
  const d = JSON.parse(JSON.stringify(input)), source = XENO_TRIALS_SPRITE_REFERENCES_V188[d.fighterId];
  if (!source || d.profileId !== source.profileId) fail('fighter identity');
  if (!d.sourcePose || Object.keys(d.sourcePose).length !== Object.keys(source).length
    || Object.entries(source).some(([key, value]) => JSON.stringify(d.sourcePose[key]) !== JSON.stringify(value))) fail('source plate');
  if (d.reviewStatus !== 'accepted-drawn-atlas' || d.identityVerified !== true || d.alphaVerified !== true
    || d.anchorsVerified !== true || d.wholeBodyVerified !== true || d.canonExact !== false
    || d.fullLocomotion !== false || d.fullProne !== true) fail('review');
  if (!d.provenance || typeof d.provenance !== 'object' || typeof d.provenance.generation !== 'string'
    || !d.provenance.generation.trim() || typeof d.provenance.reference !== 'string' || !d.provenance.reference.trim()) fail('provenance');
  const texture = d.texture;
  if (!texture || texture.path !== `/assets/openai/sprites/xeno-trials-v188/${d.fighterId}-combat-sheet.png`
    || !hash(texture.sha256) || ![texture.width, texture.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192)
    || texture.width * texture.height > 16777216 || texture.facing !== 1) fail('texture');
  // Generated antialiasing contains a faint alpha=1 haze. The silhouettes and
  // contacts use declared measured thresholds; no PNG pixels are rewritten.
  if (d.alphaBoundsThreshold !== 16 || d.cutEdgeAlphaMax !== 1 || d.supportAlphaMin !== 128
    || !Number.isFinite(d.lowAlphaMassFraction) || d.lowAlphaMassFraction < 0 || d.lowAlphaMassFraction >= .008) fail('alpha measurement');
  if (!positive(d.referenceHeight) || !Array.isArray(d.frames) || d.frames.length !== 10) fail('frames');
  for (const [index, frame] of d.frames.entries()) {
    if (!frame || frame.id !== XENO_TRIALS_SPRITE_FRAME_IDS_V188[index]) fail('frame order');
    if (!tuple(frame.rect, 4) || !frame.rect.every(Number.isInteger)) fail('frame rectangle');
    const [x, y, w, h] = frame.rect;
    if (x < 0 || y < 0 || w < 4 || h < 4 || x + w > texture.width || y + h > texture.height) fail('rectangle bounds');
    const b = frame.alphaBounds;
    if (!tuple(b, 4) || !b.every(Number.isInteger) || b[0] < 1 || b[1] < 1 || b[2] <= b[0] || b[3] <= b[1]
      || b[2] > w - 1 || b[3] > h - 1) fail('alpha bounds or clipped silhouette');
    const anchor = frame.anchor;
    if (!tuple(anchor, 2) || anchor[0] < 0 || anchor[0] > w || anchor[1] < 0 || anchor[1] > h
      || anchor[1] < b[3] - 1 || anchor[1] > b[3] + 2) fail('ground anchor');
    if (!Array.isArray(frame.supports) || !frame.supports.length || frame.supports.length > 4
      || frame.supports.some(p => !tuple(p, 2) || p[0] < b[0] || p[0] >= b[2] || p[1] < b[1] || p[1] >= b[3]
        || Math.abs(p[1] - anchor[1]) > 4)) fail('ground supports');
    if (d.frames.slice(0, index).some(other => {
      const [xx, yy, ww, hh] = other.rect;
      return x < xx + ww && x + w > xx && y < yy + hh && y + h > yy;
    })) fail('overlapping frames');
  }
  const idle = d.frames[0].alphaBounds;
  if (Math.abs(d.referenceHeight - (idle[3] - idle[1])) > 1e-8) fail('idle reference height');
  freeze(d); constructed.add(d); return d;
}

export const XENO_TRIALS_SPRITE_ATLASES_V188 = freeze(XENO_TRIALS_SPRITE_ATLAS_DATA_V188.map(createXenoTrialsSpriteAtlasV188));
const admitted = new Map(XENO_TRIALS_SPRITE_ATLASES_V188.map(atlas => [atlas.fighterId, atlas]));
export function getXenoTrialsSpriteAtlasV188(fighter, art) {
  const atlas = admitted.get(fighter?.id), definition = atlas && getXenoTrialsFighterV96(fighter.id), source = atlas?.sourcePose;
  if (!atlas || !definition || definition.profileId !== atlas.profileId
    || fighter.profileId !== undefined && fighter.profileId !== atlas.profileId
    || art?.id !== atlas.profileId || art.path !== source.path || art.sourceWidth !== source.width
    || art.sourceHeight !== source.height || art.sourceFacing !== source.facing
    || art.sha256 && art.sha256 !== source.sha256) return null;
  return atlas;
}

/** Engine clocks select key drawings; no independent animation timer, damage,
 * targeting, stature, collision, actor history or saved fields are written. */
export function sampleXenoTrialsSpriteAtlasV188(atlas, fighter, options = {}) {
  if (!constructed.has(atlas) || fighter?.id !== atlas.fighterId || !Number.isFinite(fighter.hp)
    || fighter.y !== 0 || options.blocked) return null;
  const cue = options.cue;
  let id = 'idle', phase = 'idle';
  if (fighter.hp <= 0) {
    const p = cue?.state === 'ko' && Number.isFinite(cue.progress) ? clamp(cue.progress) : 1;
    id = options.reducedMotion || p >= .65 ? 'ko-ground' : 'ko-fall'; phase = 'ko';
  } else if (cue?.state === 'hurt' || cue?.state === 'guard-break') { id = 'hit-recoil'; phase = 'hurt'; }
  else if (fighter.attack) {
    const attack = fighter.attack, spec = options.spec;
    // These drawings depict a primary claw strike, never acid, a leap, a
    // detonation, a restraining capture, or a super's invented choreography.
    if (!['light', 'heavy'].includes(attack.kind) || !Number.isFinite(attack.age) || attack.age < 0
      || ![spec?.startup, spec?.active, spec?.recovery].every(positive)) return null;
    const end = spec.startup + spec.active + spec.recovery;
    if (attack.age >= end) return null;
    phase = attack.age < spec.startup ? 'windup' : attack.age < spec.startup + spec.active ? 'contact' : 'recovery';
    id = { windup: 'attack-windup', contact: 'attack-impact', recovery: 'attack-recovery' }[phase];
  } else if (fighter.guard) { id = 'guard'; phase = 'guard'; }
  else if (options.moving && fighter.stun <= 0 && !options.reducedMotion) {
    if (!Number.isFinite(options.distance)) return null;
    const worldHeight = options.metrics?.visibleHeight ?? options.metrics?.height
      * (atlas.sourcePose.alphaBounds[3] - atlas.sourcePose.alphaBounds[1]) / atlas.sourcePose.height;
    if (!positive(worldHeight)) return null;
    const step = ((options.distance / (worldHeight * .33)) % 2 + 2) % 2;
    id = step < 1 ? 'walk-a' : 'walk-b'; phase = 'move';
  }
  const frame = atlas.frames.find(frame => frame.id === id);
  return Object.freeze({ atlas, frame, phase, renderKind: 'drawn-sprite-atlas-v188', reducedMotion: options.reducedMotion === true });
}

export function getXenoTrialsSpriteLayoutV188(atlas, frame, metrics, { x, y, facing = 1 } = {}) {
  if (!constructed.has(atlas) || !atlas.frames.includes(frame) || ![x, y].every(Number.isFinite)
    || ![-1, 1].includes(facing)) return null;
  const visibleHeight = metrics?.visibleHeight ?? metrics?.height
    * (atlas.sourcePose.alphaBounds[3] - atlas.sourcePose.alphaBounds[1]) / atlas.sourcePose.height;
  if (!positive(visibleHeight)) return null;
  const scale = visibleHeight / atlas.referenceHeight, flip = facing === atlas.texture.facing ? 1 : -1;
  const [left, top, right, bottom] = frame.alphaBounds, [ax, ay] = frame.anchor;
  const first = (left - ax) * scale * flip, second = (right - ax) * scale * flip;
  return Object.freeze({ scale, flip, x, y,
    bounds: Object.freeze({ left: x + Math.min(first, second), right: x + Math.max(first, second),
      top: y + (top - ay) * scale, bottom: y + (bottom - ay) * scale }),
    supports: Object.freeze(frame.supports.map(p => Object.freeze([x + (p[0] - ax) * scale * flip, y + (p[1] - ay) * scale]))) });
}

const ready = (image, atlas) => Boolean(image && image.complete !== false
  && Number(image.naturalWidth || image.width) === atlas.texture.width
  && Number(image.naturalHeight || image.height) === atlas.texture.height);
const browserLoad = path => new Promise((resolve, reject) => {
  if (typeof globalThis.Image !== 'function') { reject(new Error('Image unavailable')); return; }
  const image = new globalThis.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = path;
});
const requested = new WeakMap();
export function requestXenoTrialsSpriteAtlasV188(images, fighter, art, loadImage = browserLoad, isActive = () => true) {
  const atlas = getXenoTrialsSpriteAtlasV188(fighter, art);
  if (!atlas || !images?.get || !images?.set || typeof loadImage !== 'function' || typeof isActive !== 'function') return Promise.resolve(false);
  const path = atlas.texture.path;
  if (ready(images.get(path), atlas)) return Promise.resolve(true);
  let attempts = requested.get(images);
  if (!attempts) { attempts = new Map(); requested.set(images, attempts); }
  if (attempts.has(path)) return attempts.get(path);
  const attempt = Promise.resolve().then(() => isActive() ? loadImage(path) : null).then(image => {
    if (!isActive() || !ready(image, atlas)) return false;
    images.set(path, image); return true;
  }).catch(() => false);
  attempts.set(path, attempt); return attempt;
}

export function drawXenoTrialsSpriteAtlasV188(ctx, fighter, art, images, options = {}) {
  const atlas = getXenoTrialsSpriteAtlasV188(fighter, art), image = atlas && images?.get?.(atlas.texture.path);
  const selected = atlas && sampleXenoTrialsSpriteAtlasV188(atlas, fighter, options);
  if (!selected || !ready(image, atlas)) return null;
  const frame = selected.frame;
  const layout = getXenoTrialsSpriteLayoutV188(atlas, frame, options.metrics,
    { x: options.x ?? fighter.x, y: options.y ?? 450 - fighter.y,
      facing: ['windup', 'contact', 'recovery'].includes(selected.phase)
        ? fighter.attack?.facing ?? options.facing ?? fighter.facing : options.facing ?? fighter.facing });
  if (!layout) return null;
  const [sx, sy, sw, sh] = frame.rect;
  ctx.save(); ctx.translate(layout.x, layout.y); ctx.scale(layout.flip, 1);
  ctx.drawImage(image, sx, sy, sw, sh, -frame.anchor[0] * layout.scale, -frame.anchor[1] * layout.scale, sw * layout.scale, sh * layout.scale);
  ctx.restore();
  return { drawn: true, animation: 'drawn-sprite-atlas-v188', bounds: layout.bounds, supports: layout.supports,
    spriteAtlasV188: { fighterId: fighter.id, profileId: atlas.profileId, frameId: frame.id, phase: selected.phase,
      path: atlas.texture.path, sha256: atlas.texture.sha256, scale: layout.scale,
      canonExact: false, fullLocomotion: false, fullProne: frame.id === 'ko-ground', reducedMotion: selected.reducedMotion } };
}

/** Camera envelope uses every reviewed drawing at the same physical scale. */
export function getXenoTrialsSpriteEnvelopeV188(fighter, art, metrics) {
  const atlas = getXenoTrialsSpriteAtlasV188(fighter, art);
  if (!atlas) return null;
  const layouts = atlas.frames.map(frame => getXenoTrialsSpriteLayoutV188(atlas, frame, metrics,
    { x: fighter.x, y: -fighter.y, facing: fighter.facing }));
  if (layouts.some(layout => !layout)) return null;
  return { left: Math.min(...layouts.map(layout => layout.bounds.left)),
    right: Math.max(...layouts.map(layout => layout.bounds.right)),
    top: -Math.min(...layouts.map(layout => layout.bounds.top)), bottom: fighter.y };
}
