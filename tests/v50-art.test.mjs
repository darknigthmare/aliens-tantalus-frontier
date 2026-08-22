import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const spriteRoot = resolve(repoRoot, 'assets/openai/sprites');
const manifestPath = resolve(spriteRoot, 'manifest.json');
const reportPath = resolve(repoRoot, 'assets/openai/v50-art-normalization-report.json');

const [manifest, report, gameSource, hubSource, gallerySource, spriteRuntimeSource, gameV52Source, hubV52Source] = await Promise.all([
  readFile(manifestPath, 'utf8').then(JSON.parse),
  readFile(reportPath, 'utf8').then(JSON.parse),
  readFile(resolve(repoRoot, 'src/game.js'), 'utf8'),
  readFile(resolve(repoRoot, 'src/hub-game.js'), 'utf8'),
  readFile(resolve(repoRoot, 'src/v50-visuals.js'), 'utf8'),
  readFile(resolve(repoRoot, 'src/sprite-animation-runtime.js'), 'utf8'),
  readFile(resolve(repoRoot, 'src/game-v52-runtime.js'), 'utf8'),
  readFile(resolve(repoRoot, 'src/hub-v52-runtime.js'), 'utf8')
]);

const runtimeSources = new Map([
  ['src/game.js', gameSource],
  ['src/hub-game.js', hubSource],
  ['src/sprite-animation-runtime.js', spriteRuntimeSource],
  ['src/game-v52-runtime.js', gameV52Source],
  ['src/hub-v52-runtime.js', hubV52Source]
]);

const gallerySources = new Map([
  ['src/v50-visuals.js', gallerySource]
]);

const toRepoPath = (publicPath) => publicPath.replace(/^\//, '');
const toPublicPath = (repoPath) => `/${repoPath.replaceAll('\\', '/')}`;
const absoluteFromPublic = (publicPath) => resolve(repoRoot, toRepoPath(publicPath));

async function listPngFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listPngFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.png')) files.push(fullPath);
  }
  return files;
}

function repoPathFromAbsolute(file) {
  return relative(repoRoot, file).split(sep).join('/');
}

test('the shared sprite manifest covers every raw and normalized 4x4 sheet through v52', async () => {
  assert.equal(manifest.release, 'v52');
  assert.equal(manifest.normalization.status, 'ready');
  assert.equal(manifest.normalization.rawMastersPreserved, true);
  assert.equal(manifest.sheets.length, 27);
  assert.equal(new Set(manifest.sheets.map((sheet) => sheet.id)).size, manifest.sheets.length);

  const v52NpcSheets = manifest.sheets.filter((sheet) => sheet.wave === 'v52');
  assert.equal(v52NpcSheets.length, 9);
  for (const sheet of v52NpcSheets) {
    assert.equal(sheet.family, 'npc', `${sheet.id}: v52 family`);
    assert.equal(sheet.provenance.provider, 'OpenAI ImageGen', `${sheet.id}: provenance provider`);
    assert.match(sheet.provenance.sourceAsset, /^[A-Z]:.+\.png$/i, `${sheet.id}: ImageGen source path`);
    await access(absoluteFromPublic(sheet.provenance.promptDocument));
    assert.deepEqual(sheet.runtime, {
      status: 'referenced',
      consumers: [
        'src/sprite-animation-runtime.js',
        'src/game-v52-runtime.js',
        'src/hub-v52-runtime.js',
        'src/v50-visuals.js'
      ]
    }, `${sheet.id}: v52 runtime and gallery consumers`);
  }
  assert.ok(v52NpcSheets.some((sheet) => sheet.id === 'npc.leila-s-rensen.locomotion'), 'Leila id mirrors the runtime slug');

  const allPngs = await listPngFiles(spriteRoot);
  const rawFiles = allPngs
    .map(repoPathFromAbsolute)
    .filter((file) => !file.includes('/normalized/'))
    .sort();
  const normalizedFiles = allPngs
    .map(repoPathFromAbsolute)
    .filter((file) => file.includes('/normalized/'))
    .sort();

  assert.deepEqual(
    manifest.sheets.map((sheet) => toRepoPath(sheet.files.raw)).sort(),
    rawFiles,
    'every raw sprite master must have exactly one manifest entry'
  );
  assert.deepEqual(
    manifest.sheets.map((sheet) => toRepoPath(sheet.files.normalized)).sort(),
    normalizedFiles,
    'every manifest sheet must have one normalized derivative'
  );

  const grid = manifest.contracts.grids['v50-4x4'];
  assert.deepEqual(grid, {
    columns: 4,
    rows: 4,
    cellWidth: 256,
    cellHeight: 256,
    guard: 16,
    frameOrder: 'row-major'
  });

  for (const sheet of manifest.sheets) {
    assert.equal(sheet.grid, 'v50-4x4', `${sheet.id}: grid contract`);
    assert.equal(sheet.files.normalizedStatus, 'ready', `${sheet.id}: normalized status`);
    assert.ok(['left', 'right'].includes(sheet.sourceFacing), `${sheet.id}: explicit source orientation`);
    assert.equal(sheet.sourceFacing, sheet.id === 'enemy.xenomorph-drone.combat' ? 'left' : 'right', `${sheet.id}: audited source orientation`);
    assert.equal(typeof sheet.identityVerified, 'boolean', `${sheet.id}: identity verification flag`);
    assert.equal(sheet.identityVerified, sheet.id !== 'player.echo9-marine.combat', `${sheet.id}: combat identity quarantine`);
    assert.ok(manifest.contracts.pivots[sheet.pivot], `${sheet.id}: missing pivot ${sheet.pivot}`);
    assert.ok(manifest.contracts.hitboxes[sheet.hitbox], `${sheet.id}: missing hitbox ${sheet.hitbox}`);
    assert.ok(manifest.clipSets[sheet.clips], `${sheet.id}: missing clips ${sheet.clips}`);

    for (const publicPath of [sheet.files.raw, sheet.files.normalized]) {
      await access(absoluteFromPublic(publicPath));
      assert.ok((await stat(absoluteFromPublic(publicPath))).size > 0, `${sheet.id}: empty ${publicPath}`);
    }

    const pivot = manifest.contracts.pivots[sheet.pivot];
    assert.ok(pivot.x >= 0 && pivot.x < grid.cellWidth, `${sheet.id}: pivot x`);
    assert.ok(pivot.y >= 0 && pivot.y < grid.cellHeight, `${sheet.id}: pivot y`);

    const hitbox = manifest.contracts.hitboxes[sheet.hitbox];
    assert.ok(hitbox.x >= 0 && hitbox.y >= 0, `${sheet.id}: hitbox origin`);
    assert.ok(hitbox.width > 0 && hitbox.height > 0, `${sheet.id}: hitbox dimensions`);
    assert.ok(hitbox.x + hitbox.width <= grid.cellWidth, `${sheet.id}: hitbox width overflow`);
    assert.ok(hitbox.y + hitbox.height <= grid.cellHeight, `${sheet.id}: hitbox height overflow`);

    const clips = manifest.clipSets[sheet.clips];
    const coveredFrames = clips.flatMap((clip) => clip.frames).sort((a, b) => a - b);
    assert.deepEqual(coveredFrames, Array.from({ length: 16 }, (_, frame) => frame), `${sheet.id}: clip coverage`);
    for (const clip of clips) {
      assert.ok(clip.row >= 0 && clip.row < 4, `${sheet.id}/${clip.id}: row`);
      assert.ok(clip.fps > 0, `${sheet.id}/${clip.id}: fps`);
      assert.equal(typeof clip.loop, 'boolean', `${sheet.id}/${clip.id}: loop flag`);
      assert.ok(Array.isArray(clip.events) && clip.events.length > 0, `${sheet.id}/${clip.id}: events`);
      for (const frame of clip.frames) assert.equal(Math.floor(frame / 4), clip.row, `${sheet.id}/${clip.id}: frame ${frame} row`);
      for (const event of clip.events) {
        assert.ok(clip.frames.includes(event.frame), `${sheet.id}/${clip.id}: event frame ${event.frame}`);
        assert.match(event.type, /^[a-z]+:[a-z0-9-]+$/, `${sheet.id}/${clip.id}: event type`);
      }
    }
  }
});

test('the shared normalization report certifies 27 RGBA atlases and 432 guarded cells', async () => {
  assert.equal(report.release, 'v52');
  assert.equal(report.spriteAtlasCount, 27);
  assert.equal(report.spriteCellCount, 432);
  assert.deepEqual(report.grid, { columns: 4, rows: 4, cellSize: 256, guard: 16 });
  assert.equal(report.rawMastersPreserved, true);
  assert.equal(report.spriteAtlases.length, manifest.sheets.length);

  const reportByFile = new Map(report.spriteAtlases.map((entry) => [toPublicPath(entry.file), entry]));
  assert.equal(reportByFile.size, manifest.sheets.length, 'normalization report paths must be unique');

  for (const sheet of manifest.sheets) {
    const entry = reportByFile.get(sheet.files.normalized);
    assert.ok(entry, `${sheet.id}: normalized file absent from report`);
    assert.deepEqual(entry.size, [1024, 1024], `${sheet.id}: normalized size`);
    assert.equal(entry.mode, 'RGBA', `${sheet.id}: normalized mode`);
    assert.equal(entry.guardViolations, 0, `${sheet.id}: transparent 16px guard`);
    assert.ok(entry.occupiedPixels > 0, `${sheet.id}: empty normalized atlas`);
    assert.equal(entry.cells.length, 16, `${sheet.id}: report cell count`);
    assert.deepEqual(entry.cells.map((cell) => cell.cell), Array.from({ length: 16 }, (_, cell) => cell), `${sheet.id}: report cell indexes`);
  }
});

test('all sprite sheets expose a truthful runtime registry and declared consumers', () => {
  const referenced = manifest.sheets.filter((sheet) => sheet.runtime.status === 'referenced');
  const galleryOnly = manifest.sheets.filter((sheet) => sheet.runtime.status === 'gallery-only');
  const notReferenced = manifest.sheets.filter((sheet) => sheet.runtime.status === 'not-referenced');

  assert.ok(referenced.some((sheet) => sheet.family === 'player'), 'player sheet must be referenced');
  assert.ok(referenced.some((sheet) => sheet.id.startsWith('enemy.xenomorph-drone.')), 'xenomorph sheet must be referenced');
  assert.ok(referenced.some((sheet) => sheet.family === 'npc'), 'runtime NPC sheet must be referenced');
  assert.equal(referenced.length, 27, 'all normalized sheets are connected to the animation registry');
  assert.equal(galleryOnly.length, 0, 'no runtime NPC is mislabeled gallery-only');
  assert.equal(notReferenced.length, 0, 'all 27 normalized sheets must have an honest consumer');

  for (const sheet of manifest.sheets) {
    assert.equal(SPRITE_SHEETS[sheet.id]?.path, sheet.files.normalized, `${sheet.id}: normalized bitmap registered in runtime`);
    assert.ok(sheet.runtime.consumers.includes('src/sprite-animation-runtime.js'), `${sheet.id}: registry consumer declared`);
    assert.equal(new Set(sheet.runtime.consumers).size, sheet.runtime.consumers.length, `${sheet.id}: unique consumers`);
    for (const consumer of sheet.runtime.consumers) {
      const knownSource = runtimeSources.get(consumer) || gallerySources.get(consumer);
      assert.equal(typeof knownSource, 'string', `${sheet.id}: declared consumer ${consumer} exists`);
    }
  }
});
