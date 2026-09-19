import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_PREFIX, createDefaultSave, migrateSave } from '../src/save.js';
import { SAVE_SELECTED_PROFILE_KEY_V78 } from '../src/save-profile-v78.js';
import {
  createEmptyShipAnimalStateV87,
  migrateShipAnimalStateV87,
  acquireShipAnimalV87,
  transitionShipAnimalV87,
  SHIP_ANIMAL_OFFERS_V87
} from '../src/ship-animal-state-v87.js';

function storage() {
  const values = new Map();
  return { values, rejectSaveWrites: false,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (this.rejectSaveWrites && key.startsWith(SAVE_PREFIX)) throw new Error('QuotaExceededError');
      values.set(key, value);
    },
    removeItem(key) { values.delete(key); }
  };
}

function savedSystem(profile = 1) {
  const backend = storage();
  const system = new SaveSystem(backend);
  system.newGame(profile);
  return { backend, system };
}

const berth = Object.freeze({ hubId: 'tantalus', roomId: 'animal-quarter', deckId: 'deck-2', x: 360, y: 0 });
const station = Object.freeze({ hubId: 'trade-station', roomId: 'shop', deckId: 'deck-0', x: 80, y: 0 });

function purchase(save, animal = 'moka', transactionId = `acquire-${animal}`) {
  return acquireShipAnimalV87(save, {
    offerId: `offer-animal-${animal}`, transactionId, habitatId: `berth-${animal}`
  }, {
    vendorAccessible: true, artReadyIds: ['animal-moka', 'animal-brume'],
    habitats: [
      { id: 'berth-moka', installed: true, type: 'cat-berth', capacity: 1, location: berth },
      { id: 'berth-brume', installed: true, type: 'dog-berth', capacity: 1, location: berth }
    ],
    care: { available: true, capacity: 2 }, simulationTime: 6,
    transit: { edgeId: 'shop-to-ship', from: station, to: berth }
  });
}

function move(save, location, transactionId, context = {}) {
  return transitionShipAnimalV87(save, { animalId: 'animal-moka', transactionId, location }, {
    simulationTime: 7, canTransition: () => true, ...context
  });
}

function requireSuccess(result) {
  assert.equal(result.ok, true, result.code);
  return result;
}

test('new and legacy timelines receive separate empty animal registries without free adoption', () => {
  const first = createDefaultSave(1);
  const second = createDefaultSave(2);
  assert.deepEqual(first.shipAnimalsV1, createEmptyShipAnimalStateV87());
  assert.deepEqual(first.shipAnimalsV1.animals, {});
  assert.deepEqual(first.shipAnimalsV1.reservations, {});
  assert.deepEqual(first.shipAnimalsV1.receipts, {});
  assert.notEqual(first.shipAnimalsV1, second.shipAnimalsV1);
  assert.notEqual(first.shipAnimalsV1.stock, second.shipAnimalsV1.stock);
  const old = structuredClone(first);
  delete old.shipAnimalsV1;
  old.memorial = [{ id: 'marine-test', reason: 'mission' }];
  old.player.name = 'Legacy operator';
  const original = structuredClone(old);
  const migrated = migrateSave(old, 1);
  assert.deepEqual(old, original);
  assert.deepEqual(migrated.shipAnimalsV1, createEmptyShipAnimalStateV87());
  assert.deepEqual(migrateSave(migrated, 1).shipAnimalsV1, migrated.shipAnimalsV1);
  assert.deepEqual(migrated.memorial, old.memorial);
  assert.equal(migrated.player.name, 'Legacy operator');
  assert.deepEqual(Object.keys(migrated).filter(key => /animal|pet|tribute|refuge/i.test(key)), ['shipAnimalsV1']);
});

test('pure purchase publishes exactly one paid individual and reservation only after real SaveSystem commit, then reloads', () => {
  const { backend, system } = savedSystem();
  const root = system.data;
  const original = JSON.stringify(root);
  const originalBytes = backend.values.get(system.key());
  const credits = root.galaxy.resources.credits;
  const result = requireSuccess(purchase(root));
  assert.equal(result.changed, true);
  assert.notEqual(result.save, root);
  assert.equal(JSON.stringify(root), original);
  assert.equal(backend.values.get(system.key()), originalBytes);
  assert.deepEqual(Object.keys(root.shipAnimalsV1.animals), []);
  system.commit(result.save);
  assert.equal(system.data, root);
  assert.equal(root.galaxy.resources.credits, credits - SHIP_ANIMAL_OFFERS_V87['offer-animal-moka'].costCredits);
  assert.deepEqual(Object.keys(root.shipAnimalsV1.animals), ['animal-moka']);
  assert.deepEqual(root.shipAnimalsV1.reservations['animal-moka'], { animalId: 'animal-moka', habitatId: 'berth-moka', slots: 1 });
  assert.equal(root.shipAnimalsV1.animals['animal-moka'].location.kind, 'transit');
  const restarted = new SaveSystem(backend);
  const restored = restarted.loadLastProfileV78();
  assert.deepEqual(restored.shipAnimalsV1, root.shipAnimalsV1);
  assert.equal(restored.galaxy.resources.credits, root.galaxy.resources.credits);
  result.save.shipAnimalsV1.animals['animal-moka'].name = 'Detached mutation';
  assert.equal(restored.shipAnimalsV1.animals['animal-moka'].name, 'Moka');
  assert.equal(root.shipAnimalsV1.animals['animal-moka'].name, 'Moka');
});

test('acquisition receipts survive reload and make same-request replay idempotent without another debit or companion', () => {
  const { backend, system } = savedSystem();
  system.commit(requireSuccess(purchase(system.data)).save);
  const afterPurchase = structuredClone(system.data.shipAnimalsV1);
  const credits = system.data.galaxy.resources.credits;
  const reloaded = new SaveSystem(backend);
  reloaded.load(1);
  const replay = requireSuccess(purchase(reloaded.data));
  assert.equal(replay.changed, false);
  assert.equal(replay.code, 'already-applied');
  reloaded.commit(replay.save);
  assert.deepEqual(reloaded.data.shipAnimalsV1, afterPurchase);
  assert.equal(reloaded.data.galaxy.resources.credits, credits);
  assert.equal(purchase(reloaded.data, 'moka', 'second-purchase').code, 'already-owned');
  assert.equal(purchase(reloaded.data, 'brume', 'acquire-moka').code, 'transaction-conflict');
  assert.deepEqual(new SaveSystem(backend).load(1).shipAnimalsV1, afterPurchase);
});

test('transport progress, intake, acclimation and residence persist as explicit stages, not elapsed real time', t => {
  const { backend, system } = savedSystem();
  system.commit(requireSuccess(purchase(system.data)).save);
  const transport = structuredClone(system.data.shipAnimalsV1.animals['animal-moka'].location);
  system.commit(requireSuccess(move(system.data, { ...transport, progress: 1 }, 'transport-complete')).save);
  const phases = [
    ['intake', { transportComplete: true }],
    ['acclimating', { arrivalCheckPassed: true }],
    ['resident', { acclimationComplete: true }]
  ];
  for (const [kind, context] of phases) {
    const request = { ...berth, kind };
    system.commit(requireSuccess(move(system.data, request, `phase-${kind}`, context)).save);
    const restarted = new SaveSystem(backend);
    assert.deepEqual(restarted.load(1).shipAnimalsV1, system.data.shipAnimalsV1);
    assert.equal(restarted.data.shipAnimalsV1.animals['animal-moka'].location.kind, kind);
    const replay = requireSuccess(move(restarted.data, request, `phase-${kind}`, context));
    assert.equal(replay.changed, false);
    assert.equal(replay.code, 'already-applied');
  }
  const expected = structuredClone(system.data.shipAnimalsV1);
  const credits = system.data.galaxy.resources.credits;
  t.mock.method(Date, 'now', () => 9_999_999_999_999);
  const afterLongAbsence = new SaveSystem(backend);
  afterLongAbsence.load(1);
  afterLongAbsence.commit({ settings: { ...afterLongAbsence.data.settings, music: 0.2 } });
  assert.deepEqual(afterLongAbsence.data.shipAnimalsV1, expected);
  assert.equal(afterLongAbsence.data.galaxy.resources.credits, credits);
  assert.equal(afterLongAbsence.data.shipAnimalsV1.animals['animal-moka'].needs.health, 100);
});

for (const action of ['acquisition', 'transport']) test(`${action}: quota failure preserves bytes, active object, wallet and selected profile; retry commits once`, () => {
  const { backend, system } = savedSystem(2);
  if (action === 'transport') system.commit(requireSuccess(purchase(system.data)).save);
  const root = system.data;
  const animalState = root.shipAnimalsV1;
  const memory = JSON.stringify(root);
  const bytes = [...backend.values];
  const result = requireSuccess(action === 'acquisition' ? purchase(root)
    : move(root, { ...root.shipAnimalsV1.animals['animal-moka'].location, progress: 0.5 }, 'transport-half'));
  backend.rejectSaveWrites = true;
  assert.throws(() => system.commit(result.save), error => error.code === 'SAVE_WRITE_FAILED');
  assert.equal(system.data, root);
  assert.equal(system.data.shipAnimalsV1, animalState);
  assert.equal(JSON.stringify(system.data), memory);
  assert.equal(system.profile, 2);
  assert.equal(backend.values.get(SAVE_SELECTED_PROFILE_KEY_V78), '2');
  assert.deepEqual([...backend.values], bytes);
  backend.rejectSaveWrites = false;
  system.commit(result.save);
  assert.equal(system.data, root);
  assert.deepEqual(system.data.shipAnimalsV1, result.save.shipAnimalsV1);
  const restarted = new SaveSystem(backend);
  restarted.loadLastProfileV78();
  assert.equal(restarted.profile, 2);
  assert.deepEqual(restarted.data.shipAnimalsV1, result.save.shipAnimalsV1);
  assert.equal(restarted.data.galaxy.resources.credits, result.save.galaxy.resources.credits);
});

test('switching real profiles isolates animal identity, wallet, reservations, receipts and mutable references', () => {
  const { backend, system } = savedSystem();
  system.commit(requireSuccess(purchase(system.data)).save);
  const first = structuredClone(system.data.shipAnimalsV1);
  const firstCredits = system.data.galaxy.resources.credits;
  const firstBytes = backend.values.get(system.key(1));
  const firstReference = system.data;
  system.newGame(2);
  assert.deepEqual(system.data.shipAnimalsV1.animals, {});
  // Transaction IDs are scoped to a profile, not a global/localStorage-wide adoption ledger.
  system.commit(requireSuccess(purchase(system.data, 'brume', 'acquire-moka')).save);
  const second = structuredClone(system.data.shipAnimalsV1);
  const secondCredits = system.data.galaxy.resources.credits;
  const secondBytes = backend.values.get(system.key(2));
  assert.equal(backend.values.get(system.key(1)), firstBytes);
  assert.notEqual(firstReference, system.data);
  assert.notEqual(firstReference.shipAnimalsV1, system.data.shipAnimalsV1);
  assert.deepEqual(firstReference.shipAnimalsV1, first);
  system.load(1);
  assert.deepEqual(system.data.shipAnimalsV1, first);
  assert.equal(system.data.galaxy.resources.credits, firstCredits);
  assert.equal(backend.values.get(system.key(2)), secondBytes);
  system.load(2);
  assert.deepEqual(system.data.shipAnimalsV1, second);
  assert.equal(system.data.galaxy.resources.credits, secondCredits);
  system.load(3);
  assert.deepEqual(system.data.shipAnimalsV1, createEmptyShipAnimalStateV87());
  assert.equal(backend.values.get(system.key(1)), firstBytes);
  assert.equal(backend.values.get(system.key(2)), secondBytes);
});

test('a newer animal schema round-trips untouched through SaveSystem and cannot be bought into or downgraded', () => {
  const { backend, system } = savedSystem();
  const future = { schema: 9, revision: 124, animals: { 'later-species': { payload: [4, 5] } },
    futureTransport: { edge: 'new-edge', archived: false }, diagnostics: ['future-diagnostic'] };
  const source = { ...system.data, shipAnimalsV1: future };
  const raw = JSON.stringify(source);
  backend.values.set(system.key(), raw);
  const loaded = system.load(1);
  assert.deepEqual(loaded.shipAnimalsV1, future);
  assert.notEqual(loaded.shipAnimalsV1, future);
  assert.equal(system.exportRawProfileV78(), raw);
  assert.equal(purchase(loaded).code, 'unsupported-schema');
  system.commit({ settings: { ...loaded.settings, music: 0.3 } });
  assert.deepEqual(JSON.parse(system.exportRawProfileV78()).shipAnimalsV1, future);
  assert.deepEqual(new SaveSystem(backend).load(1).shipAnimalsV1, future);
});

test('a corrupt individual is quarantined with its original data; loading does not rewrite bytes or create a replacement', () => {
  const { backend, system } = savedSystem();
  const source = requireSuccess(purchase(system.data)).save;
  source.shipAnimalsV1.animals['animal-moka'].location = { kind: 'resident', roomId: 'missing-deck-and-position' };
  const originalAnimal = structuredClone(source.shipAnimalsV1.animals['animal-moka']);
  const raw = JSON.stringify(source);
  backend.values.set(system.key(), raw);
  const loaded = system.load(1);
  assert.equal(system.exportRawProfileV78(), raw);
  assert.deepEqual(loaded.shipAnimalsV1.animals, {});
  assert.equal(loaded.galaxy.resources.credits, source.galaxy.resources.credits);
  assert.equal(loaded.shipAnimalsV1.stock['offer-animal-moka'].status, 'unavailable');
  assert.deepEqual(loaded.shipAnimalsV1.quarantined.find(entry => entry.path === 'animals.animal-moka')?.original, originalAnimal);
  assert.equal(purchase(loaded).code, 'state-needs-review');
  const recovered = structuredClone(loaded.shipAnimalsV1);
  assert.deepEqual(migrateShipAnimalStateV87(recovered), recovered);
  system.commit({ settings: { ...loaded.settings, music: 0.4 } });
  const restarted = new SaveSystem(backend);
  restarted.load(1);
  assert.deepEqual(restarted.data.shipAnimalsV1, recovered);
  assert.deepEqual(restarted.data.shipAnimalsV1.quarantined.find(entry => entry.path === 'animals.animal-moka')?.original, originalAnimal);
});

for (const corrupt of ['broken-animal-registry', ['not-a-registry'], 17]) test(`malformed root animal state ${JSON.stringify(corrupt)} preserves the original and is migration-idempotent`, () => {
  const { backend, system } = savedSystem();
  const raw = JSON.stringify({ ...system.data, shipAnimalsV1: corrupt });
  backend.values.set(system.key(), raw);
  system.load(1);
  assert.equal(system.exportRawProfileV78(), raw);
  const state = structuredClone(system.data.shipAnimalsV1);
  assert.deepEqual(state.animals, {});
  assert.deepEqual(state.quarantined[0], { path: 'shipAnimalsV1', code: 'invalid-registry', original: corrupt });
  assert.equal(purchase(system.data).code, 'state-needs-review');
  assert.deepEqual(migrateSave(system.data).shipAnimalsV1, state);
  system.commit({ shipAnimalsV1: state });
  assert.deepEqual(new SaveSystem(backend).load(1).shipAnimalsV1, state);
});

test('malformed save JSON remains protected byte-for-byte and cannot be replaced by an animal purchase commit', () => {
  const { backend, system } = savedSystem(2);
  const before = system.data;
  const raw = '{"shipAnimalsV1":{"schema":1,"animals":';
  backend.values.set(system.key(1), raw);
  assert.throws(() => system.load(1), error => error.code === 'SAVE_CORRUPT');
  assert.equal(system.profile, 2);
  assert.equal(system.data, before);
  const result = requireSuccess(purchase(system.data));
  assert.throws(() => system.commit(result.save), error => error.code === 'SAVE_RECOVERY_REQUIRED');
  assert.equal(system.exportRawProfileV78(), raw);
  assert.equal(system.data, before);
  assert.deepEqual(system.data.shipAnimalsV1.animals, {});
});
