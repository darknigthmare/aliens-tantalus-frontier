import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52, MISSION_TEMPLATE_IDS_V52 } from '../src/mission-levels-v52.js';

// The production update, damage, collision, input and revival paths own every
// transition. Only the browser host is replaced; no render quality is inferred.
const controls = { player: { right: 'KeyD', up: 'KeyW', jump: 'Space', fire: 'KeyF' },
  coop: { right: 'KeyL', up: 'KeyI', jump: 'KeyU', fire: 'KeyO' } };
const floor = () => ({ id: 'qa-floor', x: -200, y: 930, w: 6800, h: 200, floor: true });

function fixture({ coop = true } = {}) {
  const windowEvents = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const canvas = Object.assign(new EventTarget(), { getContext: () => ({}),
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
  engine.start({ world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    equipment: [], crew: [], seed: 426 });
  Object.assign(engine, { platforms: [floor()], ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [],
    enemies: [], missionLevelRuntime: null });
  Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true });
  engine.setCoop(coop);
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false });
    windowEvents.dispatchEvent(event);
  };
  return { engine, key, events };
}

function advance(engine, seconds, rate = 120) {
  let remaining = seconds;
  while (remaining > 1e-10) {
    const delta = Math.min(1 / rate, remaining);
    engine.update(delta); remaining -= delta;
  }
}

function incapacitate(engine, actor) {
  const location = { x: actor.x, y: actor.y };
  assert.ok(engine.damagePlayer(actor, 10000, { bypassCover: true, source: 'qa-incapacitating-impact' }) > 0);
  assert.equal(actor.alive, false); assert.equal(actor.downed, true);
  assert.equal(actor.health, 0);
  assert.deepEqual({ x: actor.x, y: actor.y }, location, 'Damage cannot invent a landing or teleport the operator.');
  return location;
}

for (const role of ['player', 'coop']) test(`${role} incapacitated during a real jump falls under gravity without accepting held inputs`, () => {
  for (const rate of [30, 60, 120]) {
    const { engine, key } = fixture(), actor = engine[role];
    key('keydown', controls[role].jump); advance(engine, .12, rate); key('keyup', controls[role].jump);
    assert.equal(actor.grounded, false); assert.ok(actor.vy < 0);
    const location = incapacitate(engine, actor), velocity = actor.vy, ammo = actor.ammo, shots = actor.shots;
    for (const code of Object.values(controls[role])) key('keydown', code);
    advance(engine, .1, rate);
    assert.ok(actor.y !== location.y, 'An airborne casualty must continue its physical trajectory.');
    assert.ok(actor.vy > velocity, 'Gravity still advances after the operator loses control.');
    assert.equal(actor.x, location.x); assert.equal(actor.climbing, false);
    assert.equal(engine.fire(actor), false); assert.equal(engine.reload(actor), false);
    assert.equal(engine.useMedkit(actor), false); assert.equal(engine.interact(actor), false);
    advance(engine, 1, rate);
    assert.equal(actor.y + actor.h, 930); assert.equal(actor.grounded, true);
    assert.equal(actor.vy, 0); assert.equal(actor.vx, 0);
    assert.equal(actor.ammo, ammo); assert.equal(actor.shots, shots);
    assert.equal(actor.alive, false); assert.equal(engine.mission.state, 'active');
  }
});

for (const role of ['player', 'coop']) test(`${role} incapacitated on a real ladder releases it and lands on the authored floor`, () => {
  const { engine, key } = fixture(), actor = engine[role];
  engine.ladders = [{ id: 'qa-ladder', x: actor.x + actor.w / 2, top: 500, bottom: 930 }];
  key('keydown', controls[role].up); advance(engine, .4);
  assert.equal(actor.climbing, true); assert.ok(actor.y < 838);
  const location = incapacitate(engine, actor);
  assert.equal(actor.climbing, false, 'The incapacitating hit releases the ladder immediately.');
  assert.equal(actor.ladderId, null); assert.equal(actor.jumpBuffer, 0); assert.equal(actor.coyoteTime, 0);
  advance(engine, .1);
  assert.ok(actor.y > location.y, 'The old climbing velocity must not keep pulling a casualty upward.');
  assert.equal(actor.x, location.x);
  advance(engine, 1);
  assert.equal(actor.y + actor.h, 930); assert.equal(actor.grounded, true);
  assert.equal(actor.climbing, false); assert.equal(actor.ladderId, null);
});

test('an incapacitated operator lands on compiled slope steps rather than the floor below them', () => {
  const level = MISSION_TEMPLATE_IDS_V52.map(templateId => buildMissionLevelV52({ templateId, levelSeeds: LEVEL_SEEDS }))
    .find(entry => entry.geometry.platforms.some(platform => platform.kind === 'terrain-step'));
  assert.ok(level, 'The test needs a real compiled slope.');
  const step = level.geometry.platforms.find(platform => platform.kind === 'terrain-step' && platform.w > 50);
  assert.ok(step);
  const { engine } = fixture(), actor = engine.player;
  engine.platforms = [...level.geometry.platforms.map(platform => ({ ...platform })), floor()];
  Object.assign(actor, { x: step.x + step.w / 2 - actor.w / 2, y: step.y - actor.h - 70, vy: 120, grounded: false });
  const previousFeet = actor.y + actor.h;
  const firstSupport = engine.platforms.filter(platform => actor.x + actor.w > platform.x + 4
    && actor.x < platform.x + platform.w - 4 && platform.y >= previousFeet).sort((a, b) => a.y - b.y)[0];
  assert.ok(firstSupport && firstSupport.y <= step.y);
  assert.equal(firstSupport.kind, 'terrain-step');
  incapacitate(engine, actor); advance(engine, 1);
  assert.equal(actor.y + actor.h, firstSupport.y);
  assert.equal(actor.grounded, true); assert.equal(actor.vy, 0);
});

test('an incapacitated operator rides a real moving lift and falls when its support is removed', () => {
  const { engine } = fixture(), actor = engine.player;
  const lift = { id: 'qa-lift', x: actor.x - 40, y: 720, w: 160, h: 24, topY: 650, baseY: 790, phase: 0 };
  engine.lifts = [lift]; engine.platforms = [floor(), lift];
  Object.assign(actor, { y: lift.y - actor.h, grounded: true, vy: 0 });
  incapacitate(engine, actor);
  for (let tick = 0; tick < 120; tick++) {
    engine.update(1 / 120);
    assert.ok(Math.abs(actor.y + actor.h - lift.y) < 1e-7, 'The real lift remains the body support.');
    assert.equal(actor.grounded, true);
  }
  engine.lifts = []; engine.platforms = [floor()];
  const y = actor.y; advance(engine, .1);
  assert.ok(actor.y > y); assert.equal(actor.grounded, false);
  advance(engine, 1);
  assert.equal(actor.y + actor.h, 930); assert.equal(actor.grounded, true);
});

test('pause freezes a falling casualty and a real nearby revival preserves its reached support', () => {
  const { engine, key, events } = fixture(), actor = engine.player, rescuer = engine.coop;
  key('keydown', 'Space'); advance(engine, .12); key('keyup', 'Space');
  incapacitate(engine, actor); advance(engine, .05);
  const state = () => ({ x: actor.x, y: actor.y, vx: actor.vx, vy: actor.vy, bleedOut: actor.bleedOut,
    downed: actor.downed, health: actor.health, grounded: actor.grounded });
  engine.togglePause(); const paused = state(); advance(engine, 2);
  assert.deepEqual(state(), paused);
  assert.equal(engine.interact(rescuer), false);
  engine.togglePause(); advance(engine, 1);
  const landed = { x: actor.x, y: actor.y };
  assert.equal(actor.y + actor.h, 930);
  assert.equal(engine.interact(rescuer), true);
  assert.equal(actor.alive, true); assert.equal(actor.downed, false); assert.equal(actor.bleedOut, 0);
  assert.deepEqual({ x: actor.x, y: actor.y }, landed);
  assert.equal(actor.grounded, true); assert.equal(actor.climbing, false); assert.equal(actor.vy, 0);
  assert.equal(engine.revive(rescuer, actor), false, 'A second request cannot revive an already rescued operator.');
  advance(engine, .2); assert.equal(actor.y + actor.h, 930);
  incapacitate(engine, actor); advance(engine, 18.01, 30);
  assert.equal(actor.downed, false); assert.equal(actor.alive, false);
  assert.equal(engine.revive(rescuer, actor), false, 'A casualty whose rescue period expired stays lost.');
  assert.equal(events.filter(event => event.type === 'marine-lost').length, 1);
});

test('falling beyond the authored void cannot teleport an incapacitated operator to the checkpoint', () => {
  const { engine } = fixture(), actor = engine.player;
  engine.applyMissionLevelV52(buildMissionLevelV52({ levelSeeds: LEVEL_SEEDS }));
  Object.assign(engine, { platforms: [floor()], ladders: [], lifts: [], hazards: [], enemies: [], doors: [] });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true });
  Object.assign(actor, { x: 750, y: engine.missionLevelBounds.voidY - 60, vy: 200, grounded: false });
  incapacitate(engine, actor); advance(engine, .3);
  assert.equal(actor.x, 750);
  assert.ok(actor.y > engine.missionLevelBounds.voidY);
  assert.notEqual(actor.y, engine.checkpoint.y);
  assert.equal(actor.grounded, false); assert.equal(actor.alive, false);
});

test('solo mission failure keeps its existing final freeze without fabricating a grounded casualty', () => {
  const { engine, key } = fixture({ coop: false }), actor = engine.player;
  key('keydown', 'Space'); advance(engine, .12); key('keyup', 'Space');
  incapacitate(engine, actor);
  assert.equal(engine.mission.state, 'failed');
  const state = { x: actor.x, y: actor.y, bleedOut: actor.bleedOut };
  advance(engine, 1);
  assert.deepEqual({ x: actor.x, y: actor.y, bleedOut: actor.bleedOut }, state);
  assert.equal(actor.grounded, false);
});
