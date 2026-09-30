import { USER_PACK_V100 } from './user-pack-v100.js';
import { ENEMY_IMPORT_ADMISSIONS_V105 } from './enemy-import-admissions-v105.js';

const byReference = new Map(USER_PACK_V100.map(reference => [reference.id, reference]));
const tuning = Object.freeze({ 'engineer-armorsuit': Object.freeze({
  biology: 'engineer', caste: 'engineer', targetOpaqueHeight: 170,
  bodyWidth: 52, bodyHeight: 156, health: 240, damage: 22, speed: .7, armor: 22, cost: 4,
  trial: Object.freeze(['import-engineer-armorsuit', 'tank', 285, 165, 1.08, 1, 'ram']),
  factionId: 'containment'
}) });

/** Separate identities, never automatic admission of every reference or lineage.
 * This Engineer design is supplied concept art, not a certified film costume.
 * Terrestrial close combat is project-authored; no acid, gun or special powers. */
export const ENEMY_USER_IMPORTS_V105 = Object.freeze(ENEMY_IMPORT_ADMISSIONS_V105.map(admission => {
  const reference = byReference.get(admission.referenceId), spec = tuning[admission.slug];
  if (!reference || !spec || reference.biology !== spec.biology || reference.kind !== 'organism'
    || admission.reviewStatus !== 'accepted-static-adaptation'
    || !/^[a-f0-9]{64}$/.test(admission.sha256))
    throw new Error(`Invalid V105 native admission: ${admission.slug}`);
  const scale = spec.targetOpaqueHeight / (admission.alphaBounds[3] - admission.alphaBounds[1]);
  const id = `pose-v105-import-${admission.slug}`;
  return Object.freeze({ ...admission, id, profileId: id, basename: admission.slug,
    name: reference.name, family: 'enemy', group: 'Ingénieurs',
    biology: spec.biology, faction: reference.faction, lineage: reference.lineage,
    stage: reference.stage, caste: spec.caste, work: 'Pack 270926 — design utilisateur, simulation non canonique',
    referenceIdV100: reference.id, sourceFile: reference.sourceFile,
    sourceSha256: reference.sourceSha256, originalPath: reference.path,
    alteredOf: reference.alteredOf, legacyCounterpartId: reference.alteredOf,
    relationship: reference.relationship, filename: `${admission.slug}.png`,
    imageKey: `openai-static-import-v105:${admission.slug}`,
    health: spec.health, damage: spec.damage, speed: spec.speed, armor: spec.armor, cost: spec.cost,
    renderWidth: admission.sourceWidth * scale, renderHeight: admission.sourceHeight * scale,
    targetOpaqueHeight: spec.targetOpaqueHeight, bodyWidth: spec.bodyWidth, bodyHeight: spec.bodyHeight,
    combatRole: 'melee', rangedBehavior: 'melee', acid: 0, locomotion: 'ground', groundContact: true,
    automaticEncounter: true, encounterGroup: 'engineer', encounterWorldIds: Object.freeze([]),
    bioforgeEligible: true, states: Object.freeze([]), referenceUrls: Object.freeze([]),
    visualMode: 'static-pose', animationStatus: 'missing', frames: 1, visualRevision: 105,
    identityStatus: 'user-reference-static-pose', referenceStatus: 'user-provided-qualified',
    identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
    provenance: 'user-provided-reference-openai-integrated', sourceProvenance: 'user-provided',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    specializedBehaviorStatus: 'simplified-ground-melee-project-adaptation',
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
    referenceNote: `${admission.reviewNote} Original conservé séparément. Ingénieur distinct des xénomorphes et synthétiques ; mêlée terrestre sans acide. Échelle, comportement et statistiques propres à la simulation, sans fidélité canonique 1:1 revendiquée.`
  });
}));

export const XENO_TRIALS_IMPORTS_V105 = Object.freeze(ENEMY_USER_IMPORTS_V105.map(pose => {
  const spec = tuning[pose.basename], [id, role, hp, speed, power, reach, special] = spec.trial;
  return Object.freeze({ id, profileId: pose.id, label: `${pose.name} — design utilisateur`,
    role, hp, speed, power, reach, special, factionId: spec.factionId,
    referenceIdV100: pose.referenceIdV100, alteredOf: pose.alteredOf });
}));
