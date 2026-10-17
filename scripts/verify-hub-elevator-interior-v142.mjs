import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { HUB_DECKS, HUB_WORLD, getHubDoorBounds } from '../src/hub-game.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { HUB_ELEVATOR_SOURCE_V142, getHubElevatorInteriorV142, drawHubElevatorDoorV142 } from '../src/hub-elevator-interior-v142.js';
import { withHubSpatialDesignV136 } from '../src/hub-spatial-design-v136.js';

const image = Object.freeze({ complete: true, naturalWidth: 187, naturalHeight: 191 });
const doors = HUB_DECKS.flatMap((_, index) => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, index).filter(door => door.lift));
function canvas() {
  const images = [], fills = [], clips = []; let depth = 0, path = [];
  const ctx = { save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    beginPath() { path = []; }, moveTo(...point) { path.push(point); }, lineTo(...point) { path.push(point); }, closePath() {},
    clip() { clips.push(path.map(point => [...point])); }, fillRect(...bounds) { fills.push({ bounds, color: ctx.fillStyle }); },
    drawImage(...args) { images.push(args); }, measureText: text => ({ width: text.length * 5 }), fillText() {} };
  return { ctx, images, fills, clips, balanced: () => assert.equal(depth, 0) };
}
const nativeBounds = door => { const h = 156; return { x: door.x - h * 187 / 191 / 2, y: 624 - h, w: h * 187 / 191, h }; };

test('the admitted local art is exactly the leaf-crop source; no new image is enlarged into a cabin', () => {
  const png = fs.readFileSync(new URL('../assets/openai/hub/props/lift-door.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), HUB_ELEVATOR_SOURCE_V142.width);
  assert.equal(png.readUInt32BE(20), HUB_ELEVATOR_SOURCE_V142.height);
  assert.equal(HUB_ELEVATOR_SOURCE_V142.texturePolicy, 'native-leaf-crop');
});

test('both shafts on all four decks use the same human-scale frontal cabin with their original floor anchor', () => {
  assert.equal(doors.length, 8); const sizes = new Set();
  for (const door of doors) {
    const b = nativeBounds(door), before = structuredClone(door), model = getHubElevatorInteriorV142(b, 1);
    sizes.add(`${model.target.w}:${model.target.h}`);
    assert.equal(model.target.y + model.target.h, 624); assert.equal(model.projection, 'frontal');
    assert.ok(model.opening.h > model.humanHeight); assert.ok(model.scale < 1);
    assert.equal(model.collidable, false); assert.equal(model.geometryPreserved, true);
    assert.deepEqual(door, before);
  }
  assert.equal(sizes.size, 1);
});

test('closed doors preserve the full original sprite and do not paint any interior or opaque surround', () => {
  const b = nativeBounds(doors[0]), subject = canvas();
  const model = drawHubElevatorDoorV142(subject.ctx, image, b, 0);
  assert.deepEqual(subject.images, [[image, b.x, b.y, b.w, b.h]]);
  assert.deepEqual(subject.fills, []); assert.deepEqual(subject.clips, []);
  assert.equal(model.visibleWidth, 0); subject.balanced();
});

test('the frame remains fixed throughout opening while only the native inner-leaf crops move', () => {
  const b = nativeBounds(doors[0]);
  for (const progress of [.2, .5, 1]) {
    const subject = canvas(), model = drawHubElevatorDoorV142(subject.ctx, image, b, progress);
    assert.deepEqual(subject.images[0], [image, b.x, b.y, b.w, b.h]);
    const [left, right] = subject.images.slice(1), crop = model.sourceOpening;
    assert.deepEqual(left.slice(1, 5), [crop.x, crop.y, crop.w / 2, crop.h]);
    assert.deepEqual(right.slice(1, 5), [crop.x + crop.w / 2, crop.y, crop.w / 2, crop.h]);
    assert.equal(left[5], model.opening.x - model.leafTravel);
    assert.equal(right[5], model.opening.x + model.opening.w / 2 + model.leafTravel);
    assert.deepEqual(subject.clips, [model.openingPolygon]);
    assert.ok(subject.fills.length > 20); subject.balanced();
    if (progress === 1) { assert.ok(left[5] + left[7] <= model.opening.x + 1e-8); assert.ok(right[5] >= model.opening.x + model.opening.w - 1e-8); }
  }
});

test('interior painting stays inside the masked aperture and never adds a blue rectangle around the doorway', () => {
  const b = nativeBounds(doors[0]), subject = canvas(), model = drawHubElevatorDoorV142(subject.ctx, image, b, 1);
  for (const { bounds: [x, y, w, h], color } of subject.fills) {
    assert.ok(x >= model.opening.x - 1e-8 && y >= model.opening.y - 1e-8);
    assert.ok(x + w <= model.opening.x + model.opening.w + 1e-8 && y + h <= model.opening.y + model.opening.h + 1e-8);
    const rgb = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i); assert.ok(rgb);
    assert.ok(parseInt(rgb[3], 16) <= parseInt(rgb[2], 16), `No blue fill: ${color}`);
  }
  subject.balanced();
});

test('a paused or reduced-motion render has no independent animation or state mutation', () => {
  const b = Object.freeze(nativeBounds(doors[0])), a = canvas(), c = canvas();
  const first = drawHubElevatorDoorV142(a.ctx, image, b, .73), second = drawHubElevatorDoorV142(c.ctx, image, b, .73);
  assert.deepEqual(first, second); assert.deepEqual(a.images, c.images); assert.deepEqual(a.fills, c.fills);
  assert.equal(first.animatedBy, 'native-door-progress'); a.balanced(); c.balanced();
});

test('invalid art, squeezed bounds and non-finite progress cannot poison the canvas', () => {
  const b = nativeBounds(doors[0]);
  for (const bad of [null, { ...b, x: NaN }, { ...b, w: -1 }, { ...b, w: b.w * 2 }]) assert.equal(getHubElevatorInteriorV142(bad, 1), null);
  assert.equal(getHubElevatorInteriorV142(b, Infinity).progress, 0);
  assert.equal(getHubElevatorInteriorV142(b, -4).progress, 0); assert.equal(getHubElevatorInteriorV142(b, 4).progress, 1);
  for (const bad of [null, { ...image, complete: false }, { ...image, naturalHeight: 192 }]) {
    const subject = canvas(); assert.equal(drawHubElevatorDoorV142(subject.ctx, bad, b, 1), null); assert.deepEqual(subject.images, []); subject.balanced();
  }
});

test('the production spatial wrapper records the cabin but preserves doors, destinations and editor fallback', () => {
  let calls = 0;
  class Base { constructor() { this.propImages = new Map([['/assets/openai/hub/props/lift-door.png', image]]); this.player = { x: 0, w: 44 }; } drawDoor() { calls++; return 'native'; } }
  const Hub = withHubSpatialDesignV136(Base), hub = new Hub(), subject = canvas();
  for (const door of doors) {
    const before = structuredClone(door); hub.drawDoor(subject.ctx, { ...door, progress: 1 });
    assert.deepEqual(door, before); const rendered = hub.hubSpatialLiftsV136.get(door.id);
    assert.equal(rendered.interior.schema, 142); assert.equal(rendered.interior.progress, 1);
    assert.equal(rendered.target.y + rendered.target.h, 624);
  }
  assert.equal(calls, 0); hub.editorPlaytest = true; assert.equal(hub.drawDoor(subject.ctx, doors[0]), 'native'); assert.equal(calls, 1);
  hub.editorPlaytest = false; assert.equal(hub.drawDoor(subject.ctx, { lift: false }), 'native'); assert.equal(calls, 2); subject.balanced();
});

test('the base-engine lift fallback uses the same aspect and source crop at its original physical socket', () => {
  for (const door of doors) { const bounds = getHubDoorBounds(door), model = getHubElevatorInteriorV142(bounds, .5); assert.ok(model); assert.equal(model.target.y + model.target.h, 624); assert.deepEqual(model.sourceOpening, HUB_ELEVATOR_SOURCE_V142.aperture); }
});
