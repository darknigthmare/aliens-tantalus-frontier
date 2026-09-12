import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_PREFIX, LEGACY_KEYS, createDefaultSave, beginOperation, recordOperationResumeState } from '../src/save.js';
import { SAVE_SELECTED_PROFILE_KEY_V78, assertSaveProfileIdV78, inspectSaveSlotV78 } from '../src/save-profile-v78.js';
import { CAMPAIGNS, WEAPONS, WORLDS } from '../src/content.js';
import { startTacticalReloadV77, updateTacticalReloadV77, pressTacticalReloadV77, captureTacticalReloadV77 } from '../src/tactical-reload-v77.js';

function storage() {
  const values = new Map();
  const failures = {};
  const writes = [];
  const check = (kind, key) => { if (failures[kind]?.(key)) throw new Error(kind + ' denied'); };
  return {
    values, failures, writes,
    getItem(key) { check('read', key); return values.get(key) ?? null; },
    setItem(key, value) { check('write', key); values.set(key, value); writes.push(key); },
    removeItem(key) { check('remove', key); values.delete(key); }
  };
}

function populated() {
  const backend = storage();
  const system = new SaveSystem(backend);
  system.newGame(1);
  system.data.player.name = 'PROGRESSION À CONSERVER';
  system.data.statistics.kills = 77;
  system.commit();
  return { backend, system };
}

const hasCode = (code) => (error) => error.code === code;

for (const text of ['true', '42', '"une image"', '[]', '{}', 'null', '{"unrelated":"document"}', '{"player":{}}', '{"player":{"unrelated":"document"}}', '{"settings":{"theme":"green"}}', '{"crew":[{}]}', '{bad json']) {
  test('an unrelated or malformed import cannot replace a saved timeline: ' + text, () => {
    const { backend, system } = populated();
    const data = system.data;
    const before = [...backend.values];
    assert.throws(() => system.import(text, 2), hasCode('SAVE_IMPORT_INVALID'));
    assert.strictEqual(system.data, data);
    assert.equal(system.profile, 1);
    assert.equal(system.data.statistics.kills, 77);
    assert.deepEqual([...backend.values], before);
  });
}

test('a real incomplete legacy import remains supported and changes only the chosen profile', () => {
  const { backend, system } = populated();
  const primary = backend.values.get(SAVE_PREFIX + '1');
  system.import(JSON.stringify({ player: { name: 'BISHOP' } }), '2');
  assert.equal(system.profile, 2);
  assert.equal(system.data.profile, 2);
  assert.equal(system.data.player.name, 'BISHOP');
  assert.equal(backend.values.get(SAVE_PREFIX + '1'), primary);
  assert.equal(backend.values.get(SAVE_SELECTED_PROFILE_KEY_V78), '2');
});

for (const action of ['new-current', 'new-other', 'import', 'patch-commit']) {
  test('failed storage is atomic for ' + action, () => {
    const { backend, system } = populated();
    const before = [...backend.values];
    const data = system.data;
    const serialized = JSON.stringify(data);
    backend.failures.write = (key) => key.startsWith(SAVE_PREFIX);
    const run = {
      'new-current': () => system.newGame(1),
      'new-other': () => system.newGame(2),
      import: () => system.import('{"player":{"name":"OTHER"}}', 2),
      'patch-commit': () => system.commit({ player: { name: 'OTHER' } })
    }[action];
    assert.throws(run, hasCode('SAVE_WRITE_FAILED'));
    assert.equal(system.profile, 1);
    assert.strictEqual(system.data, data);
    assert.equal(JSON.stringify(system.data), serialized);
    assert.deepEqual([...backend.values], before);
  });
}

test('a failed read cannot pair profile 3 with profile 1 data and blocks subsequent automatic writes until recovery', () => {
  const { backend, system } = populated();
  const data = system.data;
  backend.failures.read = (key) => key === SAVE_PREFIX + '3';
  assert.throws(() => system.load(3), hasCode('SAVE_READ_FAILED'));
  assert.equal(system.profile, 1);
  assert.strictEqual(system.data, data);
  assert.equal(system.recoveryNeeded.profile, 3);
  assert.equal(system.recoveryNeeded.status, 'unavailable');
  assert.throws(() => system.commit(), hasCode('SAVE_RECOVERY_REQUIRED'));
  delete backend.failures.read;
  system.load(1);
  assert.equal(system.recoveryNeeded, null);
  assert.equal(system.data.statistics.kills, 77);
  assert.doesNotThrow(() => system.commit());
});

for (const value of [0, 4, -1, 1.5, NaN, Infinity, false, true, null, '1.5', '1.0', '0', '../2', {}, []]) {
  test('invalid slot ' + String(value) + ' cannot read, write, import or delete an arbitrary key', () => {
    const { backend, system } = populated();
    const before = [...backend.values];
    for (const action of [() => system.key(value), () => system.load(value), () => system.newGame(value), () => system.import('{"player":{"name":"X"}}', value), () => system.delete(value)]) {
      assert.throws(action, hasCode('SAVE_PROFILE_INVALID'));
    }
    assert.deepEqual([...backend.values], before);
    assert.equal(system.profile, 1);
    assert.equal(system.data.statistics.kills, 77);
  });
}

test('numeric DOM slot strings are canonical and deleting the active string slot resets the correct profile', () => {
  const { backend, system } = populated();
  assert.equal(assertSaveProfileIdV78(' 2 '), 2);
  system.newGame('2');
  system.data.statistics.kills = 5;
  system.commit();
  system.delete('2');
  assert.equal(system.profile, 2);
  assert.equal(system.data.profile, 2);
  assert.equal(system.data.statistics.kills, 0);
  assert.equal(backend.values.has(SAVE_PREFIX + '2'), false);
  assert.equal(JSON.parse(backend.values.get(SAVE_PREFIX + '1')).statistics.kills, 77);
});

for (const raw of ['', '{bad', 'true', '[]', '{}', 'null', '{"unknown":1}']) {
  test('damaged persisted bytes are never advertised as an empty slot or automatically overwritten: ' + raw, () => {
    const backend = storage();
    backend.values.set(SAVE_PREFIX + '1', raw);
    const system = new SaveSystem(backend);
    const slot = system.listProfiles()[0];
    assert.equal(slot.empty, false);
    assert.equal(slot.status, 'corrupt');
    assert.throws(() => system.loadLastProfileV78(), hasCode('SAVE_CORRUPT'));
    assert.equal(system.recoveryNeeded.profile, 1);
    assert.equal(system.recoveryNeeded.status, 'corrupt');
    assert.throws(() => system.commit(), hasCode('SAVE_RECOVERY_REQUIRED'));
    assert.equal(system.exportRawProfileV78(), raw);
    assert.equal(backend.values.get(SAVE_PREFIX + '1'), raw);
    assert.equal(backend.writes.length, 0);
  });
}

test('recovery is cleared only after an explicit replacement successfully reaches storage', () => {
  const backend = storage();
  backend.values.set(SAVE_PREFIX + '1', '{damaged original');
  const system = new SaveSystem(backend);
  assert.throws(() => system.load(1));
  backend.failures.write = (key) => key === SAVE_PREFIX + '1';
  assert.throws(() => system.newGame(1), hasCode('SAVE_WRITE_FAILED'));
  assert.ok(system.recoveryNeeded);
  assert.equal(system.exportRawProfileV78(), '{damaged original');
  delete backend.failures.write;
  system.import('{"player":{"name":"RECOVERED"}}', 1);
  assert.equal(system.recoveryNeeded, null);
  assert.equal(system.data.player.name, 'RECOVERED');
  assert.doesNotThrow(() => system.commit());
});

test('profile listing reports inaccessible storage without mistaking it for three empty timelines', () => {
  const { backend, system } = populated();
  backend.failures.read = (key) => key === SAVE_PREFIX + '2';
  const slots = system.listProfiles();
  assert.deepEqual(slots.map((slot) => [slot.profile, slot.status, slot.empty]), [[1, 'ready', false], [2, 'unavailable', false], [3, 'empty', true]]);
  assert.equal(system.profile, 1);
});

test('a shared legacy save imports only into primary profile and remains byte-for-byte intact', () => {
  const backend = storage();
  const legacy = JSON.stringify({ version: '18.0.0', player: { name: 'RIPLEY' }, statistics: { kills: 42 } });
  backend.values.set(LEGACY_KEYS[0], legacy);
  const system = new SaveSystem(backend);
  system.load(2);
  assert.equal(system.data.statistics.kills, 0);
  assert.equal(system.data.migratedFromKey, undefined);
  system.load(1);
  assert.equal(system.data.statistics.kills, 42);
  assert.equal(system.data.player.name, 'RIPLEY');
  assert.equal(system.data.migratedFromKey, LEGACY_KEYS[0]);
  assert.equal(backend.values.get(LEGACY_KEYS[0]), legacy);
});

test('last successful profile selection survives a new SaveSystem without loading another timeline', () => {
  const { backend, system } = populated();
  system.newGame(3);
  system.data.statistics.kills = 3;
  system.commit();
  const restarted = new SaveSystem(backend);
  restarted.loadLastProfileV78();
  assert.equal(restarted.profile, 3);
  assert.equal(restarted.data.statistics.kills, 3);
  restarted.load('1');
  const again = new SaveSystem(backend);
  again.loadLastProfileV78();
  assert.equal(again.profile, 1);
  assert.equal(again.data.statistics.kills, 77);
});

test('invalid last-profile markers safely choose slot 1 and cannot create extra slots', () => {
  const { backend } = populated();
  for (const marker of ['0', '4', '1.5', 'Infinity', '{}', 'not-a-slot', '']) {
    backend.values.set(SAVE_SELECTED_PROFILE_KEY_V78, marker);
    const system = new SaveSystem(backend);
    system.loadLastProfileV78();
    assert.equal(system.profile, 1);
    assert.equal(system.data.statistics.kills, 77);
    assert.equal(backend.values.get(SAVE_SELECTED_PROFILE_KEY_V78), '1');
  }
  assert.deepEqual([...backend.values.keys()].filter((key) => key.startsWith(SAVE_PREFIX)), [SAVE_PREFIX + '1']);
});

test('a last-profile marker write failure does not undo a successful save and is disclosed separately', () => {
  const { backend, system } = populated();
  backend.failures.write = (key) => key === SAVE_SELECTED_PROFILE_KEY_V78;
  system.newGame(2);
  assert.equal(system.profile, 2);
  assert.equal(JSON.parse(backend.values.get(SAVE_PREFIX + '2')).profile, 2);
  assert.equal(backend.values.get(SAVE_SELECTED_PROFILE_KEY_V78), '1');
  assert.deepEqual(system.selectionPersistenceV78, { profile: 2, persisted: false, code: 'SAVE_SELECTION_WRITE_FAILED' });
});

test('read errors while discovering a legacy save retain the active profile and require explicit recovery', () => {
  const { backend, system } = populated();
  system.load(2);
  backend.values.delete(SAVE_PREFIX + '1');
  backend.failures.read = (key) => LEGACY_KEYS.includes(key);
  assert.throws(() => system.load(1), hasCode('SAVE_READ_FAILED'));
  assert.equal(system.profile, 2);
  assert.equal(system.recoveryNeeded.reason, 'legacy-read-failed');
  assert.throws(() => system.commit(), hasCode('SAVE_RECOVERY_REQUIRED'));
});

test('ordinary commits preserve shared state identity and cannot claim success without storage', () => {
  const { system } = populated();
  const data = system.data;
  system.commit();
  assert.strictEqual(system.data, data);
  system.commit({
    settings: { ...system.data.settings, music: 0.37 },
    narrativeArchives: { discovered: { 'qz17-pda-loading-chief': true } }
  });
  assert.strictEqual(system.data, data);
  assert.equal(data.settings.music, 0.37);
  assert.equal(data.narrativeArchives.discovered['qz17-pda-loading-chief']?.id, 'qz17-pda-loading-chief');
  const unavailable = new SaveSystem(null);
  assert.throws(() => unavailable.newGame(2), hasCode('SAVE_WRITE_FAILED'));
  assert.equal(unavailable.profile, 1);
  assert.equal(unavailable.data.profile, 1);
});

test('a valid stored profile is recognized without rewriting its original bytes on load', () => {
  const save = createDefaultSave(1);
  const raw = JSON.stringify(save);
  assert.equal(inspectSaveSlotV78(raw).status, 'ready');
  const backend = storage();
  backend.values.set(SAVE_PREFIX + '1', raw);
  const system = new SaveSystem(backend);
  system.load(1);
  assert.equal(system.exportRawProfileV78(1), raw);
});

test('last-profile startup retains a real active operation and exact in-flight reload checkpoint without rewards', () => {
  const { backend, system } = populated();
  system.newGame(2);
  const campaign = CAMPAIGNS.find((entry) => system.data.galaxy.unlockedWorldIds.includes(entry.worldId) && entry.mode !== 'MIRE' && !entry.specialOperationId);
  assert.ok(campaign);
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  const deployment = beginOperation(system.data, campaign, world);
  assert.ok(deployment.operation.id);
  const actor = { alive: true, weaponMode: 'rifle', magazineSize: 99, ammo: 7, ammoReserve: 100 };
  assert.equal(startTacticalReloadV77(actor, WEAPONS[0]), true);
  updateTacticalReloadV77(actor, actor.tacticalReload.profile.duration * 0.54, { weapon: WEAPONS[0] });
  assert.equal(pressTacticalReloadV77(actor, WEAPONS[0]), true);
  assert.equal(recordOperationResumeState(system.data, {
    schema: 1,
    identity: { campaignId: campaign.id, worldId: world.id, operationId: deployment.operation.id },
    player: { alive: true, weapon: 'rifle', ammo: actor.ammo, ammoReserve: actor.ammoReserve, tacticalReloadV77: captureTacticalReloadV77(actor) },
    mission: { state: 'active', phase: 'restore-power', elapsed: 12.375 },
    inventory: { salvage: 3, medkits: 1 }
  }), true);
  const checkpoint = structuredClone(system.data.strategy.currentOperation.resumeState);
  const resources = structuredClone(system.data.galaxy.resources);
  const stats = structuredClone(system.data.statistics);
  system.commit();
  const restarted = new SaveSystem(backend);
  restarted.loadLastProfileV78();
  assert.equal(restarted.profile, 2);
  assert.equal(restarted.data.strategy.currentOperation.id, deployment.operation.id);
  assert.deepEqual(restarted.data.strategy.currentOperation.resumeState, checkpoint);
  assert.deepEqual(restarted.data.galaxy.resources, resources);
  assert.deepEqual(restarted.data.statistics, stats);
  assert.equal(restarted.data.strategy.currentOperation.resumeState.player.tacticalReloadV77.result, 'perfect');
  assert.equal(restarted.data.strategy.currentOperation.resumeState.player.ammo, 7);
});

test('a corrupt last-selected slot cannot cause startup autosave to overwrite the healthy default slot', () => {
  const { backend } = populated();
  backend.values.set(SAVE_PREFIX + '3', '{selected damaged');
  backend.values.set(SAVE_SELECTED_PROFILE_KEY_V78, '3');
  const before = [...backend.values];
  const restarted = new SaveSystem(backend);
  assert.throws(() => restarted.loadLastProfileV78(), hasCode('SAVE_CORRUPT'));
  assert.equal(restarted.recoveryNeeded.profile, 3);
  assert.throws(() => restarted.commit({ settings: { music: 0.5 } }), hasCode('SAVE_RECOVERY_REQUIRED'));
  assert.deepEqual([...backend.values], before);
  assert.equal(restarted.exportRawProfileV78(), '{selected damaged');
  restarted.load(1);
  assert.equal(restarted.data.statistics.kills, 77);
  assert.equal(restarted.recoveryNeeded, null);
});
