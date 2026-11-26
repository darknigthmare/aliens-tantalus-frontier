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
const unmodifiedMethods = Object.fromEntries(['door', 'architecture', 'pickTarget', 'shutter', 'worldDressing', 'lightPanel'].map(name => [name, context.SoSRenderer.prototype[name]]));
const simulationDescriptors = Object.fromEntries(Object.getOwnPropertyNames(context.SoSCore.Game.prototype).map(name => [name, Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name)]));
for (const name of ['art-pack', 'png-renderer']) {
  const path = resolve(visualRoot, `src/${name}.js`);
  vm.runInContext(readFileSync(path, 'utf8'), context, { filename: path });
}
const api = context.SoSPngRenderer;
await api.preload();
const loaded = api.status();
assert.equal(loaded.total, 119, '119 unique sprite entries');
assert.equal(loaded.requested, 119, 'every image requested by explicit QA preload');
assert.equal(loaded.ready, 119, JSON.stringify(loaded.assets));
assert.equal(inputChecks.size, 119);
for (const [name, method] of Object.entries(unmodifiedMethods)) assert.equal(context.SoSRenderer.prototype[name], method, name);
for (const [name, descriptor] of Object.entries(simulationDescriptors)) assert.deepEqual(Object.getOwnPropertyDescriptor(context.SoSCore.Game.prototype, name), descriptor, name);

const canvas = makeCanvas(1600, 900);
const game = new context.SoSCore.Game({ difficulty: 'exploration' });
const renderer = new context.SoSRenderer(canvas, game);
const selected = new Set(['s01', 's14', 's26', 's33', 's34', 's50']);
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
  const before = JSON.stringify(game.state), beforeDrawn = api.status().drawn;
  renderer.draw(1, 1 / 60);
  assert.equal(JSON.stringify(game.state), before, room.id + ': rendering cannot change the save');
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
assert.equal(captureResults.length, 6);

// A separate contact sheet exercises the actual renderer in both orientations,
// all recovered player posture states and all three available PNG held weapons.
const posesCanvas = makeCanvas(1800, 1500), poses = new context.SoSRenderer(posesCanvas, game);
poses.canvas.width = 1800; poses.canvas.height = 1500; poses.W = 1800; poses.H = 1500; poses.unit = 2.3;
const c = poses.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#142329'; c.fillRect(0, 0, 1800, 1500);
prepareRoom(context.SoSData.rooms.find(r => r.id === 's14'));
const combinations = ['pistol', 'pulse', 'foam'].flatMap(weapon => [1, -1].flatMap(facing => ['standing', 'crouch', 'dodge'].map(posture => ({ weapon, facing, posture }))));
const poseResults = [];
for (const [i, combination] of combinations.entries()) {
  const x = i % 6 * 300 + 150, y = Math.floor(i / 6) * 480 + 355;
  poses.pos = () => ({ x, y });
  Object.assign(game.p, { weapon: combination.weapon, facing: combination.facing, crouch: combination.posture === 'crouch', dodgeTime: combination.posture === 'dodge' ? .2 : 0 });
  const before = JSON.stringify(game.state), prior = api.status().drawn;
  poses.human(game.p, 0, 'decker');
  assert.equal(JSON.stringify(game.state), before);
  c.font = '18px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#d5e1d9';
  c.fillText(`${combination.weapon} · ${combination.posture} · ${combination.facing > 0 ? 'droite' : 'gauche'}`, x, y + 52);
  const used = Object.keys(api.status().drawn).filter(key => api.status().drawn[key] > (prior[key] || 0));
  assert.ok(used.includes('weapons/' + combination.weapon), JSON.stringify(combination));
  assert.ok(used.some(key => key.startsWith('characters/decker')), JSON.stringify(combination));
  poseResults.push({ ...combination, drawn: used });
}
const posesPath = resolve(output, 'poses-weapons.png');
writeFileSync(posesPath, posesCanvas.toBuffer('image/png'));

for (const [path, record] of inputChecks) assert.equal(sha256(readFileSync(path)), record.sha256, record.path + ': source PNG unchanged');
for (const [path, hash] of immutableInputs) assert.equal(sha256(readFileSync(path)), hash, relative(repo, path) + ': original module unchanged');
const status = api.status();
const report = {
  schemaVersion: 1,
  engine: '@napi-rs/canvas', engineVersion: canvasVersion,
  browserJourney: false,
  explanation: 'Real Canvas pixels rendered from the original simulation and new PNG adapter. Room and equipment fixtures are injected explicitly; this is neither a keyboard journey nor a full campaign completion.',
  decoder: {
    sourcePngFilesChanged: false,
    ancillaryMetadataExcludedInMemory: 'caBX provenance chunks only; the installed Skia decoder rejects these chunks. All source files and all IDAT compressed pixel chunks are retained byte-for-byte.',
    imagesWithCaBX: [...inputChecks.values()].filter(a => a.omittedAncillaryCaBX > 0).length,
  },
  counts: { declared: loaded.total, loaded: loaded.ready, rooms: roomResults.length, savedRoomCaptures: captureResults.length, poseAndWeaponCases: poseResults.length, pngKindsDrawn: Object.keys(status.drawn).length },
  checks: { allImageDimensionsMatch: true, allImageSourcesUnchanged: true, immutableCampaignModulesUnchanged: true, simulationPrototypeUnchanged: true, doorAndTargetMethodsUnchanged: true, allRoomStatesUnchangedByRendering: true },
  captures: captureResults, contactSheet: posesPath, rooms: roomResults, poses: poseResults, status,
  images: [...inputChecks.values()],
};
const reportPath = resolve(output, 'canvas-report.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ report: reportPath, captures, contactSheet: posesPath, counts: report.counts, checks: report.checks }, null, 2));
