/** One reviewed native equipment plate, not an animation sheet. The exact
 * lookup below is a save identity contract, never certified 1:1 geometry. */
export const M240_INCINERATOR_PROFILE_V118 = Object.freeze({
  baseNumber: 6,
  catalogId: 'weapon-006',
  name: 'M240 Incinerator Unit',
  canonicalName: 'M240 Incinerator Unit',
  imageKey: 'weaponV118:6',
  path: '/assets/openai/equipment/v118-weapons/m240-incinerator-native-v118.png',
  rawPath: '/assets/openai/equipment/v118-weapons/m240-incinerator-native-v118.png',
  sheetId: null,
  clipSet: null,
  visualMode: 'static-pose',
  animationStatus: 'missing',
  reviewStatus: 'accepted-static-adaptation',
  availableStates: Object.freeze(['idle']),
  missingStates: Object.freeze(['action', 'reload', 'service']),
  sha256: 'cdd6ffdb64b5ed11b21f7ac57b5052b0fd42c5a11e95ff946adb220195cb5747',
  sourceWidth: 1774,
  sourceHeight: 887,
  // Exclusive visible bounds at alpha >= 16. Native low-alpha pixels are
  // preserved rather than removed or falsely certified as a perfect cutout.
  alphaBounds: Object.freeze([61, 51, 1721, 854]),
  alphaBoundsThreshold: 16,
  sourceFacing: 1,
  gripPivot: Object.freeze({ x: 310 / 1774, y: 418 / 887 }),
  muzzlePivot: Object.freeze({ x: 1710 / 1774, y: 233 / 887 }),
  width: 132,
  height: 132 * 887 / 1774,
  category: 'firearm',
  referenceStatus: 'LICENSED_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://www.hottoys.jp/item/view/100006171.php',
  referenceImageUrl: 'https://www.hottoys.jp/catalog/swfdata/hl0032/imgview_image/up_1.jpg',
  referenceLabel: 'HCG / Hot Toys Japan — M240 Incinerator, réplique licenciée 1/1, produit 100006171',
  referenceCaveat: 'Reconstruction depuis les photographies et le plan de la réplique HCG licenciée ; le fabricant indique que les photographies montrent un prototype. La réplique mesure environ 79 cm, pas une mesure certifiée de chaque arme de fiction.',
  sourceWork: 'Aliens (1986)',
  canonScope: 'licensed-replica',
  identityVerified: true,
  canonExact: false,
  approximate: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  displaySizingPolicy: 'catalog-layout-not-physical-metric-scale',
  release: 'v118',
  catalogIds: Object.freeze([
    'weapon-006-m240-incinerator-unit',
    'weapon-046-m240-incinerator-unit-field',
    'weapon-086-m240-incinerator-unit-veteran',
    'weapon-126-m240-incinerator-unit-prototype'
  ]),
  legacyAnimation: Object.freeze({
    sheetId: 'weapon.m240-incinerator-unit.action',
    imageKey: 'weaponV56:6',
    path: '/assets/openai/sprites/normalized/weapons/m240-incinerator-unit-action-sheet.png'
  }),
  fallbackReason: 'Reconstruction du M240 documenté par la réplique licenciée HCG. Pose fixe native ; détails, finitions et proportions non certifiés 1:1. Les quatre finitions partagent cette plaque ; l’atlas d’action historique est conservé séparément. Le OCAP-91 Volcan reste une arme distincte.'
});

export const WEAPON_NATIVE_PROFILES_V118 = Object.freeze([M240_INCINERATOR_PROFILE_V118]);
export const WEAPON_NATIVE_ASSETS_V118 = Object.freeze({
  [M240_INCINERATOR_PROFILE_V118.imageKey]: M240_INCINERATOR_PROFILE_V118.path
});
export const WEAPON_NATIVE_CATALOG_IDS_V118 = M240_INCINERATOR_PROFILE_V118.catalogIds;

const byId = new Map();
for (const id of WEAPON_NATIVE_CATALOG_IDS_V118) {
  const number = Number(id.match(/^weapon-(\d{3})-/)[1]);
  byId.set(id, number);
  byId.set(`weapon-${String(number).padStart(3, '0')}`, number);
}
const anonymousAliases = new Set([
  M240_INCINERATOR_PROFILE_V118.imageKey, M240_INCINERATOR_PROFILE_V118.name
]);

/** No modulo/substring matching: the Volcan, future IDs, wrong slugs and
 * conflicting anonymous hints must never inherit the M240 geometry. */
export function resolveNativeWeaponProfileV118(source = {}) {
  const id = String(source.id || '').trim();
  let number;
  if (id) {
    number = byId.get(id);
    if (!number) return null;
  } else {
    const aliases = [source.imageKey, source.name, source.canonicalName]
      .filter(value => value != null && String(value).trim() !== '')
      .map(value => String(value).trim());
    if (!aliases.length || aliases.some(alias => !anonymousAliases.has(alias))) return null;
    number = M240_INCINERATOR_PROFILE_V118.baseNumber;
  }
  return Object.freeze({ ...M240_INCINERATOR_PROFILE_V118, catalogNumber: number,
    exact: true, authoredFamily: number !== M240_INCINERATOR_PROFILE_V118.baseNumber });
}
