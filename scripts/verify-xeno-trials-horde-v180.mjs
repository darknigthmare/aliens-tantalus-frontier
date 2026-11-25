import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_HORDE_PROTOCOLS_V180 as protocols, getXenoTrialsHordeProtocolV180,
  XENO_TRIALS_HORDE_LIMITS_V180 as limits } from '../src/xeno-trials-horde-v180.js';
import { XENO_TRIALS_FIGHTERS_V96, XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180, nextXenoTrialsRoundV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';

const create = (extra = {}) => createXenoTrialsMatchV96({ playerId: 'warrior', seed: 180, introSeconds: 0,
  activityV119: { branch: 'horde', id: 'xth180-incoming-1' }, ...extra });
const ticks = (match, count, controls = {}, cpu = null) => {
  for (let tick = 0; tick < count; tick++) stepXenoTrialsMatchV96(match, 1 / 120, controls, cpu);
};

test('forty distinct protocols use admitted weak enemies, forty stages, bounded concurrent waves and independent IDs', () => {
  assert.equal(protocols.length, 40); assert.equal(new Set(protocols.map(protocol => protocol.id)).size, 40);
  assert.equal(new Set(protocols.map(protocol => protocol.stageId)).size, 40);
  assert.equal(getXenoTrialsHordeProtocolV180('xte179-incoming-1'), null);
  for (const protocol of protocols) {
    assert.match(protocol.id, /^xth180-/);
    assert.ok(XENO_TRIALS_STAGES_V96.some(stage => stage.id === protocol.stageId));
    assert.ok(protocol.opponentIds.every(id => XENO_TRIALS_FIGHTERS_V96.some(fighter => fighter.id === id)));
    for (const wave of protocol.waves) {
      assert.ok(wave.concurrent >= 3 && wave.concurrent <= 8);
      assert.ok(wave.hp >= 15 && wave.hp <= 35);
      assert.ok(wave.total >= wave.concurrent);
    }
    const match = create({ activityV119: { branch: 'horde', id: protocol.id } });
    assert.equal(match.fighters.length, protocol.waves[0].concurrent + 1);
    assert.ok(match.fighters.slice(1).every(enemy => enemy.hp === protocol.waves[0].hp));
    assert.equal(match.config.stageId, protocol.stageId);
    assert.equal(match.config.roundSeconds, protocol.roundSeconds);
  }
  const legacy = create({ activityV119: { branch: 'challenges', id: 'xte179-incoming-1' } });
  assert.equal(legacy.hordeV180, undefined); assert.equal(legacy.fighters.length, 2);
});

test('one native heavy hit contacts three separate enemies, without repeating a hit on a held input', () => {
  const match = create(), player = match.fighters[0]; player.x = 0;
  // Spatial fixture only: three weak actors are put within the same visible
  // sweep. Attacks, timing, damage and deaths use the production engine.
  for (const [index, enemy] of match.fighters.slice(1).entries()) {
    enemy.facing = -1;
    enemy.x = bounds(player).right + (enemy.x - bounds(enemy).left) + index * 8;
  }
  ticks(match, 65, { heavy: true }, {});
  assert.equal(player.stats.hits, 3); assert.equal(player.stats.damage, 45);
  assert.equal(match.hordeV180.totalKills, 3); assert.equal(match.hordeV180.alive, 0);
  ticks(match, 15, { heavy: true }, {});
  assert.equal(player.stats.hits, 3, 'one accepted sweep hits each instance at most once');
  assert.equal(match.result, null, 'the first three kills cannot settle a whole protocol');
});

test('native projectiles carry an instance owner and contact the first physical target only', () => {
  const match = create({ playerId: 'spitter' }), player = match.fighters[0]; player.x = 0;
  const enemies = match.fighters.slice(1);
  for (const [index, enemy] of enemies.entries()) {
    enemy.facing = -1;
    enemy.x = bounds(player).right + (enemy.x - bounds(enemy).left) + 150 + index * 250;
  }
  ticks(match, 50, { special: true }, {});
  assert.equal(match.projectiles.length, 1); assert.equal(match.projectiles[0].ownerInstanceV180, 'player');
  ticks(match, 70, { special: true }, {});
  assert.equal(player.stats.specials, 1); assert.equal(player.stats.hits, 1);
  assert.equal(match.hordeV180.totalKills, 1);
  // The Runner is below the native shot line: it is correctly skipped. The
  // standing Warrior receives the first body contact; the Prowler stays intact.
  assert.equal(enemies[0].hp, 15); assert.equal(enemies[1].hp, 0); assert.equal(enemies[2].hp, 15);
  assert.ok(match.projectiles.every(projectile => projectile.ownerInstanceV180 === 'player'));
});

test('the native CPU damages an idle player; losing emits one final result and never advances another round', () => {
  const match = create();
  ticks(match, 120 * 80);
  assert.equal(match.result?.winner, 'opponent'); assert.equal(match.result.reason, 'horde-ko');
  assert.equal(match.fighters[0].hp, 0); assert.equal(match.result.wins.opponent, 1);
  assert.ok(match.result.opponentStats.damage > 0);
  assert.equal(match.events.filter(event => event.type === 'match-end').length, 1);
  const final = getXenoTrialsSnapshotV96(match);
  ticks(match, 120); assert.deepEqual(getXenoTrialsSnapshotV96(match), final);
  assert.equal(nextXenoTrialsRoundV96(match), false);
});

test('legal player controls clear every wave against native CPUs with persistent health and one terminal victory', () => {
  const match = create(); let maxAlive = 0, previousWave = 1, healthBeforeWave;
  for (let tick = 0; tick < 120 * 240 && !match.result; tick++) {
    const player = match.fighters[0];
    const target = match.fighters.slice(1).sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    if (match.hordeV180.phase === 'intermission') healthBeforeWave = player.hp;
    if (match.hordeV180.wave !== previousWave) {
      assert.ok(player.hp <= healthBeforeWave, 'a new wave must not heal the player');
      previousWave = match.hordeV180.wave;
    }
    maxAlive = Math.max(maxAlive, match.fighters.length - 1);
    stepXenoTrialsMatchV96(match, 1 / 120, { left: target?.x < player.x, right: target?.x > player.x,
      heavy: tick % 180 === 0, light: tick % 180 === 90 });
    assert.ok(match.fighters.length <= limits.maxConcurrent + 1);
  }
  assert.ok(maxAlive >= 3);
  assert.equal(match.result?.winner, 'player'); assert.equal(match.result.reason, 'horde-cleared');
  assert.equal(match.hordeV180.totalKills, match.hordeV180.totalEnemies);
  assert.equal(match.hordeV180.wavesCleared, match.hordeV180.waveCount);
  assert.equal(match.result.rounds, 1); assert.equal(match.result.wins.player, 1);
  assert.equal(match.events.filter(event => event.type === 'match-end').length, 1);
});

test('a higher protocol reaches eight simultaneously living enemies through real kills and reinforcements', () => {
  const match = create({ playerId: 'queen', activityV119: { branch: 'horde', id: 'xth180-incoming-5' } });
  for (let tick = 0; tick < 120 * 60 && !match.result && match.hordeV180.alive < 8; tick++) {
    const player = match.fighters[0];
    const target = match.fighters.slice(1).sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    stepXenoTrialsMatchV96(match, 1 / 120, { left: target?.x < player.x, right: target?.x > player.x,
      heavy: tick % 180 === 0, light: tick % 180 === 90 });
  }
  assert.equal(match.hordeV180.alive, 8); assert.equal(match.fighters.length, 9);
  assert.ok(match.hordeV180.totalKills >= protocols.find(protocol => protocol.id === 'xth180-incoming-5').waves[0].total);
  assert.ok(match.fighters.slice(1).every(enemy => enemy.hp > 0 && enemy.maxHpV180 <= 35));
});

test('an elapsed horde deadline is a defeat while enemies remain, never a health-ratio duel victory', () => {
  const match = create(); match.timeRemaining = 1 / 120; // Deadline boundary fixture.
  ticks(match, 1, {}, {});
  assert.equal(match.result.winner, 'opponent'); assert.equal(match.result.reason, 'horde-time');
  assert.equal(match.hordeV180.totalKills, 0); assert.equal(match.result.hordeV180.wavesCleared, 0);
  assert.equal(match.fighters[0].hp, 220);
});

test('pause freezes the whole crowd and a validated JSON snapshot resumes the same seeded simulation', () => {
  const match = create(); ticks(match, 120, { right: true }); setXenoTrialsPausedV96(match, true);
  const before = getXenoTrialsSnapshotV96(match); ticks(match, 240, { heavy: true });
  assert.deepEqual(getXenoTrialsSnapshotV96(match), before);
  const resumed = restoreXenoTrialsHordeMatchV180(JSON.parse(JSON.stringify(before)));
  assert.ok(resumed); assert.equal(resumed.paused, true);
  setXenoTrialsPausedV96(match, false); setXenoTrialsPausedV96(resumed, false);
  ticks(match, 300); ticks(resumed, 300);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  for (const corrupt of [
    { ...before, fighters: [...before.fighters, ...before.fighters, ...before.fighters] },
    { ...before, hordeV180: { ...before.hordeV180, totalKills: 999 } },
    { ...before, config: { ...before.config, stageId: 'containment-deck' } }
  ]) assert.equal(restoreXenoTrialsHordeMatchV180(corrupt), null);
});

test('fixed-step crowd state is independent of 30, 60 or 120 Hz rendering and projectiles stay bounded', () => {
  const snapshots = [30, 60, 120].map(rate => {
    const match = create({ activityV119: { branch: 'horde', id: 'xth180-blackout-5' } });
    for (let frame = 0; frame < rate * 8; frame++) stepXenoTrialsMatchV96(match, 1 / rate, { guard: true });
    assert.ok(match.hordeV180.alive >= 3); assert.ok(match.hordeV180.alive <= 8);
    assert.ok(match.projectiles.length <= limits.maxProjectiles);
    return getXenoTrialsSnapshotV96(match);
  });
  assert.deepEqual(snapshots[0], snapshots[1]); assert.deepEqual(snapshots[1], snapshots[2]);
});
