import { USER_PACK_V100 } from './user-pack-v100.js';
import { ENEMY_IMPORT_ADMISSIONS_V106 } from './enemy-import-admissions-v106.js';

const references = new Map(USER_PACK_V100.map(reference => [reference.id, reference]));
// All values are authored simulation balance, never inferred physical metres.
// The whitelist is deliberately per identity: a lineage does not admit its siblings.
const spec = (biology, caste, size, body, combat, trial, factionId, encounterGroup = 'crossover', arenaEligible = true) => Object.freeze({
  biology, caste, targetOpaqueHeight: size, bodyWidth: body[0], bodyHeight: body[1],
  health: combat[0], damage: combat[1], speed: combat[2], armor: combat[3], cost: combat[4],
  combatRole: trial[0] === 'ranged' ? 'ranged' : 'melee',
  trial: Object.freeze(trial), factionId, encounterGroup, arenaEligible
});
export const ENEMY_IMPORT_TUNING_V106 = Object.freeze({
  'engineer-battlesuit': spec('engineer', 'engineer', 172, [52, 156], [250, 22, .7, 24, 4], ['tank', 285, 165, 1.08, 1, 'ram'], 'containment', 'engineer'),
  'engineer-behemotsuit': spec('engineer', 'engineer', 182, [68, 160], [290, 26, .55, 30, 5], ['tank', 305, 150, 1.15, 1.05, 'slash'], 'containment', 'engineer'),
  'engineer-ceremonialsuit': spec('engineer', 'engineer', 170, [50, 154], [190, 16, .7, 6, 3], ['balanced', 220, 205, .9, .9, 'ram'], 'containment', 'engineer'),
  'engineer-mala-kak': spec('engineer', 'engineer', 170, [50, 154], [210, 18, .75, 8, 3], ['balanced', 235, 210, .95, .95, 'ram'], 'containment', 'engineer'),
  'engineer-original-space-jokey-variant': spec('engineer', 'engineer', 178, [52, 160], [230, 21, .7, 16, 4], ['tank', 265, 175, 1.02, 1, 'ram'], 'containment', 'engineer'),
  'engineer-respirator': spec('engineer', 'engineer', 170, [50, 156], [225, 20, .8, 18, 4], ['balanced', 250, 205, 1, 1, 'ram'], 'containment', 'engineer'),
  'engineer-spacejokey': spec('engineer', 'engineer', 176, [50, 162], [245, 22, .7, 20, 4], ['tank', 275, 170, 1.08, 1, 'ram'], 'containment', 'engineer'),
  'engineer-suit-open': spec('engineer', 'engineer', 170, [50, 154], [215, 20, .85, 14, 3], ['balanced', 245, 210, 1, 1, 'ram'], 'containment', 'engineer'),
  'engineer-wararmor': spec('engineer', 'engineer', 178, [54, 158], [250, 19, .7, 25, 5], ['ranged', 265, 175, 1.05, 1, 'pulse'], 'rival-lab', 'engineer'),
  'engineer-woman': spec('engineer', 'engineer', 168, [48, 152], [220, 20, .9, 16, 3], ['balanced', 245, 220, 1, 1, 'ram'], 'containment', 'engineer'),
  'synth-eloise': spec('synthetic', 'synthetic', 140, [42, 126], [185, 18, 1, 10, 3], ['balanced', 215, 230, .98, .95, 'ram'], 'rival-lab'),
  'synth-jerri-1': spec('synthetic', 'synthetic', 154, [50, 136], [235, 18, .8, 22, 4], ['ranged', 250, 195, 1.03, 1, 'pulse'], 'rival-lab'),
  'synth-jerri-2': spec('synthetic', 'synthetic', 154, [50, 136], [235, 18, .8, 22, 4], ['ranged', 250, 195, 1.03, 1, 'pulse'], 'rival-lab'),
  'wy-apesuit': spec('human', 'human', 145, [48, 132], [185, 17, .7, 22, 3], ['tank', 235, 175, .95, .9, 'ram'], 'containment'),
  'wy-covenant-david': spec('synthetic', 'synthetic', 140, [40, 128], [195, 18, 1, 8, 3], ['balanced', 225, 225, .98, .95, 'ram'], 'rival-lab'),
  'alien-king-from-alien-extemrination': spec('xenomorph', 'royal', 194, [106, 136], [355, 28, .65, 28, 6], ['tank', 315, 145, 1.16, 1.1, 'ram'], 'hive'),
  'green-alien-king': spec('xenomorph', 'royal', 194, [74, 164], [345, 27, .7, 24, 6], ['tank', 310, 155, 1.12, 1.15, 'tail'], 'hive'),
  'xeno-gorillaxeno': spec('xenomorph', 'stalker', 152, [82, 118], [270, 24, .9, 20, 4], ['tank', 280, 180, 1.1, 1, 'ram'], 'pursuit'),
  'xeno-kingrogue': spec('xenomorph', 'royal', 198, [80, 166], [350, 28, .7, 24, 6], ['tank', 315, 150, 1.15, 1.18, 'tail'], 'hive'),
  'xeno-spacejokeygiant': spec('xenomorph', 'stalker', 194, [58, 172], [280, 24, .75, 18, 5], ['tank', 290, 165, 1.1, 1.12, 'tail'], 'hive'),
  // Young/parasite forms stay modest campaign/lab actors, never arena fighters.
  'xeno-blueluminescent-chestburster': spec('xenomorph', 'juvenile', 42, [24, 24], [35, 5, 1.25, 0, 1], [], null, 'crossover', false),
  'xeno-bambibuster': spec('xenomorph', 'juvenile', 56, [30, 42], [45, 7, 1.35, 0, 1], [], null, 'crossover', false),
  'xeno-chestbusterpredalien-movie': spec('xenomorph', 'juvenile', 45, [26, 26], [40, 6, 1.2, 0, 1], [], null, 'crossover', false),
  'xeno-mutated-facehugger-sideview': spec('xenomorph', 'parasite', 38, [30, 21], [32, 5, 1.3, 0, 1], [], null, 'crossover', false),
  'xeno-red-queenchestbuster-1': spec('xenomorph', 'juvenile', 46, [28, 28], [42, 6, 1.15, 0, 1], [], null, 'crossover', false),
  'xeno-rotenline-larvae': spec('xenomorph', 'juvenile', 44, [28, 28], [38, 5, 1.1, 0, 1], [], null, 'crossover', false),
  'xeno-royal-facehugger-alternate-to-repair': spec('xenomorph', 'parasite', 42, [32, 23], [38, 6, 1.25, 0, 1], [], null, 'crossover', false),
  // Distinct source-game adaptations, not replacements of existing identities.
  'game-afe-synth-warden': spec('synthetic', 'synthetic', 144, [44, 132], [220, 17, .9, 18, 4], ['ranged', 240, 205, 1, 1, 'pulse'], 'rival-lab', 'fireteam'),
  'game-afe2-warden': spec('xenomorph', 'stalker', 184, [88, 150], [300, 26, .7, 26, 5], ['tank', 300, 160, 1.1, 1.1, 'ram'], 'hive', 'fireteam'),
  'game-afe2-bulwark': spec('synthetic', 'synthetic', 156, [94, 120], [285, 23, .6, 30, 5], ['tank', 295, 150, 1.08, 1.05, 'ram'], 'containment', 'fireteam'),
  'game-dd-wy-commando': spec('human', 'human', 144, [42, 132], [180, 17, .95, 20, 3], ['ranged', 220, 210, 1, .95, 'pulse'], 'rival-lab'),
  'game-afe2-exploder': spec('xenomorph', 'stalker', 132, [62, 90], [165, 18, 1.05, 8, 3], ['balanced', 210, 230, 1, .95, 'ram'], 'hive', 'fireteam'),
  'game-afe2-harbinger': spec('pathogen', 'stalker', 160, [52, 136], [230, 22, .95, 12, 4], ['balanced', 250, 220, 1.05, 1.1, 'slash'], 'hive', 'pathogen'),
  'game-dd-synthetic': spec('synthetic', 'synthetic', 142, [40, 130], [185, 16, .8, 8, 3], ['balanced', 215, 200, .95, .95, 'ram'], 'containment'),
  'game-dd-guardian': spec('human', 'human', 145, [44, 132], [210, 19, .9, 14, 4], ['ranged', 235, 200, 1.04, 1, 'pulse'], 'rival-lab')
});

const ADULT_STAGES = new Set(['adult', 'armored-adult', 'ceremonial-adult', 'suited-adult', 'Drone', 'Warrior', 'Praetorian', 'Queen', 'King']);
const YOUNG_STAGES = new Set(['Chestburster', 'Queen Chestburster', 'Juvenile', 'Larva', 'Facehugger']);
const BIOLOGIES = new Set(['engineer', 'synthetic', 'human', 'xenomorph', 'pathogen']);
/** Pure admission factory, shared by subsequent individually reviewed additions.
 * Young forms require explicit non-arena tuning; no filename guessing. */
export function createEnemyImportV106(admission, tuning, reference) {
  const b = admission?.alphaBounds, p = admission?.pivot;
  if (!reference || !tuning || reference.kind !== 'organism'
    || !(ADULT_STAGES.has(reference.stage) || (YOUNG_STAGES.has(reference.stage)
      && tuning.arenaEligible === false && ['juvenile', 'parasite'].includes(tuning.caste)))
    || !BIOLOGIES.has(tuning.biology) || reference.biology !== tuning.biology
    || admission.referenceId !== reference.id || admission.reviewStatus !== 'accepted-static-adaptation'
    || !/^[a-f0-9]{64}$/.test(admission.sha256 || '')
    || !/^\/assets\/openai\/sprites\/static-(?:import|game)-v106\/[a-z0-9-]+\.png$/.test(admission.path || '')
    || !Number.isInteger(admission.sourceWidth) || !Number.isInteger(admission.sourceHeight)
    || !Array.isArray(b) || b.length !== 4 || !b.every(Number.isFinite)
    || !(b[0] > 0 && b[1] > 0 && b[2] > b[0] && b[3] > b[1]
      && b[2] < admission.sourceWidth && b[3] < admission.sourceHeight)
    || !p || !(p.x >= 0 && p.x <= 1) || Math.abs(p.y * admission.sourceHeight - b[3]) > .001
    || ![-1, 1].includes(admission.sourceFacing)
    || !['melee', 'ranged'].includes(tuning.combatRole))
    throw new Error(`Invalid reviewed terrestrial V106 admission: ${admission?.slug || 'unknown'}`);
  const scale = tuning.targetOpaqueHeight / (b[3] - b[1]);
  const id = `pose-v106-import-${admission.slug}`;
  const ranged = tuning.combatRole === 'ranged';
  const credit = admission.slug === 'xeno-kingrogue' ? 'PRIME1 STUDIO' : reference.sourceCredit || null;
  return Object.freeze({ ...admission, id, profileId: id, basename: admission.slug,
    name: reference.alteredOf && !/Altered$/.test(reference.name) ? `${reference.name} — Altered` : reference.name,
    family: 'enemy', group: ({ engineer: 'Ingénieurs', synthetic: 'Synthétiques', human: 'Humains', pathogen: 'Pathogen', xenomorph: 'Xenomorphes' })[tuning.biology],
    biology: tuning.biology, faction: reference.faction, lineage: reference.lineage, stage: reference.stage,
    kind: 'organism', caste: tuning.caste, arenaEligible: tuning.arenaEligible === true && ADULT_STAGES.has(reference.stage),
    work: reference.work || 'Pack 270926 — design utilisateur, simulation non canonique',
    referenceIdV100: reference.id.startsWith('pack-v100-') ? reference.id : null,
    sourceReferenceId: reference.id, sourceFile: reference.sourceFile || null,
    sourceSha256: reference.sourceSha256 || null, originalPath: reference.path || null,
    alteredOf: reference.alteredOf || null, legacyCounterpartId: reference.alteredOf || null,
    relationship: reference.relationship || 'source-game-adaptation', sourceCredit: credit,
    filename: `${admission.slug}.png`, imageKey: `openai-static-import-v106:${admission.slug}`,
    health: tuning.health, damage: tuning.damage, speed: tuning.speed, armor: tuning.armor, cost: tuning.cost,
    renderWidth: admission.sourceWidth * scale, renderHeight: admission.sourceHeight * scale,
    targetOpaqueHeight: tuning.targetOpaqueHeight, bodyWidth: tuning.bodyWidth, bodyHeight: tuning.bodyHeight,
    combatRole: tuning.combatRole, rangedBehavior: ranged ? 'shooter' : 'melee', acid: 0,
    locomotion: 'ground', groundContact: true, automaticEncounter: true,
    encounterGroup: tuning.encounterGroup, encounterWorldIds: Object.freeze([]), bioforgeEligible: true,
    states: Object.freeze([]), referenceUrls: Object.freeze([...(reference.referenceUrls || [])]),
    visualMode: 'static-pose', animationStatus: 'missing', frames: 1, visualRevision: 106,
    identityStatus: 'source-reference-static-pose', referenceStatus: 'source-qualified-project-adaptation',
    identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
    provenance: 'reference-openai-integrated', sourceProvenance: reference.id.startsWith('pack-v100-') ? 'user-provided' : 'source-game-research',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    specializedBehaviorStatus: `simplified-ground-${ranged ? 'shooter' : 'melee'}-project-adaptation`,
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
    referenceNote: `${admission.reviewNote} ${credit ? `Crédit de la référence : ${credit}. ` : ''}Original et liens Altered conservés. Pose fixe ; déplacements, tirs éventuels, échelle et statistiques adaptés à la simulation, sans identité canonique ou fidélité 1:1 revendiquée.`
  });
}

export const ENEMY_USER_IMPORTS_V106 = Object.freeze(ENEMY_IMPORT_ADMISSIONS_V106.map(admission =>
  createEnemyImportV106(admission, ENEMY_IMPORT_TUNING_V106[admission.slug], references.get(admission.referenceId) || admission.reference)));

export const XENO_TRIALS_IMPORTS_V106 = Object.freeze(ENEMY_USER_IMPORTS_V106.filter(pose => pose.arenaEligible).map(pose => {
  const tuning = ENEMY_IMPORT_TUNING_V106[pose.basename];
  const [role, hp, speed, power, reach, special] = tuning.trial;
  return Object.freeze({ id: `import-${pose.basename}`, profileId: pose.id,
    label: `${pose.name} — adaptation`, role, hp, speed, power, reach, special,
    factionId: tuning.factionId, referenceIdV100: pose.referenceIdV100,
    sourceReferenceId: pose.sourceReferenceId, alteredOf: pose.alteredOf });
}));
