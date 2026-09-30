/**
 * Additional source-specific poses admitted after image and provenance review.
 * Pending generations are deliberately absent: missing files never enter runtime.
 * Historical V50 profiles and the 35 immutable V87 imports are not rewritten.
 */
const common = Object.freeze({
  family: 'enemy', biology: 'xenomorph', group: 'Figurines',
  work: 'Aliens — Kenner / NECA (figurines)', legacyCounterpartId: null,
  combatRole: 'melee', visualMode: 'static-pose', animationStatus: 'missing',
  specializedBehaviorStatus: 'not-implemented',
  identityStatus: 'reference-guided-static-pose', referenceStatus: 'reference-qualified',
  identityVerified: false, canonExact: false,
  provenance: 'openai-integrated-reference-guided',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  reviewStatus: 'accepted-static-adaptation', geometryStatus: 'project-adaptation',
  visualRevision: 94, automaticEncounter: false, encounterGroup: 'crossover',
  encounterWorldIds: Object.freeze([])
});

// The shared group render is a secondary visual source, not an official model
// extraction. Distinct profiles keep their own PNG and use ballistic AI only.
const synthetic = Object.freeze({
  ...common, biology: 'synthetic', group: 'Jeux',
  work: 'Aliens: Fireteam Elite (2021)', combatRole: 'ranged',
  rangedBehavior: 'shooter', encounterGroup: 'fireteam',
  sourceWidth: 1024, sourceHeight: 1536,
  referenceUrls: Object.freeze([
    'https://www.avpcentral.com/combat-androids',
    'https://www.avpcentral.com/images/combat-androids/aliens-fireteam-elite-security-synthetics.webp'
  ])
});

export const ENEMY_ADDITIONAL_POSES_V94 = Object.freeze([
  Object.freeze({
    ...common, id: 'pose-v94-kenner-gorilla', profileId: 'pose-v94-kenner-gorilla',
    basename: 'kenner-gorilla-neca', name: 'Gorilla Alien',
    filename: 'kenner-gorilla-neca.png',
    path: '/assets/openai/sprites/static-enemy-v94/kenner-gorilla-neca.png',
    imageKey: 'openai-static-v94:kenner-gorilla-neca',
    sourceWidth: 1254, sourceHeight: 1254, sourceFacing: 1,
    renderWidth: 238, renderHeight: 238, bodyWidth: 70, bodyHeight: 130,
    pivot: Object.freeze({ x: .69, y: 1251 / 1254 }),
    health: 230, damage: 24, speed: 1, armor: 14, cost: 4,
    sha256: 'c91b539cebeb76fd69ac39ef5c9966166584a45f8a51a064c09a7306d54f4685',
    alphaBounds: Object.freeze([83, 22, 1162, 1251]),
    referenceUrls: Object.freeze([
      'https://necaonline.com/2016/12/closer-look-aliens-series-10-kenner-tribute-action-figures/',
      'https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2016/12/1200x-51620-Gorilla1-.jpg'
    ]),
    referenceNote: 'Adaptation fan-made du Gorilla Alien NECA Kenner Tribute, sans assimilation au Gorilla d’Aliens: Infestation. Dôme noir, crochets des avant-bras et pointe de queue ajourée relus. Pose native entière conservée : seulement trois pixels de marge sous la main. Ni modèle de film, ni extraction officielle, ni certification 1:1.'
  }),
  Object.freeze({
    ...common, id: 'pose-v94-kenner-rhino', profileId: 'pose-v94-kenner-rhino',
    basename: 'kenner-rhino-neca', name: 'Rhino Alien',
    filename: 'kenner-rhino-neca.png',
    path: '/assets/openai/sprites/static-enemy-v94/kenner-rhino-neca.png',
    imageKey: 'openai-static-v94:kenner-rhino-neca',
    sourceWidth: 1310, sourceHeight: 1201, sourceFacing: -1,
    renderWidth: 328, renderHeight: 328 * 1201 / 1310, bodyWidth: 140, bodyHeight: 124,
    pivot: Object.freeze({ x: .62, y: 1116 / 1201 }),
    health: 320, damage: 28, speed: .8, armor: 24, cost: 5,
    sha256: '056cff7c33e15760ea867185dba4228542eabc291328034d40246589180e7ce8',
    alphaBounds: Object.freeze([26, 123, 1291, 1116]),
    referenceUrls: Object.freeze([
      'https://necaonline.com/2019/10/aliens-7-scale-action-figure-rhino-alien-kenner-tribute/',
      'https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2019/10/516921.jpg'
    ]),
    referenceNote: 'Adaptation fan-made du Rhino Alien NECA Kenner Tribute : profil gauche, deux cornes, queue courte, quatre membres et coloration orange/noir comparés à la photographie fabricant. Identité de figurine explicite ; ni espèce film certifiée, ni extraction officielle, ni certification 1:1.'
  }),
  Object.freeze({
    ...common, id: 'pose-v94-kenner-snake', profileId: 'pose-v94-kenner-snake',
    basename: 'kenner-snake-neca', name: 'Snake Alien',
    filename: 'kenner-snake-neca.png',
    path: '/assets/openai/sprites/static-enemy-v94/kenner-snake-neca.png',
    imageKey: 'openai-static-v94:kenner-snake-neca',
    sourceWidth: 1199, sourceHeight: 1312, sourceFacing: 1,
    renderWidth: 200, renderHeight: 200 * 1312 / 1199, bodyWidth: 64, bodyHeight: 150,
    pivot: Object.freeze({ x: .52, y: 1266 / 1312 }),
    health: 165, damage: 22, speed: 1.1, armor: 10, cost: 3,
    sha256: 'add655b4eb67bb402a3b10a254a135995fd3056517d62bc8411bc05c995fbed4',
    alphaBounds: Object.freeze([277, 34, 913, 1266]),
    referenceUrls: Object.freeze([
      'https://necaonline.com/2019/02/shipping-this-week-aliens-series-13-godzilla-1962/',
      'https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2018/02/Snake-Alien1.jpg'
    ]),
    referenceNote: 'Adaptation fan-made du Snake Alien NECA Series 13 Kenner Tribute, relue contre la photographie fabricant. Pose frontale fixe conservée entière ; mouvement et statistiques sont des adaptations de jeu. Identité de figurine explicite, sans prétendre à une apparition cinéma ni à une certification 1:1.'
  }),
  Object.freeze({
    ...common, id: 'pose-v94-kenner-panther', profileId: 'pose-v94-kenner-panther',
    basename: 'kenner-panther-neca', name: 'Panther Alien',
    filename: 'kenner-panther-neca.png',
    path: '/assets/openai/sprites/static-enemy-v94/kenner-panther-neca.png',
    imageKey: 'openai-static-v94:kenner-panther-neca',
    sourceWidth: 1310, sourceHeight: 1201, sourceFacing: 1,
    renderWidth: 290, renderHeight: 290 * 1201 / 1310, bodyWidth: 108, bodyHeight: 76,
    pivot: Object.freeze({ x: .54, y: 1175 / 1201 }),
    health: 190, damage: 23, speed: 1.5, armor: 10, cost: 3,
    sha256: '575f23d532b10eb34f2dd0df9e8a860e1511cdecf4e7ab20eb5fa7742acc549c',
    alphaBounds: Object.freeze([148, 51, 1205, 1175]),
    referenceUrls: Object.freeze([
      'https://store.necaonline.com/products/aliens-7-scale-action-figure-ultimate-kenner-tribute-panther-alien',
      'https://store.necaonline.com/cdn/shop/files/Panther2.jpg?v=1745615805&width=1100'
    ]),
    referenceNote: 'Adaptation fan-made du Panther Alien Ultimate Kenner Tribute NECA, relue contre la photographie fabricant Panther2. Pose fixe et canvas natif conservés ; comportement de proximité simplifié, sans gadget ou animation inventé. Identité de figurine explicite, sans certification 1:1.'
  }),
  Object.freeze({
    ...synthetic, id: 'pose-v94-afe-synth-trooper', profileId: 'pose-v94-afe-synth-trooper',
    basename: 'game-afe-synth-trooper', name: 'Synth Trooper',
    filename: 'game-afe-synth-trooper.png',
    path: '/assets/openai/sprites/static-enemy-v94/game-afe-synth-trooper.png',
    imageKey: 'openai-static-v94:game-afe-synth-trooper', sourceFacing: -1,
    renderWidth: 132, renderHeight: 198, bodyWidth: 48, bodyHeight: 110,
    pivot: Object.freeze({ x: .50, y: 1495 / 1536 }),
    health: 90, damage: 10, speed: 1.1, armor: 6, cost: 2,
    sha256: '524e20c5f99303a243baaa8e2e763f22e2bb983decc24d34e90ebb89c1260338',
    alphaBounds: Object.freeze([186, 71, 783, 1495]),
    referenceNote: 'Adaptation fan-made du Synth Trooper d’Aliens: Fireteam Elite, comparée au sujet gauche du rendu groupé publié par AVP Central, source secondaire. Plastron clair, épaules peu blindées, mains pâles et arme basse distingués du Guard. Pose entière contrôlée sur blanc et damier ; statistiques et tir sont adaptés au projet. Aucun jet acide, aucune certification 1:1.'
  }),
  Object.freeze({
    ...synthetic, id: 'pose-v94-afe-synth-guard', profileId: 'pose-v94-afe-synth-guard',
    basename: 'game-afe-synth-guard', name: 'Synth Guard',
    filename: 'game-afe-synth-guard.png',
    path: '/assets/openai/sprites/static-enemy-v94/game-afe-synth-guard.png',
    imageKey: 'openai-static-v94:game-afe-synth-guard', sourceFacing: -1,
    renderWidth: 148, renderHeight: 222, bodyWidth: 54, bodyHeight: 114,
    pivot: Object.freeze({ x: .52, y: 1501 / 1536 }),
    health: 150, damage: 14, speed: .9, armor: 16, cost: 3,
    sha256: 'b0d36997b4ea3ddc7816bd1738b89de239fc441707611de8cbcf6333d6523c05',
    alphaBounds: Object.freeze([150, 86, 860, 1501]),
    referenceNote: 'Adaptation fan-made du Synth Guard d’Aliens: Fireteam Elite, comparée au sujet central gauche du rendu groupé publié par AVP Central, source secondaire. Plastron, épaulières et protections des avant-bras clairs, mains pâles et arme horizontale relus. Pose entière contrôlée sur blanc et damier ; statistiques et tir sont adaptés au projet. Aucun jet acide, aucune certification 1:1.'
  }),
  Object.freeze({
    ...synthetic, id: 'pose-v94-afe-synth-sniper', profileId: 'pose-v94-afe-synth-sniper',
    basename: 'game-afe-synth-sniper', name: 'Synth Sniper',
    filename: 'game-afe-synth-sniper.png',
    path: '/assets/openai/sprites/static-enemy-v94/game-afe-synth-sniper.png',
    imageKey: 'openai-static-v94:game-afe-synth-sniper', sourceFacing: 1,
    renderWidth: 140, renderHeight: 210, bodyWidth: 48, bodyHeight: 114,
    pivot: Object.freeze({ x: .51, y: 1513 / 1536 }),
    health: 105, damage: 18, speed: .85, armor: 10, cost: 3,
    sha256: '6541a21be18321c71b2e8e2a8b76f5ac7e58581babe5e190a3dcde6247f5977b',
    alphaBounds: Object.freeze([189, 26, 846, 1513]),
    referenceNote: 'Adaptation fan-made du Synth Sniper d’Aliens: Fireteam Elite, comparée au sujet central droit du rendu groupé publié par AVP Central, source secondaire. Armure sombre, grand col, yeux rouges et mains pâles relus. L’arme levée suit la pose visible ; son modèle canon n’est pas certifié. Pose entière contrôlée sur blanc et damier ; tir simplifié, sans prétendre reproduire une balistique de sniper spécifique. Aucun jet acide, aucune certification 1:1.'
  }),
  Object.freeze({
    ...synthetic, id: 'pose-v94-afe-synth-heavy', profileId: 'pose-v94-afe-synth-heavy',
    basename: 'game-afe-synth-heavy', name: 'Synth Heavy',
    filename: 'game-afe-synth-heavy.png',
    path: '/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png',
    imageKey: 'openai-static-v94:game-afe-synth-heavy', sourceFacing: 1,
    renderWidth: 180, renderHeight: 270, bodyWidth: 76, bodyHeight: 134,
    pivot: Object.freeze({ x: .47, y: 1467 / 1536 }),
    health: 260, damage: 24, speed: .65, armor: 24, cost: 5,
    sha256: '71a4ad45aafe454e33eb7a90a9f4574b59c731fe9406f19a5382987a6a9d5a4d',
    alphaBounds: Object.freeze([84, 54, 1020, 1467]),
    referenceNote: 'Adaptation fan-made du Synth Heavy d’Aliens: Fireteam Elite, comparée au sujet droit du rendu groupé publié par AVP Central, source secondaire. Casque clair, col annulaire, plastron et jambes renforcés, canon à accents bleus relus ; mains gantées et détails restent interprétés. Pose entière contrôlée sur blanc et damier, sans recadrage : quatre pixels de marge droite. Tir simplifié sans missiles ajoutés. Aucun jet acide, aucune certification 1:1.'
  })
]);
