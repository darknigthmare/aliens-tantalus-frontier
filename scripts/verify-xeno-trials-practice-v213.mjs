import assert from 'node:assert/strict';
import test from 'node:test';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { currentLanguageV185, setLanguageV185 } from '../src/i18n-v185.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { canStartXenoTrialsGroundBreakV213, XENO_TRIALS_GROUND_BREAK_V213 } from '../src/xeno-trials-grapple-v213.js';
import {
  createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207, XENO_TRIALS_PRACTICE_DRILLS_V212, XENO_TRIALS_PRACTICE_DRILLS_V213,
} from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

function prepare(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  assert.ok(coach);
  function step(input = {}, frames = 1) {
    for (let frame = 0; frame < frames && coach.active; frame++) {
      const command = typeof input === 'function' ? input() : input;
      stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, command, coach.opponentInput(command));
      coach.observe(command, true);
    }
  }
  return { match, coach, step, player: match.fighters[0], opponent: match.fighters[1] };
}

test('the grab-counter exercise opens on the native window and clears via the exact paid counter', () => {
  const { match, player, coach, step } = prepare('grab-counter');
  step(() => match.grappleV153 ? { guard: true } : {}, 175);
  assert.equal(coach.view().index, 1);
  assert.equal(coach.view().cue, 'MAINTENEZ GARDE');
  assert.equal(coach.hasCueChangeV213(), true);
  assert.equal(coach.hasCueChangeV213(), false);
  step({ guard: true }, 4);
  assert.ok(canStartXenoTrialsGroundBreakV213(match, player));
  assert.equal(coach.view().cue, 'RAPIDE MAINTENANT');
  assert.equal(coach.hasCueChangeV213(), true);
  const before = player.stamina;
  step({ guard: true, light: true });
  assert.equal(coach.view().index, 2);
  assert.equal(coach.view().cue, 'CONTRE EN COURS');
  assert.equal(player.stamina, before - XENO_TRIALS_GROUND_BREAK_V213.cost);
  step({ guard: true }, 15);
  assert.equal(coach.view().state, 'complete');
  const start = match.events.find(event => event.type === 'grapple-break-start-v213');
  const end = match.events.find(event => event.type === 'grapple-end-v153');
  assert.equal(start.grabIdV212, 'warrior::grab');
  assert.equal(start.grappleId, end.grappleId);
  assert.equal(end.reason, 'countered');
  assert.equal(match.result, null);
});

test('holding guard without a fresh light command only performs the standard escape and cannot clear the counter exercise', () => {
  const { match, coach, step } = prepare('grab-counter');
  step(() => match.grappleV153 ? { guard: true } : {}, 500);
  assert.equal(coach.view().state, 'retry');
  assert.equal(coach.view().index, 1);
  assert.ok(match.events.some(event => event.type === 'grapple-end-v153' && event.reason === 'escaped'));
  assert.ok(!match.events.some(event => event.type === 'grapple-break-start-v213'));
});

test('only the backward low evade clears an in-range heavy strike without a contact', () => {
  for (const crouch of [false, true]) {
    const { match, player, opponent, coach, step } = prepare('low-retreat');
    const x = player.x, hp = player.hp;
    let pressed = false;
    step(() => {
      if (pressed || opponent.attack?.kind !== 'heavy') return {};
      pressed = true;
      return { crouch, evade: true };
    }, 400);
    const evade = match.events.find(event => event.type === 'evade-v207');
    assert.ok(evade);
    assert.equal(evade.variantV213, crouch ? 'low-retreat' : undefined);
    assert.equal(player.hp, hp);
    assert.ok((player.x - x) * evade.direction >= 8);
    assert.equal(coach.view().state, crouch ? 'complete' : 'retry');
  }
});

test('the guarded retreat requires displacement before a native block and rejects a stationary block', () => {
  for (const retreats of [false, true]) {
    const { match, player, opponent, coach, step } = prepare('guarded-retreat');
    step(() => {
      if (opponent.attack?.kind !== 'heavy') return {};
      return { guard: true, ...(retreats ? { [player.x < opponent.x ? 'left' : 'right']: true } : {}) };
    }, 450);
    assert.ok(match.events.some(event => event.type === 'block' && event.side === 'player' && event.attacker === 'opponent'));
    assert.equal(coach.view().state, retreats ? 'complete' : 'retry');
    assert.equal(coach.view().index, retreats ? 3 : 1);
    assert.equal(match.result, null);
  }
});

test('all 28 earlier workshop marks survive normalization and new workshops only append a completion', () => {
  const historical = XENO_TRIALS_PRACTICE_DRILLS_V212.map(entry => entry.id);
  const lessons = XENO_TRIALS_PRACTICE_DRILLS_V213.map(entry => entry.id);
  assert.equal(new Set(lessons).size, historical.length + 3);
  assert.deepEqual(lessons.slice(0, historical.length), historical);
  let progress = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: historical });
  assert.deepEqual(progress.practiceClearedV207, historical);
  for (const id of lessons.slice(historical.length)) {
    const completed = completeXenoTrialsPracticeV207(progress, id);
    assert.deepEqual(completed.state, { ...progress, practiceClearedV207: [...progress.practiceClearedV207, id] });
    progress = completed.state;
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(progress).practiceClearedV207, lessons);
});

test('the English cue stays translated when composed with the current workshop objective', async () => {
  const { coach, match, step } = prepare('grab-counter');
  step(() => match.grappleV153 ? { guard: true } : {}, 179);
  const view = coach.view();
  const prior = currentLanguageV185();
  const options = { document: null, persist: false };
  await loadCatalogV185();
  try {
    setLanguageV185('en', options);
    assert.equal(autoTranslateV185(`${view.objectives[view.index]} · ${view.cue}`), 'Start the counter with Guard and Light · PRESS LIGHT NOW');
    assert.equal(autoTranslateV185('CONTRE · GARDE + RAPIDE'), 'COUNTER · GUARD + LIGHT');
  } finally {
    setLanguageV185(prior, options);
  }
});
