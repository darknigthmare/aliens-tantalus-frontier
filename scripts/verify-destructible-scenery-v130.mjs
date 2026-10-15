import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS, NEURO_XENO_PROFILES } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { buildDestructibleSceneryV130, DESTRUCTIBLE_SCENERY_LIMITS_V130 } from '../src/destructible-scenery-v130.js';

// DOM/RAF/image loading are substituted; gameplay methods and saves use the
// shipped production chain, so removal of its mixin admission fails this suite.
const Engine = ProductionEngine;
const pane = (extra = {}) => ({ id: 'window-1', x: 420, y: 650, w: 16, h: 250, material: 'glass', hp: 32, ...extra });
function fixture({ objects = [pane()], ...extra } = {}) {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const canvas = Object.assign(new EventTarget(), { getContext: () => ({}), focus() { document.activeElement = this; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const emitted = [];
  const engine = new Engine(canvas, { onEvent: event => emitted.push(event) });
  const plan = { ...buildMissionLevelV52({ world: WORLDS[0], campaign: CAMPAIGNS[0], levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' }),
    dimensions: { width: 5200, height: 1080 }, destructibleSceneryV130: objects };
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    equipment: [], crew: [], seed: 426, missionLevel: plan, verticalWorldV130: false, ...extra };
  engine.start(options);
  Object.assign(engine, { platforms: [{ id: 'qa-floor', x: 0, y: 930, w: 5200, h: 150, floor: true }],
    ladders: [], lifts: [], covers: [], doors: [], hazards: [], enemies: [], hostileProjectiles: [], bullets: [] });
  engine.walls = engine.walls.filter(object => object.sceneryV130);
  Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true, facing: 1, operatorId: 'echo-9' });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true, facing: 1, operatorId: 'bravo-2' });
  return { engine, actor: engine.player, options, emitted };
}
const object = (engine, id = 'window-1') => engine.destructibleSceneryV130.objects.find(item => item.id === id);
function enemy(engine, x = 490) {
  const result = engine.createEnemy(ENEMIES.find(entry => entry.id === 'enemy-005-warrior'), 0, x, 930);
  engine.enemies.push(result); return result;
}
function shot(engine, actor = engine.player) {
  actor.fireClock = 0; actor.meleeClock = 0; actor.reloading = false;
  assert.equal(engine.fire(actor), true);
  engine.updateBullets(0.6);
}
function projectile(engine, extra = {}) {
  const value = { x: 100, y: 860, w: 8, h: 5, vx: 900, vy: 0, damage: 18, life: 2, hit: false, ...extra };
  engine.hostileProjectiles.push(value); return value;
}

test('a normal explicit mission extension is admitted while existing QA/editor geometry receives none', () => {
  const { engine } = fixture();
  const state = engine.getSnapshot().destructibleSceneryV130;
  assert.equal(state.ready, true); assert.equal(state.counts.objects, 1);
  assert.equal(engine.walls.filter(item => item.sceneryV130).length, 1);
  engine.configureDestructibleSceneryV130(engine.missionLevelRuntime);
  assert.equal(engine.walls.length, 1, 'Repeated configuration does not duplicate collision objects.');
  engine.walls = []; engine.configureDestructibleSceneryV130(engine.missionLevelRuntime);
  assert.equal(engine.walls.length, 1, 'Geometry rebuilt for the same plan reattaches its surviving colliders.');
  const disabled = fixture({ destructibleSceneryV130: false }).engine;
  assert.equal(disabled.getDestructibleScenerySnapshotV130().ready, false); assert.equal(disabled.walls.length, 0);
  const old = fixture({ objects: [] }).engine;
  assert.equal(old.getDestructibleScenerySnapshotV130().ready, false); assert.equal(old.walls.length, 0);
  old.editorMode = true;
  old.configureDestructibleSceneryV130({ signature: 'editor-foreign', destructibleSceneryV130: [pane()] });
  assert.equal(old.getDestructibleScenerySnapshotV130().counts.objects, 0);
});

test('placements reject duplicate/outside/unsupported/protected objects and keep validated geometry authoritative', () => {
  const entries = buildDestructibleSceneryV130({ dimensions: { width: 2000, height: 1000 }, destructibleSceneryV130: [
    pane(), pane(), pane({ id: 'outside', x: 3000 }), pane({ id: 'secret', material: 'secret' }),
    pane({ id: 'critical', objectiveCritical: true }), pane({ id: 'bearing', loadBearing: true }),
    pane({ id: 'objective', x: 100, y: 100 }), pane({ id: 'negative', w: -1 }),
    pane({ id: 'remote', plane: 'background' }), pane({ id: 'nan', hp: NaN })
  ] }, { protectedObjects: [{ x: 90, y: 90, w: 50, h: 100 }] });
  assert.deepEqual(entries.map(item => item.id), ['window-1', 'remote', 'nan']);
  assert.equal(entries.at(-1).hp, 32);
});

test('a real firearm hits intact glass before a hidden enemy then the broken opening admits the next shot', () => {
  const { engine, actor, emitted } = fixture();
  const target = enemy(engine), health = target.health, ammo = actor.ammo;
  shot(engine); assert.ok(object(engine).hp < 32); assert.equal(target.health, health);
  assert.equal(actor.ammo, ammo - 1); assert.equal(object(engine).impactCount, 1);
  assert.ok(object(engine).lastImpactV130); assert.ok(engine.destructibleSceneryFragmentsV130.length > 0);
  shot(engine); assert.equal(object(engine).destroyed, true); assert.equal(target.health, health);
  assert.equal(engine.walls.some(item => item.id === 'window-1'), false);
  shot(engine); assert.ok(target.health < health);
  assert.equal(emitted.filter(event => event.type === 'scenery-destroyed-v130').length, 1);
});

test('a nearer enemy, closed door, opaque wall or platform consumes the shot before scenery', () => {
  for (const blocker of ['enemy', 'wall', 'door', 'platform']) {
    const { engine } = fixture();
    if (blocker === 'enemy') enemy(engine, 300);
    if (blocker === 'wall') engine.walls.unshift({ id: 'opaque', x: 320, y: 650, w: 30, h: 250 });
    if (blocker === 'door') engine.doors.push({ id: 'closed', x: 320, y: 650, w: 30, h: 250, open: false, progress: 0 });
    if (blocker === 'platform') engine.platforms.push({ x: 320, y: 650, w: 30, h: 250, solid: true });
    shot(engine); assert.equal(object(engine).hp, 32, blocker); assert.equal(object(engine).impactCount, 0);
  }
});

test('a long barrel against glass fires into its near face and cannot spawn the bullet beyond the pane', () => {
  const { engine, actor } = fixture({ objects: [pane({ hp: 500 })] });
  const target = enemy(engine), health = target.health;
  actor.x = 420 - actor.w; engine.keys.add('ShiftLeft'); engine.keys.add('KeyD');
  actor.fireClock = 0; assert.equal(engine.fire(actor), true);
  assert.ok(engine.bullets[0].x < 420, 'Muzzle is constrained on the firing side of the glass.');
  engine.updateBullets(0.6); assert.ok(object(engine).hp < 500); assert.equal(target.health, health);
});

test('explosive splash at an earlier enemy cannot damage a second enemy behind glass or opaque walls', () => {
  for (const material of ['glass', 'panel']) {
    const { engine, actor } = fixture({ objects: [pane({ material })] });
    const direct = enemy(engine, 300), hidden = enemy(engine, 480), directHealth = direct.health, hiddenHealth = hidden.health;
    engine.bullets.push({ x: 220, y: 860, w: 8, h: 5, vx: 900, vy: 0, damage: 50, life: 2, hit: false,
      owner: actor, family: 'explosive', splash: 350, armorBypass: 0, remainingPenetration: 0, maxHits: 1 });
    engine.updateBullets(0.6);
    assert.ok(direct.health < directHealth, material); assert.equal(hidden.health, hiddenHealth, material);
    assert.equal(object(engine).impactCount, 0, 'A blast spent on a nearer enemy is not a direct terrain strike.');
  }
});

test('glass, metal panel and cargo crate collisions stop swept actor/vehicle movement until broken', () => {
  for (const material of ['glass', 'panel', 'crate']) {
    const { engine, actor } = fixture({ objects: [pane({ material })] });
    actor.x = 800; actor.vx = 600; engine.resolveHorizontal(actor, 160);
    assert.equal(actor.x + actor.w, 420, material); assert.equal(actor.vx, 0);
    Object.assign(engine.vehicle, { x: 800, y: 790, vx: 600 }); engine.resolveVehicleHorizontal(160);
    assert.equal(engine.vehicle.x + engine.vehicle.w, 420);
    engine.damageDestructibleSceneryV130('window-1', 500, { owner: actor });
    actor.x = 800; actor.vx = 600; engine.resolveHorizontal(actor, 160); assert.equal(actor.x, 800);
  }
});

test('cargo tops and undersides are solid vertically without adding load-bearing objectives', () => {
  const { engine, actor } = fixture({ objects: [pane({ material: 'crate', x: 420, y: 760, w: 90, h: 140 })] });
  actor.x = 425; actor.y = 780; actor.vy = 500; actor.grounded = false;
  engine.resolveVertical(actor, 700); assert.equal(actor.y + actor.h, 760); assert.equal(actor.grounded, true);
  actor.y = 700; actor.vy = -500; actor.grounded = false;
  engine.resolveVertical(actor, 1000); assert.equal(actor.y, 900); assert.equal(actor.vy, 0);
});

test('dedicated and contextual melee smash only the reachable facing obstacle and spend no ammunition', () => {
  for (const action of ['dedicated', 'contextual']) {
    const { engine, actor } = fixture({ objects: [pane({ x: 220, hp: 40 })] });
    actor.weaponMode = 'sidearm';
    const target = enemy(engine, 258), health = target.health, ammo = actor.ammo;
    assert.equal(action === 'dedicated' ? engine.melee(actor) : engine.fire(actor), true);
    assert.equal(actor.ammo, ammo); assert.equal(actor.shots, 0); assert.equal(object(engine).hp, 18);
    assert.equal(target.health, health); assert.equal(engine.melee(actor), false, 'Cooldown blocks a duplicate strike.');
    actor.fireClock = 0; actor.meleeClock = 0;
    assert.equal(engine.melee(actor), true); assert.equal(object(engine).destroyed, true); assert.equal(target.health, health);
    actor.fireClock = 0; actor.meleeClock = 0; actor.x += 50;
    assert.equal(engine.melee(actor), true); assert.ok(target.health < health);
  }
});

test('a wall before a pane blocks melee; a pane behind or on another plane is not a target', () => {
  for (const setup of ['wall', 'behind', 'background']) {
    const { engine, actor } = fixture({ objects: [pane({ x: setup === 'behind' ? 120 : 240, plane: setup === 'background' ? 'background' : 'gameplay' })] });
    if (setup === 'wall') engine.walls.unshift({ x: 220, y: 650, w: 8, h: 250 });
    assert.equal(engine.melee(actor), false, setup); assert.equal(object(engine).hp, 32);
  }
});

test('Neuro melee breaks a reachable pane and never damages the enemy concealed behind it', () => {
  const profile = NEURO_XENO_PROFILES.find(entry => entry.playerClassCompatible); assert.ok(profile);
  const { engine, actor } = fixture({ objects: [pane({ x: 220, hp: 500 })], neuroProfile: profile });
  const target = enemy(engine, 258), health = target.health, signal = engine.neuro.signal;
  assert.equal(engine.melee(actor), true); assert.ok(object(engine).hp < 500); assert.equal(target.health, health);
  assert.equal(engine.neuro.signal, signal - 4);
});

test('an approaching rear-door enemy cannot steal a reachable scenery strike before joining the gameplay plane', () => {
  const { engine, actor } = fixture({ objects: [pane({ x: 240, hp: 40 })] });
  const target = enemy(engine, 190), health = target.health;
  target.rearEntryV130 = { phase: 'approach' }; target.dormant = true;
  assert.equal(engine.melee(actor), true); assert.ok(object(engine).hp < 40); assert.equal(target.health, health);
  assert.ok(!engine.applyEnemyDamage(target, 100, { owner: actor, kind: 'rifle' })); assert.equal(target.health, health);
});

test('fast hostile fire stops at the first pane and cannot tunnel into a protected marine', () => {
  const { engine, actor } = fixture(); actor.x = 500;
  const health = actor.health, value = projectile(engine);
  engine.updateHostileProjectiles(0.8);
  assert.equal(value.hit, true); assert.equal(value.x + value.w, 420); assert.equal(actor.health, health);
  assert.equal(object(engine).hp, 14); assert.equal(engine.hostileProjectiles.length, 0);
});

test('hostile sweep respects an earlier marine, wall and deployed sentry without hitting hidden glass', () => {
  for (const blocker of ['actor', 'wall', 'placeable']) {
    const { engine, actor } = fixture(); actor.x = blocker === 'actor' ? 260 : 1000; engine.coop.x = 1200;
    const health = actor.health;
    if (blocker === 'wall') engine.walls.unshift({ x: 250, y: 650, w: 30, h: 250 });
    if (blocker === 'placeable') engine.placeablesV86.instances.push({ instanceId: 'fixture-sentry', x: 250, y: 820, w: 70, h: 90,
      onGround: true, health: 80, ammo: 50, status: 'deployed', armed: true });
    const value = projectile(engine); engine.updateHostileProjectiles(0.8);
    assert.equal(value.hit, true, blocker); assert.equal(object(engine).hp, 32, blocker);
    if (blocker === 'actor') assert.ok(actor.health < health || actor.armor < 100);
    if (blocker === 'placeable') assert.equal(engine.placeablesV86.instances[0].health, 62);
  }
});

test('off-plane decoration/source, lifetime expiry and paused input cannot damage scenery', () => {
  const { engine, actor } = fixture({ objects: [pane(), pane({ id: 'background', x: 300, plane: 'background' })] });
  assert.equal(engine.damageDestructibleSceneryV130('background', 500, { owner: actor }), 0);
  assert.equal(engine.damageDestructibleSceneryV130('window-1', 500, { plane: 'background' }), 0);
  engine.bullets.push({ x: 200, y: 860, w: 8, h: 5, vx: 900, vy: 0, damage: 100, life: 0.01, hit: false, owner: actor });
  engine.updateBullets(1); assert.equal(object(engine).hp, 32);
  engine.paused = true; projectile(engine); const before = engine.hostileProjectiles[0].x;
  engine.updateHostileProjectiles(1); assert.equal(engine.hostileProjectiles[0].x, before);
  assert.equal(engine.melee(actor), false); assert.equal(engine.fire(actor), false);
  assert.equal(engine.damageDestructibleSceneryV130('window-1', 500, { owner: actor }), 0);
});

test('fragment pools remain bounded and paused/focus-loading scenes freeze effects', () => {
  const objects = Array.from({ length: 20 }, (_, i) => pane({ id: `window-${i}`, x: 420 + i * 30, hp: 1 }));
  const { engine, actor } = fixture({ objects });
  for (const item of objects) engine.damageDestructibleSceneryV130(item.id, 1, { owner: actor });
  assert.equal(engine.destructibleSceneryFragmentsV130.length, DESTRUCTIBLE_SCENERY_LIMITS_V130.fragments);
  const before = structuredClone(engine.destructibleSceneryFragmentsV130);
  engine.paused = true; engine.advanceDestructibleSceneryV130(10); assert.deepEqual(engine.destructibleSceneryFragmentsV130, before);
  engine.paused = false; engine.enemyAtlasLoadingPausedV65 = true; engine.advanceDestructibleSceneryV130(10);
  assert.deepEqual(engine.destructibleSceneryFragmentsV130, before); engine.enemyAtlasLoadingPausedV65 = false;
  for (let i = 0; i < 25; i++) engine.advanceDestructibleSceneryV130(0.1);
  assert.equal(engine.destructibleSceneryFragmentsV130.length, 0);
});

test('damaged and broken decorations survive a real resume and a checkpoint restart without duplicate rewards', () => {
  const objects = [pane(), pane({ id: 'cargo-1', x: 600, material: 'crate', hp: 52, w: 90, h: 80, y: 850 })];
  const { engine, actor, options, emitted } = fixture({ objects });
  const inventory = { ...engine.inventory };
  engine.damageDestructibleSceneryV130('window-1', 500, { owner: actor });
  engine.damageDestructibleSceneryV130('cargo-1', 12, { owner: actor });
  const state = engine.captureResumeState(); assert.equal(state.destructibleSceneryV130.schema, 130);
  assert.equal(engine.damageDestructibleSceneryV130('window-1', 500, { owner: actor }), 0);
  assert.deepEqual(engine.inventory, inventory); assert.equal(emitted.filter(event => event.type === 'scenery-destroyed-v130').length, 1);
  const restored = fixture({ ...options, objects, resumeState: state }).engine;
  assert.equal(restored.lastResumeResult.applied, true);
  assert.equal(object(restored).destroyed, true); assert.equal(object(restored, 'cargo-1').hp, 40);
  assert.equal(restored.walls.some(item => item.id === 'window-1'), false); assert.equal(restored.walls.filter(item => item.id === 'cargo-1').length, 1);
  assert.equal(restored.destructibleSceneryFragmentsV130.length, 0);
  const savedObject = object(restored, 'cargo-1');
  restored.failMission('fixture'); assert.equal(restored.restartFromCheckpoint(), true);
  assert.equal(object(restored).destroyed, true); assert.equal(savedObject.hp, 40);
  assert.equal(restored.walls.filter(item => item.id === 'cargo-1').length, 1);
});

test('foreign/rejected resume and injected save geometry cannot replace level objects', () => {
  const { engine, actor } = fixture();
  const raw = engine.captureResumeState();
  const malformed = structuredClone(raw);
  malformed.destructibleSceneryV130.objects[0] = { id: 'window-1', hp: 8, x: 4000, material: 'crate' };
  assert.equal(engine.applyResumeState(malformed).applied, true);
  assert.equal(object(engine).hp, 8); assert.equal(object(engine).x, 420); assert.equal(object(engine).material, 'glass');
  const foreign = structuredClone(raw); foreign.destructibleSceneryV130.signature = 'other-level';
  assert.equal(engine.applyResumeState(foreign).destructibleSceneryRestoredV130, false); assert.equal(object(engine).hp, 8);
  const rejected = structuredClone(raw); rejected.schema = -1;
  const result = engine.applyResumeState(rejected); assert.equal(result.applied, false); assert.equal(object(engine).hp, 8);
  engine.damageDestructibleSceneryV130('window-1', 10, { owner: actor });
  assert.equal(engine.applyResumeState(raw).applied, true); assert.equal(object(engine).hp, 32);
  assert.equal(engine.walls.filter(item => item.id === 'window-1').length, 1);
});

test('window drawing remains transparent and impact/crack/broken-frame rendering uses finite canvas primitives', () => {
  const { engine, actor } = fixture();
  const paints = [];
  const ctx = { globalAlpha: 1, fillStyle: '', strokeStyle: '', lineWidth: 1,
    save() {}, restore() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    strokeRect(...args) { assert.ok(args.every(Number.isFinite)); },
    fillRect(...args) { assert.ok(args.every(Number.isFinite)); paints.push({ style: this.fillStyle, args }); } };
  engine.drawWall(ctx, object(engine)); assert.ok(paints.some(paint => paint.style === 'rgba(105,190,202,0.19)'));
  engine.damageDestructibleSceneryV130('window-1', 1, { owner: actor }); engine.drawWall(ctx, object(engine));
  engine.damageDestructibleSceneryV130('window-1', 100, { owner: actor }); engine.drawWall(ctx, object(engine));
  assert.ok(paints.some(paint => paint.style === 'rgba(159,209,211,0.45)'));
});
