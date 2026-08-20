import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_SCHEMA, createDefaultSave, migrateSave } from '../src/save.js';

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key), values };
}

test('default profile contains the persistent strategic layers', () => {
  const save = createDefaultSave(2);
  assert.equal(save.schema, SAVE_SCHEMA); assert.equal(save.profile, 2);
  assert.equal(save.crew.length, 16); assert.equal(Object.keys(save.galaxy.worldState).length, 64);
  assert.ok(save.hub.systems.quarantine >= 0); assert.ok(save.settings.subtitles);
  assert.equal(save.hub.positionX, 180); assert.deepEqual(save.hub.services, {});
});

test('legacy saves migrate additively without dropping player progress', () => {
  const migrated = migrateSave({ version: '18.0.0', player: { name: 'Ripley', health: 71 }, statistics: { kills: 42 }, galaxy: { resources: { credits: 9999 } } }, 3);
  assert.equal(migrated.schema, 48); assert.equal(migrated.player.name, 'Ripley'); assert.equal(migrated.player.health, 71);
  assert.equal(migrated.statistics.kills, 42); assert.equal(migrated.galaxy.resources.credits, 9999);
  assert.ok(migrated.galaxy.resources.fuel > 0); assert.equal(migrated.profile, 3);
  const malformedHub = migrateSave({ hub: { services: null, visited: 'bridge' }, crew: {}, clock: null }, 1);
  assert.deepEqual(malformedHub.hub.services, {}); assert.deepEqual(malformedHub.hub.visited, ['bridge']);
  assert.equal(malformedHub.crew.length, 16); assert.deepEqual(malformedHub.clock, { day: 1, hour: 6 });
  const hostile = migrateSave({ crew: [{ id: 'crew-001', status: '<img src=x onerror=alert(1)>', stress: 'bad' }], clock: { day: 1, hour: 25.5 } }, 1);
  assert.equal(hostile.crew[0].stress, 0); assert.equal(hostile.crew[0].status, 'active');
  assert.deepEqual(hostile.clock, { day: 2, hour: 1.5 });
});

test('three profile storage round-trips and exports', () => {
  const backend = storage(); const system = new SaveSystem(backend);
  system.newGame(1); system.data.statistics.kills = 7; system.commit();
  const restored = new SaveSystem(backend); restored.load(1);
  assert.equal(restored.data.statistics.kills, 7);
  assert.equal(JSON.parse(restored.export()).statistics.kills, 7);
  restored.import(JSON.stringify({ player: { name: 'BISHOP' } }), 2);
  assert.equal(restored.data.player.name, 'BISHOP'); assert.equal(restored.profile, 2);
});
