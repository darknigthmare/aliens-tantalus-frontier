import { XENO_TRIALS_FIGHTERS_V96 as FIGHTERS, getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { XENO_TRIALS_ANIMATION_ACTIONS_V189, getXenoTrialsAnimationCoverageV189 } from './xeno-trials-animation-coverage-v189.js';
import { getXenoTrialsSpriteAtlasV191 } from './xeno-trials-sprite-atlas-v191.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const XENO_TRIALS_ANIMATION_ACTIONS_V191 = XENO_TRIALS_ANIMATION_ACTIONS_V189;
const cache = new Map();

/** This is an admission ledger for the actual rendering chain. It never
 * certifies that an image loaded, a full move played or a complete roster has
 * been animated. The historical V189 registry/report remain unchanged. */
export function getXenoTrialsAnimationCoverageV191(value) {
  const id = typeof value === 'string' ? value : value?.id, fighter = getXenoTrialsFighterV96(id);
  if (!fighter || typeof value === 'object' && value.profileId !== undefined && value.profileId !== fighter.profileId) return null;
  if (cache.has(id)) return cache.get(id);
  const entry = structuredClone(getXenoTrialsAnimationCoverageV189(id));
  const atlas = getXenoTrialsSpriteAtlasV191(fighter, getXenoTrialsArtV96(id));
  if (atlas) {
    const mapping = atlas.kind === 'special' ? { special: atlas.frames.map(frame => frame.id) } : {
      idle: ['idle'], walk: ['walk-a', 'walk-b'], light: ['attack-windup', 'attack-impact', 'attack-recovery'],
      heavy: ['attack-windup', 'attack-impact', 'attack-recovery'], guard: ['guard'], hurt: ['hit-recoil'], ko: ['ko-fall', 'ko-ground']
    };
    for (const [action, frames] of Object.entries(mapping)) {
      const media = { id: `atlas-v191-${id}-${atlas.kind}`, path: atlas.texture.path, revision: 191,
        renderKind: 'drawn', frameIds: [...frames] };
      const limitations = atlas.kind === 'special'
        ? ['ten-special-keyposes-not-full-choreography', 'native-accepted-special-clock', 'no-super-coverage',
          atlas.primaryAction === 'leap' ? 'native-airborne-active-keys-grounded-startup-and-recovery-with-honest-fallback'
            : 'grounded-only-no-invented-air-impulse', 'capture-and-sequence-and-reaction-keep-priority']
        : ['ten-drawn-keyposes-not-full-choreography', 'grounded-only', 'anatomical-primary-action-shared-by-light-heavy',
          'special-and-super-keep-native-rendering', 'capture-and-sequence-keep-priority'];
      entry.states[action] = { ...entry.states[action], motionSupported: true, renderKind: 'drawn',
        sources: [media, ...entry.states[action].sources], frameIds: [...frames], limitations };
    }
  }
  entry.drawnStates = XENO_TRIALS_ANIMATION_ACTIONS_V191.filter(action => entry.states[action].renderKind === 'drawn');
  entry.meshStates = XENO_TRIALS_ANIMATION_ACTIONS_V191.filter(action => entry.states[action].renderKind === 'mesh');
  entry.hasDrawnGestures = entry.drawnStates.some(action => action !== 'idle');
  entry.playerLabel = entry.hasDrawnGestures ? 'Gestes dessinés'
    : entry.meshStates.some(action => action !== 'presentation') ? 'Gestes articulés' : 'Posture de référence';
  entry.fullProne = entry.states.ko.renderKind === 'drawn' && entry.states.ko.frameIds.includes('ko-ground');
  entry.canonExact = false; entry.fullAnimation = false;
  entry.coverageBasis = 'exact-id-admitted-render-chain-v191-v189-v188-not-image-load-or-gameplay-receipt';
  const result = freeze(entry); cache.set(id, result); return result;
}

export function getXenoTrialsAnimationCoverageListV191() {
  return freeze(FIGHTERS.map(fighter => getXenoTrialsAnimationCoverageV191(fighter.id)));
}
export function getXenoTrialsAnimationCoverageSummaryV191() {
  const entries = getXenoTrialsAnimationCoverageListV191(), byAction = {};
  for (const action of XENO_TRIALS_ANIMATION_ACTIONS_V191) byAction[action] = {
    drawn: entries.filter(entry => entry.states[action].renderKind === 'drawn').length,
    mesh: entries.filter(entry => entry.states[action].renderKind === 'mesh').length,
    static: entries.filter(entry => entry.states[action].renderKind === 'static').length,
    supported: entries.filter(entry => entry.states[action].supported).length
  };
  const keys = new Set(), trialsKeys = new Set(), addedKeys = new Set();
  for (const entry of entries) for (const action of XENO_TRIALS_ANIMATION_ACTIONS_V191) for (const media of entry.states[action].sources) {
    if (media.renderKind !== 'drawn') continue;
    for (const frame of media.frameIds) {
      const key = `${media.path}#${frame}`; keys.add(key);
      if (/\/xeno-trials-v(?:188|189|191)\//.test(media.path)) trialsKeys.add(key);
      if (/\/xeno-trials-v191\//.test(media.path)) addedKeys.add(key);
    }
  }
  return freeze({ schema: 191, roster: entries.length,
    drawnProfiles: entries.filter(entry => entry.hasDrawnGestures).length,
    articulatedProfiles: entries.filter(entry => entry.meshStates.length > 0).length,
    fullProneProfiles: entries.filter(entry => entry.fullProne).length,
    activeArticulatedProfiles: entries.filter(entry => entry.meshStates.some(action => action !== 'presentation')).length,
    uniqueAdmittedDrawnFrames: keys.size, trialsDrawnFrames: trialsKeys.size, newDrawnFrames: addedKeys.size,
    byAction, canonExact: 0, fullyAnimated: 0 });
}
