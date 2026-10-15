import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { withVerticalWorldV130, verticalLayerOffsetV130 } from '../src/vertical-world-v130.js';
import { buildVerticalMissionV130 } from '../src/vertical-levels-v130.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';

const GameEngine = typeof ProductionEngine.prototype.getVerticalWorldSnapshotV130 === 'function'
  ? ProductionEngine : withVerticalWorldV130(ProductionEngine);
const CONTROLS = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' };
const COOP = { left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' };

function makeEngine(templateId = 'ship-interior-vertical', overrides = {}) {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const canvas = Object.assign(new EventTarget(), { getContext: () => ({}), focus() { document.activeElement = this; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const level = buildMissionLevelV52({ templateId, levelSeeds: LEVEL_SEEDS, world: WORLDS[0], campaign: CAMPAIGNS[0] });
  const emitted = [], engine = new GameEngine(canvas, { onEvent: event => emitted.push(event) });
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    equipment: [], crew: [], seed: 426, missionLevel: level, ...overrides };
  engine.start(options);
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false });
    events.dispatchEvent(event);
  };
  return { engine, level, key, emitted, options };
}

function tickMotion(engine, seconds, rate = 60, actors = [engine.player]) {
  let remaining = seconds;
  while (remaining > 1e-9) {
    const delta = Math.min(1 / rate, remaining);
    engine.animationTime += delta;
    engine.updateLifts(delta);
    for (const actor of actors) engine.updatePlayer(actor, delta, actor.coop ? COOP : CONTROLS);
    remaining -= delta;
  }
}

function boardFromSpawn(engine, key) {
  engine.enemies = []; engine.hazards = [];
  const lift = engine.lifts[0];
  key('keydown', 'KeyD');
  for (let frame = 0; frame < 240 && engine.player.x + engine.player.w / 2 < lift.x + lift.w / 2; frame++) tickMotion(engine, 1 / 60);
  key('keyup', 'KeyD'); tickMotion(engine, 0.3);
  assert.ok(engine.player.x >= lift.x && engine.player.x + engine.player.w <= lift.x + lift.w, 'Spawn must connect to the lift by actual walking.');
  assert.ok(Math.abs(engine.player.y + engine.player.h - lift.y) < 0.001);
  return lift;
}

test('normal ship and colony plans provide three connected elevations without mutating the original plan', () => {
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute']) {
    const { engine, level } = makeEngine(templateId);
    const snapshot = engine.getVerticalWorldSnapshotV130();
    assert.equal(snapshot.active, true); assert.equal(snapshot.elevations.length, 3);
    assert.ok(snapshot.verticalSpan >= 700); assert.ok(snapshot.cameraTravel >= 360);
    assert.equal(snapshot.lifts.length, 2); assert.ok(snapshot.lifts.every(lift => lift.stops.length === 3));
    assert.ok(Object.values(snapshot.readiness).every(Boolean), JSON.stringify(snapshot.readiness));
    assert.ok(engine.ladders.some(ladder => ladder.id.includes('service-ladder')));
    assert.equal(level.verticalWorldV130, undefined); assert.ok(level.dimensions.height < 700);
    assert.ok(engine.missionLevelRuntime.validation.verticalWorldV130.valid);
    assert.ok(snapshot.rearEntrances.every(entry => engine.platforms.some(surface => entry.x >= surface.x
      && entry.x + entry.w <= surface.x + surface.w && surface.y === entry.floorY)));
    assert.ok(engine.missionLevelRuntime.destructibleSceneryV130.every(item => item.plane === 'gameplay'));
    engine.stop();
  }
});

test('small special, QA, editor and explicitly disabled levels retain their authored geometry', () => {
  const { level, engine } = makeEngine(); engine.stop();
  assert.equal(buildVerticalMissionV130({ ...level, signature: `${level.signature}:archive-relay-v122`, dimensions: { width: 1800, height: 620 } }).verticalWorldV130, undefined);
  assert.equal(buildVerticalMissionV130(level, { qaMode: true }), level);
  assert.equal(buildVerticalMissionV130(level, { editorProject: { kind: 'mission' } }), level);
  assert.equal(buildVerticalMissionV130(level, { verticalWorldV130: false }), level);
  const disabled = makeEngine('ship-interior-vertical', { verticalWorldV130: false }).engine;
  assert.equal(disabled.getVerticalWorldSnapshotV130().active, false); assert.equal(disabled.missionLevelBounds.height, level.dimensions.height);
  disabled.stop();
});

test('E boards from the spawn route, stops at the middle floor, then reaches the upper route without a position injection', () => {
  const { engine, key, emitted } = makeEngine();
  const lift = boardFromSpawn(engine, key), initialY = engine.player.y;
  key('keydown', 'KeyE'); key('keyup', 'KeyE');
  assert.equal(lift.stateV130, 'moving'); assert.equal(lift.targetYV130, lift.stops[1].y);
  tickMotion(engine, 1 / 60);
  assert.ok(engine.player.y < initialY && engine.player.y >= initialY - lift.speedV130 / 60 - 0.01);
  tickMotion(engine, 3); assert.equal(lift.y, lift.stops[1].y);
  assert.ok(Math.abs(engine.player.y + engine.player.h - lift.y) < 0.001);
  assert.equal(lift.stateV130, 'idle');
  key('keydown', 'KeyW'); tickMotion(engine, 1 / 60); key('keyup', 'KeyW');
  assert.equal(lift.targetYV130, lift.stops[0].y);
  tickMotion(engine, 3); assert.equal(lift.y, lift.stops[0].y);
  key('keydown', 'KeyD'); tickMotion(engine, 1); key('keyup', 'KeyD'); tickMotion(engine, 0.3);
  assert.ok(engine.player.x > lift.x + lift.w); assert.equal(engine.player.y + engine.player.h, lift.stops[0].y);
  assert.equal(engine.player.grounded, true); assert.ok(emitted.filter(event => event.type === 'lift-arrived-v130').length >= 2);
  engine.stop();
});

test('J1, J2, an ally and a grounded enemy travel by the same platform displacement at 30, 60 and 144 Hz', () => {
  for (const rate of [30, 60, 144]) {
    const { engine } = makeEngine(); engine.enemies = []; engine.hazards = []; engine.setCoop(true);
    const lift = engine.lifts[0];
    Object.assign(engine.player, { x: lift.x + 9, y: lift.y - engine.player.h, vy: 0, grounded: true });
    Object.assign(engine.coop, { x: lift.x + 55, y: lift.y - engine.coop.h, vy: 0, grounded: true });
    const enemy = { id: 'lift-passenger', x: lift.x + 104, y: lift.y - 56, w: 30, h: 56, alive: true, vy: 0 };
    const ally = { id: 'lift-ally', x: lift.x + 28, y: lift.y - 56, w: 30, h: 56, alive: true, vy: 0, squadMember: true };
    engine.enemies.push(enemy); engine.squadActors = [ally];
    const origins = [engine.player, engine.coop, enemy, ally].map(actor => actor.y);
    assert.equal(engine.commandLiftV130(engine.player, -1), true);
    tickMotion(engine, 1, rate, [engine.player, engine.coop]);
    const displacement = lift.y - lift.baseY;
    assert.ok(Math.abs(displacement + 142) < 0.0001, `${rate} Hz: ${displacement}`);
    [engine.player, engine.coop, enemy, ally].forEach((actor, index) => assert.ok(Math.abs(actor.y - origins[index] - displacement) < 0.0001));
    engine.stop();
  }
});

test('the lift and its passengers stop at a solid ceiling and resume once it is removed', () => {
  const { engine } = makeEngine(); engine.enemies = []; engine.hazards = [];
  const lift = engine.lifts[0];
  Object.assign(engine.player, { x: lift.x + 40, y: lift.y - engine.player.h, vy: 0, grounded: true });
  const ceiling = { id: 'solid-ceiling', x: lift.x, y: 650, w: lift.w, h: 24 };
  engine.walls.push(ceiling); engine.commandLiftV130(engine.player, -1);
  tickMotion(engine, 3);
  assert.equal(lift.stateV130, 'blocked'); assert.equal(lift.blockedByV130, ceiling.id);
  assert.ok(engine.player.y >= ceiling.y + ceiling.h - 0.001);
  assert.ok(engine.player.y + engine.player.h > lift.stops[1].y);
  const previousY = engine.player.y; tickMotion(engine, 0.2); assert.equal(engine.player.y, previousY);
  engine.walls = []; tickMotion(engine, 3); assert.equal(lift.y, lift.stops[1].y);
  engine.stop();
});

test('a closed door blocking the platform sweep is respected even during a large delta', () => {
  const { engine } = makeEngine(); engine.enemies = []; engine.hazards = [];
  const lift = engine.lifts[0];
  engine.doors = [{ id: 'shaft-gate', x: lift.x, y: 710, w: lift.w, h: 40, progress: 0, open: false }];
  engine.requestLiftV130(lift, lift.topY); engine.updateLifts(5);
  assert.equal(lift.stateV130, 'blocked'); assert.ok(lift.y >= 750);
  engine.stop();
});

test('local coop has independent Up/Down lift input and held keys do not skip floors', () => {
  const { engine, key } = makeEngine(); engine.enemies = []; engine.hazards = []; engine.setCoop(true);
  const lift = engine.lifts[0];
  Object.assign(engine.coop, { x: lift.x + 30, y: lift.y - engine.coop.h, grounded: true });
  key('keydown', 'KeyI'); tickMotion(engine, 4, 60, [engine.coop]);
  assert.equal(lift.y, lift.stops[1].y); assert.equal(lift.stateV130, 'idle');
  key('keyup', 'KeyI'); tickMotion(engine, 1 / 60, 60, [engine.coop]);
  key('keydown', 'KeyI'); tickMotion(engine, 3, 60, [engine.coop]); key('keyup', 'KeyI');
  assert.equal(lift.y, lift.topY); engine.stop();
});

test('service ladders reach an upper landing using continuous player physics', () => {
  const { engine, key } = makeEngine(); engine.enemies = []; engine.hazards = [];
  const lift = engine.lifts[0], ladder = engine.ladders.find(entry => entry.id === `${lift.id}:service-ladder:1`);
  Object.assign(engine.player, { x: ladder.x - engine.player.w / 2, y: ladder.bottom - engine.player.h, vy: 0, grounded: true });
  key('keydown', 'KeyW');
  for (let frame = 0; frame < 180 && engine.player.y + engine.player.h > ladder.top + 0.01; frame++) tickMotion(engine, 1 / 60);
  key('keyup', 'KeyW'); tickMotion(engine, 0.2);
  assert.equal(engine.player.y + engine.player.h, ladder.top); assert.equal(engine.player.grounded, true);
  engine.stop();
});

test('camera and all three bitmap depth layers react to elevation with bounded foreground opacity', () => {
  const { engine, key } = makeEngine();
  const lift = boardFromSpawn(engine, key);
  const initial = engine.camera.y;
  engine.commandLiftV130(engine.player, -1);
  for (let frame = 0; frame < 180; frame++) engine.update(1 / 60);
  engine.commandLiftV130(engine.player, -1);
  for (let frame = 0; frame < 180; frame++) engine.update(1 / 60);
  assert.equal(lift.y, lift.topY); assert.ok(Math.abs(engine.camera.y - initial) > 100);
  engine.camera.y = 180;
  const snapshot = engine.getVerticalWorldSnapshotV130();
  assert.ok(snapshot.parallax[0].y > snapshot.parallax[1].y && snapshot.parallax[1].y > snapshot.parallax[2].y);
  const draws = [], alphas = [], ctx = { save() {}, restore() {}, drawImage(...args) { draws.push(args); },
    set globalAlpha(value) { alphas.push(value); } };
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 512 };
  engine.drawMissionLevelCover(ctx, image, 1.12, 0.9, 1, 0, { repeat: true });
  assert.ok(draws.length > 0); assert.ok(alphas.every(alpha => alpha <= 0.14));
  assert.ok(draws.every(draw => draw[2] <= 0 && draw[2] + draw[4] >= 720));
  assert.ok(verticalLayerOffsetV130(-200, 0.32).y === 0);
  engine.stop();
});

test('the upper deck remains below the HUD with a smooth camera and complete parallax coverage, including pauses', () => {
  const { engine, key } = makeEngine();
  const lift = boardFromSpawn(engine, key);
  const ascend = () => {
    assert.equal(engine.commandLiftV130(engine.player, -1), true);
    let previousCamera = engine.camera.y;
    for (let frame = 0; frame < 180; frame++) {
      engine.update(1 / 60);
      assert.ok(Math.abs(engine.camera.y - previousCamera) < 8, 'Camera transitions must remain smooth while the cabin moves.');
      assert.ok(engine.camera.y >= -200 && engine.camera.y <= engine.missionLevelBounds.height - 720);
      previousCamera = engine.camera.y;
    }
  };
  ascend(); ascend();
  assert.equal(lift.y, lift.topY);
  assert.ok(engine.camera.y < -140, `Upper framing must allow negative camera Y: ${engine.camera.y}`);
  assert.ok(engine.player.y - engine.camera.y >= 190, `Operator head must clear the HUD: ${engine.player.y - engine.camera.y}`);
  const snapshot = engine.getVerticalWorldSnapshotV130();
  assert.equal(snapshot.cameraMinY, -200); assert.equal(snapshot.cameraMaxY, 380);
  assert.equal(snapshot.playerScreenTop, engine.player.y - engine.camera.y);
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 512 }, draws = [];
  const ctx = { save() {}, restore() {}, drawImage(...args) { draws.push(args); }, globalAlpha: 1 };
  for (const cameraY of [-200, -120, 0, 380]) {
    engine.camera.y = cameraY;
    for (const [factor, overscan, yOffset] of [[0.075, 1.08, 0], [0.32, 1.08, 22], [1.12, 1, 0]]) {
      draws.length = 0;
      engine.drawMissionLevelCover(ctx, image, factor, 0.5, overscan, yOffset, { repeat: true });
      assert.ok(draws.length > 0 && draws.every(draw => draw[2] <= 0 && draw[2] + draw[4] >= 720),
        `${factor} layer must cover the viewport at camera Y ${cameraY}.`);
    }
  }
  engine.camera.y = -190;
  for (const reason of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    const cameraY = engine.camera.y, actorY = engine.player.y;
    engine[reason] = true; engine.update(0.3);
    assert.equal(engine.camera.y, cameraY, `${reason} must preserve negative camera headroom.`);
    assert.equal(engine.player.y, actorY); engine[reason] = false;
  }
  engine.stop();
});

test('checkpoint resume preserves a lift in motion and rejects foreign mission state atomically', () => {
  const fixture = makeEngine(), { engine, key } = fixture;
  const lift = boardFromSpawn(engine, key); engine.commandLiftV130(engine.player, -1); tickMotion(engine, 0.7);
  const saved = engine.captureResumeState(), expectedY = lift.y;
  const result = engine.applyResumeState(saved);
  assert.equal(result.applied, true); assert.equal(lift.y, expectedY);
  assert.ok(Math.abs(engine.player.y + engine.player.h - lift.y) < 0.001);
  tickMotion(engine, 0.1); assert.ok(lift.y < expectedY);
  const before = lift.y;
  const rejected = engine.applyResumeState({ ...saved, identity: { ...saved.identity, seed: 999 },
    verticalWorldV130: { ...saved.verticalWorldV130, lifts: [{ ...saved.verticalWorldV130.lifts[0], y: lift.baseY }] } });
  assert.equal(rejected.applied, false); assert.equal(lift.y, before);
  engine.stop();
});

test('a lift command cannot replace a medical action, but an already moving cabin still carries an incapacitated operator', () => {
  const { engine, key } = makeEngine();
  const lift = boardFromSpawn(engine, key);
  engine.player.health = 20;
  const kits = engine.inventory.medkits;
  assert.equal(engine.useMedkit(engine.player), true);
  assert.equal(engine.commandLiftV130(engine.player, -1), false);
  key('keydown', 'KeyW'); tickMotion(engine, 1 / 60); key('keyup', 'KeyW');
  assert.equal(lift.stateV130, 'idle'); assert.equal(engine.inventory.medkits, kits);
  engine.cancelFieldActionV124(engine.player, 'test');
  engine.player.toolUseClock = engine.player.interactionClock = 0;
  assert.equal(engine.commandLiftV130(engine.player, -1), true);
  Object.assign(engine.player, { alive: false, downed: false, health: 0 });
  tickMotion(engine, 0.4);
  assert.ok(Math.abs(engine.player.y + engine.player.h - lift.y) < 0.001);
  engine.stop();
});

test('paused and loading simulation freezes lift motion and camera together', () => {
  const { engine, key } = makeEngine();
  const lift = boardFromSpawn(engine, key); engine.commandLiftV130(engine.player, -1);
  for (const reason of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    const y = lift.y, cameraY = engine.camera.y;
    engine[reason] = true; engine.updateLifts(0.3); engine.update(0.3);
    assert.equal(lift.y, y, reason); assert.equal(engine.camera.y, cameraY, reason);
    engine[reason] = false;
  }
  engine.stop();
});

test('legacy saves preserve grounded checkpoints, jump height and suspended drops while keeping resources', () => {
  const { engine } = makeEngine();
  const current = engine.captureResumeState();
  const legacy = { ...current, player: { ...current.player, x: 1000, y: 308, health: 20, ammo: 4 },
    checkpoint: { ...current.checkpoint, x: 180, y: 378 },
    drops: [{ id: `ammo-${engine.enemies[0].id}`, type: 'ammo', amount: 12, x: 1000, y: 430, taken: false }] };
  delete legacy.verticalWorldV130;
  const migrated = engine.migrateVerticalResumeV130(legacy);
  assert.equal(migrated.player.y, 706); assert.equal(migrated.checkpoint.y, 776); assert.equal(migrated.drops[0].y, 828);
  assert.equal(engine.migrateVerticalResumeV130(migrated), migrated);
  const result = engine.applyResumeState(legacy);
  assert.equal(result.applied, true); assert.equal(engine.player.y, 706);
  assert.equal(engine.checkpoint.y, 776); assert.equal(engine.player.health, 20); assert.equal(engine.player.ammo, 4);
  assert.equal(engine.drops[0].y, 828); assert.equal(legacy.player.y, 308);
  engine.stop();
});

test('a ship save cannot mutate an active colony session or a fresh colony start with the same base identity', () => {
  const ship = makeEngine('ship-interior-vertical').engine;
  const foreign = ship.captureResumeState();
  foreign.player = { ...foreign.player, x: 1500, y: 300, health: 1, ammo: 1 };
  foreign.mission = { ...foreign.mission, elapsed: 600 };
  ship.stop();
  const colony = makeEngine('colony-multiroute').engine;
  assert.deepEqual(colony.captureResumeState().identity, foreign.identity);
  const capture = engine => ({ x: engine.player.x, y: engine.player.y, health: engine.player.health, ammo: engine.player.ammo,
    checkpoint: { ...engine.checkpoint }, elapsed: engine.mission.elapsed,
    lifts: engine.lifts.map(lift => ({ id: lift.id, y: lift.y, target: lift.targetYV130, state: lift.stateV130 })),
    missionLevel: engine.captureResumeState().missionLevel });
  const before = capture(colony);
  const active = colony.applyResumeState(foreign);
  assert.equal(active.applied, false); assert.equal(active.reason, 'level-signature-mismatch');
  assert.deepEqual(capture(colony), before);
  const resumed = makeEngine('colony-multiroute', { resumeState: foreign }).engine;
  assert.equal(resumed.lastResumeResult.applied, false);
  assert.equal(resumed.lastResumeResult.reason, 'level-signature-mismatch');
  assert.deepEqual(capture(resumed), before);
  resumed.stop(); colony.stop();
});

test('an enemy calls the cabin to the middle floor, rides to the top, and walks out onto a real landing', () => {
  const { engine, emitted } = makeEngine(); engine.enemies = []; engine.hazards = [];
  const lift = engine.lifts[0], middle = lift.stops[1].y;
  const enemy = engine.createEnemy(ENEMIES[3], 99, lift.x - 100, middle, { boss: false, keyCarrier: false });
  enemy.x = lift.x - enemy.w - 24; enemy.vy = 0; enemy.alive = true; enemy.dormant = false;
  engine.enemies.push(enemy); engine.initializeEnemyMissionNavigation(enemy);
  Object.assign(enemy.levelNavigation, { mode: 'lift', connectorId: lift.id, destinationY: lift.topY, riding: false });
  const target = { x: lift.x + lift.w + 90, y: lift.topY - 92, w: 42, h: 92, alive: true };
  let travelled = 0, previous = { x: enemy.x, y: enemy.y };
  for (let frame = 0; frame < 1200 && enemy.levelNavigation.mode === 'lift'; frame++) {
    engine.updateLifts(1 / 60);
    const surface = engine.missionLevelSurfaceFor(enemy, { tolerance: 12 });
    const destination = engine.missionLevelSurfaceFor(target, { tolerance: 12 });
    engine.advanceEnemyMissionNavigation(enemy, target, surface, destination, 1 / 60);
    assert.ok(Math.abs(enemy.y - previous.y) <= lift.speedV130 / 60 + 0.01,
      `Vertical navigation must carry rather than jump: frame ${frame}, ${previous.y} -> ${enemy.y}, lift ${lift.y}.`);
    assert.ok(Math.abs(enemy.x - previous.x) <= 8, 'Boarding and exit must preserve continuous horizontal motion.');
    travelled += Math.abs(enemy.y - previous.y); previous = { x: enemy.x, y: enemy.y };
  }
  assert.equal(enemy.levelNavigation.mode, 'surface'); assert.equal(enemy.levelNavigation.riding, false);
  assert.equal(enemy.y + enemy.h, lift.topY); assert.ok(travelled >= middle - lift.topY - 0.01);
  assert.ok(engine.missionLevelSurfaceFor(enemy, { tolerance: 1, includeLifts: false }));
  assert.ok(emitted.filter(event => event.type === 'lift-called-v130' && event.source === 'enemy').length >= 2);
  engine.stop();
});
