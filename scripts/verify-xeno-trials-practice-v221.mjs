import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsOperationViewV188 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V220,
  XENO_TRIALS_PRACTICE_DRILLS_V221 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
  }
  function until(condition, input = {}, limit = 1600) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++)
      step(typeof input === 'function' ? input() : input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until };
}

function terminalRuntime(reducedMotion = false) {
  const handlers = new Map(), pending = new Map();
  let time = 0, token = 0, resultCalls = 0, checkpointCalls = 0;
  const document = { activeElement: null, hidden: false, hasFocus: () => true };
  const context = new Proxy({ measureText: () => ({ width: 20 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (target, key) => target[key] ?? (() => {}) });
  const canvas = { tagName: 'CANVAS', width: 1000, height: 560, ownerDocument: document, getContext: () => context,
    setAttribute() {}, focus() { document.activeElement = canvas; } };
  canvas.focus();
  const runtime = createXenoTrialsRuntimeV96({ canvas, document, reducedMotion, window: {
    addEventListener(type, handler) { handlers.set(type, handler); }, removeEventListener(type) { handlers.delete(type); },
  }, config: getXenoTrialsPracticeConfigV207('terminal-choice'), practiceV207: 'terminal-choice', audioEnabled: false,
  loadImage: async () => ({ naturalWidth: 1024, naturalHeight: 1024 }),
  requestAnimationFrame: callback => { pending.set(++token, callback); return token; }, cancelAnimationFrame: id => pending.delete(id),
  onResult() { resultCalls++; }, onCheckpoint() { checkpointCalls++; return true; } });
  function press(code, down = true) { handlers.get(down ? 'keydown' : 'keyup')?.({ code, target: canvas, preventDefault() {} }); }
  function frames(count) {
    for (let frame = 0; frame < count; frame++) {
      time += 1000 / 60;
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach(callback => callback(time));
    }
  }
  function until(condition, limit = 300) {
    for (let frame = 0; frame < limit && !condition(); frame++) frames(1);
    assert.ok(condition(), JSON.stringify(runtime.getState().practiceV207));
  }
  function winDuel() {
    press('ArrowRight');
    frames(82);
    press('ArrowRight', false);
    press('KeyJ');
    until(() => runtime.getState().phase === 'match-over');
    press('KeyJ', false);
    return runtime.getState();
  }
  return { runtime, press, frames, until, winDuel, counts: () => [resultCalls, checkpointCalls] };
}

function assertSameVerdict(before, after) {
  assert.equal(after.tick, before.tick);
  assert.equal(after.timeRemaining, before.timeRemaining);
  assert.deepEqual(after.result, before.result);
  assert.deepEqual(after.events, before.events);
  assert.deepEqual(after.fighters.map(({ hp, x, y }) => [hp, x, y]), before.fighters.map(({ hp, x, y }) => [hp, x, y]));
}

test('the normal F action and the alternate choice complete after the same real grounded duel verdict', async () => {
  for (const choose of ['keyboard', 'alternative']) {
    const host = terminalRuntime();
    const { runtime } = host;
    try {
      assert.equal(await runtime.start(), true);
      assert.equal(runtime.activateFinisher(), false);
      assert.equal(runtime.skipSequence(), false);
      const won = host.winDuel();
      assert.equal(won.result?.winner, 'player');
      assert.equal(won.result?.reason, 'ko');
      assert.equal(won.practiceV207.state, 'active');
      assert.equal(won.practiceV207.index, 1);
      assert.equal(won.finisherV207.kind, 'seal');
      assert.equal(won.canActivateFinisherV207, true);
      assert.equal(won.finisherV207.alternatives[0].kind, 'isolation');
      assert.equal(runtime.activateFinisher('unknown'), false);
      assert.equal(runtime.pause(), true);
      assert.equal(runtime.activateFinisher(), false);
      host.frames(60);
      assert.equal(runtime.getState().finisherV207.elapsedMs, won.finisherV207.elapsedMs);
      assert.equal(runtime.resume(), true);
      if (choose === 'keyboard') host.press('KeyF');
      else assert.equal(runtime.activateFinisher(won.finisherV207.alternatives[0].id), true);
      const playing = runtime.getState();
      assert.equal(playing.finisherV207.phase, 'playing');
      assert.equal(playing.finisherV207.kind, choose === 'keyboard' ? 'seal' : 'isolation');
      assert.equal(playing.practiceV207.state, 'active');
      host.until(() => runtime.getState().practiceV207.state === 'complete');
      const done = runtime.getState();
      assert.equal(done.finisherV207.phase, 'complete');
      assertSameVerdict(won, done);
      assert.deepEqual(host.counts(), [0, 0]);
    } finally { runtime.stop(); }
  }
});

test('declining the offer by skip, timeout or reduced-motion closure retains that real verdict and emits no rated receipt', async () => {
  for (const action of ['skip', 'timeout', 'reduced-motion']) {
    const host = terminalRuntime(action === 'reduced-motion');
    const { runtime } = host;
    try {
      assert.equal(await runtime.start(), true);
      const won = host.winDuel();
      assert.equal(won.practiceV207.index, 1);
      assert.equal(won.practiceV207.state, 'active');
      assert.equal(won.canActivateFinisherV207, action !== 'reduced-motion');
      assert.equal(won.canSkipSequenceV212, true);
      if (action !== 'timeout') assert.equal(runtime.skipSequence(), true);
      else host.until(() => runtime.getState().practiceV207.state === 'complete');
      const done = runtime.getState();
      assert.equal(done.practiceV207.state, 'complete');
      assert.equal(done.finisherV207?.phase ?? null, action === 'reduced-motion' ? null : 'declined');
      assertSameVerdict(won, done);
      assert.deepEqual(host.counts(), [0, 0]);
    } finally { runtime.stop(); }
  }
});

test('the actual Brute emits a live leftbound wave avoided by a real jump or displacement beyond its range', () => {
  for (const method of ['jump', 'retreat']) {
    const { match, coach, player, opponent, step, until } = start('ground-wave-counter');
    const health = player.hp;
    until(() => coach.view().index === 1);
    const attackId = opponent.attack.id;
    const initialX = player.x;
    const move = method === 'retreat' ? { left: true } : {};
    until(() => coach.view().cue === 'ONDE AU SOL', move);
    const wave = match.projectiles.find(projectile => projectile.owner === 'opponent' && projectile.direction === -1);
    assert.equal(wave.style, 'ground-wave');
    assert.equal(wave.groupIdV147, attackId);
    const endpoint = wave.x + wave.vx * wave.life;
    if (method === 'jump') step({ jump: true });
    until(() => coach.view().state === 'complete', move);
    const body = getXenoTrialsBodyBoundsV105(player);
    if (method === 'jump') {
      assert.equal(player.x, initialX);
      assert.ok(body.bottom > wave.y + wave.radiusV147);
      assert.ok(wave.x < body.left - wave.radiusV147);
    } else {
      assert.ok(body.right < endpoint - wave.radiusV147);
      assert.ok(body.bottom === 0 && player.x < initialX);
    }
    assert.equal(player.hp, health);
  }
});

test('waiting on the floor or merely blocking the wave does not certify an escape', () => {
  for (const guard of [false, true]) {
    const { match, coach, player, until } = start('ground-wave-counter');
    const health = player.hp;
    until(() => coach.view().state === 'retry', { guard });
    assert.equal(coach.view().index, 2);
    assert.ok(player.hp < health);
    assert.ok(match.events.some(event => event.type === (guard ? 'block' : 'hit') && event.side === 'player'));
  }
});

function fightAtWestPost(match, interact) {
  const { target } = getXenoTrialsOperationViewV188(match);
  const [player, ...enemies] = match.fighters;
  const nearest = enemies.sort((left, right) => Math.abs(left.x - player.x) - Math.abs(right.x - player.x))[0];
  const x = target.x;
  const canFightHere = nearest && Math.abs(x - player.x) < 72;
  const destination = canFightHere ? Math.max(x - 50, Math.min(x + 50, nearest.x)) : x;
  const distance = Math.abs(nearest?.x - player.x);
  const cadence = match.tick % 54;
  return { left: player.x > destination + 5, right: player.x < destination - 5, interact,
    heavy: cadence === 0 && distance < 220, light: cadence === 27 && distance < 175, special: cadence === 15 && distance < 210 };
}

test('the western post charges only during the first native relief window after the four scouts fall', () => {
  const { match, coach, step, until } = start('relief-window');
  step({ interact: true });
  assert.equal(coach.view().index, 1);
  assert.equal(getXenoTrialsOperationViewV188(match).target.progress, 0);
  for (let frame = 0; frame < 35; frame++) step({ interact: true });
  assert.equal(getXenoTrialsOperationViewV188(match).reliefV220.phase, 'combat');
  assert.equal(getXenoTrialsOperationViewV188(match).target.progress, 0);
  until(() => coach.view().cue === 'RELÈVE OUVERTE · MAINTENEZ INTERACTION', () => fightAtWestPost(match, true));
  assert.equal(match.opponentInputSourceV163, 'cpu');
  assert.equal(match.hordeV180.totalKills, 4);
  assert.equal(match.hordeV180.wave, 1);
  assert.equal(getXenoTrialsOperationViewV188(match).reliefV220.remainingTicks, 120);
  until(() => coach.view().state === 'complete', { interact: true });
  assert.equal(match.hordeV180.phase, 'intermission');
  assert.equal(match.hordeV180.wave, 1);
  assert.deepEqual(match.operationV188.completed, [true, false, false]);
  assert.equal(match.events.findLast(event => event.type === 'operation-objective-v188').objectiveId, 'relief-west');
  assert.equal(match.result, null);
});

test('the incoming wave wipes a late partial charge and ends the workshop in retry', () => {
  const { match, coach, step, until } = start('relief-window');
  step({ interact: true });
  until(() => coach.view().index === 2, () => fightAtWestPost(match, false));
  until(() => getXenoTrialsOperationViewV188(match).reliefV220.remainingTicks === 20, () => fightAtWestPost(match, false));
  for (let frame = 0; frame < 8; frame++) step({ interact: true });
  const partial = getXenoTrialsOperationViewV188(match).target;
  assert.ok(partial.progress > 0 && partial.progress < partial.requiredTicks);
  until(() => coach.view().state === 'retry', { interact: true });
  assert.equal(match.hordeV180.wave, 2);
  assert.equal(getXenoTrialsOperationViewV188(match).target.progress, 0);
  assert.equal(match.operationV188.completed[0], false);
});

test('44 workshops preserve all 41 earned practice marks and the rated economy', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V221.length, 44);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V221.slice(0, 41), XENO_TRIALS_PRACTICE_DRILLS_V220);
  const old = XENO_TRIALS_PRACTICE_DRILLS_V220.map(entry => entry.id);
  const additions = ['terminal-choice', 'ground-wave-counter', 'relief-window'];
  const original = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: old });
  let profile = original;
  for (const id of additions) {
    const completed = completeXenoTrialsPracticeV207(profile, id);
    assert.equal(completed.applied, true);
    profile = completed.state;
    assert.equal(completeXenoTrialsPracticeV207(profile, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(profile), { ...original, practiceClearedV207: [...old, ...additions] });
});
