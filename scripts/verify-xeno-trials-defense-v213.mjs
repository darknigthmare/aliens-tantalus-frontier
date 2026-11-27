import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207 as hurt, XENO_TRIALS_GUARD_RETREAT_V213, XENO_TRIALS_LOW_RETREAT_V213 } from '../src/xeno-trials-moveset-v207.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsSpriteAtlasV189, sampleXenoTrialsSpriteAtlasV189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { getXenoTrialsRuntimeSpriteAtlas, sampleXenoTrialsSpriteAtlasV191 } from '../src/xeno-trials-sprite-atlas-v191.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';

const bodies = ['warrior', 'runner', 'prowler', 'spitter'];
const retreat = { crouch: true, evade: true };
const guarded = { left: true, guard: true };
const move = (match, player = {}, opponent = {}) => stepXenoTrialsMatchV96(match, dt, player, opponent);
function advance(match, count, player = {}, opponent = {}) {
  for (let tick = 0; tick < count; tick++) move(match, player, opponent);
}
function duel(id, gap = 12) {
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'runner', introSeconds: 0, holdRoundTransition: true });
  const [player, target] = match.fighters;
  target.x += body(player).right + gap - body(target).left;
  return match;
}
const receipts = match => match.events.filter(event => event.type === 'evade-v207' && event.variantV213 === 'low-retreat');

test('four measured ground profiles commit a bounded crouched retreat with cost and release', () => {
  for (const id of bodies) {
    const match = duel(id, 300), [player] = match.fighters, x = player.x, original = body(player), stamina = player.stamina;
    move(match, retreat);
    const [accepted] = receipts(match), { travelTicks, recoveryTicks, cost } = XENO_TRIALS_LOW_RETREAT_V213;
    assert.ok(accepted, id);
    assert.equal(player.stamina, stamina - cost, id);
    assert.equal(player.movesetV207.evade.origin, x, id);
    assert.equal(player.movesetV207.evade.direction, -1, id);
    assert.ok(hurt(player).top < original.top && body(player).width === original.width && player.y === 0, id);
    advance(match, travelTicks - 1, { evade: true, light: true });
    const reached = player.x;
    assert.ok(reached < x && x - reached <= 40 + 1e-8, id);
    advance(match, recoveryTicks - 1, { evade: true, light: true });
    assert.ok(player.movesetV207.low && player.movesetV207.evade, id);
    assert.equal(player.x, reached, id);
    move(match, { evade: true, light: true });
    assert.equal(player.movesetV207.evade, null, id);
    assert.equal(player.movesetV207.low, false, id);
    assert.equal(player.stats.hits, 0, id);
    assert.equal(player.attack, null, 'a held strike is not buffered off recovery');
    advance(match, 45, retreat);
    assert.equal(receipts(match).length, 1);
  }
  for (const [id, controls] of [['arachnoid', retreat], ['runner', { ...retreat, right: true }]]) {
    const match = duel(id);
    move(match, controls);
    assert.equal(receipts(match).length, 0, id);
    assert.equal(match.fighters[0].movesetV207.evade, null, id);
  }
});

test('real heavies can miss the retreating body at its edge and still interrupt it at contact', () => {
  const definition = getXenoTrialsFighterV96('runner');
  const spec = getXenoTrialsAttackV147(definition, 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  for (const [gap, commands, shouldHit] of [[spec.reach * definition.reach - 7, {}, true],
    [spec.reach * definition.reach - 7, retreat, false], [5, retreat, true]]) {
    const match = duel('warrior', gap), [player, rival] = match.fighters;
    move(match, {}, { heavy: true });
    advance(match, 16);
    move(match, commands);
    advance(match, 15);
    assert.equal(rival.stats.hits > 0, shouldHit);
    if (shouldHit) {
      assert.equal(player.movesetV207?.evade ?? null, null);
      assert.ok(player.stun > 0);
    } else {
      assert.equal(receipts(match).length, 1);
      assert.equal(player.stats.blocks, 0);
    }
  }
});

test('standing guard can retreat, pays its additional movement drain and continues to block frontally', () => {
  const match = duel('warrior', 6), [player, opponent] = match.fighters, start = player.x;
  const def = getXenoTrialsFighterV96(player.id), stamina = player.stamina;
  move(match, guarded, { heavy: true });
  assert.ok(player.guard);
  assert.ok(Math.abs(player.x - (start - def.speed * XENO_TRIALS_GUARD_RETREAT_V213.speedRatio * dt)) < 1e-9);
  assert.ok(Math.abs(player.stamina - (stamina - (5 + XENO_TRIALS_GUARD_RETREAT_V213.additionalDrain) * dt)) < 1e-9);
  const atlas = getXenoTrialsSpriteAtlasV189(player, getXenoTrialsArtV96(player.id));
  const options = { moving: true, distance: 50, guardedRetreat: true, metrics: { visibleHeight: body(player).height } };
  const forward = sampleXenoTrialsSpriteAtlasV189(atlas, player, options);
  const reverse = sampleXenoTrialsSpriteAtlasV189(atlas, player, { ...options, reverseStep: true });
  assert.ok(forward?.frame && reverse?.frame);
  assert.notEqual(forward.frame.id, reverse.frame.id, 'the verified step sequence can be read backward');
  advance(match, 31, guarded);
  assert.equal(player.stats.blocks, 1);
  assert.equal(opponent.stats.hits, 1);
  assert.equal(player.guard, true);
  for (const controls of [{ guard: true, right: true }, { ...guarded, crouch: true }, { ...guarded, super: true }]) {
    const still = duel('warrior', 200), actor = still.fighters[0], x = actor.x;
    move(still, controls);
    assert.equal(actor.x, x);
  }
});

test('six additional V218 profiles yield ground under frontal guard with their own reversed walk keys', () => {
  for (const id of ['defender', 'chrysalis', 'smasher', 'user-brute', 'synth-trooper', 'synth-guard']) {
    const match = duel(id, 4), [player, opponent] = match.fighters;
    const definition = getXenoTrialsFighterV96(id), start = player.x, stamina = player.stamina;
    move(match, guarded, { heavy: true });
    assert.equal(player.guard, true, id);
    assert.equal(player.x, start - definition.speed * XENO_TRIALS_GUARD_RETREAT_V213.speedRatio * dt, id);
    assert.equal(player.stamina, stamina - (5 + XENO_TRIALS_GUARD_RETREAT_V213.additionalDrain) * dt, id);
    const atlas = getXenoTrialsRuntimeSpriteAtlas(player, getXenoTrialsArtV96(id));
    const metrics = { visibleHeight: body(player).height };
    const moving = { metrics, distance: metrics.visibleHeight * .2, moving: true, guardedRetreat: true };
    assert.equal(sampleXenoTrialsSpriteAtlasV191(atlas, player, moving).frame.id, 'walk-a', id);
    assert.equal(sampleXenoTrialsSpriteAtlasV191(atlas, player, { ...moving, reverseStep: true }).frame.id, 'walk-b', id);
    assert.equal(sampleXenoTrialsSpriteAtlasV191(atlas, player, { ...moving, reducedMotion: true }).frame.id, 'guard', id);
    advance(match, 31, guarded);
    assert.equal(player.stats.blocks, 1, id);
    assert.equal(opponent.stats.hits, 1, id);
    assert.equal(player.guard, true, id);
    const before = player.x;
    move(match, { ...guarded, crouch: true });
    assert.equal(player.x, before, id);
  }
});

test('duel and horde checkpoints preserve the low retreat and refuse absent or altered native evidence', () => {
  for (const horde of [false, true]) {
    const activityV119 = horde ? { branch: 'horde', id: 'xth180-incoming-1' } : undefined;
    const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner', activityV119 });
    assert.ok(ticket.applied);
    const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const make = state => (horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197)(state, ticket.config);
    const cpu = horde ? {} : null;
    match.ai.decisionIn = .8;
    advance(match, 3, retreat, cpu);
    assert.ok(match.fighters[0].movesetV207.evade);
    setXenoTrialsPausedV96(match, true);
    const saved = make(getXenoTrialsSnapshotV96(match));
    assert.ok(saved);
    const forged = structuredClone(saved.snapshot);
    forged.events = forged.events.filter(event => event.variantV213 === undefined);
    assert.equal(make(forged), null);
    const wrongFacing = structuredClone(saved.snapshot);
    wrongFacing.fighters[0].movesetV207.evade.direction *= -1;
    assert.equal(make(wrongFacing), null);
    const after = horde ? restoreXenoTrialsHordeMatchV180(saved.snapshot) : structuredClone(saved.snapshot);
    assert.ok(after);
    for (const state of [match, after]) {
      setXenoTrialsPausedV96(state, false);
      advance(state, 30, retreat, cpu);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(after), getXenoTrialsSnapshotV96(match));
    assert.equal(receipts(match).length, 1);
  }
});
