import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TitleScreenController } from '../src/title-screen-v61.js';
import { publicCovenantPathAdmissionV011 as admit } from './public-covenant-admissions-v011.mjs';
import { buildCovenantDlcV011, verifyCovenantBundleV011, covenantManifestV011,
  COVENANT_SOURCE_V011, COVENANT_RUNTIME_FILES_V011, COVENANT_PROVENANCE_V011, COVENANT_PROVENANCE_V012,
  COVENANT_PROVENANCE_V013, COVENANT_PROVENANCE_V014,
  COVENANT_SOURCE_ONLY_ASSETS_V015, COVENANT_SOURCE_ONLY_PROVENANCE_V015,
  COVENANT_ASSET_ROOTS, covenantSourceMetadataPathV011, reviewedCovenantSourceMetadataV011 } from './build-covenant-v011.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
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
      text = text.replace(/version 0\.(?:11|12|13|14)\.0/, 'version 0.10.0');
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
  assert.equal(admit('assets/openai/sprites/alien-covenant-v013/manifest.json', { built: false }), true);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v013/manifest.json', { built: true }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v013/unknown.png', { built: true }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v014/manifest.json', { built: false }), true);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v014/manifest.json', { built: true }), false);
  assert.equal(admit('assets/openai/sprites/alien-covenant-v014/unknown.png', { built: true }), false);
  assert.equal(admit('docs/covenant/PROVENANCE_V012.json', { built: false }), true);
  assert.equal(admit('docs/covenant/PROVENANCE_V012.json', { built: true }), false);
  assert.equal(admit('docs/covenant/SPRITES_V012_STATUS.md', { built: false }), true);
  assert.equal(admit('docs/covenant/SPRITES_V012_STATUS.md', { built: true }), false);
  for (const path of ['docs/covenant/PROVENANCE_V013.json', 'docs/covenant/SPRITES_V013_STATUS.md',
    'scripts/package-covenant-sprites-v013.py', 'scripts/qa-covenant-catalogue-v013.py',
    'docs/covenant/PROVENANCE_V014.json', 'docs/covenant/SPRITES_V014_STATUS.md',
    'docs/covenant/BIBLE_COVENANT_V014.md', 'docs/covenant/BIBLE_COVENANT_V014.json',
    'docs/covenant/BIBLE_COVENANT_V014.html', 'docs/covenant/BIBLE_COVENANT_V014.xlsx',
    'scripts/package-covenant-sprites-v014.py', 'scripts/qa-covenant-catalogue-v014.py',
    'scripts/build-covenant-bible-v014.py', 'scripts/build-covenant-bible-v014.mjs']) {
    assert.equal(admit(path, { built: false }), true);
    assert.equal(admit(path, { built: true }), false);
  }
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
    await assert.rejects(readdir(join(out, COVENANT_SOURCE_ONLY_ASSETS_V015)), error => error.code === 'ENOENT',
      'Source-only V015 originals must not be copied into a standalone build');
    assert.equal((await readdir(out)).includes('modules'), false);
    assert.equal((await readdir(out)).includes('docs'), false);
    assert.equal((await readdir(out)).includes('scripts'), false);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test('reviewed provenance and bible text are pinned to exact source paths and bytes, never admitted in dist', async () => {
  assert.equal(covenantSourceMetadataPathV011('docs/covenant/other.json'), false);
  for (const path of [COVENANT_PROVENANCE_V011, COVENANT_PROVENANCE_V012, COVENANT_PROVENANCE_V013, COVENANT_PROVENANCE_V014,
    'docs/covenant/BIBLE_COVENANT_V014.json', 'docs/covenant/BIBLE_COVENANT_V014.md', 'docs/covenant/BIBLE_COVENANT_V014.html',
    'scripts/build-covenant-bible-v014.py']) {
    assert.equal(covenantSourceMetadataPathV011(path), true);
    assert.equal(admit(path, { built: true }), false, 'The path gate rejects metadata before text scanning');
    let bytes;
    try { bytes = await readFile(join(root, path)); }
    catch (error) {
      if (path !== COVENANT_PROVENANCE_V011 && error.code === 'ENOENT') continue;
      throw error;
    }
    assert.equal(reviewedCovenantSourceMetadataV011(path, bytes), true,
      'Every present reviewed source requires its final digest');
    if (path.endsWith('.json')) {
      const changed = Buffer.from(bytes.toString('utf8').replace('"schemaVersion": 1', '"schemaVersion": 2'));
      assert.notDeepEqual(changed, bytes, 'The mutation must change valid JSON content');
      assert.doesNotThrow(() => JSON.parse(changed.toString('utf8')));
      assert.equal(reviewedCovenantSourceMetadataV011(path, changed), false);
    }
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

test('V013 preserves every V012 runtime binding and all 61 earlier original PNGs', async () => {
  const { manifest } = await covenantManifestV011(root);
  const previous = manifest.assets.filter(row => /\/alien-covenant-v01[12]\//.test(row.path));
  assert.equal(previous.length, 39);
  // Captured from the frozen V012 runtime using JSON.stringify (Python's
  // serializer preserves integral floats differently and has a separate pin).
  assert.equal(digest(Buffer.from(JSON.stringify(previous))),
    'c9aca346c879d606f2469d7117c66ef5425d6c82e9ebb63c596484e8a57152ed');
  const originals = new Set();
  for (const path of [COVENANT_PROVENANCE_V011, COVENANT_PROVENANCE_V012]) {
    const source = JSON.parse(await readFile(join(root, path), 'utf8'));
    for (const row of source.assets) {
      assert.equal(originals.has(row.path), false);
      originals.add(row.path);
      const bytes = await readFile(join(root, row.path));
      assert.equal(digest(bytes), row.sha256 || row.alphaQA?.sha256, 'Changed original PNG: ' + row.id);
      assert.equal(bytes.length, row.bytes, 'Changed original size: ' + row.id);
    }
  }
  assert.equal(originals.size, 61);
});

test('four unchanged player walk cycles follow the real costume scopes without including crawling or NPCs', async () => {
  const { manifest, compiled } = await covenantManifestV011(root);
  const data = require('../modules/covenant/dlc/covenant/content.js');
  const { appearance } = require('../modules/covenant/dlc/covenant/fidelity.js');
  assert.equal(manifest.release, '0.17.0');
  const playerCycles = compiled.cycles.filter(row => row.consumer !== 'npc');
  assert.deepEqual(playerCycles.map(row => row.key).sort(),
    ['daniels', 'daniels-eva', 'daniels-work', 'david-young']);
  for (const cycle of playerCycles) {
    const expected = data.rooms.filter(room => !room.crawl && appearance({room, data, actorDefs: new Map()}, {}, 'daniels').id === cycle.key)
      .map(room => room.id).sort();
    assert.deepEqual(cycle.rooms.slice().sort(), expected, cycle.key);
    assert.equal(cycle.frames.length, 8);
    const scales = cycle.frames.map(frame => frame.logicalHeight / (frame.alphaBounds[3] - frame.alphaBounds[1]));
    for (const frame of cycle.frames) {
      assert.equal(frame.anchor[1], frame.alphaBounds[3], 'Ground line uses the reviewed visible foot support');
      assert.ok(Math.abs(frame.logicalHeight / (frame.alphaBounds[3] - frame.alphaBounds[1]) - scales[0]) < 1e-10,
        'One constant image scale must preserve walking body motion: ' + frame.id);
    }
    for (const room of data.rooms) {
      const resolved = compiled.resolve('human', cycle.key, 'walk', room.id, .2);
      assert.equal(!!resolved, expected.includes(room.id), cycle.key + ' in ' + room.id);
    }
  }
  assert.equal(playerCycles.reduce((sum, cycle) => sum + cycle.rooms.length, 0), 54);
  assert.deepEqual(compiled.cycles.find(row => row.key === 'david-young').rooms, ['whiteroom']);
  for (const room of data.rooms.filter(room => room.crawl)) {
    assert.equal(compiled.resolve('human', 'daniels', 'walk', room.id, .2), null);
  }
});

test('V014 preserves every V013 binding, all four cycle definitions and all 85 earlier original PNGs', async () => {
  const { manifest } = await covenantManifestV011(root);
  const previous = manifest.assets.filter(row => /\/alien-covenant-v01[123]\//.test(row.path));
  assert.equal(previous.length, 63);
  assert.equal(digest(Buffer.from(JSON.stringify(previous))),
    'decaecb86b188ab40f117eecd91906cabe6095791e7dc8129d467e200050578e');
  const cycles = manifest.cycles.filter(row => row.consumer !== 'npc');
  assert.equal(cycles.length, 4);
  assert.equal(digest(Buffer.from(JSON.stringify(cycles))),
    'd16982f1ab4858f97f86dc1a6377e689ae6d21dac5e26c7a4eb52c30338d972a');
  const originals = new Set();
  for (const path of [COVENANT_PROVENANCE_V011, COVENANT_PROVENANCE_V012, COVENANT_PROVENANCE_V013]) {
    const source = JSON.parse(await readFile(join(root, path), 'utf8'));
    for (const row of source.assets) {
      assert.equal(originals.has(row.path), false); originals.add(row.path);
      const bytes = await readFile(join(root, row.path));
      assert.equal(digest(bytes), row.sha256 || row.alphaQA?.sha256, 'Changed original PNG: ' + row.id);
      assert.equal(bytes.length, row.bytes, 'Changed original size: ' + row.id);
    }
  }
  assert.equal(originals.size, 85);
});

test('V014 extends rendering with only the actual unarmed cryo Walter and the landing sky', async () => {
  const { manifest } = await covenantManifestV011(root);
  const { compileManifest } = require('../modules/covenant/dlc/covenant/sprite-registry-v011.js');
  // Recompile the frozen V014 subset to retain its original 72-image/five-cycle
  // contract while the cumulative V017 release adds separately reviewed scopes.
  const compiled = compileManifest({ ...manifest, release: '0.14.0',
    assets: manifest.assets.filter(row => /\/alien-covenant-v01[1234]\//.test(row.path)),
    cycles: manifest.cycles.filter(row => row.key !== 'upworth') });
  const data = require('../modules/covenant/dlc/covenant/content.js');
  const { appearance } = require('../modules/covenant/dlc/covenant/fidelity.js');
  const actorDefs = new Map(data.actors.map(actor => [actor.id, actor]));
  const npc = compiled.cycles.filter(cycle => cycle.consumer === 'npc');
  assert.equal(compiled.entries.length, 72); assert.equal(compiled.cycles.length, 5);
  assert.equal(npc.length, 1); assert.equal(npc[0].id, 'walter-walk');
  assert.deepEqual(npc[0].rooms, ['cryo']); assert.deepEqual(npc[0].actors, ['walter-cryo']);
  assert.equal(npc[0].frames.length, 8);
  const scales = npc[0].frames.map(frame => frame.logicalHeight / (frame.alphaBounds[3] - frame.alphaBounds[1]));
  for (const frame of npc[0].frames) {
    assert.equal(frame.anchor[1], frame.alphaBounds[3]);
    assert.ok(Math.abs(frame.logicalHeight / (frame.alphaBounds[3] - frame.alphaBounds[1]) - scales[0]) < 1e-10);
  }
  for (const actor of data.actors) {
    const room = data.rooms.find(row => row.id === actor.room);
    const profile = appearance({ data, room, actorDefs }, actor, actor.role);
    const resolved = compiled.resolve('human', profile.id, 'walk', room.id, .1, actor.id);
    assert.equal(!!resolved, actor.id === 'walter-cryo', actor.id);
    if (resolved) {
      assert.equal(profile.id, 'walter'); assert.equal(profile.gun, undefined);
      assert.equal(actor.speed, 26);
      assert.deepEqual(actor.route, [{ x: 450, z: .5 }, { x: 535, z: .5 }]);
    }
  }
  const backgrounds = compiled.entries.filter(row => row.kind === 'background');
  assert.equal(backgrounds.length, 1);
  const background = backgrounds[0];
  assert.equal(background.id, 'background-planet4-lake');
  assert.equal(background.imagePolicy, 'opaque-background'); assert.equal(background.renderLayer, 'sky');
  assert.equal(background.backgroundFit, 'cover-bottom');
  assert.equal(background.logicalHeight, 555);
  for (const room of data.rooms) {
    assert.equal(!!compiled.resolve('background', 'landing', 'idle', room.id), room.id === 'landing');
  }
});


test('V015 preservation keeps exactly 22 recovered original PNGs in source and no V015 path in distribution', async () => {
  const path = COVENANT_SOURCE_ONLY_PROVENANCE_V015;
  const bytes = await readFile(join(root, path));
  assert.equal(reviewedCovenantSourceMetadataV011(path, bytes), true);
  const source = JSON.parse(bytes.toString('utf8'));
  assert.equal(source.schemaVersion, 1);
  assert.equal(source.version, '0.15.0');
  const expectedIds = [
    ...['ricks', 'oram'].flatMap(key => Array.from({ length: 8 }, (_, index) => key + '-walk-' + String(index + 1).padStart(2, '0'))),
    'prop-seat-covenant-bridge', 'prop-seat-lander', 'prop-holotable-covenant-bridge',
    'prop-medbay-table', 'prop-console-covenant-bridge', 'prop-console-lander-main'
  ];
  assert.equal(source.assets.length, 22);
  assert.deepEqual(source.cycles, [], 'No V015 animation cycle is admitted into the served runtime');
  assert.deepEqual(source.catalogueCycles.map(row => row.id).sort(), ['oram-walk', 'ricks-walk']);
  for (const cycle of source.catalogueCycles) {
    assert.equal(cycle.consumer, 'catalogue-only');
    assert.equal(cycle.runtimeIntegrated, false);
    assert.deepEqual(cycle.frames,
      Array.from({ length: 8 }, (_, index) => cycle.id + '-' + String(index + 1).padStart(2, '0')));
  }
  assert.deepEqual(source.assets.map(row => row.id).sort(), expectedIds.sort());
  assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015, { directory: true }), true);
  assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015, { directory: true, built: true }), false);
  assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/unknown.png'), false);
  assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/unknown.png', { built: true }), false);
  for (const id of ['walter-walk-01', 'daniels-walk-01']) {
    assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/' + id + '.png'), false);
    assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/' + id + '.png', { built: true }), false);
  }
  assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/nested', { directory: true }), false);
  assert.equal(admit(COVENANT_SOURCE_ONLY_ASSETS_V015 + '/../outside.png'), false);
  assert.equal(admit(path, { built: false }), true);
  assert.equal(admit(path, { built: true }), false);
  for (const row of source.assets) {
    assert.equal(row.path, COVENANT_SOURCE_ONLY_ASSETS_V015 + '/' + row.id + '.png');
    assert.equal(row.verified1to1, false);
    assert.equal(row.runtimeAdmission, 'catalogue-only');
    const original = await readFile(join(root, row.path));
    assert.equal(original.length, row.bytes, 'Changed source-only size: ' + row.id);
    assert.equal(digest(original), row.sha256, 'Changed source-only bytes: ' + row.id);
    assert.equal(original.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Not PNG: ' + row.id);
    assert.equal(original.readUInt32BE(16), row.width, 'Changed native width: ' + row.id);
    assert.equal(original.readUInt32BE(20), row.height, 'Changed native height: ' + row.id);
    assert.equal(admit(row.path, { built: false }), true);
    assert.equal(admit(row.path, { built: true }), false);
  }
  const { manifest, compiled } = await covenantManifestV011(root);
  assert.equal(manifest.release, '0.17.0', 'The cumulative release must identify its actual runtime');
  assert.equal(compiled.entries.length, 81);
  assert.equal(compiled.cycles.length, 6);
  assert.equal(compiled.entries.some(row => row.path.startsWith('/' + COVENANT_SOURCE_ONLY_ASSETS_V015 + '/')), false);
  assert.equal(COVENANT_ASSET_ROOTS.includes(COVENANT_SOURCE_ONLY_ASSETS_V015), false);
});

test('V017 adds only the native unarmed Upworth patrol and the exact non-solid shore rock', async () => {
  const { manifest, compiled } = await covenantManifestV011(root);
  const data = require('../modules/covenant/dlc/covenant/content.js');
  const { appearance } = require('../modules/covenant/dlc/covenant/fidelity.js');
  const actorDefs = new Map(data.actors.map(actor => [actor.id, actor]));
  assert.equal(manifest.release, '0.17.0');
  assert.equal(compiled.entries.length, 81); assert.equal(compiled.cycles.length, 6);
  const old = manifest.assets.filter(row => /\/alien-covenant-v01[1234]\//.test(row.path));
  assert.equal(old.length, 72);
  assert.equal(digest(Buffer.from(JSON.stringify(old))), 'caeb302977542137508ec28728ae78f34096a0c9074008f2fe1123ef47f053c9');
  assert.equal(digest(Buffer.from(JSON.stringify(manifest.cycles.filter(row => row.key !== 'upworth')))),
    '3a8b96d053d38e84dc8dd60aa211706769deba4364dde57106f75e58d3266226');
  const upworth = compiled.cycles.find(row => row.key === 'upworth');
  assert.equal(upworth.consumer, 'npc');
  assert.deepEqual(upworth.actors, ['upworth-comms']); assert.deepEqual(upworth.rooms, ['comms']);
  assert.equal(upworth.angularFrequency, 2.1); assert.equal(upworth.frames.length, 8);
  const scale = upworth.frames[0].logicalHeight / (upworth.frames[0].alphaBounds[3] - upworth.frames[0].alphaBounds[1]);
  for (const frame of upworth.frames) {
    assert.equal(frame.anchor[1], frame.alphaBounds[3]);
    assert.ok(Math.abs(frame.logicalHeight / (frame.alphaBounds[3] - frame.alphaBounds[1]) - scale) < 1e-10);
  }
  for (const actor of data.actors) {
    const room = data.rooms.find(row => row.id === actor.room);
    const profile = appearance({ data, room, actorDefs }, actor, actor.role);
    const resolved = compiled.resolve('human', profile.id, 'walk', room.id, .1, actor.id);
    assert.equal(!!resolved, ['walter-cryo', 'upworth-comms'].includes(actor.id), actor.id);
    if (actor.id === 'upworth-comms') {
      assert.equal(profile.id, 'upworth'); assert.equal(profile.gun, undefined);
      assert.equal(actor.speed, 22);
      assert.deepEqual(actor.route, [{ x: 1050, z: .5 }, { x: 1120, z: .5 }]);
    }
  }
  const shore = compiled.entries.filter(row => row.path.includes('/alien-covenant-v016/'));
  assert.equal(shore.length, 1); assert.equal(shore[0].id, 'world-planet4-shore-rock');
  assert.equal(shore[0].key, 'landing-light2'); assert.deepEqual(shore[0].rooms, ['landing']);
  const native = data.rooms.find(room => room.id === 'landing').props.find(row => row.id === 'landing-light2');
  assert.deepEqual(native, { id: 'landing-light2', kind: 'rock', x: 1750, z: .02, w: 110, h: 65, solid: false });
  for (const room of data.rooms) {
    assert.equal(!!compiled.resolve('prop', 'landing-light2', 'idle', room.id), room.id === 'landing');
    assert.equal(compiled.resolve('prop', 'rock', 'idle', room.id), null);
  }
  assert.equal(compiled.entries.filter(row => row.path.includes('/alien-covenant-v017/')).length, 8);
});

test('V015 source texts require exact reviewed bytes and stay outside the built runtime', async () => {
  for (const path of [COVENANT_SOURCE_ONLY_PROVENANCE_V015,
    'docs/covenant/BIBLE_COVENANT_V015.json', 'docs/covenant/BIBLE_COVENANT_V015.md',
    'docs/covenant/BIBLE_COVENANT_V015.html']) {
    const bytes = await readFile(join(root, path));
    assert.equal(covenantSourceMetadataPathV011(path), true);
    assert.equal(admit(path, { built: false }), true);
    assert.equal(admit(path, { built: true }), false);
    assert.equal(reviewedCovenantSourceMetadataV011(path, bytes), true);
    assert.equal(reviewedCovenantSourceMetadataV011(path, Buffer.concat([bytes, Buffer.from('\n')])), false);
    assert.equal(reviewedCovenantSourceMetadataV011(path, bytes, { built: true }), false);
    assert.equal(reviewedCovenantSourceMetadataV011(COVENANT_PROVENANCE_V014, bytes), false);
  }
  for (const path of ['docs/covenant/PROVENANCE_V015.json', 'docs/covenant/SPRITES_V015_STATUS.md']) {
    assert.equal(admit(path, { built: false }), true);
    assert.equal(admit(path, { built: true }), false);
  }
  assert.equal(admit('docs/covenant/BIBLE_COVENANT_V015.xlsx', { built: false }), false,
    'The unavailable workbook is not part of this preservation release');
});
