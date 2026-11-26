import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TitleScreenController } from '../src/title-screen-v61.js';
import { publicCovenantPathAdmissionV011 as admit } from './public-covenant-admissions-v011.mjs';
import { buildCovenantDlcV011, verifyCovenantBundleV011, covenantManifestV011,
  COVENANT_SOURCE_V011, COVENANT_RUNTIME_FILES_V011, COVENANT_PROVENANCE_V011, COVENANT_PROVENANCE_V012,
  COVENANT_ASSET_ROOTS, covenantSourceMetadataPathV011, reviewedCovenantSourceMetadataV011 } from './build-covenant-v011.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const originalFiles = [
  'app.js', 'archaeology-art.js', 'archaeology.js', 'art-direction.js',
  'atmosphere-art.js', 'atmosphere.js', 'bridge.js', 'content.js', 'core.js',
  'fidelity-art.js', 'fidelity.js', 'field-art.js', 'freight-art.js', 'freight.js',
  'index.html', 'maintenance-art.js', 'maintenance.js', 'network-art.js',
  'renderer.js', 'ship-systems.js', 'style.css', 'threshold-art.js'
];

test('original recovered runtime remains byte-identical except the declared page wiring', async () => {
  const proof = JSON.parse(await readFile(join(root, 'docs/covenant/RUNTIME_SOURCE_V011.json'), 'utf8'));
  assert.equal(proof.archive.name, 'ALIEN_COVENANT_v0.10.0_DLC_COMPLET.zip');
  assert.equal(proof.archive.bytes, 77435386);
  assert.equal(proof.archive.sha256, 'b765f46776df1308d3872f4793478facc18f2b0603ade64fddbe4d996a4183d1');
  assert.deepEqual(proof.files.map(row => row.name).sort(), originalFiles.slice().sort());
  for (const row of proof.files) {
    let bytes = await readFile(join(root, COVENANT_SOURCE_V011, row.name));
    if (row.name === 'index.html') {
      let text = bytes.toString('utf8');
      const added = '<script src="fidelity-art.js"></script><script src="sprite-registry-v011.js"></script><script src="sprite-art-v011.js"></script><script src="app.js"></script>';
      assert.equal(text.split(added).length, 2, 'One final renderer insertion is required');
      text = text.replace(added, '<script src="fidelity-art.js"></script><script src="app.js"></script>');
      text = text.replace(/version 0\.(?:11|12)\.0/, 'version 0.10.0');
      bytes = Buffer.from(text);
    }
    assert.equal(bytes.length, row.bytes, 'Changed recovered source size: ' + row.name);
    assert.equal(digest(bytes), row.sha256, 'Changed recovered source bytes: ' + row.name);
  }
  assert.equal(COVENANT_RUNTIME_FILES_V011.includes('bridge.js'), false,
    'The historical duplicate launcher must not execute in the host');
});

test('sprite page is reproducible and every admitted PNG matches its exact bytes', async () => {
  const result = await verifyCovenantBundleV011(root);
  assert.ok(result.htmlBytes > 0);
  assert.ok(result.sprites > 0, 'An empty visual release cannot pass integration');
  const { compiled } = await covenantManifestV011(root);
  for (const row of compiled.entries) assert.equal(row.verified1to1, false);
});

test('Covenant menu action uses the current title guard and suspends native input', () => {
  const calls = [];
  const target = {
    root: { hidden: true }, state: 'menu',
    cancelNewTimelineConfirmation: () => calls.push('cancel'),
    suspendInput: () => calls.push('suspend'),
    onCovenant: () => calls.push('navigate')
  };
  TitleScreenController.prototype.openCovenant.call(target);
  assert.deepEqual(calls, []);
  target.root.hidden = false; target.state = 'idle';
  TitleScreenController.prototype.openCovenant.call(target);
  assert.deepEqual(calls, []);
  target.state = 'menu';
  TitleScreenController.prototype.openCovenant.call(target);
  assert.deepEqual(calls, ['cancel', 'suspend', 'navigate']);
});

test('Covenant participates in the existing keyboard/gamepad menu ordering', () => {
  const buttons = Object.fromEntries([
    'continueButton', 'newButton', 'dlcButton', 'forgeButton', 'aliens1986Button', 'covenantButton', 'optionsButton'
  ].map(name => [name, { name, hidden: false, disabled: false }]));
  const visible = TitleScreenController.prototype.menuButtons.call(buttons);
  assert.equal(visible[5], buttons.covenantButton);
  assert.equal(visible[6], buttons.optionsButton);
  buttons.covenantButton.disabled = true;
  assert.equal(TitleScreenController.prototype.menuButtons.call(buttons).includes(buttons.covenantButton), false);
});

test('the rendered title contains one distinct Covenant entry', async () => {
  const html = await readFile(join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/id="title-covenant"/g) || []).length, 1);
  assert.ok(html.includes('ALIEN: COVENANT'));
});

test('only declared PNG files and the two public module files enter distribution', async () => {
  const { compiled } = await covenantManifestV011(root);
  const png = compiled.entries[0].path.slice(1);
  assert.equal(admit(png, { built: true }), true);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v011/unknown.png', { built: true }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v011/manifest.json', { built: false }), true);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v011/manifest.json', { built: true }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v012/manifest.json', { built: false }), true);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v012/manifest.json', { built: true }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v012/unknown.png', { built: true }), false);
  assert.equal(admit('docs/covenant/PROVENANCE_V012.json', { built: false }), true);
  assert.equal(admit('docs/covenant/PROVENANCE_V012.json', { built: true }), false);
  assert.equal(admit('docs/covenant/SPRITES_V012_STATUS.md', { built: false }), true);
  assert.equal(admit('docs/covenant/SPRITES_V012_STATUS.md', { built: true }), false);
  assert.equal(admit('dlc/covenant/index.html', { built: true }), true);
  assert.equal(admit('dlc/covenant/sprites-v011.json', { built: true }), true);
  assert.equal(admit('dlc/covenant/hidden.html', { built: true }), false);
  assert.equal(admit('modules/covenant/dlc/covenant/core.js', { built: false }), true);
  assert.equal(admit('modules/covenant/dlc/covenant/core.js', { built: true }), false);
  assert.equal(admit('scripts/verify-covenant-sprites-v011.mjs', { built: false }), true);
  assert.equal(admit('scripts/verify-covenant-sprites-v011.mjs', { built: true }), false);
  assert.equal(admit('scripts/package-covenant-sprites-v012.py', { built: false }), true);
  assert.equal(admit('scripts/package-covenant-sprites-v012.py', { built: true }), false);
  assert.equal(admit('scripts/qa-covenant-catalogue-v012.py', { built: false }), true);
  assert.equal(admit('scripts/qa-covenant-catalogue-v012.py', { built: true }), false);
  assert.equal(admit('docs/covenant/INVENTORY_V011.json', { built: true }), false);
  assert.equal(admit('docs/covenant/private-extra.txt', { built: false }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v011/../outside.png'), false);
  assert.equal(admit('src/app.js'), null, 'Unrelated paths remain owned by the host policy');
});

test('standalone build contains only the admitted page, runtime manifest and original images', async () => {
  const out = await mkdtemp(join(tmpdir(), 'covenant-v011-build-test-'));
  try {
    const result = await buildCovenantDlcV011(root, out);
    const { compiled } = await covenantManifestV011(root);
    assert.equal(result.sprites, compiled.entries.length);
    assert.deepEqual((await readdir(join(out, 'dlc/covenant'))).sort(), ['index.html', 'sprites-v011.json']);
    for (const base of COVENANT_ASSET_ROOTS) {
      const entries = compiled.entries.filter(row => row.path.startsWith('/' + base + '/'));
      if (entries.length) assert.deepEqual((await readdir(join(out, base))).sort(),
        entries.map(row => row.id + '.png').sort());
      else await assert.rejects(readdir(join(out, base)), error => error.code === 'ENOENT');
    }
    assert.equal((await readdir(out)).includes('modules'), false);
    assert.equal((await readdir(out)).includes('docs'), false);
    assert.equal((await readdir(out)).includes('scripts'), false);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test('reviewed provenance is pinned to each exact source path and bytes, never admitted in dist', async () => {
  assert.equal(covenantSourceMetadataPathV011('docs/covenant/other.json'), false);
  for (const path of [COVENANT_PROVENANCE_V011, COVENANT_PROVENANCE_V012]) {
    assert.equal(covenantSourceMetadataPathV011(path), true);
    assert.equal(admit(path, { built: true }), false, 'The path gate rejects metadata before text scanning');
    let bytes;
    try { bytes = await readFile(join(root, path)); }
    catch (error) {
      if (path === COVENANT_PROVENANCE_V012 && error.code === 'ENOENT') continue;
      throw error;
    }
    assert.equal(reviewedCovenantSourceMetadataV011(path, bytes), true,
      'Every present production manifest requires its final reviewed digest');
    const changed = Buffer.from(bytes.toString('utf8').replace('"schemaVersion": 1', '"schemaVersion": 2'));
    assert.notDeepEqual(changed, bytes, 'The mutation must change valid JSON content');
    assert.doesNotThrow(() => JSON.parse(changed.toString('utf8')));
    assert.equal(reviewedCovenantSourceMetadataV011(path, changed), false);
    assert.equal(reviewedCovenantSourceMetadataV011(path, Buffer.concat([bytes, Buffer.from('\n')])),
      false, 'Even whitespace changes require a new review');
    assert.equal(reviewedCovenantSourceMetadataV011(path, bytes, { built: true }), false);
    assert.equal(reviewedCovenantSourceMetadataV011('docs/covenant/other.json', bytes), false);
    const other = path === COVENANT_PROVENANCE_V011 ? COVENANT_PROVENANCE_V012 : COVENANT_PROVENANCE_V011;
    assert.equal(reviewedCovenantSourceMetadataV011(other, bytes), false, 'Pins cannot be exchanged between versions');
  }
});

test('cumulative runtime preserves all 29 V011 bindings and scopes every new prop to a real instance', async () => {
  const { manifest, compiled } = await covenantManifestV011(root);
  const legacy = manifest.assets.filter(row => row.path.startsWith('/assets/openai/sprites/alien-covenant-v011/'));
  assert.equal(legacy.length, 29);
  assert.equal(digest(Buffer.from(JSON.stringify(legacy))),
    '800d3c2ed5d8c14160855d08753d2e21a45e95948a52343876356eb87b5d8c5f');
  const text = await readFile(join(root, COVENANT_SOURCE_V011, 'content.js'), 'utf8');
  const data = JSON.parse(text.slice('(function(root){const data='.length, text.lastIndexOf(';if(typeof module')));
  for (const entry of compiled.entries.filter(row => row.kind === 'prop'
    && row.path.startsWith('/assets/openai/sprites/alien-covenant-v012/'))) {
    const matches = data.rooms.filter(room => room.props.some(prop => prop.id === entry.key));
    assert.equal(matches.length, 1, 'New prop must bind an exact existing instance: ' + entry.id);
    assert.deepEqual(entry.rooms, [matches[0].id]);
    assert.equal(entry.state, 'idle');
    assert.equal(admit(entry.path.slice(1), { built: true }), true);
  }
});

test('Covenant build helpers can be imported without recovered sources in a sparse checkout', async () => {
  const sparse = await mkdtemp(join(tmpdir(), 'covenant-v011-sparse-test-'));
  try {
    const scripts = join(sparse, 'scripts');
    await mkdir(scripts, { recursive: true });
    const helper = join(scripts, 'build-covenant-v011.mjs');
    await writeFile(helper, await readFile(join(root, 'scripts/build-covenant-v011.mjs')));
    const isolated = await import(pathToFileURL(helper).href);
    assert.equal(typeof isolated.covenantManifestV011, 'function');
    await mkdir(join(sparse, 'dlc/covenant'), { recursive: true });
    await writeFile(join(sparse, 'dlc/covenant/sprites-v011.json'),
      await readFile(join(root, 'dlc/covenant/sprites-v011.json')));
    await assert.rejects(isolated.covenantManifestV011(sparse), error =>
      error.code === 'MODULE_NOT_FOUND' && error.message.includes('sprite-registry-v011.js'));
  } finally {
    await rm(sparse, { recursive: true, force: true });
  }
});
