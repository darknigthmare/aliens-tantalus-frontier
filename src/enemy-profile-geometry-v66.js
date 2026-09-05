import { V66_ENEMY_PROFILE_SPRITE_SHEETS } from './enemy-profile-registry-v66.js';

// Gameplay body bounds, excluding the long cosmetic tail and extended claws.
// World sizes stay constant when an atlas needs more transparent tail padding.
export const V66_ENEMY_BODY_DIMENSIONS = Object.freeze({
  'enemy-001-ovomorph': Object.freeze({ width: 39, height: 56 }),
  'enemy-003-chestburster': Object.freeze({ width: 35, height: 20 }),
  'enemy-004-drone-big-chap': Object.freeze({ width: 54, height: 146 }),
  'enemy-005-warrior': Object.freeze({ width: 62, height: 136 }),
  'enemy-006-runner': Object.freeze({ width: 78, height: 82 }),
  'enemy-020-k-series-yellow-xenomorph': Object.freeze({ width: 62, height: 136 })
});

export function buildEnemyBodyHitboxesV66(sheets = V66_ENEMY_PROFILE_SPRITE_SHEETS) {
  return Object.freeze(Object.fromEntries(Object.values(sheets).map((sheet) => {
    const dimensions = V66_ENEMY_BODY_DIMENSIONS[sheet.profileId];
    if (!dimensions) throw new Error('V66 body dimensions need a reviewed profile: ' + sheet.profileId);
    const width = dimensions.width * sheet.cellWidth / sheet.renderWidth;
    const height = dimensions.height * sheet.cellHeight / sheet.renderHeight;
    return [sheet.hitbox, Object.freeze({ x: 128 - width / 2, y: 240 - height, width, height })];
  })));
}
