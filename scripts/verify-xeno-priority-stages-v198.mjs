import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { XENO_TRIALS_STAGES_V96 as catalog } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_PRIORITY_STAGES_V198 as stages } from '../src/xeno-trials-priority-stages-v198.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsStagePageV192, getXenoTrialsStagePreviewCropV192 } from '../src/xeno-trials-ui-v96.js';
import { getXenoTrialsFranchiseStageAssetsV192, getXenoTrialsFranchiseStageAtlasPlanesV192,
  getXenoTrialsFranchiseStageSceneV192, getXenoTrialsFranchiseStageViewV192 } from '../src/xeno-trials-franchise-stage-scenes-v192.js';
import { verifyXenoPriorityStageAdmissionsV198 } from './public-xeno-priority-stage-admissions-v198.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

test('the other five V146 P1 arena settings are selectable and persist on their exact stage tickets', () => {
  assert.deepEqual(stages.map(({ id, media }) => [id, media]), [
    ['xt198-nostromo-maintenance', 'film'], ['xt198-hadleys-hope-service-corridor', 'film'],
    ['xt198-sevastopol-synthetic-line', 'game'], ['xt198-covenant-maintenance-workshop', 'film'],
    ['xt198-arcade-containment-laboratory', 'game']
  ]);
  assert.equal(catalog.length, 131);
  assert.equal(new Set(catalog.map(stage => stage.id)).size, catalog.length);
  assert.deepEqual(catalog.slice(126), stages);
  assert.equal(getXenoTrialsStagePageV192(catalog, { media: 'film' }).total, 24);
  assert.equal(getXenoTrialsStagePageV192(catalog, { media: 'simulation' }).total, 70);
  assert.equal(getXenoTrialsStagePageV192(catalog, { media: 'game' }).total,
    catalog.slice(0, 126).filter(stage => stage.media === 'game').length + 2);
  for (const stage of stages) {
    const view = getXenoTrialsStagePageV192(catalog, { media: stage.media, selectedId: stage.id, revealSelected: true });
    assert.ok(view.selectedVisible && view.stages.includes(stage), stage.id);
    assert.deepEqual(getXenoTrialsStagePreviewCropV192(stage), stage.atlasV192.sourceRects[0]);
    const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { stageId: stage.id });
    const saved = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(ticket.state)));
    assert.equal(saved.pending?.config.stageId, stage.id);
    assert.equal(saved.pending.config.seed, ticket.config.seed);
  }
});

test('each P1 stage admits three independent draw planes and two cosmetic events', () => {
  for (const stage of stages) {
    const paths = [stage.backdrop, stage.propsV194.path];
    const decoded = data => ({ naturalWidth: data.width, naturalHeight: data.height, complete: true });
    assert.deepEqual(getXenoTrialsFranchiseStageAssetsV192(stage.id), paths);
    const planes = getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, decoded(stage.atlasV192), decoded(stage.propsV194));
    assert.deepEqual(planes.map(({ id, parallax, path }) => [id, parallax, path]), [
      ['far', .065, paths[0]], ['middle', .42, paths[1]], ['foreground', 1.18, paths[0]]
    ]);
    const profile = getXenoTrialsFranchiseStageSceneV192(stage.id);
    assert.equal(profile.revision, 198);
    assert.deepEqual(profile.events.map(event => event.kind), stage.sceneV192.eventKinds);
    for (const event of profile.events) {
      const tick = (event.periodTicks - event.offsetTicks + 10) % event.periodTicks;
      const view = getXenoTrialsFranchiseStageViewV192(stage.id, { center: 650 }, tick);
      assert.ok(view.events.find(item => item.id === event.id).active);
      assert.ok(view.events.every(item => !item.affectsCombat));
      assert.equal(stage.canonExact, false);
    }
  }
});

test('the source and build admit only the ten hashed stage files and both sets of labels', async () => {
  const result = await verifyXenoPriorityStageAdmissionsV198(fileURLToPath(new URL('../', import.meta.url)));
  assert.deepEqual([result.stages, result.textures, result.imagePlanes], [5, 10, 15]);
  for (const stage of stages) for (const path of [stage.backdrop, stage.propsV194.path]) {
    assert.equal(isPublicDistributionPathV86(path.slice(1), { built: true }), true);
  }
  assert.equal(isPublicDistributionPathV86('assets/openai/stages/xeno-trials-v198/draft.png', { built: true }), false);
  await loadCatalogV185();
  try {
    setLanguageV185('en', { persist: false, document: null });
    for (const stage of stages) assert.equal(autoTranslateV185(stage.label), stage.labelEn);
  } finally {
    setLanguageV185('fr', { persist: false, document: null });
  }
  for (const stage of stages) assert.equal(autoTranslateV185(stage.label), stage.label);
});
