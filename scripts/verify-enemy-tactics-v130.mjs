import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { ENEMIES, WORLDS, CAMPAIGNS, WEAPONS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { withEnemyTacticsV130, enemySightClearV130, enemyPatrolBoundsV130 } from '../src/enemy-tactics-v130.js';

// Browser APIs are substituted, not the engine, projectile collision or combat.
// Raster quality is intentionally left to the browser screenshot review.
const Engine = withEnemyTacticsV130(ProductionEngine);
const root = fileURLToPath(new URL('../', import.meta.url));
const dimensions = new Map();
function pngSize(source) {
  if (dimensions.has(source)) return dimensions.get(source);
  let descriptor;
  try {
    descriptor = openSync(resolve(root, `.${new URL(source, 'http://qa.invalid').pathname}`), 'r');
    const header = Buffer.alloc(24); readSync(descriptor, header, 0, 24, 0);
    const size = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
    dimensions.set(source, size); return size;
  } catch { return null; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) { this._src = value; const size = pngSize(value); this.naturalWidth = size?.width || 0; this.naturalHeight = size?.height || 0;
      queueMicrotask(() => { const event = new Event(size ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing real fixture image'); }
  };
  const draws = [], stack = [], transforms = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({ globalAlpha: 1, save() { stack.push(this.globalAlpha); }, restore() { assert.ok(stack.length); this.globalAlpha = stack.pop(); },
    drawImage(image, ...args) { draws.push({ source: image.src, args, alpha: this.globalAlpha }); },
    translate(...args) { transforms.push(['translate', ...args]); }, scale(...args) { transforms.push(['scale', ...args]); },
    createLinearGradient: () => gradient, createRadialGradient: () => gradient, measureText: text => ({ width: String(text).length * 7 }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) },
  { get(target, property) { return property in target ? target[property] : () => {}; } });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx, draws, stack, transforms };
}
async function fixture() {
  const browser = host(), events = [], engine = new Engine(browser.canvas, { onEvent: event => events.push(event) });
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), equipment: [], crew: [], seed: 426 };
  engine.start(options);
  for (let n = 0; n < 6; n++) await Promise.resolve();
  Object.assign(engine, { platforms: [{ id: 'qa-floor', x: 0, y: 930, w: 6000, h: 150, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [], missionLevelRuntime: null,
    missionLevelBounds: { width: 6000, height: 1080 }, userCasteCampaignActiveV88: false,
    userCasteLoadingV88: false, enemyAtlasLoadingPausedV65: false, rearEntrancesV130: [], running: true, paused: false });
  Object.assign(engine.player, { x: 150, y: 838, w: 42, h: 92, alive: true, health: 100, grounded: true, vx: 0, vy: 0 });
  engine.mission.state = 'active'; engine.coopEnabled = false;
  return { ...browser, engine, actor: engine.player, events, options };
}
function enemy(subject, profile = 'enemy-004-drone-big-chap', x = 650, patch = {}) {
  const source = ENEMIES.find(entry => entry.id === profile); assert.ok(source, profile);
  const actor = Object.assign(subject.engine.createEnemy(source, subject.engine.enemies.length + 70, x, 930), { facing: 1, ...patch });
  subject.engine.enemies.push(actor); return actor;
}
function tick(engine, actor, seconds, rate = 60) {
  let remaining = seconds;
  while (remaining > 1e-9) { const delta = Math.min(1 / rate, remaining); engine.updateEnemy(actor, delta); remaining -= delta; }
}
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

test('real walls, covers and closing doors occlude vision; destroyed geometry and open doors release it', async () => {
  const subject = await fixture(), { engine } = subject;
  const actor = enemy(subject, 'enemy-004-drone-big-chap', 650, { facing: -1 });
  assert.equal(enemySightClearV130(engine, actor, engine.player), true);
  for (const field of ['walls', 'covers', 'doors']) {
    const obstacle = { x: 400, y: 790, w: 8, h: 140, progress: 0, open: false };
    engine[field] = [obstacle]; assert.equal(enemySightClearV130(engine, actor, engine.player), false, field);
    obstacle.destroyed = true; assert.equal(enemySightClearV130(engine, actor, engine.player), true, `${field} destroyed`);
    engine[field] = [];
  }
  engine.doors = [{ x: 400, y: 790, w: 8, h: 140, progress: .9, open: true }];
  assert.equal(enemySightClearV130(engine, actor, engine.player), true);
});

test('patrols stay on their real support and cannot tunnel through a thin closed door', async () => {
  const subject = await fixture(), { engine } = subject;
  engine.player.x = 4400;
  engine.platforms = [{ id: 'island', x: 500, y: 930, w: 300, h: 50, floor: true },
    { id: 'other-island', x: 870, y: 930, w: 600, h: 50, floor: true }];
  const actor = enemy(subject, 'enemy-004-drone-big-chap', 630);
  const bounds = enemyPatrolBoundsV130(engine, actor); assert.ok(bounds.right < 800 - actor.w);
  tick(engine, actor, 20, 15);
  assert.ok(actor.x >= 500 && actor.x + actor.w <= 800, 'No patrol falls into the 70px gap');
  engine.doors = [{ x: 710, y: 760, w: 3, h: 170, open: false, progress: 0 }];
  actor.x = 630; actor.spawnX = 630; actor.tacticsV130 = null;
  engine.updateEnemy(actor, 5);
  assert.ok(actor.x + actor.w <= 710 + 1e-5, 'Large delta cannot cross a 3px door');
  assert.equal(actor.alert, false);
});

test('visible contacts progress through suspicion and pursuit; lost sight investigates, searches then patrols', async () => {
  const subject = await fixture(), { engine, events } = subject;
  const actor = enemy(subject, 'enemy-004-drone-big-chap', 650, { facing: -1 });
  engine.updateEnemy(actor, .05); assert.equal(actor.tacticsV130.mode, 'suspicion');
  tick(engine, actor, .35); assert.equal(actor.tacticsV130.mode, 'pursuit');
  engine.walls = [{ x: 380, y: 700, w: 14, h: 230 }];
  const health = engine.player.health;
  tick(engine, actor, .6); assert.equal(actor.tacticsV130.mode, 'investigation');
  tick(engine, actor, 5.2); assert.equal(actor.tacticsV130.mode, 'search');
  engine.player.x = 5000;
  tick(engine, actor, 6.5); assert.equal(actor.tacticsV130.mode, 'patrol');
  assert.equal(engine.player.health, health, 'A hidden actor is never attacked');
  assert.deepEqual([...new Set(events.filter(event => event.type === 'enemy-awareness-v130').map(event => event.state))],
    ['suspicion', 'pursuit', 'investigation', 'search', 'patrol']);
});

test('a real fired shot prompts investigation behind a wall; dry trigger and pause create no noise', async () => {
  const subject = await fixture(), { engine, actor } = subject;
  const contact = enemy(subject, 'enemy-004-drone-big-chap', 650, { facing: 1 });
  engine.walls = [{ x: 400, y: 720, w: 20, h: 210 }];
  actor.fireClock = 0; actor.v52FireClock = 0; actor.ammo = 90;
  assert.equal(engine.fire(actor), true);
  assert.equal(engine.enemyTacticsV130.noises.length, 1);
  engine.updateEnemy(contact, .05); assert.equal(contact.tacticsV130.mode, 'suspicion');
  tick(engine, contact, .45); assert.equal(contact.tacticsV130.mode, 'investigation');
  assert.equal(contact.alert, false, 'Hearing does not grant vision through a wall');
  const count = engine.enemyTacticsV130.noises.length;
  actor.ammo = 0; actor.fireClock = 0; actor.v52FireClock = 0;
  engine.fire(actor); assert.equal(engine.enemyTacticsV130.noises.length, count);
  engine.paused = true; assert.equal(engine.emitEnemyNoiseV130(actor), null);
});

test('humanoids use a narrower view cone and slower recognition than xenomorphs', async () => {
  const subject = await fixture(), { engine } = subject;
  const humanSource = ENEMIES.find(entry => entry.biology === 'human'); assert.ok(humanSource);
  const human = enemy(subject, humanSource.id, 650, { facing: -1 });
  const xeno = enemy(subject, 'enemy-004-drone-big-chap', 650, { facing: -1 });
  engine.updateEnemy(human, .2); engine.updateEnemy(xeno, .2);
  assert.equal(human.tacticsV130.mode, 'suspicion'); assert.equal(xeno.tacticsV130.mode, 'pursuit');
});

test('pause freezes awareness, movement and rear deployment; clocks consume the full supplied delta', async () => {
  const subject = await fixture(), { engine } = subject;
  engine.player.x = 4000;
  const actor = enemy(subject);
  engine.updateEnemy(actor, .1);
  const before = structuredClone(actor.tacticsV130), position = { x: actor.x, y: actor.y };
  engine.paused = true; engine.updateEnemy(actor, 10); engine.update(10);
  assert.deepEqual(actor.tacticsV130, before); assert.equal(distance(position, actor), 0);
  engine.paused = false; engine.updateEnemy(actor, 1);
  assert.ok(actor.tacticsV130.clock >= before.clock + .999);
});

test('rear arrivals telegraph and grow using real sprites while invulnerable, nonattacking and transparent to bullets', async () => {
  const subject = await fixture(), { engine, events, ctx, transforms, stack, draws } = subject;
  engine.rearEntrancesV130 = [{ id: 'qa-rear', x: 660, y: 740, w: 110, h: 190, floorY: 930 }];
  const source = ENEMIES.find(entry => entry.id === 'enemy-004-drone-big-chap');
  const actor = engine.createEnemy(source, 90, 670, 930);
  assert.equal(engine.queueRearEntranceV130(actor, 'qa-rear'), true);
  const originalHealth = actor.health, originalPosition = { x: actor.x, y: actor.y }, playerHealth = engine.player.health;
  const bullet = { x: actor.x - 80, y: actor.y + actor.h / 2, w: 12, h: 4, vx: 1200, vy: 0,
    life: 1, damage: 40, hit: false, remainingPenetration: 0, maxHits: 1 };
  engine.bullets = [bullet]; engine.updateBullets(.2);
  assert.equal(actor.health, originalHealth); assert.equal(bullet.hit, false); assert.ok(bullet.x > actor.x + actor.w);
  assert.equal(engine.applyEnemyDamage(actor, 200), false);
  assert.equal(engine.spawnEnemyProjectile(actor, engine.player), false);
  engine.updateEnemy(actor, .2); assert.equal(actor.rearEntryV130.phase, 'warning');
  const sheets = engine.getVisibleEnemyAtlasSheetsV65([]);
  assert.ok(sheets.length > 0, 'Back-plane sprites join the real atlas loading working set');
  await Promise.all(sheets.map(sheet => engine.ensureEnemyAtlas(sheet)));
  engine.drawRearEntranceEnemyV130(ctx, actor); assert.ok(transforms.some(value => value[0] === 'scale' && value[1] === .32));
  assert.ok(draws.some(draw => draw.source?.includes('/assets/')), 'The silhouette draws a shipped image');
  transforms.length = 0; tick(engine, actor, 1.2); assert.equal(actor.rearEntryV130.phase, 'approach');
  engine.drawRearEntranceEnemyV130(ctx, actor); assert.ok(transforms.some(value => value[0] === 'scale' && value[1] > .32 && value[1] < 1));
  assert.equal(stack.length, 0); assert.equal(engine.player.health, playerHealth);
  for (let step = 0; step < 100 && actor.rearEntryV130.phase !== 'active'; step++) engine.updateEnemy(actor, 1 / 60);
  assert.equal(actor.rearEntryV130.phase, 'active'); assert.equal(actor.dormant, false);
  assert.equal(distance(originalPosition, actor), 0, 'Depth entry does not teleport across the playable plane');
  assert.ok(events.some(event => event.type === 'rear-entrance-warning-v130'));
  assert.ok(events.some(event => event.type === 'rear-entrance-arrived-v130'));
  engine.applyEnemyDamage(actor, 20); assert.ok(actor.health < originalHealth);
});

test('rear arrival waits safely for an occupied or newly obstructed threshold and rejects unsupported exits', async () => {
  const subject = await fixture(), { engine } = subject;
  engine.rearEntrancesV130 = [{ id: 'qa-rear', x: 660, y: 740, w: 110, h: 190, floorY: 930 },
    { id: 'void', x: 660, y: 340, w: 110, h: 190, floorY: 530 }];
  const source = ENEMIES.find(entry => entry.id === 'enemy-004-drone-big-chap');
  assert.equal(engine.queueRearEntranceV130(engine.createEnemy(source, 91, 670, 530), 'void'), false);
  const actor = engine.createEnemy(source, 92, 670, 930);
  assert.equal(engine.queueRearEntranceV130(actor, 'qa-rear'), true);
  engine.player.x = 700; tick(engine, actor, 3);
  assert.equal(actor.rearEntryV130.phase, 'approach'); assert.equal(actor.rearEntryV130.blocked, true); assert.equal(actor.dormant, true);
  engine.player.x = 150; engine.walls = [{ x: actor.x, y: 740, w: actor.w, h: 190 }];
  tick(engine, actor, 1); assert.equal(actor.rearEntryV130.phase, 'approach');
  engine.walls = []; engine.updateEnemy(actor, .05); assert.equal(actor.rearEntryV130.phase, 'active');
  const ordinary = enemy(subject, 'enemy-004-drone-big-chap', 900);
  assert.equal(engine.queueRearEntranceV130(ordinary, 'qa-rear'), false, 'An active actor cannot be teleported into an entrance');
});

test('awareness and a pending rear entry survive a matching production resume without replaying warnings', async () => {
  const subject = await fixture(), { engine, events } = subject;
  engine.rearEntrancesV130 = [{ id: 'qa-rear', x: 660, y: 740, w: 110, h: 190, floorY: 930 }];
  const source = ENEMIES.find(entry => entry.id === 'enemy-004-drone-big-chap');
  const actor = engine.createEnemy(source, 93, 670, 930);
  engine.queueRearEntranceV130(actor, 'qa-rear'); tick(engine, actor, 1.1);
  const saved = engine.captureResumeState(), rearState = { ...actor.rearEntryV130 };
  actor.rearEntryV130.elapsed = 0; actor.rearEntryV130.phase = 'waiting';
  const warnings = events.filter(event => event.type === 'rear-entrance-warning-v130').length;
  const result = engine.applyResumeState(saved); assert.equal(result.applied, true);
  assert.equal(actor.rearEntryV130.phase, rearState.phase); assert.equal(actor.rearEntryV130.elapsed, rearState.elapsed);
  assert.equal(actor.dormant, true); assert.equal(events.filter(event => event.type === 'rear-entrance-warning-v130').length, warnings);
  const bad = structuredClone(saved); bad.enemyTacticsV130.enemies[0].rearEntry.entranceId = 'untrusted-exit';
  engine.applyResumeState(bad); assert.equal(actor.rearEntryV130.entranceId, 'qa-rear');
});

test('frame rates retain state transitions and patrol movement; pursuit has bounded displacement', async () => {
  const a = await fixture(); const actorA = enemy(a, 'enemy-004-drone-big-chap', 650); a.engine.player.x = 5000;
  const b = await fixture(); const actorB = enemy(b, 'enemy-004-drone-big-chap', 650); b.engine.player.x = 5000;
  tick(a.engine, actorA, 1, 30); tick(b.engine, actorB, 1, 120);
  assert.ok(Math.abs(actorA.x - actorB.x) < .0001); assert.equal(actorA.tacticsV130.mode, actorB.tacticsV130.mode);
  const c = await fixture(), runner = enemy(c, 'enemy-006-runner', 500, { facing: -1 });
  c.engine.player.x = 300; tick(c.engine, runner, .3);
  const previous = { x: runner.x, y: runner.y }; c.engine.updateEnemy(runner, 1 / 60);
  assert.ok(distance(previous, runner) <= Math.max(150, runner.speed * 2.8) / 60 + .01);
});

test('a closer hidden player cannot steal the visible coop target from real batch combat', async () => {
  const subject = await fixture(), { engine } = subject;
  engine.player.x = 400;
  Object.assign(engine.coop, { x: 920, y: 838, w: 42, h: 92, alive: true, downed: false, grounded: true });
  engine.coopEnabled = true;
  engine.walls = [{ x: 550, y: 700, w: 20, h: 230 }];
  const actor = enemy(subject, 'enemy-004-drone-big-chap', 650, { facing: 1 });
  tick(engine, actor, .5);
  assert.equal(actor.tacticsV130.mode, 'pursuit'); assert.ok(actor.x > 650);
  assert.equal(actor.facing, 1); assert.equal(engine.player.x, 400, 'The real leader identity remains untouched');
  assert.equal(engine.enemyTargetPerceivedV130(actor, engine.player), false);
  assert.equal(engine.enemyTargetPerceivedV130(actor, engine.coop), true);
});

test('pending rear actors cannot consume melee, sentry, containment, explosion or tool targeting', async () => {
  const subject = await fixture(), { engine } = subject;
  engine.rearEntrancesV130 = [{ id: 'qa-rear', x: 660, y: 740, w: 110, h: 190, floorY: 930 }];
  const source = ENEMIES.find(entry => entry.id === 'enemy-004-drone-big-chap');
  const actor = engine.createEnemy(source, 94, 670, 930);
  engine.queueRearEntranceV130(actor, 'qa-rear');
  engine.player.x = 670;
  const health = actor.health;
  assert.equal(engine.performContextualMelee(engine.player), false);
  assert.equal(engine.closestEnemy(engine.player, 700), null);
  assert.equal(engine.defeatEnemy(actor, engine.player), false);
  assert.equal(engine.enemyMeleePathClearV64(engine.player, actor), false);
  const sentry = { id: 'qa-sentry', kind: 'sentry', x: 660, y: 838, w: 30, h: 60, range: 900, ammo: 5, damage: 50, cooldown: 0 };
  const trap = { id: 'qa-trap', kind: 'cryo-trap', x: 660, y: 820, w: 100, h: 110, armed: true, damage: 50, slow: .3 };
  engine.supportDeployments = [sentry, trap]; engine.updateEquipmentDeployments(.1);
  assert.equal(sentry.ammo, 5); assert.equal(trap.armed, true); assert.equal(actor.health, health);
  assert.ok(!(actor.staggerClock > 0)); assert.equal(actor.attacking, false);
  engine.weaponBallistics = { ...engine.weaponBallistics }; engine.accessibilityRuntime = { ...engine.accessibilityRuntime, aimAssistStrength: 1 };
  const bullet = { x: 500, y: actor.y + actor.h / 2, w: 12, h: 4, vx: 900, vy: 0, life: 1, damage: 50, splash: 200 };
  assert.equal(engine.applyAimAssist(bullet, engine.player), false);
  const active = enemy(subject, 'enemy-004-drone-big-chap', 840);
  bullet.y = active.y + active.h / 2; engine.bullets = [bullet]; engine.updateBullets(.5);
  assert.ok(active.health < active.maxHealth); assert.equal(actor.health, health, 'Nearby active explosion cannot splash into the back plane');
  assert.equal(actor.pendingMelee, false); assert.equal(actor.batchAttackV66, null);
});

test('a production identity mismatch rejects tactics as well as the base resume', async () => {
  const subject = await fixture(), { engine, options } = subject;
  const actor = enemy(subject); engine.updateEnemy(actor, .1);
  const saved = engine.captureResumeState();
  saved.identity.campaignId = 'other-campaign';
  saved.enemyTacticsV130.time = 123; saved.enemyTacticsV130.noiseSerial = 47;
  engine.start({ ...options, resumeState: saved });
  assert.equal(engine.lastResumeResult.applied, false);
  assert.equal(engine.enemyTacticsV130.time, 0); assert.equal(engine.enemyTacticsV130.noiseSerial, 0);
});

test('the final production stack deploys adult contacts into valid rear doors only on standard templates', async () => {
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute']) {
    const subject = await fixture(), { engine, options } = subject;
    const plan = buildMissionLevelV52({ templateId, levelSeeds: LEVEL_SEEDS, world: WORLDS[0], campaign: CAMPAIGNS[0] });
    const catalog = ENEMIES.filter(entry => ['enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner'].includes(entry.id));
    engine.start({ ...options, missionLevel: plan, enemyCatalog: catalog });
    assert.equal(engine.verticalRuntimeV130?.schema, 130);
    const arrivals = engine.enemies.filter(contact => contact.rearEntryV130);
    assert.ok(arrivals.length > 0, `${templateId} must expose actual rear contacts`);
    for (const contact of arrivals) {
      assert.equal(contact.dormant, true);
      const entrance = engine.rearEntrancesV130.find(value => value.id === contact.rearEntryV130.entranceId);
      assert.ok(engine.rearThresholdValidV130(contact, entrance));
    }
    engine.stop();
  }
});

test('the real mission navigator retains an occupied APC as a perceived target without inventing vehicle alive flags', async () => {
  const subject = await fixture(), { engine, options } = subject;
  const plan = buildMissionLevelV52({ templateId: 'ship-interior-vertical', levelSeeds: LEVEL_SEEDS, world: WORLDS[0], campaign: CAMPAIGNS[0] });
  engine.start({ ...options, missionLevel: plan, verticalWorldV130: false });
  for (let n = 0; n < 6; n++) await Promise.resolve();
  engine.enemyAtlasLoadingPausedV65 = false; engine.userCasteLoadingV88 = false;
  const support = engine.platforms.find(platform => platform.id === 'node-platform-ship-cargo');
  assert.ok(support);
  engine.enemies = []; engine.walls = []; engine.covers = []; engine.doors = [];
  const source = ENEMIES.find(entry => entry.id === 'enemy-004-drone-big-chap');
  const contact = engine.createEnemy(source, 97, support.x + 350, support.y);
  contact.facing = -1; engine.enemies.push(contact); engine.initializeEnemyMissionNavigation(contact);
  Object.assign(engine.vehicle, { x: support.x + 70, y: support.y - engine.vehicle.h, active: true, occupied: true,
    driver: engine.player, destroyed: false });
  engine.player.inVehicle = true; engine.player.alive = true; engine.player.downed = false;
  contact.tacticsV130 = { schema: 130, mode: 'pursuit', clock: 0, sight: 1, lost: 0, direction: -1,
    homeX: contact.x, homeY: contact.y, left: support.x, right: support.x + support.w,
    lastKnown: null, targetId: null, lastNoiseId: 0, searchLeg: 0, transitions: 0 };
  assert.equal(engine.vehicle.alive, undefined);
  assert.equal(engine.enemyTargetPerceivedV130(contact, engine.vehicle), true);
  assert.equal(engine.missionLevelEnemyTarget(contact), engine.vehicle);
  const oldX = contact.x; tick(engine, contact, .1); assert.ok(contact.x < oldX, 'Pursuit advances toward the occupied hull');
  engine.player.alive = false;
  assert.equal(engine.enemyTargetPerceivedV130(contact, engine.vehicle), false);
});
