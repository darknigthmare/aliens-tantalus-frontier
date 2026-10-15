import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_PROP_ATLAS_V136, getHubPropAtlasCellV136 } from '../src/hub-prop-atlas-v136.js';

const atlas = HUB_PROP_ATLAS_V136;
const png = auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`, import.meta.url)));

test('the original prop image has the admitted bytes, real alpha and six isolated source modules', () => {
  assert.equal(png.sha256, atlas.sha256);
  assert.equal(png.width, atlas.width); assert.equal(png.height, atlas.height);
  assert.ok(png.transparentPixels > png.width * png.height * .5);
  for (const [x, y] of [[0,0], [1535,0], [0,1023], [1535,1023]]) assert.ok(png.pixelAlpha(x,y) <= 1);
  const crops = Object.values(atlas.cells).map(entry => entry.source), counts = crops.map(() => 0);
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    if (png.pixelAlpha(x,y) <= 32) continue;
    const indices = crops.flatMap((c,i) => x >= c.x && x < c.x+c.w && y >= c.y && y < c.y+c.h ? [i] : []);
    assert.equal(indices.length, 1, `Clipped module or overlapping crop at ${x},${y}`);
    counts[indices[0]]++;
  }
  for (const count of counts) assert.ok(count > 40000);
});

test('all furnishings preserve native proportions at modest human scale without granting an interaction', () => {
  for (const [id, entry] of Object.entries(atlas.cells)) {
    assert.equal(getHubPropAtlasCellV136(id), entry);
    assert.ok(entry.width >= 40 && entry.width <= 96.5);
    assert.ok(entry.height > 20 && entry.height < 96.5);
    assert.ok(Math.abs(entry.width / entry.height - entry.source.w / entry.source.h) < 1e-12);
    assert.equal(entry.collidable, false); assert.equal(entry.interactive, false);
  }
  assert.equal(getHubPropAtlasCellV136('unknown'), null);
  assert.equal(getHubPropAtlasCellV136('__proto__'), null);
});
