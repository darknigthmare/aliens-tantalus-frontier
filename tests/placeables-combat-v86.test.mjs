import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';

const sentryId = 'equipment-020-portable-sentry';
function runtime(run) {
  const globals = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const originals = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const document = { hidden: false, activeElement: null, addEventListener() {} };
  const mocks = { Image: class { constructor() { this.complete = true; this.naturalWidth = this.naturalHeight = 1024; } set src(value) { this.currentSrc = value; } },
    addEventListener() {}, requestAnimationFrame: () => 0, document, navigator: { getGamepads: () => [] } };
  for (const [name, value] of Object.entries(mocks)) Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  const engines = [];
  const make = () => {
    const events = [];
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {}, focus() { document.activeElement = canvas; },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) };
    const engine = new GameEngine(canvas, { onEvent: event => events.push(event) }); engines.push(engine);
    engine.start({ seed: 86003, world: WORLDS[0], campaign: { ...CAMPAIGNS[0], id: 'placeable-test-v86' },
      levelSeed: { ...LEVEL_SEEDS[0], id: 'placeable-test-v86', seed: 86003 }, weapon: WEAPONS[0],
      equipment: [EQUIPMENT.find(item => item.id === sentryId)], crew: CREW.slice(0, 4), enemyCatalog: ENEMIES.slice(0, 52),
      playerIdentityV84: { name: 'Alex Navarro', callsign: 'ECHO-9' }, difficulty: 'standard' });
    const realEnemy = engine.enemies.find(enemy => enemy.alive && !enemy.dormant && !/ovomorph|facehugger|ceto/i.test(enemy.visualSheetId || ''));
    engine.paused = false; engine.enemyAtlasLoadingPausedV65 = false; engine.mission.state = 'active';
    engine.enemies = []; engine.walls = []; engine.covers = []; engine.doors = []; engine.lifts = []; engine.ladders = []; engine.vents = [];
    engine.hazards = []; engine.squadActors = []; engine.coopEnabled = false; engine.vehicle.active = false;
    engine.objective = null; engine.powerNode = null; engine.archiveTerminal = null;
    engine.platforms = [{ id: 'test-floor', x: 0, y: 560, w: 1600, h: 40, floor: true }];
    engine.missionLevelBounds = { width: 1600, height: 900 };
    Object.assign(engine.player, { x: 100, y: 560 - engine.player.h, vx: 0, vy: 0, grounded: true, facing: 1, inVehicle: false });
    assert.equal(engine.useEquipment(sentryId), true);
    assert.equal(engine.confirmPlaceableV86(), true);
    for (let frame = 0; frame < 150; frame += 1) engine.updateEquipmentDeployments(1 / 60);
    const sentry = engine.placeablesV86.instances.find(item => item.catalogId === sentryId && item.status === 'deployed');
    assert.ok(sentry); assert.equal(sentry.onGround, true);
    return { engine, events, sentry, realEnemy };
  };
  try { return run(make); } finally {
    engines.forEach(engine => engine.stop());
    for (const [name, descriptor] of originals) descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  }
}
function target(engine, changes = {}) {
  const enemy = { id: 'target-v86', name: 'Physical target', x: 430, y: 460, w: 46, h: 100,
    health: 1000, maxHealth: 1000, armor: 0, alive: true, alert: true, revealed: 5, ...changes };
  engine.enemies = [enemy]; return enemy;
}

for (const fps of [30, 60, 120]) test(`sentry delivers five real projectiles per second at ${fps}Hz`, () => runtime(make => {
  const { engine, sentry } = make(); target(engine);
  for (let frame = 0; frame < fps * 3; frame += 1) engine.updateEquipmentDeployments(1 / fps);
  assert.equal(150 - sentry.ammo, 15);
  assert.equal(engine.bullets.length, 15);
  assert.ok(engine.bullets.every(bullet => bullet.owner === engine.player && bullet.ownerCrewId === 'player-echo9'
    && bullet.placeableInstanceIdV86 === sentry.instanceId && Math.abs(Math.hypot(bullet.vx, bullet.vy) - 890) < 1e-6));
}));

test('sentry aim is a visible travelling projectile, not instant hidden damage', () => runtime(make => {
  const { engine, sentry } = make(); const enemy = target(engine);
  engine.updateEquipmentDeployments(1 / 60);
  assert.equal(enemy.health, 1000); assert.equal(engine.bullets.length, 1); assert.equal(sentry.ammo, 149);
  const bullet = engine.bullets[0]; assert.equal(bullet.aimExplicitV83, true);
  engine.updateBullets(0.4);
  assert.ok(enemy.health < 1000); assert.equal(engine.player.ammo, engine.weaponRuntime.magazine);
}));

test('sentry respects facing, 120-degree cone and closed-door occlusion', () => runtime(make => {
  const { engine, sentry } = make();
  const enemy = target(engine, { x: sentry.x - 160 });
  engine.updateEquipmentDeployments(1); assert.equal(sentry.ammo, 150);
  enemy.x = sentry.x + 100; enemy.y = sentry.y - 300;
  engine.updateEquipmentDeployments(1); assert.equal(sentry.ammo, 150);
  Object.assign(enemy, { x: 430, y: 460 });
  const door = { x: 300, y: 340, w: 24, h: 220, open: false, progress: 0 };
  engine.doors = [door]; engine.updateEquipmentDeployments(1); assert.equal(sentry.ammo, 150);
  door.open = true; door.progress = 1; engine.updateEquipmentDeployments(1 / 60); assert.equal(sentry.ammo, 149);
  enemy.x = sentry.x - 160; sentry.facing = -1; sentry.cooldown = 0; engine.updateEquipmentDeployments(1 / 60);
  assert.equal(sentry.ammo, 148); assert.ok(engine.bullets.at(-1).vx < 0);
}));

test('low and empty warnings are once per threshold and an empty gun cannot borrow personal ammo', () => runtime(make => {
  const { engine, sentry, events } = make(); target(engine); sentry.ammo = 31;
  const ammunition = [engine.player.ammo, engine.player.ammoReserve];
  for (let frame = 0; frame < 9 * 60; frame += 1) engine.updateEquipmentDeployments(1 / 60);
  assert.equal(sentry.ammo, 0); assert.equal(engine.bullets.length, 31);
  assert.deepEqual(events.filter(event => event.type === 'placeable-ammo-warning').map(event => event.ammo), [30, 0]);
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], ammunition);
}));

test('an opaque one-way platform blocks sentry targeting from below as well as recovery reach', () => runtime(make => {
  const { engine, sentry } = make(); target(engine, { x: 430, y: 300 });
  engine.platforms.push({ id: 'upper-deck', x: 260, y: 440, w: 600, h: 20 });
  engine.updateEquipmentDeployments(1 / 60);
  assert.equal(sentry.ammo, 150); assert.equal(engine.bullets.length, 0);
  assert.equal(engine.placeableLineClearV86({ x: 320, y: 490 }, { x: 400, y: 390 }), false);
}));

test('J2 can recover and redeploy the same shared mission instance with correct projectile attribution', () => runtime(make => {
  const { engine, sentry } = make(); sentry.ammo = 13; sentry.health = 64;
  engine.setCoop(true); engine.player.x = 1100;
  Object.assign(engine.coop, { x: 100, y: 560 - engine.coop.h, vx: 0, vy: 0, facing: 1, grounded: true, alive: true, inVehicle: false });
  assert.equal(engine.recoverPlaceableV86(sentry.instanceId, engine.coop), true);
  for (let frame = 0; frame < 120; frame += 1) engine.updateEquipmentDeployments(1 / 60);
  assert.equal(sentry.status, 'carried'); assert.equal(sentry.ammo, 13); assert.equal(sentry.health, 64);
  assert.equal(engine.useEquipment(sentry.catalogId, engine.coop), true);
  assert.equal(engine.confirmPlaceableV86(engine.coop), true);
  for (let frame = 0; frame < 150; frame += 1) engine.updateEquipmentDeployments(1 / 60);
  assert.equal(sentry.status, 'deployed'); assert.equal(sentry.ownerCrewId, engine.coop.operatorId);
  assert.equal(engine.equipmentActions.get(sentryId).uses, 1);
  const enemy = target(engine); engine.updateEquipmentDeployments(1 / 60);
  assert.equal(engine.bullets.at(-1).owner, engine.coop); assert.equal(engine.bullets.at(-1).ownerCrewId, engine.coop.operatorId);
  assert.equal(sentry.ammo, 12); assert.equal(sentry.health, 64);
  engine.updateBullets(0.4); assert.ok(enemy.health < 1000);
}));

for (const obstacle of ['none', 'wall', 'player']) test(`hostile projectile resolves first swept contact before sentry: ${obstacle}`, () => runtime(make => {
  const { engine, sentry } = make(); const before = engine.player.health + engine.player.armor;
  // Fire from right to left; object, optional blocker and source all sit above the floor.
  const y = sentry.y + 30;
  engine.hostileProjectiles = [{ id: 'acid-v86', x: 600, y, w: 8, h: 8, vx: -1200, vy: 0, damage: 20, life: 2, hit: false, acid: true }];
  if (obstacle === 'wall') engine.walls = [{ x: 340, y: 390, w: 20, h: 170 }];
  if (obstacle === 'player') engine.player.x = 340;
  engine.updateHostileProjectiles(0.5);
  assert.equal(sentry.health, obstacle === 'none' ? 80 : 100);
  assert.equal(engine.hostileProjectiles.length, 0);
  if (obstacle === 'player') assert.ok(engine.player.health + engine.player.armor < before);
}));

test('real enemy object strike is telegraphed, interruptible by stun and cannot hit through a closing door', () => runtime(make => {
  const { engine, sentry, realEnemy, events } = make(); assert.ok(realEnemy);
  Object.assign(realEnemy, { x: sentry.x + sentry.w + 3, y: 560 - realEnemy.h, attackClock: 0, attackWindupClock: 0,
    attacking: false, pendingMelee: false, batchAttackV66: null, staggerClock: 0, hurtClock: 0, jammedClock: 0, v52HurtClock: 0,
    alive: true, dormant: false, ventTransit: null, damage: 25 });
  engine.enemies = [realEnemy];
  engine.updateEnemy(realEnemy, 0.1);
  assert.equal(sentry.health, 100); assert.equal(engine.placeableAttackTasksV86.size, 1);
  assert.ok(events.some(event => event.type === 'placeable-attack-started'));
  realEnemy.staggerClock = 0.8; engine.updateEnemy(realEnemy, 0.1);
  assert.equal(sentry.health, 100); assert.equal(engine.placeableAttackTasksV86.size, 0); assert.equal(realEnemy.attacking, false);
  Object.assign(realEnemy, { staggerClock: 0, hurtClock: 0, attackClock: 0, attacking: false, pendingMelee: false, batchAttackV66: null });
  engine.updateEnemy(realEnemy, 0.1); assert.equal(engine.placeableAttackTasksV86.size, 1);
  engine.doors = [{ x: sentry.x + sentry.w + 1, y: 200, w: 1, h: 360, open: false, progress: 0 }];
  engine.updateEnemy(realEnemy, 0.3); assert.equal(sentry.health, 100); assert.equal(engine.placeableAttackTasksV86.size, 0);
}));

test('an unopposed real enemy finishes its object strike and destroys the finite instance', () => runtime(make => {
  const { engine, sentry, realEnemy, events } = make(); assert.ok(realEnemy);
  Object.assign(realEnemy, { x: sentry.x + sentry.w + 3, y: 560 - realEnemy.h, attackClock: 0, attackWindupClock: 0,
    attacking: false, pendingMelee: false, batchAttackV66: null, staggerClock: 0, hurtClock: 0, jammedClock: 0, v52HurtClock: 0,
    alive: true, dormant: false, ventTransit: null, damage: 120 });
  engine.enemies = [realEnemy];
  for (let frame = 0; frame < 21; frame += 1) engine.updateEnemy(realEnemy, 1 / 60);
  assert.equal(sentry.health, 0); assert.equal(sentry.status, 'destroyed'); assert.equal(sentry.onGround, true);
  assert.equal(engine.recoverPlaceableV86(sentry.instanceId), false);
  assert.ok(events.some(event => event.type === 'placeable-destroyed' && event.instanceId === sentry.instanceId && event.message));
}));
