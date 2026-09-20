import test from 'node:test';
import assert from 'node:assert/strict';
import { SHIP_PORT_ANNEX_V87 as ANNEX, SHIP_PORT_TERMINAL_V87 as TERMINAL, SHIP_PORT_MEETINGS_V87,
  getShipPortInteractionV87, drawShipPortRoomV87, drawShipPortTerminalV87 } from '../src/ship-port-room-v87.js';
import { PORT_ART_V87, getPortPropBoundsV87 } from '../src/ship-port-art-v87.js';
import { SHIP_ANIMAL_ENCLOSURE_ASSET_V87 } from '../src/ship-animal-enclosure-art-v87.js';
import { SHIP_ANIMAL_TERRARIUM_ASSET_V87 } from '../src/ship-animal-terrarium-art-v87.js';
import { SHIP_ANIMAL_ATLASES_V87 } from '../src/ship-animal-art-v87.js';
import { SHIP_ANIMAL_HABITATS_V87, SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_DEFINITION_V87, requestShipPortDockV87, stepShipPortV87 } from '../src/ship-port-state-v87.js';
import { HUB_ANNEXES_V71 } from '../src/tantalus-hub-expansion-v71.js';
import { HUB_ANNEXES_V87, validateHubAnnexGeometryV87, buildHubRuntimeGraphV87 } from '../src/hub-annex-registry-v87.js';
import { HubGame, HUB_ANNEX_TRANSITION_SECONDS_V71 } from '../src/hub-v71-runtime.js';
import { createDefaultSave } from '../src/save.js';
import { ELECTRICAL_HAZARD_ART_V55 } from '../src/hub-art-runtime-v55.js';

const near = (a, b, tolerance = .001) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const shape = value => Object.fromEntries(['x', 'y', 'w', 'h'].map(key => [key, value[key]]));
const image = path => {
  const atlas = Object.values(SHIP_ANIMAL_ATLASES_V87).find(entry => entry.path === path);
  return { currentSrc: path, complete: true, naturalWidth: atlas?.width || 1536, naturalHeight: atlas?.height || 1024 };
};
function ctxFor(trace) {
  const gradient = { addColorStop() {} };
  return new Proxy({ measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient,
    fillText: (...args) => trace.texts.push(args), drawImage: (...args) => trace.images.push(args),
    translate: (...args) => trace.translations.push(args)
  }, { get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; } });
}
class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1920; this.naturalHeight = 720; }
  set src(value) {
    this.currentSrc = value;
    const atlas = Object.values(SHIP_ANIMAL_ATLASES_V87).find(entry => entry.path === value);
    if (atlas) { this.naturalWidth = atlas.width; this.naturalHeight = atlas.height; }
    else if (value.includes('/ship-animals/v87/')) { this.naturalWidth = 1536; this.naturalHeight = 1024; }
    else if (value.endsWith('/door.webp')) { this.naturalWidth = 384; this.naturalHeight = 512; }
    else if (value.endsWith('/prop.webp')) { this.naturalWidth = 640; this.naturalHeight = 512; }
    else if (value.includes('echo9-marine-')) { this.naturalWidth = 1024; this.naturalHeight = 1024; }
  }
}
function withRuntime(run) {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame, matchMedia: globalThis.matchMedia };
  Object.assign(globalThis, { Image: MockImage, addEventListener() {}, requestAnimationFrame: () => 0, matchMedia: () => ({ matches: false }) });
  try { return run(); } finally { Object.assign(globalThis, previous); }
}
function campaign(docked = false) {
  let save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const context = { careReady: true, manifestReady: true, physical: { roomId: 'dropship-hangar' },
    authorization: { granted: true, portId: SHIP_PORT_DEFINITION_V87.id, sectorId: SHIP_PORT_DEFINITION_V87.sectorId,
      campaignHours: (save.clock.day - 1) * 24 + save.clock.hour } };
  if (docked) {
    const result = requestShipPortDockV87(save, { transactionId: 'room-dock' }, context);
    assert.equal(result.ok, true, result.code); save = result.save;
    for (let i = 1; i <= 14; i += 1) {
      const next = stepShipPortV87(save, { dtSeconds: 1, simulationTime: i }, context);
      assert.equal(next.ok, true, next.code); save = next.save;
    }
  }
  return save;
}
function createHub(docked = false) {
  const trace = { texts: [], images: [], translations: [] }; const actions = [];
  const ctx = ctxFor(trace); const save = campaign(docked);
  const hub = new HubGame({ width: 1280, height: 720, getContext: () => ctx, addEventListener() {}, focus() {} },
    { onAction: event => actions.push(structuredClone(event)), onPersist() {} });
  hub.start({ deck: 3, roomId: 'dropship-hangar', positionX: 96, visited: ['dropship-hangar'] }, { routineContextV62: { save } });
  return { hub, save, ctx, trace, actions };
}
function place(hub, centerX, feetY = 624) {
  Object.assign(hub.player, { x: centerX - hub.player.w / 2, y: feetY - hub.player.h,
    vx: 0, vy: 0, alive: true, grounded: true, climbing: false });
}
function walk(hub, target) {
  for (let frame = 0; frame < 1600; frame += 1) {
    const x = hub.player.x + hub.player.w / 2;
    if (Math.abs(x - target) < 4) { hub.keys.clear(); return; }
    hub.keys = new Set([x < target ? 'KeyD' : 'KeyA']);
    hub.update(1 / 120); near(hub.player.y + hub.player.h, 624);
    assert.equal(hub.player.climbing, false); assert.equal(hub.jumpQueued, 0);
  }
  assert.fail('Ground route blocked before ' + target);
}
function finishTransition(hub) {
  hub.update(HUB_ANNEX_TRANSITION_SECONDS_V71 / 2);
  assert.ok(hub.annexTransitionV71);
  hub.update(HUB_ANNEX_TRANSITION_SECONDS_V71 / 2 + .02);
  assert.equal(hub.annexTransitionV71, null);
}

test('the port is an explicit second extension with a separate parent and no rewritten historical rooms', () => {
  assert.equal(HUB_ANNEXES_V71.length, 10); assert.equal(HUB_ANNEXES_V87.length, 13);
  assert.equal(ANNEX.parentDeck, 'engineering'); assert.equal(ANNEX.parentRoomId, 'dropship-hangar');
  assert.equal(ANNEX.navigationKind, 'external-civil-compartment');
  assert.equal(validateHubAnnexGeometryV87(ANNEX).valid, true);
  assert.equal(ANNEX.platforms[0].id, 'frontier-civil-counter-floor');
  assert.equal(ANNEX.station.upgradeId, null);
  assert.ok(Object.isFrozen(ANNEX)); assert.ok(Object.isFrozen(ANNEX.props));
  const graph = buildHubRuntimeGraphV87();
  assert.equal(graph.nodes.length, 29); assert.equal(graph.edges.length, 31);
  assert.ok(graph.adjacency['dropship-hangar'].includes('arrival-airlock'));
  assert.ok(graph.adjacency['dropship-hangar'].includes(ANNEX.id));
});

test('port departure uses the exact internal hub identity of three berths, two duo enclosures and one terrarium', () => {
  assert.equal(SHIP_ANIMAL_HABITATS_V87.length, 6);
  assert.equal(SHIP_ANIMAL_HABITATS_V87.reduce((sum, habitat) => sum + habitat.capacity, 0), 8);
  assert.equal(SHIP_ANIMAL_ANNEX_V87.world.width, 1920);
  assert.equal(ANNEX.world.width, 2560); assert.equal(ANNEX.platforms[0].w, 2560);
  assert.ok(SHIP_ANIMAL_HABITATS_V87.every(berth => berth.location.hubId === SHIP_PORT_DEFINITION_V87.shipHubId));
});

test('west hangar gangway x40..158 and wall terminal x0..36 sit on floor624 clear of hull, ladder and the still-active electrical arc', () => withRuntime(() => {
  const { hub } = createHub(); const door = hub.getParentAnnexDoorV71(ANNEX.id);
  assert.deepEqual(door.bounds, { x: 40, y: 432, w: 118, h: 192 });
  assert.equal(door.bounds.x + door.bounds.w, 158); assert.equal(door.bounds.y + door.bounds.h, 624);
  assert.equal(TERMINAL.x, 0); assert.equal(TERMINAL.w, 36); near(TERMINAL.y + TERMINAL.h, 624);
  const ladders = hub.v51Ladders.map(ladder => ({ x: ladder.x, y: ladder.top, w: ladder.w, h: ladder.bottom - ladder.top }));
  const solids = [...hub.obstacles, ...hub.v51Platforms, ...hub.v51Walls, ...ladders,
    ELECTRICAL_HAZARD_ART_V55.collisionBounds];
  for (const solid of solids) {
    assert.equal(overlaps(door.bounds, solid), false, 'gangway: ' + JSON.stringify(solid));
    assert.equal(overlaps(TERMINAL, solid), false, 'terminal: ' + JSON.stringify(solid));
  }
  assert.ok(hub.obstacles.some(solid => solid.roomId === 'dropship-hangar' && solid.collisionOnly));
  assert.equal(ELECTRICAL_HAZARD_ART_V55.activeByDefault, true);
  assert.equal(ELECTRICAL_HAZARD_ART_V55.damage, 22);
}));

test('counter, shelf and terminal metadata match actual unstretched bitmap bounds', () => {
  for (const [id, kind, x, width] of [['port-counter', 'counter', 480, 165], ['port-shelf', 'shelf', 1825, 90]]) {
    const prop = ANNEX.props.find(entry => entry.id === id);
    assert.deepEqual(shape(prop), getPortPropBoundsV87(kind, { x, width, bottom: 624 }));
    assert.equal(prop.collidable, false); near(prop.y + prop.h, 624);
  }
  assert.deepEqual(ANNEX.station.bounds, shape(ANNEX.props[0]));
  assert.deepEqual(shape(TERMINAL), getPortPropBoundsV87('terminal', { x: 0, width: 36, bottom: 624 }));
  assert.ok(ANNEX.props[0].h < 92 && ANNEX.props[0].h > 60);
});

test('both parent hangar doors render and selection/highlight follows the actual nearby door', () => withRuntime(() => {
  const { hub, ctx } = createHub(true);
  const annexes = HUB_ANNEXES_V87.filter(annex => annex.parentRoomId === 'dropship-hangar');
  assert.deepEqual(annexes.map(annex => annex.id), ['arrival-airlock', ANNEX.id]);
  const captured = [];
  hub.drawDoorBitmapV71 = (_ctx, _image, bounds, active) => captured.push({ bounds: { ...bounds }, active });
  for (const annex of annexes) {
    const door = hub.getParentAnnexDoorV71(annex.id);
    place(hub, door.bounds.x + door.bounds.w / 2, door.bounds.y + door.bounds.h);
    assert.equal(hub.nearestParentAnnexDoorV71()?.annexId, annex.id);
    captured.length = 0; hub.drawTraversal(ctx);
    assert.equal(captured.length, 2);
    for (const other of annexes) assert.ok(captured.some(entry => JSON.stringify(entry.bounds) === JSON.stringify(hub.getParentAnnexDoorV71(other.id).bounds)));
    assert.equal(captured.filter(entry => entry.active === 1).length, 1);
    assert.deepEqual(captured.find(entry => entry.active === 1).bounds, door.bounds);
  }
}));

test('the locked port remains drawn but cannot activate its door while the legacy arrival door remains selectable', () => withRuntime(() => {
  const { hub, ctx, actions } = createHub(false); const drawn = [];
  hub.drawDoorBitmapV71 = (_ctx, _image, bounds, active) => drawn.push({ bounds, active });
  place(hub, 99); hub.drawTraversal(ctx);
  assert.equal(drawn.length, 2); assert.equal(drawn.find(entry => entry.bounds.x === 40).active, 0);
  hub.interact(); assert.equal(hub.annexTransitionV71, null);
  assert.equal(actions.at(-1)?.action, 'ship-port:locked');
  const old = hub.getParentAnnexDoorV71('arrival-airlock');
  place(hub, old.bounds.x + old.bounds.w / 2, old.bounds.y + old.bounds.h);
  assert.equal(hub.nearestParentAnnexDoorV71()?.annexId, 'arrival-airlock');
  hub.interact(); assert.equal(hub.annexTransitionV71?.annexId, 'arrival-airlock');
}));

test('terminal and gangway are reachable by walking, then both vendors and all six meeting areas remain traversable', () => withRuntime(() => {
  const { hub, actions } = createHub(true); place(hub, 96);
  const health = hub.player.health;
  walk(hub, 46); assert.equal(getShipPortInteractionV87(hub)?.action, 'ship-port:terminal');
  hub.interact(); assert.equal(actions.at(-1)?.action, 'ship-port:terminal');
  walk(hub, 99); assert.equal(getShipPortInteractionV87(hub), null);
  assert.equal(hub.player.health, health); assert.equal(hub.player.shockHits, 0);
  hub.interact(); assert.equal(hub.annexTransitionV71?.annexId, ANNEX.id); finishTransition(hub);
  near(hub.player.x, 233); near(hub.player.y + hub.player.h, 624);
  walk(hub, 600); assert.equal(getShipPortInteractionV87(hub)?.action, 'ship-port:shop');
  for (const meeting of SHIP_PORT_MEETINGS_V87) {
    walk(hub, meeting.x); assert.equal(getShipPortInteractionV87(hub)?.offerId, meeting.offerId);
    assert.equal(getShipPortInteractionV87(hub)?.vendorId, meeting.vendorId);
  }
  walk(hub, 1965); assert.equal(getShipPortInteractionV87(hub)?.vendorId, 'colony-shelter');
  walk(hub, 144); hub.interact(); finishTransition(hub);
  assert.equal(hub.currentAnnexV71(), null); assert.equal(hub.currentRoom().id, 'dropship-hangar');
  near(hub.player.y + hub.player.h, 624); near(hub.player.x + hub.player.w / 2, 99, 4);
  assert.equal(hub.player.health, health); assert.equal(hub.player.shockHits, 0);
}));

test('all five historical meeting zones preserve their origins and full activation spans beside the new terrarium', () => {
  assert.deepEqual(SHIP_PORT_MEETINGS_V87.slice(0, 3).map(entry => [entry.animalId, entry.x]),
    [['animal-moka', 990], ['animal-brume', 1435], ['animal-luciole', 1705]]);
  // Brume's exact historical coordinate is part of saved transit origins.
  assert.equal(SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === 'animal-brume').x, 1435);
  const hub = { player: { x: 0, y: 532, w: 44, h: 92, alive: true }, currentAnnexV71: () => ANNEX };
  assert.equal(new Set(SHIP_PORT_MEETINGS_V87.map(entry => entry.offerId)).size, 6);
  const meetings = [...new Map(SHIP_PORT_MEETINGS_V87.filter(entry => entry.animalId !== 'animal-mica')
    .map(entry => [entry.offerId, entry])).values()];
  assert.equal(meetings.length, 5);
  assert.deepEqual(SHIP_PORT_MEETINGS_V87.slice(3, 7).map(entry => [entry.animalId, entry.x]),
    [['animal-noisette', 2130], ['animal-cafe', 2130], ['animal-tic', 2420], ['animal-tac', 2420]]);
  const gates = meetings.map(entry => getPortPropBoundsV87('gate', { x: entry.x - 115, width: 230, bottom: 626 }));
  for (const meeting of SHIP_PORT_MEETINGS_V87) {
    assert.equal(ANNEX.art[meeting.imageRole], SHIP_ANIMAL_ATLASES_V87[meeting.animalId].path);
    assert.ok(ANNEX.artRoles.includes(meeting.imageRole));
  }
  for (let index = 0; index < meetings.length; index++) {
    const meeting = meetings[index];
    for (const offset of [-105, 0, 105]) {
      place(hub, meeting.x + offset);
      assert.equal(getShipPortInteractionV87(hub)?.offerId, meeting.offerId);
      assert.equal(getShipPortInteractionV87(hub)?.vendorId, meeting.vendorId);
    }
    for (const solid of [...ANNEX.props, ANNEX.entrance, ...gates.filter((_, other) => other !== index)]) {
      assert.equal(overlaps(gates[index], solid), false, 'fence overlap for ' + meeting.animalId);
    }
    if (index > 0) {
      const previous = meetings[index - 1];
      assert.ok(meeting.x - previous.x > 210, 'Prompt activation spans must not intersect');
      place(hub, (previous.x + meeting.x) / 2);
      assert.equal(getShipPortInteractionV87(hub)?.offerId, undefined);
    }
  }
  assert.equal(new Set(SHIP_PORT_MEETINGS_V87.map(entry => ANNEX.art[entry.imageRole])).size, 8);
  assert.ok(gates[2].x + gates[2].w <= ANNEX.props.find(entry => entry.id === 'port-shelf').x);
  assert.ok(gates.at(-1).x + gates.at(-1).w < ANNEX.world.width);
  place(hub, 1965); assert.equal(getShipPortInteractionV87(hub)?.vendorId, 'colony-shelter');
  assert.equal(getShipPortInteractionV87(hub)?.animalId, undefined);
  assert.ok(ANNEX.props.every(prop => prop.x + prop.w <= ANNEX.world.width));
});

test('Mica has a narrow terrarium meeting span without stealing any historical Moka prompt', () => {
  const meeting = SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === 'animal-mica');
  assert.equal(meeting.x, 810); assert.equal(meeting.drawX, 768); assert.equal(meeting.interactionRadius, 60);
  assert.equal(meeting.vendorId, 'station-shop'); assert.equal(meeting.offerId, 'offer-animal-mica');
  assert.equal(ANNEX.art.terrarium, SHIP_ANIMAL_TERRARIUM_ASSET_V87);
  assert.equal(ANNEX.artRoles.length, 14);
  const hub = { player: { x: 0, y: 532, w: 44, h: 92, alive: true }, currentAnnexV71: () => ANNEX };
  for (const x of [756, 810, 870]) {
    place(hub, x); assert.equal(getShipPortInteractionV87(hub)?.animalId, 'animal-mica');
  }
  for (const x of [750, 755]) {
    place(hub, x); assert.equal(getShipPortInteractionV87(hub)?.vendorId, 'station-shop');
    assert.equal(getShipPortInteractionV87(hub)?.animalId, undefined, 'the vendor keeps its historical priority');
  }
  for (const x of [871, 880, 884]) { place(hub, x); assert.equal(getShipPortInteractionV87(hub), null); }
  for (const x of [885, 990, 1095]) {
    place(hub, x); assert.equal(getShipPortInteractionV87(hub)?.animalId, 'animal-moka');
  }
  const terrarium = { x: 750, y: 536, w: 120, h: 88 };
  assert.equal(overlaps(terrarium, getPortPropBoundsV87('gate', { x: 875, width: 230, bottom: 626 })), false);
  for (const prop of ANNEX.props) assert.equal(overlaps(terrarium, prop), false);
});

test('port prompts reject airborne, dead, transitioning, editor and unrelated-room players', () => {
  const hub = { player: { x: 24, y: 532, w: 44, h: 92, alive: true }, currentRoom: () => ({ id: 'dropship-hangar' }) };
  assert.equal(getShipPortInteractionV87(hub)?.action, 'ship-port:terminal');
  for (const patch of [{ player: { ...hub.player, y: 490 } }, { player: { ...hub.player, alive: false } },
    { annexTransitionV71: {} }, { editorPlaytest: true }, { currentRoom: () => ({ id: 'reactor' }) }]) {
    assert.equal(getShipPortInteractionV87({ ...hub, ...patch }), null);
  }
});

test('independent vendor, props and available companions use cropped images and sold companions disappear from the shop', () => {
  const images = new Map([['prop', image(PORT_ART_V87.props.path)], ['vendor', image(PORT_ART_V87.vendor.path)],
    ['enclosure', image(SHIP_ANIMAL_ENCLOSURE_ASSET_V87)],
    ['terrarium', image(SHIP_ANIMAL_TERRARIUM_ASSET_V87)],
    ...SHIP_PORT_MEETINGS_V87.map(entry => [entry.imageRole, image(SHIP_ANIMAL_ATLASES_V87[entry.animalId].path)])]);
  const trace = { texts: [], images: [], translations: [] }; const ctx = ctxFor(trace); const save = campaign();
  drawShipPortRoomV87(ctx, images, save, .5, false);
  const offers = [...new Set(SHIP_PORT_MEETINGS_V87.map(entry => entry.offerId))];
  assert.equal(trace.images.filter(args => args[0].currentSrc === PORT_ART_V87.props.path).length, 8);
  assert.ok(trace.images.some(args => args[0].currentSrc === SHIP_ANIMAL_ENCLOSURE_ASSET_V87));
  assert.ok(trace.images.some(args => args[0].currentSrc === SHIP_ANIMAL_TERRARIUM_ASSET_V87));
  assert.equal(trace.images.filter(args => args[0].currentSrc === PORT_ART_V87.vendor.path).length, 1);
  for (const meeting of SHIP_PORT_MEETINGS_V87)
    assert.equal(trace.images.filter(args => args[0].currentSrc === SHIP_ANIMAL_ATLASES_V87[meeting.animalId].path).length, 1);
  assert.ok(trace.images.every(args => args.length === 9));
  assert.ok(trace.translations.some(([x, y]) => x === 668 && y === 624));
  for (const sold of offers) {
    for (const offerId of offers) save.shipAnimalsV1.stock[offerId].status = offerId === sold ? 'sold' : 'available';
    trace.images.length = 0; drawShipPortRoomV87(ctx, images, save, .5, true);
    for (const meeting of SHIP_PORT_MEETINGS_V87)
      assert.equal(trace.images.some(args => args[0].currentSrc === SHIP_ANIMAL_ATLASES_V87[meeting.animalId].path), meeting.offerId !== sold);
  }
});

test('terminal draws the exact recorded dimensions and communicates locked versus docked presence', () => {
  const trace = { texts: [], images: [], translations: [] }; const ctx = ctxFor(trace);
  drawShipPortTerminalV87(ctx, image(PORT_ART_V87.props.path), campaign(false));
  assert.deepEqual(trace.images[0].slice(5), [TERMINAL.x, TERMINAL.y, TERMINAL.w, TERMINAL.h]);
  assert.equal(trace.texts.at(-1)[0], 'UNDOCKED');
  drawShipPortTerminalV87(ctx, image(PORT_ART_V87.props.path), campaign(true));
  assert.equal(trace.texts.at(-1)[0], 'PASSERELLE DISPONIBLE');
});
