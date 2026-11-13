import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { XENO_TRIALS_STAGES_V96 as stages } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_FRANCHISE_STAGES_V192 as additions } from '../src/xeno-trials-franchise-stages-v192.js';
import { XENO_TRIALS_BOSS_STAGES_V179 as boss } from '../src/xeno-trials-boss-stages-v179.js';
import { XENO_TRIALS_CORPORATE_STAGES_V190 as corporate } from '../src/xeno-trials-stage-scenes-v190.js';
import { beginXenoTrialsV96 as begin, createXenoTrialsProgressV96 as progress, normalizeXenoTrialsProgressV96 as normalize } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step } from '../src/xeno-trials-engine-v96.js';
import { PUBLIC_XENO_FRANCHISE_STAGE_IMAGES_V192 as images, PUBLIC_XENO_FRANCHISE_STAGE_DIRECTORIES_V192 as directories,
  publicXenoFranchiseStagePathAdmissionV192 as admission, verifyXenoFranchiseStageAdmissionsV192 as verifyImages } from './public-xeno-franchise-stage-admissions-v192.mjs';
import { isPublicDistributionPathV86 as publicPath } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseline = '0e9843808823a9ce9da73e5b2effeefa1ee51f26';
const previous = path => execFileSync('git', ['show', baseline + ':' + path], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const distribution = { film: 15, series: 5, game: 15, comic: 8, novel: 7 };

test('fifty distinct franchise locations append after the exact fifty-stage public V191 prefix', () => {
  assert.equal(stages.length, 100); assert.equal(additions.length, 50);
  for (const path of ['src/xeno-trials-boss-stages-v179.js', 'src/xeno-trials-stage-scenes-v190.js']) assert.equal(read(path), previous(path), path);
  const data = previous('src/xeno-trials-data-v96.js');
  const declaration = data.slice(data.indexOf('export const XENO_TRIALS_STAGES_V96 ='), data.indexOf('export const XENO_TRIALS_CONTROLS_V96 ='));
  const expression = declaration.replace('export const XENO_TRIALS_STAGES_V96 =', 'return');
  // Evaluate only the trusted historical stage-array declaration with its two
  // unchanged, byte-verified data dependencies; no current extension is injected.
  const historical = new Function('XENO_TRIALS_BOSS_STAGES_V179', 'XENO_TRIALS_CORPORATE_STAGES_V190', expression)(boss, corporate);
  assert.deepEqual(stages.slice(0, 50), historical); assert.deepEqual(stages.slice(50), additions);
  assert.equal(new Set(stages.map(stage => stage.id)).size, 100);
  assert.equal(new Set(additions.map(stage => stage.backdrop)).size, 50);
  for (const [media, total] of Object.entries(distribution)) assert.equal(additions.filter(stage => stage.media === media).length, total, media);
  for (const stage of additions) {
    assert.match(stage.id, /^xt192-[a-z0-9-]+$/); assert.equal(stage.stageRevision, 192);
    assert.ok(stage.label && stage.labelEn && stage.sourceWork && stage.sourceLocation);
    assert.equal(stage.canonExact, false); assert.equal(stage.affectsCombat, false);
    assert.equal(stage.assetStatus, 'new-franchise-location-layer-atlas');
    assert.ok(Object.isFrozen(stage) && Object.isFrozen(stage.atlasV192) && Object.isFrozen(stage.sceneV192));
  }
});

test('all fifty new images retain their actual PNG identities and individually measured unequal depth crops', async () => {
  const result = await verifyImages(root);
  assert.equal(result.images, 50); assert.equal(result.imagePlanes, 150); assert.ok(result.bytes > 0);
  assert.equal(new Set(images.map(image => image.sha256)).size, 50);
  assert.ok(images.some(image => image.sourceRects[0][3] !== image.sourceRects[1][3]), 'Actual unequal image strips must not be silently normalized.');
});

test('the source and real copy filters admit every exact image and descend only the four named directories', () => {
  const filter = createBuildAssetFilter(root);
  for (const path of directories) { assert.equal(admission(path, { directory: true }), true); assert.equal(filter(new URL('../' + path, import.meta.url).pathname), true); }
  for (const { path } of images) {
    assert.equal(admission(path), true); assert.equal(publicPath(path), true); assert.equal(publicPath(path, { built: true }), true);
    assert.equal(filter(new URL('../' + path, import.meta.url).pathname), true);
  }
  for (const path of ['assets/openai/stages/xeno-trials-v192/screen/unreviewed.png', 'assets/openai/stages/xeno-trials-v192/print/private-proof.json',
    'assets/openai/stages/xeno-trials-v192/games/candidate.png', 'assets/openai/stages/xeno-trials-v192/neighbor']) {
    assert.equal(admission(path), false, path); assert.equal(admission(path, { directory: true }), false, path);
    assert.equal(filter(new URL('../' + path, import.meta.url).pathname), false, path);
  }
  for (const path of ['docs/forge/xeno-trials/franchise-stage-sources-v192.json', 'docs/forge/xeno-trials/franchise-stage-art-production-v192.json',
    'scripts/qa-xeno-trials-franchise-stages-v192.py']) { assert.equal(publicPath(path), true); assert.equal(publicPath(path, { built: true }), false); }
});

test('source records disclose their reference limits without treating unavailable pages or generated pixels as exact canon', () => {
  const doc = JSON.parse(read('docs/forge/xeno-trials/franchise-stage-sources-v192.json'));
  assert.equal(doc.selectedLocations, 50); assert.equal(doc.stages.length, 50);
  assert.deepEqual(new Set(doc.stages.map(stage => stage.id)), new Set(additions.map(stage => stage.id)));
  assert.match(doc.evidencePolicy, /Unavailable secondary pages/);
  for (const entry of doc.stages) {
    assert.equal(entry.canonExact, false); assert.ok(entry.sideViewAdaptation && entry.visualEvidenceLimits);
    assert.ok(entry.references.length > 0);
    for (const reference of entry.references) assert.ok([200, 402, 403].includes(Number(reference.httpStatus)), entry.id);
  }
});

for (const stage of additions) test(`${stage.id}: normal ticket and JSON reload preserve the selected location without a charge or completion`, () => {
  const initial = progress(), ticket = begin(initial, { stageId: stage.id });
  assert.equal(ticket.applied, true); assert.equal(ticket.config.stageId, stage.id);
  assert.equal(ticket.state.credits, initial.credits); assert.equal(ticket.state.xp, initial.xp);
  assert.equal(ticket.state.wins, initial.wins); assert.equal(ticket.state.serial, initial.serial + 1);
  const restored = normalize(JSON.parse(JSON.stringify(ticket.state)));
  assert.deepEqual(restored.pending, ticket.state.pending);
  const match = create(ticket.config); assert.equal(match.config.stageId, stage.id);
  assert.equal(match.stageHazardsV188, undefined); assert.equal(match.result, null);
});

function physicalRun(stageId) {
  const match = create({ stageId, playerId: 'warrior', opponentId: 'runner', introSeconds: 0, seed: 192, roundSeconds: 30 });
  for (let i = 0; i < 120 * 180 && !match.result; i++) step(match, 1 / 120, { light: i % 65 < 2, right: i % 260 < 80 });
  assert.ok(match.result); const result = structuredClone(match.result); delete result.stageId;
  return { result, fighters: match.fighters };
}
const physicalBaseline = physicalRun('containment-deck');
for (const media of Object.keys(distribution)) test(`${media}: a complete deterministic engine duel retains identical physics and settlement`, () => {
  const stage = additions.find(stage => stage.media === media); assert.ok(stage);
  assert.deepEqual(physicalRun(stage.id), physicalBaseline);
});
