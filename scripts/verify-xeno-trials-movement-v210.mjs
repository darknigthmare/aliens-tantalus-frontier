import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  restoreXenoTrialsHordeMatchV180, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_EVADE_V207 } from '../src/xeno-trials-moveset-v207.js';
import { XENO_TRIALS_LANDING_TICKS_V210, XENO_TRIALS_TURN_TICKS_V210,
  canBufferXenoTrialsLandingV210, hasXenoTrialsGroundTurnV210 } from '../src/xeno-trials-movement-v210.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const snake = 'drive-v123-neca-snake-series13-v14';
const loader = 'synth-automated-powerloader';
const step = (match, controls = {}, opponent = {}) => stepXenoTrialsMatchV96(match, dt, controls, opponent);
function advance(match, count, controls = {}, opponent = {}) {
  for (let tick = 0; tick < count; tick++) step(match, controls, opponent);
}
const fight = (playerId, config = {}) => createXenoTrialsMatchV96({ playerId, opponentId: 'runner', introSeconds: 0, seed: 210, ...config });
const landingEvents = match => match.events.filter(event => event.type === 'evade-v207' && event.sourceV210 === 'landing');

function approachLanding(match, opponent = {}) {
  const [fighter] = match.fighters, definition = getXenoTrialsFighterV96(fighter.id);
  step(match, { jump: true }, opponent);
  assert.ok(fighter.vy > 0 && fighter.y > 0);
  for (let tick = 0; tick < 160 && !canBufferXenoTrialsLandingV210(fighter, definition, dt); tick++) step(match, {}, opponent);
  assert.ok(canBufferXenoTrialsLandingV210(fighter, definition, dt));
  return fighter;
}

test('all four admitted motion profiles spend and move only after actual floor contact', () => {
  for (const id of ['warrior', 'runner', 'prowler', 'spitter']) {
    const match = fight(id), fighter = approachLanding(match);
    const full = getXenoTrialsFighterV96(id).stamina;
    step(match, { right: true, evade: true });
    const buffer = fighter.movementV210, startX = fighter.x;
    assert.equal(buffer?.direction, 1);
    assert.ok(fighter.y > 0);
    assert.equal(fighter.stamina, full);
    assert.equal(fighter.movesetV207.evade, null);
    assert.equal(landingEvents(match).length, 0);
    while (!landingEvents(match).length && match.tick <= buffer.tick + XENO_TRIALS_LANDING_TICKS_V210) step(match, { evade: true });
    const [receipt] = landingEvents(match);
    assert.ok(receipt, id);
    assert.equal(receipt.startedTickV210, buffer.tick);
    assert.equal(fighter.y, 0);
    assert.equal(fighter.vy, 0);
    assert.equal(fighter.movementV210, undefined);
    assert.equal(fighter.stamina, full - XENO_TRIALS_EVADE_V207.cost);
    assert.ok(fighter.x > startX, 'the grounded shift actually travels');
    advance(match, 70, { evade: true });
    assert.equal(landingEvents(match).length, 1);
    assert.equal(fighter.movesetV207.evade, null);
  }
});

test('a press while rising, a non-admitted profile or a busy landing cannot turn into a deferred evade', () => {
  const rising = fight('prowler');
  step(rising, { jump: true });
  step(rising, { evade: true });
  advance(rising, 150, { evade: true });
  assert.equal(landingEvents(rising).length, 0);
  assert.equal(rising.fighters[0].movementV210, undefined);
  assert.equal(rising.fighters[0].movesetV207.evade, null);

  const unsigned = fight('arachnoid'), [other] = unsigned.fighters;
  step(unsigned, { jump: true });
  while (other.vy >= 0) step(unsigned);
  while (other.y > 15) step(unsigned);
  step(unsigned, { evade: true });
  assert.ok(other.y > 0);
  advance(unsigned, 25, { evade: true });
  assert.equal(landingEvents(unsigned).length, 0);

  const guarded = fight('warrior'), guard = approachLanding(guarded);
  step(guarded, { evade: true });
  assert.ok(guard.movementV210);
  advance(guarded, 16, { guard: true, evade: true });
  assert.equal(guard.y, 0);
  assert.equal(guard.guard, true);
  assert.equal(guard.movementV210, undefined);
  assert.equal(landingEvents(guarded).length, 0);
});

test('the two authored grounded profiles commit their pivot once, with rearm and accurate facing', () => {
  for (const id of [snake, loader]) {
    const definition = getXenoTrialsFighterV96(id);
    assert.equal(hasXenoTrialsGroundTurnV210(definition), true);
    assert.equal(hasXenoTrialsGroundTurnV210({ ...definition, profileId: 'unreviewed' }), false);
    const match = fight(id), [fighter, target] = match.fighters;
    target.x = fighter.x - 570; // Start the real turn with a target on the other side.
    const x = fighter.x;
    step(match, { left: true, light: true });
    const started = fighter.movementV210?.tick;
    assert.equal(fighter.movementV210?.direction, -1);
    advance(match, XENO_TRIALS_TURN_TICKS_V210 - 1, { left: true, light: true });
    assert.equal(fighter.facing, 1);
    assert.equal(fighter.x, x);
    assert.equal(fighter.attack, null);
    step(match, { light: true });
    assert.equal(fighter.facing, -1);
    assert.equal(fighter.attack, null, 'held attack during the turn is not buffered');
    assert.equal(fighter.movementV210, undefined);
    const [turn] = match.events.filter(event => event.type === 'turn-v210');
    assert.equal(turn.startedTickV210, started);
    assert.equal(turn.tick - started, XENO_TRIALS_TURN_TICKS_V210);
    step(match);
    step(match, { light: true });
    assert.equal(fighter.attack?.facing, -1);
  }
});

test('duel landing buffer and horde ground pivot are kept on real pause or reload', () => {
  for (const horde of [false, true]) {
    const progress = createXenoTrialsProgressV96(), playerId = horde ? snake : 'prowler';
    if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
    const activityV119 = horde ? { branch: 'horde', id: 'xth180-incoming-1' } : undefined;
    const ticket = beginXenoTrialsV96(progress, { playerId, opponentId: 'runner', activityV119 });
    assert.ok(ticket.applied);
    const match = fight(playerId, { ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const [fighter, target] = match.fighters;
    const direct = horde ? {} : null;
    const make = horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197;
    if (horde) {
      target.x = fighter.x - 165;
      match.fighters.slice(2).forEach(enemy => { enemy.x = fighter.x + 750; });
      step(match, {}, direct);
      assert.equal(fighter.movementV210?.kind, 'ground-turn');
    } else {
      match.ai.decisionIn = .9;
      approachLanding(match, direct);
      step(match, { evade: true }, direct);
      assert.equal(fighter.movementV210?.kind, 'landing-evade');
    }
    setXenoTrialsPausedV96(match, true);
    const pausedTick = match.tick;
    advance(match, 60, {}, direct);
    assert.equal(match.tick, pausedTick);
    const save = make(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(save, horde ? 'horde ground turn' : 'duel landing evade');
    const restored = horde ? restoreXenoTrialsHordeMatchV180(save.snapshot) : structuredClone(save.snapshot);
    assert.ok(restored);
    const forged = structuredClone(save.snapshot);
    forged.fighters[0].movementV210.tick = match.tick - 500;
    assert.equal(make(forged, ticket.config), null);
    for (const state of [match, restored]) {
      setXenoTrialsPausedV96(state, false);
      advance(state, 14, {}, direct);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
    assert.ok(horde ? match.events.some(event => event.type === 'turn-v210') : landingEvents(match).length === 1);
    assert.ok(make(getXenoTrialsSnapshotV96(match), ticket.config), 'the actual movement receipt is admissible');
    const badReceipt = getXenoTrialsSnapshotV96(match);
    const event = badReceipt.events.find(row => horde ? row.type === 'turn-v210' : row.sourceV210 === 'landing');
    event.startedTickV210 = event.tick + 1;
    assert.equal(make(badReceipt, ticket.config), null);
  }
});

test('the native hit behind a turning chassis interrupts its pending pivot', () => {
  const match = fight(loader), [fighter, target] = match.fighters;
  target.facing = 1;
  target.x += bounds(fighter).left - 9 - bounds(target).right;
  step(match, { guard: true }, { light: true });
  advance(match, 6, { guard: true });
  step(match);
  step(match);
  assert.ok(fighter.movementV210, 'the chassis has begun the pivot before contact');
  advance(match, 3);
  assert.equal(fighter.movementV210, undefined);
  assert.equal(fighter.facing, 1);
  assert.ok(fighter.stun > 0);
  assert.ok(match.events.some(event => event.type === 'hit' && event.side === 'player'));
  assert.equal(match.events.some(event => event.type === 'turn-v210'), false);
});
