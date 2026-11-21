import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  REFERENCED_FILM_STAGES_BASELINE_V196 as baseline,
  REFERENCED_FILM_STAGES_HISTORICAL_DECLARATIONS_V196 as declarations,
  REFERENCED_FILM_STAGES_NEW_INPUTS_V196 as inputs,
  REFERENCED_FILM_STAGES_SUCCESSORS_V196 as successors,
  referencedFilmStagesRuntimeSourcesV196 as runtimeSources,
  reviewedReferencedFilmStagesDigestV196 as advance,
  verifyReferencedFilmStagesV196 as verify
} from './audit-xeno-referenced-film-stages-v196.mjs';
import {
  STAGE_CLASSIFICATION_NEW_INPUTS_V195 as priorInputs,
  STAGE_CLASSIFICATION_SUCCESSORS_V195 as priorSuccessors,
  reviewedStageClassificationDigestV195 as advanceFromV194,
  stageClassificationRuntimeSourcesV195 as runtimeRelay,
  verifyStageClassificationV195 as verifyPrior
} from './audit-xeno-stage-classification-v195.mjs';
import { reviewedXenoPrioritiesDigestV197 as advanceToV197 } from './audit-xeno-priorities-v197.mjs';
import { XENO_TRIALS_STAGES_V96 as catalog } from '../src/xeno-trials-data-v96.js';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => git(['show', baseline + ':' + path]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const priorAudit = 'scripts/audit-xeno-stage-classification-v195.mjs';
const terminal = 'scripts/audit-xeno-referenced-film-stages-v196.mjs';
const verifier = 'scripts/verify-xeno-referenced-film-stages-audit-v196.mjs';
const report = 'docs/forge/xeno-trials/V196-REFERENCED-FILM-STAGES.md';
const prefix = 'assets/openai/stages/xeno-trials-v196/';
const textures = [
  'bouvet-pyramid-entrance',
  'fiorina-evac-shore',
  'hadleys-hope-operations',
  'nostromo-bridge',
  'nostromo-infirmary',
  'renaissance-laboratory'
].flatMap(slug => ['base', 'props'].map(layer => prefix + slug + '-' + layer + '.png'));

test('V196 preserves the published V195 declarations and admits exact Git successors', () => {
  assert.equal(baseline, '371853ce7e00180c26bd675850cf73bfdcae7d4e');
  assert.deepEqual([Object.keys(priorSuccessors).length, Object.keys(priorInputs).length], [17, 1]);
  assert.equal(sha(readBaseline(priorAudit)), '6095719a0218f158b46849c23740f41c655b2fdee021d2e71b443835f4b5bede');
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = bytes => {
      const source = bytes.toString();
      const start = source.indexOf(receipt.start);
      const end = source.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return source.slice(start, end);
    };
    const current = extract(read(path));
    assert.equal(current, extract(readBaseline(path)), path);
    assert.equal(sha(current), receipt.sha256, path);
  }
  const published = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  assert.ok(Object.hasOwn(successors, priorAudit));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(published.has(path), path);
    assert.ok(Object.isFrozen(receipt), path);
    assert.equal(sha(readBaseline(path)), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), sha(read(path)), path);
    for (const forged of [receipt.currentSha256, '0'.repeat(64), null])
      assert.throws(() => advance(path, forged), /Incorrect V195 endpoint for V196/, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.ok(!published.has(path), path);
    assert.ok(Object.isFrozen(receipt), path);
  }
  assert.equal(advance('constructor', 'history'), 'history');
});

test('twelve new textures are pinned and a changed texture fails through the V195 relay', () => {
  const assets = Object.keys(inputs).filter(path => inputs[path].kind === 'asset').sort();
  assert.deepEqual(assets, textures);
  assert.ok(Object.values(successors).every(receipt => receipt.kind !== 'asset'));
  assert.equal(new Set(textures.map(path => inputs[path].sha256)).size, textures.length);
  assert.equal(verify().historicalResultsTransferred, false);
  assert.equal(verifyPrior().historicalResultsTransferred, false);
  for (const path of textures) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
  }
  const path = textures.find(candidate => candidate.endsWith('-props.png'));
  const modified = candidate => candidate === path ? Buffer.from('unreviewed prop texture') : read(candidate);
  assert.throws(() => verify(modified), error => error.message.includes(path));
  assert.throws(() => verifyPrior(modified), error => error.message.includes(path));
});

test('the runtime relay covers each V196 runtime while rejecting forged predecessors', () => {
  const historical = Object.freeze({ untouched: 'historic' });
  const effective = runtimeRelay(historical);
  assert.deepEqual(historical, { untouched: 'historic' });
  assert.ok(Object.isFrozen(effective));
  assert.deepEqual(runtimeRelay(effective), effective);
  for (const [path, receipt] of Object.entries(priorSuccessors)) {
    assert.equal(advanceFromV194(path, receipt.previousSha256), advance(path, receipt.currentSha256), path);
  }
  for (const [path, receipt] of Object.entries(successors)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV197(path, receipt.currentSha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect V196 runtime view predecessor/);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV197(path, receipt.sha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect new V196 runtime digest/);
  }
});

test('the eight stages classified in V195 retain their Git data and simulation category', async () => {
  const leaf = 'src/xeno-trials-iconic-stages-v194.js';
  const historical = await import('data:text/javascript;base64,' + readBaseline(leaf).toString('base64'));
  const stages = historical.XENO_TRIALS_ICONIC_STAGES_V194;
  const ids = new Set(stages.map(stage => stage.id));
  assert.equal(ids.size, 8);
  assert.ok(stages.every(stage => stage.media === 'simulation'));
  assert.deepEqual(catalog.filter(stage => ids.has(stage.id)), stages);
});

test('audit tooling and the outcome report are source-only and unrelated paths stay excluded', () => {
  assert.match(read(priorAudit).toString(), /from '\.\/audit-xeno-referenced-film-stages-v196\.mjs'/);
  assert.match(read(terminal).toString(), /from '\.\/audit-xeno-priorities-v197\.mjs'/);
  for (const path of [terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [terminal, report])
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  for (const path of [prefix + 'unreviewed-props.png', 'scripts/audit-xeno-referenced-film-unreviewed-v196.mjs'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
