import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 }
  from '../src/xeno-trials-engine-v96.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { XENO_TRIALS_BEACON_OPERATION_V219 as operation, XENO_TRIALS_OPERATION_BOARD_V213,
  getXenoTrialsOperationViewV188, validateXenoTrialsOperationReceiptV188, validateXenoTrialsOperationSnapshotV188 }
  from '../src/xeno-trials-operations-v188.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

const westToEast = [0, 1, 2];
const eastToWest = [2, 1, 0];

function start(id = operation.id) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), {
    playerId: 'warrior', activityV119: { branch: 'operations', id }
  });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, route) {
  const next = route.find(index => !match.operationV188.completed[index]) ?? route[0];
  const targetX = operation.objectives[next].x;
  const [player, ...enemies] = match.fighters;
  const inMeleeRange = enemies.some(enemy => Math.abs(enemy.x - player.x) < 140);
  stepXenoTrialsMatchV96(match, 1 / 120, { left: player.x > targetX + 14, right: player.x < targetX - 14,
    interact: Math.abs(player.x - targetX) < 77,
    heavy: inMeleeRange && match.tick % 105 === 0, light: inMeleeRange && match.tick % 105 === 52 });
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

test('only Triangulation on Battery admits the battery-clock field and old beacon saves still restore', () => {
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  for (const id of [operation.id, 'xto188-beacon-1']) {
    const { ticket, match } = start(id);
    const hasBattery = id === operation.id;
    assert.equal(Object.hasOwn(match.operationV188, 'batteryStartedTickV219'), hasBattery);
    assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(match), 'batteryV219'), hasBattery);
    const checkpoint = checkpointXenoTrialsV186(ticket.state, match);
    assert.equal(checkpoint.applied, true, checkpoint.reason);
    const restored = restoreXenoTrialsHordeMatchV180(checkpoint.state.pending.checkpointV186.snapshot);
    assert.deepEqual(restored?.operationV188, match.operationV188);
    const changed = structuredClone(getXenoTrialsSnapshotV96(match));
    if (hasBattery) delete changed.operationV188.batteryStartedTickV219;
    else changed.operationV188.batteryStartedTickV219 = null;
    assert.equal(checkpointXenoTrialsV186(ticket.state, changed).applied, false);
  }
});

test('the first real synchronization starts nine seconds, its exact reserve resumes, and the start cannot be moved', () => {
  const { ticket, match } = start();
  const battery = () => getXenoTrialsOperationHudV188(match);
  assert.equal(battery().phase, 'BATTERIE EN VEILLE');
  while (!battery().batteryV219.armed && match.tick < 120) drive(match, westToEast);
  const armedAt = match.tick;
  assert.equal(armedAt, operation.objectives[0].requiredTicks);
  assert.equal(match.operationV188.batteryStartedTickV219, armedAt);
  assert.deepEqual(match.operationV188.completed, [true, false, false]);
  assert.equal(battery().phase, 'BATTERIE · 9 s');
  assert.equal(battery().batteryV219.remainingTicks, operation.batteryTicksV219);

  while (match.tick < 336 && !match.result) drive(match, westToEast);
  const before = battery();
  assert.equal(before.phase, 'BATTERIE · 7 s');
  assert.equal(before.batteryV219.remainingTicks, operation.batteryTicksV219 - (match.tick - armedAt));
  const cells = [];
  const ctx = new Proxy({ fillRect(_x, y, width, height) {
    if (y === XENO_TRIALS_ARENA_V96.floor - 12 && width === 5 && height === 4) cells.push(this.fillStyle);
  } }, { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsOperationV188(ctx, match, XENO_TRIALS_ARENA_V96, { reducedMotion: true });
  assert.deepEqual(cells, Array.from({ length: 3 }, () => [...Array(4).fill('#99dcab'), '#27383c']).flat());

  setXenoTrialsPausedV96(match, true);
  const snapshot = getXenoTrialsSnapshotV96(match);
  for (let wait = 0; wait < 180; wait++) drive(match, westToEast);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  assert.deepEqual(battery(), before);
  const checkpoint = checkpointXenoTrialsV186(ticket.state, snapshot);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const progress = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  const restored = restoreXenoTrialsHordeMatchV180(progress.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored), before);
  resume(match);
  resume(restored);
  for (let frames = 0; frames < 30; frames++) {
    drive(match, westToEast);
    drive(restored, westToEast);
  }
  const advanced = getXenoTrialsSnapshotV96(restored);
  assert.deepEqual(advanced, getXenoTrialsSnapshotV96(match));
  assert.equal(checkpointXenoTrialsV186(progress, advanced).applied, true);
  const transplanted = structuredClone(advanced);
  const state = transplanted.operationV188;
  state.batteryStartedTickV219++;
  state.integrity = Math.ceil(100 * (operation.batteryTicksV219 - state.lastTick + state.batteryStartedTickV219) / operation.batteryTicksV219);
  assert.equal(validateXenoTrialsOperationSnapshotV188(state, ticket.config, transplanted), true);
  assert.equal(checkpointXenoTrialsV186(progress, transplanted).applied, false);

  while (!restored.result && restored.tick < 900) drive(restored, westToEast);
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.equal(restored.result.operationV188.batteryStartedTickV219, armedAt);
  assert.ok(restored.result.hordeV180.kills < restored.result.hordeV180.totalEnemies);
  const { state: _, ...receipt } = restored.result.operationV188;
  assert.equal(validateXenoTrialsOperationReceiptV188(receipt, ticket.config), true);
  const settled = settleXenoTrialsV96(progress, restored.result);
  assert.equal(settled.applied, true, settled.reason);
  assert.equal(settled.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(settled.state, restored.result).applied, false);
});

test('starting from the east is viable against the native enemies and uses a different beacon order', () => {
  const { match } = start();
  const charged = [];
  while (!match.result && match.tick < 1800) {
    drive(match, eastToWest);
    const event = match.events.findLast(entry => entry.type === 'operation-objective-v188' && entry.tick === match.tick);
    if (event) charged.push(event.index);
  }
  assert.deepEqual(charged, eastToWest);
  assert.equal(match.result?.reason, 'operation-complete');
  assert.ok(match.operationV188.batteryStartedTickV219 >= operation.objectives[2].windowStartTicks);
  const reserve = getXenoTrialsOperationViewV188(match).batteryV219.remainingTicks;
  assert.ok(reserve > 0 && reserve < 120);
});

test('missing the final synchronizations causes a battery defeat exactly at zero with no completion reward', () => {
  const { ticket, match } = start();
  const standbyAt = operation.objectives[0].requiredTicks;
  const expiry = standbyAt + operation.batteryTicksV219;
  while (!match.result && match.tick < expiry - 1) drive(match, [0]);
  assert.equal(match.result, null);
  assert.equal(getXenoTrialsOperationHudV188(match).batteryV219.remainingTicks, 1);
  assert.equal(match.operationV188.integrity, 1);
  drive(match, [0]);
  assert.equal(match.tick, expiry);
  assert.equal(match.result?.reason, 'operation-failed');
  assert.equal(match.result.operationV188.failureReason, 'structure-destroyed');
  assert.equal(getXenoTrialsOperationHudV188(match).phase, 'BATTERIE ÉPUISÉE');
  assert.deepEqual(match.operationV188.completed, [true, false, false]);
  const settled = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(settled.applied, true, settled.reason);
  assert.equal(settled.receipt.credits, 15);
  assert.equal(settled.state.modesV119.operationsCleared.includes(operation.id), false);
});
