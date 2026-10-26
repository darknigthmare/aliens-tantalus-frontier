import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { buildHubTraversalGeometryV87 } from '../src/hub-v51-runtime.js';
import { drawHubSteelServicesV133 } from '../src/hub-authored-composition-v133.js';
import { getHubRoomLifePlanV136 } from '../src/hub-room-life-v136.js';
import { HUB_ROOM_SERVICE_DETAILS_V165, getHubRoomServiceDetailPlanV165,
  getHubRoomServiceMotionV165, drawHubRoomServiceDetailsV165 } from '../src/hub-room-service-details-v165.js';
import { REFUGE_ART_V87, REFUGE_PROPS_LAYOUT_V87, REFUGE_PORTRAIT_LABEL_V87,
  getRefugeApertureV87, drawRefugeLayerV87 } from '../src/refuge-art-v87.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137];
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function production(room) {
  const deck = HUB_DECKS.findIndex(deck => deck.rooms.includes(room));
  const geometry = deck < 0 ? room : buildHubTraversalGeometryV87(deck);
  return getHubRoomLifePlanV136(room, { ladders: geometry.ladders, vents: geometry.vents || [],
    platforms: geometry.platforms, doors: deck < 0 ? [] : buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck) });
}
const compositions = new Map(rooms.map(room => [room.id, production(room)]));
function canvas() {
  let depth = 0;
  const clips = [], texts = [], imageCalls = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    rect(...b) { clips.push(b); }, fillText(text, ...args) { texts.push({ text, args }); },
    drawImage(...args) { imageCalls.push(args); }, measureText: text => ({ width: Array.from(text).length * 4 }),
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, clips, texts, imageCalls, balanced: () => assert.equal(depth, 0) };
}

test('35 real compartments retain 31 explicit service assemblies and four deliberate clear envelopes', () => {
  assert.equal(rooms.length, 35);
  assert.deepEqual(Object.keys(HUB_ROOM_SERVICE_DETAILS_V165).sort(), rooms.map(room => room.id).sort());
  let admitted = 0;
  const kept = [];
  for (const room of rooms) {
    const composition = compositions.get(room.id), plan = composition.serviceDetailsV165;
    assert.ok(plan);
    assert.equal(plan.projection, composition.spatial.projection.kind);
    assert.equal(plan.projectionDxPerY, composition.spatial.projection.dxPerY);
    assert.equal(plan.geometryPreserved, true);assert.equal(plan.collidable, false);assert.equal(plan.interactive, false);
    assert.ok(plan.omitted.every(entry => entry.intentional), `${room.id}: an authored position was rejected`);
    admitted += plan.items.length;
    if (!plan.items.length) kept.push(room.id);
  }
  assert.equal(admitted, 31);
  assert.deepEqual(kept.sort(), ['bridge', 'dropship-hangar', 'flight-control-cockpit', 'personal-refuge'].sort());
});

test('complete mounting footprints clear every final furnishing, worktop, clinical fitting and native exclusion', () => {
  for (const room of rooms) {
    const c = compositions.get(room.id), p = c.serviceDetailsV165;
    const blocked = [...c.spatial.reservations, ...c.items,
      ...(c.workstationDetailsV139?.items || []).map(entry => entry.target),
      ...(c.clinicalBayV139?.parts || []).map(entry => entry.bounds)];
    for (const item of p.items) {
      assert.equal(item.support, 'flush-rear-wall');assert.equal(item.plane, 'rear');
      assert.equal(item.collidable, false);assert.equal(item.interactive, false);
      assert.ok(item.mountBounds.y + item.mountBounds.h <= c.floorY - 112, `${room.id}: the ground-floor human lane must remain below the assembly`);
      assert.ok(item.bounds.w <= 104 && item.bounds.h <= 46, `${room.id}: a fitting cannot become an oversized false workstation`);
      for (const b of blocked) assert.ok(!overlap(item.clearanceBounds, b), `${room.id}:${b.role || 'furnishing'}`);
    }
  }
});

test('the medical mount clears the native service pipe and its lower wall clamp actually painted after room dressing', () => {
  const room = rooms.find(room => room.id === 'medical');
  const deck = HUB_DECKS.findIndex(deck => deck.rooms.includes(room));
  const pipe = buildHubTraversalGeometryV87(deck).occluders.find(entry => entry.id === 'medical-pipe');
  assert.ok(pipe, 'Use the real native traversal descriptor, without moving its service run');
  const painted = [], segments = [];
  let point;
  const ctx = {
    lineWidth: 1,
    save() {}, restore() {},
    beginPath() { segments.length = 0; point = null; },
    moveTo(x, y) { point = [x, y]; },
    lineTo(x, y) { segments.push([point, [x, y]]); point = [x, y]; },
    stroke() {
      const radius = this.lineWidth / 2;
      for (const [[ax, ay], [bx, by]] of segments) painted.push({
        x: Math.min(ax, bx) - radius, y: Math.min(ay, by) - radius,
        w: Math.abs(ax - bx) + radius * 2, h: Math.abs(ay - by) + radius * 2,
        role: 'actual-native-stroked-pipe'
      });
    },
    fillRect(x, y, w, h) { painted.push({ x, y, w, h, role: 'actual-native-wall-clamp', color: this.fillStyle }); }
  };
  assert.equal(drawHubSteelServicesV133(ctx, pipe), true);
  const clamps = painted.filter(rectangle => rectangle.color === '#4b6463');
  assert.equal(clamps.length, 2);
  const item = compositions.get(room.id).serviceDetailsV165.items[0];
  assert.ok(item);
  // The historical y400 fixture reproduced by native QA must fail against
  // these independently recorded native rectangles, regardless of the fix.
  const historical = { ...item.clearanceBounds,
    y: 400 - (item.bounds.y - item.clearanceBounds.y) };
  assert.ok(clamps.some(rectangle => overlap(historical, rectangle)), 'The native failure remains represented');
  for (const rectangle of painted)
    assert.ok(!overlap(item.clearanceBounds, rectangle), 'The whole clearance envelope must clear ' + rectangle.role);
});

test('a newly occupied authored bay is explicitly omitted instead of moving the assembly somewhere arbitrary', () => {
  const room = rooms.find(room => room.id === 'medical'), c = compositions.get(room.id);
  const candidate = c.serviceDetailsV165.items[0];
  const occupied = { ...c, spatial: { ...c.spatial, reservations: [...c.spatial.reservations,
    { ...candidate.mountBounds, role: 'new-native-fitting' }] } };
  const before = structuredClone(occupied), one = getHubRoomServiceDetailPlanV165(room, occupied);
  assert.equal(one.items.length, 0);assert.equal(one.omitted.length, 1);
  assert.equal(one.omitted[0].intentional, false);
  assert.equal(one.omitted[0].reason, 'occupied-authored-service-bay');
  assert.ok(one.omitted[0].conflicts.includes('new-native-fitting'));
  assert.deepEqual(occupied, before);
  assert.deepEqual(getHubRoomServiceDetailPlanV165(room, occupied), one);
});

test('authored wall coordinates translate with their room and do not depend on camera distance', () => {
  const room = { id: 'quarantine' };
  const model = offset => ({ items: [], spatial: { bounds: { x: offset, y: 186, w: 1280, h: 438 },
    planes: { walkY: 624, ceilingY: 186 }, projection: { kind: 'orthographic', dxPerY: 0 }, reservations: [] } });
  const zero = getHubRoomServiceDetailPlanV165(room, model(0)), far = getHubRoomServiceDetailPlanV165(room, model(120000));
  assert.equal(zero.items.length, 1);assert.equal(far.items.length, 1);
  for (const key of ['bounds', 'mountBounds', 'clearanceBounds']) {
    assert.equal(far.items[0][key].x - zero.items[0][key].x, 120000);
    for (const axis of ['y', 'w', 'h']) assert.equal(far.items[0][key][axis], zero.items[0][key][axis]);
  }
  assert.equal(getHubRoomServiceDetailPlanV165({ id: 'unknown' }, model(0)), null);
  assert.equal(getHubRoomServiceDetailPlanV165(room, { spatial: {} }), null);
  assert.ok(Object.isFrozen(HUB_ROOM_SERVICE_DETAILS_V165.quarantine));
});

test('service details paint only their clipped mounts, balance canvas state and never scale an image', () => {
  for (const c of compositions.values()) {
    const subject = canvas(), plan = c.serviceDetailsV165;
    const before = structuredClone(plan), report = drawHubRoomServiceDetailsV165(subject.ctx, plan, { time: 12.5 });
    assert.deepEqual(report.paintedIds, plan.items.map(item => item.id));
    assert.deepEqual(subject.clips, plan.items.map(item => Object.values(item.mountBounds)));
    assert.equal(subject.imageCalls.length, 0);
    assert.deepEqual(plan, before);subject.balanced();
  }
});

test('ventilation has a slow bounded rotation and reduced motion freezes every animated service value', () => {
  const fixed = getHubRoomServiceMotionV165(0, { reducedMotion: true });
  for (const time of [-100, 0, 1, 12.5, 999999, Number.NaN]) {
    assert.deepEqual(getHubRoomServiceMotionV165(time, { reducedMotion: true }), fixed);
    const motion = getHubRoomServiceMotionV165(time);
    assert.ok(motion.fanAngle >= 0 && motion.fanAngle < Math.PI * 2);
    assert.ok(motion.pilotOpacity >= .545 - 1e-10 && motion.pilotOpacity <= .615 + 1e-10);
  }
  assert.ok(getHubRoomServiceMotionV165(.1).fanAngle < .06, 'No rapid decorative fan spin');
});

test('the refuge nameplate is attached to the real frame without covering its personal photo aperture', () => {
  const frame = REFUGE_PROPS_LAYOUT_V87.find(entry => entry.kind === 'portrait');
  const aperture = getRefugeApertureV87('portrait', frame), label = REFUGE_PORTRAIT_LABEL_V87;
  const plate = label.mountBounds;
  assert.ok(plate.x >= frame.x && plate.x + plate.w <= frame.x + frame.w);
  assert.ok(plate.y >= frame.y && plate.y + plate.h <= frame.y + frame.h);
  assert.ok(plate.y + plate.h < aperture.y);assert.ok(!overlap(plate, aperture));
  assert.ok(label.y < 624 - 96.5, 'The name stays above the standing actor');
  assert.ok(label.maxWidth < plate.w);assert.ok(label.size <= 8);
});

test('the refuge preserves chosen names and omits floating development labels in normal decor', () => {
  const prop = REFUGE_ART_V87.prop;
  const images = new Map([['prop', { complete: true, naturalWidth: prop.width, naturalHeight: prop.height, src: prop.path }]]);
  for (const name of ['', 'Nom choisi']) {
    const subject = canvas();
    assert.equal(drawRefugeLayerV87(subject.ctx, images, { layer: 'decor', personal: { name }, time: 0 }), true);
    assert.deepEqual(subject.texts.map(entry => entry.text), [name || 'SOUVENIRS']);
    assert.ok(!subject.texts.some(entry => /PERSONNALISABLE|GÉNÉRIQUE|SIMULATION/.test(entry.text)));
    subject.balanced();
  }
});
