import { HUB_ANNEX_ALPHA_BOUNDS_V72, fitHubBitmapV72 } from './hub-annex-art-layout-v72.js';

export const HUB_COMMERCIAL_SCHEMA_V71 = 71;
export const HUB_COMMERCIAL_OPERATION_ID_V71 = 'tantalus-hub-expansion';
export const HUB_COMMERCIAL_PRODUCTION_GAPS_V71 = Object.freeze([
  'independent-prop-bitmaps', 'dedicated-annex-npcs', 'physical-training-exercises',
  'physical-archive-replay', 'cctv-lockdown-controls'
]);

export const HUB_COMMERCIAL_REQUIRED_MECHANICS_V71 = Object.freeze([
  'ten-annexes',
  'room-scale-pass',
  'physical-upgrades',
  'commercial-prop-density'
]);

export const HUB_ANNEX_WORLD_V71 = Object.freeze({
  width: 1920,
  height: 720,
  floorY: 624,
  floorHeight: 96,
  playerClearanceWidth: 112,
  playerClearanceHeight: 192
});

export const HUB_COMMERCIAL_CRITERIA_V71 = Object.freeze({
  scale: Object.freeze({
    logicalWidth: HUB_ANNEX_WORLD_V71.width,
    logicalHeight: HUB_ANNEX_WORLD_V71.height,
    floorY: HUB_ANNEX_WORLD_V71.floorY,
    minimumWalkableWidth: 1536,
    minimumCeilingHeight: 432,
    minimumEntranceClearance: HUB_ANNEX_WORLD_V71.playerClearanceWidth,
    requiredPerspectiveLayers: 5
  }),
  density: Object.freeze({
    minimumProps: 6,
    maximumProps: 12,
    minimumColliders: 3,
    maximumColliderCoverageRatio: 0.32,
    requiredInteractiveStations: 1
  })
});

const BASE_DECKS = Object.freeze([
  Object.freeze({ id: 'command', rooms: Object.freeze(['bridge', 'briefing', 'combat-information', 'cryo-bay']) }),
  Object.freeze({ id: 'habitat', rooms: Object.freeze(['crew-quarters', 'mess', 'medical', 'science-lab']) }),
  Object.freeze({ id: 'industrial', rooms: Object.freeze(['quarantine', 'armory', 'workshop', 'vehicle-bay']) }),
  Object.freeze({ id: 'engineering', rooms: Object.freeze(['dropship-hangar', 'reactor', 'life-support', 'sensor-array']) })
]);

export const HUB_BASE_ROOMS_V71 = Object.freeze(BASE_DECKS.flatMap((deck, deckIndex) => (
  deck.rooms.map((id, roomIndex) => Object.freeze({ id, deckId: deck.id, deckIndex, roomIndex }))
)));

const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9:-]{0,95}$/;
const MAX_COUNTER = 999999;
const MAX_TIMESTAMP = 1000000000;

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeDeep(child);
  return value;
}

const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const asList = (value) => Array.isArray(value) ? value : [];
const clone = (value) => JSON.parse(JSON.stringify(value));

const integer = (value, minimum, maximum, fallback = minimum) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(numeric)));
};

const identifier = (value, fallback = '') => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return IDENTIFIER_PATTERN.test(normalized) ? normalized : fallback;
};

function makeBounds(id, x, y, w, h, role, extra = {}) {
  return { id, x, y, w, h, role, ...extra };
}

function makeAnnex({
  id,
  name,
  shortName,
  parentDeck,
  parentRoomId,
  entranceSide,
  stationLabel,
  stationAction,
  stationDescription,
  upgradeId,
  stationX,
  scope = 'physical-annex',
  deferredFeatures = [],
  capabilities = [],
  normalHubCreaturesVisible = null,
  isolatedLevelTarget = null
}) {
  const westEntrance = entranceSide === 'west';
  const entranceLocalX = westEntrance ? 144 : HUB_ANNEX_WORLD_V71.width - 144;
  const catwalkX = westEntrance ? 760 : 740;
  const ladderX = westEntrance ? catwalkX + 72 : catwalkX + 348;
  const alphaBounds = HUB_ANNEX_ALPHA_BOUNDS_V72[id];
  const stationBody = fitHubBitmapV72(alphaBounds.prop, { x: stationX, y: 442, w: 276, h: 182 });
  const station = {
    id: `${id}-station`,
    label: stationLabel,
    action: stationAction,
    description: stationDescription,
    persistent: true,
    singleStation: true,
    upgradeId,
    capabilities,
    bounds: makeBounds(`${id}-station-bounds`, stationBody.x, stationBody.y, stationBody.w, stationBody.h, 'station')
  };
  const basePath = `/assets/openai/hub/annexes/v71/${id}`;
  const props = [
    { ...station.bounds, id: `${id}-prop-console`, role: 'console', collidable: true, artRole: 'prop' },
    makeBounds(`${id}-prop-crate-a`, catwalkX + 160, 396, 79, 72, 'cargo', { collidable: true, asset: '/assets/openai/metroidvania/props/supply-crates.png' }),
    makeBounds(`${id}-prop-crate-b`, catwalkX + 270, 410, 64, 58, 'cargo', { collidable: true, asset: '/assets/openai/metroidvania/props/supply-crates.png' }),
    makeBounds(`${id}-prop-wall-bank`, westEntrance ? 1500 : 188, 274, 150, 132, 'wall-service', { collidable: false, asset: '/assets/openai/hub/props/sensor-console.png' }),
    makeBounds(`${id}-prop-ceiling`, 790, 42, 185, 138, 'ceiling-service', { collidable: false, asset: '/assets/openai/metroidvania/props/ceiling-cables.png' }),
    makeBounds(`${id}-prop-beacon`, westEntrance ? 352 : 1512, 280, 75, 66, 'navigation', { collidable: false, asset: '/assets/openai/hub/props/sensor-console.png' })
  ];
  const colliders = [
    { ...station.bounds, id: `${id}-collider-station` },
    ...props.filter((prop) => prop.role === 'cargo' && prop.collidable).map((prop) => ({ ...prop, id: `${prop.id}-collider` })),
    // These structural ribs remain overhead collision geometry. Their lower
    // edge deliberately leaves a 112 px standing lane above the floor so an
    // annex can never become a decorative cul-de-sac between its entrance
    // and its physical station.
    makeBounds(`${id}-collider-column-a`, westEntrance ? 474 : 1382, 344, 64, 168, 'structure'),
    makeBounds(`${id}-collider-column-b`, westEntrance ? 1718 : 138, 382, 58, 130, 'structure')
  ];
  const platforms = [
    makeBounds(`${id}-floor`, 0, HUB_ANNEX_WORLD_V71.floorY, HUB_ANNEX_WORLD_V71.width, HUB_ANNEX_WORLD_V71.floorHeight, 'floor'),
    makeBounds(`${id}-catwalk`, catwalkX, 468, 420, 24, 'catwalk')
  ];
  return freezeDeep({
    id,
    name,
    shortName,
    kind: 'physical-annex',
    parentDeck,
    parentRoomId,
    entranceSide,
    entranceLocalX,
    entrance: {
      id: `${id}-annex-door`,
      x: entranceLocalX,
      y: HUB_ANNEX_WORLD_V71.floorY - 192,
      w: Math.round(192 * (alphaBounds.door[2] - alphaBounds.door[0]) / (alphaBounds.door[3] - alphaBounds.door[1])),
      h: 192,
      bidirectional: true
    },
    world: HUB_ANNEX_WORLD_V71,
    station,
    action: stationAction,
    description: stationDescription,
    scope,
    deferredFeatures,
    normalHubCreaturesVisible,
    isolatedLevelTarget,
    platforms,
    ladders: [makeBounds(`${id}-ladder`, ladderX, 468, 44, 156, 'ladder', { top: 468, bottom: 624 })],
    colliders,
    props,
    art: {
      alphaBounds,
      basePath,
      far: `${basePath}/far.webp`,
      mid: `${basePath}/mid.webp`,
      foreground: `${basePath}/foreground.webp`,
      prop: `${basePath}/prop.webp`,
      door: `${basePath}/door.webp`
    },
    criteria: HUB_COMMERCIAL_CRITERIA_V71
  });
}

export const HUB_ANNEXES_V71 = Object.freeze([
  makeAnnex({
    id: 'arrival-airlock',
    name: 'Sas d’arrivée',
    shortName: 'SAS ARRIVÉE',
    parentDeck: 'engineering',
    parentRoomId: 'dropship-hangar',
    entranceSide: 'east',
    stationLabel: 'Console de contrôle du sas',
    stationAction: 'service:arrival-airlock',
    stationDescription: 'Gérer le retour de mission, la pressurisation et le contrôle biologique du sas d’arrivée.',
    upgradeId: 'arrival-airlock-seal-calibration',
    stationX: 392,
    capabilities: ['mission-return', 'pressurization', 'biological-control']
  }),
  makeAnnex({
    id: 'logistics',
    name: 'Soute / Logistique',
    shortName: 'SOUTE · LOGISTIQUE',
    parentDeck: 'industrial',
    parentRoomId: 'vehicle-bay',
    entranceSide: 'west',
    stationLabel: 'Terminal logistique',
    stationAction: 'service:logistics',
    stationDescription: 'Gérer palettes, carburant, ressources et alertes de pénurie.',
    upgradeId: 'logistics-routing-calibration',
    stationX: 1286,
    capabilities: ['pallets', 'fuel', 'resources', 'shortages']
  }),
  makeAnnex({
    id: 'mire-archives',
    name: 'Archives MIRE / Palimpsest',
    shortName: 'ARCHIVES · PALIMPSEST',
    parentDeck: 'command',
    parentRoomId: 'briefing',
    entranceSide: 'east',
    stationLabel: 'Lecteur d’archives MIRE',
    stationAction: 'service:mire-archives',
    stationDescription: 'Indexer les preuves découvertes, les médias consultés et les bilans de mission.',
    upgradeId: 'mire-archive-index',
    stationX: 386,
    capabilities: ['bestiary', 'reports', 'historical-replays']
  }),
  makeAnnex({
    id: 'synthetic-bay',
    name: 'Baie synthétique',
    shortName: 'BAIE SYNTHÉTIQUE',
    parentDeck: 'habitat',
    parentRoomId: 'science-lab',
    entranceSide: 'west',
    stationLabel: 'Banc de diagnostic synthétique',
    stationAction: 'service:synthetic-bay',
    stationDescription: 'Recharger, diagnostiquer et réparer les unités synthétiques.',
    upgradeId: 'synthetic-bay-diagnostics',
    stationX: 1260,
    capabilities: ['synthetic-recharge', 'synthetic-diagnostics', 'synthetic-repair']
  }),
  makeAnnex({
    id: 'cctv',
    name: 'Sécurité / CCTV',
    shortName: 'SÉCURITÉ · CCTV',
    parentDeck: 'command',
    parentRoomId: 'combat-information',
    entranceSide: 'west',
    stationLabel: 'Matrice CCTV',
    stationAction: 'service:cctv',
    stationDescription: 'Effectuer un balayage de sécurité et enregistrer les indices capteurs.',
    upgradeId: 'cctv-network-calibration',
    stationX: 1294,
    capabilities: ['cameras', 'lockdown', 'access-history', 'airlock-control']
  }),
  makeAnnex({
    id: 'proving-ground',
    name: 'Proving Ground / Terrain d’essai',
    shortName: 'PROVING GROUND',
    parentDeck: 'industrial',
    parentRoomId: 'armory',
    entranceSide: 'east',
    stationLabel: 'Console de sécurité du terrain',
    stationAction: 'service:proving-ground',
    stationDescription: 'Préparer un soutien tactique pour la prochaine opération. Exercices de tir et P-5000 à produire.',
    upgradeId: 'proving-ground-safety-calibration',
    stationX: 378,
    capabilities: ['firing-range', 'power-loader', 'advanced-tutorials']
  }),
  makeAnnex({
    id: 'morgue',
    name: 'Morgue / Autopsie',
    shortName: 'MORGUE · AUTOPSIE',
    parentDeck: 'habitat',
    parentRoomId: 'medical',
    entranceSide: 'east',
    stationLabel: 'Registre médico-légal',
    stationAction: 'service:morgue',
    stationDescription: 'Consigner les pertes, preuves biologiques et analyses post-mortem.',
    upgradeId: 'morgue-forensic-index',
    stationX: 402,
    capabilities: ['casualty-records', 'biological-evidence', 'post-mortem-analysis']
  }),
  makeAnnex({
    id: 'escape-pods',
    name: 'Capsules de sauvetage',
    shortName: 'CAPSULES DE SAUVETAGE',
    parentDeck: 'command',
    parentRoomId: 'cryo-bay',
    entranceSide: 'west',
    stationLabel: 'Contrôle des capsules',
    stationAction: 'service:escape-pods',
    stationDescription: 'Armer une évacuation de secours à usage unique en cas de crise perdue.',
    upgradeId: 'pod-annex-readiness',
    stationX: 1268,
    scope: 'escape-and-ship-destruction-scenarios',
    capabilities: ['evacuation', 'ship-destruction-scenarios']
  }),
  makeAnnex({
    id: 'durandal',
    name: 'Noyau DURANDAL Ω',
    shortName: 'DURANDAL Ω',
    parentDeck: 'industrial',
    parentRoomId: 'workshop',
    entranceSide: 'west',
    stationLabel: 'Interface du noyau DURANDAL',
    stationAction: 'service:durandal-vault',
    stationDescription: 'Accéder à l’IA du bord et à ses fonctions de guerre électronique.',
    upgradeId: 'durandal-vault-service',
    stationX: 1282,
    scope: 'ship-ai-and-electronic-warfare-core',
    capabilities: ['ship-ai', 'electronic-warfare']
  }),
  makeAnnex({
    id: 'bioforge',
    name: 'Accès BIOFORGE isolé',
    shortName: 'ACCÈS BIOFORGE',
    parentDeck: 'industrial',
    parentRoomId: 'quarantine',
    entranceSide: 'east',
    stationLabel: 'Contrôle du sas BIOFORGE',
    stationAction: 'service:bioforge-isolated-access',
    stationDescription: 'Contrôler le sas vers le niveau expérimental séparé, sans exposer de créature dans le hub.',
    upgradeId: 'bioforge-containment-integrity',
    stationX: 390,
    scope: 'isolated-access-to-separate-experimental-level',
    deferredFeatures: [],
    capabilities: [
      'isolated-airlock',
      'containment-control',
      'enemy-selection',
      'quantity-selection',
      'spawn-printing',
      'separate-progression'
    ],
    normalHubCreaturesVisible: false,
    isolatedLevelTarget: 'bioforge-experimental-level'
  })
]);

export const HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71 = Object.freeze(
  HUB_ANNEXES_V71.map((annex) => annex.station.upgradeId)
);

export const HUB_ANNEX_BY_ID_V71 = freezeDeep(Object.fromEntries(
  HUB_ANNEXES_V71.map((annex) => [annex.id, annex])
));

function makeEdge(id, kind, from, to, extra = {}) {
  return freezeDeep({
    id,
    kind,
    from,
    to,
    bidirectional: true,
    destinations: { [from]: to, [to]: from },
    ...extra
  });
}

export function buildHubCommercialGraphV71() {
  const nodes = [
    ...HUB_BASE_ROOMS_V71.map((room) => ({ ...room, kind: 'base-room' })),
    ...HUB_ANNEXES_V71.map((annex) => ({
      id: annex.id,
      kind: 'annex',
      deckId: annex.parentDeck,
      parentRoomId: annex.parentRoomId,
      world: { ...HUB_ANNEX_WORLD_V71 }
    }))
  ];
  const edges = [];
  for (const deck of BASE_DECKS) {
    for (let index = 0; index < deck.rooms.length - 1; index += 1) {
      edges.push(makeEdge(
        `${deck.id}:bulkhead:${index}-${index + 1}`,
        'bulkhead',
        deck.rooms[index],
        deck.rooms[index + 1],
        { deckId: deck.id }
      ));
    }
  }
  for (let deckIndex = 0; deckIndex < BASE_DECKS.length - 1; deckIndex += 1) {
    const fromDeck = BASE_DECKS[deckIndex];
    const toDeck = BASE_DECKS[deckIndex + 1];
    edges.push(makeEdge(
      `hub-midship-lift:${fromDeck.id}-${toDeck.id}`,
      'lift',
      fromDeck.rooms[1],
      toDeck.rooms[1],
      { shaftId: 'hub-midship-lift', fromDeck: fromDeck.id, toDeck: toDeck.id }
    ));
    edges.push(makeEdge(
      `hub-aft-lift:${fromDeck.id}-${toDeck.id}`,
      'lift',
      fromDeck.rooms[3],
      toDeck.rooms[3],
      { shaftId: 'hub-aft-lift', fromDeck: fromDeck.id, toDeck: toDeck.id }
    ));
  }
  for (const annex of HUB_ANNEXES_V71) {
    edges.push(makeEdge(
      `${annex.parentRoomId}:${annex.id}-branch`,
      'annex-door',
      annex.parentRoomId,
      annex.id,
      {
        branch: true,
        doorId: annex.entrance.id,
        deckId: annex.parentDeck,
        entranceLocalX: annex.entranceLocalX
      }
    ));
  }
  const adjacency = Object.fromEntries(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    adjacency[edge.from].push(edge.to);
    adjacency[edge.to].push(edge.from);
  }
  for (const neighbors of Object.values(adjacency)) neighbors.sort();
  return freezeDeep({
    schema: HUB_COMMERCIAL_SCHEMA_V71,
    operationId: HUB_COMMERCIAL_OPERATION_ID_V71,
    baseRoomCount: HUB_BASE_ROOMS_V71.length,
    annexRoomCount: HUB_ANNEXES_V71.length,
    nodes,
    edges,
    adjacency
  });
}

function inWorld(bounds) {
  return Boolean(bounds
    && Number.isFinite(bounds.x)
    && Number.isFinite(bounds.y)
    && Number.isFinite(bounds.w)
    && Number.isFinite(bounds.h)
    && bounds.w > 0
    && bounds.h > 0
    && bounds.x >= 0
    && bounds.y >= 0
    && bounds.x + bounds.w <= HUB_ANNEX_WORLD_V71.width
    && bounds.y + bounds.h <= HUB_ANNEX_WORLD_V71.height);
}

export function validateHubAnnexGeometryV71(annex) {
  const errors = [];
  if (!annex || HUB_ANNEX_BY_ID_V71[annex.id] !== annex) errors.push('unknown or non-canonical annex');
  if (annex?.world?.width !== 1920 || annex?.world?.height !== 720 || annex?.world?.floorY !== 624) {
    errors.push('annex world must be 1920x720 with floor at 624');
  }
  const floor = asList(annex?.platforms).find((platform) => platform.role === 'floor');
  if (!floor || floor.x !== 0 || floor.y !== 624 || floor.w !== 1920) errors.push('missing full-width physical floor');
  if (!asList(annex?.platforms).every(inWorld)) errors.push('platform outside annex world');
  if (!asList(annex?.colliders).every(inWorld)) errors.push('collider outside annex world');
  if (!asList(annex?.props).every(inWorld)) errors.push('prop outside annex world');
  const modularPropsValid = asList(annex?.props).every((prop) => (
    (typeof prop.asset === 'string' || typeof annex?.art?.[prop.artRole] === 'string')
    && (!prop.collidable || asList(annex?.colliders).some((collider) => (
      collider.x === prop.x && collider.y === prop.y && collider.w === prop.w && collider.h === prop.h
    )))
  ));
  if (!modularPropsValid) errors.push('prop bitmap or physical collider is missing');
  const stationClearOfCatwalks = asList(annex?.platforms).filter((platform) => platform.role === 'catwalk').every((platform) => {
    const station = annex?.station?.bounds;
    return station && (station.x + station.w <= platform.x || station.x >= platform.x + platform.w
      || station.y + station.h <= platform.y || station.y >= platform.y + platform.h);
  });
  if (!stationClearOfCatwalks) errors.push('station body intersects a catwalk');
  if (!inWorld(annex?.station?.bounds) || !annex?.station?.persistent) errors.push('missing persistent physical station');
  const entranceX = Number(annex?.entranceLocalX);
  const entranceSupported = floor && entranceX >= floor.x && entranceX <= floor.x + floor.w;
  if (!entranceSupported || entranceX < 112 || entranceX > 1808) errors.push('unsafe or unsupported annex entrance');
  const entranceClear = asList(annex?.colliders).every((collider) => (
    entranceX + 56 <= collider.x || entranceX - 56 >= collider.x + collider.w
  ));
  if (!entranceClear) errors.push('annex entrance is blocked by a collider');
  const standingLaneTop = Number(floor?.y) - 112;
  const floorLaneClear = asList(annex?.colliders)
    .filter((collider) => collider.role === 'structure')
    .every((collider) => collider.y + collider.h <= standingLaneTop);
  if (!floorLaneClear) errors.push('structural collider blocks the standing floor lane');
  const artPaths = annex?.art ? ['far', 'mid', 'foreground', 'prop', 'door'].map((key) => annex.art[key]) : [];
  if (artPaths.length !== 5 || new Set(artPaths).size !== 5 || artPaths.some((path) => (
    typeof path !== 'string' || !path.startsWith(`${annex?.art?.basePath}/`) || !path.endsWith('.webp')
  ))) errors.push('annex must expose five independent WebP art layers');
  const scale = annex?.criteria?.scale;
  const walkableWidth = asList(annex?.platforms)
    .filter((platform) => platform.role === 'floor')
    .reduce((total, platform) => total + platform.w, 0);
  const scaleValid = Boolean(
    scale?.logicalWidth === 1920
    && scale?.logicalHeight === 720
    && scale?.floorY === 624
    && walkableWidth >= scale.minimumWalkableWidth
    && 624 >= scale.minimumCeilingHeight
    && artPaths.length >= scale.requiredPerspectiveLayers
  );
  if (!scaleValid) errors.push('annex scale or perspective contract is incomplete');
  const density = annex?.criteria?.density;
  const colliderCoverage = asList(annex?.colliders).reduce((total, collider) => total + collider.w, 0) / 1920;
  const densityValid = Boolean(
    asList(annex?.props).length >= density?.minimumProps
    && asList(annex?.props).length <= density?.maximumProps
    && asList(annex?.colliders).length >= density?.minimumColliders
    && colliderCoverage <= density?.maximumColliderCoverageRatio
    && Number(Boolean(annex?.station)) === density?.requiredInteractiveStations
  );
  if (!densityValid) errors.push('annex commercial prop density is outside contract');
  return freezeDeep({
    valid: errors.length === 0,
    errors,
    annexId: annex?.id || null,
    worldWidth: annex?.world?.width || 0,
    worldHeight: annex?.world?.height || 0,
    propCount: asList(annex?.props).length,
    colliderCount: asList(annex?.colliders).length,
    perspectiveLayerCount: artPaths.length,
    floorLaneClear,
    modularPropsValid,
    stationClearOfCatwalks,
    colliderCoverageRatio: Number(colliderCoverage.toFixed(4)),
    scaleValid,
    densityValid
  });
}

export function validateHubCommercialGraphV71(graph = buildHubCommercialGraphV71()) {
  const errors = [];
  const nodes = asList(graph?.nodes);
  const edges = asList(graph?.edges);
  const nodeIds = nodes.map((node) => node.id);
  const nodeSet = new Set(nodeIds);
  if (nodes.length !== 26) errors.push(`expected 26 rooms, received ${nodes.length}`);
  if (graph?.baseRoomCount !== 16 || graph?.annexRoomCount !== 10) errors.push('graph room totals must be 16+10');
  if (nodeSet.size !== nodes.length) errors.push('duplicate hub room id');
  if (new Set(edges.map((edge) => edge.id)).size !== edges.length) errors.push('duplicate hub edge id');
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    if (!nodeSet.has(edge.from) || !nodeSet.has(edge.to) || edge.from === edge.to) {
      errors.push(`invalid destinations for ${edge.id}`);
      continue;
    }
    if (!edge.bidirectional
      || edge.destinations?.[edge.from] !== edge.to
      || edge.destinations?.[edge.to] !== edge.from) errors.push(`non-reciprocal edge ${edge.id}`);
    adjacency.get(edge.from).push(edge.to);
    adjacency.get(edge.to).push(edge.from);
  }
  for (const annex of HUB_ANNEXES_V71) {
    const neighbors = adjacency.get(annex.id) || [];
    if (neighbors.length !== 1 || neighbors[0] !== annex.parentRoomId) errors.push(`annex ${annex.id} is not a single reciprocal branch`);
    const edge = edges.find((candidate) => candidate.kind === 'annex-door' && (
      candidate.from === annex.id || candidate.to === annex.id
    ));
    if (!edge || edge.doorId !== annex.entrance.id || edge.deckId !== annex.parentDeck) {
      errors.push(`annex ${annex.id} has no coherent physical entrance`);
    }
  }
  const firstId = HUB_BASE_ROOMS_V71[0]?.id;
  const reached = new Set(firstId && nodeSet.has(firstId) ? [firstId] : []);
  const queue = [...reached];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      if (reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  if (reached.size !== nodes.length) errors.push(`hub graph disconnected: ${reached.size}/${nodes.length}`);
  return freezeDeep({
    valid: errors.length === 0,
    errors,
    roomCount: nodes.length,
    baseRoomCount: nodes.filter((node) => node.kind === 'base-room').length,
    annexRoomCount: nodes.filter((node) => node.kind === 'annex').length,
    connectionCount: edges.length,
    reciprocalConnectionCount: edges.filter((edge) => edge.bidirectional).length,
    reachableRoomCount: reached.size
  });
}

function freshState() {
  return {
    schema: HUB_COMMERCIAL_SCHEMA_V71,
    operationId: HUB_COMMERCIAL_OPERATION_ID_V71,
    revision: 0,
    completed: false,
    completedAt: null,
    activeAnnexId: null,
    annexPositionX: null,
    annexPositionY: null,
    annexClimbing: false,
    returnContext: null,
    lastAnnexId: null,
    visitedAnnexIds: [],
    activatedStationIds: [],
    physicalUpgradeIds: [],
    stationUses: Object.fromEntries(HUB_ANNEXES_V71.map((annex) => [annex.id, 0])),
    physicalUpgradeModuleIds: [...HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71],
    annexes: Object.fromEntries(HUB_ANNEXES_V71.map((annex) => [annex.id, {
      id: annex.id,
      visited: false,
      visitCount: 0,
      lastVisitedAt: null,
      station: {
        id: annex.station.id,
        activated: false,
        activationCount: 0,
        activatedAt: null,
        lastActivatedAt: null
      },
      upgrade: {
        id: annex.station.upgradeId,
        installed: false,
        installedAt: null
      }
    }]))
  };
}

function rebuildEvidence(state) {
  state.visitedAnnexIds = HUB_ANNEXES_V71
    .filter((annex) => state.annexes[annex.id].visited)
    .map((annex) => annex.id);
  state.activatedStationIds = HUB_ANNEXES_V71
    .filter((annex) => state.annexes[annex.id].station.activated)
    .map((annex) => annex.station.id);
  state.physicalUpgradeIds = HUB_ANNEXES_V71
    .filter((annex) => state.annexes[annex.id].upgrade.installed)
    .map((annex) => annex.station.upgradeId);
  state.stationUses = Object.fromEntries(HUB_ANNEXES_V71.map((annex) => [
    annex.id,
    state.annexes[annex.id].station.activationCount
  ]));
  if (!state.visitedAnnexIds.includes(state.lastAnnexId)) state.lastAnnexId = state.visitedAnnexIds.at(-1) || null;
}

export function createHubCommercialStateV71(rawState = null) {
  return isRecord(rawState) ? sanitizeHubCommercialStateV71(rawState) : freshState();
}

export function sanitizeHubCommercialStateV71(rawState) {
  const fallback = freshState();
  if (!isRecord(rawState)
    || Number(rawState.schema) !== HUB_COMMERCIAL_SCHEMA_V71
    || rawState.operationId !== HUB_COMMERCIAL_OPERATION_ID_V71) return fallback;
  fallback.revision = integer(rawState.revision, 0, MAX_COUNTER, 0);
  for (const annex of HUB_ANNEXES_V71) {
    const source = isRecord(rawState.annexes?.[annex.id]) ? rawState.annexes[annex.id] : {};
    const sourceStation = isRecord(source.station) ? source.station : {};
    const stationUseCount = integer(rawState.stationUses?.[annex.id], 0, MAX_COUNTER, 0);
    const activated = (Boolean(sourceStation.activated) || stationUseCount > 0)
      && (!sourceStation.id || sourceStation.id === annex.station.id);
    const visited = Boolean(source.visited) || activated;
    const visitCount = visited ? Math.max(1, integer(source.visitCount, 0, MAX_COUNTER, 1)) : 0;
    const activationCount = activated
      ? Math.max(1, integer(sourceStation.activationCount, 0, MAX_COUNTER, stationUseCount || 1), stationUseCount)
      : 0;
    const activatedAt = activated ? integer(sourceStation.activatedAt, 0, MAX_TIMESTAMP, 0) : null;
    const lastActivatedAt = activated
      ? Math.max(activatedAt, integer(sourceStation.lastActivatedAt, 0, MAX_TIMESTAMP, activatedAt))
      : null;
    fallback.annexes[annex.id] = {
      id: annex.id,
      visited,
      visitCount,
      lastVisitedAt: visited ? integer(source.lastVisitedAt, 0, MAX_TIMESTAMP, lastActivatedAt || 0) : null,
      station: {
        id: annex.station.id,
        activated,
        activationCount,
        activatedAt,
        lastActivatedAt
      },
      upgrade: {
        id: annex.station.upgradeId,
        installed: activated,
        installedAt: activated ? integer(source.upgrade?.installedAt, 0, MAX_TIMESTAMP, activatedAt) : null
      }
    };
  }
  const requestedModules = Array.isArray(rawState.physicalUpgradeModuleIds)
    ? rawState.physicalUpgradeModuleIds
    : HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71;
  fallback.physicalUpgradeModuleIds = HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71.filter((id) => requestedModules.includes(id));
  const activeAnnexId = identifier(rawState.activeAnnexId);
  fallback.activeAnnexId = HUB_ANNEX_BY_ID_V71[activeAnnexId] ? activeAnnexId : null;
  fallback.annexPositionX = fallback.activeAnnexId
    ? integer(rawState.annexPositionX, 56, HUB_ANNEX_WORLD_V71.width - 56, HUB_ANNEX_BY_ID_V71[fallback.activeAnnexId].entranceLocalX)
    : null;
  fallback.annexPositionY = fallback.activeAnnexId
    ? integer(rawState.annexPositionY, 0, HUB_ANNEX_WORLD_V71.floorY - 92, HUB_ANNEX_WORLD_V71.floorY - 92)
    : null;
  fallback.annexClimbing = Boolean(fallback.activeAnnexId && rawState.annexClimbing);
  if (fallback.activeAnnexId) {
    const activeAnnex = HUB_ANNEX_BY_ID_V71[fallback.activeAnnexId];
    const context = isRecord(rawState.returnContext) ? rawState.returnContext : {};
    fallback.returnContext = {
      deckId: activeAnnex.parentDeck,
      roomId: activeAnnex.parentRoomId,
      x: integer(context.x, 0, 5120, 0)
    };
  }
  fallback.lastAnnexId = identifier(rawState.lastAnnexId) || null;
  rebuildEvidence(fallback);
  const mechanics = getHubCommercialMechanicsV71(fallback);
  fallback.completed = HUB_COMMERCIAL_PRODUCTION_GAPS_V71.length === 0
    && HUB_COMMERCIAL_REQUIRED_MECHANICS_V71.every((mechanicId) => mechanics[mechanicId]);
  fallback.completedAt = fallback.completed && rawState.completedAt != null
    ? integer(rawState.completedAt, 0, MAX_TIMESTAMP, 0)
    : null;
  return fallback;
}

export function applyHubAnnexStationV71(state, annexId) {
  const canonicalId = identifier(annexId);
  const annex = HUB_ANNEX_BY_ID_V71[canonicalId];
  const next = sanitizeHubCommercialStateV71(state);
  if (!annex) return Object.freeze({ state: next, applied: false, station: null, effect: null });
  next.revision = Math.min(MAX_COUNTER, next.revision + 1);
  const timestamp = next.revision;
  const annexState = next.annexes[annex.id];
  annexState.visited = true;
  annexState.visitCount = Math.min(MAX_COUNTER, annexState.visitCount + 1);
  annexState.lastVisitedAt = timestamp;
  annexState.station.activationCount = Math.min(MAX_COUNTER, annexState.station.activationCount + 1);
  annexState.station.activated = true;
  annexState.station.activatedAt ??= timestamp;
  annexState.station.lastActivatedAt = timestamp;
  annexState.upgrade.installed = true;
  annexState.upgrade.installedAt ??= timestamp;
  if (!next.physicalUpgradeModuleIds.includes(annex.station.upgradeId)) {
    next.physicalUpgradeModuleIds.push(annex.station.upgradeId);
    next.physicalUpgradeModuleIds.sort((left, right) => (
      HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71.indexOf(left) - HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71.indexOf(right)
    ));
  }
  next.lastAnnexId = annex.id;
  rebuildEvidence(next);
  const mechanics = getHubCommercialMechanicsV71(next);
  next.completed = HUB_COMMERCIAL_PRODUCTION_GAPS_V71.length === 0
    && HUB_COMMERCIAL_REQUIRED_MECHANICS_V71.every((mechanicId) => mechanics[mechanicId]);
  return Object.freeze({
    state: next,
    applied: true,
    station: annex.station,
    effect: freezeDeep({
      type: 'physical-upgrade-confirmed',
      moduleId: annex.station.upgradeId,
      persistent: true,
      useCount: annexState.station.activationCount,
      capabilities: [...annex.station.capabilities]
    })
  });
}

function getHubCommercialMechanicsV71(state) {
  const geometry = HUB_ANNEXES_V71.map(validateHubAnnexGeometryV71);
  const graph = validateHubCommercialGraphV71();
  const upgradeModules = new Set(asList(state?.physicalUpgradeModuleIds));
  return {
    'ten-annexes': graph.valid && graph.annexRoomCount === 10,
    'room-scale-pass': geometry.every((result) => result.scaleValid),
    'physical-upgrades': HUB_PHYSICAL_UPGRADE_MODULE_IDS_V71.every((id) => upgradeModules.has(id)),
    'commercial-prop-density': geometry.every((result) => result.densityValid)
  };
}

export function validateHubCommercialCompletionV71(state) {
  const identityValid = Boolean(
    isRecord(state)
    && state.schema === HUB_COMMERCIAL_SCHEMA_V71
    && state.operationId === HUB_COMMERCIAL_OPERATION_ID_V71
  );
  const canonical = identityValid ? sanitizeHubCommercialStateV71(clone(state)) : freshState();
  const graph = validateHubCommercialGraphV71();
  const annexGeometry = HUB_ANNEXES_V71.map(validateHubAnnexGeometryV71);
  const structureValid = graph.valid && annexGeometry.every((result) => result.valid);
  const mechanics = getHubCommercialMechanicsV71(canonical);
  const completedMechanicIds = HUB_COMMERCIAL_REQUIRED_MECHANICS_V71.filter((id) => mechanics[id]);
  const missingMechanicIds = HUB_COMMERCIAL_REQUIRED_MECHANICS_V71.filter((id) => !mechanics[id]);
  const mechanicsComplete = missingMechanicIds.length === 0;
  const productionReady = HUB_COMMERCIAL_PRODUCTION_GAPS_V71.length === 0;
  const complete = identityValid && structureValid && mechanicsComplete && productionReady;
  return freezeDeep({
    valid: identityValid && structureValid && mechanicsComplete,
    complete,
    productionReady,
    productionGaps: [...HUB_COMMERCIAL_PRODUCTION_GAPS_V71],
    identityValid,
    structureValid,
    mechanicsComplete,
    mechanics,
    completedMechanicIds,
    missingMechanicIds,
    visitedAnnexIds: [...canonical.visitedAnnexIds],
    activatedStationIds: [...canonical.activatedStationIds],
    physicalUpgradeIds: [...canonical.physicalUpgradeIds],
    graph,
    annexGeometry
  });
}
