import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_HORDE_MINIGAMES_V213 as protocols, getXenoTrialsHordeGateV213 } from '../src/xeno-trials-horde-minigames-v213.js';
import { XENO_TRIALS_HORDE_BOARD_V213, XENO_TRIALS_HORDE_PROTOCOLS_V186, getXenoTrialsHordeProtocolV180 } from '../src/xeno-trials-horde-v180.js';
import { ARBITER_HORDE_PROTOCOLS_V191 } from '../src/xeno-arbiter-protocols-v191.js';
import { createXenoTrialsMatchV96, restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsHordeViewV180 } from '../src/xeno-trials-horde-ui-v180.js';
import { drawXenoTrialsReinforcementV201, getXenoTrialsReinforcementV201 } from '../src/xeno-trials-reinforcements-v201.js';
import { createXenoTrialsStageEventsV211 } from '../src/xeno-trials-stage-events-v211.js';

const authoredEntrances = {
  'xth213-airlock-relay': ['LLLL', 'RRRRR', 'LRLRL'],
  'xth213-dock-crossfire': ['LRLRL', 'RRRRR', 'LLLLLL'],
  'xth213-reactor-switchback': ['RRRR', 'LRLRLR', 'LLLLL', 'LRLRLR'],
  'xth218-bridge-retake': ['LLLL', 'RRRRR', 'LRLRL'],
  'xth220-evac-relief': ['LLLL', 'RRRR', 'LRLRL', 'RRRRRR'],
  'xth221-hangar-watch': ['LLLL', 'RRRR', 'LRLRL'],
  'xth222-logistics-watch': ['LLLL', 'RRRR', 'LRLRL'],
  'xth223-reactor-patrol': ['LLLL', 'RRRR', 'LRLRL']
};
const firstForecasts = {
  'xth213-airlock-relay': [{ left: 0, right: 3 }, { left: 2, right: 2 }],
  'xth213-dock-crossfire': [{ left: 0, right: 3 }, { left: 4, right: 0 }],
  'xth213-reactor-switchback': [{ left: 2, right: 2 }, { left: 3, right: 0 }, { left: 2, right: 2 }],
  'xth218-bridge-retake': [{ left: 0, right: 3 }, { left: 2, right: 2 }],
  'xth220-evac-relief': [{ left: 0, right: 3 }, { left: 2, right: 2 }, { left: 0, right: 4 }],
  'xth221-hangar-watch': [{ left: 0, right: 3 }, { left: 2, right: 1 }],
  'xth222-logistics-watch': [{ left: 0, right: 3 }, { left: 2, right: 2 }],
  'xth223-reactor-patrol': [{ left: 0, right: 3 }, { left: 2, right: 2 }]
};
const expectedGates = (counts, status, opening) => Object.fromEntries(['left', 'right'].map(side =>
  [side, counts[side] ? { status, opening } : { status: 'locked', opening: 0 }]));
const attackCadences = { 'xth213-reactor-switchback': 105, 'xth218-bridge-retake': 65, 'xth220-evac-relief': 54,
  'xth221-hangar-watch': 65, 'xth222-logistics-watch': 65, 'xth223-reactor-patrol': 54 };

function moveAndAttack(match, cadence) {
  const [player, ...contacts] = match.fighters;
  const nearest = contacts.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  stepXenoTrialsMatchV96(match, 1 / 120, { left: nearest?.x < player.x, right: nearest?.x > player.x,
    heavy: match.tick % cadence === 0, light: match.tick % cadence === Math.floor(cadence / 2) });
}

test('the horde board includes all eight authored programs and every historical protocol still resolves by its own ID', () => {
  assert.deepEqual(protocols.map(protocol => protocol.id), Object.keys(authoredEntrances));
  assert.deepEqual(XENO_TRIALS_HORDE_BOARD_V213.slice(0, protocols.length), protocols);
  assert.deepEqual(XENO_TRIALS_HORDE_BOARD_V213.slice(protocols.length), XENO_TRIALS_HORDE_PROTOCOLS_V186);
  const historic = [...XENO_TRIALS_HORDE_PROTOCOLS_V186, ...ARBITER_HORDE_PROTOCOLS_V191];
  assert.equal(new Set(historic.map(protocol => protocol.id)).size, 100);
  for (const protocol of historic) {
    assert.equal(getXenoTrialsHordeProtocolV180(protocol.id), protocol);
    assert.ok(protocol.waves.every(wave => getXenoTrialsHordeGateV213(wave, 0) === null));
  }
});

for (const protocol of protocols) {
  test(`${protocol.id} uses authored port ingress, survives intermission reload and settles its genuine CPU win once`, () => {
    const input = createXenoTrialsProgressV96();
    const opened = beginXenoTrialsV96(input, { playerId: 'warrior', activityV119: { branch: 'horde', id: protocol.id } });
    assert.equal(opened.applied, true);
    assert.equal(opened.config.stageId, protocol.stageId);
    let match = createXenoTrialsMatchV96({ ...opened.config, introSeconds: 0 });
    const makeStageObserver = current => createXenoTrialsStageEventsV211(protocol.stageId, current, XENO_TRIALS_ARENA_V96);
    let observe = makeStageObserver(match);
    let progress = opened.state;
    const pendingForecasts = [];
    const spawns = new Map();
    const attackCadence = attackCadences[protocol.id] ?? 180;
    let verifiedReplacements = 0;
    assert.equal(observe().affectsCombat, false);
    assert.ok(protocol.waves.every(wave => wave.hp >= 15 && wave.hp <= 24));

    while (!match.result && match.tick < protocol.roundSeconds * 120) {
      for (const event of match.events) if (event.type === 'horde-spawn-v180') spawns.set(event.instanceId, event);
      if (match.hordeV180.phase === 'intermission' && pendingForecasts.length < match.hordeV180.wavesCleared) {
        const forecast = getXenoTrialsReinforcementV201(match);
        assert.equal(forecast.phase, 'incoming');
        assert.equal(forecast.major, protocol.bossFinaleV186?.wave === forecast.wave);
        assert.deepEqual(forecast.gateContactsV213, firstForecasts[protocol.id][pendingForecasts.length]);
        const gatesBeforeResume = expectedGates(forecast.gateContactsV213, 'armed', 0);
        assert.deepEqual(observe().gates, gatesBeforeResume);
        const rectangles = [];
        const ctx = { save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, moveTo() {}, lineTo() {}, closePath() {},
          fill() {}, strokeRect(x, y, width, height) { rectangles.push({ x, y, width, height }); }, fillRect() {} };
        const drawn = drawXenoTrialsReinforcementV201(ctx, match, { center: 500, floor: 450 }, true);
        assert.deepEqual(drawn.gateContactsV213, forecast.gateContactsV213);
        assert.deepEqual(rectangles.map(rect => rect.x < 500 ? 'left' : 'right'),
          Object.keys(forecast.gateContactsV213).filter(side => forecast.gateContactsV213[side] > 0));
        assert.ok(getXenoTrialsHordeViewV180(match).announcement.includes(forecast.gateLabel));
        pendingForecasts.push(forecast);
        const checkpoint = checkpointXenoTrialsV186(progress, match);
        assert.equal(checkpoint.applied, true, checkpoint.reason);
        progress = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(checkpoint.state)));
        const restored = restoreXenoTrialsHordeMatchV180(progress.pending.checkpointV186.snapshot);
        assert.ok(restored?.paused);
        observe = makeStageObserver(restored);
        assert.deepEqual(observe({ paused: true }).gates, gatesBeforeResume);
        const tickBefore = restored.tick;
        moveAndAttack(restored, attackCadence);
        assert.equal(restored.tick, tickBefore);
        assert.deepEqual(getXenoTrialsReinforcementV201(restored), forecast);
        assert.deepEqual(observe({ paused: true }).gates, gatesBeforeResume);
        setXenoTrialsPausedV96(restored, false);
        match = restored;
      }
      if (match.hordeV180.phase === 'intermission' && match.hordeV180.nextWaveTick === match.tick + 12) {
        const { gateContactsV213 } = pendingForecasts.at(-1);
        assert.deepEqual(observe().gates, expectedGates(gateContactsV213, 'armed', .5));
        assert.deepEqual(observe({ reducedMotion: true }).gates, expectedGates(gateContactsV213, 'armed', 0));
      }
      const before = match.hordeV180.wave;
      moveAndAttack(match, attackCadence);
      if (match.hordeV180.wave !== before) {
        const arrived = getXenoTrialsReinforcementV201(match);
        assert.equal(arrived.phase, 'arrived');
        assert.equal(arrived.arrivalTick, match.tick);
        assert.deepEqual(arrived.gateContactsV213, pendingForecasts.at(-1).gateContactsV213);
        assert.deepEqual(observe().gates, expectedGates(arrived.gateContactsV213, 'open', 1));
      }
      const replacement = getXenoTrialsReinforcementV201(match);
      if (replacement?.kind === 'replacement' && replacement.phase === 'arrived' && replacement.arrivalTick === match.tick) {
        assert.deepEqual(observe().gates, expectedGates(replacement.gateContactsV213, 'open', 1));
        verifiedReplacements++;
      }
    }
    assert.equal(pendingForecasts.length, protocol.waves.length - 1);
    assert.equal(spawns.size, protocol.totalEnemies);
    assert.ok(verifiedReplacements > 0);
    for (let wave = 1; wave <= protocol.waves.length; wave++) {
      const events = [...spawns.values()].filter(event => event.wave === wave).sort((a, b) => a.slotIndex - b.slotIndex);
      const definition = protocol.waves[wave - 1];
      assert.equal(events.map(event => event.gateV213 === 'left' ? 'L' : 'R').join(''), authoredEntrances[protocol.id][wave - 1]);
      assert.ok(events.every(event => event.gateV213 === 'left' ? event.x < 0 : event.x > 1000));
      assert.ok(events.every(event => event.hp === (definition.enemySlotsV186?.[event.slotIndex].hp ?? definition.hp)));
    }
    assert.equal(match.result?.winner, 'player');
    assert.equal(match.result.reason, 'horde-cleared');
    assert.equal(match.result.hordeV180.kills, protocol.totalEnemies);
    if (protocol.bossFinaleV186) assert.equal(match.result.hordeV180.bossFinaleV186.defeated, true);
    assert.deepEqual(observe().gates, expectedGates({}, 'locked', 0));
    const settled = settleXenoTrialsV96(progress, match.result);
    assert.equal(settled.applied, true, settled.reason);
    assert.equal(settled.receipt.credits, protocol.reward + 80);
    assert.ok(settled.state.modesV119.hordeCleared.includes(protocol.id));
    assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
  });
}
