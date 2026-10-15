import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HubGame as TraversalHub, buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HubGame as VentHub } from '../src/hub-v62-runtime.js';

const clone = value => structuredClone(value);
const medical = () => buildHubTraversalGeometryV87(1).vents.find(vent => vent.id === 'medical-vent');
function fixture(side = 'left', gap = 40) {
  const vent = medical();
  const hub = Object.assign(Object.create(VentHub.prototype), {
    running: true, editorPlaytest: false, ventActorV62: null,
    state: { deck: 1, roomId: 'medical', visited: [] },
    player: { x: side === 'left' ? vent.x - 44 - gap : vent.x + vent.w + gap,
      y: vent.y + vent.h - 92, w: 44, h: 92, vx: 0, vy: 0,
      grounded: true, climbing: false, crouching: false, alive: true },
    v51Vents: [vent], v51Ladders: [], v51Doors: [], v51Terminals: [],
    v51Walls: [], doorStates: [], obstacles: [], enemies: [],
    nearestInteraction: () => null, nearestLift: () => undefined
  });
  return { hub, vent };
}

test('the real medical grate announces holding C before body contact from either side', () => {
  for (const side of ['left', 'right']) {
    const { hub, vent } = fixture(side, 40), before = clone({ player: hub.player, vents: hub.v51Vents, state: hub.state });
    assert.equal(hub.nearestVent(), null, 'An approach must not become an E interaction.');
    assert.equal(hub.nearbyCrawlVentV138(), vent);
    assert.match(hub.statusPrompt(), /C — MAINTENIR POUR RAMPER/);
    assert.deepEqual({ player: hub.player, vents: hub.v51Vents, state: hub.state }, before);
  }
});

test('standing collision still stops at both exact edges while the crouch instruction remains visible', () => {
  for (const side of ['left', 'right']) {
    const { hub, vent } = fixture(side, 1), previousX = hub.player.x;
    hub.player.vx = side === 'left' ? 270 : -270;
    hub.player.x += side === 'left' ? 3 : -3;
    TraversalHub.prototype.resolveHorizontal.call(hub, previousX);
    assert.equal(hub.player.x, side === 'left' ? vent.x - hub.player.w : vent.x + vent.w);
    assert.equal(hub.player.vx, 0);
    assert.equal(hub.nearestVent(), null, 'The exact blocking edge is outside the native overlap.');
    assert.match(hub.statusPrompt(), /C — MAINTENIR POUR RAMPER/);
  }
});

test('the instruction disappears beyond the short approach range and on another floor, in the air or on a ladder', () => {
  const { hub, vent } = fixture('left', 65);
  assert.equal(hub.nearbyCrawlVentV138(), null); assert.equal(hub.statusPrompt(), '');
  hub.player.x = vent.x - hub.player.w - 24;
  hub.player.y = 624 - hub.player.h;
  assert.equal(hub.nearbyCrawlVentV138(), null); assert.equal(hub.statusPrompt(), '');
  hub.player.y = vent.y - hub.player.h;
  assert.equal(hub.nearbyCrawlVentV138(), null);
  hub.player.y = vent.y + vent.h - hub.player.h; hub.player.grounded = false;
  assert.equal(hub.nearbyCrawlVentV138(), null); assert.equal(hub.statusPrompt(), '');
  hub.player.grounded = true; hub.player.climbing = true;
  assert.equal(hub.nearbyCrawlVentV138(), null);
});

test('dead actors, threats, native terminals, doors and ladders keep their existing prompt priority', () => {
  const { hub } = fixture();
  hub.player.alive = false; assert.match(hub.statusPrompt(), /EXTRACTION MÉDICALE/); hub.player.alive = true;
  hub.enemies = [{ alive: true }]; assert.match(hub.statusPrompt(), /TIRER/); hub.enemies = [];
  hub.v51Terminals = [{ x: hub.player.x }]; assert.match(hub.statusPrompt(), /ACTIVER LE TERMINAL/); hub.v51Terminals = [];
  hub.v51Doors = [{ x: hub.player.x }]; assert.match(hub.statusPrompt(), /ACTIONNER LE SAS/); hub.v51Doors = [];
  hub.v51Ladders = [{ x: hub.player.x + 22, top: hub.player.y, bottom: hub.player.y + 92, w: 52 }];
  assert.match(hub.statusPrompt(), /GRIMPER/);
});

test('the native E dispatcher still requires overlap and keeps its original hatch prompt once inside', () => {
  const { hub, vent } = fixture(); let entries = 0;
  hub.enterVentAtCurrentRoomV62 = () => { entries++; };
  hub.interact(); assert.equal(entries, 0);
  hub.player.x = vent.x - hub.player.w + 1;
  assert.equal(hub.nearestVent(), vent);
  assert.equal(hub.statusPrompt(), 'E — OUVRIR LA TRAPPE ET ENTRER DANS LE CONDUIT');
  hub.interact(); assert.equal(entries, 1);
});

test('crouched traversal keeps its native collision exemption and an editor grate retains the C instruction', () => {
  const { hub, vent } = fixture('left', 1), previousX = hub.player.x;
  hub.player.crouching = true; hub.player.x += 12; hub.player.vx = 105;
  const requestedX = hub.player.x;
  TraversalHub.prototype.resolveHorizontal.call(hub, previousX);
  assert.equal(hub.player.x, requestedX); assert.equal(hub.player.vx, 105);
  assert.equal(hub.nearestVent(), vent);
  hub.editorPlaytest = true;
  assert.match(hub.statusPrompt(), /C — MAINTENIR POUR RAMPER/);
});
