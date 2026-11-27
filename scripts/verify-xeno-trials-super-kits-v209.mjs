import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsSuperV148 } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsRiposteV208, getXenoTrialsRiposteReadinessV208 } from '../src/xeno-trials-ripostes-v208.js';
import { XENO_TRIALS_SUPER_KITS_V209, XENO_TRIALS_SUPER_KITS_V210, XENO_TRIALS_SUPER_KITS_V211, getXenoTrialsPhysicalSuper } from '../src/xeno-trials-super-kits-v209.js';
import { getXenoTrialsAttackStyleV147, getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { stepXenoTrialsBrainV119 } from '../src/xeno-trials-ai-v119.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';

const opponentId = 'queen';
const chord = { guard: true, super: true };
function ticks(match, count, first = {}, second = {}) {
  for (let step = 0; step < count; step++) stepXenoTrialsMatchV96(match, dt, first, second);
}

function spacing(player, target, gap = 9) {
  player.facing = 1; target.facing = -1;
  target.x += bounds(player).right + gap - bounds(target).left;
}

function duel(playerId, options = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, introSeconds: 0, holdRoundTransition: true, ...options });
  const [player, target] = match.fighters;
  spacing(player, target);
  return { match, player, target };
}

function ticket(playerId, activityV119) {
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(playerId);
  const admitted = beginXenoTrialsV96(progress, { playerId, opponentId, activityV119 });
  assert.equal(admitted.applied, true);
  return admitted.config;
}

test('the sixteen pairs bind both original supers to exact roster profiles and Bible rows', () => {
  const bible = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url), 'utf8'));
  const known = new Map(bible.tables['07_Supers'].rows.map(row => [row[0], row[1]]));
  assert.equal(XENO_TRIALS_SUPER_KITS_V209.length, 16);
  const addedLater = new Set([...XENO_TRIALS_SUPER_KITS_V210, ...XENO_TRIALS_SUPER_KITS_V211].map(kit => kit.first.fighterId));
  const original = XENO_TRIALS_FIGHTERS_V96.filter(fighter => !addedLater.has(fighter.id));
  assert.equal(original.filter(getXenoTrialsSuperV148).length, 21);
  assert.equal(original.filter(fighter => fighter.id !== 'import-game-afe2-exploder' && getXenoTrialsRiposteV208(fighter)).length, 20);
  const records = XENO_TRIALS_SUPER_KITS_V209.flatMap(kit => [kit.first, kit.counter]);
  assert.equal(new Set(records.map(move => move.id)).size, 32);
  assert.equal(new Set(records.map(move => JSON.stringify(move.spec))).size, 32);
  for (const { first, counter } of XENO_TRIALS_SUPER_KITS_V209) {
    const definition = getXenoTrialsFighterV96(first.fighterId);
    assert.equal(getXenoTrialsSuperV148(definition), first);
    assert.equal(getXenoTrialsRiposteV208(definition), counter);
    assert.equal(getXenoTrialsAttackStyleV147(definition, 'super'), 'physical');
    for (const move of [first, counter]) {
      assert.equal(known.get(move.id), move.fighterId);
      assert.equal(move.profileId, definition.profileId);
      assert.equal(move.canonExact, false);
      assert.equal(move.spec.superV148, true);
      assert.equal(move.meterCost, 100);
      assert.ok(move.labelEn && move.descriptionEn);
      assert.ok(Object.isFrozen(move) && Object.isFrozen(move.spec));
    }
    for (const other of [{ ...definition, id: 'same-costume-different-identity' }, { ...definition, profileId: 'wrong-profile' }]) {
      assert.equal(getXenoTrialsSuperV148(other), null);
      assert.equal(getXenoTrialsRiposteV208(other), null);
    }
  }
});

test('every new Super I launches one physical hit and debit without inheriting the ordinary special', () => {
  for (const { first: move } of XENO_TRIALS_SUPER_KITS_V209) {
    const { match, player, target } = duel(move.fighterId);
    assert.equal(player.superMeterV148, 0);
    ticks(match, 1, { super: true });
    assert.equal(player.attack, null);
    ticks(match, 1);
    player.superMeterV148 = 100; // Fixture isolates the accepted full-gauge action.
    const hp = target.hp;
    ticks(match, 1, { super: true });
    assert.equal(player.attack?.kind, 'super', move.id);
    assert.equal(player.attack.targetBodyV148, undefined);
    assert.equal(player.superMeterV148, 0);
    assert.equal(player.stamina, 100 - move.spec.cost);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(target.hp, hp, move.id);
    assert.equal(match.events.find(event => event.kind === 'super')?.superIdV148, move.id);
    for (let step = 0; step < 240; step++) {
      ticks(match, 1, { super: true });
      assert.equal(match.projectiles.length, 0, move.id);
      assert.equal(player.y, 0, move.id);
    }
    assert.ok(target.hp < hp, move.id);
    assert.equal(player.stats.hits, 1, move.id);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.superMeterV148, 0);
  }
});

test('every new Super II responds to a real parry of the target’s same committed attack', () => {
  for (const { counter: move } of XENO_TRIALS_SUPER_KITS_V209) {
    const { match, player, target } = duel(move.fighterId);
    player.superMeterV148 = 100;
    const heavy = getXenoTrialsAttackV147(getXenoTrialsFighterV96(target.id), 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
    ticks(match, 1, {}, { heavy: true });
    ticks(match, Math.floor(heavy.startup * 120) - 3);
    for (let step = 0; step < 8 && !player.parryV208?.openingId; step++) ticks(match, 1, { parry: true });
    assert.equal(getXenoTrialsRiposteReadinessV208(match, player, getXenoTrialsFighterV96(player.id)).ready, true, move.id);
    ticks(match, 1, chord);
    assert.equal(player.attack?.kind, 'super-riposte', move.id);
    assert.equal(player.parryV208.openingId, 0);
    assert.equal(player.superMeterV148, 0);
    assert.equal(match.events.find(event => event.kind === 'super-riposte')?.riposteIdV208, move.id);
    const hp = target.hp;
    ticks(match, 240, chord);
    assert.ok(target.hp < hp, move.id);
    assert.equal(player.stats.hits, 1);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.superMeterV148, 0);
  }
});

test('a previously ineligible V208 duel loads its existing state and earns gauge only from future contact', () => {
  const config = ticket('spitter');
  const { match, player } = duel('spitter', config);
  ticks(match, 1, { light: true });
  ticks(match, 100, {}, null);
  assert.ok(player.stats.damage > 0);
  const old = getXenoTrialsSnapshotV96(match);
  delete old.fighters[0].superMeterV148;
  const checkpoint = createXenoTrialsDuelCheckpointV197(old, config);
  assert.ok(checkpoint);
  assert.equal(checkpoint.snapshot.fighters[0].superMeterV148, undefined);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  ticks(resumed, 1);
  assert.equal(resumed.fighters[0].superMeterV148, 0);
  spacing(...resumed.fighters);
  ticks(resumed, 1, { light: true });
  ticks(resumed, 36);
  assert.ok(resumed.fighters[0].superMeterV148 > 0);
});

test('a duel saves a physical Super I windup and rejects projectile, false-contact and event forgery', () => {
  const config = ticket('xenoborg');
  const { match, player } = duel('xenoborg', config);
  player.superMeterV148 = 100;
  ticks(match, 1, { super: true }, null);
  const saved = getXenoTrialsSnapshotV96(match);
  const checkpoint = createXenoTrialsDuelCheckpointV197(saved, config);
  assert.ok(checkpoint);
  assert.equal(checkpoint.snapshot.fighters[0].superMeterV148, 0);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  ticks(match, 180, {}, null);
  ticks(resumed, 180, {}, null);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  for (const mutate of [
    value => { value.fighters[0].attack.emitted = true; },
    value => { value.fighters[0].attack.hit = true; },
    value => { value.fighters[0].attack.targetBodyV148 = {}; },
    value => { value.events.find(event => event.kind === 'super').superIdV148 = 'fake-super'; },
    value => { delete value.fighters[0].superMeterV148; },
  ]) {
    const corrupted = structuredClone(saved); mutate(corrupted);
    assert.equal(createXenoTrialsDuelCheckpointV197(corrupted, config), null);
  }
});

test('a ranged CPU preserves full meter outside the new native melee range', () => {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'xenoborg', introSeconds: 0 });
  const [target, cpu] = match.fighters;
  spacing(target, cpu, 255);
  cpu.superMeterV148 = 100;
  const choice = stepXenoTrialsBrainV119(match, dt, XENO_TRIALS_ATTACKS_V96, () => .5);
  assert.equal(choice.super, false);
  assert.equal(choice.special, true);
  assert.equal(cpu.superMeterV148, 100);
});

test('a true horde earns meter, limits a native sweep, and restores its active target history', () => {
  const config = ticket('royal-guard', { branch: 'horde', id: 'xth180-incoming-5' });
  const match = createXenoTrialsMatchV96({ ...config, introSeconds: 0, holdRoundTransition: true });
  const player = match.fighters[0];
  for (let step = 0; step < 7200 && !match.result; step++) {
    const enemies = match.fighters.slice(1);
    if (player.superMeterV148 === 100 && !player.attack && player.stamina >= 55 && enemies.length >= 4) break;
    const clearWave = match.hordeV180.alive < 4 && match.hordeV180.remaining === 0;
    const nearest = enemies.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    const heavy = (player.superMeterV148 < 100 || clearWave) && match.tick % 180 === 0;
    ticks(match, 1, { left: nearest?.x < player.x, right: nearest?.x > player.x, heavy });
  }
  assert.equal(player.superMeterV148, 100);
  assert.equal(player.attack, null);
  const targets = match.fighters.slice(1);
  assert.ok(targets.length >= 4);
  player.x = 500;
  for (const [index, foe] of targets.entries()) spacing(player, foe, 4 + 5 * index);
  const hitStart = player.stats.hits;
  ticks(match, 1, { super: true });
  assert.equal(player.attack?.kind, 'super');
  const move = getXenoTrialsPhysicalSuper(getXenoTrialsFighterV96(player.id));
  // The fixture keeps all existing opponents in the measured sweep lane
  // during windup without changing their identities, health or ownership.
  for (let step = 0; step < Math.floor(move.spec.startup * 120); step++) {
    for (const [index, foe] of match.fighters.slice(1).entries()) spacing(player, foe, 4 + 5 * index);
    ticks(match, 1);
  }
  const checkpoint = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  assert.equal(player.stats.hits, hitStart + move.spec.hordeTargetsV209);
  assert.equal(checkpoint.snapshot.fighters[0].attack.hitTargetsV180.length, move.spec.hordeTargetsV209);
  assert.equal(checkpoint.snapshot.fighters[0].superMeterV148, 0);
  const restored = restoreXenoTrialsHordeMatchV180(structuredClone(checkpoint.snapshot));
  assert.ok(restored);
  setXenoTrialsPausedV96(restored, false);
  ticks(match, 160); ticks(restored, 160);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  assert.equal(player.stats.hits, hitStart + move.spec.hordeTargetsV209);
});
