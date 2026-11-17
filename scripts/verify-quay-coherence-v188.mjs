// V188 — level-design coherence of the Port-Méridien quay (P-3, « Le quai des vivants »).
// Scale: the marine (92 px) is about 1.80 m, so 1 m ≈ 51 px. Depth lanes use the hangar's
// own minimum lane (20 depth units). Rules/layout checks and observed production
// rendering/loading calls use the explicit browser/Canvas host declared below.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, openSync, readSync, closeSync } from 'node:fs';
import { PORT_POSTS_V90, PORT_WORLD_V90, PORT_CIVILIANS_WAIT_V188, PORT_CIVILIANS_SAFE_V188, createPortMeridienV90,
  normalizePortMeridienV90, advancePortMeridienV90, portPhysicalContactV90 } from '../src/port-meridien-v90.js';
import { PORT_SCENE_V188, PORT_METRE_PX_V188, PORT_ASSETS_V90, portGeometryV90, portSignTextV188 } from '../src/hub-port-meridien-v90.js';
import { PORT_DEPTH_ROOM_V188, blockedByFootprintV188, freeDepthV188, civilianDepthTargetV188 } from '../src/hub-depth-rooms-v188.js';
import { HubGame } from '../src/hub-opening-v88.js';
import { withHubDepthRoomsV188 } from '../src/hub-depth-runtime-v188.js';
import { createPlayerOnboardingV84 } from '../src/player-onboarding-v84.js';
import { PORT_QUAY_ART_V188, PORT_QUAY_ART_IDS_V188, portQuayArtReadyV188,
  portQuayTriageFitV188, drawPortQuayTriageV188 } from '../src/port-quay-art-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const metres = px => px / PORT_METRE_PX_V188;
const between = (value, min, max, label) => assert.ok(value >= min && value <= max, `${label}: ${value.toFixed(2)} m outside [${min}, ${max}]`);
const FLOOR = PORT_WORLD_V90.floorY, MARINE_H = 92, LANE = 20;
const props = Object.fromEntries(PORT_DEPTH_ROOM_V188.props.map(prop => [prop.id, prop]));
const scene = PORT_SCENE_V188;

test('quay scale: 1 m ≈ 51 px, the marine is about 1.8 m', () => {
  assert.equal(PORT_METRE_PX_V188, 51);
  between(metres(MARINE_H), 1.7, 1.9, 'marine');
});

test('quay sizes: lots, crates, stretcher, consoles, container, drums and pallet keep their real size', () => {
  between(metres(scene.unloadLot.w), .6, 1.2, 'unload lot width'); between(metres(scene.unloadLot.h), .6, 1.2, 'unload lot height');
  between(metres(scene.carriedLot.w), .6, 1.0, 'carried lot'); between(metres(scene.deliveredLot.w), .6, 1.0, 'delivered lot');
  assert.equal(scene.unloadLot.y + scene.unloadLot.h, FLOOR, 'the unload lot stands on the quay');
  assert.deepEqual(scene.railCrate, { x: 420, y: 574, w: 100, h: 50 }, 'ramp freight crate: unchanged collider');
  between(metres(scene.railCrate.w / 2), .6, 1.2, 'each of the two freight crates'); between(metres(scene.railCrate.h), .6, 1.2, 'freight crate height');
  between(metres(scene.bed.w), 2.0, 2.4, 'historical bed placement'); assert.equal(scene.bed.y + scene.bed.h, FLOOR);
  for (const key of ['relayConsole', 'reportConsole']) { between(metres(scene[key].h), 1.1, 1.6, `${key} height`); between(metres(scene[key].w), 1.2, 1.8, `${key} width`); }
  assert.equal(scene.relayConsole.y + scene.relayConsole.h, 432, 'the relay stands on the catwalk');
  assert.equal(scene.reportConsole.y + scene.reportConsole.h, FLOOR);
  // Legacy fallbacks keep their source aspect within 25 % (the old bed includes
  // a monitor arm). The new rolling stretcher is calibrated by its mattress.
  const aspect = (box, w, h) => Math.abs(box.w / box.h / (w / h) - 1);
  assert.ok(aspect(scene.relayConsole, 215, 188) < .25 && aspect(scene.bed, 225, 174) < .25 && aspect(scene.unloadLot, 175, 160) < .25);
  const triage = portQuayTriageFitV188(scene.bed, PORT_METRE_PX_V188);
  assert.equal(metres(triage.mattress.w), 2); assert.equal(triage.ground[1], FLOOR);
  assert.equal(triage.stretcher.w / triage.stretcher.sw, triage.stretcher.h / triage.stretcher.sh);
  between(metres(FLOOR - triage.mattress.y), .8, .9, 'rolling stretcher mattress height');
  const container = props['port-containers'];
  assert.equal(container.kind, 'iso-container'); between(metres(container.w), 2.9, 3.1, 'container length (10 ft)'); between(metres(container.h), 2.5, 2.7, 'container height');
  const drums = props['port-drums']; between(metres(drums.h - 6), .85, .95, 'drum height'); between(metres(drums.w / 3 - 4), .5, .65, 'drum diameter');
  between(metres(props['port-pallet'].w), 1.1, 1.3, 'pallet');
});

test('quay airlock: a 2.6 m door in a bulkhead as tall as its collider; the barrier spans the quay only while closed', () => {
  const gate = scene.gate, doorTop = FLOOR - gate.doorH;
  between(metres(gate.doorH), 2.5, 2.7, 'airlock door');
  assert.ok(gate.doorH >= MARINE_H + 30, 'the doorway clears the marine and the residents');
  for (const phase of ['unload', 'carry', 'triage', 'power']) {
    const collider = portGeometryV90({ phase }).colliders.find(entry => entry.x === gate.collider.x);
    assert.deepEqual(collider, { x: gate.collider.x, y: gate.wallTop, w: gate.collider.w, h: FLOOR - gate.wallTop }, `${phase}: closed gate`);
    assert.ok(collider.x >= gate.x && collider.x + collider.w <= gate.x + gate.w, 'collider inside the drawn bulkhead');
  }
  for (const phase of ['escort', 'report', 'complete']) {
    const collider = portGeometryV90({ phase }).colliders.find(entry => entry.x === gate.collider.x);
    assert.equal(collider.y, gate.wallTop); assert.equal(collider.y + collider.h, doorTop, `${phase}: only the bulkhead above the doorway`);
    assert.ok(collider.y + collider.h <= FLOOR - MARINE_H, 'a standing marine walks under it');
  }
  const draw = read('src/hub-port-meridien-v90.js');
  assert.match(draw, /if \(gateClosed\(state\)\) \{ \/\/ the closed airlock bars the whole quay/);
  assert.match(draw, /drawAirlockV188\(ctx, this\.portImagesV90\?\.get\('door'\), gateClosed\(state\)/);
  assert.doesNotMatch(draw, /bitmap\('door', 1810, 356, 108, 268\)/, 'no more 5.3 m door');
});

test('quay posts: ramp → triage → relay on the catwalk → normal-sector airlock, read left to right and reachable on foot', () => {
  const p = PORT_POSTS_V90, ship = scene.dropship, gate = scene.gate, catwalk = portGeometryV90({ phase: 'power' }).platforms[1];
  const ladder = portGeometryV90({ phase: 'power' }).ladders[0];
  assert.ok(ship.rampTipX <= scene.unloadLot.x && Math.abs(p.unload.x - ship.rampTipX) <= 1.5 * 51, 'the unload post is at the foot of the ramp');
  assert.ok(p.unload.x >= scene.unloadLot.x && p.unload.x <= scene.unloadLot.x + scene.unloadLot.w, 'the lot is at its post');
  assert.equal(p.carry.x, p.triage.x); assert.ok(p.triage.x > scene.bed.x && p.triage.x < scene.bed.x + scene.bed.w, 'triage post at the stretcher');
  assert.ok(Math.abs(p.escort.x - PORT_CIVILIANS_WAIT_V188[1]) <= 20, 'the residents are gathered where they wait');
  assert.equal(p.power.y, catwalk.y, 'the relay is on the catwalk');
  assert.ok(p.power.x > catwalk.x && p.power.x < catwalk.x + catwalk.w && ladder.x > catwalk.x && ladder.x + ladder.w < catwalk.x + catwalk.w, 'reached by the ladder');
  assert.equal(ladder.bottom, FLOOR); assert.equal(ladder.top, catwalk.y); between(metres(ladder.h), 3.5, 4, 'catwalk height');
  assert.ok(p.power.x > scene.relayConsole.x && p.power.x < scene.relayConsole.x + scene.relayConsole.w);
  assert.ok(p.unload.x < p.triage.x && p.triage.x < p.power.x && p.power.x < gate.x && gate.x + gate.w < p.report.x, 'left to right');
  assert.ok(p.report.x > scene.reportConsole.x && p.report.x < scene.reportConsole.x + scene.reportConsole.w, 'report post at the terminal');
  assert.equal(p.complete.x, p.report.x);
  for (const post of Object.values(p)) assert.ok(post.x >= 24 && post.x <= 2480, 'inside the saved x bounds');
  // Walking at the hub walk speed, the whole chain (with the return to the residents) stays short.
  const walk = Number(read('src/hub-v71-runtime.js').match(/const WALK_SPEED = (\d+);/)[1]);
  const route = [p.unload.x, p.triage.x, p.power.x, p.escort.x, PORT_CIVILIANS_SAFE_V188[2] + 60, p.report.x];
  const distance = route.slice(1).reduce((sum, x, i) => sum + Math.abs(x - route[i]), 112 > p.unload.x ? 112 - p.unload.x : p.unload.x - 112) + 2 * ladder.h;
  between(metres(walk), 4, 6, 'walk speed (m/s)');
  assert.ok(distance / walk < 30, `the quay walk is ${(distance / walk).toFixed(1)} s`);
});

test('quay people: three residents to escort, Tomas Wren, Lucia Ferro and the north-quay patient on the stretcher', () => {
  for (const phase of ['unload', 'carry', 'triage', 'power', 'escort', 'report']) {
    const state = normalizePortMeridienV90({ schema: 90, phase, freight: 'medical' });
    assert.equal(state.civiliansX.length, 3, phase);
  }
  assert.deepEqual(createPortMeridienV90().civiliansX, [...PORT_CIVILIANS_WAIT_V188]);
  assert.deepEqual(scene.people.map(person => person.id), ['tomas-wren', 'lucia-ferro'], 'named people are not among the escorted');
  assert.equal(scene.patient.id, 'north-quay-patient'); assert.equal(scene.patient.bandagedChest, true);
  for (const person of scene.people) between(metres(person.h), 1.55, 1.9, person.id);
  const wren = scene.people[0], ferro = scene.people[1];
  assert.ok(wren.x > scene.unloadLot.x + scene.unloadLot.w && wren.x < scene.railCrate.x, 'Wren meets the ramp');
  assert.ok(ferro.x < scene.bed.x && scene.bed.x - ferro.x < 51, 'Ferro at the stretcher');
  for (const x of PORT_CIVILIANS_WAIT_V188) assert.ok(x - 20 > scene.bed.x + scene.bed.w, 'the residents wait beside the stretcher, not on it');
  const draw = read('src/hub-port-meridien-v90.js');
  assert.match(draw, /drawPatientV188\(ctx, scene\.bed, time, still\)/);
  assert.match(draw, /for \(const person of scene\.people\) items\.push/);
  assert.match(draw, /drawLotMarkV188\(ctx, x, y, box\.w, box\.h, state\.freight\)/, 'the lot shows the freight chosen (medical or energy)');
});

test('quay depth lanes: every prop leaves a 20-unit lane along the wall; the escort path is never blocked', () => {
  const room = PORT_DEPTH_ROOM_V188;
  for (const prop of room.props) {
    const behind = room.zMax - prop.footprint.z1, front = prop.footprint.z0 - room.zMin;
    assert.ok(behind >= LANE || prop.kind === 'rail-crate', `${prop.id}: lane behind ${behind}`);
    assert.ok(front >= LANE || front <= 0, `${prop.id}: a squeeze lane of ${front} in front`);
  }
  // The rail crate is jumped near the wall and walked around in front (lane of 46).
  assert.ok(props['port-rail-crate'].footprint.z0 - room.zMin >= LANE);
  // Escort: residents walk from where they wait to where they are safe, at any depth the marine leads them to.
  for (const playerZ of [0, -10, -20, -30, -38]) for (let i = 0; i < 3; i++) {
    const z = civilianDepthTargetV188(playerZ, i);
    for (let x = PORT_CIVILIANS_WAIT_V188[i]; x <= PORT_CIVILIANS_SAFE_V188[i]; x += 8)
      assert.equal(blockedByFootprintV188(room, x, z, 18), false, `resident ${i} at x ${x}, z ${z}`);
  }
  for (const z of [0, -10, -38]) for (let x = 600; x <= 2360; x += 8) assert.equal(blockedByFootprintV188(room, x, z, 16), false, `marine at ${x}, ${z}`);
  assert.equal(freeDepthV188(room, 1020, -60), -46, 'pushed out of the container towards the wall');
  for (const prop of room.props) if (prop.kind !== 'rail-crate')
    assert.ok(prop.footprint.x0 > scene.gate.x + scene.gate.w + 300 || prop.footprint.x1 < scene.gate.x, `${prop.id} keeps clear of the airlock`);
  assert.ok(props['port-pallet'].footprint.x0 > PORT_POSTS_V90.report.x, 'nothing between the open airlock and the safe spots');
});

test('quay residents: safe beyond the lit airlock and clear of the report terminal', () => {
  PORT_CIVILIANS_SAFE_V188.forEach(x => assert.ok(x - 20 > scene.gate.x + scene.gate.w && x + 20 < scene.reportConsole.x, `safe spot ${x}`));
  const marine = { alive: true, grounded: true, x: PORT_POSTS_V90.report.x - 22, y: FLOOR - MARINE_H, w: 44, h: MARINE_H };
  assert.equal(portPhysicalContactV90({ phase: 'report' }, marine), true);
});

test('quay saves: older positions stay valid; moved spots only clamp, never reject', () => {
  const base = { schema: 90, phase: 'escort', freight: 'medical', following: true, revision: 3, x: 900, y: 532 };
  assert.deepEqual(normalizePortMeridienV90({ ...base, civiliansX: [810, 865, 920] }).civiliansX, [810, 865, 920], 'historical waiting spots');
  assert.deepEqual(normalizePortMeridienV90({ ...base, civiliansX: [2160, 2215, 2270] }).civiliansX, [...PORT_CIVILIANS_SAFE_V188], 'historical safe spots clamp');
  assert.deepEqual(normalizePortMeridienV90({ ...base }).civiliansX, [...PORT_CIVILIANS_WAIT_V188]);
  const proof = { openingPhase: 'ready', onboardingComplete: true, revision: 3, actor: { alive: true, x: 2300, y: 532, facing: 1 } };
  const old = advancePortMeridienV90({ ...base, civiliansX: [2160, 2215, 2270] }, 'escort', { ...proof, civiliansX: [2160, 2215, 2270] });
  assert.equal(old.ok, true); assert.equal(old.state.phase, 'report'); assert.deepEqual(old.state.civiliansX, [...PORT_CIVILIANS_SAFE_V188]);
  assert.equal(advancePortMeridienV90(base, 'escort', { ...proof, civiliansX: [2000, 2155, 2210] }).reason, 'civilians-not-safe');
  for (const phase of ['report', 'complete']) {
    const saved = normalizePortMeridienV90({ ...base, phase, civiliansX: [2160, 2215, 2270], receipt: 'port-meridien:quai-des-vivants:v90' });
    assert.deepEqual(saved.civiliansX, [...PORT_CIVILIANS_SAFE_V188], phase);
  }
  assert.equal(normalizePortMeridienV90({ ...base, z: -42 }).z, -42, 'depth kept');
  // A marine saved anywhere on the floor or the catwalk never ends up inside the open-gate bulkhead.
  const geometry = portGeometryV90({ phase: 'escort' }), lintel = geometry.colliders[1], catwalk = geometry.platforms[1];
  assert.ok(FLOOR - MARINE_H >= lintel.y + lintel.h, 'standing on the quay floor');
  assert.ok(catwalk.x + catwalk.w < lintel.x, 'standing on the catwalk');
});

test('quay signage: the four bible signs, in French and in English', () => {
  assert.deepEqual(scene.signs.map(sign => sign.fr), ['RAMPE · FRET', 'TRIAGE · HABITANTS', 'RELAIS DU SAS', 'SECTEUR NORMAL ?']);
  assert.deepEqual(scene.signs.map(sign => portSignTextV188(sign, 'en')), ['RAMP · FREIGHT', 'TRIAGE · RESIDENTS', 'AIRLOCK RELAY', 'NORMAL SECTOR?']);
  assert.equal(portSignTextV188(scene.signs[0], 'fr'), 'RAMPE · FRET');
  const relay = scene.signs.find(sign => sign.id === 'relay'), normal = scene.signs.find(sign => sign.id === 'normal-sector');
  assert.ok(Math.abs(relay.x - scene.relayConsole.x) < 100 && relay.y < scene.relayConsole.y, 'relay sign over the relay');
  assert.ok(Math.abs(normal.x - scene.reportConsole.x) < 100 && normal.y < scene.reportConsole.y, 'normal-sector sign over the airlock terminal');
});

test('quay lighting: floodlights at the ramp, the emergency light on the airlock, rain over the quay', () => {
  for (const light of scene.floodlights) assert.ok(light.reach[0] < scene.unloadLot.x + scene.unloadLot.w && light.reach[1] > scene.unloadLot.x, 'the floodlights reach the ramp foot');
  assert.ok(scene.emergencyLight.x > scene.gate.x && scene.emergencyLight.x < scene.gate.x + scene.gate.w && scene.emergencyLight.y <= scene.gate.wallTop, 'beacon on the bulkhead');
  const draw = read('src/hub-port-meridien-v90.js');
  assert.match(draw, /Light rain over the open quay/);
  assert.match(draw, /const pulse = still \? \.5/, 'the beacon does not pulse under reduced motion');
});

// Explicit browser/Canvas observation host. Production HubGame, the depth
// wrapper, its player renderer and the actual start/draw methods run unchanged.
// PNG dimensions come from shipped headers; pixels are reviewed independently.
const ArtHub = withHubDepthRoomsV188(HubGame);
const artPath = id => PORT_QUAY_ART_V188[id].path;
const newPaths = new Set(PORT_QUAY_ART_IDS_V188.map(artPath));
const dimensions = new Map();
function pngSize(source) {
  if (dimensions.has(source)) return dimensions.get(source);
  let fd, result;
  try {
    const path = new URL(source, 'https://quay.invalid/').pathname;
    fd = openSync(new URL('..' + path, import.meta.url), 'r');
    const header = Buffer.alloc(24); readSync(fd, header, 0, 24, 0);
    if (header.subarray(1, 4).toString() === 'PNG') result = [header.readUInt32BE(16), header.readUInt32BE(20)];
  } catch {} finally { if (fd !== undefined) closeSync(fd); }
  dimensions.set(source, result); return result;
}
function recordingContext() {
  const calls = [], stack = []; let matrix = [1, 0, 0, 1, 0, 0];
  const multiply = ([a, b, c, d, e, f]) => {
    const [aa, bb, cc, dd, ee, ff] = matrix;
    matrix = [aa * a + cc * b, bb * a + dd * b, aa * c + cc * d, bb * c + dd * d, aa * e + cc * f + ee, bb * e + dd * f + ff];
  };
  const ctx = new Proxy({
    globalAlpha: 1, globalCompositeOperation: 'source-over',
    save() { stack.push({ matrix: [...matrix], alpha: this.globalAlpha, composite: this.globalCompositeOperation }); },
    restore() { const value = stack.pop(); assert.ok(value, 'Canvas restore has a matching save'); matrix = value.matrix; this.globalAlpha = value.alpha; this.globalCompositeOperation = value.composite; },
    translate(x, y) { multiply([1, 0, 0, 1, x, y]); }, scale(x, y) { multiply([x, 0, 0, y, 0, 0]); },
    rotate(angle) { multiply([Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0, 0]); },
    transform(...value) { multiply(value); }, setTransform(...value) { matrix = value; },
    getTransform() { return Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map((key, index) => [key, matrix[index]])); },
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    measureText: value => ({ width: String(value).length * 7 }),
    drawImage(image, ...args) { calls.push({ kind: 'image', path: image.currentSrc || image.src, args, matrix: [...matrix] }); },
    fillText(value, ...args) { calls.push({ kind: 'text', value: String(value), args, matrix: [...matrix] }); },
    fillRect(...args) { calls.push({ kind: 'fill', color: ctx.fillStyle, args, matrix: [...matrix] }); }
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  return { ctx, calls, reset() { calls.length = 0; }, balanced() { assert.equal(stack.length, 0); assert.deepEqual(matrix, [1, 0, 0, 1, 0, 0]); } };
}
function quayHost(t, { holdArt = false } = {}) {
  const names = ['addEventListener', 'removeEventListener', 'dispatchEvent', 'document', 'Image', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const events = new EventTarget(), images = [], requests = [], hubs = [], drawing = recordingContext(); let frames = 0;
  for (const name of names.slice(0, 3)) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = false; naturalWidth = 0; naturalHeight = 0;
    constructor() { super(); images.push(this); }
    set src(value) { this._src = String(value); requests.push(this._src); if (!(holdArt && newPaths.has(this._src))) this.finish(); }
    get src() { return this._src; }
    finish(failed = false) {
      const size = failed ? null : pngSize(this.src); this.complete = true;
      this.naturalWidth = this.width = size?.[0] || 0; this.naturalHeight = this.height = size?.[1] || 0;
      const type = size ? 'load' : 'error'; this.dispatchEvent(new Event(type)); this[`on${type}`]?.();
    }
    async decode() { if (!this.complete || !this.naturalWidth) throw new Error('Image not ready'); }
  };
  globalThis.requestAnimationFrame = () => ++frames; globalThis.cancelAnimationFrame = () => {};
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => drawing.ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    setPointerCapture() {}, hasPointerCapture: () => false, releasePointerCapture() {} });
  t.after(() => {
    for (const hub of hubs) hub.stop(false);
    for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
  });
  return { images, requests, drawing, get frames() { return frames; },
    make() { const hub = new ArtHub(canvas, { onAction: () => true }); hubs.push(hub); return hub; },
    async flush() { for (let i = 0; i < 4; i++) await Promise.resolve(); } };
}
function quayOptions(phase = 'triage') {
  return { onboardingV84: { ...createPlayerOnboardingV84({ name: 'Alex Ward', callsign: 'ECHO-9' }), phase: 'complete' },
    openingV88: { schema: 88, phase: 'ready', freight: 'medical', qualificationId: 'm41a-qualification-v81:session-1:qualification' },
    portMeridienV90: { schema: 90, phase, freight: 'medical', x: 755, y: 532, facing: 1, z: 0 } };
}
async function artFixture(t, options = {}) {
  const host = quayHost(t, options), hub = host.make(); hub.start({}, quayOptions()); await host.flush();
  return { ...host, hub, render(time = 0, still = false) {
    hub.animationTime = time; hub.reducedMotion = still; host.drawing.reset(); hub.draw(); host.drawing.balanced(); return host.drawing.calls.slice();
  } };
}
const imageCalls = calls => calls.filter(call => call.kind === 'image');
const artCalls = (calls, id) => imageCalls(calls).filter(call => call.path === artPath(id));
const pointOnSource = (call, [sx, sy]) => {
  const [ix, iy, iw, ih, dx, dy, dw, dh] = call.args, [a, b, c, d, e, f] = call.matrix;
  const x = dx + (sx - ix) * dw / iw, y = dy + (sy - iy) * dh / ih;
  return [a * x + c * y + e, b * x + d * y + f];
};
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('quay art production: named bodies keep native feet, facing and depth while all three civilians remain animated', async t => {
  const fixture = await artFixture(t), { hub } = fixture, state = structuredClone(hub.portStateV90), geometry = structuredClone(hub.currentAnnexV71());
  hub.annexCameraV71.x = 0;
  const calls = fixture.render(), wren = artCalls(calls, 'tomas-wren-standing')[0], ferro = artCalls(calls, 'lucia-ferro-standing')[0];
  assert.ok(wren && ferro);
  assert.deepEqual(pointOnSource(wren, [493, 1524]), [330, 628]); assert.deepEqual(pointOnSource(ferro, [514, 1519]), [690, 626]);
  near(pointOnSource(wren, [493, 12])[1], 537); near(pointOnSource(ferro, [514, 12])[1], 540);
  assert.ok(wren.matrix[0] < 0 && ferro.matrix[0] > 0); near(Math.abs(wren.matrix[0]), Math.abs(wren.matrix[3]));
  near(ferro.matrix[0], ferro.matrix[3]);
  for (const call of [wren, ferro]) { near(call.args[6] / call.args[2], call.args[7] / call.args[3]); assert.ok(call.args.every(Number.isFinite)); }
  assert.deepEqual(hub.portStateV90, state); assert.deepEqual(hub.currentAnnexV71(), geometry);
  const civilians = imageCalls(calls).filter(call => call.path === PORT_ASSETS_V90.civilians);
  assert.equal(civilians.length, 3); assert.equal(civilians[0].args[0], 512, 'triage resident keeps its existing brace cell');
  assert.deepEqual(civilians.map(call => call.args[1]), [0, 256, 512]);
  const playerAt = list => list.findIndex(call => call.kind === 'image' && /\/sprites\/player\//.test(call.path));
  assert.ok(playerAt(calls) >= 0, 'the real player renderer contributes');
  assert.ok(playerAt(calls) < calls.indexOf(ferro), 'wall-side player is behind Ferro');
  hub.player.depthZ = -40;
  const front = fixture.render(); assert.ok(playerAt(front) > front.indexOf(artCalls(front, 'tomas-wren-standing')[0]), 'front-lane player is drawn over Wren');
  hub.annexCameraV71.x = 320;
  const translated = fixture.render(); near(pointOnSource(artCalls(translated, 'lucia-ferro-standing')[0], [514, 1519])[0], 370);
});

test('quay art production: mattress contacts stay fixed and only the thorax uses the native positive 0–1 px breath', async t => {
  const fixture = await artFixture(t); fixture.hub.annexCameraV71.x = 0;
  const rest = fixture.render(0), peak = fixture.render(Math.PI / 4.4), negative = fixture.render(3 * Math.PI / 4.4);
  const a = artCalls(rest, 'north-quay-patient'), b = artCalls(peak, 'north-quay-patient'), deck = artCalls(rest, 'medical-stretcher')[0];
  assert.ok(deck && a.length > 2);
  assert.deepEqual(artCalls(peak, 'medical-stretcher')[0], deck); near(pointOnSource(deck, [961, 812])[1], 624);
  near(pointOnSource(deck, [1829, 87])[0] - pointOnSource(deck, [96, 87])[0], 102);
  near(pointOnSource(a.at(-1), [2025, 455])[1], pointOnSource(deck, [1700, 87])[1], .14);
  near(pointOnSource(a.at(-1), [100, 583])[1], pointOnSource(deck, [150, 175])[1], .14);
  assert.deepEqual(a[0], b[0], 'legs stay fixed'); assert.deepEqual(a.at(-2), b.at(-2), 'head stays fixed'); assert.deepEqual(a.at(-1), b.at(-1), 'hand and contact strip stay fixed');
  let largestLift = 0;
  for (let i = 1; i < a.length - 2; i++) {
    const lift = a[i].args[5] - b[i].args[5]; largestLift = Math.max(largestLift, lift);
    assert.ok(lift >= 0 && lift <= 1); near(a[i].args[5] + a[i].args[7], b[i].args[5] + b[i].args[7], 1e-9);
  }
  assert.ok(largestLift > .95); assert.deepEqual(artCalls(negative, 'north-quay-patient'), a, 'negative half-cycle rests at zero');
  assert.deepEqual(artCalls(fixture.render(5, true), 'north-quay-patient'), artCalls(fixture.render(0, true), 'north-quay-patient'));
});

test('quay art production: partial or invalid support images retain the entire old patient/bed pair', async t => {
  const fixture = await artFixture(t), { hub } = fixture;
  const patient = hub.portImagesV90.get('north-quay-patient'), bed = hub.portImagesV90.get('medical-stretcher');
  for (const [patientReady, bedReady] of [[false, false], [true, false], [false, true], [true, true]]) {
    patientReady ? hub.portImagesV90.set('north-quay-patient', patient) : hub.portImagesV90.delete('north-quay-patient');
    bedReady ? hub.portImagesV90.set('medical-stretcher', bed) : hub.portImagesV90.delete('medical-stretcher');
    const calls = fixture.render(), modern = patientReady && bedReady;
    assert.equal(artCalls(calls, 'north-quay-patient').length > 0, modern); assert.equal(artCalls(calls, 'medical-stretcher').length > 0, modern);
    assert.equal(imageCalls(calls).some(call => call.path === PORT_ASSETS_V90.medical), !modern);
    assert.equal(calls.some(call => call.kind === 'fill' && call.color === '#e8e4da' && call.args[2] === 12), !modern, 'native bandage remains with the old bed');
    assert.equal(artCalls(calls, 'tomas-wren-standing').length, 1, 'independent body remains visible');
  }
  for (const invalid of [{ ...bed, src: artPath('north-quay-patient') }, { src: artPath('medical-stretcher'), complete: true, naturalWidth: 512, naturalHeight: 512 }]) {
    hub.portImagesV90.set('medical-stretcher', invalid);
    const calls = fixture.render(); assert.equal(artCalls(calls, 'north-quay-patient').length, 0); assert.equal(artCalls(calls, 'medical-stretcher').length, 0);
    assert.ok(imageCalls(calls).some(call => call.path === PORT_ASSETS_V90.medical));
  }
  hub.portImagesV90.delete('tomas-wren-standing');
  assert.ok(fixture.render().some(call => call.kind === 'fill' && call.color === '#d39a2f'), 'Wren retains his native high-visibility silhouette');
});

test('quay art admission: image ownership, exact dimensions and finite target windows are required before drawing', async t => {
  const fixture = await artFixture(t), { hub } = fixture, original = hub.portImagesV90.get('medical-stretcher');
  for (const id of PORT_QUAY_ART_IDS_V188) assert.equal(portQuayArtReadyV188(hub.portImagesV90.get(id), id), true, id);
  const source = { src: artPath('medical-stretcher'), complete: true, naturalWidth: 1923, naturalHeight: 818 };
  for (const invalid of [{ ...source, src: artPath('north-quay-patient') }, { ...source, currentSrc: artPath('north-quay-patient') },
    { ...source, src: source.src + '?other=1' }, { ...source, src: 'data:image/png;base64,AA' },
    { ...source, complete: false }, { ...source, naturalHeight: 817 }, { ...source, naturalWidth: 0 }]) {
    assert.equal(portQuayArtReadyV188(invalid, 'medical-stretcher'), false);
  }
  const drawing = recordingContext();
  for (const bed of [{ ...scene.bed, x: NaN }, { ...scene.bed, h: 0 }, { ...scene.bed, y: Infinity }])
    assert.equal(drawPortQuayTriageV188(drawing.ctx, hub.portImagesV90, bed), false);
  assert.equal(drawing.calls.length, 0, 'invalid target never partly paints a pair'); drawing.balanced();
  assert.equal(hub.portImagesV90.get('medical-stretcher'), original);
});

test('quay art lifecycle: entry owns four requests, shares pending/ready images and retries errors without late reactivation', async t => {
  const host = quayHost(t, { holdArt: true }), hub = host.make(), opts = quayOptions();
  hub.start({}, quayOptions('pending')); await host.flush();
  assert.equal(host.requests.filter(path => newPaths.has(path)).length, 0, 'ship start does not request quay art');
  hub.start({}, opts); await host.flush();
  assert.deepEqual(host.requests.filter(path => newPaths.has(path)), PORT_QUAY_ART_IDS_V188.map(artPath));
  const pending = new Map(PORT_QUAY_ART_IDS_V188.map(id => [id, hub.portImagesV90.get(id)]));
  const state = structuredClone(hub.portStateV90), count = host.requests.length;
  for (let i = 0; i < 3; i++) hub.draw(); assert.equal(host.requests.length, count, 'drawing makes no request');
  hub.start({}, opts); await host.flush();
  for (const [id, image] of pending) assert.equal(hub.portImagesV90.get(id), image, 'pending request shared: ' + id);
  const old = pending.get('medical-stretcher'); old.finish(true);
  for (const [id, image] of pending) if (id !== 'medical-stretcher') image.finish();
  hub.start({}, opts); await host.flush();
  const replacement = hub.portImagesV90.get('medical-stretcher'); assert.notEqual(replacement, old);
  assert.equal(host.requests.filter(path => newPaths.has(path)).length, 5, 'only the failed image retried');
  for (const [id, image] of pending) if (id !== 'medical-stretcher') assert.equal(hub.portImagesV90.get(id), image, 'ready image shared: ' + id);
  const currentState = structuredClone(hub.portStateV90), frames = host.frames;
  old.finish(); await host.flush(); assert.equal(hub.portImagesV90.get('medical-stretcher'), replacement);
  assert.deepEqual(hub.portStateV90, currentState); assert.equal(host.frames, frames, 'old completion schedules no frame');
  hub.stop(false); host.drawing.reset(); replacement.finish(); await host.flush();
  assert.equal(hub.running, false); assert.equal(host.frames, frames); assert.equal(host.drawing.calls.length, 0, 'late load does not repaint or restart a stopped hub');
  assert.deepEqual(hub.portStateV90, state); host.drawing.balanced();
});
