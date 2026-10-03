/** Native fixed inspection plates. Each four-finish saved family shares one
 * reconstruction; neither exact inventory lookup nor source identity certifies
 * generated pixels as one-to-one geometry. Historical action atlases stay intact. */
export const VP70M_SIDEARM_PROFILE_V120 = Object.freeze({
  baseNumber: 4,
  catalogId: 'weapon-004',
  catalogIds: Object.freeze([
    'weapon-004-vp70-combat-pistol', 'weapon-044-vp70-combat-pistol-field',
    'weapon-084-vp70-combat-pistol-veteran', 'weapon-124-vp70-combat-pistol-prototype'
  ]),
  name: 'VP70 Combat Pistol',
  canonicalName: 'VP70M Sidearm Pistol',
  manufacturer: 'Heckler & Koch',
  imageKey: 'weaponV120:4',
  path: '/assets/openai/equipment/v120-weapons/vp70m-sidearm-native-v120.png',
  rawPath: '/assets/openai/equipment/v120-weapons/vp70m-sidearm-native-v120.png',
  sha256: 'b2d4016ee71430a80b86363badad6521ee15010b0d3172131909aaaef2215def',
  sourceWidth: 1254,
  sourceHeight: 1254,
  alphaBounds: Object.freeze([47, 226, 1220, 1041]),
  alphaBoundsThreshold: 16,
  sourceFacing: 1,
  gripPivot: Object.freeze({ x: 289 / 1254, y: 787 / 1254 }),
  muzzlePivot: Object.freeze({ x: 1202 / 1254, y: 305 / 1254 }),
  width: 82,
  height: 82,
  category: 'pistol',
  sheetId: null,
  clipSet: null,
  visualMode: 'static-pose',
  animationStatus: 'missing',
  reviewStatus: 'accepted-static-adaptation',
  availableStates: Object.freeze(['idle']),
  missingStates: Object.freeze(['action', 'reload', 'service']),
  referenceStatus: 'PRODUCTION_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://propstore.com/product/aliens-1986/lot-32-vp70m-sidearm-pistol/',
  referenceImageUrl: 'https://images.propstore.com/548573f46fb8d465bbfdbd8b6f2dfcc6-1.jpg',
  referenceLabel: 'Propstore, stock 149307, lot 32 — VP70M de tournage, Aliens (1986)',
  referenceCaveat: 'Accessoire de tournage conservé après désactivation. Les dimensions publiées décrivent ce spécimen, pas une métrique de jeu certifiée ; aucune arme fonctionnelle n’est reproduite.',
  sourceWork: 'Aliens (1986)',
  canonScope: 'production-prop',
  identityVerified: true,
  canonExact: false,
  approximate: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  displaySizingPolicy: 'catalog-layout-not-physical-metric-scale',
  release: 'v120',
  legacyAnimation: Object.freeze({
    sheetId: 'weapon.vp70-combat-pistol.action',
    imageKey: 'weaponV56:4',
    path: '/assets/openai/sprites/normalized/weapons/vp70-combat-pistol-action-sheet.png'
  }),
  fallbackReason: 'Reconstruction latérale du VP70M de tournage documenté par Propstore. Pose fixe native ; détails et proportions non certifiés 1:1. Les quatre finitions partagent cette plaque ; l’atlas d’action historique est conservé séparément.'
});

export const UA_571C_SENTRY_PROFILE_V120 = Object.freeze({
  baseNumber: 15,
  catalogId: 'weapon-015',
  catalogIds: Object.freeze([
    'weapon-015-ua-571-c-sentry-gun', 'weapon-055-ua-571-c-sentry-gun-field',
    'weapon-095-ua-571-c-sentry-gun-veteran', 'weapon-135-ua-571-c-sentry-gun-prototype'
  ]),
  name: 'UA 571-C Sentry Gun',
  canonicalName: 'UA 571-C Sentry Gun',
  imageKey: 'weaponV120:15',
  path: '/assets/openai/equipment/v120-weapons/ua-571c-sentry-native-v120.png',
  rawPath: '/assets/openai/equipment/v120-weapons/ua-571c-sentry-native-v120.png',
  sha256: 'f98ebde0c5ec65a2dc7b8c100cabb82d69d219f145d1ca17de2039e33a3df712',
  sourceWidth: 1536,
  sourceHeight: 1024,
  alphaBounds: Object.freeze([46, 38, 1507, 999]),
  alphaBoundsThreshold: 16,
  sourceFacing: 1,
  gripPivot: Object.freeze({ x: 766 / 1536, y: 470 / 1024 }),
  muzzlePivot: Object.freeze({ x: 1480 / 1536, y: 254 / 1024 }),
  width: 112,
  height: 112 * 1024 / 1536,
  category: 'deployable',
  sheetId: null,
  clipSet: null,
  visualMode: 'static-pose',
  animationStatus: 'missing',
  reviewStatus: 'accepted-static-adaptation',
  availableStates: Object.freeze(['idle']),
  missingStates: Object.freeze(['action', 'reload', 'service']),
  referenceStatus: 'PRODUCTION_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://propstore.com/the-prop-store-collection/aliens/sentry-gun/',
  referenceImageUrl: 'https://content.propstore.com/collectionimages/aliens/sentrygun/img1.jpg',
  referenceLabel: 'Propstore Collection — Sentry Gun de tournage, Aliens (1986)',
  referenceCaveat: 'Reconstruction du spécimen conservé, dont la caméra supérieure a été perdue après tournage. La silhouette, la batterie, les câbles et le support sont revus ; les détails et la géométrie finale filmée ne sont pas certifiés.',
  sourceWork: 'Aliens (1986)',
  canonScope: 'production-prop',
  identityVerified: true,
  canonExact: false,
  approximate: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  displaySizingPolicy: 'catalog-layout-not-physical-metric-scale',
  release: 'v120',
  legacyAnimation: Object.freeze({
    sheetId: 'weapon.ua-571c-sentry-gun.action',
    imageKey: 'weaponV56:15',
    path: '/assets/openai/sprites/normalized/weapons/ua-571c-sentry-gun-action-sheet.png'
  }),
  fallbackReason: 'Reconstruction du Sentry de tournage documenté par Propstore. Pose fixe native, compositing vérifié sur quatre fonds ; détails et proportions non certifiés 1:1. Les quatre finitions partagent cette plaque ; l’atlas d’action historique est conservé séparément.'
});

export const WEAPON_NATIVE_PROFILES_V120 = Object.freeze([
  VP70M_SIDEARM_PROFILE_V120, UA_571C_SENTRY_PROFILE_V120
]);
export const WEAPON_NATIVE_ASSETS_V120 = Object.freeze(Object.fromEntries(
  WEAPON_NATIVE_PROFILES_V120.map(profile => [profile.imageKey, profile.path])
));
export const WEAPON_NATIVE_CATALOG_IDS_V120 = Object.freeze(
  WEAPON_NATIVE_PROFILES_V120.flatMap(profile => profile.catalogIds)
);

const byId = new Map();
const byAlias = new Map();
for (const profile of WEAPON_NATIVE_PROFILES_V120) {
  for (const id of profile.catalogIds) {
    const number = Number(id.match(/^weapon-(\d{3})-/)[1]);
    const value = Object.freeze({ profile, number });
    byId.set(id, value);
    byId.set(`weapon-${String(number).padStart(3, '0')}`, value);
  }
  for (const alias of [profile.imageKey, profile.name, profile.canonicalName]) byAlias.set(alias, profile);
}

/** An explicit save ID wins over labels. Unknown IDs, wrong slugs, modulo
 * lookalikes and contradictory anonymous hints never inherit a reviewed plate. */
export function resolveNativeWeaponProfileV120(source = {}) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null;
  const id = String(source.id || '').trim();
  let profile, number;
  if (id) {
    const value = byId.get(id);
    if (!value) return null;
    ({ profile, number } = value);
  } else {
    const aliases = [source.imageKey, source.name, source.canonicalName]
      .filter(value => value != null && String(value).trim() !== '')
      .map(value => String(value).trim());
    if (!aliases.length) return null;
    const matches = aliases.map(alias => byAlias.get(alias));
    if (matches.some(value => !value) || new Set(matches).size !== 1) return null;
    profile = matches[0];
    number = profile.baseNumber;
  }
  return Object.freeze({ ...profile, catalogNumber: number, exact: true,
    authoredFamily: number !== profile.baseNumber });
}
