/** Reviewed native equipment images, never animation atlases. Existing inventory
 * IDs and balancing stay intact; each family's four finishes share one fixed
 * pose. Documented identity does not imply certified one-to-one geometry. */
const makeProfile = (definition) => Object.freeze({
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
  release: 'v113',
  ...definition,
  rawPath: definition.path,
  height: definition.width * definition.sourceHeight / definition.sourceWidth,
  alphaBounds: Object.freeze(definition.alphaBounds),
  catalogIds: Object.freeze(definition.catalogIds)
});

export const ES4_ELECTROSTATIC_PISTOL_PROFILE_V113 = makeProfile({
  baseNumber: 20,
  catalogId: 'weapon-020',
  name: 'ES-4 Electroshock Pistol',
  canonicalName: 'Weyland ES-4 Electrostatic Pistol',
  manufacturer: 'Weyland Corp',
  imageKey: 'weaponV113:20',
  path: '/assets/openai/equipment/v113-weapons/es4-electrostatic-pistol-native-v113.png',
  sha256: '0311bfc7fe16f7db142cbd190ddbb6090a6500b934c08f590b3592d113fa4246',
  sourceWidth: 1774,
  sourceHeight: 887,
  alphaBounds: [157, 137, 1636, 792],
  width: 84,
  category: 'pistol',
  referenceStatus: 'PRODUCTION_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://www.auctionzip.com/auction-catalog/entertainment-memorabilia-live-auction-day-3_9TPP7X29QZ',
  referenceImageUrl: 'https://image.invaluable.com/housePhotos/Prop/44/804544/H5769-L423709592.jpg',
  referenceLabel: 'Propstore London — lot 917, Prometheus (2012), Stunt ES-4 Electrostatic Pistol',
  identityVerified: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  canonScope: 'production-prop',
  catalogIds: [
    'weapon-020-es-4-electroshock-pistol',
    'weapon-060-es-4-electroshock-pistol-field',
    'weapon-100-es-4-electroshock-pistol-veteran',
    'weapon-140-es-4-electroshock-pistol-prototype'
  ],
  fallbackReason: 'Adaptation de l’ES-4 Weyland documenté par un accessoire de tournage de Prometheus. Pose fixe ; détails non certifiés 1:1. Les quatre finitions partagent cette illustration.'
});

export const FRONTIER_COMPOUND_BOW_PROFILE_V113 = makeProfile({
  baseNumber: 23,
  catalogId: 'weapon-023',
  name: 'Compound Bow',
  canonicalName: 'Frontier Compound Bow',
  manufacturer: 'Frontier',
  imageKey: 'weaponV113:23',
  path: '/assets/openai/equipment/v113-weapons/frontier-compound-bow-native-v113.png',
  sha256: '068909029460b42506098f1c8bdab4bce6b77bc78b3d5d597a6621444497ffeb',
  sourceWidth: 1024,
  sourceHeight: 1536,
  alphaBounds: [266, 32, 911, 1485],
  width: 80,
  category: 'bow',
  referenceStatus: 'PROJECT_ORIGINAL',
  referenceLabel: 'Création originale Frontier ; aucune identité canonique spécifique documentée',
  identityVerified: false,
  identityStatus: 'project-original',
  geometryStatus: 'project-original-not-canon',
  canonScope: 'project-original',
  projectOriginal: true,
  catalogIds: [
    'weapon-023-compound-bow',
    'weapon-063-compound-bow-field',
    'weapon-103-compound-bow-veteran',
    'weapon-143-compound-bow-prototype'
  ],
  fallbackReason: 'Arc à poulies Frontier original, non canonique. Pose fixe sans flèche encochée ; les quatre finitions partagent cette illustration.'
});

export const SCOUT_BLASTER_RIFLE_PROFILE_V113 = makeProfile({
  baseNumber: 25,
  catalogId: 'weapon-025',
  name: 'Plasma Rifle',
  canonicalName: 'Scout Predator Long Range Blaster Rifle',
  manufacturer: 'Yautja archive',
  imageKey: 'weaponV113:25',
  path: '/assets/openai/equipment/v113-weapons/scout-blaster-rifle-native-v113.png',
  sha256: '245a3320d2b81d43a0a9ee84fd8d1ed60e5fb6862b1c9170f6ef17cb2224bd06',
  sourceWidth: 1944,
  sourceHeight: 809,
  alphaBounds: [27, 255, 1919, 625],
  width: 160,
  category: 'rifle',
  referenceStatus: 'LICENSED_REFERENCE_RECONSTRUCTION',
  referenceUrl: 'https://necaonline.com/2020/02/predator-2-7-scale-action-figure-ultimate-scout-predator/',
  referenceImageUrl: 'https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2020/02/515871.jpg',
  referenceLabel: 'NECA Ultimate Scout Predator — long range Blaster Rifle accessory',
  excelIds: Object.freeze(['ARM-0216']),
  identityVerified: true,
  identityStatus: 'reference-reconstruction',
  geometryStatus: 'reference-reconstruction-not-certified',
  canonScope: 'licensed-collectible',
  referenceSelection: 'Generic Yautja Plasma rifle archive slot resolved to the licensed NECA Scout rifle; not a shoulder plasmacaster or a human UPP rifle.',
  catalogIds: [
    'weapon-025-plasma-rifle',
    'weapon-065-plasma-rifle-field',
    'weapon-105-plasma-rifle-veteran',
    'weapon-145-plasma-rifle-prototype'
  ],
  fallbackReason: 'Le slot Plasma Rifle Yautja utilise une adaptation du fusil Blaster Scout documenté par NECA. Accessoire sous licence, pas un plasmacaster. Pose fixe non certifiée 1:1 ; les quatre finitions partagent cette illustration.'
});

export const WEAPON_NATIVE_PROFILES_V113 = Object.freeze([
  ES4_ELECTROSTATIC_PISTOL_PROFILE_V113,
  FRONTIER_COMPOUND_BOW_PROFILE_V113,
  SCOUT_BLASTER_RIFLE_PROFILE_V113
]);

export const WEAPON_NATIVE_ASSETS_V113 = Object.freeze(Object.fromEntries(
  WEAPON_NATIVE_PROFILES_V113.map(profile => [profile.imageKey, profile.path])
));

export const WEAPON_NATIVE_CATALOG_IDS_V113 = Object.freeze(
  WEAPON_NATIVE_PROFILES_V113.flatMap(profile => profile.catalogIds)
);

/** Match the four existing save slots only, with name/key fallback for anonymous
 * pickup objects. A conflicting inventory ID never gets reassigned by its name. */
export function resolveNativeWeaponProfileV113(source = {}) {
  const id = String(source.id || '');
  const number = Number(id.match(/^weapon-(\d{3})(?:-|$)/)?.[1] || 0);
  const baseName = String(source.name || source.canonicalName || '').split(/\s+[—-]\s+/u)[0].trim();
  const profile = WEAPON_NATIVE_PROFILES_V113.find(entry => {
    if (id) return entry.catalogIds.includes(id) || (id === `weapon-${String(number).padStart(3, '0')}`
      && [0, 40, 80, 120].some(offset => entry.baseNumber + offset === number));
    return source.imageKey === entry.imageKey || [entry.name, entry.canonicalName].includes(baseName);
  });
  if (!profile) return null;
  return Object.freeze({
    ...profile,
    catalogNumber: number || profile.baseNumber,
    // Exact inventory match, not a claim that generated geometry is canonical.
    exact: true,
    authoredFamily: number > 40
  });
}


