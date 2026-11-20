import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { XENO_TRIALS_ICONIC_STAGES_V194 as stages } from '../src/xeno-trials-iconic-stages-v194.js';
import { XENO_TRIALS_STAGES_V96 as catalog } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsStagePageV192, getXenoTrialsStagePreviewCropV192 } from '../src/xeno-trials-ui-v96.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { verifyXenoIconicStageAdmissionsV194 } from './public-xeno-iconic-stage-admissions-v194.mjs';

test('the eight film stages are selectable with exact ticket identities and the catalog retains its previous prefix', () => {
  assert.equal(stages.length, 8);
  assert.equal(catalog.length, 120);
  assert.equal(new Set(catalog.map(stage => stage.id)).size, 120);
  assert.deepEqual(catalog.slice(112), stages);
  for (const stage of stages) {
    assert.equal(stage.media, 'film', stage.id);
    assert.equal(stage.stageRevision, 194);
    assert.equal(stage.canonExact, false);
    const page = getXenoTrialsStagePageV192(catalog, { media: 'film', selectedId: stage.id, revealSelected: true });
    assert.equal(page.total, 23);
    assert.ok(page.stages.includes(stage), stage.id);
    assert.deepEqual(getXenoTrialsStagePreviewCropV192(stage), stage.atlasV192.sourceRects[0], stage.id);
    const receipt = beginXenoTrialsV96(createXenoTrialsProgressV96(), { stageId: stage.id });
    assert.equal(receipt.applied, true);
    const restored = normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(receipt.state)));
    assert.equal(restored.pending.config.stageId, stage.id);
    assert.equal(restored.pending.config.seed, receipt.config.seed);
  }
});

test('the public release admits exactly sixteen distinct verified film stage textures', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const report = await verifyXenoIconicStageAdmissionsV194(root);
  assert.deepEqual([report.stages, report.textures, report.imagePlanes], [8, 16, 24]);
  for (const stage of stages) {
    for (const path of [stage.backdrop, stage.propsV194.path]) {
      assert.equal(isPublicDistributionPathV86(path.slice(1), { built: true }), true);
    }
  }
  assert.equal(isPublicDistributionPathV86('assets/openai/stages/xeno-trials-v194/candidate.png', { built: true }), false);
});

test('the new arena labels reach the English and French stage selector without changing the source catalog', async () => {
  await loadCatalogV185();
  try {
    setLanguageV185('en', { persist: false, document: null });
    for (const stage of stages) assert.equal(autoTranslateV185(stage.label), stage.labelEn);
  } finally {
    setLanguageV185('fr', { persist: false, document: null });
  }
  for (const stage of stages) assert.equal(autoTranslateV185(stage.label), stage.label);
});
