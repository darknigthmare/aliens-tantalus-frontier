import { ENEMIES } from './content-core-v50.js';
import { ENEMY_STATIC_POSES_V96, getEnemyStaticPoseV96, getEnemyStaticPoseStatesV96 } from './enemy-static-poses-v96.js';
import { ENEMY_DEDICATED_POSES_V99 } from './enemy-dedicated-poses-v99.js';
import { ENEMY_DISPLAY_ALPHA_V110 } from './enemy-display-alpha-v110.js';

// Visual staging units, NOT metres and NOT physics. The ordering reflects the
// standing / low quadrupedal / royal silhouettes. V100 physical candidates stay
// unverified and are deliberately not imported or applied here. Unknown custom
// organisms retain their authored display stature instead of acquiring fake lore.
export const ENEMY_DISPLAY_STATURES_V110 = Object.freeze({
  'enemy-001-ovomorph': 56, 'enemy-002-facehugger': 20, 'enemy-003-chestburster': 22,
  'enemy-004-drone-big-chap': 156, 'enemy-005-warrior': 156, 'enemy-006-runner': 82,
  'enemy-007-praetorian': 210, 'enemy-008-queen': 298, 'enemy-009-crusher': 152,
  'enemy-010-spitter': 144, 'enemy-011-lurker': 92, 'enemy-012-carrier': 176,
  'enemy-013-ravager': 194, 'enemy-014-boiler': 132, 'enemy-015-prowler': 88,
  'enemy-016-burster': 88, 'enemy-017-monica-line': 156, 'enemy-018-specimen-six-line': 156,
  'enemy-019-red-xenomorph': 156, 'enemy-020-k-series-yellow-xenomorph': 156,
  'enemy-022-xenoborg': 166, 'enemy-024-ripper-queen': 298,
  'enemy-041-working-joe': 126, 'enemy-042-combat-synthetic': 126,
  'enemy-043-weyland-yutani-commando': 126,
  'castes-film_grid_avp_2004': 156, 'castes-film_queen_chestburster_alien3_1992': 28,
  'castes-film_runner_juvenile_alien3_1992': 30,
  'castes-game_predalien_avp2_primal_hunt': 188, 'castes-game_abomination_avp2010': 210,
  'castes-game_afe_crusher': 152, 'castes-game_afe_pathogen_popper': 32,
  'castes-game_afe_pathogen_stalker': 96, 'castes-game_pathogen_blight': 96,
  'castes-game_pathogen_brute': 166, 'castes-game_pathogen_queen': 298,
  'castes-game_pathogen_runner': 82,
  'castes-game_avp_capcom_arachnoid': 106, 'castes-game_avp_capcom_chrysalis': 152,
  'castes-game_avp_capcom_razor_claws': 174, 'castes-game_avp_capcom_royal_guard': 230,
  'castes-game_avp_capcom_smasher': 166, 'castes-game_avp_capcom_stalker': 150,
  'pose-v94-afe-synth-trooper': 126, 'pose-v94-afe-synth-guard': 132,
  'pose-v94-afe-synth-sniper': 126, 'pose-v94-afe-synth-heavy': 144,
  'pose-v110-afe-synth-incinerator': 144, 'pose-v110-afe-synth-detonator': 110,
  'pose-v110-afe-synth-containment': 132,
  'pose-v111-afe-synth-enforcer': 132,
  'pose-v106-import-game-dd-wy-commando': 126, 'pose-v106-import-game-dd-guardian': 132,
  'pose-v106-import-game-dd-synthetic': 126, 'pose-v106-import-wy-covenant-david': 126,
  'pose-v106-import-synth-eloise': 126, 'pose-v106-import-game-afe-synth-warden': 132
});

const poses = [...ENEMY_STATIC_POSES_V96, ...ENEMY_DEDICATED_POSES_V99,
  ...ENEMY_STATIC_POSES_V96.flatMap(p => (getEnemyStaticPoseStatesV96(p.id) || []).map(s => getEnemyStaticPoseV96(p.id, s.id)))].filter(Boolean);
const byPath = new Map(poses.map(pose => [pose.path, pose]));
const enemiesById = new Map(ENEMIES.map(enemy => [enemy.id, enemy]));
const standardByName = new Map(ENEMIES.filter(enemy => enemy.modifier === 'Standard').map(enemy => [enemy.name, enemy]));
const positive = value => Number.isFinite(value) && value > 0;

/** Exact identities / declared counterparts only. Substrings such as "queen"
 * never make a novel creature a member of a biological lineage. */
export function getEnemyDisplayStatureV110(pose) {
  if (!pose) return null;
  const id = pose.profileId || pose.id;
  let key = [id, pose.legacyCounterpartId, pose.alteredOf].find(value => Object.hasOwn(ENEMY_DISPLAY_STATURES_V110, value || ''));
  const enemy = enemiesById.get(id);
  if (!key && enemy && enemy.modifier !== 'Standard' && enemy.modifier !== 'Juvenile'
    && enemy.name.startsWith(`${enemy.modifier} `)) {
    const base = standardByName.get(enemy.name.slice(enemy.modifier.length + 1));
    if (base && base.biology === enemy.biology && base.caste === enemy.caste
      && Object.hasOwn(ENEMY_DISPLAY_STATURES_V110, base.id)) key = base.id;
  }
  return key ? Object.freeze({ referenceId: key, height: ENEMY_DISPLAY_STATURES_V110[key],
    basis: 'project-relative-stature-by-posture', canonVerified: false }) : null;
}

export function getEnemyDisplayPoseV110(visual) { return byPath.get(visual?.path) || null; }

/** Keep original pixels and aspect ratio; put the measured contact edge on the
 * shared ground. A decoration never changes the horizontal authored root. */
export function getEnemyDisplayDimensionsV110(pose) {
  if (!pose || !positive(pose.sourceWidth) || !positive(pose.sourceHeight)
    || !positive(pose.renderWidth) || !positive(pose.renderHeight)) return null;
  const measured = ENEMY_DISPLAY_ALPHA_V110[pose.path];
  const bounds = pose.alphaBounds || measured?.bounds;
  const bottom = bounds ? bounds[3] / pose.sourceHeight : pose.pivot?.y ?? 1;
  const top = bounds ? bounds[1] / pose.sourceHeight : 0;
  if (!(bottom > top && bottom <= 1)) return null;
  const stature = getEnemyDisplayStatureV110(pose);
  const height = stature ? stature.height / (bottom - top) : pose.renderHeight;
  // Source aspect, not a square portrait or an independently stretched width.
  const width = height * pose.sourceWidth / pose.sourceHeight;
  const alpha = bounds || [0, 0, pose.sourceWidth, bottom * pose.sourceHeight];
  return Object.freeze({ width, height, pivotX: pose.pivot?.x ?? .5, bottom,
    sourceFacing: pose.sourceFacing || 1, visibleHeight: height * (bottom - top),
    visibleWidth: width * (alpha[2] - alpha[0]) / pose.sourceWidth,
    alphaBounds: Object.freeze([...alpha]), referenceId: stature?.referenceId || null,
    basis: stature?.basis || 'preserved-authored-stature-unverified', canonVerified: false });
}
