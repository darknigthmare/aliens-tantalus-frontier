import assert from 'node:assert/strict';
import test from 'node:test';
import { getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { XENO_TRIALS_DEFLECTOR_OPERATION_V226 as operation } from '../src/xeno-trials-deflector-calibration-v226.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsHordeProtocolV180 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { validateXenoTrialsOperationSnapshotV188, XENO_TRIALS_OPERATION_BOARD_V213 } from '../src/xeno-trials-operations-v188.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96,
  settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';

const [west, east, terminal] = operation.objectives;
const horde = getXenoTrialsHordeProtocolV180(operation.hordeProtocolId);
const stage = getXenoTrialsBossStageV179(operation.stageId);
const hud = match => getXenoTrialsOperationHudV188(match);
const observe = match => createXenoTrialsStageEventsV211(stage.id, match, XENO_TRIALS_ARENA_V96);

function start(progress = createXenoTrialsProgressV96(), activityV119 = { branch: 'operations', id: operation.id }) {
  const ticket = beginXenoTrialsV96(progress, { playerId: 'warrior', activityV119 });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, destination, { guard = false, hunt = false, tolerance = 14 } = {}) {
  const [player, ...contacts] = match.fighters;
  const nearest = contacts.sort((a, b) => Math.abs(player.x - a.x) - Math.abs(player.x - b.x))[0];
  const gap = Math.abs(player.x - nearest?.x), aim = hunt ? nearest?.x ?? player.x : destination;
  const offset = aim - player.x;
  const hold = guard && Math.abs(offset) < 29;
  const attack = !guard && (hunt || destination === terminal.x), cadence = match.tick % 65;
  const movementTolerance = hunt ? 0 : tolerance;
  stepXenoTrialsMatchV96(match, 1 / 120, { left: !hold && offset < -movementTolerance, right: !hold && offset > movementTolerance,
    guard: hold, interact: !guard && !hunt && destination === terminal.x && Math.abs(offset) < 74,
    heavy: attack && (hunt || gap < 145) && cadence === 0, light: attack && (hunt || gap < 125) && cadence === 32 });
}

function until(match, predicate, x, opts, ceiling) {
  while (!predicate(match) && !match.result && match.tick < ceiling) drive(match, x, opts);
  assert.ok(predicate(match), `Native match reached tick ${match.tick}`);
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

function checkpoint(progress, match) {
  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  const scene = observe(match)({ paused: true }).deflectorCalibrationV226;
  for (let tick = 0; tick < 120; tick++) drive(match, terminal.x);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const result = checkpointXenoTrialsV186(progress, frozen);
  assert.equal(result.applied, true, result.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(result.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), frozen);
  assert.deepEqual(observe(restored)({ paused: true }).deflectorCalibrationV226, scene);
  resume(match);
  resume(restored);
  return { saved, restored };
}

function rects(view, center) {
  const calls = [];
  const ctx = new Proxy({ fillRect(x, y, width, height) { calls.push({ x, y, width, height }); } },
    { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsStageEventsV211(ctx, stage, { center, floor: 450 }, view);
  return calls;
}

test('the proving-ground program admits its own low-HP waves, and a native guard outside the bays credits neither', () => {
  const { ticket, match } = start();
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.equal(ticket.config.stageId, 'xt179-proving-ground');
  assert.deepEqual(horde.waves.map(wave => [wave.total, wave.hp]), [[5, 15], [6, 17], [7, 20]]);
  assert.equal(hud(match).phase, 'BLOCAGES DANS LES ZONES');
  assert.equal(hud(match).entities.find(entity => entity.id === terminal.id).active, false);
  until(match, value => value.fighters[0].stats.blocks >= 1, west.x + west.radius + 22, { guard: true }, 850);
  assert.ok(match.fighters[0].x > west.x + west.radius && match.fighters[0].x < east.x - east.radius);
  assert.ok(match.events.some(event => event.type === 'block' && event.targetInstanceV180 === 'player'));
  assert.deepEqual(match.operationV188.deflectorCalibrationV226, [null, null]);
  assert.deepEqual(match.operationV188.progress, [0, 0, 0]);
  const early = getXenoTrialsSnapshotV96(match);
  early.operationV188.progress[2] = 1;
  assert.equal(validateXenoTrialsOperationSnapshotV188(early.operationV188, ticket.config, early), false);
  const hordeMatch = start(createXenoTrialsProgressV96(), { branch: 'horde', id: horde.id }).match;
  assert.equal(observe(hordeMatch)().gates.left.status, 'open');
  assert.equal(Object.hasOwn(observe(hordeMatch)(), 'deflectorCalibrationV226'), false);
});

test('west-first native blocks drive the two rear depths, survive exact restore and award the real result once', () => {
  const { ticket, match } = start();
  until(match, value => value.operationV188.completed[0], west.x, { guard: true }, 620);
  const [left] = match.operationV188.deflectorCalibrationV226;
  const event = match.events.find(hit => hit.id === left.id);
  assert.equal(event.type, 'block');
  assert.equal(event.tick, left.tick);
  assert.equal(event.targetInstanceV180, 'player');
  assert.equal(left.x, match.fighters[0].x);
  assert.equal(hud(match).target.id, east.id);
  assert.deepEqual(observe(match)().deflectorCalibrationV226.aligned, [true, false]);
  until(match, value => value.operationV188.completed[1], east.x, { guard: true }, 950);
  const [, right] = match.operationV188.deflectorCalibrationV226;
  assert.equal(match.fighters[0].stats.blocks, 2);
  assert.ok(right.tick > left.tick && Math.abs(right.x - east.x) <= east.radius);
  until(match, value => value.tick === right.tick + 36, terminal.x, {}, right.tick + 38);
  const middle = hud(match);
  assert.equal(middle.phase, 'DÉFLECTEURS EN DÉPLOIEMENT');
  assert.match(middle.instruction, /50 %/);
  assert.equal(middle.target.progress, 0);
  const activate = observe(match);
  const frame = activate(), flat = activate({ reducedMotion: true });
  const blades = (view, center) => rects(view, center).filter(rect => rect.width === 74 && rect.height === 30);
  const relays = center => rects(frame, center).filter(rect => rect.width === 94 && rect.height === 55);
  assert.equal(frame.affectsCombat, false);
  assert.deepEqual(frame.deflectorCalibrationV226, { phase: 'deploying', aligned: [true, true], deployment: [1, .5] });
  assert.deepEqual(blades(frame, 600).map(blade => blade.x), blades(frame, 500).map(blade => blade.x - 31));
  assert.deepEqual(relays(600).map(relay => relay.x), relays(500).map(relay => relay.x - 17));
  assert.equal(blades(frame, 500)[1].y - blades(flat, 500)[1].y, 32.5);
  const forged = getXenoTrialsSnapshotV96(match);
  forged.operationV188.deflectorCalibrationV226[0].id++;
  assert.equal(validateXenoTrialsOperationSnapshotV188(forged.operationV188, ticket.config, forged), false);

  const { saved, restored } = checkpoint(ticket.state, match);
  assert.deepEqual(hud(restored), middle);
  while (!restored.result && restored.tick < 1450) {
    drive(match, terminal.x);
    drive(restored, terminal.x);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.equal(restored.result.hordeV180.kills, 3);
  const falseReceipt = structuredClone(restored.result);
  falseReceipt.playerStats.blocks = 1;
  assert.equal(settleXenoTrialsV96(ticket.state, falseReceipt).applied, false);
  const prize = settleXenoTrialsV96(saved, restored.result);
  assert.equal(prize.applied, true, prize.reason);
  assert.equal(prize.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(prize.state, restored.result).applied, false);
});

test('east-first is legal, and checkpoint history rejects rewriting a calibrated zone after its event leaves the buffer', () => {
  const { ticket, match } = start();
  until(match, current => current.operationV188.completed[1], east.x, { guard: true }, 700);
  assert.deepEqual(match.operationV188.progress, [0, 1, 0]);
  const { saved, restored } = checkpoint(ticket.state, match);
  until(restored, current => current.operationV188.completed[0], west.x, { guard: true }, 1600);
  const [left, right] = restored.operationV188.deflectorCalibrationV226;
  assert.ok(left.tick > right.tick);
  until(restored, current => right.id < current.events[0].id, terminal.x, { hunt: true }, 1900);
  const shifted = getXenoTrialsSnapshotV96(restored);
  shifted.operationV188.deflectorCalibrationV226[1].tick--;
  assert.equal(validateXenoTrialsOperationSnapshotV188(shifted.operationV188, ticket.config, shifted), true);
  assert.equal(checkpointXenoTrialsV186(saved, shifted).applied, false);
  until(restored, current => current.result?.reason === 'operation-complete', terminal.x, {}, 3000);
  assert.equal(settleXenoTrialsV96(saved, restored.result).applied, true);
});

test('clearing all eighteen targets without calibrating ends the operation and the retry restores both zones', () => {
  const { ticket, match } = start();
  until(match, current => current.result?.reason === 'operation-failed', terminal.x, { hunt: true }, 5000);
  assert.equal(match.result.hordeV180.kills, 18);
  assert.match(hud(match).hint, /Contacts épuisés/);
  assert.deepEqual(match.operationV188.deflectorCalibrationV226, [null, null]);
  const forged = structuredClone(match.result);
  forged.hordeV180.wavesCleared--;
  forged.hordeV180.kills--;
  assert.equal(settleXenoTrialsV96(ticket.state, forged).applied, false);
  const lost = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(lost.applied, true, lost.reason);
  assert.equal(lost.receipt.modeReward.bonus, 0);
  const retry = start(lost.state);
  assert.notEqual(retry.ticket.config.matchId, ticket.config.matchId);
  assert.equal(hud(retry.match).phase, 'BLOCAGES DANS LES ZONES');
  assert.equal(hud(retry.match).integrity, 100);
  assert.deepEqual(retry.match.operationV188.deflectorCalibrationV226, [null, null]);
  assert.equal(settleXenoTrialsV96(retry.ticket.state, match.result).applied, false);
});
