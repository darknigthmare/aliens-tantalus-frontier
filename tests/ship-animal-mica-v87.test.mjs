import test from 'node:test';
import assert from 'node:assert/strict';
import { SHIP_ANIMAL_CATALOG_REVISION_V87 as REVISION, SHIP_ANIMAL_DEFINITIONS_V87 as DEFINITIONS,
  SHIP_ANIMAL_OFFERS_V87 as OFFERS, createEmptyShipAnimalStateV87, migrateShipAnimalStateV87,
  acquireShipAnimalV87, transitionShipAnimalV87, getShipAnimalOfferMembersV87 } from '../src/ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87 } from '../src/ship-animal-habitat-v87.js';
import { SaveSystem, SAVE_PREFIX, createDefaultSave } from '../src/save.js';

const ID = 'animal-mica', OFFER = 'offer-animal-mica', HABITAT = 'mica-terrarium-v87';
const OLD_IDS = ['animal-moka', 'animal-brume', 'animal-luciole', 'animal-noisette', 'animal-cafe', 'animal-tic', 'animal-tac'];
const copy = value => structuredClone(value);
const point = (x, y) => ({ hubId: 'tantalus', deckId: 'habitat', roomId: 'animal-care', x, y });
const success = result => { assert.equal(result.ok, true, result.code); return result.save; };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
// Transaction tests supply an explicit trusted installation/art validation result.
// This is not a runtime fallback and does not claim that a bitmap has loaded.
function habitats(save) {
  return [...getShipAnimalHabitatsV87(save).filter(h => h.id !== HABITAT).map(h => ({ ...h, installed: true })),
    { id: HABITAT, type: 'terrarium', designatedAnimalId: ID, compatibleFamilyIds: ['gecko'],
      navigationDomain: 'terrarium-volume', capacity: 1, installed: true,
      location: point(1800, 612), receivingPoint: point(1800, 624) }];
}
function fixture(save = createDefaultSave(), offerId = OFFER) {
  const offer = OFFERS[offerId], member = getShipAnimalOfferMembersV87(offer)[0];
  const allHabitats = habitats(save), habitat = allHabitats.find(h => h.id === DEFINITIONS[member].defaultHabitatId);
  return { save, request: { offerId, habitatId: habitat.id, transactionId: 'test-mica:' + offerId },
    context: { vendorAccessible: true, vendorId: offer.vendorId, artReadyIds: getShipAnimalOfferMembersV87(offer),
      habitats: allHabitats, care: { available: true, capacity: 8 }, simulationTime: save.shipAnimalsV1.lastSimulationTime,
      transit: { edgeId: 'test-mica-route', from: { hubId: 'frontier-civil-relay', deckId: 'engineering',
        roomId: 'frontier-civil-counter', x: 410, y: 624 }, to: habitat.location } } };
}
const buy = (save, offerId = OFFER) => { const f = fixture(save, offerId); return success(acquireShipAnimalV87(f.save, f.request, f.context)); };
function historical(version) {
  let save = createDefaultSave();
  const offers = ['offer-animal-moka', 'offer-animal-brume', ...(version >= 2 ? ['offer-animal-luciole'] : []),
    ...(version >= 3 ? ['offer-noisette-cafe', 'offer-tic-tac'] : [])];
  for (const offer of offers) save = buy(save, offer);
  const state = save.shipAnimalsV1; state.catalogRevision = version; delete state.stock[OFFER];
  if (version < 3) { delete state.stock['offer-noisette-cafe']; delete state.stock['offer-tic-tac']; }
  if (version < 2) delete state.stock['offer-animal-luciole'];
  return save;
}

test('Mica exactly preserves the source original identity, biological needs family and individual 180-credit station offer', () => {
  const definition = DEFINITIONS[ID];
  assert.deepEqual(definition, { id: ID, name: 'Mica', familyId: 'gecko', visualId: 'original-mica', nature: 'biological',
    habitatType: 'terrarium', defaultHabitatId: HABITAT,
    appearance: 'Petit gecko tacheté, doigts et queue lisibles.',
    biography: 'Résident d’un terrarium entretenu par une équipe scientifique civile ; placé avec son dossier de maintenance.',
    traits: ['discret', 'calme', 'observateur'], preferences: { likes: 'Un abri de terrarium', avoids: 'Les transferts répétés' } });
  assert.equal(Object.isFrozen(definition), true); assert.equal(Object.isFrozen(definition.traits), true);
  assert.equal(Object.isFrozen(definition.preferences), true); assert.equal(definition.bondedGroupId, undefined);
  assert.deepEqual(OFFERS[OFFER], { id: OFFER, animalId: ID, vendorId: 'station-shop', costCredits: 180 });
  assert.deepEqual(getShipAnimalOfferMembersV87(OFFER), [ID]);
  assert.deepEqual(Object.keys(DEFINITIONS), [...OLD_IDS, ID]);
});

test('catalogue4 introduces one offer, not a gecko, housing, receipt, reservation or ownership list', () => {
  const state = createEmptyShipAnimalStateV87(); assert.equal(REVISION, 4); assert.equal(state.schema, 1); assert.equal(state.catalogRevision, 4);
  assert.equal(Object.keys(state.stock).length, 6); assert.deepEqual(state.stock[OFFER], { animalId: ID, status: 'available' });
  for (const bucket of ['animals', 'receipts', 'reservations', 'transitions']) assert.deepEqual(state[bucket], {});
  assert.equal(state.habitats, undefined); assert.deepEqual(migrateShipAnimalStateV87(state), state);
});

for (const version of [1, 2, 3]) test('catalogue' + version + ' to4 adds only genuinely absent new stock and preserves historical contracts and positions', () => {
  const save = historical(version), before = copy(save), next = migrateShipAnimalStateV87(freeze(save.shipAnimalsV1));
  assert.equal(next.catalogRevision, 4); assert.deepEqual(next.quarantined, []); assert.deepEqual(save, before);
  for (const key of ['animals', 'receipts', 'reservations', 'transitions', 'revision', 'lastSimulationTime']) assert.deepEqual(next[key], before.shipAnimalsV1[key]);
  for (const [id, stock] of Object.entries(before.shipAnimalsV1.stock)) assert.deepEqual(next.stock[id], stock);
  assert.deepEqual(next.stock[OFFER], { animalId: ID, status: 'available' }); assert.equal(next.animals[ID], undefined);
  assert.deepEqual(migrateShipAnimalStateV87(next), next);
  assert.deepEqual(migrateShipAnimalStateV87(JSON.parse(JSON.stringify(next))), next);
});

for (const [label, change] of [
  ['missing current stock', s => { delete s.stock[OFFER]; }],
  ['malformed current stock', s => { s.stock[OFFER] = null; }],
  ['another individual stock', s => { s.stock[OFFER] = { animalId: 'animal-moka', status: 'available' }; }],
  ['future catalogue', s => { s.catalogRevision = 5; }],
  ['numeric string catalogue', s => { s.catalogRevision = '4'; }]
]) test(label + ' never restocks, acquires or debits Mica and retains evidence', () => {
  const f = fixture(); change(f.save.shipAnimalsV1); const before = copy(f.save);
  const state = migrateShipAnimalStateV87(f.save.shipAnimalsV1); assert.ok(state.quarantined.length > 0);
  assert.deepEqual(migrateShipAnimalStateV87(state), state);
  if (label.includes('stock')) assert.equal(state.stock[OFFER].status, 'unavailable');
  const result = acquireShipAnimalV87(f.save, f.request, f.context);
  assert.equal(result.ok, false); assert.deepEqual(result.save, before); assert.deepEqual(f.save, before);
});

test('older catalogue cannot recreate missing Mica stock with any ownership, receipt or quarantine trace', () => {
  const owned = buy(createDefaultSave());
  for (const version of [1, 2, 3]) {
    for (const trace of ['owned', 'reservation', 'receipt', 'quarantine']) {
      const state = trace === 'owned' ? copy(owned.shipAnimalsV1) : createEmptyShipAnimalStateV87();
      state.catalogRevision = version; delete state.stock[OFFER];
      if (trace === 'reservation') state.reservations[ID] = { animalId: ID, habitatId: HABITAT, slots: 1 };
      if (trace === 'receipt') state.receipts['test-mica:' + OFFER] = copy(owned.shipAnimalsV1.receipts['test-mica:' + OFFER]);
      if (trace === 'quarantine') state.quarantined.push({ path: 'animals.' + ID, code: 'invalid-entry', original: { retained: true } });
      const migrated = migrateShipAnimalStateV87(state);
      assert.equal(migrated.stock[OFFER].status, 'unavailable'); assert.ok(migrated.quarantined.length > 0);
      assert.deepEqual(migrateShipAnimalStateV87(migrated), migrated);
    }
  }
});

test('legacy missing sold stock never recreates another animal when Mica is introduced', () => {
  const save = historical(3); delete save.shipAnimalsV1.stock['offer-noisette-cafe'];
  const state = migrateShipAnimalStateV87(save.shipAnimalsV1);
  assert.equal(state.stock['offer-noisette-cafe'].status, 'unavailable'); assert.ok(state.quarantined.length > 0);
  const f = fixture({ ...save, shipAnimalsV1: state });
  assert.equal(acquireShipAnimalV87(f.save, f.request, f.context).ok, false);
});

test('one Mica purchase atomically debits180, reserves one terrarium and starts real transit at0 without changing the seven historical animals', () => {
  const old = historical(3); old.shipAnimalsV1 = migrateShipAnimalStateV87(old.shipAnimalsV1);
  const f = fixture(old), before = copy(f.save), result = acquireShipAnimalV87(freeze(f.save), freeze(f.request), freeze(f.context));
  const save = success(result), state = save.shipAnimalsV1, animal = state.animals[ID];
  assert.deepEqual(f.save, before); assert.equal(save.galaxy.resources.credits, before.galaxy.resources.credits - 180);
  for (const member of OLD_IDS) assert.deepEqual(state.animals[member], before.shipAnimalsV1.animals[member]);
  assert.equal(Object.keys(state.animals).length, 8); assert.equal(Object.keys(state.reservations).length, 8);
  assert.equal(Object.keys(state.receipts).length, 6);
  assert.deepEqual(state.reservations[ID], { animalId: ID, habitatId: HABITAT, slots: 1 });
  assert.equal(animal.location.kind, 'transit'); assert.equal(animal.location.progress, 0); assert.deepEqual(animal.location.to, point(1800, 612));
  assert.equal(animal.bondedGroupId, undefined); assert.equal(animal.nature, 'biological');
  assert.deepEqual(animal.preferences, DEFINITIONS[ID].preferences);
  assert.deepEqual(Object.keys(animal.needs).sort(), ['comfort', 'health', 'rest', 'satiety', 'social']);
  for (const forbidden of ['battery', 'charge', 'maintenance', 'synthesis']) assert.equal(animal.needs[forbidden], undefined);
  const replay = acquireShipAnimalV87(save, f.request, {}); assert.equal(replay.code, 'already-applied'); assert.deepEqual(replay.save, save);
  assert.equal(acquireShipAnimalV87(save, { ...f.request, transactionId: 'repeat-mica' }, f.context).code, 'already-owned');
  assert.deepEqual(migrateShipAnimalStateV87(state), state);
});

for (const [label, code, change] of [
  ['wrong vendor', 'vendor-inaccessible', f => { f.context.vendorId = 'colony-shelter'; }],
  ['unverified vendor', 'vendor-inaccessible', f => { delete f.context.vendorId; }],
  ['closed counter', 'vendor-inaccessible', f => { f.context.vendorAccessible = false; }],
  ['missing identity art', 'art-not-ready', f => { f.context.artReadyIds = ['animal-tic']; }],
  ['unfitted terrarium', 'habitat-unavailable', (f, h) => { h.installed = false; }],
  ['numeric installed flag', 'habitat-unavailable', (f, h) => { h.installed = 1; }],
  ['rat enclosure substituted', 'habitat-unavailable', (f, h) => { h.type = 'small-pen'; }],
  ['other identity fitting', 'habitat-unavailable', (f, h) => { h.designatedAnimalId = 'animal-tic'; }],
  ['no identity fitting', 'habitat-unavailable', (f, h) => { delete h.designatedAnimalId; }],
  ['invented extra slot', 'habitat-unavailable', (f, h) => { h.capacity = 2; }],
  ['floor roaming', 'habitat-unavailable', (f, h) => { h.navigationDomain = 'authorized-floor'; }],
  ['renamed rabbit pen', 'habitat-unavailable', (f, h) => { h.navigationDomain = 'enclosure-volume'; }],
  ['incompatible animal family', 'habitat-unavailable', (f, h) => { h.compatibleFamilyIds = ['rat-domestic']; }],
  ['human lane transit target', 'invalid-transit', f => { f.context.transit.to = point(1800, 624); }],
  ['short credits', 'insufficient-credits', f => { f.save.galaxy.resources.credits = 179; }],
  ['missing care', 'care-unavailable', f => { f.context.care.capacity = 0; }],
  ['invalid active clock', 'invalid-simulation-time', f => { f.context.simulationTime = -1; }]
]) test('Mica refusal ' + label + ' preserves input, resources and all ownership', () => {
  const f = fixture(); change(f, f.context.habitats.find(h => h.id === HABITAT)); const before = copy(f.save);
  const result = acquireShipAnimalV87(f.save, f.request, f.context);
  assert.equal(result.ok, false); assert.equal(result.code, code); assert.equal(result.changed, false);
  assert.deepEqual(result.save, before); assert.deepEqual(f.save, before);
});

test('Mica is the eighth biological care slot, never a raised care cap or a second purchase', () => {
  const old = historical(3); old.shipAnimalsV1 = migrateShipAnimalStateV87(old.shipAnimalsV1);
  const f = fixture(old); f.context.care.capacity = 7;
  assert.equal(acquireShipAnimalV87(old, f.request, f.context).code, 'care-unavailable');
  f.context.care.capacity = 8; const save = success(acquireShipAnimalV87(old, f.request, f.context));
  assert.equal(Object.keys(save.shipAnimalsV1.reservations).length, 8);
  f.context.care.capacity = 99;
  assert.equal(acquireShipAnimalV87(save, { ...f.request, transactionId: 'ninth-reservation' }, f.context).code, 'already-owned');
});

test('Mica transport cannot skip physical arrival, mix feet624 with terrarium612, or warp a resident through a permissive callback', () => {
  let save = buy(createDefaultSave()); const move = (location, transactionId, context = {}) => transitionShipAnimalV87(save,
    { animalId: ID, location, transactionId }, { canTransition: () => true, ...context });
  assert.equal(move({ kind: 'resident', ...point(1800, 612) }, 'skip-arrival').code, 'invalid-phase');
  save = success(move({ ...save.shipAnimalsV1.animals[ID].location, progress: 1 }, 'progress'));
  assert.equal(move({ kind: 'intake', ...point(1800, 624) }, 'wrong-floor', { transportComplete: true }).code, 'invalid-phase');
  save = success(move({ kind: 'intake', ...point(1800, 612) }, 'intake', { transportComplete: true }));
  save = success(move({ kind: 'acclimating', ...point(1800, 612) }, 'check', { arrivalCheckPassed: true }));
  save = success(move({ kind: 'resident', ...point(1800, 612) }, 'settled', { acclimationComplete: true }));
  const before = copy(save);
  for (const edit of [{ x: 1801 }, { y: 624 }, { roomId: 'crew-quarters' }, { roomId: 'reactor' }]) {
    const result = move({ ...save.shipAnimalsV1.animals[ID].location, ...edit }, 'escape');
    assert.equal(result.code, 'enclosure-routine-required'); assert.deepEqual(result.save, before);
  }
  assert.deepEqual(migrateShipAnimalStateV87(before.shipAnimalsV1), before.shipAnimalsV1);
});

test('future schema is preserved, never downgraded or given current Mica stock', () => {
  const future = { schema: 10, catalogRevision: 77, futureAnimals: ['owned-mica'], untouched: { arbitrary: true } };
  assert.deepEqual(migrateShipAnimalStateV87(future), future);
  const f = fixture(); f.save.shipAnimalsV1 = future;
  assert.equal(acquireShipAnimalV87(f.save, f.request, f.context).code, 'unsupported-schema');
});

test('real SaveSystem persists Mica once, isolates profiles, preserves active clock and rolls back quota failure', () => {
  const values = new Map(), storage = { reject: false, getItem: key => values.get(key) ?? null,
    setItem(key, value) { if (this.reject && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError'); values.set(key, value); },
    removeItem: key => values.delete(key) };
  const system = new SaveSystem(storage); system.newGame(1);
  const previous = historical(3); system.commit(previous);
  const before = copy(system.data), bytes = values.get(system.key()), candidate = buy(system.data);
  storage.reject = true; assert.throws(() => system.commit(candidate), error => error.code === 'SAVE_WRITE_FAILED');
  assert.deepEqual(system.data, before); assert.equal(values.get(system.key()), bytes);
  storage.reject = false; system.commit(candidate);
  const loaded = new SaveSystem(storage); loaded.load(1);
  assert.deepEqual(loaded.data.shipAnimalsV1, candidate.shipAnimalsV1);
  assert.equal(loaded.data.shipAnimalsV1.animals[ID].location.kind, 'transit');
  const replay = fixture(loaded.data); assert.equal(acquireShipAnimalV87(replay.save, replay.request, {}).code, 'already-applied');
  const other = new SaveSystem(storage); other.newGame(2);
  assert.deepEqual(other.data.shipAnimalsV1.animals, {}); assert.equal(other.data.shipAnimalsV1.stock[OFFER].status, 'available');
  assert.equal(other.data.shipAnimalsV1.lastSimulationTime, 0);
});
