import { ENEMY_STATIC_POSES_V94, getEnemyStaticPoseRangedBehaviorV94 } from './enemy-static-poses-v94.js';
import { ENEMY_USER_CREATIONS_V95 } from './enemy-user-creations-v95.js';
import { ENEMY_HISTORICAL_VARIANTS_V95 } from './enemy-historical-variants-v95.js';

/** Append-only: historical objects, geometry and identity remain untouched. */
export const ENEMY_STATIC_POSES_V95 = Object.freeze([
  ...ENEMY_STATIC_POSES_V94,
  ...ENEMY_USER_CREATIONS_V95
]);
const BY_ID = new Map(ENEMY_STATIC_POSES_V95.map(definition => [definition.id, definition]));
if (BY_ID.size !== ENEMY_STATIC_POSES_V95.length) throw new Error('Duplicate static enemy pose identity');
const STATES_BY_ID = new Map();
for (const definition of ENEMY_STATIC_POSES_V95) {
  const states = new Map();
  for (const state of ENEMY_HISTORICAL_VARIANTS_V95[definition.id]?.states || definition.states || []) {
    const stateId = state.stateId || state.id;
    if (typeof stateId !== 'string' || !/^[a-z0-9-]{1,64}$/.test(stateId) || states.has(stateId))
      throw new Error(`Invalid static enemy state: ${definition.id}`);
    // A visual state cannot replace the biological/combat identity or tuning.
    const visual = Object.fromEntries(['path', 'filename', 'imageKey', 'sourceWidth', 'sourceHeight', 'sha256',
      'sourceFacing', 'pivot', 'renderWidth', 'renderHeight', 'alphaBounds'].filter(key => state[key] !== undefined).map(key => [key, state[key]]));
    states.set(stateId, Object.freeze({ ...definition, ...visual, id: definition.id, profileId: definition.id,
      visualStateV95: stateId, stateLabelV95: state.label || stateId,
      visualProvenanceV95: state.provenance || definition.provenance }));
  }
  STATES_BY_ID.set(definition.id, states);
}

export const ENEMY_STATIC_POSE_IDS_V95 = Object.freeze(ENEMY_STATIC_POSES_V95.map(definition => definition.id));
export const ENEMY_STATIC_POSE_PATHS_V95 = Object.freeze([...new Set(ENEMY_STATIC_POSES_V95.flatMap(definition =>
  [definition.path, ...[...(STATES_BY_ID.get(definition.id)?.values() || [])].map(state => state.path)]))]);

/** Unknown states revert to the admitted base pose, never a foreign identity. */
export function sanitizeEnemyStaticPoseStateV95(profileId, stateId) {
  return typeof stateId === 'string' && STATES_BY_ID.get(profileId)?.has(stateId) ? stateId : null;
}

/** Optional fixed state; the returned identity always remains its parent. */
export function getEnemyStaticPoseV95(id, stateId = null) {
  if (typeof id !== 'string') return null;
  return STATES_BY_ID.get(id)?.get(sanitizeEnemyStaticPoseStateV95(id, stateId)) || BY_ID.get(id) || null;
}
export const getEnemyStaticPoseStateV95 = getEnemyStaticPoseV95;

/** All consumers use the overlay rather than mutating historical frozen records. */
export function getEnemyStaticPoseStatesV95(id) {
  return ENEMY_HISTORICAL_VARIANTS_V95[id]?.states || BY_ID.get(id)?.states || [];
}
export function getEnemyStaticPoseBaseStateLabelV95(id) {
  return ENEMY_HISTORICAL_VARIANTS_V95[id]?.baseStateLabel || BY_ID.get(id)?.baseStateLabel || 'Pose de base';
}
export function getEnemyStaticPoseDefaultStateV95(id) {
  return ENEMY_HISTORICAL_VARIANTS_V95[id]?.defaultStateId || null;
}
export function getEnemyStaticPoseStateOptionsV95(id) {
  if (!BY_ID.has(id)) return [];
  const states = getEnemyStaticPoseStatesV95(id).map(state => ({ id: state.stateId || state.id, label: state.label || state.stateId || state.id }));
  return getEnemyStaticPoseDefaultStateV95(id) ? states : [{ id: '', label: getEnemyStaticPoseBaseStateLabelV95(id) }, ...states];
}

/** Stable colour roll for admitted historical colour variants only.
 * It changes no encounter quota, caste selection, behaviour or combat tuning. */
export function selectEnemyStaticPoseEncounterStateV95(id, options = {}) {
  const variants = ENEMY_HISTORICAL_VARIANTS_V95[id]?.states;
  if (!variants?.length) return null;
  const raw = Number(options.levelSeed?.seed ?? options.seed);
  const seed = Number.isSafeInteger(Math.trunc(raw)) ? Math.abs(Math.trunc(raw)) : 0;
  const candidateOrdinal = Number(String(options.operationId || '').match(/^operation-(\d+)-/)?.[1]);
  const ordinal = Number.isSafeInteger(candidateOrdinal) && candidateOrdinal >= 0 ? candidateOrdinal : 0;
  return variants[(seed % variants.length + ordinal % variants.length) % variants.length].stateId;
}

export function getEnemyStaticPoseRangedBehaviorV95(definition) {
  if (definition?.biology === 'human') return 'shooter';
  return getEnemyStaticPoseRangedBehaviorV94(definition);
}
