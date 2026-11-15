// V188 — level-design coherence of the Port-Méridien quay (P-3, « Le quai des vivants »).
// Scale: the marine (92 px) is about 1.80 m, so 1 m ≈ 51 px. Depth lanes use the hangar's
// own minimum lane (20 depth units). Pure checks over the rules, the geometry and the scene layout.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PORT_POSTS_V90, PORT_WORLD_V90, PORT_CIVILIANS_WAIT_V188, PORT_CIVILIANS_SAFE_V188, createPortMeridienV90,
  normalizePortMeridienV90, advancePortMeridienV90, portPhysicalContactV90 } from '../src/port-meridien-v90.js';
import { PORT_SCENE_V188, PORT_METRE_PX_V188, portGeometryV90, portSignTextV188 } from '../src/hub-port-meridien-v90.js';
import { PORT_DEPTH_ROOM_V188, blockedByFootprintV188, freeDepthV188, civilianDepthTargetV188 } from '../src/hub-depth-rooms-v188.js';

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
  between(metres(scene.bed.w), 2.0, 2.4, 'stretcher with its monitor arm'); assert.equal(scene.bed.y + scene.bed.h, FLOOR);
  for (const key of ['relayConsole', 'reportConsole']) { between(metres(scene[key].h), 1.1, 1.6, `${key} height`); between(metres(scene[key].w), 1.2, 1.8, `${key} width`); }
  assert.equal(scene.relayConsole.y + scene.relayConsole.h, 432, 'the relay stands on the catwalk');
  assert.equal(scene.reportConsole.y + scene.reportConsole.h, FLOOR);
  // Drawn bitmaps stay within 25 % of the source aspect (sensor console 215×188, stretcher 225×174, crates 175×160).
  const aspect = (box, w, h) => Math.abs(box.w / box.h / (w / h) - 1);
  assert.ok(aspect(scene.relayConsole, 215, 188) < .25 && aspect(scene.bed, 225, 174) < .25 && aspect(scene.unloadLot, 175, 160) < .25);
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
