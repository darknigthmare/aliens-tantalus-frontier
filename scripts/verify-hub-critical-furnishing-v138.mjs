import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubRoomLifePlanV136 } from '../src/hub-room-life-v136.js';
import { getHubShipConnectionsForRoomV137 } from '../src/hub-ship-layout-v137.js';
import { HUB_FURNISHING_CRITICAL_OVERRIDES_V138 } from '../src/hub-furnishing-critical-v138.js';

const overlaps = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, `${a} differs from ${b}`);
function composed(id) {
  const deck = HUB_DECKS.findIndex(deck => deck.rooms.some(room => room.id === id));
  const room = HUB_DECKS[deck].rooms.find(room => room.id === id);
  const geometry = buildHubTraversalGeometryV87(deck);
  const options = { doors: buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck),
    ladders: geometry.ladders, vents: geometry.vents, platforms: geometry.platforms };
  // No proposed-definition injection: this must be the production composition.
  return { room, geometry, plan: getHubRoomLifePlanV136(room, options) };
}
const item = (plan, role) => {
  const value = plan.items.find(entry => entry.role === role);
  assert.ok(value, `Missing active furnishing ${role}`); return value;
};
function reachableStock({ room, geometry, plan }, role) {
  const stock = item(plan, role), center = stock.x + stock.w/2;
  const support = geometry.platforms.find(platform => platform.roomId === room.id
    && center >= platform.x && center <= platform.x+platform.w
    && stock.y >= platform.y-96.5 && stock.y+stock.h <= platform.y-8);
  assert.ok(support, `${role} needs a real standing landing within adult reach.`);
  const handDistance = support.y - stock.y - stock.h/2;
  assert.ok(handDistance >= 24 && handDistance <= 80);
}

test('the active four-room groups clear native metal, entrances and each other, with usable emergency height', () => {
  for (const [id, definition] of Object.entries(HUB_FURNISHING_CRITICAL_OVERRIDES_V138)) {
    const { plan } = composed(id);
    assert.deepEqual(plan.furnishingV137.rejected, [], id);
    assert.equal(plan.task, definition.task, 'The reviewed group must be wired into normal rendering.');
    for (const source of definition.items) {
      const entry = item(plan, source.role);
      assert.equal(entry.collidable, false); assert.equal(entry.interactive, false);
      assert.ok(!plan.spatial.reservations.some(reservation => overlaps(entry, reservation)), `${id}:${entry.role}`);
      if (entry.support === 'rear-floor') {
        near(entry.contactYV139, plan.spatial.planes.rearServiceY);
        if (entry.source) near(entry.y+entry.footSourceYV139*entry.w/entry.source.w, entry.contactYV139);
        else near(entry.y+entry.h, entry.contactYV139);
      }
      if (source.cell === 'emergency-cabinet') {
        const handleY = entry.y+entry.h*.5;
        assert.ok(handleY >= plan.floorY-96.5 && handleY <= plan.floorY-36, `${id}: emergency equipment is above standing reach.`);
      }
    }
    for (let a=0; a<plan.items.length; a++) for (let b=a+1; b<plan.items.length; b++)
      assert.ok(!overlaps(plan.items[a], plan.items[b]), `${id}:${plan.items[a].role}/${plan.items[b].role}`);
  }
});

test('clinical supplies use real upper landings while the bedside cabinet and trolley flank the bed', () => {
  const medical = composed('medical'), bed = medical.room.propRenderBounds;
  const cabinet = item(medical.plan, 'bedside-sterile-cabinet');
  const trolley = item(medical.plan, 'mobile-bedside-preparation');
  assert.ok(trolley.x+trolley.w < bed.x);
  assert.ok(cabinet.x > bed.x+bed.w);
  assert.ok(bed.x-trolley.x-trolley.w < 96.5*2);
  assert.ok(cabinet.x-bed.x-bed.w < 96.5*2);
  reachableStock(medical, 'upper-sterile-preparation-supply');
  reachableStock(composed('science-lab'), 'catwalk-sterile-preparation-stock');
});

test('the mess serves dining and tray return with its existing separate kitchen entrance', () => {
  const mess = composed('mess');
  assert.ok(getHubShipConnectionsForRoomV137(mess.room.id).some(connection => connection.spaceId === 'galley-service'));
  assert.ok(!mess.plan.items.some(entry => entry.cell === 'galley-unit'));
  const counter = item(mess.plan, 'mess-tray-return-counter');
  const stock = item(mess.plan, 'mess-tray-return-stock');
  const cold = item(mess.plan, 'chilled-drink-storage');
  assert.equal(counter.kind, 'work-counter');
  near(counter.x+counter.w/2, stock.x+stock.w/2);
  assert.ok(cold.x > counter.x+counter.w);
  assert.ok(stock.y+stock.h < counter.y, 'Wall stock clears the actual tray counter');
  const handDistance = mess.plan.floorY-stock.y-stock.h/2;
  assert.ok(handDistance >= 24 && handDistance <= 80, 'The tray rack is reachable from the real ground floor');
  const west = item(mess.plan, 'mess-west-dining-seat'), east = item(mess.plan, 'mess-east-dining-seat');
  const table = mess.room.propRenderBounds;
  assert.ok(west.x+west.w < table.x && east.x > table.x+table.w, 'Adult seats flank the actual dining table');
  assert.equal(west.mirroredV139, true); assert.equal(east.mirroredV139, false);
});
