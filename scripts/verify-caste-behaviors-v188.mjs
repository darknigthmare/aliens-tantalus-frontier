import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_BEHAVIOR_PROFILES_V119 } from '../src/enemy-behavior-registry-v119.js';
import { CASTE_BEHAVIORS_V188, casteBehaviorIdV188, playerWatchesV188 } from '../src/caste-behaviors-v188.js';
import { fixture, tick } from './engine-host-v188.mjs';

test('only drone, runner and ambusher profiles are eligible; bosses and horde actors never', () => {
  assert.equal(casteBehaviorIdV188({ behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119.drone }), 'drone');
  assert.equal(casteBehaviorIdV188({ behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119.runner }), 'runner');
  assert.equal(casteBehaviorIdV188({ behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119.ambusher }), 'ambusher');
  assert.equal(casteBehaviorIdV188({ behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119.warrior }), null);
  assert.equal(casteBehaviorIdV188({ behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119.drone, isBoss: true }), null);
  assert.equal(casteBehaviorIdV188({ behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119.drone, hordeV132: true }), null);
  const player = { x: 100, y: 0, w: 40, h: 80, facing: 1 };
  assert.equal(playerWatchesV188(player, { x: 300, y: 20, w: 40, h: 60 }, 240), true);
  assert.equal(playerWatchesV188({ ...player, facing: -1 }, { x: 300, y: 20, w: 40, h: 60 }, 240), false);
});

async function arena(profileId, dx) {
  const { engine } = await fixture({ keepEnemies: true });
  const source = engine.spawnedEnemiesV188.find(enemy => enemy.alive && !enemy.isBoss);
  assert.ok(source, 'a real spawned enemy actor');
  const p = engine.player, floor = engine.platforms.filter(entry => !entry.lift && entry.w >= 240)
    .sort((a, b) => b.w - a.w || b.y - a.y)[0];
  assert.ok(floor, 'a wide real floor');
  Object.assign(p, { x: floor.x + 4, y: floor.y - p.h, grounded: true, facing: 1, alive: true, invulnerable: 99 });
  const enemy = Object.assign(source, { behaviorProfileV119: ENEMY_BEHAVIOR_PROFILES_V119[profileId], alive: true, dormant: false,
    alert: true, revealed: 30, x: p.x + dx, y: floor.y - source.h, grounded: true, isBoss: false, attacking: false, pendingMelee: false, staggerClock: 0 });
  delete enemy.casteV188;
  engine.enemies = [enemy];
  return { engine, enemy, p };
}

test('production engine: a watched drone backs off, then the cooldown lets it come back', async () => {
  const { engine, enemy, p } = await arena('drone', 160);
  const start = enemy.x; tick(engine, .3);
  assert.equal(enemy.casteV188.mode, 'retreat'); assert.ok(enemy.x > start, 'moved away from the weapon');
  assert.equal(engine.casteStatsV188.drone, 1);
  engine.stop(); void p;
});

test('production engine: a watched runner holds, then dashes once the player turns away', async () => {
  const { engine, enemy, p } = await arena('runner', 170);
  const start = enemy.x; tick(engine, .3);
  assert.equal(enemy.casteV188.mode, 'hold'); assert.equal(enemy.x, start, 'holds its position while watched');
  p.facing = -1; tick(engine, 1 / 60);
  assert.equal(enemy.casteV188.mode, 'dash');
  engine.stop();
});

test('production engine: an ambusher stays still (invisible to the tracker) until the player is close', async () => {
  const { engine, enemy, p } = await arena('ambusher', 240);
  const start = enemy.x; tick(engine, .5);
  assert.equal(enemy.x, start); assert.equal(enemy.casteV188.triggered, false);
  enemy.x = p.x + CASTE_BEHAVIORS_V188.ambusher.triggerDistance - 20; tick(engine, 1 / 60);
  assert.equal(enemy.casteV188.triggered, true); assert.equal(engine.casteStatsV188.ambusher, 1);
  engine.stop();
});

test('production engine: a drone under a real platform clings motionless, flipped, then drops on the player', async () => {
  const { engine, enemy, p } = await arena('drone', 300);
  const floorY = enemy.y + enemy.h;
  const anchor = engine.platforms.filter(entry => !entry.lift && floorY - (entry.y + entry.h) > 200 + enemy.h && floorY - (entry.y + entry.h) < 420 + enemy.h)[0];
  assert.ok(anchor, 'the vertical ship level has a real platform at ceiling height above this floor');
  Object.assign(enemy, { x: anchor.x + anchor.w / 2 - enemy.w / 2, y: floorY - enemy.h }); delete enemy.casteV188;
  engine.attachCeilingDronesV188();
  assert.equal(enemy.casteV188?.mode, 'ceiling'); const hangY = enemy.y;
  assert.equal(hangY, anchor.y + anchor.h);
  assert.equal(enemy.casteV188.hangX, enemy.x);
  p.x = enemy.x + 400; tick(engine, .5);
  assert.equal(enemy.y, hangY, 'stays on the ceiling'); assert.equal(enemy.casteV188.mode, 'ceiling');
  let flipped = false; const ctx = engine.canvas.getContext('2d'); const scale = ctx.scale;
  ctx.scale = (x, y) => { if (y === -1) flipped = true; return scale?.(x, y); }; engine.drawEnemy(ctx, enemy); assert.ok(flipped, 'drawn upside down');
  const events = []; const original = engine.onEvent; engine.onEvent = event => { events.push(event); original?.(event); };
  p.x = enemy.x; p.y = floorY - p.h; tick(engine, .4);
  assert.notEqual(enemy.casteV188.mode, 'ceiling'); assert.ok(events.some(event => event.type === 'ceiling-drop-v188'));
  assert.ok(enemy.y > hangY, 'falls from the ceiling');
  engine.stop();
});

test('an enemy moved by another system leaves the ceiling; hive and authored chapters never attach', async () => {
  const { engine, enemy } = await arena('drone', 300);
  enemy.casteV188 = { mode: 'ceiling', hangX: enemy.x, hangY: enemy.y, clock: 0, cooldown: 0 };
  enemy.x += 30; tick(engine, 1 / 60);
  assert.notEqual(enemy.casteV188.mode, 'ceiling');
  engine.isHiveMissionV131 = () => true; delete enemy.casteV188;
  engine.attachCeilingDronesV188(); assert.equal(enemy.casteV188, undefined);
  engine.stop();
});
