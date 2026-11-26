/* Optional real-pixel QA using @napi-rs/canvas. This is not a browser journey.
 * Usage: node scripts/qa-mer-visual-canvas-20261126.mjs [--output <directory>]
 *        [--captures <directory>]
 * The optional renderer dependency may come from the runtime bundle through
 * CODEX_PRIMARY_RUNTIME_NODE_MODULES; it is not a production game dependency.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repo = fileURLToPath(new URL('../', import.meta.url));
const visualRoot = resolve(repo, 'dlc/sea-of-sorrows-visual');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const output = resolve(option('--output', resolve(tmpdir(), 'atf-mer-canvas-20261126')));
const captures = resolve(option('--captures', resolve(repo, 'docs/mer-des-chagrins-20261126/canvas-0.10.5')));
assert.ok(!['canvas', 'canvas-0.10.3', 'canvas-0.10.4'].some(name => captures === resolve(repo, 'docs/mer-des-chagrins-20261126', name)),
  'historical edition captures are immutable; select the 0.10.5 directory or a temporary output');
mkdirSync(output, { recursive: true }); mkdirSync(captures, { recursive: true });
const require = createRequire(import.meta.url);
let native, canvasVersion;
try { native = require('@napi-rs/canvas'); canvasVersion = require('@napi-rs/canvas/package.json').version; }
catch {
  const modules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (!modules) throw new Error('Optional @napi-rs/canvas dependency is unavailable; install it locally or provide the primary runtime bundle.');
  const runtimeRequire = createRequire(resolve(modules, 'package.json'));
  native = runtimeRequire('@napi-rs/canvas'); canvasVersion = runtimeRequire('@napi-rs/canvas/package.json').version;
}
const { createCanvas, Image: NativeImage } = native;
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const inputChecks = new Map();
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const imageCacheLimit = 24, nativeImages = new Map(), decodedImagePaths = new Set(), actualImageDraws = new Map();
const imageCacheMetrics = { limit: imageCacheLimit, decodes: 0, reloads: 0, evictions: 0, maxCachedNativeImages: 0, maxImagesInOneRender: 0, observedPeakResidentMiB: 0 };
let requestedImages = null;
const drawnStatus = () => Object.fromEntries(actualImageDraws);
function recordMemory() {
  imageCacheMetrics.observedPeakResidentMiB = Math.max(imageCacheMetrics.observedPeakResidentMiB, Math.round(process.memoryUsage().rss / 1048576));
}
async function flushDecodeFinalizers() {
  // Native decoder callbacks and object finalizers need a real event-loop
  // turn; a chain of resolved Promises alone keeps their buffers pending.
  await new Promise(resolve => setImmediate(resolve));
  if (typeof globalThis.gc === 'function') globalThis.gc();
  await new Promise(resolve => setImmediate(resolve));
  recordMemory();
}
function pngForNativeDecoder(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(pngSignature), 'source is a PNG');
  const chunks = [bytes.subarray(0, 8)];
  let omitted = 0;
  for (let offset = 8; offset < bytes.length;) {
    assert.ok(offset + 12 <= bytes.length, 'complete PNG chunk header');
    const length = bytes.readUInt32BE(offset), end = offset + length + 12;
    assert.ok(end <= bytes.length, 'complete PNG chunk payload');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    // Skia in @napi-rs/canvas 0.1.100 refuses the image provenance caBX
    // chunk. Remove that ancillary metadata only in the decoder buffer.
    // IHDR, all IDAT bytes, every other chunk and the source file stay intact.
    if (type === 'caBX') omitted++; else chunks.push(bytes.subarray(offset, end));
    offset = end;
  }
  return { bytes: Buffer.concat(chunks), omitted };
}
function cachedImage(path) {
  if (nativeImages.has(path)) {
    const entry = nativeImages.get(path); nativeImages.delete(path); nativeImages.set(path, entry);
    return entry;
  }
  const bytes = readFileSync(path), decode = pngForNativeDecoder(bytes), image = new NativeImage();
  const record = { path: relative(repo, path), bytes: bytes.length, sha256: sha256(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), omittedAncillaryCaBX: decode.omitted };
  if (inputChecks.has(path)) assert.equal(record.sha256, inputChecks.get(path).sha256, 'reloaded source bytes remain unchanged');
  inputChecks.set(path, record);
  const entry = { image, ready: false, promise: null };
  entry.promise = new Promise((resolve, reject) => {
    image.onload = () => {
      try {
        assert.ok(image.complete && image.naturalWidth === record.width && image.naturalHeight === record.height, record.path + ': full-resolution native PNG decode');
        entry.ready = true; imageCacheMetrics.decodes++;
        if (decodedImagePaths.has(path)) imageCacheMetrics.reloads++;
        decodedImagePaths.add(path); recordMemory(); image.onload = image.onerror = null; resolve(image);
      } catch (error) { reject(error); }
    };
    image.onerror = error => reject(error);
    image.src = decode.bytes;
  });
  nativeImages.set(path, entry);
  while (nativeImages.size > imageCacheLimit) { nativeImages.delete(nativeImages.keys().next().value); imageCacheMetrics.evictions++; }
  imageCacheMetrics.maxCachedNativeImages = Math.max(imageCacheMetrics.maxCachedNativeImages, nativeImages.size);
  recordMemory();
  return entry;
}
class LocalImage {
  set src(value) {
    const path = resolve(visualRoot, value), rel = relative(visualRoot, path);
    assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'image stays in the visual runtime');
    this._sourcePath = value; this._path = path;
    cachedImage(path).promise.then(image => {
      this.width = this.naturalWidth = image.naturalWidth;
      this.height = this.naturalHeight = image.naturalHeight; this.complete = true;
      this.onload?.();
    }, error => this.onerror?.(error));
  }
  get src() { return this._sourcePath; }
  native() {
    const entry = nativeImages.get(this._path);
    assert.ok(entry?.ready, this._sourcePath + ': native onload awaited before real drawImage');
    return cachedImage(this._path).image;
  }
}
function makeCanvas(width, height, portrait = false) {
  const canvas = createCanvas(width, height);
  const context2d = canvas.getContext('2d'), originalDrawImage = context2d.drawImage.bind(context2d);
  context2d.drawImage = (image, ...parameters) => {
    if (!(image instanceof LocalImage)) return originalDrawImage(image, ...parameters);
    if (requestedImages) { requestedImages.add(image._path); return; }
    originalDrawImage(image.native(), ...parameters);
    const id = image._sourcePath.replace(/^sprites\//, '').replace(/\.png$/, '');
    actualImageDraws.set(id, (actualImageDraws.get(id) || 0) + 1);
  };
  canvas.getBoundingClientRect = () => ({ width, height, left: 0, top: 0 });
  canvas.classList = { contains: name => portrait && name === 'castPortrait' };
  canvas.isConnected = true;
  return canvas;
}
async function drawWithImages(renderer, draw) {
  const c = renderer.ctx, beforePixels = c.getImageData(0, 0, renderer.canvas.width, renderer.canvas.height);
  const properties = Object.fromEntries(Object.entries(renderer).filter(([key]) => !['canvas', 'ctx', 'game'].includes(key)).map(([key, value]) =>
    [key, value && typeof value === 'object' ? structuredClone(value) : value]));
  const saveBefore = renderer.game.exportSave(), workBefore = JSON.stringify(renderer.game.activeWork);
  const paths = new Set(); requestedImages = paths; c.save();
  try { draw(); }
  finally {
    requestedImages = null; c.restore(); c.putImageData(beforePixels, 0, 0);
    for (const key of Object.keys(renderer)) if (!['canvas', 'ctx', 'game'].includes(key) && !(key in properties)) delete renderer[key];
    Object.assign(renderer, properties);
  }
  assert.equal(renderer.game.exportSave(), saveBefore, 'image-selection pass cannot mutate the simulation');
  assert.equal(JSON.stringify(renderer.game.activeWork), workBefore, 'image-selection pass cannot mutate an active operation');
  assert.ok(paths.size <= imageCacheLimit, 'one render fits the bounded native image cache');
  imageCacheMetrics.maxImagesInOneRender = Math.max(imageCacheMetrics.maxImagesInOneRender, paths.size);
  for (const path of paths) await cachedImage(path).promise;
  await flushDecodeFinalizers();
  draw(); recordMemory();
}
const context = vm.createContext({
  Image: LocalImage, devicePixelRatio: 1, console,
  document: { createElement: name => { assert.equal(name, 'canvas'); return makeCanvas(128, 128); } },
});
const immutableInputs = new Map();
for (const name of ['data', 'core', 'render', 'world-art', 'tactics-art']) {
  const path = resolve(repo, `dlc/sea-of-sorrows/src/${name}.js`), bytes = readFileSync(path);
  immutableInputs.set(path, sha256(bytes));
  vm.runInContext(bytes.toString('utf8'), context, { filename: path });
}
const unmodifiedMethods = Object.fromEntries(['architecture', 'pickTarget', 'worldDressing', 'lightOverlay', 'tacticalOverlay', 'addEffect'].map(name => [name, context.SoSRenderer.prototype[name]]));
const originalDoor = context.SoSRenderer.prototype.door;
const originalLocker = context.SoSRenderer.prototype.locker;
const originalFloor = context.SoSRenderer.prototype.floor;
const originalArmoryRack = context.SoSRenderer.prototype.armoryRack;
const simulationDescriptors = Object.fromEntries(Object.getOwnPropertyNames(context.SoSCore.Game.prototype).map(name => [name, Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name)]));
for (const name of ['art-pack', 'png-renderer']) {
  const path = resolve(visualRoot, `src/${name}.js`);
  vm.runInContext(readFileSync(path, 'utf8'), context, { filename: path });
}
const api = context.SoSPngRenderer;
// Decode one category at a time. The production adapter retains its image
// handles; this harness bounds native pixel residency behind those handles.
// Every source is decoded at full resolution and every draw uses a NativeImage.
for (const category of Object.keys(context.SoSArtPack.assets)) {
  await api.preload([category]);
  await flushDecodeFinalizers();
  console.error(JSON.stringify({ phase: 'decode', category, ready: api.status().ready, residentMiB: Math.round(process.memoryUsage().rss / 1048576) }));
}
const loaded = api.status();
const expectedPng = JSON.parse(readFileSync(resolve(visualRoot, 'SPRITE_MANIFEST.json'), 'utf8')).counts.pngFiles;
assert.equal(loaded.total, expectedPng, 'exact declared sprite entries');
assert.equal(loaded.requested, expectedPng, 'every image requested by explicit QA preload');
assert.equal(loaded.ready, expectedPng, JSON.stringify(loaded.assets));
assert.equal(inputChecks.size, expectedPng);
for (const [name, method] of Object.entries(unmodifiedMethods)) assert.equal(context.SoSRenderer.prototype[name], method, name);
for (const [name, descriptor] of Object.entries(simulationDescriptors)) assert.deepEqual(Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name), descriptor, name);

const canvas = makeCanvas(1600, 900);
const game = new context.SoSCore.Game({ difficulty: 'exploration' });
const renderer = new context.SoSRenderer(canvas, game);
const selected = new Set(['s01', 's03', 's14', 's26', 's33', 's34', 's39', 's50']);
const roomResults = [], captureResults = [];
const objectives = context.SoSCore.objectiveOrder;
function prepareRoom(room) {
  game.newGame({ difficulty: 'exploration' });
  const index = objectives.findIndex(id => room.interactables.some(o => o.id === id));
  game.state.objectiveIndex = index >= 0 ? index : room.id === 's50' ? 32 : 0;
  const late = Number(room.id.slice(1)) >= 7;
  game.state.flags.equipped = late;
  game.state.inventory.pistol = late;
  game.state.inventory.foam = late;
  game.state.inventory.flame = late;
  game.state.armory.claimed = late;
  game.state.armory.pulseAmmo = 30;
  game.state.armory.plasmaAmmo = 12;
  game.enter(room.id);
  game.p.weapon = 'pistol';
  if (room.id !== 's01') {
    game.p.x = room.width * .50;
    game.p.z = .55;
    game.ensureSafePosition(game.p);
    game.state.companion.x = game.p.x - 120;
    game.state.companion.z = game.p.z;
    game.ensureSafePosition(game.state.companion);
  }
  if (room.id === 's34' || room.id === 's50') {
    game.state.objectiveIndex = Math.max(24, game.state.objectiveIndex);
    game.state.rescue.active = true;
    for (const [i, actor] of game.state.rescue.actors.entries()) Object.assign(actor, {
      room: room.id, x: game.p.x + (i ? 240 : -240), z: .55, status: 'waiting', integrity: i ? 68 : 100,
    });
    if (room.id === 's50') game.state.flags.specimens_delivered = true;
  }
  renderer.camera = 0; renderer.lastRoom = ''; renderer.effects = [];
}
for (const room of context.SoSData.rooms) {
  prepareRoom(room);
  const before = game.exportSave(), beforeDrawn = drawnStatus();
  await drawWithImages(renderer, () => renderer.draw(1, 1 / 60));
  assert.equal(game.exportSave(), before, room.id + ': rendering cannot change the save/checkpoint');
  const afterDrawn = drawnStatus();
  const used = Object.keys(afterDrawn).filter(key => afterDrawn[key] > (beforeDrawn[key] || 0));
  roomResults.push({ room: room.id, imageUses: used, stateUnchanged: true, fixture: { objectiveIndex: game.state.objectiveIndex, equipped: game.state.flags.equipped, player: { x: game.p.x, z: game.p.z }, rescuedActors: game.state.rescue.active } });
  if (selected.has(room.id)) {
    const path = resolve(captures, room.id + '.png'), bytes = canvas.toBuffer('image/png');
    writeFileSync(path, bytes);
    captureResults.push({ room: room.id, path: relative(repo, path), width: canvas.width, height: canvas.height, bytes: bytes.length, sha256: sha256(bytes) });
  }
  await flushDecodeFinalizers();
}
assert.equal(roomResults.length, 50);
assert.equal(captureResults.length, selected.size);
for (const id of ['characters/carlyle-physician', 'characters/decker-medical-gown', 'objectives/icc-handheld']) {
  assert.ok(roomResults.find(r => r.room === 's03').imageUses.includes(id), 's03: new contextual image drawn through the full room renderer: ' + id);
}
assert.ok(roomResults.find(r => r.room === 's33').imageUses.includes('creatures/queen'), 's33: real authored queen uses its PNG');

// A separate contact sheet exercises the actual renderer in both orientations,
// all recovered player posture states and all four available PNG held weapons.
const posesCanvas = makeCanvas(1800, 1980), poses = new context.SoSRenderer(posesCanvas, game);
poses.canvas.width = 1800; poses.canvas.height = 1980; poses.W = 1800; poses.H = 1980; poses.unit = 2.3;
const c = poses.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#142329'; c.fillRect(0, 0, 1800, 1980);
prepareRoom(context.SoSData.rooms.find(r => r.id === 's14'));
const combinations = ['pistol', 'pulse', 'foam', 'flame'].flatMap(weapon => [1, -1].flatMap(facing => ['standing', 'crouch', 'dodge'].map(posture => ({ weapon, facing, posture }))));
const poseResults = [];
for (const [i, combination] of combinations.entries()) {
  const x = i % 6 * 300 + 150, y = Math.floor(i / 6) * 480 + 355;
  poses.pos = () => ({ x, y });
  Object.assign(game.p, { weapon: combination.weapon, facing: combination.facing, crouch: combination.posture === 'crouch', dodgeTime: combination.posture === 'dodge' ? .2 : 0 });
  const before = game.exportSave(), prior = drawnStatus();
  await drawWithImages(poses, () => poses.human(game.p, 0, 'decker'));
  assert.equal(game.exportSave(), before);
  c.font = '18px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#d5e1d9';
  c.fillText(`${combination.weapon} · ${combination.posture} · ${combination.facing > 0 ? 'droite' : 'gauche'}`, x, y + 52);
  const used = Object.keys(drawnStatus()).filter(key => drawnStatus()[key] > (prior[key] || 0));
  assert.ok(used.includes('weapons/' + combination.weapon), JSON.stringify(combination));
  assert.ok(used.some(key => key.startsWith('characters/decker')), JSON.stringify(combination));
  poseResults.push({ ...combination, drawn: used });
}
const posesPath = resolve(captures, 'poses-weapons.png');
writeFileSync(posesPath, posesCanvas.toBuffer('image/png'));
await flushDecodeFinalizers();

// Isolated views call the actual renderer, at an explicitly magnified projection.
// They are diagnostic fixtures, not screenshots of a played camera journey.
const drawnSince = prior => {
  const current = drawnStatus();
  return Object.keys(current).filter(key => current[key] > (prior[key] || 0));
};
const pixelsHash = cv => sha256(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data);
function fixtureGame(roomId) {
  const g = new context.SoSCore.Game({ difficulty: 'exploration' });
  g.enter(roomId);
  const index = objectives.findIndex(id => g.room.interactables.some(o => o.id === id));
  g.state.objectiveIndex = index >= 0 ? index : 0;
  g.drainEvents();
  return g;
}
function stage(g, { width = 600, height = 380, unit = 1.8, focusX = g.p.x, focusZ = g.zFor(g.p), groundY = height - 52 } = {}) {
  const cv = makeCanvas(width, height), r = new context.SoSRenderer(cv, g);
  r.W = width; r.H = height; r.unit = unit; r.camera = focusX - width / 2;
  r.pos = (x, z) => ({ x: x - focusX + width / 2, y: groundY + (z - focusZ) * height * .32 });
  const c = r.ctx; c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#142329'; c.fillRect(0, 0, width, height);
  r.line(0, groundY + 2, width, groundY + 2, '#53656a', 1);
  return r;
}
async function observe(g, r, id, draw) {
  const before = g.exportSave(), prior = drawnStatus();
  const activeWorkBefore = JSON.stringify(g.activeWork);
  await drawWithImages(r, draw);
  recordMemory();
  assert.equal(g.exportSave(), before, id + ': rendering cannot change the serialized save/checkpoint');
  assert.equal(JSON.stringify(g.activeWork), activeWorkBefore, id + ': rendering cannot change the active operation');
  return { drawn: drawnSince(prior), saveUnchanged: true, activeWorkUnchanged: true, pixelSha256: pixelsHash(r.canvas), width: r.canvas.width, height: r.canvas.height };
}
function contactSheet(name, cells, columns, cellWidth, cellHeight, title) {
  const header = 58, rows = Math.ceil(cells.length / columns);
  const cv = makeCanvas(columns * cellWidth, header + rows * cellHeight), c = cv.getContext('2d');
  c.fillStyle = '#0b151c'; c.fillRect(0, 0, cv.width, cv.height);
  c.font = '22px sans-serif'; c.textAlign = 'left'; c.fillStyle = '#e5ece7'; c.fillText(title, 20, 35);
  for (const [i, cell] of cells.entries()) {
    const x = i % columns * cellWidth, y = header + Math.floor(i / columns) * cellHeight;
    c.save(); c.beginPath(); c.rect(x, y, cellWidth, cellHeight); c.clip();
    c.fillStyle = '#20343e'; c.fillRect(x + 2, y + 2, cellWidth - 4, 40);
    c.font = '16px sans-serif'; c.fillStyle = '#dfebe6'; c.fillText(cell.title, x + 13, y + 26);
    c.drawImage(cell.canvas, x, y + 43, cellWidth, cellHeight - 45);
    c.restore();
  }
  const path = resolve(captures, name + '.png'), bytes = cv.toBuffer('image/png');
  writeFileSync(path, bytes);
  return { path: relative(repo, path), width: cv.width, height: cv.height, bytes: bytes.length, sha256: sha256(bytes), cells: cells.map(c => c.id), columns, rows };
}

const locomotionResults = [], locomotionCells = [];
const walkPhases = [
  { time: .05, pose: 'a', label: 'contact A' },
  { time: .18, pose: 'pass-a', label: 'passage A' },
  { time: .30, pose: 'b', label: 'contact B' },
  { time: .43, pose: 'pass-b', label: 'passage B' },
];
for (const mode of ['walking', 'rest', 'reduced-motion']) for (const facing of [1, -1]) for (const phase of mode === 'walking' ? walkPhases : [walkPhases[0], walkPhases[2]]) {
  const { time } = phase;
  const g = fixtureGame('s01');
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: 600, z: .55, facing, moving: mode !== 'rest', crouch: false, dodgeTime: 0 });
  const r = stage(g, { width: 450, height: 365, unit: 2.4 }); r.reduced = mode === 'reduced-motion';
  const id = `locomotion/${mode}/${facing}/${time}`;
  const result = await observe(g, r, id, () => r.human(g.p, time, 'decker'));
  const expected = mode === 'walking' ? 'characters/decker-walk-' + phase.pose : 'characters/decker';
  assert.ok(result.drawn.includes(expected), id + ': intended authored pose');
  assert.ok(!result.drawn.some(key => key.startsWith('weapons/')), id + ': no gun attached to unarmed walk');
  assert.equal(result.drawn.filter(key => key.startsWith('characters/')).length, 1, id + ': one body pose');
  locomotionResults.push({ id, mode, facing, time, moving: g.p.moving, reducedMotion: r.reduced, expected, ...result });
  const label = mode === 'walking' ? `Marche ${phase.label}` : mode === 'rest' ? 'Repos' : 'Mouvement réduit';
  locomotionCells.push({ id, title: `${label} · ${facing > 0 ? 'droite' : 'gauche'} · t=${time}`, canvas: r.canvas });
}
for (const mode of ['walking', 'rest', 'reduced-motion']) for (const facing of [1, -1]) {
  const pair = locomotionResults.filter(r => r.mode === mode && r.facing === facing);
  assert.equal(pair.length, mode === 'walking' ? 4 : 2);
  if (mode === 'walking') assert.equal(new Set(pair.map(item => item.pixelSha256)).size, 4, 'four walking key poses have distinct real pixels');
  else assert.equal(pair[0].pixelSha256, pair[1].pixelSha256, mode + ': no time-dependent pose alternation');
}
const locomotionCapture = contactSheet('locomotion', locomotionCells, 4, 450, 410,
  'Locomotion — rendu réel Canvas, poses isolées ; fixtures, pas parcours joué');
await flushDecodeFinalizers();

// Version 0.10.3: real pixels for the contextual medical cast and boss.
// These fixtures change only initial setup; every draw is guarded by the same
// serialized-save invariant as the fifty-room pass. Out-of-scene/armed guards
// prevent a portrait or a later room from inheriting the medical costume.
const continuationResults = [], continuationCells = [];
function changedBounds(before, after, width, height) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let p = 0; p < before.length; p += 4) {
    if (before[p] === after[p] && before[p + 1] === after[p + 1] && before[p + 2] === after[p + 2] && before[p + 3] === after[p + 3]) continue;
    const i = p / 4, x = i % width, y = Math.floor(i / width);
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1];
}
async function continuationCase(id, title, g, r, draw, expected, absent = [], extra = {}, capture = true) {
  const beforePixels = r.ctx.getImageData(0, 0, r.canvas.width, r.canvas.height).data;
  const result = { id, expected, absent, ...extra, ...await observe(g, r, id, draw) };
  for (const key of expected) assert.ok(result.drawn.includes(key), id + ': expected image ' + key);
  for (const key of absent) assert.ok(!result.drawn.includes(key), id + ': scoped image must be absent ' + key);
  result.changedBounds = changedBounds(beforePixels, r.ctx.getImageData(0, 0, r.canvas.width, r.canvas.height).data, r.canvas.width, r.canvas.height);
  continuationResults.push(result);
  if (capture) continuationCells.push({ id, title, canvas: r.canvas });
  return result;
}
for (const facing of [1, -1]) {
  const g = fixtureGame('s03');
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: 720, z: .55, facing, crouch: false, dodgeTime: 0, moving: true });
  const r = stage(g, { unit: 2.3 });
  await continuationCase('medical/decker/' + facing, 'Tenue médicale · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
    () => r.human(g.p, .3, 'decker'), ['characters/decker-medical-gown'], ['characters/decker-walk-b'], { room: 's03', facing, moving: true });
  const physician = { ...g.room.cast.find(a => a.id === 'medic'), facing };
  const doctorRenderer = stage(g, { unit: 2.3, focusX: physician.x, focusZ: g.zFor(physician) });
  await continuationCase('medical/physician/' + facing, 'Médecin du Carlyle · ' + (facing > 0 ? 'droite' : 'gauche'), g, doctorRenderer,
    () => doctorRenderer.human(physician, 0, 'medic'), ['characters/carlyle-physician'], ['characters/medic'], { room: 's03', facing });
}
for (const completed of [false, true]) {
  const g = fixtureGame('s03'), objective = g.room.interactables.find(o => o.id === 'o02-01');
  g.state.flags[objective.flag] = completed;
  Object.assign(g.p, { x: objective.x - 100, z: objective.z });
  const r = stage(g, { unit: 2, focusX: objective.x, focusZ: g.zFor(objective) });
  await continuationCase('medical/handheld/' + completed, 'Rapport ICC · ' + (completed ? 'transmis' : 'à transmettre'), g, r,
    () => r.object(objective), completed ? [] : ['objectives/icc-handheld'], completed ? ['objectives/icc-handheld'] : [],
    { room: 's03', completed, objectiveId: objective.id });
}
for (const room of ['s01', 's04']) {
  const g = fixtureGame(room);
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: 600, z: .55, moving: false, crouch: false, dodgeTime: 0 });
  const r = stage(g);
  await continuationCase('medical/scope/' + room, 'Tenue civile hors infirmerie', g, r,
    () => r.human(g.p, 0, 'decker'), ['characters/decker'], ['characters/decker-medical-gown'], { room }, false);
}
{
  const g = fixtureGame('s03'); equipForMedicalGuard(g);
  const r = stage(g);
  await continuationCase('medical/armed-guard', 'Garde de tenue armée', g, r, () => r.human(g.p, 0, 'decker'),
    ['weapons/pistol'], ['characters/decker-medical-gown'], { room: 's03', armedFixture: true }, false);
}
function equipForMedicalGuard(g) {
  g.state.inventory.pistol = true; g.state.flags.equipped = true;
  Object.assign(g.p, { weapon: 'pistol', x: 600, z: .55, lamp: false, moving: false, crouch: false, dodgeTime: 0 });
}
for (const facing of [1, -1]) {
  const g = fixtureGame('s33'), queen = g.rs.enemies.find(e => e.kind === 'queen');
  assert.ok(queen, 'authored boss exists in native s33 state'); queen.facing = facing;
  const r = stage(g, { width: 840, height: 620, unit: 1, focusX: queen.x, focusZ: g.zFor(queen), groundY: 558 });
  const result = await continuationCase('queen/' + facing, 'Reine · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
    () => r.alien(queen, 0), ['creatures/queen'], [], { room: 's33', facing, enemyId: queen.id, fixtureUnit: 1 });
  const bounds = result.changedBounds;
  assert.ok(bounds && bounds[0] > 8 && bounds[1] > 8 && bounds[2] < r.canvas.width - 8 && bounds[3] < r.canvas.height - 8,
    'queen fixture preserves the whole sprite within the diagnostic frame: ' + JSON.stringify(bounds));
}
const continuationCapture = contactSheet('medical-queen', continuationCells, 4, 600, 460,
  'Médecine et reine — nouveaux pixels ; fixtures explicites, pas parcours joué');
await flushDecodeFinalizers();

// Edition 0.10.4 adds state-specific sources. The fixtures below expose the
// stock/empty distinction without changing the original economy or operations.
const editionResults = [], editionCells = [];
async function editionCase(id, title, g, r, draw, expected = [], absent = [], extra = {}, capture = true) {
  const result = { id, expected, absent, ...extra, ...await observe(g, r, id, draw) };
  for (const key of expected) assert.ok(result.drawn.includes(key), id + ': expected actual source ' + key);
  for (const key of absent) assert.ok(!result.drawn.includes(key), id + ': source must remain absent ' + key);
  editionResults.push(result);
  if (capture) editionCells.push({ id, title, canvas: r.canvas });
  return result;
}
for (const mode of ['sealed', 'opening', 'stocked', 'empty', 'deposited']) {
  const g = fixtureGame('s17'), locker = g.room.lockers[0], state = g.rs.lockers[locker.id];
  state.opened = ['stocked', 'empty', 'deposited'].includes(mode);
  state.progress = mode === 'opening' ? locker.duration / 2 : state.opened ? locker.duration : 0;
  if (['empty', 'deposited'].includes(mode)) for (const key of Object.keys(state.contents)) state.contents[key] = 0;
  if (mode === 'deposited') state.contents.reserve = 1;
  Object.assign(g.p, { x: locker.x - 60, z: locker.z });
  const options = { width: 600, height: 450, unit: 1.8, focusX: locker.x, focusZ: locker.bodyZ, groundY: 400 };
  const r = stage(g, options);
  const expected = mode === 'sealed' ? ['equipment/locker'] : mode === 'opening' ? [] :
    mode === 'empty' ? ['equipment/locker-open'] : ['equipment/locker-stocked'];
  const result = await editionCase('stock/locker/' + mode, 'Armoire · ' + mode, g, r, () => r.locker(locker), expected,
    mode === 'opening' ? ['equipment/locker', 'equipment/locker-open', 'equipment/locker-stocked'] : [],
    { room: g.room.id, lockerId: locker.id, fixture: { opened: state.opened, progress: state.progress, contents: { ...state.contents } } });
  if (mode === 'opening') {
    const reference = stage(g, options);
    const original = await observe(g, reference, 'stock/locker/opening-native', () => originalLocker.call(reference, locker));
    assert.equal(result.pixelSha256, original.pixelSha256, 'intermediate locker opening retains exact native geometry');
    result.nativePixelsIdentical = true;
  }
}
for (const used of [false, true]) {
  const g = fixtureGame('s17'); g.rs.supplyUsed = used;
  const r = stage(g, { unit: 3, focusX: 320, focusZ: .55 });
  await editionCase('stock/supply/' + used, 'Ravitaillement · ' + (used ? 'épuisé' : 'disponible'), g, r,
    () => r.supply(), ['equipment/' + (used ? 'supply-empty' : 'supply')],
    ['equipment/' + (used ? 'supply' : 'supply-empty')], { room: g.room.id, supplyUsed: used });
}
for (const done of [false, true]) {
  const g = fixtureGame('s17'), device = g.room.devices.find(d => d.kind === 'parts');
  g.state.optional[device.id] = done; Object.assign(g.p, { x: device.x - 60, z: device.z });
  const r = stage(g, { unit: 2.6, focusX: device.x, focusZ: device.z });
  await editionCase('stock/parts/' + done, 'Renforts · ' + (done ? 'retirés' : 'disponibles'), g, r,
    () => r.device(device, 0), ['devices/' + (done ? 'parts-empty' : 'parts')],
    ['devices/' + (done ? 'parts' : 'parts-empty')], { room: g.room.id, deviceId: device.id, completed: done });
}
for (const claimed of [false, true]) {
  const g = fixtureGame('s09'), rack = g.room.armoryRack;
  g.state.armory.claimed = claimed; Object.assign(g.p, { x: rack.x - 60, z: rack.z });
  const options = { height: 430, groundY: 376, unit: 1.9, focusX: rack.x, focusZ: rack.bodyZ }, r = stage(g, options);
  const result = await editionCase('stock/armory/' + claimed, 'Râtelier · ' + (claimed ? 'allocation retirée' : 'allocation disponible'), g, r,
    () => r.armoryRack(rack), claimed ? ['equipment/armory-rack'] : [], claimed ? [] : ['equipment/armory-rack'], { room: g.room.id, claimed });
  if (!claimed) {
    const reference = stage(g, options);
    originalArmoryRack.call(reference, rack);
    assert.equal(result.pixelSha256, pixelsHash(reference.canvas), 'available armory retains native weapon allocation rendering');
    result.nativePixelsIdentical = true;
  }
}
for (const facing of [1, -1]) {
  const g = fixtureGame('s03'), objective = g.room.interactables.find(o => o.id === 'o02-01');
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: objective.x - 85 * facing, z: objective.z, facing, moving: false, crouch: false, dodgeTime: 0 });
  g.activeWork = { id: objective.id, label: objective.label, progress: .5 };
  const r = stage(g, { unit: 2.35, focusX: objective.x, focusZ: g.zFor(objective) });
  await editionCase('action/medical-report/' + facing, 'Rapport ICC tenu · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
    () => { r.object(objective); r.human(g.p, .18, 'decker'); }, ['characters/decker-medical-report'],
    ['objectives/icc-handheld', 'characters/decker-medical-gown'],
    { room: g.room.id, facing, objectiveId: objective.id, activeWork: { ...g.activeWork }, preparedOperationProgress: true });
}
await flushDecodeFinalizers();
for (const mode of ['focus', 'moving', 'crouch', 'dodge', 'other-operation', 'armed', 'medical']) for (const facing of mode === 'focus' ? [1, -1] : [1]) {
  const g = fixtureGame(mode === 'medical' ? 's03' : 's01');
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: 600, z: .55, facing, moving: mode === 'moving', crouch: mode === 'crouch', dodgeTime: mode === 'dodge' ? .2 : 0 });
  if (mode === 'armed') equip(g);
  if (mode === 'other-operation') g.activeWork = { id: 'diagnostic-existing-work', label: 'Opération préparée', progress: .5 };
  const r = stage(g, { unit: 2.4 }); r.focus = true;
  await editionCase('action/focus/' + mode + '/' + facing, 'Écoute · ' + mode + ' · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
    () => r.human(g.p, .18, 'decker'), mode === 'focus' ? ['characters/decker-focus'] : [],
    mode === 'focus' ? [] : ['characters/decker-focus'],
    { room: g.room.id, facing, presentationFocus: true, mode }, mode === 'focus');
}
for (const roomId of ['s03', 's45']) {
  const g = fixtureGame(roomId), r = stage(g, { width: 600, height: 500, groundY: 445 });
  await editionCase('scenery/medical/' + roomId, 'Dossier et gobelets · ' + roomId, g, r, () => {
    r.ctx.save(); r.ctx.translate(300, 445); r.ctx.scale(2.2, 2.2); r.decor('medical', 0); r.ctx.restore();
  }, roomId === 's03' ? ['decor/medical', 'decor/medical-chart', 'decor/medical-cups'] : ['decor/medical'],
  roomId === 's03' ? [] : ['decor/medical-chart', 'decor/medical-cups'],
  { room: roomId, fixture: 'existing medical scenery rendered at magnification 2.2' }, roomId === 's03');
}
await flushDecodeFinalizers();
const planetStates = [];
for (const strike of [false, true]) {
  const g = fixtureGame('s39'), r = stage(g, { width: 600, height: 440, groundY: 390 });
  g.state.flags.strike_seen = strike;
  const result = await editionCase('scenery/planet/' + strike, 'LV-178 · ' + (strike ? 'signal de frappe' : 'orbite'), g, r, () => {
    r.ctx.save(); r.ctx.translate(300, 390); r.ctx.scale(1.25, 1.25); r.decor('viewport', 0); r.ctx.restore();
  }, ['decor/viewport', 'planets/lv178-orbital'], [], { room: g.room.id, strikeSeen: strike, interpretivePlanet: true });
  planetStates.push(result);
}
assert.notEqual(planetStates[0].pixelSha256, planetStates[1].pixelSha256, 'native strike state retains a visible cue over the new globe');
{
  const g = fixtureGame('s07'), r = stage(g, { width: 600, height: 440, groundY: 390 });
  await editionCase('scenery/planet/out-of-scope', 'Autre hublot · planète absente', g, r, () => {
    r.ctx.save(); r.ctx.translate(300, 390); r.ctx.scale(1.25, 1.25); r.decor('viewport', 0); r.ctx.restore();
  }, ['decor/viewport'], ['planets/lv178-orbital'], { room: g.room.id, deliberatelySelectedSceneryKind: 'viewport' }, false);
}
for (const kind of ['sand', 'silica']) for (const highContrast of [false, true]) {
  const room = context.SoSData.rooms.find(r => r.kind === kind), g = fixtureGame(room.id);
  const options = { width: 600, height: 380, unit: 1.1, focusX: Math.min(room.width / 2, 800) };
  const r = stage(g, options), reference = stage(g, options); r.highContrast = reference.highContrast = highContrast;
  const result = await editionCase('terrain/' + kind + '/' + highContrast, 'Sol ' + kind + ' · ' + (highContrast ? 'contraste élevé' : 'normal'), g, r,
    () => r.floor(0), ['terrain/' + kind], ['terrain/' + (kind === 'sand' ? 'silica' : 'sand')], { room: g.room.id, kind, highContrast });
  originalFloor.call(reference, 0);
  const beforePixels = reference.ctx.getImageData(0, 0, 600, 380).data, afterPixels = r.ctx.getImageData(0, 0, 600, 380).data;
  const bounds = changedBounds(beforePixels, afterPixels, 600, 380);
  assert.ok(bounds && bounds[1] >= Math.floor(380 * .605), 'terrain overlay changes only the clipped ground band');
  result.changedBoundsAgainstNative = bounds; result.upperScenePixelsUnchanged = true;
}
{
  const g = fixtureGame('s03'), r = stage(g), reference = stage(g);
  const result = await editionCase('terrain/out-of-scope', 'Sol médical natif', g, r, () => r.floor(0), [], ['terrain/sand', 'terrain/silica'], { room: g.room.id }, false);
  originalFloor.call(reference, 0);
  assert.equal(result.pixelSha256, pixelsHash(reference.canvas), 'other terrain family retains exact native floor');
  result.nativePixelsIdentical = true;
}
await flushDecodeFinalizers();

const detailResults = [], detailCells = [];
async function addDetail(id, kind, title, g, r, draw, extra = {}, capture = true) {
  const result = { id, kind, ...extra, ...await observe(g, r, id, draw) };
  detailResults.push(result);
  if (capture) detailCells.push({ id, title, canvas: r.canvas });
  return result;
}
function equip(g, weapon = 'pistol') {
  g.state.flags.equipped = true;
  g.state.inventory.pistol = true; g.state.inventory.flame = true; g.state.inventory.foam = true;
  g.state.armory.claimed = true; g.state.armory.pulseAmmo = 30;
  Object.assign(g.p, { weapon, ammo: 12, fuel: 110, foam: 14, reload: 0, crouch: false, dodgeTime: 0, moving: false });
  g.cooldowns.fire = 0;
}
function clearRay(g, target = null) {
  if (target) {
    for (const sign of [-1, 1]) for (const distance of [220, 160, 300]) {
      const from = { x: target.x + sign * distance, z: target.z };
      if (from.x > 45 && from.x < g.room.width - 45 && !g.blocked(from.x, from.z) && g.visible(from, target)) return { from, to: { x: target.x, z: target.z } };
    }
  } else {
    for (const z of [g.mode === 'SIDE' ? .55 : .35, .55, .7]) for (let x = 120; x < g.room.width - 360; x += 60) {
      const from = { x, z }, to = { x: x + 220, z };
      if (!g.blocked(from.x, from.z) && !g.blocked(to.x, to.z) && g.visible(from, to)) return { from, to };
    }
  }
  throw new Error(g.room.id + ': no native clear firing ray for fixture');
}

// These effects are generated by original Game actions, then admitted through
// the untouched addEffect method. Acid/foam use the resulting room/enemy state.
for (const effect of ['muzzle', 'flame', 'impact', 'spark', 'acid', 'foam']) {
  const g = fixtureGame(effect === 'spark' ? 's33' : ['impact', 'acid', 'foam'].includes(effect) ? 's19' : 's01');
  equip(g, ['flame', 'spark'].includes(effect) ? 'flame' : effect === 'foam' ? 'foam' : 'pistol');
  let enemy = ['impact', 'acid', 'foam'].includes(effect) ? g.rs.enemies.find(e => e.kind === 'adult') : null;
  const weakpoint = effect === 'spark' ? g.rs.weakpoints[0] : null;
  assert.ok(!['impact', 'acid', 'foam'].includes(effect) || enemy, 'authored adult enemy fixture');
  const ray = clearRay(g, weakpoint);
  Object.assign(g.p, ray.from); g.p.facing = ray.to.x >= ray.from.x ? 1 : -1;
  if (enemy) Object.assign(enemy, { ...ray.to, homeX: ray.to.x, homeZ: ray.to.z, facing: -g.p.facing });
  g.drainEvents();
  if (effect === 'acid') g.hurtEnemy(enemy, enemy.hp);
  else assert.equal(g.shoot(ray.to), true, effect + ': native shot accepted');
  const events = g.drainEvents();
  if (effect === 'impact') assert.ok(events.some(e => e.type === 'hit'));
  if (effect === 'spark') assert.ok(events.some(e => e.type === 'spark'));
  if (effect === 'acid') assert.ok(g.rs.acid.some(a => a.time > 0));
  if (effect === 'foam') assert.ok(enemy.foam > .1);
  const r = stage(g, { unit: effect === 'spark' ? 1.45 : 1.8, focusX: (ray.from.x + ray.to.x) / 2, focusZ: ray.from.z });
  if (effect !== 'acid') for (const event of events) r.addEffect(event);
  const result = await addDetail(`effects/${effect}`, 'effect', `Effet ${effect} · action/état du moteur`, g, r, () => {
    if (effect === 'acid') { r.tacticalGround(0); r.corpse(g.rs.corpses.at(-1)); }
    else {
      r.human(g.p, 0, 'decker');
      if (enemy) r.alien(enemy, 0);
      if (weakpoint) r.weakpoint(weakpoint);
      r.drawEffects(.035);
    }
  }, { effect, room: g.room.id, nativeAction: effect === 'acid' ? 'hurtEnemy(existingAdult, hp)' : 'shoot(clearTarget)', eventTypes: events.map(e => e.type), fixture: { player: { ...ray.from }, target: { ...ray.to }, weapon: g.p.weapon, enemy: enemy?.id || null, foam: enemy?.foam || 0, acid: g.rs.acid.map(a => ({ ...a })) } });
  assert.ok(result.drawn.includes('effects/' + effect), effect + ': expected actual PNG drawn');
  const prior = drawnStatus();
  if (effect === 'acid') {
    g.rs.acid.forEach(a => { a.time = 0; });
    const guard = stage(g), inactive = await observe(g, guard, effect + '/inactive', () => guard.tacticalGround(0));
    assert.ok(!inactive.drawn.includes('effects/acid')); result.inactiveStateDrawsPng = false;
  } else if (effect === 'foam') {
    enemy.foam = 0;
    const guard = stage(g), inactive = await observe(g, guard, effect + '/inactive', () => guard.alien(enemy, 0));
    assert.ok(!inactive.drawn.includes('effects/foam')); result.inactiveStateDrawsPng = false;
  }
  await observe(g, r, effect + '/expired-events', () => r.drawEffects(1));
  assert.equal(r.effects.length, 0, effect + ': native event lifetimes expire');
  assert.ok(!drawnSince(prior).some(key => key.startsWith('effects/')), effect + ': no retained PNG effect after expiry');
  result.eventQueueExpired = true;
}
await flushDecodeFinalizers();

const lampResults = [];
for (const facing of [1, -1]) for (const on of [false, true]) {
  const g = fixtureGame('s14'); equip(g);
  Object.assign(g.p, { x: 700, z: .55, facing, lamp: on });
  const r = stage(g, { unit: 2.3 });
  const result = await addDetail(`lamp/${facing}/${on ? 'on' : 'off'}`, 'lamp', `Lampe ${on ? 'allumée' : 'éteinte'} · ${facing > 0 ? 'droite' : 'gauche'}`, g, r, () => r.human(g.p, 0, 'decker'), { facing, on });
  assert.ok(result.drawn.includes('equipment/lamp'), 'physical lamp remains mounted when switched off');
  lampResults.push(result);
}
for (const facing of [1, -1]) {
  const pair = lampResults.filter(r => r.facing === facing);
  assert.notEqual(pair[0].pixelSha256, pair[1].pixelSha256, 'lamp switch changes real beam pixels');
}

const lightResults = [];
for (const on of [false, true]) {
  const g = fixtureGame('s13'), l = g.room.lighting;
  g.rs.lighting.on = on; Object.assign(g.p, { x: l.x - 65, z: l.z });
  const r = stage(g, { unit: 2.45, focusX: l.x, focusZ: g.zFor(l) });
  const result = await addDetail(`lighting/${on ? 'on' : 'off'}`, 'light-panel', `Commande éclairage · ${on ? 'actif' : 'coupé'}`, g, r, () => r.lightPanel(l, 0), { on, room: g.room.id, control: l.id });
  assert.ok(result.drawn.includes('equipment/light-panel')); lightResults.push(result);
}
assert.notEqual(lightResults[0].pixelSha256, lightResults[1].pixelSha256, 'lighting state changes the real indicator');

const shutterResults = [];
for (const status of ['open', 'closed', 'broken']) {
  const g = fixtureGame('s13'), s = g.room.shutters[0];
  Object.assign(g.rs.shutters[s.id], { status, integrity: status === 'broken' ? 0 : 100, progress: 0 });
  Object.assign(g.p, { x: s.x - 80, z: .55 });
  const r = stage(g, { unit: 1.2, focusX: s.x, focusZ: .55 });
  const priorUses = drawnStatus()['equipment/shutter-control'] || 0;
  const result = await addDetail(`shutter/${status}`, 'shutter', `Cloison · ${status} · deux commandes réelles`, g, r, () => r.shutter(s, 0), { status, room: g.room.id, shutter: s.id, controls: g.shutterControls(s).map(n => ({ id: n.id, x: n.x, z: n.z })) });
  assert.ok(result.drawn.includes('equipment/shutter-control'));
  assert.equal(drawnStatus()['equipment/shutter-control'] - priorUses, 2, 'both authored shutter controls drawn');
  shutterResults.push(result);
}
assert.equal(new Set(shutterResults.map(r => r.pixelSha256)).size, 3, 'open/closed/broken mechanisms have distinct pixels');

function doorFixture(roomId, id, open) {
  const g = fixtureGame(roomId), door = g.room.doors.find(d => d.id === id);
  Object.assign(g.p, { x: door.x - 45, z: door.z });
  Object.assign(g.state.companion, { x: door.x - 20, z: door.z });
  if (door.gate) g.state.flags[door.gate] = open;
  if (!open && !door.gate) {
    g.state.flags.equipped = true;
    g.state.companion.x = door.x < g.room.width / 2 ? g.room.width - 60 : 60;
  }
  assert.equal(g.doorStatus(door).open, open, `${roomId}/${id}: native door status`);
  const options = { unit: 1.45, focusX: door.x, focusZ: door.portal?.apertureZ ?? g.zFor(door) };
  return { g, door, options };
}
const compatible = [], nativeCases = new Map(), liftCases = [], frontalCases = [];
for (const room of context.SoSData.rooms) for (const door of room.doors) {
  const type = door.portal?.type || 'bulkhead', mount = door.portal?.mount || 'back';
  if (type === 'lift-cage') liftCases.push({ room: room.id, id: door.id, mount });
  else if (['rock-breach', 'boarding-ramp'].includes(type) && ['front', 'back'].includes(mount)) {
    frontalCases.push({ room: room.id, id: door.id, type, mount });
  }
  else if (type === 'bulkhead' && ['front', 'back'].includes(mount)) {
    if (!compatible.some(c => c.mount === mount)) compatible.push({ room: room.id, id: door.id, mount });
  } else if (!nativeCases.has(type + '/' + mount)) nativeCases.set(type + '/' + mount, { room: room.id, id: door.id, type, mount });
}
assert.equal(compatible.length, 2);
for (const item of compatible) for (const open of [true, false]) {
  const { g, door, options } = doorFixture(item.room, item.id, open), r = stage(g, options);
  const result = await addDetail(`door/${item.mount}/${open ? 'open' : 'closed'}`, 'bulkhead', `Porte ${item.mount === 'front' ? 'avant' : 'fond'} · ${open ? 'ouverte' : 'fermée'}`, g, r, () => r.door(door), { room: item.room, door: item.id, mount: item.mount, open, nativeStatus: { ...g.doorStatus(door) } });
  assert.ok(result.drawn.includes('doors/bulkhead-frame'));
  assert.equal(result.drawn.includes('doors/bulkhead-panel'), !open, 'leaf drawn only for native closed state');
}
assert.equal(liftCases.length, 2, 'the native campaign has exactly two mine cage thresholds');
for (const item of liftCases) for (const open of [true, false]) {
  const { g, door, options } = doorFixture(item.room, item.id, open), r = stage(g, options);
  await editionCase(`door/lift/${item.room}/${open ? 'open' : 'closed'}`, 'Cage ' + item.mount + ' · ' + (open ? 'disponible' : 'fermée'), g, r,
    () => r.door(door), ['doors/lift-cage'], [],
    { room: item.room, doorId: item.id, mount: item.mount, open, nativeStatus: { ...g.doorStatus(door) }, fixture: 'authored left/right threshold; enclosing native wall and floor retained' });
}
for (const item of liftCases) {
  const pair = editionResults.filter(r => r.doorId === item.id && r.id.startsWith('door/lift/'));
  assert.equal(pair.length, 2);
  assert.notEqual(pair[0].pixelSha256, pair[1].pixelSha256, item.id + ': gate state produces visibly distinct pixels');
}
const capturedNativeTypes = new Set(['bulkhead/left', 'rock-breach/left', 'stairwell/back', 'boarding/right']);
for (const [key, item] of nativeCases) {
  const { g, door, options } = doorFixture(item.room, item.id, true), r = stage(g, options), reference = stage(g, options);
  const nativeResult = await observe(g, reference, 'native-door/' + key, () => originalDoor.call(reference, door));
  const result = await addDetail('native-door/' + key, 'native-door-fallback', `Géométrie native · ${item.type} / ${item.mount}`, g, r, () => r.door(door), { room: item.room, door: item.id, type: item.type, mount: item.mount, open: true, comparison: 'pixel-by-pixel with original door method' }, capturedNativeTypes.has(key));
  assert.ok(!result.drawn.some(key => key.startsWith('doors/')), key + ': incompatible geometry retains native presentation');
  assert.equal(result.pixelSha256, nativeResult.pixelSha256, key + ': native fallback real pixels unchanged');
  result.nativePixelsIdentical = true;
}
const detailsCapture = contactSheet('details', detailCells, 4, 600, 425,
  'Détails — rendu réel Canvas ; événements et états natifs, fixtures isolées');
await flushDecodeFinalizers();
const editionCapture = contactSheet('states-and-world', editionCells, 4, 600, 465,
  'Édition 0.10.4 — états, actions, mine et monde ; fixtures explicites');

// Edition 0.10.5 follows real actor identities, native power/completion/HP
// states and the existing frontal thresholds. It does not synthesize gameplay.
const extensionResults = [], armedCells = [], extensionCells = [];
async function extensionCase(id, group, title, g, r, draw, expected = [], absent = [], extra = {}, capture = true) {
  const result = { id, group, expected, absent, ...extra, ...await observe(g, r, id, draw) };
  for (const key of expected) assert.ok(result.drawn.includes(key), id + ': expected actual source ' + key);
  for (const key of absent) assert.ok(!result.drawn.includes(key), id + ': source must remain absent ' + key);
  extensionResults.push(result);
  if (capture) (group === 'armed-gait' ? armedCells : extensionCells).push({ id, title, canvas: r.canvas });
  return result;
}
const armedGaitIds = [
  'characters/decker-walk-a-ready', 'characters/decker-walk-b-ready',
  'characters/manning-walk-a-ready', 'characters/manning-walk-pass-a-ready',
  'characters/manning-walk-b-ready', 'characters/manning-walk-pass-b-ready',
];
for (const role of ['decker', 'manning']) for (const facing of [1, -1]) {
  const phases = role === 'decker' ? [walkPhases[0], walkPhases[2]] : walkPhases;
  const phaseResults = [];
  for (const phase of phases) {
    const g = fixtureGame('s14'); equip(g);
    const actor = role === 'decker' ? g.p : g.state.companion;
    Object.assign(actor, { x: 700, z: .55, facing, moving: true });
    const r = stage(g, { width: 450, height: 365, unit: 2.4, focusX: actor.x, focusZ: actor.z });
    const expected = 'characters/' + role + '-walk-' + phase.pose + '-ready';
    const result = await extensionCase('armed-gait/' + role + '/' + facing + '/' + phase.pose, 'armed-gait',
      role + ' · ' + phase.label + ' · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
      () => r.human(actor, phase.time, role), [expected, 'weapons/pistol'], [],
      { role, facing, time: phase.time, pose: phase.pose, actualActor: true, moving: true });
    assert.equal(result.drawn.filter(key => key.startsWith('characters/')).length, 1, 'one authored body per moving actor');
    assert.ok(r._pngMuzzles?.[role], 'held pistol retains a real emission anchor for ' + role);
    phaseResults.push(result);
  }
  assert.equal(new Set(phaseResults.map(r => r.pixelSha256)).size, phases.length, role + ': walking phases have distinct real pixels');
}
for (const role of ['decker', 'manning']) for (const mode of ['rest', 'reduced-motion']) {
  const pair = [];
  for (const time of [.05, .30]) {
    const g = fixtureGame('s14'); equip(g);
    const actor = role === 'decker' ? g.p : g.state.companion;
    Object.assign(actor, { x: 700, z: .55, facing: 1, moving: mode !== 'rest' });
    const r = stage(g, { width: 450, height: 365, unit: 2.4, focusX: actor.x, focusZ: actor.z });
    r.reduced = mode === 'reduced-motion';
    pair.push(await extensionCase('armed-guard/' + role + '/' + mode + '/' + time, 'armed-gait', role + ' · ' + mode,
      g, r, () => r.human(actor, time, role), ['characters/' + role + '-ready', 'weapons/pistol'], armedGaitIds,
      { role, mode, time, moving: actor.moving, reducedMotion: r.reduced }, time === .05));
  }
  assert.equal(pair[0].pixelSha256, pair[1].pixelSha256, role + ': rest/reduced-motion retain time-stable pixels');
}
for (const role of ['decker', 'manning']) for (const mode of ['portrait', 'actor-copy', 'unequipped']) {
  const g = fixtureGame('s14'); equip(g);
  let actor = role === 'decker' ? g.p : g.state.companion;
  Object.assign(actor, { x: 700, z: .55, facing: 1, moving: true });
  if (mode === 'actor-copy') actor = { ...actor };
  if (mode === 'unequipped') { g.state.flags.equipped = false; g.state.inventory.pistol = false; }
  const r = stage(g, { focusX: actor.x, focusZ: actor.z });
  if (mode === 'portrait') r.canvas.classList = { contains: name => name === 'castPortrait' };
  await extensionCase('armed-guard/' + role + '/' + mode, 'armed-gait', role + ' · ' + mode, g, r,
    () => r.human(actor, .18, role), [], armedGaitIds, { role, mode, actualActor: mode !== 'actor-copy' }, false);
}
for (const mode of ['pulse', 'foam', 'flame', 'reload', 'operation', 'crouch', 'dodge']) {
  const g = fixtureGame('s14'); equip(g, ['pulse', 'foam', 'flame'].includes(mode) ? mode : 'pistol');
  Object.assign(g.p, { x: 700, z: .55, moving: true, reload: mode === 'reload' ? .5 : 0,
    crouch: mode === 'crouch', dodgeTime: mode === 'dodge' ? .2 : 0 });
  if (mode === 'operation') g.activeWork = { id: 'diagnostic-existing-operation', progress: .5 };
  const r = stage(g);
  await extensionCase('armed-guard/decker/' + mode, 'armed-gait', 'Decker · ' + mode, g, r,
    () => r.human(g.p, .18, 'decker'), [], armedGaitIds, { mode, weapon: g.p.weapon }, false);
}
for (const mode of ['player-reloading', 'player-working', 'chapter-17']) {
  const g = fixtureGame('s14'); equip(g);
  const actor = g.state.companion; Object.assign(actor, { x: 700, z: .55, moving: true, facing: 1 });
  if (mode === 'player-reloading') g.p.reload = .5;
  if (mode === 'player-working') g.activeWork = { id: 'diagnostic-existing-operation', progress: .5 };
  if (mode === 'chapter-17') g.state.objectiveIndex = objectives.indexOf(context.SoSData.chapters.find(c => c.number === 17).objectives[0]);
  const r = stage(g, { focusX: actor.x, focusZ: actor.z }), expected = 'characters/manning-walk-pass-a-ready';
  await extensionCase('armed-guard/manning/' + mode, 'armed-gait', 'Manning · ' + mode, g, r,
    () => r.human(actor, .18, 'manning'), mode === 'chapter-17' ? [] : [expected, 'weapons/pistol'],
    mode === 'chapter-17' ? armedGaitIds : [], { mode, chapter: g.chapter.number, actualCompanion: true }, false);
}
const armedGaitsCapture = contactSheet('armed-gaits', armedCells, 4, 450, 410,
  'Édition 0.10.5 — marches armées, arrêts et mouvement réduit ; fixtures explicites');
await flushDecodeFinalizers();

const deviceDefs = context.SoSData.rooms.flatMap(room => room.devices.filter(d => d.kind !== 'parts').map(d => ({ room: room.id, device: d })));
assert.equal(deviceDefs.filter(d => d.device.kind === 'isolation').length, 4);
assert.equal(deviceDefs.filter(d => d.device.kind !== 'isolation').length, 7);
for (const def of deviceDefs) {
  const pair = [];
  for (const completed of [false, true]) {
    const g = fixtureGame(def.room), device = g.room.devices.find(d => d.id === def.device.id), isolation = device.kind === 'isolation';
    Object.assign(g.p, { x: device.x - 60, z: device.z });
    if (completed && device.kind !== 'embark') {
      g.rs.work[device.id] = device.duration;
      assert.equal(g.finishDevice({ ...device, action: 'device' }), true, device.id + ': native completion accepts prepared work');
    } else if (completed) {
      // Embark has convoy preconditions outside this isolated rendering test.
      g.rs.devices[device.id] = true; g.state.optional[device.id] = true;
    }
    const r = stage(g, { height: 440, groundY: 390, unit: isolation ? 2.3 : 3.2, focusX: device.x, focusZ: device.z });
    const labels = [], text = r.text.bind(r); r.text = (...args) => { labels.push(args[0]); return text(...args); };
    const source = 'devices/' + (isolation ? 'isolation' : 'console'), expected = source + (completed ? isolation ? '-closed' : '-complete' : '');
    const result = await extensionCase('device-state/' + device.id + '/' + completed, 'device-state',
      (isolation ? 'Vanne' : 'Console') + ' · ' + (completed ? isolation ? 'consignée' : 'terminée' : 'active'), g, r,
      () => r.device(device, 0), [expected], [completed ? source : source + (isolation ? '-closed' : '-complete')],
      { room: g.room.id, deviceId: device.id, deviceKind: device.kind, completed,
        completionSetup: !completed ? 'initial native state' : device.kind === 'embark' ? 'explicit completed-state fixture' : 'native finishDevice after prepared work' },
      ['isolate-hull', 'device-filters'].includes(device.id));
    assert.ok(labels.includes(completed ? isolation ? 'CONSIGNÉ' : 'TERMINÉ' : 'MAINTENIR E'), device.id + ': native interaction label retained');
    if (completed && isolation) {
      const hazards = g.room.hazards.filter(h => h.disableDevice === device.id);
      assert.ok(hazards.length > 0, device.id + ': authored isolation controls a hazard');
      assert.ok(hazards.every(h => g.hazardStatus(h).phase === 'stopped'), 'completion retains native hazard isolation');
      result.nativeHazardsStopped = hazards.map(h => h.id);
    }
    pair.push(result);
  }
  assert.notEqual(pair[0].pixelSha256, pair[1].pixelSha256, def.device.id + ': completion is visible in actual pixels');
}
for (const mode of ['active', 'pulse', 'manual-off', 'depleted']) {
  const g = fixtureGame('s14'); equip(g);
  let place = null;
  for (let x = 120; x < g.room.width - 120; x += 80) {
    Object.assign(g.p, { x, z: .55 });
    const candidate = g.sensorPlacement(); if (candidate.ok && candidate.unit) { place = candidate; break; }
  }
  assert.ok(place, 'authored room has a native valid sensor placement');
  assert.equal(g.sensorAction(), true, 'native sensor deployment');
  const sensor = g.state.sensors.find(b => b.room === g.room.id);
  if (mode === 'manual-off') assert.equal(g.toggleSensor(sensor.id), true, 'native remote shutdown');
  if (mode === 'depleted') g.stepSensors(sensor.charge);
  if (mode === 'pulse') { sensor.lastPulse = g.state.stats.time; sensor.count = 1; }
  const active = sensor.powered && sensor.charge > 0;
  const r = stage(g, { unit: 5.5, height: 480, groundY: 400, focusX: sensor.x, focusZ: sensor.z });
  const circles = [], ellipse = r.ellipse.bind(r);
  r.ellipse = (...args) => { circles.push(args); return ellipse(...args); };
  const result = await extensionCase('sensor-state/' + mode, 'sensor-state', 'Capteur · ' + mode, g, r,
    () => r.sensor(sensor, .25), ['equipment/' + (active ? 'sensor' : 'sensor-off')],
    ['equipment/' + (active ? 'sensor-off' : 'sensor')],
    { room: g.room.id, mode, powered: sensor.powered, charge: sensor.charge,
      nativeActions: ['sensorAction', ...(mode === 'manual-off' ? ['toggleSensor'] : mode === 'depleted' ? ['stepSensors'] : [])] });
  // [924,571] is the independently inspected glass-lens center in both PNG
  // sources. The old native offset put a large status disk beside a tripod leg.
  const indicator = circles.findLast(a => ['#efd28a', '#8bc9b3', '#665e4e'].includes(a[4]));
  const source = context.SoSArtPack.assets.equipment[active ? 'sensor' : 'sensor-off'];
  const anchor = r.pos(sensor.x, sensor.z), sourceScale = source.worldHeight / source.crop[3] * r.unit;
  assert.ok(indicator && Math.abs(indicator[0] - anchor.x - (924 - source.pivot[0]) * sourceScale) < .001 &&
    Math.abs(indicator[1] - anchor.y - (571 - source.pivot[1]) * sourceScale) < .001, 'sensor indicator is registered to the inspected physical lens');
  assert.ok(indicator[2] > 0 && indicator[2] <= r.unit && indicator[3] <= r.unit, 'sensor indicator fits the physical lens instead of floating below the body');
  result.statusIndicatorSourcePixel = [924, 571]; result.statusIndicatorRegisteredToLens = true;
  if (mode === 'manual-off') {
    const charge = sensor.charge; g.cooldowns.sensor = 0;
    assert.equal(g.sensorAction(), true, 'native recovery remains possible while sensor is off');
    assert.equal(sensor.room, null); assert.equal(sensor.charge, charge, 'recovery does not recharge the sensor');
    const rr = stage(g);
    await extensionCase('sensor-state/recovered', 'sensor-state', 'Capteur récupéré', g, rr,
      () => rr.draw(0, 0), [], ['equipment/sensor', 'equipment/sensor-off'],
      { room: g.room.id, nativeAction: 'sensorAction recovery', charge }, false);
  }
}
for (const index of [0, 1, 2]) {
  const g = fixtureGame('s33'); equip(g, 'flame');
  const weakpoint = g.rs.weakpoints[index], ray = clearRay(g, weakpoint); Object.assign(g.p, ray.from);
  const options = { height: 450, groundY: 405, unit: 2.2, focusX: weakpoint.x, focusZ: weakpoint.z };
  const r = stage(g, options);
  await extensionCase('weakpoint/' + index + '/alive', 'weakpoint-state', 'Attache · active', g, r,
    () => r.weakpoint(weakpoint), ['equipment/weakpoint'], ['equipment/weakpoint-destroyed'],
    { room: g.room.id, index, hp: weakpoint.hp }, index === 0);
  for (let shot = 0; weakpoint.hp > 0 && shot < 3; shot++) {
    g.cooldowns.fire = 0; assert.equal(g.shoot(ray.to), true, 'native flame shot reaches an existing attachment');
  }
  assert.equal(weakpoint.hp, 0, 'native flame damage destroys the existing attachment');
  const after = stage(g, options);
  await extensionCase('weakpoint/' + index + '/destroyed', 'weakpoint-state', 'Attache · détruite', g, after,
    () => after.weakpoint(weakpoint), ['equipment/weakpoint-destroyed'], ['equipment/weakpoint'],
    { room: g.room.id, index, hp: weakpoint.hp, nativeAction: 'shoot existing weakpoint with flame' }, index === 0);
}
await flushDecodeFinalizers();

assert.equal(frontalCases.filter(d => d.type === 'rock-breach').length, 9, 'exact existing frontal/back rock thresholds');
assert.equal(frontalCases.filter(d => d.type === 'boarding-ramp').length, 2, 'exact existing shuttle boarding ramps');
const capturedFrontalTypes = new Set();
for (const item of frontalCases) {
  const pair = [], captureKey = item.type + '/' + item.mount;
  const capture = !capturedFrontalTypes.has(captureKey); capturedFrontalTypes.add(captureKey);
  for (const open of [true, false]) {
    const { g, door, options } = doorFixture(item.room, item.id, open), r = stage(g, options), reference = stage(g, options);
    const labels = [], nativeLabels = [], text = r.text.bind(r), nativeText = reference.text.bind(reference);
    const paintOrder = [], drawImage = r.ctx.drawImage.bind(r.ctx), ellipse = r.ellipse.bind(r);
    r.ctx.drawImage = (...args) => { paintOrder.push('png'); return drawImage(...args); };
    r.ellipse = (...args) => { paintOrder.push({ ellipse: args }); return ellipse(...args); };
    r.text = (...args) => { labels.push(args); return text(...args); };
    reference.text = (...args) => { nativeLabels.push(args); return nativeText(...args); };
    await observe(g, reference, 'frontal-native/' + item.id + '/' + open, () => originalDoor.call(reference, door));
    const result = await extensionCase('frontal-portal/' + item.id + '/' + open, 'frontal-portal',
      (item.type === 'rock-breach' ? 'Brèche' : 'Rampe') + ' · ' + item.mount + ' · ' + (open ? 'ouverte' : 'fermée'),
      g, r, () => r.door(door), ['doors/' + item.type], [],
      { room: item.room, doorId: item.id, type: item.type, mount: item.mount, open, nativeStatus: { ...g.doorStatus(door) } }, capture);
    assert.deepEqual(labels, nativeLabels, item.id + ': native labels, positions and colors retained');
    result.nativeLabelCommandsIdentical = true;
    const q = r.pos(door.x, door.portal?.apertureZ ?? g.zFor(door)), u = r.unit;
    const nativePixels = reference.ctx.getImageData(0, 0, r.W, r.H).data, actualPixels = r.ctx.getImageData(0, 0, r.W, r.H).data;
    let protectedPixels = 0;
    for (let y = 0; y < r.H; y++) for (let x = 0; x < r.W; x++) {
      if (Math.abs(x - q.x) < 155 * u || y > q.y + 6 * u) continue;
      const p = (y * r.W + x) * 4;
      assert.ok(nativePixels[p] === actualPixels[p] && nativePixels[p + 1] === actualPixels[p + 1] &&
        nativePixels[p + 2] === actualPixels[p + 2] && nativePixels[p + 3] === actualPixels[p + 3], item.id + ': surrounding native wall pixels remain intact');
      protectedPixels++;
    }
    result.protectedWallPixels = protectedPixels;
    // The approach marker must remain the final visible ground cue, including
    // the front ramp whose surface intersects the approach position.
    const approach = r.pos(door.x, g.zFor(door));
    const markerIndex = paintOrder.findLastIndex(command => command?.ellipse?.[0] === approach.x && command.ellipse[1] === approach.y);
    assert.ok(markerIndex > paintOrder.lastIndexOf('png'), item.id + ': approach marker is painted after the PNG surface');
    result.nativeApproachMarkerAfterPng = true;
    pair.push(result);
  }
  assert.notEqual(pair[0].pixelSha256, pair[1].pixelSha256, item.id + ': open/closed native status remains visible');
}
for (const roomId of ['s28', 's32']) for (const highContrast of [false, true]) {
  const g = fixtureGame(roomId), options = { width: 600, height: 380, unit: 1.1, focusX: 800 }, r = stage(g, options), reference = stage(g, options);
  r.highContrast = reference.highContrast = highContrast;
  const result = await extensionCase('terrain/hive/' + roomId + '/' + highContrast, 'hive-terrain',
    'Sol de ruche · ' + roomId + ' · ' + (highContrast ? 'contraste élevé' : 'normal'), g, r,
    () => r.floor(0), ['terrain/hive'], ['terrain/sand', 'terrain/silica'], { room: roomId, kind: g.room.kind, highContrast });
  originalFloor.call(reference, 0);
  const bounds = changedBounds(reference.ctx.getImageData(0, 0, 600, 380).data, r.ctx.getImageData(0, 0, 600, 380).data, 600, 380);
  assert.ok(bounds && bounds[1] >= Math.floor(380 * .605), 'hive material stays in the clipped ground band');
  result.changedBoundsAgainstNative = bounds; result.upperScenePixelsUnchanged = true;
}
{
  const g = fixtureGame('s33'), r = stage(g), reference = stage(g);
  const result = await extensionCase('terrain/hive/queen-excluded', 'hive-terrain', 'Chambre royale native', g, r,
    () => r.floor(0), [], ['terrain/hive'], { room: g.room.id, kind: g.room.kind }, false);
  originalFloor.call(reference, 0);
  assert.equal(result.pixelSha256, pixelsHash(reference.canvas), 'queen terrain is not silently included in the hive scope');
  result.nativePixelsIdentical = true;
}
const statesPortalsCapture = contactSheet('states-portals', extensionCells, 4, 600, 465,
  'Édition 0.10.5 — états natifs, brèches, rampes et sols de ruche ; fixtures explicites');
await flushDecodeFinalizers();

for (const [path, record] of inputChecks) assert.equal(sha256(readFileSync(path)), record.sha256, record.path + ': source PNG unchanged');
for (const [path, hash] of immutableInputs) assert.equal(sha256(readFileSync(path)), hash, relative(repo, path) + ': original module unchanged');
assert.deepEqual(Object.getOwnPropertyNames(context.SoSCore.Game.prototype), Object.keys(simulationDescriptors), 'no simulation prototype methods added/removed');
for (const [name, descriptor] of Object.entries(simulationDescriptors)) assert.deepEqual(Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name), descriptor, name + ': simulation prototype unchanged after all fixtures');
for (const [name, method] of Object.entries(unmodifiedMethods)) assert.equal(context.SoSRenderer.prototype[name], method, name + ': native method unchanged after all fixtures');
const adapterStatus = api.status();
const status = { ...adapterStatus, drawn: drawnStatus(), methodMetricsIncludeSelectionPass: true };
const previousEditionAssetIds = ['characters/carlyle-physician', 'characters/decker-medical-gown', 'objectives/icc-handheld', 'creatures/queen', 'weapons/flame',
  'characters/decker-walk-pass-a', 'characters/decker-walk-pass-b', 'characters/decker-focus', 'characters/decker-medical-report',
  'equipment/locker-stocked', 'equipment/supply-empty', 'devices/parts-empty', 'doors/lift-cage',
  'decor/medical-chart', 'decor/medical-cups', 'terrain/sand', 'terrain/silica', 'planets/lv178-orbital'];
const newAssetIds = [...armedGaitIds, 'devices/isolation-closed', 'devices/console-complete',
  'equipment/sensor-off', 'equipment/weakpoint-destroyed', 'doors/rock-breach', 'doors/boarding-ramp', 'terrain/hive'];
for (const id of previousEditionAssetIds) assert.ok(status.drawn[id] > 0, 'previous edition source remains observable: ' + id);
for (const id of newAssetIds) assert.ok(status.drawn[id] > 0, 'new source actually reached drawImage: ' + id);
const detailCounts = Object.fromEntries([...new Set(detailResults.map(r => r.kind))].map(kind => [kind, detailResults.filter(r => r.kind === kind).length]));
const extensionCounts = Object.fromEntries([...new Set(extensionResults.map(r => r.group))].map(group => [group, extensionResults.filter(r => r.group === group).length]));
const report = {
  schemaVersion: 5,
  edition: '0.10.5',
  engine: '@napi-rs/canvas', engineVersion: canvasVersion,
  browserJourney: false,
  explanation: 'Real Canvas pixels rendered from the original simulation and PNG adapter. Rooms, equipment, actor positions and diagnostic camera magnification are explicit fixtures. Six effects originate from native shoot/hurtEnemy actions. Device completion (apart from the explicit embark fixture), sensor deployment/shutdown/depletion/recovery and attachment destruction use the original native actions after stated setup. This is neither a keyboard journey nor a full campaign completion.',
  decoder: {
    preloadScheduling: 'Sequential categories through the production preload API; optional explicit garbage collection between categories when Node exposes it.',
    nativeImageCache: { ...imageCacheMetrics, uniqueFullResolutionSourcesDecoded: decodedImagePaths.size,
      scope: 'QA harness only: a discarded image-selection pass records the exact paths for each frame, restoring Canvas pixels and all renderer properties. Native onload is awaited for those full-resolution images before the retained render; actual drawImage counts exclude selection passes. The production renderer and its normal browser image loading are unchanged.',
      reason: 'Historical 0.10.4 run: an initial all-resident preload was killed with exit 137 after 136 images and an observed 1165 MiB RSS. No assertion result or capture was claimed for that interrupted 0.10.4 attempt. This explains the retained bounded cache; it is not an incident from the present 0.10.5 run.',
      nativeReadiness: 'Native complete/dimensions can precede pixel readiness; every retained image draw waits for the actual native onload callback.',
      peakMeasurement: 'Maximum RSS sampled after each native PNG decode and isolated render; not a continuous process peak and not a performance comparison.' },
    sourcePngFilesChanged: false,
    ancillaryMetadataExcludedInMemory: 'caBX provenance chunks only; the installed Skia decoder rejects these chunks. All source files and all IDAT compressed pixel chunks are retained byte-for-byte.',
    imagesWithCaBX: [...inputChecks.values()].filter(a => a.omittedAncillaryCaBX > 0).length,
  },
  counts: { declared: loaded.total, loaded: loaded.ready, rooms: roomResults.length, savedRoomCaptures: captureResults.length, poseAndWeaponCases: poseResults.length, locomotionCases: locomotionResults.length, walkingCases: locomotionResults.filter(r => r.mode === 'walking').length, restCases: locomotionResults.filter(r => r.mode === 'rest').length, reducedMotionCases: locomotionResults.filter(r => r.mode === 'reduced-motion').length, detailCases: detailResults.length, detailGroups: detailCounts, savedDiagnosticCaptures: 6, capturedDetailCases: detailCells.length, continuationCases: continuationResults.length, editionCases: editionResults.length, capturedEditionCases: editionCells.length, extensionCases: extensionResults.length, extensionGroups: extensionCounts, capturedExtensionCases: armedCells.length + extensionCells.length, newAssetKindsDrawn: newAssetIds.length, pngKindsDrawn: Object.keys(status.drawn).length },
  checks: { allImageDimensionsMatch: true, allImageSourcesUnchanged: true, immutableCampaignModulesUnchanged: true, simulationPrototypeUnchanged: true, targetingArchitectureAndEventAdmissionUnchanged: true, unmodifiedNativeMethods: Object.keys(unmodifiedMethods), allRoomStatesUnchangedByRendering: true, allFixtureSavesUnchangedByRendering: true, restAndReducedMotionPixelsStable: true, nativeDoorFallbackPixelsIdentical: true, sixEffectsUseNativeActionsAndState: true, armedGaitsRespectActorAndActionScope: true, completedDeviceNativeLabelsRetained: true, sensorStatesUseNativeActions: true, weakpointDestructionUsesNativeDamage: true, frontalPortalNativeWallsAndLabelsRetained: true, nativeApproachMarkersFollowPngSurfaces: true, hiveGroundLimitedToTwoExistingRooms: true },
  captures: captureResults, contactSheet: relative(repo, posesPath), diagnosticCaptures: { locomotion: locomotionCapture, details: detailsCapture, continuation: continuationCapture, edition: editionCapture, armedGaits: armedGaitsCapture, statesPortals: statesPortalsCapture }, rooms: roomResults, poses: poseResults, locomotion: locomotionResults, details: detailResults, continuation: continuationResults, editionResults, extensionResults, newAssetIds, previousEditionAssetIds, status,
  images: [...inputChecks.values()],
};
const reportPath = resolve(output, 'canvas-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ report: reportPath, captures, contactSheet: posesPath, counts: report.counts, checks: report.checks }, null, 2));
