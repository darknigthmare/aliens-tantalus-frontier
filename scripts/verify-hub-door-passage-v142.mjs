import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HUB_ANNEXES_V87, createHubCommercialStateV87, applyHubAnnexStationV87 } from '../src/hub-annex-registry-v87.js';
import { HUB_ANNEXES_V137, HUB_ANNEX_BY_ID_V137, createHubCommercialStateV137, applyHubAnnexStationV137,
  validateHubAnnexGeometryV137, buildHubRuntimeGraphV137 } from '../src/hub-annex-registry-v137.js';
import { HUB_SHIP_SPACES_V137, HUB_SHIP_CONNECTIONS_V137, HUB_SHIP_PARENT_LANDINGS_V137,
  getHubShipConnectionsForSpaceV137, getHubShipConnectionV137 } from '../src/hub-ship-layout-v137.js';
import { HUB_MAINTENANCE_EAST_LANDING_V138 } from '../src/hub-maintenance-landing-v138.js';
import { HUB_FURNISHING_ATLAS_V137, getHubFurnishingCellV137 } from '../src/hub-furnishing-atlas-v137.js';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { HubGame } from '../src/hub-opening-v88.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { projectRefugeHubSaveV87 } from '../src/refuge-save-v87.js';

import { HUB_DOOR_PASSAGE_V142, getHubDoorFaceV142, projectHubDoorActorV142, closingHubDoorProgressV142, drawHubDoorFaceV142 } from '../src/hub-door-passage-v142.js';
import { getHubRoomLifePlanV136 } from '../src/hub-room-life-v136.js';
import { getHubFurnishingPlacementBoundsV139 } from '../src/hub-furnishing-contact-v139.js';
import { getHubAnnexFixturePlanV138 } from '../src/hub-annex-fixtures-v138.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const clone = value => structuredClone(value);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function size(source) {
  let descriptor;
  try {
    descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
    const header = Buffer.alloc(32); readSync(descriptor, header, 0, 32, 0);
    if (header.subarray(1, 4).toString() === 'PNG') return [header.readUInt32BE(16), header.readUInt32BE(20)];
    if (header.subarray(0, 4).toString() === 'RIFF' && header.subarray(12, 16).toString() === 'VP8X') return [header.readUIntLE(24, 3) + 1, header.readUIntLE(27, 3) + 1];
    return [0, 0];
  } catch { return [0, 0]; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(source) { this._src = source; [this.naturalWidth, this.naturalHeight] = size(source);
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing fixture asset'); }
  };
  let depth = 0;
  const ctx = new Proxy({ save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    measureText: text => ({ width: String(text).length * 6 }), createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }), getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  function key(type, code) { const event = new Event(type, { cancelable: true }); Object.assign(event,
    { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false }); events.dispatchEvent(event); }
  return { canvas, key, balanced: () => assert.equal(depth, 0) };
}
async function fixture(connection, hubState = null, action = null) {
  const browser = host(), actions = [], patches = [], save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const deck = HUB_DECKS.findIndex(entry => entry.id === connection.parentDeck), door = connection.parentDoorBounds;
  const hub = new HubGame(browser.canvas, { onAction: event => { actions.push(clone(event)); return action?.(event); },
    onPersist: patch => patches.push(clone(patch)), onStatus() {} });
  hub.start(hubState || { deck, roomId: connection.parentRoomId, positionX: door.x + door.w / 2 - 22,
    positionY: connection.standingY - 92 }, { routineContextV62: { save } });
  for (let i = 0; i < 8; i++) await Promise.resolve();
  return { ...browser, hub, actions, patches, save };
}
function advance(subject, seconds) { for (let t = 0; t < seconds - 1e-9; t += 1 / 60) subject.hub.update(Math.min(1 / 60, seconds - t)); }
function tap(subject, code) { subject.key('keydown', code); subject.key('keyup', code); }
function walk(subject, x) {
  const direction = subject.hub.player.x < x ? 'KeyD' : 'KeyA'; subject.key('keydown', direction);
  for (let count = 0; count < 3600 && Math.abs(subject.hub.player.x - x) > 7; count++) subject.hub.update(1 / 60);
  subject.key('keyup', direction); advance(subject, .15);
  assert.ok(Math.abs(subject.hub.player.x - x) < 42, `Walk stopped at ${subject.hub.player.x}, target ${x}`);
}
function enter(subject, spaceId) {
  assert.equal(subject.hub.nearestParentAnnexDoorV71()?.annexId, spaceId); tap(subject, 'KeyE'); advance(subject, .5);
  assert.equal(subject.hub.currentAnnexV71()?.id, spaceId);
}
function reachMaintenanceExit(subject, connection) {
  const desiredFootY = connection.annexDoorBounds.y + connection.annexDoorBounds.h;
  if (Math.abs(subject.hub.player.y + subject.hub.player.h - desiredFootY) > 1) {
    const ladders = subject.hub.currentAnnexV71().ladders;
    const ladder = desiredFootY < 624 ? ladders.at(-1) : ladders[0];
    walk(subject, ladder.x + ladder.w / 2 - subject.hub.player.w / 2);
    const direction = desiredFootY < 624 ? 'KeyW' : 'KeyS';
    subject.key('keydown', direction); advance(subject, 1.1); subject.key('keyup', direction);
  }
  walk(subject, connection.entranceLocalX - 22);
  assert.equal(subject.hub.player.y + subject.hub.player.h, desiredFootY);
}


const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const pair = (parent = { x: 641, y: 432, w: 118, h: 192 }, local = { x: 85, y: 432, w: 118, h: 192 }) => ({
  parent: getHubDoorFaceV142(parent, local, [53, 29, 330, 483]), local: getHubDoorFaceV142(local, parent, [53, 29, 330, 483])
});
const projection = (actor, faces, extra = {}) => projectHubDoorActorV142(actor, faces.parent, faces.local, {
  bounds: { x: 24, y: 0, w: 1232, h: 720 }, surfaces: [{ x: 0, y: 624, w: 1280, h: 96 }], ...extra
});

test('all nineteen annexes and the secondary maintenance endpoint use an identical isotropic face at both ends', () => {
  for (const annex of HUB_ANNEXES_V137) {
    const connections = getHubShipConnectionsForSpaceV137(annex.id);
    for (const connection of connections.length ? connections : [null]) {
      const parent = connection?.parentDoorBounds || { x: 0, y: 624 - annex.entrance.h, w: annex.entrance.w, h: annex.entrance.h };
      const local = connection?.annexDoorBounds || { x: annex.entranceLocalX - annex.entrance.w / 2, y: annex.entrance.y, w: annex.entrance.w, h: annex.entrance.h };
      const source = annex.art.alphaBounds.door;
      const a = getHubDoorFaceV142(parent, local, source), b = getHubDoorFaceV142(local, parent, source);
      assert.deepEqual(a.pairedSize, b.pairedSize, annex.id);
      near(a.target.w / a.target.h, (source[2] - source[0]) / (source[3] - source[1]));
      near(a.target.y + a.target.h, parent.y + parent.h); near(b.target.y + b.target.h, local.y + local.h);
      assert.ok(a.opening.w >= 44 && a.opening.h >= 92, annex.id);
      assert.deepEqual(a.socket, parent); assert.deepEqual(b.socket, local);
    }
  }
});

test('a short sanitary socket shares the same 156px visual face as its tall opposite without moving either support', () => {
  const faces = pair({ x: 400, y: 220, w: 118, h: 156 });
  assert.deepEqual(faces.parent.pairedSize, faces.local.pairedSize);
  near(faces.parent.target.h, 156); near(faces.parent.target.y + faces.parent.target.h, 376);
  near(faces.local.target.y + faces.local.target.h, 624);
});

test('an offset within the visible aperture is retained exactly in both directions and keeps facing and support', () => {
  const faces = pair(), actor = { x: 683, y: 532, w: 44, h: 92, facing: -1 };
  const forward = projection(actor, faces); assert.ok(forward); near(forward.offsetX, 5); near(forward.arrival.x, 127);
  near(forward.sourceAligned.x, actor.x); assert.equal(forward.facing, -1); near(forward.standingY, 624);
  const backward = projectHubDoorActorV142({ ...forward.arrival, facing: -1 }, faces.local, faces.parent,
    { surfaces: [{ x: 0, y: 624, w: 5120, h: 96 }] });
  near(backward.arrival.x, actor.x); near(backward.offsetX, forward.offsetX);
});

test('a distant E approach aligns inside the source door instead of creating another side-spawn', () => {
  const faces = pair(), actor = { x: 604, y: 532, w: 44, h: 92 };
  const result = projection(actor, faces); assert.ok(result);
  assert.ok(result.sourceAligned.x > actor.x);
  near(result.sourceAligned.x - faces.parent.opening.x, 0);
  near(result.arrival.x - faces.local.opening.x, 0);
  assert.ok(Math.abs(result.arrival.x + 22 - 144) < 11);
});

test('solid bodies, real occupied destinations, missing standing support and world edges reject a transfer before mutation', () => {
  const faces = pair(), actor = { x: 678, y: 532, w: 44, h: 92, facing: 1 }, before = clone(actor);
  const blocking = { x: 118, y: 530, w: 60, h: 94 };
  assert.equal(projection(actor, faces, { solids: [blocking] }), null);
  assert.equal(projection(actor, faces, { occupied: [blocking] }), null);
  assert.equal(projection(actor, faces, { surfaces: [{ x: 0, y: 624, w: 130, h: 96 }] }), null);
  assert.equal(projection(actor, faces, { bounds: { x: 150, y: 0, w: 1000, h: 720 } }), null);
  assert.deepEqual(actor, before);
  assert.ok(projection(actor, faces, { solids: [{ ...blocking, collisionMode: 'one-way-top' }] }), 'Native rear props stay passable from their side');
});

test('the destination closing curve is bounded, monotone, fully open first and fully shut at its end', () => {
  const samples = Array.from({ length: 21 }, (_, i) => closingHubDoorProgressV142(i * HUB_DOOR_PASSAGE_V142.closingSeconds / 20));
  assert.equal(samples[0], 1); assert.equal(samples.at(-1), 0);
  assert.ok(samples.every((p, i) => p >= 0 && p <= 1 && (!i || p <= samples[i - 1])));
  assert.equal(closingHubDoorProgressV142(-10), 1); assert.equal(closingHubDoorProgressV142(10), 0);
});

test('the closed transparent source paints no socket-sized backdrop and only its inner leaves move when opening', () => {
  const rects = [], images = [], clips = [], ctx = new Proxy({
    fillRect: (...b) => rects.push(b), drawImage: (...args) => images.push(args), clip: rule => clips.push(rule)
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  const face = pair().local, image = { complete: true, naturalWidth: 384, naturalHeight: 512, src: '/fixture-native-door.webp' };
  const closed = drawHubDoorFaceV142(ctx, image, face);
  assert.equal(closed.fullSocketFill, false); assert.equal(images.length, 3); assert.ok(clips.includes('evenodd'));
  assert.ok(rects.every(b => b[2] * b[3] < face.target.w * face.target.h * .1));
  images.length = 0; rects.length = 0; const opened = drawHubDoorFaceV142(ctx, image, face, { progress: 1 });
  assert.equal(opened.framePolicy, 'stationary-transparent-source');
  assert.deepEqual(images[0].slice(-4), [face.target.x, face.target.y, face.target.w, face.target.h]);
  near(images[1].at(-4) + images[1].at(-2), face.opening.x);
  near(images[2].at(-4), face.opening.x + face.opening.w);
  assert.ok(rects.every(b => b[0] >= face.opening.x && b[0] + b[2] <= face.opening.x + face.opening.w + 1e-8
    && b[1] >= face.target.y && b[1] + b[3] <= face.target.y + face.target.h + 1e-8));
});

test('the native keyboard passage aligns continuously, preserves the actor and resources, and visibly closes before accepting another E', async () => {
  const connection = getHubShipConnectionV137('flight-control-cockpit:primary');
  const center = connection.parentDoorBounds.x + connection.parentDoorBounds.w / 2;
  const subject = await fixture(connection, { deck: 0, roomId: 'bridge', positionX: center - 96, positionY: 532 });
  const actor = subject.hub.player, initial = clone({ health: actor.health, facing: actor.facing, x: actor.x });
  const resources = clone(subject.save.galaxy.resources);
  tap(subject, 'KeyE'); assert.ok(subject.hub.annexTransitionV71); near(actor.x, initial.x);
  advance(subject, .2); assert.ok(actor.x > initial.x && actor.x < subject.hub.annexTransitionV71.passageV142.sourceAligned.x);
  advance(subject, .25); assert.equal(subject.hub.currentAnnexV71()?.id, connection.spaceId);
  assert.equal(subject.hub.player, actor); assert.equal(actor.health, initial.health); assert.equal(actor.facing, initial.facing);
  assert.ok(subject.hub.hubDoorClosingV142); assert.ok(subject.hub.statusPrompt().includes('FERMETURE'));
  subject.hub.draw(); const door = subject.hub.getSnapshot().hubDoorPassageV142.doors.find(d => d.local);
  assert.equal(door.stage, 'closing'); assert.ok(door.progress > .9);
  const arrival = clone(subject.hub.hubDoorLastArrivalV142);
  near(actor.x - arrival.destinationFace.opening.x, arrival.sourceAligned.x - arrival.sourceFace.opening.x);
  tap(subject, 'KeyE'); assert.equal(subject.hub.annexTransitionV71, null);
  const elapsed = subject.hub.hubDoorClosingV142.elapsed; subject.hub.running = false; advance(subject, .2);
  near(subject.hub.hubDoorClosingV142.elapsed, elapsed); subject.hub.running = true;
  advance(subject, .7); assert.equal(subject.hub.hubDoorClosingV142, null);
  subject.hub.draw(); assert.ok(subject.hub.getSnapshot().hubDoorPassageV142.doors.every(d => d.progress === 0));
  tap(subject, 'KeyE'); advance(subject, .45); assert.equal(subject.hub.currentAnnexV71(), null);
  near(actor.x - (center - 22), arrival.offsetX); assert.equal(actor.y + actor.h, connection.standingY);
  assert.deepEqual(subject.save.galaxy.resources, resources); subject.hub.stop(false); subject.balanced();
});

test('reduced motion retains the same arrival while shortening both door phases, and no transient cycle leaks into saves', async () => {
  const connection = getHubShipConnectionV137('flight-control-cockpit:primary'), subject = await fixture(connection);
  subject.hub.reducedMotion = true; tap(subject, 'KeyE'); advance(subject, .13);
  assert.equal(subject.hub.currentAnnexV71()?.id, connection.spaceId);
  assert.ok(subject.hub.hubDoorClosingV142); assert.equal(subject.hub.hubDoorClosingV142.duration, .12);
  near(subject.hub.player.x + 22, connection.entranceLocalX);
  subject.hub.persist(); const saved = JSON.stringify(subject.patches.at(-1));
  assert.ok(!saved.includes('hubDoorClosingV142') && !saved.includes('passageV142') && !saved.includes('hubDoorDrawsV142'));
  advance(subject, .13); assert.equal(subject.hub.hubDoorClosingV142, null); subject.hub.stop(false); subject.balanced();
});


test('the relocated REFUGE frame and full human aperture clear the actual catwalk, ladders, bunk, stool and room section', async () => {
  const annex = HUB_ANNEX_BY_ID_V137['personal-refuge'], subject = await fixture({ parentDeck: annex.parentDeck, parentRoomId: annex.parentRoomId, parentDoorBounds: annex.parentDoorBounds, standingY: 624 });
  const faces = subject.hub.hubDoorPairV142(annex), room = HUB_DECKS[1].rooms.find(r => r.id === 'crew-quarters');
  const parentBounds = getHubRoomLifePlanV136(room).items.map(getHubFurnishingPlacementBoundsV139).filter(Boolean);
  const localBounds = getHubAnnexFixturePlanV138(annex).reservations;
  const traversal = buildHubTraversalGeometryV87(1);
  const structuralBounds = [...traversal.platforms.filter(p => p.roomId === room.id),
    ...traversal.ladders.filter(p => p.roomId === room.id).map(p => ({ x: p.x - 8, y: p.top - 92, w: p.w + 16, h: p.bottom - p.top + 92 })),
    room.propRenderBounds, { x: 1272, y: 426, w: 16, h: 198 }];
  assert.ok(structuralBounds.every(b => !overlap(faces.parent.target, b)));
  assert.equal(faces.parent.target.x, 1150); near(faces.parent.target.x + faces.parent.target.w, 1268);
  assert.ok(faces.parent.opening.h >= 96.5 && faces.parent.opening.w >= 44);
  assert.ok(parentBounds.every(b => !overlap(faces.parent.target, b)));
  assert.ok(localBounds.every(b => !overlap(faces.local.target, b)));
  assert.deepEqual(faces.parent.socket, annex.parentDoorBounds); assert.equal(faces.parent.socket.h, 104);
  assert.ok(faces.parent.target.h > 140 && faces.parent.opening.h > 109);
  subject.hub.stop(false); subject.balanced();
});
