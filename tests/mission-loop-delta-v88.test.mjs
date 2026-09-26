import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as LegacyGameEngine } from '../src/game.js';
import { GameEngine as MissionGameEngine } from '../src/game-v51-runtime.js';

function withRealLoop(Engine, run) {
  const frames = [], updates = [];
  const globals = {
    Image: class { complete = true; naturalWidth = 1024; naturalHeight = 1024; set src(value) { this.currentSrc = value; } },
    addEventListener() {},
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    performance: { now: () => 1000 },
    navigator: { getGamepads: () => [] },
    document: { hidden: false, addEventListener() {} }
  };
  const previous = new Map(Object.keys(globals).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let engine, draws = 0;
  try {
    for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    engine = new Engine({ width: 1280, height: 720, getContext: () => ({}), addEventListener() {}, focus() {} });
    // Only raster drawing is replaced; scheduled loop, input, physics and timers are real.
    engine.draw = () => { draws++; };
    const update = engine.update;
    engine.update = function(delta) { updates.push(delta); return update.call(this, delta); };
    engine.start({ world: { id: 'loop-world', name: 'Loop World' }, campaign: { id: 'loop-campaign', name: 'Loop Campaign' }, weapon: { damage: 26 } });
    engine.enemies = []; // Isolate player physics from the unrelated asynchronous enemy-atlas gate.
    const frame = time => { assert.ok(frames.length, 'Actual rAF callback was scheduled'); frames.shift()(time); };
    run({ engine, frame, updates, draws: () => draws });
  } finally {
    engine?.stop();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

for (const [name, Engine] of [['legacy', LegacyGameEngine], ['mission-v51', MissionGameEngine]]) {
  test(`${name} actual first rAF older than start cannot synthesize a jump or reverse simulation`, () => withRealLoop(Engine, ({ engine, frame, updates }) => {
    const before = { x: engine.player.x, y: engine.player.y };
    assert.equal(engine.last, 1000); assert.equal(engine.keys.size, 0);
    frame(900);
    assert.equal(engine.player.vy, 0, 'No negative delta may create upward velocity without a jump input');
    assert.equal(engine.player.y, before.y, 'Player remains on the real initial floor');
    assert.equal(engine.player.x, before.x);
    assert.equal(engine.animationTime, 0); assert.equal(engine.mission?.elapsed || 0, 0);
    assert.deepEqual(updates, [0]); assert.equal(engine.last, 900);
    assert.equal(engine.player.jumpBuffer || engine.queueJump || 0, 0);
    frame(916);
    assert.deepEqual(updates, [0, .016]); assert.equal(engine.animationTime, .016);
    assert.equal(engine.player.y, before.y); assert.equal(engine.player.vy, 0);
    engine.keys.add('KeyD'); frame(932);
    assert.ok(engine.player.x > before.x, 'Normal positive timestamp still moves the player');
    assert.equal(updates.at(-1), .016);
  }));

  test(`${name} actual pause skips physics, resumes normally and keeps the existing maximum delta`, () => withRealLoop(Engine, ({ engine, frame, updates, draws }) => {
    const y = engine.player.y;
    engine.togglePause(); frame(900);
    assert.deepEqual(updates, []); assert.equal(draws(), 1); assert.equal(engine.last, 900);
    assert.equal(engine.player.y, y); assert.equal(engine.player.vy, 0);
    engine.togglePause(); frame(916);
    assert.deepEqual(updates, [.016]); assert.equal(draws(), 2);
    assert.equal(engine.player.y, y); assert.equal(engine.player.vy, 0);
    frame(2000);
    assert.equal(updates.at(-1), .034); assert.equal(engine.animationTime, .05);
    engine.togglePause(); frame(1990);
    assert.deepEqual(updates, [.016, .034]); assert.equal(draws(), 4);
    engine.togglePause(); frame(2006);
    assert.equal(updates.at(-1), .016); assert.equal(engine.player.y, y);
  }));
}
