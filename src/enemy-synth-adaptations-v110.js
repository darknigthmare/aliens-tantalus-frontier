/** Individually reviewed native RGBA poses. Project adaptations, not certified
 * game models, animation sheets or measurements in canonical metres. */
const sources = Object.freeze({
  security: 'https://avp.fandom.com/wiki/Security_Synth_(LV-895)',
  volcan: 'https://avp.fandom.com/wiki/OCAP-91_Volcan'
});
const rows = [
  { slug: 'incinerator', name: 'Synth Incinerator', bounds: [24, 111, 1012, 1460], pivotX: 430,
    sha256: '003f9f4c65c2c7ff4f32c0f82bfc8b08ad19ab8893f1abaa6fd27f628db92318',
    opaqueHeight: 150, body: [58, 136], health: 260, damage: 24, speed: .65, armor: 24, cost: 5,
    role: 'tank', hp: 280, trialSpeed: 150, power: 1.05, reach: 1, special: 'flame', factionId: 'rival-lab',
    note: 'Morphologie du Heavy conservée avec OCAP-91 Volcan, harnais et alimentation. Adaptation des références, pas relevé exact du modèle AFE2.' },
  { slug: 'detonator', name: 'Synth Detonator', bounds: [90, 59, 954, 1466], pivotX: 520,
    sha256: '7d8f8003e80da96f8a045462ab789d86a1c39900ac55edc6db8627e17b553483',
    opaqueHeight: 128, body: [42, 116], health: 125, damage: 32, speed: 1.2, armor: 5, cost: 3,
    role: 'agile', hp: 180, trialSpeed: 250, power: 1.1, reach: 1, special: 'detonation', factionId: 'pursuit',
    note: 'Synthétique robotique endommagé sans tête, dérivé de la lignée visuelle des Troopers selon la description fournie.' },
  { slug: 'containment', name: 'Synth Containment', bounds: [123, 54, 921, 1473], pivotX: 500,
    sha256: 'd065df84b529a30469df39215cb97d0d9b74b2323148f124d6ba6b04c2531bc2',
    opaqueHeight: 140, body: [48, 128], health: 230, damage: 19, speed: .8, armor: 18, cost: 4,
    role: 'tank', hp: 260, trialSpeed: 175, power: 1, reach: .95, special: 'shield', factionId: 'containment',
    note: 'Synthétique de confinement avec bouclier et matraque. Adaptation de la lignée existante et de cet équipement documenté ; image Yahoo exacte non consultable.' }
];

export const ENEMY_SYNTH_ADAPTATIONS_V110 = Object.freeze(rows.map(row => {
  const id = `pose-v110-afe-synth-${row.slug}`, basename = `game-afe-synth-${row.slug}`;
  const scale = row.opaqueHeight / (row.bounds[3] - row.bounds[1]);
  return Object.freeze({ id, profileId: id, basename, name: row.name, family: 'enemy', group: 'Synthétiques',
    biology: 'synthetic', faction: 'Weyland-Yutani', lineage: 'Security Synth — LV-895', stage: 'manufactured-unit',
    kind: 'organism', caste: 'synthetic', arenaEligible: true, work: 'Aliens: Fireteam Elite — adaptation de synthétique',
    filename: `${basename}.png`, path: `/assets/openai/sprites/static-game-v110/${basename}.png`,
    imageKey: `openai-static-game-v110:${basename}`, sourceWidth: 1024, sourceHeight: 1536, sourceFacing: 1,
    alphaBounds: Object.freeze(row.bounds), pivot: Object.freeze({ x: row.pivotX / 1024, y: row.bounds[3] / 1536 }),
    sha256: row.sha256, reviewStatus: 'accepted-static-adaptation', visualRevision: 110,
    health: row.health, damage: row.damage, speed: row.speed, armor: row.armor, cost: row.cost,
    renderWidth: 1024 * scale, renderHeight: 1536 * scale, targetOpaqueHeight: row.opaqueHeight,
    bodyWidth: row.body[0], bodyHeight: row.body[1], combatRole: 'melee', rangedBehavior: 'melee', acid: 0,
    synthBehaviorV110: row.special,
    ...(row.slug === 'containment' ? { containmentGuardV110: Object.freeze({ minimumFrontDot: .55, residualDamageMultiplier: .3 }) } : {}),
    locomotion: 'ground', groundContact: true, automaticEncounter: true, encounterGroup: 'fireteam',
    encounterWorldIds: Object.freeze([]), bioforgeEligible: true, states: Object.freeze([]),
    referenceUrls: Object.freeze([sources.security, ...(row.slug === 'incinerator' ? [sources.volcan] : [])]),
    sourceReferenceId: `afe-synth-${row.slug}-user-clarification-v110`, relationship: 'source-game-adaptation',
    visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
    identityStatus: 'source-reference-static-pose', referenceStatus: 'source-qualified-project-adaptation',
    identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
    provenance: 'reference-openai-integrated', sourceProvenance: 'source-game-research-and-user-clarification',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified', specializedBehaviorStatus: 'project-synth-behavior-v110',
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement', referenceNote: `${row.note} Pose fixe, aucune fidélité 1:1 certifiée.` });
}));

export const XENO_TRIALS_SYNTHS_V110 = Object.freeze(rows.map(row => Object.freeze({
  id: `synth-${row.slug}`, profileId: `pose-v110-afe-synth-${row.slug}`, label: row.name,
  role: row.role, hp: row.hp, speed: row.trialSpeed, power: row.power, reach: row.reach,
  special: row.special, factionId: row.factionId
})));
