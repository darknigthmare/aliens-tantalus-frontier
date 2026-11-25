import { getXenoTrialsAnimationCoverageV191 } from './xeno-trials-animation-coverage-v191.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRigV197 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsSpriteAtlasV197 } from './xeno-trials-sprite-atlas-v191.js';

const combatFrames = Object.freeze({
  idle: ['idle'], walk: ['walk-a', 'walk-b'],
  light: ['attack-windup', 'attack-impact', 'attack-recovery'], heavy: ['attack-windup', 'attack-impact', 'attack-recovery'],
  guard: ['guard'], hurt: ['hit-recoil'], ko: ['ko-fall', 'ko-ground']
});
const cache = new Map();

export function getXenoTrialsAnimationCoverageV197(value) {
  const base = getXenoTrialsAnimationCoverageV191(value);
  if (!base) return null;
  if (cache.has(base.id)) return cache.get(base.id);
  const fighter = getXenoTrialsFighterV96(base.id), art = getXenoTrialsArtV96(base.id);
  const atlas = getXenoTrialsSpriteAtlasV197(fighter, art), rig = getXenoTrialsRigV197(fighter, art);
  if (!atlas && !rig) return base;

  const states = { ...base.states };
  function admit(action, id, path, renderKind, frames, limits) {
    const previous = states[action];
    const media = Object.freeze({ id, path, revision: 197, renderKind, frameIds: Object.freeze([...frames]) });
    const leading = previous.renderKind === 'drawn' && renderKind === 'mesh' ? previous : media;
    states[action] = Object.freeze({ ...previous, motionSupported: true, renderKind: leading.renderKind,
      frameIds: leading.frameIds, sources: Object.freeze([media, ...previous.sources]),
      limitations: Object.freeze([...limits]) });
  }
  if (atlas) for (const [action, frames] of Object.entries(combatFrames)) {
    admit(action, `atlas-v197-${base.id}`, atlas.texture.path, 'drawn', frames,
      ['grounded-only', 'two-step-combat-keys', 'shared-primary-contact-for-light-and-heavy']);
  }
  if (rig) {
    admit('presentation', rig.id, rig.path, 'mesh', ['intro', 'round-win', 'round-loss'], ['source-bound-mesh']);
    for (const action of ['light', 'heavy', 'special']) admit(action, rig.id, rig.path, 'mesh', ['recovery'],
      ['native-grounded-recovery-only', 'source-bound-mesh']);
  }
  const drawnStates = Object.freeze(Object.keys(states).filter(action => states[action].renderKind === 'drawn'));
  const meshStates = Object.freeze(Object.keys(states).filter(action => states[action].renderKind === 'mesh'));
  const hasDrawnGestures = drawnStates.some(action => action !== 'idle');
  const result = Object.freeze({ ...base, states: Object.freeze(states), drawnStates, meshStates,
    hasDrawnGestures,
    playerLabel: hasDrawnGestures ? 'Gestes dessinés' : 'Gestes articulés', fullProne: Boolean(atlas) || base.fullProne,
    coverageBasis: 'identity-bound-admitted-priority-animation-v197' });
  cache.set(base.id, result);
  return result;
}
