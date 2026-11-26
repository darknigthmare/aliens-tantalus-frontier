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
const captures = resolve(option('--captures', resolve(repo, 'docs/mer-des-chagrins-20261126/canvas')));
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
class LocalImage extends NativeImage {
  set src(value) {
    const path = resolve(visualRoot, value), rel = relative(visualRoot, path);
    assert.ok(!rel.startsWith('..') && !isAbsolute(rel), 'image stays in the visual runtime');
    const bytes = readFileSync(path), decode = pngForNativeDecoder(bytes);
    inputChecks.set(path, { path: relative(repo, path), bytes: bytes.length, sha256: sha256(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), omittedAncillaryCaBX: decode.omitted });
    this._sourcePath = value;
    super.src = decode.bytes;
  }
  get src() { return this._sourcePath; }
}
function makeCanvas(width, height, portrait = false) {
  const canvas = createCanvas(width, height);
  canvas.getBoundingClientRect = () => ({ width, height, left: 0, top: 0 });
  canvas.classList = { contains: name => portrait && name === 'castPortrait' };
  canvas.isConnected = true;
  return canvas;
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
const simulationDescriptors = Object.fromEntries(Object.getOwnPropertyNames(context.SoSCore.Game.prototype).map(name => [name, Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name)]));
for (const name of ['art-pack', 'png-renderer']) {
  const path = resolve(visualRoot, `src/${name}.js`);
  vm.runInContext(readFileSync(path, 'utf8'), context, { filename: path });
}
const api = context.SoSPngRenderer;
await api.preload();
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
const selected = new Set(['s01', 's03', 's14', 's26', 's33', 's34', 's50']);
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
  const before = game.exportSave(), beforeDrawn = api.status().drawn;
  renderer.draw(1, 1 / 60);
  assert.equal(game.exportSave(), before, room.id + ': rendering cannot change the save/checkpoint');
  const afterDrawn = api.status().drawn;
  const used = Object.keys(afterDrawn).filter(key => afterDrawn[key] > (beforeDrawn[key] || 0));
  roomResults.push({ room: room.id, imageUses: used, stateUnchanged: true, fixture: { objectiveIndex: game.state.objectiveIndex, equipped: game.state.flags.equipped, player: { x: game.p.x, z: game.p.z }, rescuedActors: game.state.rescue.active } });
  if (selected.has(room.id)) {
    const path = resolve(captures, room.id + '.png'), bytes = canvas.toBuffer('image/png');
    writeFileSync(path, bytes);
    captureResults.push({ room: room.id, path: relative(repo, path), width: canvas.width, height: canvas.height, bytes: bytes.length, sha256: sha256(bytes) });
  }
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
  const before = game.exportSave(), prior = api.status().drawn;
  poses.human(game.p, 0, 'decker');
  assert.equal(game.exportSave(), before);
  c.font = '18px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#d5e1d9';
  c.fillText(`${combination.weapon} · ${combination.posture} · ${combination.facing > 0 ? 'droite' : 'gauche'}`, x, y + 52);
  const used = Object.keys(api.status().drawn).filter(key => api.status().drawn[key] > (prior[key] || 0));
  assert.ok(used.includes('weapons/' + combination.weapon), JSON.stringify(combination));
  assert.ok(used.some(key => key.startsWith('characters/decker')), JSON.stringify(combination));
  poseResults.push({ ...combination, drawn: used });
}
const posesPath = resolve(captures, 'poses-weapons.png');
writeFileSync(posesPath, posesCanvas.toBuffer('image/png'));

// Isolated views call the actual renderer, at an explicitly magnified projection.
// They are diagnostic fixtures, not screenshots of a played camera journey.
const drawnSince = prior => {
  const current = api.status().drawn;
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
function observe(g, r, id, draw) {
  const before = g.exportSave(), prior = api.status().drawn;
  draw();
  assert.equal(g.exportSave(), before, id + ': rendering cannot change the serialized save/checkpoint');
  return { drawn: drawnSince(prior), saveUnchanged: true, pixelSha256: pixelsHash(r.canvas), width: r.canvas.width, height: r.canvas.height };
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
for (const mode of ['walking', 'rest', 'reduced-motion']) for (const facing of [1, -1]) for (const time of [0, .3]) {
  const g = fixtureGame('s01');
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: 600, z: .55, facing, moving: mode !== 'rest', crouch: false, dodgeTime: 0 });
  const r = stage(g, { width: 450, height: 365, unit: 2.4 }); r.reduced = mode === 'reduced-motion';
  const id = `locomotion/${mode}/${facing}/${time}`;
  const result = observe(g, r, id, () => r.human(g.p, time, 'decker'));
  const expected = mode === 'walking' ? 'characters/decker-walk-' + (time ? 'b' : 'a') : 'characters/decker';
  assert.ok(result.drawn.includes(expected), id + ': intended authored pose');
  assert.ok(!result.drawn.some(key => key.startsWith('weapons/')), id + ': no gun attached to unarmed walk');
  assert.equal(result.drawn.filter(key => key.startsWith('characters/')).length, 1, id + ': one body pose');
  locomotionResults.push({ id, mode, facing, time, moving: g.p.moving, reducedMotion: r.reduced, expected, ...result });
  const label = mode === 'walking' ? `Marche ${time ? 'B' : 'A'}` : mode === 'rest' ? 'Repos' : 'Mouvement réduit';
  locomotionCells.push({ id, title: `${label} · ${facing > 0 ? 'droite' : 'gauche'} · t=${time}`, canvas: r.canvas });
}
for (const mode of ['walking', 'rest', 'reduced-motion']) for (const facing of [1, -1]) {
  const pair = locomotionResults.filter(r => r.mode === mode && r.facing === facing);
  assert.equal(pair.length, 2);
  if (mode === 'walking') assert.notEqual(pair[0].pixelSha256, pair[1].pixelSha256, 'walking key poses have different real pixels');
  else assert.equal(pair[0].pixelSha256, pair[1].pixelSha256, mode + ': no time-dependent pose alternation');
}
const locomotionCapture = contactSheet('locomotion', locomotionCells, 4, 450, 410,
  'Locomotion — rendu réel Canvas, poses isolées ; fixtures, pas parcours joué');

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
function continuationCase(id, title, g, r, draw, expected, absent = [], extra = {}, capture = true) {
  const beforePixels = r.ctx.getImageData(0, 0, r.canvas.width, r.canvas.height).data;
  const result = { id, expected, absent, ...extra, ...observe(g, r, id, draw) };
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
  continuationCase('medical/decker/' + facing, 'Tenue médicale · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
    () => r.human(g.p, .3, 'decker'), ['characters/decker-medical-gown'], ['characters/decker-walk-b'], { room: 's03', facing, moving: true });
  const physician = { ...g.room.cast.find(a => a.id === 'medic'), facing };
  const doctorRenderer = stage(g, { unit: 2.3, focusX: physician.x, focusZ: g.zFor(physician) });
  continuationCase('medical/physician/' + facing, 'Médecin du Carlyle · ' + (facing > 0 ? 'droite' : 'gauche'), g, doctorRenderer,
    () => doctorRenderer.human(physician, 0, 'medic'), ['characters/carlyle-physician'], ['characters/medic'], { room: 's03', facing });
}
for (const completed of [false, true]) {
  const g = fixtureGame('s03'), objective = g.room.interactables.find(o => o.id === 'o02-01');
  g.state.flags[objective.flag] = completed;
  Object.assign(g.p, { x: objective.x - 100, z: objective.z });
  const r = stage(g, { unit: 2, focusX: objective.x, focusZ: g.zFor(objective) });
  continuationCase('medical/handheld/' + completed, 'Rapport ICC · ' + (completed ? 'transmis' : 'à transmettre'), g, r,
    () => r.object(objective), completed ? [] : ['objectives/icc-handheld'], completed ? ['objectives/icc-handheld'] : [],
    { room: 's03', completed, objectiveId: objective.id });
}
for (const room of ['s01', 's04']) {
  const g = fixtureGame(room);
  g.state.inventory.pistol = false; g.state.flags.equipped = false;
  Object.assign(g.p, { x: 600, z: .55, moving: false, crouch: false, dodgeTime: 0 });
  const r = stage(g);
  continuationCase('medical/scope/' + room, 'Tenue civile hors infirmerie', g, r,
    () => r.human(g.p, 0, 'decker'), ['characters/decker'], ['characters/decker-medical-gown'], { room }, false);
}
{
  const g = fixtureGame('s03'); equipForMedicalGuard(g);
  const r = stage(g);
  continuationCase('medical/armed-guard', 'Garde de tenue armée', g, r, () => r.human(g.p, 0, 'decker'),
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
  const result = continuationCase('queen/' + facing, 'Reine · ' + (facing > 0 ? 'droite' : 'gauche'), g, r,
    () => r.alien(queen, 0), ['creatures/queen'], [], { room: 's33', facing, enemyId: queen.id, fixtureUnit: 1 });
  const bounds = result.changedBounds;
  assert.ok(bounds && bounds[0] > 8 && bounds[1] > 8 && bounds[2] < r.canvas.width - 8 && bounds[3] < r.canvas.height - 8,
    'queen fixture preserves the whole sprite within the diagnostic frame: ' + JSON.stringify(bounds));
}
const continuationCapture = contactSheet('medical-queen', continuationCells, 4, 600, 460,
  'Médecine et reine — nouveaux pixels ; fixtures explicites, pas parcours joué');

const detailResults = [], detailCells = [];
function addDetail(id, kind, title, g, r, draw, extra = {}, capture = true) {
  const result = { id, kind, ...extra, ...observe(g, r, id, draw) };
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
  const result = addDetail(`effects/${effect}`, 'effect', `Effet ${effect} · action/état du moteur`, g, r, () => {
    if (effect === 'acid') { r.tacticalGround(0); r.corpse(g.rs.corpses.at(-1)); }
    else {
      r.human(g.p, 0, 'decker');
      if (enemy) r.alien(enemy, 0);
      if (weakpoint) r.weakpoint(weakpoint);
      r.drawEffects(.035);
    }
  }, { effect, room: g.room.id, nativeAction: effect === 'acid' ? 'hurtEnemy(existingAdult, hp)' : 'shoot(clearTarget)', eventTypes: events.map(e => e.type), fixture: { player: { ...ray.from }, target: { ...ray.to }, weapon: g.p.weapon, enemy: enemy?.id || null, foam: enemy?.foam || 0, acid: g.rs.acid.map(a => ({ ...a })) } });
  assert.ok(result.drawn.includes('effects/' + effect), effect + ': expected actual PNG drawn');
  const prior = api.status().drawn;
  if (effect === 'acid') {
    g.rs.acid.forEach(a => { a.time = 0; });
    const guard = stage(g), inactive = observe(g, guard, effect + '/inactive', () => guard.tacticalGround(0));
    assert.ok(!inactive.drawn.includes('effects/acid')); result.inactiveStateDrawsPng = false;
  } else if (effect === 'foam') {
    enemy.foam = 0;
    const guard = stage(g), inactive = observe(g, guard, effect + '/inactive', () => guard.alien(enemy, 0));
    assert.ok(!inactive.drawn.includes('effects/foam')); result.inactiveStateDrawsPng = false;
  }
  observe(g, r, effect + '/expired-events', () => r.drawEffects(1));
  assert.equal(r.effects.length, 0, effect + ': native event lifetimes expire');
  assert.ok(!drawnSince(prior).some(key => key.startsWith('effects/')), effect + ': no retained PNG effect after expiry');
  result.eventQueueExpired = true;
}

const lampResults = [];
for (const facing of [1, -1]) for (const on of [false, true]) {
  const g = fixtureGame('s14'); equip(g);
  Object.assign(g.p, { x: 700, z: .55, facing, lamp: on });
  const r = stage(g, { unit: 2.3 });
  const result = addDetail(`lamp/${facing}/${on ? 'on' : 'off'}`, 'lamp', `Lampe ${on ? 'allumée' : 'éteinte'} · ${facing > 0 ? 'droite' : 'gauche'}`, g, r, () => r.human(g.p, 0, 'decker'), { facing, on });
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
  const result = addDetail(`lighting/${on ? 'on' : 'off'}`, 'light-panel', `Commande éclairage · ${on ? 'actif' : 'coupé'}`, g, r, () => r.lightPanel(l, 0), { on, room: g.room.id, control: l.id });
  assert.ok(result.drawn.includes('equipment/light-panel')); lightResults.push(result);
}
assert.notEqual(lightResults[0].pixelSha256, lightResults[1].pixelSha256, 'lighting state changes the real indicator');

const shutterResults = [];
for (const status of ['open', 'closed', 'broken']) {
  const g = fixtureGame('s13'), s = g.room.shutters[0];
  Object.assign(g.rs.shutters[s.id], { status, integrity: status === 'broken' ? 0 : 100, progress: 0 });
  Object.assign(g.p, { x: s.x - 80, z: .55 });
  const r = stage(g, { unit: 1.2, focusX: s.x, focusZ: .55 });
  const priorUses = api.status().drawn['equipment/shutter-control'] || 0;
  const result = addDetail(`shutter/${status}`, 'shutter', `Cloison · ${status} · deux commandes réelles`, g, r, () => r.shutter(s, 0), { status, room: g.room.id, shutter: s.id, controls: g.shutterControls(s).map(n => ({ id: n.id, x: n.x, z: n.z })) });
  assert.ok(result.drawn.includes('equipment/shutter-control'));
  assert.equal(api.status().drawn['equipment/shutter-control'] - priorUses, 2, 'both authored shutter controls drawn');
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
const compatible = [], nativeCases = new Map();
for (const room of context.SoSData.rooms) for (const door of room.doors) {
  const type = door.portal?.type || 'bulkhead', mount = door.portal?.mount || 'back';
  if (type === 'bulkhead' && ['front', 'back'].includes(mount)) {
    if (!compatible.some(c => c.mount === mount)) compatible.push({ room: room.id, id: door.id, mount });
  } else if (!nativeCases.has(type + '/' + mount)) nativeCases.set(type + '/' + mount, { room: room.id, id: door.id, type, mount });
}
assert.equal(compatible.length, 2);
for (const item of compatible) for (const open of [true, false]) {
  const { g, door, options } = doorFixture(item.room, item.id, open), r = stage(g, options);
  const result = addDetail(`door/${item.mount}/${open ? 'open' : 'closed'}`, 'bulkhead', `Porte ${item.mount === 'front' ? 'avant' : 'fond'} · ${open ? 'ouverte' : 'fermée'}`, g, r, () => r.door(door), { room: item.room, door: item.id, mount: item.mount, open, nativeStatus: { ...g.doorStatus(door) } });
  assert.ok(result.drawn.includes('doors/bulkhead-frame'));
  assert.equal(result.drawn.includes('doors/bulkhead-panel'), !open, 'leaf drawn only for native closed state');
}
const capturedNativeTypes = new Set(['bulkhead/left', 'rock-breach/front', 'lift-cage/right', 'stairwell/back']);
for (const [key, item] of nativeCases) {
  const { g, door, options } = doorFixture(item.room, item.id, true), r = stage(g, options), reference = stage(g, options);
  const nativeResult = observe(g, reference, 'native-door/' + key, () => originalDoor.call(reference, door));
  const result = addDetail('native-door/' + key, 'native-door-fallback', `Géométrie native · ${item.type} / ${item.mount}`, g, r, () => r.door(door), { room: item.room, door: item.id, type: item.type, mount: item.mount, open: true, comparison: 'pixel-by-pixel with original door method' }, capturedNativeTypes.has(key));
  assert.ok(!result.drawn.some(key => key.startsWith('doors/')), key + ': incompatible geometry retains native presentation');
  assert.equal(result.pixelSha256, nativeResult.pixelSha256, key + ': native fallback real pixels unchanged');
  result.nativePixelsIdentical = true;
}
const detailsCapture = contactSheet('details', detailCells, 4, 600, 425,
  'Détails — rendu réel Canvas ; événements et états natifs, fixtures isolées');

for (const [path, record] of inputChecks) assert.equal(sha256(readFileSync(path)), record.sha256, record.path + ': source PNG unchanged');
for (const [path, hash] of immutableInputs) assert.equal(sha256(readFileSync(path)), hash, relative(repo, path) + ': original module unchanged');
assert.deepEqual(Object.getOwnPropertyNames(context.SoSCore.Game.prototype), Object.keys(simulationDescriptors), 'no simulation prototype methods added/removed');
for (const [name, descriptor] of Object.entries(simulationDescriptors)) assert.deepEqual(Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name), descriptor, name + ': simulation prototype unchanged after all fixtures');
for (const [name, method] of Object.entries(unmodifiedMethods)) assert.equal(context.SoSRenderer.prototype[name], method, name + ': native method unchanged after all fixtures');
const status = api.status();
const newAssetIds = ['characters/carlyle-physician', 'characters/decker-medical-gown', 'objectives/icc-handheld', 'creatures/queen', 'weapons/flame'];
for (const id of newAssetIds) assert.ok(status.drawn[id] > 0, 'new source actually reached drawImage: ' + id);
const detailCounts = Object.fromEntries([...new Set(detailResults.map(r => r.kind))].map(kind => [kind, detailResults.filter(r => r.kind === kind).length]));
const report = {
  schemaVersion: 3,
  engine: '@napi-rs/canvas', engineVersion: canvasVersion,
  browserJourney: false,
  explanation: 'Real Canvas pixels rendered from the original simulation and PNG adapter. Rooms, equipment, actor positions and diagnostic camera magnification are explicit fixtures. Six effects originate from native shoot/hurtEnemy actions and their real events/states. This is neither a keyboard journey nor a full campaign completion.',
  decoder: {
    sourcePngFilesChanged: false,
    ancillaryMetadataExcludedInMemory: 'caBX provenance chunks only; the installed Skia decoder rejects these chunks. All source files and all IDAT compressed pixel chunks are retained byte-for-byte.',
    imagesWithCaBX: [...inputChecks.values()].filter(a => a.omittedAncillaryCaBX > 0).length,
  },
  counts: { declared: loaded.total, loaded: loaded.ready, rooms: roomResults.length, savedRoomCaptures: captureResults.length, poseAndWeaponCases: poseResults.length, locomotionCases: locomotionResults.length, walkingCases: locomotionResults.filter(r => r.mode === 'walking').length, restCases: locomotionResults.filter(r => r.mode === 'rest').length, reducedMotionCases: locomotionResults.filter(r => r.mode === 'reduced-motion').length, detailCases: detailResults.length, detailGroups: detailCounts, savedDiagnosticCaptures: 3, capturedDetailCases: detailCells.length, continuationCases: continuationResults.length, newAssetKindsDrawn: newAssetIds.length, pngKindsDrawn: Object.keys(status.drawn).length },
  checks: { allImageDimensionsMatch: true, allImageSourcesUnchanged: true, immutableCampaignModulesUnchanged: true, simulationPrototypeUnchanged: true, targetingArchitectureAndEventAdmissionUnchanged: true, unmodifiedNativeMethods: Object.keys(unmodifiedMethods), allRoomStatesUnchangedByRendering: true, allFixtureSavesUnchangedByRendering: true, restAndReducedMotionPixelsStable: true, nativeDoorFallbackPixelsIdentical: true, sixEffectsUseNativeActionsAndState: true },
  captures: captureResults, contactSheet: relative(repo, posesPath), diagnosticCaptures: { locomotion: locomotionCapture, details: detailsCapture, continuation: continuationCapture }, rooms: roomResults, poses: poseResults, locomotion: locomotionResults, details: detailResults, continuation: continuationResults, newAssetIds, status,
  images: [...inputChecks.values()],
};
const reportPath = resolve(output, 'canvas-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ report: reportPath, captures, contactSheet: posesPath, counts: report.counts, checks: report.checks }, null, 2));
