import {
  ENEMY_STATIC_POSES_V95, ENEMY_STATIC_POSE_PATHS_V95,
  getEnemyStaticPoseV95, sanitizeEnemyStaticPoseStateV95,
  getEnemyStaticPoseStatesV95, getEnemyStaticPoseBaseStateLabelV95,
  getEnemyStaticPoseDefaultStateV95, getEnemyStaticPoseStateOptionsV95,
  selectEnemyStaticPoseEncounterStateV95, getEnemyStaticPoseRangedBehaviorV95
} from './enemy-static-poses-v95.js';
import { ENEMY_EXPANSION_ASSETS_V96 } from './enemy-expansion-assets-v96.js';
import { ENEMY_EXPANSION_QUEEN_V96 } from './enemy-expansion-queen-v96.js';
import { ENEMY_USER_IMPORTS_V103 } from './enemy-user-imports-v103.js';
import { ENEMY_USER_IMPORTS_V105 } from './enemy-user-imports-v105.js';
import { ENEMY_USER_IMPORTS_V106 } from './enemy-user-imports-v106.js';
import { ENEMY_SYNTH_ADAPTATIONS_V110 } from './enemy-synth-adaptations-v110.js';

const ADDITIONS = Object.freeze([...ENEMY_EXPANSION_ASSETS_V96, ...ENEMY_EXPANSION_QUEEN_V96, ...ENEMY_USER_IMPORTS_V103, ...ENEMY_USER_IMPORTS_V105, ...ENEMY_USER_IMPORTS_V106, ...ENEMY_SYNTH_ADAPTATIONS_V110]);

/** Append-only admission. Research candidates and historical replacement art
 * are deliberately not new identities. Static poses do not imply animation. */
export const ENEMY_STATIC_POSES_V96 = Object.freeze([
  ...ENEMY_STATIC_POSES_V95, ...ADDITIONS
]);
const EXTRA = new Map(ADDITIONS.map(d => [d.id, d]));
export const ENEMY_STATIC_POSE_IDS_V96 = Object.freeze(ENEMY_STATIC_POSES_V96.map(d => d.id));
if (new Set(ENEMY_STATIC_POSE_IDS_V96).size !== ENEMY_STATIC_POSES_V96.length)
  throw new Error('Duplicate V96 static enemy identity');
export const ENEMY_STATIC_POSE_PATHS_V96 = Object.freeze([
  ...new Set([...ENEMY_STATIC_POSE_PATHS_V95, ...ADDITIONS.map(d => d.path)])
]);

export function getEnemyStaticPoseV96(id, stateId = null) {
  return typeof id === 'string' ? EXTRA.get(id) || getEnemyStaticPoseV95(id, stateId) : null;
}
export const getEnemyStaticPoseStateV96 = getEnemyStaticPoseV96;
export function sanitizeEnemyStaticPoseStateV96(id, stateId) {
  return EXTRA.has(id) ? null : sanitizeEnemyStaticPoseStateV95(id, stateId);
}
export function getEnemyStaticPoseStatesV96(id) {
  return EXTRA.get(id)?.states || getEnemyStaticPoseStatesV95(id);
}
export function getEnemyStaticPoseBaseStateLabelV96(id) {
  return EXTRA.has(id) ? 'Pose de base' : getEnemyStaticPoseBaseStateLabelV95(id);
}
export function getEnemyStaticPoseDefaultStateV96(id) {
  return EXTRA.has(id) ? null : getEnemyStaticPoseDefaultStateV95(id);
}
export function getEnemyStaticPoseStateOptionsV96(id) {
  return EXTRA.has(id) ? [{ id: '', label: 'Pose de base' }] : getEnemyStaticPoseStateOptionsV95(id);
}
export function selectEnemyStaticPoseEncounterStateV96(id, options = {}) {
  return EXTRA.has(id) ? null : selectEnemyStaticPoseEncounterStateV95(id, options);
}
export function getEnemyStaticPoseRangedBehaviorV96(definition) {
  // V106 owns an explicit per-image weapon contract: biological family alone
  // never gives an unarmed synth or human a gun, nor an Engineer acidic shots.
  const admitted = EXTRA.get(definition?.id);
  if ([106, 110].includes(admitted?.visualRevision)) return admitted.rangedBehavior;
  // These supplied adults own a melee contract; a synthetic label must not
  // silently give a Working Joe a rifle or a xeno an acid-spit attack.
  return [103, 105].includes(EXTRA.get(definition?.id)?.visualRevision) ? 'melee' : getEnemyStaticPoseRangedBehaviorV95(definition);
}
