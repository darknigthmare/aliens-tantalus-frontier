import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_INTERIOR_WALL_ATLAS_V138 as atlas } from '../src/hub-interior-wall-atlas-v138.js';

test('six admitted wall faces use the original RGBA bytes and exclude transparent gutters at every sampled pixel', () => {
  const png = auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`, import.meta.url)));
  assert.equal(png.sha256, atlas.sha256);
  assert.equal(png.width, atlas.width); assert.equal(png.height, atlas.height);
  assert.ok(png.transparentPixels > png.width * png.height * .2);
  assert.equal(png.pixelAlpha(0, 0), 0);
  assert.equal(png.pixelAlpha(515, 500), 0);
  const sources = Object.values(atlas.cells).map(cell => cell.source);
  assert.equal(sources.length, 6);
  for (let index = 0; index < sources.length; index++) {
    const crop = sources[index];
    assert.ok([crop.x, crop.y, crop.w, crop.h].every(Number.isInteger));
    assert.ok(crop.x >= 0 && crop.y >= 0 && crop.x + crop.w <= png.width && crop.y + crop.h <= png.height);
    assert.ok(crop.h >= 380, 'An architectural wall band must not require upscaling.');
    for (let other = 0; other < index; other++) {
      const b = sources[other];
      assert.ok(!(crop.x < b.x + b.w && crop.x + crop.w > b.x && crop.y < b.y + b.h && crop.y + crop.h > b.y));
    }
    let minimumAlpha = 255, maximumAlpha = 0;
    for (let y = crop.y; y < crop.y + crop.h; y++) for (let x = crop.x; x < crop.x + crop.w; x++) {
      const alpha = png.pixelAlpha(x, y);
      minimumAlpha = Math.min(minimumAlpha, alpha); maximumAlpha = Math.max(maximumAlpha, alpha);
    }
    assert.ok(minimumAlpha >= 230, 'A crop may not sample a transparent gutter or a cut-out opening.');
    assert.ok(maximumAlpha < 255, 'The real source requires the renderer’s solid backing; it must not be assumed fully opaque.');
  }
});
