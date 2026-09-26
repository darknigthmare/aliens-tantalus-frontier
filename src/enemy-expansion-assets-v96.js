/**
 * Two reviewed native V96 images; research candidates never become enemies by
 * themselves. These are static fan-made adaptations, not animation coverage or
 * official model extractions. Historical V94/V95 definitions remain untouched.
 */
const common = Object.freeze({
  family: 'enemy', legacyCounterpartId: null, combatRole: 'melee',
  locomotion: 'ground', visualMode: 'static-pose', animationStatus: 'missing',
  specializedBehaviorStatus: 'not-implemented',
  identityStatus: 'reference-guided-static-pose', referenceStatus: 'reference-qualified',
  identityVerified: false, canonExact: false,
  provenance: 'openai-integrated-reference-guided', sourceProvenance: 'primary-licensed-manufacturer',
  assetVerificationStatus: 'sha256-dimensions-alpha-verified',
  reviewStatus: 'accepted-static-adaptation', geometryStatus: 'project-adaptation',
  visualRevision: 96, automaticEncounter: false,
  encounterWorldIds: Object.freeze([]), sourceFacing: 1,
  states: Object.freeze([])
});

export const ENEMY_EXPANSION_ASSETS_V96 = Object.freeze([
  Object.freeze({
    ...common, id: 'pose-v96-film-hammerpede', profileId: 'pose-v96-film-hammerpede',
    basename: 'hammerpede-prometheus', name: 'Hammerpede', biology: 'pathogen',
    group: 'Films', work: 'Prometheus (2012)', encounterGroup: 'engineer',
    filename: 'hammerpede-prometheus.png',
    path: '/assets/openai/sprites/static-enemy-v96/hammerpede-prometheus.png',
    imageKey: 'openai-static-v96:hammerpede-prometheus',
    sourceWidth: 1536, sourceHeight: 1024,
    renderWidth: 150, renderHeight: 100, bodyWidth: 34, bodyHeight: 64,
    pivot: Object.freeze({ x: .84, y: 975 / 1024 }),
    health: 58, damage: 13, speed: 1.35, armor: 2, cost: 2,
    sha256: '99a39588c02c9b907a3e4bcbbbfd899f179acf2ad2880958ce56e4498beaa6ed',
    alphaBounds: Object.freeze([22, 29, 1519, 975]),
    referenceUrls: Object.freeze([
      'https://store.necaonline.com/blogs/news/174242631-shipping-now-prometheus-series-2-figures-check-out-the-action-shots',
      'https://necaonline.com/wp-content/uploads/2013/02/51349_Series_2_Deacon.jpg'
    ]),
    referenceNote: 'Adaptation fan-made du Hammerpede de Prometheus, guidée par les deux accessoires pâles sans membres de la photographie fabricant NECA consultée visuellement. Ce n’est ni le Deacon présent sur la même photo, ni le Trilobite, ni le Snake Alien Kenner. Corps vermiforme, tête aplatie ouverte et absence de membres relus ; proportion de la collerette et surface restent interprétées. Pose native entière et alpha conservés sans modification ; collision, échelle et statistiques sont des réglages du projet. Sans parasitisme ni comportement de constriction simulés, sans animation dédiée, sans certification 1:1.'
  }),
  Object.freeze({
    ...common, id: 'pose-v96-kenner-mantis', profileId: 'pose-v96-kenner-mantis',
    basename: 'mantis-alien-neca', name: 'Mantis Alien', biology: 'xenomorph',
    group: 'Figurines', work: 'Aliens — Kenner / NECA Series 10', encounterGroup: 'engineered',
    filename: 'mantis-alien-neca.png',
    path: '/assets/openai/sprites/static-enemy-v96/mantis-alien-neca.png',
    imageKey: 'openai-static-v96:mantis-alien-neca',
    sourceWidth: 1226, sourceHeight: 1283,
    renderWidth: 218, renderHeight: 218 * 1283 / 1226, bodyWidth: 68, bodyHeight: 126,
    pivot: Object.freeze({ x: .51, y: 1271 / 1283 }),
    health: 195, damage: 25, speed: 1.2, armor: 12, cost: 4,
    sha256: 'd84bcb3069b7eb0119fb627a6f5aef5eb60da3478b3e18a9d254a4302a564ef7',
    alphaBounds: Object.freeze([14, 6, 1213, 1271]),
    referenceUrls: Object.freeze([
      'https://store.necaonline.com/blogs/news/shipping-this-week-aliens-series-10-freddy-s-revenge-1-4-scale-freddy-and-foam-space-jockey',
      'https://necaonline.com/2016/12/closer-look-aliens-series-10-kenner-tribute-action-figures/1200x-51619-mantis1/',
      'https://eadn-wc04-13179453.nxedge.io/wp-content/uploads/2016/12/1200x-51619-Mantis1-.jpg'
    ]),
    referenceNote: 'Adaptation fan-made du Mantis Alien Kenner Tribute NECA, comparée visuellement à Mantis1 : matière verte translucide, exosquelette gris argent, longue crête ajourée, deux avant-bras allongés dentelés, deux jambes et queue segmentée. Pose et détails sont interprétés, sans certification 1:1. Canvas natif complet conservé sans recadrage ; marge supérieure de six pixels au seuil alpha 16 et franges alpha très faibles au bord documentées. Identité de figurine/licence, pas caste de film ; groupe engineered et statistiques sont un placement de jeu non canonique, sans mécanique de saisie ni animation dédiée.'
  })
]);
