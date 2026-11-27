import assert from 'node:assert/strict';
import test from 'node:test';
import { getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsHordeProtocolV180 } from '../src/xeno-trials-horde-v180.js';
import { drawXenoTrialsOperationV188, getXenoTrialsOperationHudV188 } from '../src/xeno-trials-operation-presentation-v188.js';
import { XENO_TRIALS_DECOMPRESSION_OPERATION_V224 as operation, XENO_TRIALS_OPERATION_BOARD_V213,
  getXenoTrialsOperationViewV188, validateXenoTrialsOperationSnapshotV188 } from '../src/xeno-trials-operations-v188.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96,
  settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';

const stage = getXenoTrialsBossStageV179(operation.stageId);
const horde = getXenoTrialsHordeProtocolV180(operation.hordeProtocolId);
const [west, east, airlock] = operation.objectives;
const observe = match => createXenoTrialsStageEventsV211(stage.id, match, XENO_TRIALS_ARENA_V96);

function start(progress = createXenoTrialsProgressV96(), activityV119 = { branch: 'operations', id: operation.id }) {
  const ticket = beginXenoTrialsV96(progress, { playerId: 'warrior', activityV119 });
  assert.equal(ticket.applied, true, ticket.reason);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0 }) };
}

function drive(match, target, { interact = true, hunt = false } = {}) {
  const [player, ...contacts] = match.fighters;
  const nearest = contacts.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  const distance = Math.abs(nearest?.x - player.x);
  const destination = hunt ? nearest?.x ?? player.x : target.x;
  const tolerance = hunt ? 0 : 12;
  const cadence = hunt ? 54 : 65;
  const time = match.tick % cadence;
  stepXenoTrialsMatchV96(match, 1 / 120, {
    left: player.x > destination + tolerance, right: player.x < destination - tolerance,
    interact: interact && Math.abs(player.x - destination) < 75,
    heavy: (hunt || distance < 145) && time === 0,
    light: (hunt || distance < 125) && time === Math.floor(cadence / 2)
  });
}

function resume(match) {
  setXenoTrialsPausedV96(match, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
}

function checkpoint(progress, match) {
  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  drive(match, airlock);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const accepted = checkpointXenoTrialsV186(progress, frozen);
  assert.equal(accepted.applied, true, accepted.reason);
  const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(accepted.state)));
  const restored = restoreXenoTrialsHordeMatchV180(saved.pending.checkpointV186.snapshot);
  assert.ok(restored?.paused);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), frozen);
  return { saved, restored };
}

function backgroundRects(view, center) {
  const rectangles = [];
  const ctx = new Proxy({ fillRect(x, y, width, height) { rectangles.push({ x, y, width, height }); } },
    { get: (target, key) => target[key] ?? (() => {}) });
  drawXenoTrialsStageEventsV211(ctx, stage, { center, floor: 450 }, view);
  return rectangles;
}

test('the colony pressure program has three weak waves and the collector state belongs only to the operation', () => {
  const { ticket, match } = start();
  assert.ok(XENO_TRIALS_OPERATION_BOARD_V213.includes(operation));
  assert.equal(ticket.config.stageId, 'xt179-colony-utility');
  assert.equal(horde.totalEnemies, 18);
  assert.deepEqual(horde.waves.map(wave => [wave.total, wave.hp]), [[5, 15], [6, 17], [7, 20]]);
  const first = getXenoTrialsOperationHudV188(match);
  assert.equal(first.phase, 'CONDUITS SOUS PRESSION');
  assert.equal(first.purgeV204.pressure.expectedLoss, 2);
  assert.equal(first.entities.find(entity => entity.id === airlock.id).active, false);
  for (let ticks = 0; ticks < 130; ticks++) drive(match, airlock);
  assert.deepEqual(match.operationV188.progress, [0, 0, 0]);
  const hordeMatch = start(createXenoTrialsProgressV96(), { branch: 'horde', id: horde.id }).match;
  assert.equal(hordeMatch.operationV188, undefined);
  assert.ok(observe(hordeMatch)().gates);
  assert.equal(Object.hasOwn(observe(hordeMatch)(), 'collectorV224'), false);
  assert.equal(getXenoTrialsStageHazardViewV188(hordeMatch), null);
  const historic = start(createXenoTrialsProgressV96(), { branch: 'operations', id: 'xto188-relay-1' }).match;
  assert.equal(Object.hasOwn(historic.operationV188, 'decompressionSealTicksV224'), false);
  assert.equal(Object.hasOwn(getXenoTrialsOperationViewV188(historic), 'decompressionV224'), false);
});

test('sealing east removes its announced discharge, restores the diversion and concentrates the next warning west', () => {
  const { ticket, match } = start();
  while (match.tick < 228) drive(match, east);
  const initial = getXenoTrialsStageHazardViewV188(match);
  assert.equal(initial.phase, 'warning');
  assert.deepEqual(initial.zones.map(zone => [zone.left, zone.right]), [[842, 974]]);
  while (!match.operationV188.completed[1] && match.tick < 600) drive(match, east);
  assert.deepEqual(match.operationV188.decompressionSealTicksV224, [null, 330]);
  assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'idle');
  assert.deepEqual(getXenoTrialsStageHazardViewV188(match).zones, []);
  const before = getXenoTrialsOperationHudV188(match);
  assert.equal(before.phase, 'PRESSION DÉVIÉE À L’OUEST');
  assert.deepEqual([before.purgeV204.pressure.open, before.purgeV204.pressure.expectedLoss], [1, 4]);
  assert.equal(before.integrity, 98);
  assert.deepEqual(observe(match)().collectorV224, before.decompressionV224);

  const { saved, restored } = checkpoint(ticket.state, match);
  assert.deepEqual(getXenoTrialsOperationHudV188(restored), before);
  assert.deepEqual(observe(restored)({ paused: true }).collectorV224, before.decompressionV224);
  resume(match);
  resume(restored);
  while (match.tick < 1428 && !match.result) {
    drive(match, airlock, { interact: false });
    drive(restored, airlock, { interact: false });
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(match.operationV188.integrity, 82);
  const diverted = getXenoTrialsStageHazardViewV188(restored);
  assert.equal(diverted.phase, 'warning');
  assert.deepEqual(diverted.zones.map(zone => [zone.left, zone.right]), [[328, 460]]);
  const editedSeal = getXenoTrialsSnapshotV96(restored);
  editedSeal.operationV188.decompressionSealTicksV224[1]++;
  assert.equal(validateXenoTrialsOperationSnapshotV188(editedSeal.operationV188, ticket.config, editedSeal), true);
  assert.equal(checkpointXenoTrialsV186(saved, editedSeal).applied, false);
  while (!restored.operationV188.completed[0] && !restored.result && restored.tick < 2400) drive(restored, west);
  while (!restored.result && restored.tick < 4500) drive(restored, airlock);
  assert.equal(restored.result?.reason, 'operation-complete');
  assert.ok(restored.result.operationV188.state.decompressionSealTicksV224[0] > 1428);
  assert.equal(settleXenoTrialsV96(saved, restored.result).applied, true);
});

test('west-first crosses a live steam lane, opens a parallax airlock after restore and pays only a valid terminal receipt', () => {
  const { ticket, match } = start();
  while (!match.operationV188.completed[0] && !match.result && match.tick < 800) drive(match, west);
  assert.equal(getXenoTrialsOperationHudV188(match).phase, 'PRESSION DÉVIÉE À L’EST');
  while (!match.operationV188.completed[1] && !match.result && match.tick < 1500) drive(match, east);
  const [first, second] = match.operationV188.decompressionSealTicksV224;
  assert.ok(Number.isInteger(first) && Number.isInteger(second) && second > first);
  assert.ok(match.stageHazardsV188.playerDamage > 0);
  assert.ok(match.events.some(event => event.type === 'stage-hazard-contact-v188' && event.actorId === 'player'));
  assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'idle');
  const midOpening = second + operation.decompressionOpeningTicksV224 / 2;
  while (match.tick < midOpening) drive(match, airlock);
  const view = getXenoTrialsOperationHudV188(match);
  assert.equal(view.phase, 'SAS EN DÉCOMPRESSION');
  assert.match(view.instruction, /50 %/);
  assert.equal(view.target.progress, 0);
  assert.equal(view.purgeV204.pressure, null);
  assert.equal(view.purgeV204.work, undefined);
  const stageObserver = observe(match);
  const visual = stageObserver();
  const flatView = stageObserver({ reducedMotion: true });
  const panels = (state, center) => backgroundRects(state, center).filter(rect => rect.height === 93);
  const ducts = center => backgroundRects(visual, center).filter(rect => rect.height === 82 && rect.width === 50);
  assert.equal(visual.affectsCombat, false);
  assert.deepEqual(panels(visual, 500).map(panel => panel.width), [34.5, 34.5]);
  assert.deepEqual(panels(flatView, 500).map(panel => panel.width), [69, 69]);
  assert.deepEqual(panels(visual, 600).map(panel => panel.x), panels(visual, 500).map(panel => panel.x - 19));
  assert.deepEqual(ducts(600).map(duct => duct.x), ducts(500).map(duct => duct.x - 29));

  const earlyTerminal = getXenoTrialsSnapshotV96(match);
  earlyTerminal.operationV188.progress[2] = 1;
  assert.equal(validateXenoTrialsOperationSnapshotV188(earlyTerminal.operationV188, ticket.config, earlyTerminal), false);
  assert.equal(checkpointXenoTrialsV186(ticket.state, earlyTerminal).applied, false);
  const { saved, restored } = checkpoint(ticket.state, match);
  assert.deepEqual(observe(restored)({ paused: true }).collectorV224, visual.collectorV224);
  const ctx = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
  const props = drawXenoTrialsOperationV188(ctx, restored, XENO_TRIALS_ARENA_V96);
  assert.equal(props.entities, 3);
  assert.deepEqual(props.purge.vents.map(vent => [vent.id, vent.phase]), [[west.id, 'sealed'], [east.id, 'sealed']]);
  resume(restored);
  while (restored.tick < second + operation.decompressionOpeningTicksV224) drive(restored, airlock);
  assert.equal(getXenoTrialsOperationHudV188(restored).phase, 'SAS OUVERT');
  assert.equal(getXenoTrialsOperationHudV188(restored).entities.find(entity => entity.id === airlock.id).active, true);
  while (!restored.result && restored.tick < 2800) drive(restored, airlock);
  assert.equal(restored.result?.reason, 'operation-complete');
  const forgedIntegrity = structuredClone(restored.result);
  forgedIntegrity.operationV188.state.integrity++;
  assert.equal(settleXenoTrialsV96(saved, forgedIntegrity).applied, false);
  const prize = settleXenoTrialsV96(saved, restored.result);
  assert.equal(prize.applied, true, prize.reason);
  assert.equal(prize.receipt.credits, operation.reward + 80);
  assert.equal(settleXenoTrialsV96(prize.state, restored.result).applied, false);
});

test('abandoning the open duct destroys the collector even after the horde clears and a fresh ticket resets the pressure', () => {
  const { ticket, match } = start();
  while (!match.operationV188.completed[1] && !match.result && match.tick < 600) drive(match, east);
  while (!match.result && match.tick < 6600) drive(match, east, { interact: false, hunt: true });
  assert.equal(match.result?.reason, 'operation-failed');
  assert.equal(match.result.hordeV180.kills, horde.totalEnemies);
  assert.equal(match.operationV188.failureReason, 'structure-destroyed');
  assert.equal(match.operationV188.integrity, 0);
  assert.equal(match.operationV188.completed[2], false);
  const lost = settleXenoTrialsV96(ticket.state, match.result);
  assert.equal(lost.applied, true, lost.reason);
  assert.equal(lost.receipt.modeReward.bonus, 0);
  const retry = start(lost.state);
  assert.notEqual(retry.ticket.config.matchId, ticket.config.matchId);
  assert.deepEqual(retry.match.operationV188.decompressionSealTicksV224, [null, null]);
  assert.deepEqual(retry.match.operationV188.progress, [0, 0, 0]);
  assert.equal(retry.match.operationV188.integrity, 100);
  assert.equal(getXenoTrialsOperationHudV188(retry.match).phase, 'CONDUITS SOUS PRESSION');
  assert.equal(settleXenoTrialsV96(retry.ticket.state, match.result).applied, false);
});
