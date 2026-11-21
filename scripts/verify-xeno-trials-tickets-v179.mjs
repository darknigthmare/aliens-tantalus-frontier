import test from 'node:test';
import assert from 'node:assert/strict';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96,
  settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

// Persistence fixtures below start at an already-earned series checkpoint.
// They verify ticket admission, not a claimed browser playthrough.
function checkpoint() {
  const state = createXenoTrialsProgressV96();
  state.modesV119.challengeRun = { id: 'hunter-pack', bout: 1, playerId: 'warrior' };
  return state;
}
function continueSeries() {
  const started = beginXenoTrialsV96(checkpoint(), {
    playerId: 'warrior', activityV119: { branch: 'challenges', id: 'hunter-pack' }
  });
  assert.equal(started.applied, true);
  return started;
}

test('series checkpoint and its current authored ticket survive JSON persistence', () => {
  const started = continueSeries();
  const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(started.state)));
  assert.deepEqual(restored.pending, started.state.pending);
  assert.deepEqual(restored.modesV119.challengeRun, checkpoint().modesV119.challengeRun);
});

for (const [key, value] of [['opponentId', 'runner'], ['stageId', 'hive-vault'],
  ['factionId', 'rival-lab'], ['difficulty', 'hard']]) {
  test(`resumption rejects a stale or replaced series ${key} and keeps its checkpoint`, () => {
    const { state } = continueSeries();
    state.pending.config[key] = value;
    const restored = normalizeXenoTrialsProgressV96(state);
    assert.equal(restored.pending, null);
    assert.deepEqual(restored.modesV119.challengeRun, checkpoint().modesV119.challengeRun);
    assert.equal(beginXenoTrialsV96(restored, {
      playerId: 'warrior', activityV119: { branch: 'challenges', id: 'hunter-pack' }
    }).applied, true);
  });
}

for (const replacement of [null, { branch: 'on-demand', id: 'on-demand' },
  { branch: 'challenges', id: 'one-hp' }]) {
  test(`an active series cannot resume a ticket from ${replacement?.id || 'free duel'}`, () => {
    const { state } = continueSeries();
    if (replacement) state.pending.config.activityV119 = replacement;
    else delete state.pending.config.activityV119;
    assert.equal(normalizeXenoTrialsProgressV96(state).pending, null);
  });
}

test('a native engine result settles its persisted authored ticket only once', () => {
  const started = beginXenoTrialsV96(createXenoTrialsProgressV96(), {
    playerId: 'warrior', activityV119: { branch: 'challenges', id: 'one-hp' }
  });
  assert.equal(started.applied, true);
  const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(started.state)));
  const match = createXenoTrialsMatchV96({ ...restored.pending.config, introSeconds: 0 });
  for (let i = 0; i < 30000 && !match.result; i++) stepXenoTrialsMatchV96(match, 1 / 120, { right: true });
  assert.ok(match.result);
  const settled = settleXenoTrialsV96(restored, match.result);
  assert.equal(settled.applied, true);
  assert.equal(settled.state.pending, null);
  const replay = settleXenoTrialsV96(settled.state, match.result);
  assert.equal(replay.applied, false);
  assert.equal(replay.state.credits, settled.state.credits);
});
