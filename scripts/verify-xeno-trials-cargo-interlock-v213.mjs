import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_CARGO_OPERATION_V213 as operation } from '../src/xeno-trials-cargo-interlock-v213.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_OPERATION_BOARD_V213 } from '../src/xeno-trials-operations-v188.js';
import { getXenoTrialsStageHazardV188, getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';

const definition = getXenoTrialsStageHazardV188(operation.stageId, operation.id);
const activeTick = definition.graceTicks + definition.warningTicks;
const advance = (match, input = {}) => stepXenoTrialsMatchV96(match, 1 / 120, input);

function start() {
  const initial = createXenoTrialsProgressV96();
  initial.unlocked.push('queen');
  const ticket = beginXenoTrialsV96(initial, { playerId: 'queen', activityV119: { branch: 'operations', id: operation.id } });
  assert.equal(ticket.applied, true);
  assert.equal(ticket.config.stageId, operation.stageId);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, target, interact = true) {
  const player = match.fighters[0];
  advance(match, { interact, left: player.x > target + 15, right: player.x < target - 15,
    heavy: match.tick % 65 === 0, light: match.tick % 65 === 50 });
}

test('the cargo ramps remain inactive while empty and only admit their dedicated operation', () => {
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.equal(getXenoTrialsStageHazardV188(operation.stageId), null);
  assert.equal(getXenoTrialsStageHazardV188(operation.stageId, 'xto188-relay-1'), null);

  const duel = createXenoTrialsMatchV96({ stageId: operation.stageId, introSeconds: 0 });
  for (let tick = 0; tick < activeTick; tick++) advance(duel, { interact: true });
  assert.equal(duel.config.stageId, operation.stageId);
  assert.equal(duel.stageHazardsV188, undefined);
  assert.equal(getXenoTrialsStageHazardViewV188(duel), null);

  const { match, ticket } = start();
  const secondPulse = activeTick + definition.periodTicks;
  while (!match.result && match.tick < secondPulse) drive(match, definition.anchors[0], false);
  const view = getXenoTrialsStageHazardViewV188(match);
  assert.equal(view.tick, secondPulse);
  assert.ok(Math.abs(match.fighters[0].x - definition.anchors[0]) < definition.width / 2);
  assert.equal(view.phase, 'idle');
  assert.equal(view.cargoInterlockV213.armed, null);
  assert.deepEqual(view.zones, []);
  assert.equal(match.stageHazardsV188.contacts, 0);
  assert.deepEqual(match.operationV188.completed, [false, false, false]);
  const emptyCheckpoint = getXenoTrialsSnapshotV96(match);
  assert.equal(checkpointXenoTrialsV186(ticket.state, emptyCheckpoint).applied, true);
  const forged = structuredClone(emptyCheckpoint);
  forged.stageHazardsV188.contacts = 1;
  forged.stageHazardsV188.totalDamage = definition.damage;
  assert.equal(checkpointXenoTrialsV186(ticket.state, forged).applied, false);
  assert.equal(restoreXenoTrialsHordeMatchV180(forged), null);
});

test('three native cargo pickups re-arm alternating ramps, survive resume, and settle once', () => {
  const started = start();
  let { match } = started;
  let saved = started.ticket.state;
  const changes = [null];
  let sawWarningA = false;
  let sawActiveB = false;
  let restored = false;
  while (!match.result && match.tick < 9000) {
    const target = match.operationV188.carrying === 0 && match.tick < 380
      ? definition.anchors[0] : getXenoTrialsOperationViewV188(match).target.x;
    drive(match, target);
    const view = getXenoTrialsStageHazardViewV188(match);
    if (!view) continue;
    const { armed, circuits } = view.cargoInterlockV213;
    if (changes.at(-1) !== armed) changes.push(armed);
    if (view.phase === 'warning' && armed === 'A') {
      sawWarningA = true;
      assert.equal(view.zones[0].left, circuits[0].left);
    }
    if (view.phase === 'active' && armed === 'B') {
      sawActiveB = true;
      assert.equal(view.zones[0].left, circuits[1].left);
    }
    if (armed === null) assert.deepEqual(view.zones, []);
    if (!restored && match.stageHazardsV188.playerDamage > 0) {
      assert.equal(armed, 'A');
      assert.equal(match.stageHazardsV188.playerDamage, definition.damage);
      assert.ok(match.events.some(event => event.type === 'stage-hazard-contact-v188' && event.actorId === 'player'));
      setXenoTrialsPausedV96(match, true);
      const snapshot = getXenoTrialsSnapshotV96(match);
      for (let wait = 0; wait < 120; wait++) advance(match, { right: true, interact: true });
      assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
      const checkpoint = checkpointXenoTrialsV186(saved, snapshot);
      assert.equal(checkpoint.applied, true);
      saved = normalizeXenoTrialsProgressV96(structuredClone(checkpoint.state));
      match = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
      assert.ok(match.paused);
      assert.deepEqual(getXenoTrialsStageHazardViewV188(match), view);
      assert.deepEqual(match.stageHazardsV188.nextHits, snapshot.stageHazardsV188.nextHits);
      setXenoTrialsPausedV96(match, false);
      releaseXenoTrialsControlsV150(match, 'player', {});
      restored = true;
    }
  }
  assert.deepEqual(changes, [null, 'A', null, 'B', null, 'A', null]);
  assert.ok(sawWarningA && sawActiveB && restored);
  assert.equal(match.result?.reason, 'operation-complete');
  assert.deepEqual(match.result.operationV188.state.delivered, [true, true, true]);
  assert.equal(getXenoTrialsStageHazardViewV188(match), null);
  const settled = settleXenoTrialsV96(saved, match.result);
  assert.equal(settled.applied, true);
  assert.deepEqual(settled.state.modesV119.operationsCleared, [operation.id]);
  assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
});
