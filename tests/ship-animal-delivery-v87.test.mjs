import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_PREFIX } from '../src/save.js';
import { SHIP_PORT_ANNEX_V87 } from '../src/ship-port-room-v87.js';
import { validateShipPortDepartureV87 } from '../src/ship-port-state-v87.js';
import { createShipAnimalRoutineGraphV87, stepShipAnimalRoutinesV87 } from '../src/ship-animal-routines-v87.js';
import { acquireShipAnimalV87, migrateShipAnimalStateV87 } from '../src/ship-animal-state-v87.js';
import { installShipAnimalHabitatV87, getShipAnimalHabitatsV87 } from '../src/ship-animal-habitat-v87.js';
import { initializeShipAnimalDeliveryV87, pickupShipAnimalDeliveryV87, stepShipAnimalDeliveryV87,
  receiveShipAnimalDeliveryV87, sampleShipAnimalDeliveriesV87, dropShipAnimalDeliveryV87 } from '../src/ship-animal-delivery-v87.js';

const copy = value => structuredClone(value);
const animal = (save, id = 'animal-moka') => save.shipAnimalsV1.animals[id];
const portPlayer = (animalId = 'animal-moka') => ({ roomId: 'frontier-civil-counter', deckId: 'engineering',
  x: animalId === 'animal-moka' ? 990 : 1435, y: 624, alive: true });
function purchased(ids = ['animal-moka']) {
  let save = { profile: 1, createdAt: 7, galaxy: { resources: { credits: 3200, medical: 12 } },
    player: { health: 100 }, crew: [{ health: 90 }], clock: { day: 1, hour: 9 } };
  for (const habitat of getShipAnimalHabitatsV87(save)) {
    const installed = installShipAnimalHabitatV87(save, habitat.id,
      { roomId: 'animal-care', playerX: habitat.installX, feetY: 624, artReady: true });
    assert.equal(installed.ok, true); save = installed.save;
  }
  for (const id of ids) {
    const habitat = getShipAnimalHabitatsV87(save).find(h => h.type === (id === 'animal-moka' ? 'cat-berth' : 'dog-berth'));
    const result = acquireShipAnimalV87(save, { offerId: 'offer-' + id, transactionId: 'purchase-' + id,
      habitatId: habitat.id }, { vendorAccessible: true, artReadyIds: ids,
      habitats: getShipAnimalHabitatsV87(save), care: { available: true, capacity: 2 }, simulationTime: 0,
      transit: { edgeId: 'frontier-delivery-' + id,
        from: { hubId: 'frontier-civil-relay', roomId: 'frontier-civil-counter', deckId: 'engineering',
          x: portPlayer(id).x, y: 624 }, to: habitat.location } });
    assert.equal(result.ok, true); save = initializeShipAnimalDeliveryV87(result.save, { animalId: id }).save;
  }
  return save;
}
function pickup(save = purchased(), id = 'animal-moka') {
  const result = pickupShipAnimalDeliveryV87(save, { animalId: id }, { player: portPlayer(id), portAccessible: true });
  assert.equal(result.ok, true, result.code); return result.save;
}
function tick(save, player, options = {}) {
  const result = stepShipAnimalDeliveryV87(save, { delta: .25, simulationTime: save.shipAnimalsV1.lastSimulationTime + .25 },
    { player, ...options });
  assert.equal(result.ok, true, result.code); return result.save;
}
function move(save, player, x, roomId = player.roomId, deckId = player.deckId) {
  if (roomId !== player.roomId || deckId !== player.deckId) {
    const next = { ...player, x, roomId, deckId };
    return { save: tick(save, next), player: next };
  }
  while (Math.abs(x - player.x) > .001) {
    player = { ...player, x: player.x + Math.sign(x - player.x) * Math.min(150, Math.abs(x - player.x)) };
    save = tick(save, player);
  }
  return { save, player };
}
function atBerth(save = pickup(), id = 'animal-moka') {
  let player = { ...portPlayer(id) };
  let state = { save, player };
  // Trace the actual gangway, corridors, midship shaft and care door.
  for (const [x, room, deck] of [
    [200, 'frontier-civil-counter', 'engineering'],
    [SHIP_PORT_ANNEX_V87.parentDoorBounds.x + SHIP_PORT_ANNEX_V87.parentDoorBounds.w / 2, 'dropship-hangar', 'engineering'],
    [1250, 'dropship-hangar', 'engineering'],
    [1300, 'reactor', 'engineering'], [2372, 'reactor', 'engineering'],
    [2372, 'armory', 'industrial'], [2372, 'mess', 'habitat'],
    [1300, 'mess', 'habitat'], [1250, 'crew-quarters', 'habitat'],
    [704, 'crew-quarters', 'habitat'], [255, 'animal-care', 'habitat'],
    [id === 'animal-moka' ? 690 : 1160, 'animal-care', 'habitat']
  ]) state = move(state.save, state.player, x, room, deck);
  return state;
}
function received() {
  const state = atBerth();
  const result = receiveShipAnimalDeliveryV87(state.save, { animalId: 'animal-moka' }, { player: state.player });
  assert.equal(result.ok, true, result.code); return { save: result.save, player: state.player };
}

test('initialization adds metadata only to acquired exact-source transport; default stays empty', () => {
  const fresh = { galaxy: { resources: { credits: 3200 } } };
  assert.equal(initializeShipAnimalDeliveryV87(fresh, { animalId: 'animal-moka' }).code, 'animal-not-owned');
  assert.deepEqual(sampleShipAnimalDeliveriesV87(fresh), []);
  const current = purchased(); const before = copy(current);
  const repeat = initializeShipAnimalDeliveryV87(current, { animalId: 'animal-moka' });
  assert.equal(repeat.changed, false); assert.deepEqual(repeat.save, before);
  assert.equal(animal(current).deliveryV87.phase, 'awaiting-pickup');
  assert.equal(sampleShipAnimalDeliveriesV87(current)[0].x, 990);
});
test('wrong source, habitat, stock or foreign delivery schema fail closed without free adoption', () => {
  const current = purchased();
  for (const mutate of [
    s => { delete animal(s).deliveryV87; animal(s).location.from.hubId = 'unrelated'; },
    s => { delete animal(s).deliveryV87; animal(s).location.to.x += 100; },
    s => { s.shipAnimalsV1.stock['offer-animal-moka'].status = 'available'; },
    s => { animal(s).deliveryV87.schema = 88; },
    s => { s.shipAnimalsV1.schema = 2; },
    s => { s.shipAnimalsV1.quarantined.push({ path: 'test', code: 'review', original: 1 }); }
  ]) {
    const save = copy(current); mutate(save);
    const result = pickupShipAnimalDeliveryV87(save, { animalId: 'animal-moka' },
      { player: portPlayer(), portAccessible: true });
    assert.equal(result.ok, false); assert.deepEqual(result.save, save);
  }
});
test('pickup requires real live proximity and accessible counter, and never debits twice', () => {
  const save = purchased(); const before = copy(save);
  for (const context of [
    { player: portPlayer(), portAccessible: false },
    { player: { ...portPlayer(), x: 800 }, portAccessible: true },
    { player: { ...portPlayer(), roomId: 'dropship-hangar' }, portAccessible: true },
    { player: { ...portPlayer(), alive: false }, portAccessible: true },
    { player: { ...portPlayer(), y: 580 }, portAccessible: true }
  ]) assert.equal(pickupShipAnimalDeliveryV87(save, { animalId: 'animal-moka' }, context).ok, false);
  const next = pickup(save); assert.equal(animal(next).deliveryV87.phase, 'carried');
  assert.equal(pickupShipAnimalDeliveryV87(next, { animalId: 'animal-moka' }).changed, false);
  assert.deepEqual(save, before); assert.deepEqual(next.galaxy, save.galaxy);
});
test('only one crate may be carried; second acquired animal stays at the counter', () => {
  const next = pickup(purchased(['animal-moka', 'animal-brume']));
  const result = pickupShipAnimalDeliveryV87(next, { animalId: 'animal-brume' },
    { player: portPlayer('animal-brume'), portAccessible: true });
  assert.equal(result.code, 'hands-occupied');
  assert.equal(animal(result.save, 'animal-brume').deliveryV87.phase, 'awaiting-pickup');
});
test('trace records bounded real waypoints and ordered port, hangar, quarters and care checkpoints', () => {
  const state = atBerth();
  const delivery = animal(state.save).deliveryV87;
  assert.deepEqual(delivery.checkpoints.map(p => p.roomId),
    ['frontier-civil-counter', 'dropship-hangar', 'crew-quarters', 'animal-care']);
  assert.ok(delivery.waypoints.length <= 32);
  assert.equal(animal(state.save).location.kind, 'transit'); assert.equal(animal(state.save).location.progress, .8);
  assert.deepEqual(sampleShipAnimalDeliveriesV87(state.save)[0],
    { animalId: 'animal-moka', phase: 'carried', elapsed: 0, roomId: 'animal-care', deckId: 'habitat',
      x: 690, y: 624, carried: true, checkpoints: 4 });
});
test('same-room warps, premature care arrival, arbitrary decks and false room claims are rejected', () => {
  const current = pickup();
  for (const player of [
    { ...portPlayer(), x: 200 },
    { roomId: 'animal-care', deckId: 'habitat', x: 690, y: 624 },
    { roomId: 'crew-quarters', deckId: 'habitat', x: 704, y: 624 },
    { roomId: 'reactor', deckId: 'engineering', x: 200, y: 624 }
  ]) {
    const result = stepShipAnimalDeliveryV87(current, { delta: .25 }, { player });
    assert.equal(result.ok, false); assert.deepEqual(result.save, current);
  }
});
test('receiving requires all physical route checkpoints and last carried pose at own habitat', () => {
  const carried = pickup();
  assert.equal(receiveShipAnimalDeliveryV87(carried, { animalId: 'animal-moka' },
    { player: { roomId: 'animal-care', deckId: 'habitat', x: 690, y: 624 } }).code, 'physical-route-incomplete');
  const state = atBerth();
  for (const player of [{ ...state.player, x: 1160 }, { ...state.player, x: 695 }, { ...state.player, y: 580 }]) {
    const result = receiveShipAnimalDeliveryV87(state.save, { animalId: 'animal-moka' }, { player });
    assert.equal(result.code, 'physical-reception-required');
  }
  const result = receiveShipAnimalDeliveryV87(state.save, { animalId: 'animal-moka' }, { player: state.player });
  assert.equal(result.code, 'intake-started'); assert.equal(animal(result.save).location.kind, 'intake');
  assert.equal(animal(result.save).deliveryV87.carrierLocation, null);
  assert.equal(receiveShipAnimalDeliveryV87(result.save, { animalId: 'animal-moka' }).changed, false);
});
test('intake needs two active seconds and acclimation four further seconds before residence', () => {
  let { save, player } = received();
  for (let i = 0; i < 7; i++) save = tick(save, player);
  assert.equal(animal(save).location.kind, 'intake'); assert.equal(animal(save).deliveryV87.elapsed, 1.75);
  save = tick(save, player); assert.equal(animal(save).location.kind, 'acclimating');
  for (let i = 0; i < 15; i++) save = tick(save, player);
  assert.equal(animal(save).location.kind, 'acclimating');
  save = tick(save, player); assert.equal(animal(save).location.kind, 'resident');
  assert.equal(animal(save).deliveryV87.phase, 'delivered'); assert.deepEqual(sampleShipAnimalDeliveriesV87(save), []);
  assert.deepEqual(migrateShipAnimalStateV87(save.shipAnimalsV1), save.shipAnimalsV1);
});
test('walking away, dialogue pause, transfer blockage and huge delta do not finish intake', () => {
  const state = received(); const original = copy(state.save);
  for (const context of [
    { player: { ...state.player, x: 1200 } }, { player: state.player, paused: true },
    { player: state.player, transferBlocked: true }
  ]) assert.equal(stepShipAnimalDeliveryV87(state.save, { delta: .25 }, context).changed, false);
  assert.equal(stepShipAnimalDeliveryV87(state.save, { delta: 6 }, { player: state.player }).ok, false);
  assert.deepEqual(state.save, original);
});
test('save reload during portage and reception resumes exact clock without duplicate steps', () => {
  let current = pickup();
  current = move(current, portPlayer(), 840).save;
  const loaded = JSON.parse(JSON.stringify(current));
  const player = { ...portPlayer(), x: 700 };
  assert.deepEqual(tick(current, player), tick(loaded, player));
  const once = tick(current, player);
  const duplicate = stepShipAnimalDeliveryV87(once, { delta: .25, simulationTime: once.shipAnimalsV1.lastSimulationTime }, { player });
  assert.equal(duplicate.changed, false);
  const intake = received();
  assert.deepEqual(tick(intake.save, intake.player), tick(JSON.parse(JSON.stringify(intake.save)), intake.player));
});
test('cooperative clock accepts routines-first tick without doubling and clamps paused catch-up to dt', () => {
  let current = pickup(); current.shipAnimalsV1.lastSimulationTime = .25;
  let result = stepShipAnimalDeliveryV87(current, { delta: .25, simulationTime: .25 }, { player: portPlayer() });
  assert.equal(result.ok, true); assert.equal(result.save.shipAnimalsV1.lastSimulationTime, .25);
  assert.equal(animal(result.save).deliveryV87.lastSimulationTime, .25);
  const intake = received(); intake.save.shipAnimalsV1.lastSimulationTime += 100;
  result = stepShipAnimalDeliveryV87(intake.save,
    { delta: .25, simulationTime: intake.save.shipAnimalsV1.lastSimulationTime }, { player: intake.player });
  assert.equal(result.ok, true); assert.equal(animal(result.save).deliveryV87.elapsed, .25);
});
test('wall clock is never read and render cannot acquire, move, deliver or change needs', t => {
  const state = received(); const original = copy(state.save);
  t.mock.method(Date, 'now', () => { throw new Error('No wall clock allowed'); });
  for (let i = 0; i < 50; i++) assert.equal(sampleShipAnimalDeliveriesV87(state.save)[0].phase, 'intake');
  assert.deepEqual(state.save, original);
  assert.equal(tick(state.save, state.player).shipAnimalsV1.animals['animal-moka'].deliveryV87.elapsed, .25);
});
test('forged checkpoint order and mismatched current waypoint are rejected, not repaired', () => {
  const state = atBerth();
  for (const mutate of [
    d => { d.checkpoints[1].roomId = 'crew-quarters'; },
    d => { d.checkpoints.pop(); },
    d => { d.carrierLocation.x += 100; },
    d => { d.waypoints.at(-1).time = 99999; }
  ]) {
    const bad = copy(state.save); mutate(animal(bad).deliveryV87);
    assert.equal(stepShipAnimalDeliveryV87(bad, { delta: .25 }, { player: state.player }).ok, false);
    assert.deepEqual(sampleShipAnimalDeliveriesV87(bad), []);
  }
});
test('delivery never changes human stats, credits, canonical animal identity or owns another list', () => {
  const start = pickup(); const state = atBerth(start);
  for (const key of ['galaxy', 'player', 'crew', 'clock']) assert.deepEqual(state.save[key], start[key]);
  for (const key of ['name', 'visualId', 'familyId', 'habitatId', 'acquisition', 'needs'])
    assert.deepEqual(animal(state.save)[key], animal(start)[key]);
  assert.deepEqual(Object.keys(state.save.shipAnimalsV1.animals), ['animal-moka']);
  assert.equal('ownedAnimals' in state.save, false);
});
test('real atomic SaveSystem and quota failure preserve carry route across reload', () => {
  const values = new Map(); const backend = { reject: false, getItem: k => values.get(k) ?? null,
    setItem(k, v) { if (this.reject && k.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(k, v); },
    removeItem: k => values.delete(k) };
  const system = new SaveSystem(backend); system.newGame(1);
  system.commit({ shipAnimalsV1: pickup().shipAnimalsV1 });
  const original = copy(system.data); const bytes = values.get(system.key());
  const result = stepShipAnimalDeliveryV87({ shipAnimalsV1: system.data.shipAnimalsV1 }, { delta: .25 },
    { player: { ...portPlayer(), x: 840 } });
  assert.equal(result.ok, true);
  backend.reject = true;
  assert.throws(() => system.commit({ shipAnimalsV1: result.save.shipAnimalsV1 }), /Sauvegarde impossible/);
  assert.deepEqual(system.data, original); assert.equal(values.get(system.key()), bytes);
  backend.reject = false; system.commit({ shipAnimalsV1: result.save.shipAnimalsV1 });
  assert.deepEqual(new SaveSystem(backend).load(1).shipAnimalsV1, result.save.shipAnimalsV1);
});

test('Brume reaches its distinct dog berth while Moka remains at the port', () => {
  const start = pickup(purchased(['animal-moka', 'animal-brume']), 'animal-brume');
  const state = atBerth(start, 'animal-brume');
  const received = receiveShipAnimalDeliveryV87(state.save, { animalId: 'animal-brume' }, { player: state.player });
  assert.equal(received.ok, true);
  assert.equal(animal(received.save, 'animal-brume').location.x, 1160);
  assert.equal(animal(received.save).deliveryV87.phase, 'awaiting-pickup');
  assert.deepEqual(received.save.galaxy, start.galaxy);
});
test('multiple-carried corruption is rejected, and the recent foot trace remains bounded at 32', () => {
  const current = pickup(purchased(['animal-moka', 'animal-brume']));
  const brumeOnly = pickup(purchased(['animal-brume']), 'animal-brume');
  const corrupted = copy(current);
  animal(corrupted, 'animal-brume').deliveryV87 = copy(animal(brumeOnly, 'animal-brume').deliveryV87);
  assert.equal(stepShipAnimalDeliveryV87(corrupted, { delta: .25 }, { player: portPlayer() }).code, 'multiple-carried-containers');
  let save = current;
  for (let i = 0; i < 100; i++) save = tick(save, { ...portPlayer(), x: 990 + (i % 2) });
  assert.equal(animal(save).deliveryV87.waypoints.length, 32);
  assert.deepEqual(migrateShipAnimalStateV87(save.shipAnimalsV1), save.shipAnimalsV1);
});
test('completed delivery metadata survives resident routines and is not treated as another crate', () => {
  let state = received();
  for (let i = 0; i < 24; i++) state.save = tick(state.save, state.player);
  const graph = createShipAnimalRoutineGraphV87({ floor: { id: 'habitat:floor', x: 0, y: 624, w: 5120 } });
  const stepped = stepShipAnimalRoutinesV87(state.save, { delta: .25, graph });
  assert.equal(stepped.ok, true);
  assert.equal(animal(stepped.save).deliveryV87.phase, 'delivered');
  assert.deepEqual(sampleShipAnimalDeliveriesV87(stepped.save), []);
  const result = stepShipAnimalDeliveryV87(stepped.save, { delta: .25,
    simulationTime: stepped.save.shipAnimalsV1.lastSimulationTime }, { player: state.player });
  assert.equal(result.code, 'no-active-delivery');
  assert.equal(result.changed, false);
});
test('deep-frozen source and delivery schema remain immutable with a small runtime envelope', () => {
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  const original = freeze({ shipAnimalsV1: pickup().shipAnimalsV1 });
  const result = stepShipAnimalDeliveryV87(original, { delta: .25 }, { player: { ...portPlayer(), x: 840 } });
  assert.equal(result.ok, true);
  assert.equal(animal(original).deliveryV87.carrierLocation.x, 990);
  assert.equal(animal(result.save).deliveryV87.carrierLocation.x, 840);
  assert.deepEqual(Object.keys(result.save), ['shipAnimalsV1']);
});

function dropped(save = atBerth().save) {
  const result = dropShipAnimalDeliveryV87(save, { animalId: 'animal-moka' }, { reason: 'carrier-discontinuity' });
  assert.equal(result.ok, true, result.code); return result.save;
}

test('carrier loss drops only the phase at the last validated pose, never at the respawn', () => {
  const current = atBerth().save; const before = copy(current);
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  freeze(current);
  const result = dropShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { reason: 'carrier-discontinuity' });
  assert.equal(result.code, 'awaiting-recovery'); assert.equal(result.changed, true);
  const expected = copy(before); expected.shipAnimalsV1.revision += 1;
  animal(expected).revision += 1; animal(expected).deliveryV87.phase = 'awaiting-recovery';
  assert.deepEqual(result.save, expected); assert.deepEqual(current, before);
  assert.deepEqual(result.events, [{ type: 'animal-container-dropped', animalId: 'animal-moka', reason: 'carrier-discontinuity' }]);
  assert.deepEqual(sampleShipAnimalDeliveriesV87(result.save), [{ animalId: 'animal-moka', phase: 'awaiting-recovery',
    elapsed: 0, roomId: 'animal-care', deckId: 'habitat', x: 690, y: 624, carried: false, checkpoints: 4 }]);
  assert.deepEqual(validateShipPortDepartureV87(result.save),
    { ok: false, code: 'animal-transfer-incomplete', animalId: 'animal-moka' });
});

test('drop replay after reload is idempotent and does not fabricate acquisition or reception', () => {
  const current = dropped(); const loaded = JSON.parse(JSON.stringify(current));
  const repeat = dropShipAnimalDeliveryV87(loaded, { animalId: 'animal-moka' });
  assert.equal(repeat.code, 'already-awaiting-recovery'); assert.equal(repeat.changed, false);
  assert.deepEqual(repeat.events, []); assert.deepEqual(repeat.save, current);
  assert.equal(dropShipAnimalDeliveryV87(purchased(), { animalId: 'animal-moka' }).code, 'container-not-carried');
  assert.equal(dropShipAnimalDeliveryV87(received().save, { animalId: 'animal-moka' }).code, 'container-not-carried');
  assert.equal(dropShipAnimalDeliveryV87(current, { animalId: 'unknown' }).code, 'animal-not-owned');
  assert.equal(dropShipAnimalDeliveryV87(pickup(), { animalId: 'animal-moka' }, { reason: 'teleport' }).code, 'invalid-drop-reason');
  assert.equal(receiveShipAnimalDeliveryV87(current, { animalId: 'animal-moka' },
    { player: { roomId: 'animal-care', deckId: 'habitat', x: 690, y: 624, alive: true } }).code, 'physical-route-incomplete');
});

test('drop and recovery fail closed on corrupt pose, proofs, future schema or clock without projecting a crate', () => {
  for (const mutate of [
    s => { animal(s).deliveryV87.carrierLocation.x += 1; },
    s => { animal(s).deliveryV87.waypoints.at(-1).time += 1; },
    s => { animal(s).deliveryV87.checkpoints.reverse(); },
    s => { animal(s).deliveryV87.checkpoints.pop(); },
    s => { animal(s).deliveryV87.schema = 88; },
    s => { animal(s).deliveryV87.carrierLocation = null; },
    s => { s.shipAnimalsV1.lastSimulationTime = 0; },
    s => { s.shipAnimalsV1.schema = 2; }
  ]) {
    for (const recovery of [false, true]) {
      const source = atBerth(); const current = recovery ? dropped(source.save) : source.save; mutate(current);
      const result = recovery
        ? pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: source.player })
        : dropShipAnimalDeliveryV87(current, { animalId: 'animal-moka' });
      assert.equal(result.ok, false); assert.equal(result.changed, false);
      assert.deepEqual(result.save, current); assert.deepEqual(result.events, []);
      assert.deepEqual(sampleShipAnimalDeliveriesV87(current), []);
    }
  }
});

test('recovery requires an explicitly live player in the same room and deck within 85 horizontal and 12 vertical units', () => {
  const current = dropped(); const player = { roomId: 'animal-care', deckId: 'habitat', x: 690, y: 624, alive: true };
  for (const wrong of [
    { ...player, x: 775.001 }, { ...player, x: 604.999 }, { ...player, y: 611.999 },
    { ...player, roomId: 'crew-quarters' }, { ...player, deckId: 'engineering' },
    { ...player, alive: false }, { ...player, alive: undefined }, { ...player, alive: 1 },
    { ...player, x: NaN }, { ...player, y: Infinity }, null
  ]) {
    const result = pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: wrong });
    assert.equal(result.code, 'physical-recovery-required'); assert.deepEqual(result.save, current);
  }
  for (const nearPlayer of [{ ...player, x: 775, y: 612 }, { ...player, x: 605 }, player]) {
    const result = pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: nearPlayer, portAccessible: false });
    assert.equal(result.code, 'recovered'); assert.equal(result.changed, true);
    assert.deepEqual(result.events, [{ type: 'animal-container-recovered', animalId: 'animal-moka' }]);
    assert.equal(animal(result.save).deliveryV87.phase, 'carried');
    assert.deepEqual(animal(result.save).deliveryV87.checkpoints, animal(current).deliveryV87.checkpoints);
    assert.deepEqual(animal(result.save).location, animal(current).location);
    assert.deepEqual(animal(result.save).deliveryV87.waypoints,
      [...animal(current).deliveryV87.waypoints, { roomId: nearPlayer.roomId, deckId: nearPlayer.deckId,
        x: nearPlayer.x, y: nearPlayer.y, time: current.shipAnimalsV1.lastSimulationTime }].slice(-32));
    assert.deepEqual(result.save.galaxy, current.galaxy);
  }
});

test('dropped crate remains frozen through active ticks, pauses, blocked transfer and render time', t => {
  const current = dropped(); const before = copy(current);
  t.mock.method(Date, 'now', () => { throw new Error('No wall clock allowed'); });
  for (const context of [{ player: portPlayer() }, { player: portPlayer(), paused: true },
    { player: portPlayer(), transferBlocked: true }]) {
    const result = stepShipAnimalDeliveryV87(current, { delta: .25 }, context);
    assert.equal(result.changed, false); assert.deepEqual(result.save, before);
  }
  for (let i = 0; i < 50; i++) assert.equal(sampleShipAnimalDeliveriesV87(current)[0].x, 690);
  assert.deepEqual(current, before);
});

test('recovery uses the current simulation clock without catch-up or resetting ordered path proof', () => {
  const source = atBerth(); const current = dropped(source.save);
  current.shipAnimalsV1.lastSimulationTime += 100;
  const time = current.shipAnimalsV1.lastSimulationTime;
  for (const simulationTime of [time - 1, time + 1, Infinity, NaN]) {
    const denied = pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: source.player, simulationTime });
    assert.equal(denied.code, 'invalid-simulation-time'); assert.deepEqual(denied.save, current);
  }
  const result = pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: source.player, simulationTime: time });
  assert.equal(result.code, 'recovered'); assert.equal(result.save.shipAnimalsV1.lastSimulationTime, time);
  assert.equal(animal(result.save).deliveryV87.lastSimulationTime, time);
  assert.equal(animal(result.save).deliveryV87.carrierLocation.time, time);
  assert.equal(animal(result.save).deliveryV87.elapsed, 0);
  assert.deepEqual(animal(result.save).deliveryV87.checkpoints, animal(current).deliveryV87.checkpoints);
  assert.deepEqual(pickupShipAnimalDeliveryV87(result.save, { animalId: 'animal-moka' }).save, result.save);
  const duplicate = stepShipAnimalDeliveryV87(result.save, { delta: .25, simulationTime: time }, { player: source.player });
  assert.equal(duplicate.changed, false);
  const intake = receiveShipAnimalDeliveryV87(result.save, { animalId: 'animal-moka' }, { player: source.player, simulationTime: time });
  assert.equal(intake.code, 'intake-started');
  assert.equal(animal(tick(intake.save, source.player)).deliveryV87.elapsed, .25);
});

test('recovery respects one-carrier limit while a dropped second crate keeps its own anchor', () => {
  let current = dropped(pickup(purchased(['animal-moka', 'animal-brume'])));
  current = pickup(current, 'animal-brume');
  const denied = pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: portPlayer() });
  assert.equal(denied.code, 'hands-occupied'); assert.deepEqual(denied.save, current);
  assert.deepEqual(sampleShipAnimalDeliveriesV87(current).map(p => [p.animalId, p.x, p.carried]),
    [['animal-moka', 990, false], ['animal-brume', 1435, true]]);
  const brumeDrop = dropShipAnimalDeliveryV87(current, { animalId: 'animal-brume' });
  assert.equal(brumeDrop.ok, true);
  const recovered = pickupShipAnimalDeliveryV87(brumeDrop.save, { animalId: 'animal-moka' }, { player: portPlayer() });
  assert.equal(recovered.code, 'recovered');
  assert.equal(animal(recovered.save, 'animal-brume').deliveryV87.phase, 'awaiting-recovery');
});

test('real hangar discontinuity can recover then finish transport without skipping or duplicating checkpoints', () => {
  let state = move(pickup(), portPlayer(), 200);
  state = move(state.save, state.player,
    SHIP_PORT_ANNEX_V87.parentDoorBounds.x + SHIP_PORT_ANNEX_V87.parentDoorBounds.w / 2, 'dropship-hangar', 'engineering');
  state = move(state.save, state.player, 1000);
  const failed = stepShipAnimalDeliveryV87(state.save, { delta: .25 },
    { player: { roomId: 'crew-quarters', deckId: 'habitat', x: 300, y: 624, alive: true } });
  assert.equal(failed.code, 'discontinuous-carry'); assert.deepEqual(failed.save, state.save);
  const current = dropped(failed.save);
  assert.equal(sampleShipAnimalDeliveriesV87(current)[0].x, 1000);
  const recovery = pickupShipAnimalDeliveryV87(current, { animalId: 'animal-moka' }, { player: state.player });
  assert.equal(recovery.code, 'recovered'); state.save = recovery.save;
  for (const [x, room, deck] of [
    [1250, 'dropship-hangar', 'engineering'], [1300, 'reactor', 'engineering'], [2372, 'reactor', 'engineering'],
    [2372, 'armory', 'industrial'], [2372, 'mess', 'habitat'], [1300, 'mess', 'habitat'],
    [1250, 'crew-quarters', 'habitat'], [704, 'crew-quarters', 'habitat'], [255, 'animal-care', 'habitat'], [690, 'animal-care', 'habitat']
  ]) state = move(state.save, state.player, x, room, deck);
  assert.equal(animal(state.save).deliveryV87.checkpoints.length, 4);
  const received = receiveShipAnimalDeliveryV87(state.save, { animalId: 'animal-moka' }, { player: state.player });
  assert.equal(received.code, 'intake-started'); state.save = received.save;
  for (let i = 0; i < 24; i++) state.save = tick(state.save, state.player);
  assert.equal(animal(state.save).deliveryV87.phase, 'delivered');
  assert.equal(validateShipPortDepartureV87(state.save).code, 'departure-clear');
});

test('drop and recovery persist atomically across quota failure and reload without another debit', () => {
  const values = new Map(); const backend = { reject: false, getItem: k => values.get(k) ?? null,
    setItem(k, v) { if (this.reject && k.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(k, v); },
    removeItem: k => values.delete(k) };
  const system = new SaveSystem(backend); system.newGame(1);
  const source = atBerth(); system.commit({ shipAnimalsV1: source.save.shipAnimalsV1 });
  const before = copy(system.data), bytes = values.get(system.key());
  const drop = dropShipAnimalDeliveryV87(system.data, { animalId: 'animal-moka' });
  backend.reject = true;
  assert.throws(() => system.commit({ shipAnimalsV1: drop.save.shipAnimalsV1 }), /Sauvegarde impossible/);
  assert.deepEqual(system.data, before); assert.equal(values.get(system.key()), bytes);
  backend.reject = false; system.commit({ shipAnimalsV1: drop.save.shipAnimalsV1 });
  const loaded = new SaveSystem(backend).load(1);
  assert.deepEqual(loaded.shipAnimalsV1, drop.save.shipAnimalsV1);
  const result = pickupShipAnimalDeliveryV87(loaded, { animalId: 'animal-moka' }, { player: source.player });
  assert.equal(result.code, 'recovered'); assert.deepEqual(result.save.galaxy, loaded.galaxy);
  system.commit({ shipAnimalsV1: result.save.shipAnimalsV1 });
  assert.deepEqual(new SaveSystem(backend).load(1).shipAnimalsV1, result.save.shipAnimalsV1);
});
