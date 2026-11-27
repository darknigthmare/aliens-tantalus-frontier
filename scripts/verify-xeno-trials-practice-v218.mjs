import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207 } from '../src/xeno-trials-moveset-v207.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V217, XENO_TRIALS_PRACTICE_DRILLS_V218 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
  }
  function until(condition, input = () => ({})) {
    for (let frame = 0; frame < 650 && coach.active && !condition(); frame++) step(input());
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until };
}

test('anti-air contact cancels the Queen’s same accepted descending strike before its active window', () => {
  for (const mode of ['cue', 'committed']) {
    const { match, coach, player, opponent, step, until } = start('air-interrupt');
    const playerHealth = player.hp;
    until(() => mode === 'cue' ? coach.view().cue === 'PRÉPAREZ L’ANTI-AIR' : coach.view().index === 2);
    assert.ok(opponent.y > 0 && opponent.vy < 0);
    assert.equal(coach.hasCueChangeV213(), true);
    assert.equal(coach.hasCueChangeV213(), false);
    step({ antiAir: true });
    until(() => coach.view().state === 'complete');
    const descent = match.events.find(event => event.type === 'attack' && event.side === 'opponent' && event.kind === 'air-hit');
    const contact = match.events.find(event => event.type === 'hit' && event.attacker === 'player');
    assert.ok(descent && contact && contact.tick > descent.tick && contact.tick - descent.tick <= 16);
    assert.equal(player.attack.kind, 'anti-air');
    assert.equal(player.hp, playerHealth);
    assert.equal(opponent.attack, null);
  }
  const untouched = start('air-interrupt');
  untouched.until(() => untouched.coach.view().state === 'retry');
  assert.ok(untouched.match.events.some(event => event.type === 'hit' && event.attacker === 'opponent'));
});

test('the native pulse clears the full standing body overhead only when the specimen remains low', () => {
  for (const crouched of [true, false]) {
    const { match, coach, player, until } = start('pulse-duck');
    const playerHealth = player.hp, playerX = player.x;
    until(() => coach.view().cue === 'MAINTENEZ BAS');
    const pulse = match.projectiles.find(projectile => projectile.owner === 'opponent');
    const standing = getXenoTrialsBodyBoundsV105(player);
    assert.ok(pulse.x > standing.right && pulse.y < standing.top);
    until(() => coach.view().state === (crouched ? 'complete' : 'retry'), () => ({ crouch: crouched }));
    if (crouched) {
      assert.equal(player.x, playerX);
      assert.ok(pulse.x < standing.left - 9 && pulse.y > getXenoTrialsHurtBoundsV207(player).top);
      assert.equal(player.hp, playerHealth);
      assert.ok(match.projectiles.includes(pulse));
    } else {
      assert.ok(player.hp < playerHealth);
      assert.ok(match.events.some(event => event.type === 'hit' && event.side === 'player' && event.attacker === 'opponent'));
    }
  }
});

test('a low jab punishes the same shield bash the player blocked while a standing strike hits the shield', () => {
  for (const crouched of [true, false]) {
    const { match, coach, opponent, step, until } = start('shield-punish');
    until(() => coach.view().cue === 'MAINTENEZ GARDE');
    const bashId = opponent.attack.id;
    until(() => coach.view().cue === 'BAS ET RAPIDE MAINTENANT', () => ({ guard: true }));
    const block = match.events.find(event => event.type === 'block' && event.side === 'player');
    assert.ok(block);
    assert.equal(opponent.attack.id, bashId);
    step({ crouch: crouched, light: true });
    until(() => coach.view().state === (crouched ? 'complete' : 'retry'));
    const response = match.events.find(event => event.type === (crouched ? 'hit' : 'block')
      && event.side === 'opponent' && event.attacker === 'player');
    assert.ok(response && response.tick > block.tick);
    assert.equal(opponent.attack?.id ?? null, crouched ? null : bashId);
  }
});

test('three new workshop completion marks preserve all 32 prior marks and all rated economy', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V218.length, 35);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V218.slice(0, 32), XENO_TRIALS_PRACTICE_DRILLS_V217);
  const oldMarks = XENO_TRIALS_PRACTICE_DRILLS_V217.map(entry => entry.id);
  const progress = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: oldMarks });
  let current = progress;
  const additions = ['air-interrupt', 'pulse-duck', 'shield-punish'];
  for (const id of additions) {
    const completed = completeXenoTrialsPracticeV207(current, id);
    assert.equal(completed.applied, true);
    current = completed.state;
    assert.equal(completeXenoTrialsPracticeV207(current, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(current), { ...progress, practiceClearedV207: [...oldMarks, ...additions] });
});
