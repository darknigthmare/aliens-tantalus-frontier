import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_SUPER_METER_V148 } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsGroundRecoveryV211 } from '../src/xeno-trials-defense-v211.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V211 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

function prepare(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  assert.ok(coach);
  function step(controls = {}, ticks = 1) {
    for (let frame = 0; frame < ticks && coach.active; frame++) {
      const player = typeof controls === 'function' ? controls(match) : controls;
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, player, coach.opponentInput(player));
      coach.observe(player, true);
    }
  }
  return { match, coach, step };
}

test('Warden spends the actual meter and a light interrupt cancels every late projectile and impact', () => {
  const fail = prepare('super-interrupt');
  fail.step({}, 850);
  assert.equal(fail.coach.view().state, 'retry');
  const trial = prepare('super-interrupt');
  assert.equal(trial.match.fighters[1].superMeterV148, 100);
  trial.step(match => ({ light: match.fighters[1].attack?.kind === 'super' }), 700);
  assert.equal(trial.coach.view().state, 'complete');
  const meterFromBeingHit = Number((trial.match.fighters[0].stats.damage * XENO_TRIALS_SUPER_METER_V148.received).toFixed(2));
  assert.equal(trial.match.fighters[1].superMeterV148, meterFromBeingHit);
  assert.equal(trial.match.fighters[1].stats.supersV148, 1);
  assert.equal(trial.match.fighters[1].stats.hits, 0);
  assert.equal(trial.match.fighters[0].hp, 220);
  assert.match(trial.match.events.find(event => event.kind === 'super').superIdV148, /warden/);
  assert.ok(trial.match.events.some(event => event.type === 'hit' && event.side === 'opponent'));
  assert.deepEqual(trial.match.projectiles, []);
});

test('the horde lesson clears five original 15-HP contacts and waits for a real second wave', () => {
  const trial = prepare('horde-reinforcements');
  assert.equal(trial.match.hordeV180.protocolId, 'xth180-incoming-1');
  assert.equal(trial.match.hordeV180.totalKills, 0);
  assert.ok(trial.match.fighters.slice(1).every(fighter => fighter.hp === 15));
  let observedIntermission = false;
  trial.step(match => {
    const [player, ...enemies] = match.fighters;
    if (match.hordeV180.phase === 'intermission') {
      observedIntermission = true;
      assert.equal(match.hordeV180.totalKills, 5);
      assert.equal(match.hordeV180.alive, 0);
      return {};
    }
    if (player.attack || player.stun > 0) return {};
    const target = enemies.filter(fighter => fighter.hp > 0)
      .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    if (!target) return {};
    const gap = getXenoTrialsBodyGapV105(player, target);
    if (gap > 54) return { [target.x >= player.x ? 'right' : 'left']: true };
    if (player.stamina >= 25) return { heavy: true };
    return { light: true };
  }, 4200);
  assert.equal(trial.coach.view().state, 'complete');
  assert.equal(observedIntermission, true);
  assert.equal(trial.match.hordeV180.wave, 2);
  assert.ok(trial.match.hordeV180.alive > 0);
  assert.equal(trial.match.result, null);
});

test('a Runner strike in descent must actually hit the Queen', () => {
  const trial = prepare('air-contact');
  trial.step({ light: true }, 65);
  assert.equal(trial.coach.view().index, 0);
  trial.step({ right: true }, 220);
  trial.step({ jump: true }, 2);
  trial.step(match => ({ light: match.fighters[0].y > 0 && match.fighters[0].vy < 0 }), 150);
  assert.equal(trial.coach.view().state, 'complete');
  assert.ok(trial.match.events.some(event => event.type === 'attack' && event.side === 'player' && event.kind === 'air-hit'));
  assert.ok(trial.match.events.some(event => event.type === 'hit' && event.attacker === 'player' && event.side === 'opponent'));
});

test('a broken standing guard requires release and a fresh guard press in the real recovery window', () => {
  const stale = prepare('guard-recovery');
  stale.step({ guard: true }, 880);
  assert.equal(stale.coach.view().index, 1);
  assert.equal(stale.coach.view().state, 'active');
  assert.equal(stale.match.events.some(event => event.type === 'get-up-v211'), false);
  const trial = prepare('guard-recovery');
  for (let i = 0; i < 430 && trial.coach.view().index === 0; i++) trial.step({ guard: true });
  assert.equal(trial.coach.view().index, 1);
  assert.ok(getXenoTrialsGroundRecoveryV211(trial.match, trial.match.fighters[0]));
  trial.step({}, 12);
  trial.step(match => ({ guard: getXenoTrialsGroundRecoveryV211(match, match.fighters[0])?.ready === true }), 85);
  assert.equal(trial.coach.view().state, 'complete');
  assert.ok(trial.match.events.some(event => event.type === 'get-up-v211' && event.side === 'player'));
});

function runtimeForOutro(reducedMotion) {
  const handlers = new Map(), pending = new Map();
  let now = 0, token = 0, verdicts = 0, checkpoints = 0;
  const document = { activeElement: null, hidden: false, hasFocus: () => true };
  const context = new Proxy({ measureText: () => ({ width: 20 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (object, key) => object[key] ?? (() => {}) });
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, ownerDocument: document, getContext: () => context, setAttribute() {}, focus() {} };
  document.activeElement = canvas;
  const runtime = createXenoTrialsRuntimeV96({ canvas, document, reducedMotion, window: {
    addEventListener(type, event) { handlers.set(type, event); }, removeEventListener(type) { handlers.delete(type); },
  }, config: getXenoTrialsPracticeConfigV207('outro-skip'), practiceV207: 'outro-skip',
  loadImage: async () => ({ naturalWidth: 1024, naturalHeight: 1024 }),
  requestAnimationFrame: handler => { pending.set(++token, handler); return token; }, cancelAnimationFrame: id => pending.delete(id),
  onResult() { verdicts++; }, onCheckpoint() { checkpoints++; return true; } });
  return { runtime, counts: () => [verdicts, checkpoints],
    press(code, on = true) { handlers.get(on ? 'keydown' : 'keyup')?.({ code, target: canvas, preventDefault() {} }); },
    step(count) { for (let frame = 0; frame < count; frame++) {
      now += 1000 / 60;
      const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(now));
    } } };
}

test('closing native terminal presentation completes practice without mutating verdict or paying a receipt', async () => {
  for (const reducedMotion of [false, true]) {
    const host = runtimeForOutro(reducedMotion), { runtime } = host;
    try {
      assert.equal(await runtime.start(), true);
      host.press('ArrowRight'); host.step(112); host.press('ArrowRight', false);
      host.press('KeyJ'); host.step(20);
      const before = runtime.getState();
      assert.equal(before.result?.winner, 'player');
      assert.equal(before.practiceV207.awaitingOutroV211, true);
      if (!reducedMotion) assert.equal(before.outroV155?.phase, 'playing');
      assert.equal(runtime.skipSequence(), true);
      assert.equal(runtime.getState().practiceV207.state, 'complete');
      assert.deepEqual(runtime.getState().result, before.result);
      assert.equal(runtime.getState().tick, before.tick);
      assert.equal(runtime.skipSequence(), false);
      assert.deepEqual(host.counts(), [0, 0]);
    } finally { runtime.stop(); }
  }
});

test('V211 keeps the existing 19 valid IDs and adds only unrated completion marks', () => {
  assert.equal(new Set(XENO_TRIALS_PRACTICE_DRILLS_V211.map(entry => entry.id)).size, 24);
  const profile = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: ['landing-evasion'] });
  const marked = completeXenoTrialsPracticeV207(profile, 'horde-reinforcements');
  assert.deepEqual(marked.state, { ...profile, practiceClearedV207: ['landing-evasion', 'horde-reinforcements'] });
});
