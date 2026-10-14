import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { inflateSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS, getHubDoorBounds } from '../src/hub-game.js';
import { HUB_ANNEXES_V87, createHubCommercialStateV87 } from '../src/hub-annex-registry-v87.js';
import { requestShipPortDockV87, stepShipPortV87, SHIP_PORT_DEFINITION_V87 } from '../src/ship-port-state-v87.js';

// Production globals are observed only. A native Save file picker establishes
// disclosed idle checkpoints; physical movement and door opening use real keys.
// Image analysis reads rendered PNGs and already-loaded assets without changing
// production pixels, actor state or renderer methods.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_PRESENTATION_QA_OUTPUT || join(tmpdir(), `atf-hub-presentation-v134-${Date.now()}`));
const rel = relative(root, output);
if (!rel || !rel.startsWith('..') && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const expectV134 = process.env.ATF_PRESENTATION_QA_EXPECT_V134 !== '0';
const report = { status: 'running', startedAt: new Date().toISOString(), expectV134,
  method: 'Twenty-nine disclosed idle checkpoints through the Save picker, including a civil relay docked by its native pure state machine. Separate continuous bridge-to-briefing walk and same-room parallax walk use actual keyboard; refuge uses its real entrance. Production globals and images read only.',
  captures: [], checks: [], pageErrors: [], requestFailures: [] };
let browser, page;
let sourceBefore;
async function sourceManifest() {
  const entries = await fs.readdir(join(root, 'src'), { recursive: true });
  const paths = [...entries.filter(path => path.endsWith('.js')).map(path => `src/${path}`),
    'src/app.js', 'index.html', 'runtime-level.css', 'sw.js', 'assets/openai/hub/props/v134/rear-equipment-atlas.png'];
  return Object.fromEntries(await Promise.all([...new Set(paths)].sort().map(async path => {
    const bytes = await fs.readFile(join(root, path)); return [path, createHash('sha256').update(bytes).digest('hex')];
  })));
}

async function playwright() {
  try { return await import('playwright'); } catch (error) {
    if (process.env.ATF_PLAYWRIGHT_MODULE) return import(pathToFileURL(resolve(process.env.ATF_PLAYWRIGHT_MODULE)).href);
    if (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) return createRequire(join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '__hub_presentation__.cjs'))('playwright');
    throw Error('Existing Playwright installation required', { cause: error });
  }
}
const observation = () => page.evaluate(() => {
  const h = globalThis.__ATF_HUB__;
  const source = image => image && { src: image.src, width: image.naturalWidth, height: image.naturalHeight, complete: image.complete };
  const snapshot = h.getSnapshot();
  const annex = h.currentAnnexV71?.(), room = annex || h.currentRoom();
  return { running: h.running, deck: h.state.deck, room: h.currentRoom()?.id, annex: h.currentAnnexV71?.()?.id || null,
    transition: h.annexTransitionV71?.direction || null, player: { x: h.player.x, y: h.player.y, w: h.player.w, h: h.player.h,
      health: h.player.health, shockHits: h.player.shockHits }, camera: { ...h.camera },
    snapshot: Object.fromEntries(Object.entries(snapshot).filter(([key]) => /134|presentation|depth|authored/i.test(key))), snapshotKeys: Object.keys(snapshot),
    architecture: { roomId: room?.id, viewport: room?.viewport ? { ...room.viewport } : null },
    doors: h.doorStates.map(d => ({ ...d })),
    people: h.npcs.map(n => ({ id: n.crewId || n.id, x: n.x, y: n.y, w: n.w, h: n.h, human: n.humanVisualV133 })),
    assetGeometry: ['roomImages', 'roomLayerImages', 'farLayers', 'propImages', 'hubArtImages', 'annexModularImagesV72'].flatMap(key =>
      h[key] instanceof Map ? [...h[key]].map(([id, image]) => ({ collection: key, id, ...source(image) })) : []) };
});

function rgbaPng(buffer) {
  assert.equal(buffer.subarray(1, 4).toString(), 'PNG');
  let width, height, colorType, depth, chunks = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset), type = buffer.toString('ascii', offset + 4, offset + 8), body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') { width = body.readUInt32BE(0); height = body.readUInt32BE(4); depth = body[8]; colorType = body[9]; }
    if (type === 'IDAT') chunks.push(body);
    offset += length + 12;
  }
  assert.equal(depth, 8); assert.ok([2, 6].includes(colorType));
  const channels = colorType === 6 ? 4 : 3, stride = width * channels, raw = inflateSync(Buffer.concat(chunks)), data = Buffer.alloc(width * height * 4);
  let prior = Buffer.alloc(stride), offset = 0;
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < height; y++) {
    const filter = raw[offset++], row = Buffer.from(raw.subarray(offset, offset + stride)); offset += stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? row[x - channels] : 0, top = prior[x], topLeft = x >= channels ? prior[x - channels] : 0;
      row[x] = (row[x] + (filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? top : filter === 3 ? Math.floor((left + top) / 2) : filter === 4 ? paeth(left, top, topLeft) : NaN)) & 255;
    }
    for (let x = 0; x < width; x++) { const i = (y * width + x) * 4, j = x * channels; data[i] = row[j]; data[i + 1] = row[j + 1]; data[i + 2] = row[j + 2]; data[i + 3] = channels === 4 ? row[j + 3] : 255; }
    prior = row;
  }
  return { width, height, data };
}
function pixelMetrics(png, logicalRect = { x: 0, y: 0, w: 1280, h: 720 }) {
  const bounds = { x: Math.max(0, Math.floor(logicalRect.x / 1280 * png.width)), y: Math.max(0, Math.floor(logicalRect.y / 720 * png.height)),
    right: Math.min(png.width, Math.ceil((logicalRect.x + logicalRect.w) / 1280 * png.width)), bottom: Math.min(png.height, Math.ceil((logicalRect.y + logicalRect.h) / 720 * png.height)) };
  let white = 0, magenta = 0, total = 0;
  for (let y = bounds.y; y < bounds.bottom; y++) for (let x = bounds.x; x < bounds.right; x++) {
    const i = (y * png.width + x) * 4, r = png.data[i], g = png.data[i + 1], b = png.data[i + 2]; total++;
    if (r >= 235 && g >= 235 && b >= 235 && Math.max(r, g, b) - Math.min(r, g, b) <= 18) white++;
    if (r >= 150 && b >= 130 && g <= 105 && Math.min(r, b) - g >= 55) magenta++;
  }
  return { logicalRect, screenBounds: bounds, pixels: total, nearWhitePixels: white, magentaPixels: magenta };
}
async function capture(name) {
  const state = await observation(), bytes = await page.locator('#hub-canvas').screenshot({ path: join(output, name + '.png') }), png = rgbaPng(bytes);
  const item = { name, file: name + '.png', sha256: createHash('sha256').update(bytes).digest('hex'), width: png.width, height: png.height, state,
    pixels: pixelMetrics(png), doorRegions: state.doors.filter(d => Math.abs(d.x - state.camera.x - 640) < 750).map(d => {
      const geometry = getHubDoorBounds(d); return { id: d.id, lift: Boolean(d.lift), geometry, pixels: pixelMetrics(png, { ...geometry, x: geometry.x - state.camera.x }) };
    }) };
  report.captures.push(item); return item;
}
async function importSave(save) {
  if (await page.locator('#exit-hub').isVisible()) await page.locator('#exit-hub').click();
  await page.locator('[data-view="settings"]').click();
  await page.locator('#save-import').setInputFiles({ name: 'tantalus-presentation-idle.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(save)) });
  await page.getByText('Sauvegarde importée et migrée.', { exact: true }).last().waitFor();
  await page.locator('[data-view="hub"]').click(); await page.waitForFunction(() => globalThis.__ATF_HUB__?.running);
  await page.waitForFunction(() => {
    const h = globalThis.__ATF_HUB__;
    return h?.player?.playerAppearanceVisualV126?.drawn && h.npcSheets.every(image => image?.complete && image.naturalWidth > 0);
  });
  if (expectV134) await page.waitForFunction(() => globalThis.__ATF_HUB__?.getSnapshot()?.hubRoomParallaxV134?.current?.nativeReady === true);
  await page.locator('#hub-canvas').focus(); await page.waitForTimeout(450);
}
function roomFixture(id, x = 620) {
  const save = createDefaultSave(), deck = HUB_DECKS.findIndex(d => d.rooms.some(r => r.id === id)), room = HUB_DECKS[deck].rooms.find(r => r.id === id);
  save.needsPlayerCreationV84 = false; save.scene = 'hub'; Object.assign(save.hub, { deck, roomId: id, positionX: room.xStart + x, positionY: 532 }); return save;
}
async function walkTo(targetX) {
  const before = await observation(), right = targetX > before.player.x, key = right ? 'KeyD' : 'KeyA';
  await page.keyboard.down('ShiftLeft'); await page.keyboard.down(key);
  try { await page.waitForFunction(t => { const p = globalThis.__ATF_HUB__?.player; return p && (t.right ? p.x >= t.x - 5 : p.x <= t.x + 5); }, { x: targetX, right }, { polling: 'raf', timeout: 14000 }); }
  finally { await page.keyboard.up(key); await page.keyboard.up('ShiftLeft'); }
  await page.waitForTimeout(150); const after = await observation();
  assert.ok(Math.abs(after.player.x - targetX) < 50); assert.equal(after.player.health, 100); assert.equal(after.player.shockHits, 0); assert.equal(after.player.y, 532);
  return after;
}
async function alphaCandidates() {
  return page.evaluate(() => {
    const h = globalThis.__ATF_HUB__, images = new Map();
    for (const key of ['propImages', 'hubArtImages', 'roomLayerImages', 'npcPoseImagesV52', 'annexModularImagesV72']) if (h[key] instanceof Map)
      for (const [id, image] of h[key]) if (image?.complete && image.naturalWidth) images.set(image.src, { id, image, collection: key });
    for (const image of h.npcSheets || []) if (image?.complete && image.naturalWidth) images.set(image.src, { id: image.src, image, collection: 'npcSheets' });
    return [...images].map(([src, { id, image, collection }]) => {
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0); const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0, nearWhite = 0, magenta = 0, borderWhite = 0, borderMagenta = 0;
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4, r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3], border = x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1;
        if (a === 0) transparent++; if (a < 128) continue;
        if (r >= 235 && g >= 235 && b >= 235 && Math.max(r, g, b) - Math.min(r, g, b) <= 18) { nearWhite++; if (border) borderWhite++; }
        if (r >= 150 && b >= 130 && g <= 105 && Math.min(r, b) - g >= 55) { magenta++; if (border) borderMagenta++; }
      }
      return { id, src, collection, width: canvas.width, height: canvas.height, transparentPixels: transparent, nearWhitePixels: nearWhite, magentaPixels: magenta, borderWhite, borderMagenta };
    });
  });
}
async function idleAlphaCacheCheck(context) {
  report.alphaPolicy ||= await page.evaluate(async () => (await import('/src/sprite-alpha-policy-v134.js')).SPRITE_ALPHA_POLICY_V134);
  assert.ok(report.alphaPolicy.cacheBytes <= 64 * 1024 * 1024); assert.ok(report.alphaPolicy.cacheEntries <= 48);
  const read = () => page.evaluate(async () => (await import('/src/sprite-alpha-policy-v134.js')).getSpriteAlphaSnapshotV134());
  const before = await read(); await page.waitForTimeout(2000); const after = await read();
  (report.alphaIdleSamples ||= []).push({ context, before, after });
  assert.equal(after.preparations, before.preparations, `${context}: stable idle redid pixel processing`);
  assert.ok(after.cacheHits > before.cacheHits); assert.equal(after.failures, 0);
  assert.ok(after.retainedBytes <= report.alphaPolicy.cacheBytes); assert.ok(after.retainedEntries <= report.alphaPolicy.cacheEntries);
}
function verifyParallaxFrame(capture) {
  const layer = capture.state.snapshot.hubRoomParallaxV134;
  assert.ok(layer?.active, `${capture.name}: V134 parallax renderer absent`);
  const current = layer.current;
  assert.ok(current?.nativeReady, `${capture.name}: native wall unavailable`);
  assert.equal(current.gameplayPlane, '2d'); assert.equal(current.layers.length, 3);
  assert.equal(current.originalGeometryPreserved, true); assert.equal(current.nativePolicy, 'isotropic-crop-and-repeat');
  assert.equal(capture.state.player.health, 100); assert.equal(capture.state.player.shockHits, 0);
  assert.ok(Math.abs(capture.state.player.y + capture.state.player.h - current.floorY) < .1);
  assert.ok(current.bounds.y + current.bounds.h <= current.floorY);
  assert.ok(current.nativeTiles.length > 0);
  for (const tile of current.nativeTiles) {
    assert.ok(Math.abs(tile.scaleX - tile.scaleY) < 1e-9);
    assert.ok(tile.scaleX > 0 && tile.scaleX <= 1);
    assert.ok(Math.abs(tile.target.w / tile.source.w - tile.scaleX) < 1e-9);
    assert.ok(Math.abs(tile.target.h / tile.source.h - tile.scaleY) < 1e-9);
  }
  const dressing = capture.state.snapshot.hubRoomDressingV134;
  assert.ok(dressing?.active, `${capture.name}: V134 room furnishing absent`);
  const drawn = dressing.rendered.find(r => r.roomId === (capture.state.annex || capture.state.room));
  assert.ok(drawn?.items.length >= 3, `${capture.name}: purposeful furnishing missing`);
  const plaque = dressing.plaques?.find(r => r.roomId === drawn.roomId); assert.ok(plaque?.bounds);
  const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const item of drawn.items) {
    assert.equal(item.plane, 'rear'); assert.equal(item.collidable, false); assert.equal(item.interactive, false);
    assert.equal(intersects(item.bounds, plaque.bounds), false, `${capture.name}: ${item.kind} overlaps compartment sign`);
    if (capture.state.architecture.viewport) assert.equal(intersects(item.bounds, capture.state.architecture.viewport), false,
      `${capture.name}: ${item.kind} overlaps native glazing`);
  }
  return current;
}
async function verifyCandidate() {
  for (const capture of report.captures) verifyParallaxFrame(capture);
  const start = report.captures.find(c => c.name === '01-bridge-parallax-start'), end = report.captures.find(c => c.name === '02-bridge-parallax-end');
  const first = start.state.snapshot.hubRoomParallaxV134.current, second = end.state.snapshot.hubRoomParallaxV134.current;
  assert.equal(first.presentationMode, '2.5d');
  assert.ok(Math.abs(end.state.camera.x - start.state.camera.x) > 200);
  assert.equal(new Set(second.layers.map(l => l.factor)).size, 3);
  for (let i = 0; i < 3; i++) {
    assert.ok(second.layers[i].factor > 0);
    assert.ok(Math.abs(second.layers[i].drift - first.layers[i].drift - (end.state.camera.x - start.state.camera.x) * second.layers[i].factor) < 1e-6);
  }
  report.checks.push('Three actually drawn bridge planes move at distinct camera speeds after real keyboard displacement.');
  const closed = end.state.snapshot.hubBulkheadDepthV134?.doors.find(d => d.centerX === 1280);
  const open = report.captures.find(c => c.name === '04-bulkhead-opening').state.snapshot.hubBulkheadDepthV134?.doors.find(d => d.centerX === 1280);
  assert.ok(closed && open); assert.equal(closed.projection, 'transverse-depth-cutaway');
  assert.ok(closed.rear.x < closed.near.x && closed.rear.floorY < closed.near.floorY);
  assert.ok(closed.leafHeight > 190); assert.ok(open.leafHeight < .1);
  assert.ok(open.foregroundWidth < end.state.player.w);
  assert.ok(open.drawnPhases.includes('back') && open.drawnPhases.includes('front'));
  report.checks.push('The separating bulkhead is a transverse depth portal: a closed vertical leaf retracts above the crossing and leaves only its narrow near jamb in front of actors.');
  report.checks.push('Native wall crops retain isotropic scale at or below source resolution in all photographed rooms and annexes.');
  report.checks.push('Every photographed compartment contains purposeful extra furnishing behind the walking plane, with no new collider or invented interaction.');
  report.checks.push('Actual furnishing rectangles leave native glazing and compartment signs unobstructed throughout all 29 gallery rooms.');
  report.alphaRuntime = await page.evaluate(async () => (await import('/src/sprite-alpha-policy-v134.js')).getSpriteAlphaSnapshotV134());
  assert.equal(report.alphaRuntime.failures, 0); assert.ok(report.alphaRuntime.preparations > 0); assert.ok(report.alphaRuntime.changedPixels > 0);
  assert.ok(report.alphaRuntime.correctedDrawRequests > 0);
  assert.ok(report.alphaRuntime.retainedBytes <= report.alphaPolicy.cacheBytes); assert.ok(report.alphaRuntime.retainedEntries <= report.alphaPolicy.cacheEntries);
  for (const asset of report.alphaRuntime.assets) { assert.equal(asset.alphaUnchanged, true); assert.ok(asset.maxDistance <= 2); }
  report.checks.push('Actual prop/person draws use the bounded alpha matte correction; preparations succeeded and native alpha remains unchanged.');
  await idleAlphaCacheCheck('personal-refuge');
  report.checks.push('Two seconds of ordinary bridge and refuge idle rendering reuse corrected cutouts without another pixel-processing pass.');
}
async function compareBaseline() {
  const path = process.env.ATF_PRESENTATION_QA_BASELINE;
  if (!path) return;
  const before = JSON.parse(await fs.readFile(path, 'utf8'));
  assert.equal(before.status, 'passed'); report.baselineCommit = before.baselineCommit;
  report.comparisons = [];
  for (const capture of report.captures) {
    const prior = before.captures.find(c => c.name === capture.name); if (!prior) continue;
    const [a, b] = await Promise.all([fs.readFile(resolve(path, '..', prior.file)), fs.readFile(join(output, capture.file))]);
    const left = rgbaPng(a), right = rgbaPng(b); assert.equal(left.width, right.width); assert.equal(left.height, right.height);
    let changed = 0, materiallyChanged = 0, absoluteDifference = 0;
    for (let i = 0; i < left.data.length; i += 4) {
      const distance = Math.abs(left.data[i] - right.data[i]) + Math.abs(left.data[i + 1] - right.data[i + 1]) + Math.abs(left.data[i + 2] - right.data[i + 2]);
      if (distance) changed++; if (distance >= 30) materiallyChanged++; absoluteDifference += distance;
    }
    const pixels = left.width * left.height;
    report.comparisons.push({ name: capture.name, before: resolve(path, '..', prior.file), after: join(output, capture.file),
      samePng: a.equals(b), changedPixels: changed, materiallyChangedPixels: materiallyChanged, changedFraction: changed / pixels,
      materialChangeFraction: materiallyChanged / pixels, meanRgbAbsoluteDifference: absoluteDifference / pixels / 3 });
  }
}
async function main() {
  await fs.mkdir(output, { recursive: true });
  if (expectV134) { sourceBefore = await sourceManifest(); report.sourceFiles = Object.keys(sourceBefore).length;
    report.sourceSignatureAtStart = createHash('sha256').update(JSON.stringify(sourceBefore)).digest('hex'); }
  const module = await playwright(), { chromium } = module.chromium ? module : module.default;
  browser = await chromium.launch({ headless: true, executablePath: process.env.ATF_CHROMIUM_EXECUTABLE || '/usr/bin/chromium' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' }); page = await context.newPage(); page.setDefaultTimeout(30000);
  page.on('pageerror', e => report.pageErrors.push(e.message)); page.on('requestfailed', r => report.requestFailures.push({ url: r.url(), error: r.failure()?.errorText }));
  await page.goto(base, { waitUntil: 'domcontentloaded' }); await page.locator('#title-start').click(); await page.locator('#title-options').click();
  await importSave(roomFixture('bridge', 620)); await capture('01-bridge-parallax-start');
  if (expectV134) await idleAlphaCacheCheck('bridge');
  await walkTo(940); await capture('02-bridge-parallax-end');
  report.checks.push('Same-room scenery observed before and after real camera movement.');
  for (const [x, name] of [[1080, '03-bulkhead-approach'], [1160, '04-bulkhead-opening'], [1300, '05-bulkhead-crossing'], [1480, '06-briefing-after-crossing']]) {
    await walkTo(x); await capture(name);
  }
  assert.equal((await observation()).room, 'briefing'); report.checks.push('Bridge-to-briefing bulkhead physically opens and remains traversable without damage.');
  for (const id of HUB_DECKS.flatMap(deck => deck.rooms.map(room => room.id))) {
    await importSave(roomFixture(id)); assert.equal((await observation()).room, id); await capture(`room-${id}`);
    report.checks.push(`${id}: idle checkpoint rendered with real production assets and unchanged physical feet.`);
  }
  report.alphaCandidates = await alphaCandidates();
  for (const annex of HUB_ANNEXES_V87) {
    const id = annex.id; let save = roomFixture(annex.parentRoomId, 180); const state = createHubCommercialStateV87();
    if (id === 'frontier-civil-counter') {
      const scope = SHIP_PORT_DEFINITION_V87, context = { careReady: true, manifestReady: true, physical: { roomId: 'dropship-hangar' },
        authorization: { granted: true, portId: scope.id, sectorId: scope.sectorId, campaignHours: 6 } };
      const docked = requestShipPortDockV87(save, { transactionId: 'presentation-fixture-port-v134', portId: scope.id }, context);
      assert.equal(docked.ok, true); save = docked.save;
      for (let t = 1; t <= 14; t++) { const advanced = stepShipPortV87(save, { dtSeconds: 1, simulationTime: t }, context); assert.equal(advanced.ok, true); save = advanced.save; }
      assert.equal(save.shipPortV1.phase, 'docked');
    }
    if (id !== 'personal-refuge') {
      Object.assign(state, { activeAnnexId: id, lastAnnexId: id, annexPositionX: Math.round(annex.station.bounds.x + annex.station.bounds.w + 10), annexPositionY: 532,
        annexClimbing: false, returnContext: { deckId: annex.parentDeck, roomId: annex.parentRoomId, x: save.hub.positionX, facing: 1 } });
      state.annexes[id].visited = true; state.visitedAnnexIds.push(id); save.hub.commercialV71 = state;
    }
    await importSave(save);
    if (id === 'personal-refuge') {
      const door = await page.evaluate(id => ({ ...globalThis.__ATF_HUB__.getParentAnnexDoorV71(id).bounds }), id);
      await walkTo(door.x + door.w / 2 - 22); await page.keyboard.press('KeyE');
      await page.waitForFunction(id => globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === id && !globalThis.__ATF_HUB__.annexTransitionV71, id, { timeout: 12000 });
      await walkTo(Math.round(annex.station.bounds.x + annex.station.bounds.w + 10));
    }
    assert.equal((await observation()).annex, id); await capture(`annex-${id}`);
    report.checks.push(`${id}: native annex production composition rendered; refuge uses its real physical entrance.`);
  }
  if (expectV134) await verifyCandidate();
  await compareBaseline();
  if (expectV134) {
    const sourceAfter = await sourceManifest(); report.sourceSignatureAtEnd = createHash('sha256').update(JSON.stringify(sourceAfter)).digest('hex');
    report.sourceChangedFiles = Object.keys(sourceAfter).filter(path => sourceBefore[path] !== sourceAfter[path]);
    assert.deepEqual(report.sourceChangedFiles, []); assert.equal(report.sourceSignatureAtStart, report.sourceSignatureAtEnd);
    report.checks.push('All production JS, presentation HTML/CSS, service worker and the new equipment image retain the same source signature throughout the complete recipe.');
  }
  assert.deepEqual(report.pageErrors, []); assert.deepEqual(report.requestFailures, []);
  report.status = 'passed';
}
await main().catch(async error => {
  report.status = 'failed'; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1;
  if (page) { report.lastObservedState = await observation().catch(() => null); await page.locator('#hub-canvas').screenshot({ path: join(output, 'failure-context.png') }).catch(() => {}); }
}).finally(async () => {
  report.finishedAt = new Date().toISOString(); await fs.mkdir(output, { recursive: true }); await fs.writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser?.close(); console.log(JSON.stringify({ status: report.status, checks: report.checks.length, captures: report.captures.length, error: report.error?.message, report: join(output, 'report.json') }));
});
