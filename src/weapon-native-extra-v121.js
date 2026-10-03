/** Type 95: primary production portfolio reconstruction, independently reviewed
 * on white, dark, blue and checker backgrounds. Static art is not action art. */
export const TYPE95_COMBAT_PISTOL_PROFILE_V121 = Object.freeze({
  baseNumber:190,catalogId:'weapon-190',catalogIds:Object.freeze(['weapon-190-type-95-combat-pistol']),
  name:'Type 95 Combat Pistol',canonicalName:'Type 95 Combat Pistol',category:'sidearm',
  imageKey:'weaponV121:190',path:'/assets/openai/equipment/v121-root-weapons/type95-combat-pistol-native-v121.png',
  rawPath:'/assets/openai/equipment/v121-root-weapons/type95-combat-pistol-native-v121.png',
  sha256:'9814ea99c680ddcd8728c0c76f9327ec7ac96de300e45bb9bf09c38855283d0c',
  sourceWidth:1536,sourceHeight:1024,alphaBounds:Object.freeze([53,111,1495,969]),alphaBoundsThreshold:16,
  gripPivot:Object.freeze({x:275/1536,y:657/1024}),muzzlePivot:Object.freeze({x:1460/1536,y:331/1024}),
  sourceFacing:1,width:86,height:86*1024/1536,
  sheetId:null,clipSet:null,visualMode:'static-pose',animationStatus:'missing',
  availableStates:Object.freeze(['idle']),missingStates:Object.freeze(['action','reload','service']),
  referenceStatus:'PRODUCTION_REFERENCE_RECONSTRUCTION',sourceWork:'Aliens: Fireteam Elite',
  referenceUrl:'https://www.artbully.co/aliens-fireteam-elite-weapons-gallery',
  referenceImageUrl:'https://images.squarespace-cdn.com/content/v1/52fd313ee4b0b3c32132e9de/1648070708711-H7MD7AXMUYKA1JV1DHIX/_Type+95+Combat+Pistol_HP.jpg',
  referenceLabel:'Art Bully Productions — Type 95 Combat Pistol, modèle de production',
  sourceProvenance:'artbully-production-artist-portfolio',identityVerified:true,canonExact:false,approximate:true,
  identityStatus:'reference-reconstruction',geometryStatus:'reference-reconstruction-not-certified',
  displaySizingPolicy:'catalog-layout-not-physical-metric-scale',release:'v121',
  reviewStatus:'accepted-static-adaptation',reviewScope:'independent-four-background-browser-compositing',
  referenceCaveat:'Adaptation fixe de la vue primaire Art Bully ; détails, proportions et dimensions non certifiés 1:1. Chiffres et comportement propres à Tantalus.',
  legacyAnimation:null,
  fallbackReason:'Type 95 à receiver rectangulaire, poignée oblique et grand cadre inférieur ouvert. Vue entière et alpha vérifiés sur quatre fonds ; aucune séquence de tir ou de rechargement générée.'
});
export const WEAPON_NATIVE_EXTRA_PROFILES_V121 = Object.freeze([TYPE95_COMBAT_PISTOL_PROFILE_V121]);
export const WEAPON_CATALOG_EXTRA_V121 = Object.freeze([Object.freeze({
  id:'weapon-190-type-95-combat-pistol',name:'Type 95 Combat Pistol',canonicalName:'Type 95 Combat Pistol',
  family:'ballistic',source:'USCM',mark:'Standard',damage:36,fireRate:4,magazine:16,reload:2,penetration:20,rarity:'rare',
  provenance:'licensed-reference-project-adaptation',sourceWork:'Aliens: Fireteam Elite',
  appearances:Object.freeze(['Aliens: Fireteam Elite']),sourceUrl:TYPE95_COMBAT_PISTOL_PROFILE_V121.referenceUrl,
  statsPolicy:'v121-original-project-tuning-not-source-statistics',canonExact:false,
  tags:Object.freeze(['sidearm','portable']),description:'Pistolet Type 95 identifié sur le portfolio de production Art Bully. Adaptation fixe ; statistiques équilibrées pour la simulation Tantalus, non extraites du jeu source.'
})]);
