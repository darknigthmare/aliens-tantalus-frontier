// V188 — mission draw scale of the systemic variant poses (graphics audit 2026-11-15, item 14).
//
// The V97–V99 systemic variants (Albino, Armored, Acid-Blooded, Cryo-Adapted …) carry the
// targetOpaqueHeight of their authoring batch. For several castes it is far above the stature
// the project already declares for their base caste (ENEMY_DISPLAY_STATURES_V110, used by the
// catalogue): an Acid-Blooded K-Series warrior was drawn 268 px tall (≈ 5.3 m at 1 m ≈ 51 px)
// beside a 92 px marine, where its base K-Series is staged at 156 px. Missions now draw such an
// oversize pose at its base caste's stature. Only the drawing changes: hitboxes, ids, data and
// saves are untouched. Royal castes (queens) keep their authored silhouettes; poses without a
// declared stature, humans and poses at or below their stature are unchanged.
import { ENEMIES } from './content-core-v50.js';
import { getEnemyDisplayStatureV110 } from './enemy-display-scale-v110.js';

/** Castes whose authored size is intended (boss / royal class). */
export const MISSION_STATURE_EXEMPT_CASTES_V188 = Object.freeze(['royal']);
const castes = new Map(ENEMIES.map(enemy => [enemy.id, enemy.caste]));
const cache = new Map();

/** { scale, from, to, referenceId } for a dedicated pose: scale < 1 only for an oversize creature pose. */
export function missionPoseStatureV188(pose) {
  const id = pose?.profileId || pose?.id;
  if (!id) return { scale: 1, from: null, to: null, referenceId: null };
  if (cache.has(id)) return cache.get(id);
  const authored = Number(pose.targetOpaqueHeight), stature = getEnemyDisplayStatureV110(pose), caste = castes.get(id) || null;
  const exempt = MISSION_STATURE_EXEMPT_CASTES_V188.includes(caste) || /human|synthetic|commando|working-joe/.test(id);
  const scale = !exempt && stature && authored > stature.height && stature.height > 0 ? stature.height / authored : 1;
  const result = Object.freeze({ scale, from: authored || null, to: scale < 1 ? stature.height : authored || null, referenceId: stature?.referenceId || null, caste });
  cache.set(id, result); return result;
}
export const missionPoseStatureScaleV188 = pose => missionPoseStatureV188(pose).scale;
