import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { XENO_TRIALS_FIGHTERS_V96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { getXenoTrialsBodyBoundsV105 as body } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { XENO_TRIALS_RECRUITS_V230 } from '../src/xeno-trials-recruits-v230.js';
import { XENO_TRIALS_RECRUIT_SIGNATURES_V231, XENO_TRIALS_MIRE_MOVE_EVIDENCE_V231 } from '../src/xeno-trials-recruit-kits-v231.js';
import { XENO_TRIALS_RESEARCH_SIGNATURES_V210 } from '../src/xeno-trials-research-v210.js';
import { getXenoTrialsAlternateSignatureV208 as signature } from '../src/xeno-trials-signature-kit-v208.js';
import { getXenoTrialsAttackV147, getXenoTrialsAttackStyleV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsSuperV148 as superOne } from '../src/xeno-trials-supers-v148.js';
import { getXenoTrialsRiposteV208 as superTwo, getXenoTrialsRiposteReadinessV208 } from '../src/xeno-trials-ripostes-v208.js';
import { XENO_TRIALS_SUPER_KITS_V231 } from '../src/xeno-trials-super-kits-v209.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { stepXenoTrialsBrainV119 } from '../src/xeno-trials-ai-v119.js';

const signatures = ['signature-2', 'signature-3'];
const superPress = Object.freeze({ super: true });
const ripostePress = Object.freeze({ guard: true, super: true });
const crouchGuard = Object.freeze({ guard: true, crouch: true });
const signaturePress = move => ({ ['signature' + move.kind.at(-1)]: true });
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

function step(match, ticks = 1, player = {}, opponent = {}) {
  for (let n = 0; n < ticks; n++) stepXenoTrialsMatchV96(match, dt, player, opponent);
}

function spacing(fighter, target, gap) {
  fighter.facing = 1;
  target.facing = -1;
  target.x += body(fighter).right + gap - body(target).left;
}

function duel(id, gap = 14, configuration = {}) {
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'queen', introSeconds: 0, holdRoundTransition: true, ...configuration });
  const [player, target] = match.fighters;
  spacing(player, target, gap);
  return { match, player, target };
}

function ticket(id) {
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(id, 'queen');
  const started = beginXenoTrialsV96(progress, { playerId: id, opponentId: 'queen' });
  assert.ok(started.applied, id);
  return started.config;
}

function parry(match, player, target) {
  const heavy = getXenoTrialsAttackV147(getXenoTrialsFighterV96(target.id), 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  step(match, 1, {}, { heavy: true });
  step(match, Math.floor(heavy.startup / dt) - 3);
  for (let n = 0; n < 8 && !player.parryV208?.openingId; n++) step(match, 1, { parry: true });
  const read = getXenoTrialsRiposteReadinessV208(match, player, getXenoTrialsFighterV96(player.id));
  assert.deepEqual([read.ready, read.attacker?.id, read.receipt?.attackIdV208], [true, target.id, target.attack?.id], player.id);
  return read.receipt;
}

test('V231 covers exact MIRE identities and preserves all historical move contracts', () => {
  const roster = XENO_TRIALS_FIGHTERS_V96;
  const historic = roster.slice(0, 189).map(fighter => [fighter.id, ...signatures.map(kind => signature(fighter, kind)), superOne(fighter), superTwo(fighter)]);
  assert.equal(digest(historic), 'caa381af4de71e51dc159a11bc770ce77ec00cba22d7b77759709bf0c8e18209');
  const inherited = XENO_TRIALS_RESEARCH_SIGNATURES_V210;
  assert.equal(inherited.length, 14);
  const strikerId = 'mire-v210-striker';
  const correctedLabels = new Map([
    ['mire-v210-scorched::sig3', ['Accroc crânien', 'Dome Snag']],
    ['mire-v210-siren::sig2', ['Coup de pied haut', 'High Kick']],
    ['mire-v210-siren::sig3', ['Revers de jambe', 'Leg Reversal']],
    ['mire-v210-striker::sig2', ['Percussion en avancée', 'Advancing Bash']],
    ['mire-v210-striker::sig3', ['Balayage de bras', 'Broad Arm Sweep']],
  ]);
  assert.equal(digest(inherited.map(({ id, fighterId, profileId, kind, spec }) => [id, fighterId, profileId, kind, spec])),
    '0d24c825ada08d1d021e3d68c1f7c185d5b2879207fd307ce4a636428baaffe0');
  assert.equal(digest(inherited.filter(move => !correctedLabels.has(move.id))),
    '452ce31d40d669eaac7c261d412d011b02daa5552a254e7695d1cb96e53fbab8');
  for (const [id, labels] of correctedLabels) {
    const move = inherited.find(record => record.id === id);
    assert.deepEqual([move.label, move.labelEn], labels, id);
  }
  const striker = getXenoTrialsFighterV96(strikerId);
  const [bash, sweep] = signatures.map(kind => signature(striker, kind).spec);
  assert.equal(striker.role, 'tank');
  assert.equal(bash.groundedOnly, true);
  assert.ok(bash.approachV208 > 0);
  assert.equal(bash.liftV208, undefined);
  assert.equal(sweep.contactBandV207, 'low');
  assert.equal(sweep.groundedTargetV208, true);
  assert.ok(sweep.reach > bash.reach && sweep.recovery > bash.recovery);
  for (const move of inherited) assert.equal(signature(getXenoTrialsFighterV96(move.fighterId), move.kind), move);

  const added = [...XENO_TRIALS_RECRUIT_SIGNATURES_V231, ...XENO_TRIALS_SUPER_KITS_V231.flatMap(({ first, counter }) => [first, counter])];
  assert.equal(XENO_TRIALS_RECRUIT_SIGNATURES_V231.length, 12);
  assert.equal(XENO_TRIALS_SUPER_KITS_V231.length, 13);
  assert.equal(new Set(added.map(move => move.id)).size, 38);
  assert.equal(new Set(added.map(move => JSON.stringify(move.spec))).size, 38);
  for (const move of added) {
    const definition = getXenoTrialsFighterV96(move.fighterId);
    const getter = move.kind ? fighter => signature(fighter, move.kind) : move.id.endsWith('1') ? superOne : superTwo;
    assert.equal(move.profileId, definition.profileId, move.id);
    assert.equal(move.evidence, XENO_TRIALS_MIRE_MOVE_EVIDENCE_V231, move.id);
    assert.equal(move.canonExact, false, move.id);
    assert.ok(move.labelEn && move.descriptionEn && move.spec.groundedOnly && Object.isFrozen(move.spec), move.id);
    assert.equal(getter(definition), move);
    assert.equal(getter({ ...definition, id: 'other-model' }), null);
    assert.equal(getter({ ...definition, profileId: 'other-profile' }), null);
  }
  assert.equal(roster.length, 202);
  const resolved = roster.flatMap(fighter => [...signatures.map(kind => signature(fighter, kind)), superOne(fighter), superTwo(fighter)]);
  assert.ok(resolved.every(Boolean));
  assert.equal(new Set(resolved.map(move => move.id)).size, 808);
  for (const id of ['mire-v209-facehugger', 'mire-v209-chestburster']) {
    const fighter = getXenoTrialsFighterV96(id);
    assert.ok(fighter);
    assert.deepEqual([...signatures.map(kind => signature(fighter, kind)), superOne(fighter), superTwo(fighter)], [null, null, null, null]);
    assert.equal(createXenoTrialsMatchV96({ playerId: id }).fighters[0].superMeterV148, undefined);
  }
});

test('all 26 recruit H/O commands resolve a real hit, pay once, miss out of range, and share a cooldown', () => {
  for (const definition of XENO_TRIALS_RECRUITS_V230) for (const kind of signatures) {
    const move = signature(definition, kind), press = signaturePress(move), { spec } = move;
    for (const gap of [14, 520]) {
      const { match, player, target } = duel(definition.id, gap);
      const hp = target.hp;
      step(match, 1, press);
      assert.equal(player.attack?.kind, kind, move.id);
      assert.equal(match.events.at(-1)?.signatureIdV208, move.id);
      assert.equal(player.stamina, definition.stamina - spec.cost, move.id);
      assert.equal(player.specialCooldown, spec.cooldown, move.id);
      step(match, 180, press);
      assert.equal(player.stats.specials, 1, move.id);
      assert.equal(player.stats.hits, Number(gap === 14), move.id);
      assert.equal(target.hp < hp, gap === 14, move.id);
      assert.equal(match.projectiles.length, 0, move.id);
    }
  }
  const deacon = duel('mire-v209-deacon', 520);
  step(deacon.match, 1, { signature2: true });
  step(deacon.match, 110);
  assert.equal(deacon.player.attack, null);
  assert.ok(deacon.player.specialCooldown > 0);
  step(deacon.match, 1, { signature3: true });
  assert.equal(deacon.player.stats.specials, 1);
  step(deacon.match, 60);
  step(deacon.match, 1, { signature3: true });
  assert.equal(deacon.player.attack?.kind, 'signature-3');
  assert.equal(deacon.player.stats.specials, 2);
});

test('guarding responds to the authored strike band, and no-special rules preserve resources', () => {
  for (const move of XENO_TRIALS_RECRUIT_SIGNATURES_V231) {
    const { match, player, target } = duel(move.fighterId);
    step(match, 170, signaturePress(move), move.spec.contactBandV207 === 'low' ? crouchGuard : { guard: true });
    assert.equal(target.stats.blocks, 1, move.id);
    assert.ok(player.stats.damage < move.spec.damage, move.id);

    const blocked = duel(move.fighterId, 14, { rulesV119: { noSpecial: true } });
    const stamina = blocked.player.stamina;
    blocked.player.superMeterV148 = 100;
    step(blocked.match, 1, signaturePress(move));
    step(blocked.match, 1, superPress);
    assert.equal(blocked.player.attack, null, move.id);
    assert.equal(blocked.player.stamina, stamina, move.id);
    assert.equal(blocked.player.superMeterV148, 100, move.id);
  }
  const exposed = duel('mire-v209-bigchap');
  step(exposed.match, 150, { signature2: true }, { guard: true });
  assert.equal(exposed.target.stats.blocks, 0);
  assert.equal(exposed.player.stats.damage, 33);
});

test('each Super I charges full meter and endurance once on commit, on a hit, guard or miss', () => {
  for (const { first: move } of XENO_TRIALS_SUPER_KITS_V231) for (const outcome of ['hit', 'guard', 'miss']) {
    const { match, player, target } = duel(move.fighterId, outcome === 'miss' ? 520 : 14);
    const hp = target.hp, required = move.spec.cost, startingStamina = player.stamina;
    assert.equal(player.superMeterV148, 0, move.id);
    step(match, 1, superPress);
    assert.equal(player.attack, null, move.id);
    step(match);
    player.superMeterV148 = 100;
    const guard = outcome === 'guard' ? move.spec.contactBandV207 === 'low' ? crouchGuard : { guard: true } : {};
    step(match, 1, superPress, guard);
    assert.equal(player.attack?.kind, 'super', move.id);
    assert.equal(player.stamina, startingStamina - required, move.id);
    assert.equal(player.specialCooldown, 3, move.id);
    assert.equal(player.superMeterV148, 0, move.id);
    assert.equal(match.events.at(-1)?.superIdV148, move.id);
    assert.equal(getXenoTrialsAttackStyleV147(getXenoTrialsFighterV96(move.fighterId), 'super'), 'physical');
    step(match, 200, superPress, guard);
    assert.equal(player.stats.supersV148, 1, move.id);
    assert.equal(player.stats.hits, Number(outcome !== 'miss'), move.id);
    assert.equal(target.hp < hp, outcome !== 'miss', move.id);
    assert.equal(target.stats.blocks, Number(outcome === 'guard'), move.id);
    assert.equal(player.superMeterV148, 0, move.id);
    assert.equal(player.y, 0, move.id);
    assert.equal(match.projectiles.length, 0, move.id);
    step(match, 1, {});
    player.superMeterV148 = 100; // Refill solely to isolate denial while the original cooldown runs.
    step(match, 1, superPress);
    assert.equal(player.attack, null, move.id);
    assert.equal(player.stats.supersV148, 1, move.id);
    assert.equal(player.superMeterV148, 100, move.id);
  }
});

test('all Super II attacks need the same assailant’s real parry; a retreat can leave the punish empty', () => {
  for (const { counter: move } of XENO_TRIALS_SUPER_KITS_V231) for (const outcome of ['hit', 'miss']) {
    const { match, player, target } = duel(move.fighterId);
    const hp = target.hp;
    player.superMeterV148 = 100;
    step(match, 1, ripostePress);
    assert.equal(player.attack, null, move.id);
    assert.equal(player.superMeterV148, 100, move.id);
    step(match);
    const receipt = parry(match, player, target);
    const stamina = player.stamina;
    step(match, 1, ripostePress);
    assert.equal(player.attack?.kind, 'super-riposte', move.id);
    assert.equal(player.attack.riposteV208.attackId, receipt.attackIdV208, move.id);
    assert.equal(player.parryV208.openingId, 0, move.id);
    assert.ok(Math.abs(player.stamina - (stamina - 5 * dt - move.spec.cost)) < 1e-9, move.id);
    assert.equal(player.superMeterV148, 0, move.id);
    assert.equal(match.events.at(-1)?.riposteIdV208, move.id);
    if (outcome === 'miss') spacing(player, target, 430); // Scope a target displacement after native commitment.
    step(match, 165, ripostePress);
    assert.equal(target.hp < hp, outcome === 'hit', move.id);
    assert.equal(player.stats.hits, Number(outcome === 'hit'), move.id);
    assert.equal(player.stats.supersV148, 1, move.id);
    assert.equal(player.superMeterV148, 0, move.id);
  }
});

test('active V231 signature, projectile, Super I and Super II receipts survive a real duel checkpoint', () => {
  const cases = [
    ['mire-v209-neomorph', 'signature-2'],
    ['mire-v209-blight', 'signature-2'],
    ['mire-v210-praetorian-avp', 'super'],
    ['mire-v210-praetorian-afe2', 'super-riposte']
  ];
  for (const [id, kind] of cases) {
    const config = ticket(id);
    const { match, player, target } = duel(id, id === 'mire-v209-blight' ? 245 : 14, config);
    const fighter = getXenoTrialsFighterV96(id);
    const move = kind === 'super' ? superOne(fighter) : kind === 'super-riposte' ? superTwo(fighter) : signature(fighter, kind);
    if (kind === 'super' || kind === 'super-riposte') player.superMeterV148 = 100;
    if (kind === 'super-riposte') parry(match, player, target);
    const press = kind === 'super' ? superPress : kind === 'super-riposte' ? ripostePress : signaturePress(move);
    step(match, 1, press, null);
    assert.equal(player.attack?.kind, kind, id);
    if (id === 'mire-v209-blight') {
      step(match, Math.ceil(move.spec.startup / dt) + 2, {}, null);
      assert.equal(match.projectiles.length, 1);
      assert.equal(match.projectiles[0].signatureIdV147, move.id);
    }
    const snapshot = getXenoTrialsSnapshotV96(match);
    const save = createXenoTrialsDuelCheckpointV197(snapshot, config);
    assert.ok(save, id);
    const forged = structuredClone(snapshot);
    const field = kind === 'super' ? 'superIdV148' : kind === 'super-riposte' ? 'riposteIdV208' : 'signatureIdV208';
    const receipt = forged.events.find(event => event[field] === move.id);
    assert.ok(receipt, id);
    receipt[field] = move.id.replace(id, 'mire-v209-deacon');
    assert.equal(createXenoTrialsDuelCheckpointV197(forged, config), null, id);
    const resumed = JSON.parse(JSON.stringify(save.snapshot));
    setXenoTrialsPausedV96(resumed, false);
    step(match, 200, {}, null);
    step(resumed, 200, {}, null);
    assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match), id);
    assert.equal(resumed.fighters[0].stats.hits, 1, id);
    assert.equal(resumed.fighters[0].stats.supersV148, kind.startsWith('super') ? 1 : undefined, id);
  }
});

test('older recruit checkpoints without a gauge resume and earn meter only on a resolved contact', () => {
  const id = 'mire-v209-deacon';
  const config = ticket(id), { match, player } = duel(id, 14, config);
  step(match, 1, {}, null);
  const old = getXenoTrialsSnapshotV96(match);
  delete old.fighters[0].superMeterV148;
  const legacy = createXenoTrialsDuelCheckpointV197(old, config);
  assert.ok(legacy);
  const resumed = JSON.parse(JSON.stringify(legacy.snapshot));
  setXenoTrialsPausedV96(resumed, false);
  step(resumed, 1, superPress);
  assert.equal(resumed.fighters[0].superMeterV148, player.superMeterV148);
  assert.equal(resumed.fighters[0].attack, null);
  step(resumed, 150, { signature2: true });
  assert.equal(resumed.fighters[0].stats.hits, 1);
  assert.ok(resumed.fighters[0].superMeterV148 > 0);
});

test('the native brain can select every recruit Super I in hard difficulty only and execute the same debit', () => {
  for (const { first: move } of XENO_TRIALS_SUPER_KITS_V231) {
    for (const difficulty of ['easy', 'normal', 'hard']) {
      const { match, target } = duel('queen', 14, { opponentId: move.fighterId, difficulty });
      target.superMeterV148 = 100;
      const command = stepXenoTrialsBrainV119(match, dt, XENO_TRIALS_ATTACKS_V96, () => .5);
      assert.equal(command.super, difficulty === 'hard', move.id);
      assert.equal(target.superMeterV148, 100, move.id);
      step(match, 1, {}, command);
      assert.equal(target.attack?.kind === 'super', difficulty === 'hard', move.id);
      assert.equal(target.superMeterV148, difficulty === 'hard' ? 0 : 100, move.id);
    }
  }
});

test('the hard CPU can spend a native recruit parry opening after its reaction window', () => {
  for (const difficulty of ['normal', 'hard']) {
    const { match, player, target: cpu } = duel('queen', 14, { opponentId: 'mire-v209-bigchap', difficulty });
    const heavy = getXenoTrialsAttackV147(getXenoTrialsFighterV96(player.id), 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
    cpu.superMeterV148 = 100;
    step(match, 1, { heavy: true });
    step(match, Math.floor(heavy.startup / dt) - 3);
    for (let n = 0; n < 8 && !cpu.parryV208?.openingId; n++) step(match, 1, {}, { parry: true });
    assert.ok(cpu.parryV208?.openingId);
    step(match, 6);
    step(match, 1, {}, null);
    assert.equal(cpu.attack?.kind === 'super-riposte', difficulty === 'hard');
    assert.equal(cpu.superMeterV148, difficulty === 'hard' ? 0 : 100);
    if (difficulty === 'hard') assert.equal(match.events.at(-1)?.riposteIdV208, 'mire-v209-bigchap::super2');
  }
});

test('native hard CPU decisions use the new tail, withdrawal and projectile signatures', () => {
  const cases = [
    ['mire-v209-bigchap', 38, 2, 'signature-2'],
    ['mire-v209-deacon', 38, 1, 'signature-3'],
    ['mire-v209-blight', 214, 2, 'signature-2'],
  ];
  for (const [id, gap, seed, kind] of cases) {
    const { match, target } = duel('queen', gap, { opponentId: id, difficulty: 'hard', seed });
    const move = signature(getXenoTrialsFighterV96(id), kind);
    const received = () => match.events.find(event => event.side === 'opponent' && event.signatureIdV208 === move.id);
    for (let tick = 0; tick < 120 && !received(); tick++) step(match, 1, { guard: true }, null);
    assert.ok(received(), move.id);
    assert.equal(target.attack?.kind, kind, move.id);
    assert.ok(target.specialCooldown > 0, move.id);
    assert.ok(target.stats.specials > 0, move.id);
  }
});
