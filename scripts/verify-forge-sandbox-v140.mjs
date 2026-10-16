import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, beginOperation, getOperationBrief, resolveOperationDeployment } from '../src/save.js';
import { CAMPAIGNS, WORLDS, CREW, WEAPONS, EQUIPMENT, VEHICLES, COSTUMES,
  NEURO_XENO_PROFILES, APEX_DOSSIERS } from '../src/content.js';
import { buildForgeMissionSandboxV140 } from '../src/forge-sandbox-v140.js';
import { prepareJumpV116 } from '../src/galaxy-jump-v115.js';
import { equipPlayerAppearancePresetV129 } from '../src/player-appearance-v126.js';
import { equipUserEquipmentV95, USER_EQUIPMENT_V95 } from '../src/user-equipment-v95.js';

// The sandbox resource/crew checks need an initially unlocked ordinary route.
// Historical MIRE settings are independent and may legitimately remain locked.
const campaign = CAMPAIGNS.find(entry => entry.id === 'pair-001-frontier');
assert.ok(campaign, 'Stable Frontier fixture exists.');
const world = WORLDS.find(entry => entry.id === campaign.worldId);
assert.ok(world, 'Frontier fixture world exists.');
const catalogs = { crewCatalog: CREW, weaponCatalog: WEAPONS, equipmentCatalog: EQUIPMENT,
  vehicleCatalog: VEHICLES, costumeCatalog: COSTUMES, neuroProfileCatalog: NEURO_XENO_PROFILES,
  apexDossierCatalog: APEX_DOSSIERS };

class MemoryStorage {
  values = new Map();
  writes = 0;
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.writes++; this.values.set(key, value); }
  removeItem(key) { this.writes++; this.values.delete(key); }
}
function profile(fresh = false) {
  const storage = new MemoryStorage(), system = new SaveSystem(storage);
  if (fresh) system.newPlayerTimelineV84({ name: 'Alex Mercer', callsign: 'FORGE-9' });
  else system.newGame();
  return { system, storage };
}
function frozen(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
}
function inspectLocalDeployment(fixture, reference = { campaign, world }) {
  const { system, storage } = fixture, original = structuredClone(system.data);
  const bytes = [...storage.values], writes = storage.writes;
  const result = buildForgeMissionSandboxV140(frozen(system.data), reference);
  const loadout = resolveOperationDeployment(result.sandbox, catalogs);
  assert.ok(loadout, 'The production resolver accepts the local manifest.');
  assert.equal(loadout.operation, result.deployment.operation);
  assert.equal(result.deployment.operation, result.sandbox.strategy.currentOperation);
  assert.equal(result.sandbox.strategy.lastOperation, null);
  assert.equal(result.sandbox.strategy.serial, original.strategy.serial);
  for (const key of ['clock', 'crew', 'hub', 'galaxy', 'onboardingV84', 'openingV88', 'portMeridienV90'])
    assert.deepEqual(result.sandbox[key], original[key], `${key} is preserved without a campaign transition.`);
  assert.deepEqual(result.deployment.operation.cost, {});
  assert.deepEqual(result.deployment.operation.reward, {});
  // A runtime may mutate its clone and manifest; neither can alias the live save.
  result.sandbox.clock.hour = 23;
  result.sandbox.galaxy.resources.fuel = 999;
  result.deployment.operation.weaponIds.length = 0;
  if (loadout.crew.length) loadout.crew[0].health = 1;
  assert.deepEqual(system.data, original);
  assert.deepEqual([...storage.values], bytes);
  assert.equal(storage.writes, writes, 'Preparing and resolving a Forge test performs no storage writes.');
  return { ...result, loadout, original };
}

test('a newly created timeline can test while its native welcome and opening remain incomplete', () => {
  const fixture = profile(true);
  assert.equal(fixture.system.data.onboardingV84.phase, 'wake');
  assert.equal(fixture.system.data.openingV88.phase, 'berth');
  assert.throws(() => beginOperation(structuredClone(fixture.system.data), campaign, world), /réveil|briefing/i);
  const { loadout } = inspectLocalDeployment(fixture);
  assert.ok(loadout.weapon);
  assert.equal(loadout.operation.playerIdentityV84.callsign, 'FORGE-9');
});

test('depleted campaign resources do not gate or fund a Forge test', () => {
  const fixture = profile();
  for (const key of Object.keys(fixture.system.data.galaxy.resources)) fixture.system.data.galaxy.resources[key] = 0;
  fixture.system.data.hub.systems.supplies = 0;
  fixture.system.commit();
  assert.throws(() => beginOperation(structuredClone(fixture.system.data), campaign, world), /insuffis/i);
  inspectLocalDeployment(fixture);
});

test('an active native hyperspace charge remains unchanged and does not gate the test', () => {
  const fixture = profile();
  prepareJumpV116(fixture.system.data, WORLDS[1], WORLDS, 1000);
  fixture.system.commit();
  assert.equal(fixture.system.data.galaxy.jumpV116.phase, 'charging');
  assert.throws(() => beginOperation(structuredClone(fixture.system.data), campaign, world), /hyperspatiale/i);
  inspectLocalDeployment(fixture);
});

test('a locked reference route does not unlock the campaign or block the local manifest', () => {
  const fixture = profile();
  fixture.system.data.galaxy.unlockedWorldIds = fixture.system.data.galaxy.unlockedWorldIds.filter(id => id !== world.id);
  fixture.system.commit();
  assert.throws(() => beginOperation(structuredClone(fixture.system.data), campaign, world), /verrouill/i);
  inspectLocalDeployment(fixture);
});

test('no selected active crew is a valid solo player test, without inventing replacement crew', () => {
  const fixture = profile();
  fixture.system.data.strategy.selectedCrewIds = [];
  fixture.system.commit();
  assert.throws(() => beginOperation(structuredClone(fixture.system.data), campaign, world), /aucun membre/i);
  const { loadout } = inspectLocalDeployment(fixture);
  assert.deepEqual(loadout.crewIds, []);
  assert.deepEqual(loadout.crew, []);
  assert.ok(loadout.weapon);
});

test('native selected equipment, J1/J2 appearance and active crew survive the local manifest', () => {
  const fixture = profile(), save = fixture.system.data;
  equipPlayerAppearancePresetV129(save, { presetId: 'uscm-hicks-v129', owner: 'player' });
  equipPlayerAppearancePresetV129(save, { presetId: 'uscm-smartgunner-v129', owner: 'coop' });
  const userWeapon = USER_EQUIPMENT_V95.find(item => item.kind === 'weapon');
  const userArmor = USER_EQUIPMENT_V95.find(item => item.kind === 'armor');
  equipUserEquipmentV95(save, userWeapon.id); equipUserEquipmentV95(save, userArmor.id);
  save.crew.find(member => member.id === save.strategy.selectedCrewIds[0]).status = 'wounded';
  save.settings.coop = true;
  save.settings.difficulty = 'veteran';
  fixture.system.commit();
  const expectedCrew = getOperationBrief(structuredClone(fixture.system.data), campaign, world).crewIds;
  const { loadout, original } = inspectLocalDeployment(fixture);
  assert.deepEqual(loadout.crewIds, expectedCrew);
  assert.deepEqual(loadout.crew.map(member => member.id), expectedCrew);
  assert.ok(loadout.crew.every(member => member.name && member.aptitudesV85));
  assert.deepEqual(loadout.equipmentIds, original.player.equipmentIds);
  assert.deepEqual(loadout.equipment.map(item => item.id), original.player.equipmentIds);
  assert.equal(loadout.costumeId, original.player.costumeId);
  assert.equal(loadout.weapon.id, userWeapon.id);
  assert.deepEqual(loadout.userEquipmentV95, original.player.userEquipmentV95);
  assert.deepEqual(loadout.playerAppearanceV126, original.player.appearanceV126);
  assert.deepEqual(loadout.coopAppearanceV126, original.player.coopAppearanceV126);
  assert.notDeepEqual(loadout.playerAppearanceV126, loadout.coopAppearanceV126);
  assert.equal(loadout.difficulty, original.settings.difficulty);
});

test('a live campaign operation and its frozen loadout never become the local operation', () => {
  const fixture = profile();
  const live = beginOperation(fixture.system.data, campaign, world).operation;
  live.resumeState = { checkpoint: { id: 'preserved-live-checkpoint' } };
  fixture.system.commit();
  const { deployment, original } = inspectLocalDeployment(fixture);
  assert.notEqual(deployment.operation.id, original.strategy.currentOperation.id);
  assert.equal(deployment.operation.resumeState, null);
  assert.equal(deployment.operation.insertionState, null);
});
