import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_HORDE_MINIGAMES_V213 as protocols, getXenoTrialsHordeGateV213 } from '../src/xeno-trials-horde-minigames-v213.js';
import { XENO_TRIALS_HORDE_BOARD_V213, XENO_TRIALS_HORDE_PROTOCOLS_V186, getXenoTrialsHordeProtocolV180 } from '../src/xeno-trials-horde-v180.js';
import { ARBITER_HORDE_PROTOCOLS_V191 } from '../src/xeno-arbiter-protocols-v191.js';
import { createXenoTrialsMatchV96, restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96, checkpointXenoTrialsV186, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsHordeViewV180 } from '../src/xeno-trials-horde-ui-v180.js';
import { drawXenoTrialsReinforcementV201, getXenoTrialsReinforcementV201 } from '../src/xeno-trials-reinforcements-v201.js';

function moveAndAttack(match) {
  const [player, ...contacts] = match.fighters;
  const nearest = contacts.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  stepXenoTrialsMatchV96(match, 1 / 120, { left: nearest?.x < player.x, right: nearest?.x > player.x,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 });
}

test('the horde board adds two visible programs and every historical protocol still resolves by its own ID', () => {
  assert.deepEqual(XENO_TRIALS_HORDE_BOARD_V213.slice(0, 2), protocols);
  assert.deepEqual(XENO_TRIALS_HORDE_BOARD_V213.slice(2), XENO_TRIALS_HORDE_PROTOCOLS_V186);
  const historic = [...XENO_TRIALS_HORDE_PROTOCOLS_V186, ...ARBITER_HORDE_PROTOCOLS_V191];
  assert.equal(new Set(historic.map(protocol => protocol.id)).size, 100);
  for (const protocol of historic) {
    assert.equal(getXenoTrialsHordeProtocolV180(protocol.id), protocol);
    assert.ok(protocol.waves.every(wave => getXenoTrialsHordeGateV213(wave, 0) === null));
  }
});

for (const [index, protocol] of protocols.entries()) {
  test(`${protocol.id} uses authored port ingress, survives intermission reload and settles its genuine CPU win once`, () => {
    const input = createXenoTrialsProgressV96();
    const opened = beginXenoTrialsV96(input, { playerId: 'warrior', activityV119: { branch: 'horde', id: protocol.id } });
    assert.equal(opened.applied, true);
    assert.equal(opened.config.stageId, protocol.stageId);
    let match = createXenoTrialsMatchV96({ ...opened.config, introSeconds: 0 });
    let progress = opened.state;
    const pendingForecasts = [];
    const spawns = new Map();
    const firstForecasts = index === 0 ? [{ left: 0, right: 3 }, { left: 2, right: 2 }]
      : [{ left: 0, right: 3 }, { left: 4, right: 0 }];
    const authoredEntrances = index === 0 ? ['LLLL', 'RRRRR', 'LRLRL'] : ['LRLRL', 'RRRRR', 'LLLLLL'];

    while (!match.result && match.tick < protocol.roundSeconds * 120) {
      for (const event of match.events) if (event.type === 'horde-spawn-v180') spawns.set(event.instanceId, event);
      if (match.hordeV180.phase === 'intermission' && pendingForecasts.length < match.hordeV180.wavesCleared) {
        const forecast = getXenoTrialsReinforcementV201(match);
        assert.equal(forecast.phase, 'incoming');
        assert.deepEqual(forecast.gateContactsV213, firstForecasts[pendingForecasts.length]);
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
        const tickBefore = restored.tick;
        moveAndAttack(restored);
        assert.equal(restored.tick, tickBefore);
        assert.deepEqual(getXenoTrialsReinforcementV201(restored), forecast);
        setXenoTrialsPausedV96(restored, false);
        match = restored;
      }
      const before = match.hordeV180.wave;
      moveAndAttack(match);
      if (match.hordeV180.wave !== before) {
        const arrived = getXenoTrialsReinforcementV201(match);
        assert.equal(arrived.phase, 'arrived');
        assert.equal(arrived.arrivalTick, match.tick);
        assert.deepEqual(arrived.gateContactsV213, pendingForecasts.at(-1).gateContactsV213);
      }
    }
    assert.equal(pendingForecasts.length, 2);
    assert.equal(spawns.size, protocol.totalEnemies);
    for (let wave = 1; wave <= protocol.waves.length; wave++) {
      const events = [...spawns.values()].filter(event => event.wave === wave).sort((a, b) => a.slotIndex - b.slotIndex);
      assert.equal(events.map(event => event.gateV213 === 'left' ? 'L' : 'R').join(''), authoredEntrances[wave - 1]);
      assert.ok(events.every(event => event.gateV213 === 'left' ? event.x < 0 : event.x > 1000));
      assert.ok(events.every(event => event.hp === protocol.waves[wave - 1].hp));
    }
    assert.equal(match.result?.winner, 'player');
    assert.equal(match.result.reason, 'horde-cleared');
    assert.equal(match.result.hordeV180.kills, protocol.totalEnemies);
    const settled = settleXenoTrialsV96(progress, match.result);
    assert.equal(settled.applied, true, settled.reason);
    assert.equal(settled.receipt.credits, protocol.reward + 80);
    assert.ok(settled.state.modesV119.hordeCleared.includes(protocol.id));
    assert.equal(settleXenoTrialsV96(settled.state, match.result).applied, false);
  });
}
