import test from 'node:test';
import assert from 'node:assert/strict';
import { SHIP_ANIMAL_DEFINITIONS_V87 as DEFINITIONS, SHIP_ANIMAL_OFFERS_V87 as OFFERS,
  createEmptyShipAnimalStateV87, migrateShipAnimalStateV87, acquireShipAnimalV87 } from '../src/ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87, installShipAnimalHabitatV87, SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_MEETINGS_V87, SHIP_PORT_ANNEX_V87 } from '../src/ship-port-room-v87.js';
import { SHIP_PORT_DEFINITION_V87 as PORT } from '../src/ship-port-state-v87.js';
import { initializeShipAnimalDeliveryV87, pickupShipAnimalDeliveryV87, stepShipAnimalDeliveryV87,
  receiveShipAnimalDeliveryV87 } from '../src/ship-animal-delivery-v87.js';
import { SaveSystem, SAVE_PREFIX, createDefaultSave } from '../src/save.js';

const copy = value => structuredClone(value);
const ID = 'animal-luciole', OFFER = 'offer-animal-luciole';
const success = result => { assert.equal(result.ok, true, result.code); return result.save; };
function fitted(save = createDefaultSave()) {
  for (const habitat of getShipAnimalHabitatsV87(save)) save = success(installShipAnimalHabitatV87(save, habitat.id,
    { roomId: 'animal-care', playerX: habitat.installX, feetY: 624, artReady: true }));
  return save;
}
function context(save, animalId = ID) {
  const habitats = getShipAnimalHabitatsV87(save);
  const habitat = habitats.find(entry => entry.id === DEFINITIONS[animalId].defaultHabitatId);
  const meeting = SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === animalId);
  return { vendorAccessible: true, artReadyIds: Object.keys(DEFINITIONS), habitats,
    care: { available: true, capacity: 3 }, simulationTime: save.shipAnimalsV1.lastSimulationTime,
    transit: { edgeId: 'luciole-test-delivery',
      from: { hubId: PORT.id, roomId: PORT.counterRoomId, deckId: 'engineering', x: meeting.x, y: 624 }, to: habitat.location } };
}
const request = (animalId = ID) => ({ offerId: 'offer-' + animalId,
  habitatId: DEFINITIONS[animalId].defaultHabitatId, transactionId: 'buy-' + animalId });
const buy = (save, animalId = ID) => success(acquireShipAnimalV87(save, request(animalId), context(save, animalId)));
function legacy(raw) { const value = copy(raw); delete value.catalogRevision; delete value.stock[OFFER]; return value; }

test('Luciole retains authored original identity, 220-credit offer, and a distinct one-cat berth without default ownership', () => {
  assert.equal(DEFINITIONS[ID].familyId, 'cat-domestic');
  assert.equal(DEFINITIONS[ID].visualId, 'original-luciole');
  assert.equal(DEFINITIONS[ID].appearance, 'Chatte blanche et rousse, queue touffue, silhouette compacte.');
  assert.deepEqual(DEFINITIONS[ID].traits, ['sociable', 'joueuse', 'prudente']);
  assert.deepEqual(DEFINITIONS[ID].preferences, { likes: 'Une balle légère', avoids: 'Les portes qui claquent' });
  assert.equal(OFFERS[OFFER].costCredits, 220); assert.equal(OFFERS[OFFER].vendorId, 'station-shop');
  const fresh = createEmptyShipAnimalStateV87();
  assert.equal(fresh.catalogRevision, 2); assert.deepEqual(fresh.animals, {});
  assert.deepEqual(fresh.reservations, {}); assert.deepEqual(fresh.receipts, {});
  assert.equal(Object.keys(fresh.stock).length, 3);
  const habitats = getShipAnimalHabitatsV87({});
  assert.equal(new Set(habitats.map(h => h.id)).size, 3);
  assert.equal(new Set(habitats.map(h => h.location.x)).size, 3);
  assert.ok(habitats.every(h => h.capacity === 1 && !h.installed));
  assert.equal(habitats.find(h => h.designatedAnimalId === ID).id, DEFINITIONS[ID].defaultHabitatId);
});

test('catalogue1 migration adds only the new unbought offer while preserving Moka in transit and every linked record', () => {
  const original = buy(fitted(), 'animal-moka');
  const raw = legacy(original.shipAnimalsV1), before = copy(raw);
  const next = migrateShipAnimalStateV87(raw);
  assert.deepEqual(raw, before); assert.equal(next.catalogRevision, 2);
  assert.deepEqual(next.quarantined, []); assert.equal(next.animals['animal-moka'].location.kind, 'transit');
  for (const key of ['animals', 'reservations', 'receipts', 'transitions', 'habitats', 'revision', 'lastSimulationTime'])
    assert.deepEqual(next[key], raw[key], key);
  assert.deepEqual(next.stock['offer-animal-moka'], raw.stock['offer-animal-moka']);
  assert.deepEqual(next.stock['offer-animal-brume'], raw.stock['offer-animal-brume']);
  assert.deepEqual(next.stock[OFFER], { animalId: ID, status: 'available' });
  assert.deepEqual(migrateShipAnimalStateV87(next), next);
  const purchased = buy({ ...original, shipAnimalsV1: next });
  assert.equal(purchased.galaxy.resources.credits, original.galaxy.resources.credits - 220);
  assert.deepEqual(purchased.shipAnimalsV1.animals['animal-moka'], original.shipAnimalsV1.animals['animal-moka']);
});

test('current catalogue2 missing stock cannot be replenished by migration or bought', () => {
  const save = fitted(); delete save.shipAnimalsV1.stock[OFFER];
  const state = migrateShipAnimalStateV87(save.shipAnimalsV1);
  assert.equal(state.stock[OFFER].status, 'unavailable');
  assert.ok(state.quarantined.some(entry => entry.path === 'stock.' + OFFER));
  assert.deepEqual(migrateShipAnimalStateV87(state), state);
  const result = acquireShipAnimalV87(save, request(), context(save));
  assert.equal(result.ok, false); assert.deepEqual(result.save, save);
});

test('legacy catalogue only adds Luciole when no ownership, receipt or quarantine trace already exists', () => {
  const save = buy(fitted());
  for (const raw of [legacy(save.shipAnimalsV1),
    { ...legacy(createEmptyShipAnimalStateV87()), quarantined: [{ path: 'animals.' + ID, code: 'invalid-entry', original: { retained: true } }] }]) {
    const state = migrateShipAnimalStateV87(raw);
    assert.equal(state.stock[OFFER].status, 'unavailable');
    assert.ok(state.quarantined.length > 0);
    assert.deepEqual(migrateShipAnimalStateV87(state), state);
  }
});

test('missing old stock and explicit corrupt or unavailable Luciole stock remain blocked rather than repaired', () => {
  const missingOld = legacy(createEmptyShipAnimalStateV87()); delete missingOld.stock['offer-animal-moka'];
  assert.equal(migrateShipAnimalStateV87(missingOld).stock['offer-animal-moka'].status, 'unavailable');
  for (const entry of [null, { animalId: ID, status: 'invented' }, { animalId: 'animal-moka', status: 'available' },
    { animalId: ID, status: 'unavailable' }]) {
    const raw = legacy(createEmptyShipAnimalStateV87()); raw.stock[OFFER] = entry;
    const next = migrateShipAnimalStateV87(raw);
    assert.equal(next.stock[OFFER].status, 'unavailable');
    if (entry?.status !== 'unavailable') assert.ok(next.quarantined.some(q => q.path === 'stock.' + OFFER));
  }
});

test('unsupported catalogue revisions and future schemas are retained and cannot trigger a purchase', () => {
  for (const revision of [3, 99, -1, '2', null]) {
    const save = fitted(); save.shipAnimalsV1.catalogRevision = revision;
    const next = migrateShipAnimalStateV87(save.shipAnimalsV1);
    assert.deepEqual(next.catalogRevision, revision);
    assert.ok(next.quarantined.some(entry => entry.path === 'catalogRevision'));
    assert.deepEqual(migrateShipAnimalStateV87(next), next);
    assert.equal(acquireShipAnimalV87(save, request(), context(save)).ok, false);
  }
  const future = { schema: 12, catalogRevision: 900, animalsFuture: [ID], untouched: true };
  assert.deepEqual(migrateShipAnimalStateV87(future), future);
});

test('buying Luciole before Moka reserves her own berth; all three companions consume three real slots once', () => {
  const original = fitted(); let save = buy(original);
  assert.equal(save.shipAnimalsV1.animals[ID].habitatId, 'luciole-berth-v87');
  assert.equal(save.shipAnimalsV1.animals[ID].location.to.x, 354);
  const replay = acquireShipAnimalV87(save, request(), {});
  assert.equal(replay.code, 'already-applied'); assert.deepEqual(replay.save, save);
  save = buy(save, 'animal-moka'); save = buy(save, 'animal-brume');
  assert.equal(save.galaxy.resources.credits, original.galaxy.resources.credits - 740);
  assert.equal(new Set(Object.values(save.shipAnimalsV1.reservations).map(entry => entry.habitatId)).size, 3);
  assert.equal(Object.keys(save.shipAnimalsV1.receipts).length, 3);
  assert.ok(Object.values(save.shipAnimalsV1.animals).every(entry => entry.location.kind === 'transit'));
  assert.deepEqual(migrateShipAnimalStateV87(save.shipAnimalsV1), save.shipAnimalsV1);
});

test('a same-family berth cannot substitute for the other individual and capacity still gates acquisition', () => {
  const save = fitted(); const c = context(save);
  const wrong = { ...request(), habitatId: 'moka-berth-v87' };
  assert.equal(acquireShipAnimalV87(save, wrong, c).code, 'habitat-unavailable');
  const absent = copy(c); absent.habitats.find(h => h.id === request().habitatId).installed = false;
  assert.equal(acquireShipAnimalV87(save, request(), absent).code, 'habitat-unavailable');
  const full = copy(c); full.habitats.find(h => h.id === request().habitatId).capacity = 0;
  assert.equal(acquireShipAnimalV87(save, request(), full).code, 'habitat-full');
  const two = buy(buy(save, 'animal-moka'), 'animal-brume'); const shortCare = context(two); shortCare.care.capacity = 2;
  assert.equal(acquireShipAnimalV87(two, request(), shortCare).code, 'care-unavailable');
});

test('real SaveSystem persists the catalogue upgrade, isolates other profiles, and rolls back a failed Luciole purchase', () => {
  const values = new Map(); const storage = { reject: false,
    getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.reject && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(key, value); },
    removeItem: key => values.delete(key) };
  const system = new SaveSystem(storage); system.newGame(1);
  const initial = buy(fitted(system.data), 'animal-moka');
  system.commit({ ...initial, shipAnimalsV1: legacy(initial.shipAnimalsV1) });
  const reloaded = new SaveSystem(storage); reloaded.load(1);
  assert.equal(reloaded.data.shipAnimalsV1.catalogRevision, 2);
  assert.equal(reloaded.data.shipAnimalsV1.stock[OFFER].status, 'available');
  const before = copy(reloaded.data), bytes = values.get(reloaded.key()); const candidate = buy(before);
  storage.reject = true;
  assert.throws(() => reloaded.commit(candidate), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(reloaded.data, before); assert.equal(values.get(reloaded.key()), bytes);
  storage.reject = false; reloaded.commit(candidate);
  assert.equal(new SaveSystem(storage).load(1).shipAnimalsV1.animals[ID].location.kind, 'transit');
  const other = new SaveSystem(storage); other.newGame(2);
  assert.deepEqual(other.data.shipAnimalsV1.animals, {}); assert.deepEqual(other.data.shipAnimalsV1.receipts, {});
});

test('Luciole furniture is ground aligned, independent, noncollidable and separated from Moka equipment and the exit', () => {
  const props = SHIP_ANIMAL_ANNEX_V87.props.filter(prop => prop.habitatId === 'luciole-berth-v87');
  assert.equal(props.length, 6);
  const ordered = [...props].sort((a, b) => a.x - b.x);
  for (const [i, prop] of ordered.entries()) {
    assert.equal(prop.collidable, false); assert.ok(Math.abs(prop.y + prop.h - 624) < 1e-6);
    assert.ok(prop.x > 262 && prop.x + prop.w <= 508);
    if (i) assert.ok(ordered[i - 1].x + ordered[i - 1].w <= prop.x);
  }
  assert.ok(ordered.at(-1).x + ordered.at(-1).w < SHIP_ANIMAL_ANNEX_V87.props.find(p => p.id === 'cat-hygiene').x);
  assert.equal(getShipAnimalHabitatsV87({}).find(h => h.id === 'luciole-berth-v87').installX, 354);
});

test('Luciole delivery keeps physical pickup, route proof, intake/acclimation and save/reload stages', () => {
  let save = success(initializeShipAnimalDeliveryV87(buy(fitted()), { animalId: ID }));
  const meeting = SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === ID);
  let player = { roomId: PORT.counterRoomId, deckId: 'engineering', x: meeting.x, y: 624, alive: true };
  assert.equal(save.shipAnimalsV1.animals[ID].deliveryV87.phase, 'awaiting-pickup');
  save = success(pickupShipAnimalDeliveryV87(save, { animalId: ID }, { player, portAccessible: true }));
  const notArrived = receiveShipAnimalDeliveryV87(save, { animalId: ID }, { player: { ...player, roomId: 'animal-care', deckId: 'habitat', x: 354 } });
  assert.equal(notArrived.ok, false); assert.deepEqual(notArrived.save, save);
  const tick = next => {
    save = success(stepShipAnimalDeliveryV87(save, { delta: .25, simulationTime: save.shipAnimalsV1.lastSimulationTime + .25 }, { player: next }));
    player = next;
  };
  // Domain route proof only: the separate browser harness proves real keyboard/collision traversal.
  for (const [x, roomId, deckId] of [
    [200, PORT.counterRoomId, 'engineering'],
    [SHIP_PORT_ANNEX_V87.parentDoorBounds.x + SHIP_PORT_ANNEX_V87.parentDoorBounds.w / 2, PORT.commandRoomId, 'engineering'],
    [1250, PORT.commandRoomId, 'engineering'], [1300, 'reactor', 'engineering'], [2372, 'reactor', 'engineering'],
    [2372, 'armory', 'industrial'], [2372, 'mess', 'habitat'], [1300, 'mess', 'habitat'],
    [1250, 'crew-quarters', 'habitat'], [704, 'crew-quarters', 'habitat'], [255, 'animal-care', 'habitat'], [354, 'animal-care', 'habitat']
  ]) {
    if (roomId !== player.roomId || deckId !== player.deckId) tick({ ...player, x, roomId, deckId });
    else while (Math.abs(x - player.x) > .001) tick({ ...player, x: player.x + Math.sign(x - player.x) * Math.min(60, Math.abs(x - player.x)) });
  }
  assert.equal(save.shipAnimalsV1.animals[ID].deliveryV87.phase, 'carried');
  assert.equal(receiveShipAnimalDeliveryV87(save, { animalId: ID }, { player: { ...player, x: 690 } }).ok, false);
  save = success(receiveShipAnimalDeliveryV87(save, { animalId: ID }, { player }));
  assert.equal(save.shipAnimalsV1.animals[ID].location.kind, 'intake');
  for (let i = 0; i < 8; i++) tick(player);
  assert.equal(save.shipAnimalsV1.animals[ID].location.kind, 'acclimating');
  save = { ...copy(save), shipAnimalsV1: migrateShipAnimalStateV87(JSON.parse(JSON.stringify(save.shipAnimalsV1))) };
  for (let i = 0; i < 16; i++) tick(player);
  assert.equal(save.shipAnimalsV1.animals[ID].location.kind, 'resident');
  assert.equal(save.shipAnimalsV1.animals[ID].location.x, 354);
  assert.equal(save.shipAnimalsV1.animals[ID].deliveryV87.phase, 'delivered');
  assert.equal(Object.keys(save.shipAnimalsV1.receipts).length, 1);
});
