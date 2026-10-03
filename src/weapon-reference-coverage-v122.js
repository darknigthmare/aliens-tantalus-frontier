import { WEAPONS } from './content-core-v50.js';
import { WEAPON_GEOMETRY_COVERAGE_V121, WEAPON_REFERENCE_COVERAGE_V121 } from './weapon-reference-coverage-v121.js';
import { resolveAdmittedWeaponProfileV122 } from './weapon-release-v122.js';

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
};
const historicalRows = new Map(WEAPON_REFERENCE_COVERAGE_V121.map(row => [row.id, row]));
const geometryMap = new Map(WEAPON_GEOMETRY_COVERAGE_V121.map(geometry => [geometry.baseId, geometry]));
export const WEAPON_REFERENCE_COVERAGE_V122 = freeze(WEAPONS.map(entry => {
  if (historicalRows.has(entry.id)) return historicalRows.get(entry.id);
  const profile = resolveAdmittedWeaponProfileV122(entry);
  if (!profile) throw new Error(`Unreviewed V122 weapon catalogue addition: ${entry.id}`);
  const geometry = freeze({
    baseNumber: profile.baseNumber, baseId: entry.id, name: entry.name, canonicalName: profile.canonicalName,
    source: entry.source, family: entry.family, projectOriginal: false,
    catalogIds: [entry.id], catalogEntries: 1, sharedFinishCount: 0,
    primaryMedia: { imageKey: profile.imageKey, path: profile.path, sheetId: null, visualMode: 'static-pose',
      dedicatedNativePlate: true, release: 'v122', reviewStatus: profile.reviewStatus, newThisPass: true,
      availableStates: ['idle'], missingStates: ['action', 'reload', 'service'], animationClaim: 'fixed-pose-no-generated-action-frames' },
    historicalMedia: null,
    reference: { status: 'visual-reference-reviewed', sourceKey: profile.sourceProvenance, url: profile.referenceUrl,
      imageUrl: profile.referenceImageUrl, panel: profile.referencePanel, label: profile.referenceLabel,
      work: profile.sourceWork, identityConfirmed: profile.identityVerified, visualReferenceAvailable: true, caveat: profile.referenceCaveat },
    canonExact: false, fidelityCertification: 'not-certified', dimensionsStatus: 'no-documented-physical-size',
    statsPolicy: entry.statsPolicy, nativePlateStatus: 'available-static-adaptation', candidateStatus: 'v122-candidate-admitted-static',
    note: profile.referenceCaveat
  });
  geometryMap.set(entry.id, geometry);
  return { id: entry.id, catalogNumber: profile.baseNumber, name: entry.name, baseNumber: profile.baseNumber,
    baseId: entry.id, geometry, isFinishVariant: false, finishArt: 'base-family-media', dedicatedNativePlate: true,
    nativePlateStatus: geometry.nativePlateStatus, referenceStatus: geometry.reference.status, sourceWork: profile.sourceWork,
    canonExact: false, fidelityCertification: 'not-certified' };
}));
export const WEAPON_GEOMETRY_COVERAGE_V122 = freeze([...geometryMap.values()]);
const byId = new Map(WEAPON_REFERENCE_COVERAGE_V122.flatMap(row => [[row.id, row], [`weapon-${String(row.catalogNumber).padStart(3, '0')}`, row]]));
/** Exact catalogue identity only; no name-only inference for new or old models. */
export function resolveWeaponReferenceCoverageV122(source) {
  const id = typeof source === 'string' ? source.trim()
    : source && typeof source === 'object' && !Array.isArray(source) && typeof source.id === 'string' ? source.id.trim() : '';
  return byId.get(id) || null;
}
export function weaponCoverageReportV122() {
  const geometries = WEAPON_GEOMETRY_COVERAGE_V122, entries = WEAPON_REFERENCE_COVERAGE_V122;
  const additions = geometries.filter(row => row.primaryMedia.release === 'v122').length;
  return freeze({ catalogueIds: entries.length, geometricFamilies: geometries.length,
    finishVariants: entries.filter(row => row.isFinishVariant).length,
    nativePlateFamilies: geometries.filter(row => row.primaryMedia.dedicatedNativePlate).length,
    newNativePlateFamilies: additions, newDistinctModels: additions,
    idsUsingNativePlates: entries.filter(row => row.dedicatedNativePlate).length,
    legacyOnlyFamilies: geometries.filter(row => !row.primaryMedia.dedicatedNativePlate).length,
    canonExactGeometries: 0, existingGeometriesMissingFromTarget100: Math.max(0, 100 - geometries.length),
    target100Status: geometries.length >= 100 ? 'catalogue-target-achieved-fidelity-not-certified' : 'not-achieved-not-certified' });
}
