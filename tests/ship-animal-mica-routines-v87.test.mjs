import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave, SaveSystem, SAVE_PREFIX } from '../src/save.js';
import { acquireShipAnimalV87, transitionShipAnimalV87 } from '../src/ship-animal-state-v87.js';
import { SHIP_ANIMAL_HABITATS_V87, getShipAnimalHabitatsV87, installShipAnimalHabitatV87 } from '../src/ship-animal-habitat-v87.js';
import { createShipAnimalHabitatGraphV87 } from '../src/ship-animal-habitat-graph-v87.js';
import { stepShipAnimalRoutinesV87, sampleShipAnimalRoutinesV87, requestShipAnimalWalkV87,
  petShipAnimalV87, observeShipAnimalEnclosureV87 } from '../src/ship-animal-routines-v87.js';
import { SHIP_MICA_TERRARIUM_GRAPH_V87 as TERRARIUM, getMicaTerrariumTargetV87,
  isMicaTerrariumPointV87, planMicaTerrariumRouteV87, sampleMicaTerrariumRouteV87,
  stepMicaTerrariumRouteV87 } from '../src/ship-animal-terrarium-navigation-v87.js';

const ID = 'animal-mica', OFFER = 'offer-animal-mica';
const HABITAT = SHIP_ANIMAL_HABITATS_V87.find(entry => entry.id === TERRARIUM.habitatId);
const GRAPH = createShipAnimalHabitatGraphV87();
const copy = value => structuredClone(value);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
const success = result => { assert.equal(result.ok, true, result.code || result.reason); return result.save; };
const animal = save => save.shipAnimalsV1.animals[ID];
const sample = save => sampleShipAnimalRoutinesV87(save, { graph: GRAPH, roomId: 'animal-care' });
const tick = (save, options = {}) => success(stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta: .25, ...options }));

// Domain fixture: real fitting/acquisition and every legal arrival transition.
// Explicit trusted art/arrival inputs exercise the pure domain, not browser readiness or the carried journey.
function acquired(save = createDefaultSave()) {
  save = success(installShipAnimalHabitatV87(save, HABITAT.id,
    { roomId: 'animal-care', playerX: HABITAT.installX, feetY: 624, artReady: true }));
  return success(acquireShipAnimalV87(save, { offerId: OFFER, habitatId: HABITAT.id, transactionId: 'mica-routine:purchase' }, {
    vendorAccessible: true, vendorId: 'station-shop', artReadyIds: [ID], habitats: getShipAnimalHabitatsV87(save),
    care: { available: true, capacity: 8 }, simulationTime: 0,
    transit: { edgeId: 'mica-routine:verified-domain-route',
      from: { hubId: 'frontier-civil-relay', deckId: 'engineering', roomId: 'frontier-civil-counter', x: 810, y: 624 },
      to: HABITAT.location }
  }));
}
function resident(save = createDefaultSave()) {
  save = acquired(save);
  const places = [{ ...animal(save).location, progress: 1 },
    ...['intake', 'acclimating', 'resident'].map(kind => ({ kind, ...HABITAT.location }))];
  for (const [index, location] of places.entries()) save = success(transitionShipAnimalV87(save,
    { animalId: ID, transactionId: 'mica-routine:arrival:' + index, location },
    { canTransition: () => true, transportComplete: true, arrivalCheckPassed: true, acclimationComplete: true }));
  return save;
}
function until(save, predicate, bound = 1200) {
  for (let i = 0; i < bound; i++) {
    if (predicate(animal(save))) return save;
    save = tick(save);
  }
  assert.fail('Mica did not reach the required supported phase within active simulation time');
}
function supported(save) {
  const current = animal(save), p = current.location, b = TERRARIUM.bounds, body = TERRARIUM.body;
  assert.equal(p.kind, 'resident'); assert.equal(p.roomId, 'animal-care'); assert.equal(p.deckId, 'habitat');
  assert.equal(isMicaTerrariumPointV87(p), true, JSON.stringify(p));
  assert.ok(p.x - body.w / 2 >= b.x - 1e-6 && p.x + body.w / 2 <= b.x + b.w + 1e-6);
  assert.ok(p.y - body.h >= b.y - 1e-6 && p.y <= b.y + b.h + 1e-6);
  const actors = sample(save); assert.equal(actors.length, 1); assert.equal(actors[0].animalId, ID);
  assert.equal(actors[0].observationOnly, true); assert.equal(actors[0].enclosed, true);
  near(actors[0].x, p.x); near(actors[0].y, p.y);
  if (current.routineV87?.phase === 'walk') {
    const projection = sampleMicaTerrariumRouteV87(current.routineV87.route); assert.ok(projection);
    assert.deepEqual(projection.location, p); assert.equal(actors[0].clipId, projection.clipId);
    assert.equal(actors[0].supportSegmentId, projection.segmentId);
    assert.equal(actors[0].facing, projection.facing);
  }
  return actors[0];
}
const MID_UP = until(resident(), a => a.activity === 'climbUp' && a.location.y < 605 && a.location.y > 590);

test('terrarium uses its exact authored elevated supports, not the human floor or a rat enclosure', () => {
  assert.equal(GRAPH.valid, true); assert.equal(HABITAT.navigationDomain, 'terrarium-volume');
  assert.equal(HABITAT.capacity, 1); assert.equal(HABITAT.designatedAnimalId, ID);
  assert.deepEqual(HABITAT.enclosureBounds, { x: 1790, y: 548, w: 104, h: 64 });
  assert.deepEqual(TERRARIUM.nodes.map(n => [n.id, n.x, n.y]), [
    ['bed', 1800, 612], ['food', 1816, 612], ['branch-foot', 1830, 612],
    ['branch-top', 1864, 582], ['perch', 1880, 582]
  ]);
  assert.equal(HABITAT.receivingPoint.y, 624); assert.equal(HABITAT.location.y, 612);
  assert.equal(Object.isFrozen(TERRARIUM), true); assert.equal(Object.isFrozen(TERRARIUM.nodes[0]), true);
  assert.equal(getMicaTerrariumTargetV87('unknown'), null);
  for (const edit of [{ y: 624 }, { x: 1789 }, { x: 1895 }, { y: 581 }, { roomId: 'crew-quarters' }])
    assert.equal(isMicaTerrariumPointV87({ ...getMicaTerrariumTargetV87('bed'), ...edit }), false);
});

test('bidirectional support routes traverse each segment continuously with dedicated climb clips and no saved geometry', () => {
  for (const [from, to, climb, facing] of [['bed', 'stroll', 'climbUp', 1], ['stroll', 'food', 'climbDown', -1]]) {
    const start = getMicaTerrariumTargetV87(from), target = getMicaTerrariumTargetV87(to);
    const planned = planMicaTerrariumRouteV87(start, target); assert.equal(planned.ok, true);
    let route = planned.state, last = start; const clips = new Set();
    assert.deepEqual(Object.keys(route).sort(), ['schema', 'kind', 'graphId', 'actorId', 'habitatId', 'fromNodeId',
      'toNodeId', 'duration', 'elapsed', 'simulationTime', 'status'].sort());
    for (let i = 0; route.status !== 'arrived' && i < 200; i++) {
      const result = stepMicaTerrariumRouteV87(route, .125); assert.equal(result.ok, true); route = result.state;
      const view = sampleMicaTerrariumRouteV87(route); assert.ok(view); clips.add(view.clipId);
      assert.equal(isMicaTerrariumPointV87(view.location), true);
      assert.ok(Math.hypot(view.location.x - last.x, view.location.y - last.y) <= 1.25 + 1e-6);
      assert.equal(view.facing, facing); last = view.location;
    }
    assert.equal(route.status, 'arrived'); assert.deepEqual(last, target);
    assert.ok(clips.has('walk')); assert.ok(clips.has(climb));
    assert.equal(clips.has(climb === 'climbUp' ? 'climbDown' : 'climbUp'), false);
    const replay = stepMicaTerrariumRouteV87(route, .25); assert.equal(replay.changed, false);
    assert.deepEqual(replay.state, route);
  }
});

test('two complete resident routines walk, climb, descend, eat and sleep only on the actual terrarium supports', () => {
  let save = resident(); const initial = copy(save); const clips = new Set(), edges = new Set();
  let up = 0, down = 0, previousClip = null;
  for (let i = 0; i < 1000; i++) {
    const previous = copy(animal(save).location); save = tick(save); const view = supported(save);
    clips.add(view.clipId); if (view.supportSegmentId) edges.add(view.supportSegmentId);
    assert.ok(Math.hypot(view.x - previous.x, view.y - previous.y) <= 2.5 + 1e-6);
    if (view.clipId === 'climbUp' && previousClip !== 'climbUp') up++;
    if (view.clipId === 'climbDown' && previousClip !== 'climbDown') down++;
    previousClip = view.clipId;
    if (view.clipId === 'climbUp' || view.clipId === 'climbDown') {
      near(view.y, 612 - (view.x - 1830) * 30 / 34);
      assert.equal(view.supportSegmentId, 'inclined-branch');
    }
    if (view.clipId === 'sleep') assert.deepEqual(animal(save).location, getMicaTerrariumTargetV87('bed'));
    if (view.clipId === 'eat') {
      assert.deepEqual(animal(save).location, getMicaTerrariumTargetV87('food'));
      assert.equal(view.facing, HABITAT.routineTargets.foodFacing);
    }
    if (up >= 2 && down >= 2 && view.clipId === 'eat') break;
  }
  assert.equal(up, 2); assert.equal(down, 2);
  assert.deepEqual([...clips].sort(), ['climbDown', 'climbUp', 'eat', 'idle', 'sleep', 'walk'].sort());
  assert.deepEqual([...edges].sort(), TERRARIUM.edges.map(e => e.id).sort());
  assert.deepEqual(Object.keys(save.shipAnimalsV1.animals), [ID]);
  for (const key of ['stock', 'receipts', 'reservations', 'transitions', 'habitats'])
    assert.deepEqual(save.shipAnimalsV1[key], initial.shipAnimalsV1[key]);
  assert.deepEqual(save.galaxy.resources, initial.galaxy.resources);
  assert.deepEqual(animal(save).preferences, animal(initial).preferences);
  assert.equal(animal(save).needs.social, animal(initial).needs.social);
});

test('zero ownership or a purchased transport never produces a gecko resident or a care routine', () => {
  for (const save of [createDefaultSave(), acquired()]) {
    assert.deepEqual(sample(save), []); const result = stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta: .25 });
    assert.equal(result.changed, false); assert.equal(result.code, 'no-residents'); assert.deepEqual(result.save, save);
  }
});

test('pause, same active time and repeated offscreen projection never advance a climbing resident', () => {
  const save = copy(MID_UP), before = copy(save);
  assert.deepEqual(tick(save, { paused: true }), save);
  assert.deepEqual(tick(save, { simulationTime: save.shipAnimalsV1.lastSimulationTime }), save);
  for (let i = 0; i < 20; i++) {
    supported(save);
    assert.deepEqual(sampleShipAnimalRoutinesV87(save, { graph: GRAPH, roomId: 'reactor' }), []);
  }
  assert.deepEqual(save, before);
  assert.equal(stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta: .25,
    simulationTime: save.shipAnimalsV1.lastSimulationTime + 600 }).ok, false);
  assert.deepEqual(save, before);
});

test('blocking animal-care freezes the supported position and resumes from that exact point', () => {
  let save = copy(MID_UP); const origin = copy(animal(save).location), route = copy(animal(save).routineV87.route);
  for (let i = 0; i < 12; i++) {
    save = tick(save, { blockedRoomIds: ['animal-care'] }); supported(save);
    assert.deepEqual(animal(save).location, origin); assert.deepEqual(animal(save).routineV87.route, route);
  }
  const resumed = tick(save); supported(resumed);
  assert.ok(animal(resumed).location.x > origin.x); assert.ok(animal(resumed).location.y < origin.y);
  near(animal(resumed).routineV87.route.elapsed, route.elapsed + .25);
});

test('Mica cannot leave by the general graph or be petted through glass even at exact proximity', () => {
  const save = resident(), before = copy(save), player = { alive: true, roomId: 'animal-care', deckId: 'habitat', x: 1800, y: 624 };
  const pet = petShipAnimalV87(save, { animalId: ID, eventId: 'mica:forbidden-pet' }, { graph: GRAPH, player });
  assert.equal(pet.code, 'enclosure-observation-only'); assert.equal(pet.changed, false); assert.deepEqual(pet.save, before);
  for (const target of [animal(save).location, { roomId: 'animal-care', x: 700, y: 624 },
    { roomId: 'crew-quarters', x: 704, y: 624 }, { roomId: 'reactor', x: 1800, y: 624 }]) {
    const result = requestShipAnimalWalkV87(save, { animalId: ID, target }, { graph: GRAPH });
    assert.equal(result.code, 'enclosure-supervision-required'); assert.deepEqual(result.save, before);
  }
  assert.deepEqual(save, before);
});

test('observation requires the real human receiving lane, returns Mica only and never grants rewards', () => {
  const save = copy(MID_UP), before = copy(save), player = { alive: true, roomId: 'animal-care', deckId: 'habitat', x: 1800, y: 624 };
  const result = observeShipAnimalEnclosureV87(save, { habitatId: HABITAT.id }, { graph: GRAPH, player });
  assert.equal(result.ok, true); assert.equal(result.changed, false);
  assert.deepEqual(result.animals.map(a => a.animalId), [ID]); assert.equal(result.animals[0].activity, 'climbUp');
  assert.deepEqual(result.animals[0].location, animal(save).location);
  for (const edit of [{ alive: false }, { roomId: 'crew-quarters' }, { deckId: 'engineering' }, { x: 1853 }, { y: 600 }])
    assert.equal(observeShipAnimalEnclosureV87(save, { habitatId: HABITAT.id }, { graph: GRAPH, player: { ...player, ...edit } }).ok, false);
  assert.deepEqual(result.save, before); assert.deepEqual(save, before);
});

for (const [label, change] of [
  ['unsupported floating point', a => { a.location.y -= 1; }],
  ['human floor', a => { a.location.y = 624; }],
  ['another room', a => { a.location.roomId = 'crew-quarters'; }],
  ['future route', a => { a.routineV87.route.schema = 88; }],
  ['wrong actor', a => { a.routineV87.route.actorId = 'animal-tic'; }],
  ['forged geometry', a => { a.routineV87.route.nodes = [{ x: 700, y: 624 }]; }],
  ['forged speed', a => { a.routineV87.route.duration /= 2; }],
  ['fabricated pet', a => { a.routineV87.phase = 'pet'; a.routineV87.route = null; }]
]) test(label + ' cannot draw, advance or silently repair a confined Mica', () => {
  const save = copy(MID_UP); change(animal(save)); const before = copy(save);
  assert.deepEqual(sample(save), []);
  const result = stepShipAnimalRoutinesV87(save, { graph: GRAPH, delta: .25 });
  assert.equal(result.ok, false); assert.equal(result.changed, false);
  assert.deepEqual(result.save, before); assert.deepEqual(save, before);
});

test('real SaveSystem reload mid-ascent and mid-descent preserves exact support time, position, unique ownership and quota rollback', () => {
  const values = new Map(), backend = { reject: false, getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.reject && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(key, value); },
    removeItem: key => values.delete(key) };
  const system = new SaveSystem(backend); system.newGame(1);
  const down = until(copy(MID_UP), a => a.activity === 'climbDown' && a.location.y > 590 && a.location.y < 605);
  for (const current of [MID_UP, down]) {
    system.commit(copy(current)); const live = copy(system.data), disk = backend.getItem(system.key());
    const loaded = new SaveSystem(backend).load(1);
    assert.deepEqual(loaded.shipAnimalsV1, live.shipAnimalsV1); supported(loaded);
    assert.deepEqual(tick(loaded).shipAnimalsV1, tick(live).shipAnimalsV1);
    assert.equal(Object.keys(loaded.shipAnimalsV1.receipts).length, 1);
    assert.equal(Object.keys(loaded.shipAnimalsV1.reservations).length, 1);
    assert.deepEqual(Object.keys(loaded.shipAnimalsV1.animals), [ID]);
    backend.reject = true;
    assert.throws(() => system.commit(tick(system.data)), error => error.code === 'SAVE_WRITE_FAILED');
    assert.deepEqual(system.data, live); assert.equal(backend.getItem(system.key()), disk); backend.reject = false;
  }
  const other = new SaveSystem(backend); other.newGame(2); assert.deepEqual(other.data.shipAnimalsV1.animals, {});
  assert.deepEqual(new SaveSystem(backend).load(1).shipAnimalsV1, system.data.shipAnimalsV1);
});
