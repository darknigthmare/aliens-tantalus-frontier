import test from 'node:test';
import assert from 'node:assert/strict';
import { createXenoTrialsProgressV96, beginXenoTrialsV96, checkpointXenoTrialsV186, clearXenoTrialsCheckpointV186,
  normalizeXenoTrialsProgressV96, settleXenoTrialsV96, abandonXenoTrialsV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsHordeCheckpointV186, XENO_TRIALS_CHECKPOINT_LIMITS_V186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_HORDE_PROTOCOLS_V186 } from '../src/xeno-trials-horde-v180.js';
import { getXenoTrialsSuperReadinessV148 } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';

const clone = value => JSON.parse(JSON.stringify(value));
function fixture(playerId = 'warrior', id = 'xth180-incoming-1') {
  const progress = createXenoTrialsProgressV96();
  // Explicit ownership fixture for admitted non-starter specimens. No result,
  // health, damage, wave or clock is injected by this setup.
  if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
  const ticket = beginXenoTrialsV96(progress, { playerId, activityV119: { branch: 'horde', id } });
  assert.equal(ticket.applied, true);
  return { ticket, match: createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true }) };
}
function controls(match) {
  const player = match.fighters[0], target = match.fighters.slice(1).sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
  return { left: target?.x < player.x, right: target?.x > player.x,
    heavy: match.tick % 180 === 0, light: match.tick % 180 === 90 };
}
const advance = (match, count, input = controls, cpu = null) => {
  for (let index = 0; index < count && !match.result; index++) stepXenoTrialsMatchV96(match, 1 / 120, typeof input === 'function' ? input(match) : input, cpu);
};

test('every live horde protocol starts with an admissible ticket-bound checkpoint', () => {
  for (const protocol of XENO_TRIALS_HORDE_PROTOCOLS_V186) {
    const { ticket, match } = fixture('warrior', protocol.id);
    const transaction = checkpointXenoTrialsV186(ticket.state, match);
    assert.equal(transaction.applied, true, protocol.id);
    assert.equal(transaction.state.pending.checkpointV186.protocolId, protocol.id);
    assert.equal(transaction.state.credits, ticket.state.credits);
    assert.equal(transaction.state.xp, ticket.state.xp);
    assert.deepEqual(transaction.state.ledger, []);
    assert.equal(transaction.state.serial, ticket.state.serial);
  }
});

test('pause, JSON save/reload and resume preserve health, actors, resources, RNG and the subsequent native simulation', () => {
  const { ticket, match } = fixture(); advance(match, 600); setXenoTrialsPausedV96(match, true);
  const before = getXenoTrialsSnapshotV96(match);
  assert.ok(before.fighters[0].hp < 220 || before.hordeV180.totalKills > 0);
  const saved = checkpointXenoTrialsV186(ticket.state, before);
  assert.equal(saved.applied, true);
  const reloaded = normalizeXenoTrialsProgressV96(clone(saved.state));
  const checkpoint = reloaded.pending.checkpointV186;
  assert.ok(checkpoint);
  const resumed = restoreXenoTrialsHordeMatchV180(checkpoint.snapshot);
  assert.ok(resumed); assert.equal(resumed.paused, true);
  assert.deepEqual(resumed.fighters, before.fighters); assert.equal(resumed.rng, before.rng);
  assert.deepEqual(resumed.hordeV180, before.hordeV180); assert.equal(resumed.timeRemaining, before.timeRemaining);
  setXenoTrialsPausedV96(match, false); setXenoTrialsPausedV96(resumed, false);
  advance(match, 400); advance(resumed, 400);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('a resumed native victory consumes the existing ticket once and never pays a replay', () => {
  const { ticket, match } = fixture(); advance(match, 600);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const reloaded = normalizeXenoTrialsProgressV96(clone(saved.state));
  const resumed = restoreXenoTrialsHordeMatchV180(reloaded.pending.checkpointV186.snapshot);
  setXenoTrialsPausedV96(resumed, false); advance(resumed, 120 * 240);
  assert.equal(resumed.result?.winner, 'player');
  const settled = settleXenoTrialsV96(reloaded, resumed.result);
  assert.equal(settled.applied, true); assert.equal(settled.state.pending, null);
  assert.equal(settled.state.ledger.length, 1);
  assert.equal(settled.state.modesV119.hordeCleared.filter(id => id === 'xth180-incoming-1').length, 1);
  const replay = settleXenoTrialsV96(settled.state, resumed.result);
  assert.equal(replay.applied, false); assert.equal(replay.state.credits, settled.state.credits);
  assert.equal(checkpointXenoTrialsV186(settled.state, match).applied, false);
});

test('tampered identity, outcomes, actor health, director counters, AI and unbounded payloads cannot become checkpoints', () => {
  const { ticket, match } = fixture(); advance(match, 200);
  const base = getXenoTrialsSnapshotV96(match);
  const mutations = [
    value => { value.config.seed++; }, value => { value.config.matchId = 'xt96-99'; },
    value => { value.config.playerId = 'runner'; }, value => { value.config.stageId = 'containment-deck'; },
    value => { value.config.activityV119.id = 'xth180-incoming-2'; }, value => { value.config.playerVariant = 'purple'; },
    value => { value.result = { completed: true, winner: 'player' }; }, value => { value.wins.player = 1; },
    value => { value.phase = 'match-over'; }, value => { value.round = 2; }, value => { value.roundWinner = 'player'; },
    value => { value.grappleV153 = { target: 'opponent' }; }, value => { value.tick -= 10; },
    value => { value.rng = 0; }, value => { value.fighters[0].hp = 221; },
    value => { value.fighters[1].hp = 500; }, value => { value.fighters[1].damageScaleV180 = 100; },
    value => { value.fighters[1].id = 'queen'; }, value => { value.fighters[1].instanceIdV180 = value.fighters[2].instanceIdV180; },
    value => { value.fighters[1].aiV180.decisionIn = Infinity; }, value => { value.fighters[1].aiV180.state = 'INSTANT_KILL'; },
    value => { value.fighters[0].stats.damage = -1; }, value => { value.fighters[0].stamina = 999; },
    value => { value.hordeV180.serial++; }, value => { value.hordeV180.totalKills++; },
    value => { value.hordeV180.wavesCleared++; }, value => { value.hordeV180.phase = 'complete'; },
    value => { value.events.push({ id: value.serial, tick: value.tick, type: 'match-end' }); },
    value => { value.hordeV180.note = 'x'.repeat(XENO_TRIALS_CHECKPOINT_LIMITS_V186.maxCharacters); }
  ];
  for (const mutate of mutations) {
    const candidate = clone(base); mutate(candidate);
    assert.equal(checkpointXenoTrialsV186(ticket.state, candidate).applied, false, mutate.toString());
  }
  const foreign = { ...ticket.config, seed: ticket.config.seed + 1 };
  assert.equal(createXenoTrialsHordeCheckpointV186(base, foreign), null);
});

test('checkpoints cannot roll back time, heal, resurrect an old instance or change position on the same tick', () => {
  const { ticket, match } = fixture(); advance(match, 200); const early = getXenoTrialsSnapshotV96(match);
  advance(match, 200); const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  assert.equal(checkpointXenoTrialsV186(saved.state, early).reason, 'stale-horde-checkpoint');
  const moved = getXenoTrialsSnapshotV96(match); moved.fighters[0].x += 1;
  assert.equal(checkpointXenoTrialsV186(saved.state, moved).reason, 'stale-horde-checkpoint');
  setXenoTrialsPausedV96(match, true);
  assert.equal(checkpointXenoTrialsV186(saved.state, match).applied, true, 'pausing on the same tick changes no gameplay');
});

test('intermissions and temporarily empty waves keep their real counters instead of restarting or healing', () => {
  const { ticket, match } = fixture();
  while (!match.result && match.hordeV180.phase !== 'intermission') advance(match, 1);
  assert.equal(match.hordeV180.phase, 'intermission'); assert.equal(match.fighters.length, 1);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const resumed = restoreXenoTrialsHordeMatchV180(clone(saved.state.pending.checkpointV186.snapshot));
  const hp = resumed.fighters[0].hp; setXenoTrialsPausedV96(resumed, false); advance(resumed, 121, {});
  assert.equal(resumed.hordeV180.wave, 2); assert.equal(resumed.fighters[0].hp, hp);
  const other = fixture(); other.match.fighters[0].x = 0;
  // A spatial sweep fixture defeats the initial three simultaneously, while
  // two reinforcements are still pending on their real native spawn cadence.
  for (const [index, enemy] of other.match.fighters.slice(1).entries()) {
    enemy.facing = -1; enemy.x = bounds(other.match.fighters[0]).right + (enemy.x - bounds(enemy).left) + index * 8;
  }
  advance(other.match, 65, { heavy: true }, {});
  assert.equal(other.match.hordeV180.alive, 0); assert.equal(other.match.hordeV180.remaining, 2);
  assert.equal(checkpointXenoTrialsV186(other.ticket.state, other.match).applied, true);
});

test('a real in-flight projectile survives reload with canonical damage; forged projectile power or spec is refused', () => {
  const { ticket, match } = fixture('spitter'); match.fighters[0].x = -600;
  match.fighters.slice(1).forEach((enemy, index) => { enemy.x = 1500 + index * 80; }); // Range fixture only.
  advance(match, 120, { special: true }, {});
  assert.equal(match.fighters[0].attack, null); assert.equal(match.projectiles.length, 1);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const resumed = restoreXenoTrialsHordeMatchV180(clone(saved.state.pending.checkpointV186.snapshot));
  assert.deepEqual(resumed.projectiles, match.projectiles);
  for (const key of ['power', 'damage']) {
    const forged = getXenoTrialsSnapshotV96(match);
    if (key === 'power') forged.projectiles[0].power = 20;
    else forged.projectiles[0].spec.damage = 999;
    assert.equal(checkpointXenoTrialsV186(ticket.state, forged).applied, false);
  }
});

test('invalid persisted checkpoints are discarded while their ticket remains available; restart and abandon grant nothing', () => {
  const { ticket, match } = fixture(); advance(match, 200);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const corrupt = clone(saved.state); corrupt.pending.checkpointV186.seed++;
  const normalized = normalizeXenoTrialsProgressV96(corrupt);
  assert.ok(normalized.pending); assert.equal(normalized.pending.checkpointV186, undefined);
  const restart = clearXenoTrialsCheckpointV186(saved.state);
  assert.equal(restart.applied, true); assert.equal(restart.state.pending.checkpointV186, undefined);
  assert.deepEqual(restart.state.pending.config, ticket.config);
  assert.equal(restart.state.credits, ticket.state.credits); assert.equal(restart.state.xp, ticket.state.xp);
  const abandon = abandonXenoTrialsV96(saved.state);
  assert.equal(abandon.applied, true); assert.equal(abandon.state.pending, null);
  assert.equal(abandon.state.credits, ticket.state.credits); assert.equal(abandon.state.ledger[0].credits, 0);
});

test('real signature projectiles, falling acid and corrosive pools retain their native cadence after reload', () => {
  const { ticket, match } = fixture('drive-v123-fte-pathogen-queen-right-v13', 'xth180-incoming-5');
  while (!match.result && !match.acidPoolsV152?.length) advance(match, 1, { special: match.tick % 360 === 0 }, {});
  assert.ok(match.acidPoolsV152?.length); assert.ok(match.acidDropsV152?.length);
  setXenoTrialsPausedV96(match, true);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const resumed = restoreXenoTrialsHordeMatchV180(clone(saved.state.pending.checkpointV186.snapshot));
  assert.deepEqual(resumed.acidPoolsV152, match.acidPoolsV152); assert.deepEqual(resumed.acidDropsV152, match.acidDropsV152);
  setXenoTrialsPausedV96(match, false); setXenoTrialsPausedV96(resumed, false);
  advance(match, 120, {}, {}); advance(resumed, 120, {}, {});
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  const forged = clone(saved.state.pending.checkpointV186.snapshot); forged.acidPoolsV152[0].right += 100;
  assert.equal(checkpointXenoTrialsV186(ticket.state, forged).applied, false);
  const meter = clone(saved.state.pending.checkpointV186.snapshot); meter.fighters[0].superMeterV148 = 100;
  assert.equal(checkpointXenoTrialsV186(ticket.state, meter).applied, false, 'unearned meter cannot enter through restoration');
});

test('a boss with live escorts resumes its true slots and a genuine win needs the canonical defeated-boss receipt', () => {
  const { ticket, match } = fixture('queen', 'xth186-incoming-1');
  while (!match.result && !match.fighters.some(fighter => fighter.enemyRankV186 === 'boss')) advance(match, 1);
  const boss = match.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
  assert.ok(boss && boss.hp === 140); assert.ok(match.fighters.filter(fighter => fighter.enemyRankV186 === 'troop').length >= 2);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  const reloaded = normalizeXenoTrialsProgressV96(clone(saved.state));
  const resumed = restoreXenoTrialsHordeMatchV180(reloaded.pending.checkpointV186.snapshot);
  assert.deepEqual(resumed.fighters, match.fighters);
  for (const field of ['spawnSlotV186', 'enemyRankV186', 'bossIdV186']) {
    const corrupt = clone(saved.state.pending.checkpointV186.snapshot);
    const target = corrupt.fighters.find(fighter => fighter.enemyRankV186 === 'boss');
    target[field] = field === 'spawnSlotV186' ? 1 : 'runner';
    assert.equal(checkpointXenoTrialsV186(ticket.state, corrupt).applied, false);
  }
  setXenoTrialsPausedV96(resumed, false); advance(resumed, 120 * 240);
  assert.equal(resumed.result?.winner, 'player'); assert.equal(resumed.result.hordeV180.bossFinaleV186.defeated, true);
  for (const mutate of [
    receipt => { delete receipt.bossFinaleV186; }, receipt => { receipt.bossFinaleV186.fighterId = 'runner'; },
    receipt => { receipt.bossFinaleV186.maxHp = 35; }, receipt => { receipt.bossFinaleV186.wave = 1; },
    receipt => { receipt.bossFinaleV186.hp = 1; }, receipt => { receipt.bossFinaleV186.phase = 'active'; },
    receipt => { receipt.bossFinaleV186.defeated = false; }, receipt => { receipt.bossFinaleV186.instanceId = 'horde-1'; }
  ]) {
    const corrupt = clone(resumed.result); mutate(corrupt.hordeV180);
    assert.equal(settleXenoTrialsV96(reloaded, corrupt).applied, false, mutate.toString());
  }
  const settled = settleXenoTrialsV96(reloaded, resumed.result); assert.equal(settled.applied, true);
  assert.equal(settleXenoTrialsV96(settled.state, resumed.result).applied, false);
});

test('settlement cannot consume an older matching horde result behind its saved checkpoint', () => {
  const { ticket, match } = fixture(); advance(match, 1000);
  const saved = checkpointXenoTrialsV186(ticket.state, match); assert.equal(saved.applied, true);
  advance(match, 120 * 240); assert.equal(match.result?.winner, 'player');
  const stale = clone(match.result); stale.durationTicks = saved.state.pending.checkpointV186.tick - 1;
  assert.equal(settleXenoTrialsV96(saved.state, stale).applied, false);
  const stats = clone(match.result); stats.playerStats.damage = 0;
  assert.equal(settleXenoTrialsV96(saved.state, stats).applied, false);
  assert.equal(settleXenoTrialsV96(saved.state, match.result).applied, true);
});

test('an earned native super and its emitted signature projectiles resume without restoring spent meter', () => {
  const { ticket, match } = fixture('drive-v123-fte-pathogen-brute-profile-v13', 'xth180-incoming-5');
  // Neutral direct CPU controls isolate the earned-meter boundary; player
  // attacks, movement, resource use and all contacts remain native simulation.
  for (let tick = 0; tick < 120 * 60 && !match.result && match.fighters[0].attack?.kind !== 'super'; tick++) {
    const player = match.fighters[0], input = controls(match);
    input.heavy = player.superMeterV148 < 100 && match.tick % 180 === 0; input.light = false;
    input.super = getXenoTrialsSuperReadinessV148(match, player, getXenoTrialsFighterV96(player.id)).ready;
    advance(match, 1, input, {});
  }
  assert.equal(match.fighters[0].attack?.kind, 'super'); assert.equal(match.fighters[0].stats.supersV148, 1);
  assert.equal(match.fighters[0].superMeterV148, 0);
  const accepted = checkpointXenoTrialsV186(ticket.state, match); assert.equal(accepted.applied, true);
  // Move the passive targets away only to observe a projectile in flight:
  // contact at the muzzle would otherwise consume the whole native wave.
  for (const enemy of match.fighters.slice(1)) enemy.x = match.fighters[0].x < 500 ? 1600 : -600;
  advance(match, 80, {}, {}); assert.ok(match.projectiles.length > 0);
  const emitted = checkpointXenoTrialsV186(accepted.state, match); assert.equal(emitted.applied, true);
  const resumed = restoreXenoTrialsHordeMatchV180(clone(emitted.state.pending.checkpointV186.snapshot));
  assert.equal(resumed.fighters[0].superMeterV148, match.fighters[0].superMeterV148);
  assert.deepEqual(resumed.fighters[0].attack, match.fighters[0].attack);
  assert.deepEqual(resumed.projectiles, match.projectiles);
});
