import { USER_PACK_V100 } from './user-pack-v100.js';

// Only this source was incomplete without a historical moderation refusal.
// Unseen anatomy is explicitly reconstructed, not retrospectively certified.
const reference = USER_PACK_V100.find(p => p.id === 'pack-v100-xeno-titan-queen-nolegs');
const bounds = Object.freeze([27,108,1564,953]), scale = 250 / (953-108);
const id = 'pose-v113-import-xeno-titan-queen-nolegs';
export const ENEMY_USER_RECONSTRUCTIONS_V113 = Object.freeze([Object.freeze({
  id, profileId:id, basename:'xeno-titan-queen-nolegs', name:reference.name,
  path:'/assets/openai/sprites/static-import-v113/xeno-titan-queen-nolegs.png',
  filename:'xeno-titan-queen-nolegs.png', imageKey:'openai-static-import-v113:xeno-titan-queen-nolegs',
  sha256:'ff244cf0247560b68ec993e6a5c9471e24e7faa0e20d93776ccc392ee5e207de',
  sourceWidth:1577, sourceHeight:997, alphaBounds:bounds,
  pivot:Object.freeze({x:850/1577,y:953/997}), sourceFacing:-1,
  sourceReferenceId:reference.id, referenceIdV100:reference.id, referenceId:reference.id,
  sourceSha256:reference.sourceSha256, originalPath:reference.path, sourceFile:reference.sourceFile,
  alteredOf:reference.alteredOf, legacyCounterpartId:reference.alteredOf,
  relationship:'user-source-reconstructed-project-adaptation',
  reconstruction:'unseen-legless-abdominal-base-and-tail',
  family:'enemy', group:'Xenomorphes', biology:'xenomorph', faction:'Hive', lineage:'Titan',
  stage:'Queen', kind:'organism', caste:'queen', arenaEligible:true,
  work:'Pack 270926 — silhouette inférieure reconstruite pour la simulation',
  health:520, damage:34, speed:.25, armor:30, cost:8,
  renderWidth:1577*scale, renderHeight:997*scale, targetOpaqueHeight:250,
  bodyWidth:100, bodyHeight:230, combatRole:'melee', rangedBehavior:'melee', acid:0,
  locomotion:'ground', groundContact:true, automaticEncounter:false,
  encounterGroup:'crossover', encounterWorldIds:Object.freeze([]), bioforgeEligible:true,
  states:Object.freeze([]), referenceUrls:Object.freeze([]),
  visualMode:'static-pose', animationStatus:'missing', frames:1, visualRevision:113,
  reviewStatus:'accepted-static-adaptation',
  identityStatus:'user-source-reconstructed-project-interpretation',
  referenceStatus:'cropped-reference-with-explicit-inferred-anatomy',
  identityVerified:false, canonExact:false, geometryStatus:'project-adaptation', physicalSize:null,
  provenance:'reference-openai-integrated', sourceProvenance:'user-provided-cropped-reference',
  assetVerificationStatus:'sha256-dimensions-alpha-verified',
  specializedBehaviorStatus:'simplified-ground-melee-project-adaptation',
  sizeBasis:'project-display-and-collision-tuning-not-physical-measurement',
  reviewNote:'Pose native entière, contrôlée sur blanc et noir. Base abdominale sans jambes et queue reconstruites ; le nom NoLegs ne certifie pas cette anatomie hors champ. Appui des griffes au sol. Original intact ; pose fixe, non certifiée 1:1.',
  referenceNote:'Adaptation du portrait bleu/brun fourni. La base sans jambes et la queue sont une interprétation explicitement reconstruite, non une anatomie attestée. Disponible au bestiaire et en simulation Trials, exclue des rencontres automatiques. Pose fixe : glissement et attaque simplifiés ; mesures, collision et statistiques de projet, sans échelle physique canonique ou fidélité 1:1 certifiée.'
})]);
export const XENO_TRIALS_RECONSTRUCTIONS_V113 = Object.freeze([Object.freeze({
  id:'import-xeno-titan-queen-nolegs', profileId:id, label:'Titan Queen NoLegs — reconstruction',
  role:'tank', hp:430, speed:80, power:1.2, reach:1.15, special:'slash', factionId:'hive',
  referenceIdV100:reference.id, alteredOf:reference.alteredOf
})]);


