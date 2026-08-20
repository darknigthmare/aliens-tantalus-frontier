import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { VISUAL_ASSETS, NEW_SPRITE_SHEETS, NEW_SPRITE_FRAME_COUNT } from '../src/visuals.js';

test('the OpenAI sprite production waves cover every runtime family', async () => {
  assert.equal(NEW_SPRITE_SHEETS.length, 27);
  assert.equal(NEW_SPRITE_FRAME_COUNT, 432);
  assert.equal(new Set(VISUAL_ASSETS.map((asset) => asset.file)).size, VISUAL_ASSETS.length);
  for (const asset of VISUAL_ASSETS) await access(asset.file.replace(/^\//, ''));
  for (const sheet of NEW_SPRITE_SHEETS) {
    assert.equal(sheet.grid, '4×4');
    assert.equal(sheet.frames, 16);
    assert.equal(sheet.provider, 'OpenAI ImageGen');
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
