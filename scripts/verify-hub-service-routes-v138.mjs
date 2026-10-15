import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_TRAVERSAL_PROFILES_V60, buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HUB_RETIRED_SERVICE_LANDINGS_V138, HUB_MEDICAL_SERVICE_APPROACH_V138 as medicalApproach,
  resolveHubServiceProfileV138 } from '../src/hub-service-geometry-v138.js';
import { HUB_SERVICE_STANDARD_V137, resolveHubServiceProfileV137 } from '../src/hub-service-geometry-v137.js';
import { HUB_SERVICE_APPROACHES_V139, resolveHubServiceProfileV139 } from '../src/hub-service-geometry-v139.js';
import { HUB_MAINTENANCE_EAST_LANDING_V138 as landing } from '../src/hub-maintenance-landing-v138.js';
import { HUB_SHIP_SPACE_BY_ID_V137, getHubShipConnectionsForSpaceV137 } from '../src/hub-ship-layout-v137.js';
import { getHubCirculationPlanV137, drawHubCirculationV137, getHubCirculationSolidReservationsV138,
  getHubServiceConduitPlanV137, withHubCirculationV137 } from '../src/hub-circulation-v137.js';
import { getHubDestinationSignReservationsV138 } from '../src/hub-destination-signage-v138.js';
import { getHubRecessedPortalV136, HUB_SPATIAL_SECTION_V136 } from '../src/hub-spatial-design-v136.js';
import { drawHubSteelServicesV133 } from '../src/hub-authored-composition-v133.js';
import { HubGame } from '../src/hub-opening-v88.js';
import { createDefaultSave } from '../src/save.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);
const overlapX = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x;

test('only the three named dead ends are retired and the authored medical approaches extended; historical profiles remain immutable', () => {
  const original = structuredClone(HUB_TRAVERSAL_PROFILES_V60);
  assert.deepEqual(HUB_RETIRED_SERVICE_LANDINGS_V138.map(entry => entry.platformId), ['briefing-side', 'cic-side', 'quarters-side']);
  for (const historical of Object.values(HUB_TRAVERSAL_PROFILES_V60)) {
    const previous = resolveHubServiceProfileV137(historical), current = resolveHubServiceProfileV138(historical);
    const expectedPlatforms = previous.platforms.filter(surface => !HUB_RETIRED_SERVICE_LANDINGS_V138.some(entry => entry.platformId === surface.id))
      .map(surface => ({ ...surface, ...medicalApproach.surfaces[surface.id] }));
    const expectedLadders = previous.ladders.filter(ladder => !HUB_RETIRED_SERVICE_LANDINGS_V138.some(entry => entry.ladderId === ladder.id))
      .map(ladder => ladder.id === medicalApproach.ladderId ? { ...ladder, x: medicalApproach.ladderX } : ladder);
    assert.deepEqual(current.platforms, expectedPlatforms); assert.deepEqual(current.ladders, expectedLadders);
    assert.deepEqual(current.vents, previous.vents); assert.deepEqual(current.occluders, previous.occluders);
  }
  assert.deepEqual(HUB_TRAVERSAL_PROFILES_V60, original);
});

test('the active ship retains all eighteen supported hatches and the real two-stage sanitary landing', () => {
  let platforms = 0, ladders = 0, vents = 0;
  for (let deck = 0; deck < 4; deck++) {
    const geometry = buildHubTraversalGeometryV87(deck);
    platforms += geometry.platforms.length; ladders += geometry.ladders.length; vents += geometry.vents.length;
    for (const vent of geometry.vents) assert.ok(geometry.platforms.some(surface => overlapX(surface, vent)
      && Math.abs(surface.y - vent.y - vent.h) < .001), vent.id);
  }
  assert.equal(platforms, 33); assert.equal(ladders, 34); assert.equal(vents, 18);
  const habitat = buildHubTraversalGeometryV87(1);
  assert.equal(habitat.platforms.find(surface => surface.id === 'quarters-low').y, 500);
  assert.equal(habitat.platforms.find(surface => surface.id === 'quarters-high').y, 376);
  assert.ok(habitat.ladders.some(ladder => ladder.id === 'quarters-floor'));
  assert.ok(habitat.ladders.some(ladder => ladder.id === 'quarters-tier'));
});

test('all retained routes preserve an adult passage and the actual crossing between the two engineering balconies', () => {
  for (let deck = 0; deck < 4; deck++) {
    const geometry = buildHubTraversalGeometryV87(deck);
    for (const lower of geometry.platforms) {
      assert.ok(624 - lower.y - lower.h >= HUB_SERVICE_STANDARD_V137.standingClearance, lower.id);
      for (const upper of geometry.platforms) if (upper.y < lower.y && overlapX(lower, upper)) {
        assert.ok(lower.y - upper.y - upper.h >= HUB_SERVICE_STANDARD_V137.standingClearance, lower.id + ' under ' + upper.id);
      }
    }
  }
  const engineering = buildHubTraversalGeometryV87(3), hangar = engineering.platforms.find(surface => surface.id === 'hangar-observation');
  const reactor = engineering.platforms.find(surface => surface.id === 'reactor-high');
  near(hangar.x + hangar.w, reactor.x); assert.equal(reactor.y - hangar.y, 12);
});

test('the maintenance route physically supports its elevated workshop doorway and both native ladder arrivals', () => {
  const room = HUB_SHIP_SPACE_BY_ID_V137['maintenance-spine'], deck = room.platforms.find(surface => surface.role !== 'floor');
  const east = getHubShipConnectionsForSpaceV137(room.id).find(connection => connection.entranceSide === 'east');
  const west = getHubShipConnectionsForSpaceV137(room.id).find(connection => connection.entranceSide === 'west');
  assert.equal(deck.x, landing.x); assert.equal(deck.x + deck.w, landing.endX); assert.equal(deck.y, landing.top);
  assert.equal(east.annexDoorBounds.y + east.annexDoorBounds.h, landing.top);
  near(east.annexDoorBounds.x + east.annexDoorBounds.w / 2, landing.doorCenterX);
  assert.ok(east.annexDoorBounds.x >= deck.x && east.annexDoorBounds.x + east.annexDoorBounds.w <= deck.x + deck.w);
  assert.equal(west.annexDoorBounds.y + west.annexDoorBounds.h, landing.legacyFloorY);
  assert.equal(east.parentDoorBounds.y + east.parentDoorBounds.h, 624);
  assert.deepEqual(room.ladders.map(ladder => ladder.x), landing.ladderXs);
  assert.ok(room.world.floorY - deck.y - deck.h >= 104);
  for (const ladder of room.ladders) { assert.equal(ladder.top, landing.top); assert.equal(ladder.bottom, 624); }
});

test('the existing circulation renderer paints the extended physical support and opens both actual ladder arrivals', () => {
  const room = HUB_SHIP_SPACE_BY_ID_V137['maintenance-spine'], platform = room.platforms.find(surface => surface.role !== 'floor');
  const before = structuredClone(room), fills = []; let depth = 0;
  const ctx = new Proxy({ save() { depth++; }, restore() { depth--; }, fillRect(...bounds) { fills.push({ bounds, color: ctx.fillStyle }); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const options = { room: { ...room, xStart: 0 }, ladders: room.ladders, centeredLadders: false };
  const model = drawHubCirculationV137(ctx, platform, options);
  assert.deepEqual(model, getHubCirculationPlanV137(platform, options));
  const edges = fills.filter(fill => fill.color === '#7b918f');
  assert.deepEqual(edges.map(edge => edge.bounds), model.frontFaces.map(face => [face.x, face.y, face.w, 2]));
  assert.deepEqual(model.supportLine, {from:[landing.x,landing.top],to:[landing.endX,landing.top],edge:'native-rear-edge'});
  assert.equal(model.openings.length, 2);
  for (const ladder of room.ladders) assert.ok(model.openings.some(opening => opening.ladderIds.includes(ladder.id)));
  for (const opening of model.openings) assert.ok(model.railSpans.every(span => span.right <= opening.left || span.left >= opening.right));
  assert.deepEqual(room, before); assert.equal(depth, 0);
});

test('furniture reservations derive the actual deck faces and wall consoles without filling open railings or resurrecting retired platforms', () => {
  for (let deck = 0; deck < 4; deck++) {
    const geometry = buildHubTraversalGeometryV87(deck);
    for (const platform of geometry.platforms) {
      const room = HUB_DECKS[deck].rooms.find(room => room.id === platform.roomId), options = { ...geometry, room };
      const before = structuredClone(platform), plan = getHubCirculationPlanV137(platform, options);
      const reservations = getHubCirculationSolidReservationsV138(platform, options);
      // The actual V139 front lip follows the positive depth extrusion and
      // stops at each ladder aperture; the physical foot line stays native.
      const faces = reservations.filter(bounds => bounds.role === 'native-deck-face');
      assert.equal(faces.length, plan.frontFaces.length);
      for (const [index,face] of faces.entries()) {
        const expected=plan.frontFaces[index],left=Math.max(room.xStart,expected.x);
        near(face.x,left);near(face.y,expected.y);near(face.h,expected.h);
        near(face.w,Math.min(room.xStart+room.profile.worldWidth,expected.x+expected.w)-left);
      }
      assert.equal(reservations.filter(bounds => bounds.role === 'native-deck-console').length, plan.supports.length);
      assert.ok(reservations.every(bounds => bounds.y >= platform.y), 'An open rear railing became a solid furniture reservation');
      assert.ok(reservations.every(bounds => bounds.sourceId === platform.id && bounds.collidable === false));
      assert.ok(!HUB_RETIRED_SERVICE_LANDINGS_V138.some(entry => entry.platformId === platform.id));
      assert.deepEqual(platform, before);
    }
  }
});

function nativeFixture(deck, roomId, positionX, positionY, savedState = {}) {
  const events = new EventTarget();
  for (const method of ['addEventListener', 'removeEventListener']) globalThis[method] = events[method].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  // Art remains unavailable in this physics fixture; no source pixels or
  // presentation success are claimed by the native checkpoint test.
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) { this._src = value; queueMicrotask(() => this.onerror?.(new Event('error'))); }
    get src() { return this._src; }
  };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }), getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const hub = new HubGame(canvas, { onAction() {}, onPersist() {}, onStatus() {} });
  hub.start({ ...savedState, deck, roomId, positionX, positionY }, { routineContextV62: { save } });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event);
  };
  const advance = seconds => { for (let time = 0; time < seconds - 1e-9; time += 1 / 60) hub.update(Math.min(1 / 60, seconds - time)); };
  return { hub, key, advance };
}

test('saved V137 positions on all three retired platforms fall onto native supports and remain walkable without damage', async () => {
  for (const retired of HUB_RETIRED_SERVICE_LANDINGS_V138) {
    const deck = HUB_DECKS.findIndex(deck => deck.rooms.some(room => room.id === retired.roomId));
    const room = HUB_DECKS[deck].rooms.find(room => room.id === retired.roomId);
    const previous = resolveHubServiceProfileV137(HUB_TRAVERSAL_PROFILES_V60[room.id]);
    const platform = previous.platforms.find(surface => surface.id === retired.platformId), ladder = previous.ladders.find(entry => entry.id === retired.ladderId);
    const subject = nativeFixture(deck, room.id, room.xStart + ladder.x - 22, platform.y - 92);
    for (let index = 0; index < 8; index++) await Promise.resolve();
    near(subject.hub.player.y + subject.hub.player.h, platform.y);
    subject.advance(1); const from = subject.hub.player.x;
    subject.key('keydown', 'KeyD'); subject.advance(.65); subject.key('keyup', 'KeyD'); subject.advance(.3);
    assert.ok(subject.hub.player.x > from + 60, retired.platformId + ' legacy pose cannot leave');
    near(subject.hub.player.y + subject.hub.player.h, 624);
    assert.equal(subject.hub.player.grounded, true); assert.equal(subject.hub.player.climbing, false);
    assert.equal(subject.hub.player.health, 100); assert.equal(subject.hub.player.shockHits, 0); subject.hub.stop();
  }
});

test('V139 moves only the two named workbench access ladders, preserves their supports and accepts old mid-climb saves through native gravity', async () => {
  for (const historical of Object.values(HUB_TRAVERSAL_PROFILES_V60)) {
    const previous=resolveHubServiceProfileV138(historical),before=structuredClone(previous);
    const current=resolveHubServiceProfileV139(historical);
    assert.deepEqual(current.platforms,previous.platforms);assert.deepEqual(current.vents,previous.vents);
    assert.deepEqual(current.ladders,previous.ladders.map(ladder=>{
      const approach=HUB_SERVICE_APPROACHES_V139.find(entry=>entry.ladderId===ladder.id);
      return approach?{...ladder,x:approach.ladderX}:ladder;
    }));
    assert.deepEqual(previous,before);
  }
  for(const approach of HUB_SERVICE_APPROACHES_V139){
    const deck=HUB_DECKS.findIndex(deck=>deck.rooms.some(room=>room.id===approach.roomId));
    const room=HUB_DECKS[deck].rooms.find(room=>room.id===approach.roomId);
    const subject=nativeFixture(deck,room.id,room.xStart+approach.legacyLadderX-22,472,{climbing:true});
    for(let index=0;index<8;index++)await Promise.resolve();
    assert.equal(subject.hub.player.climbing,false,'Native start must not retain an unsupported ladder state');
    subject.advance(1);
    assert.equal(subject.hub.player.health,100);assert.equal(subject.hub.player.shockHits,0);
    assert.equal(subject.hub.player.grounded,true);
    subject.key('keydown','KeyA');subject.advance(.22);subject.key('keyup','KeyA');subject.advance(.12);
    const ladder=subject.hub.nearestTraversalLadder();assert.equal(ladder?.id,approach.ladderId);
    subject.key('keydown','KeyW');subject.advance(1.4);subject.key('keyup','KeyW');
    near(subject.hub.player.y+subject.hub.player.h,ladder.top);
    subject.key('keydown','KeyD');subject.advance(.18);subject.key('keyup','KeyD');subject.advance(.1);
    assert.equal(subject.hub.player.climbing,false);assert.equal(subject.hub.player.grounded,true);
    assert.equal(subject.hub.player.health,100);subject.hub.stop();
  }
});

test('the moved proving-ground portal uses its live ID-based socket for native entry and return without rewriting historical annex data',async()=>{
  const deck=2,room=HUB_DECKS[deck].rooms.find(room=>room.id==='armory');
  const subject=nativeFixture(deck,room.id,room.xStart+420-22,532);
  for(let index=0;index<8;index++)await Promise.resolve();
  const door=subject.hub.getParentAnnexDoorV71('proving-ground');
  near(door.bounds.x+door.bounds.w/2,room.xStart+420);
  assert.equal(subject.hub.nearestParentAnnexDoorV71()?.annexId,'proving-ground');
  subject.key('keydown','KeyE');subject.key('keyup','KeyE');subject.advance(.7);
  assert.equal(subject.hub.currentAnnexV71()?.id,'proving-ground');
  // Walk to the actual annex return bay; no player state is assigned.
  const exit=subject.hub.annexExitDoorV71();
  const target=exit.bounds.x+exit.bounds.w/2-22;
  subject.key('keydown',subject.hub.player.x>target?'KeyA':'KeyD');
  for(let frame=0;frame<900&&Math.abs(subject.hub.player.x-target)>6;frame++)subject.hub.update(1/60);
  subject.key('keyup','KeyA');subject.key('keyup','KeyD');subject.advance(.12);
  subject.key('keydown','KeyE');subject.key('keyup','KeyE');subject.advance(.7);
  assert.equal(subject.hub.currentAnnexV71(),null);near(subject.hub.player.y+subject.hub.player.h,624);
  assert.ok(Math.abs(subject.hub.player.x-(room.xStart+420-22))<2);
  assert.equal(subject.hub.player.health,100);subject.hub.stop();
});

test('medical ladder approaches retain the adult after real sprint braking in both directions before W or S', async () => {
  const geometry = buildHubTraversalGeometryV87(1), room = HUB_DECKS[1].rooms.find(room => room.id === 'medical');
  const low = geometry.platforms.find(surface => surface.id === 'medical-low'), high = geometry.platforms.find(surface => surface.id === 'medical-high');
  const ladder = geometry.ladders.find(entry => entry.id === 'medical-tier');
  assert.equal(low.x + low.w - ladder.x, medicalApproach.minimumArrivalMargin);
  assert.equal(ladder.x - high.x, medicalApproach.minimumArrivalMargin);
  const subject = nativeFixture(1, room.id, room.xStart + 540, low.y - 92);
  for (let index = 0; index < 8; index++) await Promise.resolve();
  const target = ladder.x - subject.hub.player.w / 2;
  const sprintTo = (code, target) => {
    subject.key('keydown', 'ShiftLeft'); subject.key('keydown', code);
    for (let step = 0; step < 500 && (code === 'KeyD' ? subject.hub.player.x < target : subject.hub.player.x > target); step++) subject.hub.update(1 / 60);
    subject.key('keyup', code); subject.key('keyup', 'ShiftLeft'); subject.advance(.35);
  };
  sprintTo('KeyD', target);
  near(subject.hub.player.y + subject.hub.player.h, low.y); assert.equal(subject.hub.player.grounded, true);
  assert.ok(subject.hub.player.x > target + 10, 'The test must include real braking overshoot, not an idle approach');
  subject.key('keydown', 'KeyW'); subject.advance(1); subject.key('keyup', 'KeyW'); subject.advance(.1);
  near(subject.hub.player.y + subject.hub.player.h, high.y); assert.equal(subject.hub.player.grounded, true);
  subject.key('keydown', 'KeyD'); subject.advance(.55); subject.key('keyup', 'KeyD'); subject.advance(.2);
  sprintTo('KeyA', target);
  near(subject.hub.player.y + subject.hub.player.h, high.y); assert.equal(subject.hub.player.grounded, true);
  assert.ok(subject.hub.player.x < target - 10, 'The return approach must also brake beyond its target');
  subject.key('keydown', 'KeyS'); subject.advance(1); subject.key('keyup', 'KeyS'); subject.advance(.1);
  near(subject.hub.player.y + subject.hub.player.h, low.y);
  assert.equal(subject.hub.player.health, 100); assert.equal(subject.hub.player.shockHits, 0); subject.hub.stop();
});

test('the live quarters conduit rendering protects the actual destination plaque, door and adjacent hatch with attached ceiling drops', () => {
  const room = HUB_DECKS[1].rooms[0], geometry = buildHubTraversalGeometryV87(1);
  const portal = getHubShipConnectionsForSpaceV137('sanitary-bay')[0].parentDoorBounds;
  const vent = geometry.vents.find(vent => vent.id === 'quarters-vent');
  const signs = getHubDestinationSignReservationsV138(room, { portalTargetForBounds: bounds => getHubRecessedPortalV136(bounds).target });
  const sanitary = signs.find(sign => sign.destinationId === 'sanitary-bay'); assert.ok(sanitary);
  const occlusion = geometry.occluders.find(entry => entry.id === 'quarters-pipes');
  const plan = getHubServiceConduitPlanV137(occlusion, [portal], { clearanceBounds: [vent, ...signs] });
  assert.ok(plan); assert.equal(plan.wallMounts.length, 2);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const bounds of [portal, vent, sanitary]) {
    const expanded = { x: bounds.x - 3, y: bounds.y - 3, w: bounds.w + 6, h: bounds.h + 6 };
    for (const mount of plan.wallMounts) assert.ok(!overlap(mount, expanded), 'A conduit wall mount covers the real doorway sign');
    for (const conduit of plan.conduits) for (let index = 1; index < conduit.points.length; index++) {
      const [a, b] = [conduit.points[index - 1], conduit.points[index]];
      const strokeBounds = { x: Math.min(a[0], b[0]) - 2.5, y: Math.min(a[1], b[1]) - 2.5,
        w: Math.abs(a[0] - b[0]) + 5, h: Math.abs(a[1] - b[1]) + 5 };
      assert.ok(!overlap(strokeBounds, expanded), 'A real 5px conduit stroke covers protected access or signage');
    }
  }
  for (const conduit of plan.conduits) { assert.equal(conduit.points[0][1], occlusion.y); assert.equal(conduit.points.length, 3); }
  const strokes = []; let path = [], depth = 0;
  const ctx = new Proxy({ save() { depth++; }, restore() { depth--; }, beginPath() { path = []; },
    moveTo(...point) { path.push(point); }, lineTo(...point) { path.push(point); }, stroke() { strokes.push(structuredClone(path)); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const Engine = withHubCirculationV137(class {}), hub = new Engine();
  Object.assign(hub, { state: { deck: 1 }, v51Occluders: [occlusion], v51Vents: geometry.vents,
    v51Ladders: geometry.ladders, v51Platforms: geometry.platforms, doorStates: [] });
  hub.drawTraversalOcclusions(ctx, 'front');
  assert.deepEqual(strokes, plan.conduits.map(conduit => conduit.points), 'The live renderer did not consume actual destination-sign reservations');
  assert.equal(depth, 0);
});

test('legacy ceiling cables and their actual mounts stay inside the real beam in every native room, including the hangar', () => {
  const cables = Array.from({ length: 4 }, (_, deck) => buildHubTraversalGeometryV87(deck).occluders).flat()
    .filter(occlusion => occlusion.art === 'ceilingCables');
  assert.ok(cables.some(occlusion => occlusion.roomId === 'dropship-hangar'));
  assert.ok(cables.some(occlusion => occlusion.roomId === 'mess'));
  for (const ceilingY of [HUB_SPATIAL_SECTION_V136.ceilingY, HUB_SPATIAL_SECTION_V136.ceilingY + 100]) {
    const beamHeight = 54, beamTop = ceilingY - beamHeight;
    for (const occlusion of cables) {
      let path = [], depth = 0; const paths = [], fills = [], before = structuredClone(occlusion);
      const ctx = new Proxy({ save() { depth++; }, restore() { depth--; }, beginPath() { path = []; },
        moveTo(...point) { path.push(point); }, lineTo(...point) { path.push(point); }, stroke() { paths.push(structuredClone(path)); },
        fillRect(...bounds) { fills.push(bounds); }
      }, { get: (object, key) => key in object ? object[key] : () => {} });
      assert.equal(drawHubSteelServicesV133(ctx, occlusion, { ceilingY, beamHeight }), true);
      assert.deepEqual(paths.map(path => path[0][1]), [beamTop + 12, beamTop + 21, beamTop + 30]);
      assert.ok(paths.flat().every(point => point[1] - 2.5 >= beamTop && point[1] + 2.5 <= ceilingY));
      assert.ok(fills.every(([, y, , h]) => y >= beamTop && y + h <= ceilingY));
      assert.ok(fills.some(([, y, , h]) => y === beamTop && h === 38));
      assert.deepEqual(occlusion, before); assert.equal(depth, 0);
    }
  }
});
