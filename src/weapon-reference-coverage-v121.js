import { WEAPONS } from './content-core-v50.js';
import { WEAPON_GEOMETRY_COVERAGE_V120 } from './weapon-reference-coverage-v120.js';
import { resolveAdmittedWeaponProfileV121 } from './weapon-release-v121.js';
import { ADMITTED_WEAPON_ADDITIONS_V122 } from './weapon-release-v122.js';

const freeze=value=>{
  if (!value || typeof value!=='object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);return Object.freeze(value);
};
const numberOf=entry=>Number(entry.id.match(/^weapon-(\d{3})-/)?.[1]||0);
const historicById=new Map(WEAPON_GEOMETRY_COVERAGE_V120.flatMap(geometry=>geometry.catalogIds.map(id=>[id,geometry])));
const geometryMap=new Map();
// Keep the published V121 receipt at its exact scope. Only independently
// admitted later IDs are excluded; an unknown addition still fails closed.
const laterIds=new Set(ADMITTED_WEAPON_ADDITIONS_V122.map(entry=>entry.id));
const baselineWeaponsV121=WEAPONS.filter(entry=>!laterIds.has(entry.id));
const nativeGeometry=(entry,profile,historic)=>freeze({
  ...(historic||{}),baseNumber:profile.baseNumber,baseId:historic?.baseId||entry.id,
  name:historic?.name||entry.name,canonicalName:profile.canonicalName,
  source:entry.source,family:entry.family,projectOriginal:profile.projectOriginal===true || historic?.projectOriginal===true,
  catalogIds:historic?.catalogIds||[entry.id],catalogEntries:historic?.catalogEntries||1,
  sharedFinishCount:historic?.sharedFinishCount||0,
  primaryMedia:{imageKey:profile.imageKey,path:profile.path,sheetId:null,visualMode:'static-pose',
    dedicatedNativePlate:true,release:'v121',reviewStatus:profile.reviewStatus,newThisPass:true,
    availableStates:['idle'],missingStates:['action','reload','service'],
    animationClaim:'fixed-pose-no-generated-action-frames'},
  historicalMedia:historic?.historicalMedia||null,
  reference:{status:profile.identityVerified===true?'visual-reference-reviewed':(historic?.reference.status||'project-reference-adaptation'),sourceKey:profile.sourceProvenance||historic?.reference.sourceKey||'project-design',url:profile.referenceUrl,
    label:profile.referenceLabel,work:profile.sourceWork,identityConfirmed:profile.identityVerified===true,visualReferenceAvailable:Boolean(profile.referenceUrl||profile.referenceImageUrl),
    caveat:profile.referenceCaveat},
  canonExact:false,fidelityCertification:'not-certified',dimensionsStatus:'no-documented-physical-size',
  statsPolicy:historic?'existing-project-tuning-unchanged':'v121-original-project-tuning-not-source-statistics',
  nativePlateStatus:'available-static-adaptation',candidateStatus:'v121-candidate-admitted-static',
  note:profile.referenceCaveat||'Plaque fixe adaptée du design disponible ; animation dédiée, dimensions et fidélité 1:1 non certifiées.'
});
// Membership in WEAPONS is established first. No modulo assignment for new IDs.
for (const entry of baselineWeaponsV121) {
  const historic=historicById.get(entry.id),profile=resolveAdmittedWeaponProfileV121(entry);
  const key=historic?.baseId||entry.id;
  if (geometryMap.has(key)) continue;
  if (profile) geometryMap.set(key,nativeGeometry(entry,profile,historic));
  else if (historic) geometryMap.set(key,historic);
  else throw new Error(`Unreviewed weapon catalogue addition: ${entry.id}`);
}
export const WEAPON_GEOMETRY_COVERAGE_V121=freeze([...geometryMap.values()]);
export const WEAPON_REFERENCE_COVERAGE_V121=freeze(baselineWeaponsV121.map(entry=>{
  const geometry=geometryMap.get(historicById.get(entry.id)?.baseId||entry.id);
  const isFinishVariant=entry.id!==geometry.baseId;
  return {id:entry.id,catalogNumber:numberOf(entry),name:entry.name,baseNumber:geometry.baseNumber,
    baseId:geometry.baseId,geometry,isFinishVariant,
    finishArt:isFinishVariant?'shared-base-media-no-dedicated-finish':'base-family-media',
    dedicatedNativePlate:geometry.primaryMedia.dedicatedNativePlate,nativePlateStatus:geometry.nativePlateStatus,
    referenceStatus:geometry.reference.status,sourceWork:geometry.reference.work,
    canonExact:false,fidelityCertification:'not-certified'};
}));
const byId=new Map(),byName=new Map();
for (const row of WEAPON_REFERENCE_COVERAGE_V121) {
  byId.set(row.id,row);byId.set(`weapon-${String(row.catalogNumber).padStart(3,'0')}`,row);byName.set(row.name,row);
}
export function resolveWeaponReferenceCoverageV121(source) {
  if (typeof source==='string') return byId.get(source.trim())||null;
  if (!source || typeof source!=='object' || Array.isArray(source)) return null;
  const id=String(source.id||'').trim();return id?byId.get(id)||null:byName.get(String(source.name||'').trim())||null;
}
export function weaponCoverageReportV121() {
  const geometries=WEAPON_GEOMETRY_COVERAGE_V121,entries=WEAPON_REFERENCE_COVERAGE_V121;
  return freeze({catalogueIds:entries.length,geometricFamilies:geometries.length,
    finishVariants:entries.filter(row=>row.isFinishVariant).length,
    nativePlateFamilies:geometries.filter(row=>row.primaryMedia.dedicatedNativePlate).length,
    newNativePlateFamilies:geometries.filter(row=>row.primaryMedia.release==='v121').length,
    newDistinctModels:geometries.filter(row=>!historicById.has(row.baseId)).length,
    idsUsingNativePlates:entries.filter(row=>row.dedicatedNativePlate).length,
    legacyOnlyFamilies:geometries.filter(row=>!row.primaryMedia.dedicatedNativePlate).length,
    canonExactGeometries:0,existingGeometriesMissingFromTarget100:Math.max(0,100-geometries.length),
    target100Status:geometries.length>=100?'catalogue-target-achieved-fidelity-not-certified':'not-achieved-not-certified'});
}
