import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 }
  from '../src/xeno-trials-engine-v96.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { XENO_TRIALS_RELIEF_OPERATION_V220 as operation, XENO_TRIALS_OPERATION_BOARD_V213,
  getXenoTrialsOperationViewV188 } from '../src/xeno-trials-operations-v188.js';
import { getXenoTrialsReinforcementV201 } from '../src/xeno-trials-reinforcements-v201.js';
import { createXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

function start(id = operation.id) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), {
    playerId: 'warrior', activityV119: { branch: 'operations', id }
  });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, interact = true) {
  const { target } = getXenoTrialsOperationViewV188(match);
  const [player, ...enemies] = match.fighters;
  const nearest = enemies.sort((left, right) => Math.abs(left.x - player.x) - Math.abs(right.x - player.x))[0];
  // Stay within the relay's approach band and turn toward the nearest contact.
  const x = target.x;
  const canFightHere = nearest && Math.abs(x - player.x) < 72;
  const destination = canFightHere ? Math.max(x - 50, Math.min(x + 50, nearest.x)) : x;
  const distance = Math.abs(nearest?.x - player.x);
  const cadence = match.tick % 54;
  stepXenoTrialsMatchV96(match, 1 / 120, { left: player.x > destination + 5, right: player.x < destination - 5, interact,
    heavy: cadence === 0 && distance < 220, light: cadence === 27 && distance < 175, special: cadence === 15 && distance < 210 });
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

test('the new relay is closed during combat and the first honest clearance opens the same eastward forecast in scene and HUD', () => {
  const { ticket, match } = start();
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.equal(ticket.config.stageId, 'xt179-ship-extraction');
  const observe = createXenoTrialsStageEventsV211(operation.stageId, match, XENO_TRIALS_ARENA_V96);
  assert.equal(observe().stageId, operation.stageId);
  for (let step = 0; step < 32; step++) drive(match);
  const combat = getXenoTrialsOperationHudV188(match);
  assert.equal(combat.phase, 'POSTES VERROUILLÉS');
  assert.equal(combat.target.progress, 0);
  const before = getXenoTrialsSnapshotV96(match);
  const closedCharge = structuredClone(before);
  closedCharge.operationV188.progress[0] = 1;
  assert.equal(checkpointXenoTrialsV186(ticket.state, closedCharge).applied, false);

  while (match.hordeV180.phase !== 'intermission' && match.tick < 600) drive(match);
  const opened = getXenoTrialsOperationHudV188(match);
  assert.equal(opened.phase, 'RELÈVE · 1,0 s');
  assert.equal(opened.target.progress, 1);
  assert.deepEqual(opened.reliefV220, { phase: 'relief', open: true, remainingTicks: 120 });
  const cue = getXenoTrialsReinforcementV201(match);
  assert.deepEqual(cue.gateContactsV213, { left: 0, right: 3 });
  assert.equal(cue.remainingTicks, opened.reliefV220.remainingTicks);
  assert.equal(observe().gates.right.status, 'armed');
  assert.equal(observe().gates.left.status, 'locked');
  const labels = [];
  const ctx = new Proxy({ fillText: label => labels.push(label) }, { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsOperationV188(ctx, match, XENO_TRIALS_ARENA_V96, { plane: 'front', reducedMotion: true });
  assert.deepEqual(labels, ['Poste ouest · OUVERT']);
  const premature = structuredClone(getXenoTrialsSnapshotV96(match));
  premature.operationV188.progress[0] = 2;
  assert.equal(checkpointXenoTrialsV186(ticket.state, premature).applied, false);
  premature.operationV188.progress[0] = operation.objectives[0].requiredTicks;
  premature.operationV188.completed[0] = true;
  assert.equal(checkpointXenoTrialsV186(ticket.state, premature).applied, false);

  const { match: historical } = start('xto188-relay-1');
  assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(historical), 'reliefV220'), false);
});

test('correct positioning arms three posts in the first three relief windows before the last wave enters', () => {
  const { ticket, match } = start();
  const secured = [];
  while (!match.result && match.tick < 3500) {
    drive(match);
    const event = match.events.findLast(entry => entry.type === 'operation-objective-v188' && entry.tick === match.tick);
    if (event) secured.push([event.objectiveId, match.hordeV180.wave, match.hordeV180.phase]);
  }
  assert.deepEqual(secured, operation.objectives.map((objective, index) => [objective.id, index + 1, 'intermission']));
  assert.equal(match.result?.reason, 'operation-complete');
  assert.equal(match.result.hordeV180.kills, 13);
  assert.equal(match.result.hordeV180.totalEnemies, 19);
  const premature = structuredClone(match.result);
  premature.hordeV180.wavesCleared = 2;
  assert.equal(settleXenoTrialsV96(ticket.state, premature).applied, false);
  const payment = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(payment.applied, true, payment.reason);
  assert.equal(payment.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(payment.state, match.result).applied, false);
});

test('an interrupted hold resumes tick-for-tick, loses its partial charge on wave arrival, and recovers under the final unlocked state', () => {
  const { ticket, match } = start();
  while (!match.result && match.tick < 650) {
    const relief = getXenoTrialsOperationViewV188(match).reliefV220;
    if (relief.phase === 'relief' && relief.remainingTicks === 12) break;
    drive(match, relief.phase === 'relief' && relief.remainingTicks <= 28);
  }
  const partial = getXenoTrialsOperationHudV188(match);
  assert.equal(partial.phase, 'RELÈVE · 0,1 s');
  assert.ok(partial.target.progress > 0 && partial.target.progress < partial.target.requiredTicks);
  setXenoTrialsPausedV96(match, true);
  const snapshot = getXenoTrialsSnapshotV96(match);
  for (let paused = 0; paused < 120; paused++) drive(match);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), snapshot);
  const checkpoint = checkpointXenoTrialsV186(ticket.state, snapshot);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored), partial);
  resume(match);
  resume(restored);
  for (let frame = 0; frame < partial.reliefV220.remainingTicks; frame++) {
    drive(match);
    drive(restored);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(restored.hordeV180.wave, 2);
  assert.equal(restored.operationV188.progress[0], 0);
  const arrived = getXenoTrialsReinforcementV201(restored);
  assert.equal(arrived.phase, 'arrived');
  assert.deepEqual(arrived.gateContactsV213, { left: 0, right: 3 });

  let finalRecovery = null;
  while (!restored.result && restored.tick < 4200) {
    drive(restored);
    const view = getXenoTrialsOperationHudV188(restored);
    if (finalRecovery === null && view.status === 'active' && view.reliefV220.phase === 'secured') finalRecovery = view;
  }
  assert.equal(finalRecovery?.phase, 'SECTEUR SÉCURISÉ');
  assert.equal(finalRecovery?.target.id, 'relief-east');
  assert.equal(finalRecovery?.reliefV220.remainingTicks, null);
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.equal(restored.result.hordeV180.kills, 19);
  assert.equal(settleXenoTrialsV96(saved, restored.result).applied, true);
});
