import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, getXenoTrialsSnapshotV96 } from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

// Real runtime/engine, deterministic host. Browser APIs and image decoding only
// are substituted; these unit checks are distinct from the real Chromium route.
function target(extra = {}) {
  const events = new Map();
  return Object.assign({
    addEventListener(type, callback) { if (!events.has(type)) events.set(type, new Set()); events.get(type).add(callback); },
    removeEventListener(type, callback) { events.get(type)?.delete(callback); },
    emit(type, event = {}) { for (const listener of [...(events.get(type) || [])]) listener({ preventDefault() {}, stopPropagation() {}, ...event }); },
    count() { return [...events.values()].reduce((n, set) => n + set.size, 0); }
  }, extra);
}
function host(options = {}) {
  const window = target(), document = target({ hidden: false, focused: true, hasFocus() { return this.focused; } });
  const text = [], ctx = new Proxy({ fillText: value => text.push(String(value)), measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (object, key) => object[key] ?? (() => {}) });
  const canvas = target({ tagName: 'CANVAS', width: 800, height: 600, getContext: () => ctx,
    setAttribute() {}, focus() { document.activeElement = this; this.focusCount++; }, focusCount: 0, closest: () => null });
  document.activeElement = canvas;
  const root = target({ contains: item => item?.control === true });
  let serial = 0, time = 0;
  const queue = new Map(), results = [];
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document, controlsRoot: root,
    config: { playerId: 'warrior', opponentId: 'runner', seed: 145, roundSeconds: 30, ...options.config },
    loadImage: async () => ({ naturalWidth: 1024, naturalHeight: 1024 }),
    requestAnimationFrame: callback => { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame: id => queue.delete(id), onResult: result => results.push(result), ...options });
  function frames(count = 1, milliseconds = 1000 / 60) {
    for (let i = 0; i < count; i++) {
      time += milliseconds;
      const pending = [...queue.values()]; queue.clear();
      for (const callback of pending) callback(time);
    }
  }
  return { runtime, window, document, canvas, root, queue, text, results, frames,
    key(code, down = true, extra = {}) { window.emit(down ? 'keydown' : 'keyup', { code, target: canvas, ...extra }); },
    async start() { assert.equal(await runtime.start(), true); for (let i = 0; i < 600 && runtime.getState().presentation.blocksSimulation; i++) frames(1);
      assert.equal(runtime.getState().presentation.blocksSimulation, false); frames(1); }
  };
}

function tick(match, seconds, player = {}, opponent = {}) {
  for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += 1 / 120) stepXenoTrialsMatchV96(match, 1 / 120, player, opponent);
}

test('Trials pauses when focus moves from the canvas into a menu and discards held movement', async () => {
  const h = host(); await h.start();
  h.key('ArrowRight'); h.frames(4);
  const button = { tagName: 'BUTTON', closest: () => null };
  h.document.activeElement = button; h.document.emit('focusin', { target: button });
  assert.equal(h.runtime.getState().paused, true);
  const before = h.runtime.getState(); h.frames(30);
  assert.equal(h.runtime.getState().tick, before.tick);
  assert.equal(h.runtime.resume(), true); h.frames(5);
  assert.equal(h.runtime.getState().fighters[0].previousInput.right, false);
  h.runtime.stop();
});

test('Trials does not resume in a window that still has no focus', async () => {
  const h = host(); await h.start(); h.runtime.pause(); h.document.focused = false;
  assert.equal(h.runtime.resume(), false); assert.equal(h.runtime.getState().paused, true); h.runtime.stop();
});

test('asset completion after window focus loss neither starts combat nor steals focus', async () => {
  let resolve;
  const image = new Promise(done => { resolve = done; });
  const h = host({ loadImage: () => image });
  const starting = h.runtime.start(); h.document.focused = false;
  resolve({ naturalWidth: 1024, naturalHeight: 1024 });
  assert.equal(await starting, true); assert.equal(h.runtime.getState().paused, true);
  assert.equal(h.canvas.focusCount, 0); h.frames(400); assert.equal(h.runtime.getState().tick, 0); h.runtime.stop();
});

test('closing from a ready-state callback cannot schedule an orphan animation frame or retain listeners', async () => {
  let h;
  h = host({ config: { stageId: 'tantalus-bridge' }, onState: state => { if (state.stageVisual === 'backdrop-ready') h.runtime.stop(); } });
  await h.runtime.start();
  assert.equal(h.queue.size, 0); assert.equal(h.window.count(), 0); assert.equal(h.document.count(), 0);
  assert.deepEqual([h.canvas.width, h.canvas.height], [800, 600]);
});

test('exit is terminal and invokes its owner once', async () => {
  let exits = 0;
  const h = host({ onExit: () => exits++ }); await h.start();
  h.runtime.exit(); h.runtime.exit(); assert.equal(exits, 1); assert.equal(h.queue.size, 0);
});

for (const image of [{ naturalWidth: 0, naturalHeight: 100 }, { naturalWidth: 100, naturalHeight: 0 }, null]) {
  test(`invalid fighter image suspends the duel: ${JSON.stringify(image)}`, async () => {
    const h = host({ loadImage: async () => image });
    assert.equal(await h.runtime.start(), false); assert.equal(h.runtime.getState().paused, true);
    h.frames(400); assert.equal(h.runtime.getState().tick, 0); h.runtime.stop();
  });
}

test('held restricted special requires a fresh press after the first twenty seconds', () => {
  const match = createXenoTrialsMatchV96({ introSeconds: 0, roundSeconds: 30, rulesV119: { specialLockSeconds: 20 } });
  tick(match, 20.2, { special: true });
  assert.equal(match.fighters[0].stats.specials, 0);
  tick(match, .02); tick(match, .02, { special: true });
  assert.equal(match.fighters[0].stats.specials, 1);
});

test('match results are emitted once and the terminal screen does not keep rendering at frame rate', async () => {
  const h = host({ config: { playerId: 'warrior', opponentId: 'runner', seed: 145, roundSeconds: 30, rulesV119: { initialHp: 1 } } });
  await h.start(); h.runtime.setInput('right', true);
  for (let i = 0; i < 8000 && h.runtime.getState().phase !== 'match-over'; i++) h.frames(1);
  assert.equal(h.runtime.getState().phase, 'match-over'); assert.equal(h.results.length, 1);
  assert.equal(h.queue.size, 0);
  assert.equal(h.runtime.resume(), false); h.frames(30); assert.equal(h.results.length, 1); h.runtime.stop();
});

test('real deterministic engine result settles its matching ticket once and never pays a replay', () => {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner',
    activityV119: { branch: 'on-demand', id: 'on-demand', rules: { initialHp: 1 } } });
  assert.equal(ticket.applied, true);
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
  for (let i = 0; i < 30000 && !match.result; i++) stepXenoTrialsMatchV96(match, 1 / 120, { right: true });
  assert.ok(match.result);
  const settled = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(settled.applied, true); assert.equal(settled.state.pending, null); assert.equal(settled.state.ledger.length, 1);
  const replay = settleXenoTrialsV96(settled.state, match.result);
  assert.equal(replay.applied, false); assert.equal(replay.state.credits, settled.state.credits);
});

test('fixed-step Trials simulation produces the same result at 30, 60 and 120 frames per second', () => {
  const outcomes = [30, 60, 120].map(rate => {
    const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', seed: 145,
      introSeconds: 0, rulesV119: { initialHp: 1 } });
    for (let i = 0; i < rate * 120 && !match.result; i++) stepXenoTrialsMatchV96(match, 1 / rate, { right: true });
    assert.ok(match.result); return getXenoTrialsSnapshotV96(match).result;
  });
  assert.deepEqual(outcomes[0], outcomes[1]); assert.deepEqual(outcomes[1], outcomes[2]);
});

for (const opponentId of ['spitter', 'synth-trooper', 'synth-incinerator']) {
  test(`${opponentId} closes to legal melee instead of idling forever in a no-special duel`, () => {
    const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId, seed: 145, introSeconds: 0,
      roundSeconds: 60, rulesV119: { noSpecial: true } });
    for (let i = 0; i < 120 * 25 && !match.result; i++) stepXenoTrialsMatchV96(match, 1 / 120);
    assert.equal(match.fighters[1].stats.specials, 0);
    assert.ok(match.fighters[1].stats.damage > 0, 'The CPU uses its permitted ordinary contact attacks.');
  });
}

test('focus return never rearms a held or repeating combat key before its release', async () => {
  const h = host(); await h.start(); h.key('KeyJ'); h.frames(1); h.runtime.pause();
  h.key('KeyJ', true, { repeat: true }); h.runtime.resume(); h.frames(5);
  assert.equal(h.runtime.getState().fighters[0].previousInput.light, false);
  h.key('KeyJ', false); h.key('KeyJ'); h.frames(1);
  assert.equal(h.runtime.getState().fighters[0].previousInput.light, true); h.runtime.stop();
});

test('a missed blur event is still detected by the next simulation frame', async () => {
  const h = host(); await h.start(); const before = h.runtime.getState().tick;
  h.document.focused = false; h.frames(10);
  assert.equal(h.runtime.getState().paused, true); assert.equal(h.runtime.getState().tick, before); h.runtime.stop();
});

test('native combat buttons remain keyboard accessible without pausing and release cleanly', async () => {
  const h = host(); await h.start();
  const button = { control: true, getAttribute: () => 'guard', closest() { return this; } };
  h.document.activeElement = button; h.document.emit('focusin', { target: button });
  assert.equal(h.runtime.getState().paused, false);
  h.root.emit('keydown', { code: 'Space', target: button }); h.frames(1);
  assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.root.emit('keyup', { code: 'Space', target: button }); h.frames(1);
  assert.equal(h.runtime.getState().fighters[0].guard, false); h.runtime.stop();
});

test('two pointers on the same control are independent; pausing releases all captures', async () => {
  const h = host(); await h.start(); const captures = new Set();
  const button = { control: true, getAttribute: () => 'guard', closest() { return this; },
    setPointerCapture: id => captures.add(id), releasePointerCapture: id => captures.delete(id) };
  for (const id of [1, 2]) h.root.emit('pointerdown', { target: button, pointerId: id });
  h.frames(1); assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.root.emit('pointerup', { pointerId: 1 }); captures.delete(1);
  h.frames(1); assert.equal(h.runtime.getState().fighters[0].guard, true);
  h.runtime.pause(); assert.equal(captures.size, 0);
  h.runtime.resume(); h.frames(2); assert.equal(h.runtime.getState().fighters[0].guard, false); h.runtime.stop();
});

test('a missing optional backdrop keeps the actual fighters and procedural arena', async () => {
  const h = host({ config: { stageId: 'tantalus-bridge' }, loadImage: async path => {
    if (path.includes('ship-command-far')) throw new Error('Missing optional scenery');
    return { naturalWidth: 1024, naturalHeight: 1024 };
  } });
  await h.start(); const state = h.runtime.getState();
  assert.equal(state.stageVisual, 'procedural-fallback'); assert.equal(state.paused, false); h.runtime.stop();
});

test('stop during image loading is terminal and late completion cannot restart the scene', async () => {
  let resolve;
  const image = new Promise(done => { resolve = done; });
  const h = host({ loadImage: () => image }); const starting = h.runtime.start(); h.runtime.stop();
  resolve({ naturalWidth: 1024, naturalHeight: 1024 });
  assert.equal(await starting, false); assert.equal(await h.runtime.start(), false);
  assert.equal(h.queue.size, 0); assert.equal(h.window.count(), 0);
  assert.deepEqual([h.canvas.width, h.canvas.height], [800, 600]);
});

test('closing in the terminal onState callback cannot notify a result to a discarded owner', async () => {
  let h, results = 0;
  h = host({ config: { rulesV119: { initialHp: 1 } }, onResult: () => results++,
    onState: state => { if (state.phase === 'match-over') h.runtime.stop(); } });
  await h.start(); h.runtime.setInput('right', true);
  for (let i = 0; i < 8000 && h.runtime.getState().phase !== 'match-over'; i++) h.frames(1);
  assert.equal(h.runtime.getState().phase, 'match-over'); assert.equal(results, 0); assert.equal(h.queue.size, 0);
});

for (const side of [0, 1]) test(`special lock release policy is identical for fighter ${side}`, () => {
  const match = createXenoTrialsMatchV96({ introSeconds: 0, roundSeconds: 30, rulesV119: { specialLockSeconds: 20 } });
  tick(match, 20.2, side === 0 ? { special: true } : {}, side === 1 ? { special: true } : {});
  assert.equal(match.fighters[side].stats.specials, 0);
  tick(match, .02); tick(match, .02, side === 0 ? { special: true } : {}, side === 1 ? { special: true } : {});
  assert.equal(match.fighters[side].stats.specials, 1);
});

test('an unrestricted special keeps its immediate activation and ordinary cooldown', () => {
  const match = createXenoTrialsMatchV96({ introSeconds: 0 });
  tick(match, .02, { special: true }); assert.equal(match.fighters[0].stats.specials, 1);
  tick(match, 2, { special: true }); assert.equal(match.fighters[0].stats.specials, 1);
  tick(match, .02); tick(match, .02, { special: true }); assert.equal(match.fighters[0].stats.specials, 2);
});

test('a permanently disabled special never spends stamina on its blocked request', () => {
  const match = createXenoTrialsMatchV96({ introSeconds: 0, rulesV119: { noSpecial: true } });
  const stamina = match.fighters[0].stamina;
  tick(match, 21, { special: true });
  assert.equal(match.fighters[0].stats.specials, 0); assert.equal(match.fighters[0].stamina, stamina);
});

// A single catalogue sweep, not 31 claimed handcrafted combat campaigns.
test('all admitted ranged Trials identities retain legal contact offense under no-special rules', () => {
  const ranged = XENO_TRIALS_FIGHTERS_V96.filter(f => ['acid', 'pulse', 'flame'].includes(f.special));
  assert.ok(ranged.length >= 31);
  for (const definition of ranged) {
    const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: definition.id, seed: 145,
      introSeconds: 0, roundSeconds: 60, rulesV119: { noSpecial: true } });
    for (let i = 0; i < 120 * 25 && !match.result; i++) stepXenoTrialsMatchV96(match, 1 / 120);
    assert.equal(match.fighters[1].stats.specials, 0, definition.id);
    assert.ok(match.fighters[1].stats.damage > 0, definition.id);
  }
});


test('pause parks rendering until explicit resume, without duplicate animation loops', async () => {
  const h = host(); await h.start();
  h.runtime.pause(); assert.equal(h.queue.size, 0);
  const before = h.runtime.getState(); h.frames(300);
  assert.deepEqual(h.runtime.getState(), before);
  assert.equal(h.runtime.resume(), true); assert.equal(h.queue.size, 1);
  h.runtime.resume(); assert.equal(h.queue.size, 1);
  h.frames(2); assert.ok(h.runtime.getState().tick > before.tick);
  h.runtime.stop(); assert.equal(h.queue.size, 0);
});
