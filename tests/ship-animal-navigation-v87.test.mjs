import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame } from '../src/hub-onboarding-v84.js';
import { HUB_DECKS, HUB_WORLD, getHubDoorBounds } from '../src/hub-game.js';
import {
  buildShipAnimalNavigationV87, planShipAnimalRouteV87, stepShipAnimalRouteV87,
  sampleShipAnimalRouteV87, SHIP_ANIMAL_DOOR_OPEN_V87
} from '../src/ship-animal-navigation-v87.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 0.001, message || String(a) + ' ≠ ' + String(b));
const BODIES = { 'animal-moka': { w: 44, h: 28 }, 'animal-brume': { w: 68, h: 42 } };
const roomLocation = (roomId, x) => ({ deckId: 'habitat', roomId, x, y: HUB_WORLD.floorY });
const restRegion = {
  id: 'mess:rest-only-test', roomId: 'mess',
  bounds: { x: 1280, y: 0, w: 520, h: HUB_WORLD.floorY }, tags: ['mess-rest-area']
};

// This fixture instantiates the production hub. Image/RAF stubs affect rendering
// only: the bunk, table, platforms and real door bounds remain fully collidable.
function activeHubGeometry() {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame, matchMedia: globalThis.matchMedia };
  globalThis.Image = class {
    constructor() { this.complete = false; this.naturalWidth = 1920; this.naturalHeight = 720; }
    set src(value) { this.currentSrc = value; }
  };
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.matchMedia = () => ({ matches: false });
  try {
    const ctx = new Proxy({
      measureText: (value) => ({ width: String(value).length * 8 }),
      createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} })
    }, { get: (object, key) => key in object ? object[key] : () => {},
      set: (object, key, value) => { object[key] = value; return true; } });
    const hub = new HubGame({ width: 1280, height: 720, getContext: () => ctx, addEventListener() {}, focus() {} });
    hub.start({ deck: 1, roomId: 'crew-quarters', positionX: 180, visited: ['crew-quarters'] });
    assert.equal(hub.useGlobalFloor, true);
    assert.equal(hub.state.deck, 1);
    return {
      deckId: HUB_DECKS[hub.state.deck].id,
      floor: { id: 'habitat:floor', x: 0, y: hub.floorY, w: HUB_WORLD.width },
      obstacles: clone(hub.obstacles), platforms: clone(hub.v51Platforms),
      doors: hub.doorStates.map((door) => ({ ...clone(door), bounds: getHubDoorBounds(door) }))
    };
  } finally { Object.assign(globalThis, previous); }
}
const ACTUAL = activeHubGeometry();
function graph(options = {}) {
  return buildShipAnimalNavigationV87({ ...clone(ACTUAL), ...options });
}
function restGraph(options = {}) {
  return graph({ regions: [clone(restRegion)], ...options });
}
function route(nav, actorId = 'animal-moka', location = roomLocation('crew-quarters', 400),
  target = roomLocation('crew-quarters', 700), options = {}) {
  return planShipAnimalRouteV87(nav, { actorId, location, target, body: BODIES[actorId], speed: 60, ...options });
}
function requireRoute(...args) {
  const result = route(...args);
  assert.equal(result.ok, true, result.reason);
  return result.state;
}
function openDoors(nav) { return nav.doors.map((door) => ({ ...door, progress: 1 })); }
function fullDuration(state) { return state.segments.reduce((sum, segment) => sum + segment.duration, 0); }
function assertOneLocation(state) {
  assert.equal(typeof state.actorId, 'string');
  assert.ok(['room', 'transit'].includes(state.location.kind));
  assert.equal(state.location.deckId, 'habitat');
  if (state.location.kind === 'transit') {
    assert.equal(state.location.roomId, null);
    assert.equal(state.location.spaceId, null);
    assert.equal(typeof state.location.edgeId, 'string');
    assert.ok(state.location.progress > 0 && state.location.progress < 1);
    assert.equal('x' in state.location, false, 'transit has one edge anchor, not a second room position');
  } else {
    assert.equal(typeof state.location.roomId, 'string');
    assert.equal(typeof state.location.spaceId, 'string');
    assert.equal(state.location.y, 624);
  }
}
function certifiedAnnex() {
  // Authored integration contract under test, not an assertion that V71 contains
  // an animal room already. Its parent bounds occupy verified empty floor space.
  return {
    id: 'animal-care', kind: 'animal-care-annex', parentRoomId: 'crew-quarters', deckId: 'habitat',
    world: { width: 1920 }, floor: { id: 'animal-care:floor', x: 0, y: 624, w: 1920 },
    obstacles: [], platforms: [],
    door: {
      id: 'crew-quarters:animal-care', progress: 1, duration: 0.6,
      parentBounds: { x: 648, y: 432, w: 112, h: 192 },
      annexBounds: { x: 88, y: 432, w: 112, h: 192 }
    },
    regions: [{ id: 'animal-care:rest', roomId: 'animal-care',
      bounds: { x: 0, y: 0, w: 1920, h: 624 }, tags: ['certified-pet-room'] }]
  };
}

test('graph derives real Habitat rooms, supports and physical bounds without creating owned animals', () => {
  const input = clone(ACTUAL);
  const before = clone(input);
  const nav = buildShipAnimalNavigationV87(input);
  assert.equal(nav.valid, true);
  assert.deepEqual(nav.rooms.map((room) => room.id), HUB_DECKS[1].rooms.map((room) => room.id));
  assert.deepEqual(nav.rooms.map((room) => [room.bounds.x, room.bounds.w]), [[0, 1280], [1280, 1280], [2560, 1280], [3840, 1280]]);
  assert.equal(nav.rooms[0].obstacles[0].x, 809);
  assert.equal(nav.rooms[0].obstacles[0].h, 82);
  assert.ok(nav.rooms[0].platforms.some((platform) => platform.id === 'quarters-low'));
  assert.equal(nav.doors.find((door) => door.id === 'habitat:hub-west-bulkhead').bounds.x, getHubDoorBounds(ACTUAL.doors[0]).x);
  assert.equal('animals' in nav, false);
  assert.equal('ownedAnimalIds' in nav, false);
  assert.deepEqual(input, before);
});

test('missing, displaced or invented authoritative floor and unknown deck are rejected', () => {
  for (const options of [
    { floor: null }, { floor: { x: 0, y: 623, w: 5120 } },
    { floor: { x: -1, y: 624, w: 5120 } }, { floor: { x: 0, y: 624, w: 6000 } },
    { deckId: 'invented-deck' }
  ]) {
    const nav = graph(options);
    assert.equal(nav.valid, false);
    assert.equal(route(nav).reason, 'invalid-graph');
  }
});

for (const actorId of Object.keys(BODIES)) {
  test(actorId + ': actual quarters floor traversal is continuous, supported and reversible', () => {
    const nav = graph();
    for (const [from, to] of [[400, 700], [700, 400]]) {
      let state = requireRoute(nav, actorId, roomLocation('crew-quarters', from), roomLocation('crew-quarters', to));
      const before = clone(state);
      for (let frame = 0; frame < 301; frame += 1) {
        const x = state.location.x;
        const next = stepShipAnimalRouteV87(nav, state, 1 / 60);
        assert.equal(next.ok, true);
        state = next.state;
        assert.ok(Math.abs(state.location.x - x) <= state.speed / 60 + 0.001, 'no transport warp');
        assertOneLocation(state);
        if (state.status === 'arrived') break;
      }
      assert.equal(state.status, 'arrived');
      near(state.location.x, to);
      near(state.location.y, HUB_WORLD.floorY);
      assert.equal(before.location.x, from, 'input save remains untouched');
    }
  });

  test(actorId + ': actual 82px bunk blocks ground travel towards mess without removing collision', () => {
    const nav = restGraph();
    assert.equal(route(nav, actorId, roomLocation('crew-quarters', 700), roomLocation('crew-quarters', 1100)).reason,
      'no-authorized-ground-route');
    assert.equal(route(nav, actorId, roomLocation('crew-quarters', 700), roomLocation('mess', 1500)).reason,
      'no-authorized-ground-route');
    assert.equal(nav.rooms[0].obstacles[0].h, 82);
  });

  test(actorId + ': room-sized animal-care annex has a real ground approach and timed door both ways', () => {
    const nav = graph({ annexes: [certifiedAnnex()] });
    assert.equal(nav.valid, true);
    for (const [from, to] of [
      [roomLocation('crew-quarters', 600), roomLocation('animal-care', 400)],
      [roomLocation('animal-care', 400), roomLocation('crew-quarters', 600)]
    ]) {
      let state = requireRoute(nav, actorId, from, to);
      const doorIndex = state.segments.findIndex((segment) => segment.kind === 'door');
      assert.equal(doorIndex, 1);
      const door = state.segments[doorIndex];
      assert.equal(door.duration, 0.6);
      assert.deepEqual([door.from.x, door.to.x].sort((a, b) => a - b), [144, 704]);
      const approachDuration = state.segments[0].duration;
      state = stepShipAnimalRouteV87(nav, state, approachDuration + 0.2).state;
      assert.equal(state.location.kind, 'transit');
      assertOneLocation(state);
      near(state.location.progress, 1 / 3);
      state = stepShipAnimalRouteV87(nav, state, 20).state;
      assert.equal(state.status, 'arrived');
      assert.equal(state.location.roomId, to.roomId);
      near(state.location.x, to.x);
      assertOneLocation(state);
    }
  });

  test(actorId + ': physical bulkhead respects width, elapsed crossing time and canonical room transition', () => {
    const nav = restGraph();
    let state = requireRoute(nav, actorId, roomLocation('crew-quarters', 1100), roomLocation('mess', 1500));
    const door = state.segments.find((segment) => segment.kind === 'door');
    near(door.duration, Math.abs(door.to.x - door.from.x) / state.speed);
    const durationToDoor = state.segments[0].duration;
    state = stepShipAnimalRouteV87(nav, state, durationToDoor + door.duration / 2, { doors: openDoors(nav) }).state;
    assert.equal(state.location.kind, 'transit');
    assertOneLocation(state);
    near(sampleShipAnimalRouteV87(state).x, 1280);
    state = stepShipAnimalRouteV87(nav, state, door.duration / 2 + 4, { doors: openDoors(nav) }).state;
    assert.equal(state.status, 'arrived');
    assert.equal(state.location.roomId, 'mess');
    near(state.location.x, 1500);
    assertOneLocation(state);
  });
}

test('mess is forbidden by default; a certified rest strip does not permit the kitchen or every room', () => {
  assert.equal(route(graph(), 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500)).reason, 'forbidden-region');
  const nav = restGraph();
  assert.equal(route(nav, 'animal-moka', roomLocation('mess', 1500), roomLocation('mess', 1850)).reason, 'unsafe-destination');
  assert.equal(route(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500)).ok, true);
  const attemptedLab = graph({ regions: [{
    id: 'fake-lab-rest', roomId: 'science-lab', bounds: { x: 3840, y: 0, w: 1280, h: 624 },
    tags: ['mess-rest-area', 'certified-pet-room']
  }] });
  assert.equal(route(attemptedLab, 'animal-moka', roomLocation('crew-quarters', 700), roomLocation('science-lab', 4200)).reason, 'forbidden-region');
});

test('danger tags cannot certify a room even when accompanied by an allowed rest tag', () => {
  for (const tag of ['exterior-airlock', 'biohazard-quarantine', 'pathogen-lab', 'active-firing-range',
    'active-hangar', 'reactor-core', 'hazardous-machinery', 'ammunition-storage', 'critical-duct']) {
    const nav = graph({ regions: [{ id: tag, roomId: 'crew-quarters', bounds: { x: 0, y: 0, w: 1280, h: 624 }, tags: ['crew-rest', tag] }] });
    assert.equal(route(nav).reason, 'forbidden-region', tag);
  }
});

test('closed normal doors wait without mutating them and resume only after the real opening threshold', () => {
  const nav = restGraph();
  const before = structuredClone(nav);
  const initial = requireRoute(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500));
  let state = stepShipAnimalRouteV87(nav, initial, 10).state;
  assert.equal(state.status, 'waiting');
  assert.equal(state.reason, 'door-closed');
  assert.equal(state.location.kind, 'room');
  near(state.location.x, state.segments[1].from.x);
  const atDoor = clone(state.location);
  state = stepShipAnimalRouteV87(nav, state, 5, { doors: nav.doors.map((door) => ({ ...door, progress: SHIP_ANIMAL_DOOR_OPEN_V87 - 0.001 })) }).state;
  assert.deepEqual(state.location, atDoor);
  state = stepShipAnimalRouteV87(nav, state, 0.2, { doors: nav.doors.map((door) => ({ ...door, progress: SHIP_ANIMAL_DOOR_OPEN_V87 })) }).state;
  assert.equal(state.status, 'moving');
  assert.equal(state.location.kind, 'transit');
  assert.deepEqual(nav, before);
  assert.equal(initial.location.x, 1100);
});

test('lock or biohazard blocks planning; dynamic lock holds a midway animal on the same edge', () => {
  for (const decoration of [{ locked: true }, { levelLocked: true }, { permissionDenied: true }, { tags: ['biohazard-quarantine'] }]) {
    const nav = restGraph({ doors: ACTUAL.doors.map((door) => ({ ...door, progress: 1, ...decoration })) });
    assert.equal(route(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500)).ok, false);
  }
  const nav = restGraph();
  let state = requireRoute(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500));
  state = stepShipAnimalRouteV87(nav, state, state.segments[0].duration + 0.4, { doors: openDoors(nav) }).state;
  const before = clone(state.location);
  state = stepShipAnimalRouteV87(nav, state, 20, { doors: openDoors(nav).map((door) => ({ ...door, locked: true })) }).state;
  assert.equal(state.reason, 'door-locked');
  assert.equal(state.status, 'blocked');
  assert.deepEqual(state.location, before);
  state = stepShipAnimalRouteV87(nav, state, 0.1, { doors: openDoors(nav) }).state;
  assert.equal(state.status, 'moving');
  assert.ok(state.location.progress > before.progress);
});

test('explicit live door inventory is authoritative: missing door does not use an old open snapshot', () => {
  const nav = restGraph({ doors: ACTUAL.doors.map((door) => ({ ...door, progress: 1 })) });
  const initial = requireRoute(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500));
  const result = stepShipAnimalRouteV87(nav, initial, 20, { doors: [] });
  assert.equal(result.state.reason, 'door-missing');
  assert.equal(result.state.location.roomId, 'crew-quarters');
});

test('a hazard pauses the existing route without relocating the animal or deleting its path', () => {
  const nav = graph();
  let state = requireRoute(nav);
  state = stepShipAnimalRouteV87(nav, state, 1).state;
  const before = clone(state.location);
  const segments = clone(state.segments);
  state = stepShipAnimalRouteV87(nav, state, 100, { blockedRoomIds: ['crew-quarters'] }).state;
  assert.equal(state.reason, 'unsafe-region');
  assert.deepEqual(state.location, before);
  assert.deepEqual(state.segments, segments);
  state = stepShipAnimalRouteV87(nav, state, 0.5).state;
  near(state.location.x, before.x + 30);
});

test('real platforms remain overhead clearance, while physical obstacles do not become invisible traversal holes', () => {
  assert.equal(route(graph(), 'animal-moka', roomLocation('crew-quarters', 400), roomLocation('crew-quarters', 600),
    { body: { w: 44, h: 130 } }).reason, 'unsafe-origin');
  const obstacles = [...ACTUAL.obstacles, { x: 580, y: 604, w: 20, h: 20, roomId: 'crew-quarters', collisionOnly: false }];
  assert.equal(route(graph({ obstacles })).reason, 'no-authorized-ground-route');
  obstacles.at(-1).collidable = false;
  assert.equal(route(graph({ obstacles })).ok, true, 'only explicit noncollidable art is ignored');
});

test('door corridor, not just endpoints, must be clear and fully certified', () => {
  const nav = restGraph({ obstacles: [...ACTUAL.obstacles, { x: 1270, y: 604, w: 20, h: 20 }] });
  assert.equal(route(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500)).reason, 'no-authorized-ground-route');
  const gap = restGraph({ regions: [{ ...clone(restRegion), bounds: { x: 1290, y: 0, w: 510, h: 624 } }] });
  assert.equal(route(gap, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500)).reason, 'no-authorized-ground-route');
  const open = restGraph();
  let state = requireRoute(open, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500));
  state = stepShipAnimalRouteV87(open, state, state.segments[0].duration).state;
  state = stepShipAnimalRouteV87(nav, state, 2, { doors: openDoors(nav) }).state;
  assert.equal(state.reason, 'approach-obstructed');
  assert.equal(state.location.roomId, 'crew-quarters');
});

test('uncertified elevators require escort and humanoid ladders, vents and ducts are never graph shortcuts', () => {
  const nav = restGraph();
  assert.ok(nav.doors.some((door) => door.lift));
  for (const target of [{ ...roomLocation('mess', 1500), kind: 'lift' },
    { roomId: 'briefing', deckId: 'command', x: 1470, y: 624 }]) {
    const result = route(nav, 'animal-moka', roomLocation('crew-quarters', 1100), target);
    assert.equal(result.reason, 'unsupported-need-escort');
    assert.equal(result.needsEscort, true);
  }
  for (const kind of ['ladder', 'vent', 'duct']) {
    assert.equal(route(nav, 'animal-moka', undefined, { ...roomLocation('crew-quarters', 700), kind }).reason, 'unsupported-traversal');
    const fakeConnector = restGraph({ doors: ACTUAL.doors.map((door) => ({ ...door, kind, lift: false, progress: 1 })) });
    assert.equal(route(fakeConnector, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500)).reason, 'no-authorized-ground-route');
  }
});

test('annex requires animal-specific certification, real floor door bounds and a distinct room identity', () => {
  for (const mutate of [
    (annex) => { annex.kind = 'memorial'; },
    (annex) => { delete annex.door.id; },
    (annex) => { annex.id = 'crew-quarters'; },
    (annex) => { annex.deckId = 'engineering'; },
    (annex) => { annex.door.parentBounds.y = 100; },
    (annex) => { annex.door.annexBounds.y = 100; },
    (annex) => { annex.parentRoomId = 'invented'; }
  ]) {
    const annex = certifiedAnnex();
    mutate(annex);
    assert.equal(graph({ annexes: [annex] }).valid, false);
  }
  const notCertified = certifiedAnnex();
  notCertified.regions[0].tags = ['crew-rest'];
  assert.equal(route(graph({ annexes: [notCertified] }), 'animal-moka',
    roomLocation('crew-quarters', 700), roomLocation('animal-care', 400)).reason, 'forbidden-region');
  const blocked = certifiedAnnex();
  blocked.obstacles.push({ x: 240, y: 580, w: 80, h: 44 });
  assert.equal(route(graph({ annexes: [blocked] }), 'animal-brume',
    roomLocation('crew-quarters', 700), roomLocation('animal-care', 400)).reason, 'no-authorized-ground-route');
});

test('render sampling is read-only and repeated reloads resume a single continuous offscreen journey', () => {
  const nav = graph({ annexes: [certifiedAnnex()] });
  const initial = requireRoute(nav, 'animal-brume', roomLocation('crew-quarters', 600), roomLocation('animal-care', 600));
  let state = clone(initial);
  let exits = 0;
  let arrivals = 0;
  const total = fullDuration(initial);
  for (let n = 1; n <= 200; n += 1) {
    const before = clone(state);
    for (let draw = 0; draw < 3; draw += 1) sampleShipAnimalRouteV87(state);
    assert.deepEqual(state, before);
    const result = stepShipAnimalRouteV87(nav, clone(state), total / 200, { simulationTime: total * n / 200 });
    assert.equal(result.ok, true);
    state = result.state;
    assertOneLocation(state);
    exits += result.events.filter((event) => event.type === 'animal-door-exit').length;
    arrivals += result.events.filter((event) => event.type === 'animal-arrived').length;
    const duplicateFrame = stepShipAnimalRouteV87(nav, clone(state), 1, { simulationTime: total * n / 200 });
    assert.deepEqual(duplicateFrame.state, state, 'same campaign time never integrates twice');
    assert.equal(duplicateFrame.events.length, 0);
  }
  const offline = stepShipAnimalRouteV87(nav, initial, total + 0.01).state;
  assert.equal(state.status, 'arrived');
  assert.deepEqual(state.location, offline.location);
  assert.equal(exits, 1);
  assert.equal(arrivals, 1);
  assert.equal(stepShipAnimalRouteV87(nav, state, 60).events.length, 0);
  assert.equal(initial.location.roomId, 'crew-quarters');
});

test('saving inside either door type preserves identity, transit progress and remaining duration', () => {
  for (const nav of [restGraph(), graph({ annexes: [certifiedAnnex()] })]) {
    const isAnnex = nav.rooms.some((room) => room.id === 'animal-care');
    const initial = requireRoute(nav, 'animal-moka',
      roomLocation('crew-quarters', isAnnex ? 600 : 1100), roomLocation(isAnnex ? 'animal-care' : 'mess', isAnnex ? 400 : 1500));
    const segment = initial.segments.find((entry) => entry.kind === 'door');
    const consumed = initial.segments[0].duration + segment.duration * 0.3;
    const saved = clone(stepShipAnimalRouteV87(nav, initial, consumed, { doors: openDoors(nav) }).state);
    assert.equal(saved.location.kind, 'transit');
    const one = stepShipAnimalRouteV87(nav, saved, 0.1, { doors: openDoors(nav) }).state;
    const two = stepShipAnimalRouteV87(nav, clone(saved), 0.1, { doors: openDoors(nav) }).state;
    assert.deepEqual(one, two);
    assertOneLocation(one);
    const complete = stepShipAnimalRouteV87(nav, two, 20, { doors: openDoors(nav) }).state;
    assert.equal(complete.status, 'arrived');
    assert.equal(complete.actorId, 'animal-moka');
  }
});

test('invalid saved state cannot forge duration, target, location, actor, room or route continuity', () => {
  const nav = graph({ annexes: [certifiedAnnex()] });
  const initial = requireRoute(nav, 'animal-moka', roomLocation('crew-quarters', 600), roomLocation('animal-care', 400));
  for (const mutate of [
    (state) => { state.actorId = ''; },
    (state) => { state.speed = 0; },
    (state) => { state.speed = 1000; },
    (state) => { state.location.x += 100; },
    (state) => { state.location.roomId = 'mess'; },
    (state) => { state.location.supportId = 'fake-platform'; },
    (state) => { state.target.x += 100; },
    (state) => { state.segments[0].duration = 0.001; },
    (state) => { state.segments[1].depth = false; },
    (state) => { state.segments[1].from.x += 30; },
    (state) => { state.segments[2].from.x += 30; },
    (state) => { state.segmentIndex = state.segments.length; },
    (state) => { state.segmentElapsed = 100; },
    (state) => { state.simulationTime = -1; }
  ]) {
    const corrupted = clone(initial);
    mutate(corrupted);
    const before = clone(corrupted);
    const result = stepShipAnimalRouteV87(nav, corrupted, 100);
    assert.equal(result.ok, false, JSON.stringify(corrupted));
    assert.equal(result.reason, 'invalid-state');
    assert.deepEqual(result.state.location, before.location, 'invalid save is blocked, never relocated');
    assert.deepEqual(corrupted, before);
  }
});

test('invalid transit ownership or progress is rejected without relocation', () => {
  const nav = restGraph();
  let initial = requireRoute(nav, 'animal-moka', roomLocation('crew-quarters', 1100), roomLocation('mess', 1500));
  initial = stepShipAnimalRouteV87(nav, initial, initial.segments[0].duration + 0.4, { doors: openDoors(nav) }).state;
  for (const mutate of [
    (state) => { state.location.roomId = 'mess'; },
    (state) => { state.location.deckId = 'command'; },
    (state) => { state.location.spaceId = 'hub:habitat'; },
    (state) => { state.location.edgeId = 'another-door'; },
    (state) => { state.location.progress = 0.99; }
  ]) {
    const state = clone(initial);
    mutate(state);
    const result = stepShipAnimalRouteV87(nav, state, 100, { doors: openDoors(nav) });
    assert.equal(result.ok, false);
    assert.deepEqual(result.state.location, state.location);
  }
});

test('zero-distance route stays arrived and invalid times never cause realtime/offline aging', () => {
  const nav = graph();
  const initial = requireRoute(nav);
  for (const delta of [-1, NaN, Infinity, 0]) {
    const result = stepShipAnimalRouteV87(nav, initial, delta);
    assert.deepEqual(result.state, initial);
    assert.equal(result.events.length, 0);
  }
  const stationary = requireRoute(nav, 'animal-moka', roomLocation('crew-quarters', 400), roomLocation('crew-quarters', 400));
  assert.equal(stationary.status, 'arrived');
  assert.equal(stationary.segments.length, 0);
  assert.equal(stepShipAnimalRouteV87(nav, stationary, 100).state.location.x, 400);
  const current = stepShipAnimalRouteV87(nav, initial, 1, { simulationTime: 1 }).state;
  assert.deepEqual(stepShipAnimalRouteV87(nav, current, 10, { simulationTime: 0.5 }).state, current);
});

test('new obstacles stop an offscreen journey on its current support without snapping back to the player', () => {
  const nav = graph();
  let state = stepShipAnimalRouteV87(nav, requireRoute(nav), 1).state;
  const before = clone(state.location);
  const changed = graph({ obstacles: [...ACTUAL.obstacles, { roomId: 'crew-quarters', x: 550, y: 600, w: 20, h: 24 }] });
  state = stepShipAnimalRouteV87(changed, state, 30).state;
  assert.equal(state.reason, 'path-obstructed');
  assert.deepEqual(state.location, before);
});
