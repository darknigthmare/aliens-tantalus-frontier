/* These tests execute the real campaign modules with explicit Canvas/Image
 * doubles. They verify rendering contracts, never claim a browser playthrough. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const originals = ['data', 'core', 'render', 'world-art', 'tactics-art'].map(name =>
  [name, read(`dlc/sea-of-sorrows/src/${name}.js`)]);
const adapter = read('dlc/sea-of-sorrows-visual/src/png-renderer.js');
const identity = () => [1, 0, 0, 1, 0, 0];
const multiply = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
function canvasDouble(portrait = false) {
  const calls = [], stack = [];
  let matrix = identity();
  const context = {
    globalAlpha: 1,
    save() { stack.push({ matrix: [...matrix], globalAlpha: this.globalAlpha }); },
    restore() { const p = stack.pop(); assert.ok(p, 'balanced Canvas save/restore'); matrix = p.matrix; this.globalAlpha = p.globalAlpha; },
    translate(x, y) { matrix = multiply(matrix, [1, 0, 0, 1, x, y]); },
    scale(x, y) { matrix = multiply(matrix, [x, 0, 0, y, 0, 0]); },
    rotate(a) { matrix = multiply(matrix, [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]); },
    setTransform(...values) { matrix = values; },
    drawImage(image, ...args) { calls.push({ op: 'drawImage', src: image.src, args, matrix: [...matrix], alpha: this.globalAlpha }); },
    fillRect(...args) { calls.push({ op: 'fillRect', args }); },
    fillText(...args) { calls.push({ op: 'fillText', args }); },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    createPattern() { return {}; },
    createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
    get stackDepth() { return stack.length; },
  };
  const ctx = new Proxy(context, { get(target, key) { if (key in target) return target[key]; return () => {}; } });
  const canvas = {
    width: 1000, height: 800, isConnected: true,
    classList: { contains: name => portrait && name === 'castPortrait' },
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width: 1000, height: 800, left: 0, top: 0 }),
  };
  return { canvas, ctx, calls };
}
function entry(category, id, extra = {}) {
  return {
    src: `sprites/${category}/${id}.png`, width: 400, height: 400,
    crop: [20, 20, 200, 300], pivot: [120, 320], worldHeight: 110, facing: 'right', ...extra,
  };
}
function fixtureAssets() {
  const dataContext = vm.createContext({});
  vm.runInContext(originals[0][1], dataContext);
  const data = dataContext.SoSData;
  const categories = {
    characters: [...Object.keys(data.fidelity.characters).filter(id => id !== 'worker'), 'decker-ready', 'decker-crouch', 'decker-dodge', 'decker-crouch-ready', 'decker-dodge-ready', 'manning-ready'],
    decor: [...new Set(data.rooms.flatMap(r => r.dressing.map(d => d.kind)))],
    obstacles: [...new Set(data.rooms.flatMap(r => r.obstacles.map(d => d.kind)))],
    creatures: ['facehugger'], corpses: ['facehugger'], organic: ['egg'],
    equipment: ['archive', 'supply', 'locker', 'locker-open', 'armory-rack', 'sensor', 'decoy', 'weakpoint', 'stasis-canopy'],
    devices: ['console', 'isolation', 'parts'], objectives: ['capture', 'sleep', 'case', 'console'],
    weapons: ['pistol', 'pulse', 'foam'], stretchers: ['adams', 'elway'], parasites: ['normal', 'royal'],
  };
  const assets = Object.fromEntries(Object.entries(categories).map(([group, ids]) => [group,
    Object.fromEntries(ids.map(id => [id, entry(group, id)])),
  ]));
  for (const [id, value] of Object.entries(assets.characters)) {
    value.handAnchor = [185, 155]; value.lampAnchor = [167, 112];
    if (/crouch|dodge/.test(id)) value.worldHeight = 85.8;
  }
  for (const value of Object.values(assets.weapons)) Object.assign(value, {
    crop: [30, 50, 300, 150], pivot: [180, 180], worldHeight: 14, gripAnchor: [110, 160], muzzleAnchor: [315, 120],
  });
  for (const value of Object.values(assets.stretchers)) Object.assign(value, { worldHeight: 79, facing: 'none', faceAnchor: [190, 80] });
  for (const [id, value] of Object.entries(assets.parasites)) Object.assign(value, {
    worldHeight: id === 'royal' ? 31.75 : 25, pivot: [120, 170], facing: 'none',
  });
  return assets;
}
function boot({ assets = fixtureAssets(), behavior = {}, portrait = false } = {}) {
  const bySource = Object.fromEntries(Object.values(assets).flatMap(group => Object.values(group).map(a => [a.src, a])));
  const images = [];
  class ImageDouble {
    constructor() { images.push(this); }
    set src(value) {
      this._src = value;
      const description = bySource[value];
      const mode = behavior[value];
      this.naturalWidth = description.width + (mode === 'wrong-size' ? 1 : 0);
      this.naturalHeight = description.height;
      if (mode === 'pending') return;
      queueMicrotask(() => mode === 'failed' ? this.onerror?.() : this.onload?.());
    }
    get src() { return this._src; }
  }
  const context = vm.createContext({
    Image: ImageDouble, devicePixelRatio: 1, console, Uint8ClampedArray,
    document: { createElement: () => canvasDouble().canvas },
    SoSArtPack: { version: 1, assets },
  });
  for (const [name, code] of originals) vm.runInContext(code, context, { filename: `${name}.js` });
  const baseMethods = Object.fromEntries(Object.getOwnPropertyNames(context.SoSRenderer.prototype).map(name => [name, context.SoSRenderer.prototype[name]]));
  const gameMethods = Object.fromEntries(Object.getOwnPropertyNames(context.SoSCore.Game.prototype).map(name => [name, Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name)]));
  vm.runInContext(adapter, context, { filename: 'png-renderer.js' });
  const game = new context.SoSCore.Game();
  const drawing = canvasDouble(portrait), renderer = new context.SoSRenderer(drawing.canvas, game);
  renderer.unit = 1; renderer.pos = (x, z) => ({ x: x - renderer.camera, y: 500 + z * 100 });
  return { context, api: context.SoSPngRenderer, assets, images, game, renderer, ...drawing, baseMethods, gameMethods };
}
const drawn = f => f.calls.filter(a => a.op === 'drawImage');
const flush = async () => { await new Promise(resolve => setImmediate(resolve)); };
const sourcePoint = (call, [x, y]) => {
  const [sx, sy, sw, sh, dx, dy, dw, dh] = call.args;
  const px = dx + (x - sx) / sw * dw, py = dy + (y - sy) / sh * dh, m = call.matrix;
  return [m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]];
};
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} ~= ${b}`);

test('loads images on demand; native rendering remains available while loading', async () => {
  const f = boot(); assert.equal(f.images.length, 0);
  f.renderer.human(f.game.p, 0, 'decker');
  assert.equal(drawn(f).length, 0); assert.equal(f.api.status().methods.human.vectorCalls, 1);
  await flush(); f.renderer.human(f.game.p, 0, 'decker');
  assert.equal(drawn(f).at(-1).src, 'sprites/characters/decker.png');
  assert.equal(f.images.length, 1);
});
test('preloading reports image errors and wrong dimensions without blocking fallback', async () => {
  const f = boot({ behavior: {
    'sprites/decor/drill.png': 'failed', 'sprites/decor/reel.png': 'wrong-size',
  } });
  await f.api.preload(['decor']);
  assert.equal(f.api.status().assets['decor/drill'], 'failed');
  assert.equal(f.api.status().assets['decor/reel'], 'wrong-size');
  f.renderer.decor('drill', 0); f.renderer.decor('reel', 0);
  assert.equal(drawn(f).length, 0); assert.equal(f.api.status().methods.decor.vectorCalls, 2);
});
test('image APIs may be absent without preventing the original renderer', () => {
  const f = boot(); f.context.Image = undefined;
  f.renderer.decor('drill', 0);
  assert.equal(f.api.status().assets['decor/drill'], 'unavailable');
  assert.equal(f.api.status().methods.decor.vectorCalls, 1);
});
for (const [label, alter] of [
  ['pivot multiplied twice', a => { a.pivot = [48000, 128000]; }],
  ['crop outside the image', a => { a.crop = [350, 20, 200, 300]; }],
  ['nonfinite world height', a => { a.worldHeight = NaN; }],
  ['unrecognised orientation', a => { a.facing = 'head-right'; }],
]) test(`invalid metadata falls back safely: ${label}`, async () => {
  const assets = fixtureAssets(); alter(assets.decor.drill);
  const f = boot({ assets }); await f.api.preload(['decor']); f.renderer.decor('drill', 0);
  assert.equal(f.api.status().assets['decor/drill'], 'invalid'); assert.equal(drawn(f).length, 0);
});

for (const [label, alter, behavior] of [
  ['invalid preferred pose', a => { a.crop = [-1, 0, 200, 300]; }, {}],
  ['failed preferred image', () => {}, { 'sprites/characters/decker-crouch-ready.png': 'failed' }],
  ['wrong-sized preferred image', () => {}, { 'sprites/characters/decker-crouch-ready.png': 'wrong-size' }],
  ['preferred pose lacks a grip', a => { delete a.handAnchor; }, {}],
  ['preferred pose lacks the equipped lamp attachment', a => { delete a.lampAnchor; }, {}],
]) test(`pose selection tries subsequent usable candidates: ${label}`, async () => {
  const assets = fixtureAssets(); alter(assets.characters['decker-crouch-ready']);
  const f = boot({ assets, behavior }); await f.api.preload();
  f.game.state.inventory.pistol = true; f.game.state.flags.equipped = true; f.game.p.crouch = true;
  f.renderer.human(f.game.p, 0, 'decker');
  assert.equal(drawn(f)[1].src, 'sprites/characters/decker-crouch.png');
  assert.equal(drawn(f)[0].src, 'sprites/weapons/pistol.png');
});
test('armed actor without any verified body hand uses the complete native renderer', async () => {
  const assets = fixtureAssets(); for (const a of Object.values(assets.characters)) delete a.handAnchor;
  const f = boot({ assets }); await f.api.preload(); f.game.state.inventory.pistol = true;
  f.renderer.human(f.game.p, 0, 'decker'); assert.equal(drawn(f).length, 0);
  assert.equal(f.api.status().methods.human.vectorCalls, 1);
});
test('unsupported weapon image does not remove the player or native held weapon', async () => {
  const f = boot(); await f.api.preload(); f.game.state.inventory.pistol = true; f.game.p.weapon = 'plasma';
  f.renderer.human(f.game.p, 0, 'decker'); assert.equal(drawn(f).length, 0);
  assert.ok(f.calls.some(a => a.op === 'fillRect')); assert.equal(f.api.status().methods.human.vectorCalls, 1);
});
test('compact foreground weapon is drawn above the body then covered only at verified hands', async () => {
  const assets = fixtureAssets(); assets.weapons.pistol.bodyLayer = 'front';
  assets.characters['decker-ready'].supportHandAnchor = [212, 142];
  const f = boot({ assets }); await f.api.preload(); f.game.state.inventory.pistol = true;
  f.renderer.human(f.game.p, 0, 'decker');
  assert.deepEqual(drawn(f).map(a => a.src), [
    'sprites/characters/decker-ready.png', 'sprites/weapons/pistol.png',
    'sprites/characters/decker-ready.png', 'sprites/characters/decker-ready.png',
  ]);
  assert.equal(f.ctx.stackDepth, 0);
});
for (const facing of [-1, 1]) test(`source pixel crop, ground pivot and weapon grip align facing ${facing}`, async () => {
  const f = boot(); await f.api.preload(); f.game.state.inventory.pistol = true; f.game.p.facing = facing;
  f.renderer.human(f.game.p, 0, 'decker');
  const [weapon, body] = drawn(f), bodyEntry = f.assets.characters['decker-ready'], gun = f.assets.weapons.pistol;
  const foot = sourcePoint(body, bodyEntry.pivot), q = f.renderer.pos(f.game.p.x, f.game.p.z);
  close(foot[0], q.x); close(foot[1], q.y);
  const hand = sourcePoint(body, bodyEntry.handAnchor), grip = sourcePoint(weapon, gun.gripAnchor);
  close(hand[0], grip[0]); close(hand[1], grip[1]);
  assert.equal(Math.sign(body.matrix[0]), facing); assert.equal(Math.sign(weapon.matrix[0]), facing);
  assert.equal(f.ctx.stackDepth, 0);
});
test('a crouch image already calibrated at 85.8 is not reduced a second time', async () => {
  const f = boot(); await f.api.preload(); f.game.p.crouch = true;
  f.renderer.human(f.game.p, 0, 'decker');
  const body = drawn(f)[0], depth = .82 + f.game.zFor(f.game.p) * .30;
  close(body.args[7] * Math.abs(body.matrix[3]), 85.8 * depth);
});
test('portraits use the base character and refresh after an asynchronous first load', async () => {
  const f = boot({ portrait: true }); f.game.state.inventory.pistol = true; f.game.state.flags.equipped = true;
  f.renderer.human({ x: 0, z: .55, facing: 1 }, 0, 'decker');
  assert.equal(drawn(f).length, 0); await flush();
  assert.equal(drawn(f).at(-1).src, 'sprites/characters/decker.png');
  assert.equal(drawn(f).length, 1);
});
test('a detached portrait is not painted by a later image callback', async () => {
  const f = boot({ portrait: true }); f.renderer.human({ x: 0, z: .55, facing: 1 }, 0, 'decker');
  f.canvas.isConnected = false; await flush(); assert.equal(drawn(f).length, 0);
});
for (const id of ['adams', 'elway']) test(`${id} stretcher attaches one parasite at its authored size`, async () => {
  const f = boot(); await f.api.preload();
  const a = { ...f.game.state.rescue.actors.find(a => a.id === id), z: .55, displayZ: .42 };
  f.renderer.stretcher(a, 0);
  const [body, parasite] = drawn(f), p = f.assets.parasites[id === 'adams' ? 'royal' : 'normal'];
  const head = sourcePoint(body, f.assets.stretchers[id].faceAnchor), anchor = sourcePoint(parasite, p.pivot);
  close(head[0], anchor[0]); close(head[1], anchor[1]);
  close(parasite.args[7] * Math.abs(parasite.matrix[3]), p.worldHeight * (.83 + .42 * .3));
  assert.equal(f.ctx.stackDepth, 0);
});
test('missing stretcher face attachment preserves native host and parasite', async () => {
  const assets = fixtureAssets(); delete assets.stretchers.adams.faceAnchor;
  const f = boot({ assets }); await f.api.preload(); f.renderer.stretcher(f.game.state.rescue.actors[0], 0);
  assert.equal(drawn(f).length, 0); assert.equal(f.api.status().methods.stretcher.vectorCalls, 1);
});
test('obstacles retain the visible native width and height without modifying geometry', async () => {
  const f = boot(); await f.api.preload();
  const b = f.game.room.obstacles[0], before = JSON.stringify(b), depth = .83 + b.z * .3;
  f.renderer.prop(b); const image = drawn(f)[0];
  close(image.args[6] * Math.abs(image.matrix[0]), b.w * depth);
  close(image.args[7] * Math.abs(image.matrix[3]), b.h * depth);
  assert.equal(JSON.stringify(b), before);
});
test('depleted, completed, destroyed and moving mechanisms retain their native states', async () => {
  const f = boot(); await f.api.preload();
  f.game.rs.supplyUsed = true; f.renderer.supply();
  f.game.state.armory.claimed = true; f.renderer.armoryRack({ x: 500, bodyZ: .3, z: .55 });
  f.renderer.weakpoint({ x: 500, z: .55, hp: 0 });
  const device = { id: 'fixture-device', kind: 'parts', x: 500, z: .55 };
  f.game.state.optional[device.id] = true; f.renderer.device(device, 0);
  const locker = { id: 'fixture-locker', x: 500, bodyZ: .3, z: .55, duration: 3 };
  f.game.rs.lockers[locker.id] = { progress: 1, opened: false, contents: { reserve: 10 } }; f.renderer.locker(locker);
  f.game.rs.lockers[locker.id] = { progress: 3, opened: true, contents: { reserve: 0 } }; f.renderer.locker(locker);
  assert.equal(drawn(f).length, 0);
  for (const name of ['supply', 'armoryRack', 'weakpoint', 'device', 'locker']) assert.ok(f.api.status().methods[name].vectorCalls > 0);
  assert.equal(f.ctx.stackDepth, 0);
});
test('facehugger and corpse sprites do not substitute for missing adult or queen artwork', async () => {
  const f = boot(); await f.api.preload();
  f.renderer.alien({ x: 500, z: .55, facing: 1, kind: 'facehugger', foam: 0 }, 0);
  f.renderer.corpse({ x: 500, z: .55, kind: 'facehugger' });
  f.renderer.alien({ x: 500, z: .55, facing: 1, kind: 'adult', foam: 0 }, 0);
  f.renderer.alien({ x: 500, z: .55, facing: 1, kind: 'queen', foam: 0 }, 0);
  assert.deepEqual(drawn(f).map(a => a.src), ['sprites/creatures/facehugger.png', 'sprites/corpses/facehugger.png']);
  assert.equal(f.api.status().methods.alien.vectorCalls, 2);
});
test('the adapter leaves simulation, wall openings and target selection untouched', () => {
  const f = boot();
  for (const name of ['door', 'architecture', 'pickTarget', 'shutter', 'worldDressing', 'lightPanel']) assert.equal(f.context.SoSRenderer.prototype[name], f.baseMethods[name], name);
  for (const [name, descriptor] of Object.entries(f.gameMethods)) assert.deepEqual(Object.getOwnPropertyDescriptor(f.context.SoSCore.Game.prototype, name), descriptor, name);
});
for (const facing of [-1, 1]) test(`tracer starts at the displayed weapon muzzle facing ${facing}`, async () => {
  const f = boot(); await f.api.preload(); f.game.state.inventory.pistol = true; f.game.p.facing = facing;
  f.renderer.human(f.game.p, 0, 'decker');
  const weapon = drawn(f).find(a => a.src === 'sprites/weapons/pistol.png');
  const muzzle = sourcePoint(weapon, f.assets.weapons.pistol.muzzleAnchor), lines = [];
  f.renderer.line = (...args) => lines.push(args);
  const before = JSON.stringify(f.game.state);
  f.renderer.effects = [{ type: 'shot', weapon: 'pistol', from: { x: f.game.p.x, z: f.game.p.z }, to: { x: 800, z: .55 }, ttl: .13, max: .13 }];
  f.renderer.drawEffects(.016);
  close(lines[0][0], muzzle[0]); close(lines[0][1], muzzle[1]);
  close(lines[0][2], 800); close(lines[0][3], 493);
  assert.equal(JSON.stringify(f.game.state), before, 'presentation does not apply damage or mutate aiming');
});
test('effects without a current displayed PNG weapon match native geometry and lifetimes', () => {
  const f = boot(), effects = [
    { type: 'shot', weapon: 'flame', from: { x: 100, z: .55 }, to: { x: 800, z: .55 }, ttl: .13, max: .13 },
    { type: 'hit', x: 400, z: .3, ttl: .22, max: .22 },
    { type: 'shot', weapon: 'pistol', from: { x: 100, z: .55 }, to: { x: 800, z: .55 }, ttl: .01, max: .13 },
  ];
  let calls = [];
  f.renderer.line = (...args) => calls.push(['line', ...args]);
  f.renderer.ellipse = (...args) => calls.push(['ellipse', ...args]);
  f.renderer.effects = structuredClone(effects); f.renderer.drawEffects(.016);
  const patched = calls, remaining = JSON.stringify(f.renderer.effects);
  calls = []; f.renderer.effects = structuredClone(effects); f.baseMethods.drawEffects.call(f.renderer, .016);
  assert.deepEqual(calls, patched); assert.equal(JSON.stringify(f.renderer.effects), remaining);
  assert.equal(f.ctx.stackDepth, 0);
});
test('50 room rendering fixtures preserve complete campaign state and Canvas balance', async () => {
  const f = boot(); await f.api.preload();
  // Explicit QA fixtures: all rooms are visited through the real enter method;
  // equipment is granted for display coverage, never presented as player progress.
  f.game.state.flags.equipped = true; f.game.state.inventory.pistol = true;
  for (const room of f.context.SoSData.rooms) {
    f.game.enter(room.id); f.game.p.weapon = 'pistol';
    const before = JSON.stringify(f.game.state);
    f.renderer.draw(1, .016);
    assert.equal(JSON.stringify(f.game.state), before, room.id + ' rendering changes no save state');
    assert.equal(f.ctx.stackDepth, 0, room.id + ' balanced context');
  }
  assert.equal(f.context.SoSData.rooms.length, 50);
  assert.ok(Object.keys(f.api.status().drawn).length > 30);
});
