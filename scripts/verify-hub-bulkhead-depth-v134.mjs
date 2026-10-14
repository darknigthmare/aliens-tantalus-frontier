import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD, HubGame as BaseHub } from '../src/hub-game.js';
import { HubGame as TraversalHub } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubDoorBounds } from '../src/hub-profiles-v53.js';
import { hubBulkheadDepthGeometryV134, getHubBulkheadColliderV134, drawHubBulkheadDepthV134 } from '../src/hub-bulkhead-depth-v134.js';

function canvas() {
  let depth = 0;
  const paths = [], fills = [], images = [], text = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    beginPath() { paths.push([]); }, moveTo(x, y) { paths.at(-1).push([x, y]); }, lineTo(x, y) { paths.at(-1).push([x, y]); },
    fillRect(...rect) { fills.push({ rect, color: ctx.fillStyle }); }, drawImage(...args) { images.push(args); },
    fillText(label) { text.push(label); }, measureText: label => ({ width: String(label).length * 6 }),
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, paths, fills, images, text, balanced: () => assert.equal(depth, 0) };
}
const network = deck => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
const bulkhead = progress => ({ ...network(0).find(door => !door.lift), progress });

test('all twelve physical bulkheads project across corridor depth and intersect their unchanged native x at floor624', () => {
  let count = 0;
  for (let deck = 0; deck < 4; deck++) for (const door of network(deck).filter(door => !door.lift)) {
    const before = structuredClone(door), geometry = hubBulkheadDepthGeometryV134(door);
    const fraction = (geometry.floorY - geometry.rear.floorY) / (geometry.near.floorY - geometry.rear.floorY);
    const railX = geometry.rear.x + (geometry.near.x - geometry.rear.x) * fraction;
    assert.equal(railX, door.x); assert.equal(geometry.projection, 'transverse-depth-cutaway');
    assert.equal(geometry.collisionBounds.x + geometry.collisionBounds.w / 2, door.x);
    assert.equal(geometry.collisionBounds.w, 16); assert.equal(geometry.collisionBounds.y + geometry.collisionBounds.h, 624);
    assert.ok(geometry.rear.floorY < 624 && geometry.near.floorY > 624);
    assert.ok(geometry.near.x - geometry.rear.x < 64); assert.equal(geometry.foregroundWidth, 14);
    assert.deepEqual(door, before); count++;
  }
  assert.equal(count, 12);
});
test('the panel retracts into its header and completely clears the same native .82 passability threshold', () => {
  assert.equal(hubBulkheadDepthGeometryV134(bulkhead(0)).leafHeight, 198);
  assert.ok(hubBulkheadDepthGeometryV134(bulkhead(.4)).leafHeight > 90);
  for (const progress of [.82, .9, 1, 9]) assert.equal(hubBulkheadDepthGeometryV134(bulkhead(progress)).leafHeight, 0);
  for (const progress of [-1, Number.NaN, Number.POSITIVE_INFINITY]) assert.equal(hubBulkheadDepthGeometryV134(bulkhead(progress)).leafHeight, 198);
});
test('open doors draw only a narrow near return in front of actors and use no frontal raster or opaque passage rectangle', () => {
  const subject = canvas(), door = bulkhead(1);
  assert.equal(drawHubBulkheadDepthV134(subject.ctx, door, { phase: 'front', playerCenterX: door.x }), true);
  const bodyCover = subject.fills.filter(entry => entry.rect[1] < 624 && entry.rect[1] + entry.rect[3] > 532);
  assert.ok(bodyCover.length >= 3); assert.ok(bodyCover.every(entry => entry.rect[2] <= 14));
  assert.equal(subject.images.length, 0); assert.ok(subject.text.includes(door.destinationLabel)); subject.balanced();
});
test('rear architecture and foreground panel leave door state immutable and keep lifts on their native renderer', () => {
  const subject = canvas(), door = bulkhead(.3), before = structuredClone(door);
  assert.equal(drawHubBulkheadDepthV134(subject.ctx, door, { phase: 'back' }), true);
  assert.equal(drawHubBulkheadDepthV134(subject.ctx, door, { phase: 'front' }), true);
  assert.deepEqual(door, before); subject.balanced();
  const lift = network(0).find(door => door.lift);
  assert.equal(hubBulkheadDepthGeometryV134(lift), null); assert.equal(drawHubBulkheadDepthV134(subject.ctx, lift), false);
  assert.deepEqual(getHubBulkheadColliderV134(lift), getHubDoorBounds(lift));
  assert.equal(drawHubBulkheadDepthV134(subject.ctx, door, { phase: 'invalid' }), false);
});
function walkIntoNativeDoor(Hub, direction, progress) {
  const door = bulkhead(progress), collider = getHubBulkheadColliderV134(door), player = { x: direction > 0 ? collider.x - 44 - 10 : collider.x + collider.w + 10,
    y: 532, w: 44, h: 92, vx: direction * 270, crouching: false };
  const host = { doorStates: [door], player, obstacles: [], v51Doors: [], v51Walls: [], v51Vents: [], editorPlaytest: false };
  for (let frame = 0; frame < 8; frame++) { const previousX = player.x; player.x += player.vx / 60; Hub.prototype.resolveHorizontal.call(host, previousX); }
  return { player, collider };
}
test('both native hub engines block a closed leaf exactly at its visible walk cross-section from either side', () => {
  for (const Hub of [BaseHub, TraversalHub]) for (const direction of [-1, 1]) {
    const { player, collider } = walkIntoNativeDoor(Hub, direction, 0);
    assert.equal(direction > 0 ? player.x + player.w : player.x, direction > 0 ? collider.x : collider.x + collider.w);
    assert.equal(player.vx, 0);
  }
});
test('the same native walk resolvers allow passage at .82 with no invisible old bitmap-width obstacle', () => {
  for (const Hub of [BaseHub, TraversalHub]) for (const direction of [-1, 1]) for (const progress of [.82, 1]) {
    const { player, collider } = walkIntoNativeDoor(Hub, direction, progress);
    assert.equal(player.vx, direction * 270);
    assert.ok(direction > 0 ? player.x + player.w > collider.x + collider.w : player.x < collider.x);
  }
});
test('door drawing exposes only actual completed draw phases and their exact projection for read-only browser QA', () => {
  const subject = canvas(), door = bulkhead(.5), host = { player: { x: door.x - 22, w: 44 } };
  BaseHub.prototype.drawDoor.call(host, subject.ctx, door, 'back');
  assert.deepEqual(host.bulkheadDrawnV134.get(door.id).drawnPhases, ['back']);
  BaseHub.prototype.drawDoor.call(host, subject.ctx, door, 'front');
  const drawn = host.bulkheadDrawnV134.get(door.id);
  assert.deepEqual(drawn.drawnPhases, ['back', 'front']);
  assert.deepEqual(drawn.opening, hubBulkheadDepthGeometryV134(door).opening);
  assert.equal(drawn.assetSource, 'original-vector-architecture'); subject.balanced();
});
