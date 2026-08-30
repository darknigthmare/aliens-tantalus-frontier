import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { SPRITE_CLIP_SETS, SPRITE_HITBOXES, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import {
  V64_EXPECTED_ATLASES,
  V64_EXPECTED_CELLS,
  V64_SHEET_DEFINITIONS,
  V64_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV64,
  manifestCellCount,
  validateV64SpriteAssets
} from '../scripts/sync-sprite-manifest-v64.mjs';

const V64_MIN_FOREGROUND_PIXELS = 512;
const V64_MIN_CELL_DIMENSION = 16;
const V64_MIN_ROW_RELATIVE_AREA = 0.45;
const V64_MAX_ROW_RELATIVE_AREA = 1.65;
const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  return (sorted[1] + sorted[2]) / 2;
};

test('V64 ajoute trois plaques hybrides et porte le manifeste à 195 atlas / 2772 cellules', async () => {
  const source = JSON.parse(await readFile(V64_SPRITE_MANIFEST_PATH, 'utf8'));
  const manifest = buildSpriteManifestV64(source);
  assert.equal(manifest.release, 'v64');
  assert.deepEqual(manifest.normalization, {
    status: 'ready',
    report: '/docs/references/V64_PNG_ALPHA_AUDIT.json',
    rawMastersPreserved: true,
    sourceOfTruth: 'Normalized files listed by the V64 manifest are runtime-ready; the V64 PNG audit certifies their alpha and grid contracts.'
  });
  assert.equal(V64_EXPECTED_ATLASES, 195);
  assert.equal(V64_EXPECTED_CELLS, 2772);
  assert.equal(manifest.sheets.length, 195);
  assert.equal(manifestCellCount(manifest), 2772);
  assert.deepEqual(V64_SHEET_DEFINITIONS.map((sheet) => sheet.subject), ['Newborn', 'Offspring', 'Predalien']);
  for (const definition of V64_SHEET_DEFINITIONS) {
    assert.equal(SPRITE_SHEETS[definition.id].path, definition.files.normalized);
    assert.equal(definition.referenceStatus, 'CANON_REFERENCE');
    assert.equal(definition.sourceFacing, 'right');
    assert.ok(definition.referenceUrls.length > 0);
    assert.deepEqual(
      manifest.clipSets[definition.clips].map(({ id, frames, fps, loop, events }) => ({ id, frames, fps, loop, events })),
      SPRITE_CLIP_SETS[definition.clips]
    );
    assert.deepEqual(manifest.contracts.hitboxes[definition.hitbox], {
      ...SPRITE_HITBOXES[definition.hitbox],
      unit: 'cell-pixel'
    });
  }
  assert.deepEqual(await validateV64SpriteAssets(), { checked: 6, missing: [] });
  for (const definition of V64_SHEET_DEFINITIONS) {
    const slug = definition.subject.toLowerCase();
    const metadata = JSON.parse(await readFile(
      new URL(`../assets/openai/sprites/metadata/v64/${slug}-animation-v64.json`, import.meta.url),
      'utf8'
    ));
    assert.equal(metadata.validation.cells.length, 16, definition.subject + ': validation cell count');
    for (let row = 0; row < 4; row += 1) {
      const cells = metadata.validation.cells.slice(row * 4, row * 4 + 4);
      const rowMedian = median(cells.map((cell) => cell.foregroundPixels));
      for (const cell of cells) {
        const [left, top, right, bottom] = cell.alphaBounds;
        const ratio = cell.foregroundPixels / rowMedian;
        assert.ok(cell.foregroundPixels >= V64_MIN_FOREGROUND_PIXELS, definition.subject + `:${cell.index} foreground`);
        assert.ok(right - left >= V64_MIN_CELL_DIMENSION, definition.subject + `:${cell.index} width`);
        assert.ok(bottom - top >= V64_MIN_CELL_DIMENSION, definition.subject + `:${cell.index} height`);
        assert.ok(ratio >= V64_MIN_ROW_RELATIVE_AREA, definition.subject + `:${cell.index} row underflow`);
        assert.ok(ratio <= V64_MAX_ROW_RELATIVE_AREA, definition.subject + `:${cell.index} possible fused poses`);
      }
    }
  }
  assert.deepEqual(buildSpriteManifestV64(manifest), manifest);
});
