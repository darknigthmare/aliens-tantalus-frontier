import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { buildCargoHoldSectionV188, inDepthSectionV188, stepEnemyDepthV188, MISSION_ATTACK_BAND_V188, QZ17_CAMPAIGN_ID_V188 } from '../src/mission-depth-v188.js';
import { blockedByFootprintV188, depthShotSettleV188 } from '../src/hub-depth-rooms-v188.js';

const QZ17 = { id: QZ17_CAMPAIGN_ID_V188, templateId: 'ship-interior-vertical', worldId: 'world-05-lethe' };
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
async function hold() {
  const run = await fixture({ campaign: QZ17, seed: 7 });
  const { engine } = run, section = engine.missionDepthSectionV188, p = engine.player;
  const place = (actor, x, z = 0) => { actor.x = x; actor.y = section.floorY - actor.h; actor.vy = 0; actor.grounded = true; actor.depthZ = z; };
  return { ...run, section, p, place };
}
function enemyFrom(engine, section, x, z) {
  const enemy = engine.spawnedEnemiesV188.find(entry => entry.alive !== false) || engine.spawnedEnemiesV188[0];
  Object.assign(enemy, { alive: true, dormant: false, x, y: section.floorY - enemy.h, health: 500, maxHealth: 500, depthZ: z, attackClock: 99, rangedClock: 99, pendingMelee: false });
  engine.enemies = [enemy]; return enemy;
}

test('QZ-17 cargo hold: a depth section measured on the generated level, absent elsewhere', async () => {
  const { section } = await hold();
  assert.equal(section.id, 'qz17-cargo-hold'); assert.equal(section.floorY, 868, 'the lower cargo deck (V130 profile)');
  assert.ok(section.x1 - section.x0 > 500, 'between the two cargo airlocks'); assert.equal(section.containers.length, 2);
  assert.deepEqual(section.coverIds, [], 'the QZ-17 dressing replaces the rail crates cover by depth objects');
  for (const entry of section.containers) assert.ok(entry.footprint.z1 <= -36, `${entry.id} leaves the wall lane free`);
  for (const entry of section.containers.filter(item => item.kind === 'container')) assert.equal(entry.w, 150, `${entry.id}: 10-ft ISO container at 51 px/m`);
  const other = await fixture({ seed: 7 });
  assert.equal(other.engine.missionDepthSectionV188, null, 'other campaigns keep their 2D behaviour');
  assert.equal(buildCargoHoldSectionV188({ doors: [], platforms: [] }), null);
});

test('QZ-17 cargo hold: W/S step in depth (no crouch, no aim), containers block, the airlocks are reached from the wall', async () => {
  const { engine, section, p, place } = await hold();
  place(p, section.bay.x + 40); tick(engine, .1); // the open floor of the empty QZ17-04 bay
  engine.keys.add('KeyS'); tick(engine, .4); engine.keys.delete('KeyS');
  assert.ok(p.depthZ < -40, 'S steps towards the camera'); assert.equal(p.crouching, false, 'S no longer crouches in the hold');
  assert.equal(engine.keys.size, 0, 'held keys are released normally');
  const rowB = section.containers.find(entry => entry.kind === 'pallet');
  place(p, rowB.x + rowB.w + 60, -52); engine.keys.add('KeyA'); tick(engine, 1); engine.keys.delete('KeyA');
  assert.ok(p.x + p.w / 2 >= rowB.x + rowB.w - 1, 'the pallet stops the marine in its band');
  place(p, section.x1 - p.w - 8, -30); engine.keys.add('KeyD'); tick(engine, .8); engine.keys.delete('KeyD');
  assert.ok(inDepthSectionV188(section, p), 'far from the wall, the cargo airlock is out of reach');
  place(p, section.bay.x + 100, -60); assert.equal(engine.interact(p), false, 'wall interactions are out of reach from the front lane');
  assert.equal(engine.getInteractionPrompt(p), '', 'and no prompt is offered for them');
  const other = await fixture({ seed: 7 }); other.engine.keys.add('KeyS'); tick(other.engine, .2);
  assert.equal(other.engine.player.depthZ || 0, 0, 'no depth outside the QZ-17 hold');
});

test('QZ-17 cargo hold: shots hit inside the band, miss outside it, stop at a container, and settle the shooter', async () => {
  const shoot = async (playerZ, enemyZ, gapX = 220, setup) => {
    const { engine, section, p, place } = await hold();
    place(p, section.x0 + 70, playerZ); p.facing = 1; p.vx = 0;
    const enemy = enemyFrom(engine, section, p.x + gapX, enemyZ); setup?.(engine, section, p, enemy);
    Object.assign(p, { alive: true, ammo: 99, ammoReserve: 400, reloading: false, fireClock: 0 });
    const before = enemy.health;
    for (let t = 0; t < .6; t += 1 / 60) { if (!(p.fireClock > 0)) engine.fire(p); tick(engine, 1 / 60); Object.assign(p, { alive: true, health: 100 }); }
    return { hit: enemy.health < before, p, enemy };
  };
  // In the lane along the wall: no container on the line.
  const inside = await shoot(-6, -12, 130);
  assert.equal(inside.hit, true, 'a target 6 away in depth is hit');
  assert.ok(inside.p.depthZ <= -6, 'the shooter never settles away from the target (the target had already closed in)');
  assert.equal(depthShotSettleV188(-6, -26), -12, 'a hit settles the shooter 30 % of the way towards the target band');
  assert.equal((await shoot(-6, -60, 130)).hit, false, 'a target 54 away in depth is missed');
  // The sealed container spans the front band: at z -70 a shot along the floor stops at it.
  const blocked = await shoot(-70, -70, 0, (engine, section, p, enemy) => {
    const rowC = section.containers.find(entry => entry.id === 'qz17-container-east'); p.x = rowC.x - 150; enemy.x = rowC.x + rowC.w + 30;
  });
  assert.equal(blocked.hit, false, 'a sealed container stops the salvo');
});

test('QZ-17 cargo hold: a xenomorph only lands a blow inside the attack band and walks around containers', async () => {
  const { engine, section, p, place } = await hold();
  place(p, section.x0 + 40, -60);
  const enemy = enemyFrom(engine, section, p.x + 30, -10);
  const health = p.health;
  engine.depthAttackerV188 = enemy; assert.equal(engine.damagePlayer(p, 20), 0, 'out of band: no damage'); engine.depthAttackerV188 = null;
  assert.equal(p.health, health);
  enemy.depthZ = -60 + MISSION_ATTACK_BAND_V188 - 1; engine.depthAttackerV188 = enemy; engine.damagePlayer(p, 20); engine.depthAttackerV188 = null;
  assert.ok(p.health < health, 'inside the band the blow lands');
  const rowB = section.containers.find(entry => entry.kind === 'pallet'), walker = { x: rowB.x + 10, w: 40, depthZ: -50, speed: 120 };
  const z = stepEnemyDepthV188(section, walker, -60, 1 / 60);
  assert.equal(blockedByFootprintV188(section, walker.x + 20, z, 20), false, 'pushed out of the container');
});

test('QZ-17 cargo hold: the tracker counts depth, the resume keeps it', async () => {
  const { engine, section, p, place } = await hold();
  place(p, section.x0 + 40, -50);
  const enemy = enemyFrom(engine, section, p.x + 200, -20);
  let lent = null; const original = engine.motionTrackerSnapshotV160?.bind(engine);
  if (original) engine.motionTrackerSnapshotV160 = (...args) => { lent ??= enemy.depth; return original(...args); };
  enemy.depth = undefined; tick(engine, .1);
  if (original) assert.ok(Number.isFinite(lent), 'the tracker sees a depth during the update');
  assert.equal(enemy.depth, undefined, 'and it is given back afterwards');
  const state = engine.captureResumeState();
  assert.equal(state.depthV188.section, 'qz17-cargo-hold'); assert.ok(state.depthV188.player < -40);
  p.depthZ = 0; engine.applyResumeState(state); assert.ok(p.depthZ < -40, 'restored at the same depth');
  const older = { ...state }; delete older.depthV188; p.depthZ = -30; engine.applyResumeState(older);
  assert.equal(p.depthZ, -30, 'an older resume does not move the marine in depth');
});

test('QZ-17 cargo hold: composed outermost, shipped offline, no generated image', () => {
  assert.match(read('src/game-production-runtime.js'), /export class GameEngine extends withMissionDepthRoomsV188\(withQz17LevelDressingV188\(withCasteBehaviorsV188\(/);
  const sw = read('sw.js'); for (const file of ['/src/mission-depth-v188.js', '/src/depth-props-v188.js', '/src/qz17-level-dressing-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
  assert.match(read('src/depth-props-v188.js'), /fillText\('QZ17'/);
});
