import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, stepXenoTrialsMatchV96, setXenoTrialsPausedV96,
  restoreXenoTrialsHordeMatchV180, XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { XENO_TRIALS_HORDE_LIMITS_V180 } from '../src/xeno-trials-horde-v180.js';
import { XENO_TRIALS_RIPOSTES_V208, XENO_TRIALS_RIPOSTE_KIND_V208 as riposteKind,
  getXenoTrialsRiposteV208, getXenoTrialsRiposteReadinessV208 } from '../src/xeno-trials-ripostes-v208.js';
import { getXenoTrialsSuperV148 } from '../src/xeno-trials-supers-v148.js';

const warden = 'import-game-afe2-warden';
const brute = 'drive-v123-fte-pathogen-brute-profile-v13';
const queen = 'drive-v123-fte-pathogen-queen-right-v13';
const chord = { guard: true, super: true };

function advance(match, ticks = 1, player = {}, opponent = {}) {
  for (let i = 0; i < ticks; i++) stepXenoTrialsMatchV96(match, dt, player, opponent);
}

function approach(player, target, gap = 12) {
  player.facing = 1;
  target.facing = -1;
  target.x += bounds(player).right + gap - bounds(target).left;
}

function duel(playerId = warden, config = {}) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId: 'runner', introSeconds: 0, ...config });
  const [player, target] = match.fighters;
  approach(player, target);
  // Explicit test fixture for the normal full-meter precondition. The horde
  // checkpoint case below earns all meter through actual attacks.
  if (getXenoTrialsSuperV148(getXenoTrialsFighterV96(player.id))) player.superMeterV148 = 100;
  return { match, player, target };
}

function landParry(match, player, target, attack = 'light', heldSuper = false) {
  const spec = getXenoTrialsAttackV147(getXenoTrialsFighterV96(target.id), attack, XENO_TRIALS_ATTACKS_V96[attack]);
  const held = heldSuper ? chord : {};
  advance(match, 1, held, { [attack]: true });
  assert.equal(target.attack?.kind, attack);
  advance(match, Math.floor(spec.startup * 120) - 3, held);
  const hp = player.hp;
  for (let tick = 0; tick < 8 && !player.parryV208?.openingId; tick++) advance(match, 1, { ...held, parry: true });
  assert.equal(player.hp, hp);
  assert.ok(player.parryV208?.openingId, 'physical contact is needed to reserve an opening');
  const receipt = match.events.find(event => event.id === player.parryV208.openingId);
  assert.equal(receipt.type, 'parry-v208');
  assert.equal(receipt.attackIdV208, target.attack.id);
  if (match.hordeV180) assert.equal(receipt.attackerInstanceV180, target.instanceIdV180);
  return receipt;
}

test('four Bible super2 rows bind distinct original attacks to actual native contact', () => {
  const bible = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url), 'utf8'));
  const rows = new Map(bible.tables['07_Supers'].rows.map(row => [row[0], row]));
  assert.equal(XENO_TRIALS_RIPOSTES_V208.length, 4);
  assert.equal(new Set(XENO_TRIALS_RIPOSTES_V208.map(move => JSON.stringify(move.spec))).size, 4);
  for (const move of XENO_TRIALS_RIPOSTES_V208) {
    assert.equal(rows.get(move.id)?.[1], move.fighterId);
    const { match, player, target } = duel(move.fighterId);
    advance(match, 1, chord);
    assert.equal(player.attack, null);
    assert.equal(player.superMeterV148, 100);
    advance(match, 1);
    const receipt = landParry(match, player, target);
    assert.equal(getXenoTrialsRiposteReadinessV208(match, player, getXenoTrialsFighterV96(player.id)).ready, true);
    const stamina = player.stamina;
    advance(match, 1, chord);
    assert.equal(player.attack?.kind, riposteKind, move.id);
    assert.equal(player.attack.riposteV208.parryId, receipt.id);
    assert.equal(player.parryV208.openingId, 0);
    assert.equal(player.superMeterV148, 0);
    assert.ok(Math.abs(player.stamina - (stamina - move.spec.cost - 5 * dt)) < 1e-8);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.stats.hits, 0, 'startup causes no contact');
    const hp = target.hp;
    advance(match, 180, chord);
    assert.ok(target.hp < hp, move.id);
    assert.equal(player.stats.hits, 1);
    assert.equal(player.stats.supersV148, 1);
    assert.equal(player.superMeterV148, 0, 'the super does not refund meter on contact');
    assert.equal(match.projectiles.length, 0);
  }
  assert.equal(getXenoTrialsRiposteV208(getXenoTrialsFighterV96('import-game-afe2-exploder'))?.id, 'import-game-afe2-exploder::super2');
  assert.equal(getXenoTrialsRiposteV208({ ...getXenoTrialsFighterV96(warden), profileId: 'copied-profile' }), null);
});

test('misses pay the cost, ordinary I stays super1, and old held chords cannot consume the new window', () => {
  const { match, player, target } = duel();
  landParry(match, player, target, 'light', true);
  advance(match, 3, chord);
  assert.equal(player.attack, null);
  assert.equal(player.superMeterV148, 100);
  advance(match, 1, { guard: true });
  advance(match, 1, chord);
  assert.equal(player.attack?.kind, riposteKind);
  target.x += 250; // Deterministic pre-contact spacing fixture.
  advance(match, 180);
  assert.equal(player.stats.hits, 0);
  assert.equal(player.stats.supersV148, 1);
  assert.equal(player.superMeterV148, 0);

  const normal = duel();
  advance(normal.match, 1, { super: true });
  assert.equal(normal.player.attack?.kind, 'super');
  const forbidden = duel(warden, { rulesV119: { noSpecial: true } });
  landParry(forbidden.match, forbidden.player, forbidden.target);
  advance(forbidden.match, 1, chord);
  assert.equal(forbidden.player.attack, null);
  assert.equal(forbidden.player.superMeterV148, 100);
});

test('the parry opening expires and a held super input through pause has to be released', () => {
  const expired = duel();
  landParry(expired.match, expired.player, expired.target);
  advance(expired.match, 43);
  advance(expired.match, 1, chord);
  assert.equal(expired.player.attack, null);
  assert.equal(expired.player.superMeterV148, 100);

  const paused = duel();
  landParry(paused.match, paused.player, paused.target, 'light', true);
  const start = paused.match.tick;
  setXenoTrialsPausedV96(paused.match, true);
  advance(paused.match, 60, chord);
  assert.equal(paused.match.tick, start);
  setXenoTrialsPausedV96(paused.match, false);
  advance(paused.match, 1, chord);
  assert.equal(paused.player.attack, null);
  advance(paused.match);
  advance(paused.match, 1, chord);
  assert.equal(paused.player.attack?.kind, riposteKind);
});

test('a native duel checkpoint resumes the accepted riposte and rejects changed proof', () => {
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(queen);
  const ticket = beginXenoTrialsV96(progress, { playerId: queen, opponentId: 'runner' });
  assert.equal(ticket.applied, true);
  const { match, player, target } = duel(queen, { ...ticket.config, holdRoundTransition: true });
  landParry(match, player, target);
  advance(match, 1, chord, null); // Return to the ticket’s native CPU source.
  const snapshot = getXenoTrialsSnapshotV96(match);
  const checkpoint = createXenoTrialsDuelCheckpointV197(snapshot, ticket.config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  advance(match, 125, {}, null);
  advance(resumed, 125, {}, null);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  assert.equal(resumed.fighters[0].stats.supersV148, 1);
  for (const mutate of [
    candidate => { candidate.fighters[0].attack.riposteV208.attackId++; },
    candidate => { candidate.fighters[0].attack.riposteV208.target = 'player'; },
    candidate => { candidate.fighters[0].attack.riposteV208.tick--; },
    candidate => { candidate.fighters[0].attack.riposteV208 = null; },
    candidate => { candidate.events.at(-1).riposteIdV208 = 'false-riposte'; },
    candidate => { candidate.events[0] = null; }
  ]) {
    const changed = structuredClone(snapshot);
    mutate(changed);
    assert.equal(createXenoTrialsDuelCheckpointV197(changed, ticket.config), null);
  }
});

function chargedHorde(playerId = brute, requiredEnemies = 2) {
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(playerId);
  const ticket = beginXenoTrialsV96(progress, { playerId, activityV119: { branch: 'horde', id: 'xth180-incoming-5' } });
  assert.equal(ticket.applied, true);
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
  const player = match.fighters[0];
  for (let tick = 0; tick < 120 * 55 && !match.result; tick++) {
    const enemies = match.fighters.slice(1);
    const ready = enemies.filter(foe => foe.spawnTickV180 + XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks <= match.tick);
    if (player.superMeterV148 === 100 && ready.length >= requiredEnemies && !player.attack && player.stamina >= 65) break;
    const nearest = enemies.sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
    const clearWave = match.hordeV180.alive < requiredEnemies && match.hordeV180.remaining === 0;
    if (player.superMeterV148 === 100 && !clearWave) { advance(match); continue; }
    advance(match, 1, { left: nearest?.x < player.x, right: nearest?.x > player.x, heavy: match.tick % 180 === 0 });
  }
  assert.equal(player.superMeterV148, 100, 'earn each point from native damage');
  return { ticket, match, player };
}

test('horde riposte targets one real attacker and a checkpoint retains the spent gauge', () => {
  const { ticket, match, player } = chargedHorde();
  player.x = 500;
  for (const foe of match.fighters.slice(1)) { foe.x = 1500; foe.facing = -1; }
  const [target, other] = match.fighters.slice(1).filter(foe => foe.spawnTickV180 + XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks <= match.tick);
  assert.ok(target && other);
  approach(player, target);
  const receipt = landParry(match, player, target, 'heavy');
  advance(match, 1, chord);
  assert.equal(player.attack?.kind, riposteKind);
  assert.equal(player.attack.riposteV208.target, receipt.attackerInstanceV180);
  const save = createXenoTrialsHordeCheckpointV186(getXenoTrialsSnapshotV96(match), ticket.config);
  assert.ok(save);
  const resumed = restoreXenoTrialsHordeMatchV180(structuredClone(save.snapshot));
  assert.ok(resumed);
  setXenoTrialsPausedV96(resumed, false);
  assert.equal(resumed.fighters[0].superMeterV148, 0);
  const hits = player.stats.hits;
  const hp = other.hp;
  for (let i = 0; i < 130 && !match.result; i++) {
    if (i === 8) {
      approach(player, other, 25);
      approach(resumed.fighters[0], resumed.fighters.find(foe => foe.instanceIdV180 === other.instanceIdV180), 25);
    }
    advance(match); advance(resumed);
  }
  assert.equal(player.stats.hits, hits + 1);
  assert.equal(other.hp, hp);
  assert.equal(player.stats.supersV148, 1);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('a second horde attacker interrupts a paid riposte windup with no late damage', () => {
  const { match, player } = chargedHorde(queen, 3);
  player.x = 650;
  for (const foe of match.fighters.slice(1)) { foe.x = 1450; foe.facing = -1; }
  const [target, blocker, interrupter] = match.fighters.slice(1)
    .filter(foe => foe.spawnTickV180 + XENO_TRIALS_HORDE_LIMITS_V180.spawnGraceTicks <= match.tick);
  assert.ok(target && blocker && interrupter);
  // Leave one free engagement slot after the initial contact. These actors
  // are exhausted in the fixture, while the actual attacks still run natively.
  for (const foe of match.fighters.slice(1)) if (foe !== target && foe !== interrupter) foe.stamina = 0;
  interrupter.x = -700;
  approach(player, target);
  landParry(match, player, target, 'heavy');
  assert.equal(interrupter.attack, null);
  advance(match, 16);
  interrupter.facing = 1;
  interrupter.x += bounds(player).left - 12 - bounds(interrupter).right;
  const attackerHp = target.hp;
  const playerHp = player.hp;
  advance(match, 1, chord, { light: true });
  assert.equal(player.attack?.kind, riposteKind);
  assert.equal(interrupter.attack?.kind, 'light');
  advance(match, 22);
  assert.ok(player.hp < playerHp);
  assert.equal(player.attack, null);
  assert.equal(target.hp, attackerHp);
  assert.equal(player.stats.supersV148, 1);
  assert.ok(player.superMeterV148 < 100, 'a received hit contributes only its usual contact meter');
  advance(match, 150);
  assert.equal(target.hp, attackerHp);
});
