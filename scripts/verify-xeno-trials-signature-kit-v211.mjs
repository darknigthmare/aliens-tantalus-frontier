import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, restoreXenoTrialsHordeMatchV180,
  setXenoTrialsPausedV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsHordeCheckpointV186 } from '../src/xeno-trials-horde-checkpoint-v186.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsAlternateSignatureV208, XENO_TRIALS_SIGNATURES_V208 } from '../src/xeno-trials-signature-kit-v208.js';
import { XENO_TRIALS_SIGNATURES_V209 } from '../src/xeno-trials-signature-kit-v209.js';
import { XENO_TRIALS_SIGNATURES_V210 } from '../src/xeno-trials-signature-kit-v210.js';
import { XENO_TRIALS_SIGNATURES_V211 } from '../src/xeno-trials-signature-kit-v211.js';

const step = (match, ticks, player = {}, opponent = {}) => {
  for (let tick = 0; tick < ticks; tick++) stepXenoTrialsMatchV96(match, dt, player, opponent);
};
const press = move => ({ ['signature' + move.kind.at(-1)]: true });
const moveFor = (id, kind = 'signature-2') => getXenoTrialsAlternateSignatureV208(getXenoTrialsFighterV96(id), kind);

function encounter(move, gap, config = {}) {
  const match = createXenoTrialsMatchV96({ playerId: move.fighterId, opponentId: 'warrior', introSeconds: 0, ...config });
  const [fighter, target] = match.fighters;
  fighter.x = 170;
  target.x += body(fighter).right + gap - body(target).left;
  return { match, fighter, target };
}

test('V211 implements the 71 outstanding alternate rows and preserves the 307 exact inherited commands', () => {
  const bible = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const planned = new Map(bible.tables['06_Signatures'].rows.filter(row => /::sig[23]$/.test(row[0])).map(row => [row[0], row[1]]));
  const previous = [...XENO_TRIALS_SIGNATURES_V208, ...XENO_TRIALS_SIGNATURES_V209, ...XENO_TRIALS_SIGNATURES_V210];
  const current = XENO_TRIALS_SIGNATURES_V211;
  const registered = new Map([...previous, ...current].map(move => [move.id, move.fighterId]));
  assert.equal(previous.length, 307);
  assert.equal(current.length, 71);
  assert.equal(current.filter(move => move.kind === 'signature-2').length, 10);
  assert.equal(registered.size, previous.length + current.length);
  assert.deepEqual(registered, planned);
  assert.equal(new Set(current.map(move => JSON.stringify(move.spec))).size, current.length);
  for (const move of [...previous, ...current]) {
    const profile = getXenoTrialsFighterV96(move.fighterId);
    assert.equal(getXenoTrialsAlternateSignatureV208(profile, move.kind), move, move.id);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...profile, profileId: 'substituted' }, move.kind), null, move.id);
  }
  assert.deepEqual(current.filter(move => move.spec.projectileStyleV211).map(move => move.fighterId),
    ['spitter', 'import-game-afe2-warden', 'drive-v123-afe-spitter', 'drive-v123-fte-pathogen-brute-profile-v13']);
  assert.ok(current.every(move => move.canonExact === false && move.labelEn && move.descriptionEn && Object.isFrozen(move.spec)));
});

test('each new H/O action spends its cost once, lands at close range, and misses beyond travel', () => {
  for (const move of XENO_TRIALS_SIGNATURES_V211) {
    for (const gap of [8, 520]) {
      const { match, fighter, target } = encounter(move, gap);
      const { spec } = move;
      const hp = target.hp, stamina = fighter.stamina;
      step(match, 1, press(move));
      assert.equal(match.events.at(-1)?.signatureIdV208, move.id);
      assert.equal(fighter.stamina, stamina - spec.cost, move.id);
      step(match, Math.floor(spec.startup / dt) - 2);
      assert.equal(target.hp, hp, move.id);
      assert.equal(match.projectiles.length, 0, move.id);
      step(match, Math.ceil((spec.active + spec.recovery + .1) / dt), press(move));
      assert.equal(fighter.stats.specials, 1, move.id);
      assert.equal(fighter.stats.hits, Number(gap === 8), move.id);
      assert.equal(target.hp < hp, gap === 8, move.id);
      assert.equal(match.projectiles.length, 0, move.id);
    }
  }
});

test('the Panther withdraws behind low contact and the Brute sends two finite waves that can be jumped', () => {
  const panther = moveFor('drive-v123-neca-panther-kenner-tribute-v14', 'signature-3');
  for (const crouch of [false, true]) {
    const { match, fighter, target } = encounter(panther, 8);
    const start = fighter.x;
    step(match, 1, press(panther), { guard: true, crouch });
    step(match, 80, {}, { guard: true, crouch });
    assert.equal(target.stats.blocks, Number(crouch));
    assert.ok(fighter.x < start - 20);
    assert.equal(match.projectiles.length, 0);
  }
  const brute = moveFor('drive-v123-fte-pathogen-brute-profile-v13', 'signature-3');
  const { match, target, fighter } = encounter(brute, 82);
  step(match, 1, press(brute));
  step(match, 23);
  step(match, 1, {}, { jump: true });
  step(match, 16);
  assert.deepEqual(match.projectiles.map(shot => shot.direction).sort(), [-1, 1]);
  assert.ok(match.projectiles.every(shot => shot.style === 'ground-wave' && shot.signatureIdV147 === brute.id));
  step(match, 90);
  assert.equal(fighter.stats.hits, 0);
  assert.equal(target.hp, getXenoTrialsFighterV96('warrior').hp);
});

test('projectile origin and specs survive duel and horde save/reload, without aliasing other editions', () => {
  const playerId = 'drive-v123-afe-spitter', move = moveFor(playerId);
  for (const horde of [false, true]) {
    const progress = createXenoTrialsProgressV96();
    if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
    const ticket = beginXenoTrialsV96(progress, { playerId, opponentId: 'warrior',
      activityV119: horde ? { branch: 'horde', id: 'xth180-incoming-1' } : undefined });
    assert.equal(ticket.applied, true);
    const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    const save = horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197;
    step(match, 1, press(move), null);
    step(match, Math.ceil(move.spec.startup / dt), {}, null);
    assert.equal(match.projectiles.length, 1);
    assert.equal(match.projectiles[0].signatureIdV147, move.id);
    assert.equal(match.fighters[0].attack?.emitted, true);
    const checkpoint = save(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(checkpoint);
    const invalidSource = structuredClone(checkpoint.snapshot);
    invalidSource.projectiles[0].signatureIdV147 = 'spitter::sig2';
    assert.equal(save(invalidSource, ticket.config), null);
    const invalidPower = structuredClone(checkpoint.snapshot);
    invalidPower.projectiles[0].spec.damage++;
    assert.equal(save(invalidPower, ticket.config), null);
    const invalidEmission = structuredClone(checkpoint.snapshot);
    invalidEmission.fighters[0].attack.emitted = false;
    assert.equal(save(invalidEmission, ticket.config), null);
    const missingReceipt = structuredClone(checkpoint.snapshot);
    missingReceipt.events = missingReceipt.events.filter(event => event.signatureIdV208 !== move.id);
    assert.equal(save(missingReceipt, ticket.config), null);
    missingReceipt.fighters[0].stats.specials = 0;
    missingReceipt.fighters[0].attack = null;
    assert.equal(save(missingReceipt, ticket.config), null);
    assert.equal(save({ ...checkpoint.snapshot, events: null }, ticket.config), null);
    const duplicate = structuredClone(checkpoint.snapshot);
    duplicate.projectiles.push({ ...duplicate.projectiles[0], id: ++duplicate.serial });
    assert.equal(save(duplicate, ticket.config), null);

    step(match, 11, {}, null);
    assert.equal(match.projectiles.length, 1);
    const aged = save(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(aged);
    assert.ok(aged.snapshot.projectiles[0].life < checkpoint.snapshot.projectiles[0].life);
    // Fixture for the bounded receipt window when other events have replaced the launch entry.
    const evicted = structuredClone(aged.snapshot);
    evicted.events = Array.from({ length: 32 }, () => ({
      id: ++evicted.serial, tick: evicted.tick, type: 'attack', side: 'opponent', kind: 'light',
    }));
    assert.ok(save(evicted, ticket.config));
    const restored = horde ? restoreXenoTrialsHordeMatchV180(aged.snapshot) : structuredClone(aged.snapshot);
    assert.ok(restored);
    for (const state of [match, restored]) {
      setXenoTrialsPausedV96(state, false);
      step(state, 100, {}, null);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
  }
});
