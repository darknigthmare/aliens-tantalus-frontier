import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 }
  from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationBriefingV188, getXenoTrialsOperationHudV188 }
  from '../src/xeno-trials-operation-presentation-v188.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_OPERATION_BOARD_V213,
  XENO_TRIALS_RELAY_OPERATION_V218 as operation } from '../src/xeno-trials-operations-v188.js';
import { resolveXenoTrialsActivityV119 } from '../src/xeno-trials-modes-v119.js';

const activityV119 = { branch: 'operations', id: operation.id };
const advance = (match, input) => stepXenoTrialsMatchV96(match, 1 / 120, input);

function drive(match) {
  const { target } = getXenoTrialsOperationViewV188(match);
  const [player, ...enemies] = match.fighters;
  const nearest = enemies.sort((left, right) => Math.abs(left.x - player.x) - Math.abs(right.x - player.x))[0];
  const distance = Math.abs(nearest?.x - player.x);
  const x = target.contested && nearest ? nearest.x : target.x;
  const tolerance = target.contested && distance < 200 ? 1 : 14;
  advance(match, { interact: true, left: player.x > x + tolerance, right: player.x < x - tolerance,
    heavy: distance < 200 && match.tick % 105 === 0, light: distance < 200 && match.tick % 105 === 52 });
}

test('the Operations board offers a switch-flank retake on the historic bridge and leaves existing relays unchanged', () => {
  assert.equal(XENO_TRIALS_OPERATION_BOARD_V213[0], operation);
  const activity = resolveXenoTrialsActivityV119(activityV119);
  assert.equal(activity.stageId, 'xt179-bridge');
  assert.equal(activity.protocolId, 'xth218-bridge-retake');
  assert.deepEqual([activity.waveCount, activity.totalEnemies, activity.enemyHpMin, activity.enemyHpMax], [3, 14, 15, 21]);
  assert.match(getXenoTrialsOperationBriefingV188(activity).orders, /bloque sa charge/);

  const old = createXenoTrialsMatchV96({ activityV119: { branch: 'operations', id: 'xto188-relay-1' }, introSeconds: 0 });
  assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(old).target, 'contested'), false);
  const ordinary = createXenoTrialsMatchV96({ stageId: activity.stageId, introSeconds: 0 });
  assert.equal(getXenoTrialsOperationViewV188(ordinary), null);
  assert.equal(ordinary.stageHazardsV188, undefined);
});

test('a live incursion erases partial relay charge, survives save and is cleared by native actions before a paid objective victory', () => {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', activityV119 });
  assert.equal(ticket.applied, true);
  let match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 });
  const west = operation.objectives[0];

  while (!getXenoTrialsOperationViewV188(match).target.contested && match.tick < 270) drive(match);
  const approached = getXenoTrialsOperationViewV188(match).target;
  assert.equal(approached.id, west.id);
  assert.equal(approached.contested, true);
  assert.ok(approached.progress > 100 && approached.progress < approached.requiredTicks);
  drive(match);
  const pressure = getXenoTrialsOperationHudV188(match);
  assert.equal(pressure.target.progress, approached.progress - 2);
  assert.equal(pressure.target.contested, true);
  assert.equal(pressure.instruction, 'Relais ouest · PÉRIMÈTRE CONTESTÉ');
  assert.match(pressure.hint, /périmètre balisé/);
  assert.equal(pressure.entities.filter(entity => entity.contested).length, 1);

  const lines = [], labels = [];
  const canvas = new Proxy({ lineTo: (...args) => lines.push(args), fillText: label => labels.push(label) },
    { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsOperationV188(canvas, match, XENO_TRIALS_ARENA_V96, { plane: 'front', reducedMotion: true });
  const floor = XENO_TRIALS_ARENA_V96.floor;
  assert.deepEqual(lines.slice(0, 4), [[west.x - west.pressureRadius, floor + 3], [west.x + west.pressureRadius, floor + 3],
    [west.x + west.pressureRadius, floor + 7], [west.x + west.radius, floor + 9]]);
  assert.deepEqual(labels, ['Relais ouest · CONTESTÉ']);

  setXenoTrialsPausedV96(match, true);
  const snapshot = getXenoTrialsSnapshotV96(match);
  for (let wait = 0; wait < 120; wait++) advance(match, { interact: true });
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  const forged = structuredClone(snapshot);
  forged.operationV188.contested = false;
  assert.equal(checkpointXenoTrialsV186(ticket.state, forged).applied, false);
  const checkpoint = checkpointXenoTrialsV186(ticket.state, snapshot);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const progress = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  match = restoreXenoTrialsHordeMatchV180(progress.pending.checkpointV186.snapshot);
  assert.ok(match?.paused);
  assert.deepEqual(getXenoTrialsOperationHudV188(match), pressure);
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});

  const chargingOrder = [west.id];
  let sawClearAfterBeat = false;
  while (!match.result && match.tick < 3600) {
    drive(match);
    const target = getXenoTrialsOperationViewV188(match).target;
    if (target && chargingOrder.at(-1) !== target.id) chargingOrder.push(target.id);
    if (target?.id === west.id && !target.contested && match.hordeV180.totalKills > 0) sawClearAfterBeat = true;
  }
  assert.ok(sawClearAfterBeat);
  assert.deepEqual(chargingOrder, operation.objectives.map(objective => objective.id));
  assert.equal(match.result?.winner, 'player');
  assert.equal(match.result.reason, 'operation-complete');
  assert.deepEqual(match.result.operationV188.state.completed, [true, true, true]);
  assert.ok(match.result.hordeV180.kills > 0 && match.result.hordeV180.kills < match.result.hordeV180.totalEnemies);
  const settled = settleXenoTrialsV96(progress, match.result);
  assert.equal(settled.applied, true, settled.reason);
  assert.ok(settled.state.modesV119.operationsCleared.includes(operation.id));
  assert.equal(settled.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
});
