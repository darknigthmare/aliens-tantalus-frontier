import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  STAGE_CLASSIFICATION_BASELINE_V195 as baseline,
  STAGE_CLASSIFICATION_HISTORICAL_DECLARATIONS_V195 as declarations,
  STAGE_CLASSIFICATION_NEW_INPUTS_V195 as inputs,
  STAGE_CLASSIFICATION_SUCCESSORS_V195 as successors,
  reviewedStageClassificationDigestV195 as advance,
  verifyStageClassificationV195 as verify
} from './audit-xeno-stage-classification-v195.mjs';
import { reviewedReferencedFilmStagesDigestV196 as later } from './audit-xeno-referenced-film-stages-v196.mjs';
import {
  ICONIC_STAGES_NEW_INPUTS_V194 as originalInputs,
  iconicStagesRuntimeSourcesV194 as runtimeRelay,
  verifyIconicStagesV194 as verifyPrior
} from './audit-xeno-iconic-stages-v194.mjs';
import { XENO_TRIALS_ICONIC_STAGES_V194 as stages } from '../src/xeno-trials-iconic-stages-v194.js';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86, XENO_AUDIT_TERMINAL_PATH } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => git(['show', baseline + ':' + path]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const leaf = 'src/xeno-trials-iconic-stages-v194.js';
const terminal = 'scripts/audit-xeno-stage-classification-v195.mjs';
const verifier = 'scripts/verify-xeno-stage-classification-audit-v195.mjs';
const report = 'docs/forge/xeno-trials/V195-STAGE-CLASSIFICATION.md';

test('V195 leaves the V194 declarations byte-identical and binds exact successors to Git', () => {
  assert.equal(baseline, 'cdecfd08073198086915eec3983bcb0bd29851ed');
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = bytes => {
      const text = bytes.toString();
      const start = text.indexOf(receipt.start);
      const end = text.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return text.slice(start, end);
    };
    assert.equal(extract(read(path)), extract(readBaseline(path)));
    assert.equal(sha(extract(read(path))), receipt.sha256);
  }
  const published = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(published.has(path), path);
    assert.equal(sha(readBaseline(path)), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), later(path, receipt.currentSha256), path);
    assert.throws(() => advance(path, receipt.currentSha256), /Incorrect V194 endpoint for V195/, path);
  }
  for (const path of Object.keys(inputs)) assert.ok(!published.has(path), path);
  assert.equal(advance('constructor', 'history'), 'history');
});

test('only the catalogue category changes for eight stages and the V194 relay checks their old textures', async () => {
  const historicalModule = await import('data:text/javascript;base64,' + readBaseline(leaf).toString('base64'));
  const priorStages = historicalModule.XENO_TRIALS_ICONIC_STAGES_V194;
  assert.equal(priorStages.length, 8);
  assert.ok(priorStages.every(stage => stage.media === 'film'));
  assert.deepEqual(stages, priorStages.map(stage => ({ ...stage, media: 'simulation' })));
  assert.equal(successors[leaf].previousSha256, originalInputs[leaf].sha256);
  assert.ok([...Object.keys(successors), ...Object.keys(inputs)].every(path => !path.startsWith('assets/')));
  const textures = Object.keys(originalInputs).filter(path => path.startsWith('assets/openai/stages/xeno-trials-v194/'));
  assert.equal(textures.length, 16);
  assert.equal(verify().historicalResultsTransferred, false);
  assert.equal(verifyPrior().historicalResultsTransferred, false);
  const modified = changed => path => path === changed ? Buffer.from('unreviewed') : read(path);
  for (const path of [leaf, textures[0]]) assert.throws(() => verifyPrior(modified(path)), error => error.message.includes(path));
  const runtime = runtimeRelay(Object.freeze({ untouched: 'historic' }));
  assert.equal(runtime[leaf], sha(read(leaf)));
  assert.deepEqual(runtimeRelay(runtime), runtime);
});

test('audit tooling and the outcome report have exact source-only release admissions', () => {
  assert.match(read(terminal).toString(), /from '\.\/audit-xeno-referenced-film-stages-v196\.mjs'/);
  assert.doesNotMatch(read(XENO_AUDIT_TERMINAL_PATH).toString(),
    /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  for (const path of [terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [terminal, report]) {
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  }
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-stage-classification-unreviewed-v195.mjs'), false);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
