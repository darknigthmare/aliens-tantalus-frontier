import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 }
  from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_BOARD_V213 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { XENO_TRIALS_GANTRY_OPERATION_V222 as operation, XENO_TRIALS_OPERATION_BOARD_V213, getXenoTrialsOperationViewV188,
  validateXenoTrialsOperationSnapshotV188 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

const stage = getXenoTrialsBossStageV179(operation.stageId);
const horde = getXenoTrialsHordeProtocolV180(operation.hordeProtocolId);
const [cargo, west, east] = operation.objectives;
const [, westStop, , eastStop] = operation.gantryRouteV222;
const observeStage = match => createXenoTrialsStageEventsV211(stage.id, match, XENO_TRIALS_ARENA_V96);

function start(branch = 'operations', id = operation.id) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', activityV119: { branch, id } });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, destination = getXenoTrialsOperationViewV188(match).target.x) {
  const [player, ...contacts] = match.fighters;
  const distance = Math.min(...contacts.map(actor => Math.abs(actor.x - player.x)));
  const cadence = match.tick % 65;
  stepXenoTrialsMatchV96(match, 1 / 120, { left: player.x > destination + 12, right: player.x < destination - 12,
    interact: true, heavy: distance < 145 && cadence === 0, light: distance < 125 && cadence === 32 });
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

function gantryPanels(view, center) {
  const panels = [];
  const ctx = new Proxy({ fillRect(x, y, width, height) { if (width === 100) panels.push({ x, y, height }); } },
    { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsStageEventsV211(ctx, stage, { center, floor: 450 }, view);
  return panels;
}

test('the west stop requires its own terminal and the authorized gantry lifts only when the cart moves', () => {
  const { ticket, match } = start();
  assert.equal(ticket.config.stageId, 'xt179-logistics');
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.ok(XENO_TRIALS_HORDE_BOARD_V213.includes(horde));
  assert.deepEqual(horde.waves.map(wave => wave.hp), [15, 17, 20]);
  assert.equal(horde.totalEnemies, 13);
  const observe = observeStage(match);
  assert.equal(getXenoTrialsOperationHudV188(match).phase, 'CONVOI EN TRANSIT');
  assert.deepEqual(observe().logisticsGantriesV222.map(gate => gate.phase), ['locked', 'locked']);
  while (match.operationV188.cargoTravelTicks < westStop.startTick && match.tick < 650) drive(match);
  const stopped = getXenoTrialsOperationHudV188(match);
  assert.equal(stopped.phase, 'CONTRÔLE DU PORTIQUE');
  assert.equal(stopped.target.label, 'Borne ouest');
  assert.equal(stopped.entities[0].x, westStop.fromX);
  assert.equal(stopped.entities[0].active, false);
  assert.equal(stopped.target.progress, 0);
  assert.deepEqual(observe().logisticsGantriesV222.map(gate => gate.phase), ['inspection', 'locked']);
  for (let frame = 0; frame < 36; frame++) drive(match, westStop.fromX);
  assert.equal(match.operationV188.cargoTravelTicks, westStop.startTick);
  assert.equal(match.operationV188.cargoX, westStop.fromX);
  assert.equal(match.operationV188.progress[1], 0);

  while (!match.operationV188.completed[1] && match.tick < 1500) drive(match);
  assert.equal(match.operationV188.cargoTravelTicks, westStop.endTick);
  assert.equal(match.operationV188.cargoX, westStop.toX);
  assert.ok(match.events.some(event => event.type === 'operation-objective-v188' && event.objectiveId === west.id));
  assert.deepEqual(observe().logisticsGantriesV222[0], { id: west.id, phase: 'authorized', opening: 0 });
  for (let frame = 0; frame < 24; frame++) drive(match, west.x);
  assert.equal(observe().logisticsGantriesV222[0].opening, 0);
  while (match.operationV188.cargoTravelTicks < westStop.endTick + 32 && match.tick < 1700) drive(match);
  const moving = observe();
  assert.deepEqual(moving.logisticsGantriesV222.map(gate => gate.opening), [.5, 0]);
  assert.equal(moving.affectsCombat, false);
  const panels = gantryPanels(moving, 500);
  assert.deepEqual(panels.map(panel => panel.height), [31.5, 63]);
  assert.deepEqual(gantryPanels(observe({ reducedMotion: true }), 500).map(panel => panel.height), [0, 63]);
  assert.deepEqual(gantryPanels(moving, 600).map(panel => panel.x), panels.map(panel => panel.x - 24));

  assert.equal(Object.hasOwn(observeStage(start('horde', horde.id).match)(), 'logisticsGantriesV222'), false);
  assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(start('operations', 'xto188-escort-1').match), 'gantryV222'), false);
});

test('the convoy takes real damage during inspection, resumes its exact partial scan, rejects work skipped between checkpoints and pays once', () => {
  const { ticket, match } = start();
  let damageDuringInspection = 0;
  while (!match.result && match.operationV188.progress[2] < east.requiredTicks / 2 && match.tick < 2100) {
    const before = getXenoTrialsOperationViewV188(match);
    drive(match);
    const after = getXenoTrialsOperationViewV188(match);
    if (before.gantryV222.stationIndex === 2) damageDuringInspection += before.integrity - after.integrity;
  }
  assert.ok(damageDuringInspection > 0);
  const inspecting = getXenoTrialsOperationHudV188(match);
  assert.equal(inspecting.target.id, east.id);
  assert.equal(inspecting.target.progress, east.requiredTicks / 2);
  assert.equal(inspecting.entities[0].x, eastStop.fromX);
  assert.ok(Math.abs(match.fighters[0].x - inspecting.entities[0].x) > cargo.radius);
  assert.equal(inspecting.progress.done, 1);
  assert.match(inspecting.instruction, /50 %/);
  assert.deepEqual(match.operationV188.completed, [false, true, false]);
  const pairedScene = observeStage(match)().logisticsGantriesV222;
  assert.deepEqual(pairedScene.map(gate => gate.phase), ['authorized', 'inspection']);

  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  for (let wait = 0; wait < 120; wait++) drive(match);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const checkpoint = checkpointXenoTrialsV186(ticket.state, frozen);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored), inspecting);
  assert.deepEqual(observeStage(restored)({ paused: true }).logisticsGantriesV222, pairedScene);
  resume(match);
  resume(restored);
  drive(match);
  drive(restored);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(checkpointXenoTrialsV186(saved, restored).applied, true);
  const skipped = getXenoTrialsSnapshotV96(restored);
  skipped.operationV188.cargoTravelTicks++;
  skipped.operationV188.progress[0]++;
  skipped.operationV188.progress[2]++;
  assert.equal(validateXenoTrialsOperationSnapshotV188(skipped.operationV188, ticket.config, skipped), true);
  assert.equal(checkpointXenoTrialsV186(saved, skipped).applied, false);
  const moved = getXenoTrialsSnapshotV96(restored);
  moved.operationV188.cargoX += 1;
  assert.equal(checkpointXenoTrialsV186(saved, moved).applied, false);

  while (!restored.result && restored.tick < 3900) drive(restored);
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.ok(restored.result.hordeV180.kills < horde.totalEnemies);
  assert.deepEqual(restored.result.operationV188.state.completed, [true, true, true]);
  assert.equal(restored.result.operationV188.state.cargoX, operation.cargoEndX);
  const falsePass = structuredClone(restored.result);
  falsePass.operationV188.state.progress[2]--;
  assert.equal(settleXenoTrialsV96(saved, falsePass).applied, false);
  const payout = settleXenoTrialsV96(saved, restored.result);
  assert.equal(payout.applied, true, payout.reason);
  assert.equal(payout.receipt.credits, operation.reward + 80);
  assert.ok(payout.state.modesV119.operationsCleared.includes(operation.id));
  assert.equal(settleXenoTrialsV96(payout.state, restored.result).applied, false);
});
