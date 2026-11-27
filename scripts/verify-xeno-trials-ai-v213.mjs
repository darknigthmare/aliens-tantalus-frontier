import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsDuelCheckpointV197 } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, setXenoTrialsPausedV96, XENO_TRIALS_ATTACKS_V96,
  stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as bounds } from '../src/xeno-trials-geometry-v105.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

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
