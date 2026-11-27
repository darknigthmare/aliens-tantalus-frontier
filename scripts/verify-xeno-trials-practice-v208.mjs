import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V208 } from '../src/xeno-trials-practice-v207.js';
import { configureXenoTrialsSandboxV208, beginXenoTrialsV96, completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

function prepare(id, settings) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id, settings), introSeconds: 0, holdRoundTransition: true });
  const coach = createXenoTrialsPracticeV207(id, match, settings);
  assert.ok(coach);
  function tick(controls = {}) {
    if (!coach.active) return;
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, controls, coach.opponentInput(controls));
    coach.observe();
  }
  function step(controls = {}, ticks = 1) {
    for (let frame = 0; frame < ticks && coach.active; frame++) tick(typeof controls === 'function' ? controls(match) : controls);
  }
  return { match, coach, tick, step };
}

test('the original drill IDs persist while V208 expands the available curriculum', () => {
  assert.equal(new Set(XENO_TRIALS_PRACTICE_DRILLS_V208.map(lesson => lesson.id)).size, 14);
  const profile = createXenoTrialsProgressV96();
  const legacy = { ...profile, practiceClearedV207: ['guard', 'super'] };
  const extended = completeXenoTrialsPracticeV207(legacy, 'draw');
  assert.deepEqual(extended.state.practiceClearedV207, ['guard', 'super', 'draw']);
  assert.equal(completeXenoTrialsPracticeV207(legacy, 'sandbox').applied, false);
});

test('mirror inputs resolve three real simultaneous KOs and a native terminal draw', () => {
  const { match, coach, step } = prepare('draw');
  for (let round = 1; round <= 3; round++) {
    step({ right: true }, 190);
    step({ light: true }, 24);
    assert.equal(match.round, round);
    assert.equal(match.roundReason, 'double-ko');
    assert.equal(match.roundWinner, 'draw');
    assert.deepEqual(match.wins, { player: 0, opponent: 0 });
    if (round < 3) {
      assert.equal(match.phase, 'round-over');
      assert.equal(match.result, null);
      assert.equal(nextXenoTrialsRoundV96(match), true);
    }
  }
  assert.equal(coach.view().state, 'complete');
  assert.equal(match.result.winner, 'draw');
  assert.equal(match.result.rounds, 3);
  assert.deepEqual(match.fighters.map(fighter => fighter.stats.hits), [3, 3]);
});

test('inactivity with matching health can end the same drill in a real timeout draw', () => {
  const { match, coach, step } = prepare('draw');
  for (let round = 1; round <= 3; round++) {
    step({}, 1810);
    assert.equal(match.roundReason, 'time');
    assert.equal(match.roundWinner, 'draw');
    if (round < 3) assert.equal(nextXenoTrialsRoundV96(match), true);
  }
  assert.equal(coach.view().state, 'complete');
  assert.equal(match.result.winner, 'draw');
  assert.deepEqual(match.fighters.map(fighter => fighter.stats.hits), [0, 0]);
});

test('win, loss and a playable third round use native round transitions and fresh actors', () => {
  const { match, coach, step } = prepare('rounds');
  step({ right: true }, 190);
  step({ light: true }, 32);
  assert.equal(match.roundWinner, 'player');
  assert.equal(match.result, null);
  assert.equal(coach.view().index, 1);
  assert.equal(nextXenoTrialsRoundV96(match), true);
  step({}, 400);
  assert.equal(match.roundWinner, 'opponent');
  assert.equal(match.result, null);
  assert.equal(coach.view().index, 2);
  assert.equal(nextXenoTrialsRoundV96(match), true);
  step();
  assert.equal(coach.view().state, 'complete');
  assert.equal(match.phase, 'active');
  assert.deepEqual(match.fighters.map(fighter => [fighter.hp, fighter.attack]), [[1, null], [1, null]]);
  assert.deepEqual(match.wins, { player: 1, opponent: 1 });
});

test('a real impact before the Warrior tail percussion cancels its contact window', () => {
  const { match, coach, step } = prepare('interrupt');
  step(current => ({ light: Boolean(current.fighters[1].attack?.kind === 'signature-2') }), 850);
  assert.equal(coach.view().state, 'complete');
  assert.ok(match.events.some(event => event.type === 'attack' && event.kind === 'signature-2' && event.side === 'opponent'));
  assert.ok(match.events.some(event => event.type === 'hit' && event.side === 'opponent' && event.attacker === 'player'));
  assert.equal(match.fighters[1].stats.hits, 0);
  assert.equal(match.fighters[0].hp, 220);
});

test('ordinary guarding does not validate a parry; a timed parry unlocks a real punish', () => {
  const { match, coach, step } = prepare('parry');
  step({ guard: true }, 240);
  assert.equal(coach.view().index, 0);
  assert.ok(match.fighters[0].stats.blocks > 0);
  step(current => {
    const attack = current.fighters[1].attack;
    return coach.view().index === 1 ? { light: true } : { parry: attack?.kind === 'heavy' && attack.age >= .2 };
  }, 900);
  assert.equal(coach.view().state, 'complete');
  const parry = match.events.find(event => event.type === 'parry-v208');
  const punish = match.events.find(event => event.type === 'hit' && event.attacker === 'player');
  assert.equal(parry.damage, 0);
  assert.ok(parry.tick < punish.tick && punish.tick < parry.tick + 42);
});

test('the Warden parry opens one charged native Super riposte and its actual contact', () => {
  const { match, coach, step } = prepare('riposte');
  step(current => {
    const attack = current.fighters[1].attack;
    return coach.view().index === 1 ? { guard: true, super: true }
      : { parry: coach.view().index === 0 && attack?.kind === 'heavy' && attack.age >= .2 };
  }, 900);
  assert.equal(coach.view().state, 'complete');
  assert.equal(match.fighters[0].superMeterV148, 0);
  assert.equal(match.events.filter(event => event.kind === 'super-riposte').length, 1);
  assert.ok(match.events.some(event => event.type === 'parry-v208' && event.side === 'player'));
  assert.ok(match.events.some(event => event.type === 'hit' && event.attacker === 'player'));
});

test('sandbox settings survive saves without opening rated progress and select real opponents', () => {
  const defaults = normalizeXenoTrialsProgressV96(createXenoTrialsProgressV96());
  const settings = { playerId: 'import-game-afe2-warden', opponentId: 'drive-v123-fte-pathogen-queen-right-v13',
    stageId: 'reactor-ring', behavior: 'guard', readySupers: true, noSpecial: true, roundSeconds: 99, roundsToWin: 3 };
  const configured = configureXenoTrialsSandboxV208(defaults, settings);
  assert.equal(configured.applied, true);
  const profile = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(configured.state)));
  assert.deepEqual(profile, { ...defaults, practiceSandboxV208: { ...settings, difficulty: 'normal' } });
  assert.equal(configureXenoTrialsSandboxV208(profile, settings).unchanged, true);
  const rated = beginXenoTrialsV96(profile, { playerId: 'warrior', opponentId: 'runner' });
  assert.equal(rated.applied, true);
  assert.equal(configureXenoTrialsSandboxV208(rated.state, { behavior: 'cpu' }).applied, false);

  const run = prepare('sandbox', profile.practiceSandboxV208);
  assert.equal(run.match.config.stageId, 'reactor-ring');
  assert.equal(run.match.config.roundSeconds, 99);
  assert.equal(run.match.config.roundsToWin, 3);
  assert.equal(run.match.config.rulesV119.noSpecial, true);
  assert.deepEqual(run.match.fighters.map(fighter => fighter.superMeterV148), [100, 100]);
  run.step({ super: true }, 20);
  assert.equal(run.match.fighters[0].attack, null);
  assert.equal(run.match.fighters[1].guard, true);
  assert.equal(run.coach.view().sandbox, true);
  assert.equal(run.coach.view().objectives.length, 0);
  const cpu = prepare('sandbox', { behavior: 'cpu' });
  cpu.step({}, 100);
  assert.equal(cpu.match.opponentInputSourceV163, 'cpu');
  assert.notEqual(cpu.match.fighters[1].x, 690);
});
