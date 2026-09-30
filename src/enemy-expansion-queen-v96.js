/**
 * One reviewed native PNG for the licensed Kenner / NECA Queen Facehugger.
 * Not the Alien 3 royal facehugger and not an alias of the film Facehugger.
 * Static fan adaptation only; this registry does not enable automatic encounters.
 */
export const ENEMY_EXPANSION_QUEEN_V96 = Object.freeze([
  Object.freeze({
    id: 'pose-v96-kenner-queen-facehugger', profileId: 'pose-v96-kenner-queen-facehugger',
    basename: 'queen-facehugger-neca', name: 'Queen Facehugger',
    family: 'enemy', biology: 'xenomorph', group: 'Figurines',
    work: 'Aliens — Kenner / NECA Series 10', legacyCounterpartId: null,
    combatRole: 'melee', locomotion: 'ground',
    visualMode: 'static-pose', animationStatus: 'missing', states: Object.freeze([]),
    specializedBehaviorStatus: 'not-implemented',
    identityStatus: 'reference-guided-static-pose', referenceStatus: 'reference-qualified',
    identityVerified: false, canonExact: false,
    provenance: 'openai-integrated-reference-guided', sourceProvenance: 'primary-licensed-manufacturer',
    assetVerificationStatus: 'sha256-dimensions-alpha-verified',
    reviewStatus: 'accepted-static-adaptation', geometryStatus: 'project-adaptation',
    visualRevision: 96, automaticEncounter: false, encounterGroup: 'engineered',
    encounterWorldIds: Object.freeze([]),
    filename: 'queen-facehugger-neca.png',
    path: '/assets/openai/sprites/static-enemy-v96/queen-facehugger-neca.png',
    imageKey: 'openai-static-v96:queen-facehugger-neca',
    sourceWidth: 1536, sourceHeight: 1024, sourceFacing: 1,
    renderWidth: 238, renderHeight: 238 * 1024 / 1536, bodyWidth: 80, bodyHeight: 64,
    // Align the lowest visible leg tip, not the raised tail or transparent canvas.
    pivot: Object.freeze({ x: .53, y: 1011 / 1024 }),
    health: 140, damage: 18, speed: 1.15, armor: 8, cost: 3,
    sha256: '62ec9f2b9d46dbd337cfc77de80749940fc27155f46dfe42227a8c44f638c40c',
    alphaBounds: Object.freeze([31, 26, 1520, 1011]),
    referenceUrls: Object.freeze([
      'https://store.necaonline.com/blogs/news/shipping-this-week-aliens-series-10-freddy-s-revenge-1-4-scale-freddy-and-foam-space-jockey',
      'https://store.necaonline.com/blogs/behind-the-scenes/closer-look-aliens-series-10-kenner-tribute-action-figures',
      'https://necaonline.com/2016/12/closer-look-aliens-series-10-kenner-tribute-action-figures/1200x-51621-facehuggers1/',
      'https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2016/12/1200x-51621-Facehuggers1-.jpg'
    ]),
    referenceNote: 'Adaptation fan-made du grand Queen Facehugger Kenner Tribute NECA Series 10, relue contre la photographie fabricant Facehuggers1 affichée dans un navigateur : carapace noire, corps rouge sombre, huit pattes articulées à membranes latérales et longue queue rouge/noire segmentée. Ce profil ne remplace ni le Facehugger de film ni le Royal Facehugger d’Alien 3. Pose, orientation, pointe de queue et détails interprétés, sans certification 1:1. PNG natif intégral et octets conservés ; alpha contrôlé sur blanc/noir et à échelle de jeu. Marges alpha 16 : gauche 31, haut 26, droite 16, bas 13 pixels ; corps alpha moyen 250,49/255, sans aplats entièrement opaques. Ancrage à la patte la plus basse ; statistiques, collision et groupe engineered sont des choix non canoniques du projet. Pas de saisie, implantation, contrôle de ruche ou animation dédiée simulés.'
  })
]);
