import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 }
  from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_BOARD_V213 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { XENO_TRIALS_BYPASS_OPERATION_V221 as operation, XENO_TRIALS_OPERATION_BOARD_V213,
  getXenoTrialsOperationViewV188 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';

const stage = getXenoTrialsBossStageV179(operation.stageId);
const protocol = getXenoTrialsHordeProtocolV180(operation.hordeProtocolId);
const boss = protocol.bossFinaleV186;

function start(activityV119 = { branch: 'operations', id: operation.id }) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', activityV119 });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match) {
  const view = getXenoTrialsOperationViewV188(match);
  const [player, ...enemies] = match.fighters;
  const watch = enemies.find(actor => actor.enemyRankV186 === 'boss');
  const nearest = enemies.sort((left, right) => Math.abs(left.x - player.x) - Math.abs(right.x - player.x))[0];
  const target = watch ?? nearest;
  const hunting = view.bypassV221.phase === 'locked';
  const destination = hunting ? target?.x ?? player.x : view.target.x;
  const distance = Math.abs(target?.x - player.x);
  const tolerance = hunting ? 0 : 12;
  const cadence = match.tick % 54;
  stepXenoTrialsMatchV96(match, 1 / 120, {
    left: player.x > destination + tolerance, right: player.x < destination - tolerance, interact: true,
    heavy: cadence === 0 && (hunting || distance < 125), light: cadence === 27 && (hunting || distance < 100)
  });
}

function scene(match) {
  return createXenoTrialsStageEventsV211(stage.id, match, XENO_TRIALS_ARENA_V96);
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

function drawBulkhead(view, center, floor = 450) {
  const fills = [], strokes = [], clips = [];
  const ctx = new Proxy({ fillRect: (...args) => fills.push(args), strokeRect: (...args) => strokes.push(args),
    rect: (...args) => clips.push(args) }, { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsStageEventsV211(ctx, stage, { center, floor }, view);
  return { frame: strokes.find(([, , width, height]) => width === 144 && height === 88), clips,
    panel: fills.find(([, , width]) => width === 130) };
}

test('the hangar boards use a native mixed-health finale and only the operation owns the rear bulkhead', () => {
  assert.ok(XENO_TRIALS_HORDE_BOARD_V213.includes(protocol));
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.deepEqual(protocol.waves.map(wave => wave.total), [4, 4, 5]);
  assert.deepEqual(protocol.waves.map(wave => wave.hp), [15, 17, 19]);
  const finale = protocol.waves.at(-1).enemySlotsV186;
  assert.equal(finale[0].fighterId, 'synth-guard');
  assert.equal(finale[0].hp, 86);
  assert.equal(finale[0].rank, 'boss');
  assert.ok(finale.slice(1).every(slot => slot.rank === 'troop' && slot.hp === 19));
  const { ticket, match } = start();
  assert.equal(ticket.config.stageId, stage.id);
  for (let tick = 0; tick < 32; tick++) stepXenoTrialsMatchV96(match, 1 / 120, { interact: true });
  const hud = getXenoTrialsOperationHudV188(match);
  assert.equal(hud.phase, 'POSTE VERROUILLÉ');
  assert.equal(hud.target.progress, 0);
  assert.match(hud.instruction, /NEUTRALISEZ LE VIGILE/);
  const closed = scene(match)();
  assert.deepEqual(closed.hangarBypassV221, { phase: 'locked', opening: 0 });
  assert.equal(closed.affectsCombat, false);
  assert.equal(drawBulkhead(closed, 500).panel[3], 78);
  const { match: horde } = start({ branch: 'horde', id: protocol.id });
  assert.equal(Object.hasOwn(scene(horde)(), 'hangarBypassV221'), false);
  const duel = createXenoTrialsMatchV96({ stageId: stage.id, introSeconds: 0 });
  assert.equal(scene(duel)(), null);
});

test('the real boss gates the switch, whose halfway opening restores exactly, leads to an escorted result and pays only once', () => {
  const { ticket, match } = start();
  const observe = scene(match);
  while (!match.result && match.hordeV180.wave < boss.wave && match.tick < 2300) drive(match);
  assert.ok(match.fighters.some(actor => actor.enemyRankV186 === 'boss' && actor.hp === boss.hp));
  assert.equal(getXenoTrialsOperationHudV188(match).bypassV221.phase, 'locked');
  const earlyCharge = getXenoTrialsSnapshotV96(match);
  earlyCharge.operationV188.progress[0] = 1;
  assert.equal(checkpointXenoTrialsV186(ticket.state, earlyCharge).applied, false);
  const realBoss = getXenoTrialsSnapshotV96(match);
  const fakeEscort = realBoss.fighters.find(actor => actor.enemyRankV186 === 'boss');
  fakeEscort.enemyRankV186 = 'troop';
  assert.equal(checkpointXenoTrialsV186(ticket.state, realBoss).applied, false);

  while (!match.result && observe().hangarBypassV221.phase === 'locked' && match.tick < 3200) drive(match);
  assert.equal(observe().hangarBypassV221.phase, 'ready');
  assert.equal(getXenoTrialsOperationHudV188(match).phase, 'DÉRIVATION DISPONIBLE');
  assert.equal(match.fighters.some(actor => actor.enemyRankV186 === 'boss'), false);
  assert.ok(match.hordeV180.alive > 0);
  assert.equal(match.operationV188.progress[0], 0);
  while (!match.result && match.operationV188.bypassStartedTickV221 === null && match.tick < 3800) drive(match);
  const powered = match.operationV188.bypassStartedTickV221;
  assert.equal(powered, match.tick);
  assert.ok(match.events.some(event => event.type === 'operation-objective-v188' && event.tick === powered && event.index === 0));
  for (let tick = 0; tick < 36; tick++) drive(match);
  const below = observe();
  const hud = getXenoTrialsOperationHudV188(match);
  assert.deepEqual(below.hangarBypassV221, { phase: 'opening', opening: .5 });
  assert.equal(hud.phase, 'VOLET EN OUVERTURE');
  assert.equal(hud.target.progress, 0);
  assert.match(hud.instruction, /50 %/);
  assert.equal(drawBulkhead(below, 500).panel[3], 39);
  assert.equal(drawBulkhead(observe({ reducedMotion: true }), 500).panel[3], 78);
  assert.equal(drawBulkhead(below, 600).frame[0] - drawBulkhead(below, 500).frame[0], -26);
  assert.deepEqual(drawBulkhead(below, 500).clips, [[0, 0, 1000, 450]]);
  const beforeOpen = getXenoTrialsSnapshotV96(match);
  beforeOpen.operationV188.progress[1] = 1;
  assert.equal(checkpointXenoTrialsV186(ticket.state, beforeOpen).applied, false);

  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  for (let wait = 0; wait < 120; wait++) drive(match);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const checkpoint = checkpointXenoTrialsV186(ticket.state, frozen);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(scene(restored)({ paused: true }).hangarBypassV221, below.hangarBypassV221);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored), hud);
  resume(match);
  resume(restored);
  while (!restored.result && restored.tick < powered + operation.bypassOpeningTicksV221) {
    drive(match);
    drive(restored);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.deepEqual(scene(restored)().hangarBypassV221, { phase: 'open', opening: 1 });
  assert.equal(getXenoTrialsOperationHudV188(restored).phase, 'VOLET OUVERT');
  assert.equal(checkpointXenoTrialsV186(saved, restored).applied, true);
  const shifted = getXenoTrialsSnapshotV96(restored);
  shifted.operationV188.bypassStartedTickV221 += 1;
  assert.equal(checkpointXenoTrialsV186(saved, shifted).applied, false);

  while (!restored.result && restored.tick < 5000) drive(restored);
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.ok(restored.result.hordeV180.kills < protocol.totalEnemies);
  assert.equal(restored.result.hordeV180.bossFinaleV186.defeated, true);
  const forgedResult = structuredClone(restored.result);
  forgedResult.hordeV180.bossFinaleV186.defeated = false;
  assert.equal(settleXenoTrialsV96(saved, forgedResult).applied, false);
  const prize = settleXenoTrialsV96(saved, restored.result);
  assert.equal(prize.applied, true, prize.reason);
  assert.equal(prize.receipt.credits, 80 + operation.reward);
  assert.ok(prize.state.modesV119.operationsCleared.includes(operation.id));
  assert.equal(settleXenoTrialsV96(prize.state, restored.result).applied, false);
});
