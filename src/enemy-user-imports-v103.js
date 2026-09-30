import { USER_PACK_V100 } from './user-pack-v100.js';
import { ENEMY_IMPORT_ADMISSIONS_V103 } from './enemy-import-admissions-v103.js';

// Explicit simulation tuning, not biological measurements or canonical powers.
// Working Joes use the existing unarmed ground-melee loop: no acid, rifle fire,
// hazard immunity or invisibility is inferred from a costume or glowing colour.
const TUNING = Object.freeze({
  'synth-workingjoe-classic': Object.freeze({ caste: 'synthetic', bodyWidth: 26, bodyHeight: 112,
    targetOpaqueHeight: 126, health: 165, damage: 15, speed: .62, armor: 10, cost: 3,
    trial: Object.freeze(['import-joe-classic', 'balanced', 225, 175, 1, .9, 'ram']), faction: 'containment' }),
  'synth-workingjoe-battle': Object.freeze({ caste: 'synthetic', bodyWidth: 36, bodyHeight: 112,
    targetOpaqueHeight: 126, health: 210, damage: 19, speed: .58, armor: 18, cost: 4,
    trial: Object.freeze(['import-joe-battle', 'tank', 260, 160, 1.08, .95, 'ram']), faction: 'containment' }),
  'synth-workingjoe-hazmat': Object.freeze({ caste: 'synthetic', bodyWidth: 36, bodyHeight: 112,
    targetOpaqueHeight: 126, health: 180, damage: 17, speed: .58, armor: 14, cost: 3,
    trial: Object.freeze(['import-joe-hazmat', 'tank', 245, 160, 1, .95, 'ram']), faction: 'containment' }),
  'synth-workingjoe-tactical': Object.freeze({ caste: 'synthetic', bodyWidth: 36, bodyHeight: 112,
    targetOpaqueHeight: 126, health: 195, damage: 18, speed: .75, armor: 16, cost: 4,
    trial: Object.freeze(['import-joe-tactical', 'balanced', 235, 195, 1.04, .95, 'ram']), faction: 'rival-lab' }),
  'xeno-blueluminescent-drone': Object.freeze({ caste: 'stalker', bodyWidth: 56, bodyHeight: 112,
    targetOpaqueHeight: 138, health: 175, damage: 18, speed: 1.12, armor: 9, cost: 3,
    trial: Object.freeze(['import-blue-drone', 'agile', 200, 265, 1, 1, 'tail']), faction: 'pursuit' }),
  'xeno-blueluminescent-queen': Object.freeze({ caste: 'royal', bodyWidth: 100, bodyHeight: 156,
    targetOpaqueHeight: 206, health: 310, damage: 25, speed: .62, armor: 22, cost: 5,
    trial: Object.freeze(['import-blue-queen', 'tank', 310, 145, 1.12, 1.2, 'tail']), faction: 'hive' })
});

const byReference = new Map(USER_PACK_V100.map(reference => [reference.id, reference]));
const common = Object.freeze({
  family: 'enemy', group: 'Imports utilisateur — Altered',
  work: 'Pack 270926 — adaptation Altered non canonique',
  combatRole: 'melee', rangedBehavior: 'melee', locomotion: 'ground', groundContact: true,
  visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
  identityStatus: 'user-reference-static-pose', referenceStatus: 'user-provided-qualified',
  identityVerified: false, canonExact: false,
  provenance: 'user-provided-reference-openai-integrated', sourceProvenance: 'user-provided',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified', geometryStatus: 'project-adaptation',
  visualRevision: 103, automaticEncounter: true, encounterGroup: 'crossover',
  encounterWorldIds: Object.freeze([]), referenceUrls: Object.freeze([]), states: Object.freeze([]),
  bioforgeEligible: true, physicalSize: null, acid: 0,
  specializedBehaviorStatus: 'simplified-ground-melee-project-adaptation'
});

/** Separate combat identities reference an intact original; they never replace
 * the legacy enemy, change its saved ID, or turn the V100 dossier into a fighter. */
export const ENEMY_USER_IMPORTS_V103 = Object.freeze(ENEMY_IMPORT_ADMISSIONS_V103.map(admission => {
  const reference = byReference.get(admission.referenceId), tuning = TUNING[admission.slug];
  if (!reference || !tuning || admission.reviewStatus !== 'accepted-static-adaptation'
    || reference.kind !== 'organism' || !['synthetic', 'xenomorph'].includes(reference.biology)
    || !reference.alteredOf || !/^[a-f0-9]{64}$/.test(admission.sha256)
    || ![admission.sourceWidth, admission.sourceHeight].every(value => Number.isInteger(value) && value > 0)
    || admission.alphaBounds.length !== 4
    || admission.alphaBounds[2] <= admission.alphaBounds[0] || admission.alphaBounds[3] <= admission.alphaBounds[1])
    throw new Error(`Invalid V103 admission: ${admission.slug}`);
  const scale = tuning.targetOpaqueHeight / (admission.alphaBounds[3] - admission.alphaBounds[1]);
  const id = `pose-v103-import-${admission.slug}`;
  const behavior = reference.biology === 'synthetic'
    ? 'Approche terrestre lente et frappe de proximité ; aucun tir ni acide. Armure et dégâts sont des réglages de simulation, sans immunité Hazmat ni capteur Tactical simulé.'
    : 'Approche terrestre et frappe de proximité ; la luminescence est visuelle. Aucun pouvoir lumineux, cycle reproductif, ponte ou commandement de ruche simulé.';
  return Object.freeze({ ...common, ...admission,
    id, profileId: id, basename: admission.slug, name: reference.name,
    biology: reference.biology, faction: reference.faction, lineage: reference.lineage,
    stage: reference.stage, caste: tuning.caste, alteredOf: reference.alteredOf,
    legacyCounterpartId: reference.alteredOf, referenceIdV100: reference.id,
    sourceFile: reference.sourceFile, sourceSha256: reference.sourceSha256,
    originalPath: reference.path, relationship: reference.relationship,
    filename: `${admission.slug}.png`, imageKey: `openai-static-import-v103:${admission.slug}`,
    renderWidth: admission.sourceWidth * scale, renderHeight: admission.sourceHeight * scale,
    targetOpaqueHeight: tuning.targetOpaqueHeight, bodyWidth: tuning.bodyWidth, bodyHeight: tuning.bodyHeight,
    health: tuning.health, damage: tuning.damage, speed: tuning.speed, armor: tuning.armor, cost: tuning.cost,
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
    referenceNote: `${admission.reviewNote} ${behavior} Original du pack conservé séparément avec son empreinte. Pose fixe alpha native ; échelle, collision et statistiques adaptées au projet, sans certification canonique 1:1 ni animation dédiée.`,
    adaptationNote: behavior
  });
}));

/** Arena admissions are derived only from accepted combat identities, never
 * from the planned tuning keys or from all documentary images in a lineage. */
export const XENO_TRIALS_IMPORTS_V103 = Object.freeze(ENEMY_USER_IMPORTS_V103.map(pose => {
  const tuning = TUNING[pose.basename], [id, role, hp, speed, power, reach, special] = tuning.trial;
  return Object.freeze({ id, profileId: pose.id, label: pose.name, role, hp, speed, power, reach, special,
    factionId: tuning.faction, referenceIdV100: pose.referenceIdV100, alteredOf: pose.alteredOf });
}));
