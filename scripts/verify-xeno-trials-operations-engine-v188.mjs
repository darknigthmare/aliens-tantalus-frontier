import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_OPERATIONS_V188 as operations, getXenoTrialsOperationV188 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsProgressV96, beginXenoTrialsV96, checkpointXenoTrialsV186,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, getXenoTrialsSnapshotV96,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96 } from '../src/xeno-trials-engine-v96.js';
import { releaseXenoTrialsControlsV150 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V186 as historical } from '../src/xeno-trials-horde-v180.js';

const copy = value => JSON.parse(JSON.stringify(value));
function fixture(id, playerId = 'queen') {
  const progress = createXenoTrialsProgressV96();
  // Ownership fixture only: the admitted Queen permits the complete forty-route
  // input smoke test. Health, clocks, objective work, enemies and results remain
  // native. These Node runs are not a claim of browser or visual verification.
  if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
  const ticket = beginXenoTrialsV96(progress, { playerId, activityV119: { branch: 'operations', id } });
  assert.equal(ticket.applied, true);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true }) };
}
function objectiveControls(match) {
  const state = match.operationV188, entry = getXenoTrialsOperationV188(state.operationId), player = match.fighters[0];
  const target = entry.kind === 'escort' ? state.cargoX : entry.kind === 'extraction'
    ? state.carrying >= 0 ? entry.depot.x : state.delivered.every(Boolean) ? entry.exit.x
      : entry.objectives[state.completed.findIndex(value => !value)]?.x ?? entry.exit.x
    : entry.objectives[state.completed.findIndex(value => !value)]?.x ?? player.x;
  return { left: player.x > target + 15, right: player.x < target - 15, interact: true,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 };
}
function clearControls(match) {
  const player = match.fighters[0], target = match.fighters.slice(1).sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  return { left: target?.x < player.x, right: target?.x > player.x,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 };
}

for (const entry of operations) test(`${entry.id}: real objective inputs, native CPUs, hazards and one guarded settlement`, () => {
  const { ticket, match: initial } = fixture(entry.id); let match = initial, progress = ticket.state, resumed = false;
  assert.equal(match.config.stageId, entry.stageId); assert.equal(match.config.roundSeconds, entry.roundSeconds);
  assert.equal(match.operationV188.operationId, entry.id); assert.ok(match.fighters.length >= 4);
  assert.equal(getXenoTrialsStageHazardViewV188(match)?.stageId, entry.stageId);
  while (!match.result && match.tick < (entry.roundSeconds + 1) * 120) {
    stepXenoTrialsMatchV96(match, 1 / 120, objectiveControls(match));
    if (!match.result && match.tick % 600 === 0) {
      const transaction = checkpointXenoTrialsV186(progress, match);
      assert.equal(transaction.applied, true, `${entry.id} checkpoint at ${match.tick}`);
      progress = transaction.state;
      if (entry.id.endsWith('-1') && !resumed) {
        const loaded = normalizeXenoTrialsProgressV96(copy(progress));
        const snapshot = loaded.pending.checkpointV186.snapshot;
        const restored = restoreXenoTrialsHordeMatchV180(snapshot); assert.ok(restored);
        assert.deepEqual(restored.fighters, match.fighters); assert.deepEqual(restored.operationV188, match.operationV188);
        assert.deepEqual(restored.stageHazardsV188, match.stageHazardsV188); assert.equal(restored.rng, match.rng);
        match = restored; setXenoTrialsPausedV96(match, false); releaseXenoTrialsControlsV150(match, 'player', {}); resumed = true;
      }
    }
  }
  assert.ok(match.result); assert.equal(match.result.rounds, 1);
  assert.equal(match.result.operationV188.state.operationId, entry.id);
  assert.equal(match.result.operationV188.state.status, match.result.winner === 'player' ? 'completed' : 'failed');
  if (entry.id.endsWith('-1')) assert.equal(match.result.winner, 'player', 'each physical objective family is completed by native controls');
  const settled = settleXenoTrialsV96(progress, match.result); assert.equal(settled.applied, true);
  assert.equal(settled.state.pending, null); assert.equal(settled.state.ledger.length, 1);
  assert.equal(settled.state.modesV119.operationsCleared.includes(entry.id), match.result.winner === 'player');
  assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
});

test('clearing the complete native horde cannot finish a relay; its empty battlefield checkpoint resumes the unfinished objective', () => {
  const { ticket, match } = fixture('xto188-relay-1');
  // Neutral CPU controls isolate the kill-only boundary. Every player movement,
  // hit, enemy death, reinforcement and objective counter remains native.
  while (!match.result && match.hordeV180.phase !== 'complete') stepXenoTrialsMatchV96(match, 1 / 120, clearControls(match), {});
  assert.equal(match.result, null); assert.equal(match.phase, 'active'); assert.equal(match.operationV188.status, 'active');
  assert.deepEqual(match.operationV188.completed, [false, false, false]); assert.equal(match.fighters.length, 1);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const resumed = restoreXenoTrialsHordeMatchV180(copy(saved.state.pending.checkpointV186.snapshot));
  assert.ok(resumed); assert.equal(resumed.hordeV180.phase, 'complete'); assert.equal(resumed.fighters.length, 1);
  setXenoTrialsPausedV96(resumed, false); releaseXenoTrialsControlsV150(resumed, 'player', {});
  while (!resumed.result && resumed.tick < 120 * 140) stepXenoTrialsMatchV96(resumed, 1 / 120, objectiveControls(resumed));
  assert.equal(resumed.result?.winner, 'player'); assert.equal(resumed.result.reason, 'operation-complete');
  assert.equal(settleXenoTrialsV96(saved.state, resumed.result).applied, true);
});

test('pause freezes objective charges and hazard cadence; terminal and forged operation states cannot be restored or settled', () => {
  const { ticket, match } = fixture('xto188-relay-1');
  for (let tick = 0; tick < 700; tick++) stepXenoTrialsMatchV96(match, 1 / 120, objectiveControls(match));
  setXenoTrialsPausedV96(match, true); const before = getXenoTrialsSnapshotV96(match);
  for (let tick = 0; tick < 1200; tick++) stepXenoTrialsMatchV96(match, 1 / 120, { interact: true });
  assert.deepEqual(getXenoTrialsSnapshotV96(match), before);
  const saved = checkpointXenoTrialsV186(ticket.state, before); assert.equal(saved.applied, true);
  for (const mutate of [
    value => { value.config.operationV188.id = 'xto188-purge-1'; },
    value => { value.operationV188.operationId = 'xto188-purge-1'; },
    value => { value.operationV188.status = 'completed'; }, value => { value.operationV188.integrity = 101; },
    value => { value.stageHazardsV188.seed++; }, value => { value.stageHazardsV188.startedTick = 1; },
    value => { value.stageHazardsV188.playerDamage++; }, value => { value.operationV188.progress[0] = 999999; }
  ]) {
    const corrupt = copy(before); mutate(corrupt);
    assert.equal(checkpointXenoTrialsV186(ticket.state, corrupt).applied, false, mutate.toString());
  }
  setXenoTrialsPausedV96(match, false); releaseXenoTrialsControlsV150(match, 'player', {});
  while (!match.result) stepXenoTrialsMatchV96(match, 1 / 120, objectiveControls(match));
  assert.equal(match.result.winner, 'player'); assert.equal(checkpointXenoTrialsV186(ticket.state, match).applied, false);
  for (const mutate of [
    result => { result.operationV188.state.operationId = 'xto188-purge-1'; },
    result => { result.operationV188.completedObjectives = 0; }, result => { result.operationV188.state.completed[0] = false; },
    result => { result.reason = 'horde-cleared'; }, result => { delete result.operationV188; },
    result => { result.stageHazardsV188.seed++; }, result => { result.hordeV180.protocolId = 'xth180-incoming-1'; }
  ]) {
    const corrupt = copy(match.result); mutate(corrupt);
    assert.equal(settleXenoTrialsV96(saved.state, corrupt).applied, false, mutate.toString());
  }
  assert.equal(settleXenoTrialsV96(saved.state, match.result).applied, true);
});

test('the eighty historical protocols never create operations or stage hazards, and old eight-control checkpoints remain loadable', () => {
  for (const entry of historical) {
    const progress = createXenoTrialsProgressV96();
    const ticket = beginXenoTrialsV96(progress, { playerId: 'warrior', activityV119: { branch: 'horde', id: entry.id } });
    const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
    assert.equal(match.operationV188, undefined); assert.equal(match.stageHazardsV188, undefined);
    // Legacy saved controls predate interaction. Keep their exact actor state.
    for (const actor of match.fighters) { delete actor.previousInput.interact; delete actor.rearmControls.interact; }
    const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true, entry.id);
    const normalized = normalizeXenoTrialsProgressV96(copy(saved.state));
    assert.ok(normalized.pending.checkpointV186);
    assert.ok(restoreXenoTrialsHordeMatchV180(normalized.pending.checkpointV186.snapshot));
  }
});

test('winning a fresh replay ticket cannot pay an operation validation prize twice', () => {
  const first = fixture('xto188-relay-1');
  // Passive CPU fixture isolates repeat reward settlement. Both objective runs
  // still use native movement, interaction work, hazards and final verdicts.
  while (!first.match.result) stepXenoTrialsMatchV96(first.match, 1 / 120, objectiveControls(first.match), {});
  assert.equal(first.match.result.winner, 'player');
  const earned = settleXenoTrialsV96(first.ticket.state, first.match.result); assert.equal(earned.applied, true);
  assert.equal(earned.receipt.modeReward.bonus, getXenoTrialsOperationV188('xto188-relay-1').reward);
  const replay = beginXenoTrialsV96(earned.state, { playerId: 'queen', activityV119: { branch: 'operations', id: 'xto188-relay-1' } });
  assert.equal(replay.applied, true);
  const match = createXenoTrialsMatchV96({ ...replay.config, introSeconds: 0 });
  while (!match.result) stepXenoTrialsMatchV96(match, 1 / 120, objectiveControls(match), {});
  assert.equal(match.result.winner, 'player');
  const settled = settleXenoTrialsV96(replay.state, match.result); assert.equal(settled.applied, true);
  assert.equal(settled.receipt.modeReward.bonus, 0); assert.equal(settled.receipt.credits, 80);
  assert.deepEqual(settled.state.modesV119.operationsCleared, ['xto188-relay-1']);
});
