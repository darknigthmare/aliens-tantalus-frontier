import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubRoomPresentationV119 } from '../src/hub-room-presentation-v119.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubDoorBounds } from '../src/hub-profiles-v53.js';
import { hubFloorPerspectiveV116, drawHubFloorPerspectiveV116, drawHubRoomDepthV119 } from '../src/hub-depth-presentation-v116.js';
import { getHubBulkheadColliderV134, hubBulkheadDepthGeometryV134, drawHubBulkheadDepthV134 } from '../src/hub-bulkhead-depth-v134.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137];
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);
const network = deck => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
const doorAt = progress => ({ ...network(0).find(door => !door.lift), progress });
function canvas() {
  let depth = 0;
  const paths = [], fills = [], text = [], images = [], clips = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    beginPath() { paths.push([]); }, moveTo(x, y) { paths.at(-1).push([x, y]); },
    lineTo(x, y) { paths.at(-1).push([x, y]); }, rect(...bounds) { clips.push(bounds); },
    fillRect(...bounds) { fills.push({ bounds, color: ctx.fillStyle }); },
    drawImage(...args) { images.push(args); }, fillText(label, x, y) { text.push({ label, x, y }); },
    measureText: label => ({ width: String(label).length * 6 }),
    createLinearGradient: () => ({ addColorStop() {} })
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, paths, fills, text, images, clips, balanced: () => assert.equal(depth, 0) };
}

test('each of the 35 compartments owns one whole-room projection, preserved when background motion is disabled', () => {
  assert.equal(rooms.length, 35);
  const layered = [];
  for (const room of rooms) {
    const on = getHubRoomPresentationV119(room), off = getHubRoomPresentationV119(room, false);
    assert.equal(on.projectionV139.scope, 'whole-compartment');
    assert.equal(on.projectionV139.mixedProjectionAllowed, false);
    assert.equal(on.presentationMode, on.projectionV139.mode);
    assert.equal(off.presentationMode, on.presentationMode);
    assert.equal(off.perspectiveFloor, on.perspectiveFloor);
    assert.deepEqual(off.projectionV139, on.projectionV139);
    assert.equal(off.cameraProfile.farFactor, 0);
    if (on.presentationMode === '2.5d') layered.push(room.id);
  }
  assert.deepEqual(layered, ['maintenance-spine']);
  assert.equal(getHubRoomPresentationV119('unknown-room').presentationMode, '2d');
});

test('the depth floor follows a fixed 19/12 parallel vector with no camera-centred vanishing point', () => {
  const models = [0, 111, 600, 90000].map(cameraX => hubFloorPerspectiveV116(cameraX, {
    width: 1280, height: 720, floorY: 624, presentationMode: '2.5d', horizonX: -9999, horizonY: -9999
  }));
  for (const model of models) {
    assert.equal(model.projection, 'parallel-oblique'); close(model.dxPerY, 19 / 12);
    assert.equal(model.vanishingPoint, null); assert.equal(model.horizonX, null); assert.equal(model.horizonY, null);
    for (const seam of model.seams) {
      close((seam.nearX - seam.farX) / (model.nearY - model.startY), 19 / 12);
      close(seam.farX - (model.startY - model.walkY) * model.dxPerY, seam.walkX);
      close(seam.nearX - (model.nearY - model.walkY) * model.dxPerY, seam.walkX);
    }
  }
  assert.deepEqual(models[0].seams, models[1].seams, 'Panning within the same world tiles cannot rotate their lines');
  const subject = canvas(), result = drawHubFloorPerspectiveV116(subject.ctx, 0, { presentationMode: '2.5d' });
  assert.equal(result.projection, 'parallel-oblique');
  for (const path of subject.paths) for (let index = 0; index < result.seams.length * 2; index += 2) {
    const [a, b] = [path[index], path[index + 1]];
    close((b[0] - a[0]) / (b[1] - a[1]), 19 / 12);
  }
  subject.balanced();
});

test('orthographic compartments paint no added depth floor while the maintenance projection survives F7', () => {
  const direct = hubFloorPerspectiveV116(0, { presentationMode: '2d' }), untouched = canvas();
  assert.equal(direct.projection, 'orthographic'); assert.equal(direct.dxPerY, 0);
  assert.deepEqual(direct.seams, []); assert.deepEqual(direct.crossRails, []);
  assert.equal(drawHubFloorPerspectiveV116(untouched.ctx, 0, { presentationMode: '2d' }), false);
  for (const room of rooms.filter(room => room.id !== 'maintenance-spine')) {
    assert.equal(drawHubRoomDepthV119(untouched.ctx, room.xStart || 0, room), false, room.id);
  }
  assert.deepEqual(untouched.paths, []); assert.deepEqual(untouched.fills, []); untouched.balanced();
  const maintenance = rooms.find(room => room.id === 'maintenance-spine'), on = canvas(), off = canvas();
  assert.equal(drawHubRoomDepthV119(on.ctx, 0, maintenance, {}, true), true);
  assert.equal(drawHubRoomDepthV119(off.ctx, 0, maintenance, {}, false), true);
  assert.deepEqual(on.paths, off.paths); assert.deepEqual(on.clips, off.clips);
  assert.deepEqual(on.fills.map(entry => entry.bounds), off.fills.map(entry => entry.bounds));
  on.balanced(); off.balanced();
});

test('orthographic transverse doors are vertical profiles of the same 16 by 198 physical leaf', () => {
  for (let deck = 0; deck < 4; deck++) for (const source of network(deck).filter(door => !door.lift)) {
    for (const progress of [0, .3, .82, 1]) {
      const door = { ...source, progress }, before = structuredClone(door);
      const geometry = hubBulkheadDepthGeometryV134(door, { presentationMode: '2d' });
      assert.equal(geometry.projection, 'orthographic-transverse-profile'); assert.equal(geometry.presentationMode, '2d');
      assert.deepEqual(geometry.collisionBounds, getHubBulkheadColliderV134(door));
      assert.equal(geometry.collisionBounds.w, 16); assert.equal(geometry.collisionBounds.h, 198);
      assert.equal(geometry.bounds.w, 16); assert.equal(geometry.foregroundWidth, 3);
      assert.equal(geometry.rear.floorY, geometry.near.floorY); assert.equal(geometry.rear.topY, geometry.near.topY);
      assert.equal(geometry.leafHeight === 0, progress >= .82);
      for (const polygon of [geometry.opening, geometry.leafPolygon, geometry.slabPolygon,
        geometry.headerPolygon, geometry.thresholdPolygon]) for (let index = 0; index < polygon.length; index++) {
        const [a, b] = [polygon[index], polygon[(index + 1) % polygon.length]];
        assert.ok(a[0] === b[0] || a[1] === b[1], 'A 2D doorway cannot acquire a diagonal depth edge');
        assert.ok(a[0] >= door.x - 8 && a[0] <= door.x + 8);
      }
      assert.deepEqual(door, before);
    }
  }
});

test('the 2D painter opens vertically, occludes only a narrow return, and retains a readable destination above the leaf', () => {
  for (const progress of [0, .4, .82, 1]) for (const phase of ['back', 'front', 'all']) {
    const door = doorAt(progress), before = structuredClone(door), subject = canvas();
    assert.equal(drawHubBulkheadDepthV134(subject.ctx, door, { presentationMode: '2d', phase, playerCenterX: door.x }), true);
    const bodyCover = subject.fills.filter(entry => entry.bounds[1] < 624 && entry.bounds[1] + entry.bounds[3] > 532);
    assert.ok(bodyCover.length > 0);
    assert.ok(bodyCover.every(entry => entry.bounds[2] <= (progress >= .82 ? 3 : 16)));
    assert.equal(subject.images.length, 0);
    if (phase !== 'back') {
      assert.ok(subject.text.some(entry => entry.label === door.destinationLabel && entry.y < 426));
    }
    assert.deepEqual(door, before); subject.balanced();
  }
});

test('the historical API default keeps the parallel depth section and the native opening threshold', () => {
  const door = doorAt(.4), original = hubBulkheadDepthGeometryV134(door);
  assert.deepEqual(original, hubBulkheadDepthGeometryV134(door, { presentationMode: '2.5d' }));
  assert.equal(original.projection, 'transverse-depth-cutaway'); assert.equal(original.presentationMode, '2.5d');
  close((original.near.x - original.rear.x) / (original.near.floorY - original.rear.floorY), 19 / 12);
  assert.deepEqual(original.collisionBounds, hubBulkheadDepthGeometryV134(door, { presentationMode: '2d' }).collisionBounds);
  const lift = network(0).find(door => door.lift), subject = canvas();
  for (const presentationMode of ['2d', '2.5d']) {
    assert.equal(hubBulkheadDepthGeometryV134(lift, { presentationMode }), null);
    assert.equal(drawHubBulkheadDepthV134(subject.ctx, lift, { presentationMode }), false);
    assert.deepEqual(getHubBulkheadColliderV134(lift), getHubDoorBounds(lift));
  }
  subject.balanced();
});
