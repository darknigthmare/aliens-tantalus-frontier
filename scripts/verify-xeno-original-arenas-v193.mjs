import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { XENO_TRIALS_ORIGINAL_ARENAS_V193 as arenas } from '../src/xeno-trials-original-arenas-v193.js';
import { XENO_TRIALS_STAGES_V96 as catalog } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsStagePageV192, getXenoTrialsStagePreviewCropV192 } from '../src/xeno-trials-ui-v96.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsFranchiseStageSceneV192, getXenoTrialsFranchiseStageAtlasPlanesV192,
  getXenoTrialsFranchiseStageViewV192, XENO_TRIALS_FRANCHISE_STAGE_EVENT_KINDS_V192 as eventKinds } from '../src/xeno-trials-franchise-stage-scenes-v192.js';
import { autoTranslateV185, loadCatalogV185 } from '../src/i18n-auto-v185.js';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { verifyXenoOriginalArenaAdmissionsV193 } from './public-xeno-original-arena-admissions-v193.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

test('the twelve original atlases ship with their exact crops and no candidate files', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const report = await verifyXenoOriginalArenaAdmissionsV193(root);
  assert.equal(report.images, 12);
  assert.equal(report.imagePlanes, 36);
  for (const stage of arenas) {
    assert.equal(isPublicDistributionPathV86(stage.backdrop.slice(1), { built: true }), true);
    assert.deepEqual(getXenoTrialsStagePreviewCropV192(stage), stage.atlasV192.sourceRects[0]);
  }
  const candidate = 'assets/openai/stages/xeno-trials-v193/industrial/candidate.png';
  assert.equal(isPublicDistributionPathV86(candidate, { built: true }), false);
});

test('the twelve IDs append once and remain available in the Tantalus filter and saved tickets', () => {
  const v193Catalog = catalog.slice(0, 112);
  assert.equal(new Set(v193Catalog.map(stage => stage.id)).size, 112);
  assert.deepEqual(v193Catalog.slice(100), arenas);
  for (const arena of arenas) {
    const page = getXenoTrialsStagePageV192(catalog, {
      media: 'simulation', selectedId: arena.id, revealSelected: true
    });
    assert.equal(page.total, 70);
    assert.ok(page.stages.includes(arena));
    const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { stageId: arena.id });
    assert.equal(ticket.applied, true);
    assert.equal(normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(ticket.state))).pending.config.stageId, arena.id);
  }
});

test('each panorama exposes two distinct cosmetic events and three correctly ordered plans', () => {
  for (const arena of arenas) {
    const profile = getXenoTrialsFranchiseStageSceneV192(arena.id);
    assert.equal(profile.revision, 193);
    assert.equal(profile.affectsCombat, false);
    assert.equal(new Set(profile.events.map(event => event.kind)).size, 2);
    assert.ok(profile.events.every(event => eventKinds.includes(event.kind) && !event.affectsCombat));
    for (const event of profile.events) {
      const tick = (event.periodTicks - event.offsetTicks) % event.periodTicks + 1;
      assert.ok(getXenoTrialsFranchiseStageViewV192(arena.id, {}, tick).events.find(item => item.id === event.id).active);
      assert.ok(getXenoTrialsFranchiseStageViewV192(arena.id, {}, tick, { reducedMotion: true }).events.every(item => !item.active));
    }
    const { width, height, sourceRects } = arena.atlasV192;
    const planes = getXenoTrialsFranchiseStageAtlasPlanesV192(arena.id, { naturalWidth: width, naturalHeight: height });
    assert.deepEqual(planes.map(({ sx, sy, sw, sh }) => [sx, sy, sw, sh]), sourceRects);
    assert.ok(planes[0].parallax < planes[1].parallax && planes[1].parallax < planes[2].parallax);
    assert.deepEqual(planes.map(({ plane }) => plane), ['behind-fighters', 'behind-fighters', 'below-feet']);
  }
});

test('arena names follow the language preference in cards, select and native text', async () => {
  await loadCatalogV185();
  try {
    setLanguageV185('en', { persist: false, document: null });
    for (const { label, labelEn } of arenas) {
      assert.equal(autoTranslateV185(label), labelEn);
      assert.equal(autoTranslateV185(label.toUpperCase()), labelEn.toUpperCase());
    }
  } finally {
    setLanguageV185('fr', { persist: false, document: null });
  }
  for (const arena of arenas) assert.equal(autoTranslateV185(arena.label), arena.label);
});
