import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ICONIC_STAGES_BASELINE_V194 as baseline,
  ICONIC_STAGES_HISTORICAL_DECLARATIONS_V194 as declarations,
  ICONIC_STAGES_NEW_INPUTS_V194 as inputs,
  ICONIC_STAGES_SUCCESSORS_V194 as successors,
  iconicStagesRuntimeSourcesV194 as runtimeSources,
  reviewedIconicStagesDigestV194 as advance,
  verifyIconicStagesV194 as verify
} from './audit-xeno-iconic-stages-v194.mjs';
import {
  ORIGINAL_ARENAS_SUCCESSORS_V193 as priorSuccessors,
  ORIGINAL_ARENAS_NEW_INPUTS_V193 as priorInputs,
  originalArenasRuntimeSourcesV193 as runtimeRelay,
  reviewedOriginalArenasDigestV193 as advanceFromV192,
  verifyOriginalArenasV193 as verifyPrevious
} from './audit-xeno-original-arenas-v193.mjs';
import { reviewedStageClassificationDigestV195 as later } from './audit-xeno-stage-classification-v195.mjs';
import { reviewedFranchiseStagesDigestV192 as advanceFromV191 } from './audit-xeno-franchise-stages-v192.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V194 keeps the published V193 receipts and binds its successors to Git source bytes', () => {
  assert.equal(baseline, '371ccf06bebf3e1ce8e2e8d0772669fcdebf9354');
  assert.deepEqual([priorSuccessors, priorInputs].map(entries => Object.keys(entries).length), [23, 16]);
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = bytes => {
      const text = bytes.toString();
      const start = text.indexOf(receipt.start);
      const end = text.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return text.slice(start, end);
    };
    assert.equal(extract(read(path)), extract(git(['show', baseline + ':' + path])));
    assert.equal(sha(extract(read(path))), receipt.sha256);
  }
  const published = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  assert.ok(Object.hasOwn(successors, 'scripts/audit-xeno-original-arenas-v193.mjs'));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(published.has(path), path);
    assert.equal(sha(git(['show', baseline + ':' + path])), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), later(path, receipt.currentSha256), path);
    for (const forged of [receipt.currentSha256, 'a'.repeat(64), null])
      assert.throws(() => advance(path, forged), /Incorrect V193 endpoint for V194/, path);
  }
  for (const path of Object.keys(inputs)) assert.ok(!published.has(path), path);
  assert.equal(advance('constructor', 'history'), 'history');
});

test('the historical runtime chain advances from its original digest through the exact V194 runtime', () => {
  const path = 'src/xeno-trials-runtime-v96.js';
  const historicDigest = '287a7f3fb9f50eb743d19d98c14e446cb6e23f70d31007ec52144b2a9927dd35';
  const endpoint = sha(read(path));
  assert.equal(advance(path, sha(git(['show', baseline + ':' + path]))), endpoint);
  assert.equal(advanceFromV191(path, historicDigest), endpoint);
  for (const [path, receipt] of Object.entries(priorSuccessors)) {
    assert.equal(advanceFromV192(path, receipt.previousSha256), advance(path, receipt.currentSha256), path);
  }
  const historical = Object.freeze({ untouched: 'history' });
  const reviewed = runtimeRelay(historical);
  assert.deepEqual(historical, { untouched: 'history' });
  assert.ok(Object.isFrozen(reviewed));
  assert.deepEqual(runtimeRelay(reviewed), reviewed);
  for (const [path, receipt] of Object.entries(successors)) {
    if (receipt.kind === 'runtime') assert.equal(reviewed[path], later(path, receipt.currentSha256), path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    if (receipt.kind === 'runtime') assert.equal(reviewed[path], later(path, receipt.sha256), path);
  }
  assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect V194 runtime view predecessor/);
});

test('the two textures of each of the eight stages are pinned and checked by the V193 relay', () => {
  const prefix = 'assets/openai/stages/xeno-trials-v194/';
  const textures = Object.entries(inputs).filter(([path]) => path.startsWith(prefix));
  const counts = new Map();
  for (const [path, receipt] of textures) {
    const file = path.slice(prefix.length);
    const match = /^([a-z0-9-]+)-(base|props)\.png$/.exec(file);
    assert.ok(match, path);
    assert.equal(receipt.kind, 'asset');
    if (!counts.has(match[1])) counts.set(match[1], []);
    counts.get(match[1]).push(match[2]);
  }
  assert.equal(counts.size, 8);
  for (const layers of counts.values()) assert.deepEqual(layers.sort(), ['base', 'props']);
  assert.equal(new Set(textures.map(([, receipt]) => receipt.sha256)).size, 16);
  const [path] = textures.find(([path]) => path.endsWith('-props.png'));
  const unreviewed = candidate => candidate === path ? Buffer.from('unreviewed prop texture') : read(candidate);
  assert.equal(verify().historicalResultsTransferred, false);
  assert.equal(verifyPrevious().historicalResultsTransferred, false);
  assert.throws(() => verifyPrevious(unreviewed), error => error.message.includes(path));
});

test('the V194 audit and report are source-only and unrelated candidates stay excluded', () => {
  const terminal = 'scripts/audit-xeno-iconic-stages-v194.mjs';
  const verifier = 'scripts/verify-xeno-iconic-stages-audit-v194.mjs';
  const report = 'docs/forge/xeno-trials/V194-ICONIC-STAGES.md';
  assert.match(read('scripts/audit-xeno-original-arenas-v193.mjs').toString(), /from '\.\/audit-xeno-iconic-stages-v194\.mjs'/);
  assert.match(read(terminal).toString(), /from '\.\/audit-xeno-stage-classification-v195\.mjs'/);
  assert.match(read('scripts/audit-xeno-stage-classification-v195.mjs').toString(),
    /from '\.\/audit-xeno-referenced-film-stages-v196\.mjs'/);
  assert.doesNotMatch(read('scripts/audit-xeno-priorities-v197.mjs').toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  for (const path of [terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [terminal, report]) {
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  }
  for (const path of ['scripts/audit-xeno-iconic-unreviewed-v194.mjs',
    'assets/openai/stages/xeno-trials-v194/unreviewed-props.png'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
