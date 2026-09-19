import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  SHIP_ANIMAL_DEFINITIONS_V87, SHIP_ANIMAL_OFFERS_V87, createEmptyShipAnimalStateV87,
  migrateShipAnimalStateV87, acquireShipAnimalV87, transitionShipAnimalV87, isShipAnimalLocationValidV87
} from '../src/ship-animal-state-v87.js';

const place = (roomId = 'animal-care', x = 120) => ({ hubId: 'uss-tantalus', roomId, deckId: 'habitat', x, y: 610 });
const save = () => ({ profile: 'campaign-a', galaxy: { resources: { credits: 1000, medical: 12 } },
  memorial: [{ name: 'Marine mémoire' }], story: { chapter: 3 } });
const request = (animalId = 'animal-moka', transactionId = `purchase-${animalId}`) => ({
  offerId: `offer-${animalId}`, transactionId, habitatId: animalId === 'animal-moka' ? 'cat-bed-1' : 'dog-bed-1'
});
const context = () => ({ vendorAccessible: true, artReadyIds: ['animal-moka', 'animal-brume'],
  care: { available: true, capacity: 2 }, simulationTime: 10,
  habitats: [
    { id: 'cat-bed-1', type: 'cat-berth', installed: true, capacity: 1, location: place() },
    { id: 'dog-bed-1', type: 'dog-berth', installed: true, capacity: 1, location: place() }
  ], transit: { edgeId: 'port-care-route', from: place('port-shop', 40), to: place() } });
const purchased = () => acquireShipAnimalV87(save(), request(), context()).save;
const approve = { canTransition: () => true };
function move(current, location, transactionId, extra = {}) {
  return transitionShipAnimalV87(current, { animalId: 'animal-moka', transactionId, location }, { ...approve, ...extra });
}
function arrived() {
  let current = purchased();
  const full = { ...current.shipAnimalsV1.animals['animal-moka'].location, progress: 1 };
  let result = move(current, full, 'transport-progress'); assert.equal(result.ok, true); current = result.save;
  result = move(current, { kind: 'intake', ...place() }, 'arrival', { transportComplete: true });
  assert.equal(result.ok, true); return result.save;
}
function resident() {
  let result = move(arrived(), { kind: 'acclimating', ...place() }, 'check', { arrivalCheckPassed: true });
  assert.equal(result.ok, true);
  result = move(result.save, { kind: 'resident', ...place() }, 'settled', { acclimationComplete: true });
  assert.equal(result.ok, true); return result.save;
}
function freezeDeep(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeDeep); Object.freeze(value); }
  return value;
}

test('released original individuals are Moka, Brume and Luciole with authored IDs and all-inclusive proposed prices', () => {
  assert.deepEqual(Object.keys(SHIP_ANIMAL_DEFINITIONS_V87), ['animal-moka', 'animal-brume', 'animal-luciole']);
  assert.equal(SHIP_ANIMAL_DEFINITIONS_V87['animal-moka'].familyId, 'cat-domestic');
  assert.equal(SHIP_ANIMAL_DEFINITIONS_V87['animal-brume'].familyId, 'dog-companion');
  assert.equal(SHIP_ANIMAL_OFFERS_V87['offer-animal-moka'].costCredits, 220);
  assert.equal(SHIP_ANIMAL_OFFERS_V87['offer-animal-brume'].costCredits, 300);
  assert.equal(SHIP_ANIMAL_DEFINITIONS_V87['animal-luciole'].familyId, 'cat-domestic');
  assert.equal(SHIP_ANIMAL_OFFERS_V87['offer-animal-luciole'].costCredits, 220);
  assert.ok(Object.values(SHIP_ANIMAL_DEFINITIONS_V87).every(Object.isFrozen));
});

test('new campaigns contain zero acquired animals; migration is pure and idempotent', () => {
  const fresh = createEmptyShipAnimalStateV87();
  assert.deepEqual(fresh.animals, {});
  assert.deepEqual(fresh.reservations, {});
  assert.deepEqual(fresh.receipts, {});
  assert.deepEqual(migrateShipAnimalStateV87(undefined), fresh);
  assert.deepEqual(migrateShipAnimalStateV87(freezeDeep(fresh)), fresh);
  assert.notEqual(migrateShipAnimalStateV87(fresh), fresh);
});

test('acquisition prepares exactly one debit, ownership, reservation, stock mutation and receipt without touching input', () => {
  const original = save(); const before = structuredClone(original);
  const result = acquireShipAnimalV87(freezeDeep(original), freezeDeep(request()), freezeDeep(context()));
  assert.equal(result.ok, true);
  assert.equal(result.code, 'acquired');
  assert.equal(result.changed, true);
  assert.deepEqual(original, before);
  assert.equal(result.save.galaxy.resources.credits, 780);
  assert.equal(result.save.galaxy.resources.medical, 12);
  assert.deepEqual(result.save.memorial, before.memorial);
  assert.deepEqual(result.save.story, before.story);
  const state = result.save.shipAnimalsV1;
  assert.deepEqual(Object.keys(state.animals), ['animal-moka']);
  assert.equal(state.animals['animal-moka'].location.kind, 'transit');
  assert.equal(state.stock['offer-animal-moka'].status, 'sold');
  assert.deepEqual(state.reservations['animal-moka'], { animalId: 'animal-moka', habitatId: 'cat-bed-1', slots: 1 });
  assert.equal(Object.keys(state.receipts).length, 1);
  assert.equal(state.receipts['purchase-animal-moka'].costCredits, 220);
  assert.deepEqual(migrateShipAnimalStateV87(state), state);
  result.animal.name = 'Independent copy';
  assert.equal(state.animals['animal-moka'].name, 'Moka');
});

test('exact replay is idempotent even when the vendor later closes; another click cannot debit or duplicate', () => {
  const current = purchased();
  const replay = acquireShipAnimalV87(current, request(), { vendorAccessible: false });
  assert.equal(replay.ok, true); assert.equal(replay.changed, false); assert.equal(replay.code, 'already-applied');
  assert.deepEqual(replay.save, current);
  const second = acquireShipAnimalV87(current, request('animal-moka', 'second-click'), context());
  assert.equal(second.ok, false); assert.equal(second.code, 'already-owned');
  assert.deepEqual(second.save, current);
  const conflict = acquireShipAnimalV87(current, request('animal-brume', request().transactionId), context());
  assert.equal(conflict.code, 'transaction-conflict');
  assert.equal(conflict.save.galaxy.resources.credits, 780);
});

test('two separate individuals consume two separate berths and charge only their authored prices', () => {
  const first = purchased();
  const second = acquireShipAnimalV87(first, request('animal-brume'), context());
  assert.equal(second.ok, true);
  assert.equal(second.save.galaxy.resources.credits, 480);
  assert.deepEqual(Object.keys(second.save.shipAnimalsV1.animals), ['animal-moka', 'animal-brume']);
  assert.equal(Object.keys(second.save.shipAnimalsV1.reservations).length, 2);
  assert.deepEqual(migrateShipAnimalStateV87(second.save.shipAnimalsV1), second.save.shipAnimalsV1);
});

for (const [code, alter] of [
  ['vendor-inaccessible', c => { c.vendorAccessible = false; }],
  ['art-not-ready', c => { c.artReadyIds = []; }],
  ['habitat-unavailable', c => { c.habitats = []; }],
  ['habitat-unavailable', c => { c.habitats[0].installed = false; }],
  ['habitat-unavailable', c => { c.habitats[0].type = 'aquarium'; }],
  ['habitat-unavailable', c => { c.habitats[0].location.x = NaN; }],
  ['habitat-full', c => { c.habitats[0].capacity = 0; }],
  ['care-unavailable', c => { c.care.available = false; }],
  ['care-unavailable', c => { c.care.capacity = 0; }],
  ['invalid-transit', c => { c.transit.to = place('wrong-room'); }],
  ['invalid-transit', c => { c.transit.edgeId = ''; }],
  ['invalid-simulation-time', c => { c.simulationTime = -1; }]
]) test(`acquisition guard ${code}: missing prerequisite never charges, creates or reserves`, () => {
  const original = save(); const c = context(); alter(c);
  const result = acquireShipAnimalV87(original, request(), c);
  assert.equal(result.ok, false); assert.equal(result.code, code); assert.equal(result.changed, false);
  assert.deepEqual(result.save, original);
  assert.equal(original.shipAnimalsV1, undefined);
});

test('credit and care accounting use real galaxy resources and all already reserved individuals', () => {
  const original = save(); original.galaxy.resources.credits = 219; original.resources = { credits: 99999 };
  assert.equal(acquireShipAnimalV87(original, request(), context()).code, 'insufficient-credits');
  const c = context(); c.care.capacity = 1;
  assert.equal(acquireShipAnimalV87(purchased(), request('animal-brume'), c).code, 'care-unavailable');
});

test('preparing then discarding a candidate on storage failure leaves the entire old campaign intact', () => {
  const durable = save(); const before = structuredClone(durable);
  const prepared = acquireShipAnimalV87(durable, request(), context());
  assert.equal(prepared.ok, true);
  const commit = () => { throw new Error('storage-full'); };
  assert.throws(() => commit(prepared.save), /storage-full/);
  assert.deepEqual(durable, before);
  assert.equal(durable.shipAnimalsV1, undefined);
});

test('a separate profile has no shared ownership, funds, links, receipts or reservations', () => {
  const first = purchased(); first.shipAnimalsV1.animals['animal-moka'].links['marine-1'] = 4;
  const other = save(); other.profile = 'campaign-b';
  assert.deepEqual(migrateShipAnimalStateV87(other.shipAnimalsV1).animals, {});
  assert.equal(other.galaxy.resources.credits, 1000);
  const second = acquireShipAnimalV87(other, request(), context());
  assert.equal(second.ok, true);
  assert.deepEqual(second.save.shipAnimalsV1.animals['animal-moka'].links, {});
});

test('future schema remains byte-content equivalent and blocks every transaction without debit', () => {
  const raw = { schema: 8, records: [{ custom: 'preserve me' }], reserved: 7 };
  const original = save(); original.shipAnimalsV1 = raw;
  const migrated = migrateShipAnimalStateV87(freezeDeep(raw));
  assert.deepEqual(migrated, raw); assert.notEqual(migrated, raw);
  const result = acquireShipAnimalV87(original, request(), context());
  assert.equal(result.code, 'unsupported-schema'); assert.deepEqual(result.save, original);
});

for (const [label, corrupt] of [
  ['family', state => { state.animals['animal-moka'].familyId = 'unknown-family'; }],
  ['position', state => { state.animals['animal-moka'].location.to.x = Infinity; }],
  ['two-locations', state => { state.animals['animal-moka'].location.resident = place(); }],
  ['stock', state => { state.stock['offer-animal-moka'].status = 'available'; }],
  ['missing-receipt', state => { delete state.receipts['purchase-animal-moka']; }],
  ['reservation', state => { state.reservations['animal-moka'].habitatId = 'other-berth'; }]
]) test(`corrupt ${label} is isolated with original records, idempotent migration, and no compensating adoption`, () => {
  const original = purchased(); corrupt(original.shipAnimalsV1);
  const before = structuredClone(original.shipAnimalsV1);
  const migrated = migrateShipAnimalStateV87(freezeDeep(original.shipAnimalsV1));
  assert.deepEqual(original.shipAnimalsV1, before);
  assert.ok(migrated.quarantined.length > 0);
  assert.ok(migrated.diagnostics.length > 0);
  assert.equal(migrated.animals['animal-moka'], undefined);
  assert.ok(migrated.quarantined.some(entry => entry.path === 'animals.animal-moka'
    && JSON.stringify(entry.original) === JSON.stringify(before.animals['animal-moka'])));
  assert.deepEqual(migrateShipAnimalStateV87(migrated), migrated);
  const result = acquireShipAnimalV87(original, request('animal-brume'), context());
  assert.equal(result.code, 'state-needs-review'); assert.deepEqual(result.save, original);
});

test('malformed registry, bucket and quarantine metadata preserve originals without throwing', () => {
  for (const raw of [42, 'broken', [], {}, { schema: 1 },
    { ...createEmptyShipAnimalStateV87(), animals: ['legacy-animal'] },
    { ...createEmptyShipAnimalStateV87(), quarantined: [null], diagnostics: [null] }]) {
    const migrated = migrateShipAnimalStateV87(raw);
    assert.deepEqual(migrated.animals, {});
    assert.ok(migrated.quarantined.length > 0);
    assert.deepEqual(migrateShipAnimalStateV87(migrated), migrated);
  }
});

test('canonical location validates exactly one physical place or one transit edge', () => {
  const current = purchased().shipAnimalsV1.animals['animal-moka'].location;
  assert.equal(isShipAnimalLocationValidV87(current), true);
  for (const kind of ['intake', 'acclimating', 'resident']) assert.equal(isShipAnimalLocationValidV87({ kind, ...place() }), true);
  assert.equal(isShipAnimalLocationValidV87({ kind: 'stasis', ...place(), containerId: 'crate-1' }), true);
  assert.equal(isShipAnimalLocationValidV87({ kind: 'boarding', ...place('pension'), facilityId: 'pension-1' }), true);
  for (const value of [null, {}, { kind: 'resident', ...place(), transit: current },
    { kind: 'resident', ...place(), x: NaN }, { kind: 'stasis', ...place() },
    { ...current, progress: 1.01 }, { ...current, from: current.to }]) assert.equal(isShipAnimalLocationValidV87(value), false);
});

test('transport cannot skip arrival, complete without progress, or bypass an access validator', () => {
  const current = purchased();
  assert.equal(move(current, { kind: 'resident', ...place() }, 'skip', { transportComplete: true }).code, 'invalid-phase');
  assert.equal(move(current, { kind: 'intake', ...place() }, 'early', { transportComplete: true }).code, 'invalid-phase');
  const location = { ...current.shipAnimalsV1.animals['animal-moka'].location, progress: 1 };
  assert.equal(transitionShipAnimalV87(current, { animalId: 'animal-moka', transactionId: 'missing-guard', location }).code, 'access-denied');
  const denied = move(current, location, 'locked-door', { canTransition: () => false });
  assert.equal(denied.code, 'access-denied'); assert.deepEqual(denied.save, current);
  assert.equal(move(current, location, 'throws', { canTransition: () => { throw new Error('route unavailable'); } }).code, 'access-denied');
});

test('delivery, arrival check and acclimation are separate explicit persistent stages', () => {
  const intake = arrived();
  assert.equal(intake.shipAnimalsV1.animals['animal-moka'].location.kind, 'intake');
  assert.equal(move(intake, { kind: 'acclimating', ...place() }, 'no-check').code, 'invalid-phase');
  let result = move(intake, { kind: 'acclimating', ...place() }, 'checked', { arrivalCheckPassed: true });
  assert.equal(result.ok, true);
  assert.equal(move(result.save, { kind: 'resident', ...place() }, 'not-settled').code, 'invalid-phase');
  result = move(result.save, { kind: 'resident', ...place() }, 'settled', { acclimationComplete: true });
  assert.equal(result.ok, true);
  assert.equal(result.save.shipAnimalsV1.animals['animal-moka'].location.kind, 'resident');
  assert.equal(result.save.galaxy.resources.credits, 780);
  assert.deepEqual(migrateShipAnimalStateV87(result.save.shipAnimalsV1), result.save.shipAnimalsV1);
});

test('transition replay is idempotent across object-key order and transaction IDs cannot cross operations', () => {
  const current = purchased();
  const location = { ...current.shipAnimalsV1.animals['animal-moka'].location, progress: 0.5 };
  const first = move(current, location, 'progress-half'); assert.equal(first.ok, true);
  const reordered = Object.fromEntries(Object.entries(location).reverse());
  const replay = move(first.save, reordered, 'progress-half', { canTransition: () => false });
  assert.equal(replay.ok, true); assert.equal(replay.changed, false); assert.deepEqual(replay.save, first.save);
  assert.equal(move(first.save, { ...location, progress: 0.25 }, 'rewind').code, 'invalid-phase');
  assert.equal(move(first.save, { ...location, progress: 0.75 }, 'progress-half').code, 'transaction-conflict');
  assert.equal(move(first.save, location, 'purchase-animal-moka').code, 'transaction-conflict');
  assert.equal(acquireShipAnimalV87(first.save, request('animal-brume', 'progress-half'), context()).code, 'transaction-conflict');
});

test('resident movement, stasis and boarding require explicit physical access without simultaneous locations', () => {
  const current = resident();
  const changedRoom = { kind: 'resident', ...place('habitat-corridor', 150) };
  assert.equal(move(current, changedRoom, 'closed-door', { canTransition: () => false }).code, 'access-denied');
  let next = move(current, changedRoom, 'walked'); assert.equal(next.ok, true);
  const stasis = { ...changedRoom, kind: 'stasis', containerId: 'vet-crate-1' };
  assert.equal(move(next.save, stasis, 'not-in-crate').code, 'invalid-phase');
  next = move(next.save, stasis, 'protected', { transferAuthorized: true, physicalArrivalConfirmed: true });
  assert.equal(next.ok, true); assert.equal(next.animal.location.kind, 'stasis');
  assert.equal(next.animal.location.roomId, 'habitat-corridor');
  assert.equal(next.save.shipAnimalsV1.animals['animal-moka'].resident, undefined);
  assert.deepEqual(migrateShipAnimalStateV87(next.save.shipAnimalsV1), next.save.shipAnimalsV1);
  const boarding = move(current, { kind: 'boarding', ...place(), facilityId: 'care-boarding' }, 'pension',
    { transferAuthorized: true, physicalArrivalConfirmed: true });
  assert.equal(boarding.ok, true); assert.equal(boarding.animal.location.kind, 'boarding');
});

test('access validator receives copies and cannot alter transaction state by mutating its arguments', () => {
  const current = resident(); const location = { kind: 'resident', ...place('habitat-corridor') };
  const result = move(freezeDeep(current), location, 'validated', { canTransition: ({ animal, from, to }) => {
    animal.needs.health = 0; from.roomId = 'wrong'; to.roomId = 'wrong'; return true;
  } });
  assert.equal(result.ok, true);
  assert.equal(result.animal.needs.health, 100);
  assert.equal(result.animal.location.roomId, 'habitat-corridor');
});

test('loading and real-world absence never advances delivery or changes needs', () => {
  const current = purchased();
  const restored = migrateShipAnimalStateV87(JSON.parse(JSON.stringify(current.shipAnimalsV1)));
  assert.deepEqual(restored, current.shipAnimalsV1);
  assert.equal(restored.animals['animal-moka'].location.progress, 0);
  const text = readFileSync(new URL('../src/ship-animal-state-v87.js', import.meta.url), 'utf8');
  assert.doesNotMatch(text, /Date\.now|new Date\(|performance\.now|localStorage|Math\.random/);
  assert.equal(move(current, { ...restored.animals['animal-moka'].location, progress: 0.1 }, 'old-time', { simulationTime: 9 }).code, 'invalid-simulation-time');
});

test('boarding return starts an actual transit at zero instead of declaring the journey finished', () => {
  const boarded = move(resident(), { kind: 'boarding', ...place(), facilityId: 'care-boarding' }, 'pension',
    { transferAuthorized: true, physicalArrivalConfirmed: true });
  const transit = { kind: 'transit', edgeId: 'boarding-return', from: place(), to: place('care-intake'), progress: 1 };
  assert.equal(move(boarded.save, transit, 'skip-return', { transferAuthorized: true }).code, 'invalid-phase');
  assert.equal(move(boarded.save, { ...transit, progress: 0 }, 'start-return', { transferAuthorized: true }).ok, true);
});

test('invalid requests and exhausted revisions fail without mutating or triggering prototype keys', () => {
  const original = save();
  for (const invalid of [null, {}, { ...request(), transactionId: '__proto__' },
    { ...request(), transactionId: 'constructor' }, { ...request(), offerId: 'unknown-offer' }]) {
    const result = acquireShipAnimalV87(original, invalid, context());
    assert.equal(result.code, 'invalid-request'); assert.deepEqual(result.save, original);
  }
  original.shipAnimalsV1 = createEmptyShipAnimalStateV87();
  original.shipAnimalsV1.revision = Number.MAX_SAFE_INTEGER;
  assert.equal(acquireShipAnimalV87(original, request(), context()).code, 'invalid-revision');
  assert.equal(original.galaxy.resources.credits, 1000);
});
