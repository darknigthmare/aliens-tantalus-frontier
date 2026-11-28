import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsSuperV148 } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsRiposteV208, getXenoTrialsRiposteReadinessV208 } from '../src/xeno-trials-ripostes-v208.js';
import { XENO_TRIALS_SUPER_KITS_V209, XENO_TRIALS_SUPER_KITS_V210, XENO_TRIALS_SUPER_KITS_V211 } from '../src/xeno-trials-super-kits-v209.js';
import { getXenoTrialsActiveStrikeV210 } from '../src/xeno-trials-super-kits-v210.js';
import { getXenoTrialsAttackStyleV147, getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';

const chord = { guard: true, super: true };
function step(match, count = 1, player = {}, opponent = {}) {
  for (let n = 0; n < count; n++) stepXenoTrialsMatchV96(match, dt, player, opponent);
}

function space(player, target, gap = 10) {
  player.facing = 1;
  target.facing = -1;
  target.x += bounds(player).right + gap - bounds(target).left;
}

function fight(playerId, options = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId: 'queen', introSeconds: 0, holdRoundTransition: true, ...options });
  const [player, target] = match.fighters;
  space(player, target);
  return { match, player, target };
}

function ticket(configuration) {
  const progress = createXenoTrialsProgressV96();
  for (const id of [configuration.playerId, configuration.opponentId]) if (id && !progress.unlocked.includes(id)) progress.unlocked.push(id);
  const result = beginXenoTrialsV96(progress, configuration);
  assert.ok(result.applied);
  return result.config;
}

test('the 24 new pairs reference exact bible rows, including all starters, without changing predecessor profiles', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url), 'utf8'));
  const identities = new Map(plan.tables['07_Supers'].rows.map(row => [row[0], row[1]]));
  assert.equal(XENO_TRIALS_SUPER_KITS_V210.length, 24);
  const moves = XENO_TRIALS_SUPER_KITS_V210.flatMap(({ first, counter }) => [first, counter]);
  assert.equal(new Set(moves.map(move => move.id)).size, 48);
  assert.equal(new Set(moves.map(move => JSON.stringify(move.spec))).size, 48);
  const addedLater = new Set(XENO_TRIALS_SUPER_KITS_V211.map(kit => kit.first.fighterId));
  const roster = XENO_TRIALS_FIGHTERS_V96.filter(fighter => identities.has(fighter.id + '::super1') && !addedLater.has(fighter.id));
  assert.equal(roster.filter(getXenoTrialsSuperV148).length, 45);
  assert.equal(roster.filter(fighter => fighter.id !== 'import-game-afe2-exploder' && getXenoTrialsRiposteV208(fighter)).length, 44);
  for (const id of ['warrior', 'runner', 'arachnoid']) assert.ok(getXenoTrialsRiposteV208(getXenoTrialsFighterV96(id)));
  for (const move of moves) {
    assert.equal(identities.get(move.id), move.fighterId);
    assert.equal(getXenoTrialsFighterV96(move.fighterId).profileId, move.profileId);
    assert.equal(move.canonExact, false);
    assert.equal(move.meterCost, 100);
    assert.ok(Object.isFrozen(move.spec) && move.labelEn !== '' && move.descriptionEn !== '');
    for (const unmatched of [{ id: move.fighterId, profileId: 'other-profile' }, { id: 'another-id', profileId: move.profileId }]) {
      assert.equal(getXenoTrialsSuperV148(unmatched), null);
      assert.equal(getXenoTrialsRiposteV208(unmatched), null);
    }
  }
  for (const { first, counter } of XENO_TRIALS_SUPER_KITS_V209) {
    const definition = getXenoTrialsFighterV96(first.fighterId);
    assert.equal(getXenoTrialsSuperV148(definition), first);
    assert.equal(getXenoTrialsRiposteV208(definition), counter);
  }
});

test('all 24 new Super I moves execute native physical contact with a single gauge debit', () => {
  for (const { first: move } of XENO_TRIALS_SUPER_KITS_V210) {
    const { match, player, target } = fight(move.fighterId);
    const hp = target.hp;
    player.superMeterV148 = 100; // Full-resource boundary fixture, never a refund.
    step(match, 1, { super: true });
    assert.equal(player.attack?.kind, 'super', move.id);
    assert.equal(player.superMeterV148, 0);
    assert.equal(player.stamina, 100 - move.spec.cost);
    assert.equal(player.attack.targetBodyV148, undefined, move.id);
    assert.equal(target.hp, hp);
    assert.equal(getXenoTrialsAttackStyleV147(getXenoTrialsFighterV96(player.id), 'super'), 'physical');
    assert.equal(match.events.find(event => event.kind === 'super')?.superIdV148, move.id);
    step(match, 235, { super: true });
    assert.ok(target.hp < hp, move.id);
    assert.equal(player.stats.hits, 1);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.superMeterV148, 0);
    assert.equal(match.projectiles.length, 0);
  }
});

test('all 24 new Super II moves accept only a matching real parry and hit their admitted attacker', () => {
  for (const { counter: move } of XENO_TRIALS_SUPER_KITS_V210) {
    const { match, player, target } = fight(move.fighterId);
    player.superMeterV148 = 100;
    step(match, 1, chord);
    assert.equal(player.attack, null);
    step(match);
    const heavy = getXenoTrialsAttackV147(getXenoTrialsFighterV96(target.id), 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
    step(match, 1, {}, { heavy: true });
    step(match, Math.floor(heavy.startup * 120) - 3);
    for (let n = 0; n < 8 && !player.parryV208?.openingId; n++) step(match, 1, { parry: true });
    assert.equal(getXenoTrialsRiposteReadinessV208(match, player, getXenoTrialsFighterV96(player.id)).ready, true, move.id);
    step(match, 1, chord);
    assert.equal(player.attack?.kind, 'super-riposte');
    assert.equal(player.parryV208.openingId, 0);
    assert.equal(match.events.find(event => event.kind === 'super-riposte')?.riposteIdV208, move.id);
    assert.equal(player.superMeterV148, 0);
    const hp = target.hp;
    step(match, 235, chord);
    assert.ok(target.hp < hp, move.id);
    assert.equal(player.stats.hits, 1);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.superMeterV148, 0);
  }
});

test('Warrior’s lower strike misses a jump and its rising follow-through hits after reloading', () => {
  const config = ticket({ playerId: 'warrior', opponentId: 'runner' });
  const { match, player, target } = fight('warrior', config);
  const move = getXenoTrialsSuperV148(getXenoTrialsFighterV96(player.id));
  assert.equal(getXenoTrialsActiveStrikeV210(move.spec, .34).contactBandV207, 'low');
  assert.equal(getXenoTrialsActiveStrikeV210(move.spec, .45).contactBandV207, 'anti-air');
  // Keep the bodies apart during startup while the target jumps natively.
  space(player, target, 240);
  player.superMeterV148 = 100;
  step(match, 43, { super: true });
  const hp = target.hp;
  step(match, 1, {}, { jump: true });
  assert.ok(target.y > 0);
  space(player, target, 65);
  step(match, 6);
  step(match, 1, {}, null);
  assert.equal(target.hp, hp);
  assert.equal(player.attack.hit, false);
  const save = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(save);
  const restored = structuredClone(save.snapshot);
  setXenoTrialsPausedV96(restored, false);
  step(match, 40);
  step(restored, 40);
  assert.equal(player.stats.hits, 1);
  assert.ok(target.hp < hp);
  assert.ok(target.y > 0);
  assert.equal(player.superMeterV148, 0);
  assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
});

test('Warrior’s early lane needs low guard and its later arc cannot hit that same target again', () => {
  const damage = [];
  for (const crouch of [false, true]) {
    const { match, player, target } = fight('warrior');
    player.superMeterV148 = 100;
    const hp = target.hp;
    step(match, 90, { super: true }, { guard: true, crouch });
    assert.equal(target.stats.blocks, Number(crouch));
    assert.equal(player.stats.hits, 1);
    damage.push(hp - target.hp);
  }
  assert.ok(damage[0] > damage[1] && damage[1] > 0);
});

test('a V209 starter checkpoint has no retroactive meter and resumes normally in duel and horde', () => {
  for (const horde of [false, true]) {
    const config = ticket({ playerId: 'runner', opponentId: 'warrior',
      ...(horde ? { activityV119: { branch: 'horde', id: 'xth180-incoming-1' } } : {}) });
    const match = createXenoTrialsMatchV96({ ...config, introSeconds: 0, holdRoundTransition: true });
    step(match, 30, {}, null);
    const old = getXenoTrialsSnapshotV96(match);
    // All natural actors with new starter supers were gauge-less on this ticket in V209.
    for (const fighter of old.fighters) delete fighter.superMeterV148;
    const checkpoint = horde ? createXenoTrialsHordeCheckpointV186(old, config) : createXenoTrialsDuelCheckpointV197(old, config);
    assert.ok(checkpoint);
    assert.equal(checkpoint.snapshot.fighters[0].superMeterV148, undefined);
    const restored = horde ? restoreXenoTrialsHordeMatchV180(checkpoint.snapshot) : structuredClone(checkpoint.snapshot);
    assert.ok(restored);
    setXenoTrialsPausedV96(restored, false);
    step(restored);
    assert.equal(restored.fighters[0].superMeterV148, 0);
    assert.equal(restored.fighters[0].stats.supersV148, undefined);
  }
});
