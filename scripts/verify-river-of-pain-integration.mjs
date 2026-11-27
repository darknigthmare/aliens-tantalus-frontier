import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, symlink, mkdir, copyFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { RIVER_OF_PAIN_MANIFEST as manifest, RIVER_OF_PAIN_ROOT as dlc,
  RIVER_OF_PAIN_RUNTIME as runtime, riverOfPainPathAdmission,
  RIVER_OF_PAIN_VISUAL_ROOT as visualRoot, RIVER_OF_PAIN_VISUAL_ASSETS as visualAssets,
  riverOfPainVisualAssetRows,
  verifyRiverOfPainRecovery, copyRiverOfPainRuntime, verifyRiverOfPainRuntime } from './river-of-pain-distribution.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
async function sparseScripts() {
  const folder = await mkdtemp(join(tmpdir(), 'atf-rop-sparse-'));
  await mkdir(join(folder, 'scripts'));
  for (const name of ['river-of-pain-distribution.mjs', 'river-of-pain-manifest.json',
    'build-river-of-pain-visuals.mjs', 'build-river-of-pain-sprite-gallery.mjs']) {
    await copyFile(join(root, 'scripts', name), join(folder, 'scripts', name));
  }
  return folder;
}
function isolatedAdmission(folder, assertions) {
  const url = pathToFileURL(join(folder, 'scripts/river-of-pain-distribution.mjs')).href;
  return spawnSync(process.execPath, ['--input-type=module', '-e',
    "import assert from 'node:assert/strict';\nconst admission = await import(" + JSON.stringify(url) + ');\n' + assertions],
  { cwd: folder, encoding: 'utf8', timeout: 15000 });
}
test('sparse host imports admit only the indexed PNGs without loading any DLC; a build still requires its source', async () => {
  const folder = await sparseScripts();
  try {
    const result = isolatedAdmission(folder, `
      const rows = admission.RIVER_OF_PAIN_VISUAL_ASSETS;
      assert.equal(rows.length, ${visualAssets.length});
      assert.equal(admission.riverOfPainPathAdmission(rows[0].path, { built: true }), true);
      assert.equal(admission.riverOfPainPathAdmission('${visualRoot}/assets/unlisted.png', { built: true }), false);
      assert.equal(admission.riverOfPainPathAdmission('${visualRoot}/assets/../private.png'), false);
      assert.equal(admission.riverOfPainPathAdmission('src/app.js'), null);
      await assert.rejects(admission.copyRiverOfPainRuntime(process.cwd(), process.cwd() + '/output'), { code: 'ENOENT' });
      await assert.rejects(admission.verifyRiverOfPainRuntime(process.cwd()), { code: 'ENOENT' });
    `);
    assert.equal(result.status, 0, result.stderr || String(result.error));
    await assert.rejects(readFile(join(folder, 'output', dlc, 'JOUER.html')), { code: 'ENOENT' });
  } finally { await rm(folder, { recursive: true, force: true }); }
});
test('visual admission rejects malformed indexes and every mismatch with the real manifest before copying', async () => {
  const folder = await sparseScripts(), original = JSON.parse(JSON.stringify(manifest));
  const manifestPath = join(folder, 'scripts/river-of-pain-manifest.json');
  const verify = expression => isolatedAdmission(folder, expression);
  const writeIndex = value => writeFile(manifestPath, JSON.stringify(value));
  try {
    for (const changed of [
      { ...original, visualManifestSha256: 'a'.repeat(64) },
      { ...original, visualAssets: original.visualAssets.map((row, index) => index
        ? row : { ...row, path: visualRoot + '/assets/unlisted.png' }) }
    ]) {
      await writeIndex(changed);
      const result = verify(`
        await assert.rejects(admission.verifyRiverOfPainVisualSource(${JSON.stringify(root)}), /admitted hash|admission index/);
        await assert.rejects(admission.copyRiverOfPainRuntime(${JSON.stringify(root)}, process.cwd() + '/output'), /admitted hash|admission index/);
      `);
      assert.equal(result.status, 0, result.stderr || String(result.error));
    }
    for (const invalid of [
      { path: visualRoot + '/assets/../private.png' },
      { path: visualRoot + '/assets//unlisted.png' },
      { path: 'assets/unlisted.png' },
      { sha256: 'not-a-hash' },
      { extra: true }
    ]) {
      await writeIndex({ ...original, visualAssets: [{ ...original.visualAssets[0], ...invalid }] });
      const result = verify('');
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Visual admission|Unexpected visual admission/);
    }
    await writeIndex({ ...original, visualAssets: [original.visualAssets[0], original.visualAssets[0]] });
    const duplicate = verify('');
    assert.notEqual(duplicate.status, 0);
    assert.match(duplicate.stderr, /Duplicate visual admission path/);
    await writeIndex(original);
    const visualDirectory = join(folder, visualRoot);
    await mkdir(visualDirectory, { recursive: true });
    const visualManifest = await readFile(join(root, manifest.visualManifest));
    await writeFile(join(folder, manifest.visualManifest), Buffer.concat([visualManifest, Buffer.from('\n')]));
    let result = verify(`await assert.rejects(admission.verifyRiverOfPainVisualSource(process.cwd()), /admitted hash/);`);
    assert.equal(result.status, 0, result.stderr || String(result.error));
    await writeFile(join(folder, manifest.visualManifest), visualManifest);
    await symlink(join(root, visualRoot, 'sprite-loader.js'), join(visualDirectory, 'sprite-loader.js'));
    result = verify(`await assert.rejects(admission.verifyRiverOfPainVisualSource(process.cwd()), /Symbolic link/);`);
    assert.equal(result.status, 0, result.stderr || String(result.error));
    await assert.rejects(readFile(join(folder, 'output', dlc, 'JOUER.html')), { code: 'ENOENT' });
  } finally { await rm(folder, { recursive: true, force: true }); }
});
test('recovery inventory preserves all 222 source files and nine original archives', async () => {
  assert.equal(manifest.sourceFiles.length, 222);
  assert.equal(manifest.archives.length, 9);
  assert.equal(manifest.archives.reduce((sum, row) => sum + row.bytes, 0), 208383968);
  assert.equal(new Set(manifest.sourceFiles.map(row => row.path)).size, 222);
  assert.equal(manifest.version, '0.9.0-candidate.1');
  assert.deepEqual(await verifyRiverOfPainRecovery(root), { files: 222, archives: 9, version: manifest.version });
});
test('every recovered source is explicitly admitted only in its intended distribution', async () => {
  for (const row of [...manifest.sourceFiles, ...manifest.archives]) {
    assert.equal(isPublicDistributionPathV86(row.path), true, row.path);
    assert.equal(isPublicDistributionPathV86(row.path, { built: true }), runtime.includes(row.path), row.path);
    if (/\.(?:js|mjs|py|json|css|html|md|webmanifest)$/i.test(row.path)) {
      assert.equal(isPublicDistributionTextV86(await readFile(join(root, row.path), 'utf8')), true, row.path);
    }
  }
});
test('source-only policies never admit arbitrary files, traversal, secrets, or directories as files', () => {
  for (const path of [dlc + '/extra.js', dlc + '/.env', dlc + '/../private.json',
    '/' + dlc + '/JOUER.html', dlc + '//JOUER.html', dlc + '\\JOUER.html',
    'archives/river-of-pain/unreviewed.zip', dlc + '/docs/new-report.md',
    visualRoot + '/assets/unlisted.png', visualRoot + '/assets/report.json',
    visualRoot + '/assets/../sprite-manifest.json', visualRoot + '/private-notes.md']) {
    assert.equal(riverOfPainPathAdmission(path), false, path);
    assert.equal(riverOfPainPathAdmission(path, { built: true }), false, path);
  }
  assert.equal(riverOfPainPathAdmission(dlc), false);
  assert.equal(riverOfPainPathAdmission(dlc, { directory: true, built: true }), true);
  assert.equal(riverOfPainPathAdmission('src/app.js'), null);
  assert.equal(isPublicDistributionPathV86('docs/development/RIVER_OF_PAIN_INTEGRATION.md'), true);
  assert.equal(isPublicDistributionPathV86('docs/development/RIVER_OF_PAIN_INTEGRATION.md', { built: true }), false);
});
test('visual tooling and standalone metadata stay source-only and satisfy the shared text privacy guard', async () => {
  for (const path of [...manifest.visualSourceFiles,
    'docs/development/RIVER_OF_PAIN_SPRITE_INVENTORY.md',
    'docs/development/RIVER_OF_PAIN_SPRITE_REFERENCES.md',
    'docs/development/RIVER_OF_PAIN_SPRITE_QA.md',
    'scripts/inspect-river-of-pain-sprites.py', 'scripts/build-river-of-pain-visuals.mjs',
    'scripts/build-river-of-pain-sprite-gallery.mjs',
    'scripts/verify-river-of-pain-sprites.mjs', 'scripts/verify-river-of-pain-sprites-browser.py']) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    // Source-only admission does not exempt generation provenance or embedded
    // bible JSON from the same privacy scan used by npm run check.
    if (/\.(?:js|mjs|py|json|css|html|md|webmanifest)$/i.test(path))
      assert.equal(isPublicDistributionTextV86(await readFile(join(root, path), 'utf8')), true,
        'Private metadata in visual source file: ' + path);
  }
  for (const row of visualAssets) {
    assert.equal(riverOfPainPathAdmission(row.path), true, row.path);
    assert.equal(riverOfPainPathAdmission(row.path, { built: true }), true, row.path);
  }
  for (const path of [visualRoot + '/JOUER.html', visualRoot + '/GALLERY.html']) {
    assert.equal(riverOfPainPathAdmission(path, { built: true }), true, path);
  }
});
test('visual admission deduplicates explicit PNG reuse and rejects conflicting hashes or paths', () => {
  const asset = { id: 'test-person', file: 'assets/test-person.png', category: 'person',
    targetIds: ['newt'], pose: 'idle', state: 'normal', facing: 1, height: 51,
    bounds: { x: 1, y: 1, w: 10, h: 20 }, anchor: { x: 6, y: 21 }, weapon: 'none',
    sha256: 'a'.repeat(64), fidelity: { status: 'test-fixture', note: 'No production image.' } };
  const reused = { ...asset, id: 'test-reuse', targetIds: ['tim'] };
  const input = assets => ({ schema: 1, id: 'river-of-pain-visual-v1', assets });
  assert.deepEqual(riverOfPainVisualAssetRows(input([asset, reused])), [
    { path: visualRoot + '/assets/test-person.png', sha256: asset.sha256 }
  ]);
  assert.throws(() => riverOfPainVisualAssetRows(input([asset, { ...reused, sha256: 'b'.repeat(64) }])),
    /Conflicting sprite hashes/);
  for (const file of ['assets/../private.png', 'assets/private.json', '/assets/private.png',
    'https://example.test/private.png', 'assets//private.png']) {
    assert.throws(() => riverOfPainVisualAssetRows(input([{ ...asset, file }])), /relative PNG files/);
  }
});
test('the build copies the exact public manifest and rejects an injected report', async () => {
  const output = await mkdtemp(join(tmpdir(), 'atf-rop-distribution-'));
  try {
    await copyRiverOfPainRuntime(root, output);
    const result = await verifyRiverOfPainRuntime(output);
    assert.equal(result.files, runtime.length);
    assert.equal(result.visual.assets, visualAssets.length);
    assert.equal(result.visual.entry, '/' + visualRoot + '/JOUER.html');
    assert.equal(result.playableSha256, '91ae538879b939018cea5dc3ba2eb9e45faea7693fdd952efbe8531b33cdfced');
    for (const path of manifest.visualSourceFiles) {
      await assert.rejects(readFile(join(output, path)), { code: 'ENOENT' }, path);
    }
    await writeFile(join(output, dlc, 'unexpected-report.md'), 'source-only');
    await assert.rejects(verifyRiverOfPainRuntime(output), /unapproved or missing files/);
  } finally { await rm(output, { recursive: true, force: true }); }
});
test('the public build rejects changed derived HTML and changed declared PNG bytes', async () => {
  const output = await mkdtemp(join(tmpdir(), 'atf-rop-visual-integrity-'));
  try {
    await copyRiverOfPainRuntime(root, output);
    const htmlPath = join(output, visualRoot, 'JOUER.html');
    const originalHtml = await readFile(htmlPath);
    await writeFile(htmlPath, Buffer.concat([originalHtml, Buffer.from('\n') ]));
    await assert.rejects(verifyRiverOfPainRuntime(output), /differs from its canonical build/);
    await writeFile(htmlPath, originalHtml);
    assert.ok(visualAssets.length > 0, 'The visual release must contain at least one admitted PNG.');
    const imagePath = join(output, visualAssets[0].path);
    await writeFile(imagePath, Buffer.concat([await readFile(imagePath), Buffer.from('corruption-test')]));
    await assert.rejects(verifyRiverOfPainRuntime(output), /PNG differs from its declared hash/);
  } finally { await rm(output, { recursive: true, force: true }); }
});
test('the public build refuses a symbolic link in its DLC', async () => {
  const output = await mkdtemp(join(tmpdir(), 'atf-rop-link-'));
  try {
    await mkdir(join(output, dlc), { recursive: true });
    await symlink(join(root, dlc, 'JOUER.html'), join(output, dlc, 'JOUER.html'));
    await assert.rejects(verifyRiverOfPainRuntime(output), /Symbolic link/);
  } finally { await rm(output, { recursive: true, force: true }); }
});
test('unknown DLC routes cannot become the Frontier HTML fallback', async () => {
  const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
  const fallback = config.rewrites.find(row => row.destination === '/index.html');
  const pattern = new RegExp('^' + fallback.source + '$');
  assert.equal(pattern.test('/dlc/fleuve-de-la-douleur/missing'), false);
  assert.equal(pattern.test('/archives/river-of-pain/missing'), false);
  assert.equal(pattern.test('/hub'), true);
});
