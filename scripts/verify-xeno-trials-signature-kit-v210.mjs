import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsDuelCheckpointV197, isXenoTrialsDuelCheckpointForwardV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsAlternateSignatureV208, XENO_TRIALS_SIGNATURES_V208 } from '../src/xeno-trials-signature-kit-v208.js';
import { XENO_TRIALS_SIGNATURES_V209 } from '../src/xeno-trials-signature-kit-v209.js';
import { XENO_TRIALS_SIGNATURES_V210 } from '../src/xeno-trials-signature-kit-v210.js';

const step = (match, ticks, player = {}, opponent = {}) => {
  for (let tick = 0; tick < ticks; tick++) stepXenoTrialsMatchV96(match, dt, player, opponent);
};
const press = move => ({ ['signature' + move.kind.at(-1)]: true });
const duration = spec => spec.startup + (spec.chargeDuration || 0);
const burstReceipt = match => match.events.filter(event => ['synth-detonation', 'xeno-detonation'].includes(event.type));
const findMove = (id, kind) => getXenoTrialsAlternateSignatureV208(getXenoTrialsFighterV96(id), kind);

function encounter(move, gap, config = {}) {
  const match = createXenoTrialsMatchV96({ playerId: move.fighterId, opponentId: 'warrior', introSeconds: 0, ...config });
  const [fighter, target] = match.fighters;
  fighter.x = 260;
  target.x += getXenoTrialsBodyBoundsV105(fighter).right + gap - getXenoTrialsBodyBoundsV105(target).left;
  return { match, fighter, target };
}

test('V210 provides a native exact alternative for each of the 189 roster identities', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const source = new Map(plan.tables['06_Signatures'].rows.map(row => [row[0], row[1]]));
  const oldMoves = [...XENO_TRIALS_SIGNATURES_V208, ...XENO_TRIALS_SIGNATURES_V209];
  const moves = [...oldMoves, ...XENO_TRIALS_SIGNATURES_V210];
  const oldIds = new Set(oldMoves.map(move => move.fighterId));
  assert.equal(XENO_TRIALS_SIGNATURES_V210.length, 62);
  assert.equal(new Set(XENO_TRIALS_SIGNATURES_V210.map(move => move.fighterId)).size, 52);
  assert.equal(new Set(XENO_TRIALS_SIGNATURES_V210.filter(move => !oldIds.has(move.fighterId)).map(move => move.fighterId)).size, 20);
  assert.equal(new Set(moves.map(move => move.id)).size, 307);
  assert.equal(new Set(moves.map(move => move.fighterId)).size, 189);
  assert.equal(XENO_TRIALS_SIGNATURES_V210.filter(move => move.spec.detonationV210).length, 9);
  for (const move of XENO_TRIALS_SIGNATURES_V210) {
    const profile = getXenoTrialsFighterV96(move.fighterId);
    assert.equal(source.get(move.id), profile.id, move.id);
    assert.equal(move.profileId, profile.profileId, move.id);
    assert.equal(getXenoTrialsAlternateSignatureV208(profile, move.kind), move, move.id);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...profile, profileId: 'substitute' }, move.kind), null, move.id);
    assert.ok(Object.isFrozen(move.spec) && move.label && move.labelEn && move.description && move.descriptionEn, move.id);
  }
});

test('each of the 62 actions spends its cost once, connects in time, and can miss', () => {
  for (const move of XENO_TRIALS_SIGNATURES_V210) {
    for (const gap of [8, 490]) {
      const { match, fighter, target } = encounter(move, gap);
      const { spec } = move;
      const hp = target.hp, carrierHp = fighter.hp, stamina = fighter.stamina;
      step(match, 1, press(move));
      assert.equal(match.events.at(-1)?.signatureIdV208, move.id);
      assert.equal(fighter.stamina, stamina - spec.cost, move.id);
      assert.equal(fighter.stats.specials, 1, move.id);
      step(match, Math.floor(duration(spec) / dt) - 2);
      assert.equal(target.hp, hp, move.id);
      assert.equal(fighter.hp, carrierHp, move.id);
      step(match, Math.ceil((spec.active + .06) / dt));
      assert.equal(target.hp < hp, gap === 8, move.id);
      assert.equal(fighter.stats.hits, Number(gap === 8), move.id);
      assert.equal(fighter.hp, spec.detonationV210 ? 0 : carrierHp, move.id);
      assert.equal(burstReceipt(match).length, Number(Boolean(spec.detonationV210)), move.id);
      assert.equal(match.projectiles.length, 0, move.id);
    }
  }
});

test('sacrificial charge can be denied, while footing and low withdrawals change defensive answers', () => {
  const overload = findMove('synth-detonator', 'signature-3');
  const interrupted = encounter(overload, 8);
  step(interrupted.match, 1, press(overload), { light: true });
  step(interrupted.match, 101);
  assert.ok(interrupted.fighter.hp > 0);
  assert.equal(burstReceipt(interrupted.match).length, 0);
  const disallowed = encounter(overload, 8, { rulesV119: { noSpecial: true } });
  step(disallowed.match, 110, press(overload));
  assert.equal(disallowed.fighter.stats.specials, 0);
  assert.equal(burstReceipt(disallowed.match).length, 0);

  const withdrawal = findMove('cryo-dust-runner', 'signature-3');
  for (const crouch of [false, true]) {
    const { match, fighter, target } = encounter(withdrawal, 8);
    const start = fighter.x;
    step(match, 1, press(withdrawal), { guard: true, crouch });
    step(match, 72, {}, { guard: true, crouch });
    assert.equal(target.stats.blocks, Number(crouch));
    assert.ok(fighter.x < start - 20);
  }
});

test('a sacrificed carrier resolves once even while its horde lane is empty', () => {
  const playerId = 'boiler', move = findMove(playerId, 'signature-3');
  const match = createXenoTrialsMatchV96({ playerId, introSeconds: 0, activityV119: { branch: 'horde', id: 'xth180-incoming-1' } });
  match.fighters.splice(1);
  match.hordeV180.nextSpawnTick = 300;
  step(match, 1, press(move));
  step(match, 120);
  assert.equal(match.fighters[0].hp, 0);
  assert.equal(match.fighters[0].stats.hits, 0);
  assert.equal(burstReceipt(match).length, 1);
  assert.equal(match.result.reason, 'horde-ko');
});

test('live charge resumes deterministically in duel and horde and rejects false detonation receipts', () => {
  const playerId = 'boiler', move = findMove(playerId, 'signature-3');
  for (const horde of [false, true]) {
    const progress = createXenoTrialsProgressV96();
    if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
    const ticket = beginXenoTrialsV96(progress, { playerId, opponentId: 'warrior',
      activityV119: horde ? { branch: 'horde', id: 'xth180-incoming-1' } : undefined });
    assert.equal(ticket.applied, true);
    const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const admit = horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197;
    step(match, Math.ceil((move.spec.startup + .08) / dt), press(move), null);
    const checkpoint = admit(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(checkpoint);
    const forged = structuredClone(checkpoint.snapshot);
    forged.fighters[0].attack.hit = true;
    if (horde) forged.fighters[0].attack.detonationEmittedV180 = true;
    assert.equal(admit(forged, ticket.config), null);
    const restored = horde ? restoreXenoTrialsHordeMatchV180(checkpoint.snapshot) : structuredClone(checkpoint.snapshot);
    assert.ok(restored);
    for (const state of [match, restored]) {
      setXenoTrialsPausedV96(state, false);
      step(state, 70, {}, null);
      assert.equal(state.fighters[0].hp, 0);
      assert.equal(burstReceipt(state).length, 1);
    }
    const resolved = getXenoTrialsSnapshotV96(match);
    assert.deepEqual(getXenoTrialsSnapshotV96(restored), resolved);
    if (!horde) {
      const roundOver = admit(resolved, ticket.config);
      assert.ok(roundOver);
      assert.ok(isXenoTrialsDuelCheckpointForwardV197(checkpoint, roundOver));
      burstReceipt(resolved)[0].signatureIdV208 = 'acid-boiler::sig3';
      assert.equal(admit(resolved, ticket.config), null);
    }
  }
});
