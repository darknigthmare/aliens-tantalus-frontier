import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HubGame } from '../src/hub-opening-v88.js';
import { getHubRecessedPortalV136 } from '../src/hub-spatial-design-v136.js';
import { getHubShipConnectionsForSpaceV137 } from '../src/hub-ship-layout-v137.js';
import { HUB_DESTINATION_CONNECTIONS_V138, getHubDoorDestinationDescriptorsV138,
  getHubDestinationSignPlansV138, getHubDestinationSignReservationsV138 } from '../src/hub-destination-signage-v138.js';
import { drawHubDestinationSignV138, withHubDestinationSignsV138 } from '../src/hub-destination-signage-runtime-v138.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137.map(annex => ({ ...annex, xStart: 0 }))];
const options = { portalTargetForBounds: bounds => getHubRecessedPortalV136(bounds).target };
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const plans = room => getHubDestinationSignPlansV138(room, options);
function canvas() {
  let depth = 0;
  const texts = [], fills = [], ctx = new Proxy({ save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    fillText(...args) { texts.push(args); }, fillRect(...args) { fills.push(args); }
  }, { get: (target, property) => property in target ? target[property] : () => {} });
  return { ctx, texts, fills, balanced: () => assert.equal(depth, 0) };
}

test('all twenty connections name real native destinations on both faces without inventing a route', () => {
  assert.equal(HUB_DESTINATION_CONNECTIONS_V138.length, 20);
  const descriptors = rooms.flatMap(getHubDoorDestinationDescriptorsV138);
  assert.equal(descriptors.length, 40); assert.equal(new Set(descriptors.map(item => item.id)).size, 40);
  for (const descriptor of descriptors) {
    assert.ok(rooms.some(room => room.id === descriptor.destinationId), descriptor.destinationId);
    assert.ok(descriptor.label && descriptor.destinationName); assert.ok(!descriptor.label.includes('E —'));
    if (descriptor.face !== 'parent') continue;
    const room = rooms.find(room => room.id === descriptor.roomId), deck = HUB_DECKS.findIndex(deck => deck.rooms.some(item => item.id === room.id));
    const host = { state: { deck }, currentRoom: () => room, isAnnexActiveV71: () => false,
      v51Platforms: buildHubTraversalGeometryV87(deck).platforms };
    const connection = HUB_DESTINATION_CONNECTIONS_V138.find(item => item.id === descriptor.connectionId);
    const native = HubGame.prototype.getParentAnnexDoorV71.call(host, connection.spaceId, connection.endpointId);
    assert.deepEqual(descriptor.socket, native.bounds, descriptor.id);
  }
});

test('thirty-eight new plaques use the actual rendered portal top and delegate the two existing maintenance signs', () => {
  const all = rooms.flatMap(plans); assert.equal(all.length, 38);
  assert.equal(all.filter(sign => sign.face === 'parent').length, 20); assert.equal(all.filter(sign => sign.face === 'return').length, 18);
  assert.equal(plans(rooms.find(room => room.id === 'maintenance-spine')).length, 0);
  assert.equal(getHubDoorDestinationDescriptorsV138(rooms.find(room => room.id === 'maintenance-spine')).filter(d => d.delegatedToV137).length, 2);
  assert.deepEqual(getHubDestinationSignPlansV138(rooms[0]), [], 'An unknown renderer target must never be guessed.');
  for (const room of rooms) for (const sign of plans(room)) {
    assert.deepEqual(sign.portalTarget, getHubRecessedPortalV136(sign.socket).target);
    assert.equal(sign.interactive, false); assert.equal(sign.collidable, false); assert.equal(sign.cameraFactor, 1);
    assert.equal(sign.projection, 'orthographic-wall-plaque');
    const reserve = getHubDestinationSignReservationsV138(room, options).find(entry => entry.sourceId === sign.id);
    assert.deepEqual({ x: reserve.x, y: reserve.y, w: reserve.w, h: reserve.h }, sign.frame);
  }
});

test('destination frames stay clear of actual vents, ladder rails and traversal decks except for their own named mounting fascia', () => {
  let checked = 0;
  for (const room of rooms) {
    const deck = HUB_DECKS.findIndex(deck => deck.rooms.some(candidate => candidate.id === room.id));
    const geometry = room.world ? { platforms: room.platforms, ladders: room.ladders, vents: [] } : buildHubTraversalGeometryV87(deck);
    for (const sign of plans(room)) {
      const obstacles = [...geometry.platforms.filter(p => p.role !== 'floor' && p.id !== sign.mount.platformId), ...geometry.vents,
        ...geometry.ladders.map(ladder => ({ id: ladder.id, x: ladder.x - (room.world ? 0 : ladder.w / 2),
          y: ladder.top, w: ladder.w, h: ladder.bottom - ladder.top }))];
      for (const obstacle of obstacles) assert.equal(overlap(sign.frame, obstacle), false, `${sign.id} crosses ${obstacle.id}`);
      checked++;
    }
  }
  assert.equal(checked, 38);
});

test('the upper sanitary sign clears the room header and the two crowded lower doors mount on their real structural fascia', () => {
  const quarters = HUB_DECKS[1].rooms[0], signs = plans(quarters);
  assert.equal(signs.length, 3);
  const sanitary = signs.find(sign => sign.destinationId === 'sanitary-bay');
  assert.ok(sanitary.frame.y >= 186 && sanitary.frame.y + sanitary.frame.h < sanitary.portalTarget.y);
  assert.equal(overlap(sanitary.frame, { x: 506, y: 186, w: 268, h: 48 }), false);
  const refuge = signs.find(sign => sign.destinationId === 'personal-refuge');
  const hangar = HUB_DECKS[3].rooms[0], arrival = plans(hangar).find(sign => sign.destinationId === 'arrival-airlock');
  for (const sign of [refuge, arrival]) {
    assert.equal(sign.mount.kind, 'native-landing-fascia');
    const deck = sign === refuge ? 1 : 3, surface = buildHubTraversalGeometryV87(deck).platforms.find(p => p.id === sign.mount.platformId);
    assert.ok(sign.bounds.x >= surface.x && sign.bounds.x + sign.bounds.w <= surface.x + surface.w);
    assert.ok(sign.bounds.y >= surface.y && sign.bounds.y + sign.bounds.h <= surface.y + surface.h);
  }
  const civil = plans(hangar).find(sign => sign.destinationId === 'frontier-civil-counter');
  assert.equal(civil.bounds.x, civil.socket.x); assert.ok(civil.bounds.x + civil.bounds.w <= 134);
});

test('changing the room origin translates every plaque once without changing its label, projection, size or native door', () => {
  for (const room of rooms) {
    const before = structuredClone(room), first = plans(room), moved = plans({ ...room, xStart: room.xStart + 90000 });
    assert.equal(first.length, moved.length);
    first.forEach((sign, index) => {
      assert.equal(moved[index].bounds.x - sign.bounds.x, 90000); assert.equal(moved[index].socket.x - sign.socket.x, 90000);
      for (const property of ['label', 'fontSize', 'projection', 'plane', 'face']) assert.equal(moved[index][property], sign[property]);
      assert.equal(moved[index].bounds.y, sign.bounds.y); assert.equal(moved[index].bounds.w, sign.bounds.w);
    });
    assert.deepEqual(room, before);
  }
});

test('a plaque renders unscaled text and restores the canvas without modifying its source descriptor', () => {
  const subject = canvas(), sign = plans(HUB_DECKS[1].rooms[0])[0], before = structuredClone(sign);
  assert.equal(drawHubDestinationSignV138(subject.ctx, sign), true); subject.balanced();
  assert.equal(subject.texts.length, 1); assert.equal(subject.texts[0].length, 3, 'Canvas maxWidth must not squash destination names.');
  assert.equal(subject.texts[0][0], sign.label); assert.deepEqual(sign, before);
});

test('fallback exit text defers only to a plaque actually drawn this frame and resumes with editor or omitted rendering', () => {
  const subject = canvas(), annex = HUB_ANNEXES_V137.find(room => room.id === 'flight-control-cockpit');
  const connection = getHubShipConnectionsForSpaceV137(annex.id)[0];
  const exit = { endpointId: connection.id, parentRoomId: connection.parentRoomId, bounds: connection.annexDoorBounds };
  class Base {
    drawAnnexExitLabelV137 = HubGame.prototype.drawAnnexExitLabelV137;
    drawAnnexGeometryV71() { return 'native-geometry'; }
    draw() { if (this.emitPlaque) this.drawAnnexGeometryV71(subject.ctx, annex); this.drawAnnexExitLabelV137(subject.ctx, annex, exit); }
    getSnapshot() { return { unchanged: true }; }
  }
  const Engine = withHubDestinationSignsV138(Base), hub = new Engine();
  hub.draw(); assert.equal(subject.texts.filter(([text]) => text === 'PASSERELLE').length, 1);
  assert.equal(hub.hasRenderedHubDestinationSignV138(connection.id), false);
  subject.texts.length = 0; hub.emitPlaque = true; hub.draw();
  assert.equal(subject.texts.filter(([text]) => text === 'PASSERELLE').length, 1);
  assert.equal(hub.hasRenderedHubDestinationSignV138(connection.id), true);
  assert.equal(hub.getSnapshot().hubDestinationSignsV138.rendered.length, 1);
  subject.texts.length = 0; hub.emitPlaque = false; hub.draw();
  assert.equal(hub.hasRenderedHubDestinationSignV138(connection.id), false); assert.equal(subject.texts.length, 1);
  subject.texts.length = 0; hub.emitPlaque = true; hub.editorPlaytest = true; hub.draw();
  assert.equal(hub.hasRenderedHubDestinationSignV138(connection.id), false); assert.equal(subject.texts.length, 1);
  assert.deepEqual(hub.getSnapshot().hubDestinationSignsV138.rendered, []); assert.equal(withHubDestinationSignsV138(Engine), Engine);
  subject.balanced();
});

test('legacy annex records and runtime geometry remain unchanged by planning and drawing their destination labels', () => {
  for (const annex of HUB_ANNEXES_V87) {
    const before = structuredClone(annex), subject = canvas();
    for (const sign of plans({ ...annex, xStart: 0 })) drawHubDestinationSignV138(subject.ctx, sign);
    assert.deepEqual(annex, before); subject.balanced();
  }
});
