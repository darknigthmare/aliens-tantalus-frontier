const VALID_STATUSES = new Set(['effective', 'partial', 'missing']);
const VALID_ACCESS_SURFACES = new Set(['hub']);

const freezeOperation = (operation) => Object.freeze({
  canonExact: false,
  ...operation,
  requiredMechanics: Object.freeze([...(operation.requiredMechanics || [])])
});

export const SPECIAL_OPERATIONS_V67 = Object.freeze([
  freezeOperation({
    id: 'queen-mother-song',
    promisedTitle: 'LE CHANT DE LA REINE-MÈRE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 13,
    promiseSummary: 'Influence maternelle, trois chœurs, route royale, nursery et Reine-Mère multi-phase.',
    requiredMechanics: ['maternal-influence', 'three-choirs', 'royal-route', 'queen-mother-boss']
  }),
  freezeOperation({
    id: 'hive-world',
    promisedTitle: 'LV-XENO : LA RUCHE-MONDE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 15,
    promiseSummary: 'Approche orbitale, biomes vivants, organes internes, indice d’alerte et Planet Queen.',
    requiredMechanics: ['living-world', 'organ-biomes', 'planet-alert', 'planet-queen']
  }),
  freezeOperation({
    id: 'titan-equalizer',
    promisedTitle: 'TALOS CONTRE LE TITAN', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 14,
    promiseSummary: 'Combat à échelle égale dans un P-9000/TALOS avec chaleur, énergie, corrosion et arène destructible.',
    requiredMechanics: ['mega-loader', 'localized-damage', 'heat-energy-corrosion', 'destructible-arena']
  }),
  freezeOperation({
    id: 'narrative-collectables',
    promisedTitle: 'ARCHIVES NARRATIVES ÉTENDUES', kind: 'system', implementationStatus: 'partial', playable: true, productionOrder: 2,
    campaignId: 'special-narrative-qz17',
    campaign: Object.freeze({
      pairId: null, mode: 'FRONTIER', worldId: 'world-05-lethe', objective: 'investigate the ghost cargo',
      year: 2204, canon: 'project-continuity', routes: 4, templateId: 'ship-interior-vertical'
    }),
    promiseSummary: 'PDA, e-mails, audio, vidéo, boîtes noires, preuves physiques, contradictions et chaînes à embranchements.',
    requiredMechanics: ['persistent-collectables', 'multi-entry-chains', 'conflicting-sources', 'environmental-investigation']
  }),
  freezeOperation({
    id: 'alpha-bravo-coop',
    promisedTitle: 'DOCTRINE ALPHA / BRAVO', kind: 'system', implementationStatus: 'partial', playable: true, productionOrder: 3,
    campaignId: 'special-alpha-bravo-doctrine',
    campaign: Object.freeze({
      pairId: null, mode: 'FRONTIER', worldId: 'world-05-lethe', objective: 'defend the colony',
      year: 2204, canon: 'project-continuity', routes: 5, templateId: 'colony-multiroute', minimumCrew: 4
    }),
    promiseSummary: 'Deux groupes, ordres, pings, binômes, tâches réservées, blessures, stress et cohésion.',
    requiredMechanics: ['fireteams', 'orders-and-pings', 'task-reservation', 'dynamic-cohesion']
  }),
  freezeOperation({
    id: 'eloise-uncrowned-queen',
    promisedTitle: 'ÉLOÏSE : LA REINE SANS COURONNE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 11,
    promiseSummary: 'Synthétique hybride contrôlant une ruche, chœur, pylônes, carte mutable et fins ramifiées.',
    requiredMechanics: ['hive-consciousness', 'choir-meter', 'mutable-map', 'branching-endings']
  }),
  freezeOperation({
    id: 'pangaea-second-extinction',
    promisedTitle: 'PANGAEA : LA SECONDE EXTINCTION', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 16,
    promiseSummary: 'Écosystème préhistorique, dinosaures, infection dynamique et castes Sauria-XX121.',
    requiredMechanics: ['ecosystem-simulation', 'dinosaurs', 'dynamic-infection', 'sauria-castes']
  }),
  freezeOperation({
    id: 'atax-false-queen',
    promisedTitle: 'A.T.A.X.-Q : LA FAUSSE REINE', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 12,
    promiseSummary: 'Armure-reine, recrutement de castes, ordres Griffe/Ombre/Rempart et assaut de ruche.',
    requiredMechanics: ['queen-armor', 'caste-recruitment', 'hive-orders', 'direct-caste-control']
  }),
  freezeOperation({
    id: 'alien-survival-systems',
    promisedTitle: 'SYSTÈMES DE SURVIE ALIEN', kind: 'system', implementationStatus: 'effective', playable: true, productionOrder: 4,
    campaignId: 'special-alien-survival-systems',
    campaign: Object.freeze({
      pairId: null, mode: 'SURVIVAL', worldId: 'world-05-lethe', objective: 'escape the quarantine',
      year: 2204, canon: 'project-continuity', routes: 3, templateId: 'ship-interior-vertical'
    }),
    promiseSummary: 'HUD diégétique, auto-destruction, soudure, pression, sas, énergie, CCTV et acide persistant.',
    requiredMechanics: ['self-destruct', 'weldable-doors', 'room-pressure', 'power-routing', 'security-cameras', 'persistent-acid']
  }),
  freezeOperation({
    id: 'jeri-false-son',
    promisedTitle: 'JERI : LE FAUX FILS', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 10,
    promiseSummary: 'Infiltration de ruche par profils phéromonaux, inspections de castes et boss SAINT.',
    requiredMechanics: ['pheromone-profiles', 'caste-inspections', 'segmented-synthetic', 'saint-boss']
  }),
  freezeOperation({
    id: 'black-abyss',
    promisedTitle: 'OPÉRATION ABYSSE NOIR', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 8,
    promiseSummary: 'Nage libre, scaphandre HADAL, sous-marin MANTA-6, arsenal et boss aquatiques.',
    requiredMechanics: ['free-swim', 'hadal-suit', 'manta-submersible', 'aquatic-bosses']
  }),
  freezeOperation({
    id: 'tantalus-hub-expansion',
    promisedTitle: 'USS TANTALUS — HUB COMMERCIAL', kind: 'system', implementationStatus: 'partial', playable: true, accessSurface: 'hub', productionOrder: 5,
    promiseSummary: 'Cohérence d’échelle et perspective, densité par salle et dix annexes physiques supplémentaires.',
    requiredMechanics: ['ten-annexes', 'room-scale-pass', 'physical-upgrades', 'commercial-prop-density'],
    remainingMechanics: ['independent-prop-bitmaps', 'dedicated-annex-npcs', 'physical-training-exercises', 'physical-archive-replay', 'cctv-lockdown-controls']
  }),
  freezeOperation({
    id: 'bioforge',
    promisedTitle: 'BIOFORGE', kind: 'system', implementationStatus: 'partial', playable: true, accessSurface: 'hub', productionOrder: 6,
    promiseSummary: 'Zone physique isolée, sélection ennemi/quantité, impression, confinement et progression séparée.',
    requiredMechanics: ['physical-bioforge-room', 'spawn-printer', 'quantity-selection', 'containment-loop'],
    remainingMechanics: ['full-enemy-roster', 'complete-dedicated-art-corpus']
  }),
  freezeOperation({
    id: 'protocol-z110',
    promisedTitle: 'PROTOCOLE Z-110', kind: 'mission', implementationStatus: 'missing', playable: false, productionOrder: 9,
    promiseSummary: 'Quatre Power Loaders de nouvelle génération, choix de ruche et Reine de siège Morrigan.',
    requiredMechanics: ['z110-variants', 'hydraulic-thermal-damage', 'hive-choice', 'morrigan-boss']
  }),
  freezeOperation({
    id: 'mire-archive-001',
    promisedTitle: 'MIRE ARCHIVE 001 : NOSTROMO', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 7,
    promiseSummary: 'Rejouer les événements du Nostromo, personnages dédiés, score de synchronisation et sauvegarde isolée.',
    requiredMechanics: ['historical-script', 'nostromo-cast', 'synchronization-score', 'isolated-save']
  }),
  freezeOperation({
    id: 'broodstorm',
    promisedTitle: 'BROODSTORM', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 17,
    promiseSummary: 'Dropship modulaire, escadrille alliée, escortes, bombardements et Flying Queen.',
    requiredMechanics: ['air-combat', 'allied-wing', 'escort-bombing', 'flying-queen']
  }),
  freezeOperation({
    id: 'black-cocoon',
    promisedTitle: 'COCON NOIR', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 18,
    promiseSummary: 'Départ coconné et blessé, récupération de matériel, infiltration, fausse extraction et quarantaine.',
    requiredMechanics: ['cocoon-start', 'injured-stealth', 'gear-recovery', 'false-extraction']
  }),
  freezeOperation({
    id: 'last-course-tantalus',
    promisedTitle: 'LA DERNIÈRE COURSE DE TANTALUS', kind: 'mission', implementationStatus: 'partial', playable: false, productionOrder: 19,
    promiseSummary: 'Course APC ancrée à droite, voies, hordes continues, Crushers, poursuite de Reine et score.',
    requiredMechanics: ['lane-driving', 'continuous-horde', 'crusher-minibosses', 'queen-chase', 'score-mode']
  }),
  freezeOperation({
    id: 'cargo-brutal',
    promisedTitle: 'CARGO BRUTAL', kind: 'mission', implementationStatus: 'effective', playable: true, productionOrder: 1,
    campaignId: 'special-cargo-brutal', issuedVehicleId: 'vehicle-007-p-5000-powered-work-loader',
    campaign: Object.freeze({
      pairId: null, mode: 'FRONTIER', worldId: 'world-05-lethe', objective: 'secure the power loader',
      year: 2204, canon: 'project-continuity', routes: 5, templateId: 'ship-interior-vertical'
    }),
    promiseSummary: 'Réactiver un P-5000, dégager la soute, escorter les survivants, porter un noyau et vaincre la Matriarche.',
    requiredMechanics: ['loader-reactivation', 'physical-obstacles', 'survivor-convoy', 'heavy-core-carry', 'cargo-matriarch']
  })
]);

const BY_ID = new Map(SPECIAL_OPERATIONS_V67.map((operation) => [operation.id, operation]));
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

// Kept as a compatibility export; private lookup keys are not shipped.
export function getSpecialOperationByChatIdV67() {
  return null;
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
  if (!operations.every((operation) => VALID_STATUSES.has(operation.implementationStatus))) failures.push('invalid implementation status');
  if (!operations.every((operation) => Boolean(operation.campaignId) === Boolean(operation.campaign))) failures.push('incomplete campaign routing metadata');
  if (!operations.every((operation) => !operation.accessSurface || VALID_ACCESS_SURFACES.has(operation.accessSurface) && operation.playable)) failures.push('invalid playable access surface');
  if (!operations.every((operation) => !operation.playable || (
    operation.implementationStatus !== 'missing'
    && (Boolean(operation.campaignId && operation.campaign) || VALID_ACCESS_SURFACES.has(operation.accessSurface))
  ))) failures.push('playable work lot lacks an access route');
  if (!operations.every((operation) => operation.canonExact === false)) failures.push('canon disclosure missing');
  const productionOrders = operations.map((operation) => operation.productionOrder);
  if (new Set(productionOrders).size !== operations.length || productionOrders.some((order) => !Number.isInteger(order) || order < 1 || order > operations.length)) failures.push('invalid production order');
  return Object.freeze({ ok: failures.length === 0, failures: Object.freeze(failures), counts: SPECIAL_OPERATION_COUNTS_V67 });
}
