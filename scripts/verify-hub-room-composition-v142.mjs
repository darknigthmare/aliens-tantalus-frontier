import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { getHubRoomLifePlanV136 } from '../src/hub-room-life-v136.js';
import { getHubFurnishingPlacementBoundsV139 } from '../src/hub-furnishing-contact-v139.js';
import { HUB_ROOM_COMPOSITION_ADDITIONS_V142, extendHubRoomFurnishingsV142 } from '../src/hub-room-composition-v142.js';
import { HUB_ANNEX_NPC_DUTIES_V141, getAnnexNpcPlacementV141 } from '../src/hub-annex-npc-life-v141.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137];
const overlap = (a, b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
function production(room) {
  const deck = HUB_DECKS.findIndex(deck => deck.rooms.includes(room));
  const geometry = deck < 0 ? room : buildHubTraversalGeometryV87(deck);
  return getHubRoomLifePlanV136(room, { ladders: geometry.ladders, vents: geometry.vents || [],
    platforms: geometry.platforms, doors: deck < 0 ? [] : buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck) });
}
const plans = new Map(rooms.map(room => [room.id, production(room)]));

test('35 production compartments retain every authored furnishing without overlap, blocked access or hidden rejection', () => {
  assert.equal(rooms.length, 35);
  for (const room of rooms) {
    const plan = plans.get(room.id);
    assert.deepEqual(plan.furnishingV137.rejected, [], room.id);
    assert.deepEqual(plan.workstationDetailsV139.omitted, [], `${room.id}: all requested worktop details have a real host`);
    for (const item of plan.items) {
      const bounds = getHubFurnishingPlacementBoundsV139(item);
      assert.equal(item.collidable, false); assert.equal(item.interactive, false); assert.equal(item.plane, 'rear');
      assert.ok(!plan.spatial.reservations.some(reservation => overlap(bounds, reservation)), `${room.id}:${item.role}`);
      if (item.support === 'rear-floor') assert.ok(Math.abs(item.contactYV139-plan.spatial.planes.rearServiceY) < 1e-8);
    }
    for (let i=0; i<plan.items.length; i++) for (const other of plan.items.slice(i+1))
      assert.ok(!overlap(plan.items[i], other), `${room.id}:${plan.items[i].role}/${other.role}`);
  }
});

test('15 reviewed working groups contribute exactly 33 production items, using existing frontal atlas crops and fixed human sizes', () => {
  assert.equal(Object.keys(HUB_ROOM_COMPOSITION_ADDITIONS_V142).length, 15);
  const additions = Object.values(HUB_ROOM_COMPOSITION_ADDITIONS_V142).flatMap(group => group.items);
  assert.equal(additions.length, 33);
  for (const [roomId, definition] of Object.entries(HUB_ROOM_COMPOSITION_ADDITIONS_V142)) {
    const plan = plans.get(roomId);
    assert.ok(plan, roomId);
    for (const source of definition.items) {
      const entry = plan.items.find(item => item.role === source.role);
      assert.ok(entry, `${roomId}:${source.role} must be in the normal production composition`);
      assert.equal(entry.projectionDxPerY, 0);
      assert.ok(entry.w <= 112 && entry.h <= 96, `${source.role}: no oversized filler`);
      if (source.cell) {
        assert.ok(entry.asset.startsWith('/assets/openai/hub/props/v139/'));
        assert.equal(entry.artProjectionV139, 'strict-side-elevation');
        assert.ok(Math.abs(entry.w/entry.h-entry.source.w/entry.source.h) < 1e-8);
      }
    }
  }
});

test('reference papers and calibration instruments occupy the new counters rather than the console controls', () => {
  const expected = { bridge: 'bridge-watch-reference-counter', 'combat-information': 'tactical-watch-reference-counter', 'sensor-array': 'array-calibration-counter' };
  for (const [roomId, hostRole] of Object.entries(expected)) {
    const plan = plans.get(roomId), detail = plan.workstationDetailsV139.items[0], host = plan.items.find(item => item.role === hostRole);
    assert.ok(host, roomId); assert.equal(host.kind, 'work-counter'); assert.equal(host.support, 'rear-floor');
    assert.equal(detail.hostRole, hostRole); assert.equal(detail.hostType, 'furnishing');
    assert.ok(detail.target.x >= host.x && detail.target.x+detail.target.w <= host.x+host.w);
    assert.ok(Math.abs(detail.contactY-host.y) < 1e-8, `${roomId}: real frontal worktop contact`);
  }
});

test('the measured frontal bridge console also restores its historical navigation records without an extra authored socket', () => {
  const bridge = plans.get('bridge');
  const record = bridge.items.find(item => item.role === 'navigation-records');
  assert.ok(record, 'The real frontal console leaves the former native-service exclusion clear.');
  assert.equal(record.cell, 'data-cabinet'); assert.equal(record.support, 'rear-wall');
  assert.ok(!bridge.furnishingV137.added.some(item => item.role === 'navigation-records'));
  assert.ok(!bridge.spatial.reservations.some(reservation => overlap(record, reservation)));
  assert.equal(bridge.items.length, 10);
});

test('the wide hangar, vehicle, active range and through-maintenance bays retain their deliberate clear working envelopes', () => {
  for (const id of ['dropship-hangar', 'vehicle-bay', 'proving-ground', 'maintenance-spine']) {
    assert.equal(Object.hasOwn(HUB_ROOM_COMPOSITION_ADDITIONS_V142, id), false);
    const plan = plans.get(id);
    assert.ok(plan.spatial.reservations.some(reservation => /parked-vehicle|ladder-clearance/.test(reservation.role)), id);
  }
});

test('all four inhabited annexes retain actual crew placement rails after the furnishing pass', () => {
  assert.equal(new Set(HUB_ANNEX_NPC_DUTIES_V141.map(duty => duty.roomId)).size, 4);
  for (const duty of HUB_ANNEX_NPC_DUTIES_V141) {
    const placement = getAnnexNpcPlacementV141(duty.roomId, duty.crewId);
    assert.ok(placement?.rails.length, `${duty.roomId}:${duty.crewId}`);
    for (const rail of placement.rails) assert.ok(rail.max >= rail.min);
    if(duty.roomId==='flight-control-cockpit')assert.ok(placement.rails.some(rail=>rail.max-rail.min>=70), 'The navigation wall pair must retain a real mobile watch rail for Orlov.');
  }
});

test('the bedside group clears the relocated refuge portal with its real approach and keeps book, mug and safety cabinet supported', () => {
  const plan=plans.get('crew-quarters'),refuge=HUB_ANNEXES_V137.find(room=>room.id==='personal-refuge');
  const table=plan.items.find(item=>item.role==='crew-bedside-table');
  const cabinet=plan.items.find(item=>item.role==='quarters-fire-safety');
  const detail=plan.workstationDetailsV139.items.find(item=>item.cell==='book-and-mug');
  assert.ok(table&&cabinet&&detail);assert.equal(detail.hostRole,table.role);
  assert.ok(table.x+table.w+3<refuge.parentDoorBounds.x-22, 'The whole bedside table clears the actual portal approach.');
  assert.ok(cabinet.x+cabinet.w+3<refuge.parentDoorBounds.x-22, 'The safety cabinet remains outside the same doorway envelope.');
  assert.ok(!overlap(cabinet,detail.target));assert.ok(detail.target.y-cabinet.y-cabinet.h>=8, 'Readable space remains between the cabinet and the book/mug silhouette.');
  assert.ok(Math.abs(detail.contactY-detail.supportY)<1e-8);assert.equal(table.contactYV139,plan.spatial.planes.rearServiceY);
  const handleY=cabinet.y+cabinet.h/2;assert.ok(handleY>=plan.floorY-96.5&&handleY<=plan.floorY-36);
});

test('the cockpit wall pair serves the existing checklist cart and leaves the pilot approach at adult head height clear', () => {
  const plan=plans.get('flight-control-cockpit');
  const manual=plan.items.find(item=>item.role==='flight-checklist-manual-stock');
  const cart=plan.items.find(item=>item.role==='flight-checklist-cart');
  const clock=plan.items.find(item=>item.role==='flight-navigation-time-reference');
  assert.ok(manual&&cart&&clock);assert.equal(manual.support,'rear-wall');assert.equal(clock.support,'rear-wall');
  assert.ok(Math.abs(manual.x+manual.w/2-cart.x-cart.w/2)<1e-8, 'Manuals sit directly above the existing checklist cart.');
  assert.ok(manual.y+manual.h<cart.y);assert.ok(manual.y+manual.h/2>=plan.floorY-96.5, 'The actual manual shelf is within the standing adult reach band.');
  assert.ok(clock.y+clock.h<plan.floorY-96.5, 'The distant time display stays above every standing crew silhouette.');
});

test('composition extension is deterministic, does not mutate input and leaves unrelated rooms untouched', () => {
  const input = { bridge: { items: [{ role: 'existing-watch' }], replaceKinds: [] }, untouched: { items: [] } };
  const before = structuredClone(input), one = extendHubRoomFurnishingsV142(input), two = extendHubRoomFurnishingsV142(input);
  assert.deepEqual(input, before); assert.deepEqual(one, two);
  assert.equal(one.untouched, input.untouched); assert.equal(one.bridge.items[0], input.bridge.items[0]);
  assert.equal(one.bridge.items.length, 4); assert.ok(Object.isFrozen(HUB_ROOM_COMPOSITION_ADDITIONS_V142.bridge.items));
});
