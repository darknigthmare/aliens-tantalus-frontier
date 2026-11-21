import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_CHALLENGE_CURRICULUM_V179 as curriculum } from '../src/xeno-trials-challenge-curriculum-v179.js';
import { XENO_TRIALS_CHALLENGES_V119, createXenoTrialsModesProgressV119,
  resolveXenoTrialsActivityV119, settleXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

test('the forty new evaluations preserve every historical challenge and admit real roster/stage IDs', () => {
  assert.deepEqual(XENO_TRIALS_CHALLENGES_V119.slice(0, 9).map(entry => entry.id), [
    'survive-queen', 'runner-mirror', 'hunter-pack', 'synthetic-xeno', 'no-special', 'one-hp', 'thirty-seconds', 'boss-rush', 'gauntlet'
  ]);
  assert.equal(curriculum.length, 40);
  assert.equal(new Set(curriculum.map(entry => entry.id)).size, 40);
  assert.equal(new Set(curriculum.map(entry => entry.stageId)).size, 40);
  for (const entry of curriculum) {
    assert.ok(XENO_TRIALS_CHALLENGES_V119.some(registered => registered.id === entry.id));
    assert.ok(XENO_TRIALS_STAGES_V96.some(stage => stage.id === entry.stageId), entry.id);
    assert.ok(entry.opponentIds.every(id => XENO_TRIALS_FIGHTERS_V96.some(fighter => fighter.id === id)), entry.id);
    const started = beginXenoTrialsV96(createXenoTrialsProgressV96(), {
      playerId: 'warrior', opponentId: 'warrior', stageId: 'containment-deck', difficulty: 'easy', roundSeconds: 30,
      activityV119: { branch: 'challenges', id: entry.id }
    });
    assert.equal(started.applied, true, entry.id);
    assert.equal(started.config.opponentId, entry.opponentIds[0]);
    assert.equal(started.config.stageId, entry.stageId);
    assert.equal(started.config.difficulty, entry.difficulty);
    assert.ok(normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(started.state))).pending, entry.id);
    const match = createXenoTrialsMatchV96(started.config);
    assert.equal(match.fighters[1].id, entry.opponentIds[0]);
    if (entry.rules.initialHp === 1) assert.deepEqual(match.fighters.map(fighter => fighter.hp), [1, 1]);
    if (entry.rules.timeLimitSeconds) assert.equal(started.config.roundSeconds, entry.rules.timeLimitSeconds);
    assert.equal(started.config.rulesV119.noSpecial, entry.rules.noSpecial === true);
    assert.equal(started.config.rulesV119.goal, entry.rules.goal || 'eliminate');
  }
});

test('a new five-duel course resumes each authored target and grants its prime only after its final duel', () => {
  const entry = curriculum.find(entry => entry.id === 'xt179-royal-gauntlet');
  let modes = createXenoTrialsModesProgressV119();
  const config = { playerId: 'warrior', activityV119: { branch: 'challenges', id: entry.id } };
  // Pure settlement fixtures exercise the production progress extension. The
  // guarded engine-to-ticket transport is verified in the existing V145 suite.
  for (let bout = 0; bout < entry.opponentIds.length; bout++) {
    const activity = resolveXenoTrialsActivityV119(config.activityV119, JSON.parse(JSON.stringify(modes)));
    assert.equal(activity.bout, bout);
    assert.equal(activity.opponentId, entry.opponentIds[bout]);
    assert.equal(activity.stageId, entry.stageId);
    const settled = settleXenoTrialsActivityV119(modes, config, { winner: 'player' });
    assert.equal(settled.receipt.continuing, bout < entry.opponentIds.length - 1);
    assert.equal(settled.receipt.bonus, bout < entry.opponentIds.length - 1 ? 0 : 750);
    modes = settled.modes;
  }
  assert.ok(modes.challengesCleared.includes(entry.id));
  assert.equal(modes.challengeRun, null);
  for (let bout = 0; bout < entry.opponentIds.length; bout++) {
    const settled = settleXenoTrialsActivityV119(modes, config, { winner: 'player' });
    assert.equal(settled.receipt.bonus, 0, 'replaying a completed course never pays its prime twice');
    modes = settled.modes;
  }
});

test('losing a new course resets its next bout without claiming completion', () => {
  const entry = curriculum.find(entry => entry.id === 'xt179-synthetic-contact');
  const config = { playerId: 'warrior', activityV119: { branch: 'challenges', id: entry.id } };
  const first = settleXenoTrialsActivityV119(createXenoTrialsModesProgressV119(), config, { winner: 'player' });
  assert.equal(first.modes.challengeRun.bout, 1);
  const loss = settleXenoTrialsActivityV119(first.modes, config, { winner: 'opponent' });
  assert.equal(loss.modes.challengeRun, null);
  assert.equal(loss.receipt.bonus, 0);
  assert.equal(loss.modes.challengesCleared.includes(entry.id), false);
  assert.equal(resolveXenoTrialsActivityV119(config.activityV119, loss.modes).opponentId, entry.opponentIds[0]);
});
