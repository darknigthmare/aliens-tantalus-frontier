import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { V52_NPC_SPRITE_VISUALS } from '../src/v50-visuals.js';
import { VISUAL_ASSETS, NEW_SPRITE_SHEETS, NEW_SPRITE_FRAME_COUNT } from '../src/visuals.js';

test('the OpenAI sprite production waves cover every visual family through v52', async () => {
  assert.equal(NEW_SPRITE_SHEETS.length, 36);
  assert.equal(NEW_SPRITE_FRAME_COUNT, 576);
  assert.equal(V52_NPC_SPRITE_VISUALS.length, 9);
  assert.equal(new Set(VISUAL_ASSETS.map((asset) => asset.file)).size, VISUAL_ASSETS.length);
  assert.equal(new Set(V52_NPC_SPRITE_VISUALS.map((asset) => asset.id)).size, 9);

  const manifest = JSON.parse(await readFile('assets/openai/sprites/manifest.json', 'utf8'));
  const v52ManifestFiles = manifest.sheets
    .filter((sheet) => sheet.wave === 'v52')
    .map((sheet) => sheet.files.normalized)
    .sort();
  assert.deepEqual(
    V52_NPC_SPRITE_VISUALS.map((asset) => asset.file).sort(),
    v52ManifestFiles,
    'the v52 gallery registry must expose every newly normalized NPC sheet'
  );

  for (const asset of VISUAL_ASSETS) await access(asset.file.replace(/^\//, ''));
  for (const sheet of NEW_SPRITE_SHEETS) {
    assert.equal(sheet.grid, '4×4');
    assert.equal(sheet.frames, 16);
    assert.equal(sheet.provider, 'OpenAI ImageGen');
  }
  for (const sheet of V52_NPC_SPRITE_VISUALS) {
    assert.equal(sheet.wave, 'v52');
    assert.equal(sheet.family, 'npc');
  }
});

test('postulate parity audit distinguishes preservation from production depth', async () => {
  const audit = await readFile('docs/POSTULATE_PARITY_AUDIT.md', 'utf8');
  assert.match(audit, /27 axes sont tous suivis/i);
  assert.match(audit, /4 verrouillés, 14 systémiques et 9 partiels/i);
  assert.match(audit, /436 niveaux réellement distincts/i);
});

test('normalized sprite report validates all 16 cells when present', async () => {
  try {
    const report = JSON.parse(await readFile('assets/openai/sprite-normalization-report.json', 'utf8'));
    assert.equal(report.reports.length, 9);
    for (const sheet of report.reports) {
      assert.equal(sheet.width, 1024);
      assert.equal(sheet.height, 1024);
      assert.equal(sheet.occupiedCells, 16);
      assert.equal(sheet.distinctCellHashes, 16);
      assert.equal(sheet.hiddenRgb, 0);
      assert.equal(sheet.guardViolations, 0);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
});
