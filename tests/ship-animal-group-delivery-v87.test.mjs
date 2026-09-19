import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireShipAnimalV87, migrateShipAnimalStateV87, getShipAnimalOfferMembersV87,
  SHIP_ANIMAL_DEFINITIONS_V87 as DEFINITIONS, SHIP_ANIMAL_OFFERS_V87 as OFFERS } from '../src/ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87, installShipAnimalHabitatV87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_MEETINGS_V87, SHIP_PORT_ANNEX_V87 } from '../src/ship-port-room-v87.js';
import { initializeShipAnimalDeliveryV87, pickupShipAnimalDeliveryV87, stepShipAnimalDeliveryV87,
  dropShipAnimalDeliveryV87, receiveShipAnimalDeliveryV87, sampleShipAnimalDeliveriesV87,
  getShipAnimalDeliveryUnitV87 } from '../src/ship-animal-delivery-v87.js';
import { createDefaultSave, SaveSystem, SAVE_PREFIX } from '../src/save.js';

const copy = value => structuredClone(value);
const GROUPS = ['offer-noisette-cafe', 'offer-tic-tac'];
const ok = result => { assert.equal(result.ok, true, result.code); return result.save; };
const animal = (save, id) => save.shipAnimalsV1.animals[id];
function purchase(save, offerId) {
  const offer = OFFERS[offerId], ids = getShipAnimalOfferMembersV87(offer);
  const h = getShipAnimalHabitatsV87(save).find(h => h.id === DEFINITIONS[ids[0]].defaultHabitatId);
  const meeting = SHIP_PORT_MEETINGS_V87.find(m => m.animalId === ids[0]);
  return ok(acquireShipAnimalV87(save, { offerId, habitatId: h.id, transactionId: 'buy-' + offerId },
    { vendorAccessible: true, vendorId: offer.vendorId, artReadyIds: ids, habitats: getShipAnimalHabitatsV87(save),
      care: { available: true, capacity: 7 }, simulationTime: save.shipAnimalsV1.lastSimulationTime,
      transit: { edgeId: 'port-to-pair-pen', from: { hubId: 'frontier-civil-relay', roomId: 'frontier-civil-counter',
        deckId: 'engineering', x: meeting.x, y: 624 }, to: h.location } }));
}
function fixture(offerId = GROUPS[0]) {
  let save = createDefaultSave();
  for (const h of getShipAnimalHabitatsV87(save)) save = ok(installShipAnimalHabitatV87(save, h.id,
    { roomId: 'animal-care', playerX: h.installX, feetY: 624, artReady: true }));
  save = purchase(save, offerId);
  const ids = getShipAnimalOfferMembersV87(offerId), first = animal(save, ids[0]);
  const h = getShipAnimalHabitatsV87(save).find(h => h.id === first.habitatId);
  const player = { ...first.location.from, alive: true };
  return { save, ids, h, player, offerId };
}
function initialized(f = fixture()) {
  f.save = ok(initializeShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] })); return f;
}
function picked(f = initialized()) {
  f.save = ok(pickupShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] }, { player: f.player, portAccessible: true })); return f;
}
function tick(f, player = f.player, options = {}) {
  f.save = ok(stepShipAnimalDeliveryV87(f.save, { delta: .25, simulationTime: f.save.shipAnimalsV1.lastSimulationTime + .25 }, { player, ...options }));
  f.player = player; return f;
}
function move(f, x, roomId = f.player.roomId, deckId = f.player.deckId) {
  if (roomId !== f.player.roomId || deckId !== f.player.deckId) return tick(f, { ...f.player, x, roomId, deckId });
  while (Math.abs(x - f.player.x) > .001) tick(f, { ...f.player, x: f.player.x + Math.sign(x - f.player.x) * Math.min(60, Math.abs(x - f.player.x)) });
  return f;
}
function atPen(f = picked()) {
  // Domain checkpoint fixtures; real navigation is separately verified by the browser harness.
  for (const [x, room, deck] of [
    [200, 'frontier-civil-counter', 'engineering'],
    [SHIP_PORT_ANNEX_V87.parentDoorBounds.x + SHIP_PORT_ANNEX_V87.parentDoorBounds.w / 2, 'dropship-hangar', 'engineering'],
    [1250, 'dropship-hangar', 'engineering'], [1300, 'reactor', 'engineering'], [2372, 'reactor', 'engineering'],
    [2372, 'armory', 'industrial'], [2372, 'mess', 'habitat'], [1300, 'mess', 'habitat'],
    [1250, 'crew-quarters', 'habitat'], [704, 'crew-quarters', 'habitat'], [255, 'animal-care', 'habitat'],
    [f.h.receivingPoint.x, 'animal-care', 'habitat']
  ]) move(f, x, room, deck);
  return f;
}
function received(f = atPen()) {
  f.save = ok(receiveShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] }, { player: f.player })); return f;
}
function memory() {
  const values = new Map(); return { values, reject: false,
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.reject && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(key, value); },
    removeItem: key => values.delete(key) };
}

for (const offerId of GROUPS) {
  test(offerId + ': partner pickup resolves one shared transport unit and one route, without merging identities', () => {
    const f = initialized(fixture(offerId)), before = copy(f.save);
    const first = animal(f.save, f.ids[0]), second = animal(f.save, f.ids[1]);
    assert.deepEqual(first.deliveryV87.memberIds, f.ids); assert.equal(first.deliveryV87.unitId, first.acquisition.transactionId);
    assert.deepEqual(second.deliveryV87, { schema: 87, unitId: first.deliveryV87.unitId, leaderId: first.id });
    assert.equal(sampleShipAnimalDeliveriesV87(f.save).length, 1);
    assert.deepEqual(getShipAnimalDeliveryUnitV87(f.save, f.ids[0]), getShipAnimalDeliveryUnitV87(f.save, f.ids[1]));
    assert.deepEqual(initializeShipAnimalDeliveryV87(f.save, { animalId: f.ids[0] }).save, before);
    picked(f);
    const unit = sampleShipAnimalDeliveriesV87(f.save)[0];
    assert.equal(unit.carried, true); assert.deepEqual(unit.animalIds, f.ids); assert.equal(unit.animalId, f.ids[0]);
    assert.ok(f.ids.every(id => animal(f.save, id).activity === 'carried'));
    assert.deepEqual(f.save.galaxy, before.galaxy); assert.deepEqual(f.save.shipAnimalsV1.receipts, before.shipAnimalsV1.receipts);
    assert.equal(pickupShipAnimalDeliveryV87(f.save, { animalId: f.ids[0] }, { player: f.player, portAccessible: true }).code, 'already-picked-up');
  });

  test(offerId + ': both canonical locations progress together; receipt, reservations and clocks stay singular', () => {
    const f = atPen(picked(initialized(fixture(offerId))));
    assert.equal(animal(f.save, f.ids[0]).deliveryV87.checkpoints.length, 4);
    assert.ok(animal(f.save, f.ids[0]).deliveryV87.waypoints.length <= 32);
    assert.ok(f.ids.every(id => animal(f.save, id).location.kind === 'transit' && animal(f.save, id).location.progress === .8));
    assert.equal(new Set(f.ids.map(id => animal(f.save, id).lastSimulationTime)).size, 1);
    assert.equal(Object.keys(f.save.shipAnimalsV1.receipts).length, 1);
    assert.equal(Object.keys(f.save.shipAnimalsV1.transitions).length, 4);
    const repeat = stepShipAnimalDeliveryV87(f.save, { delta: .25, simulationTime: f.save.shipAnimalsV1.lastSimulationTime }, { player: f.player });
    assert.equal(repeat.changed, false); assert.deepEqual(repeat.save, f.save);
  });

  test(offerId + ': reception requires proof and own pen, then two-second intake plus four-second acclimation for both', () => {
    const f = picked(initialized(fixture(offerId)));
    const teleport = { ...f.player, roomId: 'animal-care', deckId: 'habitat', x: f.h.receivingPoint.x };
    assert.equal(receiveShipAnimalDeliveryV87(f.save, { animalId: f.ids[0] }, { player: teleport }).code, 'physical-route-incomplete');
    atPen(f);
    assert.equal(receiveShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] }, { player: { ...f.player, x: 690 } }).ok, false);
    received(f); const money = copy(f.save.galaxy);
    for (const id of f.ids) { assert.equal(animal(f.save, id).location.kind, 'intake'); assert.equal(animal(f.save, id).location.y, 612); }
    const unit = sampleShipAnimalDeliveriesV87(f.save)[0]; assert.equal(unit.x, f.h.receivingPoint.x); assert.equal(unit.y, 624);
    for (let i = 0; i < 7; i++) tick(f);
    assert.ok(f.ids.every(id => animal(f.save, id).location.kind === 'intake'));
    tick(f); assert.ok(f.ids.every(id => animal(f.save, id).location.kind === 'acclimating'));
    f.save = JSON.parse(JSON.stringify(f.save));
    for (let i = 0; i < 15; i++) tick(f);
    assert.ok(f.ids.every(id => animal(f.save, id).location.kind === 'acclimating'));
    tick(f); assert.ok(f.ids.every(id => animal(f.save, id).location.kind === 'resident'));
    for (const id of f.ids) assert.deepEqual(animal(f.save, id).location, { kind: 'resident', ...f.h.memberLocations[id] });
    assert.deepEqual(sampleShipAnimalDeliveriesV87(f.save), []); assert.deepEqual(f.save.galaxy, money);
    assert.equal(getShipAnimalDeliveryUnitV87(f.save, f.ids[1]).phase, 'delivered');
    assert.equal(receiveShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] }, { player: f.player }).code, 'already-received');
    assert.deepEqual(migrateShipAnimalStateV87(f.save.shipAnimalsV1), f.save.shipAnimalsV1);
  });
}

test('one carried unit permits its two members but never a second pair or a singleton crate', () => {
  const f = picked();
  for (const offer of ['offer-tic-tac', 'offer-animal-moka']) {
    const next = purchase(f.save, offer), id = getShipAnimalOfferMembersV87(offer)[0];
    const source = animal(next, id).location.from;
    const result = pickupShipAnimalDeliveryV87(next, { animalId: id }, { player: { ...source, alive: true }, portAccessible: true });
    assert.equal(result.code, 'hands-occupied'); assert.deepEqual(result.save, next);
  }
});

test('drop from either member leaves both at the last proven anchor, and recovery never restarts the route or debits again', () => {
  const f = picked(); move(f, 200);
  const before = copy(f.save), prior = getShipAnimalDeliveryUnitV87(before, f.ids[0]).delivery;
  f.save = ok(dropShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] }));
  assert.equal(getShipAnimalDeliveryUnitV87(f.save, f.ids[0]).phase, 'awaiting-recovery');
  for (const id of f.ids) assert.deepEqual(animal(f.save, id).location, animal(before, id).location);
  assert.deepEqual(animal(f.save, f.ids[0]).deliveryV87.carrierLocation, prior.carrierLocation);
  assert.deepEqual(animal(f.save, f.ids[0]).deliveryV87.checkpoints, prior.checkpoints);
  assert.equal(dropShipAnimalDeliveryV87(f.save, { animalId: f.ids[0] }).code, 'already-awaiting-recovery');
  const reload = copy(f.save); reload.shipAnimalsV1 = migrateShipAnimalStateV87(reload.shipAnimalsV1);
  const bad = pickupShipAnimalDeliveryV87(reload, { animalId: f.ids[0] }, { player: { ...f.player, x: 2130 }, portAccessible: false });
  assert.equal(bad.code, 'physical-recovery-required'); assert.deepEqual(bad.save, reload);
  f.save = ok(pickupShipAnimalDeliveryV87(reload, { animalId: f.ids[1] }, { player: f.player, portAccessible: false }));
  assert.deepEqual(animal(f.save, f.ids[0]).deliveryV87.checkpoints, prior.checkpoints);
  assert.deepEqual(f.save.galaxy, before.galaxy); assert.equal(Object.keys(f.save.shipAnimalsV1.receipts).length, 1);
});

for (const [name, change] of [
  ['missing partner reference', (s, ids) => { delete animal(s, ids[1]).deliveryV87; }],
  ['missing leader route', (s, ids) => { delete animal(s, ids[0]).deliveryV87; }],
  ['foreign leader', (s, ids) => { animal(s, ids[1]).deliveryV87.leaderId = 'animal-tic'; }],
  ['different unit', (s, ids) => { animal(s, ids[1]).deliveryV87.unitId = 'other'; }],
  ['duplicate carried partner', (s, ids) => { animal(s, ids[1]).deliveryV87 = copy(animal(s, ids[0]).deliveryV87); }],
  ['foreign member list', (s, ids) => { animal(s, ids[0]).deliveryV87.memberIds[1] = 'animal-tic'; }],
  ['future reference schema', (s, ids) => { animal(s, ids[1]).deliveryV87.schema = 88; }],
  ['forged checkpoint', (s, ids) => { animal(s, ids[0]).deliveryV87.checkpoints = [{ roomId: 'animal-care', deckId: 'habitat', x: 255, y: 624, time: 0 }]; }],
  ['split source', (s, ids) => { animal(s, ids[1]).location.from.x++; }]
]) test('group delivery corruption ' + name + ' blocks rather than losing, recreating or displaying either member', () => {
  const f = picked(); change(f.save, f.ids); const before = copy(f.save);
  assert.deepEqual(sampleShipAnimalDeliveriesV87(f.save), []); assert.equal(getShipAnimalDeliveryUnitV87(f.save, f.ids[1]), null);
  for (const result of [pickupShipAnimalDeliveryV87(f.save, { animalId: f.ids[1] }, { player: f.player, portAccessible: true }),
    dropShipAnimalDeliveryV87(f.save, { animalId: f.ids[0] }),
    stepShipAnimalDeliveryV87(f.save, { delta: .25 }, { player: f.player })]) {
    assert.equal(result.ok, false); assert.deepEqual(result.save, before);
  }
  assert.deepEqual(f.save, before);
});

test('pause, blocked transfer, leaving intake and inactive time cannot advance either member', t => {
  const f = received(), before = copy(f.save);
  t.mock.method(Date, 'now', () => { throw new Error('No offline animal clock'); });
  for (const options of [{ paused: true }, { transferBlocked: true }, { player: { ...f.player, x: 300 } }]) {
    const result = stepShipAnimalDeliveryV87(f.save, { delta: .25 }, { player: f.player, ...options });
    assert.equal(result.changed, false); assert.deepEqual(result.save, before);
  }
  assert.equal(stepShipAnimalDeliveryV87(f.save, { delta: 10000 }, { player: f.player }).ok, false);
  for (let i = 0; i < 8; i++) tick(f);
  assert.equal(getShipAnimalDeliveryUnitV87(f.save, f.ids[0]).phase, 'acclimating');
});

test('quota/reload during group portage and reception preserves both members, one trace, exact clock and receipt', () => {
  const f = picked(), storage = memory(), system = new SaveSystem(storage); system.newGame(1); system.commit(f.save);
  move(f, 1900); const before = copy(system.data), bytes = storage.getItem(system.key());
  storage.reject = true; assert.throws(() => system.commit(f.save), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(system.data, before); assert.equal(storage.getItem(system.key()), bytes);
  storage.reject = false; system.commit(f.save);
  const reloaded = new SaveSystem(storage); reloaded.load(1); assert.deepEqual(reloaded.data.shipAnimalsV1, f.save.shipAnimalsV1);
  f.save = reloaded.data; received(atPen(f)); system.commit(f.save);
  const restart = new SaveSystem(storage); restart.load(1); assert.deepEqual(restart.data.shipAnimalsV1, f.save.shipAnimalsV1);
  const projected = sampleShipAnimalDeliveriesV87(restart.data); projected[0].animalIds.pop();
  assert.equal(sampleShipAnimalDeliveriesV87(restart.data)[0].animalIds.length, 2);
});
