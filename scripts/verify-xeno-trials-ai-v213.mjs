import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, nextXenoTrialsRoundV96, setXenoTrialsPausedV96, XENO_TRIALS_ATTACKS_V96,
  stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsProjectileThreatV149 } from '../src/xeno-trials-ai-v119.js';
import { XENO_TRIALS_GET_UP_V211 } from '../src/xeno-trials-defense-v211.js';
import { XENO_TRIALS_GROUND_RELEASE_V218 } from '../src/xeno-trials-grapple-v153.js';
import { XENO_TRIALS_GROUND_BREAK_START_V213, XENO_TRIALS_GROUND_BREAK_V213 } from '../src/xeno-trials-grapple-v213.js';
import { getXenoTrialsBodyBoundsV105 as bounds, getXenoTrialsBodyGapV105 as gapTo, XENO_TRIALS_ARENA_V105 }
  from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207 as hurt, getXenoTrialsLowScaleV207, XENO_TRIALS_GUARD_RETREAT_V213,
  XENO_TRIALS_LOW_RETREAT_V213 } from '../src/xeno-trials-moveset-v207.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';

function fixture({ playerId = 'runner', opponentId = 'warrior', difficulty = 'hard', seed = 1, gap = 79, meter = 100, rules } = {}) {
  const progress = createXenoTrialsProgressV96();
  if (!progress.unlocked.includes(playerId)) progress.unlocked.push(playerId);
  const ticket = beginXenoTrialsV96(progress, { playerId, opponentId, difficulty });
  assert.ok(ticket.applied);
  const match = createXenoTrialsMatchV96({ ...ticket.config, seed, rulesV119: rules || ticket.config.rulesV119,
    introSeconds: 0, holdRoundTransition: true });
  const [player, cpu] = match.fighters;
  cpu.x += bounds(player).right + gap - bounds(cpu).left;
  // The fixture arranges starting range and charge. All observations and
  // attacks below are produced by the native fixed-step controller.
  cpu.superMeterV148 = meter;
  return { match, player, cpu, config: { ...ticket.config, seed, rulesV119: match.config.rulesV119 } };
}

function advance(match, count, controls = {}, direct = null) {
  for (let tick = 0; tick < count; tick++) stepXenoTrialsMatchV96(match, dt, controls, direct);
}

const cpuAttacks = match => match.events.filter(event => event.type === 'attack' && event.side === 'opponent');

test('the hard CPU punishes a real observed heavy whiff with a single paid physical super', () => {
  const { match, player, cpu, config } = fixture();
  advance(match, 1, { heavy: true });
  advance(match, 41);
  assert.equal(match.ai.observation.attack.id, player.attack.id);
  assert.equal(match.ai.observation.targetRecovering, false);
  assert.ok(player.attack.age > .33);
  assert.equal(player.attack.hit, false);
  assert.equal(cpu.attack, null);
  advance(match, 1);
  assert.equal(match.ai.input.heavy, true, 'the native decision offered ordinary heavy');
  assert.equal(cpu.attack?.kind, 'super');
  assert.equal(cpuAttacks(match)[0].superIdV148, 'warrior::super1');
  assert.equal(cpu.superMeterV148, 0);
  assert.equal(cpu.stats.supersV148, 1);
  assert.ok(match.fighters.every(fighter => Number.isFinite(fighter.x)));

  setXenoTrialsPausedV96(match, true);
  const frozen = getXenoTrialsSnapshotV96(match);
  const saved = createXenoTrialsDuelCheckpointV197(frozen, config);
  assert.ok(saved);
  advance(match, 50, { guard: true });
  assert.deepEqual(getXenoTrialsSnapshotV96(match), frozen);
  const resumed = structuredClone(saved.snapshot);
  for (const state of [match, resumed]) {
    setXenoTrialsPausedV96(state, false);
    advance(state, 38);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  const hits = match.events.filter(event => event.type === 'hit' && event.attacker === 'opponent');
  assert.deepEqual(hits.map(event => [event.tick, event.damage]), [[81, 57]]);
  assert.ok(hits[0].tick < Math.ceil((.23 + .10 + .39) / dt));
  assert.equal(cpu.superMeterV148, 0);
  assert.equal(cpu.stats.supersV148, 1);
});

test('the same whiff uses a timely signature without meter and keeps normal/no-special/late or contacted attacks on legacy decisions', () => {
  const unpaid = fixture({ meter: 0 });
  advance(unpaid.match, 1, { heavy: true });
  advance(unpaid.match, 42);
  assert.equal(cpuAttacks(unpaid.match)[0].signatureIdV208, 'warrior::sig2');
  assert.equal(unpaid.cpu.stats.specials, 1);
  assert.equal(unpaid.cpu.superMeterV148, 0);

  for (const options of [{ gap: 60 }, { difficulty: 'normal' }, { rules: { noSpecial: true } }]) {
    const { match, cpu } = fixture(options);
    advance(match, 1, { heavy: true });
    advance(match, 63);
    assert.equal(cpu.superMeterV148, 100);
    assert.ok(cpuAttacks(match).every(event => !event.superIdV148 && !event.signatureIdV208));
  }

  const stale = fixture();
  advance(stale.match, 1, { heavy: true }, {});
  advance(stale.match, 39, {}, {});
  advance(stale.match, 25);
  assert.equal(stale.cpu.superMeterV148, 100, 'first observing a swing in recovery gives no whiff upgrade');
  assert.deepEqual(cpuAttacks(stale.match), []);

  const short = fixture({ gap: 57, seed: 2 });
  advance(short.match, 1, { light: true }, {});
  advance(short.match, 7, {}, {});
  advance(short.match, 21);
  assert.equal(short.match.ai.observation.attack.id, short.player.attack.id);
  assert.equal(short.match.ai.observation.targetRecovering, false);
  advance(short.match, 1);
  assert.equal(short.match.ai.observation.targetRecovering, true);
  assert.equal(short.player.attack.hit, false);
  assert.equal(short.cpu.attack?.kind, 'light', 'the short recovery cannot fit a charged super');
  assert.equal(short.cpu.superMeterV148, 100);

  const resting = fixture();
  advance(resting.match, 43);
  assert.equal(resting.match.ai.observation.attack, null);
  assert.equal(resting.match.ai.input.super, true, 'a normal super decision still works against an idle player');
  assert.equal(resting.cpu.attack?.kind, 'super');
});

test('two native standing blocks can switch Runner to a low signature, while a crouching guard prevents that read', () => {
  for (const crouch of [false, true]) {
    const { match, player, cpu } = fixture({ playerId: 'synth-guard', opponentId: 'runner', gap: 3, seed: 4, meter: 0 });
    for (let attempt = 0; attempt < 2; attempt++) {
      advance(match, 1, { guard: true }, { light: true });
      advance(match, 44, { guard: true }, {});
    }
    assert.equal(cpu.attack, null);
    assert.equal(player.stats.blocks, 2);
    advance(match, 17, { guard: true, crouch });
    assert.equal(match.ai.input.light, true);
    assert.equal(cpu.attack?.kind, crouch ? 'light' : 'signature-2');
    advance(match, 17, { guard: true, crouch });
    assert.equal(match.events.at(-1).type, crouch ? 'block' : 'hit');
    assert.equal(cpu.stats.specials, crouch ? 0 : 1);
  }

  const single = fixture({ playerId: 'synth-guard', opponentId: 'runner', gap: 3, seed: 4, meter: 0 });
  advance(single.match, 1, { guard: true }, { light: true });
  advance(single.match, 44, { guard: true }, {});
  advance(single.match, 17, { guard: true });
  assert.equal(single.player.stats.blocks, 1);
  assert.equal(single.cpu.attack?.kind, 'light');
});

test('duel checkpoints accept the exact hard CPU parry and riposte input edges', () => {
  const { match, config, cpu } = fixture({ opponentId: 'drive-v123-fte-pathogen-queen-right-v13', gap: 15, seed: 30 });
  advance(match, 1, { heavy: true });
  advance(match, 23);
  assert.equal(cpu.parryV208.started, 24);
  assert.equal(Object.keys(cpu.previousInput).length, 8);
  const parry = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(parry);
  advance(match, 10);
  assert.equal(cpu.attack?.kind, 'super-riposte');
  assert.equal(cpu.superMeterV148, 0);
  const riposte = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(riposte);
  for (const saved of [parry, riposte]) {
    const resumed = structuredClone(saved.snapshot);
    setXenoTrialsPausedV96(resumed, false);
    advance(resumed, 80 - resumed.tick);
    assert.equal(resumed.fighters[1].stats.supersV148, 1);
    assert.equal(resumed.events.filter(event => event.kind === 'super-riposte').length, 1);
    advance(match, 80 - match.tick);
    assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  }
});

for (const [opponentId, attackTick, hitTick] of [['runner', 65, 82], ['synth-guard', 64, 79]]) {
  test(`hard ${opponentId} pays for a native anti-air against an observed descent with specials locked`, () => {
    const { match, player, cpu, config } = fixture({ opponentId, gap: 58, rules: { noSpecial: true } });
    advance(match, 1, { jump: true });
    advance(match, attackTick - 2);
    assert.equal(match.ai.observation.targetAirborne, true);
    assert.ok(player.y > 0 && player.vy < 0);
    assert.deepEqual(cpuAttacks(match), []);
    const stamina = cpu.stamina;

    advance(match, 1);
    assert.equal(cpu.attack?.kind, 'anti-air');
    assert.equal(cpu.stamina, stamina - XENO_TRIALS_ATTACKS_V96['anti-air'].cost);
    assert.equal(cpu.superMeterV148, 100);
    assert.equal(cpu.stats.specials, 0);
    const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
    assert.ok(checkpoint);
    const resumed = structuredClone(checkpoint.snapshot);
    setXenoTrialsPausedV96(resumed, false);
    for (const state of [match, resumed]) {
      advance(state, 94 - state.tick);
      assert.ok(state.fighters[0].y > 0);
      assert.deepEqual(cpuAttacks(state).map(event => event.kind), ['anti-air']);
      assert.deepEqual(state.events.filter(event => event.type === 'hit' && event.attacker === 'opponent')
        .map(event => event.tick), [hitTick]);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  });
}

test('the hard CPU saves anti-air for a reachable airborne target it can afford to hit', () => {
  for (const options of [{ gap: 500 }, { difficulty: 'normal' }, { jump: false }, { stamina: 0 }]) {
    const { match, cpu } = fixture({ opponentId: 'runner', gap: 58, rules: { noSpecial: true }, ...options });
    advance(match, 1, { jump: options.jump !== false });
    advance(match, 63);
    if (options.stamina === 0) cpu.stamina = 0;
    advance(match, 30);
    assert.ok(cpuAttacks(match).every(event => event.kind !== 'anti-air'), JSON.stringify(options));
  }
});

test('Runner reads two standing blocks with a regular low strike while signatures are locked', () => {
  for (const { rules, wait = 0, crouch = false, kind, contact } of [
    { rules: { noSpecial: true }, kind: 'low', contact: 'hit' },
    { rules: { specialLockSeconds: 20 }, kind: 'low', contact: 'hit' },
    { rules: { specialLockSeconds: 20 }, wait: 20 * 120, kind: 'signature-2', contact: 'hit' },
    { rules: { noSpecial: true }, crouch: true, kind: 'light', contact: 'block' }
  ]) {
    const { match, player, cpu, config } = fixture({ playerId: 'synth-guard', opponentId: 'runner',
      gap: 3, seed: 4, meter: 0, rules });
    // The opening inputs establish two real blocked contacts before native control resumes.
    advance(match, wait, {}, {});
    for (let attempt = 0; attempt < 2; attempt++) {
      advance(match, 1, { guard: true }, { light: true });
      advance(match, 44, { guard: true }, {});
    }
    assert.equal(player.stats.blocks, 2);
    advance(match, 16, { guard: true, crouch });
    assert.equal(cpu.attack, null);
    const stamina = cpu.stamina;
    const meter = cpu.superMeterV148;
    advance(match, 1, { guard: true, crouch });
    assert.equal(cpu.attack?.kind, kind);
    if (kind === 'low') assert.ok(Math.abs(cpu.stamina - (stamina + dt * 24 - XENO_TRIALS_ATTACKS_V96.low.cost)) < 1e-8);
    assert.equal(cpu.superMeterV148, meter);
    assert.equal(cpu.stats.specials, Number(kind === 'signature-2'));
    const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
    assert.ok(checkpoint);
    const resumed = structuredClone(checkpoint.snapshot);
    setXenoTrialsPausedV96(resumed, false);
    for (const state of [match, resumed]) {
      advance(state, 19, { guard: true, crouch });
      assert.equal(state.events.at(-1).type, contact);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  }
});

test('Runner learns blocked attacks again after an actual round transition and checkpoint', () => {
  const { match, cpu, config } = fixture({ playerId: 'synth-guard', opponentId: 'runner',
    gap: 3, seed: 4, meter: 0, rules: { noSpecial: true } });
  // Start at the end of a close first round so two real blocks remain in view.
  cpu.hp = 5;
  for (let attempt = 0; attempt < 2; attempt++) {
    advance(match, 1, { guard: true }, { light: true });
    advance(match, 44, { guard: true }, {});
  }
  const priorBlocks = match.events.filter(event => event.type === 'block' && event.side === 'player');
  assert.equal(priorBlocks.length, 2);
  advance(match, 1, { light: true }, {});
  for (let tick = 0; tick < 60 && match.phase === 'active'; tick++) advance(match, 1, {}, {});
  assert.equal(match.roundWinner, 'player');
  assert.equal(match.roundReason, 'ko');
  advance(match, 217, {}, {});
  assert.ok(match.phaseTime <= 0);
  assert.equal(nextXenoTrialsRoundV96(match), true);
  const roundStart = match.events.at(-1);
  assert.deepEqual([roundStart.type, roundStart.round], ['round-start', 2]);
  const [player, runner] = match.fighters;
  for (let tick = 0; tick < 140 && gapTo(player, runner) > 18; tick++)
    advance(match, 1, { right: true }, { left: true });
  assert.ok(gapTo(player, runner) <= 18);

  advance(match, 16, { guard: true });
  assert.equal(runner.attack, null);
  assert.ok(match.tick - priorBlocks[0].tick < 4 / dt);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    advance(state, 1, { guard: true });
    assert.equal(state.fighters[1].attack?.kind, 'light');
    advance(state, 19, { guard: true });
    const blocks = state.events.filter(event => event.type === 'block' && event.side === 'player'
      && event.tick > roundStart.tick);
    assert.equal(blocks.length, 1);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('hard Synth Guard releases guard after a genuine break and re-arms once during recovery', () => {
  const { match, cpu, config } = fixture({ playerId: 'warrior', opponentId: 'synth-guard', gap: 3, seed: 2 });
  advance(match, 1, { heavy: true });
  advance(match, 26);
  assert.equal(cpu.guard, true);
  cpu.stamina = 12; // Arrange a break on the imminent native heavy contact.
  advance(match, 1);
  const broken = match.events.at(-1);
  assert.equal(broken.type, 'guard-break');
  assert.equal(broken.side, 'opponent');
  assert.equal(cpu.previousInput.guard, true);
  const hp = cpu.hp;
  advance(match, XENO_TRIALS_GET_UP_V211.opensAt);
  assert.equal(cpu.previousInput.guard, false);
  assert.equal(cpu.groundRecoveryV211.assistedAt, 0);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    const guard = state.fighters[1];
    advance(state, 7);
    assert.equal(guard.groundRecoveryV211.assistedAt, 0);
    advance(state, 1);
    assert.equal(guard.previousInput.guard, true);
    assert.equal(guard.groundRecoveryV211.assistedAt, state.tick);
    assert.equal(guard.stun, XENO_TRIALS_GET_UP_V211.assistedTicks * dt);
    const recovery = state.events.filter(event => event.type === 'get-up-v211');
    assert.deepEqual(recovery.map(event => [event.side, event.breakIdV211]), [['opponent', broken.id]]);
    assert.equal(guard.hp, hp);
    advance(state, XENO_TRIALS_GET_UP_V211.assistedTicks);
    assert.equal(guard.groundRecoveryV211, undefined);
    assert.equal(guard.previousInput.guard, false);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

function nativeCommandoHold(difficulty = 'hard') {
  const trial = fixture({ playerId: 'warrior', opponentId: 'import-game-dd-wy-commando', difficulty, gap: 4, meter: 0 });
  const { match } = trial;
  advance(match, 1, { guard: true, heavy: true });
  for (let tick = 0; tick < 60 && !match.grappleV153; tick++) advance(match, 1);
  assert.equal(match.grappleV153?.attacker, 'player');
  assert.equal(match.grappleV153.target, 'opponent');
  assert.ok(match.grappleV153.grabIdV212);
  assert.equal(match.opponentInputSourceV163, 'cpu');
  return trial;
}

test('hard WY Commando pays for a ground break and resumes before or during the effort', () => {
  const { match, cpu, config } = nativeCommandoHold();
  const { minHeld, effortTicks, cost, captiveRecovery, captorRecovery } = XENO_TRIALS_GROUND_BREAK_V213;
  const { id, bornTick, nextDamageTick } = match.grappleV153;
  const hp = cpu.hp, stamina = cpu.stamina, x = cpu.x;
  for (let tick = 0; tick < 60 && match.grappleV153.escapeProgress < minHeld; tick++) advance(match, 1);
  assert.equal(match.grappleV153.escapeProgress, minHeld);
  assert.ok(match.tick - bornTick > minHeld);
  assert.equal(match.grappleV153.breakV213, undefined);
  const before = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(before);
  const resumedBefore = structuredClone(before.snapshot);
  setXenoTrialsPausedV96(resumedBefore, false);
  advance(match, 1);
  advance(resumedBefore, 1);
  assert.deepEqual(getXenoTrialsSnapshotV96(resumedBefore), getXenoTrialsSnapshotV96(match));
  const effort = match.events.at(-1);
  assert.equal(effort.type, XENO_TRIALS_GROUND_BREAK_START_V213);
  assert.equal(effort.grappleId, id);
  assert.equal(effort.heldTicksV213, minHeld);
  assert.equal(cpu.stamina, stamina - cost);
  assert.equal(cpu.previousInput.guard, true);
  assert.equal(cpu.previousInput.light, true);

  const during = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(during);
  const resumedDuring = structuredClone(during.snapshot);
  setXenoTrialsPausedV96(resumedDuring, false);
  for (const state of [match, resumedBefore, resumedDuring]) {
    advance(state, effortTicks - 1);
    assert.ok(state.grappleV153);
    assert.equal(state.fighters[1].previousInput.guard, true);
    assert.equal(state.fighters[1].previousInput.light, false);
    advance(state, 1);
    assert.equal(state.grappleV153, undefined);
    const release = state.events.at(-1);
    assert.equal(release.type, 'grapple-end-v153');
    assert.equal(release.reason, 'countered');
    assert.equal(release.breakStartV213, effort.id);
    assert.equal(release.tick, nextDamageTick);
    assert.equal(state.events.filter(event => event.type === XENO_TRIALS_GROUND_BREAK_START_V213).length, 1);
    assert.equal(state.fighters[1].hp, hp);
    assert.equal(state.fighters[1].x, x);
    assert.equal(state.fighters[1].stamina, stamina - cost);
    assert.equal(state.fighters[1].stun, captiveRecovery);
    assert.equal(state.fighters[0].stun, captorRecovery);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumedBefore), getXenoTrialsSnapshotV96(match));
  assert.deepEqual(getXenoTrialsSnapshotV96(resumedDuring), getXenoTrialsSnapshotV96(match));
});

test('early release, normal difficulty and low stamina leave the ground counter unspent', () => {
  const { minimumHeldTicks } = XENO_TRIALS_GROUND_RELEASE_V218;
  const early = nativeCommandoHold();
  advance(early.match, minimumHeldTicks - 1);
  advance(early.match, 1, { guard: true, heavy: true });
  assert.equal(early.match.events.at(-1).reason, 'released');
  assert.equal(early.match.grappleV153, undefined);

  for (const difficulty of ['normal', 'hard']) {
    const { match, cpu } = nativeCommandoHold(difficulty);
    if (difficulty === 'hard') cpu.stamina = XENO_TRIALS_GROUND_BREAK_V213.cost - 1;
    const stamina = cpu.stamina;
    for (let tick = 0; tick < 140 && match.grappleV153; tick++) advance(match, 1);
    assert.equal(match.events.at(-1).reason, 'escaped');
    assert.ok(match.events.every(event => event.type !== XENO_TRIALS_GROUND_BREAK_START_V213));
    assert.equal(cpu.stamina, stamina);
  }
});

test('hard Synth Trooper stays below a native high pulse until it has cleared the full body', () => {
  const { match, cpu, config } = fixture({ playerId: 'xenoborg', opponentId: 'synth-trooper', gap: 140, meter: 0 });
  advance(match, 1, { special: true });
  advance(match, 33);
  assert.deepEqual(match.projectiles, []);
  assert.ok(!cpu.movesetV207?.low, 'the attack windup alone does not trigger crouch');
  advance(match, 4);
  const pulse = match.projectiles.find(projectile => projectile.style === 'pulse');
  assert.ok(pulse && pulse.x < bounds(cpu).left);
  assert.ok(pulse.y <= bounds(cpu).top);
  assert.ok(!cpu.movesetV207?.low);
  const x = cpu.x, hp = cpu.hp;
  advance(match, 1);
  assert.ok(cpu.movesetV207?.low && pulse.y > hurt(cpu).top);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    const trooper = state.fighters[1];
    advance(state, 35);
    assert.ok(trooper.movesetV207?.low);
    assert.equal(trooper.x, x);
    assert.equal(trooper.hp, hp);
    assert.ok(state.projectiles.find(projectile => projectile.id === pulse.id).x > bounds(trooper).right + 9);
    advance(state, 1);
    assert.equal(trooper.movesetV207.low, false);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('Synth Trooper keeps ordinary defense for a low pulse or on normal', () => {
  for (const options of [{ playerId: 'synth-sniper' }, { playerId: 'xenoborg', difficulty: 'normal' }]) {
    const { match, cpu } = fixture({ opponentId: 'synth-trooper', gap: 140, meter: 0, ...options });
    advance(match, 1, { special: true });
    advance(match, 34);
    const pulse = match.projectiles.find(projectile => projectile.style === 'pulse');
    assert.ok(pulse);
    const standing = bounds(cpu);
    assert.equal(pulse.y <= standing.height * getXenoTrialsLowScaleV207(standing), options.playerId === 'synth-sniper');
    for (let tick = 35; tick < 76; tick++) {
      advance(match, 1);
      assert.ok(!cpu.movesetV207?.low);
    }
    assert.ok(match.events.some(event => event.type === 'block' && event.side === 'opponent'));
  }
});

const pathogenBrute = 'drive-v123-fte-pathogen-brute-profile-v13';

test('hard Runner jumps over the observed near ground wave and repeats that choice after checkpoint', () => {
  const { match, cpu, config } = fixture({ playerId: pathogenBrute, opponentId: 'runner', gap: 125, seed: 4, meter: 0 });
  advance(match, 1, { special: true });
  advance(match, 94);
  const waves = match.projectiles.filter(projectile => projectile.signatureIdV147 === 'pathogen-brute-ground-impact');
  assert.equal(waves.length, 2);
  const approaching = waves.find(projectile => projectile.direction === 1);
  assert.ok(approaching && approaching.x < bounds(cpu).left);
  assert.equal(cpu.y, 0);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    const runner = state.fighters[1], hp = runner.hp;
    for (let tick = 0; tick < 9 && runner.y === 0; tick++) advance(state, 1);
    assert.ok(runner.y > 0);
    assert.equal(runner.previousInput.jump, true);
    assert.equal(runner.movesetV207?.evade, undefined);
    assert.equal(state.ai.observation.attack.id, approaching.groupIdV147);
    assert.ok(state.tick - state.ai.observation.tick >= 2);
    assert.equal(runner.stats.specials, 0);
    advance(state, 33);
    assert.ok(!state.projectiles.some(projectile => projectile.id === approaching.id));
    assert.equal(runner.hp, hp);
    assert.equal(runner.stats.blocks, 0);
    assert.equal(runner.superMeterV148, 0);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('normal Runner and a different hard body do not inherit the specialized wave jump', () => {
  for (const options of [{ opponentId: 'runner', difficulty: 'normal' }, { opponentId: 'warrior' }]) {
    const { match, cpu } = fixture({ playerId: pathogenBrute, gap: 125, seed: 4, meter: 0, ...options });
    advance(match, 1, { special: true });
    let observedWave = false;
    for (let tick = 1; tick < 124; tick++) {
      advance(match, 1);
      observedWave ||= match.ai.observation?.projectileThreat === true
        && match.projectiles.some(projectile => projectile.groupIdV147 === match.ai.observation.attack?.id);
      assert.equal(cpu.y, 0, options.opponentId);
    }
    assert.equal(observedWave, true);
  }
});

test('hard Runner stays grounded when the observed wave is too close for its physical takeoff', () => {
  const { match, cpu } = fixture({ playerId: pathogenBrute, opponentId: 'runner', gap: 97, seed: 7, meter: 0 });
  advance(match, 1, { special: true });
  advance(match, 113);
  const [approaching] = match.projectiles.filter(projectile => projectile.direction === 1);
  assert.equal(match.ai.observation.attack.id, approaching.groupIdV147);
  assert.equal(match.ai.observation.projectileThreat, true);
  const threat = getXenoTrialsProjectileThreatV149(approaching, cpu);
  assert.ok(threat && threat.contactSeconds <= 3 * dt);
  for (let tick = 0; tick < 6; tick++) {
    advance(match, 1);
    assert.equal(cpu.y, 0);
    assert.equal(cpu.previousInput.jump, false);
  }
  assert.ok(match.events.some(event => event.type === 'hit' && event.side === 'opponent'));
});

test('hard Synth Trooper releases guard and strikes below a blocked shield bash before its recovery ends', () => {
  const { match, player, cpu, config } = fixture({ playerId: 'synth-containment', opponentId: 'synth-trooper',
    gap: 20, meter: 0, seed: 2 });
  advance(match, 1, { special: true });
  advance(match, 35);
  assert.equal(player.attack?.kind, 'special');
  assert.deepEqual(match.events.filter(event => event.type === 'block').map(event => [event.side, event.tick]), [['opponent', 20]]);
  assert.equal(cpu.attack, null);
  assert.equal(cpu.guard, true);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    const [shield, trooper] = state.fighters;
    advance(state, 1);
    assert.equal(trooper.attack?.kind, 'low');
    assert.equal(trooper.guard, false);
    assert.equal(trooper.stats.specials, 0);
    advance(state, 16);
    assert.equal(shield.attack?.kind, 'special');
    advance(state, 1);
    assert.equal(shield.attack, null);
    assert.deepEqual(state.events.filter(event => event.type === 'hit').map(event => [event.attacker, event.tick]), [['opponent', 54]]);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('the shield counter needs a native block and a target within the low strike range', () => {
  for (const { seed, gap, blocked } of [{ seed: 1, gap: 20, blocked: false }, { seed: 2, gap: 53, blocked: true }]) {
    const { match } = fixture({ playerId: 'synth-containment', opponentId: 'synth-trooper', gap, meter: 0, seed });
    advance(match, 1, { special: true });
    advance(match, 77);
    assert.equal(match.events.some(event => event.type === 'block' && event.side === 'opponent'), blocked);
    assert.ok(cpuAttacks(match).every(event => event.kind !== 'low'));
  }
});

function heavyRetreatFixture(opponentId, margin) {
  const attacker = getXenoTrialsFighterV96('warrior');
  const spec = getXenoTrialsAttackV147(attacker, 'heavy', XENO_TRIALS_ATTACKS_V96.heavy);
  const reach = spec.reach * attacker.reach;
  return { ...fixture({ playerId: attacker.id, opponentId, gap: reach - margin, meter: 0, seed: 2 }), reach };
}

test('hard Spitter reads a real heavy windup and pays for a low retreat out of reach', () => {
  const { match, player, cpu, config, reach } = heavyRetreatFixture('spitter', 2);
  const x = cpu.x, hp = cpu.hp;
  advance(match, 1, { heavy: true });
  advance(match, 22);
  assert.equal(cpu.x, x);
  assert.equal(cpu.movesetV207?.evade, undefined);
  assert.equal(match.ai.observation.attack.id, player.attack.id);
  assert.ok(gapTo(player, cpu) < reach);
  advance(match, 1);
  assert.equal(cpu.movesetV207?.evade?.variantV213, XENO_TRIALS_LOW_RETREAT_V213.id);
  assert.equal(cpu.movesetV207.low, true);
  assert.equal(cpu.stamina, getXenoTrialsFighterV96(cpu.id).stamina - XENO_TRIALS_LOW_RETREAT_V213.cost);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    const [attacker, spitter] = state.fighters;
    advance(state, 16);
    assert.equal(attacker.attack.hit, false);
    assert.equal(spitter.hp, hp);
    assert.ok(gapTo(attacker, spitter) > reach);
    assert.deepEqual(state.events.filter(event => event.type === 'evade-v207')
      .map(event => [event.side, event.variantV213]), [['opponent', XENO_TRIALS_LOW_RETREAT_V213.id]]);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

test('hard Synth Guard takes only the guarded steps required to escape a heavy at its edge', () => {
  const { match, player, cpu, config, reach } = heavyRetreatFixture('synth-guard', 1);
  const x = cpu.x, hp = cpu.hp, facing = cpu.facing;
  advance(match, 1, { heavy: true });
  advance(match, 22);
  assert.equal(cpu.x, x);
  assert.equal(cpu.guard, true);
  assert.equal(match.ai.observation.attack.id, player.attack.id);
  const stamina = cpu.stamina;
  advance(match, 1);
  const step = getXenoTrialsFighterV96(cpu.id).speed * XENO_TRIALS_GUARD_RETREAT_V213.speedRatio * dt;
  assert.ok(Math.abs(cpu.x - x - step) < 1e-8);
  assert.equal(cpu.facing, facing);
  assert.equal(cpu.guard, true);
  assert.ok(Math.abs(cpu.stamina - stamina + (5 + XENO_TRIALS_GUARD_RETREAT_V213.additionalDrain) * dt) < 1e-8);
  const checkpoint = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
  assert.ok(checkpoint);
  const resumed = structuredClone(checkpoint.snapshot);
  setXenoTrialsPausedV96(resumed, false);
  for (const state of [match, resumed]) {
    const [attacker, guard] = state.fighters;
    advance(state, 16);
    assert.ok(Math.abs(guard.x - x - step * 2) < 1e-8);
    assert.ok(gapTo(attacker, guard) > reach);
    assert.equal(guard.guard, true);
    assert.equal(attacker.attack.hit, false);
    assert.equal(guard.hp, hp);
  }
  assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
});

function clampRetreatFixture(margin, mirrored = false) {
  const loader = getXenoTrialsFighterV96('synth-automated-powerloader');
  const clamp = getXenoTrialsAttackV147(loader, 'special', XENO_TRIALS_ATTACKS_V96.special);
  const reach = clamp.reach * loader.reach;
  const trial = fixture({ playerId: loader.id, opponentId: 'synth-guard', gap: reach - margin, meter: 0, seed: 2 });
  if (mirrored) for (const fighter of trial.match.fighters) {
    fighter.x = XENO_TRIALS_ARENA_V105.left + XENO_TRIALS_ARENA_V105.right - fighter.x;
    fighter.facing *= -1;
  }
  return { ...trial, reach };
}

test('hard Synth Guard retreats outside the Power Loader clamp after observing its windup', () => {
  for (const mirrored of [false, true]) {
    const { match, player, cpu, config, reach } = clampRetreatFixture(1, mirrored);
    const x = cpu.x, hp = cpu.hp, facing = cpu.facing;
    advance(match, 1, { special: true });
    assert.equal(match.events.at(-1).signatureIdV147, 'automated-powerloader-clamp-v221');
    advance(match, 22);
    assert.equal(cpu.x, x);
    assert.equal(cpu.guard, true);
    assert.equal(match.ai.observation.attack.id, player.attack.id);
    assert.equal(match.tick - match.ai.observation.tick, 1);
    const saved = createXenoTrialsDuelCheckpointV197(getXenoTrialsSnapshotV96(match), config);
    assert.ok(saved);
    const resumed = structuredClone(saved.snapshot);
    setXenoTrialsPausedV96(resumed, false);
    const step = getXenoTrialsFighterV96(cpu.id).speed * XENO_TRIALS_GUARD_RETREAT_V213.speedRatio * dt;
    for (const state of [match, resumed]) {
      const [loader, guard] = state.fighters;
      const stamina = guard.stamina;
      advance(state, 1);
      assert.ok(Math.abs(guard.x - x + facing * step) < 1e-8);
      assert.equal(guard.facing, facing);
      assert.ok(Math.abs(guard.stamina - stamina + (5 + XENO_TRIALS_GUARD_RETREAT_V213.additionalDrain) * dt) < 1e-8);
      advance(state, 16);
      assert.ok(Math.abs(guard.x - x + facing * step * 2) < 1e-8);
      assert.ok(gapTo(loader, guard) > reach);
      assert.equal(guard.guard, true);
      assert.equal(guard.hp, hp);
      assert.equal(loader.attack.hit, false);
    }
    assert.deepEqual(getXenoTrialsSnapshotV96(resumed), getXenoTrialsSnapshotV96(match));
  }
});

test('hard Synth Guard keeps its ordinary block if the Power Loader clamp cannot be escaped', () => {
  for (const [margin, againstWall] of [[1, true], [12, false]]) {
    const { match, cpu } = clampRetreatFixture(margin);
    if (againstWall) {
      const offset = XENO_TRIALS_ARENA_V105.right - cpu.x;
      for (const fighter of match.fighters) fighter.x += offset;
    }
    const x = cpu.x;
    advance(match, 1, { special: true });
    advance(match, 33);
    assert.equal(cpu.x, x);
    assert.equal(cpu.guard, true);
    advance(match, 1);
    assert.equal(match.events.at(-1).type, 'block');
  }
});

test('the retreats respect walls, cost and a heavy too close to escape', () => {
  const pinned = heavyRetreatFixture('spitter', 2);
  const offset = XENO_TRIALS_ARENA_V105.right - pinned.cpu.x;
  pinned.cpu.x += offset;
  pinned.player.x += offset;
  const tired = heavyRetreatFixture('spitter', 2);
  const close = heavyRetreatFixture('synth-guard', 15);
  for (const { match, cpu } of [pinned, tired, close]) {
    advance(match, 1, { heavy: true });
    advance(match, 22);
    if (match === tired.match) cpu.stamina = 1;
    const x = cpu.x;
    advance(match, 1);
    assert.equal(cpu.x, x);
    assert.ok(!cpu.movesetV207?.evade);
    advance(match, 16);
    assert.equal(match.events.at(-1).type, match === tired.match ? 'guard-break' : 'block');
  }
});
