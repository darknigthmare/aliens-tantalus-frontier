import assert from 'node:assert/strict';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96, completeXenoTrialsPracticeV207, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, normalizeXenoTrialsPracticeV207,
  XENO_TRIALS_PRACTICE_V207 } from '../src/xeno-trials-practice-v207.js';

function prepare(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  function step(controls = {}, frames = 1) {
    for (let frame = 0; frame < frames && coach.view().state === 'active'; frame++) {
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, typeof controls === 'function' ? controls(match) : controls, coach.opponentInput());
      coach.observe();
    }
  }
  return { match, coach, step };
}
const assertCompleted = ({ coach, match }) => {
  assert.equal(coach.view().state, 'complete', coach.view().title);
  assert.equal(match.result, null);
};

assert.deepEqual(normalizeXenoTrialsPracticeV207(['unknown', 'guard', 'guard', 'distance']), ['distance', 'guard']);
assert.equal(getXenoTrialsPracticeConfigV207('unknown'), null);
assert.equal(new Set(XENO_TRIALS_PRACTICE_V207.map(lesson => lesson.id)).size, 9);

{
  const trial = prepare('distance');
  trial.step({ light: true }, 60);
  assert.equal(trial.coach.view().index, 1);
  assert.equal(trial.match.fighters[0].stats.hits, 0);
  trial.step({ right: true }, 220);
  trial.step({ light: true }, 50);
  assertCompleted(trial);
  assert.equal(trial.match.fighters[0].stats.hits, 1);
}
{
  const trial = prepare('guard');
  trial.step({ guard: true }, 900);
  assertCompleted(trial);
  assert.equal(trial.match.fighters[0].stats.blocks, 2);
}
{
  const trial = prepare('evasion');
  trial.step(match => ({ jump: Boolean(match.fighters[1].attack) }), 900);
  assertCompleted(trial);
  assert.equal(trial.match.fighters[1].stats.hits, 0);
}
{
  const trial = prepare('rupture');
  trial.step({ right: true }, 220);
  trial.step({ heavy: true }, 115);
  assert.equal(trial.coach.view().state, 'active');
  trial.step({}, 4);
  trial.step({ heavy: true }, 110);
  assertCompleted(trial);
  assert.ok(trial.match.events.some(event => event.type === 'guard-break'));
}
{
  const trial = prepare('escape');
  trial.step(match => ({ guard: Boolean(match.grappleV153) }), 1200);
  assertCompleted(trial);
  assert.equal(trial.match.fighters[0].stats.grappleEscapesV153, 1);
}
{
  const trial = prepare('super');
  assert.equal(trial.match.fighters[0].superMeterV148, 100);
  trial.step({ super: true }, 360);
  assertCompleted(trial);
  assert.equal(trial.match.fighters[0].superMeterV148, 0);
  assert.equal(trial.match.fighters[0].stats.supersV148, 1);
}
{
  const trial = prepare('low');
  trial.step({ right: true }, 220);
  trial.step({ crouch: true, light: true }, 65);
  assertCompleted(trial);
  assert.ok(trial.match.events.some(event => event.kind === 'low'));
}
{
  const trial = prepare('anti-air');
  trial.step(match => ({ antiAir: match.fighters[1].y > 0 }), 1200);
  assertCompleted(trial);
  assert.ok(trial.match.events.some(event => event.kind === 'anti-air'));
}
{
  const trial = prepare('advance');
  trial.step({ right: true }, 125);
  trial.step({ right: true, evade: true }, 6);
  trial.step({ light: true }, 60);
  assertCompleted(trial);
  assert.ok(trial.match.events.some(event => event.kind === 'advance'));
}
{
  const trial = prepare('super');
  trial.step({ left: true }, 980);
  trial.step({ super: true }, 480);
  assert.equal(trial.coach.view().state, 'retry');
  assert.equal(trial.coach.view().index, 1);
  assert.equal(trial.match.fighters[0].stats.hits, 0);
  assert.equal(trial.match.fighters[0].superMeterV148, 0);
}
{
  const original = normalizeXenoTrialsProgressV96(createXenoTrialsProgressV96());
  const marked = completeXenoTrialsPracticeV207(original, 'distance');
  assert.equal(marked.applied, true);
  assert.deepEqual(marked.state, { ...original, practiceClearedV207: ['distance'] });
  assert.equal(completeXenoTrialsPracticeV207(marked.state, 'distance').applied, false);
  assert.equal(completeXenoTrialsPracticeV207(original, 'unknown').applied, false);
  const next = beginXenoTrialsV96(marked.state, { playerId: 'warrior', opponentId: 'runner' });
  assert.equal(next.applied, true);
  assert.deepEqual(next.state.practiceClearedV207, ['distance']);
  assert.equal(completeXenoTrialsPracticeV207(next.state, 'guard').applied, false);
  assert.deepEqual(JSON.parse(JSON.stringify(next.state)).practiceClearedV207, ['distance']);
}
console.log('Xeno Trials V207 · neuf ateliers, échec du super et progression sans prime validés');
