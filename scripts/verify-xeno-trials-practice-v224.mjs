import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_BEACON_OPERATION_V219 as battery } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V223, XENO_TRIALS_PRACTICE_DRILLS_V224 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_SUPER_METER_V148 } from '../src/xeno-trials-supers-v148.js';

const holdSuper = { super: true };
const full = XENO_TRIALS_SUPER_METER_V148.maximum;
const hitBy = (event, side) => event.type === 'hit' && event.attacker === side;

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  const events = [...match.events];
  let serial = match.serial;
  function step(input = {}, frames = 1) {
    for (let index = 0; index < frames && coach.active; index++) {
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
      coach.observe(input, true);
      events.push(...match.events.filter(event => event.id > serial));
      serial = match.serial;
    }
  }
  function until(condition, input = {}, limit = 2000) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++)
      step(typeof input === 'function' ? input() : input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until, events };
}

test('the airborne Super is refused, a held input stays unspent past landing, and a true new press earns native contact', () => {
  const { match, coach, player, opponent, step, until, events } = start('super-rearm');
  const rivalHealth = opponent.hp;
  assert.equal(player.superMeterV148, full);
  step({ jump: true });
  assert.ok(player.y > 0 && player.vy > 0);
  assert.equal(coach.view().cue, 'APPUYEZ SUR SUPER ET MAINTENEZ');
  step(holdSuper);
  assert.equal(coach.view().cue, 'MAINTENEZ SUPER JUSQU’À LA RÉCEPTION');
  assert.equal(player.superMeterV148, full);
  assert.equal(player.attack, null);
  until(() => coach.view().cue === 'RELÂCHEZ PUIS RÉAPPUYEZ SUR SUPER', holdSuper);
  assert.equal(player.y, 0);
  assert.equal(player.previousInput.super, true);
  step(holdSuper, 60);
  assert.equal(player.superMeterV148, full);
  assert.equal(coach.view().index, 3);
  assert.equal(events.some(event => event.kind === 'super'), false);
  step();
  step(holdSuper);
  assert.equal(player.superMeterV148, 0);
  assert.equal(player.attack.kind, 'super');
  const id = player.attack.id;
  until(() => match.projectiles.some(shot => shot.superIdV148 === 'warden-acid-barrage'));
  until(() => coach.view().state === 'complete');
  const attacks = events.filter(event => event.kind === 'super');
  assert.deepEqual(attacks.map(({ id, superIdV148 }) => [id, superIdV148]), [[id + 1, 'warden-acid-barrage']]);
  assert.ok(events.some(event => hitBy(event, 'player') && event.tick > attacks[0].tick));
  assert.ok(opponent.hp < rivalHealth);
});

test('releasing Super before landing fails that attempt and a new practice run is available unspent', () => {
  const trial = start('super-rearm');
  trial.step({ jump: true });
  trial.step(holdSuper, 12);
  assert.equal(trial.coach.view().index, 2);
  trial.step();
  assert.equal(trial.coach.view().state, 'retry');
  assert.ok(trial.player.y > 0);
  assert.equal(trial.player.superMeterV148, full);
  assert.equal(trial.events.some(event => event.kind === 'super'), false);
  const restarted = start('super-rearm');
  assert.equal(restarted.coach.view().index, 0);
  assert.equal(restarted.player.superMeterV148, full);
});

test('the native Synth pulse precedes the Burster’s real death burst and a safe KO verdict', () => {
  const { match, coach, player, opponent, step, until, events } = start('burster-range');
  const playerHealth = player.hp;
  step({ special: true });
  const cast = player.attack.id;
  assert.equal(coach.view().index, 1);
  until(() => match.projectiles.some(shot => shot.id === cast && shot.owner === 'player' && shot.style === 'pulse'));
  until(() => coach.view().state === 'complete');
  const strike = events.find(event => hitBy(event, 'player'));
  const discharge = events.find(event => event.type === 'burster-death-v151');
  const verdict = events.find(event => event.type === 'match-end');
  assert.equal(discharge.tick, strike.tick);
  assert.ok(strike.id < discharge.id && discharge.id < verdict.id);
  assert.ok(discharge.x - getXenoTrialsBodyBoundsV105(player).right > discharge.radius);
  assert.equal(match.result?.winner, 'player');
  assert.equal(match.result.reason, 'ko');
  assert.equal(opponent.hp, 0);
  assert.equal(player.hp, playerHealth);
});

test('a real close KO still produces the explosion and double KO without crediting range training', () => {
  const { coach, player, opponent, step, until, events } = start('burster-range');
  until(() => getXenoTrialsBodyGapV105(player, opponent) <= 20, { right: true });
  assert.equal(coach.view().cue, 'ÉLOIGNEZ-VOUS DU BURSTER');
  step({ light: true });
  until(() => coach.view().state === 'retry');
  const explosion = events.find(event => event.type === 'burster-death-v151');
  const playerHit = events.find(event => hitBy(event, 'opponent'));
  assert.equal(explosion.tick, playerHit.tick);
  assert.equal(player.hp, 0);
  assert.equal(opponent.hp, 0);
  assert.equal(events.find(event => event.type === 'round-end').reason, 'double-ko');
  assert.equal(coach.view().index, 0);
});

function routeInput(match, order) {
  const next = order.find(index => !match.operationV188.completed[index]) ?? order[0];
  const target = battery.objectives[next].x;
  const [player, ...enemies] = match.fighters;
  const nearby = enemies.some(enemy => Math.abs(enemy.x - player.x) < 140);
  return { left: player.x > target + 14, right: player.x < target - 14, interact: Math.abs(player.x - target) < 77,
    heavy: nearby && match.tick % 105 === 0, light: nearby && match.tick % 105 === 52 };
}

test('both native traversal orders can lock all three beacons before the same reserve is depleted', () => {
  for (const order of [[0, 1, 2], [2, 1, 0]]) {
    const { match, coach, until, events } = start('battery-route');
    const status = () => getXenoTrialsOperationViewV188(match).batteryV219;
    assert.equal(status().armed, false);
    const controls = () => routeInput(match, order);
    until(() => coach.view().index === 1, controls);
    assert.equal(status().armed, true);
    assert.equal(status().remainingTicks, battery.batteryTicksV219);
    assert.equal(match.operationV188.batteryStartedTickV219, match.tick);
    assert.equal(match.opponentInputSourceV163, 'cpu');
    until(() => coach.view().state === 'complete', controls);
    const captured = events.filter(event => event.type === 'operation-objective-v188');
    assert.deepEqual(captured.map(event => event.index), order);
    assert.equal(captured[0].tick, match.operationV188.batteryStartedTickV219);
    assert.equal(match.result?.reason, 'operation-complete');
    assert.ok(status().remainingTicks > 0);
    const verdict = events.find(event => event.type === 'match-end');
    assert.ok(captured[2].id < events.find(event => event.type === 'operation-complete-v188').id);
    assert.equal(verdict.winner, 'player');
    assert.equal(verdict.tick, captured[2].tick);
  }
});

test('waiting at the first beacon exhausts the native reserve and awards no practice mark', () => {
  const { match, coach, until, events } = start('battery-route');
  const controls = () => routeInput(match, [0]);
  until(() => coach.view().index === 1, controls);
  const expires = match.tick + battery.batteryTicksV219;
  until(() => coach.view().state === 'retry', controls);
  assert.equal(match.tick, expires);
  assert.equal(match.result?.reason, 'operation-failed');
  assert.equal(getXenoTrialsOperationViewV188(match).batteryV219.remainingTicks, 0);
  assert.equal(events.find(event => event.type === 'operation-failed-v188').reason, 'structure-destroyed');
  assert.equal(coach.view().index, 1);
  assert.deepEqual(match.operationV188.completed, [true, false, false]);
});

test('the 53 workshops retain all 50 previous marks and affect only practice completion', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V224.length, 53);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V224.slice(0, 50), XENO_TRIALS_PRACTICE_DRILLS_V223);
  const ids = XENO_TRIALS_PRACTICE_DRILLS_V223.map(entry => entry.id);
  const additions = ['super-rearm', 'burster-range', 'battery-route'];
  const baseline = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: ids });
  let profile = baseline;
  for (const id of additions) {
    const completion = completeXenoTrialsPracticeV207(profile, id);
    assert.equal(completion.applied, true);
    profile = completion.state;
    assert.equal(completeXenoTrialsPracticeV207(profile, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(profile), { ...baseline, practiceClearedV207: [...ids, ...additions] });
});
