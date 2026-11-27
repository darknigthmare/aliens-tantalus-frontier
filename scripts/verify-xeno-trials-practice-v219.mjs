import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_PARRY_V208 } from '../src/xeno-trials-defense-v208.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_GROUND_RELEASE_V218 } from '../src/xeno-trials-grapple-v153.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V218, XENO_TRIALS_PRACTICE_DRILLS_V219 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
  }
  function until(condition, input = {}, limit = 1100) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++) step(input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until };
}

const grab = { guard: true, heavy: true };

function acquiredGrab() {
  const trial = start('grab-disengage');
  const { match, coach, player, opponent, until } = trial;
  until(() => getXenoTrialsBodyGapV105(player, opponent) <= 5, { right: true });
  until(() => coach.view().index === 1, grab);
  assert.equal(match.grappleV153.grabIdV212, 'warrior::grab');
  return trial;
}

test('a fresh release chord frees the same grounded hold, then only clearing the Commando’s true reach completes the drill', () => {
  const { match, coach, player, opponent, step, until } = acquiredGrab();
  const held = match.grappleV153;
  const heldGap = getXenoTrialsBodyGapV105(player, opponent, held.facingV212);
  until(() => coach.view().cue === 'GARDE + LOURDE POUR RELÂCHER', grab);
  step(grab);
  assert.equal(match.grappleV153, held);
  const before = { x: player.x, hp: opponent.hp };
  step({ guard: true });
  step(grab);
  const end = match.events.find(event => event.type === 'grapple-end-v153');
  assert.equal(end.reason, 'released');
  assert.equal(end.grappleId, held.id);
  assert.equal(player.x, before.x - held.facingV212 * XENO_TRIALS_GROUND_RELEASE_V218.separation);
  assert.equal(opponent.hp, before.hp);
  assert.ok(getXenoTrialsBodyGapV105(player, opponent) > heldGap);
  assert.equal(coach.view().cue, 'RECULEZ HORS DE PORTÉE');
  while (player.stun > 0) step();
  assert.equal(coach.view().index, 2);
  const data = getXenoTrialsFighterV96(opponent.id);
  const reach = getXenoTrialsAttackV147(data, 'light', XENO_TRIALS_ATTACKS_V96.light).reach * data.reach;
  assert.ok(getXenoTrialsBodyGapV105(player, opponent) <= reach);
  until(() => coach.view().state === 'complete', { left: true });
  assert.ok(getXenoTrialsBodyGapV105(player, opponent) > reach);
});

test('a held chord and an ordinary defender escape never certify a voluntary release', () => {
  const { match, coach, until } = acquiredGrab();
  until(() => coach.view().state === 'retry', grab);
  assert.equal(coach.view().index, 1);
  assert.equal(match.events.find(event => event.type === 'grapple-end-v153').reason, 'escaped');
});

test('Prowler clears the whole live corrosive band in one native jump with its full body', () => {
  const { match, coach, player, step, until } = start('active-hazard-vault');
  until(() => coach.view().cue === 'SAUTEZ PAR-DESSUS LA FUITE');
  const hazard = getXenoTrialsStageHazardViewV188(match);
  const [zone] = hazard.zones;
  const hp = player.hp;
  assert.equal(hazard.kind, 'corrosive');
  assert.equal(hazard.phase, 'active');
  assert.equal(hazard.cycle, 0);
  assert.ok(getXenoTrialsBodyBoundsV105(player).left >= zone.right);
  assert.equal(coach.hasCueChangeV213(), true);
  step({ jump: true, left: true });
  until(() => coach.view().state === 'complete', { left: true });
  assert.ok(getXenoTrialsBodyBoundsV105(player).right <= zone.left && player.y > zone.top);
  assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'active');
  assert.equal(match.stageHazardsV188.playerDamage, 0);
  assert.equal(player.hp, hp);
});

test('guard leaves the grounded player exposed to the same live band, and a hop in place does not count', () => {
  const grounded = start('active-hazard-vault');
  grounded.until(() => grounded.coach.view().index === 1);
  const [zone] = getXenoTrialsStageHazardViewV188(grounded.match).zones;
  grounded.until(() => getXenoTrialsBodyBoundsV105(grounded.player).left < zone.right, { left: true });
  grounded.step({ guard: true });
  assert.equal(grounded.player.guard, true);
  const hp = grounded.player.hp;
  grounded.until(() => grounded.coach.view().state === 'retry', { guard: true });
  const contact = grounded.match.events.find(event => event.type === 'stage-hazard-contact-v188' && event.actorId === 'player');
  assert.equal(contact.kind, 'corrosive');
  assert.equal(contact.damage, hp - grounded.player.hp);
  assert.equal(grounded.match.stageHazardsV188.playerDamage, contact.damage);

  const short = start('active-hazard-vault');
  short.until(() => short.coach.view().index === 2);
  short.step({ jump: true });
  assert.ok(short.player.y > 0);
  short.until(() => short.coach.view().state === 'retry');
  assert.equal(short.match.stageHazardsV188.playerDamage, 0);
});

test('the same low attack is parried under no-special rules and confirmed with a standing Light before expiry', () => {
  const { match, coach, player, opponent, step, until } = start('low-parry-counter');
  const hp = player.hp;
  assert.equal(match.config.rulesV119.noSpecial, true);
  step({ special: true });
  assert.equal(player.attack, null);
  until(() => coach.view().cue === 'BAS + PARADE MAINTENANT', { crouch: true });
  const lowId = opponent.attack.id;
  assert.equal(opponent.attack.kind, 'low');
  step({ crouch: true, parry: true });
  until(() => coach.view().cue === 'RELÂCHEZ BAS, PUIS RAPIDE', { crouch: true });
  const parry = match.events.find(event => event.type === 'parry-v208');
  assert.equal(parry.attackIdV208, lowId);
  assert.equal(player.hp, hp);
  step({ light: true });
  until(() => coach.view().state === 'complete');
  const hit = match.events.find(event => event.type === 'hit' && event.attacker === 'player');
  assert.equal(player.attack.kind, 'light');
  assert.ok(hit.tick > parry.tick && hit.tick - parry.tick < XENO_TRIALS_PARRY_V208.openingTicks);
});

test('standing parry and low guard are rejected, and a given opening can expire without a punish', () => {
  for (const input of [{ parry: true }, { crouch: true, guard: true }]) {
    const { match, coach, step, until } = start('low-parry-counter');
    until(() => coach.view().cue === 'BAS + PARADE MAINTENANT', { crouch: true });
    step(input);
    until(() => coach.view().state === 'retry', input);
    assert.equal(coach.view().index, 1);
    assert.ok(match.events.some(event => event.type === (input.guard ? 'block' : 'hit') && event.side === 'player'));
    assert.equal(match.events.some(event => event.type === 'parry-v208'), false);
  }

  const late = start('low-parry-counter');
  late.until(() => late.coach.view().cue === 'BAS + PARADE MAINTENANT', { crouch: true });
  late.step({ crouch: true, parry: true });
  late.until(() => late.coach.view().index === 2, { crouch: true });
  late.until(() => late.coach.view().state === 'retry');
  assert.equal(late.coach.view().index, 2);
  assert.equal(late.match.events.some(event => event.type === 'hit' && event.attacker === 'player'), false);
});

test('38 workshops preserve the 35 historic completions and the rated economy', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V219.length, 38);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V219.slice(0, 35), XENO_TRIALS_PRACTICE_DRILLS_V218);
  const historical = XENO_TRIALS_PRACTICE_DRILLS_V218.map(entry => entry.id);
  const baseline = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: historical });
  const additions = ['grab-disengage', 'active-hazard-vault', 'low-parry-counter'];
  let state = baseline;
  for (const id of additions) {
    const completed = completeXenoTrialsPracticeV207(state, id);
    assert.equal(completed.applied, true);
    state = completed.state;
    assert.equal(completeXenoTrialsPracticeV207(state, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(state), { ...baseline, practiceClearedV207: [...historical, ...additions] });
});
