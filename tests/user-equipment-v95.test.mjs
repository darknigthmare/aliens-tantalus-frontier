import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { USER_EQUIPMENT_ART_V95 } from '../src/user-equipment-art-v95.js';
import { USER_EQUIPMENT_V95, getUserEquipmentV95, normalizeUserEquipmentV95,
  equipUserEquipmentV95, unequipUserEquipmentV95, resolveUserEquipmentLoadoutV95,
  getUserArmorTransformV95, getUserWeaponTransformV95, resolveUserEquipmentMuzzleV95,
  drawUserArmorV95, drawUserWeaponV95, loadUserEquipmentImagesV95, userEquipmentPanelHtmlV95
} from '../src/user-equipment-v95.js';
import { ENEMY_STATIC_POSES_V95 } from '../src/enemy-static-poses-v95.js';
import { createDefaultSave, migrateSave, beginOperation, resolveOperationDeployment, sanitizeOperationResumeState } from '../src/save.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, ENEMIES, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';
import { resolveCombatAimV83 } from '../src/combat-aim-v83.js';

const armors = USER_EQUIPMENT_V95.filter(item => item.kind === 'armor');
const weapons = USER_EQUIPMENT_V95.filter(item => item.kind === 'weapon');
const noop = () => {};
const actor = () => ({ x: 100, y: 200, w: 42, h: 92, facing: 1, alive: true });
function canvasFixture() {
  const draws = [], transforms = [];
  const ctx = new Proxy({ globalAlpha: 1, drawImage: (...args) => draws.push(args),
    translate: (...args) => transforms.push(['translate', ...args]), scale: (...args) => transforms.push(['scale', ...args]),
    rotate: (...args) => transforms.push(['rotate', ...args]), measureText: value => ({ width: String(value).length * 8 }) }, { get: (t, key) => t[key] ?? noop });
  return { ctx, draws, transforms, canvas: { width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) } };
}
const imageFor = item => ({ complete: true, naturalWidth: item.sourceWidth, naturalHeight: item.sourceHeight, src: item.path });

test('V95 has four dual-use armor items and three weapon items without extra enemies', async () => {
  assert.equal(armors.length, 4);
  assert.equal(weapons.length, 3);
  assert.equal(new Set(USER_EQUIPMENT_V95.map(item => item.id)).size, 7);
  assert.equal(USER_EQUIPMENT_ART_V95.length, 7);
  for (const item of USER_EQUIPMENT_V95) {
    assert.match(item.id, /^item-v95-user-/);
    assert.equal(item.animationStatus, 'missing');
    assert.equal(item.canonExact, false);
    assert.equal(ENEMY_STATIC_POSES_V95.some(enemy => enemy.id === item.id), false);
    const bytes = await readFile(new URL(`..${item.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
    assert.equal(bytes.readUInt32BE(16), item.sourceWidth);
    assert.equal(bytes.readUInt32BE(20), item.sourceHeight);
    assert.equal(bytes[25], 6, 'PNG must retain alpha');
    if (item.kind === 'armor') {
      const enemy = ENEMY_STATIC_POSES_V95.find(enemy => enemy.id === item.enemyProfileId);
      assert.ok(enemy, `separate human enemy ID: ${item.id}`);
      assert.equal(enemy.biology, 'human');
      assert.equal(enemy.path, item.path);
    }
  }
});

test('V95 selection validates slot kind, rejects raw asset injection and supports unequip', () => {
  const save = createDefaultSave();
  const originalWeaponIds = [...save.player.weaponIds];
  equipUserEquipmentV95(save, armors[0].id);
  equipUserEquipmentV95(save, weapons[0].id);
  assert.equal(save.player.userEquipmentV95.armorId, armors[0].id);
  assert.equal(save.player.userEquipmentV95.weaponId, weapons[0].id);
  assert.deepEqual(save.player.weaponIds, originalWeaponIds);
  assert.deepEqual(normalizeUserEquipmentV95({ armorId: weapons[0].id, weaponId: '../../payload.png' }), { schema: 95, armorId: null, weaponId: null });
  assert.throws(() => equipUserEquipmentV95(save, 'unknown'));
  unequipUserEquipmentV95(save, 'armor');
  assert.equal(save.player.userEquipmentV95.armorId, null);
  assert.equal(save.player.userEquipmentV95.weaponId, weapons[0].id);
  unequipUserEquipmentV95(save, 'weapon');
  assert.equal(resolveUserEquipmentLoadoutV95(save.player.userEquipmentV95).weapon, null);
});

test('V95 save migration preserves valid equipment and sanitizes unknown IDs', () => {
  for (const armor of armors) {
    const save = createDefaultSave();
    equipUserEquipmentV95(save, armor.id);
    equipUserEquipmentV95(save, weapons[0].id);
    const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
    assert.deepEqual(migrated.player.userEquipmentV95, save.player.userEquipmentV95);
  }
  const save = createDefaultSave();
  save.player.userEquipmentV95 = { armorId: 'unknown', weaponId: armors[0].id, path: '/fake.png' };
  assert.deepEqual(migrateSave(save).player.userEquipmentV95, { schema: 95, armorId: null, weaponId: null });
});

test('V95 operation freezes equipment, locks edits and restores the actual weapon', () => {
  const save = createDefaultSave();
  save.onboardingV84 = null; save.openingV88 = null; save.portMeridienV90 = null;
  const campaign = CAMPAIGNS.find(c => c.worldId === WORLDS[0].id) || CAMPAIGNS[0];
  const world = WORLDS.find(w => w.id === campaign.worldId) || WORLDS[0];
  save.galaxy.unlockedWorldIds.push(world.id);
  for (const key of Object.keys(save.galaxy.resources)) save.galaxy.resources[key] = 99999;
  equipUserEquipmentV95(save, armors[0].id);
  equipUserEquipmentV95(save, weapons[1].id);
  beginOperation(save, campaign, world);
  assert.throws(() => unequipUserEquipmentV95(save, 'armor'), /verrouillé/);
  assert.throws(() => equipUserEquipmentV95(save, armors[1].id), /verrouillé/);
  save.player.userEquipmentV95.armorId = armors[1].id;
  const migrated = migrateSave(save);
  const deployment = resolveOperationDeployment(migrated, { weaponCatalog: WEAPONS });
  assert.equal(deployment.userEquipmentV95.armorId, armors[0].id);
  assert.equal(deployment.weapon.id, weapons[1].id);
  assert.equal(deployment.weapon.damage, weapons[1].damage);
});

test('V95 armor renders full native PNG grounded and mirrored without changing human bounds', () => {
  for (const armor of armors) for (const facing of [-1, 1]) {
    const a = { ...actor(), facing };
    const before = [a.x, a.y, a.w, a.h];
    const { ctx, draws } = canvasFixture();
    assert.equal(drawUserArmorV95(ctx, a, imageFor(armor), armor), true);
    assert.equal(draws.length, 1);
    assert.equal(draws[0].length, 5, 'native whole image draw, no invented atlas cells');
    assert.deepEqual([a.x, a.y, a.w, a.h], before);
    assert.equal(a.playerVisualV95.worn, true);
    assert.equal(a.playerVisualV95.animationStatus, 'missing');
    const t = getUserArmorTransformV95(a, armor);
    assert.ok([t.x, t.y, t.width, t.height, t.hand.x, t.hand.y].every(Number.isFinite));
    assert.equal(t.mirror, facing > 0);
  }
});

test('V95 weapon pivot and shot muzzle agree in all eight aim directions', () => {
  for (const weapon of weapons) for (const armor of [null, ...armors]) {
    for (const [x, y] of [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]) {
      const aim = resolveCombatAimV83({ x, y, facing: x < 0 ? -1 : 1 });
      const a = { ...actor(), facing: aim.facing, combatAimV83: aim, userEquipmentV95: { armorId: armor?.id, weaponId: weapon.id } };
      const t = getUserWeaponTransformV95(a, aim, weapon, armor);
      const muzzle = resolveUserEquipmentMuzzleV95(a, aim);
      assert.equal(muzzle.x, t.muzzle.x); assert.equal(muzzle.y, t.muzzle.y);
      const dx = (weapon.muzzlePivot.x - weapon.gripPivot.x) * t.width * (t.mirror ? -1 : 1);
      const dy = (weapon.muzzlePivot.y - weapon.gripPivot.y) * t.height;
      assert.ok(Math.abs(t.pivotX + Math.cos(t.angle) * dx - Math.sin(t.angle) * dy - muzzle.x) < 1e-8);
      assert.ok(Math.abs(t.pivotY + Math.sin(t.angle) * dx + Math.cos(t.angle) * dy - muzzle.y) < 1e-8);
      const { ctx, draws } = canvasFixture();
      assert.equal(drawUserWeaponV95(ctx, a, imageFor(weapon), weapon, armor), true);
      assert.equal(draws[0].length, 5);
    }
  }
});

test('V95 equipment alpha bounds stay exclusive for exact scaling and fallback grounding', () => {
  const a = actor();
  for (const armor of armors) {
    const [left, top, right, bottom] = armor.alphaBounds;
    const plain = { ...armor, pivot: null, handPivot: null };
    const t = getUserArmorTransformV95(a, plain);
    assert.ok(Math.abs(t.height * (bottom - top) / armor.sourceHeight - a.h) < 1e-8);
    assert.ok(Math.abs(t.y + t.height * bottom / armor.sourceHeight - (a.y + a.h)) < 1e-8);
    assert.deepEqual(getUserArmorTransformV95(a, { ...plain, alphaBounds: { x: left, y: top, width: right - left, height: bottom - top } }), t);
  }
  for (const weapon of weapons) {
    const [left, top, right, bottom] = weapon.alphaBounds;
    const t = getUserWeaponTransformV95(a, null, weapon);
    assert.ok(Math.abs(t.width * (right - left) / weapon.sourceWidth - (weapon.renderWidth ?? 82)) < 1e-8);
    assert.deepEqual(getUserWeaponTransformV95(a, null, { ...weapon, alphaBounds: { x: left, y: top, width: right - left, height: bottom - top } }), t);
  }
});

test('V95 image loading handles failure and only loads the two selected assets', async () => {
  const loaded = [];
  class FailingImage { set src(value) { loaded.push(value); queueMicrotask(() => this.onerror()); } }
  const result = await loadUserEquipmentImagesV95(new Map(), { armorId: armors[0].id, weaponId: weapons[0].id }, FailingImage);
  assert.equal(loaded.length, 2);
  assert.ok(result.every(item => item.ready === false));
  assert.deepEqual(await loadUserEquipmentImagesV95(new Map(), { weaponId: 'unknown' }, FailingImage), []);
  const save = createDefaultSave();
  equipUserEquipmentV95(save, armors[0].id);
  assert.match(userEquipmentPanelHtmlV95(save), /DÉSÉQUIPER/);
  assert.match(userEquipmentPanelHtmlV95(save), /sans animation dédiée/);
});

test('V95 real mission draws worn armor, fires selected weapon and reloads without refill on resume', () => {
  const previous = ['Image', 'addEventListener', 'requestAnimationFrame', 'document'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  class TestImage {
    complete = true; naturalWidth = 1024; naturalHeight = 1024;
    set src(value) { this.currentSrc = value; const art = USER_EQUIPMENT_ART_V95.find(item => item.path === value); if (art) { this.naturalWidth = art.sourceWidth; this.naturalHeight = art.sourceHeight; } queueMicrotask(() => this.onload?.()); }
  }
  Object.assign(globalThis, { Image: TestImage, addEventListener: noop, requestAnimationFrame: () => 1, document: { hidden: false, addEventListener: noop } });
  const engines = [];
  try {
    for (const armor of armors) {
      const weapon = weapons[armors.indexOf(armor) % weapons.length];
      const fixture = canvasFixture();
      const engine = new GameEngine(fixture.canvas); engines.push(engine);
      const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], levelSeed: LEVEL_SEEDS[0], seed: 9501,
        weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 20), crew: [], difficulty: 'standard', accessibility: { aimAssist: 'off' },
        userCasteCampaignV88: false, userEquipmentV95: { armorId: armor.id, weaponId: weapon.id } };
      engine.start(options);
      engine.paused = false; engine.enemyAtlasLoadingPausedV65 = false;
      engine.drawActor(fixture.ctx, engine.player);
      assert.equal(engine.player.playerVisualV95.itemId, armor.id);
      assert.equal(engine.player.heldWeaponVisualV95.itemId, weapon.id);
      assert.equal(engine.player.spriteHitbox, null);
      assert.equal(engine.weaponRuntime.id, weapon.id);
      assert.equal(engine.player.ammo, weapon.magazine);
      engine.keys.add('KeyD');
      assert.equal(engine.fire(engine.player), true);
      assert.equal(engine.player.ammo, weapon.magazine - 1);
      const shot = engine.bullets.at(-1);
      const muzzle = resolveUserEquipmentMuzzleV95(engine.player, engine.player.combatAimV83);
      assert.equal(shot.x, muzzle.x); assert.equal(shot.y, muzzle.y);
      assert.equal(shot.family, weapon.family);
      engine.player.armor = engine.player.maxArmor - 3;
      const snapshot = sanitizeOperationResumeState(engine.captureResumeState());
      const expectedArmor = engine.player.armor;
      const next = new GameEngine(canvasFixture().canvas); engines.push(next);
      next.start({ ...options, resumeState: snapshot });
      assert.equal(next.lastResumeResult.applied, true);
      assert.equal(next.player.armor, expectedArmor);
      assert.equal(next.player.ammo, weapon.magazine - 1);
      assert.equal(next.userEquipmentV95.armor.id, armor.id);
      assert.equal(next.weaponRuntime.id, weapon.id);
      assert.equal(next.reload(next.player), true);
    }
  } finally {
    for (const engine of engines) engine.stop();
    for (const [key, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
});
