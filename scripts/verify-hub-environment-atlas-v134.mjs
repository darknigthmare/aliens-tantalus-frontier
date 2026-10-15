import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { HUB_ENVIRONMENT_ATLAS_V134, HUB_ENVIRONMENT_ROOM_THEMES_V134, getHubEnvironmentPanelV134 } from '../src/hub-environment-atlas-v134.js';
import { HUB_AUTHORED_COMPOSITIONS_V133 } from '../src/hub-authored-composition-v133.js';

const atlas = HUB_ENVIRONMENT_ATLAS_V134;
const png = auditWeaponPngV120(fileURLToPath(new URL(`..${atlas.asset}`, import.meta.url)));

test('the rear equipment atlas keeps its reviewed native RGBA pixels and transparent exterior', () => {
  assert.equal(png.sha256, atlas.sha256);
  assert.equal(png.width, atlas.width); assert.equal(png.height, atlas.height);
  assert.ok(png.transparentPixels > png.width * png.height * .25);
  for (const [x, y] of [[0, 0], [png.width - 1, 0], [0, png.height - 1], [png.width - 1, png.height - 1]])
    assert.equal(png.pixelAlpha(x, y), 0);
});

test('the four source crops retain every visible equipment pixel without neighboring panel bleed', () => {
  const crops = Object.values(atlas.panels).map(p => p.source);
  const coverage = crops.map(() => 0);
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    if (png.pixelAlpha(x, y) <= 32) continue;
    const found = crops.map((c, i) => x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h ? i : -1).filter(i => i >= 0);
    assert.equal(found.length, 1, `Visible pixel outside a single panel: ${x},${y}`);
    coverage[found[0]]++;
  }
  for (const count of coverage) assert.ok(count > 200000, 'Each panel must contain a complete equipment bay.');
});

test('reviewed historical equipment themes resolve their panels while unassigned rooms stay unadmitted', () => {
  assert.equal(Object.keys(HUB_ENVIRONMENT_ROOM_THEMES_V134).length, 29);
  for (const id of Object.keys(HUB_ENVIRONMENT_ROOM_THEMES_V134)) {
    assert.ok(HUB_AUTHORED_COMPOSITIONS_V133[id], id);
    const p = getHubEnvironmentPanelV134(id);
    assert.ok(p, id); assert.equal(p.plane, 'rear-equipment');
    assert.equal(p.collidable, false); assert.equal(p.interactive, false);
  }
  for (const id of Object.keys(HUB_AUTHORED_COMPOSITIONS_V133).filter(id => !Object.hasOwn(HUB_ENVIRONMENT_ROOM_THEMES_V134, id)))
    assert.equal(getHubEnvironmentPanelV134(id), null, `${id}: dedicated furnishings must not silently acquire a historical equipment bay`);
  assert.equal(getHubEnvironmentPanelV134('unknown'), null);
});
