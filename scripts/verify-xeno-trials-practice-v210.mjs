import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { canBufferXenoTrialsLandingV210 } from '../src/xeno-trials-movement-v210.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V210 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

function prepare(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  function step(controls = {}, ticks = 1) {
    for (let i = 0; i < ticks && coach.active; i++) {
      const player = typeof controls === 'function' ? controls(match) : controls;
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, player, coach.opponentInput(player));
      coach.observe(player, true);
    }
  }
  return { match, coach, step };
}

function introHost() {
  const id = 'intro-rearm', handlers = new Map(), frames = new Map();
  let sequence = 0, clock = 0, results = 0, checkpoints = 0;
  const context = new Proxy({ measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (obj, property) => obj[property] ?? (() => {}) });
  const doc = { hidden: false, activeElement: null, hasFocus: () => true };
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, ownerDocument: doc, getContext: () => context,
    setAttribute() {}, closest: () => null, focus() { doc.activeElement = this; } };
  doc.activeElement = canvas;
  const runtime = createXenoTrialsRuntimeV96({ canvas, document: doc, window: {
    addEventListener(type, listener) { handlers.set(type, listener); },
    removeEventListener(type) { handlers.delete(type); },
  }, config: getXenoTrialsPracticeConfigV207(id), practiceV207: id,
  requestAnimationFrame: callback => { frames.set(++sequence, callback); return sequence; },
  cancelAnimationFrame: token => frames.delete(token), loadImage: async () => ({ naturalWidth: 1024, naturalHeight: 1024 }),
  onResult() { results++; }, onCheckpoint() { checkpoints++; return true; } });
  return { runtime, results: () => [results, checkpoints],
    key: (code, pressed = true) => handlers.get(pressed ? 'keydown' : 'keyup')?.({ code, target: canvas, preventDefault() {} }),
    tick(count) {
      for (let i = 0; i < count; i++) {
        const scheduled = [...frames.values()]; frames.clear(); clock += 1000 / 60;
        scheduled.forEach(listener => listener(clock));
      }
    },
  };
}

test('the native intro Skip preserves the countdown and cannot buffer a light attack', async () => {
  const host = introHost();
  const { runtime } = host;
  try {
    assert.equal(await runtime.start(), true);
    assert.equal(runtime.getState().presentation.phase, 'intro-player');
    host.key('KeyJ');
    assert.equal(runtime.skipSequence(), true);
    assert.equal(runtime.getState().presentation.phase, 'intro-opponent');
    assert.equal(runtime.getState().practiceV207.index, 1);
    assert.equal(runtime.skipSequence(), true);
    assert.equal(runtime.getState().presentation.phase, 'countdown');
    assert.equal(runtime.getState().presentation.countdown, 3);
    assert.equal(runtime.getState().tick, 0);
    host.tick(220);
    assert.ok(runtime.getState().tick > 0);
    assert.ok(runtime.getState().events.every(event => event.side !== 'player' || event.type !== 'attack'));
    assert.equal(runtime.getState().fighters[0].stats.hits, 0);
    host.key('KeyJ', false);
    host.key('ArrowRight'); host.tick(115); host.key('ArrowRight', false);
    host.key('KeyJ'); host.tick(35);
    assert.equal(runtime.getState().practiceV207.state, 'complete');
    assert.equal(runtime.getState().fighters[0].stats.hits, 1);
    assert.deepEqual(host.results(), [0, 0]);
  } finally { runtime.stop(); }
});

test('letting both introductions run does not validate the Skip objective', async () => {
  const host = introHost();
  try {
    assert.equal(await host.runtime.start(), true);
    host.tick(600);
    assert.equal(host.runtime.getState().practiceV207.state, 'retry');
    assert.equal(host.runtime.getState().practiceV207.index, 0);
    assert.deepEqual(host.results(), [0, 0]);
  } finally { host.runtime.stop(); }
});

test('a low strike defeats standing guard but a real crouch block validates the counter', () => {
  const unguarded = prepare('low-defense');
  unguarded.step({}, 250);
  assert.equal(unguarded.coach.view().index, 0);
  assert.ok(unguarded.match.events.some(event => event.type === 'hit' && event.side === 'player'));
  const trial = prepare('low-defense');
  trial.step({ guard: true }, 270);
  assert.equal(trial.coach.view().index, 1);
  assert.equal(trial.match.fighters[0].stats.blocks, 0);
  trial.step({ guard: true, crouch: true }, 350);
  assert.equal(trial.coach.view().state, 'complete');
  assert.equal(trial.match.fighters[0].stats.blocks, 1);
  assert.ok(trial.match.events.some(event => event.type === 'attack' && event.side === 'opponent' && event.kind === 'low'));
});

test('the reception drill requires the native buffered landing event instead of a grounded evade', () => {
  const trial = prepare('landing-evasion');
  trial.step({ evade: true }, 30);
  assert.equal(trial.coach.view().index, 0);
  trial.step({}, 30);
  trial.step({ jump: true }, 2);
  assert.equal(trial.coach.view().index, 1);
  trial.step({ evade: true }, 160);
  assert.equal(trial.coach.view().state, 'active');
  assert.equal(trial.match.fighters[0].y, 0);
  trial.step({}, 3);
  trial.step({ jump: true }, 1);
  trial.step(match => ({ evade: canBufferXenoTrialsLandingV210(match.fighters[0], getXenoTrialsFighterV96('prowler'), XENO_TRIALS_STEP_V96) }), 180);
  assert.equal(trial.coach.view().state, 'complete');
  assert.equal(trial.match.fighters[0].y, 0);
  assert.ok(trial.match.events.some(event => event.type === 'evade-v207' && event.side === 'player' && event.sourceV210 === 'landing'));
});

test('V210 keeps all historic IDs and writes only drill completions into existing profiles', () => {
  assert.equal(new Set(XENO_TRIALS_PRACTICE_DRILLS_V210.map(entry => entry.id)).size, 19);
  const profile = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: ['distance', 'acid-floor'] });
  const marked = completeXenoTrialsPracticeV207(profile, 'landing-evasion');
  assert.deepEqual(marked.state, { ...profile, practiceClearedV207: ['distance', 'acid-floor', 'landing-evasion'] });
  assert.equal(completeXenoTrialsPracticeV207(marked.state, 'landing-evasion').applied, false);
});
