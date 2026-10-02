/** Individually reviewed native PNGs from documented production concepts.
 * A concept identity, a fixed illustration and source-game fidelity are separate.
 * Simulation dimensions and melee balance below are authored, never metres. */
const cultistBounds = Object.freeze([77, 82, 829, 1452]);
const cultistScale = 126 / (cultistBounds[3] - cultistBounds[1]);

export const ENEMY_SOURCE_ADAPTATIONS_V118 = Object.freeze([Object.freeze({
  id: 'pose-v118-dd-darwin-era-cultist', profileId: 'pose-v118-dd-darwin-era-cultist',
  basename: 'darwin-era-cultist', filename: 'darwin-era-cultist.png',
  name: 'Cultiste Darwin Era', family: 'enemy', group: 'Humains',
  biology: 'human', stage: 'adult', kind: 'organism', caste: 'human',
  faction: 'Darwin Era', lineage: 'Darwin Era — cultistes humains',
  work: 'Aliens: Dark Descent — concept de production',
  path: '/assets/openai/sprites/static-game-v118/darwin-era-cultist.png',
  imageKey: 'openai-static-game-v118:darwin-era-cultist',
  sourceWidth: 1024, sourceHeight: 1536, sourceFacing: 1,
  alphaBounds: cultistBounds, alphaBoundsThreshold: 8,
  // Anchor the torso between the boots; the low native boot edge defines Y.
  // The tool extends beyond the torso collider, without cropping its pixels.
  pivot: Object.freeze({ x: 565 / 1024, y: 1452 / 1536 }),
  sha256: '63ad74726db54f2943fed909f0027cb5d489a5f4ca58484b41871140219fa182',
  renderWidth: 1024 * cultistScale, renderHeight: 1536 * cultistScale,
  targetOpaqueHeight: 126, bodyWidth: 40, bodyHeight: 116,
  health: 140, damage: 16, speed: 1, armor: 6, cost: 2,
  combatRole: 'melee', rangedBehavior: 'melee', combatWeapon: 'improvised-hook',
  acid: 0, mechanical: false, locomotion: 'ground', groundContact: true,
  arenaEligible: true, bioforgeEligible: true, automaticEncounter: true,
  encounterGroup: 'crossover', encounterWorldIds: Object.freeze([]),
  states: Object.freeze([]), visualRevision: 118,
  reviewStatus: 'accepted-static-adaptation', visualMode: 'static-pose',
  animationStatus: 'missing', frames: 1,
  identityStatus: 'production-concept-project-adaptation', identityVerified: false,
  canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
  provenance: 'reference-openai-integrated',
  sourceProvenance: 'production-artist-concept-sheet',
  sourceCredit: 'Raymond Sébastien — concept de production',
  sourceReferenceId: 'dd-darwin-era-fanatics-concept-v118',
  relationship: 'production-concept-project-adaptation',
  referenceStatus: 'production-concept-not-final-game-model',
  referenceUrls: Object.freeze([
    'https://www.artstation.com/artwork/JvgEP0',
    'https://magazine.artstation.com/2023/07/tindalos-interactive-aliens-dark-descent-art-blast/'
  ]),
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  specializedBehaviorStatus: 'simplified-human-ground-melee-project-adaptation',
  sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
  referenceNote: 'Adaptation du cultiste en haut à droite de la planche de recherches Darwin Era publiée par Raymond Sébastien pour Aliens: Dark Descent. Tête rasée, foulard sombre, haut clair à manches courtes, protections d’avant-bras, pantalon sombre, bottes et outil à crochet abaissé conservés dans une nouvelle illustration. Le concept de production ne certifie ni le modèle final en jeu ni une identité Guardian ou Numinous. Les détails et la pose sont reconstruits : fidélité approximative, aucune certification 1:1. PNG natif copié sans modification des pixels et contrôlé avec son alpha réel sur blanc et noir : aucun halo visible. Le corps possède un alpha principalement 253/254, pas une opacité 255 ; les RGB sous alpha 0 restent invisibles et intacts. La géométrie ignore seulement les pixels alpha inférieurs à 8. Pose fixe en trois-quarts tournée vers la droite, sans cycle de marche ni d’attaque. Humain adulte, sans stade juvénile, mutation, acide ou fusil ; mêlée simplifiée au crochet. Taille, collisions et statistiques de simulation, pas des mesures physiques canoniques.'
})]);

/** This roster row does not itself admit the image to Trials; the central
 * terrestrial gate still requires the exact reviewed profile above. */
export const XENO_TRIALS_SOURCE_ADAPTATIONS_V118 = Object.freeze([Object.freeze({
  id: 'dd-darwin-era-cultist', profileId: 'pose-v118-dd-darwin-era-cultist',
  label: 'Cultiste Darwin Era', role: 'balanced', hp: 180, speed: 225,
  power: .85, reach: .95, special: 'slash', factionId: 'rival-lab',
  sourceReferenceId: 'dd-darwin-era-fanatics-concept-v118'
})]);
