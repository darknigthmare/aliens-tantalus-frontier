import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_EVADE_V207 } from '../src/xeno-trials-moveset-v207.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V222, XENO_TRIALS_PRACTICE_DRILLS_V223 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsAlternateSignatureV208 } from '../src/xeno-trials-signature-kit-v208.js';
import { getXenoTrialsSignatureV147 } from '../src/xeno-trials-signatures-v147.js';

const right = { right: true };
const left = { left: true };
const light = { light: true };
const dashRight = { right: true, evade: true };
const useTail = { signature2: true };
const useBite = { signature3: true };

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  function step(input = {}, count = 1) {
    for (let frame = 0; frame < count && coach.active; frame++) {
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
      coach.observe(input, true);
    }
  }
  function until(condition, input = {}, limit = 900) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++) step(input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  const gap = () => getXenoTrialsBodyGapV105(player, opponent, player.facing);
  return { match, coach, player, opponent, step, until, gap };
}

const contacts = (match, attacker = 'player') => match.events.filter(event => ['hit', 'block', 'guard-break'].includes(event.type) && event.attacker === attacker);

function establishMiss(trial) {
  trial.until(() => trial.gap() <= 90, right);
  assert.equal(trial.coach.view().cue, 'ESSAYEZ RAPIDE DEPUIS CETTE DISTANCE');
  assert.ok(trial.gap() > XENO_TRIALS_ATTACKS_V96.light.reach * getXenoTrialsFighterV96(trial.player.id).reach);
  trial.step(light);
  trial.until(() => trial.coach.view().cue === 'ESQUIVE AVANT, PUIS RAPIDE');
  assert.ok(trial.match.events.some(event => event.type === 'attack' && event.side === 'player' && event.kind === 'light'));
  assert.equal(contacts(trial.match).length, 0);
}

test('a measured Light whiff is converted to contact by the native forward-evade attack', () => {
  for (const travelTick of [8, XENO_TRIALS_EVADE_V207.travelTicks - 1]) {
    const trial = start('range-advance');
    establishMiss(trial);
    const { match, coach, player, gap, step, until } = trial;
    const before = { gap: gap(), x: player.x };
    step(dashRight);
    until(() => player.movesetV207?.evade?.ticks === travelTick);
    const dash = match.events.find(event => event.type === 'evade-v207');
    assert.equal(dash.direction, 1);
    step(light);
    assert.equal(player.attack.kind, 'advance');
    until(() => coach.view().state === 'complete');
    const [contact] = contacts(match);
    assert.equal(contact.type, 'hit');
    assert.ok(contact.tick > dash.tick && player.attack.hit);
    assert.ok(player.x > before.x && gap() < before.gap);
    assert.equal(match.config.rulesV119.noSpecial, true);
  }
});

test('late Light during evade recovery and a walk-in Light cannot substitute for the requested chain', () => {
  const trial = start('range-advance');
  establishMiss(trial);
  const { match, coach, player, step, until } = trial;
  step(dashRight);
  until(() => player.movesetV207?.evade?.ticks === XENO_TRIALS_EVADE_V207.travelTicks + 2);
  step(light);
  assert.equal(player.attack, null);
  until(() => !player.movesetV207?.evade);
  assert.equal(coach.view().index, 2);
  assert.equal(contacts(match).length, 0);
  step(light);
  until(() => coach.view().state === 'retry');
  assert.equal(coach.view().index, 2);
  assert.equal(player.attack.kind, 'light');
  assert.equal(contacts(match).length, 1);
});

test('a real rear evade beats the Loader’s clamp and a tail strike hits within the same recovery', () => {
  for (const delay of [0, 20]) {
    const { match, coach, player, opponent, step, until } = start('clamp-punish');
    until(() => coach.view().cue === 'ESQUIVE ARRIÈRE SANS MARCHER');
    const clamp = getXenoTrialsSignatureV147(getXenoTrialsFighterV96(opponent.id));
    const clampId = opponent.attack.id;
    const health = player.hp;
    const origin = player.x;
    step({}, delay);
    step({ evade: true });
    until(() => coach.view().cue === 'PERCUSSION CAUDALE PENDANT LA RÉCUPÉRATION');
    assert.equal(opponent.attack.id, clampId);
    assert.equal(opponent.attack.hit, false);
    assert.ok(player.x < origin && player.y === 0 && opponent.y === 0);
    const startReceipt = match.events.find(event => event.signatureIdV147 === clamp.id);
    assert.equal(startReceipt.id, clampId + 1);
    assert.ok(opponent.attack.age >= clamp.spec.startup + clamp.spec.active);
    step({}, delay);
    step(useTail);
    until(() => coach.view().state === 'complete');
    const [hit] = contacts(match);
    assert.equal(hit.type, 'hit');
    assert.ok((hit.tick - startReceipt.tick + 1) * XENO_TRIALS_STEP_V96 < clamp.spec.startup + clamp.spec.active + clamp.spec.recovery);
    assert.equal(opponent.attack, null);
    assert.equal(player.hp, health);
  }
});

test('an ordinary backward walk and a late tail strike cannot complete the clamp workshop', () => {
  const walked = start('clamp-punish');
  walked.until(() => walked.coach.view().index === 1);
  walked.until(() => walked.coach.view().state === 'retry', left);
  assert.equal(walked.coach.view().index, 1);
  assert.equal(contacts(walked.match, 'opponent').length, 0);
  assert.equal(walked.match.events.some(event => event.type === 'evade-v207'), false);

  const late = start('clamp-punish');
  late.until(() => late.coach.view().index === 1);
  late.step({ evade: true });
  late.until(() => late.coach.view().index === 2);
  late.until(() => late.coach.view().state === 'retry');
  assert.equal(contacts(late.match).length, 0);
  assert.equal(late.coach.view().index, 2);
});

test('tail and bite selections hit at their measured ranges after the actual shared cooldown', () => {
  const { match, coach, player, opponent, step, until, gap } = start('signature-range');
  const definition = getXenoTrialsFighterV96(player.id);
  const tail = getXenoTrialsAlternateSignatureV208(definition, 'signature-2');
  const bite = getXenoTrialsAlternateSignatureV208(definition, 'signature-3');
  until(() => gap() <= 100, right);
  assert.equal(coach.view().cue, 'PERCUSSION CAUDALE À DISTANCE');
  const midrange = gap();
  assert.ok(midrange > bite.spec.reach * definition.reach && midrange <= tail.spec.reach * definition.reach);
  const targetX = opponent.x;
  step(useTail);
  until(() => coach.view().index === 2);
  assert.ok(opponent.x > targetX && player.specialCooldown > 0);
  until(() => coach.view().cue === 'MORSURE INTERNE AU CONTACT', right);
  assert.ok(gap() <= bite.spec.reach * definition.reach);
  assert.equal(player.specialCooldown, 0);
  step(useBite);
  until(() => coach.view().state === 'complete');
  const strikes = match.events.filter(event => event.type === 'attack' && event.side === 'player');
  assert.deepEqual(strikes.map(event => event.signatureIdV208), [tail.id, bite.id]);
  assert.equal(contacts(match).length, 2);
  assert.ok(strikes[1].tick > contacts(match)[0].tick);
});

test('the same native bite falls short at the initial tail range and never awards the midrange objective', () => {
  const { match, coach, player, step, until, gap } = start('signature-range');
  until(() => gap() <= 100, right);
  step(useBite);
  assert.equal(player.attack.kind, 'signature-3');
  until(() => !player.attack);
  assert.equal(contacts(match).length, 0);
  assert.equal(coach.view().index, 1);
  assert.equal(coach.view().state, 'active');
});

test('the 50 workshops preserve all 47 prior marks and award three practice marks only', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V223.length, 50);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V223.slice(0, 47), XENO_TRIALS_PRACTICE_DRILLS_V222);
  const historical = XENO_TRIALS_PRACTICE_DRILLS_V222.map(entry => entry.id);
  const additions = ['range-advance', 'clamp-punish', 'signature-range'];
  const baseline = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: historical });
  let profile = baseline;
  for (const id of additions) {
    const completion = completeXenoTrialsPracticeV207(profile, id);
    assert.equal(completion.applied, true);
    profile = completion.state;
    assert.equal(completeXenoTrialsPracticeV207(profile, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(profile), { ...baseline, practiceClearedV207: [...historical, ...additions] });
});
