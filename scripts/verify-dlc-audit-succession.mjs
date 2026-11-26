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
  AVP_ISOLATION_PRODUCTION_JOIN_BASELINES_20261126 as productionJoinBaselines,
  AVP_ISOLATION_PRODUCTION_JOIN_SUCCESSORS_20261126 as productionJoinSuccessors,
  AVP_ISOLATION_PRODUCTION_INCOMING_SUCCESSORS_20261126 as productionIncoming,
  reviewedIsolationProductionJoinHostDigest20261126 as advanceProductionJoin,
  reviewedIsolationProductionIncomingHostDigest20261126 as advanceProductionIncoming,
  AVP_ISOLATION_BASELINE_20261126 as isolationBaseline,
  AVP_ISOLATION_SUCCESSORS_20261126 as isolationSuccessors,
  AVP_ISOLATION_BIBLE_JOIN_BASELINES_20261126 as isolationBibleBaselines,
  AVP_ISOLATION_BIBLE_JOIN_SUCCESSORS_20261126 as isolationBibleSuccessors,
  AVP_ISOLATION_BIBLE_INCOMING_SUCCESSORS_20261126 as isolationBibleIncoming,
  reviewedIsolationHostDigest20261126 as advanceIsolation,
  reviewedIsolationAfterBibleHostDigest20261126 as advanceIsolationAfterBible,
  reviewedIsolationIncomingHostDigest20261126 as advanceIsolationIncoming,
  reviewedFiorinaV116HostDigest20261125 as advanceV116,
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
const expectedIsolationPredecessors = Object.freeze({
  "package.json": "f1255982d1e7527ee751e54bc84da66cc34c3633e43a17f9cde5b99ad64eda76",
  "scripts/build.mjs": "83cf0a94b7001c2f4e3408ecf4432095564ac95d1321d4dbaf9e0cbd898f178b",
  "scripts/verify-public-release-v86.mjs": "6c42dac3d674ebbfb07a3bb5953faa76d5d246f10b889b793d9d916031efcf3f",
  "src/dlc-menu.js": "918ca5d666aed072a2055d22ac30a3c4d0359a36468d921e59b9a07abd5de789",
  "scripts/verify-dlc-menu.mjs": "94f1c58253b10c10374219720e55afaeecadacd70ac56355f339ae28d00bd237"
});
const expectedIsolationPaths = Object.keys(expectedIsolationPredecessors);
const verifiedPaths = [...new Set([...expectedPaths, ...expectedJoinPaths, ...expectedQualityPaths, ...Object.keys(aliensMerge), ...expectedSpritePaths, ...expectedSpriteV116Paths, ...Object.keys(bibleBridgeSuccessors), ...expectedIsolationPaths])];
const firstEndpoint = path => (successors[path] || joinSuccessors[path] || qualitySuccessors[path] || aliensMerge[path] || spriteSuccessors[path] || bibleBridgeSuccessors[path] || isolationSuccessors[path]).previousSha256;
const mergedEndpoint = path => (aliensMerge[path] || qualitySuccessors[path] || joinSuccessors[path] || successors[path])?.currentSha256;
const finalEndpoint = path => productionJoinSuccessors[path]?.currentSha256 || productionBibleSuccessors[path]?.currentSha256 || isolationBibleSuccessors[path]?.currentSha256 || isolationSuccessors[path]?.currentSha256 || bibleBridgeSuccessors[path]?.currentSha256 || bibleDocumentsSuccessors[path]?.currentSha256 || spriteV116Successors[path]?.currentSha256 || spriteSuccessors[path]?.currentSha256 || mergedEndpoint(path);
const brokenChain = /Broken (?:merged-Tantalus-to-AVP host|AVP-to-Fiorina host|joined-host-to-Fiorina-QA|published-AVP-to-Aliens-merge|published-merge-to-Fiorina-sprites|Fiorina-V115-to-V116|V116-to-DLC-bible-documents|DLC-bible-document-bridge|cumulative-to-Isolation|DLC-bible-to-Isolation-join|published-Isolation-to-bible-join|DLC-bible-to-AVP-production|Isolation-bible-to-production-join|AVP-production-to-Isolation-join) source chain/;

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
    isolationSuccessors: expectedIsolationPaths.length,
    isolationBibleJoinSuccessors: Object.keys(isolationBibleSuccessors).length,
    isolationBibleIncomingSuccessors: Object.keys(isolationBibleIncoming).length,
    productionBibleSuccessors: Object.keys(productionBibleSuccessors).length,
    isolationProductionJoinSuccessors: Object.keys(productionJoinSuccessors).length,
    isolationProductionIncomingSuccessors: Object.keys(productionIncoming).length,
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
  assert.equal(Object.hasOwn(isolationSuccessors, audit), false);
  assert.equal(Object.hasOwn(isolationBibleSuccessors, audit), false);
  assert.equal(Object.hasOwn(isolationBibleIncoming, audit), false);
  assert.equal(Object.hasOwn(productionBibleSuccessors, audit), false);
  assert.equal(Object.hasOwn(productionJoinSuccessors, audit), false);
  assert.equal(Object.hasOwn(productionIncoming, audit), false);
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
  assert.equal(sha(document.replace(addition, '')), receipt.previousSha256,
    'The original campaign bible remains byte-identical after removing its explicit DLC index link');
  assert.equal(sha(document), receipt.currentSha256);
  assert.equal(advanceBibleBridge(path, receipt.previousSha256), receipt.currentSha256);
  assert.equal(reviewedXenoTrialsTantalusJoinV206(path, xenoJoin.successors[path].previousSha256), receipt.currentSha256);
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


test('Isolation advances exactly the reviewed hosts from the cumulative baseline', () => {
  assert.equal(isolationBaseline, 'b0df1877a058f0818f96437fdfdea3f21ba7f415');
  assert.deepEqual(Object.keys(isolationSuccessors).sort(), [...expectedIsolationPaths].sort());
  assert.equal(sha(JSON.stringify(isolationSuccessors)), 'a200ab0d99f1210f83577d5a5adb0a138343af325c06bbf5972caa3920545825');
  assert.ok(Object.isFrozen(isolationSuccessors));
  for (const [path, receipt] of Object.entries(isolationSuccessors)) {
    assert.ok(Object.isFrozen(receipt), path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256'], path);
    assert.equal(receipt.previousSha256, expectedIsolationPredecessors[path], path);
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, path);
    const prior = spriteV116Successors[path] || spriteSuccessors[path] || aliensMerge[path]
      || qualitySuccessors[path] || joinSuccessors[path] || successors[path];
    if (prior) assert.equal(receipt.previousSha256, prior.currentSha256, path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceIsolation(path, receipt.previousSha256), finalEndpoint(path), path);
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: finalEndpoint(path) });
    assert.deepEqual(runtimeView({ [path]: receipt.currentSha256 }), { [path]: finalEndpoint(path) });
  }
});

test('Isolation rejects unknown, repeated and skipped predecessors without broadening unrelated paths', () => {
  for (const [path, receipt] of Object.entries(isolationSuccessors)) {
    const rejected = [receipt.currentSha256, '0'.repeat(64), undefined];
    if (firstEndpoint(path) !== receipt.previousSha256) rejected.push(firstEndpoint(path));
    for (const value of new Set(rejected))
      assert.throws(() => advanceIsolation(path, value), /Broken cumulative-to-Isolation source chain/, path);
    assert.throws(() => runtimeView({ [path]: '0'.repeat(64) }), /Incorrect AVP host runtime view predecessor/, path);
  }
  for (const path of ['src/unreviewed.js', 'src/dlc-menu.js/extra', 'modules/alien-isolation/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceIsolation(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(isolationSuccessors, audit), false);
});

test('Isolation preserves the complete published AVP, Aliens and Fiorina receipt prefix', () => {
  const source = read(audit).toString();
  const marker = '// END FIORINA V116 HOST RECEIPTS';
  const end = source.indexOf(marker);
  assert.ok(end > 0 && source.indexOf(marker, end + marker.length) === -1);
  assert.equal(sha(source.slice(0, end + marker.length)), '6facdfa11619639d6490a9adf8b48ddb188c6f7d93530d07f2052a16ca7903a4');
});


test('the Isolation and bible parents converge through one exact public-verifier join', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  assert.deepEqual(isolationBibleBaselines, {
    bibleCommit: 'c7a0339f86e1de0c2209800a81506cddbc71d804',
    isolationCommit: 'a6697cdef91f366c849dbefa4996fa8e7dc24406',
    commonCommit: 'b0df1877a058f0818f96437fdfdea3f21ba7f415'
  });
  assert.deepEqual(Object.keys(isolationBibleSuccessors), [path]);
  assert.deepEqual(Object.keys(isolationBibleIncoming), [path]);
  assert.equal(sha(JSON.stringify(isolationBibleSuccessors)), '369a39a8aceda3324d6c713dab98a489e780cfedf5eddcb4889e3ab2a4650912');
  assert.equal(sha(JSON.stringify(isolationBibleIncoming)), '1e2046db1973a076156ccd12549fee34c7bfaa54a05a24e4afbe0d38baa4447d');
  const joined = isolationBibleSuccessors[path], incoming = isolationBibleIncoming[path];
  assert.ok(Object.isFrozen(isolationBibleBaselines) && Object.isFrozen(isolationBibleSuccessors)
    && Object.isFrozen(isolationBibleIncoming) && Object.isFrozen(joined) && Object.isFrozen(incoming));
  assert.equal(joined.previousSha256, bibleDocumentsSuccessors[path].currentSha256);
  assert.equal(incoming.previousSha256, isolationSuccessors[path].currentSha256);
  assert.equal(joined.currentSha256, '16e8bf01e569c4540391dc269604404505248406fd1240917d6e75c165454ccd');
  assert.equal(incoming.currentSha256, joined.currentSha256);
  assert.equal(sha(read(path)), finalEndpoint(path));
  assert.equal(advanceIsolationAfterBible(path, joined.previousSha256), finalEndpoint(path));
  assert.equal(advanceIsolationIncoming(path, incoming.previousSha256), finalEndpoint(path));
  assert.equal(advanceIsolation(path, isolationSuccessors[path].previousSha256), finalEndpoint(path));
  assert.equal(advanceBibleDocuments(path, bibleDocumentsSuccessors[path].previousSha256), finalEndpoint(path));
  for (const endpoint of [joined.previousSha256, incoming.previousSha256, joined.currentSha256])
    assert.deepEqual(runtimeView({ [path]: endpoint }), { [path]: finalEndpoint(path) });
});

test('the Isolation bible join refuses skipped, repeated and interchanged parent endpoints', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  const joined = isolationBibleSuccessors[path], incoming = isolationBibleIncoming[path];
  for (const endpoint of [isolationSuccessors[path].previousSha256, incoming.previousSha256,
    joined.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceIsolationAfterBible(path, endpoint), /Broken DLC-bible-to-Isolation-join source chain/);
  for (const endpoint of [isolationSuccessors[path].previousSha256, joined.previousSha256,
    joined.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceIsolationIncoming(path, endpoint), /Broken published-Isolation-to-bible-join source chain/);
  for (const unknown of ['src/unreviewed.js', 'scripts/verify-public-release-v86.mjs/extra',
    '__proto__', 'constructor', audit]) {
    assert.equal(advanceIsolationAfterBible(unknown, 'untouched'), 'untouched');
    assert.equal(advanceIsolationIncoming(unknown, 'untouched'), 'untouched');
  }
});

test('the join keeps both published bible blocks and all original Isolation receipts byte-identical', () => {
  const source = read(audit).toString();
  const bibleMarker = '// END DLC BIBLE BRIDGE HOST RECEIPTS 20261126';
  const end = source.indexOf(bibleMarker);
  assert.ok(end > 0 && source.indexOf(bibleMarker, end + bibleMarker.length) === -1);
  assert.equal(sha(source.slice(0, end + bibleMarker.length)), '1001dfb91817bf35bc6b31ed57b69ecfe18d8534c0b382a4c380a81cce93a38d');
  const begin = '// BEGIN ISOLATION HOST RECEIPTS 20261126';
  const finish = '// END ISOLATION HOST RECEIPTS 20261126';
  const start = source.indexOf(begin), stop = source.indexOf(finish, start);
  assert.ok(start > end && stop > start);
  assert.equal(sha(source.slice(start, stop + finish.length) + '\n'), 'c86f1a1b265715a1e28717dba67efa4badc96356d9723b8e64de5be2bad6cec1');
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


test('the published Isolation and AVP production parents converge through one exact new verifier receipt', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  assert.deepEqual(productionJoinBaselines, {
    isolationCommit: '9b874e64a2b79def1150e94da30969bbe1cd4480',
    productionCommit: '2e8309081d206b86d9f234ebfc33c13ea74970f4',
    commonCommit: 'c7a0339f86e1de0c2209800a81506cddbc71d804'
  });
  assert.deepEqual(Object.keys(productionJoinSuccessors), [path]);
  assert.deepEqual(Object.keys(productionIncoming), [path]);
  assert.equal(sha(JSON.stringify(productionJoinSuccessors)), 'a2c80897ee69bcedadf1a6fe15461b85109e84cd2f08689ef04b01df2bb6f2fa');
  assert.equal(sha(JSON.stringify(productionIncoming)), 'c87ce0e4fdfd3ccb779470f027ebb4cb4cc1fde60934f35ba4af46743acb6ff3');
  const joined = productionJoinSuccessors[path], incoming = productionIncoming[path];
  assert.ok(Object.isFrozen(productionJoinBaselines) && Object.isFrozen(productionJoinSuccessors)
    && Object.isFrozen(productionIncoming) && Object.isFrozen(joined) && Object.isFrozen(incoming));
  assert.equal(joined.previousSha256, isolationBibleSuccessors[path].currentSha256);
  assert.equal(incoming.previousSha256, productionBibleSuccessors[path].currentSha256);
  assert.equal(joined.currentSha256, incoming.currentSha256);
  assert.equal(sha(read(path)), joined.currentSha256);
  assert.equal(advanceProductionJoin(path, joined.previousSha256), joined.currentSha256);
  assert.equal(advanceProductionIncoming(path, incoming.previousSha256), joined.currentSha256);
  assert.equal(advanceProductionBible(path, productionBibleSuccessors[path].previousSha256), joined.currentSha256);
  assert.equal(advanceIsolationAfterBible(path, isolationBibleSuccessors[path].previousSha256), joined.currentSha256);
  for (const endpoint of [joined.previousSha256, incoming.previousSha256, joined.currentSha256,
    isolationBibleIncoming[path].previousSha256])
    assert.deepEqual(runtimeView({ [path]: endpoint }), { [path]: joined.currentSha256 });
});

test('the new production join rejects swapped, skipped and repeated parent endpoints', () => {
  const path = 'scripts/verify-public-release-v86.mjs';
  const joined = productionJoinSuccessors[path], incoming = productionIncoming[path];
  for (const endpoint of [incoming.previousSha256, isolationBibleSuccessors[path].previousSha256,
    isolationBibleIncoming[path].previousSha256, joined.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceProductionJoin(path, endpoint), /Broken Isolation-bible-to-production-join source chain/);
  for (const endpoint of [joined.previousSha256, productionBibleSuccessors[path].previousSha256,
    isolationBibleIncoming[path].previousSha256, incoming.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceProductionIncoming(path, endpoint), /Broken AVP-production-to-Isolation-join source chain/);
  for (const unknown of ['src/unreviewed.js', 'scripts/verify-public-release-v86.mjs/extra',
    '__proto__', 'constructor', audit]) {
    assert.equal(advanceProductionJoin(unknown, 'untouched'), 'untouched');
    assert.equal(advanceProductionIncoming(unknown, 'untouched'), 'untouched');
  }
  assert.equal(Object.hasOwn(productionJoinSuccessors, audit), false);
  assert.equal(Object.hasOwn(productionIncoming, audit), false);
});

test('the production join preserves the exact published AVP production and Isolation bible join blocks', () => {
  const source = read(audit).toString();
  for (const [begin, end, expected] of [
    ['// BEGIN AVP PRODUCTION BIBLE HOST RECEIPTS 20261126', '// END AVP PRODUCTION BIBLE HOST RECEIPTS 20261126',
      'a4e3785e9afe9551d23a66526e3423f7d4410a32e912530e122bd7bd2ffcda04'],
    ['// BEGIN ISOLATION BIBLE JOIN HOST RECEIPTS 20261126', '// END ISOLATION BIBLE JOIN HOST RECEIPTS 20261126',
      'fe517d670141888ec1a278a0592872edac379fc7c7270c98dd820f0eb4a39571']
  ]) {
    const start = source.indexOf(begin), stop = source.indexOf(end, start);
    assert.ok(start >= 0 && stop > start);
    assert.equal(source.indexOf(begin, start + begin.length), -1);
    assert.equal(sha(source.slice(start, stop + end.length)), expected);
  }
});
