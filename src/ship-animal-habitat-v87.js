import { migrateShipAnimalStateV87 } from './ship-animal-state-v87.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value); Object.values(value).forEach(freeze);
  }
  return value;
};
const ROOT = '/assets/openai/ship-animals/v87';
export const SHIP_ANIMAL_PROP_RECTS_V87 = freeze({
  catBed: [32, 332, 237, 430], dogBed: [288, 302, 644, 430],
  water: [698, 350, 894, 432], food: [983, 339, 1174, 432],
  litter: [1255, 240, 1512, 429], scratch: [37, 547, 229, 890],
  toy: [288, 812, 582, 895], cabinet: [638, 617, 858, 880],
  counter: [902, 665, 1192, 884], carrier: [1215, 676, 1515, 886]
});
const prop = (id, kind, x, width, bottom = 624, habitatId = null) => {
  const rect = SHIP_ANIMAL_PROP_RECTS_V87[kind];
  const height = width * (rect[3] - rect[1]) / (rect[2] - rect[0]);
  return { id, kind, x, y: bottom - height, w: width, h: height,
    role: 'animal-equipment', source: rect, asset: ROOT + '/habitat-props.png',
    habitatId, collidable: false };
};
export const SHIP_ANIMAL_HABITATS_V87 = freeze([
  { id: 'moka-berth-v87', type: 'cat-berth', label: 'Coin de repos félin',
    designatedAnimalId: 'animal-moka', routineTargets: { food: 790, stroll: 560, foodFacing: 1 },
    capacity: 1, installX: 690, location: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 690, y: 624 },
    requirements: ['bed', 'water-station', 'feeding-station', 'hygiene-station', 'scratching-post'] },
  { id: 'brume-berth-v87', type: 'dog-berth', label: 'Logement canin',
    designatedAnimalId: 'animal-brume', routineTargets: { food: 1315, stroll: 1420, foodFacing: 1 },
    capacity: 1, installX: 1160, location: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1160, y: 624 },
    requirements: ['bed', 'water-station', 'feeding-station', 'hygiene-station', 'toy'] },
  { id: 'luciole-berth-v87', type: 'cat-berth', label: 'Second coin de repos félin',
    designatedAnimalId: 'animal-luciole', routineTargets: { food: 442, stroll: 394, foodFacing: 1 },
    capacity: 1, installX: 354, location: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 354, y: 624 },
    requirements: ['bed', 'water-station', 'feeding-station', 'hygiene-station', 'scratching-post', 'toy'] },
  { id: 'noisette-cafe-pen-v87', type: 'small-pen', label: 'Parc fermé pour deux lapins',
    designatedGroupId: 'noisette-cafe', compatibleFamilyIds: ['rabbit-domestic'], capacity: 2,
    navigationDomain: 'enclosure-volume', enclosureBounds: { x: 936, y: 550, w: 154, h: 62 },
    installX: 1013, location: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1013, y: 624 },
    receivingPoint: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1013, y: 624 },
    memberLocations: {
      'animal-noisette': { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 962, y: 612 },
      'animal-cafe': { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1064, y: 612 }
    },
    memberRoutineTargets: {
      'animal-noisette': { food: 988, stroll: 974, foodFacing: 1, minX: 958, maxX: 991 },
      'animal-cafe': { food: 1038, stroll: 1050, foodFacing: -1, minX: 1031, maxX: 1072 }
    },
    requirements: ['safe-enclosure', 'rest-hide', 'feeding-station', 'water-station', 'hygiene-station', 'enrichment'] },
  { id: 'tic-tac-pen-v87', type: 'small-pen', label: 'Parc fermé pour deux rats',
    designatedGroupId: 'tic-tac', compatibleFamilyIds: ['rat-domestic'], capacity: 2,
    navigationDomain: 'enclosure-volume', enclosureBounds: { x: 1462, y: 556, w: 120, h: 56 },
    installX: 1522, location: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1522, y: 624 },
    receivingPoint: { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1522, y: 624 },
    memberLocations: {
      'animal-tic': { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1490, y: 612 },
      'animal-tac': { hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x: 1554, y: 612 }
    },
    memberRoutineTargets: {
      'animal-tic': { food: 1506, stroll: 1482, foodFacing: 1, minX: 1477, maxX: 1507 },
      'animal-tac': { food: 1538, stroll: 1562, foodFacing: -1, minX: 1538, maxX: 1566 }
    },
    requirements: ['safe-enclosure', 'rest-hide', 'feeding-station', 'water-station', 'hygiene-station', 'enrichment'] }
]);
// Props sit behind the walking lane. They never become full-height barriers to
// a small resident; the hygiene cabinet/counter serves all three berths.
const props = [
  prop('care-counter', 'counter', 1610, 94),
  prop('hygiene-cabinet', 'cabinet', 1738, 40, 548),
  prop('cat-bed', 'catBed', 663, 55, 624, 'moka-berth-v87'),
  prop('cat-water', 'water', 754, 16, 624, 'moka-berth-v87'),
  prop('cat-food', 'food', 800, 16, 624, 'moka-berth-v87'),
  prop('cat-hygiene', 'litter', 520, 52, 624, 'moka-berth-v87'),
  prop('cat-scratch', 'scratch', 880, 30, 624, 'moka-berth-v87'),
  prop('dog-bed', 'dogBed', 1116, 88, 624, 'brume-berth-v87'),
  prop('dog-water', 'water', 1265, 22, 624, 'brume-berth-v87'),
  prop('dog-food', 'food', 1330, 22, 624, 'brume-berth-v87'),
  prop('dog-toy', 'toy', 1410, 28, 624, 'brume-berth-v87'),
  prop('luciole-bed', 'catBed', 328, 52, 624, 'luciole-berth-v87'),
  prop('luciole-water', 'water', 418, 16, 624, 'luciole-berth-v87'),
  prop('luciole-food', 'food', 452, 16, 624, 'luciole-berth-v87'),
  prop('luciole-hygiene', 'litter', 268, 47, 624, 'luciole-berth-v87'),
  prop('luciole-scratch', 'scratch', 480, 28, 624, 'luciole-berth-v87'),
  prop('luciole-toy', 'toy', 394, 20, 624, 'luciole-berth-v87')
];
export const SHIP_ANIMAL_ANNEX_V87 = freeze({
  id: 'animal-care', name: 'Accueil des compagnons', shortName: 'ACCUEIL ANIMALIER',
  kind: 'physical-annex', navigationKind: 'animal-care-annex', parentDeck: 'habitat',
  parentRoomId: 'crew-quarters', entranceSide: 'west', entranceLocalX: 144,
  parentDoorBounds: { x: 645, y: 432, w: 118, h: 192 },
  entrance: { id: 'animal-care-annex-door', x: 144, y: 432, w: 118, h: 192, bidirectional: true },
  world: { width: 1920, height: 720, floorY: 624, floorHeight: 96, playerClearanceWidth: 112, playerClearanceHeight: 192 },
  station: { id: 'animal-care-station', label: 'Comptoir de soins',
    action: 'ship-animal:care', description: 'Contrôler les équipements et la capacité d’accueil',
    persistent: true, singleStation: true, upgradeId: 'animal-care-services-v87',
    capabilities: ['companion-care'], bounds: { x: props[0].x, y: props[0].y, w: props[0].w, h: props[0].h } },
  action: 'ship-animal:care', description: 'Trois logements individuels et deux parcs pour paires liées à équiper avant acquisition. Aucune boutique à bord.',
  scope: 'companion-care', implementedFeatures: ['local-docked-counter', 'physical-arrival-transfer'],
  deferredFeatures: ['dedicated-human-carry-animation'],
  normalHubCreaturesVisible: false, isolatedLevelTarget: null,
  platforms: [{ id: 'animal-care-floor', x: 0, y: 624, w: 1920, h: 96, role: 'floor' }],
  ladders: [], colliders: [], props,
  artRoles: ['far', 'prop', 'door'],
  art: { basePath: ROOT, far: ROOT + '/habitat-wall.png', prop: ROOT + '/habitat-props.png',
    door: '/assets/openai/hub/annexes/v71/bioforge/door.webp',
    alphaBounds: { prop: SHIP_ANIMAL_PROP_RECTS_V87.counter, door: [53, 29, 330, 483] } },
  criteria: { scale: { logicalWidth: 1920, logicalHeight: 720, floorY: 624, minimumWalkableWidth: 1536,
    minimumCeilingHeight: 432, minimumEntranceClearance: 112, requiredPerspectiveLayers: 3 },
    density: { minimumProps: 2, maximumProps: 17, minimumColliders: 0, maximumColliderCoverageRatio: .32, requiredInteractiveStations: 1 } }
});

export function getShipAnimalHabitatsV87(save) {
  const registry = save?.shipAnimalsV1;
  return SHIP_ANIMAL_HABITATS_V87.map(definition => {
    const saved = registry?.habitats?.[definition.id];
    const installed = registry?.schema === 1 && saved?.installed === true
      && saved.type === definition.type && saved.roomId === 'animal-care'
      && Array.isArray(saved.equipment) && definition.requirements.every(item => saved.equipment.includes(item));
    return { ...structuredClone(definition), installed };
  });
}

/** Installation is onboard fitting, not an animal purchase or invented tariff. */
export function installShipAnimalHabitatV87(save, habitatId, context = {}) {
  const failure = code => ({ ok: false, changed: false, code, save: structuredClone(save) });
  if (!save || typeof save !== 'object' || Array.isArray(save)) return failure('invalid-save');
  const definition = SHIP_ANIMAL_HABITATS_V87.find(entry => entry.id === habitatId);
  if (!definition) return failure('unknown-habitat');
  const state = migrateShipAnimalStateV87(save?.shipAnimalsV1);
  if (state.schema !== 1 || state.quarantined.length) return failure('state-needs-review');
  if (getShipAnimalHabitatsV87(save).find(entry => entry.id === habitatId)?.installed)
    return { ok: true, changed: false, code: 'already-installed', save: structuredClone(save) };
  if (context.paused === true || context.playerAlive === false || context.roomId !== 'animal-care' || context.artReady !== true
    || !Number.isFinite(context.playerX) || Math.abs(context.playerX - definition.installX) > 92
    || !Number.isFinite(context.feetY) || Math.abs(context.feetY - 624) > 12)
    return failure('physical-installation-required');
  const next = structuredClone(save);
  state.habitats = { ...(state.habitats || {}), [habitatId]: {
    type: definition.type, roomId: 'animal-care', installed: true,
    equipment: [...definition.requirements]
  } };
  state.revision += 1;
  next.shipAnimalsV1 = state;
  return { ok: true, changed: true, code: 'installed', save: next, habitat: structuredClone(definition) };
}

export function getShipAnimalRoomInteractionV87(hub, save) {
  if (hub?.currentAnnexV71?.()?.id !== 'animal-care' || !hub.player?.alive || hub.annexTransitionV71) return null;
  const x = hub.player.x + hub.player.w / 2;
  const feetY = hub.player.y + hub.player.h;
  if (Math.abs(feetY - 624) > 12) return null;
  const habitats = getShipAnimalHabitatsV87(save);
  const uninstalled = habitats.filter(habitat => !habitat.installed && Math.abs(x - habitat.installX) <= 92)
    .sort((a, b) => Math.abs(x - a.installX) - Math.abs(x - b.installX))[0];
  if (uninstalled) return { action: 'ship-animal:install', habitatId: uninstalled.id,
    prompt: 'E — INSTALLER : ' + uninstalled.label.toUpperCase() };
  const enclosure = habitats.find(habitat => habitat.installed && habitat.navigationDomain === 'enclosure-volume'
    && Math.abs(x - habitat.installX) <= 52);
  if (enclosure) return { action: 'ship-animal:observe', habitatId: enclosure.id,
    prompt: 'E — OBSERVER : ' + enclosure.label.toUpperCase() };
  if (x >= 1525 && x <= 1840) return { action: 'ship-animal:care', prompt: 'E — CONTRÔLER L’ACCUEIL ANIMALIER' };
  return null;
}

const imageReady = image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
export function drawShipAnimalHabitatV87(ctx, image, save) {
  if (!imageReady(image)) return false;
  const installed = new Set(getShipAnimalHabitatsV87(save).filter(entry => entry.installed).map(entry => entry.id));
  for (const entry of props) {
    if (entry.habitatId && !installed.has(entry.habitatId)) continue;
    const [x, y, right, bottom] = entry.source;
    ctx.drawImage(image, x, y, right - x, bottom - y, entry.x, entry.y, entry.w, entry.h);
  }
  // These are labels for empty fitting positions, not silhouettes of animals.
  ctx.save();
  ctx.font = '11px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#a4b9b9';
  for (const habitat of getShipAnimalHabitatsV87(save)) {
    if (!habitat.installed) ctx.fillText(habitat.label.toUpperCase() + ' · À ÉQUIPER', habitat.installX, 608);
  }
  ctx.restore();
  return true;
}
