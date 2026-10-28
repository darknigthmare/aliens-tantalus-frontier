import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { hubBulkheadDepthGeometryV134, drawHubBulkheadDepthV134 } from '../src/hub-bulkhead-depth-v134.js';

function recordingCanvas() {
  const fills = [], texts = [];
  let depth = 0;
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    fillRect(x, y, w, h) { fills.push({ x, y, w, h, color: this.fillStyle }); },
    fillText(label, x, y, maxWidth) { texts.push({ label, x, y, maxWidth, font: this.font }); },
    measureText(label) { return { width: label.length * 6 }; }
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, fills, texts, balanced() { assert.equal(depth, 0); } };
}

const doors = HUB_DECKS.flatMap((_, deck) => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck))
  .filter(door => !door.lift);

test('each native transverse doorway has a bounded steel plaque connected to its actual header in both projections', () => {
  assert.equal(doors.length, 12);
  for (const door of doors) for (const presentationMode of ['2d', '2.5d']) {
    const c = recordingCanvas(), before = structuredClone(door);
    const g = hubBulkheadDepthGeometryV134(door, { presentationMode });
    assert.equal(drawHubBulkheadDepthV134(c.ctx, door,
      { presentationMode, phase: 'front', playerCenterX: door.x - 200 }), true);
    const plate = c.fills.find(rectangle => rectangle.color === '#354d4d');
    assert.ok(plate, door.id);
    assert.ok(plate.w >= 80 && plate.w <= 260);
    assert.equal(plate.x + plate.w / 2, door.x);
    assert.ok(plate.y + plate.h < Math.min(g.rear.topY, g.near.topY));
    assert.ok(plate.y + plate.h < 532, 'No plate or label covers the pedestrian lane');
    const straps = c.fills.filter(rectangle => rectangle.color === '#152b2f');
    assert.equal(straps.length, 2);
    const headerY = (g.rear.topY + g.near.topY) / 2 - 12;
    for (const strap of straps) {
      assert.ok(strap.y <= plate.y && strap.y + strap.h >= headerY);
      assert.ok(strap.x >= door.x - 8 && strap.x + strap.w <= door.x + 8);
    }
    assert.equal(c.texts.length, 1); assert.equal(c.texts[0].label, door.destinationLabel);
    assert.equal(c.texts[0].maxWidth, plate.w - 20);
    assert.ok(!c.fills.some(rectangle => rectangle.color === 'rgba(2,8,7,.88)'), 'No old floating UI banner');
    assert.deepEqual(door, before); c.balanced();
  }
});

test('the same readable plaque remains fixed on either approach and throughout opening without widening the leaf', () => {
  for (const native of doors) for (const presentationMode of ['2d', '2.5d']) {
    let reference;
    for (const progress of [0, .4, .82, 1]) for (const approach of [-200, 200]) {
      const door = { ...native, progress }, c = recordingCanvas();
      drawHubBulkheadDepthV134(c.ctx, door, { presentationMode, phase: 'front', playerCenterX: door.x + approach });
      const plate = c.fills.find(rectangle => rectangle.color === '#354d4d');
      const actual = { plate, text: c.texts[0] };
      if (!reference) reference = actual;
      else assert.deepEqual(actual, reference);
      const coversBody = c.fills.filter(r => r.y < 624 && r.y + r.h > 532);
      assert.ok(coversBody.every(r => r.w <= (presentationMode === '2d' ? 16 : 14)));
      c.balanced();
    }
  }
});

test('a long destination is fitted inside the fasteners and retains the native distance and rendering-phase guards', () => {
  const door = { ...doors[0], destinationLabel: 'Compartiment de maintenance et traitement des flux de refroidissement ↔ Laboratoire de surveillance biologique' };
  for (const presentationMode of ['2d', '2.5d']) {
    const c = recordingCanvas();
    drawHubBulkheadDepthV134(c.ctx, door, { presentationMode, phase: 'front', playerCenterX: door.x });
    assert.equal(c.texts[0].maxWidth, 240); assert.equal(c.texts[0].label, door.destinationLabel);
    for (const options of [{ phase: 'back', playerCenterX: door.x },
      { phase: 'front', playerCenterX: door.x + 520 }, { phase: 'front', playerCenterX: door.x - 520 },
      { phase: 'front', playerCenterX: null }]) {
      const far = recordingCanvas(); drawHubBulkheadDepthV134(far.ctx, door, { presentationMode, ...options });
      assert.equal(far.texts.length, 0);
      assert.ok(!far.fills.some(rectangle => rectangle.color === '#354d4d'));
      far.balanced();
    }
  }
});
