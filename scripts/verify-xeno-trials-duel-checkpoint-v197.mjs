import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as step
} from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import {
  abandonXenoTrialsV96, beginXenoTrialsV96, checkpointXenoTrialsDuelV197, clearXenoTrialsDuelCheckpointV197,
  createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96, settleXenoTrialsV96
} from '../src/xeno-trials-progress-v96.js';

const json = value => JSON.parse(JSON.stringify(value));
function duel({ playerId = 'warrior', opponentId = 'runner', rules = {}, ...overrides } = {}) {
  const state = createXenoTrialsProgressV96();
  // Declare the unlocked player up front so this pure test can exercise their real native kit.
  state.unlocked.push(playerId);
  const started = beginXenoTrialsV96(state, { playerId, opponentId, difficulty: 'easy', roundSeconds: 30,
    activityV119: { branch: 'on-demand', id: 'on-demand', rules }, ...overrides });
  assert.equal(started.applied, true);
  const match = createXenoTrialsMatchV96({ ...started.config, introSeconds: 0, holdRoundTransition: true });
  return { match, start: started.state, ticket: started.config };
}
function playRound(match) {
  for (let n = 0; n < 4000 && match.phase === 'active'; n++) {
    const right = match.fighters[1].x >= match.fighters[0].x;
    stepXenoTrialsMatchV96(match, step, { right, left: !right, light: n % 19 < 4 });
  }
  assert.notEqual(match.phase, 'active', 'The native clock and CPU resolve the round.');
}

test('an active duel survives JSON with exact engine state and resumes deterministically', () => {
  const { match, start } = duel({ opponentId: 'arachnoid', opponentVariant: 'purple' });
  for (let n = 0; n < 370; n++) stepXenoTrialsMatchV96(match, step, { right: n < 250, jump: n === 55, light: n % 23 < 3 });
  const before = getXenoTrialsSnapshotV96(match);
  const saved = checkpointXenoTrialsDuelV197(start, before);
  assert.equal(saved.applied, true);
  assert.equal(saved.state.credits, start.credits);
  assert.deepEqual(saved.state.ledger, start.ledger);
  const loaded = normalizeXenoTrialsProgressV96(json(saved.state));
  const restored = loaded.pending.duelCheckpointV197.snapshot;
  assert.deepEqual(restored, { ...before, paused: true, accumulator: 0 });
  assert.equal(restored.fighters[1].variant, 'purple');
  setXenoTrialsPausedV96(restored, false);
  for (let n = 0; n < 45; n++) {
    const control = { heavy: n % 16 < 5 };
    stepXenoTrialsMatchV96(match, step, control);
    stepXenoTrialsMatchV96(restored, step, control);
  }
  assert.deepEqual(restored, match);
  assert.equal(before.paused, false);
  assert.deepEqual(start.pending.duelCheckpointV197, undefined);
});

test('a real round result resumes from pause with its score and same-tick next round intact', () => {
  const { match, start, ticket } = duel({ rules: { initialHp: 1 } });
  playRound(match);
  assert.equal(match.phase, 'round-over');
  const first = checkpointXenoTrialsDuelV197(start, match);
  assert.equal(first.applied, true);
  const restored = normalizeXenoTrialsProgressV96(json(first.state)).pending.duelCheckpointV197.snapshot;
  assert.equal(restored.round, 1);
  assert.equal(restored.roundWinner, match.roundWinner);
  assert.deepEqual(restored.wins, match.wins);
  assert.equal(nextXenoTrialsRoundV96(restored), false);
  setXenoTrialsPausedV96(restored, false);
  assert.equal(nextXenoTrialsRoundV96(restored), true);
  assert.equal(restored.tick, match.tick);
  assert.equal(restored.round, 2);
  assert.deepEqual(restored.fighters.map(fighter => fighter.hp), [1, 1]);
  const second = checkpointXenoTrialsDuelV197(first.state, restored);
  assert.equal(second.applied, true);
  assert.deepEqual(second.state.pending.config, ticket);
  assert.equal(second.state.pending.duelCheckpointV197.snapshot.round, 2);
});

test('in-flight native projectiles retain their authored spec and reject forged impact power', () => {
  const { match, start, ticket } = duel({ playerId: 'synth-trooper', opponentId: 'arachnoid' });
  for (let n = 0; n < 100 && !match.projectiles.some(projectile => projectile.owner === 'player'); n++)
    stepXenoTrialsMatchV96(match, step, { special: n === 0 });
  assert.ok(match.projectiles.some(projectile => projectile.owner === 'player'));
  const original = getXenoTrialsSnapshotV96(match);
  const saved = checkpointXenoTrialsDuelV197(start, original);
  assert.equal(saved.applied, true);
  assert.deepEqual(normalizeXenoTrialsProgressV96(json(saved.state)).pending.duelCheckpointV197.snapshot.projectiles, original.projectiles);
  for (const update of [shot => shot.power++, shot => shot.spec.damage++, shot => { shot.owner = 'opponent'; }]) {
    const changed = json(original);
    update(changed.projectiles.find(projectile => projectile.owner === 'player'));
    assert.equal(createXenoTrialsDuelCheckpointV197(changed, ticket), null);
  }
});

test('native restraint holds and acid pools retain their existing contact cadence', () => {
  const cases = [
    { playerId: 'prowler', opponentId: 'dd-darwin-era-cultist', field: 'grappleV153',
      controls: (n, right) => ({ right, left: !right, special: n % 245 < 2, guard: n % 98 < 7 }),
      observed: match => Boolean(match.grappleV153) },
    { playerId: 'drive-v123-fte-pathogen-queen-right-v13', opponentId: 'runner', field: 'acidPoolsV152',
      controls: n => ({ special: n % 330 === 0 }), observed: match => Boolean(match.acidPoolsV152?.length) }
  ];
  for (const scenario of cases) {
    const { match, start } = duel(scenario);
    for (let n = 0; n < 500 && !scenario.observed(match); n++) {
      const right = match.fighters[1].x >= match.fighters[0].x;
      stepXenoTrialsMatchV96(match, step, scenario.controls(n, right));
    }
    assert.equal(scenario.observed(match), true, scenario.field);
    const saved = checkpointXenoTrialsDuelV197(start, match);
    assert.equal(saved.applied, true, scenario.field);
    const restored = normalizeXenoTrialsProgressV96(json(saved.state)).pending.duelCheckpointV197.snapshot;
    assert.deepEqual(restored[scenario.field], match[scenario.field]);
    setXenoTrialsPausedV96(restored, false);
    for (let n = 0; n < 60; n++) {
      stepXenoTrialsMatchV96(match, step);
      stepXenoTrialsMatchV96(restored, step);
    }
    assert.deepEqual(restored, match, scenario.field);
  }
});

test('an invalid or foreign checkpoint preserves the underlying legacy ticket and economy', () => {
  const { match, start, ticket } = duel();
  for (let n = 0; n < 20; n++) stepXenoTrialsMatchV96(match, step, { right: true });
  const snapshot = getXenoTrialsSnapshotV96(match);
  const good = createXenoTrialsDuelCheckpointV197(snapshot, ticket);
  assert.ok(good);
  const staleTicket = normalizeXenoTrialsProgressV96(json(start));
  assert.deepEqual(staleTicket.pending.config, ticket);
  assert.equal(staleTicket.pending.duelCheckpointV197, undefined);
  const invalidSnapshotEdits = [state => { state.phase = 'match-over'; }, state => { state.result = { completed: true }; },
    state => { state.config.id = 'random'; state.config.seed++; }, state => { state.fighters[0].hp--; },
    state => { state.wins.player = 2; }, state => { state.timeRemaining++; }, state => { state.fighters[1].x = 3000; },
    state => { state.events = Array(33).fill(null); }, state => { state.serial = Number.MAX_VALUE; },
    state => { state.stageHazardsV188 = {}; }, state => { state.config.hordeV180 = {}; }, state => { state.grappleV153 = {}; },
    state => { state.extra = state; }];
  for (const edit of invalidSnapshotEdits) {
    const changed = json(snapshot);
    edit(changed);
    assert.equal(createXenoTrialsDuelCheckpointV197(changed, ticket), null);
  }
  for (const envelope of [{ ...good, matchId: 'xt96-20' }, { ...good, seed: good.seed + 1 }, { ...good, tick: good.tick + 1 }]) {
    const imported = normalizeXenoTrialsProgressV96({ ...start, pending: { ...start.pending, duelCheckpointV197: envelope } });
    assert.deepEqual(imported, staleTicket);
  }
});

test('checkpoints reject a rewind and same-tick stat changes while accepting released controls', () => {
  const { match, start } = duel();
  for (let n = 0; n < 20; n++) stepXenoTrialsMatchV96(match, step, { right: true });
  const previous = getXenoTrialsSnapshotV96(match);
  for (let n = 0; n < 20; n++) stepXenoTrialsMatchV96(match, step, { guard: true });
  const saved = checkpointXenoTrialsDuelV197(start, match);
  assert.equal(saved.applied, true);
  assert.equal(checkpointXenoTrialsDuelV197(saved.state, previous).reason, 'stale-duel-checkpoint');
  const contradiction = getXenoTrialsSnapshotV96(match);
  contradiction.fighters[0].stamina -= 1;
  assert.equal(checkpointXenoTrialsDuelV197(saved.state, contradiction).reason, 'stale-duel-checkpoint');
  setXenoTrialsPausedV96(match, true);
  assert.equal(checkpointXenoTrialsDuelV197(saved.state, match).applied, true);
  const restarted = clearXenoTrialsDuelCheckpointV197(saved.state);
  assert.equal(restarted.applied, true);
  assert.deepEqual(restarted.state, normalizeXenoTrialsProgressV96(start));
  const abandoned = abandonXenoTrialsV96(saved.state);
  assert.equal(abandoned.applied, true);
  assert.equal(abandoned.state.pending, null);
  assert.equal(abandoned.state.credits, start.credits);
});

test('a resumed duel settles a real terminal result once and refuses earlier results', () => {
  const { match, start } = duel({ rules: { initialHp: 1 } });
  playRound(match);
  const saved = checkpointXenoTrialsDuelV197(start, match);
  const durable = normalizeXenoTrialsProgressV96(json(saved.state));
  const restored = json(durable.pending.duelCheckpointV197.snapshot);
  setXenoTrialsPausedV96(restored, false);
  while (restored.phase !== 'match-over') {
    assert.equal(nextXenoTrialsRoundV96(restored), true);
    playRound(restored);
  }
  const result = restored.result;
  assert.equal(settleXenoTrialsV96(durable, { ...result, durationTicks: match.tick - 1 }).applied, false);
  const settled = settleXenoTrialsV96(durable, result);
  assert.equal(settled.applied, true);
  assert.equal(settled.state.pending, null);
  assert.equal(settled.state.ledger.length, start.ledger.length + 1);
  assert.equal(settleXenoTrialsV96(settled.state, result).applied, false);
});
