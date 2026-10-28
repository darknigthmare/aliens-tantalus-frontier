import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS } from '../src/hub-game.js';
import { HUB_ANNEXES_V137 } from '../src/hub-annex-registry-v137.js';
import { HUB_ROOM_PRESENTATIONS_V119 } from '../src/hub-room-presentation-v119.js';
import { getHubRoomProjectionV139 } from '../src/hub-room-projection-v139.js';
import { getHubCompartmentShellPlanV138 } from '../src/hub-compartment-shell-v138.js';
import { getHubRoomParallaxPlanV134, drawHubRoomParallaxV134 } from '../src/hub-room-parallax-v134.js';
import { HUB_ROOM_BACKGROUNDS_V168, getHubRoomBackgroundPlanV168,
  drawHubRoomBackgroundV168 } from '../src/hub-room-backgrounds-v168.js';

const rooms = [...HUB_DECKS.flatMap(deck => deck.rooms), ...HUB_ANNEXES_V137.map(room => ({ ...room, xStart: 0 }))];
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} differs from ${b}`);
function canvas() {
  let depth = 0;
  const paths = [], clips = [], fills = [];
  const ctx = new Proxy({
    save() { depth++; }, restore() { assert.ok(depth > 0); depth--; },
    beginPath() { paths.push([]); }, moveTo(x, y) { paths.at(-1).push([x, y]); },
    lineTo(x, y) { paths.at(-1).push([x, y]); }, rect(...box) { clips.push(box); },
    fillRect(...box) { fills.push({ color: ctx.fillStyle, alpha: ctx.globalAlpha, box }); },
    createLinearGradient: () => ({ addColorStop() {} })
  }, { get: (target, key) => key in target ? target[key] : () => {} });
  return { ctx, paths, clips, fills, balanced() { assert.equal(depth, 0); } };
}

test('every existing compartment receives its own purpose and architectural schedule without another navigation or projection registry', () => {
  assert.equal(rooms.length, 35);
  assert.deepEqual(Object.keys(HUB_ROOM_BACKGROUNDS_V168).sort(), Object.keys(HUB_ROOM_PRESENTATIONS_V119).sort());
  assert.equal(new Set(Object.values(HUB_ROOM_BACKGROUNDS_V168).map(profile => profile.purpose)).size, 35);
  assert.ok(new Set(Object.values(HUB_ROOM_BACKGROUNDS_V168).map(profile => profile.lining)).size >= 10);
  for (const room of rooms) {
    const profile = HUB_ROOM_BACKGROUNDS_V168[room.id], before = structuredClone(room);
    const model = getHubRoomParallaxPlanV134(room), plan = getHubRoomBackgroundPlanV168(room, model);
    assert.ok(Object.isFrozen(profile)); assert.equal(profile.countedAsProp, false);
    assert.equal(plan.projection, getHubRoomProjectionV139(room).mode);
    assert.ok(plan.lights.length > 0, room.id + ' must retain a real architectural light schedule');
    assert.equal(plan.collidable, false); assert.equal(plan.interactive, false);
    assert.equal(plan.physicalCoordinatesChanged, false); assert.equal(plan.nativeImageScalingChanged, false);
    assert.deepEqual(room, before);
  }
});

test('frontal background joints and lights stay room-local at any deck origin or camera, while only maintenance inherits the reviewed drift', () => {
  for (const room of rooms) {
    const model = getHubRoomParallaxPlanV134(room, room.xStart + 300);
    const first = getHubRoomBackgroundPlanV168(room, model);
    const movedRoom = { ...room, xStart: room.xStart + 90000 };
    const moved = getHubRoomBackgroundPlanV168(movedRoom, getHubRoomParallaxPlanV134(movedRoom, room.xStart + 90300));
    close(moved.originX - first.originX, 90000);
    close(moved.datumY, first.datumY);
    assert.equal(moved.lights.length, first.lights.length);
    for (let index = 0; index < moved.lights.length; index++) {
      close(moved.lights[index].x - first.lights[index].x, 90000);
      close(moved.lights[index].y, first.lights[index].y);
    }
    for (const options of [{ enabled: false }, { reducedMotion: true }]) {
      const stopped = getHubRoomBackgroundPlanV168(room, getHubRoomParallaxPlanV134(room, 999999, options));
      assert.equal(stopped.drift, 0); assert.equal(stopped.projection, first.projection);
    }
    const other = getHubRoomBackgroundPlanV168(room, getHubRoomParallaxPlanV134(room, room.xStart + 600));
    if (room.id !== 'maintenance-spine') {
      assert.equal(first.drift, 0); assert.equal(other.drift, 0);
      assert.deepEqual(first.lights, other.lights);
    } else assert.notEqual(first.drift, other.drift);
  }
});

test('native flight observation and training walls receive only ceiling-lintel work, and the refuge retains every authored glass aperture', () => {
  for (const id of ['bridge', 'dropship-hangar', 'flight-control-cockpit', 'proving-ground']) {
    const room = rooms.find(room => room.id === id), model = getHubRoomParallaxPlanV134(room);
    const shell = getHubCompartmentShellPlanV138(room), plan = getHubRoomBackgroundPlanV168(room, model, { shell });
    assert.equal(plan.protectedNativeEnvelope, true);
    assert.ok(plan.regions.every(region => region.y + region.h <= shell.ceilingY));
    assert.ok(plan.lights.every(light => light.y + light.h <= shell.ceilingY));
  }
  const refuge = rooms.find(room => room.id === 'personal-refuge');
  const clip = { x: 0, y: 334, w: refuge.world.width, h: 270 };
  const shell = getHubCompartmentShellPlanV138(refuge, 0, { clip });
  const model = getHubRoomParallaxPlanV134(refuge, 0, { clip });
  const plan = getHubRoomBackgroundPlanV168(refuge, model, { shell });
  assert.ok(shell.apertures.length > 0); assert.equal(plan.aperturesPreserved, shell.apertures.length);
  assert.ok(plan.regions.every(region => shell.apertures.every(hole => !overlap(region, hole))));
});

test('background rendering is clipped behind physical geometry, bounded above the human lane, and leaves Canvas state and rooms unchanged', () => {
  for (const room of rooms) {
    const c = canvas(), before = structuredClone(room), model = getHubRoomParallaxPlanV134(room);
    const shell = getHubCompartmentShellPlanV138(room), plan = drawHubRoomBackgroundV168(c.ctx, room, model, { shell });
    assert.ok(plan.regions.length > 0, room.id); c.balanced();
    assert.ok(plan.regions.every(region => region.y + region.h <= 566));
    assert.ok(plan.lights.every(light => light.h <= 3 && light.w <= 76));
    assert.deepEqual(c.clips, plan.regions.map(region => [region.x, region.y, region.w, region.h]));
    assert.deepEqual(room, before);
  }
});

test('the real parallax fallback cannot add oblique wall returns to frontal flight or range rooms', () => {
  for (const id of ['bridge', 'dropship-hangar', 'proving-ground']) {
    const room = rooms.find(room => room.id === id), c = canvas();
    const model = drawHubRoomParallaxV134(c.ctx, room, null, 0);
    assert.equal(model.presentationMode, '2d'); assert.equal(model.roomBackgroundV168.roomId, id);
    for (const path of c.paths) for (let index = 1; index < path.length; index++) {
      const dx = path[index][0] - path[index - 1][0], dy = path[index][1] - path[index - 1][1];
      assert.ok(Math.abs(dx) < 1e-7 || Math.abs(dy) < 1e-7, `${id} gained an oblique fallback edge`);
    }
    c.balanced();
  }
});
