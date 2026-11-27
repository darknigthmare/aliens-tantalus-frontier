import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsBrainV119 } from '../src/xeno-trials-ai-v119.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHordeProtocolV180, XENO_TRIALS_HORDE_LIMITS_V180 } from '../src/xeno-trials-horde-v180.js';
import { XENO_TRIALS_PARRY_V208 } from '../src/xeno-trials-defense-v208.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const queen = 'drive-v123-fte-pathogen-queen-right-v13';
const advance = (match, count, player = {}, direct = null) => {
  for (let tick = 0; tick < count; tick++) stepXenoTrialsMatchV96(match, dt, player, direct);
};
function ticketFor(config, seed) {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), config);
  assert.ok(ticket.applied);
  return { ...ticket.config, seed };
}
function placeFront(player, target, gap) {
  player.facing = 1; target.facing = -1;
  target.x += bounds(player).right + gap - bounds(target).left;
}
function duel(difficulty, gap = 15) {
  const config = ticketFor({ playerId: 'runner', opponentId: queen, difficulty }, 30);
  const match = createXenoTrialsMatchV96({ ...config, introSeconds: 0, holdRoundTransition: true });
  const [player, cpu] = match.fighters;
  placeFront(player, cpu, gap);
  // A charged starting state isolates the usual full-meter admission. All
  // attacks, parry timing, guard decisions and consumption remain native.
  cpu.superMeterV148 = 100;
  return { config, match, player, cpu };
}

test('a hard CPU sees the heavy windup, pays for a parry and waits before its actual riposte', () => {
  const { config, match, player, cpu } = duel('hard'), hp = cpu.hp;
  advance(match, 1, { heavy: true });
  advance(match, 24);
  assert.equal(cpu.parryV208?.started > 0, true);
  assert.equal(match.ai.observation.attack.id, player.attack.id);
  assert.equal(match.events.some(event => event.type === 'parry-v208'), false, 'a prepared window alone awards nothing');
  const saved = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(saved);
  const restored = structuredClone(saved.snapshot);
  setXenoTrialsPausedV96(restored, false);
  for (const state of [match, restored]) advance(state, 52);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  const contact = match.events.find(event => event.type === 'parry-v208' && event.side === 'opponent');
  const riposte = match.events.find(event => event.kind === 'super-riposte');
  assert.ok(contact && riposte);
  assert.ok(riposte.tick >= contact.tick + 6 && riposte.tick < contact.tick + XENO_TRIALS_PARRY_V208.openingTicks);
  assert.equal(cpu.hp, hp);
  assert.equal(cpu.superMeterV148, 0);
  assert.equal(cpu.stats.supersV148, 1);
  assert.equal(cpu.stats.blocks, 1);
  assert.equal(match.events.filter(event => event.type === 'hit' && event.attacker === 'opponent').length, 1);
  assert.deepEqual(Object.keys(match.ai.input), Object.keys(createXenoTrialsBrainV119().input));
});

test('easy and normal retain the legacy input contract and out-of-range heavy attacks earn no parry', () => {
  for (const difficulty of ['easy', 'normal']) {
    const { match, cpu } = duel(difficulty);
    advance(match, 1, { heavy: true });
    advance(match, 120);
    assert.equal(match.events.some(event => event.type === 'parry-v208' || event.riposteIdV208 || event.signatureIdV208), false);
    assert.equal(cpu.parryV208, undefined);
    assert.deepEqual(Object.keys(match.ai.input), Object.keys(createXenoTrialsBrainV119().input));
  }
  const distant = duel('hard', 490);
  advance(distant.match, 1, { heavy: true });
  advance(distant.match, 38);
  assert.equal(distant.cpu.parryV208, undefined);
});

test('a native hard horde boss can choose a signature only after spawn grace and resume the telegraph', () => {
  const id = 'xth186-pursuit-4', activityV119 = { branch: 'horde', id };
  const config = ticketFor({ playerId: 'warrior', activityV119 }, 2);
  const protocol = getXenoTrialsHordeProtocolV180(id);
  const match = createXenoTrialsMatchV96({ ...config, introSeconds: 0 });
  // Arrange the authored final wave. Director, grace, boss decision,
  // attack, damage and checkpoint below all run through the real engine.
  for (let tick = 0; tick < 12000 && match.hordeV180.wave < protocol.bossFinaleV186.wave; tick++) {
    for (const enemy of match.fighters.slice(1)) enemy.hp = 0;
    advance(match, 1, {}, {});
  }
  const player = match.fighters[0], boss = match.fighters.find(enemy => enemy.enemyRankV186 === 'boss');
  assert.equal(boss?.id, 'armored-ravager');
  player.x = 500;
  placeFront(player, boss, 14);
  for (const enemy of match.fighters.slice(1)) if (enemy !== boss) enemy.x = -650;
  advance(match, XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks, {}, {});
  assert.equal(boss.attack, null);
  advance(match, 1);
  assert.equal(boss.attack?.kind, 'signature-3');
  const event = match.events.find(row => row.signatureIdV208);
  assert.equal(event.attackerInstanceV180, boss.instanceIdV180);
  assert.ok(event.tick >= boss.spawnTickV180 + XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks);
  assert.ok(match.events.some(row => row.type === 'horde-boss-telegraph-v186' && row.attackId === boss.attack.id));
  assert.ok(match.fighters.slice(1).filter(enemy => enemy.attack).length <= 2);
  const saved = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), config);
  assert.ok(saved);
  const restored = restoreXenoTrialsHordeMatchV180(saved.snapshot);
  assert.ok(restored);
  setXenoTrialsPausedV96(restored, false);
  for (const state of [match, restored]) advance(state, 58);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.ok(match.events.some(row => row.type === 'hit' && row.attackerInstanceV180 === boss.instanceIdV180));
  assert.ok(match.events.every(row => row.signatureIdV208 === undefined || row.attackerInstanceV180 === boss.instanceIdV180));
});
