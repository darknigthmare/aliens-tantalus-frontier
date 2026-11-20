import { XENO_TRIALS_ACTION_DATA_V199 } from './xeno-trials-action-data-v199.js';
import { XENO_TRIALS_SUPER_DATA_V200 } from './xeno-trials-super-data-v200.js';
import { XENO_TRIALS_PRIORITY_AIR_DATA_V201 } from './xeno-trials-priority-air-data-v201.js';
import { XENO_TRIALS_PRIORITY_GROUND_DATA_V201 } from './xeno-trials-priority-ground-data-v201.js';
import { XENO_TRIALS_PRIORITY_AIR_DATA_V202 } from './xeno-trials-priority-air-data-v202.js';
import { XENO_TRIALS_PRIORITY_GROUND_DATA_V202 } from './xeno-trials-priority-ground-data-v202.js';
import { XENO_TRIALS_PRIORITY_AIR_DATA_V203 } from './xeno-trials-priority-air-data-v203.js';
import { XENO_TRIALS_PRIORITY_GROUND_DATA_V203 } from './xeno-trials-priority-ground-data-v203.js';
import { XENO_TRIALS_PRIORITY_AIR_DATA_V204 } from './xeno-trials-priority-air-data-v204.js';
import { XENO_TRIALS_PRIORITY_GROUND_DATA_V204 } from './xeno-trials-priority-ground-data-v204.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { ENEMY_DISPLAY_ALPHA_V110 } from './enemy-display-alpha-v110.js';
import { XENO_TRIALS_SPRITE_REFERENCES_V189 } from './xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';
import { getXenoTrialsAttackV147, getXenoTrialsSpecialStyleV147 } from './xeno-trials-signatures-v147.js';
import { XENO_TRIALS_ATTACKS_V96 } from './xeno-trials-combat-contract-v186.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const positive = value => Number.isFinite(value) && value > 0;
const tuple = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);
const phaseKeys = ['windup', 'impact', 'recovery'];
const superKeys = ['windup', 'active', 'recovery'];
const airFightersByRevision = {
  199: ['warrior', 'runner'], 201: ['queen', 'import-game-afe2-warden'],
  202: ['prowler', 'ravager'], 203: ['chrysalis', 'razor-claws'], 204: ['synth-containment', 'smasher']
};
const groundSpecialStyles = {
  201: { mantis: 'slash', 'synth-sniper': 'pulse' }, 202: { rhino: 'ram', 'synth-heavy': 'pulse' },
  203: { 'armored-joe': 'ram', 'synth-good-boy': 'pulse' }, 204: { 'synth-tecsek': 'slash', 'import-xeno-kingrogue': 'tail' }
};
const atlasKinds = new Map([['light', 'air-combat'], ['heavy', 'air-combat'], ['special', 'ground-special'], ['super', 'super']]);
export const XENO_TRIALS_ACTION_FRAME_IDS_V199 = freeze({
  'air-combat': ['light', 'heavy'].flatMap(action => phaseKeys.map(key => `air-${action}-${key}`)),
  super: superKeys.flatMap(phase => [0, 1].map(key => `super-${phase}-${key}`))
});

const extraSuperFrames = freeze({
  'warden-acid-barrage': XENO_TRIALS_ACTION_FRAME_IDS_V199.super,
  'exploder-terminal-burst': XENO_TRIALS_ACTION_FRAME_IDS_V199.super.slice(0, 4),
  'harbinger-committed-leap': ['super-windup-0', 'super-windup-1',
    'super-active-free', 'super-active-ground', 'super-recovery-0', 'super-recovery-1']
});
const groundSpecialFrames = freeze(superKeys.flatMap(phase => [0, 1].map(key => `special-${phase}-${key}`)));

function createAtlas(data, revision) {
  const { fighterId, profileId, kind, sourcePose, texture, frames } = data;
  const fail = detail => { throw new Error(`Invalid Trials action atlas V${revision} (${fighterId}): ${detail}`); };
  const fighter = getXenoTrialsFighterV96(fighterId), art = getXenoTrialsArtV96(fighterId);
  if (revision === 200 && (kind !== 'super' || !Object.hasOwn(extraSuperFrames, data.superId))) fail('V200 super plan');
  const isAir = kind === 'air-combat', isGroundSpecial = kind === 'ground-special', superSpec = getXenoTrialsSuperV148(fighter);
  const groundStyle = groundSpecialStyles[revision]?.[fighterId];
  const admitsAction = isAir ? airFightersByRevision[revision]?.includes(fighterId) && data.superId === undefined
    : isGroundSpecial ? Boolean(groundStyle) && data.specialStyle === groundStyle
      && data.specialStyle === getXenoTrialsSpecialStyleV147(fighter)
      && data.superId === undefined
    : kind === 'super' && revision < 201 && superSpec && data.superId === superSpec.id;
  const refs = XENO_TRIALS_SPRITE_REFERENCES_V189[fighterId];
  const measured = ENEMY_DISPLAY_ALPHA_V110[art?.path];
  const sourceHash = art?.sha256 ?? refs?.sha256 ?? measured?.sha256;
  const sourceBounds = art?.alphaBounds ?? refs?.alphaBounds ?? measured?.bounds;
  if (!fighter || !art || fighter.profileId !== profileId || !admitsAction) fail('identity and admitted action');
  if (!sourcePose || !hash(sourceHash) || sourcePose.profileId !== profileId || sourcePose.path !== art.path
    || sourcePose.sha256 !== sourceHash || sourcePose.width !== art.sourceWidth || sourcePose.height !== art.sourceHeight
    || sourcePose.facing !== art.sourceFacing || sourcePose.work !== art.work || !sourcePose.anatomy
    || !tuple(sourceBounds, 4) || !tuple(sourcePose.alphaBounds, 4)
    || !sourceBounds.every((coordinate, index) => coordinate === sourcePose.alphaBounds[index])) fail('source plate');
  if (!data.provenance?.generation || !data.provenance?.reference || !Number.isFinite(data.lowAlphaMassFraction)
    || data.lowAlphaMassFraction < 0 || data.lowAlphaMassFraction >= .008) fail('review and alpha evidence');
  if (!texture || texture.path !== `/assets/openai/sprites/xeno-trials-v${revision}/${fighterId}-${kind}-sheet.png`
    || !hash(texture.sha256) || ![texture.width, texture.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192)
    || texture.width * texture.height > 16777216 || texture.facing !== 1 || !positive(data.referenceHeight)
    || data.referenceHeight > texture.height) fail('texture and size calibration');

  const ids = isGroundSpecial ? groundSpecialFrames
    : revision === 200 ? extraSuperFrames[data.superId] : XENO_TRIALS_ACTION_FRAME_IDS_V199[kind];
  if (!Array.isArray(frames) || frames.length !== ids.length) fail('frame count');
  for (const [index, frame] of frames.entries()) {
    if (frame?.id !== ids[index] || !tuple(frame.rect, 4) || !frame.rect.every(Number.isInteger)) fail('frame identity and rectangle');
    const [x, y, width, height] = frame.rect;
    if (x < 0 || y < 0 || width < 4 || height < 4 || x + width > texture.width || y + height > texture.height
      || frames.slice(0, index).some(({ rect: [xx, yy, w, h] }) => x < xx + w && x + width > xx && y < yy + h && y + height > yy)) fail('frame rectangle bounds');
    if (!tuple(frame.alphaBounds, 4) || !frame.alphaBounds.every(Number.isInteger)) fail('silhouette');
    const [left, top, right, bottom] = frame.alphaBounds;
    if (left < 1 || top < 1 || right <= left || bottom <= top || right >= width || bottom >= height) fail('uncut silhouette');
    const free = isAir || frame.id === 'super-active-free';
    if (!tuple(frame.anchor, 2) || frame.anchor[0] < 0 || frame.anchor[0] >= width
      || frame.anchor[1] < (free ? bottom - data.referenceHeight * .2 : bottom - 1)
      || frame.anchor[1] > (free ? height * 2 : bottom + 2)) fail('logical root');
    const inside = point => tuple(point, 2) && point[0] >= left && point[0] < right && point[1] >= top && point[1] < bottom;
    if (!Array.isArray(frame.supports) || frame.supportMode !== (free ? 'free' : 'grounded')) fail('support mode');
    if (free) {
      if (!inside(frame.pelvis) || frame.anchor[0] !== frame.pelvis[0] || frame.supports.length
        || frame.anchor[1] <= frame.pelvis[1] || isAir && Math.abs(frame.anchor[1] - frame.pelvis[1]
          - frames[0].anchor[1] + frames[0].pelvis[1]) > 1e-8) fail('airborne pelvis projection');
    } else {
      if (!frame.supports.length || frame.supports.length > 4
        || frame.supports.some(point => !inside(point) || Math.abs(point[1] - frame.anchor[1]) > 4)) fail('grounded supports');
      if (isGroundSpecial && (!inside(frame.pelvis) || frame.pelvis[0] !== frame.anchor[0])) fail('grounded pelvis alignment');
    }
  }
  return freeze({ ...data, revision,
    movementCoverage: isAir ? 'six-airborne-attack-keys' : `${frames.length}-native-${isGroundSpecial ? 'special' : 'super'}-keys`,
    primaryAction: isAir ? 'airborne-light-heavy' : isGroundSpecial ? data.specialStyle : superSpec.id });
}

export const XENO_TRIALS_ACTION_ATLASES_V199 = freeze(XENO_TRIALS_ACTION_DATA_V199.map(data => createAtlas(data, 199)));
export const XENO_TRIALS_SUPER_ATLASES_V200 = freeze(XENO_TRIALS_SUPER_DATA_V200.map(data => createAtlas(data, 200)));
export const XENO_TRIALS_PRIORITY_ATLASES_V201 = freeze(
  [...XENO_TRIALS_PRIORITY_AIR_DATA_V201, ...XENO_TRIALS_PRIORITY_GROUND_DATA_V201].map(data => createAtlas(data, 201)));
export const XENO_TRIALS_PRIORITY_ATLASES_V202 = freeze(
  [...XENO_TRIALS_PRIORITY_AIR_DATA_V202, ...XENO_TRIALS_PRIORITY_GROUND_DATA_V202].map(data => createAtlas(data, 202)));
export const XENO_TRIALS_PRIORITY_ATLASES_V203 = freeze(
  [...XENO_TRIALS_PRIORITY_AIR_DATA_V203, ...XENO_TRIALS_PRIORITY_GROUND_DATA_V203].map(data => createAtlas(data, 203)));
export const XENO_TRIALS_PRIORITY_ATLASES_V204 = freeze(
  [...XENO_TRIALS_PRIORITY_AIR_DATA_V204, ...XENO_TRIALS_PRIORITY_GROUND_DATA_V204].map(data => createAtlas(data, 204)));
export const XENO_TRIALS_RUNTIME_ACTION_ATLASES = Object.freeze([
  ...XENO_TRIALS_ACTION_ATLASES_V199, ...XENO_TRIALS_SUPER_ATLASES_V200,
  ...XENO_TRIALS_PRIORITY_ATLASES_V201, ...XENO_TRIALS_PRIORITY_ATLASES_V202,
  ...XENO_TRIALS_PRIORITY_ATLASES_V203, ...XENO_TRIALS_PRIORITY_ATLASES_V204
]);
const admitted = new Map(), noAtlases = Object.freeze([]);
for (const atlas of XENO_TRIALS_RUNTIME_ACTION_ATLASES) {
  const previous = admitted.get(atlas.fighterId) || noAtlases;
  if (previous.some(item => item.kind === atlas.kind)) throw new Error('Duplicate Trials action atlas kind for ' + atlas.fighterId);
  admitted.set(atlas.fighterId, Object.freeze([...previous, atlas]));
}

export function getXenoTrialsActionAtlasV199(fighter, art) {
  const atlas = getXenoTrialsRuntimeActionAtlas(fighter, art);
  return atlas?.revision === 199 ? atlas : null;
}

export function getXenoTrialsRuntimeActionAtlases(fighter, art) {
  const atlases = admitted.get(fighter?.id), atlas = atlases?.[0], source = atlas?.sourcePose;
  if (!atlas || fighter.profileId !== undefined && fighter.profileId !== atlas.profileId || art?.id !== atlas.profileId
    || art.path !== source.path || art.sourceWidth !== source.width || art.sourceHeight !== source.height
    || art.sourceFacing !== source.facing || art.sha256 && art.sha256 !== source.sha256) return noAtlases;
  return atlases;
}

export function getXenoTrialsRuntimeActionAtlas(fighter, art) {
  return getXenoTrialsRuntimeActionAtlases(fighter, art)[0] || null;
}

export function getXenoTrialsActiveActionAtlas(fighter, art) {
  const kind = atlasKinds.get(fighter?.attack?.kind);
  if (!kind) return null;
  return getXenoTrialsRuntimeActionAtlases(fighter, art).find(atlas => atlas.kind === kind) || null;
}

/** Routes only attacks accepted by the native engine and only while the
 * matching support state is valid. Recovery over the landing uses the legacy chain. */
export function sampleXenoTrialsActionFrameV199(atlas, fighter, options = {}) {
  if (!atlas || !admitted.get(fighter?.id)?.includes(atlas) || !positive(fighter.hp) || !Number.isFinite(fighter.y)
    || fighter.y < 0 || options.blocked || fighter.guard || fighter.stun > 0 || fighter.hitFlash > 0
    || ['hurt', 'guard-break', 'recover', 'ko'].includes(options.cue?.state)) return null;
  const attack = fighter.attack, isAir = atlas.kind === 'air-combat', spec = options.spec;
  const definition = getXenoTrialsFighterV96(fighter.id);
  const expectedKind = atlas.kind === 'super' ? 'super' : 'special';
  if (!attack || (isAir ? fighter.y <= 0 || !['light', 'heavy'].includes(attack.kind) || spec?.groundedOnly
    : attack.kind !== expectedKind || spec !== getXenoTrialsAttackV147(definition, expectedKind, XENO_TRIALS_ATTACKS_V96[expectedKind]))
    || ![spec?.startup, spec?.active, spec?.recovery].every(positive)
    || !Number.isFinite(attack.age) || attack.age < 0 || attack.age >= spec.startup + spec.active + spec.recovery) return null;

  // The Exploder is gone after its charge. The Harbinger's actual
  // support state decides between the live leap and landing silhouettes.
  const sacrificial = atlas.superId === 'exploder-terminal-burst';
  const charge = sacrificial ? spec.chargeDuration : spec.active;
  if (sacrificial && attack.age >= spec.startup + charge) return null;
  const ends = [spec.startup, spec.startup + charge];
  const phaseIndex = attack.age < ends[0] ? 0 : attack.age < ends[1] ? 1 : 2;
  const duration = [spec.startup, charge, spec.recovery][phaseIndex];
  const phaseProgress = (attack.age - ([0, ...ends][phaseIndex])) / duration;
  const leapPhase = atlas.superId === 'harbinger-committed-leap' && phaseIndex === 1 && attack.launchedV147;
  if (!isAir && fighter.y > 0 && !leapPhase) return null;
  const alternate = leapPhase ? fighter.y === 0 : !options.reducedMotion && phaseProgress >= .5;
  const index = isAir ? (attack.kind === 'heavy' ? 3 : 0) + phaseIndex : phaseIndex * 2 + Number(alternate);
  const frame = atlas.frames[index];
  if ((frame.supportMode === 'free') !== (fighter.y > 0)) return null;
  return Object.freeze({ atlas, frame, phase: ['windup', 'contact', 'recovery'][phaseIndex],
    phaseProgress, renderKind: `drawn-sprite-atlas-v${atlas.revision}`, reducedMotion: options.reducedMotion === true });
}
