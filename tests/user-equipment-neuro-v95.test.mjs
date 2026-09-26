import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, ENEMIES, LEVEL_SEEDS, NEURO_XENO_PROFILES, WEAPONS, WORLDS } from '../src/content.js';
import { USER_EQUIPMENT_ART_V95 } from '../src/user-equipment-art-v95.js';
import { USER_EQUIPMENT_V95, normalizeUserEquipmentV95 } from '../src/user-equipment-v95.js';
import { sanitizeOperationResumeState } from '../src/save.js';

const noop = () => {};
const armors = USER_EQUIPMENT_V95.filter(item => item.kind === 'armor');
const weapons = USER_EQUIPMENT_V95.filter(item => item.kind === 'weapon');
const neuroProfile = NEURO_XENO_PROFILES.find(profile => profile.playerClassCompatible);
const equipmentPaths = new Set(USER_EQUIPMENT_ART_V95.map(art => art.path));
const options = () => ({ world: WORLDS[0], campaign: CAMPAIGNS[0], levelSeed: LEVEL_SEEDS[0], seed: 9502,
  weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 20), crew: [], difficulty: 'standard',
  accessibility: { aimAssist: 'off' }, userCasteCampaignV88: false });

async function withRuntime(run) {
  const previous = ['Image', 'addEventListener', 'requestAnimationFrame', 'document']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  class TestImage {
    complete = true; naturalWidth = 1024; naturalHeight = 1024;
    set src(value) {
      this.currentSrc = value;
      const art = USER_EQUIPMENT_ART_V95.find(item => item.path === value);
      if (art) { this.naturalWidth = art.sourceWidth; this.naturalHeight = art.sourceHeight; }
      queueMicrotask(() => this.onload?.());
    }
  }
  Object.assign(globalThis, { Image: TestImage, addEventListener: noop, requestAnimationFrame: () => 1,
    document: { hidden: false, addEventListener: noop } });
  const engines = [];
  const create = () => {
    const draws = [];
    const ctx = new Proxy({ globalAlpha: 1, drawImage: image => draws.push(image?.currentSrc),
      measureText: value => ({ width: String(value).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
    const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) };
    const engine = new GameEngine(canvas); engines.push(engine);
    return { engine, ctx, draws };
  };
  try { await run(create); }
  finally {
    for (const engine of engines) engine.stop();
    for (const [key, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
}

test('V95 human equipment stays selected but grants no appearance or armor bonus in Neuro-Xeno, including resume', async () => {
  await withRuntime(async create => {
    const base = create().engine;
    base.start({ ...options(), neuroProfile });
    for (const [index, armor] of armors.entries()) {
      const weapon = weapons[index % weapons.length];
      const selected = { armorId: armor.id, weaponId: weapon.id };
      const deployment = { ...options(), neuroProfile, userEquipmentV95: selected };
      const { engine, ctx, draws } = create();
      engine.start(deployment);
      await engine.userEquipmentReadyV95;
      assert.equal(engine.neuro.active, true);
      assert.equal(engine.player.visualForm, 'xenomorph');
      assert.equal(engine.player.weaponMode, 'neuro-melee');
      assert.equal(engine.player.maxArmor, base.player.maxArmor);
      assert.equal(engine.player.armor, base.player.armor);
      assert.deepEqual(engine.player.userEquipmentV95, normalizeUserEquipmentV95(selected));
      assert.deepEqual(engine.userEquipmentV95.state, normalizeUserEquipmentV95(selected));
      engine.drawActor(ctx, engine.player);
      assert.equal(draws.some(path => equipmentPaths.has(path)), false);
      assert.equal(engine.player.playerVisualV95, undefined);
      assert.equal(engine.player.heldWeaponVisualV95, undefined);
      engine.player.armor = Math.max(0, engine.player.armor - 7);
      const snapshot = sanitizeOperationResumeState(engine.captureResumeState());
      const restored = create();
      restored.engine.start({ ...deployment, resumeState: snapshot });
      await restored.engine.userEquipmentReadyV95;
      assert.equal(restored.engine.lastResumeResult.applied, true);
      assert.equal(restored.engine.player.armor, engine.player.armor);
      assert.equal(restored.engine.player.maxArmor, base.player.maxArmor);
      restored.engine.drawActor(restored.ctx, restored.engine.player);
      assert.equal(restored.draws.some(path => equipmentPaths.has(path)), false);
      assert.deepEqual(selected, { armorId: armor.id, weaponId: weapon.id });
    }
  });
});

test('V95 a subsequent human deployment restores selected equipment once after a Neuro deployment', async () => {
  await withRuntime(async create => {
    const armor = armors[0], weapon = weapons[0];
    const deployment = { ...options(), userEquipmentV95: { armorId: armor.id, weaponId: weapon.id } };
    const { engine, ctx, draws } = create();
    engine.start(deployment);
    await engine.userEquipmentReadyV95;
    const humanMaxArmor = engine.player.maxArmor;
    engine.drawActor(ctx, engine.player);
    assert.equal(engine.player.playerVisualV95.itemId, armor.id);
    assert.equal(engine.player.heldWeaponVisualV95.itemId, weapon.id);

    engine.start({ ...deployment, neuroProfile });
    await engine.userEquipmentReadyV95;
    draws.length = 0;
    engine.drawActor(ctx, engine.player);
    assert.equal(draws.some(path => equipmentPaths.has(path)), false, 'Cached human images must not override Neuro form');
    assert.equal(engine.player.maxArmor, humanMaxArmor - armor.armorBonus);

    engine.start({ ...deployment, neuroProfile: null });
    await engine.userEquipmentReadyV95;
    engine.drawActor(ctx, engine.player);
    assert.equal(engine.neuro.active, false);
    assert.equal(engine.player.playerVisualV95.itemId, armor.id);
    assert.equal(engine.player.heldWeaponVisualV95.itemId, weapon.id);
    assert.equal(engine.player.maxArmor, humanMaxArmor, 'The bonus is applied once, not accumulated across deployments');
    assert.equal(engine.player.weaponMode, 'rifle');
    assert.equal(engine.player.ammo, weapon.magazine);
    assert.deepEqual(engine.player.userEquipmentV95, normalizeUserEquipmentV95(deployment.userEquipmentV95));
  });
});
