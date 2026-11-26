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
const expectedCovenantPaths = [
  "index.html",
  "package.json",
  "scripts/build-asset-filter.mjs",
  "scripts/build.mjs",
  "scripts/verify-public-release-v86.mjs",
  "src/title-screen-v61.js"
];
const expectedCovenantV012Paths = ['scripts/qa-title-compositions-v163.py', 'scripts/verify-public-release-v86.mjs'];
const verifiedPaths = [...new Set([...expectedPaths, ...expectedJoinPaths, ...expectedQualityPaths, ...Object.keys(aliensMerge), ...expectedSpritePaths, ...expectedSpriteV116Paths, ...expectedCovenantPaths, ...expectedCovenantV012Paths])];
const firstEndpoint = path => (successors[path] || joinSuccessors[path] || qualitySuccessors[path] || aliensMerge[path] || spriteSuccessors[path]).previousSha256;
const mergedEndpoint = path => (aliensMerge[path] || qualitySuccessors[path] || joinSuccessors[path] || successors[path])?.currentSha256;
const preCovenantEndpoint = path => spriteV116Successors[path]?.currentSha256 || spriteSuccessors[path]?.currentSha256 || mergedEndpoint(path);
const preCovenantV012Endpoint = path => covenantSuccessors[path]?.currentSha256 || preCovenantEndpoint(path);
const finalEndpoint = path => covenantV012Successors[path]?.currentSha256 || preCovenantV012Endpoint(path);
const brokenChain = /Broken (?:merged-Tantalus-to-AVP host|AVP-to-Fiorina host|joined-host-to-Fiorina-QA|published-AVP-to-Aliens-merge|published-merge-to-Fiorina-sprites|Fiorina-V115-to-V116|published-host-to-Covenant|Covenant-V011-to-V012 host) source chain/;

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
  const source = read(audit).toString();
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
    let source = withoutCovenantV012HostEdits(path, read(path).toString());
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
    assert.equal(sha(read(path)), receipt.currentSha256, path);
    assert.equal(advanceCovenantV012(path, receipt.previousSha256), receipt.currentSha256, path);
    assert.equal(advance(path, firstEndpoint(path)), receipt.currentSha256, path);
    if (Object.hasOwn(aliensIncoming, path))
      assert.equal(advanceAliens(path, aliensIncoming[path]), receipt.currentSha256, path);
    for (const invalid of [receipt.currentSha256, firstEndpoint(path), '0'.repeat(64), undefined])
      assert.throws(() => advanceCovenantV012(path, invalid), /Broken Covenant-V011-to-V012 host source chain/, path);
    assert.deepEqual(runtimeView({ [path]: receipt.previousSha256 }), { [path]: receipt.currentSha256 });
    assert.deepEqual(runtimeView({ [path]: receipt.currentSha256 }), { [path]: receipt.currentSha256 });
  }
  for (const path of ['src/unreviewed.js', '__proto__', 'constructor', audit])
    assert.equal(advanceCovenantV012(path, 'unchanged'), 'unchanged', path);
  assert.equal(Object.hasOwn(covenantV012Successors, audit), false);
});

test('all published receipt declarations including Covenant V011 remain byte-identical', () => {
  const source = read(audit).toString(), end = source.indexOf('// BEGIN COVENANT V012 HOST RECEIPTS');
  assert.ok(end > 0);
  assert.equal(sha(source.slice(0, end)), '58ebb68d615843dda9113ba88d69534b1cb1394a9262cf638e7ad173ef1ca731');
  assert.equal(sha(JSON.stringify(covenantSuccessors)), 'baa661ba0b58d60fa0278d83c0b6b353cbe70c3b03ddc2ffb39e5a965ef65524');
});

test('removing only the reviewed V012 source edits recovers both exact V011 parent sources', () => {
  assert.deepEqual(Object.keys(covenantV012SourceEdits).sort(), [...expectedCovenantV012Paths].sort());
  for (const [path, receipt] of Object.entries(covenantV012Successors)) {
    const previous = withoutCovenantV012HostEdits(path, read(path).toString());
    assert.equal(sha(previous), receipt.previousSha256, 'Unrelated V012 host change: ' + path);
  }
});
