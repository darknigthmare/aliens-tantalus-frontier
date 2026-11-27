import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V212 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const grip = 'warrior::grab';
function prepare(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  assert.ok(coach);
  function step(command = {}, frames = 1) {
    for (let frame = 0; frame < frames && coach.active; frame++) {
      const input = typeof command === 'function' ? command(match) : command;
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
      coach.observe(input, true);
    }
  }
  return { match, coach, step };
}

test('Warrior can acquire the exact grounded Commando and the target escapes from a real hold', () => {
  const trial = prepare('ground-grab');
  trial.step({ guard: true, heavy: true }, 120);
  assert.equal(trial.coach.view().index, 0);
  assert.equal(trial.match.events.some(event => event.type === 'grapple-start-v153'), false);
  trial.step({ right: true }, 240);
  assert.ok(getXenoTrialsBodyGapV105(...trial.match.fighters) <= 8);
  trial.step({ guard: true, heavy: true }, 120);
  assert.equal(trial.coach.view().state, 'complete');
  assert.ok(trial.match.events.some(event => event.type === 'attack' && event.kind === 'ground-grab-v212' && event.grabIdV212 === grip));
  assert.ok(trial.match.events.some(event => event.type === 'grapple-start-v153' && event.side === 'opponent' && event.grabIdV212 === grip));
  assert.ok(trial.match.events.some(event => event.type === 'grapple-end-v153' && event.reason === 'escaped' && event.grabIdV212 === grip));
});

test('the Commando escapes after maintaining Guard, with an unreleased hold timing out on the negative path', () => {
  const failed = prepare('ground-grab-escape');
  failed.step({}, 950);
  assert.equal(failed.coach.view().index, 1);
  assert.equal(failed.coach.view().state, 'retry');
  assert.ok(failed.match.events.some(event => event.type === 'grapple-end-v153' && event.reason === 'timeout'));
  const trial = prepare('ground-grab-escape');
  trial.step(match => ({ guard: match.grappleV153?.target === 'player' }), 800);
  assert.equal(trial.coach.view().state, 'complete');
  const start = trial.match.events.find(event => event.type === 'grapple-start-v153' && event.side === 'player');
  const end = trial.match.events.find(event => event.type === 'grapple-end-v153' && event.side === 'player');
  assert.equal(start.grabIdV212, grip);
  assert.equal(end.reason, 'escaped');
  assert.equal(end.grabIdV212, grip);
  assert.ok(end.tick > start.tick);
});

test('a missing parry keeps the meter, while the accepted out-of-range native counter spends it once', () => {
  const trial = prepare('counter-whiff');
  trial.step({ guard: true, super: true });
  assert.equal(trial.coach.view().index, 1);
  assert.equal(trial.match.fighters[0].superMeterV148, 100);
  assert.equal(trial.match.fighters[0].attack, null);
  trial.step(match => {
    const enemyAttack = match.fighters[1].attack;
    if (match.events.some(event => event.type === 'parry-v208' && event.side === 'player')) return { guard: true, super: true };
    return { parry: enemyAttack?.kind === 'heavy' && enemyAttack.age >= .2 };
  }, 950);
  assert.equal(trial.coach.view().state, 'complete');
  assert.equal(trial.match.fighters[0].superMeterV148, 0);
  assert.equal(trial.match.fighters[0].stats.supersV148, 1);
  assert.equal(trial.match.fighters[0].stats.hits, 0);
  assert.ok(trial.match.events.some(event => event.type === 'parry-v208' && event.side === 'player'));
  assert.ok(trial.match.events.some(event => event.type === 'attack' && event.kind === 'super-riposte' && event.riposteIdV208 === 'razor-claws::super2'));
});

test('an operator enters the warned arc zone and evacuates before the native damaging phase', () => {
  const trial = prepare('hazard-crossing');
  assert.equal(trial.match.config.operationV188.id, 'xto188-beacon-2');
  let zone;
  trial.step(match => {
    const hazard = getXenoTrialsStageHazardViewV188(match);
    const body = getXenoTrialsBodyBoundsV105(match.fighters[0]);
    const index = trial.coach.view().index;
    if (hazard.phase === 'warning') zone ??= hazard.zones[0];
    if (index === 0 && hazard.phase === 'warning') {
      return { [body.center < (zone.left + zone.right) / 2 ? 'right' : 'left']: true };
    }
    if (index >= 1 && body.left < zone.right + 65) return { right: true };
    return {};
  }, 1350);
  assert.equal(trial.coach.view().state, 'complete');
  assert.equal(trial.match.stageHazardsV188.playerDamage, 0);
  assert.equal(trial.match.opponentInputSourceV163, 'cpu');
  assert.ok(trial.match.events.some(event => event.type === 'stage-hazard-active-v188' && event.kind === 'arc'));
  assert.equal(trial.match.result, null);
});

test('V212 adds four workshop marks while preserving historic completions and the economy', () => {
  assert.equal(new Set(XENO_TRIALS_PRACTICE_DRILLS_V212.map(entry => entry.id)).size, 28);
  const original = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: ['horde-reinforcements'] });
  const marked = completeXenoTrialsPracticeV207(original, 'counter-whiff');
  assert.deepEqual(marked.state, { ...original, practiceClearedV207: ['horde-reinforcements', 'counter-whiff'] });
});
