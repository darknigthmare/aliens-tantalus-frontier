import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsGamepadV186, XENO_TRIALS_GAMEPAD_ACTIONS_V186 } from '../src/xeno-trials-gamepad-v186.js';

// Standard Gamepad objects are explicit input fixtures; no physical controller
// or browser hardware mapping is claimed by these pure admission tests.
const pad = (index = 0) => ({ index, connected: true, mapping: 'standard', axes: [0, 0],
  buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) });
const press = (value, index, amount = 1) => { value.buttons[index] = { pressed: amount === 1, value: amount }; };
const active = { active: true, focused: true, paused: false };
const assertReleased = result => assert.ok(Object.values(result.input).every(value => value === false));

test('a new standard owner must release held inputs before all eight combat actions become available', () => {
  const adapter = createXenoTrialsGamepadV186(), fixture = pad(); press(fixture, 2);
  assertReleased(adapter.sample([fixture], active));
  fixture.buttons[2] = { value: 0 }; adapter.sample([fixture], active);
  for (const [action, index] of [['jump', 0], ['guard', 6], ['light', 2], ['heavy', 3], ['special', 1], ['super', 7]]) {
    press(fixture, index); assert.equal(adapter.sample([fixture], active).input[action], true);
    fixture.buttons[index] = { value: 0 }; adapter.sample([fixture], active);
  }
  fixture.axes[0] = -.9; assert.equal(adapter.sample([fixture], active).input.left, true);
  fixture.axes[0] = .9; assert.equal(adapter.sample([fixture], active).input.right, true);
  assert.deepEqual(Object.keys(adapter.sample([fixture], active).input), XENO_TRIALS_GAMEPAD_ACTIONS_V186);
});

test('deadzone, analog triggers, D-pad and conflicting directions preserve bounded boolean inputs', () => {
  const adapter = createXenoTrialsGamepadV186(), fixture = pad(); adapter.sample([fixture], active);
  for (const value of [0, -.3, .3, NaN, Infinity]) {
    fixture.axes[0] = value; assertReleased(adapter.sample([fixture], active));
  }
  fixture.axes[0] = 0; press(fixture, 6, .54); press(fixture, 7, .54);
  fixture.buttons[6].pressed = fixture.buttons[7].pressed = true; // Native browsers may use a .5 pressed threshold.
  assertReleased(adapter.sample([fixture], active));
  press(fixture, 6, .55); press(fixture, 7, .55);
  const triggers = adapter.sample([fixture], active); assert.equal(triggers.input.guard, true); assert.equal(triggers.input.super, true);
  fixture.buttons[6] = fixture.buttons[7] = { value: 0 }; press(fixture, 14); press(fixture, 15);
  assertReleased(adapter.sample([fixture], active));
  fixture.buttons[15] = { value: 0 }; assert.equal(adapter.sample([fixture], active).input.left, true);
  adapter.reset(); press(fixture, 15); assertReleased(adapter.sample([fixture], active));
  fixture.buttons[15] = { value: 0 }; assertReleased(adapter.sample([fixture], active));
  fixture.buttons[14] = { value: 0 }; adapter.sample([fixture], active);
  fixture.buttons[6] = { value: NaN, pressed: true }; fixture.buttons[7] = { value: Infinity, pressed: true };
  assertReleased(adapter.sample([fixture], active));
});

test('Start and Back toggle once per neutral press and can resume while combat is unavailable', () => {
  for (const index of [8, 9]) {
    const adapter = createXenoTrialsGamepadV186(), fixture = pad(); adapter.sample([fixture], active);
    press(fixture, index); assert.equal(adapter.sample([fixture], active).pauseToggle, true);
    for (let count = 0; count < 20; count++) assert.equal(adapter.sample([fixture], { ...active, active: false, paused: true }).pauseToggle, false);
    fixture.buttons[index] = { value: 0 }; adapter.sample([fixture], { ...active, active: false, paused: true });
    press(fixture, index); assert.equal(adapter.sample([fixture], { ...active, active: false, paused: true }).pauseToggle, true);
  }
});

test('pause, menu, blur and explicit reset require neutral controls before combat returns', () => {
  for (const unavailable of [{ active: false }, { paused: true }, { focused: false }, 'reset']) {
    const adapter = createXenoTrialsGamepadV186(), fixture = pad(); adapter.sample([fixture], active);
    press(fixture, 3); assert.equal(adapter.sample([fixture], active).input.heavy, true);
    if (unavailable === 'reset') adapter.reset();
    else assertReleased(adapter.sample([fixture], { ...active, ...unavailable }));
    assertReleased(adapter.sample([fixture], active));
    fixture.buttons[3] = { value: 0 }; adapter.sample([fixture], active);
    press(fixture, 3); assert.equal(adapter.sample([fixture], active).input.heavy, true);
  }
});

test('disconnect releases everything once, keeps ownership stable and gates replacement or returning controllers', () => {
  const adapter = createXenoTrialsGamepadV186(), first = pad(2), other = pad(3);
  adapter.sample([null, first, other], active); press(first, 2);
  assert.equal(adapter.sample([other, first], active).input.light, true);
  press(other, 3);
  const lost = adapter.sample([other], active); assert.equal(lost.disconnected, true); assertReleased(lost);
  const replacement = adapter.sample([other], active); assert.equal(replacement.index, 3); assertReleased(replacement);
  assert.equal(adapter.sample([], active).disconnected, true);
  assert.equal(adapter.sample([], active).disconnected, false);
  assert.equal(adapter.sample([{ ...pad(), mapping: 'unknown' }], active).connected, false);
});
