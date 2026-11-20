import { getXenoTrialsAnimationCoverageV197 } from './xeno-trials-animation-coverage-v197.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRigV199 } from './xeno-trials-rig-v154.js';
import { getXenoTrialsActionAtlasV199 } from './xeno-trials-action-atlas-v199.js';

const cache = new Map();

export function getXenoTrialsAnimationCoverageV199(value) {
  const base = getXenoTrialsAnimationCoverageV197(value);
  if (!base) return null;
  if (cache.has(base.id)) return cache.get(base.id);
  const fighter = getXenoTrialsFighterV96(base.id), art = getXenoTrialsArtV96(base.id);
  const atlas = getXenoTrialsActionAtlasV199(fighter, art), rig = getXenoTrialsRigV199(fighter, art);
  if (!atlas && !rig) return base;
  const states = { ...base.states };

  function admit(action, id, path, renderKind, frameIds, limitations) {
    const previous = states[action];
    const media = Object.freeze({ id, path, revision: 199, renderKind, frameIds: Object.freeze(frameIds) });
    const leading = previous?.renderKind === 'drawn' && renderKind === 'mesh' ? previous : media;
    states[action] = Object.freeze({ ...previous, supported: true, motionSupported: true,
      renderKind: leading.renderKind, frameIds: leading.frameIds,
      sources: Object.freeze([media, ...(previous?.sources || [])]), limitations: Object.freeze(limitations) });
  }
  if (atlas?.kind === 'air-combat') for (const action of ['light', 'heavy']) {
    admit(action, `atlas-v199-${base.id}`, atlas.texture.path, 'drawn',
      atlas.frames.filter(frame => frame.id.startsWith(`air-${action}-`)).map(frame => frame.id),
      ['airborne-only', 'native-attack-windows', 'three-keys-for-this-action']);
  }
  if (atlas?.kind === 'super') {
    admit('super', atlas.superId, atlas.texture.path, 'drawn', atlas.frames.map(frame => frame.id),
      ['grounded-only', 'native-super-windows', 'two-keys-per-phase']);
  }
  if (rig) {
    admit('presentation', rig.id, rig.path, 'mesh', ['intro', 'round-win', 'round-loss'], ['source-bound-mesh']);
    for (const action of ['light', 'heavy', 'special']) admit(action, rig.id, rig.path, 'mesh', ['recovery'],
      ['native-grounded-recovery-only', 'source-bound-mesh']);
  }
  const drawnStates = Object.freeze(Object.keys(states).filter(action => states[action].renderKind === 'drawn'));
  const meshStates = Object.freeze(Object.keys(states).filter(action => states[action].renderKind === 'mesh'));
  const hasDrawnGestures = drawnStates.some(action => action !== 'idle');
  const result = Object.freeze({ ...base, states: Object.freeze(states), drawnStates, meshStates, hasDrawnGestures,
    playerLabel: hasDrawnGestures ? 'Gestes dessinés' : 'Gestes articulés',
    coverageBasis: 'identity-bound-native-attack-windows-v199' });
  cache.set(base.id, result);
  return result;
}
