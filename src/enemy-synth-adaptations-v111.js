/** Native RGBA project adaptation. No new canonical species, certified game
 * model, animation sheet or measurement in metres is implied by admission. */
const id = 'pose-v111-afe-synth-enforcer';
const basename = 'game-afe-synth-enforcer';
const bounds = Object.freeze([38, 93, 1001, 1474]);
const scale = 140 / (bounds[3] - bounds[1]);
export const ENEMY_SYNTH_ADAPTATIONS_V111 = Object.freeze([Object.freeze({
  id, profileId: id, basename, name: 'Synth Enforcer', family: 'enemy', group: 'Synthétiques',
  biology: 'synthetic', faction: 'Weyland-Yutani', lineage: 'Security Synth — rifleman',
  stage: 'manufactured-unit', kind: 'organism', caste: 'synthetic', arenaEligible: true,
  work: 'Aliens: Fireteam Elite — adaptation Enforcer', filename: `${basename}.png`,
  path: `/assets/openai/sprites/static-game-v111/${basename}.png`,
  imageKey: `openai-static-game-v111:${basename}`, sourceWidth: 1024, sourceHeight: 1536,
  sourceFacing: -1, alphaBounds: bounds, pivot: Object.freeze({ x: 656 / 1024, y: bounds[3] / 1536 }),
  sha256: '028ef6780368173b86af8774c45f0c74856002b730afed8e8e4e7071bcacfe25',
  reviewStatus: 'accepted-static-adaptation', visualRevision: 111,
  health: 215, damage: 18, speed: .9, armor: 16, cost: 4,
  renderWidth: 1024 * scale, renderHeight: 1536 * scale, targetOpaqueHeight: 140,
  bodyWidth: 48, bodyHeight: 128, combatRole: 'ranged', rangedBehavior: 'shooter', acid: 0,
  locomotion: 'ground', groundContact: true, automaticEncounter: true, encounterGroup: 'fireteam',
  encounterWorldIds: Object.freeze([]), bioforgeEligible: true, states: Object.freeze([]),
  referenceUrls: Object.freeze([
    'https://avp.fandom.com/wiki/Security_Synth_(LV-895)',
    'https://www.neoseeker.com/aliens-fireteam-elite-2/walkthrough/Piping_Hot'
  ]),
  sourceReferenceId: 'afe-enforcer-security-rifleman-v111', relationship: 'source-game-adaptation',
  visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
  identityStatus: 'source-reference-static-pose', referenceStatus: 'source-qualified-project-adaptation',
  identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
  provenance: 'reference-openai-integrated', sourceProvenance: 'existing-project-reference-and-gameplay-research',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  specializedBehaviorStatus: 'simplified-ballistic-rifleman',
  sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
  referenceNote: 'Synthétique de sécurité blanc avec fusil industriel, adapté du rifleman de la lignée AFE. Écarts mineurs de pose et d’équipement autorisés par le joueur. Le rapprochement Enforcer/Guard vient d’un guide de jeu, pas d’une validation officielle du modèle AFE2. Pose fixe ; aucune fidélité 1:1 certifiée.'
})]);

export const XENO_TRIALS_SYNTHS_V111 = Object.freeze([Object.freeze({
  id: 'synth-enforcer', profileId: id, label: 'Synth Enforcer',
  role: 'ranged', hp: 230, speed: 200, power: 1, reach: .95,
  special: 'pulse', factionId: 'rival-lab'
})]);
