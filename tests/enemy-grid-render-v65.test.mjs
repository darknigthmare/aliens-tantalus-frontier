import assert from 'node:assert/strict';
import test from 'node:test';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

test('le rendu V52 découpe les frames attaque/mort 16 à 31 dans une vraie grille 4x8', () => {
  const sheet = {
    ...resolveSpriteSheet('enemy.facehugger.locomotion'),
    columns: 4,
    rows: 8,
    cellWidth: 256,
    cellHeight: 256,
    clipSet: 'facehugger-action-v65'
  };
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 2048 };
  const engine = { images: new Map([[sheet.imageKey, image]]) };
  const draw = withV52MissionRuntime(class {}).prototype.drawSpriteSample;
  const calls = [];
  const ctx = {
    save() {}, restore() {}, translate() {}, scale() {},
    drawImage(...args) { calls.push(args); }
  };

  for (const facing of [1, -1]) {
    for (let frame = 16; frame < 32; frame += 1) {
      const column = frame % sheet.columns;
      const row = Math.floor(frame / sheet.columns);
      const actor = { x: 100, y: 200, w: 52, h: 36, facing };
      assert.equal(draw.call(engine, ctx, { sheet, column, row }, actor), true);
      const call = calls.at(-1);
      assert.equal(call[0], image);
      assert.deepEqual(call.slice(1, 5), [column * 256, row * 256, 256, 256], `frame ${frame}, facing ${facing}`);
      assert.ok(call[1] + call[3] <= image.naturalWidth);
      assert.ok(call[2] + call[4] <= image.naturalHeight);
      assert.ok(actor.spriteHitbox, 'le découpage reste lié au corps et au pivot physiques');
    }
  }
  assert.equal(calls.length, 32);
});
