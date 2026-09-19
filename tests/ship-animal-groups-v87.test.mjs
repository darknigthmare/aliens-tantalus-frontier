import test from 'node:test';
import assert from 'node:assert/strict';
import { SHIP_ANIMAL_OFFERS_V87 as OFFERS, SHIP_ANIMAL_DEFINITIONS_V87 as DEFINITIONS,
  createEmptyShipAnimalStateV87, migrateShipAnimalStateV87, acquireShipAnimalV87,
  getShipAnimalOfferMembersV87, getShipAnimalHabitatLocationV87,
  transitionShipAnimalV87, transitionShipAnimalGroupV87 } from '../src/ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87, installShipAnimalHabitatV87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_MEETINGS_V87 } from '../src/ship-port-room-v87.js';
import { SaveSystem, SAVE_PREFIX, createDefaultSave } from '../src/save.js';

const copy = value => structuredClone(value);
const GROUPS = ['offer-noisette-cafe', 'offer-tic-tac'];
const ok = result => { assert.equal(result.ok, true, result.code); return result.save; };
function fixture(offerId = GROUPS[0]) {
  let save = createDefaultSave();
  for (const h of getShipAnimalHabitatsV87(save)) save = ok(installShipAnimalHabitatV87(save, h.id,
    { roomId: 'animal-care', playerX: h.installX, feetY: 624, artReady: true }));
  const offer = OFFERS[offerId], members = getShipAnimalOfferMembersV87(offer);
  const h = getShipAnimalHabitatsV87(save).find(h => h.id === DEFINITIONS[members[0]].defaultHabitatId);
  const request = { offerId, habitatId: h.id, transactionId: 'test-buy-' + offerId };
  const context = { vendorAccessible: true, vendorId: offer.vendorId, artReadyIds: members,
    habitats: getShipAnimalHabitatsV87(save), care: { available: true, capacity: 7 }, simulationTime: 0,
    transit: { edgeId: 'pair-delivery', from: { hubId: 'frontier-civil-relay', roomId: 'frontier-civil-counter',
      deckId: 'engineering', x: SHIP_PORT_MEETINGS_V87.find(m => m.animalId === members[0]).x, y: 624 }, to: h.location } };
  return { save, offer, members, h, request, context };
}
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const nextLocations = (save, members, progress = 1) => Object.fromEntries(members.map(id => [id, { ...save.shipAnimalsV1.animals[id].location, progress }]));
function residentFixture(offerId) {
  const f = fixture(offerId);
  let save = ok(acquireShipAnimalV87(f.save, f.request, f.context));
  const step = (transactionId, location, context = {}) => {
    const locationsByAnimalId = Object.fromEntries(f.members.map(member => [member,
      location(save.shipAnimalsV1.animals[member].location)]));
    save = ok(transitionShipAnimalGroupV87(save, { offerId, transactionId, locationsByAnimalId },
      { canTransition: () => true, ...context }));
  };
  step('resident-fixture-progress', location => ({ ...location, progress: 1 }));
  step('resident-fixture-intake', location => ({ kind: 'intake', ...location.to }), { transportComplete: true });
  step('resident-fixture-acclimating', location => ({ ...location, kind: 'acclimating' }), { arrivalCheckPassed: true });
  step('resident-fixture-resident', location => ({ ...location, kind: 'resident' }), { acclimationComplete: true });
  return { ...f, save };
}

test('catalogue3 exposes two indivisible original groups and five offers, with zero owned individuals', () => {
  const fresh = createEmptyShipAnimalStateV87();
  assert.equal(fresh.schema, 1); assert.equal(fresh.catalogRevision, 3);
  assert.deepEqual(fresh.animals, {}); assert.deepEqual(fresh.receipts, {}); assert.deepEqual(fresh.reservations, {});
  assert.equal(Object.keys(fresh.stock).length, 5);
  assert.deepEqual(getShipAnimalOfferMembersV87('offer-noisette-cafe'), ['animal-noisette', 'animal-cafe']);
  assert.deepEqual(getShipAnimalOfferMembersV87('offer-tic-tac'), ['animal-tic', 'animal-tac']);
  assert.deepEqual(getShipAnimalOfferMembersV87('offer-animal-moka'), ['animal-moka']);
  assert.deepEqual(getShipAnimalOfferMembersV87('absent'), []);
  assert.equal(OFFERS[GROUPS[0]].costCredits, 260); assert.equal(OFFERS[GROUPS[1]].costCredits, 240);
  for (const id of GROUPS) { assert.equal(OFFERS[id].vendorId, 'colony-shelter'); assert.equal(OFFERS[id].groupIndivisible, true); }
});

for (const offerId of GROUPS) {
  test(offerId + ': one atomic debit and receipt, two individual identities, two reservations and distinct exact pen anchors', () => {
    const f = fixture(offerId), before = copy(f.save);
    const result = acquireShipAnimalV87(freeze(f.save), freeze(f.request), freeze(f.context));
    const save = ok(result), state = save.shipAnimalsV1;
    assert.deepEqual(f.save, before); assert.equal(save.galaxy.resources.credits, before.galaxy.resources.credits - f.offer.costCredits);
    assert.equal(state.revision, before.shipAnimalsV1.revision + 1);
    assert.deepEqual(Object.keys(state.animals), f.members); assert.equal(Object.keys(state.receipts).length, 1);
    assert.deepEqual(state.receipts[f.request.transactionId].animalIds, f.members);
    assert.equal(state.receipts[f.request.transactionId].costCredits, f.offer.costCredits);
    assert.equal(state.stock[offerId].status, 'sold'); assert.deepEqual(state.stock[offerId].animalIds, f.members);
    assert.equal(state.stock[offerId].animalId, undefined);
    for (const id of f.members) {
      const animal = state.animals[id];
      assert.equal(animal.id, id); assert.equal(animal.bondedGroupId, f.offer.bondedGroupId);
      assert.equal(animal.acquisition.transactionId, f.request.transactionId);
      assert.equal(animal.location.kind, 'transit'); assert.equal(animal.location.progress, 0);
      assert.deepEqual(animal.location.to, getShipAnimalHabitatLocationV87(f.h, id)); assert.equal(animal.location.to.y, 612);
      assert.deepEqual(state.reservations[id], { animalId: id, habitatId: f.h.id, slots: 1 });
      assert.deepEqual(animal.preferences, DEFINITIONS[id].preferences);
    }
    assert.notEqual(state.animals[f.members[0]].location.to.x, state.animals[f.members[1]].location.to.x);
    assert.notEqual(state.animals[f.members[0]].needs, state.animals[f.members[1]].needs);
    assert.deepEqual(migrateShipAnimalStateV87(state), state);
    const replay = acquireShipAnimalV87(save, f.request, {});
    assert.equal(replay.code, 'already-applied'); assert.deepEqual(replay.save, save);
    assert.equal(acquireShipAnimalV87(save, { ...f.request, transactionId: 'second-click' }, f.context).code, 'already-owned');
    result.animals[0].name = 'detached result'; assert.equal(state.animals[f.members[0]].name, DEFINITIONS[f.members[0]].name);
  });
}

for (const [label, expected, change] of [
  ['wrong physical vendor', 'vendor-inaccessible', f => { f.context.vendorId = 'station-shop'; }],
  ['closed vendor', 'vendor-inaccessible', f => { f.context.vendorAccessible = false; }],
  ['one missing atlas', 'art-not-ready', f => { f.context.artReadyIds.pop(); }],
  ['one missing slot', 'habitat-full', f => { f.context.habitats.find(h => h.id === f.h.id).capacity = 1; }],
  ['missing care slot', 'care-unavailable', f => { f.context.care.capacity = 1; }],
  ['wrong group housing', 'habitat-unavailable', f => { f.request.habitatId = 'tic-tac-pen-v87'; }],
  ['uninstalled enclosure', 'habitat-unavailable', f => { f.context.habitats.find(h => h.id === f.h.id).installed = false; }],
  ['unproved installation', 'habitat-unavailable', f => { f.context.habitats.find(h => h.id === f.h.id).installed = 'yes'; }],
  ['invented third enclosure slot', 'habitat-unavailable', f => { f.context.habitats.find(h => h.id === f.h.id).capacity = 3; }],
  ['incompatible family', 'habitat-unavailable', f => { f.context.habitats.find(h => h.id === f.h.id).compatibleFamilyIds = ['rat-domestic']; }],
  ['open ground habitat', 'habitat-unavailable', f => { f.context.habitats.find(h => h.id === f.h.id).navigationDomain = 'authorized-floor'; }],
  ['missing second anchor', 'habitat-unavailable', f => { delete f.context.habitats.find(h => h.id === f.h.id).memberLocations[f.members[1]]; }],
  ['overlapping anchors', 'habitat-unavailable', f => { const h = f.context.habitats.find(h => h.id === f.h.id); h.memberLocations[f.members[1]] = copy(h.memberLocations[f.members[0]]); }],
  ['anchor outside enclosure', 'habitat-unavailable', f => { f.context.habitats.find(h => h.id === f.h.id).memberLocations[f.members[1]].x = 1500; }],
  ['insufficient credits', 'insufficient-credits', f => { f.save.galaxy.resources.credits = 259; }],
  ['bad transit', 'invalid-transit', f => { f.context.transit.to.x++; }],
  ['bad clock', 'invalid-simulation-time', f => { f.context.simulationTime = -1; }]
]) test('group refusal ' + label + ' preserves the entire input and never partially acquires', () => {
  const f = fixture(); f.context = copy(f.context); change(f); const before = copy(f.save);
  const result = acquireShipAnimalV87(f.save, f.request, f.context);
  assert.equal(result.code, expected); assert.equal(result.changed, false);
  assert.deepEqual(result.save, before); assert.deepEqual(f.save, before);
});

test('two pairs cost500 total, reserve four places, and cannot reuse a transaction ID or oversubscribe care', () => {
  const rabbits = fixture(), rats = fixture(GROUPS[1]);
  const first = ok(acquireShipAnimalV87(rabbits.save, rabbits.request, rabbits.context));
  assert.equal(acquireShipAnimalV87(first, { ...rats.request, transactionId: rabbits.request.transactionId }, rats.context).code, 'transaction-conflict');
  assert.equal(acquireShipAnimalV87(first, rats.request, { ...rats.context, care: { available: true, capacity: 3 } }).code, 'care-unavailable');
  const next = ok(acquireShipAnimalV87(first, rats.request, rats.context));
  assert.equal(next.galaxy.resources.credits, rabbits.save.galaxy.resources.credits - 500);
  assert.equal(Object.keys(next.shipAnimalsV1.receipts).length, 2); assert.equal(Object.keys(next.shipAnimalsV1.reservations).length, 4);
});

test('all three established companions coexist with two pairs, consuming exactly seven places and five receipts', () => {
  const f = fixture(); let save = f.save;
  for (const id of ['animal-moka', 'animal-brume', 'animal-luciole']) {
    const h = getShipAnimalHabitatsV87(save).find(h => h.id === DEFINITIONS[id].defaultHabitatId);
    save = ok(acquireShipAnimalV87(save, { offerId: 'offer-' + id, transactionId: 'old-' + id, habitatId: h.id },
      { ...f.context, artReadyIds: [id], transit: { ...f.context.transit, to: h.location } }));
  }
  const singles = copy(save.shipAnimalsV1.animals);
  const legacy = copy(save.shipAnimalsV1); legacy.catalogRevision = 2;
  for (const group of GROUPS) delete legacy.stock[group];
  const migrated = migrateShipAnimalStateV87(legacy);
  assert.deepEqual(migrated.animals, singles); assert.deepEqual(migrated.receipts, legacy.receipts);
  assert.deepEqual(migrated.reservations, legacy.reservations); assert.deepEqual(migrated.quarantined, []);
  save = { ...save, shipAnimalsV1: migrated };
  assert.equal(acquireShipAnimalV87(save, f.request, { ...f.context, care: { available: true, capacity: 4 } }).code, 'care-unavailable');
  save = ok(acquireShipAnimalV87(save, f.request, f.context));
  const rats = fixture(GROUPS[1]); save = ok(acquireShipAnimalV87(save, rats.request, rats.context));
  assert.equal(Object.keys(save.shipAnimalsV1.animals).length, 7);
  assert.equal(Object.keys(save.shipAnimalsV1.reservations).length, 7);
  assert.equal(Object.keys(save.shipAnimalsV1.receipts).length, 5);
  assert.equal(save.galaxy.resources.credits, f.save.galaxy.resources.credits - 1240);
  for (const [id, before] of Object.entries(singles)) assert.deepEqual(save.shipAnimalsV1.animals[id], before);
});

test('catalogue1/2 only introduces genuinely new stock; previous singleton receipts and positions are unchanged', () => {
  const f = fixture(); const h = getShipAnimalHabitatsV87(f.save)[0];
  const owned = ok(acquireShipAnimalV87(f.save, { offerId: 'offer-animal-moka', habitatId: h.id, transactionId: 'old-moka' },
    { ...f.context, artReadyIds: ['animal-moka'], transit: { ...f.context.transit, to: h.location } }));
  for (const version of [1, 2]) {
    const old = copy(owned.shipAnimalsV1); old.catalogRevision = version;
    for (const group of GROUPS) delete old.stock[group];
    if (version === 1) delete old.stock['offer-animal-luciole'];
    const before = copy(old), migrated = migrateShipAnimalStateV87(old);
    assert.deepEqual(old, before); assert.deepEqual(migrated.quarantined, []); assert.equal(migrated.catalogRevision, 3);
    for (const key of ['animals', 'receipts', 'reservations', 'transitions', 'revision', 'lastSimulationTime']) assert.deepEqual(migrated[key], before[key]);
    for (const group of GROUPS) assert.equal(migrated.stock[group].status, 'available');
    assert.deepEqual(migrateShipAnimalStateV87(migrated), migrated);
  }
});

test('catalogue3 lost group stock never replenishes; future revisions remain blocked and undowngraded', () => {
  const f = fixture(); delete f.save.shipAnimalsV1.stock[GROUPS[0]];
  const next = migrateShipAnimalStateV87(f.save.shipAnimalsV1);
  assert.equal(next.stock[GROUPS[0]].status, 'unavailable'); assert.ok(next.quarantined.length);
  assert.equal(acquireShipAnimalV87(f.save, f.request, f.context).ok, false);
  for (const version of [4, 99, '3', null, -1]) {
    const raw = createEmptyShipAnimalStateV87(); raw.catalogRevision = version;
    const state = migrateShipAnimalStateV87(raw);
    assert.deepEqual(state.catalogRevision, version); assert.ok(state.quarantined.length); assert.deepEqual(migrateShipAnimalStateV87(state), state);
  }
});

for (const [name, change] of [
  ['missing partner', (s, f) => { delete s.animals[f.members[1]]; }],
  ['bad partner family', (s, f) => { s.animals[f.members[1]].familyId = 'cat-domestic'; }],
  ['missing reservation', (s, f) => { delete s.reservations[f.members[1]]; }],
  ['missing receipt', (s, f) => { delete s.receipts[f.request.transactionId]; }],
  ['truncated receipt', (s, f) => { s.receipts[f.request.transactionId].animalIds.pop(); }],
  ['stock split', (s, f) => { s.stock[f.offer.id].animalIds.reverse(); }],
  ['separate housing', (s, f) => { s.animals[f.members[1]].habitatId = 'other'; }],
  ['separate contract', (s, f) => { s.animals[f.members[1]].acquisition.transactionId = 'other'; }],
  ['separate progress', (s, f) => { s.animals[f.members[1]].location.progress = .2; }]
]) test('corrupt pair ' + name + ' is isolated as a whole with originals retained and never recreated', () => {
  const f = fixture(), current = ok(acquireShipAnimalV87(f.save, f.request, f.context));
  change(current.shipAnimalsV1, f); const raw = copy(current.shipAnimalsV1);
  const next = migrateShipAnimalStateV87(raw);
  assert.deepEqual(current.shipAnimalsV1, raw); assert.deepEqual(next.animals, {});
  assert.equal(next.stock[f.offer.id].status, 'unavailable'); assert.ok(next.quarantined.length > 0);
  assert.ok(next.quarantined.some(q => q.path.startsWith('animals.') && q.original));
  assert.deepEqual(migrateShipAnimalStateV87(next), next);
  assert.equal(acquireShipAnimalV87(current, f.request, f.context).ok, false);
});

test('group transitions are indivisible, strict, replayable and check access for both members before mutation', () => {
  const f = fixture(), save = ok(acquireShipAnimalV87(f.save, f.request, f.context));
  const locationsByAnimalId = nextLocations(save, f.members);
  const request = { offerId: f.offer.id, transactionId: 'group-progress', locationsByAnimalId };
  const allow = { canTransition: () => true, simulationTime: 1 };
  assert.equal(transitionShipAnimalV87(save, { animalId: f.members[0], transactionId: 'split', location: locationsByAnimalId[f.members[0]] }, allow).code, 'group-transition-required');
  const denied = transitionShipAnimalGroupV87(save, request, { ...allow, canTransition: ({ animal }) => animal.id === f.members[0] });
  assert.equal(denied.code, 'access-denied'); assert.deepEqual(denied.save, save);
  const partial = { ...request, locationsByAnimalId: { [f.members[0]]: locationsByAnimalId[f.members[0]] } };
  assert.equal(transitionShipAnimalGroupV87(save, partial, allow).ok, false);
  const split = copy(request); split.locationsByAnimalId[f.members[1]].progress = .5;
  assert.equal(transitionShipAnimalGroupV87(save, split, allow).code, 'group-transition-required');
  const next = ok(transitionShipAnimalGroupV87(freeze(save), freeze(request), allow));
  assert.ok(f.members.every(id => next.shipAnimalsV1.animals[id].location.progress === 1));
  assert.equal(Object.keys(next.shipAnimalsV1.transitions).length, 1);
  assert.deepEqual(next.shipAnimalsV1.transitions['group-progress'].animalIds, f.members);
  assert.deepEqual(migrateShipAnimalStateV87(next.shipAnimalsV1), next.shipAnimalsV1);
  const replay = transitionShipAnimalGroupV87(next, request, {}); assert.equal(replay.code, 'already-applied'); assert.deepEqual(replay.save, next);
  const conflict = copy(request); conflict.locationsByAnimalId[f.members[0]].to.x++;
  assert.equal(transitionShipAnimalGroupV87(next, conflict, allow).code, 'transaction-conflict');
});

test('numeric-string clocks and overflowing member revisions cannot publish a partial group transition', () => {
  const f = fixture(), save = ok(acquireShipAnimalV87(f.save, f.request, f.context));
  const request = { offerId: f.offer.id, transactionId: 'overflow-group', locationsByAnimalId: nextLocations(save, f.members) };
  assert.equal(transitionShipAnimalGroupV87(save, request, { simulationTime: '0', canTransition: () => true }).code, 'invalid-simulation-time');
  save.shipAnimalsV1.animals[f.members[1]].revision = Number.MAX_SAFE_INTEGER;
  const result = transitionShipAnimalGroupV87(save, request, { canTransition: () => true });
  assert.equal(result.code, 'invalid-revision'); assert.deepEqual(result.save, save);
});

for (const offerId of GROUPS) {
  test(offerId + ': public individual transitions cannot split resident partners, even with unrestricted access', () => {
    const f = residentFixture(offerId), before = copy(f.save);
    for (const member of f.members) {
      const original = f.save.shipAnimalsV1.animals[member].location;
      for (const location of [original, { ...original, x: original.x + 1 }, { ...original, roomId: 'crew-quarters' }]) {
        const result = transitionShipAnimalV87(freeze(f.save), { animalId: member,
          transactionId: 'resident-split-' + member, location }, { canTransition: () => true });
        assert.equal(result.code, 'group-transition-required'); assert.equal(result.ok, false); assert.equal(result.changed, false);
        assert.deepEqual(result.save, before); assert.deepEqual(f.save, before);
        assert.deepEqual(migrateShipAnimalStateV87(result.save.shipAnimalsV1), before.shipAnimalsV1);
      }
    }
  });

  test(offerId + ': public group transitions cannot relocate residents outside their enclosure or replace local routines', () => {
    const f = residentFixture(offerId), before = copy(f.save);
    for (const edit of [location => ({ ...location, roomId: 'crew-quarters' }),
      location => ({ ...location, x: 0 }), location => ({ ...location, x: location.x + 1 }),
      location => ({ ...location, y: 624 })]) {
      const locationsByAnimalId = Object.fromEntries(f.members.map(member => [member,
        edit(f.save.shipAnimalsV1.animals[member].location)]));
      const result = transitionShipAnimalGroupV87(freeze(f.save), { offerId,
        transactionId: 'resident-warp', locationsByAnimalId }, { canTransition: () => true });
      assert.equal(result.code, 'enclosure-routine-required'); assert.equal(result.ok, false); assert.equal(result.changed, false);
      assert.deepEqual(result.save, before); assert.deepEqual(f.save, before);
      assert.deepEqual(migrateShipAnimalStateV87(result.save.shipAnimalsV1), before.shipAnimalsV1);
    }
    const locationsByAnimalId = Object.fromEntries(f.members.map(member => [member,
      copy(f.save.shipAnimalsV1.animals[member].location)]));
    const request = { offerId, transactionId: 'resident-confirmed', locationsByAnimalId };
    const result = transitionShipAnimalGroupV87(f.save, request, { canTransition: () => true });
    assert.equal(result.ok, true); assert.equal(result.code, 'transitioned');
    for (const member of f.members) assert.deepEqual(result.save.shipAnimalsV1.animals[member].location, locationsByAnimalId[member]);
    assert.deepEqual(migrateShipAnimalStateV87(result.save.shipAnimalsV1), result.save.shipAnimalsV1);
    assert.equal(transitionShipAnimalGroupV87(result.save, request, {}).code, 'already-applied');
  });
}

test('SaveSystem quota rollback, reload and independent profiles preserve one group receipt and both identities', () => {
  const values = new Map(), storage = { reject: false, getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.reject && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(key, value); }, removeItem: key => values.delete(key) };
  const system = new SaveSystem(storage); system.newGame(1); const f = fixture(); system.commit(f.save);
  const before = copy(system.data), bytes = values.get(system.key()); const candidate = ok(acquireShipAnimalV87(system.data, f.request, f.context));
  storage.reject = true; assert.throws(() => system.commit(candidate), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(system.data, before); assert.equal(values.get(system.key()), bytes);
  storage.reject = false; system.commit(candidate);
  const loaded = new SaveSystem(storage); loaded.load(1);
  assert.deepEqual(loaded.data.shipAnimalsV1, candidate.shipAnimalsV1);
  assert.equal(Object.keys(loaded.data.shipAnimalsV1.receipts).length, 1);
  const other = new SaveSystem(storage); other.newGame(2);
  assert.deepEqual(other.data.shipAnimalsV1.animals, {}); assert.deepEqual(other.data.shipAnimalsV1.receipts, {});
});
