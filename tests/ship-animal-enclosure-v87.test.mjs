import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave, SaveSystem, SAVE_PREFIX } from '../src/save.js';
import { acquireShipAnimalV87, transitionShipAnimalGroupV87 } from '../src/ship-animal-state-v87.js';
import { SHIP_ANIMAL_HABITATS_V87, SHIP_ANIMAL_ANNEX_V87, getShipAnimalHabitatsV87,
  installShipAnimalHabitatV87, getShipAnimalRoomInteractionV87 } from '../src/ship-animal-habitat-v87.js';
import { createShipAnimalHabitatGraphV87 } from '../src/ship-animal-habitat-graph-v87.js';
import { SHIP_ANIMAL_ROUTINE_BODIES_V87 as BODIES, stepShipAnimalRoutinesV87,
  sampleShipAnimalRoutinesV87, requestShipAnimalWalkV87, petShipAnimalV87,
  observeShipAnimalEnclosureV87 } from '../src/ship-animal-routines-v87.js';

const copy = value => structuredClone(value);
const PENS = SHIP_ANIMAL_HABITATS_V87.filter(habitat => habitat.navigationDomain === 'enclosure-volume');
const IDS = PENS.flatMap(habitat => Object.keys(habitat.memberLocations));
const GRAPH = createShipAnimalHabitatGraphV87();
const success = result => { assert.equal(result.ok, true, result.code); return result.save; };
function fitted(save = createDefaultSave()) {
  for (const habitat of PENS) save = success(installShipAnimalHabitatV87(save, habitat.id,
    { roomId: 'animal-care', playerX: habitat.installX, feetY: 624, artReady: true }));
  return save;
}
function resident(save = createDefaultSave()) {
  save = fitted(save); save.galaxy.resources.credits = 3000;
  for (const habitat of PENS) {
    const offerId = 'offer-' + habitat.designatedGroupId;
    save = success(acquireShipAnimalV87(save, { offerId, habitatId: habitat.id, transactionId: 'test:' + offerId }, {
      vendorAccessible: true, vendorId: 'colony-shelter', artReadyIds: IDS,
      habitats: getShipAnimalHabitatsV87(save), care: { available: true, capacity: 7 },
      transit: { edgeId: 'test-group-route', from: { hubId: 'test-port', deckId: 'engineering',
        roomId: 'test-counter', x: 400, y: 624 }, to: habitat.location }
    }));
    for (const [index, kind] of ['transit', 'intake', 'acclimating', 'resident'].entries()) {
      const locationsByAnimalId = Object.fromEntries(Object.entries(habitat.memberLocations).map(([id, point]) =>
        [id, kind === 'transit' ? { ...save.shipAnimalsV1.animals[id].location, progress: 1 } : { kind, ...point }]));
      save = success(transitionShipAnimalGroupV87(save, { offerId, transactionId: offerId + ':step:' + index,
        locationsByAnimalId }, { canTransition: () => true, transportComplete: true,
        arrivalCheckPassed: true, acclimationComplete: true }));
    }
  }
  return save;
}
const tick = (save, options = {}) => success(stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta: .25, ...options }));
const samples = save => sampleShipAnimalRoutinesV87(save, { graph: GRAPH, roomId: 'animal-care' });
function inBounds(animal) {
  const habitat = PENS.find(h => h.id === animal.habitatId), b = habitat.enclosureBounds;
  const body = BODIES[animal.id], targets = habitat.memberRoutineTargets[animal.id], p = animal.location;
  assert.equal(p.kind, 'resident'); assert.equal(p.roomId, 'animal-care'); assert.equal(p.deckId, 'habitat');
  assert.ok(p.x >= targets.minX - 1e-7 && p.x <= targets.maxX + 1e-7);
  assert.ok(p.x - body.w / 2 >= b.x - 1e-7 && p.x + body.w / 2 <= b.x + b.w + 1e-7);
  assert.ok(p.y - body.h >= b.y - 1e-7 && p.y <= b.y + b.h + 1e-7);
  assert.ok(p.y >= 612 - body.hopHeight - 1e-7 && p.y <= 612 + 1e-7);
}

test('two typed pens provide four places and distinct feet612, while the human receiving lane remains624', () => {
  assert.equal(PENS.length, 2); assert.equal(SHIP_ANIMAL_HABITATS_V87.length, 6);
  assert.equal(SHIP_ANIMAL_HABITATS_V87.reduce((sum, h) => sum + h.capacity, 0), 8);
  assert.deepEqual(PENS.map(h => h.capacity), [2, 2]);
  assert.deepEqual(PENS.map(h => h.enclosureBounds), [{ x: 936, y: 550, w: 154, h: 62 }, { x: 1462, y: 556, w: 120, h: 56 }]);
  assert.deepEqual(PENS.map(h => h.receivingPoint.y), [624, 624]);
  assert.deepEqual(PENS.flatMap(h => Object.values(h.memberLocations).map(p => p.x)), [962, 1064, 1490, 1554]);
  assert.deepEqual(IDS.map(id => [BODIES[id].w, BODIES[id].h]), [[44, 30], [36, 32], [30, 16], [32, 16]]);
  for (const habitat of PENS) {
    const b = habitat.enclosureBounds, members = Object.keys(habitat.memberLocations);
    for (const id of members) {
      const body = BODIES[id], target = habitat.memberRoutineTargets[id];
      assert.ok(target.minX - body.w / 2 >= b.x && target.maxX + body.w / 2 <= b.x + b.w);
      assert.ok(612 - body.hopHeight - body.h >= b.y);
      assert.ok([habitat.memberLocations[id].x, target.food, target.stroll]
        .every(x => x >= target.minX && x <= target.maxX));
    }
    const [left, right] = members;
    assert.ok(habitat.memberRoutineTargets[left].maxX + BODIES[left].w / 2
      <= habitat.memberRoutineTargets[right].minX - BODIES[right].w / 2);
  }
  assert.ok(PENS.every(h => h.requirements.length === 6 && h.requirements.includes('safe-enclosure')));
  assert.deepEqual(SHIP_ANIMAL_ANNEX_V87.colliders, []);
  const save = fitted(); assert.deepEqual(save.shipAnimalsV1.animals, {});
  assert.deepEqual(save.shipAnimalsV1.reservations, {}); assert.equal(samples(save).length, 0);
});

test('nearest fitting wins the old/new overlap and installed pens expose observation, never petting', () => {
  const hub = { currentAnnexV71: () => SHIP_ANIMAL_ANNEX_V87, annexTransitionV71: null,
    player: { x: 1060 - 22, y: 532, w: 44, h: 92, alive: true } };
  assert.equal(getShipAnimalRoomInteractionV87(hub, createDefaultSave()).habitatId, PENS[0].id);
  const save = fitted();
  for (const habitat of PENS) {
    hub.player.x = habitat.installX - 22;
    assert.equal(getShipAnimalRoomInteractionV87(hub, save).action, 'ship-animal:observe');
    assert.equal(getShipAnimalRoomInteractionV87(hub, save).habitatId, habitat.id);
  }
  hub.annexTransitionV71 = { progress: .5 }; assert.equal(getShipAnimalRoomInteractionV87(hub, save), null);
});

test('four physical residents remain separate, confined and species-correct through repeated full routines', () => {
  let save = resident(); const initial = copy(save), phases = new Map(IDS.map(id => [id, new Set()]));
  const hopping = new Set();
  for (let i = 0; i < 360; i++) {
    save = tick(save); assert.equal(samples(save).length, 4);
    for (const id of IDS) {
      const animal = save.shipAnimalsV1.animals[id]; inBounds(animal); phases.get(id).add(animal.activity);
      if (animal.location.y < 611.99) hopping.add(id);
      if (id === 'animal-tic' || id === 'animal-tac') assert.equal(animal.location.y, 612);
      if (animal.activity === 'eat') assert.equal(animal.routineV87.facing,
        PENS.find(h => h.id === animal.habitatId).memberRoutineTargets[id].foodFacing);
    }
    for (const habitat of PENS) {
      const [a, b] = Object.keys(habitat.memberLocations).map(id => save.shipAnimalsV1.animals[id]);
      assert.ok(a.location.x + BODIES[a.id].w / 2 <= b.location.x - BODIES[b.id].w / 2 + 1e-7);
    }
  }
  assert.deepEqual([...hopping].sort(), ['animal-cafe', 'animal-noisette']);
  for (const seen of phases.values()) for (const phase of ['idle', 'walk', 'eat', 'sleep']) assert.ok(seen.has(phase));
  for (const bucket of ['stock', 'receipts', 'reservations']) assert.deepEqual(save.shipAnimalsV1[bucket], initial.shipAnimalsV1[bucket]);
  assert.deepEqual(save.galaxy.resources, initial.galaxy.resources); assert.deepEqual(save.clock, initial.clock);
});

test('pause, replayed active time, drawings and offscreen sampling do not advance or teleport enclosed animals', () => {
  let save = resident(); for (let i = 0; i < 27; i++) save = tick(save);
  const before = copy(save);
  assert.deepEqual(stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta: .25, paused: true }).save, before);
  assert.deepEqual(tick(save, { simulationTime: save.shipAnimalsV1.lastSimulationTime }), before);
  for (let i = 0; i < 20; i++) {
    assert.equal(samples(save).length, 4);
    assert.deepEqual(sampleShipAnimalRoutinesV87(save, { graph: GRAPH, roomId: 'crew-quarters' }), []);
  }
  assert.deepEqual(save, before);
  for (const delta of [NaN, -.1, .251, 1000]) assert.equal(stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta }).ok, false);
});

for (const id of IDS) test(id + ': no free outing, direct caress or corrupted outside route can bypass its enclosure', () => {
  const save = resident(), before = copy(save), animal = save.shipAnimalsV1.animals[id];
  const player = { alive: true, roomId: 'animal-care', deckId: 'habitat', x: animal.location.x, y: 624 };
  assert.equal(petShipAnimalV87(save, { animalId: id, eventId: 'test:pet' }, { graph: GRAPH, player }).code, 'enclosure-observation-only');
  for (const target of [{ roomId: 'crew-quarters', x: 450, y: 624 }, { ...animal.location, x: 800 }, animal.location]) {
    assert.equal(requestShipAnimalWalkV87(save, { animalId: id, target }, { graph: GRAPH }).code, 'enclosure-supervision-required');
  }
  const bad = copy(save); bad.shipAnimalsV1.animals[id].location.x = 800;
  assert.equal(stepShipAnimalRoutinesV87(bad, { graph: GRAPH, delta: .25 }).ok, false);
  assert.equal(samples(bad).some(a => a.animalId === id), false);
  assert.deepEqual(save, before);
});

test('observation is physical, read-only, includes each member and refuses contact from another room or through the floor', () => {
  const save = resident(), before = copy(save);
  for (const habitat of PENS) {
    const player = { alive: true, roomId: 'animal-care', deckId: 'habitat', x: habitat.installX, y: 624 };
    const result = observeShipAnimalEnclosureV87(save, { habitatId: habitat.id }, { graph: GRAPH, player });
    assert.equal(result.ok, true); assert.equal(result.changed, false); assert.equal(result.animals.length, 2);
    assert.deepEqual(result.animals.map(a => a.animalId), Object.keys(habitat.memberLocations));
    for (const edit of [{ alive: false }, { roomId: 'crew-quarters' }, { x: habitat.installX + 53 }, { y: 600 }])
      assert.equal(observeShipAnimalEnclosureV87(save, { habitatId: habitat.id }, { graph: GRAPH, player: { ...player, ...edit } }).ok, false);
  }
  assert.deepEqual(save, before);
});

test('blocked enclosure stays at its last validated pose; changing player rooms never attracts or releases a pair', () => {
  let save = resident(); for (let i = 0; i < 27; i++) save = tick(save);
  const places = Object.fromEntries(IDS.map(id => [id, copy(save.shipAnimalsV1.animals[id].location)]));
  for (let i = 0; i < 8; i++) save = tick(save, { blockedRoomIds: ['animal-care'] });
  for (const id of IDS) assert.deepEqual(save.shipAnimalsV1.animals[id].location, places[id]);
});

test('corrupt internal routes and fabricated pet phases cannot render or advance', () => {
  let save = resident(); for (let i = 0; i < 27; i++) save = tick(save);
  const id = 'animal-noisette'; assert.equal(save.shipAnimalsV1.animals[id].routineV87.phase, 'walk');
  for (const change of [a => { a.routineV87.route.to.x = 1300; }, a => { a.routineV87.route.hopHeight = 100; },
    a => { a.routineV87.route.elapsed = NaN; }, a => { a.routineV87.phase = 'pet'; a.routineV87.route = null; }]) {
    const bad = copy(save); change(bad.shipAnimalsV1.animals[id]);
    assert.equal(stepShipAnimalRoutinesV87(bad, { graph: GRAPH, delta: .25 }).ok, false);
    assert.equal(samples(bad).some(actor => actor.animalId === id), false);
  }
});

test('real SaveSystem reload preserves four independent needs and mid-hop positions; failed commit keeps durable and live state', () => {
  const values = new Map(); const storage = { reject: false, getItem: k => values.get(k) ?? null,
    setItem(k, v) { if (this.reject && k.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(k, v); },
    removeItem: k => values.delete(k) };
  const system = new SaveSystem(storage); system.newGame(1);
  let save = resident(system.data);
  IDS.forEach((id, index) => { save.shipAnimalsV1.animals[id].needs.satiety = 50 + index; });
  for (let i = 0; i < 27; i++) save = tick(save);
  system.commit(save); const loaded = new SaveSystem(storage).load(1);
  assert.deepEqual(loaded.shipAnimalsV1, save.shipAnimalsV1);
  assert.deepEqual(samples(loaded), samples(save)); assert.deepEqual(tick(loaded).shipAnimalsV1, tick(save).shipAnimalsV1);
  const live = copy(system.data), disk = values.get(system.key()); storage.reject = true;
  assert.throws(() => system.commit(tick(system.data)), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(system.data, live); assert.equal(values.get(system.key()), disk);
});
