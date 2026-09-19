import { HUB_DECKS, HUB_WORLD, getHubDoorBounds, buildHubObstacleGeometryV87 } from './hub-game.js';
import { buildHubTraversalGeometryV87 } from './hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { createShipAnimalRoutineGraphV87 } from './ship-animal-routines-v87.js';

const HABITAT_DECK = HUB_DECKS.findIndex(deck => deck.id === 'habitat');
const list = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);

// State can be restored from a previous graph or a live door, never its geometry.
function doorState(value) {
  const state = {};
  if (finite(value?.progress)) state.progress = Math.max(0, Math.min(1, value.progress));
  for (const key of ['locked', 'levelLocked', 'permissionDenied']) {
    if (value && Object.hasOwn(value, key)) state[key] = Boolean(value[key]);
  }
  if (Array.isArray(value?.tags)) state.tags = value.tags.filter(tag => typeof tag === 'string');
  return state;
}

/**
 * Rebuild Habitat without constructing, moving or starting a HubGame.
 * The floor, platforms, bunk collisions and door bounds come from the same
 * production sources as configureTraversal/createObstacles. Do not pass the
 * visible Engineering geometry here. Door snapshots are matched by authored ID;
 * unreported doors remain closed, and no routine automatically unlocks them.
 * Caller owns snapshot lifetime/profile reset; this module has no mutable cache.
 */
export function buildShipAnimalHabitatGeometryV87({ doorStates = [], annexDoor = {}, regions = [] } = {}) {
  const states = new Map(list(doorStates).filter(door => typeof door?.id === 'string')
    .map(door => [door.id, doorState(door)]));
  const traversal = buildHubTraversalGeometryV87(HABITAT_DECK);
  const doors = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, HABITAT_DECK).map(door => ({
    ...clone(door), ...states.get(door.id), bounds: getHubDoorBounds(door)
  }));
  return {
    floor: { id: 'habitat:floor', x: 0, y: HUB_WORLD.floorY, w: HUB_WORLD.width },
    platforms: clone(traversal.platforms), obstacles: clone(buildHubObstacleGeometryV87(HABITAT_DECK)),
    doors, regions: clone(list(regions)), annexDoor: doorState(annexDoor)
  };
}

/** Always valid on campaign decks, including an initial load at Engineering. */
export function createShipAnimalHabitatGraphV87(options) {
  return createShipAnimalRoutineGraphV87(buildShipAnimalHabitatGeometryV87(options));
}
