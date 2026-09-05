const PROJECT_ID = 'g-p-6a945bfa0d3c8191befd9a84068b90a4';
const VALID_STATUSES = new Set(['effective', 'partial', 'missing']);
const VALID_ACCESS_SURFACES = new Set(['hub']);

const freezeOperation = (operation) => Object.freeze({
  sourceProjectId: PROJECT_ID,
  canonExact: false,
  ...operation,
  requiredMechanics: Object.freeze([...(operation.requiredMechanics || [])]),
  evidence: Object.freeze([...(operation.evidence || [])])
});

export const SPECIAL_OPERATIONS_V67 = Object.freeze([
  freezeOperation({
    id: 'queen-mother-song', chatId: '6a99e9b5-a7fc-83eb-96bc-b53baa1b9cbe', chatTitle: 'Mission moteur queen',
    promisedTitle: 'LE CHANT DE LA REINE-MÈRE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 13,
    promiseSummary: 'Influence maternelle, trois chœurs, route royale, nursery et Reine-Mère multi-phase.',
    requiredMechanics: ['maternal-influence', 'three-choirs', 'royal-route', 'queen-mother-boss'], evidence: []
  }),
  freezeOperation({
    id: 'hive-world', chatId: '6a99eb43-9ebc-83eb-868c-1c56f918e531', chatTitle: 'Mission Godzilla Planète',
    promisedTitle: 'LV-XENO : LA RUCHE-MONDE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 15,
    promiseSummary: 'Approche orbitale, biomes vivants, organes internes, indice d’alerte et Planet Queen.',
    requiredMechanics: ['living-world', 'organ-biomes', 'planet-alert', 'planet-queen'], evidence: []
  }),
  freezeOperation({
    id: 'titan-equalizer', chatId: '6a99eaec-f4a4-83ed-a3ea-88db3c94413a', chatTitle: 'Mission contre Xenomorph Godzilla',
    promisedTitle: 'TALOS CONTRE LE TITAN', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 14,
    promiseSummary: 'Combat à échelle égale dans un P-9000/TALOS avec chaleur, énergie, corrosion et arène destructible.',
    requiredMechanics: ['mega-loader', 'localized-damage', 'heat-energy-corrosion', 'destructible-arena'], evidence: []
  }),
  freezeOperation({
    id: 'narrative-collectables', chatId: '6a99e94f-ef7c-83ed-a229-7d42b85b6222', chatTitle: 'Étendre la liste des collectables',
    promisedTitle: 'ARCHIVES NARRATIVES ÉTENDUES', kind: 'system', implementationStatus: 'partial', playable: true, productionOrder: 2,
    campaignId: 'special-narrative-qz17',
    campaign: Object.freeze({
      pairId: null, mode: 'FRONTIER', worldId: 'world-05-lethe', objective: 'investigate the ghost cargo',
      year: 2204, canon: 'project-continuity', routes: 4, templateId: 'ship-interior-vertical'
    }),
    promiseSummary: 'PDA, e-mails, audio, vidéo, boîtes noires, preuves physiques, contradictions et chaînes à embranchements.',
    requiredMechanics: ['persistent-collectables', 'multi-entry-chains', 'conflicting-sources', 'environmental-investigation'],
    evidence: [
      'src/narrative-collectables-v68.js',
      'src/narrative-collectables-runtime-v68.js',
      'src/narrative-archives-ui-v68.js',
      'src/narrative-collectables-visuals-v68.js',
      'tests/narrative-collectables-runtime-v68.test.mjs',
      'docs/V68_QZ17_ART_QA.md'
    ]
  }),
  freezeOperation({
    id: 'alpha-bravo-coop', chatId: '6a99e7de-0d14-83eb-9074-0cc76c50989b', chatTitle: 'Étendre coopération équipe Marines',
    promisedTitle: 'DOCTRINE ALPHA / BRAVO', kind: 'system', implementationStatus: 'partial', playable: true, productionOrder: 3,
    campaignId: 'special-alpha-bravo-doctrine',
    campaign: Object.freeze({
      pairId: null, mode: 'FRONTIER', worldId: 'world-05-lethe', objective: 'defend the colony',
      year: 2204, canon: 'project-continuity', routes: 5, templateId: 'colony-multiroute', minimumCrew: 4
    }),
    promiseSummary: 'Deux groupes, ordres, pings, binômes, tâches réservées, blessures, stress et cohésion.',
    requiredMechanics: ['fireteams', 'orders-and-pings', 'task-reservation', 'dynamic-cohesion'],
    evidence: [
      'src/alpha-bravo-coop-v69.js',
      'src/alpha-bravo-ui-v69.js',
      'src/alpha-bravo-visuals-v69.js',
      'tests/alpha-bravo-coop-v69.test.mjs',
      'tests/alpha-bravo-save-v69.test.mjs',
      'tests/alpha-bravo-ui-v69.test.mjs',
      'tests/alpha-bravo-art-v69.test.mjs',
      'docs/V69_ALPHA_BRAVO_ART_QA.md'
    ]
  }),
  freezeOperation({
    id: 'eloise-uncrowned-queen', chatId: '6a99b3d2-0e58-83eb-abba-d955b5d73b2d', chatTitle: 'Écrire une mission xénomorphe',
    promisedTitle: 'ÉLOÏSE : LA REINE SANS COURONNE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 11,
    promiseSummary: 'Synthétique hybride contrôlant une ruche, chœur, pylônes, carte mutable et fins ramifiées.',
    requiredMechanics: ['hive-consciousness', 'choir-meter', 'mutable-map', 'branching-endings'], evidence: []
  }),
  freezeOperation({
    id: 'pangaea-second-extinction', chatId: '6a99b4e6-45f4-83eb-bdae-5b3ad2e57833', chatTitle: 'Créer mission préhistorique',
    promisedTitle: 'PANGAEA : LA SECONDE EXTINCTION', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 16,
    promiseSummary: 'Écosystème préhistorique, dinosaures, infection dynamique et castes Sauria-XX121.',
    requiredMechanics: ['ecosystem-simulation', 'dinosaurs', 'dynamic-infection', 'sauria-castes'], evidence: []
  }),
  freezeOperation({
    id: 'atax-false-queen', chatId: '6a9981b6-ec38-83eb-bcaf-eea1783e448f', chatTitle: 'Créer mission Alien Queen',
    promisedTitle: 'A.T.A.X.-Q : LA FAUSSE REINE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 12,
    promiseSummary: 'Armure-reine, recrutement de castes, ordres Griffe/Ombre/Rempart et assaut de ruche.',
    requiredMechanics: ['queen-armor', 'caste-recruitment', 'hive-orders', 'direct-caste-control'], evidence: []
  }),
  freezeOperation({
    id: 'alien-survival-systems', chatId: '6a999dca-3efc-83eb-907a-623f11cf2388', chatTitle: 'Proposer mécaniques HUD Alien',
    promisedTitle: 'SYSTÈMES DE SURVIE ALIEN', kind: 'system', implementationStatus: 'effective', playable: true, productionOrder: 4,
    campaignId: 'special-alien-survival-systems',
    campaign: Object.freeze({
      pairId: null, mode: 'SURVIVAL', worldId: 'world-05-lethe', objective: 'escape the quarantine',
      year: 2204, canon: 'project-continuity', routes: 3, templateId: 'ship-interior-vertical'
    }),
    promiseSummary: 'HUD diégétique, auto-destruction, soudure, pression, sas, énergie, CCTV et acide persistant.',
    requiredMechanics: ['self-destruct', 'weldable-doors', 'room-pressure', 'power-routing', 'security-cameras', 'persistent-acid'],
    evidence: [
      'src/alien-survival-systems-v70.js',
      'src/alien-survival-runtime-v70.js',
      'src/alien-survival-ui-v70.js',
      'src/alien-survival-visuals-v70.js',
      'tests/alien-survival-systems-v70.test.mjs',
      'tests/alien-survival-runtime-v70.test.mjs',
      'tests/alien-survival-save-v70.test.mjs',
      'tests/alien-survival-ui-v70.test.mjs',
      'tests/alien-survival-art-v70.test.mjs',
      'docs/V70_ALIEN_SURVIVAL_ART_QA.md'
    ]
  }),
  freezeOperation({
    id: 'jeri-false-son', chatId: '6a999847-94b4-83ed-af17-c3b6b57da810', chatTitle: 'Mission avec Jerry synthétique',
    promisedTitle: 'JERI : LE FAUX FILS', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 10,
    promiseSummary: 'Infiltration de ruche par profils phéromonaux, inspections de castes et boss SAINT.',
    requiredMechanics: ['pheromone-profiles', 'caste-inspections', 'segmented-synthetic', 'saint-boss'], evidence: []
  }),
  freezeOperation({
    id: 'black-abyss', chatId: '6a99988b-90c4-83ed-a4f6-0462baed528f', chatTitle: 'Mission sous marine complète',
    promisedTitle: 'OPÉRATION ABYSSE NOIR', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 8,
    promiseSummary: 'Nage libre, scaphandre HADAL, sous-marin MANTA-6, arsenal et boss aquatiques.',
    requiredMechanics: ['free-swim', 'hadal-suit', 'manta-submersible', 'aquatic-bosses'],
    evidence: ['src/game-final-runtime.js:46', 'src/game-final-runtime.js:531']
  }),
  freezeOperation({
    id: 'tantalus-hub-expansion', chatId: '6a98fa78-6db8-83eb-bc72-cf41bc6833b1', chatTitle: 'Audit du level hub USS Tentalus',
    promisedTitle: 'USS TANTALUS — HUB COMMERCIAL', kind: 'system', implementationStatus: 'partial', playable: true, accessSurface: 'hub', productionOrder: 5,
    promiseSummary: 'Cohérence d’échelle et perspective, densité par salle et dix annexes physiques supplémentaires.',
    requiredMechanics: ['ten-annexes', 'room-scale-pass', 'physical-upgrades', 'commercial-prop-density'],
    remainingMechanics: ['independent-prop-bitmaps', 'dedicated-annex-npcs', 'physical-training-exercises', 'physical-archive-replay', 'cctv-lockdown-controls'],
    evidence: [
      'src/tantalus-hub-expansion-v71.js',
      'src/hub-v71-runtime.js',
      'tests/tantalus-hub-expansion-v71.test.mjs',
      'tests/hub-v71-art.test.mjs',
      'assets/openai/hub/annexes/v71/hub-commercial-art-report-v71.json',
      'docs/V71_HUB_COMMERCIAL_AUDIT.md'
    ]
  }),
  freezeOperation({
    id: 'bioforge', chatId: '6a98c871-61ac-83ed-be5c-600c473690e2', chatTitle: 'Idée spawn ennemis Tentalus',
    promisedTitle: 'BIOFORGE', kind: 'system', implementationStatus: 'missing', playable: false, productionOrder: 6,
    promiseSummary: 'Zone physique isolée, sélection ennemi/quantité, impression, confinement et progression séparée.',
    requiredMechanics: ['physical-bioforge-room', 'spawn-printer', 'quantity-selection', 'containment-loop'], evidence: []
  }),
  freezeOperation({
    id: 'protocol-z110', chatId: '6a98dfeb-7284-83eb-a015-bf964b8b1229', chatTitle: 'Mission extermination Power Loader',
    promisedTitle: 'PROTOCOLE Z-110', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 9,
    promiseSummary: 'Quatre Power Loaders de nouvelle génération, choix de ruche et Reine de siège Morrigan.',
    requiredMechanics: ['z110-variants', 'hydraulic-thermal-damage', 'hive-choice', 'morrigan-boss'], evidence: []
  }),
  freezeOperation({
    id: 'mire-archive-001', chatId: '6a98e050-1748-83eb-8c5b-a7dd4bc1ac26', chatTitle: 'Mission Alien 1',
    promisedTitle: 'MIRE ARCHIVE 001 : NOSTROMO', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 7,
    promiseSummary: 'Rejouer les événements du Nostromo, personnages dédiés, score de synchronisation et sauvegarde isolée.',
    requiredMechanics: ['historical-script', 'nostromo-cast', 'synchronization-score', 'isolated-save'],
    evidence: ['src/content-core-v50.js:60', 'src/campaign-consequences.js:54']
  }),
  freezeOperation({
    id: 'broodstorm', chatId: '6a98d47d-68f4-83eb-9ed3-4063af4e7496', chatTitle: 'Mission aérienne xéno',
    promisedTitle: 'BROODSTORM', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 17,
    promiseSummary: 'Dropship modulaire, escadrille alliée, escortes, bombardements et Flying Queen.',
    requiredMechanics: ['air-combat', 'allied-wing', 'escort-bombing', 'flying-queen'],
    evidence: ['src/game-final-runtime.js:44', 'src/game-final-runtime.js:528', 'src/mission-insertion-v62.js:119']
  }),
  freezeOperation({
    id: 'black-cocoon', chatId: '6a98e0e1-2b98-83eb-9cd4-e9772768b977', chatTitle: 'Mission extraction du Hive',
    promisedTitle: 'COCON NOIR', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 18,
    promiseSummary: 'Départ coconné et blessé, récupération de matériel, infiltration, fausse extraction et quarantaine.',
    requiredMechanics: ['cocoon-start', 'injured-stealth', 'gear-recovery', 'false-extraction'],
    evidence: ['src/enemy-ovomorph-cycle-v66.js:122', 'src/game-complete-core.js:24']
  }),
  freezeOperation({
    id: 'last-course-tantalus', chatId: '6a98d3ea-99ac-83ed-b765-6932483ddbe1', chatTitle: 'Mission APC contre Xenos',
    promisedTitle: 'LA DERNIÈRE COURSE DE TANTALUS', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 19,
    promiseSummary: 'Course APC ancrée à droite, voies, hordes continues, Crushers, poursuite de Reine et score.',
    requiredMechanics: ['lane-driving', 'continuous-horde', 'crusher-minibosses', 'queen-chase', 'score-mode'],
    evidence: ['src/game-v51-runtime.js:746', 'src/game-v51-runtime.js:1132', 'src/game-v51-runtime.js:1324']
  }),
  freezeOperation({
    id: 'cargo-brutal', chatId: '6a98dfcb-a2e4-83ed-b3c2-606a9384c6e4', chatTitle: 'Mission Power Loader',
    promisedTitle: 'CARGO BRUTAL', kind: 'mission', implementationStatus: 'effective', playable: true, productionOrder: 1,
    campaignId: 'special-cargo-brutal', issuedVehicleId: 'vehicle-007-p-5000-powered-work-loader',
    campaign: Object.freeze({
      pairId: null, mode: 'FRONTIER', worldId: 'world-05-lethe', objective: 'secure the power loader',
      year: 2204, canon: 'project-continuity', routes: 5, templateId: 'ship-interior-vertical'
    }),
    promiseSummary: 'Réactiver un P-5000, dégager la soute, escorter les survivants, porter un noyau et vaincre la Matriarche.',
    requiredMechanics: ['loader-reactivation', 'physical-obstacles', 'survivor-convoy', 'heavy-core-carry', 'cargo-matriarch'],
    evidence: [
      'src/cargo-brutal-runtime-v67.js',
      'src/cargo-brutal-visuals-v67.js',
      'tests/cargo-brutal-v67.test.mjs',
      'tests/cargo-brutal-art-v67.test.mjs',
      'docs/V67_CARGO_BRUTAL_ART_QA.md'
    ]
  })
]);

const BY_ID = new Map(SPECIAL_OPERATIONS_V67.map((operation) => [operation.id, operation]));
const BY_CHAT_ID = new Map(SPECIAL_OPERATIONS_V67.map((operation) => [operation.chatId, operation]));
const BY_CAMPAIGN_ID = new Map(SPECIAL_OPERATIONS_V67
  .filter((operation) => operation.campaignId && operation.campaign)
  .map((operation) => [operation.campaignId, operation]));

export const SPECIAL_OPERATION_COUNTS_V67 = Object.freeze({
  total: SPECIAL_OPERATIONS_V67.length,
  effective: SPECIAL_OPERATIONS_V67.filter((operation) => operation.implementationStatus === 'effective').length,
  partial: SPECIAL_OPERATIONS_V67.filter((operation) => operation.implementationStatus === 'partial').length,
  missing: SPECIAL_OPERATIONS_V67.filter((operation) => operation.implementationStatus === 'missing').length,
  playable: SPECIAL_OPERATIONS_V67.filter((operation) => operation.playable).length
});

export function getSpecialOperationV67(id) {
  return BY_ID.get(String(id || '').trim()) || null;
}

export function getSpecialOperationByChatIdV67(chatId) {
  return BY_CHAT_ID.get(String(chatId || '').trim()) || null;
}

export function getSpecialOperationByCampaignIdV67(campaignId) {
  return BY_CAMPAIGN_ID.get(String(campaignId || '').trim()) || null;
}

export function buildCampaignsWithSpecialOperationsV67(campaigns = []) {
  const additions = SPECIAL_OPERATIONS_V67
    .filter((operation) => operation.playable && operation.campaignId && operation.campaign)
    .map((operation) => Object.freeze({
      id: operation.campaignId,
      ...operation.campaign,
      name: operation.promisedTitle,
      source: 'Tantalus Special Operations',
      summary: operation.promiseSummary,
      specialOperationId: operation.id
  }));
  return Object.freeze([...campaigns, ...additions]);
}

export function validateSpecialOperationsV67(operations = SPECIAL_OPERATIONS_V67) {
  const failures = [];
  const unique = (key) => new Set(operations.map((operation) => operation[key])).size === operations.length;
  if (operations.length !== 19) failures.push(`operations: ${operations.length} != 19`);
  if (!unique('id')) failures.push('duplicate operation ids');
  if (!unique('chatId')) failures.push('duplicate ChatGPT conversation ids');
  if (!operations.every((operation) => VALID_STATUSES.has(operation.implementationStatus))) failures.push('invalid implementation status');
  if (!operations.every((operation) => Boolean(operation.campaignId) === Boolean(operation.campaign))) failures.push('incomplete campaign routing metadata');
  if (!operations.every((operation) => !operation.accessSurface || VALID_ACCESS_SURFACES.has(operation.accessSurface) && operation.playable)) failures.push('invalid playable access surface');
  if (!operations.every((operation) => !operation.playable || (
    operation.implementationStatus !== 'missing'
    && (Boolean(operation.campaignId && operation.campaign) || VALID_ACCESS_SURFACES.has(operation.accessSurface))
  ))) failures.push('playable work lot lacks an access route');
  if (!operations.every((operation) => operation.sourceProjectId === PROJECT_ID && operation.canonExact === false)) failures.push('source or canon disclosure missing');
  const productionOrders = operations.map((operation) => operation.productionOrder);
  if (new Set(productionOrders).size !== operations.length || productionOrders.some((order) => !Number.isInteger(order) || order < 1 || order > operations.length)) failures.push('invalid production order');
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures), counts: SPECIAL_OPERATION_COUNTS_V67 });
}
