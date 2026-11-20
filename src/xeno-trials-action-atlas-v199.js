import { XENO_TRIALS_ACTION_DATA_V199 } from './xeno-trials-action-data-v199.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_SPRITE_REFERENCES_V188 } from './xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const positive = value => Number.isFinite(value) && value > 0;
const tuple = (value, length) => Array.isArray(value) && value.length === length && value.every(Number.isFinite);
const phaseKeys = ['windup', 'impact', 'recovery'];
const superKeys = ['windup', 'active', 'recovery'];
const airFighters = new Set(['warrior', 'runner']);
export const XENO_TRIALS_ACTION_FRAME_IDS_V199 = freeze({
  'air-combat': ['light', 'heavy'].flatMap(action => phaseKeys.map(key => `air-${action}-${key}`)),
  super: superKeys.flatMap(phase => [0, 1].map(key => `super-${phase}-${key}`))
});

function createAtlas(data) {
  const { fighterId, profileId, kind, sourcePose, texture, frames } = data;
  const fail = detail => { throw new Error(`Invalid Trials action atlas V199 (${fighterId}): ${detail}`); };
  const fighter = getXenoTrialsFighterV96(fighterId), art = getXenoTrialsArtV96(fighterId);
  const isAir = kind === 'air-combat', superSpec = getXenoTrialsSuperV148(fighter);
  const refs = XENO_TRIALS_SPRITE_REFERENCES_V188[fighterId];
  const sourceHash = art?.sha256 ?? refs?.sha256, sourceBounds = art?.alphaBounds ?? refs?.alphaBounds;
  if (!fighter || !art || fighter.profileId !== profileId || (isAir ? !airFighters.has(fighterId) || data.superId !== undefined
    : kind !== 'super' || !superSpec || data.superId !== superSpec.id)) fail('identity and admitted action');
  if (!sourcePose || !hash(sourceHash) || sourcePose.profileId !== profileId || sourcePose.path !== art.path
    || sourcePose.sha256 !== sourceHash || sourcePose.width !== art.sourceWidth || sourcePose.height !== art.sourceHeight
    || sourcePose.facing !== art.sourceFacing || sourcePose.work !== art.work || !sourcePose.anatomy
    || !tuple(sourceBounds, 4) || !tuple(sourcePose.alphaBounds, 4)
    || !sourceBounds.every((coordinate, index) => coordinate === sourcePose.alphaBounds[index])) fail('source plate');
  if (!data.provenance?.generation || !data.provenance?.reference || !Number.isFinite(data.lowAlphaMassFraction)
    || data.lowAlphaMassFraction < 0 || data.lowAlphaMassFraction >= .008) fail('review and alpha evidence');
  if (!texture || texture.path !== `/assets/openai/sprites/xeno-trials-v199/${fighterId}-${kind}-sheet.png`
    || !hash(texture.sha256) || ![texture.width, texture.height].every(n => Number.isInteger(n) && n > 0 && n <= 8192)
    || texture.width * texture.height > 16777216 || texture.facing !== 1 || !positive(data.referenceHeight)
    || data.referenceHeight > texture.height) fail('texture and size calibration');

  const ids = XENO_TRIALS_ACTION_FRAME_IDS_V199[kind];
  if (!Array.isArray(frames) || frames.length !== ids.length) fail('frame count');
  for (const [index, frame] of frames.entries()) {
    if (frame?.id !== ids[index] || !tuple(frame.rect, 4) || !frame.rect.every(Number.isInteger)) fail('frame identity and rectangle');
    const [x, y, width, height] = frame.rect;
    if (x < 0 || y < 0 || width < 4 || height < 4 || x + width > texture.width || y + height > texture.height
      || frames.slice(0, index).some(({ rect: [xx, yy, w, h] }) => x < xx + w && x + width > xx && y < yy + h && y + height > yy)) fail('frame rectangle bounds');
    if (!tuple(frame.alphaBounds, 4) || !frame.alphaBounds.every(Number.isInteger)) fail('silhouette');
    const [left, top, right, bottom] = frame.alphaBounds;
    if (left < 1 || top < 1 || right <= left || bottom <= top || right >= width || bottom >= height) fail('uncut silhouette');
    if (!tuple(frame.anchor, 2) || frame.anchor[0] < 0 || frame.anchor[0] >= width
      || frame.anchor[1] < (isAir ? bottom - data.referenceHeight * .2 : bottom - 1)
      || frame.anchor[1] > (isAir ? height * 2 : bottom + 2)) fail('logical root');
    const inside = point => tuple(point, 2) && point[0] >= left && point[0] < right && point[1] >= top && point[1] < bottom;
    if (!Array.isArray(frame.supports) || frame.supportMode !== (isAir ? 'free' : 'grounded')) fail('support mode');
    if (isAir) {
      if (!inside(frame.pelvis) || frame.anchor[0] !== frame.pelvis[0] || frame.supports.length
        || frame.anchor[1] <= frame.pelvis[1] || Math.abs(frame.anchor[1] - frame.pelvis[1]
          - frames[0].anchor[1] + frames[0].pelvis[1]) > 1e-8) fail('airborne pelvis projection');
    } else if (!frame.supports.length || frame.supports.length > 4
      || frame.supports.some(point => !inside(point) || Math.abs(point[1] - frame.anchor[1]) > 4)) fail('grounded supports');
  }
  return freeze({ ...data, movementCoverage: isAir ? 'six-airborne-attack-keys' : 'six-native-super-keys',
    primaryAction: isAir ? 'airborne-light-heavy' : superSpec.id });
}

export const XENO_TRIALS_ACTION_ATLASES_V199 = freeze(XENO_TRIALS_ACTION_DATA_V199.map(createAtlas));
const admitted = new Map(XENO_TRIALS_ACTION_ATLASES_V199.map(atlas => [atlas.fighterId, atlas]));
if (admitted.size !== XENO_TRIALS_ACTION_ATLASES_V199.length) throw new Error('Duplicate Trials action atlas identity V199');

export function getXenoTrialsActionAtlasV199(fighter, art) {
  const atlas = admitted.get(fighter?.id), source = atlas?.sourcePose;
  if (!atlas || fighter.profileId !== undefined && fighter.profileId !== atlas.profileId || art?.id !== atlas.profileId
    || art.path !== source.path || art.sourceWidth !== source.width || art.sourceHeight !== source.height
    || art.sourceFacing !== source.facing || art.sha256 && art.sha256 !== source.sha256) return null;
  return atlas;
}

/** Routes only attacks accepted by the native engine and only while the
 * matching support state is valid. Recovery over the landing uses the legacy chain. */
export function sampleXenoTrialsActionFrameV199(atlas, fighter, options = {}) {
  if (admitted.get(fighter?.id) !== atlas || !atlas || !positive(fighter.hp) || !Number.isFinite(fighter.y)
    || fighter.y < 0 || options.blocked || fighter.guard || fighter.stun > 0 || fighter.hitFlash > 0
    || ['hurt', 'guard-break', 'recover', 'ko'].includes(options.cue?.state)) return null;
  const attack = fighter.attack, isAir = atlas.kind === 'air-combat', spec = options.spec;
  if (!attack || (isAir ? fighter.y <= 0 || !['light', 'heavy'].includes(attack.kind) || spec?.groundedOnly
    : fighter.y !== 0 || attack.kind !== 'super' || spec !== getXenoTrialsSuperV148(getXenoTrialsFighterV96(fighter.id))?.spec)
    || ![spec?.startup, spec?.active, spec?.recovery].every(positive)
    || !Number.isFinite(attack.age) || attack.age < 0 || attack.age >= spec.startup + spec.active + spec.recovery) return null;

  const ends = [spec.startup, spec.startup + spec.active];
  const phaseIndex = attack.age < ends[0] ? 0 : attack.age < ends[1] ? 1 : 2;
  const duration = [spec.startup, spec.active, spec.recovery][phaseIndex];
  const phaseProgress = (attack.age - ([0, ...ends][phaseIndex])) / duration;
  const index = isAir ? (attack.kind === 'heavy' ? 3 : 0) + phaseIndex
    : phaseIndex * 2 + Number(!options.reducedMotion && phaseProgress >= .5);
  return Object.freeze({ atlas, frame: atlas.frames[index], phase: ['windup', 'contact', 'recovery'][phaseIndex],
    phaseProgress, renderKind: 'drawn-sprite-atlas-v199', reducedMotion: options.reducedMotion === true });
}
