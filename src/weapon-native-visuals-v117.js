/** Complete native equipment plates, not animation sheets. Stable inventory
 * IDs and the original action atlases remain untouched. Exact here means an
 * identity lookup only: these reconstructions never certify pixel fidelity. */
const nativeProfile = (definition) => Object.freeze({
  sheetId: null,
  clipSet: null,
  visualMode: 'static-pose',
  animationStatus: 'missing',
  reviewStatus: 'accepted-static-adaptation',
  availableStates: Object.freeze(['idle']),
  missingStates: Object.freeze(['action', 'reload', 'service']),
  alphaBoundsThreshold: 16,
  sourceFacing: 1,
  canonExact: false,
  approximate: true,
  identityVerified: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  canonScope: 'production-prop',
  sourceWork: 'Aliens (1986)',
  displaySizingPolicy: 'catalog-layout-not-physical-metric-scale',
  release: 'v117',
  ...definition,
  rawPath: definition.path,
  height: definition.width * definition.sourceHeight / definition.sourceWidth,
  alphaBounds: Object.freeze(definition.alphaBounds),
  catalogIds: Object.freeze(definition.catalogIds),
  gripPivot: Object.freeze(definition.gripPivot),
  muzzlePivot: Object.freeze(definition.muzzlePivot),
  // Existing stateful art is explicit provenance/fallback, never fabricated
  // frames inside the new full-canvas static plate.
  legacyAnimation: Object.freeze(definition.legacyAnimation)
});

export const M41A_PULSE_RIFLE_PROFILE_V117 = nativeProfile({
  baseNumber: 1,
  catalogId: 'weapon-001',
  name: 'M41A Pulse Rifle',
  canonicalName: 'M41A Pulse Rifle',
  imageKey: 'weaponV117:1',
  path: '/assets/openai/equipment/v117-weapons/m41a-pulse-rifle-native-v117.png',
  sha256: '8ec28caf174cd92c2d9b26d5cb6e249a8370591fc3d294575626702f903f2cc2',
  sourceWidth: 1945,
  sourceHeight: 809,
  // Visible silhouette at alpha >= 16; the original faint alpha is preserved.
  alphaBounds: [59, 73, 1912, 743],
  gripPivot: { x: 545 / 1945, y: 505 / 809 },
  muzzlePivot: { x: 1905 / 1945, y: 280 / 809 },
  width: 136,
  category: 'rifle',
  referenceStatus: 'PRODUCTION_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://propstore.com/product/aliens-1986/m41a-pulse-rifle/',
  referenceImageUrl: 'https://images.propstore.com/647cba0f434778267b0b2c952ea1bd4f.jpg',
  referenceLabel: 'Propstore — stock 73950, Aliens (1986), M41A Pulse Rifle de tournage non modifié',
  catalogIds: [
    'weapon-001-m41a-pulse-rifle',
    'weapon-041-m41a-pulse-rifle-field',
    'weapon-081-m41a-pulse-rifle-veteran',
    'weapon-121-m41a-pulse-rifle-prototype'
  ],
  legacyAnimation: {
    sheetId: 'weapon.m41a-pulse-rifle.action',
    imageKey: 'weaponV56:1',
    path: '/assets/openai/sprites/normalized/weapons/m41a-pulse-rifle-action-sheet.png'
  },
  fallbackReason: 'Reconstruction du M41A de tournage documenté par Propstore. Pose fixe native ; détails, finitions et proportions non certifiés 1:1. Les quatre finitions partagent cette plaque ; l’atlas d’action historique est conservé séparément.'
});

export const M56_SMARTGUN_PROFILE_V117 = nativeProfile({
  baseNumber: 5,
  catalogId: 'weapon-005',
  name: 'M56 Smartgun',
  canonicalName: 'M56 Smartgun',
  imageKey: 'weaponV117:5',
  path: '/assets/openai/equipment/v117-weapons/m56-smartgun-native-v117.png',
  sha256: '86804c83d1facc8ef79ccde37d73887fb25d984dc518bb52e20fe6aaf979d62f',
  sourceWidth: 2172,
  sourceHeight: 724,
  alphaBounds: [21, 144, 2140, 608],
  gripPivot: { x: 283 / 2172, y: 425 / 724 },
  muzzlePivot: { x: 2132 / 2172, y: 500 / 724 },
  width: 172,
  category: 'heavy',
  referenceStatus: 'PRODUCTION_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://propstore.com/product/aliens-1986/lot-9-m56-smartgun/',
  referenceImageUrl: 'https://images.propstore.com/b767ba22d449e071e7aeeea9712167af.jpg',
  referenceLabel: 'Propstore — stock 144689, Aliens (1986), M56 Smartgun de tournage avec habillages restaurés',
  referenceCaveat: 'Référence oblique reconstruite de côté ; certains composants Kawasaki de l’accessoire exposé ont été recréés après tournage.',
  catalogIds: [
    'weapon-005-m56-smartgun',
    'weapon-045-m56-smartgun-field',
    'weapon-085-m56-smartgun-veteran',
    'weapon-125-m56-smartgun-prototype'
  ],
  legacyAnimation: {
    sheetId: 'weapon.m56-smartgun.action',
    imageKey: 'weaponV56:5',
    path: '/assets/openai/sprites/normalized/weapons/m56-smartgun-action-sheet.png'
  },
  fallbackReason: 'Reconstruction latérale du M56 de tournage documenté par Propstore, depuis une vue oblique et des habillages restaurés. Pose fixe native ; détails et proportions non certifiés 1:1. Les quatre finitions partagent cette plaque ; l’atlas d’action historique est conservé séparément.'
});

export const WEAPON_NATIVE_PROFILES_V117 = Object.freeze([
  M41A_PULSE_RIFLE_PROFILE_V117, M56_SMARTGUN_PROFILE_V117
]);
export const WEAPON_NATIVE_ASSETS_V117 = Object.freeze(Object.fromEntries(
  WEAPON_NATIVE_PROFILES_V117.map(profile => [profile.imageKey, profile.path])
));
export const WEAPON_NATIVE_CATALOG_IDS_V117 = Object.freeze(
  WEAPON_NATIVE_PROFILES_V117.flatMap(profile => profile.catalogIds)
);

const byId = new Map();
const byAnonymousAlias = new Map();
for (const profile of WEAPON_NATIVE_PROFILES_V117) {
  for (const id of profile.catalogIds) {
    const number = Number(id.match(/^weapon-(\d{3})-/)[1]);
    const record = Object.freeze({ profile, number });
    byId.set(id, record);
    // Bare dossier IDs are accepted only for the eight enumerated identities.
    byId.set(`weapon-${String(number).padStart(3, '0')}`, record);
  }
  for (const alias of [profile.imageKey, profile.name, profile.canonicalName])
    byAnonymousAlias.set(alias, profile);
}

/** Never use modulo matching: weapon-161, a wrong slug or a different known
 * ID must not inherit these plates through a misleading name/imageKey. */
export function resolveNativeWeaponProfileV117(source = {}) {
  const id = String(source.id || '').trim();
  let profile;
  let number;
  if (id) {
    const record = byId.get(id);
    if (!record) return null;
    ({ profile, number } = record);
  } else {
    const aliases = [source.imageKey, source.name, source.canonicalName]
      .filter(value => value != null && String(value).trim() !== '')
      .map(value => String(value).trim());
    if (!aliases.length) return null;
    const matches = aliases.map(alias => byAnonymousAlias.get(alias));
    if (matches.some(value => !value) || new Set(matches).size !== 1) return null;
    profile = matches[0];
    number = profile.baseNumber;
  }
  return Object.freeze({ ...profile, catalogNumber: number,
    exact: true, authoredFamily: number !== profile.baseNumber });
}
