/** The Volcan is a distinct heavy flamethrower, not a reskin of the M240.
 * This append-only identity leaves all 146 previous save IDs intact. Weapon
 * statistics are project tuning; source identity never certifies geometry. */
export const OCAP91_VOLCAN_WEAPON_V116 = Object.freeze({
  id: 'weapon-147-ocap-91-volcan',
  name: 'OCAP-91 Volcan',
  canonicalName: 'OCAP-91 Volcan Heavy Flamethrower',
  family: 'flame', source: 'Hyperdyne', manufacturer: 'Hyperdyne Corporation',
  mark: 'Standard', damage: 42, fireRate: 1, magazine: 9, reload: 3.1,
  penetration: 35, rarity: 'rare',
  provenance: 'licensed-reference-project-adaptation',
  tags: Object.freeze(['flame', 'heavy', 'fuel-canister']),
  appearances: Object.freeze(['Aliens: Fireteam Elite']),
  statsPolicy: 'volcan-v116-project-tuning-not-source-statistics',
  description: 'Lance-flammes lourd à réservoir inférieur, distinct du M240. Reconstruction du modèle aperçu dans Aliens: Fireteam Elite ; comportement et chiffres de simulation réglés pour Tantalus.',
  canonExact: false, identityVerified: true
});

export const OCAP91_VOLCAN_PROFILE_V116 = Object.freeze({
  baseNumber: 147, catalogId: 'weapon-147',
  catalogIds: Object.freeze([OCAP91_VOLCAN_WEAPON_V116.id]),
  name: OCAP91_VOLCAN_WEAPON_V116.name,
  canonicalName: OCAP91_VOLCAN_WEAPON_V116.canonicalName,
  manufacturer: 'Hyperdyne Corporation',
  imageKey: 'weaponV116:147',
  path: '/assets/openai/equipment/v116-weapons/ocap-91-volcan-native-v116.png',
  rawPath: '/assets/openai/equipment/v116-weapons/ocap-91-volcan-native-v116.png',
  sha256: '66426c0cbe31a211fa79fcfd22e6b56ad3036304b825b11e367713f9e13f2720',
  sourceWidth: 1944, sourceHeight: 809,
  alphaBounds: Object.freeze([22, 147, 1933, 663]),
  alphaBoundsThreshold: 16, sourceFacing: 1,
  // The underside service/fuel handle anchors the inspection; muzzle remains
  // a separate point for eventual action effects, never an invented atlas.
  gripPivot: Object.freeze({ x: 988 / 1944, y: 507 / 809 }),
  muzzlePivot: Object.freeze({ x: 1898 / 1944, y: 339 / 809 }),
  width: 164, height: 164 * 809 / 1944, category: 'heavy',
  sheetId: null, clipSet: null, visualMode: 'static-pose',
  animationStatus: 'missing', reviewStatus: 'accepted-static-adaptation',
  availableStates: Object.freeze(['idle']),
  missingStates: Object.freeze(['action', 'reload', 'service']),
  referenceStatus: 'IN_GAME_VISUAL_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://www.aliensfireteamelite.com/en/releasenotes/',
  referenceImageUrl: 'https://www.avpcentral.com/images/m240-flamethrower/ocap-91-volcan.webp',
  referenceLabel: 'Modèle en jeu OCAP-91 Volcan, capture publiée par AvP Central ; existence confirmée par les notes officielles Cold Iron',
  identityVerified: true, identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  canonScope: 'game-model', canonExact: false, approximate: true, release: 'v116',
  fallbackReason: 'Illustration dédiée du Volcan d’après son modèle en jeu, distincte du M240. Pose fixe native ; petits détails, inscriptions et proportions non certifiés 1:1. Statistiques et fonctionnement réglés pour le projet.'
});

export const WEAPON_NATIVE_PROFILES_V116 = Object.freeze([OCAP91_VOLCAN_PROFILE_V116]);
export const WEAPON_NATIVE_ASSETS_V116 = Object.freeze({
  [OCAP91_VOLCAN_PROFILE_V116.imageKey]: OCAP91_VOLCAN_PROFILE_V116.path
});
export const WEAPON_NATIVE_CATALOG_IDS_V116 = Object.freeze([OCAP91_VOLCAN_WEAPON_V116.id]);
export const WEAPONS_ADDITIONS_V116 = Object.freeze([OCAP91_VOLCAN_WEAPON_V116]);

/** Resolve before the legacy modulo-40 family matcher. A mismatched inventory
 * ID cannot inherit the Volcan illustration simply because of its name. */
export function resolveNativeWeaponProfileV116(source = {}) {
  const id = String(source.id || '');
  const profile = OCAP91_VOLCAN_PROFILE_V116;
  if (id ? ![OCAP91_VOLCAN_WEAPON_V116.id, profile.catalogId].includes(id)
    : source.imageKey !== profile.imageKey
      && ![profile.name, profile.canonicalName].includes(String(source.name || source.canonicalName || ''))) return null;
  // `exact` is an inventory identity match, not fidelity: canonExact remains
  // false and approximate remains true all the way to catalogue provenance.
  return Object.freeze({ ...profile, catalogNumber: 147, exact: true, authoredFamily: false });
}
