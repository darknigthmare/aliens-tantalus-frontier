/** Native RGBA observational adaptations. They are static project combatants,
 * not certified replicas, physical measurements or recovered source-game models. */
const id = 'pose-v112-afe2-engineer-hybrid';
const basename = 'game-afe2-engineer-hybrid';
const bounds = Object.freeze([120, 5, 955, 1523]);
const scale = 180 / (bounds[3] - bounds[1]);

export const ENEMY_AFE2_ADAPTATIONS_V112 = Object.freeze([Object.freeze({
  id, profileId: id, basename, name: 'Engineer hybrid', family: 'enemy', group: 'Pathogen',
  biology: 'pathogen', faction: 'Pathogen', lineage: 'Engineer hybrid — adaptation observationnelle AFE2',
  stage: 'adult', kind: 'organism', caste: 'stalker', arenaEligible: true,
  work: 'Aliens: Fireteam Elite 2 — adaptation observationnelle', filename: `${basename}.png`,
  path: `/assets/openai/sprites/static-game-v112/${basename}.png`,
  imageKey: `openai-static-game-v112:${basename}`, sourceWidth: 1024, sourceHeight: 1536,
  sourceFacing: -1, alphaBounds: bounds,
  // X anchors the torso between the feet; Y grounds the lowest native toe.
  // The rear foot is 93 source pixels higher in this retained three-quarter pose.
  pivot: Object.freeze({ x: 560 / 1024, y: bounds[3] / 1536 }),
  groundContacts: Object.freeze([
    Object.freeze({ role: 'rear-foot', x: 201.5 / 1024, y: 1430 / 1536 }),
    Object.freeze({ role: 'lowest-foot', x: 825.5 / 1024, y: 1523 / 1536 })
  ]),
  sha256: '3c34d085118b0e251da540064ddc426978aae953b78bda85db555c951328b5ce',
  reviewStatus: 'accepted-static-adaptation', visualRevision: 112,
  health: 300, damage: 28, speed: .75, armor: 18, cost: 5,
  renderWidth: 1024 * scale, renderHeight: 1536 * scale, targetOpaqueHeight: 180,
  bodyWidth: 62, bodyHeight: 166, combatRole: 'melee', rangedBehavior: 'melee', acid: 0,
  locomotion: 'ground', groundContact: true, automaticEncounter: true, encounterGroup: 'pathogen',
  encounterWorldIds: Object.freeze([]), bioforgeEligible: true, states: Object.freeze([]),
  referenceUrls: Object.freeze(['https://avp.fandom.com/wiki/Engineer_hybrid']),
  sourceReferenceId: 'afe2-engineer-hybrid-observed-v112', relationship: 'source-game-adaptation',
  visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
  identityStatus: 'observational-project-adaptation', referenceStatus: 'observed-reference-not-attached',
  identityVerified: false, canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
  provenance: 'reference-openai-integrated', sourceProvenance: 'observed-reference-text-only',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  specializedBehaviorStatus: 'simplified-ground-melee-project-adaptation',
  sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
  referenceNote: 'Adaptation produite à partir de descriptions d’une référence AFE2 observée, sans image source jointe ni modèle original récupéré. Bipède pathogène pâle, mains sombres griffues, sans queue ; identité non certifiée et aucun alias Husk. PNG natif vérifié sur fonds blanc et noir : pas de halo visible. Pose fixe en trois-quarts, avec pied arrière visuellement surélevé ; le pied le plus bas définit le sol. Hauteur, collisions et statistiques sont des réglages de simulation, pas des mesures canoniques. Aucune fidélité 1:1 certifiée.'
})]);

export const XENO_TRIALS_AFE2_V112 = Object.freeze([Object.freeze({
  id: 'afe2-engineer-hybrid', profileId: id, label: 'Engineer hybrid — adaptation',
  role: 'tank', hp: 300, speed: 180, power: 1.15, reach: 1.08,
  special: 'slash', factionId: 'hive'
})]);
