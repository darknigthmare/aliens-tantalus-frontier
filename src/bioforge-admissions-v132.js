import { ENEMIES } from './content-core-v50.js';
import { resolveEnemyVisualProfile } from './enemy-visual-runtime-v53.js';
import { getEnemyDedicatedPoseV99 } from './enemy-dedicated-poses-v99.js';
import { resolveSpriteSheet, resolveSpriteClip, resolveEnemyAnimation, SPRITE_HITBOXES, SPRITE_PIVOTS } from './sprite-animation-runtime.js';

// Exact existing identities only. A modifier may not borrow its ancestor's
// atlas to become a new lab admission. No bitmap, animation or canonical claim
// is manufactured here; these profiles keep their production combat behavior.
export const BIOFORGE_ANIMATED_PROFILE_IDS_V132 = Object.freeze([
  'enemy-007-praetorian', 'enemy-008-queen', 'enemy-009-crusher', 'enemy-010-spitter',
  'enemy-011-lurker', 'enemy-012-carrier', 'enemy-013-ravager', 'enemy-014-boiler',
  'enemy-017-monica-line', 'enemy-018-specimen-six-line', 'enemy-021-neuro-xeno-drone',
  'enemy-022-xenoborg', 'enemy-024-ripper-queen',
  'enemy-025-foundry-drone', 'enemy-027-reef-stalker',
  'enemy-028-reef-spitter', 'enemy-029-siege-royal', 'enemy-030-pale-crucible-hunter',
  'enemy-031-dust-runner', 'enemy-033-arcology-lurker',
  'enemy-034-caravan-stalker', 'enemy-035-trilobite-echo', 'enemy-036-deacon-line',
  'enemy-037-neomorph', 'enemy-038-protomorph',
  'enemy-040-pathogen-mimic', 'enemy-041-working-joe', 'enemy-043-weyland-yutani-commando',
  'enemy-044-upp-vanguard', 'enemy-045-seegson-security', 'enemy-046-colonial-raider',
  'enemy-047-atarax-controller', 'enemy-048-cult-host', 'enemy-049-wild-boar-host',
  'enemy-052-tantalus-tunnel-vermin', 'enemy-569-newborn', 'enemy-570-offspring', 'enemy-571-predalien'
]);

// The four native bodies are offset from their sprite anchors. Their existing
// mission rendering is valid, but the lab's axis-aligned physical body cannot
// yet preserve both facing directions without a dedicated collider adapter.
export const BIOFORGE_COLLIDER_REVIEW_IDS_V132 = Object.freeze([
  'enemy-023-atarax-ripper', 'enemy-026-foundry-crusher',
  'enemy-032-salvage-hive-brute', 'enemy-039-abomination'
]);

const states = Object.freeze({ idle: { alive:true, vx:0 }, movement: { alive:true, vx:100 },
  attack: { alive:true, vx:0, attacking:true, attackAnimationClock:.2 }, death: { alive:false, vx:0, deathClock:1 } });
function admission(profileId) {
  const source=ENEMIES.find(profile=>profile.id===profileId), visual=resolveEnemyVisualProfile(source);
  const sheet=resolveSpriteSheet(visual.sheetId), collider=sheet && SPRITE_HITBOXES[sheet.hitbox];
  const pivot=sheet && SPRITE_PIVOTS[sheet.pivot];
  if (!source || source.modifier!=='Standard' || !sheet || sheet.family!=='enemy' || !sheet.releaseReady
    || visual.legacy || visual.approximate || visual.fallbackReason || !collider || !pivot
    || ![sheet.renderWidth,sheet.renderHeight,collider.width,collider.height].every(value=>Number.isFinite(value)&&value>0)
    || Math.abs(collider.x+collider.width/2-pivot.x)>1e-6 || Math.abs(collider.y+collider.height-pivot.y)>1e-6)
    throw Error(`Invalid dedicated lab contract: ${profileId}`);
  const clips=Object.fromEntries(Object.entries(states).map(([kind,state])=>{
    const request=resolveEnemyAnimation({...source,spriteKey:visual.spriteKey,visualSheetId:sheet.id,visualArchetype:visual.archetype,...state});
    const clip=request && resolveSpriteClip(request.sheetId,request.clipId);
    if (!request || request.sheetId!==sheet.id || !clip || clip.frames.length<2
      || clip.frames.some(frame=>!Number.isInteger(frame)||frame<0||frame>=sheet.columns*sheet.rows))
      throw Error(`Missing ${kind} lab animation: ${profileId}`);
    return [kind,Object.freeze({id:clip.id,frames:clip.frames.length})];
  }));
  return Object.freeze({schema:132,profileId,name:source.name,cost:sheet.renderHeight>=180||sheet.renderWidth>=220?4:3,
    terrestrial:true,locomotion:'terrestrial',habitat:'terrestrial',animatedAdmissionV132:true,
    path:sheet.path,sheetId:sheet.id,spriteKey:visual.spriteKey,clipSet:sheet.clipSet,
    pivot:sheet.pivot,hitbox:sheet.hitbox,renderWidth:sheet.renderWidth,renderHeight:sheet.renderHeight,sourceFacing:sheet.sourceFacing,
    columns:sheet.columns,rows:sheet.rows,cellWidth:sheet.cellWidth,cellHeight:sheet.cellHeight,
    bodyWidth:collider.width*sheet.renderWidth/sheet.cellWidth,bodyHeight:collider.height*sheet.renderHeight/sheet.cellHeight,
    expectedWidth:sheet.columns*sheet.cellWidth,expectedHeight:sheet.rows*sheet.cellHeight,clips,
    identityStatus:'dedicated-existing-project-adaptation',identityVerified:true,canonExact:false,
    reviewStatus:'existing-native-contract-verified-v132',behaviorStatus:'production-runtime-preserved',
    adaptationNote:'Atlas animé existant propre à ce profil. Échelle, statistiques et combat adaptés au laboratoire ; aucune certification canonique 1:1.'});
}
export const BIOFORGE_ADMISSIONS_V132=Object.freeze(BIOFORGE_ANIMATED_PROFILE_IDS_V132.map(admission));
const byId=new Map(BIOFORGE_ADMISSIONS_V132.map(profile=>[profile.profileId,profile]));
const bySheet=new Map(BIOFORGE_ADMISSIONS_V132.map(profile=>[profile.sheetId,profile]));
export function getBioforgeAdmissionV132(id) { return byId.get(typeof id==='string'?id.trim():id?.profileId||id?.id)||null; }
export function getBioforgeAdmissionForSheetV132(sheet) { return bySheet.get(typeof sheet==='string'?sheet:sheet?.id)||null; }
export function isBioforgeAdmissionImageReadyV132(image,definition) {
  return Boolean(definition && image?.complete && image.naturalWidth===definition.expectedWidth && image.naturalHeight===definition.expectedHeight);
}

export function getBioforgeCoverageV132(roster=[]) {
  const catalogue=new Set(ENEMIES.map(profile=>profile.id)), admitted=new Set(roster.map(profile=>profile.profileId));
  const main=[...admitted].filter(id=>catalogue.has(id)).length;
  return Object.freeze({schema:132,catalogue:catalogue.size,admittedCatalogue:main,
    admittedImports:[...admitted].filter(id=>!catalogue.has(id)).length,totalSelectable:admitted.size,
    remainingCatalogue:catalogue.size-main,newAnimatedAdmissions:[...admitted].filter(id=>byId.has(id)).length,
    canonExact:false,label:`${main}/${catalogue.size} profils du catalogue admis · ${admitted.size-main} imports distincts · ${catalogue.size-main} à produire ou valider`});
}

/** Source audit is read-only. File hashes and decoded dimensions are measured
 * by the Node verification script, not inferred from a filename or an alias. */
export function auditBioforgeCatalogueV132(roster=[]) {
  const admitted=new Set(roster.map(profile=>profile.profileId));
  return Object.freeze(ENEMIES.map(profile=>{
    const visual=resolveEnemyVisualProfile(profile), dedicated=getEnemyDedicatedPoseV99(profile.id), added=byId.get(profile.id);
    const sheet=resolveSpriteSheet(visual.sheetId);
    const reason=added?'dedicated-animated-v132':admitted.has(profile.id)?'existing-reviewed-admission'
      : profile.id==='enemy-051-ceto-reef-predator'||dedicated?.locomotion==='aquatic'?'native-aquatic-lab-habitat-and-resume-missing'
      : BIOFORGE_COLLIDER_REVIEW_IDS_V132.includes(profile.id)?'native-collider-offset-needs-facing-aware-lab-adapter'
      : dedicated?'dedicated-pose-not-admitted':visual.legacy?'legacy-sheet-without-dedicated-locomotion-contract'
      : (visual.profileId||visual.baseProfileId||sheet?.profileId)!==profile.id?'ancestor-or-family-atlas-is-not-an-identity'
      : 'dedicated-lab-contract-not-verified';
    return Object.freeze({profileId:profile.id,name:profile.name,modifier:profile.modifier,
      admitted:admitted.has(profile.id),newAdmission:Boolean(added),reason,
      path:added?.path||dedicated?.path||sheet?.path||null,sheetId:sheet?.id||null,
      atlasIdentity:visual.profileId||visual.baseProfileId||sheet?.profileId||null,canonExact:false});
  }));
}
