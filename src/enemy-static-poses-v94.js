import { ENEMY_USER_CASTES_V87 } from './enemy-user-castes-v87.js';
import { ENEMY_ADDITIONAL_POSES_V94 } from './enemy-additional-poses-v94.js';

/** One admitted-pose contract shared by campaign, BIOFORGE and encyclopedia. */
export const ENEMY_STATIC_POSES_V94 = Object.freeze([
  ...ENEMY_USER_CASTES_V87,
  ...ENEMY_ADDITIONAL_POSES_V94
]);
const BY_ID = new Map(ENEMY_STATIC_POSES_V94.map(definition => [definition.id, definition]));
if (BY_ID.size !== ENEMY_STATIC_POSES_V94.length) throw new Error('Duplicate static enemy pose identity');
export const ENEMY_STATIC_POSE_IDS_V94 = Object.freeze(ENEMY_STATIC_POSES_V94.map(definition => definition.id));
export const ENEMY_STATIC_POSE_PATHS_V94 = Object.freeze(ENEMY_STATIC_POSES_V94.map(definition => definition.path));

/** Strict admitted-ID lookup: no family inference and no pending asset fallback. */
export function getEnemyStaticPoseV94(id) {
  return typeof id === 'string' ? BY_ID.get(id) || null : null;
}

/** Synthetic firearms must never inherit the legacy biological acid default. */
export function getEnemyStaticPoseRangedBehaviorV94(definition) {
  if (definition?.biology === 'synthetic') return 'shooter';
  if (definition?.rangedBehavior === 'shooter' || definition?.rangedBehavior === 'spitter') return definition.rangedBehavior;
  return definition?.basename === 'game_xenoborg_avp1999' ? 'shooter' : 'spitter';
}
