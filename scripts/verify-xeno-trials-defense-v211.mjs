import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_STEP_V96 as dt, createXenoTrialsMatchV96, getXenoTrialsSnapshotV96,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207 as hurt } from '../src/xeno-trials-moveset-v207.js';
import { getXenoTrialsAirHitV211, getXenoTrialsGroundRecoveryV211, XENO_TRIALS_GET_UP_V211 } from '../src/xeno-trials-defense-v211.js';
import { getXenoTrialsSpriteAtlasV188, sampleXenoTrialsSpriteAtlasV188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { XENO_TRIALS_HORDE_LIMITS_V180 } from '../src/xeno-trials-horde-v180.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const step = (match, player = {}, opponent = {}) => stepXenoTrialsMatchV96(match, dt, player, opponent);
function advance(match, count, player = {}, opponent = {}) {
  for (let tick = 0; tick < count; tick++) step(match, player, opponent);
}
function fight(playerId, opponentId = 'runner', config = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, introSeconds: 0, holdRoundTransition: true, ...config });
  const [player, target] = match.fighters;
  target.x += bounds(player).right + 12 - bounds(target).left;
  for (const other of match.fighters.slice(2)) other.x = -650;
  return match;
}
function descent(match, opponent = {}) {
  const [player] = match.fighters;
  step(match, { jump: true }, opponent);
  assert.ok(player.y > 0 && player.vy > 0);
  for (let tick = 0; tick < 120 && player.vy >= 0; tick++) step(match, {}, opponent);
  assert.ok(player.y > 0 && player.vy < 0);
  return player;
}
function breakGuard(match) {
  const [player] = match.fighters;
  player.stamina = 12; // Isolate the ordinary insufficient-endurance break.
  step(match, { guard: true }, { heavy: true });
  for (let tick = 0; tick < 65 && !match.events.some(event => event.type === 'guard-break'); tick++) step(match, { guard: true });
  assert.equal(match.events.at(-1).type, 'guard-break');
  return player;
}
function ticket(playerId, opponentId, activityV119) {
  const progress = createXenoTrialsProgressV96();
  if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
  const result = beginXenoTrialsV96(progress, { playerId, opponentId, activityV119 });
  assert.ok(result.applied);
  return result.config;
}

test('the two admitted falling profiles strike in a real contact band and still have one hit per target', () => {
  for (const id of ['runner', 'prowler']) {
    const match = fight(id, 'queen'), player = descent(match), target = match.fighters[1];
    const definition = getXenoTrialsFighterV96(id), spec = getXenoTrialsAirHitV211(definition);
    assert.equal(getXenoTrialsAirHitV211({ ...definition, profileId: 'unreviewed' }), null);
    const stamina = player.stamina;
    step(match, { light: true });
    assert.equal(player.attack?.kind, 'air-hit');
    assert.equal(player.stamina, stamina - spec.cost);
    assert.ok(player.attack.takeoffV211.height > 0 && player.attack.takeoffV211.velocity < 0);
    assert.equal(player.stats.hits, 0);
    advance(match, 20, { light: true });
    assert.equal(player.stats.hits, 1);
    assert.ok(target.hp < getXenoTrialsFighterV96('queen').hp);
    advance(match, 80, { light: true });
    assert.equal(player.stats.hits, 1);
    assert.equal(match.events.filter(event => event.kind === 'air-hit').length, 1);
  }
});

test('air attacks leave floor and rising controls alone, and contact cannot happen after landing', () => {
  const ordinary = fight('runner');
  step(ordinary, { light: true });
  assert.equal(ordinary.fighters[0].attack.kind, 'light');
  const rising = fight('runner');
  step(rising, { jump: true });
  step(rising, { light: true });
  assert.equal(rising.fighters[0].attack.kind, 'light');
  const unsigned = fight('spitter', 'queen');
  descent(unsigned);
  step(unsigned, { light: true });
  assert.equal(unsigned.fighters[0].attack.kind, 'light');
  const late = fight('prowler', 'queen'), player = descent(late);
  while (player.y > 30) step(late);
  step(late, { light: true });
  assert.equal(player.attack?.kind, 'air-hit');
  advance(late, 60);
  assert.equal(player.y, 0);
  assert.equal(player.stats.hits, 0);
});

test('living break uses grounded support and a fresh guard shortens recovery without restoring health', () => {
  for (const id of ['warrior', 'runner', 'prowler', 'spitter']) {
    const match = fight(id), player = breakGuard(match);
    const receipt = match.events.at(-1), hp = player.hp, height = bounds(player).height;
    assert.equal(player.groundRecoveryV211.breakId, receipt.id);
    assert.equal(getXenoTrialsGroundRecoveryV211(match, player).state, 'fall-v211');
    advance(match, XENO_TRIALS_GET_UP_V211.opensAt, { guard: true });
    assert.equal(player.groundRecoveryV211.assistedAt, 0, 'the old held guard is no input');
    const cue = getXenoTrialsGroundRecoveryV211(match, player);
    const atlas = getXenoTrialsSpriteAtlasV188(player, getXenoTrialsArtV96(id, player.variant));
    const grounded = sampleXenoTrialsSpriteAtlasV188(atlas, player, { cue }).frame;
    assert.equal(grounded.id, 'ko-ground');
    const measured = (grounded.alphaBounds[3] - grounded.alphaBounds[1]) / atlas.referenceHeight;
    assert.ok(Math.abs(hurt(player).height - height * measured) < 1e-8);
    assert.ok(player.hp > 0 && hurt(player).height < height && player.y === 0);
    const idle = getXenoTrialsSnapshotV96(match);
    step(match);
    step(match, { guard: true });
    assert.equal(match.events.at(-1).type, 'get-up-v211');
    assert.equal(match.events.at(-1).breakIdV211, receipt.id);
    assert.equal(player.stun, XENO_TRIALS_GET_UP_V211.assistedTicks * dt);
    advance(match, 9, { guard: true });
    advance(idle, 11, { guard: true });
    assert.equal(player.groundRecoveryV211, undefined);
    assert.ok(idle.fighters[0].groundRecoveryV211);
    assert.equal(player.hp, hp);
    assert.equal(hurt(player).height, height);
  }
  const absent = fight('arachnoid'), unsup = breakGuard(absent);
  assert.equal(unsup.groundRecoveryV211, undefined);
  assert.equal(unsup.stun, .72);
});

test('the airborne proof and the horde recovery survive reload at identical ticks', () => {
  const duelConfig = ticket('runner', 'queen');
  const duel = fight('runner', 'queen', duelConfig);
  duel.ai.decisionIn = .98;
  const jumper = descent(duel, null);
  step(duel, { light: true }, null);
  assert.equal(jumper.attack?.kind, 'air-hit');
  const flight = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(duel), duelConfig);
  assert.ok(flight);
  const badFlight = structuredClone(flight.snapshot);
  badFlight.fighters[0].attack.takeoffV211.height += 8;
  assert.equal(createXenoTrialsDuelCheckpointV197(badFlight, duelConfig), null);
  const train = structuredClone(flight.snapshot);
  setXenoTrialsPausedV96(train, false);
  for (const state of [duel, train]) advance(state, 22, {}, null);
  assert.deepEqual(getXenoTrialsSnapshotV96(train), getXenoTrialsSnapshotV96(duel));

  const hordeConfig = ticket('warrior', 'runner', { branch: 'horde', id: 'xth180-incoming-1' });
  const horde = fight('warrior', 'runner', hordeConfig);
  advance(horde, XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks);
  breakGuard(horde);
  advance(horde, XENO_TRIALS_GET_UP_V211.opensAt);
  const saved = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(horde), hordeConfig);
  assert.ok(saved);
  const restored = restoreXenoTrialsHordeMatchV180(saved.snapshot);
  assert.ok(restored);
  setXenoTrialsPausedV96(restored, false);
  for (const state of [horde, restored]) advance(state, 2, { guard: true });
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(horde));
  const assisted = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(horde), hordeConfig);
  assert.ok(assisted);
  const falseRise = structuredClone(assisted.snapshot);
  falseRise.events = falseRise.events.filter(event => event.type !== 'get-up-v211');
  assert.equal(createXenoTrialsHordeCheckpointV186(falseRise, hordeConfig), null);
});
