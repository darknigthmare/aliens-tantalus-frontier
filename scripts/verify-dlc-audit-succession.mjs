import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
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
  AVP_DLC_BIBLE_DOCUMENTS_BASELINE_20261126 as bibleDocumentsBaseline,
  AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126 as bibleDocumentsSuccessors,
  reviewedDlcBibleDocumentsHostDigest20261126 as advanceBibleDocuments,
  AVP_DLC_BIBLE_BRIDGE_BASELINE_20261126 as bibleBridgeBaseline,
  AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126 as bibleBridgeSuccessors,
  reviewedDlcBibleBridgeHostDigest20261126 as advanceBibleBridge,
  AVP_PRODUCTION_BIBLE_BASELINE_20261126 as productionBibleBaseline,
  AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126 as productionBibleSuccessors,
  reviewedAvpProductionBibleHostDigest20261126 as advanceProductionBible,
  COVENANT_DLC_BIBLE_MERGE_BASELINES_20261126 as covenantBibleMergeBaselines,
  COVENANT_DLC_BIBLE_MERGE_SOURCES_20261126 as covenantBibleMergeSources,
  reviewedCovenantDlcBibleMergeDigest20261126 as advanceCovenantBibleMerge,
  reviewedFiorinaV116HostDigest20261125 as advanceV116,
  AVP_COVENANT_BASELINE_20261126 as covenantBaseline,
  AVP_COVENANT_SUCCESSORS_20261126 as covenantSuccessors,
  reviewedCovenantHostDigest20261126 as advanceCovenant,
  AVP_COVENANT_V012_BASELINE_20261126 as covenantV012Baseline,
  AVP_COVENANT_V012_SUCCESSORS_20261126 as covenantV012Successors,
  reviewedCovenantV012HostDigest20261126 as advanceCovenantV012,
  reviewedFiorinaSpriteHostDigest20261125 as advanceSprites,
  reviewedAliensIncomingDigest20261125 as advanceAliens,
  reviewedAvpHostDigest20261125 as advance, avpHostRuntimeSources20261125 as runtimeView,
  verifyAvpHostSources20261125 as verify } from './audit-dlc-avp-2004-20261125.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter, EXCLUDED_BUILD_ASSET_PATHS } from './build-asset-filter.mjs';
import { reviewedAfterNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { XENO_TRIALS_TANTALUS_JOIN_V206 as xenoJoin,
  reviewedXenoTrialsTantalusJoinV206, verifyXenoTrialsTantalusJoinV206 } from './audit-xeno-production-assets-v206.mjs';

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
const expectedCovenantPaths = [
  "index.html",
  "package.json",
  "scripts/build-asset-filter.mjs",
  "scripts/build.mjs",
  "scripts/verify-public-release-v86.mjs",
  "src/title-screen-v61.js"
];
const expectedCovenantV012Paths = ['scripts/qa-title-compositions-v163.py', 'scripts/verify-public-release-v86.mjs'];
const verifiedPaths = [...new Set([...expectedPaths, ...expectedJoinPaths, ...expectedQualityPaths, ...Object.keys(aliensMerge), ...expectedSpritePaths, ...expectedSpriteV116Paths, ...expectedCovenantPaths, ...expectedCovenantV012Paths, ...Object.keys(bibleBridgeSuccessors)])];
const firstEndpoint = path => (successors[path] || joinSuccessors[path] || qualitySuccessors[path] || aliensMerge[path] || spriteSuccessors[path] || bibleBridgeSuccessors[path]).previousSha256;
const mergedEndpoint = path => (aliensMerge[path] || qualitySuccessors[path] || joinSuccessors[path] || successors[path])?.currentSha256;
const preCovenantEndpoint = path => spriteV116Successors[path]?.currentSha256 || spriteSuccessors[path]?.currentSha256 || mergedEndpoint(path);
const preCovenantV012Endpoint = path => covenantSuccessors[path]?.currentSha256 || preCovenantEndpoint(path);
const finalEndpoint = path => covenantBibleMergeSources[path]?.currentSha256
  || covenantV012Successors[path]?.currentSha256 || covenantSuccessors[path]?.currentSha256
  || productionBibleSuccessors[path]?.currentSha256 || bibleBridgeSuccessors[path]?.currentSha256
  || bibleDocumentsSuccessors[path]?.currentSha256 || preCovenantEndpoint(path);
const brokenChain = /Broken (?:merged-Tantalus-to-AVP host|AVP-to-Fiorina host|joined-host-to-Fiorina-QA|published-AVP-to-Aliens-merge|published-merge-to-Fiorina-sprites|Fiorina-V115-to-V116|published-host-to-Covenant|Covenant-V011-to-V012 host|V116-to-DLC-bible-documents|DLC-bible-document-bridge|DLC-bible-to-AVP-production|Covenant-and-DLC-bibles merge) source chain/;

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
    covenantV012Successors: expectedCovenantV012Paths.length, historicalEvidenceTransferred: false });
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
  assert.equal(Object.hasOwn(covenantSuccessors, audit), false);
  assert.equal(Object.hasOwn(covenantV012Successors, audit), false);
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

test('Covenant advances only six exact reviewed host endpoints after the published V116 parent', () => {
  assert.equal(covenantBaseline, 'b0df1877a058f0818f96437fdfdea3f21ba7f415');
  assert.deepEqual(Object.keys(covenantSuccessors).sort(), [...expectedCovenantPaths].sort());
  assert.equal(sha(JSON.stringify(covenantSuccessors)), 'baa661ba0b58d60fa0278d83c0b6b353cbe70c3b03ddc2ffb39e5a965ef65524');
  assert.ok(Object.isFrozen(covenantSuccessors));
  for (const [path, receipt] of Object.entries(covenantSuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.equal(receipt.previousSha256, preCovenantEndpoint(path), path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceCovenant(path, receipt.previousSha256), finalEndpoint(path), path);
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    if (Object.hasOwn(aliensIncoming, path))
      assert.equal(advanceAliens(path, aliensIncoming[path]), finalEndpoint(path), path);
    for (const invalid of [receipt.currentSha256, firstEndpoint(path), '0'.repeat(64), undefined])
      assert.throws(() => advanceCovenant(path, invalid), /Broken published-host-to-Covenant source chain/, path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: finalEndpoint(path) });
    assert.deepEqual(runtimeView({ [path]: receipt.currentSha256 }), { [path]: finalEndpoint(path) });
  }
  for (const path of ['src/unreviewed.js', 'index.html/extra', '__proto__', 'constructor', audit])
    assert.equal(advanceCovenant(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(covenantSuccessors, audit), false);
});

test('all pre-Covenant receipt declarations retain their published bytes', () => {
  const source = withoutTargetReceiptDeclarations(read(audit).toString());
  const end = source.indexOf('// BEGIN COVENANT V011 HOST RECEIPTS');
  assert.ok(end > 0);
  assert.equal(sha(source.slice(0, end)), 'ed20ec02354311aaa7639697bdc05e01b652671ea3291c14ae69f478115b26c0');
});

// Only these reviewed Covenant edits reconstruct the exact immutable parent.
// This is a proof over source bytes, not a runtime admission exception.
const covenantSourceEdits = {
  "index.html": [
    [
      "        <button id=\"title-covenant\" type=\"button\">ALIEN: COVENANT</button>\n",
      ""
    ]
  ],
  "package.json": [
    [
      "    \"qa:fiorina:native-sprites\": \"node scripts/qa-fiorina-native-sprites-v115.mjs\",\n    \"test:covenant\": \"node --test scripts/verify-covenant-sprites-v011.mjs scripts/verify-covenant-integration-v011.mjs\",\n    \"build:covenant\": \"node scripts/build-covenant-v011.mjs\",\n    \"check:covenant\": \"node scripts/build-covenant-v011.mjs --check\",\n    \"qa:covenant\": \"python scripts/qa-covenant-v011.py\",\n    \"qa:covenant:playthrough\": \"node modules/covenant/qa/release-playthrough-v10.cjs\"\n",
      "    \"qa:fiorina:native-sprites\": \"node scripts/qa-fiorina-native-sprites-v115.mjs\"\n"
    ]
  ],
  "scripts/build-asset-filter.mjs": [
    [
      "import { publicCovenantPathAdmissionV011 } from './public-covenant-admissions-v011.mjs';\n",
      ""
    ],
    [
      "    const covenantAdmission = publicCovenantPathAdmissionV011(sourcePath, { directory: sourcePath === 'assets/openai/sprites/alien-covenant-v011', built: true });\n    if (covenantAdmission !== null) return covenantAdmission;\n",
      ""
    ]
  ],
  "scripts/build.mjs": [
    [
      "import { buildCovenantDlcV011 } from './build-covenant-v011.mjs';\n",
      ""
    ],
    [
      "await buildCovenantDlcV011(root, output);\n",
      ""
    ]
  ],
  "scripts/verify-public-release-v86.mjs": [
    [
      "import { publicCovenantPathAdmissionV011 } from './public-covenant-admissions-v011.mjs';\nimport { verifyCovenantBundleV011, verifyCovenantAssetsV011, COVENANT_PROVENANCE_V011,\n  reviewedCovenantSourceMetadataV011 } from './build-covenant-v011.mjs';\n",
      ""
    ],
    [
      "  const covenantAdmission = publicCovenantPathAdmissionV011(path, { directory, built });\n  if (covenantAdmission !== null) return covenantAdmission;\n",
      ""
    ],
    [
      "      if (!built && path === COVENANT_PROVENANCE_V011) {\n        // Exact reviewed source metadata, including sprite prompts and public URLs.\n        // The path gate above rejects this file from every built distribution.\n        const bytes = await readFile(join(directory, entry.name));\n        assert.equal(reviewedCovenantSourceMetadataV011(path, bytes, { built }), true,\n          'Unreviewed Covenant source metadata bytes: ' + path);\n        continue;\n      }\n",
      ""
    ],
    [
      "  if (built) await verifyCovenantAssetsV011(root);\n  else await verifyCovenantBundleV011(root);\n",
      ""
    ]
  ],
  "src/title-screen-v61.js": [
    [
      "  constructor({ root, app, scene = null, getSave, getRecoveryStatus = () => null, onUnlock, onContinue, onNewTimeline, onForge, onOptions, onDlc, onAliens1986, onCovenant }) {\n",
      "  constructor({ root, app, scene = null, getSave, getRecoveryStatus = () => null, onUnlock, onContinue, onNewTimeline, onForge, onOptions, onDlc, onAliens1986 }) {\n"
    ],
    [
      "    this.onCovenant = onCovenant;\n",
      ""
    ],
    [
      "    this.covenantButton = root.querySelector('#title-covenant');\n",
      ""
    ],
    [
      "    if (this.covenantButton) listen(this.covenantButton, 'click', (event) => {\n      if (event.detail <= 1) this.openCovenant();\n    });\n",
      ""
    ],
    [
      "    return [this.continueButton, this.newButton, this.dlcButton, this.forgeButton, this.aliens1986Button, this.covenantButton, this.optionsButton]\n",
      "    return [this.continueButton, this.newButton, this.dlcButton, this.forgeButton, this.aliens1986Button, this.optionsButton]\n"
    ],
    [
      "  openCovenant() {\n    if (this.root.hidden || this.state !== 'menu') return;\n    this.cancelNewTimelineConfirmation();\n    this.suspendInput();\n    if (this.onCovenant) return this.onCovenant();\n    globalThis.location.assign('/dlc/covenant/?from=tantalus');\n  }\n\n",
      ""
    ]
  ]
};
test('removing only the reviewed Covenant host edits recovers all six exact parent sources', () => {
  assert.deepEqual(Object.keys(covenantSourceEdits).sort(), [...expectedCovenantPaths].sort());
  for (const [path, edits] of Object.entries(covenantSourceEdits)) {
    let source = withoutCovenantV012HostEdits(path, withoutTargetHostEdits(path, read(path).toString()));
    for (const [current, previous] of edits) {
      assert.notEqual(current, '', path);
      assert.equal(source.split(current).length, 2, 'Missing or repeated Covenant source edit: ' + path);
      source = source.replace(current, () => previous);
    }
    assert.equal(sha(source), covenantSuccessors[path].previousSha256, 'Unrelated host change: ' + path);
  }
});

// These two inverse edits prove the exact aa6e3cc parent, without accepting other source changes.
const covenantV012SourceEdits = {
  "scripts/qa-title-compositions-v163.py": [
    [
      "                    expected_focus = ['title-continue', 'title-new', 'title-dlc', 'title-forge',\n                                      'title-aliens1986', 'title-covenant', 'title-options']\n                    focus_order = []\n                    for _ in range(len(expected_focus)):\n                        focus_order.append(observed(page)['focus'])\n                        page.keyboard.press('ArrowDown')\n                    check(label + ': native keyboard reaches each existing menu action once', focus_order == expected_focus)",
      "                    focus_order = []\n                    for _ in range(5):\n                        focus_order.append(observed(page)['focus'])\n                        page.keyboard.press('ArrowDown')\n                    check(label + ': native keyboard reaches each existing menu action once', focus_order == ['title-continue', 'title-new', 'title-dlc', 'title-forge', 'title-options'])"
    ]
  ],
  "scripts/verify-public-release-v86.mjs": [
    [
      "verifyCovenantAssetsV011, covenantSourceMetadataPathV011,",
      "verifyCovenantAssetsV011, COVENANT_PROVENANCE_V011,"
    ],
    [
      "if (!built && covenantSourceMetadataPathV011(path)) {",
      "if (!built && path === COVENANT_PROVENANCE_V011) {"
    ]
  ]
};
function withoutCovenantV012HostEdits(path, text) {
  for (const [current, previous] of covenantV012SourceEdits[path] || []) {
    assert.equal(text.split(current).length, 2, 'Missing or repeated Covenant V012 source edit: ' + path);
    text = text.replace(current, () => previous);
  }
  return text;
}

test('Covenant V012 advances only two exact sources from the published V011 head', () => {
  assert.equal(covenantV012Baseline, 'aa6e3ccdecd54a5d20905e9d5cb6f9273cc27fa9');
  assert.deepEqual(Object.keys(covenantV012Successors).sort(), [...expectedCovenantV012Paths].sort());
  assert.equal(sha(JSON.stringify(covenantV012Successors)), 'ae421a28f1097236bdd7acc6e4db4fcb98ed09a7a595b99b762fb2954822f946');
  assert.ok(Object.isFrozen(covenantV012Successors));
  for (const [path, receipt] of Object.entries(covenantV012Successors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.equal(receipt.previousSha256, preCovenantV012Endpoint(path), path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceCovenantV012(path, receipt.previousSha256), finalEndpoint(path), path);
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    if (Object.hasOwn(aliensIncoming, path))
      assert.equal(advanceAliens(path, aliensIncoming[path]), finalEndpoint(path), path);
    for (const invalid of [receipt.currentSha256, firstEndpoint(path), '0'.repeat(64), undefined])
      assert.throws(() => advanceCovenantV012(path, invalid), /Broken Covenant-V011-to-V012 host source chain/, path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: finalEndpoint(path) });
    assert.deepEqual(runtimeView({ [path]: receipt.currentSha256 }), { [path]: finalEndpoint(path) });
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceCovenantV012(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(covenantV012Successors, audit), false);
});

test('all published receipt declarations including Covenant V011 remain byte-identical', () => {
  const source = withoutTargetReceiptDeclarations(read(audit).toString()), end = source.indexOf('// BEGIN COVENANT V012 HOST RECEIPTS');
  assert.ok(end > 0);
  assert.equal(sha(source.slice(0, end)), '58ebb68d615843dda9113ba88d69534b1cb1394a9262cf638e7ad173ef1ca731');
  assert.equal(sha(JSON.stringify(covenantSuccessors)), 'baa661ba0b58d60fa0278d83c0b6b353cbe70c3b03ddc2ffb39e5a965ef65524');
});

test('removing only the reviewed V012 source edits recovers both exact V011 parent sources', () => {
  assert.deepEqual(Object.keys(covenantV012SourceEdits).sort(), [...expectedCovenantV012Paths].sort());
  for (const [path, receipt] of Object.entries(covenantV012Successors)) {
    const previous = withoutCovenantV012HostEdits(path, withoutTargetHostEdits(path, read(path).toString()));
    assert.equal(sha(previous), receipt.previousSha256, 'Unrelated V012 host change: ' + path);
  }
});


// These projections prove the immutable parent bytes. They never relax runtime
// admissions: the real reader still hashes the three merged source files.
const targetReceiptDeclarations = "// BEGIN DLC BIBLE DOCUMENT HOST RECEIPTS 20261126\n// Source-only paths follow the exact V116 baseline. Historical receipts and\n// earlier QA remain unchanged; this stage grants no artistic or runtime approval.\nexport const AVP_DLC_BIBLE_DOCUMENTS_BASELINE_20261126 = 'b0df1877a058f0818f96437fdfdea3f21ba7f415';\nexport const AVP_DLC_BIBLE_DOCUMENTS_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(\n  Object.entries({\n  \"scripts/verify-public-release-v86.mjs\": {\n    \"previousSha256\": \"6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f\",\n    \"currentSha256\": \"699e7e0234f0528ffe1e7be1b78b6d0130a5f7cb364ac1be1e670c1b625f7558\"\n  }\n}).map(([path, receipt]) => [path, Object.freeze(receipt)])\n));\n// END DLC BIBLE DOCUMENT HOST RECEIPTS 20261126\n\n// BEGIN DLC BIBLE BRIDGE HOST RECEIPTS 20261126\n// PR 68 added the campaign-to-DLC index link without its source successor.\n// Record that exact document change after the published document-admission stage.\n// This source-only receipt changes no campaign content, game state or art status.\nexport const AVP_DLC_BIBLE_BRIDGE_BASELINE_20261126 = '16686e8681cc0370db3fa3df2967704ef1862155';\nexport const AVP_DLC_BIBLE_BRIDGE_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(\n  Object.entries({\n  \"docs/narrative/CAMPAGNE_PRINCIPALE.md\": {\n    \"previousSha256\": \"aa4681a3a1eec25fb8bb2ef4502fd0a0dbcffd10bb57a8092b3fbc559bfc51b2\",\n    \"currentSha256\": \"0828b50f85fb83f3e10a831ceb0f8d5aa489e20a289007057758d03b836bfcf2\"\n  }\n}).map(([path, receipt]) => [path, Object.freeze(receipt)])\n));\n// END DLC BIBLE BRIDGE HOST RECEIPTS 20261126\n\n// BEGIN AVP PRODUCTION BIBLE HOST RECEIPTS 20261126\n// A closed source-only production inventory follows the exact corrected bible head.\n// Earlier receipts remain immutable; this stage grants no gameplay or art approval.\nexport const AVP_PRODUCTION_BIBLE_BASELINE_20261126 = '268b1a517c60338899578a165e9784c5b7313dba';\nexport const AVP_PRODUCTION_BIBLE_SUCCESSORS_20261126 = Object.freeze(Object.fromEntries(\n  Object.entries({\n  \"scripts/verify-public-release-v86.mjs\": {\n    \"previousSha256\": \"699e7e0234f0528ffe1e7be1b78b6d0130a5f7cb364ac1be1e670c1b625f7558\",\n    \"currentSha256\": \"ee4324f23d1a4d3282f55490ea19222dcc9bcea096f4a38d3dce4c937b74916b\"\n  },\n  \"scripts/build-asset-filter.mjs\": {\n    \"previousSha256\": \"c49bbc4bf3598a633f78c98febff0309e54b367e5643e4a98daf0371d9b91a56\",\n    \"currentSha256\": \"5735cc0a8110342349313df1c70cba220308238ee756674a357f45aa98a4f8bd\"\n  }\n}).map(([path, receipt]) => [path, Object.freeze(receipt)])\n));\n// END AVP PRODUCTION BIBLE HOST RECEIPTS 20261126\n\n";
const targetSourceEdits = {
  "scripts/build-asset-filter.mjs": [
    [
      "  'assets/openai/sprites/avp2004-production-v001',\n  'docs/narrative/dlc/avp-2004-production-20261126',\n",
      ""
    ]
  ],
  "scripts/verify-public-release-v86.mjs": [
    [
      "  // DLC bible consolidation: exact source-only documents, never shipped.\n  'docs/narrative/dlc',\n  'docs/narrative/dlc/RECUPERATION_20261126.json',\n  'docs/narrative/dlc/RECUPERATION_20261126.md',\n  'docs/narrative/DLC_DISCUSSIONS_20261126.json',\n  'docs/narrative/DLC_INDEX_20261126.md',\n  'docs/narrative/dlc/40th-anniversary.md',\n  'docs/narrative/dlc/alien-1979-nostromo.md',\n  'docs/narrative/dlc/alien-blackout.md',\n  'docs/narrative/dlc/alien-covenant.md',\n  'docs/narrative/dlc/alien-earth.md',\n  'docs/narrative/dlc/alien-isolation.md',\n  'docs/narrative/dlc/alien-resurrection.md',\n  'docs/narrative/dlc/alien-romulus.md',\n  'docs/narrative/dlc/alien3-fiorina.md',\n  'docs/narrative/dlc/alien5-projet-lazare.md',\n  'docs/narrative/dlc/aliens-1986.md',\n  'docs/narrative/dlc/avp-2004.md',\n  'docs/narrative/dlc/avp-requiem.md',\n  'docs/narrative/dlc/colonial-marines.md',\n  'docs/narrative/dlc/out-of-the-shadows.md',\n  'docs/narrative/dlc/prometheus.md',\n  'docs/narrative/dlc/river-of-pain.md',\n  'docs/narrative/dlc/sea-of-sorrows.md',\n",
      ""
    ],
    [
      "// Exact AVP production sources remain outside the playable distribution.\n// A generated candidate is not a runtime asset or a fidelity certification.\nconst AVP_PRODUCTION_SOURCE_DIRECTORIES_20261126 = new Set([\n  \"docs/narrative/dlc/avp-2004-production-20261126\",\n  \"assets/openai/sprites/avp2004-production-v001\"\n]);\nconst AVP_PRODUCTION_SOURCE_FILES_20261126 = new Set([\n  \"docs/narrative/dlc/avp-2004-production-20261126/README.md\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/SOURCES.md\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/INVENTORY.md\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/runtime-inventory.json\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/PRODUCTION_SPECIFICATIONS.md\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/production-specs.json\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/GALLERY.md\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/manifest.json\",\n  \"docs/narrative/dlc/avp-2004-production-20261126/canon-research.json\",\n  \"assets/openai/sprites/avp2004-production-v001/chestburster-human-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/piper-maru-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/earth-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/glacier-face-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/snowcat-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/whalebone-arch-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/whaling-station-facade-avp2004-v001.png\",\n  \"assets/openai/sprites/avp2004-production-v001/weyland-satellite-avp2004-v001.png\"\n]);\n\n",
      ""
    ],
    [
      "  if (AVP_PRODUCTION_SOURCE_DIRECTORIES_20261126.has(path)) return !built && directory;\n  if (typeof path === 'string' && [...AVP_PRODUCTION_SOURCE_DIRECTORIES_20261126].some(root => path.startsWith(root + '/')))\n    return !built && !directory && AVP_PRODUCTION_SOURCE_FILES_20261126.has(path);\n",
      ""
    ]
  ]
};
const covenantCampaignAppendices = "\n---\n\n## Annexe de production — DLC Alien: Covenant V0.14\n\nLe suivi détaillé du DLC est regroupé dans la [bible Covenant V0.14](../covenant/BIBLE_COVENANT_V014.md) et son [inventaire structuré](../covenant/BIBLE_COVENANT_V014.json) : personnages et variantes, lieux, armes, accessoires, véhicules, vaisseaux, terrains et planète. Chaque entrée distingue la source retrouvée, la présence dans le moteur, l’image disponible, son admission et les manques encore ouverts. Ces adaptations du film gardent leur provenance propre, distincte des campagnes originales décrites ci-dessus.\n\nLa consolidation parallèle de PR68 reste consultable dans son [index des DLC épinglé](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/16686e8681cc0370db3fa3df2967704ef1862155/docs/narrative/DLC_INDEX_20261126.md) et sa [fiche Covenant historique](https://github.com/darknigthmare/aliens-tantalus-frontier/blob/16686e8681cc0370db3fa3df2967704ef1862155/docs/narrative/dlc/alien-covenant.md). Ses comptes datés conservent leur version ; l’annexe V0.14 les rapproche des sources effectivement récupérées et du suivi courant, sans modifier cette branche. La production d’une image et les résultats techniques ne certifient pas la fidélité 1:1.\n\n\n## Covenant — continuation V0.15 : sprites récupérés et bible détaillée\n\nMise à jour du 26 novembre 2026. Cette annexe poursuit l’inventaire Covenant V0.14 et conserve ses données historiques.\n\nLa continuation ajoute **22 PNG originaux** : huit phases de marche de Ricks, huit d’Oram et six équipements (consoles du Covenant et du Lander, leurs deux sièges, table centrale du pont et table médicale avec colonne). Les originaux ont été récupérés et leurs empreintes vérifiées après l’incident de l’environnement. Le total atteint **125 PNG dans les sources**, dont **72 utilisés par le runtime V0.14** et **53 hors runtime**.\n\nLe jeu conserve **cinq cycles et 40 phases intégrées**. Les deux nouvelles séries, soit seize phases, sont au catalogue documentaire ; elles n’ajoutent pas de cycle au rendu. Leurs planches finales ont été revues, mais les pivots, la cadence et l’animation continue restent à valider. Les nouveaux équipements conservent leurs limites de rapprochement avec les objets natifs.\n\nLa bible V015 reprend les **315 références** et détaille les personnages, lieux, armes, props, véhicules, vaisseaux, terrains et planètes. Les 23 profils, 126 familles de props / 630 occurrences, 57 fiches spatiales, 67 liaisons, 134 seuils, sept familles d’armes, 16 familles de terrains et trois fiches planétaires sont conservés. Les mises à jour datées distinguent l’apparence sourcée, les PNG présents, les manques, les états attendus et les prochaines actions.\n\nDocuments de référence :\n\n- [Bible Covenant V015 — fiches détaillées](../covenant/BIBLE_COVENANT_V015.md).\n- [Bible Covenant V015 — vue HTML](../covenant/BIBLE_COVENANT_V015.html).\n- [Bible Covenant V015 — données JSON](../covenant/BIBLE_COVENANT_V015.json).\n- [État des sprites et manques V015](../covenant/SPRITES_V015_STATUS.md).\n- [Provenance et portée de vérification V015](../covenant/PROVENANCE_V015.json).\n- [Manifeste des 22 nouveaux PNG](../../assets/openai/sprites/alien-covenant-v015/manifest.json).\n\nLes 15 profils mobiles de PNJ sans marche intégrée restent ouverts ; 13 ne disposent pas encore de série PNG de marche publiée. Les quatre courses joueurs, les sept familles d’armes et les autres besoins demeurent suivis. Aucun PNG de ce lot n’attend encore sa récupération. Le checkpoint Oram non téléversé au moment de l’interruption est conservé comme historique résolu, sans modifier le statut courant des huit originaux publiés.\n\nLes formats V015 livrés sont Markdown, HTML et JSON. Le dernier classeur XLSX finalisé reste V014 ; aucun XLSX ni pack ZIP V015 n’est inclus. Les bibles V014 et les PNG antérieurs restent inchangés. Les références de film, les concepts de production, les adaptations pour le jeu et l’admission dans le rendu gardent des statuts distincts. **La fidélité filmique 1:1 n’est pas certifiée.**\n\n";
function withoutTargetReceiptDeclarations(source) {
  assert.equal(sha(targetReceiptDeclarations), 'ed53c2e5ec231fcff4e951252e7fcbee5be99c73884420cc61bcdb61397c327c');
  assert.equal(source.split(targetReceiptDeclarations).length, 2,
    'Missing or repeated target receipt declaration block');
  return source.replace(targetReceiptDeclarations, '');
}
function undoExactSourceEdits(path, source, edits) {
  for (const [current, previous] of edits || []) {
    assert.notEqual(current, '', path);
    assert.equal(source.split(current).length, 2, 'Missing or repeated merge source edit: ' + path);
    source = source.replace(current, () => previous);
  }
  return source;
}
function withoutTargetHostEdits(path, source) {
  if (!Object.hasOwn(targetSourceEdits, path)) return source;
  const receipt = covenantBibleMergeSources[path];
  assert.equal(sha(source), receipt.currentSha256, 'Unreviewed merged source: ' + path);
  const covenant = undoExactSourceEdits(path, source, targetSourceEdits[path]);
  assert.equal(sha(covenant), receipt.covenantSha256, 'Target removal must recover the exact Covenant parent: ' + path);
  return covenant;
}

test('DLC bible documents advance only the exact public path verifier from the V116 baseline', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  assert.equal(bibleDocumentsBaseline, 'b0df1877a058f0818f96437fdfdea3f21ba7f415');
  assert.deepEqual(Object.keys(bibleDocumentsSuccessors), [path]);
  assert.equal(sha(JSON.stringify(bibleDocumentsSuccessors)), '880cbccbca1045dca2e6603597bb6706f704811a30053ec5b2cb18ef392572f2');
  assert.ok(Object.isFrozen(bibleDocumentsSuccessors));
  const receipt = bibleDocumentsSuccessors[path];
  assert.ok(Object.isFrozen(receipt));
  assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
  assert.equal(receipt.previousSha256, spriteSuccessors[path].currentSha256);
  assert.equal(sha(read(path)), finalEndpoint(path));
  assert.equal(advanceBibleDocuments(path, receipt.previousSha256), finalEndpoint(path));
  for (const value of [receipt.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceBibleDocuments(path, value), /Broken V116-to-DLC-bible-documents source chain/);
  for (const value of [receipt.previousSha256, receipt.currentSha256])
    assert.deepEqual(runtimeView({ [path]: value }), { [path]: finalEndpoint(path) });
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceBibleDocuments(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(bibleDocumentsSuccessors, audit), false);
});


test('DLC bible admission is limited to the exact documents and excludes them from built distributions', () => {
  const files = [
    "docs/narrative/DLC_DISCUSSIONS_20261126.json",
    "docs/narrative/DLC_INDEX_20261126.md",
    "docs/narrative/dlc/40th-anniversary.md",
    "docs/narrative/dlc/RECUPERATION_20261126.json",
    "docs/narrative/dlc/RECUPERATION_20261126.md",
    "docs/narrative/dlc/alien-1979-nostromo.md",
    "docs/narrative/dlc/alien-blackout.md",
    "docs/narrative/dlc/alien-covenant.md",
    "docs/narrative/dlc/alien-earth.md",
    "docs/narrative/dlc/alien-isolation.md",
    "docs/narrative/dlc/alien-resurrection.md",
    "docs/narrative/dlc/alien-romulus.md",
    "docs/narrative/dlc/alien3-fiorina.md",
    "docs/narrative/dlc/alien5-projet-lazare.md",
    "docs/narrative/dlc/aliens-1986.md",
    "docs/narrative/dlc/avp-2004.md",
    "docs/narrative/dlc/avp-requiem.md",
    "docs/narrative/dlc/colonial-marines.md",
    "docs/narrative/dlc/out-of-the-shadows.md",
    "docs/narrative/dlc/prometheus.md",
    "docs/narrative/dlc/river-of-pain.md",
    "docs/narrative/dlc/sea-of-sorrows.md"
  ];
  assert.equal(files.length, 22);
  for (const path of files) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  assert.equal(isPublicDistributionPathV86('docs/narrative/dlc', { directory: true }), true);
  assert.equal(isPublicDistributionPathV86('docs/narrative/dlc', { directory: true, built: true }), false);
  for (const path of ['docs/narrative/dlc/unreviewed.md', 'docs/narrative/dlc/extra.png',
    'docs/narrative/dlc/nested/file.md', 'docs/narrative/dlc/../unreviewed.md',
    'docs/narrative/dlc/RECUPERATION_20261126.JSON']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
});


test('the campaign-to-DLC bible link advances its exact historical document and preserves all published receipts', () => {
  const path = 'docs/narrative/CAMPAGNE_PRINCIPALE.md';
  assert.equal(bibleBridgeBaseline, '16686e8681cc0370db3fa3df2967704ef1862155');
  assert.deepEqual(Object.keys(bibleBridgeSuccessors), [path]);
  assert.equal(sha(JSON.stringify(bibleBridgeSuccessors)), '9144fec80c7f058a58d9c027af8addcb61e4bb5f5abd8503d9ef4967d2b70edc');
  assert.ok(Object.isFrozen(bibleBridgeSuccessors) && Object.isFrozen(bibleBridgeSuccessors[path]));
  const receipt = bibleBridgeSuccessors[path];
  assert.equal(receipt.previousSha256, xenoJoin.successors[path].currentSha256);
  const document = read(path).toString();
  const addition = "## DLC issus des œuvres — reprise du 26 novembre 2026\n\nLa [bible et l'index des DLC](DLC_INDEX_20261126.md) regroupent les 18 familles retrouvées, les décisions des discussions disponibles, leurs versions, PR et manques documentés. La provenance originale annoncée ci-dessus concerne les campagnes Cocyte et leurs annexes ; les adaptations des œuvres et la branche originale Projet Lazare gardent leurs sources et leurs limites dans cet index. La fidélité 1:1 reste une cible suivie élément par élément.\n\n";
  assert.equal(document.split(addition).length, 2, 'Exactly one index bridge is added');
  const withoutBridge = document.replace(addition, '');
  assert.equal(sha(withoutBridge), covenantBibleMergeSources[path].covenantSha256,
    'Removing the exact target bridge recovers the published Covenant parent');
  assert.equal(document.split(covenantCampaignAppendices).length, 2,
    'Exactly one unchanged Covenant appendix suffix is present');
  assert.ok(document.endsWith(covenantCampaignAppendices));
  assert.equal(sha(document.slice(0, -covenantCampaignAppendices.length)), receipt.currentSha256,
    'Removing the exact Covenant appendices recovers the published target document');
  assert.equal(sha(withoutBridge.slice(0, -covenantCampaignAppendices.length)), receipt.previousSha256,
    'Removing both reviewed contributions recovers the exact common campaign bible');
  assert.equal(sha(document), finalEndpoint(path));
  assert.equal(advanceBibleBridge(path, receipt.previousSha256), finalEndpoint(path));
  assert.equal(reviewedXenoTrialsTantalusJoinV206(path, xenoJoin.successors[path].previousSha256), finalEndpoint(path));
  for (const value of [receipt.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceBibleBridge(path, value), /Broken DLC-bible-document-bridge source chain/);
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceBibleBridge(path, 'unchanged'), 'unchanged');
  const terminal = read(audit).toString();
  assert.equal(sha(terminal.slice(0, terminal.indexOf('// BEGIN DLC BIBLE BRIDGE HOST RECEIPTS 20261126'))),
    '6dec230cc7c3e1da4d06fc7e72bcb2af42359732218d711402d1b35ed42ee159', 'All preceding AVP, Aliens, Fiorina and DLC document receipts are preserved');
  assert.equal(Object.hasOwn(bibleBridgeSuccessors, audit), false);
});

test('the complete Tantalus join accepts the reviewed campaign link and rejects one changed document byte', () => {
  assert.ok(verifyXenoTrialsTantalusJoinV206().successors > 0);
  const path = 'docs/narrative/CAMPAGNE_PRINCIPALE.md';
  const altered = candidate => candidate === path ? Buffer.concat([read(candidate), Buffer.from('\n')]) : read(candidate);
  assert.throws(() => verifyXenoTrialsTantalusJoinV206(altered), /Unreviewed tantalus-join source bytes: docs\/narrative\/CAMPAGNE_PRINCIPALE\.md/);
});


// Source documents and individual PNG candidates; none are admitted to gameplay.
const avpProductionDocumentDirectory = 'docs/narrative/dlc/avp-2004-production-20261126';
const avpProductionAssetDirectory = 'assets/openai/sprites/avp2004-production-v001';
const avpProductionDocumentPaths = [
  "docs/narrative/dlc/avp-2004-production-20261126/README.md",
  "docs/narrative/dlc/avp-2004-production-20261126/SOURCES.md",
  "docs/narrative/dlc/avp-2004-production-20261126/INVENTORY.md",
  "docs/narrative/dlc/avp-2004-production-20261126/runtime-inventory.json",
  "docs/narrative/dlc/avp-2004-production-20261126/PRODUCTION_SPECIFICATIONS.md",
  "docs/narrative/dlc/avp-2004-production-20261126/production-specs.json",
  "docs/narrative/dlc/avp-2004-production-20261126/GALLERY.md",
  "docs/narrative/dlc/avp-2004-production-20261126/manifest.json",
  "docs/narrative/dlc/avp-2004-production-20261126/canon-research.json"
];
const avpProductionPngPaths = [
  "assets/openai/sprites/avp2004-production-v001/chestburster-human-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/piper-maru-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/earth-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/glacier-face-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/snowcat-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/whalebone-arch-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/whaling-station-facade-avp2004-v001.png",
  "assets/openai/sprites/avp2004-production-v001/weyland-satellite-avp2004-v001.png"
];

test('AVP production advances only its two exact source admission hosts after the corrected bible head', () => {
  assert.equal(productionBibleBaseline, '268b1a517c60338899578a165e9784c5b7313dba');
  assert.deepEqual(Object.keys(productionBibleSuccessors), ['scripts/verify-public-release-v86.mjs', 'scripts/build-asset-filter.mjs']);
  assert.equal(sha(JSON.stringify(productionBibleSuccessors)), '06bf85ba4eff298ce3a1f19fc7e706e7f636760a9ea3343cffce72eb43d6a973');
  assert.ok(Object.isFrozen(productionBibleSuccessors));
  for (const [path, receipt] of Object.entries(productionBibleSuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    const prior = bibleDocumentsSuccessors[path] || spriteSuccessors[path];
    assert.equal(receipt.previousSha256, prior.currentSha256, path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceProductionBible(path, receipt.previousSha256), finalEndpoint(path), path);
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    for (const value of [receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceProductionBible(path, value), /Broken DLC-bible-to-AVP-production source chain/);
    for (const value of [receipt.previousSha256, receipt.currentSha256])
      assert.deepEqual(runtimeView({ [path]: value }), { [path]: finalEndpoint(path) });
  }
  const terminal = read(audit).toString();
  assert.equal(sha(terminal.slice(0, terminal.indexOf('// BEGIN AVP PRODUCTION BIBLE HOST RECEIPTS 20261126'))),
    '35a14e4f36ab0f8ab0bc119f248d66ecf965e4be24af7d2c77382d9948d8160d', 'All published receipt declarations, including the campaign bridge, remain exact');
  assert.equal(Object.hasOwn(productionBibleSuccessors, audit), false);
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceProductionBible(path, 'unchanged'), 'unchanged');
});

test('AVP production documents and PNG candidates have closed source admission and are excluded from the build', () => {
  const projectRoot = fileURLToPath(new URL('../', import.meta.url));
  const filter = createBuildAssetFilter(projectRoot);
  for (const directory of [avpProductionDocumentDirectory, avpProductionAssetDirectory]) {
    assert.equal(isPublicDistributionPathV86(directory, { directory: true }), true, directory);
    assert.equal(isPublicDistributionPathV86(directory, { directory: true, built: true }), false, directory);
    assert.equal(isPublicDistributionPathV86(directory), false, directory);
    assert.ok(EXCLUDED_BUILD_ASSET_PATHS.includes(directory));
    assert.equal(filter(join(projectRoot, directory)), false, directory);
    for (const suffix of ['unreviewed.md', 'extra.png', 'nested/file.png', '../unreviewed.md', 'MANIFEST.JSON']) {
      const path = directory + '/' + suffix;
      assert.equal(isPublicDistributionPathV86(path), false, path);
      assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
      assert.equal(filter(join(projectRoot, directory, 'nested/unreviewed.png')), false);
    }
  }
  for (const path of [...avpProductionDocumentPaths, ...avpProductionPngPaths]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(filter(join(projectRoot, path)), false, path);
    assert.ok(lstatSync(join(projectRoot, path)).isFile(), path);
    assert.equal(lstatSync(join(projectRoot, path)).isSymbolicLink(), false, path);
  }
  assert.deepEqual(readdirSync(join(projectRoot, avpProductionAssetDirectory)).sort(),
    avpProductionPngPaths.map(path => path.slice(avpProductionAssetDirectory.length + 1)).sort());
  for (const path of avpProductionDocumentPaths.filter(path => path.endsWith('.json')))
    assert.doesNotThrow(() => JSON.parse(read(path).toString()), path);
});

test('the AVP production manifest pins each original PNG and keeps generated, integrated and exact states separate', () => {
  const manifest = JSON.parse(read(avpProductionDocumentDirectory + '/manifest.json').toString());
  assert.ok(Array.isArray(manifest.files) && Array.isArray(manifest.references) && Array.isArray(manifest.generationAttempts));
  assert.deepEqual(manifest.files.map(entry => entry.path).sort(), [...avpProductionPngPaths].sort());
  assert.equal(new Set(manifest.files.map(entry => entry.path)).size, manifest.files.length);
  const references = new Set(manifest.references.map(entry => entry.id));
  assert.equal(references.size, manifest.references.length);
  for (const reference of manifest.references) {
    assert.ok(typeof reference.id === 'string' && reference.id.length > 0);
    assert.match(reference.url, /^https:\/\//);
    assert.ok(typeof reference.kind === 'string' && reference.kind.length > 0);
  }
  for (const entry of manifest.files) {
    const bytes = read(entry.path);
    assert.equal(bytes.length, entry.bytes, entry.path);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.equal(sha(bytes), entry.sha256, entry.path);
    if (entry.gitBlobSha !== undefined) {
      assert.match(entry.gitBlobSha, /^[a-f0-9]{40}$/);
      assert.equal(createHash('sha1').update('blob ' + bytes.length).update(Buffer.from([0])).update(bytes).digest('hex'), entry.gitBlobSha, entry.path);
    }
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], entry.path);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', entry.path);
    assert.equal(bytes.readUInt32BE(16), entry.width, entry.path);
    assert.equal(bytes.readUInt32BE(20), entry.height, entry.path);
    assert.ok(entry.width > 0 && entry.height > 0);
    assert.equal(entry.generated, true);
    assert.equal(entry.status, 'candidate');
    assert.equal(entry.runtimeIntegrated, false);
    assert.equal(entry.exact, false);
    assert.ok(typeof entry.promptKey === 'string' && entry.promptKey.length > 0);
    assert.ok(Array.isArray(entry.sourceRefs) && entry.sourceRefs.length > 0);
    for (const reference of entry.sourceRefs) assert.ok(references.has(reference), entry.path + ': ' + reference);
    assert.ok(entry.review && (typeof entry.review === 'string' ? entry.review.length > 0 : Object.keys(entry.review).length > 0));
  }
});

test('the Covenant and DLC bible merge joins only three exact sources from both published parents', () => {
  assert.deepEqual(covenantBibleMergeBaselines, {
    commonCommit: 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
    covenantCommit: '9ee21033a71fc0f965ef270fa560d13eaa89d813',
    targetCommit: '2e8309081d206b86d9f234ebfc33c13ea74970f4'
  });
  assert.deepEqual(Object.keys(covenantBibleMergeSources).sort(), [
    'docs/narrative/CAMPAGNE_PRINCIPALE.md',
    'scripts/build-asset-filter.mjs', 'scripts/verify-public-release-v86.mjs'
  ]);
  assert.equal(sha(JSON.stringify(covenantBibleMergeSources)), '74761c461a5855d46dc8b0189cb29f13acbdeb3be722051c76966e6a365f252a');
  assert.ok(Object.isFrozen(covenantBibleMergeBaselines) && Object.isFrozen(covenantBibleMergeSources));
  for (const [path, receipt] of Object.entries(covenantBibleMergeSources)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(),
      ['commonSha256', 'covenantSha256', 'currentSha256', 'targetSha256']);
    assert.equal(sha(read(path)), receipt.currentSha256, path);
    for (const endpoint of [receipt.covenantSha256, receipt.targetSha256])
      assert.equal(advanceCovenantBibleMerge(path, endpoint), receipt.currentSha256, path);
    for (const endpoint of [receipt.commonSha256, receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceCovenantBibleMerge(path, endpoint),
        /Broken Covenant-and-DLC-bibles merge source chain/, path);
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceCovenantBibleMerge(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(covenantBibleMergeSources, audit), false);
});

test('inverse merge edits recover both exact admission parents and the common guard bytes', () => {
  assert.deepEqual(Object.keys(targetSourceEdits).sort(),
    ['scripts/build-asset-filter.mjs', 'scripts/verify-public-release-v86.mjs']);
  for (const path of Object.keys(targetSourceEdits)) {
    const source = read(path).toString(), receipt = covenantBibleMergeSources[path];
    const covenant = withoutTargetHostEdits(path, source);
    const target = undoExactSourceEdits(path,
      withoutCovenantV012HostEdits(path, source), covenantSourceEdits[path]);
    const common = undoExactSourceEdits(path,
      withoutCovenantV012HostEdits(path, covenant), covenantSourceEdits[path]);
    assert.equal(sha(covenant), receipt.covenantSha256, path);
    assert.equal(sha(target), receipt.targetSha256, path);
    assert.equal(sha(common), receipt.commonSha256, path);
    if (path === 'scripts/verify-public-release-v86.mjs') {
      const privateRules = text => text.match(/const PRIVATE_TEXT = \[[\s\S]*?\n\];/)[0];
      assert.equal(privateRules(source), privateRules(covenant));
      assert.equal(privateRules(source), privateRules(target));
      assert.equal(privateRules(source), privateRules(common));
    }
  }
});

test('runtime source views converge from either published merge parent and accept no unknown digest', () => {
  const expected = {}, covenant = {}, target = {};
  for (const [path, receipt] of Object.entries(covenantBibleMergeSources)) {
    expected[path] = receipt.currentSha256;
    covenant[path] = receipt.covenantSha256;
    target[path] = receipt.targetSha256;
    assert.throws(() => runtimeView({ [path]: 'f'.repeat(64) }),
      /Incorrect AVP host runtime view predecessor/, path);
  }
  assert.deepEqual(runtimeView(covenant), expected);
  assert.deepEqual(runtimeView(target), expected);
  assert.deepEqual(runtimeView(expected), expected);
  assert.ok(Object.isFrozen(runtimeView(covenant)));
});
