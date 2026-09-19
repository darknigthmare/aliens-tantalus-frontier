import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_PREFIX } from '../src/save.js';
import { HubGame } from '../src/hub-onboarding-v84.js';
import { HUB_WORLD, getHubDoorBounds } from '../src/hub-game.js';
import { acquireShipAnimalV87, transitionShipAnimalV87, migrateShipAnimalStateV87 } from '../src/ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87, installShipAnimalHabitatV87, SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { createShipAnimalRoutineGraphV87, stepShipAnimalRoutinesV87, petShipAnimalV87,
  requestShipAnimalWalkV87, sampleShipAnimalRoutinesV87 } from '../src/ship-animal-routines-v87.js';

const copy = value => structuredClone(value);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, a + ' != ' + b);
function geometry() {
  const prior = Object.fromEntries(['Image', 'addEventListener', 'requestAnimationFrame', 'matchMedia'].map(k => [k, globalThis[k]]));
  globalThis.Image = class { constructor() { this.complete = false; this.naturalWidth = 1920; this.naturalHeight = 720; } set src(v) { this.currentSrc = v; } };
  globalThis.addEventListener = () => {}; globalThis.requestAnimationFrame = () => 0;
  globalThis.matchMedia = () => ({ matches: false });
  try {
    const ctx = new Proxy({ measureText: v => ({ width: String(v).length * 8 }),
      createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
    { get: (o, k) => k in o ? o[k] : () => {}, set: (o, k, v) => { o[k] = v; return true; } });
    const hub = new HubGame({ width: 1280, height: 720, getContext: () => ctx, addEventListener() {}, focus() {} });
    hub.start({ deck: 1, roomId: 'crew-quarters', positionX: 180, visited: ['crew-quarters'] });
    return { floor: { id: 'habitat:floor', x: 0, y: hub.floorY, w: HUB_WORLD.width },
      obstacles: copy(hub.obstacles), platforms: copy(hub.v51Platforms),
      doors: hub.doorStates.map(d => ({ ...copy(d), bounds: getHubDoorBounds(d) })) };
  } finally { Object.assign(globalThis, prior); }
}
const REAL = geometry();
const graph = options => createShipAnimalRoutineGraphV87({ ...copy(REAL), ...options });
const NAV = graph();
function base() { return { profile: 1, createdAt: 7, galaxy: { resources: { credits: 3200, medical: 12 } },
  crew: [{ health: 99 }], player: { health: 80 }, clock: { day: 1, hour: 9 } }; }
function acquired(ids = ['animal-moka']) {
  let save = base();
  for (const habitat of getShipAnimalHabitatsV87(save)) {
    const result = installShipAnimalHabitatV87(save, habitat.id,
      { roomId: 'animal-care', playerX: habitat.installX, feetY: 624, artReady: true });
    assert.equal(result.ok, true); save = result.save;
  }
  for (const animalId of ids) {
    const habitat = getShipAnimalHabitatsV87(save).find(h => h.type === (animalId === 'animal-moka' ? 'cat-berth' : 'dog-berth'));
    const result = acquireShipAnimalV87(save, { offerId: 'offer-' + animalId,
      habitatId: habitat.id, transactionId: 'purchase-' + animalId }, {
      vendorAccessible: true, artReadyIds: ids, care: { available: true, capacity: 2 },
      habitats: getShipAnimalHabitatsV87(save), simulationTime: 0,
      transit: { edgeId: 'verified-test-transport', from: { ...habitat.location, roomId: 'port-shop', x: 40 },
        to: habitat.location }
    });
    assert.equal(result.ok, true, result.code); save = result.save;
  }
  return save;
}
function resident(ids = ['animal-moka']) {
  let save = acquired(ids);
  for (const animalId of ids) {
    const owned = save.shipAnimalsV1.animals[animalId];
    const place = owned.location.to;
    const locations = [{ ...owned.location, progress: 1 }, { kind: 'intake', ...place },
      { kind: 'acclimating', ...place }, { kind: 'resident', ...place }];
    for (const [index, location] of locations.entries()) {
      const result = transitionShipAnimalV87(save, { animalId, location, transactionId: 'step-' + animalId + '-' + index },
        { canTransition: () => true, transportComplete: true, arrivalCheckPassed: true, acclimationComplete: true });
      assert.equal(result.ok, true, result.code); save = result.save;
    }
  }
  return save;
}
const animal = (save, id = 'animal-moka') => save.shipAnimalsV1.animals[id];
function advance(save, seconds, options = {}) {
  for (let elapsed = 0; elapsed < seconds - 1e-7; elapsed += 0.25) {
    const result = stepShipAnimalRoutinesV87(save, { delta: Math.min(.25, seconds - elapsed), graph: NAV, ...options });
    assert.equal(result.ok, true, result.code); save = result.save;
  }
  return save;
}
const player = current => ({ alive: true, roomId: animal(current).location.roomId,
  deckId: 'habitat', x: animal(current).location.x, y: 624 });

test('graph uses exact production annex bounds, floor and real bunk obstacles', () => {
  assert.equal(NAV.valid, true);
  const room = NAV.rooms.find(r => r.id === 'animal-care');
  assert.equal(room.floor.y, 624); assert.equal(room.bounds.w, 1920);
  const door = NAV.doors.find(d => d.id === SHIP_ANIMAL_ANNEX_V87.entrance.id);
  assert.deepEqual(door.parentBounds, SHIP_ANIMAL_ANNEX_V87.parentDoorBounds);
  assert.equal(door.annexBounds.x + door.annexBounds.w / 2, 144);
  assert.equal(door.progress, 0);
  assert.equal(NAV.rooms.find(r => r.id === 'crew-quarters').obstacles[0].x, 809);
  assert.equal(createShipAnimalRoutineGraphV87().valid, false);
});
test('default zero animals and acquired transport produce no fake residents or simulation', () => {
  for (const save of [base(), acquired()]) {
    const result = stepShipAnimalRoutinesV87(save, { delta: .25, graph: NAV });
    assert.equal(result.code, 'no-residents'); assert.equal(result.changed, false);
    assert.deepEqual(result.save, save);
    assert.deepEqual(sampleShipAnimalRoutinesV87(save, { roomId: 'animal-care', graph: NAV }), []);
  }
});
test('walking is gradual, supported, differently sized, and both animals keep their identity', () => {
  const before = resident(['animal-moka', 'animal-brume']);
  const save = advance(before, 7);
  assert.deepEqual(Object.keys(save.shipAnimalsV1.animals), ['animal-moka', 'animal-brume']);
  near(animal(save).location.x, 732); near(animal(save, 'animal-brume').location.x, 1214);
  assert.equal(animal(save).location.y, 624);
  assert.equal(animal(save).activity, 'walk');
  assert.equal(animal(save).routineV87.route.body.w, 38);
  assert.equal(animal(save, 'animal-brume').routineV87.route.body.w, 60);
  assert.equal(animal(before).location.x, 690);
});
test('full local routine actually reaches food and bed, eats, sleeps and walks back', () => {
  let save = resident(); animal(save).needs.satiety = 70; animal(save).needs.rest = 70;
  save = advance(save, 10); assert.equal(animal(save).activity, 'eat');
  near(animal(save).location.x, 790); assert.ok(animal(save).needs.satiety > 70);
  save = advance(save, 10); assert.equal(animal(save).activity, 'sleep');
  near(animal(save).location.x, 690); assert.ok(animal(save).needs.rest > 70);
  save = advance(save, 15); assert.equal(animal(save).activity, 'idle');
  near(animal(save).location.x, 560);
});
test('save/load mid-walk resumes the same position, animation and clock without duplicate simulation', () => {
  const current = advance(resident(), 7.25);
  const reloaded = { ...copy(current), shipAnimalsV1: migrateShipAnimalStateV87(JSON.parse(JSON.stringify(current.shipAnimalsV1))) };
  assert.deepEqual(reloaded, current);
  assert.deepEqual(advance(current, 4), advance(reloaded, 4));
  const repeated = stepShipAnimalRoutinesV87(current, { delta: .25, simulationTime: current.shipAnimalsV1.lastSimulationTime, graph: NAV });
  assert.equal(repeated.changed, false); assert.deepEqual(repeated.save, current);
});
test('clock accepts explicit active time only, rejects reverse time and wall-clock catch-up', () => {
  const current = advance(resident(), 1);
  const good = stepShipAnimalRoutinesV87(current, { delta: .25, simulationTime: 1.25, graph: NAV });
  assert.equal(good.ok, true); near(good.save.shipAnimalsV1.lastSimulationTime, 1.25);
  for (const options of [{ delta: 60 }, { delta: -.1 }, { delta: NaN },
    { delta: .25, simulationTime: 86400 }, { delta: .25, simulationTime: .5 }]) {
    const result = stepShipAnimalRoutinesV87(current, { graph: NAV, ...options });
    assert.equal(result.ok, false); assert.deepEqual(result.save, current);
  }
});
test('paused simulation and drawing do not change any authoritative state or needs', () => {
  const current = advance(resident(), 7);
  const before = copy(current);
  assert.equal(stepShipAnimalRoutinesV87(current, { delta: 99999, graph: NAV, paused: true }).changed, false);
  for (let i = 0; i < 20; i++) assert.equal(sampleShipAnimalRoutinesV87(current, { roomId: 'animal-care', graph: NAV })[0].clipId, 'walk');
  assert.deepEqual(sampleShipAnimalRoutinesV87(current, { roomId: 'mess', graph: NAV }), []);
  assert.deepEqual(current, before);
});
test('routines never change credits, crew, human character, mission clock or ownership receipts', () => {
  const current = resident(); const next = advance(current, 80);
  for (const key of ['galaxy', 'crew', 'player', 'clock', 'createdAt', 'profile']) assert.deepEqual(next[key], current[key]);
  for (const key of ['receipts', 'reservations', 'stock', 'transitions']) assert.deepEqual(next.shipAnimalsV1[key], current.shipAnimalsV1[key]);
  assert.equal(next.shipAnimalsV1.animals['animal-moka'].needs.health, 100);
  assert.equal('ownedAnimals' in next.shipAnimalsV1, false);
});
test('missing installed habitat and future/quarantined state fail closed without mutation', () => {
  const invalid = [];
  const missing = resident(); missing.shipAnimalsV1.habitats = {}; invalid.push(missing);
  const future = resident(); future.shipAnimalsV1.schema = 2; invalid.push(future);
  const quarantined = resident(); quarantined.shipAnimalsV1.quarantined.push({ path: 'source', code: 'review', original: 1 }); invalid.push(quarantined);
  for (const save of invalid) {
    const result = stepShipAnimalRoutinesV87(save, { delta: .25, graph: NAV });
    assert.equal(result.ok, false); assert.deepEqual(result.save, save);
  }
});
test('corrupted itinerary and foreign route actor fail closed instead of teleporting on reload', () => {
  const current = advance(resident(), 7);
  for (const edit of [
    a => { a.routineV87.route.actorId = 'animal-brume'; },
    a => { a.routineV87.route.speed = 200; },
    a => { a.routineV87.route.segments[0].duration = .001; },
    a => { a.location.x += 100; },
    a => { a.routineV87.schema = 88; }
  ]) {
    const bad = copy(current); edit(animal(bad));
    const result = stepShipAnimalRoutinesV87(bad, { delta: .25, graph: NAV });
    assert.equal(result.ok, false); assert.deepEqual(result.save, bad);
  }
});
test('new obstacle across food path stops at the last valid position, no jumping or fallback', () => {
  const current = advance(resident(), 7);
  const altered = copy(NAV);
  altered.rooms.find(r => r.id === 'animal-care').obstacles.push({ x: 755, y: 560, w: 20, h: 64 });
  const result = stepShipAnimalRoutinesV87(current, { delta: .25, graph: altered });
  assert.equal(result.ok, true); near(animal(result.save).location.x, animal(current).location.x);
  assert.equal(animal(result.save).routineV87.route.reason, 'path-obstructed');
});
test('petting needs live same-room feet proximity and cannot grant remote rewards', () => {
  const current = resident();
  for (const bad of [null, { ...player(current), x: 900 }, { ...player(current), y: 580 },
    { ...player(current), roomId: 'crew-quarters' }, { ...player(current), alive: false }]) {
    const result = petShipAnimalV87(current, { animalId: 'animal-moka', eventId: 'pet-1' }, { player: bad, graph: NAV });
    assert.equal(result.code, 'physical-proximity-required'); assert.deepEqual(result.save, current);
  }
});
test('pet clip lasts four poses, replay is idempotent and cooldown is active time', () => {
  const current = resident();
  const result = petShipAnimalV87(current, { animalId: 'animal-moka', eventId: 'pet-1' },
    { player: player(current), graph: NAV, simulationTime: 0 });
  assert.equal(result.ok, true); assert.equal(animal(result.save).needs.social, 80);
  assert.equal(sampleShipAnimalRoutinesV87(result.save, { roomId: 'animal-care', graph: NAV })[0].clipId, 'pet');
  const repeat = petShipAnimalV87(result.save, { animalId: 'animal-moka', eventId: 'pet-1' }, { graph: NAV });
  assert.equal(repeat.code, 'already-applied'); assert.equal(repeat.changed, false);
  const done = advance(result.save, 1.5); assert.equal(animal(done).activity, 'idle');
  const cooldown = petShipAnimalV87(done, { animalId: 'animal-moka', eventId: 'pet-2' }, { player: player(done), graph: NAV });
  assert.equal(cooldown.code, 'pet-cooldown');
  assert.deepEqual(result.save.galaxy, current.galaxy); assert.deepEqual(result.save.player, current.player);
});
test('petting a walking animal does not snap its route or stop it remotely', () => {
  const current = advance(resident(), 7);
  const result = petShipAnimalV87(current, { animalId: 'animal-moka', eventId: 'pet-walk' },
    { graph: NAV, player: player(current) });
  assert.equal(result.code, 'animal-busy'); assert.deepEqual(result.save, current);
});
test('manual outings reject distant unsafe rooms and true bunk collision in quarters', () => {
  const current = resident();
  for (const roomId of ['bioforge', 'mess', 'reactor', 'airlock'])
    assert.equal(requestShipAnimalWalkV87(current, { animalId: 'animal-moka', target: { roomId, x: 200, y: 624 } }, { graph: NAV }).ok, false);
  const blocked = requestShipAnimalWalkV87(current, { animalId: 'animal-moka', target: { roomId: 'crew-quarters', x: 1050, y: 624 } }, { graph: NAV });
  assert.equal(blocked.code, 'no-authorized-ground-route');
  assert.deepEqual(blocked.save, current);
});
test('closed annex door waits; an explicitly opened real door traverses one canonical location', () => {
  let save = requestShipAnimalWalkV87(resident(), { animalId: 'animal-moka',
    target: { roomId: 'crew-quarters', x: 520, y: 624 } }, { graph: NAV }).save;
  save = advance(save, 15);
  assert.equal(animal(save).routineV87.route.reason, 'door-closed');
  near(animal(save).location.x, 144); assert.equal(animal(save).location.roomId, 'animal-care');
  const open = NAV.doors.map(d => ({ ...d, progress: 1 }));
  save = advance(save, .25, { doors: open });
  assert.equal(animal(save).location.kind, 'transit');
  assert.equal('roomId' in animal(save).location, false);
  assert.deepEqual(migrateShipAnimalStateV87(save.shipAnimalsV1), save.shipAnimalsV1);
  const loaded = JSON.parse(JSON.stringify(save));
  assert.deepEqual(advance(save, 1, { doors: open }), advance(loaded, 1, { doors: open }));
  save = advance(save, 5, { doors: open });
  assert.equal(animal(save).location.kind, 'resident');
  assert.equal(animal(save).location.roomId, 'crew-quarters');
  near(animal(save).location.x, 520);
});
test('locked or removed live door cannot be traversed despite a formerly open route', () => {
  let save = requestShipAnimalWalkV87(resident(), { animalId: 'animal-moka',
    target: { roomId: 'crew-quarters', x: 520, y: 624 } }, { graph: NAV }).save;
  save = advance(save, 15);
  for (const doors of [[], NAV.doors.map(d => ({ ...d, progress: 1, locked: true }))]) {
    const stopped = advance(save, 1, { doors });
    near(animal(stopped).location.x, 144);
    assert.equal(animal(stopped).location.roomId, 'animal-care');
  }
});

test('render refuses absent graph, newer routine schemas and corrupted itinerary positions', () => {
  const current = advance(resident(), 7);
  assert.deepEqual(sampleShipAnimalRoutinesV87(current, { roomId: 'animal-care' }), []);
  for (const edit of [
    a => { a.routineV87.schema = 88; },
    a => { a.location.x += 100; },
    a => { a.routineV87.route.actorId = 'foreign'; }
  ]) {
    const bad = copy(current); edit(animal(bad));
    assert.deepEqual(sampleShipAnimalRoutinesV87(bad, { roomId: 'animal-care', graph: NAV }), []);
  }
});
test('numeric strings and overflowing revisions cannot be turned into persisted routine state', () => {
  const current = resident();
  assert.equal(stepShipAnimalRoutinesV87(current, { graph: NAV, delta: .25, simulationTime: '0.25' }).ok, false);
  for (const edit of [
    s => { s.shipAnimalsV1.revision = Number.MAX_SAFE_INTEGER; },
    s => { animal(s).revision = Number.MAX_SAFE_INTEGER; }
  ]) {
    const bad = copy(current); edit(bad);
    const result = stepShipAnimalRoutinesV87(bad, { graph: NAV, delta: .25 });
    assert.equal(result.code, 'invalid-revision'); assert.deepEqual(result.save, bad);
  }
});
test('deep-frozen inputs remain untouched and a small runtime envelope is supported', () => {
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  const current = freeze({ shipAnimalsV1: resident().shipAnimalsV1 });
  const result = stepShipAnimalRoutinesV87(current, { graph: NAV, delta: .25 });
  assert.equal(result.ok, true); assert.deepEqual(Object.keys(result.save), ['shipAnimalsV1']);
  assert.equal(animal(current).routineV87, undefined);
  assert.equal(animal(result.save).routineV87.phase, 'idle');
});
test('no wall clock, offline time, historical pet ID or repeated drawing advances routines', t => {
  const current = advance(resident(), 1);
  t.mock.method(Date, 'now', () => { throw new Error('Wall clock forbidden in animal simulation'); });
  const next = advance(current, 1);
  near(next.shipAnimalsV1.lastSimulationTime, 2);
  const result = petShipAnimalV87(next, { animalId: 'animal-moka', eventId: 'pet-canonical' },
    { graph: NAV, player: player(next) });
  assert.equal(result.ok, true);
  const replay = copy(result.save); animal(replay).routineV87.lastPetEventId = 'newer-pet-id';
  assert.equal(petShipAnimalV87(replay, { animalId: 'animal-moka', eventId: 'pet-canonical' },
    { graph: NAV, player: player(replay) }).code, 'already-applied');
});
test('real SaveSystem persists and reloads exact route; quota failure preserves durable and active state', () => {
  const values = new Map();
  const backend = { reject: false, getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.reject && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(key, value); },
    removeItem: key => values.delete(key) };
  const system = new SaveSystem(backend); system.newGame(1);
  system.commit({ shipAnimalsV1: advance(resident(), 7).shipAnimalsV1 });
  const root = system.data; const bytes = values.get(system.key()); const original = copy(root);
  const prepared = stepShipAnimalRoutinesV87({ shipAnimalsV1: root.shipAnimalsV1 }, { graph: NAV, delta: .25 });
  backend.reject = true;
  assert.throws(() => system.commit({ shipAnimalsV1: prepared.save.shipAnimalsV1 }), /Sauvegarde impossible/);
  assert.equal(values.get(system.key()), bytes); assert.deepEqual(system.data, original); assert.equal(system.data, root);
  backend.reject = false; system.commit({ shipAnimalsV1: prepared.save.shipAnimalsV1 });
  const restarted = new SaveSystem(backend); restarted.load(1);
  assert.deepEqual(restarted.data.shipAnimalsV1, prepared.save.shipAnimalsV1);
  assert.deepEqual(advance({ shipAnimalsV1: restarted.data.shipAnimalsV1 }, 1),
    advance(prepared.save, 1));
});
