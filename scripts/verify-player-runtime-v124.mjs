import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, EQUIPMENT, NEURO_XENO_PROFILES } from '../src/content.js';
import { getPlayerAimGuideV124 } from '../src/player-control-v124.js';
import { firstProjectileObstacleV83 } from '../src/projectile-collision-v83.js';
import { BioforgeRuntimeV80 } from '../src/bioforge-runtime-v80.js';
import { MISSION_VENT_NETWORKS_V62 } from '../src/vent-network-v62.js';

// These integration tests run the actual production inheritance chain, collision
// methods and input listeners. Only DOM, images and RAF are host substitutes;
// they do not claim to validate raster art or a real browser/gamepad device.
const PLAYER_CONTROLS = Object.freeze({ left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' });
const COOP_CONTROLS = Object.freeze({ left: 'KeyJ', right: 'KeyL', up: 'KeyI', down: 'KeyK', jump: 'KeyU', fire: 'KeyO' });

function makeEngine(options = {}) {
  const windowEvents = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  const captured = new Set();
  const canvas = Object.assign(new EventTarget(), {
    getContext: () => ({}),
    focus() { document.activeElement = this; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    setPointerCapture(id) { captured.add(id); },
    hasPointerCapture(id) { return captured.has(id); },
    releasePointerCapture(id) { captured.delete(id); }
  });
  const events = [];
  const engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
  const startOptions = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    equipment: [], crew: [], seed: 426, ...options };
  engine.start(startOptions);
  Object.assign(engine, {
    platforms: [{ x: -200, y: 930, w: 6800, h: 200, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [],
    missionLevelRuntime: null
  });
  Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'echo-9' });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'bravo-2' });
  const key = (type, code, extra = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false, ...extra });
    windowEvents.dispatchEvent(event);
    return event;
  };
  const pointer = (type, extra = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1, clientX: 600, clientY: 360, ...extra });
    canvas.dispatchEvent(event);
    return event;
  };
  return { engine, actor: engine.player, canvas, events, windowEvents, key, pointer, startOptions };
}

function tickActor(engine, seconds, rate = 60, actor = engine.player) {
  const step = 1 / rate;
  let remaining = seconds;
  while (remaining > 1e-10) {
    const delta = Math.min(step, remaining);
    engine.animationTime += delta;
    engine.updatePlayer(actor, delta, actor.coop ? COOP_CONTROLS : PLAYER_CONTROLS);
    remaining -= delta;
  }
}

function tickWithEquipment(engine, seconds, rate = 60) {
  let remaining = seconds;
  while (remaining > 1e-10) {
    const delta = Math.min(1 / rate, remaining);
    tickActor(engine, delta, rate);
    engine.updateEquipmentDeployments(delta);
    remaining -= delta;
  }
}

function pad(axes = [0, 0, 0, 0], held = []) {
  return { connected: true, mapping: 'standard', index: 0, id: 'regression-standard-pad', axes,
    buttons: Array.from({ length: 17 }, (_, index) => ({ pressed: held.includes(index), value: held.includes(index) ? 1 : 0 })) };
}

function coverFixture() {
  const fixture = makeEngine();
  fixture.engine.covers = [{ id: 'cargo', x: 202, y: 872, w: 96, h: 58, health: 100, destroyed: false }];
  fixture.key('keydown', 'KeyS');
  tickActor(fixture.engine, 0.05);
  return fixture;
}

function makeBioforge() {
  const fixture = makeEngine();
  fixture.engine.stop();
  const engine = new BioforgeRuntimeV80(fixture.canvas, { autoLoop: false });
  const started = engine.start({ profileId: 'enemy-004-drone-big-chap', quantity: 1, autoLoop: false });
  assert.equal(started.started, true);
  return { ...fixture, engine, actor: engine.player };
}

test('held jump produces one impulse; releasing and pressing again produces another', () => {
  const { engine, actor, key } = makeEngine();
  key('keydown', 'Space');
  let impulses = 0, previousVelocity = actor.vy;
  for (let frame = 0; frame < 180; frame++) {
    tickActor(engine, 1 / 60);
    if (actor.vy < 0 && previousVelocity >= 0) impulses++;
    previousVelocity = actor.vy;
  }
  assert.equal(impulses, 1, 'A held Space must not launch again after landing.');
  assert.equal(actor.grounded, true);
  key('keyup', 'Space'); key('keydown', 'Space'); tickActor(engine, 1 / 60);
  assert.ok(actor.vy < 0, 'A new press must still jump.');
});

test('buffered jump survives until a nearby landing, then is consumed once', () => {
  const { engine, actor, key } = makeEngine();
  Object.assign(actor, { y: 810, vy: 300, grounded: false, coyoteTime: 0 });
  key('keydown', 'Space'); key('keyup', 'Space');
  let impulses = 0, previousVelocity = actor.vy;
  for (let frame = 0; frame < 100; frame++) {
    tickActor(engine, 1 / 60);
    if (actor.vy < 0 && previousVelocity >= 0) impulses++;
    previousVelocity = actor.vy;
  }
  assert.equal(impulses, 1, 'The landing buffer must cause exactly one jump.');
  assert.equal(actor.grounded, true);
});

test('coyote time permits a late edge jump but not an indefinite air jump', () => {
  for (const [delay, expected] of [[0.05, true], [0.2, false]]) {
    const { engine, actor, key } = makeEngine();
    engine.platforms = [];
    tickActor(engine, delay);
    key('keydown', 'Space'); tickActor(engine, 1 / 60);
    assert.equal(actor.vy < 0, expected, `Unexpected coyote behavior after ${delay}s.`);
  }
});

test('local coop has an independent jump edge and cannot retrigger while held', () => {
  const { engine, key } = makeEngine();
  engine.setCoop(true); key('keydown', 'KeyU');
  let impulses = 0, previousVelocity = engine.coop.vy;
  for (let frame = 0; frame < 180; frame++) {
    tickActor(engine, 1 / 60, 60, engine.coop);
    if (engine.coop.vy < 0 && previousVelocity >= 0) impulses++;
    previousVelocity = engine.coop.vy;
  }
  assert.equal(impulses, 1);
  assert.equal(engine.player.y, 838);
});

test('costume movement stays stable at 30, 60 and 144 Hz', () => {
  for (const mobility of [0.72, 1, 1.18]) {
    const distances = [];
    for (const rate of [30, 60, 144]) {
      const { engine, actor, key } = makeEngine();
      engine.costumeRuntime = { ...engine.costumeRuntime, mobility };
      key('keydown', 'KeyD'); tickActor(engine, 1, rate);
      distances.push(actor.x - 160);
      assert.ok(Number.isFinite(actor.vx) && Math.abs(actor.vx) < 400, `Unbounded velocity with mobility ${mobility} at ${rate}Hz.`);
    }
    assert.ok(Math.max(...distances) - Math.min(...distances) < 1, `Frame-dependent distance for mobility ${mobility}: ${distances.join(', ')}`);
  }
});

test('environmental slow is integrated once and stays stable across frame rates', () => {
  const distances = [];
  for (const rate of [30, 60, 144]) {
    const { engine, actor, key } = makeEngine();
    engine.environmentStatus = { ...engine.environmentStatus, slowUntil: 5, slowFactor: 0.45 };
    key('keydown', 'KeyD'); tickActor(engine, 1, rate); distances.push(actor.x - 160);
    assert.ok(actor.vx < 120 && actor.vx > 100);
  }
  assert.ok(Math.max(...distances) - Math.min(...distances) < 1, `Slow changed with frame rate: ${distances.join(', ')}`);
});

test('a fast costume cannot move the body past the collision just resolved', () => {
  const { engine, actor, key } = makeEngine();
  engine.costumeRuntime = { ...engine.costumeRuntime, mobility: 1.18 };
  engine.walls = [{ x: 420, y: 650, w: 90, h: 280 }];
  key('keydown', 'KeyD');
  for (let frame = 0; frame < 240; frame++) {
    tickActor(engine, 1 / 120, 120);
    assert.ok(actor.x + actor.w <= 420 + 1e-8, `Actor penetrated wall at frame ${frame}: right=${actor.x + actor.w}.`);
  }
});

test('stationary Shift aiming retains crouch, then peeks from the same cover', () => {
  const { engine, actor, key } = coverFixture();
  assert.equal(actor.inCover, true);
  const origin = actor.x;
  key('keydown', 'ShiftLeft'); key('keydown', 'KeyW'); tickActor(engine, 0.1);
  assert.equal(actor.crouching, true);
  assert.equal(actor.coverV124?.id, 'cargo');
  assert.equal(actor.coverV124?.peeking, true);
  assert.equal(actor.inCover, false, 'Peeking deliberately exposes the upper body.');
  assert.equal(actor.x, origin);
});

test('Shift plus direction aims without moving or spending ammunition', () => {
  const { engine, actor, key } = makeEngine();
  const ammo = actor.ammo;
  key('keydown', 'ShiftLeft'); key('keydown', 'KeyW'); key('keydown', 'KeyD'); tickActor(engine, 0.2);
  const aim = engine.resolvePlayerCombatAimV83(actor);
  assert.equal(actor.x, 160); assert.equal(actor.y, 838);
  assert.equal(actor.ammo, ammo); assert.equal(actor.shots, 0);
  assert.equal(aim.direction, 'up-right');
});

test('cover detection rejects another floor, a destroyed object and a distant object', () => {
  for (const cover of [
    { id: 'upstairs', x: 202, y: 472, w: 96, h: 58 },
    { id: 'destroyed', x: 202, y: 872, w: 96, h: 58, destroyed: true },
    { id: 'far', x: 400, y: 872, w: 96, h: 58 }
  ]) {
    const { engine, actor } = makeEngine(); engine.covers = [cover];
    assert.ok(!engine.findCover(actor), `Invalid cover accepted: ${cover.id}.`);
  }
});

test('cover protects from a frontal ray only, not a shot arriving from behind', () => {
  const samples = [];
  for (const sourceX of [400, 30]) {
    const { engine, actor } = coverFixture(); actor.armor = 0;
    const attacker = { x: sourceX, y: 880, w: 20, h: 40 };
    samples.push(engine.damagePlayer(actor, 20, { source: 'projectile', sourceX, sourceY: 900, attacker, attackKind: 'projectile' }));
  }
  assert.ok(samples[0] > 0 && samples[0] < 20, `Frontal cover did not mitigate: ${samples[0]}.`);
  assert.equal(samples[1], 20, 'Cover on the opposite side must not mitigate a rear shot.');
});

test('cover never grants automatic mitigation for melee or unknown damage origin', () => {
  for (const options of [{ source: 'melee' }, { source: 'enemy' }, { source: 'explosion' }]) {
    const { engine, actor } = coverFixture(); actor.armor = 0;
    assert.equal(engine.damagePlayer(actor, 20, options), 20, `Unexpected mitigation for ${options.source}.`);
  }
});

test('removing a cover object immediately removes mitigation even before the next tick', () => {
  const { engine, actor } = coverFixture(); actor.armor = 0;
  engine.covers[0].destroyed = true;
  assert.equal(engine.damagePlayer(actor, 20, { source: 'projectile', sourceX: 400, sourceY: 900,
    attacker: { x: 400, y: 880, w: 20, h: 40 }, attackKind: 'projectile' }), 20);
});

test('independent held-key sources cannot release another controller source', () => {
  const { engine } = makeEngine();
  engine.setHeldGameplayKeyV77('KeyF', true, 'keyboard');
  engine.setHeldGameplayKeyV77('KeyF', true, 'gamepad-0');
  engine.setHeldGameplayKeyV77('KeyF', false, 'keyboard'); assert.equal(engine.keys.has('KeyF'), true);
  engine.setHeldGameplayKeyV77('KeyF', false, 'gamepad-0'); assert.equal(engine.keys.has('KeyF'), false);
});

test('focus loss pauses and releases keyboard, gamepad, aim and jump state', () => {
  const { engine, actor, key, windowEvents } = makeEngine();
  key('keydown', 'KeyD'); key('keydown', 'Space');
  engine.setHeldGameplayKeyV77('KeyF', true, 'gamepad-0');
  actor.gamepadAimV83 = { x: -1, y: 0 }; actor.pointerAimV83 = { x: 1, y: 0 };
  tickActor(engine, 1 / 60); windowEvents.dispatchEvent(new Event('blur'));
  assert.equal(engine.paused, true); assert.equal(engine.keys.size, 0); assert.equal(engine.heldGameplayKeysV77.size, 0);
  assert.equal(actor.vx, 0); assert.equal(actor.jumpBuffer, 0);
  assert.equal(actor.gamepadAimV83, null); assert.equal(actor.pointerAimV83, null);
  const ammo = actor.ammo;
  assert.equal(engine.fire(actor), false); assert.equal(actor.ammo, ammo);
  engine.togglePause(); assert.equal(engine.keys.size, 0);
});

test('gameplay shortcuts do not consume editable, modified, or composing input', () => {
  const { engine, key } = makeEngine();
  for (const extra of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true },
    { composedPath: () => [{ isContentEditable: true }] },
    { composedPath: () => [{ closest: () => ({ tagName: 'INPUT' }) }] }]) {
    key('keydown', 'KeyD', extra); assert.equal(engine.keys.has('KeyD'), false);
  }
});

test('right-stick aim is independent of motion and consumes no ammunition', () => {
  const { engine, actor } = makeEngine();
  const initialAmmo = actor.ammo;
  engine.gamepadInputV77.poll([pad()]);
  engine.gamepadInputV77.poll([pad([0, 0, -0.8, -0.8])]); tickActor(engine, 0.2);
  const aim = engine.resolvePlayerCombatAimV83(actor);
  assert.equal(actor.x, 160); assert.equal(actor.y, 838); assert.equal(actor.ammo, initialAmmo);
  assert.equal(aim.direction, 'up-left');
  assert.equal(engine.keys.has('KeyA'), false); assert.equal(engine.keys.has('KeyW'), false);
});

test('a reconnect with held gamepad controls is suppressed until neutral', () => {
  const { engine, actor } = makeEngine();
  engine.gamepadInputV77.poll([pad([1, 0, 0, 0], [0, 7])]);
  assert.equal(engine.keys.size, 0); assert.equal(actor.jumpBuffer, 0);
  engine.gamepadInputV77.poll([pad()]);
  engine.gamepadInputV77.poll([pad([1, 0, 0, 0], [0])]);
  tickActor(engine, 1 / 60); assert.ok(actor.x > 160); assert.ok(actor.vy < 0);
  engine.gamepadInputV77.poll([]); assert.equal(engine.keys.has('KeyD'), false); assert.equal(actor.gamepadAimV83, null);
});

test('gamepad jump is a press edge and cannot be replayed by a held button', () => {
  const { engine, actor } = makeEngine();
  engine.gamepadInputV77.poll([pad()]);
  let impulses = 0, previousVelocity = actor.vy;
  for (let frame = 0; frame < 180; frame++) {
    engine.gamepadInputV77.poll([pad([0, 0, 0, 0], [0])]); tickActor(engine, 1 / 60);
    if (actor.vy < 0 && previousVelocity >= 0) impulses++;
    previousVelocity = actor.vy;
  }
  assert.equal(impulses, 1);
});

test('pause guards apply to direct gameplay methods as well as keyboard dispatch', () => {
  const { engine, actor, key } = makeEngine();
  actor.health = 20; actor.ammo = 1;
  const before = { health: actor.health, ammo: actor.ammo, medkits: engine.inventory.medkits, energy: engine.tracker.energy };
  engine.togglePause();
  assert.equal(engine.useMedkit(actor), false); assert.equal(engine.fire(actor), false);
  assert.equal(engine.activateTracker(actor), false); assert.equal(engine.reload(actor), false);
  key('keydown', 'KeyF'); key('keydown', 'Space');
  assert.equal(engine.keys.size, 0); assert.equal(actor.jumpBuffer, 0);
  assert.deepEqual({ health: actor.health, ammo: actor.ammo, medkits: engine.inventory.medkits, energy: engine.tracker.energy }, before);
});

test('stopping and starting a mission does not carry held controls into the new actor', () => {
  const { engine, key, startOptions } = makeEngine();
  key('keydown', 'KeyD'); key('keydown', 'Space');
  engine.stop(); assert.equal(engine.running, false); assert.equal(engine.keys.size, 0);
  engine.start(startOptions);
  assert.equal(engine.keys.size, 0); assert.equal(engine.player.jumpBuffer, 0);
  assert.equal(engine.player.pointerAimV83, null); assert.equal(engine.player.gamepadAimV83, null);
});

test('focusing an editable control releases held motion; OS repeats cannot restart it', () => {
  const { engine, actor, key, canvas } = makeEngine();
  key('keydown', 'KeyD'); tickActor(engine, 0.1);
  const input = { closest: () => ({ tagName: 'INPUT' }), isContentEditable: false };
  document.activeElement = input;
  const focusEvent = new Event('focusin');
  Object.assign(focusEvent, { composedPath: () => [input] });
  document.dispatchEvent(focusEvent);
  assert.equal(engine.keys.size, 0); assert.equal(actor.vx, 0);
  canvas.focus();
  key('keydown', 'KeyD', { repeat: true });
  assert.equal(engine.keys.has('KeyD'), false, 'A repeat after focus transfer is not a new press.');
  key('keyup', 'KeyD'); key('keydown', 'KeyD');
  assert.equal(engine.keys.has('KeyD'), true);
});

test('dedicated crouch is independent of the ladder direction', () => {
  const { engine, actor, key } = makeEngine();
  engine.ladders = [{ id: 'ladder', x: 181, top: 700, bottom: 930, w: 52 }];
  key('keydown', 'KeyZ'); tickActor(engine, 0.15);
  assert.equal(actor.crouching, true); assert.equal(actor.climbing, false); assert.equal(actor.y, 838);
  key('keyup', 'KeyZ'); key('keydown', 'KeyW'); tickActor(engine, 0.15);
  assert.equal(actor.climbing, true); assert.ok(actor.y < 838);
});

test('gamepad crouch uses B without synthesizing ladder-down input', () => {
  const { engine, actor } = makeEngine();
  engine.ladders = [{ id: 'ladder', x: 181, top: 700, bottom: 930, w: 52 }];
  engine.gamepadInputV77.poll([pad()]); engine.gamepadInputV77.poll([pad([0, 0, 0, 0], [1])]);
  tickActor(engine, 0.15);
  assert.equal(actor.crouching, true); assert.equal(actor.climbing, false); assert.equal(engine.keys.has('KeyS'), false);
});

test('analog walk scales speed; explicit reverse aim keeps facing while backpedalling', () => {
  const distances = [];
  for (const magnitude of [0.4, 1]) {
    const { engine, actor } = makeEngine();
    engine.gamepadInputV77.poll([pad()]); engine.gamepadInputV77.poll([pad([magnitude, 0, 0, 0])]);
    tickActor(engine, 1); distances.push(actor.x - 160);
  }
  assert.ok(distances[0] > distances[1] * 0.39 && distances[0] < distances[1] * 0.41);
  const { engine, actor } = makeEngine();
  engine.gamepadInputV77.poll([pad()]); engine.gamepadInputV77.poll([pad([1, 0, -1, 0], [6])]);
  tickActor(engine, 0.3);
  assert.ok(actor.x > 160); assert.equal(actor.facing, -1); assert.equal(actor.aimingV124, true);
  assert.ok(actor.vx < 160);
});

test('RMB aims without firing; LMB chord fires and release preserves the remaining aim', () => {
  const { engine, actor, canvas, pointer, windowEvents } = makeEngine();
  const initialAmmo = actor.ammo;
  pointer('pointerdown', { button: 2, buttons: 2 }); tickActor(engine, 0.15);
  assert.ok(actor.pointerAimV83); assert.equal(actor.aimingV124, true); assert.equal(actor.ammo, initialAmmo);
  assert.equal(engine.keys.has('KeyF'), false);
  const press = Object.assign(new Event('mousedown'), { button: 0, buttons: 3, clientX: 600, clientY: 360 });
  canvas.dispatchEvent(press);
  assert.equal(actor.shots, 1); assert.equal(actor.ammo, initialAmmo - 1); assert.equal(engine.keys.has('KeyF'), true);
  const releaseFire = Object.assign(new Event('mouseup'), { button: 0, buttons: 2, clientX: 600, clientY: 360 });
  windowEvents.dispatchEvent(releaseFire);
  assert.equal(engine.keys.has('KeyF'), false); assert.ok(actor.pointerAimV83);
  tickActor(engine, 0.3); assert.equal(actor.shots, 1);
  pointer('pointerup', { button: 2, buttons: 0 });
  assert.equal(actor.pointerAimV83, null); assert.equal(engine.keys.has('KeyF'), false);
});

test('pointer aim reprojects after actor/camera movement and clears on cancellation', () => {
  const { engine, actor, pointer } = makeEngine();
  pointer('pointerdown', { button: 2, buttons: 2 });
  const before = { ...actor.pointerAimV83 };
  engine.camera.x += 120; actor.x += 30;
  engine.resolvePlayerCombatAimV83(actor);
  assert.ok(Math.abs(actor.pointerAimV83.x - before.x - 90) < 1e-8);
  pointer('pointercancel', { buttons: 0 });
  assert.equal(actor.pointerAimV83, null); assert.equal(engine.keys.has('KeyF'), false);
});

test('a secondary touch pointer may aim/fire while another finger owns movement', () => {
  const { engine, actor, pointer } = makeEngine();
  engine.setHeldGameplayKeyV77('KeyD', true, 'touch-movement');
  pointer('pointerdown', { pointerType: 'touch', pointerId: 2, isPrimary: false });
  assert.ok(actor.pointerAimV83); assert.equal(actor.shots, 1);
  pointer('pointercancel', { pointerType: 'touch', pointerId: 2, isPrimary: false, buttons: 0 });
  assert.equal(actor.pointerAimV83, null); assert.equal(engine.keys.has('KeyF'), false);
  assert.equal(engine.keys.has('KeyD'), true, 'Cancelling the aiming finger must not cancel the movement finger.');
});

test('cover detection respects room and depth and rejects airborne actors', () => {
  for (const actorState of [{ roomId: 'room-a' }, { depth: 0 }, { grounded: false }]) {
    const { engine, actor } = makeEngine(); Object.assign(actor, actorState);
    engine.covers = [{ id: 'cargo', x: 202, y: 872, w: 96, h: 58, roomId: 'room-b', depth: 0.5 }];
    assert.ok(!engine.findCover(actor));
  }
});

test('a low-cover peek lifts the real muzzle and the guide matches the actual shot', () => {
  const { engine, actor, key } = coverFixture();
  key('keyup', 'KeyS'); key('keydown', 'KeyZ'); key('keydown', 'ShiftLeft'); key('keydown', 'KeyD');
  tickActor(engine, 0.1);
  assert.equal(actor.coverV124?.peeking, true);
  const guide = getPlayerAimGuideV124(engine, actor);
  assert.ok(guide); assert.ok(guide.y < engine.covers[0].y);
  assert.equal(engine.fire(actor), true);
  const bullet = engine.bullets.at(-1);
  assert.equal(bullet.x, guide.x); assert.equal(bullet.y, guide.y);
  const impact = firstProjectileObstacleV83(bullet, { x: 170, y: 0 }, { walls: engine.covers, doors: [], platforms: [] });
  assert.equal(impact, null, 'A properly elevated shot must clear the same cargo used for cover.');
  actor.armor = 0;
  assert.equal(engine.damagePlayer(actor, 20, { attackKind: 'projectile', sourceX: 400, sourceY: 900 }), 20,
    'An exposed peek must not retain hidden damage reduction.');
});

test('a medical action blocks combat and commits exactly once after unpaused simulation time', () => {
  const { engine, actor, key } = makeEngine();
  actor.health = 30; engine.inventory.medkits = 1;
  key('keydown', 'KeyH'); key('keyup', 'KeyH');
  assert.ok(engine.isFieldActionBusyV124(actor)); assert.equal(actor.health, 30); assert.equal(engine.inventory.medkits, 1);
  assert.equal(engine.fire(actor), false); assert.equal(engine.reload(actor), false); assert.equal(engine.activateTracker(actor), false);
  tickActor(engine, 1);
  const elapsed = actor.fieldActionV124.elapsed;
  engine.togglePause(); engine.advanceFieldActionV124(actor, 5);
  assert.equal(actor.fieldActionV124.elapsed, elapsed); assert.equal(actor.health, 30);
  engine.togglePause(); tickActor(engine, 1.3);
  assert.equal(actor.health, 78); assert.equal(engine.inventory.medkits, 0); assert.equal(actor.fieldActionV124, null);
  tickActor(engine, 3); assert.equal(actor.health, 78); assert.equal(engine.inventory.medkits, 0);
  assert.equal(actor.interactionClock, 0); assert.equal(engine.fire(actor), true);
});

test('movement or damage interrupts a medical action without spending its reserve', () => {
  for (const cause of ['movement', 'damage']) {
    const { engine, actor, key } = makeEngine(); actor.health = 30; engine.inventory.medkits = 1;
    assert.equal(engine.useMedkit(actor), true); tickActor(engine, 0.5);
    if (cause === 'movement') key('keydown', 'KeyD');
    else engine.damagePlayer(actor, 3, { source: 'melee' });
    tickActor(engine, 1 / 60);
    assert.equal(actor.fieldActionV124, null); assert.equal(engine.inventory.medkits, 1);
    assert.ok(actor.health <= 30);
  }
});

test('a medical action replaces a pending reload without transferring ammunition early', () => {
  const { engine, actor } = makeEngine();
  actor.health = 30; actor.ammo = 1; engine.inventory.medkits = 1;
  const reserve = actor.ammoReserve;
  assert.equal(engine.reload(actor), true); assert.equal(actor.reloading, true);
  assert.equal(engine.useMedkit(actor), true); assert.equal(actor.reloading, false);
  tickActor(engine, 2.3);
  assert.equal(actor.ammo, 1); assert.equal(actor.ammoReserve, reserve); assert.equal(actor.health, 78);
});

test('busy field work has no aiming guide and refuses another action source', () => {
  const { engine, actor, key } = makeEngine(); actor.health = 30;
  key('keydown', 'ShiftLeft'); tickActor(engine, 0.1);
  assert.ok(getPlayerAimGuideV124(engine, actor));
  assert.equal(engine.useMedkit(actor), true); tickActor(engine, 0.1);
  assert.equal(getPlayerAimGuideV124(engine, actor), null);
  assert.equal(engine.useMedkit(actor), false);
});

test('stopping an incomplete field action keeps supplies and removes its pending commit', () => {
  const { engine, actor } = makeEngine(); actor.health = 30; engine.inventory.medkits = 1;
  engine.useMedkit(actor); tickActor(engine, 1);
  const resume = engine.captureResumeState();
  assert.equal(resume.inventory.medkits, 1);
  engine.stop(); assert.equal(actor.fieldActionV124, null); assert.equal(engine.fieldActionsV124.size, 0);
  engine.advanceFieldActionV124(actor, 10);
  assert.equal(actor.health, 30); assert.equal(engine.inventory.medkits, 1);
});

test('an access tuner refuses distant, obstructed and mission-gated doors', () => {
  const equipment = EQUIPMENT.find(item => item.id === 'equipment-002-access-tuner'); assert.ok(equipment);
  for (const setup of ['distance', 'wall', 'power-gate']) {
    const { engine, actor } = makeEngine({ equipment: [equipment] });
    engine.doors = [{ id: 'door', x: setup === 'distance' ? 600 : 270, y: 754, w: 60, h: 176, progress: 0,
      open: false, lockedBy: setup === 'power-gate' ? 'power' : 'security' }];
    if (setup === 'wall') engine.walls = [{ id: 'bulkhead', x: 235, y: 700, w: 20, h: 230 }];
    const charges = engine.equipmentActions.get(equipment.id).remaining;
    assert.equal(engine.useEquipment(equipment.id, actor), false, `Unexpected bypass for ${setup}.`);
    assert.equal(engine.doors[0].open, false); assert.equal(engine.equipmentActions.get(equipment.id).remaining, charges);
  }
});

test('an access tuner retains its target; a vanished door is not replaced by another', () => {
  const equipment = EQUIPMENT.find(item => item.id === 'equipment-002-access-tuner');
  const { engine, actor } = makeEngine({ equipment: [equipment] });
  const first = { id: 'first-door', x: 260, y: 754, w: 60, h: 176, open: false, lockedBy: 'security', progress: 0 };
  engine.doors = [first];
  const charges = engine.equipmentActions.get(equipment.id).remaining;
  assert.equal(engine.useEquipment(equipment.id, actor), true); tickActor(engine, 0.5);
  engine.doors = [{ ...first, id: 'replacement-door' }]; tickActor(engine, 3);
  assert.equal(engine.doors[0].open, false); assert.equal(actor.fieldActionV124, null);
  assert.equal(engine.equipmentActions.get(equipment.id).remaining, charges);
});

test('a field lamp toggles repeatedly without manufacturing or spending a charge', () => {
  const equipment = EQUIPMENT.find(item => item.id === 'equipment-005-flashlight'); assert.ok(equipment);
  const { engine, actor } = makeEngine({ equipment: [equipment] });
  const charges = engine.equipmentActions.get(equipment.id).remaining;
  assert.equal(engine.useEquipment(equipment.id, actor), true); assert.equal(actor.fieldLightV124, true);
  const resume = engine.captureResumeState(); assert.equal(resume.playerFieldActionsV124.lights.player, true);
  assert.equal(engine.useEquipment(equipment.id, actor), true); assert.equal(actor.fieldLightV124, false);
  assert.equal(engine.equipmentActions.get(equipment.id).remaining, charges);
});

test('production sentry installation blocks fire, spends once, and a damaged re-fold survives resume', () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry'); assert.ok(sentry);
  const { engine, actor, key, startOptions } = makeEngine({ equipment: [sentry] });
  const initialCharges = engine.equipmentActions.get(sentry.id).remaining;
  assert.equal(engine.useEquipment(sentry.id, actor), true);
  assert.equal(engine.refreshPlaceablePreviewV86(actor).valid, true);
  assert.equal(engine.confirmPlaceableV86(actor), true);
  const instance = engine.placeablesV86.instances[0];
  assert.equal(instance.status, 'carried'); assert.equal(engine.equipmentActions.get(sentry.id).remaining, initialCharges);
  key('keydown', 'KeyF'); const ammo = actor.ammo;
  tickWithEquipment(engine, 1); assert.equal(actor.ammo, ammo); assert.equal(engine.isPlaceableBusyV86(actor), true);
  key('keyup', 'KeyF'); tickWithEquipment(engine, 1.6);
  assert.equal(instance.status, 'deployed'); assert.equal(engine.isPlaceableBusyV86(actor), false);
  assert.equal(engine.equipmentActions.get(sentry.id).remaining, initialCharges - 1);
  Object.assign(instance, { ammo: 37, health: 68 });
  assert.equal(engine.recoverPlaceableV86(instance.instanceId, actor), true); tickWithEquipment(engine, 2.1);
  assert.equal(instance.status, 'carried'); assert.equal(instance.ammo, 37); assert.equal(instance.health, 68);
  const snapshot = engine.captureResumeState();
  const restored = makeEngine({ ...startOptions, resumeState: snapshot }).engine;
  const restoredInstance = restored.placeablesV86.instances.find(item => item.instanceId === instance.instanceId);
  assert.equal(restoredInstance.status, 'carried'); assert.equal(restoredInstance.ammo, 37); assert.equal(restoredInstance.health, 68);
  assert.equal(restored.equipmentActions.get(sentry.id).remaining, initialCharges - 1);
});

test('sentry installation cancels on actual movement or impact without consuming the carried object', () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry');
  for (const cause of ['movement', 'impact']) {
    const { engine, actor, key } = makeEngine({ equipment: [sentry] });
    const initialCharges = engine.equipmentActions.get(sentry.id).remaining;
    engine.useEquipment(sentry.id, actor); assert.equal(engine.confirmPlaceableV86(actor), true); tickWithEquipment(engine, 0.5);
    if (cause === 'movement') key('keydown', 'KeyD'); else engine.damagePlayer(actor, 4, { source: 'melee' });
    tickWithEquipment(engine, 1 / 60);
    assert.equal(engine.isPlaceableBusyV86(actor), false); assert.equal(engine.placeablesV86.instances[0].status, 'carried');
    assert.equal(engine.equipmentActions.get(sentry.id).remaining, initialCharges);
  }
});

test('pausing an installation preserves its timer and a pending save records carried material', () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry');
  const { engine, actor } = makeEngine({ equipment: [sentry] });
  engine.useEquipment(sentry.id, actor); engine.confirmPlaceableV86(actor); tickWithEquipment(engine, 0.5);
  const task = [...engine.placeableTasksV86.values()][0]; const elapsed = task.elapsed;
  const snapshot = engine.captureResumeState();
  assert.equal(snapshot.placeablesV86.instances[0].status, 'carried');
  engine.togglePause(); engine.updateEquipmentDeployments(5);
  assert.equal(task.elapsed, elapsed); assert.equal(engine.placeablesV86.instances[0].status, 'carried');
  engine.togglePause(); tickWithEquipment(engine, 2.1);
  assert.equal(engine.placeablesV86.instances[0].status, 'deployed');
});

test('actual hostile projectiles retain launch origin and only frontal cover mitigates', () => {
  for (const front of [true, false]) {
    const { engine, actor } = coverFixture(); actor.armor = 0;
    const before = actor.health;
    const shooter = { id: 'shooter', x: front ? 400 : 0, y: 800, w: 20, h: 100, behavior: 'shooter', facing: front ? -1 : 1 };
    engine.spawnEnemyProjectile(shooter, actor);
    const shot = engine.hostileProjectiles[0], sourceX = shot.sourceX;
    assert.equal(sourceX, front ? 410 : 10);
    shooter.x = front ? -100 : 1000;
    for (let frame = 0; frame < 60 && engine.hostileProjectiles.length; frame++) engine.updateHostileProjectiles(1 / 60);
    assert.equal(engine.hostileProjectiles.length, 0);
    assert.equal(shot.sourceX, sourceX); assert.equal(shot.sourceY, 842);
    assert.ok(Math.abs(before - actor.health - (front ? 13 * 0.35 : 13)) < 1e-8,
      `Wrong incoming damage from ${front ? 'front' : 'rear'}: ${before - actor.health}.`);
  }
});

test('a thin wall stops the real muzzle and the shot drawn by the aim guide', () => {
  const { engine, actor, key } = makeEngine();
  engine.walls = [{ id: 'thin-bulkhead', x: 209, y: 700, w: 4, h: 230 }];
  key('keydown', 'ShiftLeft'); key('keydown', 'KeyD'); tickActor(engine, 0.05);
  const guide = getPlayerAimGuideV124(engine, actor);
  assert.ok(guide); assert.ok(guide.x < engine.walls[0].x);
  assert.equal(engine.fire(actor), true);
  const shot = engine.bullets.at(-1);
  assert.equal(shot.x, guide.x); assert.equal(shot.y, guide.y);
  engine.updateBullets(1 / 60);
  assert.ok(shot.hit || !engine.bullets.includes(shot), 'The round must hit the wall, not spawn behind it.');
});

test('the outer interaction guard permits leaving an authored vent network', () => {
  const { engine, actor, key } = makeEngine();
  const network = MISSION_VENT_NETWORKS_V62['ship-interior-vertical'];
  const entrance = network.entrances.find(entry => entry.id === 'ship-command-depth-entrance');
  engine.initializeMissionVentRuntimeV62({ templateId: 'ship-interior-vertical' });
  engine.missionLevelBounds = { width: 6200, height: 1080 };
  Object.assign(actor, { x: entrance.worldPosition.x - actor.w / 2, y: entrance.worldPosition.y - actor.h / 2, depth: 4 });
  assert.ok(engine.beginMissionVentTraversalV62(actor, { entranceId: entrance.id }));
  engine.updateMissionVentPlayerV62(actor, 1);
  assert.equal(actor.ventTransit.phase, 'at-node');
  assert.equal(engine.fire(actor), false);
  key('keydown', 'KeyE'); key('keyup', 'KeyE');
  assert.equal(actor.ventTransit.phase, 'exiting');
  engine.updateMissionVentPlayerV62(actor, 1);
  assert.equal(actor.ventTransit, null); assert.equal(actor.alive, true);
});

test('crouching remains stable throughout medical work and sentry installation', () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry');
  for (const kind of ['medical', 'sentry']) {
    const { engine, actor, key } = makeEngine({ equipment: [sentry] });
    actor.health = 30; engine.inventory.medkits = 1;
    key('keydown', 'KeyS'); tickActor(engine, 0.1); assert.equal(actor.crouching, true);
    if (kind === 'medical') { key('keydown', 'KeyH'); key('keyup', 'KeyH'); }
    else { engine.useEquipment(sentry.id, actor); assert.equal(engine.confirmPlaceableV86(actor), true); }
    tickWithEquipment(engine, 2.6); assert.equal(actor.crouching, true);
    if (kind === 'medical') { assert.equal(actor.health, 78); assert.equal(engine.inventory.medkits, 0); }
    else assert.equal(engine.placeablesV86.instances[0].status, 'deployed');
    key('keyup', 'KeyS'); key('keydown', 'KeyD'); tickActor(engine, 0.1);
    assert.equal(actor.crouching, false); assert.ok(actor.x > 160);
  }
});

test('Bioforge uses jump edges and advances medical work once per unpaused frame', () => {
  const { engine, actor, key } = makeBioforge();
  key('keydown', 'Space');
  let impulses = 0, previous = actor.vy;
  for (let frame = 0; frame < 180; frame++) {
    engine.update(1 / 60);
    if (actor.vy < 0 && previous >= 0) impulses++;
    previous = actor.vy;
  }
  assert.equal(impulses, 1); assert.equal(actor.grounded, true);
  key('keyup', 'Space'); actor.health = 30; engine.inventory.medkits = 1;
  key('keydown', 'KeyH'); key('keyup', 'KeyH'); assert.equal(engine.isFieldActionBusyV124(actor), true);
  for (let frame = 0; frame < 60; frame++) engine.update(1 / 60);
  assert.ok(Math.abs(actor.fieldActionV124.elapsed - 1) < 1e-8);
  assert.equal(actor.health, 30); assert.equal(engine.inventory.medkits, 1);
  engine.togglePause(); for (let frame = 0; frame < 180; frame++) engine.update(1 / 60);
  assert.ok(Math.abs(actor.fieldActionV124.elapsed - 1) < 1e-8);
  engine.togglePause(); for (let frame = 0; frame < 73; frame++) engine.update(1 / 60);
  assert.equal(actor.health, 78); assert.equal(engine.inventory.medkits, 0); assert.equal(actor.fieldActionV124, null);
});

test('Bioforge fire shares the constrained muzzle used by presentation', () => {
  const { engine, actor } = makeBioforge();
  engine.bioforgeRootV80.activeSession.phase = 'combat';
  actor.facing = 1; actor.gamepadAimV83 = { x: 1, y: 0 };
  const aim = engine.resolvePlayerCombatAimV83(actor), freeMuzzle = engine.resolvePlayerMuzzleV124(actor, aim);
  engine.walls = [{ id: 'thin-bioforge-bulkhead', x: freeMuzzle.x + 4, y: actor.y - 20, w: 2, h: actor.h + 40 }];
  assert.equal(Boolean(engine.resolvePlayerMuzzleV124(actor, aim).obstructedV124), false);
  // Bioforge renders a shorter weapon. Place the obstruction inside its real
  // shoulder-to-barrel span instead of assuming a barrel beyond the hitbox.
  engine.walls[0].x = (freeMuzzle.pivotX + freeMuzzle.x) / 2;
  const muzzle = engine.resolvePlayerMuzzleV124(actor, aim);
  assert.ok(muzzle.obstructedV124);
  assert.equal(engine.fire(actor), true);
  assert.equal(engine.bullets.at(-1).x, muzzle.x); assert.equal(engine.bullets.at(-1).y, muzzle.y);
});

test('dedicated, contextual and Neuro melee never create gunfire presentation clocks', () => {
  const neuroProfile = NEURO_XENO_PROFILES.find(profile => profile.playerClassCompatible); assert.ok(neuroProfile);
  for (const action of ['dedicated', 'contextual', 'neuro']) {
    const { engine, actor, events } = makeEngine(action === 'neuro' ? { neuroProfile } : {});
    const target = engine.createEnemy(ENEMIES.find(enemy => enemy.id === 'enemy-005-warrior'), 0, actor.x + actor.w + 12, actor.y + actor.h);
    engine.enemies = [target];
    const health = target.health, ammo = actor.ammo;
    assert.equal(action === 'dedicated' ? engine.melee(actor) : engine.fire(actor), true, `${action} must execute its real attack.`);
    assert.ok(target.health < health, `${action} must actually damage the nearby target.`);
    assert.ok(events.some(event => event.type === (action === 'neuro' ? 'neuro-attack' : 'melee')));
    assert.equal(actor.shots, 0); assert.equal(actor.ammo, ammo); assert.equal(engine.bullets.length, 0);
    assert.equal(Number(actor.v52FireClock) || 0, 0, `${action} must not impersonate an accepted gunshot.`);
  }
});
