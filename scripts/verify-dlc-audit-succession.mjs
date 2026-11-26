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
  AVP_MER_JOIN_BASELINES_20261126 as merBaselines,
  AVP_MER_JOIN_SUCCESSORS_20261126 as merSuccessors,
  reviewedMerJoinHostDigest20261126 as advanceMer,
  AVP_MER_VISUAL_BASELINE_20261126 as merVisualBaseline,
  AVP_MER_VISUAL_SUCCESSORS_20261126 as merVisualSuccessors,
  reviewedMerVisualHostDigest20261126 as advanceMerVisual,
  AVP_MER_HOST_COMPLETION_BASELINES_20261126 as merHostCompletionBaselines,
  AVP_MER_HOST_COMPLETION_SUCCESSORS_20261126 as merHostCompletionSuccessors,
  reviewedMerHostCompletionDigest20261126 as advanceMerHostCompletion,
  AVP_MER_EQUIPMENT_BASELINE_20261126 as merEquipmentBaseline,
  AVP_MER_EQUIPMENT_SUCCESSORS_20261126 as merEquipmentSuccessors,
  reviewedMerEquipmentHostDigest20261126 as advanceMerEquipment,
  reviewedFiorinaV116HostDigest20261125 as advanceV116,
  reviewedFiorinaSpriteHostDigest20261125 as advanceSprites,
  reviewedAliensIncomingDigest20261125 as advanceAliens,
  reviewedAvpHostDigest20261125 as advance, avpHostRuntimeSources20261125 as runtimeView,
  verifyAvpHostSources20261125 as verify } from './audit-dlc-avp-2004-20261125.mjs';
import { reviewedAfterNativeQaResourcesV187 } from './audit-native-qa-resources-v187.mjs';
import { XENO_TRIALS_TANTALUS_JOIN_V206 as xenoJoin,
  reviewedXenoTrialsTantalusJoinV206 } from './audit-xeno-production-assets-v206.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';

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
const expectedMerPaths = ['index.html', 'package.json', 'scripts/build-asset-filter.mjs',
  'scripts/build-dev-tools-v188.mjs', 'scripts/build.mjs', 'scripts/verify-public-release-v86.mjs', 'src/title-screen-v61.js'];
const expectedMerHostCompletionPaths = ['.gitattributes', '.vercelignore', 'title-screen-v61.css'];
const verifiedPaths = [...new Set([...expectedPaths, ...expectedJoinPaths, ...expectedQualityPaths, ...Object.keys(aliensMerge), ...expectedSpritePaths, ...expectedSpriteV116Paths, ...expectedMerPaths, ...expectedMerHostCompletionPaths])];
const firstEndpoint = path => (successors[path] || joinSuccessors[path] || qualitySuccessors[path] || aliensMerge[path] || spriteSuccessors[path] || merSuccessors[path] || merHostCompletionSuccessors[path]).previousSha256;
const mergedEndpoint = path => (aliensMerge[path] || qualitySuccessors[path] || joinSuccessors[path] || successors[path])?.currentSha256;
const finalEndpoint = path => merEquipmentSuccessors[path]?.currentSha256 || merHostCompletionSuccessors[path]?.currentSha256 || merVisualSuccessors[path]?.currentSha256 || merSuccessors[path]?.currentSha256 || spriteV116Successors[path]?.currentSha256 || spriteSuccessors[path]?.currentSha256 || mergedEndpoint(path);
const brokenChain = /Broken (?:merged-Tantalus-to-AVP host|AVP-to-Fiorina host|joined-host-to-Fiorina-QA|published-AVP-to-Aliens-merge|published-merge-to-Fiorina-sprites|Fiorina-V115-to-V116|Fiorina-to-Mer-join|Mer-join-to-visual|Mer-visual-to-host-completion|Mer-host-completion-to-equipment) source chain/;

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
    merJoinedSuccessors: expectedMerPaths.length,
    merVisualSuccessors: 3,
    merHostCompletionSuccessors: expectedMerHostCompletionPaths.length,
    merEquipmentSuccessors: 1,
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
  assert.equal(Object.hasOwn(merSuccessors, audit), false);
  assert.equal(Object.hasOwn(merVisualSuccessors, audit), false);
  assert.equal(Object.hasOwn(merHostCompletionSuccessors, audit), false);
  assert.equal(Object.hasOwn(merEquipmentSuccessors, audit), false);
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

test('Mer joins exactly seven cumulative hosts without rewriting any historical receipt', () => {
  assert.deepEqual(merBaselines, {
    cumulativeCommit: 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
    merCommit: '994853bdd9d959980f0f8256cb39b1eadfe29911',
    recoveryCommit: '7efa1b55eb12c3c4b7401940048ffa2e30caf04a',
  });
  assert.deepEqual(Object.keys(merSuccessors).sort(), [...expectedMerPaths].sort());
  assert.equal(sha(JSON.stringify(merSuccessors)), '5b78f12591c2689013551c6d96a844ba50c8d69fb305dff4d2b0eb0255c4f318');
  const source = read(audit).toString(), marker = '// END FIORINA V116 HOST RECEIPTS';
  assert.equal(sha(source.slice(0, source.indexOf(marker) + marker.length)), '6facdfa11619639d6490a9adf8b48ddb188c6f7d93530d07f2052a16ca7903a4');
  assert.ok(Object.isFrozen(merSuccessors));
  for (const [path, receipt] of Object.entries(merSuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    const prior = spriteV116Successors[path] || spriteSuccessors[path] || aliensMerge[path]
      || qualitySuccessors[path] || joinSuccessors[path] || successors[path];
    if (prior) assert.equal(receipt.previousSha256, prior.currentSha256, path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceMer(path, receipt.previousSha256), finalEndpoint(path), path);
    for (const value of [receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceMer(path, value), /Broken Fiorina-to-Mer-join source chain/, path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: finalEndpoint(path) });
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceMer(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(merSuccessors, audit), false);
});

test('the visual continuation advances only three hosts from the immutable reconstructed Mer join', () => {
  assert.equal(merVisualBaseline, '22fec87cad3dd7867b9c2ffe4d682eb9cb1dab04');
  assert.deepEqual(Object.keys(merVisualSuccessors), [
    'package.json', 'scripts/build-asset-filter.mjs', 'scripts/verify-public-release-v86.mjs',
  ]);
  assert.equal(sha(JSON.stringify(merVisualSuccessors)), 'ed6b42661a0f63b6c5629d10e07f92a8e1372cb9ab1232ec0c426b21b7ceb150');
  const source = read(audit).toString(), marker = '// END MER DES CHAGRINS JOIN RECEIPTS';
  assert.equal(sha(source.slice(0, source.indexOf(marker) + marker.length)), '9e7dd19e532b379158f43257faa544a2449f3c29f89660eaba69cd38148cb2d8');
  assert.ok(Object.isFrozen(merVisualSuccessors));
  for (const [path, receipt] of Object.entries(merVisualSuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.equal(receipt.previousSha256, merSuccessors[path].currentSha256, path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceMerVisual(path, receipt.previousSha256), finalEndpoint(path), path);
    assert.equal(advance(path, firstEndpoint(path)), finalEndpoint(path), path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: finalEndpoint(path) });
    for (const endpoint of [merSuccessors[path].previousSha256, receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceMerVisual(path, endpoint), /Broken Mer-join-to-visual source chain/, path);
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceMerVisual(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(merVisualSuccessors, audit), false);
});

test('the visual continuation refuses same-size changes and rollback of each of its three actual hosts', () => {
  for (const path of Object.keys(merVisualSuccessors)) {
    const actual = read(path), changed = Buffer.from(actual); changed[0] ^= 1;
    assert.throws(() => verify(candidate => candidate === path ? changed : read(candidate)),
      /Unreviewed AVP host source bytes/, path);
    assert.throws(() => runtimeView({ [path]: sha(changed) }), /Incorrect AVP host runtime view predecessor/, path);
    assert.equal(advanceMerVisual(path, merVisualSuccessors[path].previousSha256), sha(actual), path);
  }
});

test('Mer host completion pins the three omitted cumulative endpoints and preserves all seven plus three published receipts', () => {
  assert.deepEqual(merHostCompletionBaselines, {
    cumulativeCommit: 'b0df1877a058f0818f96437fdfdea3f21ba7f415',
    publishedCommit: '8cb25462b9b0328b09ae28b278356113d325c603',
  });
  assert.deepEqual(Object.keys(merHostCompletionSuccessors), expectedMerHostCompletionPaths);
  assert.equal(sha(JSON.stringify(merHostCompletionSuccessors)), 'feef2774da289423521245828154b0521d8ccf001ab8ad16f7e0ff490236c982');
  const source = read(audit).toString(), marker = '// END MER VISUAL HOST RECEIPTS';
  assert.ok(source.includes(marker));
  assert.equal(sha(source.slice(0, source.indexOf(marker) + marker.length)), '85434e85fa6d3a4b118d095b333c43ae9b70ed1f423e974b69cc6fda7b9563c6');
  assert.ok(Object.isFrozen(merHostCompletionBaselines) && Object.isFrozen(merHostCompletionSuccessors));
  for (const [path, receipt] of Object.entries(merHostCompletionSuccessors)) {
    assert.ok(Object.isFrozen(receipt));
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.equal(merSuccessors[path], undefined, path);
    assert.equal(merVisualSuccessors[path], undefined, path);
    assert.equal(receipt.previousSha256, xenoJoin.successors[path].currentSha256, path);
    assert.equal(sha(read(path)), finalEndpoint(path), path);
    assert.equal(advanceMerHostCompletion(path, receipt.previousSha256), finalEndpoint(path), path);
    assert.equal(reviewedXenoTrialsTantalusJoinV206(path, xenoJoin.successors[path].previousSha256), finalEndpoint(path), path);
    for (const endpoint of [receipt.previousSha256, receipt.currentSha256])
      assert.deepEqual(runtimeView({ [path]: endpoint }), { [path]: finalEndpoint(path) });
  }
});

test('Mer host completion rejects forged, skipped or repeated predecessors and same-size source changes', () => {
  for (const [path, receipt] of Object.entries(merHostCompletionSuccessors)) {
    const actual = read(path), altered = Buffer.from(actual); altered[0] ^= 1;
    for (const endpoint of [xenoJoin.successors[path].previousSha256, receipt.currentSha256, '0'.repeat(64), undefined])
      assert.throws(() => advanceMerHostCompletion(path, endpoint), /Broken Mer-visual-to-host-completion source chain/, path);
    assert.throws(() => verify(candidate => candidate === path ? altered : read(candidate)),
      /Unreviewed AVP host source bytes/, path);
    assert.throws(() => runtimeView({ [path]: sha(altered) }), /Incorrect AVP host runtime view predecessor/, path);
    assert.equal(advanceMerHostCompletion(path, receipt.previousSha256), sha(actual), path);
  }
  for (const path of ['.gitattributes/extra', '.vercelignore/extra', 'title-screen-v61.css/extra', 'src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceMerHostCompletion(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(merHostCompletionSuccessors, audit), false);
});

test('the equipment host continuation advances only the exact published visual package and preserves every earlier receipt', () => {
  assert.equal(merEquipmentBaseline, '8cb25462b9b0328b09ae28b278356113d325c603');
  assert.deepEqual(Object.keys(merEquipmentSuccessors), ['package.json']);
  assert.equal(sha(JSON.stringify(merEquipmentSuccessors)), '296c6c38cb3b5d9b3ffae1a02fbeb4a8882b5c4122342caaec15c2a676e38ec8');
  const source = read(audit).toString(), marker = '// END MER HOST COMPLETION RECEIPTS';
  assert.ok(source.includes(marker));
  assert.equal(sha(source.slice(0, source.indexOf(marker) + marker.length)), 'e3909533c394fa6b082bc7d3410e72864cbe846ad094739f797ce20be4cf8340');
  assert.ok(Object.isFrozen(merEquipmentSuccessors) && Object.isFrozen(merEquipmentSuccessors['package.json']));
  const path = 'package.json', receipt = merEquipmentSuccessors[path];
  assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
  assert.equal(receipt.previousSha256, merVisualSuccessors[path].currentSha256);
  assert.equal(sha(read(path)), receipt.currentSha256);
  assert.equal(advanceMerEquipment(path, receipt.previousSha256), receipt.currentSha256);
  assert.equal(advanceMerVisual(path, merVisualSuccessors[path].previousSha256), receipt.currentSha256);
  for (const endpoint of [receipt.previousSha256, receipt.currentSha256])
    assert.deepEqual(runtimeView({ [path]: endpoint }), { [path]: receipt.currentSha256 });
  assert.equal(Object.hasOwn(merEquipmentSuccessors, audit), false);
});

test('the equipment host continuation rejects a repeated or skipped package predecessor and same-size mutations', () => {
  const path = 'package.json', receipt = merEquipmentSuccessors[path];
  for (const endpoint of [merVisualSuccessors[path].previousSha256, receipt.currentSha256, '0'.repeat(64), undefined])
    assert.throws(() => advanceMerEquipment(path, endpoint), /Broken Mer-host-completion-to-equipment source chain/);
  const actual = read(path), altered = Buffer.from(actual); altered[0] ^= 1;
  assert.throws(() => verify(candidate => candidate === path ? altered : read(candidate)), /Unreviewed AVP host source bytes/);
  assert.throws(() => runtimeView({ [path]: sha(altered) }), /Incorrect AVP host runtime view predecessor/);
  for (const unknown of ['package.json/extra', 'src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceMerEquipment(unknown, 'unchanged'), 'unchanged', unknown);
});

test('test:all collects the new Mer equipment contract exactly once through its actual release collector', () => {
  const scripts = JSON.parse(read('package.json')).scripts;
  const path = 'scripts/verify-mer-equipment-ui-20261126.mjs';
  assert.equal(scripts['test:mer-des-chagrins-visual'].split(/\s+/).filter(entry => entry === path).length, 1);
  const files = collectReleaseTestsV143(scripts);
  assert.equal(files.filter(entry => entry === path).length, 1);
  assert.equal(new Set(files).size, files.length);
  read(path);
});
