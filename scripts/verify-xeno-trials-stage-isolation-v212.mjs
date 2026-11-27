import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { abandonXenoTrialsV96, beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_OPERATION_BOARD_V212 } from '../src/xeno-trials-operations-v188.js';
import { getXenoTrialsStageHazardV188, getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { drawXenoTrialsStageHazardsV188 } from '../src/xeno-trials-stage-hazards-render-v188.js';
import { XENO_TRIALS_ISOLATION_OPERATIONS_V212 } from '../src/xeno-trials-stage-isolation-v212.js';

const clone = value => JSON.parse(JSON.stringify(value));
const advance = (match, input) => stepXenoTrialsMatchV96(match, 1 / 120, input);
function driveToObjective(match, entry) {
  const index = match.operationV188.completed.findIndex(done => !done);
  const x = entry.objectives[index].x, player = match.fighters[0];
  advance(match, { left: player.x > x + 15, right: player.x < x - 15, interact: true,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 });
}

for (const entry of XENO_TRIALS_ISOLATION_OPERATIONS_V212) {
  test(`${entry.id} can be reached, isolated, resumed and settled with native controller inputs`, () => {
    const initial = createXenoTrialsProgressV96();
    // Ownership fixture only. The even seed comes from a real abandoned ticket.
    initial.unlocked.push('queen');
    const preliminary = beginXenoTrialsV96(initial, { playerId: 'queen' });
    const abandoned = abandonXenoTrialsV96(preliminary.state);
    assert.equal(abandoned.applied, true);
    const ticket = beginXenoTrialsV96(abandoned.state, { playerId: 'queen', activityV119: { branch: 'operations', id: entry.id } });
    assert.equal(ticket.applied, true);
    assert.equal(ticket.config.stageId, entry.stageId);
    assert.equal(ticket.config.seed, 96002);
    assert.equal(XENO_TRIALS_OPERATION_BOARD_V212.includes(entry), true);
    let match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
    const definition = getXenoTrialsStageHazardV188(entry.stageId, entry.id);
    assert.equal(getXenoTrialsStageHazardViewV188(match).isolationV212.isolated, 0);

    while (!match.result && !match.operationV188.completed[0] && match.tick < 1000) driveToObjective(match, entry);
    assert.deepEqual(match.operationV188.completed, [true, false, false]);
    assert.equal(match.stageHazardsV188.playerDamage, definition.damage);
    const isolatedA = getXenoTrialsStageHazardViewV188(match).isolationV212;
    assert.deepEqual(isolatedA.circuits.map(circuit => circuit.isolated), [true, false]);

    setXenoTrialsPausedV96(match, true);
    const before = getXenoTrialsSnapshotV96(match);
    for (let wait = 0; wait < 120; wait++) advance(match, { interact: true });
    assert.deepEqual(getXenoTrialsSnapshotV96(match), before);
    assert.equal(before.stageHazardsV188.contacts, 1);
    assert.equal(before.stageHazardsV188.totalDamage, definition.damage);
    const forged = clone(before);
    forged.stageHazardsV188.totalDamage = 8;
    assert.equal(checkpointXenoTrialsV186(ticket.state, forged).applied, false);
    assert.equal(restoreXenoTrialsHordeMatchV180(forged), null);
    const stored = checkpointXenoTrialsV186(ticket.state, before);
    assert.equal(stored.applied, true);
    const persisted = normalizeXenoTrialsProgressV96(clone(stored.state));
    const checkpoint = persisted.pending.checkpointV186.snapshot;
    match = restoreXenoTrialsHordeMatchV180(checkpoint);
    assert.ok(match?.paused);
    assert.deepEqual(getXenoTrialsStageHazardViewV188(match).isolationV212, isolatedA);
    setXenoTrialsPausedV96(match, false);
    releaseXenoTrialsControlsV150(match, 'player', {});

    if (entry.stageId === 'containment-deck') {
      const activationB = definition.graceTicks + definition.periodTicks + definition.warningTicks;
      while (!match.result && match.tick < activationB) advance(match, { heavy: match.tick % 180 === 0 });
      const liveB = getXenoTrialsStageHazardViewV188(match);
      assert.equal(liveB.phase, 'active');
      assert.equal(liveB.isolationV212.scheduled, 'B');
      assert.deepEqual(liveB.isolationV212.circuits.map(circuit => circuit.isolated), [true, false]);
      assert.equal(liveB.zones[0].left, liveB.isolationV212.circuits[1].left);
    }
    while (!match.result && !match.operationV188.completed[1] && match.tick < 2100) driveToObjective(match, entry);
    const isolatedB = getXenoTrialsStageHazardViewV188(match);
    assert.equal(isolatedB.isolationV212.isolated, 2);
    assert.equal(isolatedB.phase, 'idle');
    assert.deepEqual(isolatedB.zones, []);
    assert.deepEqual(match.operationV188.completed, [true, true, false]);
    const draws = [];
    const context = { save() {}, restore() {}, strokeRect(...args) { draws.push(args); } };
    drawXenoTrialsStageHazardsV188(context, match, XENO_TRIALS_ARENA_V96, { plane: 'front', reducedMotion: true });
    assert.deepEqual(draws, isolatedB.isolationV212.circuits.map(circuit =>
      [circuit.left, XENO_TRIALS_ARENA_V96.floor + 3, circuit.right - circuit.left, 4]));

    const isolatedDamage = match.stageHazardsV188.playerDamage;
    while (!match.result && match.tick < 3000) driveToObjective(match, entry);
    assert.equal(match.result?.reason, 'operation-complete');
    assert.equal(match.result?.winner, 'player');
    assert.equal(match.result.stageHazardsV188.playerDamage, isolatedDamage);
    assert.equal(getXenoTrialsStageHazardViewV188(match), null);
    const settled = settleXenoTrialsV96(persisted, match.result);
    assert.equal(settled.applied, true);
    assert.deepEqual(settled.state.modesV119.operationsCleared, [entry.id]);
    assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
  });
}

test('the same two stages in ordinary competitive duels have no live machinery', () => {
  for (const { stageId } of XENO_TRIALS_ISOLATION_OPERATIONS_V212) {
    assert.equal(getXenoTrialsStageHazardV188(stageId), null);
    assert.equal(getXenoTrialsStageHazardV188(stageId, 'xto188-relay-1'), null);
    const match = createXenoTrialsMatchV96({ stageId, introSeconds: 0 });
    for (let index = 0; index < 1800; index++) advance(match, { interact: true });
    assert.equal(match.config.stageId, stageId);
    assert.equal(match.stageHazardsV188, undefined);
    assert.equal(getXenoTrialsStageHazardViewV188(match), null);
    assert.equal(match.events.some(event => event.type.startsWith('stage-hazard')), false);
  }
});
