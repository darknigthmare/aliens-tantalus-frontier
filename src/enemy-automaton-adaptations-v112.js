/** Native RGBA observational adaptation. This is a manufactured project
 * combatant, not a certified AFE2 model or a recovered animation sheet. */
const id = 'pose-v112-afe2-peacekeeper';
const basename = 'game-afe2-peacekeeper';
const bounds = Object.freeze([26, 14, 1005, 1511]);
const scale = 158 / (bounds[3] - bounds[1]);

export const ENEMY_AUTOMATON_ADAPTATIONS_V112 = Object.freeze([Object.freeze({
  id, profileId: id, basename, name: 'Peacekeeper', family: 'enemy', group: 'Synthétiques',
  biology: 'synthetic', faction: 'Weyland-Yutani', lineage: 'Combat automaton — Peacekeeper',
  stage: 'manufactured-unit', kind: 'organism', caste: 'synthetic', arenaEligible: true,
  work: 'Aliens: Fireteam Elite 2 — adaptation observationnelle', filename: `${basename}.png`,
  path: `/assets/openai/sprites/static-game-v112/${basename}.png`,
  imageKey: `openai-static-game-v112:${basename}`, sourceWidth: 1024, sourceHeight: 1536,
  sourceFacing: -1, alphaBounds: bounds,
  // Torso/stance center anchors X; the lowest retained native foot defines Y.
  // This three-quarter pose keeps the rear foot visibly above that ground line.
  pivot: Object.freeze({ x: 655 / 1024, y: bounds[3] / 1536 }),
  sha256: 'dfb6a5df19cabb190ebcf44583eb2e62242ff4e2f6ce4cc41643f4878fbab406',
  reviewStatus: 'accepted-static-adaptation', visualRevision: 112,
  health: 270, damage: 24, speed: .82, armor: 22, cost: 5,
  renderWidth: 1024 * scale, renderHeight: 1536 * scale, targetOpaqueHeight: 158,
  bodyWidth: 58, bodyHeight: 144, combatRole: 'melee', rangedBehavior: 'melee', acid: 0,
  combatWeapon: 'electrical-baton', mechanical: true,
  locomotion: 'ground', groundContact: true, automaticEncounter: true, encounterGroup: 'fireteam',
  encounterWorldIds: Object.freeze([]), bioforgeEligible: true, states: Object.freeze([]),
  referenceUrls: Object.freeze(['https://avp.fandom.com/wiki/Peacekeeper']),
  sourceReferenceId: 'afe2-peacekeeper-observed-v112', relationship: 'source-game-adaptation',
  visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
  identityStatus: 'observational-project-adaptation', referenceStatus: 'observed-reference-not-attached',
  identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
  provenance: 'reference-openai-integrated', sourceProvenance: 'text-observation-only',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  specializedBehaviorStatus: 'simplified-ground-melee-baton-project-adaptation',
  sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
  referenceNote: 'Adaptation guidée par l’observation textuelle d’un Peacekeeper AFE2 couché au sol ; aucune image source jointe ni modèle original récupéré. Automate mécanique graphite à torse cylindrique, capteur circulaire, membres carénés et pieds en blocs. Pose debout et géométrie du bâton reconstruites : le bâton électrique est décrit par la source mais absent de la vue observée. PNG natif inchangé vérifié sur blanc et noir, sans halo visible. Pose fixe en trois-quarts ; le pied le plus bas définit le sol. Taille, collisions et statistiques sont des réglages de simulation, pas des mesures canoniques. Identité non certifiée ; aucune fidélité 1:1 certifiée.'
})]);

export const XENO_TRIALS_AUTOMATONS_V112 = Object.freeze([Object.freeze({
  id: 'synth-peacekeeper', profileId: id, label: 'Peacekeeper — adaptation',
  role: 'tank', hp: 270, speed: 185, power: 1.05, reach: 1.1,
  special: 'baton', factionId: 'rival-lab'
})]);
