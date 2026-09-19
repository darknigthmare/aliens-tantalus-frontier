import test from 'node:test';
import assert from 'node:assert/strict';
import { DROPSHIP_HANGAR_ART_V55, HUB_ART_LEVEL_V55 } from '../src/hub-art-runtime-v55.js';
import { HubGame, HUB_WORLD } from '../src/hub-game.js';

const foreground = DROPSHIP_HANGAR_ART_V55.foreground;

test('hangar foreground begins at the exact human floor, not across actors or the carried crate', () => {
  assert.equal(foreground.renderBounds.y, HUB_WORLD.floorY);
  assert.equal(foreground.renderBounds.y, HUB_ART_LEVEL_V55.floorY);
  assert.equal(foreground.renderBounds.y + foreground.renderBounds.h, HUB_ART_LEVEL_V55.height);
  assert.equal(foreground.renderBounds.h, 96);
  assert.equal(foreground.phase, 'front');
  assert.equal(foreground.collidable, false);
  assert.equal('collisionBounds' in foreground, false);
});

test('the original bitmap is cropped without flattening its vertical scale', () => {
  assert.equal(foreground.sourceCrop.y, 600);
  assert.equal(foreground.sourceCrop.x, 12);
  assert.equal(foreground.sourceCrop.w, 1747);
  assert.ok(Math.abs(foreground.renderBounds.h / foreground.sourceCrop.h - 172 / 240) < 1e-12);
  assert.ok(foreground.sourceCrop.y + foreground.sourceCrop.h <= foreground.sourceSize.height);
  assert.ok(foreground.sourceCrop.x + foreground.sourceCrop.w <= foreground.sourceSize.width);
  assert.equal(foreground.asset, '/assets/openai/hub/layers/engineering-hangar-foreground.png');
});

test('the real hangar front renderer submits no bitmap pixels above the walking line', () => {
  const draws = [], image = { complete: true, naturalWidth: 1774, naturalHeight: 887 };
  const ctx = { save() {}, restore() {}, beginPath() {}, rect() {}, clip() {}, drawImage(...args) { draws.push(args); } };
  const hub = { hubArtImages: new Map([[foreground.asset, image]]) };
  HubGame.prototype.drawModularHangar.call(hub, ctx, { xStart: 1280 }, 'front');
  assert.equal(draws.length, 1);
  const [bitmap, sx, sy, sw, sh, x, y, w, h] = draws[0];
  assert.equal(bitmap, image);
  assert.deepEqual([sx, sy, sw, sh], Object.values(foreground.sourceCrop));
  assert.deepEqual([x, y, w, h], [1280, HUB_WORLD.floorY, 1280, 96]);
});
