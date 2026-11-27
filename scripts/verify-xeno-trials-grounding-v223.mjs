import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 }
  from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_BOARD_V213 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { XENO_TRIALS_GROUNDING_OPERATION_V223 as operation, XENO_TRIALS_OPERATION_BOARD_V213, getXenoTrialsOperationViewV188,
  validateXenoTrialsOperationSnapshotV188 } from '../src/xeno-trials-operations-v188.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

const stage = getXenoTrialsBossStageV179(operation.stageId);
const horde = getXenoTrialsHordeProtocolV180(operation.hordeProtocolId);
const firstPost = operation.objectives[0];
const observeStage = match => createXenoTrialsStageEventsV211(stage.id, match, XENO_TRIALS_ARENA_V96);

function start(branch = 'operations', id = operation.id) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', activityV119: { branch, id } });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, method = 'arc') {
  const { target, groundingV223 } = getXenoTrialsOperationViewV188(match);
  const [player, ...contacts] = match.fighters;
  const nearest = contacts.sort((left, right) => Math.abs(left.x - player.x) - Math.abs(right.x - player.x))[0];
  const waiting = groundingV223.phase === 'waiting';
  const hunting = waiting && method === 'manual';
  const destination = hunting ? nearest?.x ?? player.x : waiting ? operation.startX : target.x;
  const tolerance = hunting ? 0 : 12;
  const interval = hunting ? 54 : 65;
  const time = match.tick % interval;
  const distance = Math.abs(nearest?.x - player.x);
  stepXenoTrialsMatchV96(match, 1 / 120, { left: player.x > destination + tolerance, right: player.x < destination - tolerance,
    interact: true, heavy: (hunting || !waiting && distance < 145) && time === 0,
    light: (hunting || !waiting && distance < 125) && time === Math.floor(interval / 2) });
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

function shutterLeaves(view, center) {
  const leaves = [];
  const ctx = new Proxy({ fillRect(x, y, width, height) { if (height === 68) leaves.push({ x, y, width }); } },
    { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsStageEventsV211(ctx, stage, { center, floor: 450 }, view);
  return leaves;
}

test('the reactor patrol is a low-health horde and the real warning cannot power the dedicated operation early', () => {
  const { ticket, match } = start();
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.ok(XENO_TRIALS_HORDE_BOARD_V213.includes(horde));
  assert.deepEqual(horde.waves.map(wave => wave.hp), [15, 17, 19]);
  assert.equal(horde.totalEnemies, 13);
  assert.equal(ticket.config.stageId, 'xt179-reactor');
  const observe = observeStage(match);
  assert.deepEqual(observe().reactorGroundingV223, { phase: 'waiting', opening: 0 });
  const warning = getXenoTrialsStageHazardViewV188(match).startsTick;
  while (!match.result && match.tick < warning - 1) drive(match);
  const before = getXenoTrialsOperationHudV188(match);
  assert.equal(before.phase, 'ATTENTE DE DÉCHARGE');
  assert.equal(before.instruction, 'ATTIREZ UN CONTACT DANS LA BANDE');
  assert.equal(before.target.progress, 0);
  assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'warning');
  const premature = getXenoTrialsSnapshotV96(match);
  premature.operationV188.progress[0] = firstPost.requiredTicks;
  premature.operationV188.completed[0] = true;
  premature.operationV188.groundingActivationV223 = { method: 'arc', tick: match.tick };
  premature.stageHazardsV188.totalDamage = 7;
  assert.equal(validateXenoTrialsOperationSnapshotV188(premature.operationV188, ticket.config, premature), false);
  assert.equal(checkpointXenoTrialsV186(ticket.state, premature).applied, false);
  assert.equal(Object.hasOwn(observeStage(start('horde', horde.id).match)(), 'reactorGroundingV223'), false);
  assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(start('operations', 'xto188-relay-1').match), 'groundingV223'), false);
});

test('an actual arc hitting a hostile powers the stage, restores halfway, and settles the still-active horde route once', () => {
  const { ticket, match } = start();
  const observe = observeStage(match);
  const initialArc = getXenoTrialsStageHazardViewV188(match).startsTick;
  while (!match.result && !match.operationV188.groundingActivationV223 && match.tick < initialArc + 100) drive(match);
  const activation = match.operationV188.groundingActivationV223;
  assert.deepEqual(activation, { method: 'arc', tick: initialArc });
  const contact = match.events.find(event => event.type === 'stage-hazard-contact-v188' && event.tick === activation.tick);
  assert.match(contact.actorId, /^horde-/);
  assert.ok(contact.damage > 0);
  assert.equal(match.stageHazardsV188.playerDamage, 0);
  assert.ok(match.events.some(event => event.type === 'operation-objective-v188' && event.tick === activation.tick && event.index === 0));
  for (let tick = 0; tick < 27; tick++) drive(match);
  const visual = observe();
  const halfway = getXenoTrialsOperationHudV188(match);
  assert.equal(halfway.phase, 'SAS EN OUVERTURE');
  assert.match(halfway.instruction, /50 %/);
  assert.equal(halfway.target.progress, 0);
  assert.deepEqual(visual.reactorGroundingV223, { phase: 'opening', opening: .5, method: 'arc' });
  assert.equal(visual.affectsCombat, false);
  assert.deepEqual(shutterLeaves(visual, 500).map(leaf => leaf.width), [28, 28]);
  assert.deepEqual(shutterLeaves(observe({ reducedMotion: true }), 500).map(leaf => leaf.width), [56, 56]);
  assert.deepEqual(shutterLeaves(visual, 600).map(leaf => leaf.x), shutterLeaves(visual, 500).map(leaf => leaf.x - 22));

  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  for (let wait = 0; wait < 120; wait++) drive(match);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const checkpoint = checkpointXenoTrialsV186(ticket.state, frozen);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored), halfway);
  assert.deepEqual(observeStage(restored)({ paused: true }).reactorGroundingV223, visual.reactorGroundingV223);
  resume(match);
  resume(restored);
  while (restored.tick < activation.tick + operation.groundingOpeningTicksV223) {
    drive(match);
    drive(restored);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(getXenoTrialsOperationHudV188(restored).phase, 'SAS ALIMENTÉ');
  assert.equal(checkpointXenoTrialsV186(saved, restored).applied, true);
  const shifted = getXenoTrialsSnapshotV96(restored);
  shifted.operationV188.groundingActivationV223.tick++;
  assert.equal(validateXenoTrialsOperationSnapshotV188(shifted.operationV188, ticket.config, shifted), true);
  assert.equal(checkpointXenoTrialsV186(saved, shifted).applied, false);

  while (!restored.result && restored.tick < 1600) drive(restored);
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.equal(restored.result.hordeV180.kills, 0);
  const falseReceipt = structuredClone(restored.result);
  falseReceipt.stageHazardsV188.totalDamage = falseReceipt.stageHazardsV188.playerDamage;
  assert.equal(settleXenoTrialsV96(saved, falseReceipt).applied, false);
  const prize = settleXenoTrialsV96(saved, restored.result);
  assert.equal(prize.applied, true, prize.reason);
  assert.equal(prize.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(prize.state, restored.result).applied, false);
});

test('clearing the complete native horde away from its discharges leaves a real manual fallback', () => {
  const { ticket, match } = start();
  while (!match.result && match.hordeV180.phase !== 'complete' && match.tick < 2700) drive(match, 'manual');
  const fallback = getXenoTrialsOperationHudV188(match);
  assert.equal(fallback.phase, 'RÉARMEMENT MANUEL');
  assert.equal(fallback.target.id, firstPost.id);
  assert.equal(match.operationV188.groundingActivationV223, null);
  assert.equal(match.stageHazardsV188.totalDamage, match.stageHazardsV188.playerDamage);
  while (!match.result && match.tick < 3300) drive(match, 'manual');
  assert.equal(match.result?.reason, 'operation-complete');
  assert.equal(match.result.hordeV180.kills, horde.totalEnemies);
  assert.equal(match.result.operationV188.groundingActivationV223.method, 'manual');
  const wrong = structuredClone(match.result);
  wrong.hordeV180.kills--;
  wrong.hordeV180.wavesCleared--;
  assert.equal(settleXenoTrialsV96(ticket.state, wrong).applied, false);
  assert.equal(settleXenoTrialsV96(ticket.state, match.result).applied, true);
});
