import test from 'node:test';
import assert from 'node:assert/strict';
import { captureBioforgePhysicalV87, sanitizeBioforgePhysicalV87,
  restoreBioforgePlayerPhysicalV87, restoreBioforgeEnemyPhysicalV87 } from '../src/bioforge-physical-state-v87.js';
import { startTacticalReloadV77, updateTacticalReloadV77, pressTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import { getOvomorphChildIdV66 } from '../src/enemy-ovomorph-cycle-v66.js';

const copy = value => structuredClone(value);
function player() {
  return { x: 1350, y: 528, w: 42, h: 92, vx: 17, vy: -45, facing: -1,
    health: 42, maxHealth: 100, armor: 11, maxArmor: 100, ammo: 3, ammoReserve: 9,
    magazineSize: 12, weaponMode: 'sidearm', alive: true, grounded: false,
    shots: 77, kills: 2, fireClock: .11, actionClock: .18, damageTaken: 58, damageBlocked: 39 };
}
function enemy(index = 1) {
  return { id: `bioforge-v80-s000000001:specimen-${String(index).padStart(2, '0')}`,
    profileId: 'enemy-002-facehugger', visualSheetId: 'enemy.profile.enemy-002-facehugger.v65',
    x: 2200, y: 596, w: 38, h: 24, vx: -12, vy: 0, facing: -1,
    health: 1, maxHealth: 58, armor: 0, alive: true, groundY: 620, spawnX: 1700,
    attackClock: .23, rangedClock: -.4, hurtClock: .1, alert: true };
}
function engine() { return { player: player(), enemies: [enemy()], inventory: { medkits: 1, salvage: 999, securityKeys: 5 } }; }
function eggEngine() {
  const value = engine();
  Object.assign(value.enemies[0], { profileId: 'enemy-001-ovomorph', visualSheetId: 'enemy.profile.enemy-001-ovomorph.v66',
    x: 1800, y: 536, w: 70, h: 84, vx: 0, health: 82, maxHealth: 82 });
  return value;
}
function hatchedEngine() {
  const value = eggEngine(), egg = value.enemies[0], child = enemy(2);
  egg.ovomorphCycleV66 = { phase: 'spent', elapsed: .8, spawned: true, childId: getOvomorphChildIdV66(egg), releaseBlocked: false };
  Object.assign(child, { id: egg.ovomorphCycleV66.childId, ovomorphParentIdV66: egg.id });
  value.enemies.push(child);
  return value;
}

test('capture is pure, keeps spent health/ammunition/clock values and excludes campaign inventory', () => {
  const source = engine(), before = copy(source), saved = captureBioforgePhysicalV87(source);
  assert.ok(saved); assert.equal(saved.schema, 1); assert.deepEqual(source, before);
  assert.equal(saved.player.health, 42); assert.equal(saved.player.ammo, 3); assert.equal(saved.player.ammoReserve, 9);
  assert.equal(saved.player.shots, 77); assert.equal(saved.player.vy, -45);
  assert.equal(saved.enemies[0].health, 1); assert.equal(saved.enemies[0].x, 2200);
  assert.deepEqual(saved.inventory, { medkits: 1 });
  assert.deepEqual(sanitizeBioforgePhysicalV87(JSON.parse(JSON.stringify(saved))), saved);
  assert.deepEqual(sanitizeBioforgePhysicalV87(sanitizeBioforgePhysicalV87(saved)), saved);
  saved.player.ammo = 0; saved.enemies[0].health = 0;
  assert.deepEqual(source, before);
});

test('restoring both actors changes no identity or collider and never refills resources', () => {
  const saved = captureBioforgePhysicalV87(engine()), targetPlayer = player(), targetEnemy = enemy();
  Object.assign(targetPlayer, { health: 100, armor: 50, ammo: 12, ammoReserve: 72 });
  Object.assign(targetEnemy, { health: 58, x: 1700 });
  assert.equal(restoreBioforgePlayerPhysicalV87(targetPlayer, saved.player), targetPlayer);
  assert.equal(restoreBioforgeEnemyPhysicalV87(targetEnemy, saved.enemies[0]), targetEnemy);
  assert.equal(targetPlayer.health, 42); assert.equal(targetPlayer.ammo, 3); assert.equal(targetPlayer.ammoReserve, 9);
  assert.equal(targetPlayer.shots, 77); assert.equal(targetEnemy.health, 1); assert.equal(targetEnemy.x, 2200);
  const after = copy({ targetPlayer, targetEnemy });
  restoreBioforgePlayerPhysicalV87(targetPlayer, saved.player); restoreBioforgeEnemyPhysicalV87(targetEnemy, saved.enemies[0]);
  assert.deepEqual({ targetPlayer, targetEnemy }, after);
});

test('reload resumes at the same simulation cursor and transfers rounds only once after a real tick', () => {
  const source = engine();
  assert.equal(startTacticalReloadV77(source.player, 'sidearm'), true);
  updateTacticalReloadV77(source.player, .4, { weapon: 'sidearm' });
  const saved = captureBioforgePhysicalV87(source), target = player();
  assert.ok(saved); assert.equal(restoreBioforgePlayerPhysicalV87(target, saved.player), target);
  assert.equal(target.tacticalReload.elapsed, .4); assert.equal(target.reloadClock, saved.player.reloadClock);
  assert.equal(target.ammo, 3); assert.equal(target.ammoReserve, 9);
  updateTacticalReloadV77(target, 100, { paused: true, weapon: 'sidearm' });
  assert.equal(target.tacticalReload.elapsed, .4); assert.equal(target.ammo, 3);
  assert.equal(updateTacticalReloadV77(target, .8, { weapon: 'sidearm' }).loaded, 9);
  assert.equal(target.ammo, 12); assert.equal(target.ammoReserve, 0);
  updateTacticalReloadV77(target, 100, { weapon: 'sidearm' });
  assert.equal(target.ammo, 12); assert.equal(target.ammoReserve, 0);
});

test('perfect reload completion proof and bonus survive without a second ammunition transfer', () => {
  const source = engine(); startTacticalReloadV77(source.player, 'sidearm');
  updateTacticalReloadV77(source.player, .55, { weapon: 'sidearm' }); pressTacticalReloadV77(source.player, 'sidearm');
  updateTacticalReloadV77(source.player, 1, { weapon: 'sidearm' });
  const saved = captureBioforgePhysicalV87(source), target = player();
  assert.ok(saved); assert.equal(saved.player.tacticalReloadV77.result, 'perfect');
  restoreBioforgePlayerPhysicalV87(target, saved.player); updateTacticalReloadV77(target, 10, { weapon: 'sidearm' });
  assert.equal(target.ammo, 12); assert.equal(target.ammoReserve, 0); assert.equal(target.tacticalReload.bonusRemaining, 3);
});

test('capturing an untouched egg initializes only the snapshot, not the live egg', () => {
  const source = eggEngine(), before = copy(source), saved = captureBioforgePhysicalV87(source);
  assert.ok(saved); assert.deepEqual(source, before);
  assert.equal(saved.enemies[0].ovomorphCycleV66.phase, 'sealed');
  assert.equal(saved.enemies[0].ovomorphCycleV66.spawned, false);
});

test('blocked hatching preserves its exact cursor and waits after reload, with no offline release', () => {
  const source = eggEngine(), egg = source.enemies[0];
  egg.ovomorphCycleV66 = { phase: 'hatch', elapsed: .5, spawned: false, childId: getOvomorphChildIdV66(egg), releaseBlocked: true };
  const saved = captureBioforgePhysicalV87(source), target = eggEngine().enemies[0];
  assert.ok(saved); restoreBioforgeEnemyPhysicalV87(target, saved.enemies[0]);
  assert.deepEqual(target.ovomorphCycleV66, egg.ovomorphCycleV66);
  assert.equal(target.health, 82); assert.equal(source.enemies.length, 1);
});

test('a hatched parent and killed child retain reciprocal proof; neither is respawned or healed', () => {
  const source = hatchedEngine(); Object.assign(source.enemies[1], { alive: false, health: 0, deathClock: 1.7 });
  const saved = captureBioforgePhysicalV87(source); assert.ok(saved);
  const child = enemy(); child.id = saved.enemies[1].id;
  assert.equal(restoreBioforgeEnemyPhysicalV87(child, saved.enemies[1]), child);
  assert.equal(child.alive, false); assert.equal(child.health, 0); assert.equal(child.deathClock, 1.7);
  assert.equal(child.ovomorphParentIdV66, source.enemies[0].id);
  for (const mutate of [s => s.enemies.pop(), s => s.enemies.shift(),
    s => { s.enemies[0].ovomorphCycleV66.spawned = false; }, s => { s.enemies[1].parentId = 'forged'; }]) {
    const corrupt = copy(saved); mutate(corrupt); assert.equal(sanitizeBioforgePhysicalV87(corrupt), null);
  }
});

test('an already resolved Facehugger impact remains resolved at the identical attack cursor', () => {
  const source = engine(); Object.assign(source.enemies[0], { attacking: true,
    facehuggerAttackV65: { targetId: 'player', targetInVehicle: false, facing: -1, elapsed: .5, distance: 42, impactResolved: true } });
  const saved = captureBioforgePhysicalV87(source), target = enemy(); assert.ok(saved);
  restoreBioforgeEnemyPhysicalV87(target, saved.enemies[0]);
  assert.deepEqual(target.facehuggerAttackV65, source.enemies[0].facehuggerAttackV65);
});

test('corrupted live egg data is rejected without a forgiving cycle reset or mutation', () => {
  const source = eggEngine(), egg = source.enemies[0];
  egg.ovomorphCycleV66 = { phase: 'hatch', elapsed: .7, spawned: false, childId: getOvomorphChildIdV66(egg), releaseBlocked: true };
  const before = copy(source);
  assert.equal(captureBioforgePhysicalV87(source), null); assert.deepEqual(source, before);
  egg.ovomorphCycleV66.elapsed = NaN;
  assert.equal(captureBioforgePhysicalV87(source), null); assert.equal(Number.isNaN(egg.ovomorphCycleV66.elapsed), true);
});

test('invalid, future, duplicated and over-cap snapshots are rejected instead of normalized into free actors', () => {
  const saved = captureBioforgePhysicalV87(engine());
  for (const mutate of [s => { s.schema = 2; }, s => { s.player.x = NaN; }, s => { s.player.health = Infinity; },
    s => { s.player.ammo = '3'; }, s => { s.player.ammoReserve = -1; }, s => { s.player.facing = 0; },
    s => { s.player.health = 0; }, s => { s.player.x = 2870; }, s => { s.player.ammo = 13; },
    s => { s.enemies[0].health = 59; }, s => { s.enemies[0].profileId = '../evil'; },
    s => { s.enemies.push(copy(s.enemies[0])); }, s => { s.inventory.credits = 100; },
    s => { s.enemies[0].facehuggerAttackV65 = { targetId: 'coop' }; }]) {
    const corrupt = copy(saved); mutate(corrupt); const before = copy(corrupt);
    assert.equal(sanitizeBioforgePhysicalV87(corrupt), null); assert.deepEqual(corrupt, before);
  }
  const source = engine(); source.enemies = Array.from({ length: 96 }, (_, index) => enemy(index + 1));
  assert.equal(captureBioforgePhysicalV87(source).enemies.length, 96);
  source.enemies.push(enemy(97)); assert.equal(captureBioforgePhysicalV87(source), null);
  assert.equal(sanitizeBioforgePhysicalV87(null), null); assert.equal(sanitizeBioforgePhysicalV87({}), null);
});

test('invalid reload clocks or altered identities never partially mutate restoration targets', () => {
  const source = engine(); startTacticalReloadV77(source.player, 'sidearm');
  const saved = captureBioforgePhysicalV87(source), target = player(), before = copy(target);
  saved.player.tacticalReloadV77.profile.duration = 0;
  assert.equal(restoreBioforgePlayerPhysicalV87(target, saved.player), null); assert.deepEqual(target, before);
  const valid = captureBioforgePhysicalV87(engine());
  for (const change of [s => { s.id = 'other'; }, s => { s.profileId = 'enemy-003-chestburster'; }, s => { s.w += 1; }]) {
    const actor = enemy(), previous = copy(actor), corrupt = copy(valid.enemies[0]); change(corrupt);
    assert.equal(restoreBioforgeEnemyPhysicalV87(actor, corrupt), null); assert.deepEqual(actor, previous);
  }
});
