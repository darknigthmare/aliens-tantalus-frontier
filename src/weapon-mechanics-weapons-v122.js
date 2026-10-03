export const FIREBALL_WEAPON_ID_V122 = 'weapon-171-x1-fireball';
// Identity and gel-projectile impact mechanism are documented by Cold Iron.
// Distances, damage, travel speed and lifetime below are original game tuning.
export const FIREBALL_MECHANICS_V122 = Object.freeze({
  weaponId: FIREBALL_WEAPON_ID_V122, mechanism: 'D17-gel-projectile-impact-explosion',
  sourceUrl: 'https://www.aliensfireteamelite.com/en/community/afe-season-3-deep-dive/',
  statsPolicy: 'v122-original-project-tuning-not-source-statistics',
  projectileSpeed: 480, projectileLife: 2.6, gravity: 140,
  splash: 95, splashDamageFactor: 0.48, maxHits: 1, penetrationBudget: 0,
  armorBypass: 0.3, status: 'burn', noise: 1.15, reloadFamily: 'launcher'
});
/** Saved ID only. Names, family, tags and a lookalike suffix cannot enable it. */
export function resolveWeaponMechanicsV122(weapon) {
  return weapon && typeof weapon === 'object' && !Array.isArray(weapon)
    && weapon.id === FIREBALL_WEAPON_ID_V122 ? FIREBALL_MECHANICS_V122 : null;
}
