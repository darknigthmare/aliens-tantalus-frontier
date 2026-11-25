import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { AVP_HOST_BASELINE_20261125 as baseline, AVP_HOST_SUCCESSORS_20261125 as successors,
  reviewedAvpHostDigest20261125 as advance, avpHostRuntimeSources20261125 as runtimeView,
  verifyAvpHostSources20261125 as verify } from './audit-dlc-avp-2004-20261125.mjs';
import { reviewedAfterNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { XENO_TRIALS_TANTALUS_JOIN_V206 as xenoJoin,
  reviewedXenoTrialsTantalusJoinV206 } from './audit-xeno-production-assets-v206.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const audit = 'scripts/audit-dlc-avp-2004-20261125.mjs';
const expectedPaths = [
  "index.html",
  "package.json",
  "scripts/audit-tantalus-priorities-v188.mjs",
  "scripts/audit-xeno-production-assets-v206.mjs",
  "scripts/build.mjs",
  "scripts/qa-title-compositions-v163.py",
  "scripts/verify-i18n-audit-v186.mjs",
  "scripts/verify-native-qa-resources-v187.mjs",
  "scripts/verify-public-release-v86.mjs",
  "scripts/verify-tantalus-priorities-v188.mjs",
  "scripts/verify-xeno-animation-audio-audit-v189.mjs",
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs",
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs",
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs",
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs",
  "scripts/verify-xeno-priorities-audit-v201.mjs",
  "scripts/verify-xeno-priorities-audit-v202.mjs",
  "scripts/verify-xeno-priorities-audit-v203.mjs",
  "scripts/verify-xeno-priorities-audit-v204.mjs",
  "scripts/verify-xeno-production-assets-v206.mjs",
  "scripts/verify-xeno-stage-classification-audit-v195.mjs",
  "scripts/verify-xeno-stage-operations-audit-v188.mjs",
  "scripts/verify-xeno-supers-audit-v200.mjs",
  "scripts/verify-xeno-trials-completion-audit-v186.mjs",
  "scripts/verify-xeno-visual-assets-audit-v205.mjs",
  "src/app.js",
  "src/title-screen-v61.js",
  "sw.js"
];
const historicalAnchors = [
  {
    "path": "scripts/audit-tantalus-priorities-v188.mjs",
    "begin": "// BEGIN XENO TRIALS JOIN RECEIPTS",
    "end": "// END XENO TRIALS JOIN RECEIPTS",
    "sha256": "e648a73099bae04ee8cd794735a4ca9b16d60c5c6c5b6d7c24737ec53e0e73dd"
  },
  {
    "path": "scripts/audit-xeno-production-assets-v206.mjs",
    "begin": "// BEGIN TANTALUS JOIN RECEIPTS",
    "end": "// END TANTALUS JOIN RECEIPTS",
    "sha256": "54b61195023c9ccef0968d3411fd1db15b8af6a006847a488a0981b11b928b73"
  }
];

test('AVP admits only exact host and audit successors of the reviewed merged baseline', () => {
  assert.equal(baseline, '001a20bdc0f9f1a3c835e84d8f3c9434bc159330');
  assert.deepEqual(Object.keys(successors).sort(), [...expectedPaths].sort());
  assert.equal(Object.hasOwn(successors, audit), false);
  assert.ok(Object.isFrozen(successors));
  assert.deepEqual(verify(), { baselineCommit: baseline, successors: expectedPaths.length, historicalEvidenceTransferred: false });
});

test('AVP refuses an unknown predecessor or repeated advancement while leaving unrelated paths unchanged', () => {
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.equal(advance(path, receipt.previousSha256), receipt.currentSha256);
    for (const wrong of ['0'.repeat(64), receipt.currentSha256, undefined])
      assert.throws(() => advance(path, wrong), /Broken merged-Tantalus-to-AVP host source chain/, path);
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advance(path, 'untouched'), 'untouched');
});

test('both existing chains reach AVP bytes, including the title source absent from both old join maps', () => {
  const title = 'src/title-screen-v61.js', receipt = successors[title];
  assert.equal(Object.hasOwn(xenoJoin.successors, title), false);
  assert.equal(reviewedAfterNativeQaResourcesV187(title, receipt.previousSha256), receipt.currentSha256);
  for (const path of ['index.html', 'package.json', 'src/app.js', 'sw.js', 'scripts/verify-public-release-v86.mjs']) {
    const join = xenoJoin.successors[path];
    assert.equal(join.currentSha256, successors[path].previousSha256, path);
    assert.equal(reviewedXenoTrialsTantalusJoinV206(path, join.previousSha256), successors[path].currentSha256, path);
  }
});

test('merged runtime views accept only the two exact AVP endpoints and never add unrelated entries', () => {
  const predecessor = Object.fromEntries(Object.entries(successors).map(([path, receipt]) => [path, receipt.previousSha256]));
  const expected = Object.fromEntries(Object.entries(successors).map(([path, receipt]) => [path, receipt.currentSha256]));
  predecessor['src/untouched.js'] = expected['src/untouched.js'] = 'unchanged';
  assert.deepEqual(runtimeView(predecessor), expected);
  assert.deepEqual(runtimeView(expected), expected);
  assert.ok(Object.isFrozen(runtimeView(predecessor)));
  assert.deepEqual(runtimeView({}), {});
  assert.throws(() => runtimeView({ 'src/app.js': '0'.repeat(64) }), /Incorrect AVP host runtime view predecessor/);
});

test('a changed byte in any admitted successor is rejected by the real reader contract', () => {
  for (const path of expectedPaths) {
    const altered = candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed byte\n')]) : read(candidate);
    assert.throws(() => verify(altered), /Unreviewed AVP host source bytes/, path);
  }
});

test('both historical join receipt blocks remain byte-for-byte identical to the merged baseline', () => {
  for (const anchor of historicalAnchors) {
    const source = read(anchor.path).toString(), start = source.indexOf(anchor.begin), end = source.indexOf(anchor.end, start);
    assert.ok(start >= 0 && end > start, anchor.path);
    assert.equal(sha(source.slice(start, end)), anchor.sha256, anchor.path);
  }
});

test('the AVP terminal has no audit dependency or self admission', () => {
  assert.doesNotMatch(read(audit).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.equal(Object.hasOwn(successors, audit), false);
  for (const receipt of Object.values(successors)) assert.notEqual(receipt.previousSha256, receipt.currentSha256);
});
