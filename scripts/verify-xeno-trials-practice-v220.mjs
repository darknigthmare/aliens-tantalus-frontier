import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_GROUND_GRAB_KIND_V212 } from '../src/xeno-trials-grapple-v212.js';
import { getXenoTrialsOperationViewV188 } from '../src/xeno-trials-operations-v188.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V219,
  XENO_TRIALS_PRACTICE_DRILLS_V220 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
  }
  function until(condition, input = {}, limit = 1100) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++)
      step(typeof input === 'function' ? input() : input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until };
}

const guard = { guard: true };
const crouchGuard = { guard: true, crouch: true };
const charge = { interact: true };
const west = match => getXenoTrialsOperationViewV188(match).entities[0];
const playerBlocks = match => match.events.filter(event => event.type === 'block' && event.side === 'player');

test('facing Guard prevents the accepted grab and Light punishes the same live recovery', () => {
  const { match, coach, player, opponent, step, until } = start('grab-denial');
  until(() => coach.view().cue === 'GARDEZ FACE À LA PRISE');
  const accepted = opponent.attack.id;
  assert.equal(opponent.attack.kind, XENO_TRIALS_GROUND_GRAB_KIND_V212);
  until(() => coach.view().cue === 'RAPIDE PENDANT LA RÉCUPÉRATION', guard);
  const [block] = playerBlocks(match);
  assert.ok(block && block.damage > 0);
  assert.equal(opponent.attack.id, accepted);
  assert.equal(match.events.some(event => event.type === 'grapple-start-v153'), false);
  step({ light: true });
  until(() => coach.view().state === 'complete');
  const response = match.events.find(event => event.type === 'hit' && event.attacker === 'player');
  assert.ok(response.tick > block.tick);
  assert.equal(player.attack.kind, 'light');
  assert.equal(opponent.attack, null);
});

test('the same unguarded grab really captures, and a blocked grab alone does not clear the workshop', () => {
  const failed = start('grab-denial');
  failed.until(() => failed.coach.view().state === 'retry');
  assert.equal(failed.coach.view().index, 1);
  assert.equal(failed.match.grappleV153?.attacker, 'opponent');
  assert.equal(failed.match.events.some(event => event.type === 'grapple-start-v153'), true);

  const late = start('grab-denial');
  late.until(() => late.coach.view().cue === 'RAPIDE PENDANT LA RÉCUPÉRATION', guard);
  late.until(() => late.coach.view().state === 'retry');
  assert.equal(late.coach.view().index, 2);
  assert.equal(late.match.events.some(event => event.type === 'hit' && event.attacker === 'player'), false);
});

test('the actual hard Runner changes its third response based on the two witnessed blocks and current stance', () => {
  for (const early of [true, false]) {
    const { match, coach, opponent, until } = start('guard-pattern');
    assert.equal(match.config.rulesV119.noSpecial, true);
    assert.equal(match.config.difficulty, 'hard');
    until(() => coach.view().cue === 'ABAISSEZ LA GARDE', guard);
    assert.equal(playerBlocks(match).length, 2);
    until(() => coach.view().index === 2, early ? crouchGuard : guard);
    const third = opponent.attack.kind;
    assert.equal(match.opponentInputSourceV163, 'cpu');
    assert.equal(early ? ['light', 'heavy'].includes(third) : third === 'low', true);
    assert.equal(coach.view().cue, early ? 'ABAISSEZ LA GARDE' : 'BAS + GARDE CONTRE LA FRAPPE BASSE');
    until(() => coach.view().state === 'complete', crouchGuard);
    assert.equal(playerBlocks(match).length, 3);
    assert.equal(opponent.stats.specials, 0);
  }
});

test('remaining upright lets the real low strike through the exact practiced guard pattern', () => {
  const { match, coach, player, until } = start('guard-pattern');
  until(() => coach.view().cue === 'BAS + GARDE CONTRE LA FRAPPE BASSE', guard);
  assert.equal(playerBlocks(match).length, 2);
  const health = player.hp;
  until(() => coach.view().state === 'retry', guard);
  assert.equal(coach.view().index, 2);
  assert.ok(player.hp < health);
  assert.equal(playerBlocks(match).length, 2);
  assert.equal(match.events.at(-1).type, 'hit');
});

test('the same native relay loses charge to the hostile and then locks in after the traced neutralization', () => {
  const { match, coach, player, step, until } = start('relay-contest');
  assert.equal(west(match).progress, 0);
  assert.equal(match.operationV188.operationId, 'xto218-bridge-relays');
  until(() => coach.view().cue === 'MAINTENEZ LA CHARGE', charge);
  assert.equal(west(match).progress, 32);
  assert.equal(west(match).contested, false);
  let before;
  until(() => coach.view().cue === 'NEUTRALISEZ LES CONTACTS DU RELAIS', () => {
    before = west(match).progress;
    return charge;
  });
  assert.equal(west(match).contested, true);
  assert.equal(west(match).progress, before - 2);
  const entrant = match.fighters[1];
  assert.equal(entrant.hp, 15);
  until(() => coach.view().cue === 'REPRENEZ LA CHARGE DU RELAIS', () => ({
    heavy: !player.attack && !player.previousInput.heavy
      && match.fighters.slice(1).some(enemy => getXenoTrialsBodyGapV105(player, enemy) <= 60),
  }));
  assert.equal(west(match).contested, false);
  assert.equal(match.fighters.includes(entrant), false);
  assert.equal(match.events.some(event => event.type === 'hit' && event.attacker === 'player'
    && event.targetInstanceV180 === entrant.instanceIdV180), true);
  const chargeLeft = west(match).progress;
  for (let frame = 0; frame < 30; frame++) step();
  assert.ok(west(match).progress < chargeLeft);
  assert.equal(coach.view().index, 3);
  until(() => coach.view().state === 'complete', charge);
  assert.deepEqual(match.operationV188.completed, [true, false, false]);
  const receipt = match.events.find(event => event.type === 'operation-objective-v188');
  assert.equal(receipt.objectiveId, west(match).id);
  assert.equal(match.result, null);
});

test('charge decay without Interaction and the operation’s sibling contract do not satisfy prerequisites', () => {
  const { match, coach, until } = start('relay-contest');
  until(() => coach.view().index === 1, charge);
  until(() => coach.view().state === 'retry');
  assert.equal(coach.view().index, 1);
  assert.equal(west(match).progress, 0);
  assert.equal(west(match).contested, false);

  const staleConfig = { ...getXenoTrialsPracticeConfigV207('relay-contest'), operationV188: { id: 'xto219-battery-triangulation' } };
  const wrongContract = createXenoTrialsMatchV96(staleConfig);
  assert.equal(wrongContract.hordeV180.protocolId, match.hordeV180.protocolId);
  assert.equal(createXenoTrialsPracticeV207('relay-contest', wrongContract), null);
});

test('41 workshops preserve the 38 historical completion marks and grant only practice marks', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V220.length, 41);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V220.slice(0, 38), XENO_TRIALS_PRACTICE_DRILLS_V219);
  const old = XENO_TRIALS_PRACTICE_DRILLS_V219.map(entry => entry.id);
  const additions = ['grab-denial', 'guard-pattern', 'relay-contest'];
  const prior = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: old });
  let state = prior;
  for (const id of additions) {
    const completed = completeXenoTrialsPracticeV207(state, id);
    assert.equal(completed.applied, true);
    state = completed.state;
    assert.equal(completeXenoTrialsPracticeV207(state, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(state), { ...prior, practiceClearedV207: [...old, ...additions] });
});
