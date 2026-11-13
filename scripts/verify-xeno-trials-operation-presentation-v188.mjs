import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_OPERATIONS_V188 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsOperationHudV188, getXenoTrialsOperationBriefingV188, drawXenoTrialsOperationV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { createXenoTrialsGamepadV186 } from '../src/xeno-trials-gamepad-v186.js';
import { publicXenoSpritePathAdmissionV188, verifyXenoSpriteAdmissionsV188 } from './public-xeno-sprite-admissions-v188.mjs';

function matchFor(entry) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior',
    activityV119: { branch: 'operations', id: entry.id } });
  assert.ok(ticket.applied);
  return { match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }), config: ticket.config };
}
// Canvas and standard gamepads below are explicit presentation/input doubles.
// They do not establish a browser victory, a physical pad, or authored timing.
function canvas() {
  const calls = [], values = {};
  const ctx = new Proxy(values, { get(target, key) {
    return key in target ? target[key] : (...args) => calls.push({ key, args });
  }, set(target, key, value) { target[key] = value; return true; } });
  return { ctx, calls };
}

test('forty operation briefings and both world planes read actual objective locations without changing a native match', () => {
  for (const entry of XENO_TRIALS_OPERATIONS_V188) {
    const { match } = matchFor(entry), before = JSON.stringify(match), view = getXenoTrialsOperationHudV188(match);
    assert.equal(view.id, entry.id); assert.ok(view.target && Number.isFinite(view.target.x));
    assert.equal(view.phase, 'OPÉRATION ACTIVE'); assert.ok(!/objective|carrying/.test(view.instruction));
    assert.equal(getXenoTrialsOperationBriefingV188({ ...entry, branch: 'operations' }).operation, true);
    for (const plane of ['rear', 'front']) {
      const { ctx, calls } = canvas(), drawn = drawXenoTrialsOperationV188(ctx, match, XENO_TRIALS_ARENA_V96, { plane });
      assert.equal(drawn.id, entry.id); assert.ok(calls.length > 0);
      for (const { args } of calls) for (const value of args) if (typeof value === 'number') assert.ok(Number.isFinite(value));
      if (plane === 'front') for (const call of calls.filter(call => call.key === 'fillText')) assert.ok(call.args[2] > XENO_TRIALS_ARENA_V96.floor);
    }
    assert.equal(JSON.stringify(match), before);
  }
});

test('the compass recognizes physical contact by a giant body even when its center is outside the interaction radius', () => {
  const { match } = matchFor(XENO_TRIALS_OPERATIONS_V188.find(entry => entry.kind === 'relay'));
  // Prepared spatial fixture for a presentation-only contact check.
  const player = match.fighters[0]; player.id = 'queen';
  const target = getXenoTrialsOperationHudV188(match).target, initial = getXenoTrialsBodyBoundsV105(player);
  player.x += target.x + target.radius - initial.left - 1;
  assert.ok(Math.abs(player.x - target.x) > target.radius);
  const before = JSON.stringify(match);
  assert.match(getXenoTrialsOperationHudV188(match).instruction, /MAINTENEZ INTERAGIR/);
  assert.equal(JSON.stringify(match), before);
  player.x += 1000; assert.match(getXenoTrialsOperationHudV188(match).instruction, /^← /);
  player.x -= 2000; assert.match(getXenoTrialsOperationHudV188(match).instruction, / →$/);
});

test('old duels have no operation paint or synthetic objective state', () => {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner' }), before = JSON.stringify(match);
  const { ctx, calls } = canvas();
  assert.equal(getXenoTrialsOperationHudV188(match), null);
  assert.equal(drawXenoTrialsOperationV188(ctx, match, XENO_TRIALS_ARENA_V96), null);
  assert.equal(calls.length, 0); assert.equal(JSON.stringify(match), before);
});

test('L3 interaction is opt-in and held interaction cannot acknowledge neutrality through pause or focus loss', () => {
  const pad = { index: 0, mapping: 'standard', connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ value: 0 })) };
  const adapter = createXenoTrialsGamepadV186(), active = { active: true, focused: true };
  adapter.sample([pad], active); pad.buttons[10].value = 1;
  assert.equal(Object.keys(adapter.sample([pad], active).input).length, 8);
  adapter.reset();
  assert.ok(!adapter.sample([pad], { ...active, allowInteract: true }).input.interact);
  pad.buttons[10].value = 0; adapter.sample([pad], { ...active, allowInteract: true });
  pad.buttons[10].value = 1;
  assert.equal(adapter.sample([pad], { ...active, allowInteract: true }).input.interact, true);
  for (const mode of [{ paused: true }, { focused: false }]) {
    adapter.sample([pad], { ...active, allowInteract: true, ...mode });
    assert.ok(!adapter.sample([pad], { ...active, allowInteract: true }).input.interact);
    pad.buttons[10].value = 0; adapter.sample([pad], { ...active, allowInteract: true }); pad.buttons[10].value = 1;
    assert.equal(adapter.sample([pad], { ...active, allowInteract: true }).input.interact, true);
  }
});

test('only four exact reviewed sprite files enter their release namespace and their PNG bytes remain pinned', async () => {
  for (const id of ['warrior', 'runner', 'prowler', 'spitter'])
    assert.equal(publicXenoSpritePathAdmissionV188(`assets/openai/sprites/xeno-trials-v188/${id}-combat-sheet.png`), true);
  for (const name of ['candidate.png', 'warrior-combat-sheet-copy.png', 'nested/sheet.png', '../warrior-combat-sheet.png'])
    assert.equal(publicXenoSpritePathAdmissionV188(`assets/openai/sprites/xeno-trials-v188/${name}`), false);
  assert.equal(publicXenoSpritePathAdmissionV188('assets/openai/sprites/xeno-trials-v188', { directory: true }), true);
  assert.equal(await verifyXenoSpriteAdmissionsV188(process.cwd()), 4);
});
