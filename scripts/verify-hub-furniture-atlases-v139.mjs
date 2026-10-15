import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_FURNITURE_ATLAS_V139 as furniture, getHubFurnitureCellV139 } from '../src/hub-furniture-atlas-v139.js';
import { HUB_SURFACE_DETAILS_ATLAS_V139 as details } from '../src/hub-surface-details-atlas-v139.js';

// Validate original pixels rather than assuming that the crop bottom is a
// physical foot. No image conversion or alpha rewrite is permitted here.
for (const atlas of [furniture, details]) {
  test(`${atlas.asset}: original alpha, isolated crops and measured opaque feet`, () => {
    const png = auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`, import.meta.url)));
    assert.equal(png.sha256, atlas.sha256);
    assert.equal(png.width, atlas.width); assert.equal(png.height, atlas.height);
    assert.ok(png.transparentPixels > png.width * png.height * .25);
    assert.equal(png.pixelAlpha(0, 0), 0);
    const cells = Object.values(atlas.cells);
    for (let index = 0; index < cells.length; index++) {
      const cell = cells[index], c = cell.source;
      assert.ok([c.x, c.y, c.w, c.h].every(Number.isInteger));
      assert.ok(c.x >= 0 && c.y >= 0 && c.w > 0 && c.h > 0 && c.x + c.w <= png.width && c.y + c.h <= png.height);
      assert.ok(Math.abs(cell.width / cell.height - c.w / c.h) < 1e-12, `${cell.id}: isotropic rendering`);
      assert.equal(cell.interactive, false); assert.equal(cell.collidable, false);
      let lastOpaqueRow = -1, opaqueCount = 0;
      for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) {
        if (png.pixelAlpha(c.x + x, c.y + y) >= 192) { lastOpaqueRow = y; opaqueCount++; }
      }
      assert.ok(opaqueCount > 1000, `${cell.id}: real opaque silhouette`);
      // A pixel occupies [row,row+1): the contact is its lower edge.
      assert.equal(lastOpaqueRow + 1, cell.footSourceY, `${cell.id}: opaque foot must meet the support plane`);
      assert.ok(cell.footSourceY < c.h - 1, `${cell.id}: retain transparent padding without treating it as a foot`);
      for (const other of cells.slice(0, index).map(value => value.source)) {
        assert.ok(!(c.x < other.x + other.w && c.x + c.w > other.x && c.y < other.y + other.h && c.y + c.h > other.y));
      }
      for (const s of [cell.usefulSurfaceSource, ...(cell.occupiedSource || [])].filter(Boolean)) {
        assert.ok(s.x >= 0 && s.y >= 0 && s.w > 0 && s.h > 0 && s.x + s.w <= c.w && s.y + s.h <= c.h, `${cell.id}: measured surface/obstruction inside crop`);
      }
    }
    if (atlas === details) {
      assert.ok(cells.every(cell => cell.projection === 'strict-side-elevation'));
      // The generated items do not follow mathematical tile boundaries. Check
      // the actual source gutters so a crop cannot borrow the next object's
      // silhouette or clip its own tray/handles at a nominal column boundary.
      for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
        if (png.pixelAlpha(x, y) < 32) continue;
        assert.equal(cells.filter(({ source: c }) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h).length, 1,
          `Unisolated frontal detail at ${x},${y}`);
      }
    }
  });
}

test('unreviewed oblique furniture cannot enter the renderer through an atlas lookup', () => {
  assert.equal(Object.keys(furniture.cells).length, 6);
  assert.equal(Object.keys(details.cells).length, 12);
  for (const id of furniture.unadmittedViews) assert.equal(getHubFurnitureCellV139(id), null);
  assert.equal(getHubFurnitureCellV139('__proto__'), null);
  assert.equal(getHubFurnitureCellV139('unknown'), null);
  assert.ok(Object.values(furniture.cells).every(cell => cell.projection === 'strict-side-elevation'));
});
