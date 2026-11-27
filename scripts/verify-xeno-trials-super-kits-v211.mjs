import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, stepXenoTrialsMatchV96,
  restoreXenoTrialsHordeMatchV180, setXenoTrialsPausedV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsSuperV148 } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsRiposteV208, getXenoTrialsRiposteReadinessV208 } from '../src/xeno-trials-ripostes-v208.js';
import { XENO_TRIALS_SUPER_KITS_V211 } from '../src/xeno-trials-super-kits-v209.js';
import { XENO_TRIALS_EXPLODER_COUNTER_V211 } from '../src/xeno-trials-super-kits-v211.js';
import { getXenoTrialsAttackStyleV147, getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { stepXenoTrialsBrainV119 } from '../src/xeno-trials-ai-v119.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';

const guardSuper = Object.freeze({ guard: true, super: true });
const exploder = 'import-game-afe2-exploder';

function ticks(match, count = 1, player = {}, opponent = {}) {
  for (let n = 0; n < count; n++) stepXenoTrialsMatchV96(match, dt, player, opponent);
}

function proximity(player, opponent, gap = 8) {
  player.facing = 1; opponent.facing = -1;
  opponent.x += body(player).right + gap - body(opponent).left;
}

function duel(id, config = {}) {
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'queen', introSeconds: 0, holdRoundTransition: true, ...config });
  const [player, opponent] = match.fighters;
  proximity(player, opponent);
  return { match, player, opponent };
}

test('every one of the 378 Bible slots is bound to its exact historic fighter and profile', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url), 'utf8'));
  const ids = new Set(plan.tables['02_Roster'].rows.map(row => row[0]));
  const basis = XENO_TRIALS_FIGHTERS_V96.filter(fighter => ids.has(fighter.id));
  const actual = new Set(basis.flatMap(fighter => [
    getXenoTrialsSuperV148(fighter) && `${fighter.id}::super1`,
    getXenoTrialsRiposteV208(fighter) && `${fighter.id}::super2`,
  ]));
  assert.equal(ids.size, 189);
  assert.equal(basis.length, ids.size);
  assert.deepEqual(actual, new Set(plan.tables['07_Supers'].rows.map(row => row[0])));
  assert.equal(XENO_TRIALS_SUPER_KITS_V211.length, 144);
  const added = [...XENO_TRIALS_SUPER_KITS_V211.flatMap(kit => [kit.first, kit.counter]), XENO_TRIALS_EXPLODER_COUNTER_V211];
  assert.equal(new Set(added.map(move => move.id)).size, 289);
  for (const move of added) {
    const fighter = getXenoTrialsFighterV96(move.fighterId);
    assert.equal(move.profileId, fighter.profileId, move.id);
    assert.ok(move.labelEn && move.descriptionEn && Object.isFrozen(move.spec));
    assert.equal(move.canonExact, false);
    assert.equal(move.meterCost, 100);
    assert.equal(move.spec.superV148, true);
    assert.equal(move.spec.projectileSpeed, undefined);
    assert.equal(move.spec.liftV208, undefined);
    assert.equal(move.spec.unblockableV151, undefined);
    for (const mismatch of [{ ...fighter, profileId: 'copied-profile' }, { ...fighter, id: 'duplicate-identity' }]) {
      assert.equal(getXenoTrialsSuperV148(mismatch), null);
      assert.equal(getXenoTrialsRiposteV208(mismatch), null);
    }
  }
  const titan = getXenoTrialsFighterV96('import-xeno-titan-queen-nolegs');
  assert.equal(getXenoTrialsSuperV148(titan).spec.approachV208, undefined);
  assert.equal(getXenoTrialsRiposteV208(titan).spec.retreatV208, undefined);
});

test('all 144 added Super I actions debit once, resolve real contact and stay grounded', () => {
  for (const { first: move } of XENO_TRIALS_SUPER_KITS_V211) {
    const { match, player, opponent } = duel(move.fighterId);
    const hp = opponent.hp;
    assert.equal(player.superMeterV148, 0);
    ticks(match, 1, { super: true });
    assert.equal(player.attack, null);
    ticks(match);
    player.superMeterV148 = 100; // Isolate the full-meter boundary with native contacts and cadence.
    ticks(match, 1, { super: true });
    assert.equal(player.attack?.kind, 'super', move.id);
    assert.equal(player.stamina, 100 - move.spec.cost);
    assert.equal(player.superMeterV148, 0);
    assert.equal(opponent.hp, hp);
    assert.equal(match.events.find(event => event.kind === 'super')?.superIdV148, move.id);
    assert.equal(getXenoTrialsAttackStyleV147(getXenoTrialsFighterV96(player.id), 'super'), 'physical');
    for (let n = 0; n < 225; n++) {
      ticks(match, 1, { super: true });
      assert.equal(match.projectiles.length, 0, move.id);
      assert.equal(player.y, 0, move.id);
    }
    assert.ok(opponent.hp < hp, move.id);
    assert.equal(player.stats.hits, 1, move.id);
    assert.equal(player.stats.supersV148, 1, move.id);
    assert.equal(player.superMeterV148, 0);
  }
});

function parry(match, player, opponent) {
  const heavy = getXenoTrialsAttackV147(getXenoTrialsFighterV96(opponent.id), 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  ticks(match, 1, {}, { heavy: true });
  ticks(match, Math.floor(heavy.startup * 120) - 3);
  for (let n = 0; n < 8 && !player.parryV208?.openingId; n++) ticks(match, 1, { parry: true });
  const expected = getXenoTrialsRiposteV208(getXenoTrialsFighterV96(player.id));
  assert.equal(getXenoTrialsRiposteReadinessV208(match, player, getXenoTrialsFighterV96(player.id)).ready, true, expected.id);
}

test('145 added Super II actions require a real matching parry; Exploder retains the sacrificial I', () => {
  const supers = [...XENO_TRIALS_SUPER_KITS_V211.map(kit => kit.counter), XENO_TRIALS_EXPLODER_COUNTER_V211];
  for (const move of supers) {
    const { match, player, opponent } = duel(move.fighterId);
    player.superMeterV148 = 100;
    ticks(match, 1, guardSuper);
    assert.equal(player.attack, null);
    ticks(match);
    parry(match, player, opponent);
    ticks(match, 1, guardSuper);
    assert.equal(player.attack?.kind, 'super-riposte', move.id);
    assert.equal(player.parryV208.openingId, 0);
    const hp = opponent.hp;
    const playerHp = player.hp;
    assert.equal(player.superMeterV148, 0);
    assert.equal(match.events.find(event => event.kind === 'super-riposte')?.riposteIdV208, move.id);
    ticks(match, 225, guardSuper);
    assert.ok(opponent.hp < hp, move.id);
    assert.equal(player.stats.hits, 1);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.superMeterV148, 0);
    assert.equal(player.hp, playerHp);
    assert.equal(match.events.some(event => event.type === 'xeno-detonation'), false);
  }
  const normal = duel(exploder);
  normal.player.superMeterV148 = 100;
  ticks(normal.match, 1, { super: true });
  assert.equal(getXenoTrialsSuperV148(getXenoTrialsFighterV96(exploder)).id, 'exploder-terminal-burst');
  assert.equal(getXenoTrialsAttackStyleV147(getXenoTrialsFighterV96(exploder), 'super'), 'detonation');
  ticks(normal.match, 160);
  assert.equal(normal.player.hp, 0);
  assert.ok(normal.match.events.some(event => event.type === 'xeno-detonation'));
});

test('new CPU supers stay reserved for difficult fights and manual controls still obey the rules', () => {
  for (const [id, difficulty, rules, expected] of [
    ['albino-joe', 'easy', {}, false], ['albino-joe', 'normal', {}, false], ['albino-joe', 'hard', {}, true],
    ['albino-joe', 'hard', { noSpecial: true }, false], ['grid', 'normal', {}, true],
  ]) {
    const { match, opponent } = duel('warrior', { opponentId: id, difficulty, rulesV119: rules });
    opponent.superMeterV148 = 100;
    const choice = stepXenoTrialsBrainV119(match, dt, XENO_TRIALS_ATTACKS_V96, () => .5);
    assert.equal(choice.super, expected, [id, difficulty, rules.noSpecial]);
    assert.equal(opponent.superMeterV148, 100);
  }
  for (const noSpecial of [false, true]) {
    const { match, player } = duel('albino-joe', { difficulty: 'easy', rulesV119: { noSpecial } });
    player.superMeterV148 = 100;
    ticks(match, 1, { super: true });
    assert.equal(player.attack?.kind === 'super', !noSpecial);
    assert.equal(player.superMeterV148, noSpecial ? 100 : 0);
  }
});

test('a newly admitted old checkpoint starts earning after reload then stores a real riposte without replay', () => {
  const id = 'import-xeno-titan-queen-nolegs';
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(id, 'queen');
  const started = beginXenoTrialsV96(progress, { playerId: id, opponentId: 'queen' });
  assert.ok(started.applied);
  const { match, player, opponent } = duel(id, started.config);
  ticks(match, 1, { light: true });
  ticks(match, 86, {}, null);
  assert.ok(player.stats.damage > 0);
  const old = getXenoTrialsSnapshotV96(match);
  delete old.fighters[0].superMeterV148;
  const legacy = createXenoTrialsDuelCheckpointV197(old, started.config);
  assert.ok(legacy);
  assert.equal(legacy.snapshot.fighters[0].superMeterV148, undefined);
  const resumed = structuredClone(legacy.snapshot);
  const [newPlayer, newOpponent] = resumed.fighters;
  setXenoTrialsPausedV96(resumed, false);
  ticks(resumed);
  assert.equal(newPlayer.superMeterV148, 0);
  assert.equal(newPlayer.stats.damage, player.stats.damage);
  assert.equal(opponent.id, newOpponent.id);
  proximity(newPlayer, newOpponent);
  ticks(resumed, 115);
  newPlayer.superMeterV148 = 100;
  parry(resumed, newPlayer, newOpponent);
  ticks(resumed, 1, guardSuper, null);
  const saved = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(resumed), started.config);
  assert.ok(saved);
  const reloaded = structuredClone(saved.snapshot);
  setXenoTrialsPausedV96(reloaded, false);
  ticks(resumed, 110);
  ticks(reloaded, 110);
  assert.equal(reloaded.fighters[0].stats.supersV148, 1);
  assert.deepEqual(getXenoTrialsSnapshotV96(reloaded), getXenoTrialsSnapshotV96(resumed));
});

test('an earned V211 super retains its native damage, spent meter and target limit in a resumed horde', () => {
  const id = 'albino-joe';
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(id);
  const started = beginXenoTrialsV96(progress, { playerId: id, activityV119: { branch: 'horde', id: 'xth180-incoming-5' } });
  assert.ok(started.applied);
  const match = createXenoTrialsMatchV96({ ...started.config, introSeconds: 0, holdRoundTransition: true });
  const player = match.fighters[0];
  const move = getXenoTrialsSuperV148(getXenoTrialsFighterV96(id));
  for (let n = 0; n < 7200 && !match.result; n++) {
    const foes = match.fighters.slice(1);
    if (player.superMeterV148 === 100 && !player.attack && player.stamina > move.spec.cost && foes.length >= 2) break;
    const target = foes.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    const clearWave = match.hordeV180.alive < 2 && match.hordeV180.remaining === 0;
    const heavy = (player.superMeterV148 < 100 || clearWave) && match.tick % 180 === 0;
    ticks(match, 1, { left: target?.x < player.x, right: target?.x > player.x, heavy });
  }
  assert.equal(player.superMeterV148, 100);
  assert.ok(player.stats.damage >= 167);
  assert.ok(match.fighters.length >= 3);
  player.x = 500;
  for (const [index, enemy] of match.fighters.slice(1).entries()) proximity(player, enemy, 8 + index * 10);
  const initialHits = player.stats.hits;
  ticks(match, 1, { super: true });
  assert.equal(player.attack?.kind, 'super');
  const save = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), started.config);
  assert.ok(save);
  assert.equal(save.snapshot.fighters[0].superMeterV148, 0);
  const resumed = restoreXenoTrialsHordeMatchV180(save.snapshot);
  assert.ok(resumed);
  setXenoTrialsPausedV96(resumed, false);
  ticks(match, 180);
  ticks(resumed, 180);
  assert.ok(player.stats.hits > initialHits && player.stats.hits <= initialHits + move.spec.hordeTargetsV209);
  assert.equal(resumed.fighters[0].stats.supersV148, 1);
  assert.equal(resumed.fighters[0].superMeterV148, 0);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});
