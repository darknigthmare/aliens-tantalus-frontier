import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_PREFIX, createDefaultSave, migrateSave } from '../src/save.js';
import { SAVE_SELECTED_PROFILE_KEY_V78 } from '../src/save-profile-v78.js';
import { SHIP_PORT_DEFINITION_V87 as PORT, createShipPortStateV87, migrateShipPortStateV87,
  requestShipPortDockV87, requestShipPortUndockV87, stepShipPortV87, canAccessPortCounterV87 } from '../src/ship-port-state-v87.js';

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
function readySystem(profile = 1) {
  const backend = storage(); const system = new SaveSystem(backend);
  system.newGame(profile);
  system.commit({ needsPlayerCreationV84: false, scene: 'hub' });
  return { backend, system };
}
const context = save => ({ authorization: { granted: true, portId: PORT.id, sectorId: PORT.sectorId,
  campaignHours: (save.clock.day - 1) * 24 + save.clock.hour },
  careReady: true, manifestReady: true, physical: { roomId: PORT.commandRoomId } });
const dock = (save, transactionId = 'dock-1') => requestShipPortDockV87(save, { transactionId, portId: PORT.id }, context(save));
const tick = save => stepShipPortV87(save, { simulationTime: save.shipPortV1.lastSimulationTime + 1, dtSeconds: 1 }, context(save));
function success(result) { assert.equal(result.ok, true, result.code); return result.save; }
function commitDocked(system) {
  system.commit(success(dock(system.data)));
  for (let i = 0; i < 14; i += 1) system.commit(success(tick(system.data)));
  assert.equal(canAccessPortCounterV87(system.data), true);
}

test('new profiles and historical saves receive independent undocked states without inventing a location', () => {
  const first = createDefaultSave(1); const second = createDefaultSave(2);
  assert.deepEqual(first.shipPortV1, createShipPortStateV87());
  assert.notEqual(first.shipPortV1, second.shipPortV1);
  assert.notEqual(first.shipPortV1.commands, second.shipPortV1.commands);
  const old = structuredClone(first); delete old.shipPortV1;
  const original = structuredClone(old); const migrated = migrateSave(old, 1);
  assert.deepEqual(old, original); assert.deepEqual(migrated.shipPortV1, createShipPortStateV87());
  assert.equal(migrated.worldId, old.worldId); assert.equal(canAccessPortCounterV87(migrated), false);
  assert.deepEqual(migrateSave(migrated, 1).shipPortV1, migrated.shipPortV1);
});

test('prepare is invisible until commit and dock authorization survives reload without granting early counter access', () => {
  const { backend, system } = readySystem(); const root = system.data;
  const before = JSON.stringify(root); const bytes = backend.values.get(system.key());
  const prepared = success(dock(root));
  assert.equal(JSON.stringify(root), before); assert.equal(backend.values.get(system.key()), bytes);
  system.commit(prepared);
  assert.equal(system.data, root); assert.equal(root.shipPortV1.phase, 'approach');
  assert.equal(canAccessPortCounterV87(root), false);
  const reloaded = new SaveSystem(backend); reloaded.load(1);
  assert.deepEqual(reloaded.data.shipPortV1, root.shipPortV1);
  assert.deepEqual(reloaded.data.galaxy.resources, JSON.parse(before).galaxy.resources);
  assert.equal(dock(reloaded.data).code, 'already-applied');
  prepared.shipPortV1.authorization.campaignHours = 500;
  assert.notEqual(root.shipPortV1.authorization.campaignHours, 500);
});

test('all maneuver stages round-trip and only persisted active steps open or close the physical counter', () => {
  const { backend, system } = readySystem(); system.commit(success(dock(system.data)));
  for (let i = 1; i <= 14; i += 1) {
    system.commit(success(tick(system.data)));
    assert.deepEqual(new SaveSystem(backend).load(1).shipPortV1, system.data.shipPortV1);
    assert.equal(canAccessPortCounterV87(system.data), i === 14);
  }
  const departure = requestShipPortUndockV87(system.data, { transactionId: 'leave-1' }, context(system.data));
  system.commit(success(departure)); assert.equal(canAccessPortCounterV87(system.data), false);
  for (let i = 0; i < 6; i += 1) system.commit(success(tick(system.data)));
  const loaded = new SaveSystem(backend).load(1);
  assert.equal(loaded.shipPortV1.phase, 'departed');
  assert.deepEqual(loaded.shipPortV1.position, { kind: 'unresolved' });
  assert.equal(loaded.galaxy.resources.credits, 3200);
});

test('loading after wall-clock absence and unrelated settings commits do not advance an approach', t => {
  const { backend, system } = readySystem(); system.commit(success(dock(system.data)));
  system.commit(success(tick(system.data)));
  const expected = structuredClone(system.data.shipPortV1);
  t.mock.method(Date, 'now', () => 9_999_999_999_999);
  const reloaded = new SaveSystem(backend); reloaded.load(1);
  reloaded.commit({ settings: { ...reloaded.data.settings, music: 0.2 } });
  assert.deepEqual(reloaded.data.shipPortV1, expected);
  assert.equal(canAccessPortCounterV87(reloaded.data), false);
});

for (const action of ['dock-request', 'final-docking-step', 'undock-request']) test(`${action}: quota failure keeps bytes, object identity, profile, credits and access unchanged`, () => {
  const { backend, system } = readySystem(2);
  if (action !== 'dock-request') {
    system.commit(success(dock(system.data)));
    for (let i = 0; i < (action === 'final-docking-step' ? 13 : 14); i += 1) system.commit(success(tick(system.data)));
  }
  const root = system.data; const port = root.shipPortV1;
  const before = JSON.stringify(root); const bytes = [...backend.values]; const accessible = canAccessPortCounterV87(root);
  const prepared = success(action === 'dock-request' ? dock(root) : action === 'final-docking-step' ? tick(root)
    : requestShipPortUndockV87(root, { transactionId: 'leave-1' }, context(root)));
  backend.rejectSaveWrites = true;
  assert.throws(() => system.commit(prepared), error => error.code === 'SAVE_WRITE_FAILED');
  assert.equal(system.data, root); assert.equal(system.data.shipPortV1, port); assert.equal(JSON.stringify(root), before);
  assert.deepEqual([...backend.values], bytes); assert.equal(system.profile, 2);
  assert.equal(backend.values.get(SAVE_SELECTED_PROFILE_KEY_V78), '2');
  assert.equal(canAccessPortCounterV87(system.data), accessible);
  backend.rejectSaveWrites = false; system.commit(prepared);
  assert.equal(system.data, root); assert.deepEqual(system.data.shipPortV1, prepared.shipPortV1);
  assert.deepEqual(new SaveSystem(backend).load(2).shipPortV1, prepared.shipPortV1);
});

test('actual profile switching isolates rendezvous position, authorization, command receipts and nested references', () => {
  const { backend, system } = readySystem(); commitDocked(system);
  const firstRoot = system.data; const first = structuredClone(firstRoot.shipPortV1);
  const firstBytes = backend.values.get(system.key(1));
  system.newGame(2); system.commit({ needsPlayerCreationV84: false, scene: 'hub' });
  assert.deepEqual(system.data.shipPortV1, createShipPortStateV87());
  system.commit(success(dock(system.data)));
  const second = structuredClone(system.data.shipPortV1);
  assert.notEqual(system.data.shipPortV1, firstRoot.shipPortV1);
  assert.equal(backend.values.get(system.key(1)), firstBytes);
  system.load(1); assert.deepEqual(system.data.shipPortV1, first); assert.equal(canAccessPortCounterV87(system.data), true);
  system.load(2); assert.deepEqual(system.data.shipPortV1, second); assert.equal(canAccessPortCounterV87(system.data), false);
  system.load(3); assert.deepEqual(system.data.shipPortV1, createShipPortStateV87());
  assert.deepEqual(firstRoot.shipPortV1, first);
});

test('future port schemas round-trip byte-content unchanged through unrelated commits and remain inaccessible', () => {
  const { backend, system } = readySystem();
  const future = { schema: 12, phase: 'docked', portId: 'future-relay', future: { routes: [7, 8] } };
  const raw = JSON.stringify({ ...system.data, shipPortV1: future }); backend.values.set(system.key(), raw);
  system.load(1); assert.equal(system.exportRawProfileV78(), raw);
  assert.deepEqual(system.data.shipPortV1, future); assert.equal(canAccessPortCounterV87(system.data), false);
  assert.equal(dock(system.data).code, 'unsupported-schema');
  system.commit({ settings: { ...system.data.settings, music: 0.3 } });
  assert.deepEqual(JSON.parse(system.exportRawProfileV78()).shipPortV1, future);
  assert.deepEqual(new SaveSystem(backend).load(1).shipPortV1, future);
});

for (const corrupt of [{ schema: 1, phase: 'docked', payload: 'retain' }, 'bad-port-state', ['bad'], 17]) test(`corrupt port root ${JSON.stringify(corrupt)} is quarantined idempotently without overwriting original stored bytes`, () => {
  const { backend, system } = readySystem();
  const raw = JSON.stringify({ ...system.data, shipPortV1: corrupt }); backend.values.set(system.key(), raw);
  system.load(1); assert.equal(system.exportRawProfileV78(), raw);
  const expected = structuredClone(system.data.shipPortV1);
  assert.deepEqual(expected.quarantined[0].original, corrupt);
  assert.deepEqual(expected.position, { kind: 'unresolved' }); assert.equal(canAccessPortCounterV87(system.data), false);
  assert.equal(dock(system.data).code, 'state-needs-review');
  assert.deepEqual(migrateShipPortStateV87(expected), expected);
  assert.deepEqual(migrateSave(system.data).shipPortV1, expected);
  system.commit({ settings: { ...system.data.settings, music: 0.4 } });
  assert.deepEqual(new SaveSystem(backend).load(1).shipPortV1, expected);
});

test('malformed save JSON keeps recovery protection and cannot be overwritten by a valid port candidate', () => {
  const { backend, system } = readySystem(2); const before = system.data;
  const raw = '{"shipPortV1":{"schema":1,"phase":'; backend.values.set(system.key(1), raw);
  assert.throws(() => system.load(1), error => error.code === 'SAVE_CORRUPT');
  assert.equal(system.profile, 2); assert.equal(system.data, before);
  const prepared = success(dock(system.data));
  assert.throws(() => system.commit(prepared), error => error.code === 'SAVE_RECOVERY_REQUIRED');
  assert.equal(system.exportRawProfileV78(), raw); assert.equal(system.data, before);
  assert.equal(canAccessPortCounterV87(system.data), false);
});
