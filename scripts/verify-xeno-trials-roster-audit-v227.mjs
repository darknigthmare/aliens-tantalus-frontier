import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { ENEMY_DISPLAY_ALPHA_V110 } from '../src/enemy-display-alpha-v110.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsGeometryV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { compareXenoTrialsSimulationPowerV227, getXenoTrialsPowerBreakdownV227,
  getXenoTrialsSimulationPowerV227 } from '../src/xeno-trials-power-v227.js';
import { XENO_TRIALS_RESEARCH_FIGHTERS_V210 } from '../src/xeno-trials-research-v210.js';

const close = (value, expected, label) => assert.ok(Math.abs(value - expected) < 1e-7, `${label}: ${value} versus ${expected}`);
const matchFor = (id, variant = null) => createXenoTrialsMatchV96({ playerId: id, playerVariant: variant,
  opponentId: id === 'warrior' ? 'runner' : 'warrior', introSeconds: 0, seed: 96001 });
const step = (match, input) => stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, {});

function landingContact(id, variant, action) {
  const match = matchFor(id, variant);
  const [actor, target] = match.fighters;
  target.x += getXenoTrialsBodyBoundsV105(actor).right + 8 - getXenoTrialsBodyBoundsV105(target).left;
  const fullHealth = target.hp;
  step(match, { [action]: true });
  for (let tick = 0; tick < 90 && actor.stats.hits === 0; tick++) step(match, {});
  return { damage: fullHealth - target.hp, hits: actor.stats.hits };
}

function checkIncarnation(fighter, variant) {
  const { id } = fighter;
  const label = `${id}${variant ? `:${variant}` : ''}`;
  const art = getXenoTrialsArtV96(id, variant);
  const geometry = getXenoTrialsGeometryV105(id, variant);
  const { render, height, width, visibleHeight, visibleWidth } = geometry;
  const [left, top, right, bottom] = render.alphaBounds;
  assert.ok(existsSync(new URL(`..${art.path}`, import.meta.url)), label);
  assert.ok(0 <= left && left < right && right <= art.sourceWidth && 0 <= top && top < bottom && bottom <= art.sourceHeight, label);
  assert.ok(render.pivotX * art.sourceWidth >= left && render.pivotX * art.sourceWidth <= right, label);
  close(render.width / render.height, art.sourceWidth / art.sourceHeight, label);
  close(render.groundPivot, bottom / art.sourceHeight, label);
  close(render.visibleHeight, visibleHeight, label);
  assert.ok(height > 0 && height <= visibleHeight && width > 0 && width <= visibleWidth + 1e-7, label);
  assert.ok(render.canonVerified === false && fighter.canonExact === false, label);

  const match = matchFor(id, variant), [player, target] = match.fighters;
  assert.deepEqual([player.id, player.variant, player.hp, player.stamina, player.y], [id, variant, fighter.hp, fighter.stamina, 0], label);
  const forward = getXenoTrialsBodyBoundsV105({ ...player, x: 500, facing: 1 });
  const reversed = getXenoTrialsBodyBoundsV105({ ...player, x: 500, facing: -1 });
  close(forward.left + reversed.right, 1000, label);
  close(forward.right + reversed.left, 1000, label);
  assert.equal(forward.bottom, 0, label);
  player.x = XENO_TRIALS_ARENA_V105.left + 80;
  target.x = XENO_TRIALS_ARENA_V105.right - 80;
  const start = player.x;
  step(match, { right: true });
  close((player.x - start) / XENO_TRIALS_STEP_V96, fighter.speed, label);
  const power = getXenoTrialsPowerBreakdownV227(id);
  step(match, { right: true, jump: true });
  if (power.native.groundTraversal) assert.ok(player.y === 0 && player.movesetV207.evade, label);
  else assert.ok(player.y > 0 && player.vy === fighter.jump, label);
  for (const action of ['light', 'heavy']) {
    assert.deepEqual(landingContact(id, variant, action), { damage: power.native.attacks[action].damage, hits: 1 }, `${label} ${action}`);
  }
}

test('every selectable pose and every separate MIRE research model has native stats, an unstretched image and a mirrored ground body', () => {
  const roster = XENO_TRIALS_FIGHTERS_V96;
  const research = XENO_TRIALS_RESEARCH_FIGHTERS_V210;
  assert.equal(roster.length, 189);
  assert.equal(research.length, 15);
  assert.equal(new Set([...roster, ...research].map(entry => entry.id)).size, 204);
  assert.equal(roster.reduce((total, entry) => total + Math.max(1, entry.variants.length), 0), 190);
  for (const fighter of [...roster, ...research]) {
    assert.equal(getXenoTrialsFighterV96(fighter.id), fighter);
    const numbers = [fighter.hp, fighter.stamina, fighter.speed, fighter.jump, fighter.power, fighter.reach];
    assert.ok(numbers.every(value => Number.isFinite(value) && value > 0), fighter.id);
    for (const variant of fighter.variants.length ? fighter.variants : [null]) checkIncarnation(fighter, variant);
  }
  assert.equal(getXenoTrialsArtV96('arachnoid', null).path, getXenoTrialsArtV96('arachnoid', 'grey').path);
});

test('MIRE power uses a stable Warrior reference, real cooldowns, contact damage, and a deterministic ID tie-break', () => {
  const warrior = getXenoTrialsPowerBreakdownV227('warrior');
  assert.deepEqual([warrior.power, warrior.survival, warrior.offense, warrior.mobility, warrior.reach], [100, 100, 100, 100, 100]);
  assert.equal(warrior.native.attacks.special.cooldown, 1.6);
  assert.equal(warrior.native.attacks.special.cycle, 1.6);
  assert.equal(getXenoTrialsPowerBreakdownV227('runner').native.attacks.special.damage, 32);
  assert.equal(getXenoTrialsPowerBreakdownV227('runner').native.attacks.special.contactReach, 124 * .9);
  assert.equal(getXenoTrialsPowerBreakdownV227('spitter').native.attacks.special.contactReach, null);
  assert.equal(getXenoTrialsPowerBreakdownV227('import-game-afe2-exploder').native.attacks.special.pressure, 0);
  assert.equal(getXenoTrialsPowerBreakdownV227('defender').mobility, 73.33);
  assert.equal(getXenoTrialsSimulationPowerV227('forged'), null);

  const match = matchFor('warrior');
  step(match, { special: true });
  assert.equal(match.fighters[0].specialCooldown, warrior.native.attacks.special.cooldown);
  for (let tick = 0; tick < 188; tick++) step(match, { special: tick % 2 === 1 });
  assert.equal(match.fighters[0].stats.specials, 1);
  for (let tick = 0; tick < 12; tick++) step(match, { special: tick % 2 === 1 });
  assert.equal(match.fighters[0].stats.specials, 2);

  const roster = XENO_TRIALS_FIGHTERS_V96;
  const sorted = [...roster].sort(compareXenoTrialsSimulationPowerV227);
  assert.deepEqual([...roster].reverse().sort(compareXenoTrialsSimulationPowerV227), sorted);
  for (const [index, fighter] of sorted.entries()) {
    const value = getXenoTrialsSimulationPowerV227(fighter.id);
    assert.ok(Number.isFinite(value) && value > 0, fighter.id);
    if (index > 0) {
      const previous = sorted[index - 1];
      const before = getXenoTrialsSimulationPowerV227(previous.id);
      assert.ok(before < value || before === value && previous.id < fighter.id, fighter.id);
    }
  }
  assert.ok(Object.isFrozen(warrior.native.attacks.special));
  assert.equal(getXenoTrialsSimulationPowerV227('warrior', { hp: 999 }), 100);
});

test('the legless Titan keeps its authored scale and the Big Chap pose shares the measured ground edge', () => {
  const titanId = 'import-xeno-titan-queen-nolegs';
  const art = getXenoTrialsArtV96(titanId);
  const titan = getXenoTrialsGeometryV105(titanId);
  assert.equal(art.reconstruction, 'unseen-legless-abdominal-base-and-tail');
  close(titan.visibleHeight, art.targetOpaqueHeight * 90 / 70, 'Titan opaque height');
  close(titan.height, art.bodyHeight * 90 / 70, 'Titan collider height');
  close(getXenoTrialsGeometryV105('queen').visibleHeight, 387, 'Aliens Queen');
  assert.equal(getXenoTrialsFighterV96(titanId).hp, 430);
  assert.equal(getXenoTrialsFighterV96(titanId).speed, 80);

  const bigChap = getXenoTrialsArtV96('mire-v209-bigchap');
  const measured = ENEMY_DISPLAY_ALPHA_V110[bigChap.path];
  assert.deepEqual(bigChap.alphaBounds, measured.bounds);
  const { render } = getXenoTrialsGeometryV105('mire-v209-bigchap');
  close(render.groundPivot, measured.bounds[3] / bigChap.sourceHeight, 'Big Chap foot edge');
  close(render.pivotX, 126 / 256, 'Big Chap horizontal root');
});
