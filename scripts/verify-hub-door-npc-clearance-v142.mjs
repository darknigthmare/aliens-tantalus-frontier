import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HubGame as RoutineHub, HUB_NPC_ROSTER } from '../src/hub-v62-runtime.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_DESTINATION_CONNECTIONS_V138, getHubDoorDestinationDescriptorsV138 } from '../src/hub-destination-signage-v138.js';
import { getHubDoorFaceV142, projectHubDoorActorV142 } from '../src/hub-door-passage-v142.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { advanceNpcLifeV136, npcWorkAnchorV136, spreadNpcStationSpawnsV136, withHubNpcLifeV136 } from '../src/npc-life-v136.js';

const rooms = HUB_DECKS.flatMap(deck => deck.rooms);
const parentDoors = room => getHubDoorDestinationDescriptorsV138(room).filter(door => door.face === 'parent');
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const specialist = (room, x, extra = {}) => ({ crewId: 'crew-01-mara-vega', roomId: room.id,
  x, y: 532, w: 44, h: 92, min: x, max: x, mobile: false, alive: true, vx: 0,
  routinePhaseV62: 'work', ...extra });
const Hub = withHubNpcLifeV136(RoutineHub);
// Exercise the actual roster/routine factories without browser or renderer
// construction. These are Node fixtures; native passage QA uses real keys.
function cohortAt(hour) {
  const hub = Object.create(Hub.prototype);
  hub.npcRoutineResolutionsV62 = new Map(HUB_NPC_ROSTER.map(npc => [npc.crewId,
    resolveNpcRoutineV62(npc.crewId, { clock: { day: 1, hour } })]));
  return { hub, decks: HUB_DECKS.map((_, deck) => {
    hub.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
    return hub.createNpcs(deck);
  }) };
}

test('the observed Mara/Sanaa archives cohort starts outside the real return bay and never mutates its templates', () => {
  const room = rooms.find(room => room.id === 'briefing');
  const sources = [specialist(room, 1581), specialist(room, 1510, { crewId: 'crew-07-sanaa-doyle' }),
    specialist(room, 1849, { crewId: 'crew-14-echo-a' })];
  const before = structuredClone(sources), placed = spreadNpcStationSpawnsV136(sources, [room]);
  assert.deepEqual(sources, before);
  assert.equal(placed[0].x, 1697); assert.equal(placed[1].x, 1394);
  assert.equal(placed[2].x, sources[2].x, 'An already clear specialist keeps its native position.');
  for (const npc of placed) {
    assert.equal(npc.min, npc.x); assert.equal(npc.max, npc.x);
    for (const door of parentDoors(room)) assert.ok(!overlaps(npc, door.socket));
  }
  assert.equal(npcWorkAnchorV136(sources[0], room), null,
    'The former work anchor near 1638 is inside the same archives bay.');
  const workX = npcWorkAnchorV136(placed[0], room);
  assert.ok(Number.isFinite(workX));
  assert.ok(parentDoors(room).every(door => !overlaps({ ...placed[0], x: workX }, door.socket)));
});

test('all twenty parent sockets reserve the whole body and standing gap, including both maintenance ends', () => {
  let checked = 0;
  for (const room of rooms) for (const door of parentDoors(room)) {
    const socket = door.socket;
    const source = specialist(room, socket.x + socket.w / 2 - 22, { y: socket.y + socket.h - 92 });
    const [placed] = spreadNpcStationSpawnsV136([source], [room]);
    assert.ok(placed.x >= room.xStart + 96 && placed.x + placed.w <= room.xEnd - 96);
    for (const reserved of parentDoors(room)) {
      assert.ok(!overlaps({ ...placed, x: placed.x - 12, w: placed.w + 24 }, reserved.socket), door.id);
    }
    assert.equal(placed.y, source.y); assert.equal(placed.h, source.h);
    checked++;
  }
  assert.equal(checked, 20);
});

test('every real stationary schedule leaves its parent bays and work anchors clear throughout a complete day', () => {
  let checked = 0, anchors = 0, mobile = 0;
  for (let hour = 0; hour < 24; hour += .5) {
    const { hub, decks } = cohortAt(hour);
    for (const [deck, actors] of decks.entries()) {
      hub.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
      const raw = RoutineHub.prototype.createNpcs.call(hub, deck);
      for (const npc of actors) {
        const source = raw.find(entry => entry.crewId === npc.crewId);
        assert.ok(source);
        if (npc.mobile) { assert.deepEqual(npc, source); mobile++; continue; }
        const room = rooms.find(room => room.id === npc.roomId);
        for (const door of parentDoors(room)) assert.ok(!overlaps(npc, door.socket), `${hour}:${npc.crewId}:${door.id}`);
        const x = npcWorkAnchorV136(npc, room);
        if (x !== null) {
          anchors++;
          for (const door of parentDoors(room)) assert.ok(!overlaps({ ...npc, x }, door.socket), `${hour}:${npc.crewId}:work:${door.id}`);
        }
        checked++;
      }
    }
  }
  assert.ok(checked > 300 && anchors > 100 && mobile > 20, 'Cover stationary, working and routing schedules.');
});

test('same-offset arrivals across all twenty real door pairs are clear of the native stationary duty cohort', () => {
  const actors = cohortAt(8).decks.flat();
  let checked = 0;
  for (const room of rooms) for (const descriptor of parentDoors(room)) {
    const connection = HUB_DESTINATION_CONNECTIONS_V138.find(entry => entry.id === descriptor.connectionId);
    const art = HUB_ANNEX_BY_ID_V137[connection.spaceId].art.alphaBounds.door;
    const parent = getHubDoorFaceV142(descriptor.socket, connection.annexSocket, art);
    const local = getHubDoorFaceV142(connection.annexSocket, descriptor.socket, art);
    const span = (local.opening.w - 44) / 2;
    const occupied = actors.filter(npc => npc.roomId === room.id && !npc.mobile);
    for (const offset of [-span, 0, span]) {
      const actor = { x: local.opening.x + local.opening.w / 2 - 22 + offset,
        y: local.socket.y + local.socket.h - 92, w: 44, h: 92, facing: 1 };
      const passage = projectHubDoorActorV142(actor, local, parent, { occupied,
        surfaces: [{ x: 0, y: parent.socket.y + parent.socket.h, w: HUB_WORLD.width, h: 96 }] });
      assert.ok(passage, `${descriptor.id}:${offset}`);
      assert.ok(Math.abs(passage.offsetX - offset) < 1e-7);
      checked++;
    }
  }
  assert.equal(checked, 60);
});

test('walking patrols keep their authored routes and physically cross a passage without a position correction', () => {
  const room = rooms.find(room => room.id === 'briefing'), door = parentDoors(room)[0];
  const source = specialist(room, 1400, { crewId: 'routing-crew', mobile: true, min: 1400, max: 1800,
    resumeVx: 22, patrolSpeed: 22, routinePhaseV62: 'route' });
  const [npc] = spreadNpcStationSpawnsV136([source], [room]);
  assert.deepEqual(npc, source);
  let state, crossed = false;
  for (let frame = 0; frame < 1200; frame++) {
    const previousX = npc.x;
    state = advanceNpcLifeV136(state, npc, 1 / 60, { room });
    npc.x = state.x; npc.vx = state.actualVelocity;
    assert.ok(Math.abs(npc.x - previousX) <= 27 / 60 + 1e-7);
    crossed ||= overlaps(npc, door.socket) && npc.vx > 20;
  }
  assert.ok(crossed); assert.equal(npc.min, source.min); assert.equal(npc.max, source.max);
});

test('an upper landing does not relocate floor crew and normal simulation never repairs a live actor by teleporting it', () => {
  const room = rooms.find(room => room.id === 'crew-quarters');
  const upper = parentDoors(room).find(door => door.destinationId === 'sanitary-bay');
  const floorNpc = specialist(room, upper.socket.x + upper.socket.w / 2 - 22);
  assert.equal(spreadNpcStationSpawnsV136([floorNpc], [room])[0].x, floorNpc.x);
  const archives = rooms.find(room => room.id === 'briefing'), live = specialist(archives, 1581);
  const before = structuredClone(live);
  const state = advanceNpcLifeV136(null, live, 1 / 60, { room: archives });
  assert.equal(state.x, live.x); assert.deepEqual(live, before);
  assert.equal(state.workX, null);
  assert.deepEqual(advanceNpcLifeV136(state, live, 10, { room: archives, suspended: true }), state);
});
