import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsLocalInputV232, XENO_TRIALS_LOCAL_ACTIONS_V232,
  XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232 } from '../src/xeno-trials-local-input-v232.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96,
  releaseXenoTrialsControlsV150, setXenoTrialsPausedV96 } from '../src/xeno-trials-engine-v96.js';

// Injected event targets, standard gamepads and frame callbacks exercise the
// production adapter. These tests do not claim a physical pad/browser session.
const events = () => {
  const listeners = new Map();
  return {
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
    dispatch(type, fields = {}) { for (const callback of [...listeners.get(type) || []]) callback(fields); },
    count() { return [...listeners.values()].reduce((total, group) => total + group.size, 0); },
  };
};
const pad = (index = 0, id = `pad-${index}`) => ({ index, id, connected: true, mapping: 'standard', axes: [0, 0, 0, 0],
  buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) });
const press = (fixture, index, value = 1) => { fixture.buttons[index] = { pressed: value >= .5, value }; };
const released = input => {
  assert.deepEqual(Object.keys(input), XENO_TRIALS_LOCAL_ACTIONS_V232);
  assert.ok(Object.values(input).every(value => value === false), JSON.stringify(input));
};
function fixture(options = {}) {
  const host = events(), doc = { ...events(), hidden: false, hasFocus: () => state.focused }, canvas = { tagName: 'CANVAS' };
  const state = { active: true, paused: false, focused: true, pads: [], releases: [], pauses: [], disconnected: [] };
  doc.activeElement = canvas;
  const controller = createXenoTrialsLocalInputV232({ window: host, document: doc, canvas,
    acceptsControls: () => state.active, isPaused: () => state.paused,
    readGamepads: () => state.pads,
    onRelease: (...args) => state.releases.push(args), onPauseToggle: event => state.pauses.push(event),
    onDisconnect: event => state.disconnected.push(event), ...options });
  const key = (type, code, fields = {}) => {
    const event = { code, target: canvas, prevented: false, preventDefault() { this.prevented = true; }, ...fields };
    host.dispatch(type, event); return event;
  };
  return { controller, state, host, doc, canvas, key };
}

test('P2 owns arrows and every numpad technique while P1 keeps its existing attack keys', t => {
  const f = fixture(); t.after(() => f.controller.stop());
  const { controller: c } = f;
  for (const [code, action] of Object.entries(XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232)) {
    assert.equal(c.ownsKey(code), true); assert.equal(c.ownsOpponentKey(code), true);
    assert.equal(f.key('keydown', code).prevented, true);
    assert.deepEqual(Object.entries(c.getOpponentInput()).filter(([, value]) => value), [[action, true]]);
    released(c.getPlayerInput()); f.key('keyup', code); released(c.getOpponentInput());
  }
  for (const code of ['KeyJ', 'KeyK', 'KeyL', 'KeyH', 'KeyO', 'KeyI', 'KeyA', 'KeyD', 'KeyS', 'KeyW', 'Space']) {
    assert.equal(c.ownsKey(code), false); assert.equal(c.ownsOpponentKey(code), false);
    assert.equal(f.key('keydown', code).prevented, false); released(c.getOpponentInput());
  }
  f.key('keydown', 'KeyR'); f.key('keydown', 'KeyG');
  assert.equal(c.getPlayerInput().tag, true); assert.equal(c.getPlayerInput().assist, true);
  released(c.getOpponentInput()); assert.equal(c.ownsOpponentKey('KeyR'), false);
});

test('inputs are independent bounded snapshots and opposing directions cancel', t => {
  const f = fixture(); t.after(() => f.controller.stop());
  f.key('keydown', 'ArrowLeft'); f.key('keydown', 'ArrowRight'); released(f.controller.getOpponentInput());
  f.key('keyup', 'ArrowRight'); const first = f.controller.getOpponentInput(); assert.equal(first.left, true);
  first.left = false; first.tag = 1; assert.equal(f.controller.getOpponentInput().left, true);
  assert.equal(f.controller.getOpponentInput().tag, false);
  assert.ok(Object.values(f.controller.getOpponentInput()).every(value => typeof value === 'boolean'));
});

test('pause, inactive intro, visibility, lost focus and explicit releases require a real keyboard release', t => {
  for (const change of ['pause', 'inactive', 'visibility', 'blur', 'focus-target', 'release']) {
    const f = fixture(); t.after(() => f.controller.stop());
    f.key('keydown', 'Numpad1'); assert.equal(f.controller.getOpponentInput().light, true);
    if (change === 'pause') f.state.paused = true;
    if (change === 'inactive') f.state.active = false;
    if (change === 'visibility') { f.doc.hidden = true; f.doc.dispatch('visibilitychange'); }
    if (change === 'blur') { f.state.focused = false; f.host.dispatch('blur'); }
    if (change === 'focus-target') { f.doc.activeElement = { tagName: 'INPUT' }; f.doc.dispatch('focusin', { target: f.doc.activeElement }); }
    if (change === 'release') f.controller.release('round-start');
    // Reads themselves also latch missed availability changes.
    released(f.controller.getOpponentInput());
    f.state.paused = false; f.state.active = true; f.state.focused = true;
    f.doc.hidden = false; f.doc.activeElement = f.canvas;
    f.controller.poll(); released(f.controller.getOpponentInput());
    f.key('keydown', 'Numpad1', { repeat: true }); released(f.controller.getOpponentInput());
    f.key('keydown', 'Numpad1'); released(f.controller.getOpponentInput());
    f.key('keyup', 'Numpad1'); f.key('keydown', 'Numpad1'); assert.equal(f.controller.getOpponentInput().light, true);
  }
});

test('menu keys, modified keys and repeats from before activation cannot manufacture combat presses', t => {
  for (const fields of [{ target: { tagName: 'INPUT' } }, { target: { tagName: 'BUTTON' } },
    { target: { isContentEditable: true } }, { ctrlKey: true }, { metaKey: true }, { altKey: true },
    { defaultPrevented: true }, { repeat: true }]) {
    const f = fixture(); t.after(() => f.controller.stop());
    f.key('keydown', 'Numpad2', fields); released(f.controller.getOpponentInput());
    f.key('keydown', 'Numpad2', { repeat: true }); released(f.controller.getOpponentInput());
    f.key('keyup', 'Numpad2'); f.key('keydown', 'Numpad2'); assert.equal(f.controller.getOpponentInput().heavy, true);
  }
});

test('pad ownership is explicit, stable under array reordering and never falls back to a shared pad', t => {
  const f = fixture(); t.after(() => f.controller.stop()); const first = pad(0), second = pad(1), third = pad(2);
  f.state.pads = [third, second, first]; f.controller.poll();
  press(first, 2); press(second, 3); f.controller.poll();
  assert.equal(f.controller.getPlayerInput().light, true); assert.equal(f.controller.getPlayerInput().heavy, false);
  assert.equal(f.controller.getOpponentInput().heavy, true); assert.equal(f.controller.getOpponentInput().light, false);
  press(first, 2, 0); press(second, 3, 0); press(third, 1); f.state.pads.reverse(); f.controller.poll();
  released(f.controller.getPlayerInput()); released(f.controller.getOpponentInput());
  assert.deepEqual(f.controller.view().padAssignments, { player: 0, opponent: 1 });
  assert.throws(() => createXenoTrialsLocalInputV232({ playerGamepadIndex: 1, opponentGamepadIndex: 1 }), /share/);
  for (const invalid of [-1, 1.2, NaN, '1']) assert.throws(() => createXenoTrialsLocalInputV232({ opponentGamepadIndex: invalid }), /index/);
  const other = createXenoTrialsLocalInputV232({ playerGamepadIndex: null, opponentGamepadIndex: 2 }); t.after(() => other.stop());
  other.poll([third]); press(third, 1, 0); other.poll([third]); press(third, 1); other.poll([third]);
  assert.equal(other.getOpponentInput().special, true); released(other.getPlayerInput());
});

test('all gamepad techniques and team controls stay isolated with strict thresholds and one right-stick command', t => {
  const f = fixture(); t.after(() => f.controller.stop()); const p = pad(1); f.state.pads = [p]; f.controller.poll();
  for (const [action, index] of [['jump', 0], ['guard', 6], ['light', 2], ['heavy', 3], ['special', 1],
    ['super', 7], ['evade', 11], ['tag', 10], ['assist', 8]]) {
    press(p, index); f.controller.poll(); assert.equal(f.controller.getOpponentInput()[action], true);
    released(f.controller.getPlayerInput()); press(p, index, 0); f.controller.poll();
  }
  assert.equal(f.state.pauses.length, 0, 'Back belongs to assist in local play');
  for (const [axes, action] of [[[-.8, 0, 0, 0], 'left'], [[.8, 0, 0, 0], 'right'], [[0, .8, 0, 0], 'crouch'],
    [[0, 0, .7, -.9], 'antiAir'], [[0, 0, .7, .9], 'parry'], [[0, 0, -.9, .7], 'signature2'], [[0, 0, .9, .7], 'signature3']]) {
    p.axes = axes; f.controller.poll(); assert.deepEqual(Object.entries(f.controller.getOpponentInput()).filter(([, value]) => value), [[action, true]]);
  }
  for (const value of [NaN, Infinity, -.30, .30]) {
    p.axes = [value, NaN, NaN, Infinity]; f.controller.poll(); released(f.controller.getOpponentInput());
  }
  for (const value of [.54, NaN, Infinity]) {
    p.buttons[6] = p.buttons[7] = { value, pressed: true }; f.controller.poll(); released(f.controller.getOpponentInput());
  }
});

test('both disconnect paths release keyboard and pads once; replacements and reconnects need neutral', t => {
  for (const nativeEvent of [false, true]) {
    const f = fixture(); t.after(() => f.controller.stop()); const first = pad(0), second = pad(1), unused = pad(3);
    f.state.pads = [first, second]; f.controller.poll(); press(second, 2); press(first, 3); f.controller.poll();
    f.key('keydown', 'Numpad3');
    // Losing player pad first must also suppress the later sampled opponent.
    f.state.pads = [second, unused]; if (nativeEvent) f.host.dispatch('gamepaddisconnected', { gamepad: first });
    f.controller.poll(); released(f.controller.getPlayerInput()); released(f.controller.getOpponentInput());
    assert.deepEqual(f.state.disconnected, [{ side: 'player', index: 0 }]);
    f.controller.poll(); assert.equal(f.state.disconnected.length, 1);
    f.state.pads.push(first); f.host.dispatch('gamepadconnected', { gamepad: first }); f.controller.poll();
    released(f.controller.getPlayerInput()); released(f.controller.getOpponentInput());
    press(first, 3, 0); press(second, 2, 0); f.key('keyup', 'Numpad3'); f.controller.poll();
    press(first, 3); press(second, 2); f.controller.poll();
    assert.equal(f.controller.getPlayerInput().heavy, true); assert.equal(f.controller.getOpponentInput().light, true);
  }
});

test('pause, wrong focus and inactive phases require neutral gamepads before any resumed action', t => {
  for (const reason of ['pause', 'focus', 'intro', 'identity']) {
    const f = fixture(); t.after(() => f.controller.stop()); const p = pad(1); f.state.pads = [p]; f.controller.poll();
    press(p, 2); f.controller.poll(); assert.equal(f.controller.getOpponentInput().light, true);
    if (reason === 'pause') f.state.paused = true;
    if (reason === 'focus') f.doc.activeElement = { tagName: 'SELECT' };
    if (reason === 'intro') f.state.active = false;
    if (reason === 'identity') p.id = 'replacement';
    f.controller.poll(); released(f.controller.getOpponentInput());
    f.state.paused = false; f.state.active = true; f.doc.activeElement = f.canvas;
    f.controller.poll(); released(f.controller.getOpponentInput());
    press(p, 2, 0); f.controller.poll(); press(p, 2); f.controller.poll();
    assert.equal(f.controller.getOpponentInput().light, true);
  }
});

test('Start resumes a paused match once and simultaneous starts do not cancel the transition', t => {
  const f = fixture(); t.after(() => f.controller.stop()); const first = pad(0), second = pad(1);
  f.state.pads = [first, second]; f.controller.poll(); press(first, 9); press(second, 9); f.controller.poll();
  assert.deepEqual(f.state.pauses, [{ side: 'player', index: 0 }]);
  f.state.paused = true; for (let count = 0; count < 3; count++) f.controller.poll();
  assert.equal(f.state.pauses.length, 1); released(f.controller.getPlayerInput()); released(f.controller.getOpponentInput());
  press(first, 9, 0); press(second, 9, 0); f.controller.poll(); press(second, 9); f.controller.poll();
  assert.deepEqual(f.state.pauses[1], { side: 'opponent', index: 1 });
  f.state.paused = false; f.controller.poll(); released(f.controller.getOpponentInput());
});

test('optional RAF and listeners have a terminal idempotent cleanup', () => {
  const frames = new Map(), canceled = []; let next = 0;
  const f = fixture({ requestAnimationFrame: callback => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: id => { canceled.push(id); frames.delete(id); } });
  assert.equal(frames.size, 1); const callback = frames.get(1); frames.delete(1); callback();
  assert.equal(frames.size, 1); f.key('keydown', 'Numpad1');
  assert.equal(f.controller.stop(), true); assert.equal(f.controller.stop(), false);
  assert.equal(frames.size, 0); assert.deepEqual(canceled, [2]);
  assert.equal(f.host.count(), 0); assert.equal(f.doc.count(), 0);
  f.key('keydown', 'Numpad1'); callback(); f.controller.poll([pad(1)]);
  released(f.controller.getOpponentInput()); assert.equal(frames.size, 0);
  assert.throws(() => createXenoTrialsLocalInputV232({ requestAnimationFrame() {} }), /cancellation/);
});

test('release callbacks can read inputs or stop the owner without recursion or orphan listeners', () => {
  let controller, reads = 0;
  const f = fixture({ onRelease() {
    reads++; released(controller.getOpponentInput()); controller.release('nested'); controller.stop();
  } });
  controller = f.controller;
  f.key('keydown', 'Numpad1'); f.state.paused = true;
  controller.release('pause');
  assert.equal(reads, 2); assert.equal(f.host.count(), 0); assert.equal(f.doc.count(), 0);
  assert.equal(controller.view().stopped, true); released(controller.getOpponentInput());
});

test('native engine receives a human opponent, stays idle without input and follows only P2 commands', t => {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'warrior', introSeconds: 0 });
  const f = fixture({ onRelease: (side, input) => releaseXenoTrialsControlsV150(match, side, input) });
  t.after(() => f.controller.stop()); const opponent = match.fighters[1], start = opponent.x;
  const step = (seconds = 1 / 120) => { f.controller.poll(); stepXenoTrialsMatchV96(match, seconds, f.controller.getPlayerInput(), f.controller.getOpponentInput()); };
  for (let tick = 0; tick < 240; tick++) step();
  assert.equal(match.opponentInputSourceV163, 'direct'); assert.equal(opponent.x, start);
  assert.equal(opponent.attack, null); assert.equal(opponent.stats.hits, 0);
  f.key('keydown', 'ArrowLeft'); for (let tick = 0; tick < 60; tick++) step();
  assert.ok(opponent.x < start - 30); assert.equal(match.fighters[0].x, 310);
  f.key('keyup', 'ArrowLeft'); f.key('keydown', 'Numpad1'); step();
  assert.equal(opponent.attack?.kind, 'light'); assert.equal(match.fighters[0].attack, null);
  setXenoTrialsPausedV96(match, true); f.state.paused = true; f.controller.poll();
  f.key('keyup', 'Numpad1'); setXenoTrialsPausedV96(match, false); f.state.paused = false;
  step(); assert.equal(match.opponentInputSourceV163, 'direct');
});

test('CPU exhibitions expose P1 pad team commands without claiming P2 keys, pad, or release callbacks', t => {
  const f = fixture({ opponentEnabled: false }); t.after(() => f.controller.stop());
  const first = pad(0), second = pad(1);
  f.state.pads = [first, second]; f.controller.poll();
  assert.deepEqual(f.controller.view().padAssignments, { player: 0, opponent: null });
  for (const code of Object.keys(XENO_TRIALS_LOCAL_OPPONENT_KEYS_V232)) {
    assert.equal(f.controller.ownsKey(code), false); assert.equal(f.controller.ownsOpponentKey(code), false);
    assert.equal(f.key('keydown', code).prevented, false); f.key('keyup', code);
  }
  press(second, 2); press(second, 9); f.controller.poll();
  released(f.controller.getOpponentInput()); released(f.controller.getPlayerInput());
  assert.equal(f.state.pauses.length, 0);
  for (const [index, action] of [[10, 'tag'], [8, 'assist']]) {
    press(first, index); f.controller.poll(); assert.equal(f.controller.getPlayerInput()[action], true);
    released(f.controller.getOpponentInput()); press(first, index, 0); f.controller.poll();
  }
  f.key('keydown', 'KeyR'); f.key('keydown', 'KeyG');
  assert.equal(f.controller.getPlayerInput().tag, true); assert.equal(f.controller.getPlayerInput().assist, true);
  f.controller.release('round'); f.controller.stop();
  assert.ok(f.state.releases.length > 0); assert.ok(f.state.releases.every(([side]) => side === 'player'));
  assert.equal(f.state.disconnected.length, 0);
});
