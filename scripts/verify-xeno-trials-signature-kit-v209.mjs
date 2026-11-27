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

const step = (match, ticks, player = {}, opponent = {}) => {
  for (let tick = 0; tick < ticks; tick++) stepXenoTrialsMatchV96(match, dt, player, opponent);
};
const controlFor = move => ({ ['signature' + move.kind.at(-1)]: true });

function encounter(move, gap, config = {}) {
  const match = createXenoTrialsMatchV96({ playerId: move.fighterId, opponentId: 'warrior', introSeconds: 0, ...config });
  const [fighter, target] = match.fighters;
  fighter.x = 260;
  target.x += body(fighter).right + gap - body(target).left;
  return { match, fighter, target };
}

test('V209 adds 175 exact Bible rows while preserving all 70 inherited signatures', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const source = new Map(plan.tables['06_Signatures'].rows.map(row => [row[0], row[1]]));
  const combined = [...XENO_TRIALS_SIGNATURES_V208, ...XENO_TRIALS_SIGNATURES_V209];
  assert.equal(XENO_TRIALS_SIGNATURES_V209.length, 175);
  assert.equal(new Set(XENO_TRIALS_SIGNATURES_V209.map(move => move.fighterId)).size, 154);
  assert.equal(new Set(combined.map(move => move.fighterId)).size, 169);
  assert.equal(new Set(combined.map(move => move.id)).size, combined.length);
  assert.equal(new Set(XENO_TRIALS_SIGNATURES_V209.map(move => JSON.stringify(move.spec))).size, 62);
  for (const move of combined) {
    const profile = getXenoTrialsFighterV96(move.fighterId);
    assert.equal(source.get(move.id), profile.id);
    assert.equal(profile.profileId, move.profileId);
    assert.equal(getXenoTrialsAlternateSignatureV208(profile, move.kind), move);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...profile, profileId: 'altered-fixture' }, move.kind), null);
    assert.equal(getXenoTrialsAlternateSignatureV208({ ...profile, id: 'another-model' }, move.kind), null);
    assert.ok(Object.isFrozen(move.spec) && move.label && move.labelEn && move.description && move.descriptionEn);
  }
});

test('all 175 techniques spend endurance once and contact during the native active window', () => {
  for (const move of XENO_TRIALS_SIGNATURES_V209) {
    const { match, fighter, target } = encounter(move, 8);
    const { cost, startup, active, recovery } = move.spec;
    const initialHp = target.hp, endurance = fighter.stamina;
    step(match, 1, controlFor(move));
    assert.equal(fighter.attack?.kind, move.kind, move.id);
    assert.equal(match.events.at(-1)?.signatureIdV208, move.id);
    assert.equal(fighter.stamina, endurance - cost, move.id);
    assert.equal(fighter.stats.specials, 1, move.id);
    while (fighter.attack.age + dt < startup) step(match, 1);
    assert.equal(fighter.stats.hits, 0, move.id);
    assert.equal(target.hp, initialHp, move.id);
    step(match, Math.ceil((active + .025) / dt));
    assert.equal(fighter.stats.hits, 1, move.id);
    assert.ok(target.hp < initialHp, move.id);
    step(match, Math.ceil((recovery + .04) / dt), controlFor(move));
    assert.equal(fighter.stats.hits, 1, move.id);
    assert.equal(match.projectiles.length, 0, move.id);
  }
});

test('all 175 techniques whiff beyond their maximum movement and contact reach', () => {
  for (const move of XENO_TRIALS_SIGNATURES_V209) {
    const { match, fighter, target } = encounter(move, 420);
    const initialHp = target.hp;
    const { startup, active, recovery } = move.spec;
    step(match, 1, controlFor(move));
    step(match, Math.ceil((startup + active + recovery + .05) / dt));
    assert.equal(fighter.stats.hits, 0, move.id);
    assert.equal(fighter.stats.specials, 1, move.id);
    assert.equal(target.hp, initialHp, move.id);
    assert.equal(fighter.attack, null, move.id);
    assert.equal(match.projectiles.length, 0, move.id);
  }
});

test('the Runner turn offers a low guard answer and a contact-led withdrawal', () => {
  const move = getXenoTrialsAlternateSignatureV208(getXenoTrialsFighterV96('runner'), 'signature-3');
  for (const crouch of [false, true]) {
    const { match, fighter, target } = encounter(move, 8);
    const start = fighter.x;
    step(match, 1, controlFor(move), { guard: true, crouch });
    step(match, 68, {}, { guard: true, crouch });
    assert.ok(fighter.x < start - 15);
    assert.equal(target.stats.blocks, Number(crouch));
  }
  const disallowed = encounter(move, 8, { rulesV119: { noSpecial: true } });
  step(disallowed.match, 40, controlFor(move));
  assert.equal(disallowed.fighter.stats.specials, 0);
  assert.equal(disallowed.fighter.stats.hits, 0);
});

test('a new advancing signature resumes deterministically in duel and horde under an exact profile witness', () => {
  const playerId = 'prowler';
  for (const horde of [false, true]) {
    const progress = createXenoTrialsProgressV96();
    if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
    const ticket = beginXenoTrialsV96(progress, { playerId, opponentId: 'runner',
      activityV119: horde ? { branch: 'horde', id: 'xth180-incoming-1' } : undefined });
    assert.equal(ticket.applied, true);
    const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
    step(match, 39, { signature2: true }, null);
    assert.equal(match.fighters[0].attack?.kind, 'signature-2');
    assert.equal(match.fighters[0].attack?.launchedV147, true);
    const admit = horde ? createXenoTrialsHordeCheckpointV186 : createXenoTrialsDuelCheckpointV197;
    const checkpoint = admit(getXenoTrialsSnapshotV96(match), ticket.config);
    assert.ok(checkpoint);
    const restored = horde ? restoreXenoTrialsHordeMatchV180(checkpoint.snapshot) : structuredClone(checkpoint.snapshot);
    assert.ok(restored);
    for (const state of [match, restored]) {
      setXenoTrialsPausedV96(state, false);
      step(state, 56, {}, null);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(restored), getXenoTrialsSnapshotV96(match));
    const forged = structuredClone(checkpoint.snapshot);
    forged.events.find(event => event.signatureIdV208 === 'prowler::sig2').signatureIdV208 = 'drive-v123-afe-prowler::sig2';
    assert.equal(admit(forged, ticket.config), null);
  }
});
