/** Execute the real application beforeunload callback and its real capture /
 * persistence helpers. Only browser/UI services use doubles; production QZ18,
 * weapon physics, profile normalization and save/load use actual modules. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SaveSystem, procureCatalogItem, equipCatalogItem, beginOperation, recordOperationResumeState } from '../src/save.js';
import { WEAPONS, WORLDS, CAMPAIGNS, LEVEL_SEEDS } from '../src/content.js';
import { missionV136 } from './forge-native-host-v136.mjs';
import { buildArchiveRelayLevelV122 } from '../src/archive-relay-runtime-v122.js';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const captureStart = app.indexOf('function captureMissionResumeState(');
const captureEnd = app.indexOf('function commitCurrentRuntimeV78(', captureStart);
const callback = app.match(/globalThis\.addEventListener\('beforeunload', \(\) => \{([\s\S]*?)\n  \}\);/);
assert.ok(captureStart >= 0 && captureEnd > captureStart && callback, 'Actual application lifecycle source is available.');
function unload(engine, saveSystem, overrides = {}) {
  const dependencies = { engine, saveSystem, recordOperationResumeState,
    missionOwnerV78: { epoch: 7, profile: saveSystem.profile, operationId: saveSystem.data.strategy.currentOperation.id },
    profileEpochV78: 7, creatorOwnerV84: null, standaloneContext: null, sessionStart: Date.now(),
    disposePlayerAppearancePreviewV126() {}, hubDialogueUiV76: { destroy() {} },
    audio: { dispose() {} }, hubEngine: { stop() {} }, bioforgeRuntimeV80: { stop() {} }, xenoTrialsUiV96: null,
    ...overrides };
  // The callback body and both helper functions are copied verbatim. This is
  // an invocation of shipped behavior, not an assertion about statement order.
  const invoke = new Function(...Object.keys(dependencies), `${app.slice(captureStart, captureEnd)}\nreturn () => {${callback[1]}\n};`)(...Object.values(dependencies));
  return invoke();
}
const memory = () => { const data = new Map(); return { data, getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }; };
async function fixture(t, number = '024') {
  const storage = memory(), saveSystem = new SaveSystem(storage); saveSystem.newGame(1);
  const weapon = WEAPONS.find(entry => entry.id.startsWith(`weapon-${number}-`));
  saveSystem.data.needsPlayerCreationV84 = false; saveSystem.data.galaxy.resources.credits = 50000;
  procureCatalogItem(saveSystem.data, 'weapon', weapon); equipCatalogItem(saveSystem.data, 'weapon', weapon.id);
  const campaign = CAMPAIGNS.find(entry => entry.id === 'special-archive-relay'), world = WORLDS.find(entry => entry.id === campaign.worldId);
  const { operation } = beginOperation(saveSystem.data, campaign, world);
  const level = buildArchiveRelayLevelV122({ campaign, world, levelSeeds: LEVEL_SEEDS, seed: 162 });
  const options = { weapon, campaign, world, missionLevel: level, levelSeed: level.levelSeed, strategicBriefing: operation };
  const { engine } = missionV136(options); t.after(() => engine.stop());
  await Promise.resolve(); for (let i = 0; i < 40; i++) engine.update(1 / 60);
  engine.keys.add('KeyD');
  for (let i = 0; i < 600 && engine.player.x + engine.player.w / 2 < 400; i++) engine.update(1 / 60);
  engine.keys.delete('KeyD'); for (let i = 0; i < 25; i++) engine.update(1 / 60);
  assert.equal(engine.isArchiveRelayV122(), true); assert.equal(engine.forgeSessionV141, null);
  return { storage, saveSystem, engine, options, weapon };
}
function shoot(engine, landed) {
  // Node input host supplies a requested aim; the actual physical scene,
  // projectile, impact and native movement are unchanged. Browser UI is tested
  // independently by qa-harpoon-native-v162.py.
  engine.player.pointerAimV83 = landed ? { x: 140, y: 80 } : { x: 1, y: 0 };
  const before = engine.player.ammo + engine.player.ammoReserve;
  assert.equal(engine.fire(engine.player), true);
  if (landed) for (let i = 0; i < 400 && !engine.recoverableWeaponsV131.length; i++) engine.update(1 / 120);
  else engine.update(1 / 120);
  assert.equal(engine.player.ammo + engine.player.ammoReserve, before - 1);
  assert.equal(landed ? engine.recoverableWeaponsV131.length : engine.weaponProjectilesV131.length, 1);
  return engine.captureResumeState();
}
for (const number of ['024', '064', '104', '144']) for (const landed of [false, true]) {
  test(`${number}: actual app unload preserves ${landed ? 'landed' : 'in-flight'} Harpoon, owner and stock through profile reload`, async t => {
    const { engine, saveSystem, storage, options } = await fixture(t, number), before = shoot(engine, landed);
    const resources = structuredClone(saveSystem.data.galaxy.resources);
    unload(engine, saveSystem);
    assert.equal(engine.running, false);
    assert.equal(engine.weaponProjectilesV131.length, 0); assert.equal(engine.recoverableWeaponsV131.length, 0,
      'Normal engine cleanup still discards transient objects after the app has captured them.');
    const loaded = new SaveSystem(storage); loaded.load(1);
    const raw = loaded.data.strategy.currentOperation.resumeState;
    assert.deepEqual(raw.weaponActionsV131, before.weaponActionsV131);
    assert.deepEqual(loaded.data.galaxy.resources, resources);
    const { engine: resumed } = missionV136({ ...options, resumeState: raw }); t.after(() => resumed.stop());
    await Promise.resolve();
    assert.equal(resumed.lastResumeResult.applied, true);
    assert.equal(resumed.player.ammo + resumed.player.ammoReserve, before.player.ammo + before.player.ammoReserve);
    const collection = landed ? resumed.recoverableWeaponsV131 : resumed.weaponProjectilesV131;
    const saved = landed ? before.weaponActionsV131.recoverable[0] : before.weaponActionsV131.projectiles[0];
    assert.equal(collection.length, 1); assert.equal(collection[0].id, saved.id); assert.equal(collection[0].weaponId, options.weapon.id);
    assert.equal(collection[0].owner, resumed.player); assert.equal(collection[0].remaining, saved.remaining);
    if (landed) {
      resumed.keys.add('KeyD');
      for (let i = 0; i < 600 && Math.abs(resumed.player.x + resumed.player.w / 2 - collection[0].x) > 8; i++) resumed.update(1 / 60);
      resumed.keys.delete('KeyD'); for (let i = 0; i < 20; i++) resumed.update(1 / 60);
      const reserve = resumed.player.ammoReserve;
      assert.equal(resumed.recoverableWeaponIndexV131(), 0); assert.equal(resumed.interact(resumed.player), true);
      assert.equal(resumed.player.ammoReserve, reserve + 1); assert.equal(resumed.recoverableWeaponsV131.length, 0);
      resumed.interact(resumed.player); assert.equal(resumed.player.ammoReserve, reserve + 1);
    }
  });
}
for (const context of ['standalone', 'recovery', 'stale-owner']) {
  test(`actual unload does not replace an existing valid native resume in ${context} context`, async t => {
    const { engine, saveSystem, storage } = await fixture(t);
    const preserved = engine.captureResumeState(); assert.equal(recordOperationResumeState(saveSystem.data, preserved), true);
    saveSystem.commit(); const committed = storage.getItem(saveSystem.key()), resume = structuredClone(saveSystem.data.strategy.currentOperation.resumeState);
    shoot(engine, true);
    const overrides = context === 'standalone' ? { standaloneContext: 'forge-playtest' }
      : context === 'stale-owner' ? { missionOwnerV78: { epoch: -1, profile: saveSystem.profile, operationId: saveSystem.data.strategy.currentOperation.id } } : {};
    if (context === 'recovery') saveSystem.recoveryNeeded = true;
    unload(engine, saveSystem, overrides);
    assert.equal(engine.running, false); assert.deepEqual(saveSystem.data.strategy.currentOperation.resumeState, resume);
    const saved = JSON.parse(storage.getItem(saveSystem.key()));
    assert.deepEqual(saved.strategy.currentOperation.resumeState, resume);
    if (context !== 'stale-owner') assert.equal(storage.getItem(saveSystem.key()), committed);
  });
}
