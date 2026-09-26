import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTitleMenuContextV89 } from '../src/title-menu-context-v89.js';
import { buildTitleSceneModelV79 } from '../src/title-scene-catalog-v79.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { createPlayerOpeningV88 } from '../src/player-opening-v88.js';
import { createOpeningExerciseV89 } from '../src/opening-exercise-v89.js';
import { createPortMeridienV90, getPortMeridienObjectiveV90, PORT_PHASES_V90, PORT_RECEIPT_V90 } from '../src/port-meridien-v90.js';

const state = phase => ({ onboardingV84: { ...createPlayerOnboardingV84({ name: 'Alex Moreau', callsign: 'FOX-9' }), phase: 'complete' },
  openingV88: { ...createPlayerOpeningV88(), phase: 'ready', qualificationId: 'm41a-qualification-v81:session-1:qualification', freight: 'medical' },
  portMeridienV90: { ...createPortMeridienV90(), phase, freight: phase === 'pending' ? null : 'medical', receipt: phase === 'complete' ? PORT_RECEIPT_V90 : null } });
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

test('V90 title uses every actual quay objective before the old ready-to-deploy opening text', () => {
  for (const phase of PORT_PHASES_V90) {
    const save = freeze(state(phase)), before = JSON.stringify(save), model = resolveTitleMenuContextV89(save);
    assert.equal(model.kind, 'port-meridien', phase);
    assert.equal(model.summary, getPortMeridienObjectiveV90(save.portMeridienV90, save.openingV88, save.onboardingV84).text);
    assert.equal(model.continueLabel, phase === 'pending' ? 'REJOINDRE LE QUAI' : 'REPRENDRE LE QUAI');
    assert.equal(JSON.stringify(save), before); assert.equal(Object.isFrozen(model), true);
    const scene = buildTitleSceneModelV79(save);
    assert.equal(scene.sceneContext.viewpoint, 'exterior'); assert.equal(scene.sceneContext.debris, null);
  }
  assert.match(resolveTitleMenuContextV89(state('complete')).summary, /reste à explorer/);
});

test('V90 quay never takes priority over creation, welcome or interrupted qualification', () => {
  assert.equal(resolveTitleMenuContextV89({ ...state('pending'), needsPlayerCreationV84: true }).kind, 'character-creation');
  const save = state('pending'); save.onboardingV84.phase = 'medical';
  assert.equal(resolveTitleMenuContextV89(save).kind, 'welcome');
  save.onboardingV84.phase = 'complete'; save.openingV88.phase = 'qualification'; save.openingExerciseV89 = createOpeningExerciseV89();
  assert.equal(resolveTitleMenuContextV89(save).kind, 'exercise');
});

test('V90 missing, rejected and out-of-order quay state retains legacy continuation without fabricated progress', () => {
  for (const port of [null, undefined, {}, { schema: 91, phase: 'pending' }, { schema: 90, phase: 'carry' }, { schema: 90, phase: 'complete', freight: 'medical' }]) {
    assert.equal(resolveTitleMenuContextV89({ ...state('pending'), portMeridienV90: port }).kind, 'opening');
  }
  for (const phase of ['qualification', 'manifest', 'deployed', 'complete']) {
    const save = state('escort'); save.openingV88.phase = phase;
    assert.notEqual(resolveTitleMenuContextV89(save).kind, 'port-meridien', phase);
  }
  assert.notEqual(resolveTitleMenuContextV89({ ...state('pending'), openingV88: { schema: 999, phase: 'ready' } }).kind, 'port-meridien');
});
