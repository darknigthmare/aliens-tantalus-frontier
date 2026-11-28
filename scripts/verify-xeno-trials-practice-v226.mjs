import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_ACID_POOL_V152 } from '../src/xeno-trials-acid-pools-v152.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_DECOMPRESSION_OPERATION_V224 as collector,
  getXenoTrialsCollectorViewV224 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, normalizeXenoTrialsPracticeV207,
  XENO_TRIALS_PRACTICE_DRILLS_V225, XENO_TRIALS_PRACTICE_DRILLS_V226 } from '../src/xeno-trials-practice-v207.js';

const right = { right: true }, left = { left: true }, light = { light: true }, interact = { interact: true };

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  const events = [];
  let serial = match.serial;

  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
    events.push(...match.events.filter(event => event.id > serial));
    serial = match.serial;
  }

  function until(condition, input = {}, limit = 3200) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++) {
      step(typeof input === 'function' ? input() : input);
    }
    assert.ok(condition(), JSON.stringify(coach.view()));
  }

  return { match, coach, player, opponent, events, step, until };
}

test('the 59 native workshops keep all previous entries and admit only canonical completion IDs', () => {
  const ids = ['guard-crossup', 'acid-lane', 'collector-vent'];
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V226.length, 59);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V226.slice(0, -3), XENO_TRIALS_PRACTICE_DRILLS_V225);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V226.slice(-3).map(entry => entry.id), ids);
  assert.deepEqual(normalizeXenoTrialsPracticeV207(['collector-vent', 'unknown', 'guard-crossup', 'acid-lane', 'acid-lane']), ids);
  for (const id of ids) assert.ok(start(id).coach.active);
});

test('native frontal Light blocks, the Runner crosses in the air, and a grounded Light hits the same guard from behind', () => {
  const { match, coach, player, opponent, step, until, events } = start('guard-crossup');
  const maxHp = opponent.hp;
  until(() => getXenoTrialsBodyGapV105(player, opponent) <= 35, right);
  step(light);
  until(() => coach.view().index === 1);
  const block = events.find(event => event.type === 'block');
  assert.equal(block.attacker, 'player');
  assert.equal(opponent.hp, maxHp - block.damage);
  assert.ok(opponent.guard && player.x < opponent.x && player.facing === 1 && opponent.facing === -1);
  until(() => !player.attack);
  step({ ...right, jump: true });
  until(() => coach.view().index === 2, right);
  assert.ok(player.y > 0 && player.x > opponent.x && opponent.guard);
  until(() => player.y === 0, () => player.x < opponent.x + 45 ? right : {});
  assert.equal(player.facing, opponent.facing);
  assert.ok(opponent.guard);
  step(light);
  until(() => coach.view().state === 'complete');
  const [hit] = events.filter(event => event.type === 'hit');
  assert.ok(hit.id > block.id && hit.damage > block.damage);
  assert.equal(hit.attacker, 'player');
  assert.equal(opponent.hp, maxHp - hit.damage - block.damage);
  assert.equal(match.result, null);
});

test('a physical side switch without making the target block produces a specific retry and no objective credit', () => {
  const { coach, player, opponent, step, until, events } = start('guard-crossup');
  until(() => getXenoTrialsBodyGapV105(player, opponent) <= 35, right);
  step({ ...right, jump: true });
  until(() => coach.view().state === 'retry', right);
  assert.equal(coach.view().index, 0);
  assert.equal(coach.view().retryCue, 'FAITES BLOQUER VOTRE FRAPPE, PUIS PASSEZ DERRIÈRE');
  assert.ok(player.y > 0 && player.x > opponent.x && opponent.guard);
  assert.equal(events.some(event => ['attack', 'hit', 'block'].includes(event.type)), false);
});

test('retreat draws a Runner that cleared the pool line back onto one native pool for two guarded pulses', () => {
  const { match, coach, player, opponent, step, until, events } = start('acid-lane');
  step({ special: true });
  until(() => coach.view().index === 1);
  const castingX = player.x;
  assert.ok(match.acidPoolsV152.some(pool => pool.owner === 'player' && pool.bornTick === match.tick));
  let outsideX = opponent.x;
  until(() => player.x <= castingX - 42, () => {
    const body = getXenoTrialsBodyBoundsV105(opponent);
    if (match.acidPoolsV152.every(pool => body.left > pool.right + 30)) outsideX = Math.max(outsideX, opponent.x);
    return left;
  });
  until(() => coach.view().index === 2);
  const pulse = events.findLast(event => event.type === 'acid-contact-v152');
  const pool = match.acidPoolsV152.find(item => item.id === pulse.poolId);
  const body = getXenoTrialsBodyBoundsV105(opponent);
  const health = opponent.hp;
  assert.equal(pool.owner, 'player');
  assert.ok(opponent.guard && body.left < pool.right && outsideX - opponent.x > 32);
  until(() => coach.view().state === 'complete');
  const second = events.findLast(event => event.type === 'acid-contact-v152');
  assert.deepEqual([second.poolId, second.tick - pulse.tick, health - opponent.hp],
    [pulse.poolId, XENO_TRIALS_ACID_POOL_V152.intervalTicks, XENO_TRIALS_ACID_POOL_V152.damage]);
  assert.equal(events.filter(event => event.type === 'attack' && event.side === 'player').length, 1);
  assert.ok(opponent.guard);
});

test('without a native retreat the pool expires outside the Runner and the coach explains how to retry', () => {
  const { match, coach, player, opponent, step, until, events } = start('acid-lane');
  step({ special: true });
  until(() => coach.view().index === 1);
  const x = player.x, health = opponent.hp;
  until(() => coach.view().state === 'retry');
  assert.equal(coach.view().index, 1);
  assert.equal(coach.view().retryCue, 'RECULEZ APRÈS LA FORMATION DE LA FLAQUE');
  assert.equal(match.acidPoolsV152.length, 0);
  assert.equal(player.x, x);
  assert.equal(opponent.hp, health);
  assert.equal(events.some(event => event.type === 'acid-contact-v152'), false);
});

function collectorInput(player, target) {
  return { left: player.x > target.x + 22, right: player.x < target.x - 22, interact: Math.abs(player.x - target.x) < 55 };
}

for (const first of [0, 1]) test(`collector validates rerouted pressure, second vent and central airlock after vent ${first + 1}`, () => {
  const { match, coach, player, until, events } = start('collector-vent');
  const state = match.operationV188;
  const [west, east, airlock] = collector.objectives;
  const [initialVent, remainingVent] = first === 0 ? [west, east] : [east, west];
  until(() => match.tick === 84, interact);
  assert.equal(state.progress[2], 0);
  until(() => coach.view().index === 1, () => collectorInput(player, initialVent));
  assert.equal(coach.view().cue, first === 0 ? 'PRESSION REPORTÉE À L’EST' : 'PRESSION REPORTÉE À L’OUEST');
  assert.equal(getXenoTrialsCollectorViewV224(match).openSide, first === 0 ? 'right' : 'left');
  const initialIntegrity = state.integrity;
  until(() => coach.view().index === 2, () => collectorInput(player, remainingVent));
  assert.equal(initialIntegrity - state.integrity, 4);
  assert.equal(state.progress[2], 0);
  until(() => coach.view().index === 3, () => collectorInput(player, remainingVent));
  assert.equal(getXenoTrialsCollectorViewV224(match).phase, 'opening');
  assert.equal(getXenoTrialsCollectorViewV224(match).pressureLoss, 0);
  const secondAt = state.decompressionSealTicksV224[1 - first];
  until(() => coach.view().cue === 'SAS OUVERT · MAINTENEZ INTERACTION', () => collectorInput(player, airlock));
  assert.equal(match.tick, secondAt + collector.decompressionOpeningTicksV224);
  assert.equal(state.progress[2], 0);
  until(() => state.progress[2] > 0, () => collectorInput(player, airlock));
  assert.ok(match.tick > secondAt + collector.decompressionOpeningTicksV224);
  until(() => coach.view().state === 'complete', () => collectorInput(player, airlock));
  assert.deepEqual(events.filter(event => event.type === 'operation-objective-v188').map(event => event.objectiveId),
    [initialVent.id, remainingVent.id, airlock.id]);
  assert.equal(match.result.reason, 'operation-complete');
});

test('abandoning the open vents gives the practice retry after the native operation fails', () => {
  const { match, coach, until } = start('collector-vent');
  // Stay at the closed airlock. The resulting failure may come from pressure or the live horde.
  until(() => coach.view().state === 'retry', {}, 22000);
  assert.ok(match.result?.winner === 'opponent' && match.operationV188.status === 'failed');
  assert.equal(coach.view().index, 0);
  assert.equal(coach.view().retryCue, 'SCELLEZ LE CONDUIT OUVERT AVANT LA PERTE DE CONFINEMENT');
});
