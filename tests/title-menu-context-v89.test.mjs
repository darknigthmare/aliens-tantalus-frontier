import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTitleMenuContextV89, titleMenuOwnerV89, sameTitleMenuOwnerV89 } from '../src/title-menu-context-v89.js';
import { createPlayerOnboardingV84, getPlayerOnboardingObjectiveV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88, getPlayerOpeningObjectiveV88 } from '../src/player-opening-v88.js';
import { buildTitleSceneModelV79 } from '../src/title-scene-catalog-v79.js';
import { createOpeningExerciseV89, getOpeningExerciseObjectiveV89 } from '../src/opening-exercise-v89.js';

const welcome = phase => ({ ...createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' }), phase });
const opening = phase => ({ ...createPlayerOpeningV88(), phase,
  qualificationId: 'm41a-qualification-v81:session-1:qualification', freight: 'medical',
  operationId: 'operation-1', completedOperationId: 'operation-1', outcome: 'success' });
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

test('V89 menu describes actual creation and welcome progress using domain wording', () => {
  assert.equal(resolveTitleMenuContextV89({ needsPlayerCreationV84: true }).kind, 'character-creation');
  for (const phase of ['wake', 'medical', 'briefing']) {
    const save = freeze({ onboardingV84: welcome(phase), openingV88: opening('qualification') });
    const model = resolveTitleMenuContextV89(save);
    assert.equal(model.kind, 'welcome');
    assert.equal(model.summary, getPlayerOnboardingObjectiveV84(save.onboardingV84).text);
    assert.equal(Object.isFrozen(model), true);
  }
});

test('V89 menu reuses every pending V88 objective, not a guessed mission completion', () => {
  for (const phase of ['berth', 'armory', 'qualification', 'relay', 'signal', 'manifest', 'ready']) {
    const save = freeze({ onboardingV84: welcome('complete'), openingV88: opening(phase) });
    const model = resolveTitleMenuContextV89(save);
    assert.equal(model.kind, 'opening', phase);
    assert.equal(model.summary, getPlayerOpeningObjectiveV88(save.openingV88, save.onboardingV84).text);
  }
  const completed = resolveTitleMenuContextV89({ onboardingV84: welcome('complete'), openingV88: opening('complete') });
  assert.equal(completed.kind, 'ship');
  assert.doesNotMatch(completed.summary, /terminée|victoire|réussie/i);
});

test('V89 interrupted exercise has priority over qualification, but never over unfinished welcome', () => {
  for (const phase of ['pending', 'console', 'return']) {
    const save = freeze({ onboardingV84: welcome('complete'), openingV88: opening('qualification'),
      openingExerciseV89: { ...createOpeningExerciseV89(), phase, sessionId: phase === 'pending' ? null : 'm41a-qualification-v81:session-1' } });
    const model = resolveTitleMenuContextV89(save);
    assert.equal(model.kind, 'exercise', phase);
    assert.equal(model.summary, getOpeningExerciseObjectiveV89(save.openingExerciseV89, save.openingV88, save.onboardingV84).text);
    assert.equal(resolveTitleMenuContextV89({ ...save, onboardingV84: welcome('medical') }).kind, 'welcome');
  }
  for (const exercise of [null, { schema: 90, phase: 'console' }, { schema: 89, phase: 'console', sessionId: 'invalid' },
    { schema: 89, phase: 'complete', sessionId: 'm41a-qualification-v81:session-1' }]) {
    const model = resolveTitleMenuContextV89({ onboardingV84: welcome('complete'), openingV88: opening('qualification'), openingExerciseV89: exercise });
    assert.equal(model.kind, 'opening', 'finishing the interruption does not claim the qualification or mission is finished');
  }
});

test('V89 operations and legacy saves retain honest continuation labels without invented onboarding', () => {
  const save = freeze({ strategy: { currentOperation: { id: 'operation-1' } }, onboardingV84: welcome('complete'), openingV88: opening('deployed') });
  const model = resolveTitleMenuContextV89(save);
  assert.equal(model.kind, 'operation');
  assert.equal(model.continueLabel, 'REPRENDRE L’OPÉRATION');
  assert.equal(model.summary, getPlayerOpeningObjectiveV88(save.openingV88, save.onboardingV84).text);
  for (const input of [null, {}, { onboardingV84: { schema: 999, phase: 'wake' } }, { openingV88: { schema: 999, phase: 'relay' } }]) {
    assert.equal(resolveTitleMenuContextV89(input).kind, 'ship');
  }
  assert.equal(resolveTitleMenuContextV89({ scene: 'mission' }).kind, 'operation-route');
});

test('V89 menu contexts never synthesize a station viewport or debris from port, world, mission or crisis', () => {
  const save = freeze({ profile: 1, createdAt: 88, scene: 'mission', worldId: 'world-01-acheron-lv-426',
    shipPortV1: { phase: 'docked', portId: 'frontier-civil-relay' }, hub: { activeCrisis: { kind: 'quarantine' } },
    strategy: { currentOperation: { id: 'operation-wreck-field', flags: { debris: true } } },
    presentation: { titleScene: { presetId: 'ember-quarantine', viewpoint: 'station-observer', stationId: 'forged' } } });
  const before = JSON.stringify(save);
  resolveTitleMenuContextV89(save);
  const scene = buildTitleSceneModelV79(save);
  assert.equal(scene.sceneContext.viewpoint, 'exterior');
  assert.equal(scene.sceneContext.debris, null);
  assert.ok(!scene.layers.some(layer => ['foreground', 'debris'].includes(layer.role)));
  assert.equal(JSON.stringify(save), before);
});

test('V89 menu ownership survives settings copies but rejects missing, changed profile or replaced timeline', () => {
  const save = freeze({ profile: 2, createdAt: 12345 });
  const owner = titleMenuOwnerV89(save);
  assert.equal(sameTitleMenuOwnerV89(owner, { ...save, updatedAt: 999999 }), true);
  assert.equal(sameTitleMenuOwnerV89(owner, { ...save, profile: 1 }), false);
  assert.equal(sameTitleMenuOwnerV89(owner, { ...save, createdAt: 12346 }), false);
  assert.equal(Object.isFrozen(owner), true);
  for (const value of [undefined, null, {}, { profile: 2 }, { profile: 2, createdAt: NaN }, { profile: 2, createdAt: 0 }]) {
    assert.equal(titleMenuOwnerV89(value), null);
    assert.equal(sameTitleMenuOwnerV89(owner, value), false);
  }
});
