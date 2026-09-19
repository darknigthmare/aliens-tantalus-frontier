import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame as BaseHub, HUB_DECKS, HUB_WORLD, getHubDoorBounds, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as TraversalHub, buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { buildShipAnimalHabitatGeometryV87, createShipAnimalHabitatGraphV87 } from '../src/ship-animal-habitat-graph-v87.js';
import { createShipAnimalRoutineGraphV87, stepShipAnimalRoutinesV87 } from '../src/ship-animal-routines-v87.js';
import { planShipAnimalRouteV87 } from '../src/ship-animal-navigation-v87.js';
import { getShipAnimalHabitatsV87, installShipAnimalHabitatV87, SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { acquireShipAnimalV87, transitionShipAnimalV87 } from '../src/ship-animal-state-v87.js';

const clone = value => structuredClone(value);
const habitat = HUB_DECKS.findIndex(deck => deck.id === 'habitat');
function runtimeGeometry(deck) {
  // Invoke the real production methods without a game constructor, canvas or RAF.
  const context = { state: { deck }, compiledProject: null };
  TraversalHub.prototype.configureTraversal.call(context);
  return { floor: { id: HUB_DECKS[deck].id + ':floor', x: 0, y: context.floorY, w: HUB_WORLD.width },
    platforms: context.v51Platforms, obstacles: BaseHub.prototype.createObstacles.call(null, deck),
    doors: buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck).map(door => ({ ...clone(door), bounds: getHubDoorBounds(door) })) };
}

test('shared factories exactly match production collision and traversal for all four decks', () => {
  for (let deck = 0; deck < HUB_DECKS.length; deck++) {
    const live = runtimeGeometry(deck);
    assert.deepEqual(buildHubObstacleGeometryV87(deck), live.obstacles);
    assert.deepEqual(buildHubTraversalGeometryV87(deck).platforms, live.platforms);
  }
});

test('pure Habitat geometry and graph equal the real Habitat runtime output', () => {
  const live = runtimeGeometry(habitat);
  const derived = buildShipAnimalHabitatGeometryV87();
  for (const key of ['floor', 'platforms', 'obstacles', 'doors']) assert.deepEqual(derived[key], live[key], key);
  assert.deepEqual(createShipAnimalHabitatGraphV87(), createShipAnimalRoutineGraphV87(live));
  assert.equal(derived.obstacles.find(item => item.roomId === 'crew-quarters').x, 809);
});

test('initial Engineering load creates valid Habitat graph without changing the visible deck', () => {
  const current = { state: { deck: 3, roomId: 'dropship-hangar' }, player: { x: 300, y: 528 }, ...runtimeGeometry(3) };
  const before = clone(current);
  // Engineering doors must not be misidentified as Habitat doors by index.
  const graph = createShipAnimalHabitatGraphV87({ doorStates: current.doors });
  assert.equal(graph.valid, true);
  assert.equal(graph.deckId, 'habitat');
  assert.deepEqual(graph.rooms.map(room => room.id), ['crew-quarters', 'mess', 'medical', 'science-lab', 'animal-care']);
  assert.equal(graph.rooms.some(room => room.id === 'dropship-hangar'), false);
  assert.equal(graph.doors.every(door => door.progress === 0), true);
  assert.deepEqual(current, before);
});

test('persisted door locks survive rebuild, while their geometry and connections stay authored', () => {
  const authored = buildShipAnimalHabitatGeometryV87().doors[0];
  const state = { ...authored, progress: .57, locked: true, levelLocked: true,
    permissionDenied: true, tags: ['exterior-airlock'], x: 15,
    bounds: { x: 0, y: 0, w: 800, h: 1 }, fromRoomId: 'dropship-hangar', toRoomId: 'reactor' };
  const before = clone(state);
  const annexDoor = { progress: .7, locked: true, tags: ['biohazard-quarantine'] };
  const graph = createShipAnimalHabitatGraphV87({ doorStates: [state], annexDoor });
  const rebuilt = createShipAnimalHabitatGraphV87({ doorStates: clone(graph.doors),
    annexDoor: graph.doors.find(door => door.id === SHIP_ANIMAL_ANNEX_V87.entrance.id) });
  const door = graph.doors.find(door => door.id === authored.id);
  assert.equal(door.progress, .57); assert.equal(door.locked, true);
  assert.deepEqual(door.tags, ['exterior-airlock']);
  assert.deepEqual(door.bounds, authored.bounds);
  assert.equal(door.fromRoomId, authored.fromRoomId); assert.equal(door.toRoomId, authored.toRoomId);
  assert.deepEqual(rebuilt, graph);
  assert.deepEqual(state, before); assert.equal(annexDoor.progress, .7);
});

test('graph factories do not share mutable data or carry door state across profiles', () => {
  const one = buildShipAnimalHabitatGeometryV87();
  one.platforms[0].x = -900; one.obstacles[0].collidable = false; one.doors[0].progress = 1;
  one.doors[0].bounds.x = 0;
  const two = buildShipAnimalHabitatGeometryV87();
  assert.deepEqual(two, buildShipAnimalHabitatGeometryV87());
  assert.notEqual(two.platforms[0].x, -900); assert.notEqual(two.obstacles[0].collidable, false);
  assert.equal(two.doors[0].progress, 0); assert.notEqual(two.doors[0].bounds.x, 0);
});

test('real bunk blocks a ground shortcut and unsafe rooms never become certified implicitly', () => {
  const graph = createShipAnimalHabitatGraphV87();
  const route = planShipAnimalRouteV87(graph, { actorId: 'animal-moka', body: { w: 38, h: 38 },
    location: { roomId: 'crew-quarters', x: 700 }, target: { roomId: 'crew-quarters', x: 1100 } });
  assert.equal(route.ok, false); assert.equal(route.reason, 'no-authorized-ground-route');
  for (const id of ['mess', 'medical', 'science-lab']) assert.deepEqual(graph.rooms.find(room => room.id === id).regions, []);
});

test('annex locked state still denies a physically valid route off screen', () => {
  const options = { actorId: 'animal-moka', body: { w: 38, h: 38 },
    location: { roomId: 'animal-care', x: 300 }, target: { roomId: 'crew-quarters', x: 600 } };
  assert.equal(planShipAnimalRouteV87(createShipAnimalHabitatGraphV87(), options).ok, true);
  const denied = planShipAnimalRouteV87(createShipAnimalHabitatGraphV87({ annexDoor: { locked: true } }), options);
  assert.equal(denied.ok, false); assert.equal(denied.reason, 'door-locked');
});

function residentAtEngineering() {
  let save = { profile: 1, createdAt: 7, hub: { deck: 3, roomId: 'dropship-hangar', positionX: 300 },
    galaxy: { resources: { credits: 3200 } } };
  const berth = getShipAnimalHabitatsV87(save)[0];
  const installed = installShipAnimalHabitatV87(save, berth.id,
    { roomId: 'animal-care', playerX: berth.installX, feetY: 624, artReady: true });
  assert.equal(installed.ok, true); save = installed.save;
  const result = acquireShipAnimalV87(save, { offerId: 'offer-animal-moka', habitatId: berth.id, transactionId: 'graph-test-purchase' },
    { vendorAccessible: true, artReadyIds: ['animal-moka'], care: { available: true, capacity: 2 },
      habitats: getShipAnimalHabitatsV87(save), simulationTime: 0,
      transit: { edgeId: 'graph-test-transport', from: { ...berth.location, roomId: 'port-shop', x: 40 }, to: berth.location } });
  assert.equal(result.ok, true, result.code); save = result.save;
  const transit = clone(save.shipAnimalsV1.animals['animal-moka'].location);
  for (const [index, location] of [{ ...transit, progress: 1 }, { kind: 'intake', ...berth.location },
    { kind: 'acclimating', ...berth.location }, { kind: 'resident', ...berth.location }].entries()) {
    const step = transitionShipAnimalV87(save, { animalId: 'animal-moka', location, transactionId: 'graph-test-step-' + index },
      { canTransition: () => true, transportComplete: true, arrivalCheckPassed: true, acclimationComplete: true });
    assert.equal(step.ok, true, step.code); save = step.save;
  }
  return save;
}

test('resident advances after save/load on Engineering without visiting Habitat or teleporting the player', () => {
  const original = residentAtEngineering();
  let save = JSON.parse(JSON.stringify(original));
  const graph = createShipAnimalHabitatGraphV87();
  for (let i = 0; i < 28; i++) {
    const result = stepShipAnimalRoutinesV87(save, { delta: .25, graph });
    assert.equal(result.ok, true, result.code); save = result.save;
  }
  assert.equal(save.shipAnimalsV1.animals['animal-moka'].location.x, 732);
  assert.equal(save.shipAnimalsV1.animals['animal-moka'].location.roomId, 'animal-care');
  assert.deepEqual(save.hub, original.hub);
  assert.deepEqual(save.galaxy, original.galaxy);
  assert.equal(original.shipAnimalsV1.animals['animal-moka'].location.x, 690);
});
