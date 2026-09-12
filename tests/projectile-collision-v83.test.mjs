import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sweepProjectileAabbV83,
  collectProjectileCollisionsV83,
  firstProjectileObstacleV83
} from '../src/projectile-collision-v83.js';
import { GameEngine, buildWeaponBallisticsRuntime } from '../src/game-production-base.js';

const projectile = (overrides = {}) => ({
  x: 20, y: 40, w: 4, h: 4, vx: 1000, vy: 0, life: 2, damage: 100,
  hit: false, hitCount: 0, hitEnemyIds: new Set(), remainingPenetration: 0,
  maxHits: 1, armorBypass: 0, splash: 0, owner: { id: 'alpha' }, ...overrides
});
const enemy = (id, x, y = 35, overrides = {}) => ({
  id, x, y, w: 20, h: 20, alive: true, armor: 0, health: 1000,
  speed: 100, staggerClock: 0, revealed: 0, ...overrides
});
const engineFor = (bullets, overrides = {}) => ({
  bullets, enemies: [], walls: [], doors: [], platforms: [],
  missionLevelBounds: { width: 2000, height: 1200 },
  penetrationTelemetry: { shots: 1, hits: 0, passThroughs: 0, familyEffects: {} },
  hits: [], statuses: [],
  applyEnemyDamage(target, rawDamage, source) {
    this.hits.push({ id: target.id, rawDamage, x: source.x, y: source.y, kind: source.kind, owner: source.owner });
    target.health -= Math.max(1, rawDamage - target.armor * 0.35);
    if (target.health <= 0) target.alive = false;
  },
  applyProjectileStatus(target, source) {
    this.statuses.push(target.id);
    GameEngine.prototype.applyProjectileStatus.call(this, target, source);
  },
  ...overrides
});
const update = (engine, delta) => GameEngine.prototype.updateBullets.call(engine, delta);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

for (const [label, dx, dy] of [
  ['right', 1, 0], ['left', -1, 0], ['up', 0, -1], ['down', 0, 1],
  ['up-right', 1, -1], ['up-left', -1, -1], ['down-right', 1, 1], ['down-left', -1, 1]
]) {
  test(`continuous runtime hit in ${label}, even when the end position skipped the target`, () => {
    const bullet = projectile({ x: 500, y: 500, vx: dx * 10000, vy: dy * 10000 });
    const target = enemy(label, 502 + dx * 200 - 10, 502 + dy * 200 - 10);
    const engine = engineFor([bullet], { enemies: [target] });
    update(engine, 0.1);
    assert.deepEqual(engine.hits.map((hit) => hit.id), [label]);
    assert.equal(engine.bullets.length, 0);
    assert.equal(engine.penetrationTelemetry.hits, 1);
    assert.ok(Math.hypot(bullet.x - 500, bullet.y - 500) < 300);
    near(engine.hits[0].x, bullet.x);
    near(engine.hits[0].y, bullet.y);
  });
}

test('AABB sweep catches a one-pixel obstacle at high speed with the right contact and normal', () => {
  const hit = sweepProjectileAabbV83(projectile({ x: 10 }), { x: 1000, y: 0 }, { x: 500, y: 0, w: 1, h: 100 });
  near(hit.t, 0.486);
  assert.deepEqual({ x: hit.x, y: hit.y, nx: hit.normalX, ny: hit.normalY }, { x: 496, y: 40, nx: -1, ny: 0 });
});

test('diagonal swept bounding-box overlap alone does not create a false impact', () => {
  assert.equal(sweepProjectileAabbV83(projectile({ x: 0, y: 0 }), { x: 300, y: 300 }, { x: 150, y: 20, w: 10, h: 10 }), null);
});

test('touching an edge while leaving or moving parallel does not cause a sticky impact', () => {
  const wall = { x: 100, y: 20, w: 10, h: 100 };
  const touching = projectile({ x: 96, y: 40 });
  assert.equal(sweepProjectileAabbV83(touching, { x: -40, y: 0 }, wall), null);
  assert.equal(sweepProjectileAabbV83(touching, { x: 0, y: 40 }, wall), null);
  assert.equal(sweepProjectileAabbV83(touching, { x: 20, y: 0 }, wall).t, 0);
  assert.equal(sweepProjectileAabbV83(projectile({ x: 50, y: 40 }), { x: 46, y: 0 }, wall).t, 1);
});

test('already overlapping solids have t=0 and invalid geometry cannot generate NaN contacts', () => {
  const wall = { x: 100, y: 20, w: 10, h: 100 };
  assert.equal(sweepProjectileAabbV83(projectile({ x: 102, y: 40 }), { x: 0, y: 0 }, wall).t, 0);
  assert.equal(sweepProjectileAabbV83(projectile(), { x: NaN, y: 0 }, wall), null);
  assert.equal(sweepProjectileAabbV83(projectile(), { x: 100, y: 0 }, { ...wall, w: -1 }), null);
});

test('obstacles and enemies are sorted by travel time, not array order; solid ties win', () => {
  const nearEnemy = enemy('near', 100);
  const farEnemy = enemy('far', 450);
  const tiedEnemy = enemy('inside-wall', 300);
  const wall = { x: 300, y: 0, w: 2, h: 100 };
  const hits = collectProjectileCollisionsV83(projectile(), { x: 600, y: 0 }, {
    walls: [wall], enemies: [farEnemy, tiedEnemy, nearEnemy]
  });
  assert.deepEqual(hits.map((hit) => hit.kind === 'enemy' ? hit.target.id : hit.kind), ['near', 'wall', 'inside-wall', 'far']);
});

test('destroyed walls and doors opened at 82 percent are not obstacles', () => {
  const geometry = { x: 100, y: 0, w: 10, h: 100 };
  const world = {
    walls: [{ ...geometry, destroyed: true }],
    doors: [{ ...geometry, progress: 0.82 }, { ...geometry, open: true }, { ...geometry, progress: 0, destroyed: true }]
  };
  assert.equal(firstProjectileObstacleV83(projectile(), { x: 400, y: 0 }, world), null);
  const closed = { ...geometry, x: 200, progress: 0.819 };
  world.doors.push(closed);
  assert.equal(firstProjectileObstacleV83(projectile(), { x: 400, y: 0 }, world).target, closed);
});

test('one-way platforms preserve upward and horizontal passage, blocking only downward top crossing', () => {
  const platform = { x: 50, y: 100, w: 100, h: 20, art: 'catwalk', surfaceOffset: 42 };
  const world = { platforms: [platform] };
  assert.equal(firstProjectileObstacleV83(projectile({ x: 80, y: 140 }), { x: 0, y: -100 }, world), null);
  assert.equal(firstProjectileObstacleV83(projectile({ x: 20, y: 105 }), { x: 200, y: 0 }, world), null);
  assert.equal(firstProjectileObstacleV83(projectile({ x: 80, y: 105 }), { x: 0, y: 100 }, world), null);
  const hit = firstProjectileObstacleV83(projectile({ x: 80, y: 20 }), { x: 0, y: 200 }, world);
  near(hit.t, 0.38);
  assert.equal(hit.y, 96);
  assert.equal(hit.normalY, -1);
  assert.equal(firstProjectileObstacleV83(projectile({ x: 180, y: 20 }), { x: 0, y: 200 }, world), null);
});

test('floor and explicitly solid platforms block on every face', () => {
  for (const flag of [{ floor: true }, { oneWay: false }, { solid: true }]) {
    const world = { platforms: [{ x: 50, y: 100, w: 100, h: 20, ...flag }] };
    const hit = firstProjectileObstacleV83(projectile({ x: 80, y: 140 }), { x: 0, y: -100 }, world);
    assert.equal(hit.y, 120);
    assert.equal(hit.normalY, 1);
  }
});

test('point ray for aim assist ignores enemies but reports the first blocking geometry', () => {
  const ray = { x: 20, y: 40, w: 0, h: 0 };
  const wall = { x: 200, y: 0, w: 4, h: 100 };
  const hit = firstProjectileObstacleV83(ray, { x: 800, y: 0 }, { enemies: [enemy('ignored', 100)], walls: [wall] });
  assert.equal(hit.target, wall);
  assert.equal(hit.x, 200);
});

test('collector is pure and ignores dead, previously hit and duplicate enemy IDs', () => {
  const target = enemy('live', 100);
  const bullet = projectile({ hitEnemyIds: new Set(['old']) });
  const world = { enemies: [enemy('dead', 80, 35, { alive: false }), enemy('old', 90), target, target, { ...target }] };
  const before = structuredClone({ bullet, world });
  const hits = collectProjectileCollisionsV83(bullet, { x: 400, y: 0 }, world);
  assert.deepEqual(hits.map((hit) => hit.target.id), ['live']);
  assert.deepEqual({ bullet, world }, before);
});

test('all four world edges are exact projectile extents, including vertical mission dimensions', () => {
  const bullet = projectile({ x: 200, y: 200 });
  const bounds = { width: 800, height: 600 };
  for (const [dx, dy, x, y] of [[-1000, 0, 0, 200], [1000, 0, 796, 200], [0, -1000, 200, 0], [0, 1000, 200, 596]]) {
    const hit = firstProjectileObstacleV83(bullet, { x: dx, y: dy }, { bounds });
    assert.equal(hit.kind, 'bounds');
    near(hit.x, x);
    near(hit.y, y);
  }
  assert.equal(firstProjectileObstacleV83(projectile({ x: 0 }), { x: 40, y: 0 }, { bounds }), null);
  assert.equal(firstProjectileObstacleV83(projectile({ x: -1 }), { x: 40, y: 0 }, { bounds }).t, 0);
});

test('mission bounds smaller than legacy map prevent an enemy hit beyond the real boundary', () => {
  const bullet = projectile({ x: 300, vx: 4000 });
  const engine = engineFor([bullet], { missionLevelBounds: { width: 400, height: 500 }, enemies: [enemy('outside', 450)] });
  update(engine, 0.1);
  assert.equal(engine.hits.length, 0);
  assert.equal(bullet.x, 396);
  assert.equal(engine.bullets.length, 0);
});

test('large and tall mission projectiles are not culled by old 6200x1180 constants', () => {
  const bullet = projectile({ x: 7000, y: 2000, vx: 400, vy: 800 });
  const engine = engineFor([bullet], { missionLevelBounds: { width: 9000, height: 4000 } });
  update(engine, 0.25);
  assert.deepEqual([bullet.x, bullet.y], [7100, 2200]);
  assert.equal(engine.bullets[0], bullet);
});

test('legacy maps without mission bounds use their actual 6200x1080 world', () => {
  const bullet = projectile({ x: 6150, y: 1000 });
  const engine = engineFor([bullet], { missionLevelBounds: undefined });
  update(engine, 0.1);
  assert.equal(bullet.x, 6196);
  assert.equal(engine.bullets.length, 0);
});

test('penetration hits spatially nearer enemies first and never passes a wall', () => {
  const bullet = projectile({ remainingPenetration: 500, maxHits: 7, status: 'ionized' });
  const engine = engineFor([bullet], {
    enemies: [enemy('behind-wall', 350), enemy('second', 160), enemy('first', 80)],
    walls: [{ x: 250, y: 0, w: 2, h: 100 }]
  });
  update(engine, 0.5);
  assert.deepEqual(engine.hits.map((hit) => hit.id), ['first', 'second']);
  assert.deepEqual(engine.statuses, ['first', 'second']);
  assert.equal(bullet.x, 246);
  assert.equal(bullet.hitCount, 2);
  assert.equal(bullet.remainingPenetration, 460);
  assert.equal(engine.penetrationTelemetry.hits, 2);
  assert.equal(engine.penetrationTelemetry.passThroughs, 2);
  assert.equal(engine.bullets.length, 0);
});

test('an enemy tied with an obstacle receives no damage', () => {
  const bullet = projectile({ remainingPenetration: 500, maxHits: 7 });
  const engine = engineFor([bullet], { enemies: [enemy('embedded', 100)], doors: [{ x: 100, y: 0, w: 10, h: 100, progress: 0 }] });
  update(engine, 0.3);
  assert.equal(engine.hits.length, 0);
  assert.equal(bullet.x, 96);
});

test('penetration budget and maximum hit count still terminate the projectile', () => {
  for (const config of [{ remainingPenetration: 19, maxHits: 7 }, { remainingPenetration: 500, maxHits: 1 }]) {
    const bullet = projectile(config);
    const engine = engineFor([bullet], { enemies: [enemy('far', 200), enemy('near', 80)] });
    update(engine, 0.4);
    assert.deepEqual(engine.hits.map((hit) => hit.id), ['near']);
    assert.equal(bullet.x, 76);
    assert.equal(engine.bullets.length, 0);
  }
});

test('a penetrating projectile never damages the same enemy again on later frames', () => {
  const bullet = projectile({ vx: 50, remainingPenetration: 500, maxHits: 7 });
  const target = enemy('wide', 24, 35, { w: 150 });
  const engine = engineFor([bullet], { enemies: [target, target] });
  update(engine, 0.1);
  update(engine, 0.1);
  update(engine, 0.1);
  assert.deepEqual(engine.hits.map((hit) => hit.id), ['wide']);
  assert.equal(bullet.hitCount, 1);
  assert.equal(engine.penetrationTelemetry.hits, 1);
});

test('explosive splash remains one burst with one primary and no secondary double impact', () => {
  const primary = enemy('primary', 80);
  const secondary = enemy('secondary', 130);
  const bullet = projectile({ splash: 150, status: 'blast', remainingPenetration: 500, maxHits: 7 });
  const engine = engineFor([bullet], { enemies: [secondary, primary, secondary] });
  update(engine, 0.3);
  assert.deepEqual(engine.hits.map((hit) => hit.id), ['primary', 'secondary']);
  assert.equal(engine.hits[1].kind, 'explosive-splash');
  assert.equal(engine.hits[1].rawDamage, 48);
  assert.deepEqual(engine.statuses, ['primary']);
  assert.equal(engine.penetrationTelemetry.hits, 1);
  assert.equal(engine.bullets.length, 0);
});

test('armor bypass compensation, ownership and impact position survive continuous collision', () => {
  const target = enemy('armored', 100, 35, { armor: 80 });
  const bullet = projectile({ armorBypass: 0.5, kind: 'rifle' });
  const engine = engineFor([bullet], { enemies: [target] });
  update(engine, 0.3);
  assert.equal(engine.hits[0].rawDamage, 114);
  assert.equal(engine.hits[0].owner, bullet.owner);
  assert.equal(engine.hits[0].kind, 'rifle');
  assert.equal(engine.hits[0].x, 96);
  assert.equal(target.health, 914);
});

test('expired and already-hit projectiles cannot strike, and lifetime caps distance inside a long frame', () => {
  const expired = projectile({ life: 0 });
  const spent = projectile({ hit: true });
  const short = projectile({ life: 0.02 });
  const engine = engineFor([expired, spent, short], { enemies: [enemy('beyond-lifetime', 100)] });
  update(engine, 0.5);
  assert.equal(engine.hits.length, 0);
  assert.equal(short.x, 40);
  assert.equal(engine.bullets.length, 0);
});

test('a target reached before lifetime expiry still receives its single hit', () => {
  const bullet = projectile({ life: 0.1 });
  const engine = engineFor([bullet], { enemies: [enemy('reachable', 80)] });
  update(engine, 0.5);
  assert.deepEqual(engine.hits.map((hit) => hit.id), ['reachable']);
  assert.equal(bullet.x, 76);
});

test('multiple projectiles recheck enemy liveness after earlier impacts', () => {
  const target = enemy('fragile', 80, 35, { health: 10 });
  const engine = engineFor([projectile(), projectile()], { enemies: [target] });
  update(engine, 0.2);
  assert.deepEqual(engine.hits.map((hit) => hit.id), ['fragile']);
  assert.equal(engine.penetrationTelemetry.hits, 1);
});

for (const family of ['ballistic', 'smart', 'flame', 'explosive', 'electric', 'silent', 'energy', 'melee', 'tool', 'sonic', 'acid', 'cryo', 'chemical', 'sentry']) {
  test(`${family} ballistic contract keeps its effect and telemetry for a vertical swept hit`, () => {
    const profile = buildWeaponBallisticsRuntime({ family, penetration: 80 });
    const bullet = projectile({ ...profile, remainingPenetration: profile.penetrationBudget, x: 100, y: 20, vx: 0, vy: 10000 });
    const target = enemy(family, 90, 200, { armor: 10, biology: 'synthetic' });
    const engine = engineFor([bullet], { enemies: [target] });
    update(engine, 0.05);
    assert.deepEqual(engine.hits.map((hit) => hit.id), [family]);
    assert.equal(target.statusEffect || null, profile.status);
    assert.equal(engine.penetrationTelemetry.hits, 1);
    assert.equal(engine.penetrationTelemetry.shots, 1);
    assert.equal(engine.hits[0].y, 196);
    assert.equal(bullet.hitCount, 1);
    assert.equal(bullet.hitEnemyIds.has(family), true);
    if (family === 'electric') assert.ok(target.health < 900);
    if (family === 'cryo') assert.equal(target.speed, 72);
  });
}
