import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { XENO_TRIALS_STAGES_V96 as catalog } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_REFERENCED_STAGES_V196 as stages } from '../src/xeno-trials-referenced-stages-v196.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsStagePageV192, getXenoTrialsStagePreviewCropV192 } from '../src/xeno-trials-ui-v96.js';
import {
  PUBLIC_REFERENCED_STAGE_DIRECTORY_V196 as directory,
  verifyXenoReferencedStageAdmissionsV196
} from './public-xeno-referenced-stage-admissions-v196.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

test('all six film settings can be selected, previewed and restored from saved tickets', () => {
  assert.deepEqual(stages.map(({ id }) => id), [
    'xt196-nostromo-bridge', 'xt196-nostromo-infirmary', 'xt196-hadleys-hope-operations',
    'xt196-fiorina-evac-shore', 'xt196-bouvet-pyramid-entrance', 'xt196-renaissance-laboratory'
  ]);
  const historical = catalog.slice(0, 126);
  assert.equal(historical.length, 126);
  assert.equal(new Set(historical.map(({ id }) => id)).size, historical.length);
  assert.deepEqual(historical.slice(120), stages);
  assert.equal(getXenoTrialsStagePageV192(catalog, { media: 'simulation' }).total, 70);
  for (const stage of stages) {
    assert.equal(stage.media, 'film', stage.id);
    assert.equal(stage.stageRevision, 196, stage.id);
    assert.equal(stage.canonExact, false, stage.id);
    const page = getXenoTrialsStagePageV192(historical, { media: 'film', selectedId: stage.id, revealSelected: true });
    assert.equal(page.total, 21, stage.id);
    assert.ok(page.selectedVisible && page.stages.includes(stage), stage.id);
    assert.deepEqual(getXenoTrialsStagePreviewCropV192(stage), stage.atlasV192.sourceRects[0], stage.id);
    const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { stageId: stage.id });
    assert.equal(ticket.applied, true, stage.id);
    const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(ticket.state)));
    assert.equal(restored.pending?.config.stageId, stage.id);
    assert.equal(restored.pending.config.seed, ticket.config.seed);
  }
});

test('the public release admits exactly twelve new textures and eighteen image planes', async () => {
  const receipt = await verifyXenoReferencedStageAdmissionsV196(fileURLToPath(new URL('../', import.meta.url)));
  assert.deepEqual([receipt.stages, receipt.textures, receipt.imagePlanes], [6, 12, 18]);
  assert.equal(isPublicDistributionPathV86(directory, { built: true, directory: true }), true);
  for (const stage of stages) {
    assert.equal(isPublicDistributionPathV86(stage.backdrop.slice(1), { built: true }), true);
    assert.equal(isPublicDistributionPathV86(stage.propsV194.path.slice(1), { built: true }), true);
  }
  assert.equal(isPublicDistributionPathV86(directory + '/candidate.png', { built: true }), false);
  assert.equal(isPublicDistributionPathV86(directory + '/drafts', { built: true, directory: true }), false);
});

test('the six selectable labels are available in French and English', async () => {
  await loadCatalogV185();
  try {
    setLanguageV185('en', { persist: false, document: null });
    for (const stage of stages) assert.equal(autoTranslateV185(stage.label), stage.labelEn);
  } finally {
    setLanguageV185('fr', { persist: false, document: null });
  }
  for (const stage of stages) assert.equal(autoTranslateV185(stage.label), stage.label);
});
