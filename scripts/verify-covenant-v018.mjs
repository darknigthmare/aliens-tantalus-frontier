import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { publicCovenantPathAdmissionV011 as admit } from './public-covenant-admissions-v011.mjs';
import { covenantSourceMetadataPathV011, reviewedCovenantSourceMetadataV011 } from './build-covenant-v011.mjs';
import { COVENANT_ARCHITECTURE_ROOT_V018 as assetRoot,
  COVENANT_ARCHITECTURE_MANIFEST_V018 as manifestPath,
  COVENANT_ARCHITECTURE_CANDIDATE_ROOT_V018 as candidateRoot,
  COVENANT_ARCHITECTURE_SOURCE_FILES_V018 as sourceFiles,
  compileCovenantArchitectureV018, reviewedCovenantArchitectureBytesV018 } from './public-covenant-architecture-v018.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFile(join(root, path));
const json = async path => JSON.parse((await read(path)).toString('utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const manifestBytes = await read(manifestPath);
const manifest = compileCovenantArchitectureV018(manifestBytes);
const provenance = await json('docs/covenant/PROVENANCE_V018.json');
const bible = await json('docs/covenant/BIBLE_COVENANT_V018.json');
const runtime = await json('dlc/covenant/sprites-v011.json');
assert.equal(hash(await read('dlc/covenant/sprites-v011.json')), 'f43305542a68190d5f44b53305612e58664ddc556ee89e264735e5af9ec1046d');
assert.equal(runtime.assets.length, 81);
assert.equal(runtime.release, '0.17.0');
assert.equal(provenance.sourceManifest.sha256, hash(manifestBytes));
assert.equal(bible.sourceManifest.sha256, hash(manifestBytes));
assert.equal(bible.inherits.sha256, hash(await read(bible.inherits.path)));
const runtimeIds = new Set(runtime.assets.map(row => row.id));
const historicalIds = new Set(), historicalHashes = new Set();
const historicalPaths = [];
let historicalCount = 0;
for (const pin of provenance.historicalSourceManifests) {
  const bytes = await read(pin.path);
  assert.equal(bytes.length, pin.bytes, pin.path);
  assert.equal(hash(bytes), pin.sha256, pin.path);
  for (const row of JSON.parse(bytes.toString('utf8')).assets) {
    assert.equal(historicalIds.has(row.id), false);
    historicalIds.add(row.id);
    historicalPaths.push(row.path);
    const png = await read(row.path);
    assert.equal(png.length, row.bytes, row.id);
    const expected = row.sha256 || row.alphaQA?.sha256;
    assert.equal(hash(png), expected, row.id);
    historicalHashes.add(expected);
    historicalCount++;
  }
}
assert.equal(historicalCount, 154);
for (const pin of [...provenance.frozenDocuments, ...provenance.unchangedRuntimeFiles]) {
  const bytes = await read(pin.path);
  assert.equal(bytes.length, pin.bytes, pin.path);
  assert.equal(hash(bytes), pin.sha256, pin.path);
}
const recovery = await json('docs/covenant/recovery-20261126/MANIFEST.json');
assert.equal(recovery.files.length, 46);
const recoveryHashes = new Set();
for (const row of recovery.files) {
  const bytes = await read(row.path);
  assert.equal(bytes.length, row.sizeBytes, row.path);
  assert.equal(hash(bytes), row.sha256, row.path);
  recoveryHashes.add(row.sha256);
}
for (const row of [...manifest.assets, ...manifest.documentaryCandidates]) {
  const png = await read(row.path);
  assert.equal(png.length, row.bytes, row.id);
  assert.equal(hash(png), row.sha256, row.id);
  assert.equal(reviewedCovenantArchitectureBytesV018(row.path, png), true);
  assert.equal(reviewedCovenantArchitectureBytesV018(row.path, png, { built: true }), false);
  assert.equal(reviewedCovenantArchitectureBytesV018(row.path, Buffer.concat([png, Buffer.from('x')])), false);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), row.width);
  assert.equal(png.readUInt32BE(20), row.height);
  assert.equal(png[25], 6, 'Native RGBA color type');
  assert.equal(historicalIds.has(row.id), false);
  assert.equal(historicalHashes.has(row.sha256), false);
  assert.equal(recoveryHashes.has(row.sha256), false, 'Historical rejected image promoted');
  assert.equal(runtimeIds.has(row.id), false);
  assert.equal(row.originalBytesPreserved, true);
  assert.equal(row.nativeAlphaPreserved, true);
  assert.equal(row.retouched, false);
  assert.equal(row.resized, false);
  assert.equal(row.verified1to1, false);
  assert.equal(row.runtimeIntegrated, false);
  assert.equal(row.alphaQA.pass, true);
  assert.equal(row.alphaQA.edgeAlphaAbove16, 0);
  assert.equal(row.promptSavedBeforeGeneration, true);
  assert.equal(typeof row.generationPrompt, 'string');
  assert.ok(row.generationPrompt.length > 200);
}
assert.deepEqual((await readdir(join(root, assetRoot))).sort(), ['manifest.json', manifest.assets[0].id + '.png'].sort());
assert.deepEqual(await readdir(join(root, candidateRoot)), [manifest.documentaryCandidates[0].id + '.png']);
assert.equal(manifest.assets[0].productionSelected, true);
assert.equal(manifest.documentaryCandidates[0].productionSelected, false);
assert.equal(manifest.documentaryCandidates[0].visualReview.aspectRatioDifferencePercentApproximation, -17.17);
assert.equal(manifest.documentaryCandidates[0].visualReview.closedCenterProbe.alpha, 253);
assert.equal(manifest.assets[0].visualReview.passageProbe.alpha, 0);
assert.equal(manifest.excludedAttempts.length, 2);
for (const attempt of manifest.excludedAttempts) {
  assert.equal(attempt.publishedPng, false);
  assert.equal(attempt.productionSelected, false);
  assert.equal(attempt.runtimeIntegrated, false);
  assert.equal(manifest.assets.some(row => row.sha256 === attempt.sha256), false);
}
assert.equal(bible.assetIndex.length, 155);
assert.equal(new Set(bible.assetIndex.map(row => row.id)).size, 155);
for (const row of bible.assetIndex) assert.match(row.sha256, /^[a-f0-9]{64}$/);
assert.equal(bible.assetIndex.filter(row => row.currentAdmission === 'runtime').length, 81);
assert.equal(bible.assetIndex.filter(row => row.currentAdmission === 'catalogue-only').length, 74);
assert.equal(bible.assetIndex.some(row => row.id === manifest.documentaryCandidates[0].id), false);
assert.equal(bible.summary.pngs, 155);
assert.equal(bible.summary.newPngs, 1);
assert.equal(bible.coverage.documentaryCandidatesOutsideProduction, 1);
assert.equal(bible.coverage.completedWorldFamilies, 0);
assert.equal(bible.roomUpdates[0].geometryChanged, false);
assert.equal(bible.roomUpdates[0].thresholdsChanged, false);
assert.equal(manifest.references.length, 4);
for (const ref of manifest.references) {
  assert.equal(ref.sourceType, 'primary-production-reference');
  assert.equal(ref.visuallyInspected, true);
  assert.match(ref.sha256, /^[a-f0-9]{64}$/);
}
assert.deepEqual(manifest.assets[0].inputReferenceIds, ['SRC-V018-LEONG-SIDE-SET', 'SRC-V018-LEONG-MODEL']);
assert.ok(!manifest.assets[0].inputReferenceIds.includes('SRC-V018-DREW-MAIN-PLAN'));
// A local full checkout must not hide a missing CI sparse-checkout directory.
const workflow = (await read('.github/workflows/covenant-v018-architecture.yml')).toString('utf8');
const sparseBlock = workflow.match(/          sparse-checkout: \|\n((?:            .+\n)+)/);
assert.ok(sparseBlock, 'Missing explicit V018 sparse-checkout contract');
const sparseRoots = sparseBlock[1].trim().split('\n').map(value => value.trim());
for (const path of [...sourceFiles, ...historicalPaths, ...provenance.historicalSourceManifests.map(row => row.path),
  ...provenance.frozenDocuments.map(row => row.path), ...provenance.unchangedRuntimeFiles.map(row => row.path),
  ...recovery.files.map(row => row.path)]) {
  assert.ok(sparseRoots.some(folder => path === folder || path.startsWith(folder + '/')),
    'V018 CI sparse-checkout omits a verified source: ' + path);
}
for (const path of sourceFiles) {
  await read(path);
  assert.equal(admit(path), true, 'Exact source path denied: ' + path);
  assert.equal(admit(path, { built: true }), false, 'Source leaked to build: ' + path);
  assert.equal(admit(path, { directory: true }), false);
}
for (const folder of [assetRoot, candidateRoot, 'docs/covenant/qa/v018']) {
  assert.equal(admit(folder, { directory: true }), true);
  assert.equal(admit(folder, { directory: true, built: true }), false);
  for (const path of [folder + '/unknown.png', folder + '/unknown.json', folder + '/../outside.png', folder + '//unknown.png']) {
    assert.equal(admit(path), false);
    assert.equal(admit(path, { built: true }), false);
  }
}
assert.throws(() => compileCovenantArchitectureV018(Buffer.concat([manifestBytes, Buffer.from(' ')])));
for (const path of [manifestPath, 'docs/covenant/BIBLE_COVENANT_V018.json']) {
  const bytes = await read(path);
  assert.equal(covenantSourceMetadataPathV011(path), true);
  assert.equal(reviewedCovenantSourceMetadataV011(path, bytes), true);
  assert.equal(reviewedCovenantSourceMetadataV011(path, Buffer.concat([bytes, Buffer.from(' ')])), false);
  assert.equal(reviewedCovenantSourceMetadataV011(path, bytes, { built: true }), false);
}
const browser = await json('docs/covenant/qa/v018/browser.json');
assert.equal(browser.ok, true);
assert.equal(browser.images.length, 2);
assert.equal(browser.backgroundsChecked.length, 3);
assert.deepEqual(browser.pageErrors, []);
assert.equal(browser.mobileHorizontalOverflow, false);
assert.equal(browser.gameplayWalkthroughRun, false);
assert.equal(hash(await read(browser.screenshot.path)), browser.screenshot.sha256);
for (const row of [...manifest.assets, ...manifest.documentaryCandidates]) assert.equal(browser.nativeImageHashes[row.id], row.sha256);
console.log(JSON.stringify({ ok: true, historicalPngsPreserved: historicalCount,
  historicalRecoveryFilesPreserved: recovery.files.length, selectedNewCataloguePngs: 1,
  cumulativeProductionPngs: 155, runtimePngsUnchanged: runtime.assets.length,
  documentaryCandidateOutsideProduction: 1, completedWorldFamilies: 0,
  alteredManifestRejected: true, alteredPngRejected: true, unknownPathsRejected: true,
  workflowSparseCheckoutCoversVerifiedSources: true,
  builtAdmissionRejected: true, rejectedHistoricalCandidatesPromoted: 0,
  browserCatalogueChecked: true, gameplayWalkthroughRun: false }, null, 2));
