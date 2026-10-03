/** V122 dedicated weapon inspection plaques; fixed idle poses only.
 * IDs are append-only; source renders attest identity, never exact generated pixels.
 * Independent release admission remains owned by the equipment release guard. */
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const inspectedRows = [
  {
    "number": 171,
    "id": "weapon-171-x1-fireball",
    "name": "X1 Fireball",
    "file": "x1-fireball",
    "category": "flame",
    "family": "flame",
    "sourceWidth": 1998,
    "sourceHeight": 787,
    "sha256": "d61a4b4f448fae631c493aabc35ad0184d1d6cc0279d4427656aa6b8f232e7c6",
    "alphaBounds": [
      84,
      38,
      1952,
      758
    ],
    "grip": [
      620,
      520
    ],
    "muzzle": [
      1930,
      200
    ],
    "displayWidth": 112,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/13cd10d6c2b6ed0898e71e84c7a5a215.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/afe-season-3-deep-dive/",
    "referencePanel": "upper-left",
    "referenceLabel": "Cold Iron Studios — vue officielle saison 3"
  },
  {
    "number": 172,
    "id": "weapon-172-lem-stg24-storm-rifle",
    "name": "LEM StG24 Storm Rifle",
    "file": "lem-stg24-storm-rifle",
    "category": "rifle",
    "family": "ballistic",
    "sourceWidth": 1931,
    "sourceHeight": 814,
    "sha256": "a554af8aaf2fbaf72ea32f1d125f20add0791423d6c819e94bdc9f466abf06e8",
    "alphaBounds": [
      43,
      152,
      1891,
      681
    ],
    "grip": [
      650,
      550
    ],
    "muzzle": [
      1850,
      320
    ],
    "displayWidth": 108,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/7c1e86e6cde1368364bb3f0cdbeed260.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referencePanel": "lower-left",
    "referenceLabel": "Cold Iron Studios — vue officielle Pathogen"
  },
  {
    "number": 173,
    "id": "weapon-173-u1a2-gl-conversion",
    "name": "U1A2 GL Conversion",
    "file": "u1a2-gl-conversion",
    "category": "sidearm",
    "family": "explosive",
    "sourceWidth": 1983,
    "sourceHeight": 793,
    "sha256": "448a261a794757ac1f9cf933fbf4afc0e62ea5c5763a7e7cefc470d1308ef2ba",
    "alphaBounds": [
      182,
      109,
      1841,
      745
    ],
    "grip": [
      650,
      620
    ],
    "muzzle": [
      1810,
      450
    ],
    "displayWidth": 84,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/7c1e86e6cde1368364bb3f0cdbeed260.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referencePanel": "lower-right",
    "referenceLabel": "Cold Iron Studios — vue officielle Pathogen"
  },
  {
    "number": 174,
    "id": "weapon-174-4c2-astra",
    "name": "4C2 Astra",
    "file": "4c2-astra",
    "category": "rifle",
    "family": "ballistic",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "sha256": "ea36651e4c3e839c53f4c7e3f542cb16f4feef9e2037b151a5f4832659ce9ba6",
    "alphaBounds": [
      51,
      165,
      1725,
      852
    ],
    "grip": [
      580,
      570
    ],
    "muzzle": [
      1680,
      365
    ],
    "displayWidth": 106,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/19dd554c9c27cac8f09693528a10a872.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referencePanel": "lower-left",
    "referenceLabel": "Cold Iron Studios — vue officielle Pathogen"
  },
  {
    "number": 175,
    "id": "weapon-175-2b1-vajra",
    "name": "2B1 Vajra",
    "file": "2b1-vajra",
    "category": "heavy",
    "family": "explosive",
    "sourceWidth": 2087,
    "sourceHeight": 753,
    "sha256": "c23714df373d28ac445417212a6ccad277f6b1825c257938b8cfc34443d23cb8",
    "alphaBounds": [
      36,
      25,
      2062,
      738
    ],
    "grip": [
      1000,
      590
    ],
    "muzzle": [
      2020,
      425
    ],
    "displayWidth": 126,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/19dd554c9c27cac8f09693528a10a872.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referencePanel": "upper-right",
    "referenceLabel": "Cold Iron Studios — vue officielle Pathogen",
    "referenceCaveat": "Vue primaire officielle entière inspectée, désignation 2B1 attestée par image et notes ; la prose Pathogen affiche 2N1. Adaptation fixe ; détails, proportions, dimensions et statistiques non certifiés 1:1."
  },
  {
    "number": 176,
    "id": "weapon-176-6a-jaipur-smg",
    "name": "6A Jaipur Submachine Gun",
    "file": "6a-jaipur-smg",
    "category": "smg",
    "family": "ballistic",
    "sourceWidth": 1672,
    "sourceHeight": 941,
    "sha256": "b3dde005b2c2c65f3a73f15f850f7a72067bad48dcff6b6fc13f9cb6ec019dfb",
    "alphaBounds": [
      80,
      163,
      1594,
      855
    ],
    "grip": [
      1050,
      660
    ],
    "muzzle": [
      1560,
      325
    ],
    "displayWidth": 94,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/19dd554c9c27cac8f09693528a10a872.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referencePanel": "upper-left",
    "referenceLabel": "Cold Iron Studios — vue officielle Pathogen"
  },
  {
    "number": 177,
    "id": "weapon-177-8a7-dambulla-machine-pistol",
    "name": "8A7 Dambulla Machine Pistol",
    "file": "8a7-dambulla-machine-pistol",
    "category": "sidearm",
    "family": "ballistic",
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "sha256": "94304d95c05fa31f491f4c6e954f17abfaf70a8623bbc77fe37ba862d5d1feca",
    "alphaBounds": [
      94,
      81,
      1662,
      880
    ],
    "grip": [
      700,
      560
    ],
    "muzzle": [
      1645,
      235
    ],
    "displayWidth": 86,
    "referenceImageUrl": "https://www.aliensfireteamelite.com/images/uploads/19dd554c9c27cac8f09693528a10a872.jpg",
    "referenceUrl": "https://www.aliensfireteamelite.com/en/community/pathogen-deep-dive-an-exhilarating-new-story/",
    "referencePanel": "lower-right",
    "referenceLabel": "Cold Iron Studios — vue officielle Pathogen"
  }
];
export const WEAPON_NATIVE_PROFILES_V122 = freeze(inspectedRows.map(row => ({
  baseNumber:row.number,catalogId:'weapon-'+row.number,catalogIds:[row.id],
  name:row.name,canonicalName:row.name,category:row.category,
  imageKey:'weaponV122:'+row.number,path:'/assets/openai/equipment/v122-weapons/'+row.file+'-native-v122.png',
  rawPath:'/assets/openai/equipment/v122-weapons/'+row.file+'-native-v122.png',
  sourceWidth:row.sourceWidth,sourceHeight:row.sourceHeight,sha256:row.sha256,
  alphaBounds:row.alphaBounds,alphaBoundsThreshold:16,
  gripPivot:{x:row.grip[0]/row.sourceWidth,y:row.grip[1]/row.sourceHeight},
  muzzlePivot:{x:row.muzzle[0]/row.sourceWidth,y:row.muzzle[1]/row.sourceHeight},
  width:row.displayWidth,height:row.displayWidth*row.sourceHeight/row.sourceWidth,sourceFacing:1,
  sheetId:null,clipSet:null,legacyAnimation:null,visualMode:'static-pose',animationStatus:'missing',
  availableStates:['idle'],missingStates:['action','reload','service'],
  release:'v122',sourceWork:'Aliens: Fireteam Elite',sourceProvenance:'official-publisher-game-render',
  referenceSource:'official-game-promotion',referenceStatus:'PRIMARY_GAME_RENDER_ADAPTATION',
  referenceUrl:row.referenceUrl,referenceImageUrl:row.referenceImageUrl,referencePanel:row.referencePanel,
  referenceLabel:row.referenceLabel,referenceComplete:true,
  identityVerified:true,canonExact:false,approximate:true,identityStatus:'reference-reconstruction',
  geometryStatus:'reference-reconstruction-not-certified',displaySizingPolicy:'catalog-layout-not-physical-metric-scale',
  reviewStatus:'accepted-static-adaptation',reviewScope:'independent-four-background-byte-admission-equipment-release-v122',
  referenceCaveat:row.referenceCaveat || 'Vue primaire officielle entière inspectée. Adaptation fixe ; détails, proportions, dimensions et statistiques non certifiés 1:1.',
  fallbackReason:'Plaque fixe dédiée sur la vue officielle. Aucune séquence de tir, recharge ou service générée.'
})));
export const WEAPON_NATIVE_ASSETS_V122 = freeze(Object.fromEntries(WEAPON_NATIVE_PROFILES_V122.map(p => [p.imageKey,p.path])));
export const WEAPON_NATIVE_CATALOG_IDS_V122 = freeze(WEAPON_NATIVE_PROFILES_V122.flatMap(p=>p.catalogIds));
const bySavedId = new Map(WEAPON_NATIVE_PROFILES_V122.flatMap(p=>p.catalogIds.map(id=>[id,p])));
const byNumber = new Map(WEAPON_NATIVE_PROFILES_V122.map(p=>[p.catalogId,p]));
/** No name-only, suffix, modulo or borrowed-atlas lookup: saved identity is authoritative. */
export function resolveNativeWeaponProfileV122(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.id !== 'string') return null;
  const profile = bySavedId.get(entry.id) || byNumber.get(entry.id);
  if (!profile || (entry.imageKey && entry.imageKey !== profile.imageKey)) return null;
  return profile;
}
