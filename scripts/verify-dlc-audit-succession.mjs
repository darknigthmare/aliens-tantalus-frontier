import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { AVP_HOST_BASELINE_20261125 as baseline, AVP_HOST_SUCCESSORS_20261125 as successors,
  AVP_FIORINA_JOIN_BASELINES_20261125 as joinBaselines,
  AVP_FIORINA_INCOMING_SOURCES_20261125 as incomingSources,
  AVP_FIORINA_JOIN_SUCCESSORS_20261125 as joinSuccessors,
  AVP_FIORINA_QA_BASELINE_20261125 as qualityBaseline,
  AVP_FIORINA_QA_SUCCESSORS_20261125 as qualitySuccessors,
  AVP_ALIENS_JOIN_BASELINES_20261125 as aliensBaselines,
  AVP_ALIENS_INCOMING_SOURCES_20261125 as aliensIncoming,
  AVP_ALIENS_JOIN_SUCCESSORS_20261125 as aliensMerge,
  ALIENS_AVP_JOIN_SUCCESSORS_20261125 as aliasesFromAliens,
  AVP_FIORINA_SPRITES_BASELINE_20261125 as spriteBaseline,
  AVP_FIORINA_SPRITES_SUCCESSORS_20261125 as spriteSuccessors,
  AVP_FIORINA_V116_BASELINE_20261125 as spriteV116Baseline,
  AVP_FIORINA_V116_SUCCESSORS_20261125 as spriteV116Successors,
  AVP_DLC_ARCHIVE_SOURCE_BASELINE_20261126 as dlcArchiveSourceBaseline,
  AVP_DLC_ARCHIVE_SOURCE_SUCCESSORS_20261126 as dlcArchiveSourceSuccessors,
  reviewedDlcArchiveSourceHostDigest20261126 as advanceDlcArchiveSource,
  reviewedHistoricalArchiveHostDigest20261126 as advanceHistoricalArchive,
  AVP_HISTORICAL_ARCHIVE_SUCCESSORS_20261126 as historicalArchiveSuccessors,
  reviewedFiorinaV116HostDigest20261125 as advanceV116,
  reviewedFiorinaSpriteHostDigest20261125 as advanceSprites,
  reviewedAliensIncomingDigest20261125 as advanceAliens,
  reviewedAvpHostDigest20261125 as advance, avpHostRuntimeSources20261125 as runtimeView,
  verifyAvpHostSources20261125 as verify } from './audit-dlc-avp-2004-20261125.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
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

// Exact published AVP receipt map, independent of the later merge.
const publishedAvpReceiptsSha256 = 'b306f50308f5e61e0a57c1cc5472227fed4805f3f3977c1b89bbbfb6498d19fa';
// BEGIN EXPECTED FIORINA JOIN PATHS
const expectedJoinPaths = [
  "index.html",
  "package.json",
  "scripts/audit-tantalus-priorities-v188.mjs",
  "scripts/verify-act5-endings-v188.mjs",
  "scripts/verify-audit-v143.mjs",
  "scripts/verify-black-cocoon-presentation-v158.mjs",
  "scripts/verify-colony-crew-v188.mjs",
  "scripts/verify-public-release-v86.mjs",
  "scripts/verify-tantalus-priorities-v188.mjs",
  "scripts/verify-xeno-arbiter-campaign-v190.mjs",
  "src/app.js",
  "src/content.js",
  "src/game-production-runtime.js",
  "src/special-operations-v131.js",
  "sw.js"
];
// END EXPECTED FIORINA JOIN PATHS
const publishedJoinReceiptsSha256 = '7fed71bed2ff7dbf2e3cc24aa7cf7c2cee7513c85b4ae309d86bf5bf00576132';
const expectedQualityPaths = [
  "scripts/i18n-tantalus-xeno-merge-v188.mjs",
  "scripts/verify-bugfix-texts-v188.mjs",
  "scripts/verify-campaign-lethe-v163.mjs",
  "scripts/verify-campaign-story-v160.mjs",
  "scripts/verify-insertion-cinematic-v188.mjs",
  "scripts/verify-m577-everywhere-v188.mjs",
  "src/i18n-en-catalog-v185.js"
];
const expectedSpritePaths = [
  '.github/workflows/fiorina-native-v114.yml',
  'package.json',
  'scripts/build-asset-filter.mjs',
  'scripts/build.mjs',
  'scripts/qa-fiorina-native-v114.mjs',
  'scripts/verify-audit-v143.mjs',
  'scripts/verify-public-release-v86.mjs',
  'src/game-production-runtime.js',
  'sw.js'
];
const expectedSpriteV116Paths = ['.github/workflows/fiorina-native-v114.yml',
  'scripts/qa-fiorina-native-v114.mjs', 'scripts/verify-audit-v143.mjs', 'sw.js'];
const verifiedPaths = [...new Set([...expectedPaths, ...expectedJoinPaths, ...expectedQualityPaths, ...Object.keys(aliensMerge), ...expectedSpritePaths, ...expectedSpriteV116Paths])];
const firstEndpoint = path => (successors[path] || joinSuccessors[path] || qualitySuccessors[path] || aliensMerge[path] || spriteSuccessors[path]).previousSha256;
const mergedEndpoint = path => (aliensMerge[path] || qualitySuccessors[path] || joinSuccessors[path] || successors[path])?.currentSha256;
const finalEndpoint = path => historicalArchiveSuccessors[path]?.currentSha256 || dlcArchiveSourceSuccessors[path]?.currentSha256 || spriteV116Successors[path]?.currentSha256 || spriteSuccessors[path]?.currentSha256 || mergedEndpoint(path);
const brokenChain = /Broken (?:merged-Tantalus-to-AVP host|AVP-to-Fiorina host|joined-host-to-Fiorina-QA|published-AVP-to-Aliens-merge|published-merge-to-Fiorina-sprites|Fiorina-V115-to-V116|V116-to-DLC-source-archive|PR73-to-historical-archive) source chain/;

test('AVP published receipts remain immutable while the exact Fiorina join verifies current bytes', () => {
  assert.equal(baseline, '001a20bdc0f9f1a3c835e84d8f3c9434bc159330');
  assert.deepEqual(Object.keys(successors).sort(), [...expectedPaths].sort());
  assert.equal(sha(JSON.stringify(successors)), publishedAvpReceiptsSha256);
  assert.deepEqual(Object.keys(joinSuccessors).sort(), [...expectedJoinPaths].sort());
  assert.equal(sha(JSON.stringify(joinSuccessors)), publishedJoinReceiptsSha256);
  assert.deepEqual(Object.keys(qualitySuccessors).sort(), [...expectedQualityPaths].sort());
  assert.equal(sha(JSON.stringify(qualitySuccessors)), 'ecd1c1d5d2f2c0756c107084269f6436b19d46e4269e77e390e618a0a89dce62');
  assert.equal(Object.hasOwn(successors, audit), false);
  assert.equal(Object.hasOwn(joinSuccessors, audit), false);
  assert.ok(Object.isFrozen(successors) && Object.isFrozen(joinSuccessors) && Object.isFrozen(qualitySuccessors));
  assert.deepEqual(verify(), { baselineCommit: baseline, successors: verifiedPaths.length,
    joinedSuccessors: expectedJoinPaths.length, qualitySuccessors: expectedQualityPaths.length,
    aliensMergedSuccessors: Object.keys(aliensMerge).length, aliensIncomingSuccessors: Object.keys(aliasesFromAliens).length,
    spriteSuccessors: expectedSpritePaths.length, spriteV116Successors: expectedSpriteV116Paths.length,
    historicalEvidenceTransferred: false });
});

test('the Aliens merge joins both exact published parents and refuses any unrecorded incoming endpoint', () => {
  assert.deepEqual(aliensBaselines, {
    avpCommit: '1290733d51b6be5d075ab8bbc3eb9e87d684e8f4',
    aliensCommit: 'eb4a3107b3abe073acc536ab453be3b98ecb6685',
    commonCommit: '38a4a2272ec48a9cd5011f8a0055caaca6ab0774'
  });
  assert.equal(Object.keys(aliensIncoming).length, 23);
  for (const [path, digest] of Object.entries(aliensIncoming)) {
    assert.equal(advanceAliens(path, digest), finalEndpoint(path), path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    for (const unrecorded of ['0'.repeat(64), undefined])
      assert.throws(() => advanceAliens(path, unrecorded), /Broken published-Aliens incoming source chain/, path);
    if (aliasesFromAliens[path]) {
      assert.equal(aliasesFromAliens[path].previousSha256, digest, path);
      assert.notEqual(aliasesFromAliens[path].currentSha256, digest, path);
      assert.throws(() => advanceAliens(path, aliasesFromAliens[path].currentSha256), /Broken published-Aliens incoming source chain/, path);
    } else assert.equal(digest, mergedEndpoint(path), 'An unchanged historical parent needs no invented merge successor: ' + path);
  }
  for (const [path, receipt] of Object.entries(aliensMerge)) {
    const published = qualitySuccessors[path] || joinSuccessors[path] || successors[path];
    if (published) assert.equal(receipt.previousSha256, published.currentSha256, path);
    assert.notEqual(receipt.previousSha256, receipt.currentSha256, path);
    assert.ok(Object.isFrozen(receipt));
  }
  for (const path of ['src/unreviewed.js', 'src/app.js/extra', '__proto__', 'constructor', audit])
    assert.equal(advanceAliens(path, 'untouched'), 'untouched');
});

test('the Fiorina join identifies both exact parents and every changed incoming host source', () => {
  assert.deepEqual(joinBaselines, {
    avpCommit: 'ed323c37811e832604d1790b48c6d602a0b0b296',
    fiorinaCommit: '38a4a2272ec48a9cd5011f8a0055caaca6ab0774',
    commonCommit: baseline
  });
  assert.deepEqual(Object.keys(incomingSources).sort(), ['index.html', 'package.json',
    'scripts/verify-public-release-v86.mjs', 'src/app.js', 'src/content.js',
    'src/game-production-runtime.js', 'src/special-operations-v131.js', 'sw.js']);
  assert.ok(Object.isFrozen(joinBaselines) && Object.isFrozen(incomingSources));
  for (const [path, receipt] of Object.entries(joinSuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, path);
    if (successors[path]) assert.equal(receipt.previousSha256, successors[path].currentSha256, path);
  }
  // These sources changed only on Fiorina, so the joined bytes must remain its
  // exact reviewed bytes rather than silently replacing that implementation.
  for (const path of ['src/content.js', 'src/game-production-runtime.js', 'src/special-operations-v131.js'])
    assert.equal(joinSuccessors[path].currentSha256, incomingSources[path], path);
});

test('translation and fixture corrections advance only from the published combined commit', () => {
  assert.equal(qualityBaseline, 'd61077b3d71dc75d5268d62eb44373f4c8fe4bf4');
  assert.equal(Object.hasOwn(qualitySuccessors, audit), false);
  for (const [path, receipt] of Object.entries(qualitySuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.notEqual(receipt.previousSha256, receipt.currentSha256, path);
    const prior = joinSuccessors[path] || successors[path];
    if (prior) assert.equal(receipt.previousSha256, prior.currentSha256, path);
    if (xenoJoin.successors[path]) {
      assert.equal(xenoJoin.successors[path].currentSha256, firstEndpoint(path), path);
      assert.equal(reviewedXenoTrialsTantalusJoinV206(path, xenoJoin.successors[path].previousSha256), finalEndpoint(path), path);
    }
  }
});

test('the combined chain refuses unknown, skipped or repeated predecessors', () => {
  for (const path of verifiedPaths) {
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    const wrong = ['0'.repeat(64), finalEndpoint(path), undefined];
    if (successors[path]) wrong.push(successors[path].currentSha256);
    if (incomingSources[path]) wrong.push(incomingSources[path]);
    for (const endpoint of new Set(wrong))
      assert.throws(() => advance(path, endpoint), brokenChain, path);
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advance(path, 'untouched'), 'untouched');
});

test('both historical chains reach the merged sources without rewriting either join witness', () => {
  const title = 'src/title-screen-v61.js', receipt = successors[title];
  assert.equal(Object.hasOwn(xenoJoin.successors, title), false);
  assert.equal(reviewedAfterNativeQaResourcesV187(title, receipt.previousSha256), finalEndpoint(title));
  for (const path of Object.keys(incomingSources)) {
    const join = xenoJoin.successors[path];
    assert.equal(join.currentSha256, firstEndpoint(path), path);
    assert.equal(reviewedXenoTrialsTantalusJoinV206(path, join.previousSha256), finalEndpoint(path), path);
  }
});

test('runtime views accept only recorded baseline, AVP, join, quality, merge or sprite endpoints', () => {
  const predecessor = Object.fromEntries(verifiedPaths.map(path => [path, firstEndpoint(path)]));
  const publishedAvp = Object.fromEntries(verifiedPaths.map(path => [path, successors[path]?.currentSha256 || firstEndpoint(path)]));
  const joined = Object.fromEntries(verifiedPaths.map(path => [path, joinSuccessors[path]?.currentSha256 || successors[path]?.currentSha256 || firstEndpoint(path)]));
  const expected = Object.fromEntries(verifiedPaths.map(path => [path, finalEndpoint(path)]));
  predecessor['src/untouched.js'] = publishedAvp['src/untouched.js'] = joined['src/untouched.js'] = expected['src/untouched.js'] = 'unchanged';
  assert.deepEqual(runtimeView(predecessor), expected);
  assert.deepEqual(runtimeView(publishedAvp), expected);
  assert.deepEqual(runtimeView(joined), expected);
  assert.deepEqual(runtimeView(expected), expected);
  assert.ok(Object.isFrozen(runtimeView(predecessor)));
  assert.deepEqual(runtimeView({}), {});
  for (const path of verifiedPaths)
    assert.throws(() => runtimeView({ [path]: '0'.repeat(64) }), /Incorrect AVP host runtime view predecessor/, path);
  for (const [path, digest] of Object.entries(incomingSources)) {
    if (!successors[path]) continue;
    assert.notEqual(digest, finalEndpoint(path), path);
    assert.throws(() => runtimeView({ [path]: digest }), /Incorrect AVP host runtime view predecessor/, path);
  }
});

test('a changed byte in every host, join or quality successor fails the real reader contract', () => {
  for (const path of verifiedPaths) {
    const altered = candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\n// unreviewed byte\n')]) : read(candidate);
    assert.throws(() => verify(altered), /Unreviewed AVP host source bytes/, path);
  }
});

test('both historical join receipt blocks remain byte-for-byte identical to the merged baseline', () => {
  for (const anchor of historicalAnchors) {
    const source = read(anchor.path).toString(), start = source.indexOf(anchor.begin), end = source.indexOf(anchor.end, start);
    assert.ok(start >= 0 && end > start);
    assert.equal(sha(source.slice(start, end)), anchor.sha256, anchor.path);
  }
});

test('the actual terminal imports no audit and cannot admit its own bytes', () => {
  const source = read(audit).toString();
  assert.doesNotMatch(source, /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.equal(Object.hasOwn(successors, audit), false);
  assert.equal(Object.hasOwn(joinSuccessors, audit), false);
  assert.equal(Object.hasOwn(qualitySuccessors, audit), false);
  assert.equal(Object.hasOwn(aliensMerge, audit), false);
  assert.equal(Object.hasOwn(aliasesFromAliens, audit), false);
  assert.equal(Object.hasOwn(aliensIncoming, audit), false);
  assert.equal(Object.hasOwn(spriteSuccessors, audit), false);
  assert.equal(Object.hasOwn(spriteV116Successors, audit), false);
  assert.doesNotMatch(source, /from\s+['"].*audit-/);
});


test('the V115 sprite host stage pins exactly its reviewed continuation changes', () => {
  assert.equal(spriteBaseline, 'b89dc6ba47ee1ca90de29f3ccff47ddfe699d2d9');
  assert.deepEqual(Object.keys(spriteSuccessors).sort(), [...expectedSpritePaths].sort());
  assert.equal(sha(JSON.stringify(spriteSuccessors)), '9439407be7bf7587f66811d397d9d8e715e4087d4aed780abd776f532167be9a');
  assert.ok(Object.isFrozen(spriteSuccessors));
  for (const [path, receipt] of Object.entries(spriteSuccessors)) {
    assert.ok(Object.isFrozen(receipt), path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256'], path);
    assert.notEqual(receipt.previousSha256, receipt.currentSha256, path);
    if (mergedEndpoint(path)) assert.equal(receipt.previousSha256, mergedEndpoint(path), path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceSprites(path, receipt.previousSha256), finalEndpoint(path), path);
  }
  assert.equal(Object.hasOwn(spriteSuccessors, audit), false);
});

test('the sprite stage rejects wrong or repeated predecessors and both parents reach its endpoint', () => {
  for (const [path, receipt] of Object.entries(spriteSuccessors)) {
    for (const value of [receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceSprites(path, value), /Broken published-merge-to-Fiorina-sprites source chain/, path);
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    if (Object.hasOwn(aliensIncoming, path))
      assert.equal(advanceAliens(path, aliensIncoming[path]), finalEndpoint(path), path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: finalEndpoint(path) });
    assert.deepEqual(runtimeView({ [path]: receipt.currentSha256 }), { [path]: finalEndpoint(path) });
  }
  for (const path of ['src/unreviewed.js', 'src/game-production-runtime.js/extra', '__proto__', 'constructor', audit])
    assert.equal(advanceSprites(path, 'unchanged'), 'unchanged', path);
});

test('V116 advances exactly four reviewed hosts after the merged V115 receipts', () => {
  assert.equal(spriteV116Baseline, 'ae4e49bef5fea639d0c381466aefea85f8a57300');
  assert.deepEqual(Object.keys(spriteV116Successors).sort(), [...expectedSpriteV116Paths].sort());
  assert.equal(sha(JSON.stringify(spriteV116Successors)), 'c0ec33023116df2d63f3153eba08217f702526a3298f25246cfe12323f98f05e');
  assert.ok(Object.isFrozen(spriteV116Successors));
  for (const [path, receipt] of Object.entries(spriteV116Successors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.equal(receipt.previousSha256, spriteSuccessors[path].currentSha256, path);
    assert.equal(sha(read(path)), receipt.currentSha256, path);
    assert.equal(advanceV116(path, receipt.previousSha256), receipt.currentSha256, path);
    assert.equal(advanceSprites(path, spriteSuccessors[path].previousSha256), receipt.currentSha256, path);
    for (const value of [receipt.currentSha256, spriteSuccessors[path].previousSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceV116(path, value), /Broken Fiorina-V115-to-V116 source chain/, path);
    assert.deepEqual(runtimeView({ [path]: receipt.currentSha256 }), { [path]: receipt.currentSha256 });
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceV116(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(spriteV116Successors, audit), false);
});


test('DLC source archive advances only the exact public path verifier from the V116 baseline', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  assert.equal(dlcArchiveSourceBaseline, 'b0df1877a058f0818f96437fdfdea3f21ba7f415');
  assert.deepEqual(Object.keys(dlcArchiveSourceSuccessors), [path]);
  assert.equal(sha(JSON.stringify(dlcArchiveSourceSuccessors)), '4ee82a5db250154a4e17802edefec0b27c837013dfc04cb225d958cf403e3e56');
  assert.ok(Object.isFrozen(dlcArchiveSourceSuccessors));
  const receipt = dlcArchiveSourceSuccessors[path];
  assert.ok(Object.isFrozen(receipt));
  assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
  assert.equal(receipt.previousSha256, spriteSuccessors[path].currentSha256);
  assert.equal(sha(read(path)), advanceHistoricalArchive(path, receipt.currentSha256));
  assert.equal(advanceDlcArchiveSource(path, receipt.previousSha256), advanceHistoricalArchive(path, receipt.currentSha256));
  for (const value of [receipt.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceDlcArchiveSource(path, value), /Broken V116-to-DLC-source-archive source chain/);
  for (const value of [receipt.previousSha256, receipt.currentSha256])
    assert.deepEqual(runtimeView({ [path]: value }), { [path]: advanceHistoricalArchive(path, receipt.currentSha256) });
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceDlcArchiveSource(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(dlcArchiveSourceSuccessors, audit), false);
});

test('DLC archive source admission is exact, typed and excluded from builds', () => {
  const files = [
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/README_V12.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/src/dlc-prometheus/content.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/LICENSE_NOTICE.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/CODEX_PROMETHEUS_V12.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v8/README_V8.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v4/README.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v4/CODEX_PROMETHEUS_V4.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v5/README_V5.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development/README.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development/v6/README.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v1/content.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v1/README.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v3/README.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v3/CODEX_PROMETHEUS_V3.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v2/README.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v2/CODEX_PROMETHEUS_V2.md",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/RULES_V12.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/PORTAL_CLEARANCE_CHANGES.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/REFERENCE_MATRIX_V11.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/RULES_V11.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/QA_SUMMARY_V12.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/rules-v10.json",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs/QA_SUMMARY_V11.json",
  "archives/dlc-source-recovery-20261126/prometheus/parts/ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip.part-000",
  "archives/dlc-source-recovery-20261126/prometheus/parts/ALIENS_TANTALUS_DLC_PROMETHEUS_V12.zip.part-001",
  "archives/dlc-source-recovery-20261126/prometheus/MANIFEST.json",
  "archives/dlc-source-recovery-20261126/prometheus/ZIP_CONTENTS.json",
  "archives/dlc-source-recovery-20261126/prometheus/IMAGE_CANDIDATES.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/NOTICE_ASSETS.md",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/README.md",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/audio-incarnation/manifest.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/concordance/manifest.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/incarnation/manifest.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/BASE_PROVENANCE.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/BASE_PROVENANCE_V18.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/BASE_PROVENANCE_V19.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/CAMPAGNE_ET_DIALOGUES_V20.md",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/REGISTRE_CONCORDANCE_V19.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/REGISTRE_CONVERGENCES_V20.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V14.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V15.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V17.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V18.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V19.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/ROMULUS_MANIFEST_V20.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/SOURCES_V14.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/SOURCES_V18.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v13/ROMULUS_MANIFEST_V13.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v13/SOURCES_V13.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v15/SOURCES_V15.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/ROMULUS_MANIFEST_V16.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/SOURCES_V16.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/ASSET_CONTINUITY_V16.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/CAPTURES_V16.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/PDF_LAYOUT_V16.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa/TEST_SCHEMA_CHANGES_V16.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v17/BASE_PROVENANCE_V17.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v17/SOURCES_V17.json",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa/fixtures/v13/manifest.json",
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-000",
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-001",
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-002",
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-003",
  "archives/dlc-source-recovery-20261126/romulus/parts/ALIEN_ROMULUS_CONVERGENCES_v0.20.zip.part-004",
  "archives/dlc-source-recovery-20261126/romulus/MANIFEST.json",
  "archives/dlc-source-recovery-20261126/romulus/ZIP_CONTENTS.json",
  "archives/dlc-source-recovery-20261126/romulus/IMAGE_CANDIDATES.json",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/CHANGELOG.md",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/README_FR.md",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs/CODEX_ISOLATION.md",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs/METRIQUES.json",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs/QA_RESUME.md",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/src/content.json",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-000",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-001",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-002",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-003",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-004",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-005",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-006",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-007",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts/ALIENS_TANTALUS_DLC_ALIEN_ISOLATION_V0_8.zip.part-008",
  "archives/dlc-source-recovery-20261126/alien-isolation/MANIFEST.json",
  "archives/dlc-source-recovery-20261126/alien-isolation/ZIP_CONTENTS.json",
  "archives/dlc-source-recovery-20261126/alien-isolation/IMAGE_CANDIDATES.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/LIRE_DABORD.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/NOTICE.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/SHA256SUMS.txt",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/AUDIT_FIDELITE_V0_10.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_10.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_2.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_3.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_4.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_5.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_6.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_7.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_8.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CHANGEMENTS_0_9.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CODEX_AVPR.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CODEX_V0_10.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/CONTENT_MANIFEST.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/FIDELITY_CHANGES.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/FIDELITY_MANIFEST.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/STATUT_ET_SOURCES.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v03/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v04/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v05/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v06/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v07/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v08/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v09/content.json",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/tests-v09-original/README.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport/ENVIRONNEMENT.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport/HISTORIQUE_VALIDATION_0_10.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport/QA.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v07/PROVENANCE.md",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v09/PROVENANCE.md",
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-000",
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-001",
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-002",
  "archives/dlc-source-recovery-20261126/avpr/parts/ALIENS_TANTALUS_DLC_AVPR_V0_10.zip.part-003",
  "archives/dlc-source-recovery-20261126/avpr/MANIFEST.json",
  "archives/dlc-source-recovery-20261126/avpr/ZIP_CONTENTS.json",
  "archives/dlc-source-recovery-20261126/avpr/IMAGE_CANDIDATES.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_10_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_2_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_3_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_4_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_5_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_6_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_7_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_8_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/CHANGELOG_0_9_0.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/NOTICE.txt",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/README.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/ADAPTATION.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/ASSETS_STATUS.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/CODEX_LEVEL_DESIGN.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/COUNTS.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/COUNTS_010.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/DOCUMENT_COUNTS.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/FIDELITY_RULES_010.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/INTEGRATION_CODEX.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/PROVENANCE.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/SOURCES.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/content-manifest.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/fidelity/REFERENCE_LEDGER.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/history-v09/CODEX_LEVEL_DESIGN_0_9.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/legacy/README.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/DIAGNOSTIC_HISTORY.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/QA_REPORT.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history06/README.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history08/DIAGNOSTIC_HISTORY_08.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history08/README.md",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-000",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-001",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-002",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-003",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-004",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts/ALIENS_TANTALUS_DLC_COLONIAL_MARINES_0_10_0.zip.part-005",
  "archives/dlc-source-recovery-20261126/colonial-marines/MANIFEST.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/ZIP_CONTENTS.json",
  "archives/dlc-source-recovery-20261126/colonial-marines/IMAGE_CANDIDATES.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/CHANGELOG_V11.md",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/LICENSE_NOTICE.md",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/README.md",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/AUDIT_FIDELITE_V11.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/CODEX_REGLES_V11.md",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/ROOMS_V11.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/base-v10-data.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/reference-corpus-v10.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/reference-corpus-v11.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/rules-v10.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs/rules-v11.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/game/data.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/integration/README.md",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/qa/README.md",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/requirements-qa.txt",
  "archives/dlc-source-recovery-20261126/alien5-lazare/parts/DLC_ALIEN5_PROJET_LAZARE_V11_CANDIDAT.zip.part-000",
  "archives/dlc-source-recovery-20261126/alien5-lazare/MANIFEST.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/ZIP_CONTENTS.json",
  "archives/dlc-source-recovery-20261126/alien5-lazare/IMAGE_CANDIDATES.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/README.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CHANGELOG.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CODEX_COMPLET_v0.6.0.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CODEX_COMPLET_v0.7.0.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/CONTENT_MANIFEST.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/INTEGRATION.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/KNOWN_LIMITS.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/REGISTRE_FIDELITE_V7.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SMOKE_TEST_MANUEL.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCES_ET_FIDELITE.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_PROVENANCE_V3_INHERITED.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_V4.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_V5.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/SOURCE_V7.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs/content-v7.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/qa/REPRODUCIBILITE.md",
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-000",
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-001",
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-002",
  "archives/blackout-source-recovery-20261126/alien-blackout/parts/ALIENS_TANTALUS_DLC_ALIEN_BLACKOUT_v0.7.0.zip.part-003",
  "archives/blackout-source-recovery-20261126/alien-blackout/MANIFEST.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/ZIP_CONTENTS.json",
  "archives/blackout-source-recovery-20261126/alien-blackout/IMAGE_CANDIDATES.json",
  "archives/dlc-source-recovery-20261126/reconstruct.py",
  "archives/dlc-source-recovery-20261126/README.md"
];
  const directories = [
  "archives",
  "archives/blackout-source-recovery-20261126",
  "archives/blackout-source-recovery-20261126/alien-blackout",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/docs",
  "archives/blackout-source-recovery-20261126/alien-blackout/documents/ALIEN_BLACKOUT_v0.7.0/qa",
  "archives/blackout-source-recovery-20261126/alien-blackout/parts",
  "archives/dlc-source-recovery-20261126",
  "archives/dlc-source-recovery-20261126/alien-isolation",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/docs",
  "archives/dlc-source-recovery-20261126/alien-isolation/documents/ALIEN_ISOLATION_DLC_V0_8/src",
  "archives/dlc-source-recovery-20261126/alien-isolation/parts",
  "archives/dlc-source-recovery-20261126/alien5-lazare",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/docs",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/game",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/integration",
  "archives/dlc-source-recovery-20261126/alien5-lazare/documents/ALIEN5_PROJET_LAZARE_V11/qa",
  "archives/dlc-source-recovery-20261126/alien5-lazare/parts",
  "archives/dlc-source-recovery-20261126/avpr",
  "archives/dlc-source-recovery-20261126/avpr/documents",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v03",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v04",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v05",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v06",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v07",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v08",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/baseline-v09",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/docs/tests-v09-original",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/rapport",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v07",
  "archives/dlc-source-recovery-20261126/avpr/documents/AVPR_REQUIEM_V010/tests/fixtures/previous-v09",
  "archives/dlc-source-recovery-20261126/avpr/parts",
  "archives/dlc-source-recovery-20261126/colonial-marines",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/fidelity",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/docs/history-v09",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/legacy",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history06",
  "archives/dlc-source-recovery-20261126/colonial-marines/documents/COLONIAL_MARINES_0_10_0/reports/history08",
  "archives/dlc-source-recovery-20261126/colonial-marines/parts",
  "archives/dlc-source-recovery-20261126/prometheus",
  "archives/dlc-source-recovery-20261126/prometheus/documents",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/docs",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/development/v6",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v1",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v2",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v3",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v4",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v5",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/history/v8",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/src",
  "archives/dlc-source-recovery-20261126/prometheus/documents/PROMETHEUS_DLC_V12/src/dlc-prometheus",
  "archives/dlc-source-recovery-20261126/prometheus/parts",
  "archives/dlc-source-recovery-20261126/romulus",
  "archives/dlc-source-recovery-20261126/romulus/documents",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/audio-incarnation",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/concordance",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/assets/incarnation",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v13",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v15",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v16/qa",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/docs/historique_v17",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa/fixtures",
  "archives/dlc-source-recovery-20261126/romulus/documents/ALIEN_ROMULUS_CONVERGENCES_v0.20/qa/fixtures/v13",
  "archives/dlc-source-recovery-20261126/romulus/parts"
];
  for (const path of files) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, {directory:true}), false, path);
    assert.equal(isPublicDistributionPathV86(path, {built:true}), false, path);
  }
  for (const path of directories) {
    assert.equal(isPublicDistributionPathV86(path, {directory:true}), true, path);
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, {directory:true,built:true}), false, path);
  }
  for (const root of ['archives/dlc-source-recovery-20261126', 'archives/blackout-source-recovery-20261126']) {
    for (const suffix of ['/unreviewed.zip', '/../private.txt', '/parts/extra', '/README.md/extra']) {
      assert.equal(isPublicDistributionPathV86(root+suffix), false, root+suffix);
      assert.equal(isPublicDistributionPathV86(root+suffix, {directory:true}), false, root+suffix);
    }
  }
});
