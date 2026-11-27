import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V213, XENO_TRIALS_PRACTICE_DRILLS_V217 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const id = 'spacing-punish';

function start() {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  const toward = player.x < opponent.x ? 'right' : 'left';
  const away = toward === 'right' ? 'left' : 'right';
  const gap = () => getXenoTrialsBodyGapV105(player, opponent);
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
  }
  function until(condition, input = () => ({}), limit = 500) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++) step(input());
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  function makeHeavyWhiff() {
    until(() => coach.view().index === 1);
    assert.equal(coach.view().cue, 'RECULEZ');
    const attackId = opponent.attack.id;
    until(() => coach.view().index === 2, () => gap() < 92 ? { [away]: true } : {});
    assert.equal(opponent.attack.id, attackId);
    assert.equal(opponent.attack.hit, false);
    assert.equal(coach.view().cue, 'RAPIDE MAINTENANT');
    return attackId;
  }
  return { match, coach, player, opponent, step, until, makeHeavyWhiff, toward, gap };
}

test('the spacing drill accepts a real retreat and fresh light that hits before the same heavy finishes recovering', () => {
  const { match, coach, player, opponent, step, until, makeHeavyWhiff, toward, gap } = start();
  const startingHealth = player.hp, opponentHealth = opponent.hp;
  makeHeavyWhiff();
  assert.equal(coach.hasCueChangeV213(), true);
  assert.equal(coach.hasCueChangeV213(), false);
  until(() => gap() < 50, () => ({ [toward]: true }));
  step({ light: true });
  until(() => coach.view().state === 'complete');
  assert.equal(coach.view().index, 3);
  assert.equal(player.hp, startingHealth);
  assert.ok(opponent.hp < opponentHealth);
  assert.equal(match.events.filter(event => event.type === 'hit' && event.attacker === 'player' && event.side === 'opponent').length, 1);
  assert.equal(match.result, null);
});

test('guarding the heavy or hitting after its recovery fails the spacing drill', () => {
  const block = start();
  block.until(() => block.coach.view().index === 1);
  block.until(() => block.coach.view().state === 'retry', () => ({ guard: true }));
  assert.ok(block.match.events.some(event => event.type === 'block' && event.side === 'player'));
  assert.equal(block.coach.view().index, 1);

  const late = start();
  late.makeHeavyWhiff();
  late.until(() => late.gap() < 50, () => ({ [late.toward]: true }));
  late.until(() => late.opponent.attack.age >= .67);
  late.step({ light: true });
  assert.equal(late.player.attack?.kind, 'light');
  late.until(() => late.coach.view().state === 'retry');
  assert.equal(late.coach.view().index, 2);
  // Running the same light through its final contact shows it was too late,
  // even though it was accepted by the engine before recovery timed out.
  for (let frame = 0; frame < 15; frame++) stepXenoTrialsMatchV96(late.match, XENO_TRIALS_STEP_V96, {}, {});
  assert.ok(late.match.events.some(event => event.type === 'hit' && event.attacker === 'player'));
  assert.equal(late.coach.view().state, 'retry');
});

test('the thirty-second drill appends a reward-free completion and retains prior practice IDs', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V217.length, 32);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V217.slice(0, -1), XENO_TRIALS_PRACTICE_DRILLS_V213);
  const prior = XENO_TRIALS_PRACTICE_DRILLS_V213.map(entry => entry.id);
  const progress = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: prior });
  const completed = completeXenoTrialsPracticeV207(progress, id);
  assert.equal(completed.applied, true);
  assert.deepEqual(completed.state, { ...progress, practiceClearedV207: [...prior, id] });
  assert.deepEqual(normalizeXenoTrialsProgressV96(completed.state), completed.state);
  assert.equal(completeXenoTrialsPracticeV207(completed.state, id).applied, false);
});
