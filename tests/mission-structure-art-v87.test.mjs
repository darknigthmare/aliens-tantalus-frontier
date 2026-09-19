import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MISSION_STRUCTURE_CROPS_V87,
  drawTiledMissionCropV87,
  drawMissionLadderV87
} from '../src/mission-structure-art-v87.js';

const image = Object.freeze({ complete: true, naturalWidth: 256, naturalHeight: 256 });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
function recorder() {
  const calls = [];
  return { calls, drawImage(...args) { calls.push(args); } };
}

test('structure crops are immutable tight source rectangles, excluding atlas margins and detached bases', () => {
  const extents = {
    catwalkDeck: [40, 43, 228, 70], ladderLeft: [53, 4, 62, 172],
    ladderRight: [100, 4, 109, 172], ladderRung: [62, 36, 100, 40],
    pipeShaft: [49, 34, 99, 120], floorPanel: [4, 4, 214, 79]
  };
  assert.ok(Object.isFrozen(MISSION_STRUCTURE_CROPS_V87));
  assert.deepEqual(Object.keys(MISSION_STRUCTURE_CROPS_V87), Object.keys(extents));
  for (const [name, [x1, y1, x2, y2]] of Object.entries(extents)) {
    const crop = MISSION_STRUCTURE_CROPS_V87[name];
    assert.ok(Object.isFrozen(crop));
    assert.deepEqual(crop, { x: x1, y: y1, w: x2 - x1, h: y2 - y1 });
    assert.ok(crop.x >= 0 && crop.y >= 0 && crop.x + crop.w <= image.naturalWidth
      && crop.y + crop.h <= image.naturalHeight);
  }
});

for (const [name, crop] of Object.entries(MISSION_STRUCTURE_CROPS_V87)) {
  for (const axis of ['x', 'y']) {
    test(`${name}: ${axis}-axis repeats preserve scale and crop the last section exactly at the destination edge`, () => {
      const ctx = recorder();
      const scale = 1.5;
      const bounds = { x: -17, y: 23, w: crop.w * scale, h: crop.h * scale };
      bounds[axis === 'x' ? 'w' : 'h'] *= 2.25;
      assert.equal(drawTiledMissionCropV87(ctx, image, crop, bounds, { axis }), 3);
      assert.equal(ctx.calls.length, 3);
      let edge = axis === 'x' ? bounds.x : bounds.y;
      for (const args of ctx.calls) {
        assert.equal(args.length, 9);
        const [source, sx, sy, sw, sh, dx, dy, dw, dh] = args;
        assert.equal(source, image);
        assert.equal(sx, crop.x);
        assert.equal(sy, crop.y);
        assert.ok(sw > 0 && sh > 0 && sw <= crop.w && sh <= crop.h);
        close(dw / sw, scale);
        close(dh / sh, scale);
        close(axis === 'x' ? dx : dy, edge);
        close(axis === 'x' ? dy : dx, axis === 'x' ? bounds.y : bounds.x);
        edge += axis === 'x' ? dw : dh;
      }
      close(edge, axis === 'x' ? bounds.x + bounds.w : bounds.y + bounds.h);
      const last = ctx.calls.at(-1);
      close(axis === 'x' ? last[3] : last[4], (axis === 'x' ? crop.w : crop.h) / 4);
    });
  }
}

test('exact repeats do not add an empty terminal draw; default axis is horizontal', () => {
  const ctx = recorder();
  const crop = MISSION_STRUCTURE_CROPS_V87.catwalkDeck;
  assert.equal(drawTiledMissionCropV87(ctx, image, crop, { x: 0, y: 0, w: crop.w * 2, h: crop.h }), 2);
  assert.equal(ctx.calls.at(-1)[7], crop.w);
});

test('tiler rejects unready or invalid images, rectangles, contexts, and excessive repeat counts', () => {
  const crop = MISSION_STRUCTURE_CROPS_V87.catwalkDeck;
  const bounds = { x: 0, y: 0, w: 300, h: 27 };
  const ctx = recorder();
  for (const invalidImage of [null, {}, { ...image, complete: false }, { ...image, naturalWidth: 0 },
    { ...image, naturalHeight: NaN }, { ...image, naturalWidth: Infinity }, { ...image, naturalWidth: 100 }]) {
    assert.equal(drawTiledMissionCropV87(ctx, invalidImage, crop, bounds), 0);
  }
  for (const invalidCrop of [null, {}, { ...crop, x: -1 }, { ...crop, y: -1 }, { ...crop, w: 0 },
    { ...crop, h: Infinity }, { ...crop, x: 250 }, { ...crop, y: NaN }]) {
    assert.equal(drawTiledMissionCropV87(ctx, image, invalidCrop, bounds), 0);
  }
  for (const invalidBounds of [null, {}, { ...bounds, w: 0 }, { ...bounds, h: -1 }, { ...bounds, x: NaN },
    { ...bounds, y: Infinity }, { ...bounds, w: '30' }, { ...bounds, w: Number.MAX_VALUE },
    { ...bounds, h: Number.MIN_VALUE }, { ...bounds, x: Number.MAX_VALUE, w: Number.MAX_VALUE }]) {
    assert.equal(drawTiledMissionCropV87(ctx, image, crop, invalidBounds), 0);
  }
  assert.equal(drawTiledMissionCropV87(null, image, crop, bounds), 0);
  assert.equal(drawTiledMissionCropV87({}, image, crop, bounds), 0);
  assert.equal(drawTiledMissionCropV87(ctx, image, crop, bounds, { axis: 'z' }), 0);
  assert.equal(ctx.calls.length, 0);
});

for (const width of [18, 42, 52, 93]) {
  test(`ladder width ${width}: rails and rungs remain aligned at a common scale with empty openings`, () => {
    const ctx = recorder();
    const ladder = { x: 100, top: -10, bottom: 301, w: width };
    const count = drawMissionLadderV87(ctx, image, ladder);
    assert.equal(count, ctx.calls.length);
    assert.ok(count > 0);
    const scale = 7 / 9;
    const left = ladder.x - width / 2;
    const rungRows = new Set();
    const railEdges = new Map([[53, ladder.top], [100, ladder.top]]);
    for (const [source, sx, sy, sw, sh, dx, dy, dw, dh] of ctx.calls) {
      assert.equal(source, image);
      close(dw / sw, scale);
      close(dh / sh, scale);
      assert.ok(dx >= left && dx + dw <= left + width + 1e-8);
      assert.ok(dy >= ladder.top && dy + dh <= ladder.bottom + 1e-8);
      if (sx === 53 || sx === 100) {
        assert.equal(sy, 4);
        assert.equal(dw, 7);
        close(dx, sx === 53 ? left : left + width - 7);
        close(dy, railEdges.get(sx));
        railEdges.set(sx, dy + dh);
      } else {
        assert.equal(sx, 62);
        assert.equal(sy, 36);
        assert.ok(dx >= left + 7 && dx + dw <= left + width - 7 + 1e-8);
        assert.ok(dh <= 4 * scale);
        rungRows.add(dy);
      }
    }
    for (const edge of railEdges.values()) close(edge, ladder.bottom);
    const rows = [...rungRows];
    assert.equal(rows[0], ladder.top + 11);
    for (let index = 1; index < rows.length; index += 1) close(rows[index] - rows[index - 1], 22);
    // No draw paints the empty middle of a gap between rungs.
    const gap = { x: ladder.x, y: rows[0] + 10 };
    assert.ok(ctx.calls.every(([, , , , , dx, dy, dw, dh]) =>
      !(gap.x > dx && gap.x < dx + dw && gap.y > dy && gap.y < dy + dh)));
  });
}

test('a final partial rung is source-cropped without shrinking its scale or extending below the ladder', () => {
  const ctx = recorder();
  drawMissionLadderV87(ctx, image, { x: 80, top: 0, bottom: 100 });
  const last = ctx.calls.at(-1);
  assert.equal(last[6], 99);
  assert.equal(last[8], 1);
  close(last[4], 9 / 7);
  close(last[7] / last[3], 7 / 9);
  const rails = ctx.calls.filter(call => call[1] === 53 || call[1] === 100);
  assert.equal(rails[0][5], 59, 'missing width defaults to 42');
  assert.equal(rails[1][5] + rails[1][7], 101);
});

test('ladder rejects invalid geometry before drawing and guards huge finite inputs without looping', () => {
  const ctx = recorder();
  const ladder = { x: 10, top: 0, bottom: 100, w: 42 };
  for (const invalid of [null, {}, { ...ladder, x: NaN }, { ...ladder, top: Infinity },
    { ...ladder, bottom: 0 }, { ...ladder, bottom: -1 }, { ...ladder, w: 0 }, { ...ladder, w: 14 },
    { ...ladder, w: NaN }, { ...ladder, w: '42' }, { ...ladder, bottom: Number.MAX_VALUE },
    { ...ladder, w: Number.MAX_VALUE }, { ...ladder, top: -Number.MAX_VALUE, bottom: Number.MAX_VALUE }]) {
    assert.equal(drawMissionLadderV87(ctx, image, invalid), 0);
  }
  assert.equal(drawMissionLadderV87(ctx, { ...image, complete: false }, ladder), 0);
  assert.equal(drawMissionLadderV87(ctx, { ...image, naturalHeight: 100 }, ladder), 0);
  assert.equal(drawMissionLadderV87({}, image, ladder), 0);
  assert.equal(ctx.calls.length, 0);
});
