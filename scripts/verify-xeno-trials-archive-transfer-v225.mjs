import assert from 'node:assert/strict';
import test from 'node:test';
import { getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsHordeProtocolV180 } from '../src/xeno-trials-horde-v180.js';
import { XENO_TRIALS_ARCHIVE_OPERATION_V225 as operation } from '../src/xeno-trials-archive-transfer-v225.js';
import { getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { getXenoTrialsOperationViewV188, XENO_TRIALS_OPERATION_BOARD_V213,
  validateXenoTrialsOperationSnapshotV188 } from '../src/xeno-trials-operations-v188.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96,
  settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';

const stage = getXenoTrialsBossStageV179(operation.stageId);
const horde = getXenoTrialsHordeProtocolV180(operation.hordeProtocolId);
const [west, east, uplink] = [205, 1095, 650];
const hud = match => getXenoTrialsOperationHudV188(match);
const observe = match => createXenoTrialsStageEventsV211(stage.id, match, XENO_TRIALS_ARENA_V96);

function start(progress = createXenoTrialsProgressV96(), activityV119 = { branch: 'operations', id: operation.id }) {
  const ticket = beginXenoTrialsV96(progress, { playerId: 'warrior', activityV119 });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, x, { interact = true, hunt = false, cadence = 65, attack = true } = {}) {
  const [player, ...contacts] = match.fighters;
  const nearest = contacts.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  const distance = Math.abs(nearest?.x - player.x), destination = hunt ? nearest?.x ?? player.x : x;
  const tolerance = hunt ? 0 : 12, time = match.tick % cadence;
  stepXenoTrialsMatchV96(match, 1 / 120, {
    left: player.x > destination + tolerance, right: player.x < destination - tolerance,
    interact: interact && Math.abs(player.x - destination) < 75,
    heavy: attack && (hunt || distance < 145) && time === 0,
    light: attack && (hunt || distance < 125) && time === Math.floor(cadence / 2)
  });
}

function until(match, predicate, x, options, ceiling) {
  while (!predicate(match) && !match.result && match.tick < ceiling) drive(match, x, options);
  assert.ok(predicate(match), `Native control route reached tick ${match.tick}`);
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

function restore(progress, match) {
  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  const frozenScene = observe(match)({ paused: true }).archiveTransferV225;
  for (let tick = 0; tick < 90; tick++) drive(match, uplink);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const checkpoint = checkpointXenoTrialsV186(progress, frozen);
  assert.equal(checkpoint.applied, true, checkpoint.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), frozen);
  assert.deepEqual(observe(restored)({ paused: true }).archiveTransferV225, frozenScene);
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

test('archive selection protects the sealed copy until its own first wave clears and stays local to this operation', () => {
  const { ticket, match } = start();
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.equal(ticket.config.stageId, 'xt179-archives');
  assert.deepEqual(horde.waves.map(wave => [wave.total, wave.hp]), [[5, 15], [6, 17], [7, 20]]);
  assert.deepEqual(hud(match).entities.map(entity => [entity.id, entity.active]),
    [['archive-volatile', true], ['archive-sealed', false], ['archive-uplink', false]]);
  for (let tick = 0; tick < 105; tick++) drive(match, uplink, { attack: false });
  assert.deepEqual(match.operationV188.progress, [0, 0]);
  until(match, current => current.tick >= 520, east, { attack: false }, 525);
  assert.equal(hud(match).target.id, 'archive-sealed');
  assert.equal(hud(match).target.locked, true);
  assert.match(hud(match).instruction, /NEUTRALISEZ LA PREMIÈRE VAGUE/);
  assert.deepEqual(match.operationV188.archiveTransferV225, { route: null, tick: null, charges: [0, 0] });
  const forged = getXenoTrialsSnapshotV96(match);
  forged.operationV188.archiveTransferV225.charges[1] = 1;
  assert.equal(validateXenoTrialsOperationSnapshotV188(forged.operationV188, ticket.config, forged), false);
  assert.equal(checkpointXenoTrialsV186(ticket.state, forged).applied, false);

  const hordeMatch = start(createXenoTrialsProgressV96(), { branch: 'horde', id: horde.id }).match;
  assert.equal(hordeMatch.operationV188, undefined);
  assert.equal(observe(hordeMatch)().gates.right.status, 'open');
  assert.equal(Object.hasOwn(observe(hordeMatch)(), 'archiveTransferV225'), false);
  const historic = start(createXenoTrialsProgressV96(), { branch: 'operations', id: 'xto188-extraction-4' }).match;
  assert.equal(Object.hasOwn(historic.operationV188, 'archiveTransferV225'), false);
  assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(historic), 'archiveTransferV225'), false);
});

test('temporary copy drives both parallax depths, resumes in transmission and pays its earned reward once', () => {
  const { ticket, match } = start();
  until(match, current => current.operationV188.archiveTransferV225.charges[0] >= 42, west, {}, 440);
  const scene = observe(match);
  const view = scene();
  const current = view.archiveTransferV225;
  assert.equal(view.affectsCombat, false);
  assert.ok(current.progress[0] >= .5 && current.progress[0] < 1);
  assert.deepEqual(current.phases, ['ready', 'locked']);
  const parts = (frame, center, height) => rects(frame, center).filter(rect => rect.height === height);
  assert.deepEqual(parts(view, 600, 107).map(rect => rect.x), parts(view, 500, 107).map(rect => rect.x - 30));
  assert.deepEqual(parts(view, 600, 101).map(rect => rect.x), parts(view, 500, 101).map(rect => rect.x - 14));
  assert.ok(rects(view, 500).some(rect => rect.width === 76 && rect.height < 85));
  assert.equal(rects(scene({ reducedMotion: true }), 500).filter(rect => rect.width === 76 && rect.height === 85).length, 2);

  until(match, value => value.operationV188.archiveTransferV225.route === 0, west, {}, 540);
  const chosen = hud(match);
  assert.deepEqual(chosen.archiveTransferV225.phases, ['copied', 'locked']);
  assert.equal(chosen.phase, 'CACHE TEMPORAIRE · 6,0 s');
  assert.equal(chosen.target.id, 'archive-uplink');
  assert.equal(chosen.archiveTransferV225.remainingTicks, chosen.archiveTransferV225.durationTicks);
  until(match, value => value.operationV188.progress[1] >= 30, uplink, {}, 890);
  const partial = hud(match);
  assert.match(partial.instruction, /33 %/);
  assert.ok(partial.archiveTransferV225.remainingTicks > 0 && partial.integrity < 100);
  const { saved, restored } = restore(ticket.state, match);
  assert.deepEqual(hud(restored), partial);
  while (!restored.result && restored.tick < 1100) {
    drive(match, uplink);
    drive(restored, uplink);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.equal(restored.result.hordeV180.wavesCleared, 0);
  const forged = structuredClone(restored.result);
  forged.operationV188.state.integrity++;
  assert.equal(settleXenoTrialsV96(saved, forged).applied, false);
  const prize = settleXenoTrialsV96(saved, restored.result);
  assert.equal(prize.applied, true, prize.reason);
  assert.equal(prize.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(prize.state, restored.result).applied, false);
});

test('the first genuine wave releases the sealed copy, whose saved route and timing cannot be replaced', () => {
  const { ticket, match } = start();
  const seeking = { hunt: true, interact: false, cadence: 54 };
  until(match, value => value.hordeV180.wavesCleared === 1, uplink, seeking, 1600);
  const opened = observe(match)().archiveTransferV225;
  assert.deepEqual(opened.phases, ['ready', 'ready']);
  assert.equal(opened.route, null);
  assert.equal(match.hordeV180.totalKills, horde.waves[0].total);
  until(match, value => value.operationV188.archiveTransferV225.route === 1, east, { cadence: 54 }, 2200);
  assert.equal(hud(match).phase, 'COPIE SCELLÉE');
  assert.equal(hud(match).archiveTransferV225.remainingTicks, null);
  assert.equal(hud(match).integrity, 100);
  const { saved, restored } = restore(ticket.state, match);
  const picked = restored.operationV188.archiveTransferV225.tick;
  until(restored, value => value.tick === picked + 45, uplink, { cadence: 54 }, picked + 46);
  const shifted = getXenoTrialsSnapshotV96(restored);
  shifted.operationV188.archiveTransferV225.tick++;
  assert.equal(validateXenoTrialsOperationSnapshotV188(shifted.operationV188, ticket.config, shifted), true);
  assert.equal(checkpointXenoTrialsV186(saved, shifted).applied, false);
  const alternative = getXenoTrialsSnapshotV96(restored);
  alternative.operationV188.archiveTransferV225 = { route: 0, tick: picked, charges: [84, 0] };
  alternative.operationV188.integrity = Math.ceil(100 * (720 - 45) / 720);
  assert.equal(validateXenoTrialsOperationSnapshotV188(alternative.operationV188, ticket.config, alternative), true);
  assert.equal(checkpointXenoTrialsV186(saved, alternative).applied, false);
  until(restored, value => value.result?.reason === 'operation-complete', uplink, { cadence: 54 }, 2900);
  assert.equal(restored.result.operationV188.state.integrity, 100);
  const fabricated = structuredClone(restored.result);
  fabricated.hordeV180.wavesCleared = 0;
  assert.equal(settleXenoTrialsV96(ticket.state, fabricated).applied, false);
  assert.equal(settleXenoTrialsV96(saved, restored.result).applied, true);
});

test('the temporary copy expires on its exact deadline and a new ticket resets both options', () => {
  const { ticket, match } = start();
  until(match, value => value.operationV188.archiveTransferV225.route === 0, west, {}, 540);
  const expiry = match.tick + hud(match).archiveTransferV225.durationTicks;
  until(match, value => value.tick === expiry - 1, west, { interact: false }, expiry);
  assert.equal(hud(match).archiveTransferV225.remainingTicks, 1);
  assert.equal(hud(match).integrity, 1);
  const { saved, restored } = restore(ticket.state, match);
  drive(restored, west, { interact: false });
  assert.equal(restored.tick, expiry);
  assert.equal(restored.result?.reason, 'operation-failed');
  assert.equal(hud(restored).phase, 'CACHE EXPIRÉ');
  assert.match(hud(restored).hint, /Copie temporaire expirée/);
  const lost = settleXenoTrialsV96(saved, restored.result);
  assert.equal(lost.applied, true, lost.reason);
  assert.equal(lost.receipt.modeReward.bonus, 0);
  const retry = start(lost.state);
  assert.notEqual(retry.ticket.config.matchId, ticket.config.matchId);
  assert.deepEqual(retry.match.operationV188.archiveTransferV225, { route: null, tick: null, charges: [0, 0] });
  assert.equal(hud(retry.match).integrity, 100);
  assert.equal(settleXenoTrialsV96(retry.ticket.state, restored.result).applied, false);
});
