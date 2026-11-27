import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, releaseXenoTrialsControlsV150,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt
} from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body, XENO_TRIALS_ARENA_V105 as arena } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207 as hurt, XENO_TRIALS_EVADE_V207 as evade } from '../src/xeno-trials-moveset-v207.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsDuelCheckpointV197, isXenoTrialsDuelCheckpointForwardV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186, isXenoTrialsCheckpointForwardV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';

function fight(config = {}) {
  return createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0, ...config });
}
function advance(match, count, player = {}, opponent = {}) {
  for (let i = 0; i < count; i++) stepXenoTrialsMatchV96(match, dt, player, opponent);
}
function positionForContact(match, gap = 15) {
  const [player, opponent] = match.fighters;
  opponent.x += (body(player).right + gap) - body(opponent).left;
  return [player, opponent];
}

test('V208 Snake and Power Loader traverse on the floor, with endurance, without repeat or collision bypass', () => {
  for (const playerId of ['drive-v123-neca-snake-series13-v14', 'synth-automated-powerloader']) {
    const match = fight({ playerId }), [player, target] = match.fighters;
    const start = player.x, stamina = player.stamina;
    advance(match, 1, { jump: true });
    assert.equal(player.movesetV207.evade.direction, 1);
    assert.ok(player.x > start);
    assert.ok(Math.abs(stamina - player.stamina - evade.cost) < .21);
    advance(match, 45, { jump: true });
    assert.equal(player.y, 0);
    assert.equal(player.movesetV207.evade, null);
    assert.equal(match.events.filter(event => event.type === 'evade-v207').length, 1);
    assert.ok(player.x < target.x);
  }
  const ordinary = fight();
  advance(ordinary, 1, { jump: true });
  assert.ok(ordinary.fighters[0].y > 0);
});

test('low stance preserves push width and low attacks require low guard', () => {
  for (const crouch of [false, true]) {
    const match = fight(), [player, target] = positionForContact(match), hp = target.hp;
    const normal = body(player);
    advance(match, 1, { crouch: true, light: true }, { crouch, guard: true });
    assert.equal(player.attack.kind, 'low');
    assert.equal(hurt(player).width, normal.width);
    assert.ok(hurt(player).top < normal.top);
    assert.deepEqual(body(player), normal);
    advance(match, 32, {}, { crouch, guard: true });
    assert.equal(player.stats.hits, 1);
    assert.equal(target.stats.blocks, Number(crouch));
    assert.ok(hp - target.hp > 0);
    assert.equal(hp - target.hp < 4, crouch);
  }
});

test('low stance drops below a high projectile that hits a standing target', () => {
  for (const crouch of [false, true]) {
    const match = fight(), [player] = positionForContact(match), hp = player.hp;
    match.projectiles.push({ id: 1, owner: 'opponent', x: body(player).right, y: body(player).top - 2,
      direction: -1, life: 1, spec: { damage: 20, push: 0, stun: .15 }, power: 1, style: 'pulse' });
    advance(match, 1, { crouch });
    assert.equal(player.hp === hp, crouch);
  }
});

test('a guarding normal or hard CPU can react to a visible low strike at close range', () => {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    const match = fight({ difficulty }), [, target] = positionForContact(match);
    match.ai.input.guard = true;
    match.ai.decisionIn = .5;
    match.ai.guardRemaining = .5;
    advance(match, 1, { crouch: true, light: true }, null);
    assert.equal(target.movesetV207, undefined, 'the CPU does not anticipate the command');
    advance(match, 29, {}, null);
    assert.equal(target.stats.blocks, Number(difficulty !== 'easy'));
  }
});

test('anti-air intersects a nearby jumper once, and misses a grounded target', () => {
  for (const jump of [false, true]) {
    const match = fight(), [player, target] = positionForContact(match), hp = target.hp;
    advance(match, 1, { antiAir: true }, { jump });
    assert.equal(player.attack.kind, 'anti-air');
    advance(match, 40);
    assert.equal(player.stats.hits, Number(jump));
    assert.equal(target.hp < hp, jump);
  }
});

test('backstep and advance use measured physical travel, stamina and arena walls', () => {
  const retreat = fight(), [retreater] = retreat.fighters, origin = retreater.x;
  advance(retreat, 1, { evade: true });
  assert.equal(retreater.movesetV207.evade.direction, -1);
  assert.ok(retreater.x < origin);
  advance(retreat, evade.travelTicks + evade.recoveryTicks + 3, { evade: true });
  assert.equal(retreater.movesetV207.evade, null);
  assert.equal(retreat.events.filter(event => event.type === 'evade-v207').length, 1);

  const forward = fight(), [attacker, target] = positionForContact(forward, 60);
  const start = attacker.x;
  advance(forward, 1, { right: true, evade: true, light: true });
  assert.equal(attacker.attack, null);
  advance(forward, 4, { right: true });
  assert.ok(attacker.x - start >= evade.advanceMinimum);
  advance(forward, 1, { light: true });
  assert.equal(attacker.attack.kind, 'advance');
  advance(forward, 40);
  assert.ok(attacker.x > start);
  assert.equal(attacker.stats.hits, 1);
  assert.ok(target.x >= attacker.x);

  const wall = fight(), [dodger] = wall.fighters;
  dodger.x = arena.left + 1;
  advance(wall, 1, { evade: true });
  advance(wall, 3, { light: true });
  assert.equal(dodger.x, arena.left);
  assert.equal(dodger.attack, null);
});

test('intro and pause need a physical release before a held advanced command rearms', () => {
  const match = fight({ introSeconds: .05 }), [player] = match.fighters;
  advance(match, 14, { antiAir: true, evade: true });
  assert.equal(player.attack, null);
  assert.equal(player.movesetV207.evade, null);
  advance(match, 1);
  advance(match, 1, { antiAir: true });
  assert.equal(player.attack.kind, 'anti-air');
  setXenoTrialsPausedV96(match, true);
  setXenoTrialsPausedV96(match, false);
  advance(match, 88, { antiAir: true });
  assert.equal(player.attack, null);
  assert.equal(match.events.filter(event => event.kind === 'anti-air').length, 1);
  releaseXenoTrialsControlsV150(match, 'player', {});
  advance(match, 1, { antiAir: true });
  assert.equal(player.attack.kind, 'anti-air');
});

test('duel and horde checkpoints carry the in-flight next move and preserve old save shape', () => {
  for (const horde of [false, true]) {
    const activityV119 = horde ? { branch: 'horde', id: 'xth180-incoming-1' }
      : { branch: 'on-demand', id: 'on-demand', rules: {} };
    const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: 'runner', activityV119 });
    assert.equal(ticket.applied, true);
    const match = fight({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const make = horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197;
    const compare = horde ? isXenoTrialsCheckpointForwardV186 : isXenoTrialsDuelCheckpointForwardV197;
    const before = make(match, ticket.config);
    assert.ok(before);
    assert.equal(before.snapshot.fighters[0].movesetV207, undefined);
    advance(match, 5, { evade: true }, null);
    const save = make(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(save);
    assert.ok(save.snapshot.fighters[0].movesetV207.evade);
    assert.ok(compare(before, save));
    const restored = horde ? restoreXenoTrialsHordeMatchV180(save.snapshot) : structuredClone(save.snapshot);
    assert.ok(restored);
    releaseXenoTrialsControlsV150(restored, 'player', {});
    assert.ok(compare(save, make(restored, ticket.config)));
    for (const state of [match, restored]) setXenoTrialsPausedV96(state, false);
    advance(match, 30, {}, null);
    advance(restored, 30, {}, null);
    assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
    const tampered = structuredClone(save.snapshot);
    tampered.fighters[0].movesetV207.evade.ticks = 1000;
    assert.equal(make(tampered, ticket.config), null);

    advance(match, 1, { crouch: true, light: true }, null);
    assert.equal(match.fighters[0].attack.kind, 'low');
    assert.ok(make(match, ticket.config));
  }
});
