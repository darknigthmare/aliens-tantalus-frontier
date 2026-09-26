import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, SAVE_PREFIX, createDefaultSave, migrateSave, beginOperation } from '../src/save.js';
import { SAVE_SELECTED_PROFILE_KEY_V78 } from '../src/save-profile-v78.js';
import { CAMPAIGNS, WORLDS, CREW } from '../src/content.js';
import { advancePlayerOnboardingV84, createPlayerOnboardingV84, validatePlayerIdentityV84 } from '../src/player-onboarding-v84.js';
import { ONBOARDING_SPAWN_V84 } from '../src/hub-onboarding-v84.js';

const identity = (patch = {}) => ({ name: 'Alex Moreau', callsign: 'FOX-9', ...patch });
const events = ['wake-confirmed', { type: 'medical-next', dialogueNode: 0 }, { type: 'medical-next', dialogueNode: 1 },
  'medical-complete', { type: 'briefing-next', dialogueNode: 0 }, { type: 'briefing-next', dialogueNode: 1 }, 'briefing-complete'];
const atStep = (step) => events.slice(0, step).reduce((state, event) => advancePlayerOnboardingV84(state, event).state, createPlayerOnboardingV84(identity()));
function storage() {
  const values = new Map();
  return { values, deniedKey: null,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { if (this.deniedKey === key) throw new Error('quota denied'); values.set(key, value); },
    removeItem(key) { values.delete(key); }
  };
}
function populated() {
  const backend = storage();
  const saves = new SaveSystem(backend);
  saves.newGame(1);
  saves.data.player.name = 'Ancienne relève';
  saves.data.statistics.kills = 77;
  saves.commit();
  return { backend, saves };
}
function operation(save) {
  const campaign = CAMPAIGNS.find((entry) => save.galaxy.unlockedWorldIds.includes(entry.worldId));
  assert.ok(campaign);
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  assert.ok(world);
  return { campaign, world };
}

for (const profile of [1, 2]) {
  test(`failed V84 timeline write preserves bytes, active root, profile and marker when targeting slot ${profile}`, () => {
    const { backend, saves } = populated();
    backend.values.set(SAVE_PREFIX + '2', JSON.stringify(createDefaultSave(2)));
    const before = [...backend.values];
    const data = saves.data;
    const serialized = JSON.stringify(data);
    const selection = structuredClone(saves.selectionPersistenceV78);
    backend.deniedKey = SAVE_PREFIX + profile;
    assert.throws(() => saves.newPlayerTimelineV84(identity(), profile), (error) => error.code === 'SAVE_WRITE_FAILED');
    assert.equal(saves.data, data);
    assert.equal(saves.profile, 1);
    assert.equal(JSON.stringify(saves.data), serialized);
    assert.deepEqual(saves.selectionPersistenceV78, selection);
    assert.deepEqual([...backend.values], before);
  });
}

test('creating V84 in slot 2 preserves slot 1 and gives the new player no NPC identity or invented inventory', () => {
  const { backend, saves } = populated();
  const primary = backend.values.get(SAVE_PREFIX + '1');
  const previousRoot = saves.data;
  const base = createDefaultSave(2);
  const created = saves.newPlayerTimelineV84(identity(), 2);
  assert.equal(backend.values.get(SAVE_PREFIX + '1'), primary);
  assert.equal(previousRoot.statistics.kills, 77);
  assert.notEqual(created, previousRoot);
  assert.equal(saves.profile, 2);
  assert.equal(backend.values.get(SAVE_SELECTED_PROFILE_KEY_V78), '2');
  assert.equal(created.scene, 'hub');
  assert.equal(created.onboardingV84.phase, 'wake');
  assert.equal(created.player.name, 'Alex Moreau');
  assert.equal(created.player.callsign, 'FOX-9');
  assert.equal(created.player.operatorId, 'player-echo9');
  assert.equal(created.player.classId, 'marine');
  for (const [key, value] of Object.entries(ONBOARDING_SPAWN_V84)) assert.deepEqual(created.hub[key], value, key);
  assert.deepEqual(created.player.weaponIds, base.player.weaponIds);
  assert.deepEqual(created.player.equipmentIds, base.player.equipmentIds);
  assert.deepEqual(created.strategy.inventory, base.strategy.inventory);
  assert.deepEqual(created.galaxy.resources, base.galaxy.resources);
  assert.deepEqual(created.crew, base.crew);
  assert.ok(created.crew.find((member) => member.id === 'crew-01-mara-vega'));
  assert.equal(CREW.find((member) => member.id === 'crew-01-mara-vega').name, 'Mara Vega');
  assert.equal(created.crew.some((member) => member.id === 'player-echo9'), false);
  const restored = new SaveSystem(backend).load(2);
  assert.deepEqual(restored.onboardingV84, created.onboardingV84);
});

test('invalid or NPC identity cannot alter either persisted slot or active state', () => {
  const { backend, saves } = populated();
  const before = [...backend.values];
  const active = saves.data;
  for (const input of [identity({ name: 'Mara Vega' }), identity({ name: '<script>' }), identity({ callsign: 'écho' }), null]) {
    assert.throws(() => saves.newPlayerTimelineV84(input, 2));
    assert.equal(saves.data, active);
    assert.equal(saves.profile, 1);
    assert.deepEqual([...backend.values], before);
  }
});

test('legacy migration retains its timeline with onboarding null and no retroactive wake-up', () => {
  const old = createDefaultSave(1);
  delete old.onboardingV84;
  delete old.needsPlayerCreationV84;
  old.player.name = 'Ancien opérateur';
  old.statistics.kills = 44;
  Object.assign(old.hub, { deck: 2, roomId: 'armory', positionX: 1850 });
  const before = structuredClone(old);
  const migrated = migrateSave(old, 1);
  assert.equal(migrated.onboardingV84, null);
  assert.equal(migrated.needsPlayerCreationV84, false);
  assert.equal(migrated.player.name, old.player.name);
  assert.equal(migrated.statistics.kills, 44);
  assert.equal(migrated.hub.deck, 2);
  assert.equal(migrated.hub.roomId, 'armory');
  assert.equal(migrated.hub.positionX, 1850);
  assert.deepEqual(old, before);
  const { campaign, world } = operation(migrated);
  assert.equal(beginOperation(migrated, campaign, world).ok, true);
  assert.equal(migrated.strategy.currentOperation.playerIdentityV84, null);
});

test('every V84 dialogue stage survives the public commit/load path without healing or adding resources', () => {
  const backend = storage();
  let saves = new SaveSystem(backend);
  saves.newPlayerTimelineV84(identity(), 2);
  saves.data.player.health = 31;
  saves.data.player.armor = 12;
  saves.commit();
  const resources = structuredClone(saves.data.galaxy.resources);
  const inventory = structuredClone(saves.data.strategy.inventory);
  const clock = structuredClone(saves.data.clock);
  for (let step = 0; step <= events.length; step += 1) {
    const expected = atStep(step);
    if (step) saves.commit({ onboardingV84: advancePlayerOnboardingV84(saves.data.onboardingV84, events[step - 1]).state });
    const bytes = backend.values.get(SAVE_PREFIX + '2');
    saves = new SaveSystem(backend);
    saves.load(2);
    assert.equal(backend.values.get(SAVE_PREFIX + '2'), bytes, 'load does not rewrite the slot');
    assert.deepEqual(saves.data.onboardingV84, expected, `step ${step}`);
    assert.equal(saves.data.player.name, expected.identity.name);
    assert.equal(saves.data.player.health, 31);
    assert.equal(saves.data.player.armor, 12);
    assert.deepEqual(saves.data.galaxy.resources, resources);
    assert.deepEqual(saves.data.strategy.inventory, inventory);
    assert.deepEqual(saves.data.clock, clock);
  }
});

test('a failed dialogue commit preserves the previously saved node and active root', () => {
  const backend = storage();
  const saves = new SaveSystem(backend);
  saves.newPlayerTimelineV84(identity(), 1);
  const data = saves.data;
  const before = JSON.stringify(data);
  const bytes = backend.values.get(SAVE_PREFIX + '1');
  const next = advancePlayerOnboardingV84(data.onboardingV84, 'wake-confirmed').state;
  backend.deniedKey = SAVE_PREFIX + '1';
  assert.throws(() => saves.commit({ onboardingV84: next }), (error) => error.code === 'SAVE_WRITE_FAILED');
  assert.equal(saves.data, data);
  assert.equal(JSON.stringify(saves.data), before);
  assert.equal(backend.values.get(SAVE_PREFIX + '1'), bytes);
});

test('deployment is blocked at every unfinished phase without spending, time advance or strategy mutation', () => {
  for (let step = 0; step < events.length; step += 1) {
    const save = createDefaultSave();
    save.onboardingV84 = atStep(step);
    const { campaign, world } = operation(save);
    const before = JSON.stringify(save);
    assert.throws(() => beginOperation(save, campaign, world), /réveil et le briefing/);
    assert.equal(JSON.stringify(save), before, `step ${step}`);
  }
});

test('completed onboarding snapshots identity into the operation, preserving it across later identity changes and reload', () => {
  const backend = storage();
  const saves = new SaveSystem(backend);
  saves.newPlayerTimelineV84(identity(), 1);
  saves.commit({ onboardingV84: atStep(7), openingV88: null }); // Legacy V84 identity test; V88 gate has its own coverage.
  const { campaign, world } = operation(saves.data);
  const started = beginOperation(saves.data, campaign, world);
  const original = structuredClone(saves.data.onboardingV84.identity);
  assert.deepEqual(started.operation.playerIdentityV84, original);
  assert.notEqual(started.operation.playerIdentityV84, saves.data.onboardingV84.identity);
  saves.data.onboardingV84.identity = validatePlayerIdentityV84(identity({ name: 'Morgan Shaw', callsign: 'FOX-2' })).identity;
  saves.commit();
  const restored = new SaveSystem(backend).load(1);
  assert.equal(restored.onboardingV84.identity.name, 'Morgan Shaw');
  assert.deepEqual(restored.strategy.currentOperation.playerIdentityV84, original);
  const resumed = beginOperation(restored, campaign, world);
  assert.equal(resumed.resumed, true);
  assert.deepEqual(resumed.operation.playerIdentityV84, original);
});

test('operation snapshot migration rejects invalid/old identity and strips extra state from a valid one', () => {
  const save = createDefaultSave();
  const { campaign, world } = operation(save);
  beginOperation(save, campaign, world);
  for (const raw of [null, { schema: 83, ...identity() }, { schema: 84, ...identity({ name: 'Mara Vega' }) }, { schema: 84, ...identity({ name: '<script>' }) }]) {
    save.strategy.currentOperation.playerIdentityV84 = raw;
    assert.equal(migrateSave(save).strategy.currentOperation.playerIdentityV84, null);
  }
  save.strategy.currentOperation.playerIdentityV84 = { ...validatePlayerIdentityV84(identity()).identity, health: 999, inventory: ['free'] };
  const normalized = migrateSave(save).strategy.currentOperation.playerIdentityV84;
  assert.deepEqual(normalized, validatePlayerIdentityV84(identity()).identity);
  assert.notEqual(normalized, save.strategy.currentOperation.playerIdentityV84);
});

test('first visit keeps its creation marker through options writes and reload without starting onboarding', () => {
  const backend = storage();
  let saves = new SaveSystem(backend);
  assert.equal(createDefaultSave().needsPlayerCreationV84, true);
  assert.equal(saves.data.needsPlayerCreationV84, true);
  saves.load(1);
  assert.equal(saves.data.needsPlayerCreationV84, true);
  saves.commit({ settings: { ...saves.data.settings, reducedMotion: true } });
  saves = new SaveSystem(backend);
  saves.load(1);
  assert.equal(saves.data.settings.reducedMotion, true);
  assert.equal(saves.data.needsPlayerCreationV84, true);
  assert.equal(saves.data.onboardingV84, null);
});

test('a legacy save with no creation marker does not unexpectedly reopen character creation', () => {
  const legacy = createDefaultSave();
  delete legacy.needsPlayerCreationV84;
  delete legacy.onboardingV84;
  legacy.statistics.kills = 90;
  const backend = storage();
  backend.values.set(SAVE_PREFIX + '1', JSON.stringify(legacy));
  const restored = new SaveSystem(backend).load(1);
  assert.equal(restored.needsPlayerCreationV84, false);
  assert.equal(restored.onboardingV84, null);
  assert.equal(restored.statistics.kills, 90);
});

test('successful player creation clears the creation marker permanently, including all dialogue reloads', () => {
  const backend = storage();
  let saves = new SaveSystem(backend);
  saves.newPlayerTimelineV84(identity(), 2);
  assert.equal(saves.data.needsPlayerCreationV84, false);
  for (let step = 0; step <= events.length; step += 1) {
    saves.commit({ onboardingV84: atStep(step), needsPlayerCreationV84: true });
    saves = new SaveSystem(backend);
    saves.load(2);
    assert.equal(saves.data.needsPlayerCreationV84, false, `step ${step}`);
  }
});
