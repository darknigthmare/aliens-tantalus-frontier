/** Reviewed native RGBA poses, not recovered models or animation sheets.
 * Reference identity, visual reconstruction and project gameplay stay separate. */
const makeAutomaton = spec => {
  const sourceWidth = spec.sourceWidth || 1536, sourceHeight = spec.sourceHeight || 1024;
  const scale = spec.targetOpaqueHeight / (spec.alphaBounds[3] - spec.alphaBounds[1]);
  return Object.freeze({
    family: 'enemy', group: 'Synthétiques', biology: 'synthetic',
    stage: 'manufactured-unit', kind: 'organism', caste: 'synthetic',
    mechanical: true, acid: 0, arenaEligible: true, bioforgeEligible: true,
    locomotion: 'ground', groundContact: true, automaticEncounter: true,
    encounterWorldIds: Object.freeze([]), states: Object.freeze([]),
    visualRevision: 116, reviewStatus: 'accepted-static-adaptation',
    visualMode: 'static-pose', animationStatus: 'missing', frames: 1,
    identityStatus: 'reference-project-adaptation', identityVerified: false,
    canonExact: false, geometryStatus: 'project-adaptation', physicalSize: null,
    provenance: 'reference-openai-integrated',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    sizeBasis: 'project-display-and-collision-tuning-not-physical-measurement',
    sourceWidth, sourceHeight, sourceFacing: -1,
    // Alpha noise below 8 is excluded from geometry, never edited out of PNG.
    alphaBoundsThreshold: 8,
    ...spec, profileId: spec.id,
    filename: `${spec.basename}.png`,
    path: `/assets/openai/sprites/static-automaton-v116/${spec.basename}.png`,
    imageKey: `openai-static-automaton-v116:${spec.basename}`,
    renderWidth: sourceWidth * scale, renderHeight: sourceHeight * scale,
    alphaBounds: Object.freeze(spec.alphaBounds),
    pivot: Object.freeze({ x: spec.anchorX / sourceWidth, y: spec.alphaBounds[3] / sourceHeight }),
    referenceUrls: Object.freeze(spec.referenceUrls)
  });
};

export const ENEMY_AUTOMATON_ADAPTATIONS_V116 = Object.freeze([
  makeAutomaton({
    id: 'pose-v116-sunspot-good-boy', basename: 'sunspot-good-boy', name: 'SunSpot « Good Boy »',
    faction: 'National Dynamics', lineage: 'Combat automaton — SunSpot',
    work: 'Alien: Into Charybdis / Inferno’s Fall / Seventh Circle',
    alphaBounds: [117, 79, 1441, 955], anchorX: 790,
    sha256: 'e8b138616c3599b8642a385af6bf53deedf2da3c52d6791a7b1918dc95a9b747',
    targetOpaqueHeight: 116, bodyWidth: 100, bodyHeight: 86,
    health: 235, damage: 20, speed: 1.2, armor: 16, cost: 4,
    combatRole: 'ranged', rangedBehavior: 'shooter', combatWeapon: 'sentry-saw',
    encounterGroup: 'engineered',
    referenceUrls: ['https://avp.fandom.com/wiki/SunSpot_%22Good_Boy%22'],
    sourceReferenceId: 'sunspot-good-boy-novel-description-v116',
    relationship: 'novel-description-project-adaptation',
    referenceStatus: 'text-reference-no-canonical-visual-model', sourceProvenance: 'novel-description',
    specializedBehaviorStatus: 'simplified-ground-project-gunfire',
    referenceNote: 'Robot quadrupède décrit dans les romans. Illustration reconstruite à partir de la description, sans modèle visuel canonique vérifié. Les canons acoustiques repliés et les mécanismes de sentinelle figurent dans le dessin ; en jeu, seul le tir conventionnel au sol est adapté. Sonar, suppression acoustique et course aux murs non implémentés. Pose fixe native inchangée, contrôlée sur fond blanc avec son alpha ; les faibles pixels alpha hors silhouette ne servent pas à mesurer le corps. Taille et statistiques de simulation, aucune fidélité 1:1 certifiée.'
  }),
  makeAutomaton({
    id: 'pose-v116-tecsek', basename: 'tecsek', name: 'TecSek',
    faction: 'Montcalm-Delacroix', lineage: 'Combat automaton — TecSek',
    work: 'Aliens vs. Predator: Deadliest of the Species',
    alphaBounds: [159, 13, 1440, 1014], anchorX: 1020,
    sha256: '8fe28e660a999d6375efa9f9321da40499766fb127fb16589aa35a7107d83545',
    targetOpaqueHeight: 200, bodyWidth: 66, bodyHeight: 142,
    health: 300, damage: 28, speed: .85, armor: 24, cost: 6,
    combatRole: 'melee', rangedBehavior: 'melee', combatWeapon: 'articulated-blades',
    encounterGroup: 'crossover',
    referenceUrls: ['https://avp.fandom.com/wiki/TecSek', 'https://www.avpcentral.com/combat-androids', 'https://www.avpcentral.com/android-xenomorphs'],
    sourceReferenceId: 'tecsek-comic-visual-v116',
    relationship: 'comic-reference-project-adaptation',
    referenceStatus: 'comic-visual-reference-reconstruction', sourceProvenance: 'comic-visual-reference',
    specializedBehaviorStatus: 'simplified-ground-project-melee',
    referenceNote: 'Reconstruction guidée par la vue du TecSek dans le comic : torse mécanique clair, tête à capteur rouge, longues extensions à lames et canons d’épaule. Le côté caché et la pose de profil sont reconstruits. Combat de mêlée simplifié ; les canons visibles et la résistance décrite par les sources ne constituent pas des capacités intégrales implémentées. L’arc des lames est inclus dans le dessin mais pas dans le rectangle de collision du torse. PNG natif inchangé vérifié avec alpha sur blanc. Pose fixe, taille et statistiques de simulation ; aucune fidélité 1:1 certifiée.'
  }),
  makeAutomaton({
    id: 'pose-v116-automated-powerloader', basename: 'automated-powerloader', name: 'Automated Power Loader',
    faction: 'Weyland-Yutani', lineage: 'Combat automaton — Automated Power Loader',
    work: 'Tantalus Frontier — conversion autonome de projet, référence industrielle P-5000',
    sourceWidth: 1226, sourceHeight: 1283,
    alphaBounds: [12, 15, 1217, 1243], anchorX: 840,
    sha256: '61fb2a0b6668e154ca41b50820c9875dcbfac68a1a08247cfa2005884e6d63a8',
    targetOpaqueHeight: 204, bodyWidth: 80, bodyHeight: 182,
    health: 320, damage: 30, speed: .65, armor: 26, cost: 6,
    combatRole: 'melee', rangedBehavior: 'melee', combatWeapon: 'hydraulic-grippers',
    encounterGroup: 'engineered',
    autonomous: true, pilotable: false, operatorRequired: false,
    referenceUrls: ['https://avp.fandom.com/wiki/Automated_Powerloader', 'https://store.necaonline.com/products/aliens-40th-anniversary-power-loader-p-5000-deluxe-vehicle'],
    sourceReferenceId: 'automated-powerloader-project-p5000-v116',
    relationship: 'project-autonomous-conversion',
    referenceStatus: 'industrial-base-reference-autonomy-not-canon-verified', sourceProvenance: 'licensed-p5000-visual-project-conversion',
    specializedBehaviorStatus: 'simplified-autonomous-ground-melee',
    referenceNote: 'Automate autonome du projet, distinct du véhicule Power Loader pilotable. Le dessin industriel est guidé par le P-5000 licencié NECA ; le siège, le harnais, les commandes et l’ouverture de cockpit sont remplacés par un torse machine fermé à capteurs. Aucun pilote requis, aucun embarquement ni mode véhicule. La page Automated Powerloader fournie n’a pas permis de confirmer un modèle visuel autonome canonique : cette conversion reste explicitement une adaptation de projet. Attaque de mêlée au sol simplifiée avec pinces hydrauliques ; pose fixe native, taille et statistiques de simulation, aucune fidélité 1:1 certifiée.'
  })
]);

export const XENO_TRIALS_AUTOMATONS_V116 = Object.freeze([
  Object.freeze({ id: 'synth-good-boy', profileId: 'pose-v116-sunspot-good-boy', label: 'SunSpot « Good Boy »',
    role: 'ranged', hp: 235, speed: 240, power: 1, reach: .95, special: 'pulse', factionId: 'rival-lab' }),
  Object.freeze({ id: 'synth-tecsek', profileId: 'pose-v116-tecsek', label: 'TecSek',
    role: 'tank', hp: 300, speed: 170, power: 1.12, reach: 1.15, special: 'slash', factionId: 'rival-lab' }),
  Object.freeze({ id: 'synth-automated-powerloader', profileId: 'pose-v116-automated-powerloader', label: 'Automated Power Loader',
    role: 'tank', hp: 320, speed: 140, power: 1.15, reach: 1.05, special: 'ram', factionId: 'rival-lab' })
]);
