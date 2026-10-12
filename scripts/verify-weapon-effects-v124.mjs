import assert from 'node:assert/strict';
import {
  createWeaponEffectsV124, resetWeaponEffectsV124, emitWeaponShotEffectsV124,
  emitWeaponCycleEffectsV124, emitWeaponReloadEffectsV124, updateWeaponEffectsV124,
  drawWeaponCasingsV124, drawWeaponLightsV124, getWeaponLightVisibilityV124,
  getWeaponEffectsSnapshotV124, WEAPON_EFFECT_LIMITS_V124
} from '../src/weapon-effects-v124.js';
import { getWeaponPresentationProfileV124 } from '../src/weapon-presentation-profiles-v124.js';

const pistol = getWeaponPresentationProfileV124('sidearm');
const event = overrides => ({ actorId: 'test-marine', actor: { facing: 1, vx: 0, vy: 0 },
  aim: { x: 1, y: 0 }, muzzle: { x: 100, y: 90, pivotX: 76, pivotY: 90 },
  profile: pistol, shotSerial: 1, timeSeconds: 0, ...overrides });
const shot = (runtime, overrides = {}) => emitWeaponShotEffectsV124(runtime, event(overrides));
const approx = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance,
  `${actual} is not within ${tolerance} of ${expected}`);
const floorWorld = () => ({ platforms: [{ id: 'floor', x: -1000, y: 180, w: 2000, h: 40, floor: true }] });
const advance = (runtime, seconds, world = {}, frequency = 120) => {
  const end = runtime.time + seconds;
  while (runtime.time < end - 1e-10) {
    const delta = Math.min(1 / frequency, end - runtime.time);
    updateWeaponEffectsV124(runtime, delta, { world, timeSeconds: runtime.time + delta });
  }
};
function canvas() {
  const stack = [], ctx = { calls: [], gradients: [], globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#fff',
    save() { stack.push({ globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation, fillStyle: this.fillStyle }); },
    restore() { Object.assign(this, stack.pop()); },
    beginPath() {}, closePath() {},
    moveTo(...args) { this.calls.push(['move', ...args]); },
    lineTo(...args) { this.calls.push(['line', ...args]); },
    translate(...args) { this.calls.push(['translate', ...args]); },
    rotate(...args) { this.calls.push(['rotate', ...args]); },
    arc(...args) { this.calls.push(['arc', ...args]); },
    clip() { this.calls.push(['clip']); },
    fill() { this.calls.push(['fill', this.globalCompositeOperation, this.fillStyle]); },
    fillRect(...args) { this.calls.push(['rect', this.globalCompositeOperation, ...args]); },
    createRadialGradient(...args) {
      const gradient = { args, stops: [], addColorStop(at, value) { this.stops.push([at, value]); } };
      this.gradients.push(gradient); return gradient;
    }
  };
  return ctx;
}
let checks = 0;
const check = (name, fn) => { fn(); checks++; console.log(`PASS ${name}`); };

check('accepted serials emit once per actor, regardless of update or draw cadence', () => {
  const runtime = createWeaponEffectsV124();
  assert.deepEqual(shot(runtime), { accepted: true, casings: 1, lights: 1, reason: null });
  assert.equal(shot(runtime).accepted, false);
  assert.equal(shot(runtime, { shotSerial: 0 }).accepted, false);
  assert.equal(shot(runtime, { shotSerial: 1.5 }).accepted, false);
  assert.equal(shot(runtime, { actorId: 'coop' }).accepted, true);
  assert.equal(shot(runtime, { shotSerial: 2 }).accepted, true);
  assert.equal(shot(runtime).accepted, false);
  assert.equal(runtime.casings.length, 3);
  assert.equal(runtime.lights.length, 3);
  assert.equal(runtime.stats.acceptedShots, 3);
});

check('documented caseless ammunition has a flash and no invented brass', () => {
  for (const name of ['M41A Pulse Rifle', 'M56 Smartgun']) {
    const runtime = createWeaponEffectsV124();
    const profile = getWeaponPresentationProfileV124(name);
    assert.equal(profile.casing, null);
    assert.deepEqual(shot(runtime, { profile }), { accepted: true, casings: 0, lights: 1, reason: null });
  }
});

check('energy and fuel differ in light while melee and unknowns invent no firearm effect', () => {
  for (const [family, kind] of [['energy', 'energy'], ['flame', 'flame'], ['melee', null], ['unrecognized', null]]) {
    const runtime = createWeaponEffectsV124();
    const result = shot(runtime, { profile: getWeaponPresentationProfileV124(family) });
    assert.equal(result.casings, 0);
    assert.equal(result.lights, kind ? 1 : 0);
    if (kind) assert.equal(runtime.lights[0].kind, kind);
  }
});

check('pump ejection is a separate accepted cycle and never a second muzzle flash', () => {
  const runtime = createWeaponEffectsV124();
  const profile = getWeaponPresentationProfileV124('pump-shotgun');
  const input = event({ profile });
  assert.equal(emitWeaponCycleEffectsV124(runtime, input).accepted, false);
  assert.equal(emitWeaponShotEffectsV124(runtime, input).casings, 0);
  advance(runtime, profile.casing.delay);
  assert.equal(runtime.casings.length, 0, 'the integration owns actual cycle timing');
  const cycle = emitWeaponCycleEffectsV124(runtime, { ...input, timeSeconds: runtime.time });
  assert.deepEqual(cycle, { accepted: true, casings: 1, lights: 0, reason: null });
  assert.equal(emitWeaponCycleEffectsV124(runtime, input).accepted, false);
  assert.equal(emitWeaponCycleEffectsV124(runtime, { ...input, shotSerial: 2 }).accepted, false);
  assert.equal(runtime.casings[0].bornAt, profile.casing.delay);
  assert.equal(runtime.stats.emittedLights, 1);
});

check('revolvers keep cases until reload and eject only reported spent chambers', () => {
  const runtime = createWeaponEffectsV124();
  const profile = getWeaponPresentationProfileV124('revolver');
  assert.equal(shot(runtime, { profile }).casings, 0);
  const input = event({ profile, reloadSerial: 1, spentRounds: 4, emptyReload: false });
  const result = emitWeaponReloadEffectsV124(runtime, input);
  assert.equal(result.casings, 4);
  assert.equal(result.magazines, 0);
  assert.equal(emitWeaponReloadEffectsV124(runtime, input).accepted, false);
  assert.equal(emitWeaponReloadEffectsV124(runtime, { ...input, reloadSerial: 2, spentRounds: 0 }).casings, 0);
  assert.equal(emitWeaponReloadEffectsV124(runtime, { ...input, reloadSerial: 3, spentRounds: 3 }).casings, 3);
  assert.equal(new Set(runtime.casings.map(body => body.id)).size, 7, 'reload IDs must not reuse an unrelated shot serial');
});

check('only committed empty feeds discard their actual magazine, drum, or cell', () => {
  const runtime = createWeaponEffectsV124();
  const reload = (profile, serial, emptyReload) => emitWeaponReloadEffectsV124(runtime,
    event({ profile, reloadSerial: serial, emptyReload }));
  assert.equal(reload(pistol, 1, false).magazines, 0);
  assert.equal(reload(pistol, 2, true).magazines, 1);
  assert.equal(runtime.casings.at(-1).shape, 'magazine');
  assert.equal(reload(getWeaponPresentationProfileV124('heavy'), 3, true).magazines, 1);
  assert.equal(runtime.casings.at(-1).shape, 'drum');
  assert.equal(reload(getWeaponPresentationProfileV124('energy'), 4, true).cells, 1);
  assert.equal(runtime.casings.at(-1).shape, 'cell');
  assert.equal(reload(getWeaponPresentationProfileV124('pump-shotgun'), 5, true).magazines, 0);
  assert.equal(runtime.stats.discardedMagazines, 2);
  assert.equal(runtime.stats.discardedCells, 1);
});

check('ejection is deterministic, follows aim/facing and starts at the receiver', () => {
  const right = createWeaponEffectsV124({ seed: 20 }), repeat = createWeaponEffectsV124({ seed: 20 });
  shot(right); shot(repeat);
  assert.deepEqual(right.casings, repeat.casings);
  const body = right.casings[0];
  assert.ok(body.x >= 80 && body.x <= 82);
  assert.ok(body.y >= 86 && body.y <= 88);
  assert.ok(body.vx < 0 && body.vy < 0);
  const left = createWeaponEffectsV124({ seed: 20 });
  shot(left, { actor: { facing: -1 }, aim: { x: -1, y: 0 } });
  assert.ok(left.casings[0].vx > 0);
  const upward = createWeaponEffectsV124({ seed: 20 });
  shot(upward, { aim: { x: 0, y: -1 } });
  assert.ok(upward.casings[0].y < body.y, 'the receiver rotates with the weapon aim');
  assert.ok(upward.casings[0].vy > body.vy, 'ejection retains the perpendicular/world-up component');
});

check('actual held receiver ports position cases, while the muzzle still positions its flash', () => {
  const runtime = createWeaponEffectsV124();
  const muzzle = Object.freeze({ x: 160, y: 55, pivotX: 80, pivotY: 110,
    ejectionX: 109, ejectionY: 75, reloadX: 96, reloadY: 101 });
  shot(runtime, { muzzle, aim: { x: Math.SQRT1_2, y: -Math.SQRT1_2 } });
  approx(runtime.casings[0].x, muzzle.ejectionX, 1);
  approx(runtime.casings[0].y, muzzle.ejectionY, 1);
  approx(runtime.lights[0].x, muzzle.x); approx(runtime.lights[0].y, muzzle.y);
  emitWeaponReloadEffectsV124(runtime, event({ muzzle, reloadSerial: 1, emptyReload: true }));
  const magazine = runtime.casings.at(-1);
  assert.equal(magazine.kind, 'magazine');
  approx(magazine.x, muzzle.reloadX, 1); approx(magazine.y, muzzle.reloadY, 1);
});

check('a cycled hull uses the current receiver and revolver cases leave the cylinder service point', () => {
  const runtime = createWeaponEffectsV124();
  const pump = getWeaponPresentationProfileV124('pump-shotgun');
  const muzzle = Object.freeze({ x: 300, y: 200, pivotX: 220, pivotY: 200,
    ejectionX: 251, ejectionY: 195, reloadX: 232, reloadY: 218 });
  shot(runtime, { profile: pump, muzzle });
  const moved = { ...muzzle, ejectionX: 290, ejectionY: 170 };
  emitWeaponCycleEffectsV124(runtime, event({ profile: pump, muzzle: moved, timeSeconds: .18 }));
  approx(runtime.casings[0].x, moved.ejectionX, 1); approx(runtime.casings[0].y, moved.ejectionY, 1);
  const revolver = getWeaponPresentationProfileV124('revolver');
  const result = emitWeaponReloadEffectsV124(runtime, event({ profile: revolver, muzzle,
    reloadSerial: 1, spentRounds: 2, emptyReload: false }));
  assert.equal(result.casings, 2);
  for (const casing of runtime.casings.slice(-2)) {
    approx(casing.x, muzzle.reloadX, 1); approx(casing.y, muzzle.reloadY, 1);
  }
});

check('a late-frame accepted shot is not aged through the preceding update tick', () => {
  const runtime = createWeaponEffectsV124({ timeSeconds: 4 });
  shot(runtime, { timeSeconds: 4.05 });
  const before = structuredClone(runtime.casings[0]);
  updateWeaponEffectsV124(runtime, .05, { timeSeconds: 4.05 });
  assert.deepEqual(runtime.casings[0], before);
  assert.equal(runtime.lights.length, 1);
  assert.equal(drawWeaponLightsV124(canvas(), runtime).drawn, 1);
  updateWeaponEffectsV124(runtime, .01, { timeSeconds: 4.06 });
  assert.notEqual(runtime.casings[0].y, before.y);
  updateWeaponEffectsV124(runtime, 0, { timeSeconds: 4.049 });
  assert.equal(runtime.time, 4.06, 'a stale absolute clock must not rewind effects');
});

check('pause freezes both airborne physics and short-lived light without touching state', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  const before = structuredClone(runtime);
  assert.equal(updateWeaponEffectsV124(runtime, 60, { timeSeconds: 60, paused: true }), false);
  assert.deepEqual(runtime, before);
  drawWeaponCasingsV124(canvas(), runtime); drawWeaponLightsV124(canvas(), runtime);
  assert.deepEqual(runtime, before, 'render is read-only');
});

check('a muzzle light decays on simulation time and expires without deleting its casing', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  const initial = canvas(); drawWeaponLightsV124(initial, runtime);
  const duration = runtime.lights[0].duration;
  updateWeaponEffectsV124(runtime, duration / 2, { timeSeconds: duration / 2 });
  const halfway = canvas(); drawWeaponLightsV124(halfway, runtime);
  const alpha = ctx => Number(ctx.gradients[0].stops[0][1].match(/,([\d.]+)\)$/)[1]);
  assert.ok(alpha(halfway) < alpha(initial) * .3);
  updateWeaponEffectsV124(runtime, duration / 2, { timeSeconds: duration });
  assert.equal(runtime.lights.length, 0);
  assert.equal(runtime.casings.length, 1);
});

check('free ballistic trajectories agree at 30, 60, and 120 Hz', () => {
  const results = [30, 60, 120].map(frequency => {
    const runtime = createWeaponEffectsV124(); shot(runtime); advance(runtime, 1, {}, frequency); return runtime.casings[0];
  });
  for (const body of results.slice(1)) for (const key of ['x', 'y', 'vx', 'vy', 'angle']) approx(body[key], results[0][key]);
});

check('a fast small casing cannot tunnel through a one-pixel wall or closed door', () => {
  for (const kind of ['walls', 'doors']) {
    const runtime = createWeaponEffectsV124(); shot(runtime);
    Object.assign(runtime.casings[0], { x: 0, y: 0, vx: 10000, vy: 0 });
    const world = { [kind]: [{ id: kind, x: 20, y: -1000, w: 1, h: 2000, open: false }] };
    updateWeaponEffectsV124(runtime, 1 / 30, { world, timeSeconds: 1 / 30 });
    assert.ok(runtime.casings[0].x < 20);
    assert.ok(runtime.casings[0].vx < 0);
    assert.ok(runtime.stats.bounces > 0);
  }
});

check('an open door and the underside of a one-way platform do not block casings', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  Object.assign(runtime.casings[0], { x: 0, y: 30, vx: 600, vy: -300 });
  updateWeaponEffectsV124(runtime, .1, { timeSeconds: .1,
    world: { doors: [{ x: 20, y: -1000, w: 1, h: 2000, progress: .9 }],
      platforms: [{ x: -50, y: 20, w: 200, h: 4 }] } });
  assert.ok(runtime.casings[0].x > 20);
  assert.ok(runtime.casings[0].y < 20);
  assert.equal(runtime.stats.bounces, 0);
});

check('initial overlap leaves a solid by its nearest face while outside-world debris is culled', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  Object.assign(runtime.casings[0], { x: 21, y: 0, vx: 100, vy: 0 });
  updateWeaponEffectsV124(runtime, 1 / 120, { timeSeconds: 1 / 120,
    world: { walls: [{ x: 20, y: -20, w: 10, h: 40 }] } });
  assert.ok(runtime.casings[0].x < 20);
  assert.equal(runtime.casings[0].vx, 0);
  const outside = createWeaponEffectsV124(); shot(outside);
  Object.assign(outside.casings[0], { x: -20, y: 30 });
  updateWeaponEffectsV124(outside, 1 / 120, { timeSeconds: 1 / 120,
    world: { bounds: { width: 1280, height: 720 } } });
  assert.equal(outside.casings.length, 0);
});

check('casings bounce, lose energy, then rest at the real floor top indefinitely', () => {
  const runtime = createWeaponEffectsV124(); const world = floorWorld(); shot(runtime);
  advance(runtime, 4, world);
  const body = runtime.casings[0];
  assert.ok(body.bounces >= 2);
  assert.equal(body.resting, true);
  approx(body.y + body.radius, world.platforms[0].y - .02);
  assert.equal(body.vx, 0); assert.equal(body.vy, 0); assert.equal(body.spin, 0);
  const pose = { x: body.x, y: body.y, angle: body.angle };
  updateWeaponEffectsV124(runtime, 180, { world, timeSeconds: 184 });
  assert.equal(runtime.casings.length, 1);
  assert.deepEqual({ x: body.x, y: body.y, angle: body.angle }, pose);
});

check('resting debris follows its support and wakes if that support is removed', () => {
  const runtime = createWeaponEffectsV124(); const world = floorWorld(); shot(runtime); advance(runtime, 4, world);
  const body = runtime.casings[0], previous = { x: body.x, y: body.y };
  world.platforms[0].x += 30; world.platforms[0].y -= 12;
  advance(runtime, .1, world);
  approx(body.x, previous.x + 30); approx(body.y, previous.y - 12);
  const supportedY = body.y;
  world.platforms[0].destroyed = true;
  advance(runtime, .1, world);
  assert.equal(body.resting, false);
  assert.ok(body.y > supportedY && body.vy > 0);
});

check('bounded debris pool evicts old resting objects and clears on level reset', () => {
  const runtime = createWeaponEffectsV124({ maxCasings: 3, maxLights: 2, context: 'a' });
  for (let serial = 1; serial <= 3; serial++) shot(runtime, { shotSerial: serial });
  const airborneFirst = runtime.casings[0].id, restingSecond = runtime.casings[1].id;
  runtime.casings[1].resting = true;
  shot(runtime, { shotSerial: 4 });
  assert.equal(runtime.casings.length, 3); assert.equal(runtime.lights.length, 2);
  assert.ok(runtime.casings.some(body => body.id === airborneFirst));
  assert.ok(!runtime.casings.some(body => body.id === restingSecond));
  resetWeaponEffectsV124(runtime, { context: 'b', timeSeconds: 0 });
  assert.equal(runtime.context, 'b'); assert.equal(runtime.casings.length, 0); assert.equal(runtime.lights.length, 0);
  assert.equal(runtime.stats.acceptedShots, 0);
  assert.equal(shot(runtime).accepted, true, 'a fresh level starts a fresh accepted-event history');
});

check('lights are locally clipped by walls, cover, closed doors and platforms', () => {
  const light = { x: 0, y: 0, radius: 100 };
  for (const kind of ['walls', 'covers', 'doors', 'platforms']) {
    const result = getWeaponLightVisibilityV124(light, { [kind]: [{ x: 40, y: -200, w: 10, h: 400 }] });
    assert.ok(result.points.length >= WEAPON_EFFECT_LIMITS_V124.lightRays);
    assert.ok(result.points.every(point => point.x <= 40 + 1e-6));
    assert.ok(result.points.some(point => point.x < -90));
    assert.equal(result.occluders, 1);
  }
  const open = getWeaponLightVisibilityV124(light, { doors: [{ x: 40, y: -200, w: 10, h: 400, open: true }] });
  assert.ok(open.points.some(point => point.x > 90));
});

check('visibility ray work remains bounded even in a dense map', () => {
  const walls = Array.from({ length: 200 }, (_, index) => ({ x: 10 + index % 20, y: -90 + index * .7, w: 2, h: 2 }));
  const result = getWeaponLightVisibilityV124({ x: 0, y: 0, radius: 180 }, { walls });
  assert.equal(result.occluders, WEAPON_EFFECT_LIMITS_V124.localOccluders);
  assert.ok(result.rays <= WEAPON_EFFECT_LIMITS_V124.lightRays + WEAPON_EFFECT_LIMITS_V124.cornerOccluders * 12);
});

check('surface reflections enter only the exposed two-pixel face and stop at the first occluder', () => {
  const wall = { id: 'near', x: 40, y: -200, w: 1, h: 400 };
  const behind = { id: 'behind', x: 60, y: -200, w: 10, h: 400 };
  const light = { x: 0, y: 0, radius: 100 };
  const blocked = getWeaponLightVisibilityV124(light, { walls: [wall, behind] });
  assert.ok(blocked.surfaces.length > 0);
  for (const patch of blocked.surfaces) {
    assert.equal(patch.box.id, 'near');
    approx(patch.x1, 40); approx(patch.x2, 40);
    assert.equal(patch.insetX, 1, 'reflection cannot cross the far edge of a one-pixel wall');
    approx(patch.insetY, 0);
  }
  const floor = { x: -200, y: 40, w: 400, h: 40, floor: true };
  const litFloor = getWeaponLightVisibilityV124(light, { platforms: [floor] });
  assert.ok(litFloor.surfaces.length > 0);
  for (const patch of litFloor.surfaces) {
    approx(patch.y1, 40); approx(patch.y2, 40);
    assert.equal(patch.insetY, 2);
  }
  const door = { ...wall, id: 'door', progress: 0 };
  const closedDoor = getWeaponLightVisibilityV124(light, { walls: [behind], doors: [door] });
  assert.ok(closedDoor.surfaces.every(patch => patch.box.id === 'door'));
  door.progress = 1;
  const openDoor = getWeaponLightVisibilityV124(light, { walls: [behind], doors: [door] });
  assert.ok(openDoor.surfaces.some(patch => patch.box.id === 'behind'));
  assert.ok(openDoor.surfaces.every(patch => patch.box.id !== 'door'));
});

check('light modifies nearby scene pixels with screen blend and restores the canvas state', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  const ctx = canvas();
  const result = drawWeaponLightsV124(ctx, runtime);
  assert.equal(result.drawn, 1);
  assert.ok(ctx.calls.some(call => call[0] === 'clip'));
  assert.ok(ctx.calls.some(call => call[0] === 'fill' && call[1] === 'screen'));
  assert.equal(ctx.gradients[0].args.at(-1), pistol.muzzle.radius);
  assert.equal(ctx.globalCompositeOperation, 'source-over');
  assert.equal(ctx.globalAlpha, 1);
  assert.ok(!ctx.calls.some(call => call[0] === 'rect'), 'no screen-wide overlay rectangle');
});

check('reduced motion softens the flash and a zero flash intensity disables it completely', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  const normal = canvas(), reduced = canvas(), disabled = canvas();
  drawWeaponLightsV124(normal, runtime);
  drawWeaponLightsV124(reduced, runtime, { reducedMotion: true });
  const alpha = ctx => Number(ctx.gradients[0].stops[0][1].match(/,([\d.]+)\)$/)[1]);
  assert.ok(alpha(reduced) < alpha(normal));
  assert.ok(!reduced.calls.some(call => call[0] === 'translate'), 'the bright directional core is removed');
  assert.deepEqual(drawWeaponLightsV124(disabled, runtime, { flashIntensity: 0 }), { drawn: 0, rays: 0 });
  assert.equal(disabled.calls.length, 0);
});

check('frustum culling skips offscreen effects without translating the camera twice', () => {
  const runtime = createWeaponEffectsV124(); shot(runtime);
  const offscreen = canvas();
  const options = { camera: { x: 2000, y: 2000 }, viewport: { width: 320, height: 240 } };
  assert.equal(drawWeaponCasingsV124(offscreen, runtime, options), 0);
  assert.equal(drawWeaponLightsV124(offscreen, runtime, options).drawn, 0);
  assert.equal(offscreen.calls.length, 0);
  const onscreen = canvas();
  assert.equal(drawWeaponCasingsV124(onscreen, runtime, { camera: { x: 50, y: 50 }, viewport: { width: 320, height: 240 } }), 1);
  const translate = onscreen.calls.find(call => call[0] === 'translate');
  approx(translate[1], runtime.casings[0].x); approx(translate[2], runtime.casings[0].y);
});

check('effects never mutate actors, ammunition, collision geometry or save data', () => {
  const runtime = createWeaponEffectsV124();
  const actor = Object.freeze({ id: 'fixed', facing: 1, shots: 1, ammo: 8, x: 100, y: 100, vx: 0, vy: 0 });
  const world = { platforms: [Object.freeze(floorWorld().platforms[0])] };
  const before = structuredClone({ actor, world });
  shot(runtime, { actor }); advance(runtime, 4, world);
  drawWeaponCasingsV124(canvas(), runtime); drawWeaponLightsV124(canvas(), runtime, { world });
  assert.deepEqual({ actor, world }, before);
  const snapshot = getWeaponEffectsSnapshotV124(runtime);
  snapshot.stats.acceptedShots = 99;
  assert.equal(runtime.stats.acceptedShots, 1);
  assert.equal(snapshot.counts.resting, 1);
});

console.log(`\nWeapon effects V124: ${checks} scenarios passed.`);
