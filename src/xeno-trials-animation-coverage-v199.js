import { getXenoTrialsAnimationCoverageV197 } from './xeno-trials-animation-coverage-v197.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsRigV199, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig } from './xeno-trials-rig-v154.js';
import { getXenoTrialsActionAtlasV199, getXenoTrialsRuntimeActionAtlases } from './xeno-trials-action-atlas-v199.js';
import { getXenoTrialsPantherPounceFramesV221 } from './xeno-trials-poses-v209.js';

const historicalCache = new Map(), runtimeCache = new Map();

export function getXenoTrialsAnimationCoverageV199(value) {
  return getCoverage(value, historicalCache, false);
}
export function getXenoTrialsRuntimeAnimationCoverage(value) {
  return getCoverage(value, runtimeCache, true);
}

function getCoverage(value, cache, runtime) {
  const base = getXenoTrialsAnimationCoverageV197(value);
  if (!base) return null;
  if (cache.has(base.id)) return cache.get(base.id);
  const fighter = getXenoTrialsFighterV96(base.id), art = getXenoTrialsArtV96(base.id);
  const atlases = runtime ? getXenoTrialsRuntimeActionAtlases(fighter, art)
    : [getXenoTrialsActionAtlasV199(fighter, art)].filter(Boolean);
  const sourceRig = (runtime ? getXenoTrialsRuntimeArticulatedRig : getXenoTrialsRigV199)(fighter, art);
  const rig = sourceRig?.presentationRevision >= 199 ? sourceRig : null;
  const defense = runtime && getXenoTrialsRuntimeDefenseRig(fighter, art);
  const pantherPounce = runtime && getXenoTrialsPantherPounceFramesV221(fighter, art);
  if (!atlases.length && !rig && !defense && !pantherPounce) return base;
  const states = { ...base.states };

  function admit(action, id, path, renderKind, frameIds, limitations, revision = 199, paths = null) {
    const previous = states[action];
    const media = Object.freeze({ id, path, revision, renderKind, frameIds: Object.freeze(frameIds),
      ...(paths && { paths: Object.freeze(paths) }) });
    const leading = previous?.renderKind === 'drawn' && renderKind === 'mesh' ? previous : media;
    states[action] = Object.freeze({ ...previous, supported: true, motionSupported: true,
      renderKind: leading.renderKind, frameIds: leading.frameIds,
      sources: Object.freeze([media, ...(previous?.sources || [])]), limitations: Object.freeze(limitations) });
  }
  for (const atlas of atlases) {
    if (atlas.kind === 'air-combat') {
      for (const action of ['light', 'heavy']) admit(action, `atlas-v${atlas.revision}-${base.id}`, atlas.texture.path, 'drawn',
        atlas.frames.filter(frame => frame.id.startsWith(`air-${action}-`)).map(frame => frame.id),
        ['airborne-only', 'native-attack-windows', 'three-keys-for-this-action'], atlas.revision);
    } else if (atlas.kind === 'ground-special') {
      admit('special', atlas.specialStyle, atlas.texture.path, 'drawn', atlas.frames.map(frame => frame.id),
        ['grounded-only', 'native-attack-windows', 'sampled-native-phases'], atlas.revision);
    } else {
      admit('super', atlas.superId, atlas.texture.path, 'drawn', atlas.frames.map(frame => frame.id),
        [atlas.superId === 'harbinger-committed-leap' ? 'native-leap-and-landing' : 'grounded-only',
          'native-super-windows', 'sampled-native-phases'], atlas.revision);
    }
  }
  if (rig) {
    admit('presentation', rig.id, rig.path, 'mesh', ['intro', 'round-win', 'round-loss'],
      ['source-bound-mesh'], rig.presentationRevision);
    for (const action of ['light', 'heavy', 'special']) admit(action, rig.id, rig.path, 'mesh', ['recovery'],
      ['native-grounded-recovery-only', 'source-bound-mesh'], rig.presentationRevision);
  }
  if (pantherPounce) admit('special', 'panther-pounce', pantherPounce[0].path, 'drawn', pantherPounce.map(frame => frame.phase),
    ['grounded-only', 'native-attack-windows', 'three-painted-poses'], 221, pantherPounce.map(frame => frame.path));
  if (defense) {
    const limitations = ['grounded-only', 'native-defense-events', 'source-bound-mesh'];
    admit('guard', defense.id, defense.path, 'mesh', ['guard', 'guard-break', 'recover'], limitations, defense.defenseRevision);
    admit('hurt', defense.id, defense.path, 'mesh', ['hurt'], limitations, defense.defenseRevision);
  }
  const drawnStates = Object.freeze(Object.keys(states).filter(action => states[action].renderKind === 'drawn'));
  const meshStates = Object.freeze(Object.keys(states).filter(action => states[action].renderKind === 'mesh'));
  const hasDrawnGestures = drawnStates.some(action => action !== 'idle');
  const revision = Math.max(199, rig?.presentationRevision ?? 0, defense?.defenseRevision ?? 0, pantherPounce ? 221 : 0,
    ...atlases.filter(atlas => atlas.revision >= 201).map(atlas => atlas.revision));
  const result = Object.freeze({ ...base, states: Object.freeze(states), drawnStates, meshStates, hasDrawnGestures,
    playerLabel: hasDrawnGestures ? 'Gestes dessinés' : 'Gestes articulés',
    coverageBasis: `identity-bound-native-attack-windows-v${revision}` });
  cache.set(base.id, result);
  return result;
}
