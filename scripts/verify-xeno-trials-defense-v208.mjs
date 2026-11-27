import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_STEP_V96 as dt, createXenoTrialsMatchV96, getXenoTrialsSnapshotV96,
  nextXenoTrialsRoundV96, releaseXenoTrialsControlsV150, restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96,
  stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_PARRY_V208 as parry, getXenoTrialsParryOpeningV208, getXenoTrialsParryReceiptV208,
  getXenoTrialsParryViewV208 } from '../src/xeno-trials-defense-v208.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsDuelCheckpointV197, isXenoTrialsDuelCheckpointForwardV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186, isXenoTrialsCheckpointForwardV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { XENO_TRIALS_HORDE_LIMITS_V180 } from '../src/xeno-trials-horde-v180.js';

const duel = (config = {}) => createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0, ...config });
const step = (match, player = {}, opponent = {}) => stepXenoTrialsMatchV96(match, dt, player, opponent);
function advance(match, count, player = {}, opponent = {}) {
  for (let i = 0; i < count; i++) step(match, player, opponent);
}
function placeForContact(match) {
  const [player, attacker] = match.fighters;
  attacker.x += body(player).right + 12 - body(attacker).left;
  return [player, attacker];
}
function loadContact(match, controls = { heavy: true }) {
  step(match, {}, controls);
  const attacker = match.fighters[1], kind = attacker.attack?.kind;
  assert.ok(kind, 'fixture starts an actual attack');
  const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(attacker.id), kind, XENO_TRIALS_ATTACKS_V96[kind]);
  while (attacker.attack.age + dt < spec.startup) step(match);
  return attacker.attack;
}

test('a timed frontal contact has one accepted defense, costs endurance and creates no damage or meter', () => {
  const match = duel(), [player, attacker] = placeForContact(match);
  const attack = loadContact(match), { hp, stamina, x, superMeterV148: meter } = player;
  step(match, { parry: true, right: true, light: true });
  const receipt = getXenoTrialsParryReceiptV208(match, player);
  assert.equal(receipt.attackIdV208, attack.id);
  assert.equal(getXenoTrialsParryOpeningV208(match, player), attacker);
  assert.equal(player.hp, hp);
  assert.equal(player.stamina, stamina - parry.cost);
  assert.equal(player.stats.blocks, 1);
  assert.equal(attacker.stats.hits, 0);
  assert.equal(attacker.stats.damage, 0);
  assert.equal(player.superMeterV148, meter);
  assert.equal(player.x, x);
  assert.equal(player.attack, null);
  assert.equal(getXenoTrialsParryViewV208(match, player).active, false);
  advance(match, parry.openingTicks, { parry: true });
  assert.equal(getXenoTrialsParryOpeningV208(match, player), null);
  assert.equal(match.events.filter(event => event.type === 'parry-v208').length, 1);
});

test('low attacks need a matching low stance and ordinary guard keeps chip damage', () => {
  for (const [playerControls, result] of [
    [{ parry: true }, 'hit'],
    [{ parry: true, crouch: true }, 'parry-v208'],
    [{ guard: true, crouch: true }, 'block'],
  ]) {
    const match = duel(), [player] = placeForContact(match), hp = player.hp;
    loadContact(match, { crouch: true, light: true });
    step(match, playerControls);
    assert.equal(match.events.at(-1).type, result);
    assert.equal(player.hp === hp, result === 'parry-v208');
  }
});

test('a parry cannot cover a flank or erase a projectile', () => {
  const match = duel(), [player] = placeForContact(match);
  loadContact(match);
  // The captured stance is already facing away at a cross-up. Regular
  // guarding also freezes the facing, so no turn is supplied on this tick.
  player.facing = -1;
  player.guard = true;
  step(match, { guard: true, parry: true });
  assert.equal(match.events.at(-1).type, 'hit');
  assert.equal(getXenoTrialsParryOpeningV208(match, player), null);
  assert.equal(player.parryV208.started, 0);

  const ranged = duel(), [target] = placeForContact(ranged), hp = target.hp;
  ranged.projectiles.push({ id: 1, owner: 'opponent', x: body(target).right, y: body(target).height * .5,
    direction: -1, life: 1, spec: { damage: 20, push: 0, stun: .15 }, power: 1, style: 'pulse' });
  step(ranged, { parry: true });
  assert.ok(target.hp < hp);
  assert.equal(getXenoTrialsParryOpeningV208(ranged, target), null);
});

test('a missed window is finite, cannot be spammed, and freezes in simulation pause', () => {
  const match = duel(), [player] = match.fighters, max = player.stamina;
  step(match, { parry: true });
  assert.equal(player.stamina, max - parry.cost);
  const started = match.tick, x = player.x;
  setXenoTrialsPausedV96(match, true);
  advance(match, 60, { parry: true, right: true });
  assert.equal(match.tick, started);
  assert.equal(getXenoTrialsParryViewV208(match, player).active, true);
  setXenoTrialsPausedV96(match, false);
  advance(match, parry.activeTicks - 1, { parry: true, right: true });
  assert.equal(player.x, x);
  assert.equal(getXenoTrialsParryViewV208(match, player).active, true);
  step(match, { parry: true, right: true });
  assert.ok(player.x > x);
  assert.equal(getXenoTrialsParryViewV208(match, player).active, false);
  step(match);
  step(match, { parry: true });
  assert.equal(getXenoTrialsParryViewV208(match, player).active, false);
  advance(match, parry.cooldownTicks * 2, { parry: true });
  assert.equal(player.stamina, max);
  assert.equal(getXenoTrialsParryViewV208(match, player).active, false);
  releaseXenoTrialsControlsV150(match, 'player', {});
  step(match, { parry: true });
  assert.equal(getXenoTrialsParryViewV208(match, player).active, true);
});

test('the next round drops old openings and requires a release after the countdown', () => {
  const match = duel({ introSeconds: .05, holdRoundTransition: true });
  advance(match, 12);
  const [player] = placeForContact(match);
  loadContact(match);
  step(match, { parry: true });
  assert.ok(getXenoTrialsParryReceiptV208(match, player));
  match.timeRemaining = dt;
  step(match, { parry: true });
  assert.equal(match.phase, 'round-over');
  assert.equal(player.parryV208.openingId, 0);
  assert.equal(player.parryV208.readyTick, 0);
  assert.equal(nextXenoTrialsRoundV96(match), true);
  const [next] = match.fighters;
  advance(match, 15, { parry: true });
  assert.equal(next.parryV208.started, 0);
  assert.equal(getXenoTrialsParryReceiptV208(match, next), null);
  step(match);
  step(match, { parry: true });
  assert.equal(getXenoTrialsParryViewV208(match, next).active, true);
});

test('checkpoints preserve a parry stance and reject fabricated phase timers', () => {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner' });
  assert.ok(ticket.applied);
  const match = duel({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
  const make = state => createXenoTrialsDuelCheckpointV197(state, ticket.config);
  const legacy = make(match);
  assert.ok(legacy);
  assert.equal(legacy.snapshot.fighters[0].parryV208, undefined);
  step(match, { parry: true }, null);
  setXenoTrialsPausedV96(match, true);
  const checkpoint = make(getXenoTrialsSnapshotV96(match));
  assert.ok(checkpoint);
  const restored = structuredClone(checkpoint.snapshot);
  releaseXenoTrialsControlsV150(restored, 'player', {});
  assert.ok(isXenoTrialsDuelCheckpointForwardV197(checkpoint, make(restored)));
  for (const state of [match, restored]) {
    setXenoTrialsPausedV96(state, false);
    advance(state, parry.activeTicks + 1, {}, null);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  const forged = structuredClone(checkpoint.snapshot);
  forged.fighters[0].parryV208.readyTick += 1;
  assert.equal(make(forged), null);
});

test('native horde parry identifies the real contact and serializes the same opening', () => {
  const activityV119 = { branch: 'horde', id: 'xth180-incoming-1' };
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner', activityV119 });
  assert.ok(ticket.applied);
  const match = duel({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
  const [player, attacker] = placeForContact(match);
  advance(match, XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks);
  loadContact(match);
  step(match, { parry: true });
  assert.equal(getXenoTrialsParryOpeningV208(match, player), attacker);
  assert.equal(getXenoTrialsParryReceiptV208(match, player).attackerInstanceV180, attacker.instanceIdV180);
  const make = state => createXenoTrialsHordeCheckpointV186(state, ticket.config);
  const checkpoint = make(getXenoTrialsSnapshotV96(match));
  assert.ok(checkpoint);
  const restored = restoreXenoTrialsHordeMatchV180(checkpoint.snapshot);
  assert.ok(restored);
  assert.equal(getXenoTrialsParryOpeningV208(restored, restored.fighters[0]), restored.fighters[1]);
  releaseXenoTrialsControlsV150(restored, 'player', {});
  assert.ok(isXenoTrialsCheckpointForwardV186(checkpoint, make(restored)));
  const forged = structuredClone(checkpoint.snapshot);
  const receipt = forged.events.find(event => event.type === 'parry-v208');
  assert.ok(forged.fighters[2]);
  receipt.attackerInstanceV180 = forged.fighters[2].instanceIdV180;
  assert.equal(make(forged), null);
  assert.equal(restoreXenoTrialsHordeMatchV180(forged), null);
});
