import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, createDefaultSave, migrateSave, beginOperation, SAVE_SCHEMA } from '../src/save.js';
import { SAVE_SELECTED_PROFILE_KEY_V78, SAVE_PAYLOAD_LIMITS_V144, inspectSaveSlotV78 } from '../src/save-profile-v78.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';

function memory() {
  const map = new Map();
  return { map, fail: false, getItem: key => map.get(key) ?? null,
    setItem(key, value) { if (this.fail) throw new Error('quota'); map.set(key, String(value)); },
    removeItem: key => map.delete(key) };
}
const ready = () => { const storage = memory(); const system = new SaveSystem(storage); system.newGame(1); return { storage, system }; };

for (const profile of [1, 2, 3]) test(`new game ${profile}: resets only its slot, keeps other profiles and Forge`, () => {
  const { storage, system } = ready();
  for (const id of [1, 2, 3]) { system.newGame(id); system.commit({ player: { ...system.data.player, name: `Old ${id}` } }); }
  storage.setItem('atf-frontier-forge-workspace-v134', 'user-project');
  const before = new Map(storage.map);
  system.newGame(profile);
  assert.equal(system.data.strategy.currentOperation, null);
  assert.equal(system.data.statistics.kills, 0);
  assert.notEqual(system.data.player.name, `Old ${profile}`);
  for (const id of [1, 2, 3].filter(id => id !== profile)) assert.equal(storage.getItem(system.key(id)), before.get(system.key(id)));
  assert.equal(storage.getItem('atf-frontier-forge-workspace-v134'), 'user-project');
  assert.equal(new SaveSystem(storage).loadLastProfileV78().profile, profile);
});
test('failed new game does not publish an in-memory switch or erase the old save', () => {
  const { storage, system } = ready(); const before = system.data, raw = system.exportRawProfileV78();
  storage.fail = true;
  assert.throws(() => system.newGame(2), { code: 'SAVE_WRITE_FAILED' });
  assert.equal(system.profile, 1); assert.equal(system.data, before); assert.equal(storage.getItem(system.key(1)), raw);
  assert.equal(storage.getItem(system.key(2)), null);
});
test('corrupt profile is exportable and protected against autosave', () => {
  const { storage, system } = ready(); const before = system.data;
  storage.setItem(system.key(2), '{broken');
  assert.throws(() => system.load(2), { code: 'SAVE_CORRUPT' });
  assert.equal(system.data, before); assert.equal(system.exportRawProfileV78(2), '{broken');
  assert.throws(() => system.commit(), { code: 'SAVE_RECOVERY_REQUIRED' });
  assert.equal(storage.getItem(system.key(2)), '{broken');
});
for (const invalid of ['{}', '[]', '{', '{"profile":1}']) test(`invalid import preserves active data: ${invalid}`, () => {
  const { storage, system } = ready(); const before = system.data, raw = storage.getItem(system.key());
  assert.throws(() => system.import(invalid), { code: 'SAVE_IMPORT_INVALID' });
  assert.equal(system.data, before); assert.equal(storage.getItem(system.key()), raw);
});
test('export/import/reload keeps resources and player selections without changing schema', () => {
  const { storage, system } = ready();
  system.data.player.name = 'Test Operator'; system.data.statistics.kills = 17;
  system.commit(); const text = system.export(); system.newGame(1); system.import(text);
  const loaded = new SaveSystem(storage).load(1);
  assert.equal(loaded.player.name, 'Test Operator'); assert.equal(loaded.statistics.kills, 17);
  assert.equal(SAVE_SCHEMA, 52);
});
test('inactive cloud-style import is conditional and leaves selection untouched', () => {
  const { storage, system } = ready(); const active = system.data, selected = storage.getItem(SAVE_SELECTED_PROFILE_KEY_V78);
  const incoming = createDefaultSave(2); incoming.player.name = 'Second Operator';
  system.importInactiveProfileV119(JSON.stringify(incoming), 2, null);
  assert.equal(system.data, active); assert.equal(system.profile, 1); assert.equal(storage.getItem(SAVE_SELECTED_PROFILE_KEY_V78), selected);
  const raw = storage.getItem(system.key(2));
  assert.throws(() => system.importInactiveProfileV119(JSON.stringify(incoming), 2, null), /changé/);
  assert.equal(storage.getItem(system.key(2)), raw);
  assert.throws(() => system.importInactiveProfileV119(JSON.stringify(incoming), 1, null), /active/);
});
test('ordinary commit preserves the root held by running systems', () => {
  const { system } = ready(); const root = system.data;
  system.commit({ statistics: { ...root.statistics, kills: 9 } });
  assert.equal(system.data, root); assert.equal(root.statistics.kills, 9);
});
test('MIRE correction never moves an already deployed operation or charges it twice', () => {
  const { storage, system } = ready();
  const campaign = CAMPAIGNS.find(c => c.source === 'Aliens 1986' && c.mode === 'MIRE');
  const legacyWorld = WORLDS.find(w => w.id === 'world-02-lv-223');
  system.data.galaxy.unlockedWorldIds.push(legacyWorld.id);
  const started = beginOperation(system.data, campaign, legacyWorld);
  assert.equal(started.resumed, false);
  system.commit(); const exported = system.export();
  const migrated = migrateSave(JSON.parse(exported), 1);
  assert.equal(migrated.strategy.currentOperation.worldId, legacyWorld.id);
  const before = JSON.stringify(migrated.galaxy.resources), clock = JSON.stringify(migrated.clock);
  const resumed = beginOperation(migrated, campaign, WORLDS.find(w => w.id === campaign.worldId));
  assert.equal(resumed.resumed, true); assert.equal(resumed.operation.worldId, legacyWorld.id);
  assert.equal(JSON.stringify(migrated.galaxy.resources), before); assert.equal(JSON.stringify(migrated.clock), clock);
  assert.equal(resumed.operation.id, started.operation.id);
  assert.ok(storage.getItem(system.key()));
});
test('new MIRE deployments use the corrected setting', () => {
  const save = createDefaultSave(1), campaign = CAMPAIGNS.find(c => c.source === 'Aliens 1986' && c.mode === 'MIRE');
  const world = WORLDS.find(w => w.id === campaign.worldId); save.galaxy.unlockedWorldIds.push(world.id);
  const result = beginOperation(save, campaign, world);
  assert.equal(result.operation.worldId, 'world-01-acheron-lv-426');
});
test('slot deletion does not clear Forge or another profile', () => {
  const { storage, system } = ready(); system.newGame(2); const second = storage.getItem(system.key(2));
  storage.setItem('atf-frontier-forge-workspace-v134', 'project'); system.delete(1);
  assert.equal(storage.getItem(system.key(1)), null); assert.equal(storage.getItem(system.key(2)), second);
  assert.equal(storage.getItem('atf-frontier-forge-workspace-v134'), 'project');
});

for (const schema of [53, 144, '53', 1e9]) test(`future schema ${schema} is preserved and cannot be silently downgraded`, () => {
  const { storage, system } = ready(), before = system.data;
  const payload = { ...createDefaultSave(2), schema, futureField: { important: true } };
  const raw = JSON.stringify(payload);
  storage.setItem(system.key(2), raw);
  assert.throws(() => system.load(2), { code: 'SAVE_CORRUPT' });
  assert.equal(system.data, before); assert.equal(system.exportRawProfileV78(2), raw);
  assert.throws(() => system.commit(), { code: 'SAVE_RECOVERY_REQUIRED' });
  assert.throws(() => system.import(raw, 1), { code: 'SAVE_IMPORT_INVALID' });
  assert.equal(storage.getItem(system.key(2)), raw);
});
for (const schema of [null, {}, [], true, -1, 1.5, 'fifty-two']) test(`malformed explicit schema ${JSON.stringify(schema)} is refused`, () => {
  const { storage, system } = ready(), before = storage.getItem(system.key());
  assert.throws(() => system.import(JSON.stringify({ schema, player: { name: 'Bad header' } })), { code: 'SAVE_IMPORT_INVALID' });
  assert.equal(storage.getItem(system.key()), before);
});
for (const schema of [undefined, 0, 50, 52, '52']) test(`supported legacy/current schema ${schema} still migrates`, () => {
  const { system } = ready();
  system.import(JSON.stringify({ schema, player: { name: 'Preserved operator' } }));
  assert.equal(system.data.player.name, 'Preserved operator'); assert.equal(system.data.schema, SAVE_SCHEMA);
});
test('deep untrusted import fails before migration and leaves the prior save exportable', () => {
  const { storage, system } = ready(), before = storage.getItem(system.key());
  const text = '{"schema":52,"player":{"name":"Deep"},"nested":' + '['.repeat(70) + '0' + ']'.repeat(70) + '}';
  assert.throws(() => system.import(text), { code: 'SAVE_IMPORT_INVALID' });
  assert.equal(storage.getItem(system.key()), before);
});
test('prototype-control keys anywhere in an import cannot cross the save boundary', () => {
  for (const key of ['__proto__', 'prototype', 'constructor']) {
    const { storage, system } = ready(), before = storage.getItem(system.key());
    const text = `{"player":{"name":"Unsafe"},"extension":{"${key}":{"polluted":true}}}`;
    assert.throws(() => system.import(text), { code: 'SAVE_IMPORT_INVALID' });
    assert.equal(storage.getItem(system.key()), before); assert.equal({}.polluted, undefined);
  }
});

test('save input budgets match the unchanged migration schema', () => {
  assert.equal(SAVE_PAYLOAD_LIMITS_V144.schema, SAVE_SCHEMA);
  assert.ok(Object.isFrozen(SAVE_PAYLOAD_LIMITS_V144));
  const text = JSON.stringify({ schema: 52, player: { name: 'Valid' } });
  assert.equal(inspectSaveSlotV78(text).status, 'ready');
  assert.equal(inspectSaveSlotV78(' '.repeat(SAVE_PAYLOAD_LIMITS_V144.bytes + 1)).reason, 'payload-too-large');
  assert.equal(inspectSaveSlotV78('é'.repeat(SAVE_PAYLOAD_LIMITS_V144.bytes / 2 + 1)).reason, 'payload-too-large');
  const broad = JSON.stringify({ player: { name: 'Broad' }, values: new Array(SAVE_PAYLOAD_LIMITS_V144.nodes).fill(0) });
  assert.equal(inspectSaveSlotV78(broad).reason, 'payload-too-complex');
});
