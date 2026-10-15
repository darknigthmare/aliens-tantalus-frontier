import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEX_ENTRANCES_V133 } from '../src/hub-navigation-layout-v133.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { hubBulkheadDepthGeometryV134, drawHubBulkheadDepthV134 } from '../src/hub-bulkhead-depth-v134.js';
import { getHubRoomParallaxPlanV134, getHubRearEquipmentLayoutV134 } from '../src/hub-room-parallax-v134.js';
import { getHubVehiclePlacementV136 } from '../src/hub-prop-placements-v136.js';
import { resolveHubVehicleArtV58 } from '../src/hub-art-runtime-v58.js';
import { DROPSHIP_HANGAR_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { getHubSpatialPlanV136, hubSpatialPlacementClearV136, getHubSpatialFloorV136,
  drawHubSpatialFloorV136, drawHubSpatialFrameV136, getHubRecessedPortalV136,
  drawHubSpatialLadderV136, withHubSpatialDesignV136 } from '../src/hub-spatial-design-v136.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V87.map(annex => ({ ...annex, xStart: 0 }))];
const network = deck => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
function canvas() {
  let depth = 0;
  const fills = [], clips = [], images = [], paths = [], native = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    beginPath() { paths.push([]); }, moveTo(...point) { paths.at(-1).push(point); }, lineTo(...point) { paths.at(-1).push(point); },
    fillRect(...bounds) { fills.push({ bounds, color: ctx.fillStyle }); },
    rect(...bounds) { clips.push(bounds); }, drawImage(...args) { images.push(args); },
    measureText: text => ({ width: text.length * 6 }), createLinearGradient: () => ({ addColorStop() {} })
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, fills, clips, images, paths, native, balanced: () => assert.equal(depth, 0) };
}

test('all 29 room sections share the native foot rail, a distinct service floor and immutable world reservations', () => {
  assert.equal(rooms.length, 29);
  for (const room of rooms) {
    const before = structuredClone(room), plan = getHubSpatialPlanV136(room);
    assert.equal(plan.planes.walkY, room.world?.floorY || 624, room.id);
    assert.equal(plan.planes.rearServiceY, plan.planes.walkY - 24);
    assert.equal(plan.planes.rearWallBaseY, plan.planes.walkY - 58);
    assert.equal(plan.bounds.x, room.xStart); assert.equal(plan.collidable, false);
    assert.equal(plan.geometryPreserved, true); assert.equal(plan.gameplayPlane, '2d');
    assert.ok(plan.reservations.every(r => [r.x, r.y, r.w, r.h].every(Number.isFinite) && r.w > 0 && r.h > 0), room.id);
    assert.deepEqual(room, before);
  }
});

test('real door, lift, ladder, viewport and service sockets exclude decorative furniture instead of adding colliders', () => {
  const room = HUB_DECKS[0].rooms[1], doors = network(0), ladder = { x: room.xStart + 450, top: 390, bottom: 624, w: 52 };
  const plan = getHubSpatialPlanV136(room, { doors, ladders: [ladder] });
  for (const role of ['transverse-bulkhead', 'lift-entrance', 'ladder-clearance', 'viewport', 'native-service', 'annex-entrance']) {
    const reserve = plan.reservations.find(r => r.role === role);
    // Briefing owns no annex; its other spatial sockets are all physically present.
    if (role === 'annex-entrance') continue;
    assert.ok(reserve, role); assert.equal(hubSpatialPlacementClearV136(reserve, plan), false);
  }
  assert.equal(hubSpatialPlacementClearV136({ x: Number.NaN, y: 240, w: 10, h: 10 }, plan), false);
  assert.equal(hubSpatialPlacementClearV136({ x: room.xStart - 1, y: 240, w: 10, h: 10 }, plan), false);
});

test('every depth floor seam has the actual transverse bulkhead slope and remains independent of room translation', () => {
  const door = network(0).find(d => !d.lift), geometry = hubBulkheadDepthGeometryV134(door);
  const slope = (geometry.near.x - geometry.rear.x) / (geometry.near.floorY - geometry.rear.floorY);
  const adjacentFloor = getHubSpatialFloorV136(HUB_DECKS[0].rooms[0]);
  const boundarySeam = adjacentFloor.seams.find(seam => Math.abs(seam.from[0] - 4 * slope - door.x) < 1e-8);
  assert.ok(boundarySeam, 'the actual door cross-section meets the same floor seam at walkY');
  for (const room of rooms) {
    const model = getHubSpatialFloorV136(room), moved = getHubSpatialFloorV136({ ...room, xStart: room.xStart + 90000 });
    assert.ok(model.bounds.y > model.walkY); assert.equal(model.collidable, false);
    for (const [index, seam] of model.seams.entries()) {
      assert.ok(Math.abs((seam.to[0] - seam.from[0]) / (seam.to[1] - seam.from[1]) - model.dxPerY) < 1e-9);
      assert.equal(moved.seams[index].from[0] - seam.from[0], 90000);
    }
    if (model.mode === 'parallel-oblique') assert.equal(model.dxPerY, slope);
    else assert.equal(model.dxPerY, 0);
    assert.equal(getHubSpatialFloorV136(room, { enabled: false }).dxPerY, 0);
  }
});

test('architecture renders only its ceiling, rear posts and low wall base while floor details remain below the walk rail', () => {
  for (const room of rooms) {
    const subject = canvas(), plan = drawHubSpatialFrameV136(subject.ctx, room);
    assert.ok(subject.fills.every(f => f.bounds[1] + f.bounds[3] <= plan.planes.walkY));
    const rearSurface = subject.fills.find(f => f.bounds[1] === plan.planes.rearWallBaseY && f.bounds[3] === 58);
    assert.ok(rearSurface, room.id + ' has a real supported rear service surface');
    subject.fills.length = 0; const model = drawHubSpatialFloorV136(subject.ctx, room);
    assert.ok(subject.fills.every(f => f.bounds[1] >= model.walkY + 4));
    assert.deepEqual(subject.clips.at(-1), Object.values(model.bounds)); subject.balanced();
  }
});

test('upper bulkhead uses a short cutaway lintel and narrow ceiling ties, retaining its exact opening and collision', () => {
  for (const progress of [0, .4, .82, 1]) {
    const door = { ...network(0).find(d => !d.lift), progress }, before = structuredClone(door), g = hubBulkheadDepthGeometryV134(door);
    assert.equal(g.upperSection, 'open-cutaway-with-rear-ties'); assert.equal(g.slabPolygon[0][1], g.rear.topY - 54);
    assert.equal(g.collisionBounds.w, 16); assert.equal(g.leafHeight === 0, progress >= .82);
    const subject = canvas(); drawHubBulkheadDepthV134(subject.ctx, door, { phase: 'back' });
    assert.ok(subject.fills.filter(f => f.bounds[3] > 210).every(f => f.bounds[2] <= 5));
    assert.deepEqual(door, before); subject.balanced();
  }
});

test('recessed rear-wall portals retain their original foot point and image aspect inside an unchanged interaction socket', () => {
  for (const annex of HUB_ANNEXES_V87) {
    const b = { x: annex.entranceLocalX - annex.entrance.w / 2, y: annex.entrance.y, w: annex.entrance.w, h: annex.entrance.h };
    const before = structuredClone(b), model = getHubRecessedPortalV136(b), t = model.target;
    assert.equal(t.y + t.h, b.y + b.h); assert.equal(t.x + t.w / 2, b.x + b.w / 2);
    assert.ok(t.h <= 156); assert.ok(Math.abs(t.w / t.h - b.w / b.h) < 1e-10);
    assert.deepEqual(model.socket, b); assert.deepEqual(b, before);
  }
});

test('a full opening lift clips its sliding leaf halves inside the rear-wall recess and never changes native access state', () => {
  const subject = canvas(), image = { complete: true, naturalWidth: 187, naturalHeight: 191 };
  class Base {
    constructor() { this.propImages = new Map([['/assets/openai/hub/props/lift-door.png', image]]); this.player = { x: 1000, w: 44 }; }
    drawDoor() { subject.native.push('door'); } draw() {} getSnapshot() { return { state: 'native' }; }
  }
  const Hub = withHubSpatialDesignV136(Base), hub = new Hub();
  for (const progress of [0, .5, 1]) {
    const door = { id: 'lift', lift: true, x: 1000, progress, shaftLabel: 'ASCENSEUR AVANT' }, before = structuredClone(door);
    hub.drawDoor(subject.ctx, door); const model = hub.hubSpatialLiftsV136.get('lift');
    assert.equal(model.target.h, 156); assert.deepEqual(subject.clips.at(-1), Object.values(model.target));
    const [left, right] = subject.images.slice(-2); assert.equal(left.at(-1), right.at(-1));
    assert.equal(left.at(-2), right.at(-2)); assert.deepEqual(door, before);
    if (progress === 1) { assert.ok(left[5] + left[7] <= model.target.x + 1e-8); assert.ok(right[5] >= model.target.x + model.target.w - 1e-8); }
  }
  assert.equal(subject.native.length, 0); subject.balanced();
  hub.editorPlaytest = true; hub.drawDoor(subject.ctx, { lift: true }); assert.equal(subject.native.length, 1);
});

test('compact rear equipment keeps native aspect, clear dynamic drift envelopes and a one-person cabinet height', () => {
  const atlas = { complete: true, naturalWidth: 1774, naturalHeight: 887 }; let rendered = 0;
  for (const room of rooms) for (const cameraOffset of [-600, 0, 600]) {
    const options = { ladders: room.ladders || [], platforms: room.platforms || [] };
    const model = getHubRoomParallaxPlanV134(room, room.xStart + cameraOffset), spatial = getHubSpatialPlanV136(room, options);
    for (const panel of getHubRearEquipmentLayoutV134(room, model, atlas, options)) {
      const t = panel.target; assert.ok(t.h <= 112 + 1e-7 && t.w <= 300 + 1e-7);
      assert.ok(Math.abs(t.w / panel.source.w - t.h / panel.source.h) < 1e-10);
      assert.ok(hubSpatialPlacementClearV136({ ...t, x: t.x - 40, w: t.w + 80 }, spatial), room.id);
      assert.ok(t.y + t.h < 500); rendered++;
    }
  }
  assert.ok(rendered >= 30, 'real wall equipment remains available across the authored ship');
});

test('arrival portal moves with its native socket beyond the measured craft rather than appearing through its hull', () => {
  assert.equal(HUB_ANNEX_ENTRANCES_V133['arrival-airlock'].centerX, 1040);
  const entrance = HUB_ANNEXES_V87.find(a => a.id === 'arrival-airlock').entrance;
  const left = 1040 - entrance.w / 2, right = 1040 + entrance.w / 2;
  assert.ok(left > 870 + 64); assert.ok(right < 1280 - 128);
});

test('passive dressing reserves the actual parked hulls, control booth and electrical arc without creating new collisions', () => {
  const hangar = HUB_DECKS[3].rooms.find(room => room.id === 'dropship-hangar');
  const vehicleBay = HUB_DECKS[2].rooms.find(room => room.id === 'vehicle-bay');
  for (const [room, actor] of [[hangar, DROPSHIP_HANGAR_ART_V55.dropship], [vehicleBay, resolveHubVehicleArtV58(vehicleBay.id).vehicle]]) {
    const before = structuredClone(actor), actual = getHubVehiclePlacementV136(room, actor).renderBounds;
    const plan = getHubSpatialPlanV136(room), reserved = plan.reservations.find(r => r.role === 'parked-vehicle');
    assert.deepEqual(reserved, { x: actual.x - 12, y: actual.y - 12, w: actual.w + 24, h: actual.h + 24, role: 'parked-vehicle' });
    assert.equal(hubSpatialPlacementClearV136({ x: actual.x + 30, y: actual.y + 30, w: 24, h: 24 }, plan), false);
    assert.deepEqual(actor, before); assert.equal(plan.collidable, false);
  }
  const plan = getHubSpatialPlanV136(hangar);
  for (const [actor, role] of [[DROPSHIP_HANGAR_ART_V55.controlBooth, 'hangar-control-booth'], [DROPSHIP_HANGAR_ART_V55.electricalHazard, 'electrical-alcove']]) {
    const reserved = plan.reservations.find(r => r.role === role);
    assert.equal(reserved.x, hangar.xStart + actor.renderBounds.x - 12);
    assert.equal(reserved.y, actor.renderBounds.y - 12);
    assert.equal(reserved.w, actor.renderBounds.w + 24); assert.equal(reserved.h, actor.renderBounds.h + 24);
  }
});

test('ladder mounting ends match real endpoints, uses the correct centred or annex anchor and preserves source geometry', () => {
  const ladder = { x: 450, top: 390, bottom: 624, w: 52 }, before = structuredClone(ladder);
  for (const centered of [true, false]) {
    const subject = canvas(); assert.equal(drawHubSpatialLadderV136(subject.ctx, ladder, { centered }), true);
    const rails = subject.fills.filter(f => f.bounds[3] === 234);
    assert.ok(rails.length > 0); assert.equal(rails[0].bounds[0], centered ? 424 : 450);
    assert.ok(rails.every(f => f.bounds[1] === 390 && f.bounds[1] + f.bounds[3] === 624));
    subject.balanced(); assert.deepEqual(ladder, before);
  }
});
