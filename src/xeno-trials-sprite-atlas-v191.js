import { XENO_TRIALS_SPRITE_COMBAT_DATA_V191 } from './xeno-trials-sprite-combat-data-v191.js';
import { XENO_TRIALS_SPRITE_SPECIAL_DATA_V191 } from './xeno-trials-sprite-special-data-v191.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsSpecialStyleV147 } from './xeno-trials-signatures-v147.js';
import { XENO_TRIALS_SPRITE_REFERENCES_V188, XENO_TRIALS_SPRITE_FRAME_IDS_V188 } from './xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSpriteEnvelopeV189 } from './xeno-trials-sprite-atlas-v189.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const positive = value => Number.isFinite(value) && value > 0;
const tuple = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);
const clamp = value => Math.max(0, Math.min(1, value));
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

export const XENO_TRIALS_COMBAT_FRAME_IDS_V191 = XENO_TRIALS_SPRITE_FRAME_IDS_V188;
export const XENO_TRIALS_SPECIAL_FRAME_IDS_V191 = freeze([
  ...Array.from({ length: 3 }, (_, i) => `special-windup-${i}`),
  ...Array.from({ length: 3 }, (_, i) => `special-active-${i}`),
  ...Array.from({ length: 4 }, (_, i) => `special-recovery-${i}`)
]);
export const XENO_TRIALS_PRIMARY_ACTIONS_V191 = freeze({
  defender: 'forelimb-contact', chrysalis: 'foreclaw', smasher: 'forearm-strike', 'user-brute': 'foreclaw'
});
export const XENO_TRIALS_SPECIAL_ACTIONS_V191 = freeze({ warrior: 'tail', runner: 'pounce', prowler: 'leap', spitter: 'acid' });

// Admission is tied to these unchanged native plates. New right-facing sheets
// do not change the left-facing source identity of the user's Xeno-Brute.
export const XENO_TRIALS_SPRITE_REFERENCES_V191 = freeze({ ...XENO_TRIALS_SPRITE_REFERENCES_V188,
  defender: { profileId: 'pose-v95-user-xeno-defender', path: '/assets/openai/sprites/static-enemy-v95/ref-56-xeno-defender.png',
    sha256: '729a6d131424591995e8f948f9f0e6059fe0a82397a5c54f28d1269a0b46cb83', width: 1024, height: 1536,
    facing: 1, alphaBounds: [193, 133, 927, 1418], anatomy: 'armored-quadruped',
    work: 'Alien vs. Predator — Capcom, arcade (1994) · adaptation visuelle utilisateur' },
  chrysalis: { profileId: 'castes-game_avp_capcom_chrysalis', path: '/assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png',
    sha256: '616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7', width: 1536, height: 1024,
    facing: 1, alphaBounds: [56, 170, 1463, 851], anatomy: 'armored-biped', work: 'Alien vs. Predator — Capcom (1994)' },
  smasher: { profileId: 'castes-game_avp_capcom_smasher', path: '/assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png',
    sha256: '0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8', width: 1536, height: 1024,
    facing: 1, alphaBounds: [137, 172, 1308, 894], anatomy: 'heavy-biped', work: 'Alien vs. Predator — Capcom (1994)' },
  'user-brute': { profileId: 'pose-v95-user-xeno-brute', path: '/assets/openai/sprites/static-enemy-v95/xeno-brute.png',
    sha256: 'c093b0f9bf4ab5b6fa79de9f5787d2552957d1959670c639054c1c01875fca13', width: 1121, height: 1403,
    facing: -1, alphaBounds: [99, 133, 1072, 1292], anatomy: 'horned-biped',
    work: 'Lot AlienTentalus — adaptation de jeu non canonique' }
});
const constructed = new WeakSet();
const visibleHeight = (atlas, metrics) => metrics?.visibleHeight ?? metrics?.height
  * (atlas.sourcePose.alphaBounds[3] - atlas.sourcePose.alphaBounds[1]) / atlas.sourcePose.height;

/** Validate reviewed drawings without altering any native attack, geometry or
 * source plate. A factory fixture is not admitted to the runtime registry. */
export function createXenoTrialsSpriteAtlasV191(input) {
  const fail = detail => { throw new Error(`Invalid Trials sprite atlas V191: ${detail}`); };
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('input');
  const d = JSON.parse(JSON.stringify(input)), source = XENO_TRIALS_SPRITE_REFERENCES_V191[d.fighterId];
  const combat = d.kind === 'combat', special = d.kind === 'special';
  if (!source || d.profileId !== source.profileId || !(combat && Object.hasOwn(XENO_TRIALS_PRIMARY_ACTIONS_V191, d.fighterId)
    || special && Object.hasOwn(XENO_TRIALS_SPECIAL_ACTIONS_V191, d.fighterId))) fail('fighter identity or kind');
  if (!d.sourcePose || Object.keys(d.sourcePose).length !== Object.keys(source).length
    || Object.entries(source).some(([key, value]) => JSON.stringify(d.sourcePose[key]) !== JSON.stringify(value))) fail('source plate');
  if (d.reviewStatus !== 'accepted-drawn-atlas' || d.identityVerified !== true || d.alphaVerified !== true
    || d.anchorsVerified !== true || d.wholeBodyVerified !== true || d.canonExact !== false || d.fullLocomotion !== false
    || d.fullProne !== combat || d.movementCoverage !== (combat ? 'two-step-combat-keys' : 'ten-special-attack-keys')) fail('review or scope');
  if (d.primaryAction !== (combat ? XENO_TRIALS_PRIMARY_ACTIONS_V191[d.fighterId] : XENO_TRIALS_SPECIAL_ACTIONS_V191[d.fighterId])) fail('anatomical action');
  if (special && (d.calibrationFrameId !== 'special-windup-0' || d.calibrationBasis !== 'neutral-preparation-key')) fail('neutral special calibration');
  if (!d.provenance || !['generation', 'reference'].every(key => typeof d.provenance[key] === 'string' && d.provenance[key].trim())) fail('provenance');
  const texture = d.texture;
  if (!texture || texture.path !== `/assets/openai/sprites/xeno-trials-v191/${d.fighterId}-${d.kind}-sheet.png`
    || !hash(texture.sha256) || ![texture.width, texture.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192)
    || texture.width * texture.height > 16777216 || texture.facing !== 1) fail('texture');
  if (d.alphaBoundsThreshold !== 16 || d.cutEdgeAlphaMax !== 1 || d.supportAlphaMin !== 128
    || !Number.isFinite(d.lowAlphaMassFraction) || d.lowAlphaMassFraction < 0 || d.lowAlphaMassFraction >= .008) fail('alpha measurement');
  const ids = combat ? XENO_TRIALS_COMBAT_FRAME_IDS_V191 : XENO_TRIALS_SPECIAL_FRAME_IDS_V191;
  if (!positive(d.referenceHeight) || !Array.isArray(d.frames) || d.frames.length !== ids.length) fail('frames');
  for (const [index, frame] of d.frames.entries()) {
    if (!frame || frame.id !== ids[index]) fail('frame order');
    if (!tuple(frame.rect, 4) || !frame.rect.every(Number.isInteger)) fail('frame rectangle');
    const [x, y, w, h] = frame.rect, b = frame.alphaBounds;
    if (x < 0 || y < 0 || w < 4 || h < 4 || x + w > texture.width || y + h > texture.height) fail('rectangle bounds');
    if (!tuple(b, 4) || !b.every(Number.isInteger) || b[0] < 1 || b[1] < 1 || b[2] <= b[0] || b[3] <= b[1]
      || b[2] > w - 1 || b[3] > h - 1) fail('alpha bounds or clipped silhouette');
    const free = special && frame.supportMode === 'free';
    if (special && frame.supportMode !== 'grounded' && !free) fail('support mode');
    if (free && (d.fighterId !== 'prowler' || !frame.id.startsWith('special-active-'))) fail('native airborne action');
    if (!tuple(frame.anchor, 2) || frame.anchor[0] < 0 || frame.anchor[0] > w || frame.anchor[1] < 0 || frame.anchor[1] >= h
      || (!free && (frame.anchor[1] < b[3] - 1 || frame.anchor[1] > b[3] + 2))) fail('logical root anchor');
    if (special && (!tuple(frame.pelvis, 2) || frame.pelvis[0] < b[0] || frame.pelvis[0] >= b[2]
      || frame.pelvis[1] < b[1] || frame.pelvis[1] >= b[3] || frame.anchor[0] !== frame.pelvis[0])) fail('pelvis registration');
    if (free && (Math.abs(frame.anchor[1] - frame.pelvis[1] - d.frames[0].anchor[1] + d.frames[0].pelvis[1]) > 1e-8
      || frame.anchor[1] <= b[3])) fail('air pelvis projection');
    if (!Array.isArray(frame.supports) || (free ? frame.supports.length !== 0 : frame.supports.length < 1 || frame.supports.length > 4)
      || frame.supports.some(p => !tuple(p, 2) || p[0] < b[0] || p[0] >= b[2] || p[1] < b[1] || p[1] >= b[3]
        || Math.abs(p[1] - frame.anchor[1]) > 4)) fail('support contacts');
    if (d.frames.slice(0, index).some(other => { const [xx, yy, ww, hh] = other.rect;
      return x < xx + ww && x + w > xx && y < yy + hh && y + h > yy; })) fail('overlapping frames');
  }
  const neutral = d.frames[0].alphaBounds;
  if (Math.abs(d.referenceHeight - neutral[3] + neutral[1]) > 1e-8) fail('neutral reference height');
  freeze(d); constructed.add(d); return d;
}

export const XENO_TRIALS_SPRITE_ATLASES_V191 = freeze([
  ...XENO_TRIALS_SPRITE_COMBAT_DATA_V191, ...XENO_TRIALS_SPRITE_SPECIAL_DATA_V191
].map(createXenoTrialsSpriteAtlasV191));
const admitted = new Map(XENO_TRIALS_SPRITE_ATLASES_V191.map(atlas => [atlas.fighterId, atlas]));
if (admitted.size !== XENO_TRIALS_SPRITE_ATLASES_V191.length) throw new Error('Duplicate Trials sprite atlas V191 identity');

export function getXenoTrialsSpriteAtlasV191(fighter, art) {
  const atlas = admitted.get(fighter?.id), source = atlas?.sourcePose;
  if (!atlas || getXenoTrialsFighterV96(fighter.id)?.profileId !== atlas.profileId
    || fighter.profileId !== undefined && fighter.profileId !== atlas.profileId
    || art?.id !== atlas.profileId || art.path !== source.path || art.sourceWidth !== source.width
    || art.sourceHeight !== source.height || art.sourceFacing !== source.facing || art.sha256 && art.sha256 !== source.sha256) return null;
  return atlas;
}
const empty = Object.freeze([]);
export function getXenoTrialsSpriteAtlasesV191(fighter, art) {
  const atlas = getXenoTrialsSpriteAtlasV191(fighter, art); return atlas ? Object.freeze([atlas]) : empty;
}

/** Native accepted attack age selects a key inside its actual startup/contact/
 * recovery window. Art cannot extend that window or invent a jumping Runner. */
export function sampleXenoTrialsSpriteAtlasV191(atlas, fighter, options = {}) {
  if (!constructed.has(atlas) || fighter?.id !== atlas.fighterId || !Number.isFinite(fighter.hp)
    || !Number.isFinite(fighter.y) || fighter.y < 0 || options.blocked) return null;
  const cue = options.cue, height = visibleHeight(atlas, options.metrics), attack = fighter.attack, spec = options.spec;
  let id = 'idle', phase = 'idle', phaseProgress = 0;
  if (atlas.kind === 'special') {
    if (fighter.hp <= 0 || fighter.guard || fighter.stun > 0 || fighter.hitFlash > 0
      || ['hurt', 'guard-break', 'recover', 'ko'].includes(cue?.state) || attack?.kind !== 'special'
      || !Number.isFinite(attack.age) || attack.age < 0 || ![spec?.startup, spec?.active, spec?.recovery].every(positive)
      || attack.age >= spec.startup + spec.active + spec.recovery
      || getXenoTrialsSpecialStyleV147(getXenoTrialsFighterV96(fighter.id)) !== atlas.primaryAction) return null;
    if (attack.age < spec.startup) { phase = 'windup'; phaseProgress = attack.age / spec.startup; }
    else if (attack.age < spec.startup + spec.active) { phase = 'contact'; phaseProgress = (attack.age - spec.startup) / spec.active; }
    else { phase = 'recovery'; phaseProgress = (attack.age - spec.startup - spec.active) / spec.recovery; }
    const count = phase === 'recovery' ? 4 : 3, prefix = phase === 'contact' ? 'active' : phase;
    id = `special-${prefix}-${options.reducedMotion ? 0 : Math.min(count - 1, Math.floor(clamp(phaseProgress) * count))}`;
    const selected = atlas.frames.find(frame => frame.id === id);
    if ((selected.supportMode === 'free') !== (fighter.y > 0)) return null;
  } else {
    if (fighter.y !== 0) return null;
    if (fighter.hp <= 0) {
      const progress = cue?.state === 'ko' && Number.isFinite(cue.progress) ? clamp(cue.progress) : 1;
      id = options.reducedMotion || progress >= .65 ? 'ko-ground' : 'ko-fall'; phase = 'ko';
    } else if (['hurt', 'guard-break'].includes(cue?.state)) { id = 'hit-recoil'; phase = 'hurt'; }
    else if (fighter.stun > 0 || fighter.hitFlash > 0) return null;
    else if (attack) {
      if (!['light', 'heavy'].includes(attack.kind) || !Number.isFinite(attack.age) || attack.age < 0
        || ![spec?.startup, spec?.active, spec?.recovery].every(positive)
        || attack.age >= spec.startup + spec.active + spec.recovery) return null;
      phase = attack.age < spec.startup ? 'windup' : attack.age < spec.startup + spec.active ? 'contact' : 'recovery';
      id = { windup: 'attack-windup', contact: 'attack-impact', recovery: 'attack-recovery' }[phase];
    } else if (fighter.guard) { id = 'guard'; phase = 'guard'; }
    else if (options.moving && !options.reducedMotion) {
      if (!Number.isFinite(options.distance) || !positive(height)) return null;
      const step = ((options.distance / (height * .33)) % 2 + 2) % 2;
      id = step < 1 ? 'walk-a' : 'walk-b'; phase = 'move';
    }
  }
  return Object.freeze({ atlas, frame: atlas.frames.find(frame => frame.id === id), phase, phaseProgress,
    renderKind: 'drawn-sprite-atlas-v191', reducedMotion: options.reducedMotion === true });
}

export function getXenoTrialsSpriteLayoutV191(atlas, frame, metrics, { x, y, facing = 1 } = {}) {
  const height = atlas && visibleHeight(atlas, metrics);
  if (!constructed.has(atlas) || !atlas.frames.includes(frame) || ![x, y].every(Number.isFinite)
    || ![-1, 1].includes(facing) || !positive(height)) return null;
  const scale = height / atlas.referenceHeight, flip = facing === atlas.texture.facing ? 1 : -1;
  const [left, top, right, bottom] = frame.alphaBounds, [ax, ay] = frame.anchor;
  const a = (left - ax) * scale * flip, b = (right - ax) * scale * flip;
  return freeze({ scale, flip, x, y,
    bounds: { left: x + Math.min(a, b), right: x + Math.max(a, b), top: y + (top - ay) * scale, bottom: y + (bottom - ay) * scale },
    supports: frame.supports.map(p => [x + (p[0] - ax) * scale * flip, y + (p[1] - ay) * scale]) });
}
const ready = (image, atlas) => Boolean(image && image.complete !== false
  && Number(image.naturalWidth || image.width) === atlas.texture.width && Number(image.naturalHeight || image.height) === atlas.texture.height);
const browserLoad = path => new Promise((resolve, reject) => {
  if (typeof globalThis.Image !== 'function') { reject(new Error('Image unavailable')); return; }
  const image = new globalThis.Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = path;
});
const requested = new WeakMap();
export function requestXenoTrialsSpriteAtlasV191(images, fighter, art, loadImage = browserLoad, isActive = () => true) {
  const atlas = getXenoTrialsSpriteAtlasV191(fighter, art);
  if (!atlas || !images?.get || !images?.set || typeof loadImage !== 'function' || typeof isActive !== 'function') return Promise.resolve(false);
  const path = atlas.texture.path;
  if (ready(images.get(path), atlas)) return Promise.resolve(true);
  let attempts = requested.get(images); if (!attempts) { attempts = new Map(); requested.set(images, attempts); }
  if (attempts.has(path)) return attempts.get(path);
  const attempt = Promise.resolve().then(() => isActive() ? loadImage(path) : null).then(image => {
    if (!isActive() || !ready(image, atlas)) return false;
    images.set(path, image); return true;
  }).catch(() => false);
  attempts.set(path, attempt); return attempt;
}
export function drawXenoTrialsSpriteAtlasV191(ctx, fighter, art, images, options = {}) {
  const atlas = getXenoTrialsSpriteAtlasV191(fighter, art), image = atlas && images?.get?.(atlas.texture.path);
  const selected = atlas && sampleXenoTrialsSpriteAtlasV191(atlas, fighter, options);
  if (!selected || !ready(image, atlas)) return null;
  const frame = selected.frame, layout = getXenoTrialsSpriteLayoutV191(atlas, frame, options.metrics, {
    x: options.x ?? fighter.x, y: options.y ?? 450 - fighter.y,
    facing: ['windup', 'contact', 'recovery'].includes(selected.phase)
      ? fighter.attack?.facing ?? options.facing ?? fighter.facing : options.facing ?? fighter.facing });
  if (!layout) return null;
  ctx.save(); ctx.translate(layout.x, layout.y); ctx.scale(layout.flip, 1);
  ctx.drawImage(image, ...frame.rect, -frame.anchor[0] * layout.scale, -frame.anchor[1] * layout.scale,
    frame.rect[2] * layout.scale, frame.rect[3] * layout.scale); ctx.restore();
  return { drawn: true, animation: 'drawn-sprite-atlas-v191', bounds: layout.bounds, supports: layout.supports,
    spriteAtlasV191: { drawn: true, fighterId: fighter.id, profileId: atlas.profileId, kind: atlas.kind, frameId: frame.id,
      phase: selected.phase, phaseProgress: selected.phaseProgress, path: atlas.texture.path, sha256: atlas.texture.sha256,
      sourceRect: [...frame.rect], imageWidth: Number(image.naturalWidth || image.width), imageHeight: Number(image.naturalHeight || image.height),
      referencePath: atlas.sourcePose.path, referenceSha256: atlas.sourcePose.sha256,
      attackId: fighter.attack?.id ?? null, attackAge: fighter.attack?.age ?? null,
      renderTick: Number.isInteger(options.tick) && options.tick >= 0 ? options.tick : null,
      scale: layout.scale, grounded: fighter.y === 0, supportMode: frame.supportMode || 'grounded',
      canonExact: false, fullLocomotion: false, fullProne: frame.id === 'ko-ground', movementCoverage: atlas.movementCoverage,
      primaryAction: atlas.primaryAction, reducedMotion: selected.reducedMotion } };
}
export function getXenoTrialsSpriteEnvelopeV191(fighter, art, metrics) {
  const old = getXenoTrialsSpriteEnvelopeV189(fighter, art, metrics), atlas = getXenoTrialsSpriteAtlasV191(fighter, art);
  if (!atlas) return old;
  const layouts = atlas.frames.map(frame => getXenoTrialsSpriteLayoutV191(atlas, frame, metrics,
    { x: fighter.x, y: -fighter.y, facing: fighter.facing }));
  if (layouts.some(layout => !layout)) return old;
  return { left: Math.min(old?.left ?? Infinity, ...layouts.map(layout => layout.bounds.left)),
    right: Math.max(old?.right ?? -Infinity, ...layouts.map(layout => layout.bounds.right)),
    top: Math.max(old?.top ?? -Infinity, -Math.min(...layouts.map(layout => layout.bounds.top))),
    bottom: Math.min(old?.bottom ?? Infinity, fighter.y) };
}
