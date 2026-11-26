import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  MER_VISUAL_ROOT_20261126 as ROOT, MER_VISUAL_MANIFEST_20261126 as MANIFEST,
  compileMerVisualManifest20261126, copyMerVisualRuntime20261126,
  isMerVisualSourceOnly20261126, merVisualPathAdmission20261126, verifyMerVisual20261126,
} from './mer-des-chagrins-visual-admission-20261126.mjs';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const make = files => {
  const bytes = Buffer.from(JSON.stringify({ schemaVersion: 1, root: ROOT, files }));
  return { bytes, inventory: compileMerVisualManifest20261126(bytes, digest(bytes)) };
};
const record = (path, content, publicFile = true) => ({ path: ROOT + '/' + path, sizeBytes: Buffer.byteLength(content), sha256: digest(content), public: publicFile });
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mer-visual-admission-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const contents = new Map([[ROOT + '/index.html', '<html>expedition</html>'], [ROOT + '/src/png-renderer.js', '/* renderer fixture */'], [ROOT + '/SPRITE_MANIFEST.json', '{"fixture":true}']]);
  const files = [...contents].map(([path, text]) => record(path.slice(ROOT.length + 1), text, !path.endsWith('.json')));
  const { bytes, inventory } = make(files);
  for (const [path, text] of contents) { await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), text); }
  await writeFile(join(root, MANIFEST), bytes);
  return { root, inventory, contents };
}

test('exact inventory separates public runtime and source metadata', () => {
  const { inventory } = make([record('index.html', 'game'), record('SPRITE_MANIFEST.json', '{}', false)]);
  assert.equal(inventory.admits(ROOT, { directory: true, built: true }), true);
  assert.equal(inventory.admits(ROOT + '/index.html', { built: true }), true);
  for (const path of [MANIFEST, ROOT + '/SPRITE_MANIFEST.json']) {
    assert.equal(inventory.admits(path), true);
    assert.equal(inventory.admits(path, { built: true }), false);
    assert.equal(inventory.admits(path, { directory: true }), false);
  }
  for (const path of [ROOT + '/unknown.png', ROOT + '/../private.txt', ROOT + '//index.html', '/' + ROOT, ROOT + '\\index.html', ROOT + '/src/./x.js', ROOT + '/x\0.js']) {
    assert.equal(inventory.admits(path), false, path);
    assert.equal(inventory.admits(path, { built: true }), false, path);
  }
});

test('changed manifest bytes cannot borrow an existing pin', () => {
  const bytes = Buffer.from(JSON.stringify({ schemaVersion: 1, root: ROOT, files: [record('index.html', 'game')] }));
  assert.throws(() => compileMerVisualManifest20261126(Buffer.concat([bytes, Buffer.from(' ')]), digest(bytes)), /Unreviewed/);
});

test('manifest rejects unsafe, duplicate, conflicting and invalid records', () => {
  const valid = record('index.html', 'game');
  for (const files of [[], [valid, valid], [{ ...valid, path: '../outside' }], [{ ...valid, path: ROOT + '/x/../y' }], [{ ...valid, path: MANIFEST }], [{ ...valid, sizeBytes: -1 }], [{ ...valid, sizeBytes: 0.5 }], [{ ...valid, sha256: 'bad' }], [{ ...valid, public: 'yes' }], [record('src', 'file'), record('src/code.js', 'code')]]) assert.throws(() => make(files));
});

test('source utilities are admitted only by exact source paths', () => {
  const path = 'scripts/verify-mer-png-renderer-20261126.mjs';
  assert.equal(merVisualPathAdmission20261126(path), true);
  assert.equal(merVisualPathAdmission20261126(path, { built: true }), false);
  assert.equal(merVisualPathAdmission20261126(path, { directory: true }), false);
  assert.equal(isMerVisualSourceOnly20261126(path), false, 'Unpinned tools retain the ordinary private-text guard.');
  assert.equal(merVisualPathAdmission20261126('unrelated/file.js'), null);
  assert.equal(merVisualPathAdmission20261126('docs/mer-des-chagrins-20261126/canvas/secret.txt'), false);
});

test('copy publishes only reviewed runtime, excluding both manifests', async t => {
  const f = await fixture(t), output = join(f.root, 'built');
  assert.equal((await verifyMerVisual20261126(f.root, { inventory: f.inventory })).files, 3);
  const result = await copyMerVisualRuntime20261126(f.root, output, { inventory: f.inventory });
  assert.equal(result.files, 2);
  assert.equal(await readFile(join(output, ROOT, 'index.html'), 'utf8'), f.contents.get(ROOT + '/index.html'));
  for (const path of [MANIFEST, ROOT + '/SPRITE_MANIFEST.json']) await assert.rejects(readFile(join(output, path)), { code: 'ENOENT' });
});

test('same-size altered runtime fails the byte digest', async t => {
  const f = await fixture(t), path = join(f.root, ROOT, 'index.html');
  const bytes = await readFile(path); bytes[6] ^= 1; await writeFile(path, bytes);
  await assert.rejects(verifyMerVisual20261126(f.root, { inventory: f.inventory }), /Changed visual bytes/);
});

test('missing file fails verification', async t => {
  const f = await fixture(t); await rm(join(f.root, ROOT, 'index.html'));
  await assert.rejects(verifyMerVisual20261126(f.root, { inventory: f.inventory }), /Missing visual member/);
});

test('unknown file fails both source and built verification', async t => {
  const f = await fixture(t); await writeFile(join(f.root, ROOT, 'extra.js'), 'extra');
  await assert.rejects(verifyMerVisual20261126(f.root, { inventory: f.inventory }), /Unlisted visual member/);
  const output = join(f.root, 'built'); await rm(join(f.root, ROOT, 'extra.js'));
  await copyMerVisualRuntime20261126(f.root, output, { inventory: f.inventory });
  await writeFile(join(output, ROOT, 'private.json'), '{}');
  await assert.rejects(verifyMerVisual20261126(output, { built: true, inventory: f.inventory }), /Unlisted visual member/);
});

test('source symlink cannot masquerade as an approved file', async t => {
  const f = await fixture(t), target = join(f.root, 'outside.html');
  await writeFile(target, f.contents.get(ROOT + '/index.html')); await rm(join(f.root, ROOT, 'index.html'));
  await symlink(target, join(f.root, ROOT, 'index.html'));
  await assert.rejects(verifyMerVisual20261126(f.root, { inventory: f.inventory }), /symlink/);
});

test('copy refuses an output symlink before writing any runtime', async t => {
  const f = await fixture(t), output = join(f.root, 'built'), external = join(f.root, 'external');
  await mkdir(join(output, 'dlc'), { recursive: true }); await mkdir(external);
  await symlink(external, join(output, ROOT));
  await assert.rejects(copyMerVisualRuntime20261126(f.root, output, { inventory: f.inventory }), /symlink/);
  await assert.rejects(readFile(join(external, 'index.html')), { code: 'ENOENT' });
});
