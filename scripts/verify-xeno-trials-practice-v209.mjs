import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207 } from '../src/xeno-trials-practice-v207.js';
import { createXenoTrialsPracticeObserverV209, normalizeXenoTrialsRecordingV209 } from '../src/xeno-trials-practice-v209.js';
import { beginXenoTrialsV96, configureXenoTrialsSandboxV208, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96,
  saveXenoTrialsRecordingV209 } from '../src/xeno-trials-progress-v96.js';

function prepare(id, settings, clip) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id, settings), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match, settings, clip);
  const step = (controls = {}, frames = 1) => {
    for (let frame = 0; frame < frames && coach.active; frame++) {
      const player = typeof controls === 'function' ? controls(match, coach.view()) : controls;
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, player, coach.opponentInput(player));
      coach.observe(player, true);
    }
  };
  return { match, coach, step };
}

test('bounded input recording compacts repeat frames and enforces its own schema', () => {
  const recorder = createXenoTrialsPracticeObserverV209();
  assert.equal(recorder.startRecording(), true);
  recorder.sample({ right: true });
  assert.equal(recorder.stopRecording(), false);
  assert.equal(recorder.view().recording.error, true);
  assert.equal(recorder.startRecording(), true);
  for (let tick = 0; tick < 1200; tick++) recorder.sample({ right: true, unrelated: true });
  assert.deepEqual(recorder.pendingRecording(), { version: 209, duration: 960, runs: [[960, 2]] });
  assert.equal(normalizeXenoTrialsRecordingV209({ version: 209, runs: [[961, 0]] }), null);
  assert.equal(normalizeXenoTrialsRecordingV209({ version: 209, runs: [[30, -1]] }), null);
  assert.equal(normalizeXenoTrialsRecordingV209({ version: 208, runs: [[30, 0]] }), null);
  assert.deepEqual(normalizeXenoTrialsRecordingV209({ version: 209, runs: [[12, 3], [12, 3]] }).runs, [[24, 3]]);
  recorder.acknowledgeRecording();
  assert.equal(recorder.pendingRecording(), null);
  assert.equal(recorder.view().recording.available, 960);
});

test('captured controls play in reverse direction through the real simulation on repeated rounds and loop edges', () => {
  const live = prepare('sandbox', { behavior: 'idle' });
  assert.equal(live.coach.recordingV209.start(), true);
  live.step({ right: true }, 34);
  live.step({ light: true }, 60);
  assert.equal(live.coach.recordingV209.stop(), true);
  const tape = live.coach.recordingV209.pending();
  assert.equal(tape.duration, 94);
  const copy = prepare('sandbox', { behavior: 'recording' }, tape);
  copy.step({}, 95);
  assert.ok(copy.match.fighters[1].x < 690);
  assert.equal(copy.match.events.filter(event => event.type === 'attack' && event.side === 'opponent' && event.kind === 'light').length, 1);
  copy.step({}, 97);
  assert.equal(copy.match.events.filter(event => event.type === 'attack' && event.side === 'opponent' && event.kind === 'light').length, 2);
  const observer = createXenoTrialsPracticeObserverV209({ version: 209, runs: [[40, 2]] });
  assert.deepEqual(observer.playingInput(30, 1), {});
  assert.deepEqual(observer.playingInput(31, 1), { left: true, right: false });
  assert.deepEqual(observer.playingInput(71, 1), {});
  assert.deepEqual(observer.playingInput(72, 1), { left: true, right: false });
  assert.deepEqual(observer.playingInput(100, 2), {});
});

test('the contact panel counts real native block damage once without counting a missed attack', () => {
  const trial = prepare('sandbox', { behavior: 'guard' });
  trial.step({ light: true }, 70);
  assert.equal(trial.coach.view().telemetryV209.lastContact, null);
  trial.step({ right: true }, 220);
  trial.step({ light: true }, 52);
  const { player, opponent, lastContact } = trial.coach.view().telemetryV209;
  assert.equal(player.impacts, 0);
  assert.equal(opponent.blocks, 1);
  assert.equal(lastContact.kind, 'block');
  assert.equal(lastContact.source, 'player');
  assert.equal(player.damage, lastContact.damage);
  trial.step({}, 20);
  assert.equal(trial.coach.view().telemetryV209.opponent.blocks, 1);
});

test('recording cannot change the rated economy or configure an absent or malformed clip', () => {
  const original = normalizeXenoTrialsProgressV96(createXenoTrialsProgressV96());
  const clip = normalizeXenoTrialsRecordingV209({ version: 209, runs: [[48, 2], [54, 16]] });
  assert.equal(configureXenoTrialsSandboxV208(original, { behavior: 'recording' }).applied, false);
  const saved = saveXenoTrialsRecordingV209(original, clip);
  assert.deepEqual(saved.state, { ...original, practiceRecordingV209: clip });
  assert.equal(saveXenoTrialsRecordingV209(saved.state, clip).unchanged, true);
  const configured = configureXenoTrialsSandboxV208(saved.state, { behavior: 'recording' });
  assert.deepEqual(normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(configured.state))), configured.state);
  const corrupt = normalizeXenoTrialsProgressV96({ ...configured.state, practiceRecordingV209: { version: 209, runs: [[0, 0]] } });
  assert.equal(corrupt.practiceRecordingV209, undefined);
  assert.equal(corrupt.practiceSandboxV208.behavior, 'cpu');
  const ticket = beginXenoTrialsV96(saved.state, { playerId: 'warrior', opponentId: 'runner' });
  assert.equal(saveXenoTrialsRecordingV209(ticket.state, clip).applied, false);
});

test('the hard native AI approaches and makes legal contact when specials are locked', () => {
  const trial = prepare('legal-counter');
  trial.step({ guard: true }, 350);
  assert.equal(trial.coach.view().index, 1);
  assert.equal(trial.match.opponentInputSourceV163, 'cpu');
  assert.equal(trial.match.config.rulesV119.noSpecial, true);
  let press = true;
  trial.step((match, view) => {
    const gap = getXenoTrialsBodyGapV105(...match.fighters);
    if (gap > 43) return { right: true };
    press = !press;
    return { light: press };
  }, 600);
  assert.equal(trial.coach.view().state, 'complete');
  assert.ok(trial.match.events.every(event => !['special', 'super', 'signature-2', 'signature-3'].includes(event.kind)));
});

test('the Queen produces a live residue puddle and leaving its collision area breaks the cadence', () => {
  const idle = prepare('acid-floor');
  idle.step({}, 700);
  assert.equal(idle.coach.view().index, 2);
  assert.equal(idle.coach.view().state, 'active');
  const trial = prepare('acid-floor');
  let safeEdge;
  trial.step((match, view) => {
    if (view.index < 2) return {};
    safeEdge ??= Math.min(...match.acidPoolsV152.map(pool => pool.left)) - 12;
    const body = getXenoTrialsBodyBoundsV105(match.fighters[0]);
    return { left: body.right > safeEdge };
  }, 1500);
  assert.equal(trial.coach.view().state, 'complete');
  assert.ok(trial.match.events.some(event => event.type === 'acid-contact-v152' && event.side === 'player'));
  assert.ok(getXenoTrialsBodyBoundsV105(trial.match.fighters[0]).right <= safeEdge);
});
