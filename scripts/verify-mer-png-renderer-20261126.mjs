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
    fillRect(...args) { calls.push({ op: 'fillRect', args, fill: this.fillStyle, matrix: [...matrix] }); },
    fillText(...args) { calls.push({ op: 'fillText', args }); },
    ellipse(...args) { calls.push({ op: 'ellipse', args, fill: this.fillStyle, matrix: [...matrix], alpha: this.globalAlpha }); },
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
    characters: [...Object.keys(data.fidelity.characters).filter(id => id !== 'worker'), 'decker-ready', 'decker-crouch', 'decker-dodge', 'decker-crouch-ready', 'decker-dodge-ready', 'manning-ready', 'decker-walk-a', 'decker-walk-b'],
    decor: [...new Set(data.rooms.flatMap(r => r.dressing.map(d => d.kind)))],
    obstacles: [...new Set(data.rooms.flatMap(r => r.obstacles.map(d => d.kind)))],
    creatures: ['facehugger'], corpses: ['facehugger'], organic: ['egg'],
    equipment: ['archive', 'supply', 'locker', 'locker-open', 'armory-rack', 'sensor', 'decoy', 'weakpoint', 'stasis-canopy', 'lamp', 'light-panel', 'shutter-control'],
    doors: ['bulkhead-frame', 'bulkhead-panel'], effects: ['acid', 'flame', 'foam', 'impact', 'muzzle', 'spark'],
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
  for (const id of ['decker-walk-a', 'decker-walk-b']) {
    assets.characters[id].unarmedOnly = true; delete assets.characters[id].handAnchor;
  }
  Object.assign(assets.equipment.lamp, { worldHeight: 9, mountAnchor: [80, 280], emitterAnchor: [200, 160] });
  Object.assign(assets.equipment['light-panel'], { facing: 'none', worldHeight: 39, onAnchor: [190, 100], offAnchor: [190, 60] });
  Object.assign(assets.equipment['shutter-control'], { facing: 'none', worldHeight: 27, statusAnchor: [190, 90] });
  for (const value of Object.values(assets.doors)) Object.assign(value, { width: 500, height: 700, crop: [20, 20, 460, 640], pivot: [250, 660], worldHeight: 180, facing: 'none' });
  assets.doors['bulkhead-frame'].apertureBounds = [100, 100, 300, 520];
  Object.assign(assets.doors['bulkhead-panel'], { crop: [92, 91, 316, 537], pivot: [250, 628], canvasMatch: 'bulkhead-frame' });
  for (const value of Object.values(assets.effects)) Object.assign(value, { facing: 'none', worldHeight: 24 });
  for (const id of ['flame', 'muzzle']) Object.assign(assets.effects[id], { facing: 'right', pivot: [25, 180], emissionAnchor: [25, 180], worldHeight: id === 'flame' ? 33 : 18 });
  for (const id of ['impact', 'spark']) Object.assign(assets.effects[id], { pivot: [120, 150], impactAnchor: [120, 150] });
  Object.assign(assets.effects.acid, { pivot: [120, 170], groundAnchor: [120, 170], worldHeight: 18 });
  Object.assign(assets.effects.foam, { groundAnchor: [120, 320], worldHeight: 36 });
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
const canvasPoint = (call, x, y) => {
  const m = call.matrix;
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
};
const snapshot = f => JSON.stringify({ state: f.game.state, events: f.game.events,
  work: f.game.activeWork, cooldowns: f.game.cooldowns, time: f.game.time });

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
test('queen art and an explicitly supplied adult alias preserve capture and death states', async () => {
  const assets = fixtureAssets();
  assets.creatures.adult = entry('creatures', 'adult', { worldHeight: 135 });
  assets.creatures.queen = entry('creatures', 'queen', { worldHeight: 200 });
  const f = boot({ assets }); await f.api.preload();
  const actors = ['adult', 'captureAdult', 'queen'].map(kind => ({ x: 500, z: .55, facing: -1, kind, foam: 0 }));
  const before = JSON.stringify(actors), simulation = snapshot(f);
  for (const actor of actors) f.renderer.alien(actor, 0);
  assert.deepEqual(drawn(f).map(a => a.src), [
    'sprites/creatures/adult.png', 'sprites/creatures/adult.png', 'sprites/creatures/queen.png',
  ]);
  assert.ok(drawn(f).every(a => a.matrix[0] < 0), 'each morphology respects facing');
  f.calls.length = 0;
  for (const actor of actors) f.renderer.corpse(actor);
  assert.equal(drawn(f).length, 0, 'no living art is used for an absent death pose');
  assert.equal(JSON.stringify(actors), before);
  assert.equal(snapshot(f), simulation);
});
function medicalAssets() {
  const assets = fixtureAssets();
  assets.characters['decker-medical-gown'] = entry('characters', 'decker-medical-gown', { unarmedOnly: true });
  assets.characters['carlyle-physician'] = entry('characters', 'carlyle-physician');
  assets.objectives['icc-handheld'] = entry('objectives', 'icc-handheld', { worldHeight: 42, facing: 'none' });
  return assets;
}
test('chapter-four costumes are confined to s03 and leave original identities and saves intact', async () => {
  const f = boot({ assets: medicalAssets() }); await f.api.preload();
  f.game.enter('s03'); f.game.p.moving = true;
  const medic = f.game.room.cast.find(a => a.id === 'medic');
  f.game.p.x = medic.x;
  const before = snapshot(f);
  f.renderer.human(f.game.p, 0, 'decker'); f.renderer.human(medic, 0, 'medic');
  assert.deepEqual(drawn(f).map(a => a.src), [
    'sprites/characters/decker-medical-gown.png', 'sprites/characters/carlyle-physician.png',
  ]);
  assert.ok(f.calls.some(c => c.op === 'fillText' && c.args[0] === 'Médecin du Carlyle'));
  assert.equal(medic.id, 'medic', 'the campaign actor is unchanged');
  assert.equal(snapshot(f), before);
  f.game.enter('s01'); f.game.p.moving = false; f.calls.length = 0;
  f.renderer.human(f.game.p, 0, 'decker'); f.renderer.human(medic, 0, 'medic');
  assert.deepEqual(drawn(f).map(a => a.src), ['sprites/characters/decker.png', 'sprites/characters/medic.png']);
});
test('the medical variant never overrides an armed loadout or generic dossier portrait', async () => {
  const f = boot({ assets: medicalAssets() }); await f.api.preload(); f.game.enter('s03');
  f.game.state.inventory.pistol = true;
  f.renderer.human(f.game.p, 0, 'decker');
  assert.ok(drawn(f).some(a => a.src === 'sprites/weapons/pistol.png'));
  assert.ok(!drawn(f).some(a => a.src.includes('medical-gown')));
  const p = boot({ assets: medicalAssets(), portrait: true }); await p.api.preload(); p.game.enter('s03');
  p.renderer.human(p.game.p, 0, 'decker');
  p.renderer.human({ x: 200, z: .55, facing: 1 }, 0, 'medic');
  assert.deepEqual(drawn(p).map(a => a.src), ['sprites/characters/decker.png', 'sprites/characters/medic.png']);
});
test('failed medical art falls back to existing portraits and objective art', async () => {
  const f = boot({ assets: medicalAssets(), behavior: {
    'sprites/characters/decker-medical-gown.png': 'wrong-size',
    'sprites/characters/carlyle-physician.png': 'failed',
    'sprites/objectives/icc-handheld.png': 'failed',
  } });
  await f.api.preload(); f.game.enter('s03');
  f.renderer.human(f.game.p, 0, 'decker');
  f.renderer.human(f.game.room.cast[0], 0, 'medic');
  f.renderer.object(f.game.room.interactables[0]);
  assert.deepEqual(drawn(f).map(a => a.src), [
    'sprites/characters/decker.png', 'sprites/characters/medic.png', 'sprites/objectives/console.png',
  ]);
});
test('the ICC handheld is docked on the existing s03 reporting pedestal only while unfinished', async () => {
  const f = boot({ assets: medicalAssets() }); await f.api.preload(); f.game.enter('s03');
  const o = f.game.room.interactables[0], before = snapshot(f), original = JSON.stringify(o);
  f.renderer.object(o);
  const image = drawn(f)[0]; assert.equal(image.src, 'sprites/objectives/icc-handheld.png');
  close(sourcePoint(image, f.assets.objectives['icc-handheld'].pivot)[1], f.renderer.pos(o.x, f.game.zFor(o)).y - 64);
  assert.ok(f.calls.some(c => c.op === 'fillRect'), 'the native pedestal remains beneath the device');
  assert.equal(snapshot(f), before); assert.equal(JSON.stringify(o), original);
  f.calls.length = 0; f.game.state.flags[o.flag] = true; f.renderer.object(o);
  assert.equal(drawn(f).length, 0, 'completed objectives retain their native state');
  f.game.state.flags[o.flag] = false; f.game.enter('s04'); f.calls.length = 0; f.renderer.object(o);
  assert.deepEqual(drawn(f).map(a => a.src), ['sprites/objectives/console.png']);
});
for (const facing of [-1, 1]) test(`new flame sprite uses the native weapon grip and muzzle facing ${facing}`, async () => {
  const assets = fixtureAssets();
  assets.weapons.flame = entry('weapons', 'flame', { worldHeight: 24, gripAnchor: [110, 210], muzzleAnchor: [215, 145] });
  const f = boot({ assets }); await f.api.preload();
  f.game.state.inventory.pistol = true; f.game.state.inventory.flame = true;
  f.game.p.weapon = 'flame'; f.game.p.facing = facing;
  const before = snapshot(f); f.renderer.human(f.game.p, 0, 'decker');
  const weapon = drawn(f).find(a => a.src === 'sprites/weapons/flame.png'); assert.ok(weapon);
  const muzzle = sourcePoint(weapon, assets.weapons.flame.muzzleAnchor);
  const q = f.renderer.pos(f.game.p.x, f.game.zFor(f.game.p));
  close(q.x + f.renderer._pngMuzzles.decker.x, muzzle[0]);
  close(q.y + f.renderer._pngMuzzles.decker.y, muzzle[1]);
  assert.equal(snapshot(f), before);
});
test('the adapter leaves simulation, architecture and target selection untouched', () => {
  const f = boot();
  for (const name of ['architecture', 'pickTarget', 'worldDressing', 'lightOverlay', 'tacticalOverlay', 'addEffect']) assert.equal(f.context.SoSRenderer.prototype[name], f.baseMethods[name], name);
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

test('unarmed walking alternates two grounded contacts from the paused simulation clock', async () => {
  const f = boot(); await f.api.preload(); f.game.p.moving = true;
  for (const facing of [-1, 1]) {
    f.game.p.facing = facing;
    for (const [time, id] of [[0, 'a'], [.26, 'b'], [.26, 'b'], [.51, 'a']]) {
      f.game.time = time; f.calls.length = 0;
      const before = snapshot(f);
      f.renderer.human(f.game.p, undefined, 'decker');
      assert.equal(snapshot(f), before);
      const image = drawn(f)[0], entry = f.assets.characters['decker-walk-' + id];
      assert.equal(image.src, entry.src);
      assert.equal(Math.sign(image.matrix[0]), facing);
      const ground = sourcePoint(image, entry.pivot), q = f.renderer.pos(f.game.p.x, f.game.zFor(f.game.p));
      close(ground[0], q.x); close(ground[1], q.y);
      close(image.args[7] * Math.abs(image.matrix[3]), 110 * (.82 + f.game.zFor(f.game.p) * .30));
    }
  }
});
for (const [reason, change, expected] of [
  ['stationary', f => { f.game.p.moving = false; }, 'decker'],
  ['armed', f => { f.game.state.inventory.pistol = true; }, 'decker-ready'],
  ['crouching', f => { f.game.p.crouch = true; }, 'decker-crouch'],
  ['dodging', f => { f.game.p.dodgeTime = .2; }, 'decker-dodge'],
  ['reduced motion', f => { f.renderer.reduced = true; }, 'decker'],
]) test(`walking contacts are excluded when ${reason}`, async () => {
  const f = boot(); await f.api.preload(); f.game.p.moving = true; change(f);
  f.renderer.human(f.game.p, .26, 'decker');
  const bodies = drawn(f).filter(a => a.src.startsWith('sprites/characters/'));
  assert.equal(bodies[0].src, `sprites/characters/${expected}.png`);
});
test('walking images never replace portraits or other actors, and fail back to idle', async () => {
  const assets = fixtureAssets(); assets.characters['decker-walk-b'].crop[0] = -1;
  const f = boot({ assets, behavior: { 'sprites/characters/decker-walk-a.png': 'failed' } });
  await f.api.preload(); f.game.p.moving = true;
  for (const time of [0, .26]) f.renderer.human(f.game.p, time, 'decker');
  f.renderer.human({ ...f.game.p }, .26, 'decker');
  assert.ok(drawn(f).every(a => a.src === 'sprites/characters/decker.png'));
  const p = boot({ portrait: true }); await p.api.preload(); p.game.p.moving = true;
  p.renderer.human(p.game.p, .26, 'decker');
  assert.equal(drawn(p)[0].src, 'sprites/characters/decker.png');
});
for (const facing of [-1, 1]) test(`lamp mount and live beam share the verified attachment facing ${facing}`, async () => {
  const f = boot(); await f.api.preload(); f.game.state.flags.equipped = true; f.game.p.facing = facing;
  const before = snapshot(f); f.renderer.human(f.game.p, 0, 'decker'); assert.equal(snapshot(f), before);
  const body = drawn(f).find(a => a.src === f.assets.characters.decker.src);
  const lamp = drawn(f).find(a => a.src === f.assets.equipment.lamp.src);
  const mount = sourcePoint(lamp, f.assets.equipment.lamp.mountAnchor), actor = sourcePoint(body, f.assets.characters.decker.lampAnchor);
  close(mount[0], actor[0]); close(mount[1], actor[1]);
  const lens = sourcePoint(lamp, f.assets.equipment.lamp.emitterAnchor), glow = f.calls.find(a => a.op === 'ellipse' && a.fill === '#e0d08b');
  const center = canvasPoint(glow, glow.args[0], glow.args[1]);
  close(lens[0], center[0]); close(lens[1], center[1]);
  f.game.toggleLamp(); f.calls.length = 0;
  f.renderer.human(f.game.p, 0, 'decker');
  assert.ok(drawn(f).some(a => a.src === f.assets.equipment.lamp.src), 'switched-off equipment stays mounted');
  assert.ok(!f.calls.some(a => a.op === 'ellipse' && a.fill === '#e0d08b'), 'the switched-off lamp produces no beam origin glow');
});
test('a missing lamp mount retains the native light at the body attachment', async () => {
  const assets = fixtureAssets(); delete assets.equipment.lamp.mountAnchor;
  const f = boot({ assets }); await f.api.preload(); f.game.state.flags.equipped = true;
  f.renderer.human(f.game.p, 0, 'decker');
  assert.ok(!drawn(f).some(a => a.src === assets.equipment.lamp.src));
  const actor = sourcePoint(drawn(f)[0], assets.characters.decker.lampAnchor), glow = f.calls.find(a => a.op === 'ellipse' && a.fill === '#e0d08b');
  const center = canvasPoint(glow, glow.args[0], glow.args[1]);
  close(actor[0], center[0]); close(actor[1], center[1]);
});
for (const presentation of ['CLASSIC', 'HYBRID']) test(`bulkhead sprites preserve the real aperture, walls and gate state in ${presentation}`, async () => {
  const f = boot(); await f.api.preload(); f.game.state.presentation = presentation; f.game.enter('s16');
  const d = f.game.room.doors.find(d => d.gate === 'power_on' && d.portal.type === 'bulkhead');
  Object.assign(f.game.p, { x: d.x, z: d.z });
  for (const open of [false, true]) {
    f.game.state.flags.power_on = open; f.calls.length = 0;
    assert.equal(f.game.doorStatus(d).open, open);
    const before = snapshot(f); f.renderer.door(d); assert.equal(snapshot(f), before);
    assert.deepEqual(drawn(f).map(a => a.src), open ? [f.assets.doors['bulkhead-frame'].src] : [f.assets.doors['bulkhead-panel'].src, f.assets.doors['bulkhead-frame'].src]);
    const frame = drawn(f).at(-1), q = f.renderer.pos(d.x, d.portal.apertureZ), [x, y, w, h] = f.assets.doors['bulkhead-frame'].apertureBounds;
    const topLeft = sourcePoint(frame, [x, y]), bottomRight = sourcePoint(frame, [x + w, y + h]);
    close(topLeft[0], q.x - d.portal.width / 2); close(topLeft[1], q.y - 152);
    close(bottomRight[0], q.x + d.portal.width / 2); close(bottomRight[1], q.y);
    if (!open) {
      const a = sourcePoint(frame, [250, 400]), b = sourcePoint(drawn(f)[0], [250, 400]);
      close(a[0], b[0]); close(a[1], b[1]);
    }
    const walls = f.calls.filter(a => a.op === 'fillRect' && a.fill === '#243e49').map(a => a.args);
    const labels = f.calls.filter(a => a.op === 'fillText').map(a => a.args);
    f.calls.length = 0; f.baseMethods.door.call(f.renderer, d);
    assert.deepEqual(f.calls.filter(a => a.op === 'fillRect' && a.fill === '#243e49').map(a => a.args), walls);
    assert.deepEqual(f.calls.filter(a => a.op === 'fillText').map(a => a.args), labels);
    assert.equal(f.ctx.stackDepth, 0);
  }
});
test('foreground bulkheads keep native cutaway opacity and readable approach labels', async () => {
  const f = boot(); await f.api.preload(); f.game.enter('s17');
  const d = f.game.room.doors.find(d => d.portal.type === 'bulkhead' && d.portal.mount === 'front');
  Object.assign(f.game.p, { x: d.x, z: d.z });
  f.renderer.door(d);
  assert.equal(drawn(f).length, 2); assert.ok(drawn(f).every(a => a.alpha === .42));
  assert.ok(f.calls.some(a => a.op === 'fillText' && a.args[0] === d.label));
  assert.ok(f.calls.some(a => a.op === 'ellipse' && a.fill === '#d3947466' && a.alpha === 1));
});
test('oblique and nonindustrial doors retain native presentation in every authored room', async () => {
  const f = boot(); await f.api.preload(); let count = 0;
  for (const room of f.context.SoSData.rooms) {
    f.game.enter(room.id);
    for (const d of room.doors) if (d.portal.type !== 'bulkhead' || !['front', 'back'].includes(d.portal.mount)) {
      f.renderer.door(d); count++;
    }
  }
  assert.ok(count > 50); assert.equal(drawn(f).length, 0); assert.equal(f.ctx.stackDepth, 0);
});
test('invalid aperture or unmatched leaf metadata falls back to the entire native door', async () => {
  for (const change of [a => { a.doors['bulkhead-frame'].apertureBounds[2] = 500; }, a => { a.doors['bulkhead-panel'].canvasMatch = 'wrong-canvas'; }]) {
    const assets = fixtureAssets(); change(assets);
    const f = boot({ assets }); await f.api.preload(); f.game.enter('s16');
    const d = f.game.room.doors.find(d => d.gate === 'power_on');
    f.renderer.door(d);
    assert.equal(drawn(f).length, 0); assert.equal(f.api.status().methods.door.vectorCalls, 1);
    assert.ok(f.calls.some(a => a.op === 'fillRect')); assert.equal(f.ctx.stackDepth, 0);
  }
});
test('the lighting console reflects a real held interaction without changing its progress', async () => {
  const f = boot(); await f.api.preload(); f.game.enter('s13'); f.game.state.flags.equipped = true;
  const l = f.game.room.lighting; Object.assign(f.game.p, { x: l.x, z: l.z });
  for (let i = 0; i < 20; i++) f.game.lightingStep(.05, l);
  assert.ok(f.game.activeWork?.progress > 0); assert.equal(f.game.rs.lighting.on, true);
  for (const on of [true, false]) {
    f.calls.length = 0; const before = snapshot(f); f.renderer.lightPanel(l, 0); assert.equal(snapshot(f), before);
    const image = drawn(f)[0], a = f.assets.equipment['light-panel'], q = f.renderer.pos(l.x, f.game.zFor(l));
    const base = sourcePoint(image, a.pivot); close(base[0], q.x); close(base[1], q.y - 62);
    const bulb = sourcePoint(image, a[on ? 'onAnchor' : 'offAnchor']);
    const lit = f.calls.find(a => a.op === 'ellipse' && a.fill === (on ? '#9ebca0' : '#d3a66c'));
    close(lit.args[0], bulb[0]); close(lit.args[1], bulb[1]);
    assert.ok(f.calls.some(a => a.op === 'fillText' && a.args[0] === 'E · MAINTENIR'));
    if (on) {
      for (let i = 0; i < 20; i++) f.game.lightingStep(.05, l);
      assert.equal(f.game.rs.lighting.on, false); assert.equal(f.game.state.stats.lightingCycles, 1);
    }
  }
});
for (const status of ['open', 'closed', 'broken']) test(`both actual shutter controls display saved ${status} state and retain progress`, async () => {
  const f = boot(); await f.api.preload(); f.game.enter('s13');
  const s = f.game.room.shutters[0], controls = f.game.shutterControls(s);
  Object.assign(f.game.rs.shutters[s.id], { status, integrity: 43, progress: .7 });
  Object.assign(f.game.p, { x: controls[0].x, z: controls[0].z });
  const before = snapshot(f); f.renderer.shutter(s, 0); assert.equal(snapshot(f), before);
  const images = drawn(f); assert.equal(images.length, 2);
  const a = f.assets.equipment['shutter-control'], color = status === 'closed' ? '#c1a680' : status === 'broken' ? '#925f50' : '#97bab3';
  for (const [i, image] of images.entries()) {
    const q = f.renderer.pos(controls[i].x, f.game.zFor(controls[i])), base = sourcePoint(image, a.pivot);
    close(base[0], q.x); close(base[1], q.y - 50);
    const bulb = sourcePoint(image, a.statusAnchor);
    assert.ok(f.calls.some(a => a.op === 'ellipse' && a.fill === color && Math.abs(a.args[0] - bulb[0]) < 1e-8 && Math.abs(a.args[1] - bulb[1]) < 1e-8));
  }
  const text = f.calls.filter(a => a.op === 'fillText').map(a => a.args[0]);
  assert.ok(text.includes(status === 'closed' ? 'FERMÉE · 43 %' : status === 'broken' ? 'MÉCANISME ROMPU' : 'CLOISON OUVERTE'));
  assert.ok(text.includes('G / E')); assert.equal(f.ctx.stackDepth, 0);
});
test('unusable console attachments retain native state indicators and prompts', async () => {
  const assets = fixtureAssets(); delete assets.equipment['light-panel'].offAnchor; delete assets.equipment['shutter-control'].statusAnchor;
  const f = boot({ assets }); await f.api.preload(); f.game.enter('s13');
  f.renderer.lightPanel(f.game.room.lighting, 0); f.renderer.shutter(f.game.room.shutters[0], 0);
  assert.equal(drawn(f).length, 0); assert.equal(f.api.status().methods.lightPanel.vectorCalls, 1); assert.equal(f.api.status().methods.shutter.vectorCalls, 1);
});

for (const facing of [-1, 1]) test(`an accepted pistol shot emits one aligned muzzle and expires facing ${facing}`, async () => {
  const f = boot(); await f.api.preload(); f.game.state.inventory.pistol = true;
  f.game.drainEvents(); const ammo = f.game.p.ammo;
  assert.equal(f.game.shoot({ x: f.game.p.x + facing * 140, z: f.game.p.z }), true);
  const events = f.game.drainEvents(); for (const e of events) f.renderer.addEffect(e);
  assert.equal(events.filter(e => e.type === 'shot').length, 1); assert.equal(f.game.p.ammo, ammo - 1);
  f.renderer.human(f.game.p, 0, 'decker');
  const weapon = drawn(f).find(a => a.src === f.assets.weapons.pistol.src), tip = sourcePoint(weapon, f.assets.weapons.pistol.muzzleAnchor);
  f.calls.length = 0; const before = snapshot(f); f.renderer.drawEffects(.016); assert.equal(snapshot(f), before);
  const flash = drawn(f).find(a => a.src === f.assets.effects.muzzle.src), emitted = sourcePoint(flash, f.assets.effects.muzzle.emissionAnchor);
  close(emitted[0], tip[0]); close(emitted[1], tip[1]);
  assert.equal(drawn(f).filter(a => a.src === f.assets.effects.muzzle.src).length, 1);
  f.calls.length = 0; f.renderer.drawEffects(.2); assert.equal(f.renderer.effects.length, 0); assert.equal(drawn(f).length, 0);
  assert.equal(f.game.shoot({ x: f.game.p.x + facing * 140, z: f.game.p.z }), false, 'native cooldown refuses an extra event');
  for (const e of f.game.drainEvents()) f.renderer.addEffect(e);
  f.renderer.drawEffects(0); assert.equal(drawn(f).length, 0);
});
for (const reduced of [false, true]) test(`accepted flame follows the native endpoint with reduced motion ${reduced}`, async () => {
  const f = boot(); await f.api.preload(); f.renderer.reduced = reduced;
  const lines = []; f.renderer.line = (...args) => lines.push(args);
  f.game.state.inventory.flame = true; f.game.p.weapon = 'flame'; f.game.drainEvents();
  assert.equal(f.game.shoot({ x: f.game.p.x + 1000, z: f.game.p.z }), true);
  const event = f.game.drainEvents().find(e => e.type === 'shot'); f.renderer.addEffect(event);
  const before = snapshot(f); f.renderer.drawEffects(.016); assert.equal(snapshot(f), before);
  const image = drawn(f)[0], a = f.assets.effects.flame;
  const from = f.renderer.pos(event.from.x, f.game.zFor(event.from)), to = f.renderer.pos(event.to.x, f.game.zFor(event.to));
  const start = sourcePoint(image, a.emissionAnchor), end = sourcePoint(image, [a.crop[0] + a.crop[2], a.emissionAnchor[1]]);
  close(start[0], from.x + 25); close(start[1], from.y - 61);
  close(end[0], to.x); close(end[1], to.y - 62);
  assert.equal(lines.length, 0, 'a successful flame texture replaces the opaque native beam');
  const matrix = [...image.matrix]; f.calls.length = 0; f.renderer.drawEffects(.016);
  assert.deepEqual(drawn(f)[0].matrix, matrix, 'no extra pulse, random shake or growth is introduced');
  f.calls.length = 0; f.renderer.drawEffects(.2); assert.equal(drawn(f).length, 0); assert.equal(f.renderer.effects.length, 0);
});
test('real lethal damage renders impact and acid while preserving the native hazard lifetime', async () => {
  const f = boot(); await f.api.preload(); f.game.enter('s19'); f.game.drainEvents();
  const e = f.game.rs.enemies.find(e => e.kind !== 'queen' && e.kind !== 'captureAdult'); assert.ok(e);
  f.game.hurtEnemy(e, e.hp); for (const event of f.game.drainEvents()) f.renderer.addEffect(event);
  assert.equal(f.game.rs.acid.length, 1); assert.equal(f.game.rs.acid[0].time, 7);
  const before = snapshot(f); f.renderer.tacticalGround(0); f.renderer.drawEffects(.016); assert.equal(snapshot(f), before);
  assert.ok(drawn(f).some(a => a.src === f.assets.effects.acid.src)); assert.ok(drawn(f).some(a => a.src === f.assets.effects.impact.src));
  const acid = drawn(f).find(a => a.src === f.assets.effects.acid.src), ground = sourcePoint(acid, f.assets.effects.acid.groundAnchor), q = f.renderer.pos(e.x, f.game.zFor(e));
  close(ground[0], q.x); close(ground[1], q.y);
  const hit = drawn(f).find(a => a.src === f.assets.effects.impact.src), impact = sourcePoint(hit, f.assets.effects.impact.impactAnchor);
  close(impact[0], q.x); close(impact[1], q.y - 60);
  f.game.rs.acid[0].time = 0; f.calls.length = 0; f.renderer.tacticalGround(1); assert.equal(drawn(f).length, 0);
});
test('a real flame hit on a native weakpoint produces its own spark PNG', async () => {
  const f = boot(); await f.api.preload(); f.game.enter('s33');
  const w = f.game.rs.weakpoints[0]; Object.assign(f.game.p, { x: w.x - 60, z: w.z, weapon: 'flame' });
  f.game.state.inventory.flame = true; f.game.drainEvents();
  assert.equal(f.game.shoot(w), true); const events = f.game.drainEvents();
  const spark = events.find(e => e.type === 'spark'); assert.ok(spark, 'real weakpoint damage emitted spark');
  for (const e of events) f.renderer.addEffect(e);
  const before = snapshot(f); f.renderer.drawEffects(.016); assert.equal(snapshot(f), before);
  const image = drawn(f).find(a => a.src === f.assets.effects.spark.src); assert.ok(image);
  const impact = sourcePoint(image, f.assets.effects.spark.impactAnchor), q = f.renderer.pos(spark.x, f.game.zFor(spark));
  close(impact[0], q.x); close(impact[1], q.y - 60);
});
test('foam stays on restrained native or PNG creatures and never becomes a projectile texture', async () => {
  const f = boot(); await f.api.preload();
  for (const kind of ['facehugger', 'adult', 'queen']) for (const amount of [0, .1, .38, 1.2]) {
    f.calls.length = 0;
    const e = { x: 500, z: .55, facing: 1, kind, foam: amount };
    const before = snapshot(f); f.renderer.alien(e, 0); assert.equal(snapshot(f), before);
    const foams = drawn(f).filter(a => a.src === f.assets.effects.foam.src); assert.equal(foams.length, amount > .1 ? 1 : 0);
    if (foams.length) {
      close(foams[0].alpha, Math.min(.85, Math.max(.2, amount)));
      const anchor = sourcePoint(foams[0], f.assets.effects.foam.groundAnchor), q = f.renderer.pos(e.x, f.game.zFor(e));
      close(anchor[0], q.x); close(anchor[1], q.y);
    }
  }
  f.calls.length = 0;
  f.renderer.addEffect({ type: 'shot', weapon: 'foam', from: { x: 100, z: .55 }, to: { x: 300, z: .55 } });
  f.renderer.drawEffects(.016); assert.equal(drawn(f).length, 0);
});
test('failed effect images retain native marks and timers without throwing', async () => {
  const assets = fixtureAssets(), behavior = Object.fromEntries(Object.values(assets.effects).map(a => [a.src, 'failed']));
  const f = boot({ assets, behavior }); await f.api.preload();
  for (const e of [{ type: 'shot', weapon: 'flame', from: { x: 100, z: .55 }, to: { x: 300, z: .55 } }, { type: 'shot', weapon: 'pistol', from: { x: 100, z: .55 }, to: { x: 300, z: .55 } }, { type: 'hit', x: 300, z: .55 }, { type: 'spark', x: 300, z: .55 }]) f.renderer.addEffect(e);
  const effects = JSON.stringify(f.renderer.effects); let lines = 0; f.renderer.line = () => { lines++; };
  f.renderer.drawEffects(.016); assert.equal(drawn(f).length, 0); assert.equal(lines, 16); assert.equal(f.renderer.effects.length, 4);
  const after = JSON.stringify(f.renderer.effects); f.renderer.effects = JSON.parse(effects); f.baseMethods.drawEffects.call(f.renderer, .016);
  assert.equal(JSON.stringify(f.renderer.effects), after); assert.equal(f.ctx.stackDepth, 0);
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
