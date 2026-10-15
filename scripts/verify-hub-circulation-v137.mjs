import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V87 } from '../src/hub-annex-registry-v87.js';
import { HUB_TRAVERSAL_PROFILES_V60, buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HUB_SHIP_SPACES_V137, HUB_SHIP_PARENT_LANDINGS_V137, getHubShipConnectionsForSpaceV137 } from '../src/hub-ship-layout-v137.js';
import { HUB_SERVICE_STANDARD_V137, resolveHubServiceProfileV137 } from '../src/hub-service-geometry-v137.js';
import { DROPSHIP_HANGAR_ART_V55, ELECTRICAL_HAZARD_ART_V55 } from '../src/hub-art-runtime-v55.js';
import { HUB_CIRCULATION_STANDARD_V137, getHubCirculationPlanV137,
  drawHubCirculationV137, withHubCirculationV137, getHubServiceConduitPlanV137,
  drawHubServiceConduitsV137 } from '../src/hub-circulation-v137.js';
import { withHubRoomIdentityV137 } from '../src/hub-room-identity-v137.js';
import { HubGame as ProductionHub } from '../src/hub-opening-v88.js';
import { createDefaultSave } from '../src/save.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);
const overlapX = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x;
function canvas() {
  let depth = 0, path = [];
  const fills = [], strokes = [], labels = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    beginPath() { path = []; }, moveTo(...point) { path.push(point); }, lineTo(...point) { path.push(point); },
    stroke() { strokes.push({ color: ctx.strokeStyle, path: structuredClone(path) }); },
    fillRect(...bounds) { fills.push({ bounds, color: ctx.fillStyle }); },
    fillText(...args) { labels.push(args); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, fills, strokes, labels, balanced: () => assert.equal(depth, 0) };
}

test('all existing standing routes leave 104 pixels below decks, including the former 60-pixel hangar alcove', () => {
  let overlappingPairs = 0;
  for (let deck = 0; deck < HUB_DECKS.length; deck++) {
    const geometry = buildHubTraversalGeometryV87(deck);
    for (const lower of geometry.platforms) {
      assert.ok(624 - lower.y - lower.h >= HUB_SERVICE_STANDARD_V137.standingClearance, lower.id + ' above floor');
      for (const upper of geometry.platforms) if (upper.y < lower.y && overlapX(lower, upper)) {
        const clearance = lower.y - upper.y - upper.h;
        assert.ok(clearance >= HUB_SERVICE_STANDARD_V137.standingClearance, `${lower.id} beneath ${upper.id}: ${clearance}`);
        overlappingPairs++;
      }
    }
  }
  assert.ok(overlappingPairs >= 16);
  const engineering = buildHubTraversalGeometryV87(3);
  const high = engineering.platforms.find(surface => surface.id === 'hangar-observation');
  const low = engineering.platforms.find(surface => surface.id === 'hangar-maintenance-alcove-v133');
  assert.equal(high.y, 316); assert.equal(low.y, ELECTRICAL_HAZARD_ART_V55.supportY);
  assert.equal(low.y - high.y - high.h, 104);
});

test('landing height changes move real ladders and vent apertures together and preserve the sanitary doorway support', () => {
  for (const original of Object.values(HUB_TRAVERSAL_PROFILES_V60)) {
    const profile = resolveHubServiceProfileV137(original);
    for (const ladder of profile.ladders) {
      assert.ok(ladder.bottom > ladder.top);
      assert.ok(profile.platforms.some(surface => nearEndpoint(surface, ladder, ladder.top)), ladder.id + ' top has native support');
      assert.ok(ladder.bottom === 624 || profile.platforms.some(surface => nearEndpoint(surface, ladder, ladder.bottom)), ladder.id + ' bottom');
    }
    for (const vent of profile.vents) assert.ok(profile.platforms.some(surface =>
      Math.abs(surface.y - vent.y - vent.h) < .001 && overlapX(surface, vent)), vent.id + ' retains its real standing deck');
  }
  const quarters = buildHubTraversalGeometryV87(1).platforms.find(surface => surface.id === 'quarters-high');
  const sanitary = HUB_SHIP_PARENT_LANDINGS_V137['sanitary-bay'];
  assert.equal(quarters.y, sanitary.bottom);
  assert.ok(sanitary.centerX >= quarters.x && sanitary.centerX <= quarters.x + quarters.w);
  function nearEndpoint(surface, ladder, y) {
    return Math.abs(surface.y - y) < .001 && ladder.x >= surface.x - 26 && ladder.x <= surface.x + surface.w + 26;
  }
});

test('service re-spacing preserves historical profiles and every horizontal support, hatch and ladder identity', () => {
  const before = structuredClone(HUB_TRAVERSAL_PROFILES_V60);
  for (let deck = 0; deck < HUB_DECKS.length; deck++) {
    const geometry = buildHubTraversalGeometryV87(deck);
    for (const room of HUB_DECKS[deck].rooms) {
      const profile = HUB_TRAVERSAL_PROFILES_V60[room.id];
      for (const bucket of ['platforms', 'ladders', 'vents']) for (const original of profile[bucket]) {
        const actual = geometry[bucket].find(entry => entry.id === original.id);
        assert.ok(actual, original.id); assert.equal(actual.x, original.x + room.xStart); assert.equal(actual.w, original.w);
        if (bucket === 'platforms') assert.equal(actual.h, original.h);
        if (bucket === 'vents') assert.equal(actual.h, original.h);
      }
    }
  }
  assert.deepEqual(HUB_TRAVERSAL_PROFILES_V60, before);
});

test('the lifted hangar route and booth stay attached, preserve bitmap ratio and leave the arc and floor entrance intact', () => {
  const booth = DROPSHIP_HANGAR_ART_V55.controlBooth;
  near(booth.renderBounds.w / booth.renderBounds.h, booth.sourceCrop.w / booth.sourceCrop.h);
  near(booth.renderBounds.x + booth.renderBounds.w / 2, booth.anchor.x);
  near(booth.renderBounds.y + booth.renderBounds.h, booth.anchor.y);
  // Native PNG opaque top is y56 in its 512-pixel source.
  assert.ok(booth.renderBounds.y + 56 / 512 * booth.renderBounds.h >= 186);
  assert.equal(booth.anchor.y, 302); assert.equal(booth.interactionBounds.y, 282);
  assert.equal(booth.interactionBounds.y + booth.interactionBounds.h, 624);
  assert.equal(ELECTRICAL_HAZARD_ART_V55.supportY, 440);
  const geometry = buildHubTraversalGeometryV87(3);
  const high = geometry.platforms.find(surface => surface.id === 'hangar-observation');
  const reactor = geometry.platforms.find(surface => surface.id === 'reactor-high');
  assert.equal(reactor.x, high.x + high.w); assert.equal(reactor.y - high.y, 12);
});

test('rear guard rails open at actual ladder tops and bottoms, for centred deck ladders and left-anchored annex ladders', () => {
  for (let deck = 0; deck < HUB_DECKS.length; deck++) {
    const geometry = buildHubTraversalGeometryV87(deck);
    for (const platform of geometry.platforms) {
      const plan = getHubCirculationPlanV137(platform, geometry);
      for (const opening of plan.openings) {
        assert.ok(opening.ladderIds.length > 0);
        assert.ok(plan.railSpans.every(span => span.right <= opening.left || span.left >= opening.right));
      }
    }
  }
  const platform = { id: 'annex-deck', x: 600, y: 426, w: 500, h: 20 };
  const ladder = { id: 'annex-ladder', x: 680, w: 44, top: 426, bottom: 624 };
  const plan = getHubCirculationPlanV137(platform, { ladders: [ladder], centeredLadders: false });
  near(plan.openings[0].center, 702);
  assert.ok(plan.openings[0].left < 680 && plan.openings[0].right > 724);
});

test('wall consoles stay within 34 pixels of real deck undersides and no false columns reach the walking floor', () => {
  const all = [...HUB_DECKS.flatMap((deck, index) => buildHubTraversalGeometryV87(index).platforms),
    ...[...HUB_ANNEXES_V87, ...HUB_SHIP_SPACES_V137].flatMap(room => room.platforms.filter(surface => surface.role !== 'floor'))];
  for (const platform of all) {
    const plan = getHubCirculationPlanV137(platform);
    for (const support of plan.supports) {
      near(support.top, platform.y + platform.h);
      assert.ok(support.bottom - support.top <= HUB_CIRCULATION_STANDARD_V137.maximumBracketDrop);
      assert.ok(support.bottom < 624 - 50, platform.id);
      assert.equal(support.attachment, 'rear-wall-bolted-console'); assert.equal(support.collidable, false);
    }
    for (let index = 1; index < plan.supports.length; index++) assert.ok(plan.supports[index].x - plan.supports[index - 1].x <= 190);
  }
});

test('painted destinations identify real supported vents or the physically joined reactor balcony', () => {
  const geometry = buildHubTraversalGeometryV87(3), room = HUB_DECKS[3].rooms[0];
  const platform = geometry.platforms.find(surface => surface.id === 'hangar-observation');
  const plan = getHubCirculationPlanV137(platform, { ...geometry, room });
  assert.deepEqual(plan.destinations.map(destination => destination.kind), ['native-vent', 'native-adjacent-deck']);
  for (const destination of plan.destinations) assert.ok([...geometry.vents, ...geometry.platforms].some(entry => entry.id === destination.id));
  const noDestination = getHubCirculationPlanV137({ id: 'isolated', x: 600, y: 400, w: 300, h: 20 });
  assert.deepEqual(noDestination.destinations, []);
});

test('compact rooms and the depth-off setting retain their orthographic section while large ship bays share the door projection', () => {
  const platform = { id: 'deck', x: 200, y: 400, w: 400, h: 20 };
  const bridge = getHubCirculationPlanV137(platform, { room: HUB_DECKS[0].rooms[0] });
  const medical = getHubCirculationPlanV137(platform, { room: HUB_DECKS[1].rooms[2] });
  const disabled = getHubCirculationPlanV137(platform, { room: HUB_DECKS[0].rooms[0], depthEnabled: false });
  near(bridge.depthDx / bridge.depthY, 19 / 12); assert.equal(bridge.presentationMode, '2.5d');
  assert.equal(medical.depthDx, 0); assert.equal(medical.presentationMode, '2d');
  assert.equal(disabled.depthDx, 0); assert.equal(disabled.presentationMode, '2d');
});

test('rendered circulation aligns the native foot rail, shares the room depth vector, preserves caller state and leaves ladder apertures visible', () => {
  const geometry = buildHubTraversalGeometryV87(0), room = HUB_DECKS[0].rooms[0];
  const platform = geometry.platforms.find(surface => surface.id === 'bridge-low');
  const before = structuredClone({ geometry, room }), subject = canvas();
  const plan = drawHubCirculationV137(subject.ctx, platform, { ...geometry, room });
  assert.equal(plan.footY, platform.y); near(plan.depthDx / plan.depthY, 19 / 12);
  const frontEdge = subject.fills.find(fill => fill.color === '#7b918f');
  assert.equal(frontEdge.bounds[1], platform.y); assert.equal(frontEdge.bounds[2], platform.w);
  assert.ok(subject.fills.every(fill => fill.bounds[3] <= 34));
  for (const stroke of subject.strokes.filter(stroke => stroke.color === '#3c565a')) {
    const left = Math.min(...stroke.path.map(point => point[0])) - plan.depthDx;
    const right = Math.max(...stroke.path.map(point => point[0])) - plan.depthDx;
    assert.ok(plan.openings.every(opening => right <= opening.left || left >= opening.right));
  }
  assert.deepEqual({ geometry, room }, before); subject.balanced();
  assert.equal(getHubCirculationPlanV137({ x: 0, y: 624, w: 1280, h: 96, role: 'floor' }), null);
  assert.equal(getHubCirculationPlanV137({ x: NaN, y: 400, w: 100, h: 20 }), null);
});

test('the wrapper delegates editor rendering and draws native and annex supports without changing physics or saves', () => {
  class Base {
    drawTraversalPlatform() { return 'editor-platform'; }
    drawAnnexSteelPlatformV133() { return 'editor-annex-platform'; }
  }
  const Engine = withHubCirculationV137(Base), instance = new Engine(), subject = canvas();
  const geometry = buildHubTraversalGeometryV87(0), platform = geometry.platforms[0];
  Object.assign(instance, { editorPlaytest: true, state: { deck: 0 }, v51Ladders: geometry.ladders,
    v51Vents: geometry.vents, v51Platforms: geometry.platforms, player: { x: 450, y: 532 }, save: { visited: ['bridge'] } });
  assert.equal(instance.drawTraversalPlatform(subject.ctx, platform), 'editor-platform');
  assert.equal(instance.drawAnnexSteelPlatformV133(subject.ctx, {}, {}), 'editor-annex-platform');
  instance.editorPlaytest = false;
  const before = structuredClone(instance);
  assert.ok(instance.drawTraversalPlatform(subject.ctx, platform));
  const annex = HUB_SHIP_SPACES_V137.find(room => room.id === 'engine-room');
  assert.ok(instance.drawAnnexSteelPlatformV133(subject.ctx, annex.platforms[1], annex));
  assert.deepEqual({ ...instance }, before); subject.balanced();
  assert.equal(withHubCirculationV137(Engine), Engine);
});

function nativeHost() {
  const root = fileURLToPath(new URL('../', import.meta.url)), events = new EventTarget();
  for (const method of ['addEventListener', 'removeEventListener']) globalThis[method] = events[method].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) {
      this._src = source; let descriptor;
      try {
        descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
        const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
        if (header.subarray(1, 4).toString() === 'PNG') [this.naturalWidth, this.naturalHeight] = [header.readUInt32BE(16), header.readUInt32BE(20)];
        else if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') {
          this.naturalWidth = header.readUIntLE(24, 3) + 1; this.naturalHeight = header.readUIntLE(27, 3) + 1;
        }
      } catch {} finally { if (descriptor !== undefined) closeSync(descriptor); }
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw Error('Missing fixture image'); }
  };
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event);
  };
  return { canvas, key };
}

test('native W, D/A and S climb both crew decks and return to the floor without a jump or forced grounding', async () => {
  const browser = nativeHost(), save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const hub = new ProductionHub(browser.canvas, { onAction() {}, onPersist() {}, onStatus() {} });
  hub.start({ deck: 1, roomId: 'crew-quarters', positionX: 188, positionY: 532 }, { routineContextV62: { save } });
  for (let index = 0; index < 8; index++) await Promise.resolve();
  const advance = seconds => { for (let time = 0; time < seconds - 1e-9; time += 1 / 60) hub.update(Math.min(1 / 60, seconds - time)); };
  const hold = (code, seconds) => { browser.key('keydown', code); advance(seconds); browser.key('keyup', code); advance(.1); };
  const walk = target => {
    const code = target > hub.player.x ? 'KeyD' : 'KeyA'; browser.key('keydown', code);
    for (let step = 0; step < 500 && Math.abs(target - hub.player.x) > 5; step++) hub.update(1 / 60);
    browser.key('keyup', code); advance(.2); assert.ok(Math.abs(target - hub.player.x) < 30);
  };
  const landing = y => { near(hub.player.y + hub.player.h, y); assert.equal(hub.player.climbing, false); assert.equal(hub.player.grounded, true); };
  hold('KeyW', 1.2); landing(500);
  walk(588); hold('KeyW', 1.2); landing(376);
  walk(828); landing(376); walk(588);
  hold('KeyS', 1.2); landing(500);
  walk(188); hold('KeyS', 1.2); landing(624);
  assert.equal(hub.player.health, 100); assert.equal(hub.player.shockHits, 0);
  hub.stop();
});

test('walking away at mid-ladder restores gravity until a real support catches the actor', async () => {
  const browser = nativeHost(), save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const hub = new ProductionHub(browser.canvas, { onAction() {}, onPersist() {}, onStatus() {} });
  hub.start({ deck: 1, roomId: 'crew-quarters', positionX: 188, positionY: 532 }, { routineContextV62: { save } });
  for (let index = 0; index < 8; index++) await Promise.resolve();
  browser.key('keydown', 'KeyW'); for (let step = 0; step < 24; step++) hub.update(1 / 60); browser.key('keyup', 'KeyW');
  assert.equal(hub.player.climbing, true); const aboveFloor = hub.player.y, climbingVelocity = hub.player.vy;
  browser.key('keydown', 'KeyD'); hub.update(1 / 60);
  assert.equal(hub.player.climbing, false); assert.ok(hub.player.vy > climbingVelocity); assert.equal(hub.player.grounded, false);
  browser.key('keyup', 'KeyD'); for (let step = 0; step < 60; step++) hub.update(1 / 60);
  assert.ok(hub.player.y > aboveFloor); near(hub.player.y + hub.player.h, 624); assert.equal(hub.player.grounded, true);
  hub.stop();
});

test('the inherited quarters service run bypasses the real sanitary door and neighbouring vent without erasing its anchors', () => {
  const geometry = buildHubTraversalGeometryV87(1), service = geometry.occluders.find(entry => entry.id === 'quarters-pipes');
  const connection = getHubShipConnectionsForSpaceV137('sanitary-bay')[0], portal = connection.parentDoorBounds;
  const vent = geometry.vents.find(entry => entry.id === 'quarters-vent');
  const before = structuredClone({ service, portal, vent }), subject = canvas();
  const plan = drawHubServiceConduitsV137(subject.ctx, service, [portal], { clearanceBounds: [vent] });
  assert.ok(plan); assert.equal(plan.conduits.length, 3); assert.equal(plan.wallMounts.length, 2);
  for (const conduit of plan.conduits) {
    assert.deepEqual(conduit.bypassedPortal, portal);
    near(conduit.points[0][1], service.y);
    near(conduit.points.at(-1)[0], service.x + service.w - 18);
    for (const bounds of [portal, vent]) {
      const clear = { x: bounds.x - 8, y: bounds.y - 8, w: bounds.w + 16, h: bounds.h + 16 };
      for (let index = 1; index < conduit.points.length; index++) {
        const [a, b] = [conduit.points[index - 1], conduit.points[index]];
        const crosses = a[0] === b[0]
          ? a[0] > clear.x && a[0] < clear.x + clear.w && Math.max(a[1], b[1]) > clear.y && Math.min(a[1], b[1]) < clear.y + clear.h
          : a[1] > clear.y && a[1] < clear.y + clear.h && Math.max(a[0], b[0]) > clear.x && Math.min(a[0], b[0]) < clear.x + clear.w;
        assert.equal(crosses, false, 'A front service conduit still crosses a physical portal or hatch');
      }
    }
  }
  assert.equal(subject.strokes.length, 3); subject.balanced(); assert.deepEqual({ service, portal, vent }, before);
  assert.equal(getHubServiceConduitPlanV137(service, []), null, 'An unchanged service run should delegate to its original renderer');
});

test('native exit labels defer only to an actual sign rendered for that endpoint in the current frame and retain their fallback', () => {
  const subject = canvas(), texts = []; subject.ctx.fillText = text => texts.push(text);
  const annex = HUB_SHIP_SPACES_V137.find(room => room.id === 'maintenance-spine');
  const exits = getHubShipConnectionsForSpaceV137(annex.id).map(connection => ({ endpointId: connection.id,
    parentRoomId: connection.parentRoomId, bounds: connection.annexDoorBounds }));
  class Base {
    drawAnnexExitLabelV137 = ProductionHub.prototype.drawAnnexExitLabelV137;
    draw() {
      if (this.renderIdentity) this.drawHubRoomIdentityV137(subject.ctx, this.room);
      for (const exit of exits) this.drawAnnexExitLabelV137(subject.ctx, annex, exit);
    }
  }
  const Engine = withHubRoomIdentityV137(Base), hub = new Engine();
  Object.assign(hub, { room: { ...annex, xStart: 0 }, renderIdentity: false });
  hub.draw(); assert.equal(texts.filter(text => text === 'ATELIER').length, 1);
  assert.ok(texts.includes('RÉSEAU DE CAPTEURS')); assert.equal(hub.hasRenderedHubServiceSignV137(exits[0].endpointId), false);
  texts.length = 0; hub.renderIdentity = true; hub.draw();
  assert.equal(texts.filter(text => text === 'ATELIER').length, 1); assert.equal(texts.filter(text => text === 'CAPTEURS').length, 1);
  assert.equal(texts.includes('RÉSEAU DE CAPTEURS'), false);
  for (const exit of exits) assert.equal(hub.hasRenderedHubServiceSignV137(exit.endpointId), true);
  texts.length = 0; hub.renderIdentity = false; hub.draw();
  assert.ok(texts.includes('RÉSEAU DE CAPTEURS')); assert.equal(texts.filter(text => text === 'ATELIER').length, 1);
  assert.equal(hub.hasRenderedHubServiceSignV137(exits[0].endpointId), false, 'A previous frame must not suppress the fallback');
  texts.length = 0; hub.renderIdentity = true; hub.editorPlaytest = true; hub.draw();
  assert.ok(texts.includes('RÉSEAU DE CAPTEURS')); assert.equal(hub.hasRenderedHubServiceSignV137(exits[0].endpointId), false);
  subject.balanced();
});
