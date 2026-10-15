import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { inflateSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { HUB_DECKS, getHubDoorBounds } from '../src/hub-game.js';
import { HUB_ANNEXES_V87, createHubCommercialStateV87 } from '../src/hub-annex-registry-v87.js';
import { getHubRoomProjectionV139 } from '../src/hub-room-projection-v139.js';
import { requestShipPortDockV87, stepShipPortV87, SHIP_PORT_DEFINITION_V87 } from '../src/ship-port-state-v87.js';

import { HUB_DROPSHIP_HANGAR_ART_V139 } from '../src/hub-dropship-hangar-art-v139.js';

// Production globals are observed only. A native Save file picker establishes
// disclosed idle checkpoints; physical movement and door opening use real keys.
// Image analysis reads rendered PNGs and already-loaded assets without changing
// production pixels, actor state or renderer methods.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(process.env.ATF_PRESENTATION_QA_OUTPUT || join(tmpdir(), `atf-hub-presentation-v134-${Date.now()}`));
const rel = relative(root, output);
if (!rel || rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)) throw Error('QA evidence must remain outside the checkout.');
const base = process.env.ATF_BASE_URL || 'http://127.0.0.1:4173';
const expectV134 = process.env.ATF_PRESENTATION_QA_EXPECT_V134 !== '0';
const report = { status: 'running', startedAt: new Date().toISOString(), expectV134,
  method: 'Twenty-nine disclosed idle checkpoints through the Save picker, including a civil relay docked by its native pure state machine. Continuous bridge-to-briefing, same-room walks and west/east sightlines across every wide historical annex use actual keyboard; refuge uses its real entrance. Production globals and images read only.',
  captures: [], checks: [], pageErrors: [], requestFailures: [] };
let browser, page;
let sourceBefore;
let manifestSequence = 0;
async function sourceManifest() {
  const sources = (await fs.readdir(join(root, 'src'), { recursive: true })).filter(path => path.endsWith('.js')).map(path => `src/${path}`);
  const assets = (await fs.readdir(join(root, 'assets'), { recursive: true, withFileTypes: true }))
    .filter(entry => entry.isFile()).map(entry => relative(root, join(entry.parentPath, entry.name)));
  const files = [...new Set([...sources, ...assets, 'index.html', 'runtime-level.css', 'sw.js'])].sort();
  const manifest = {};
  const scriptSha256 = createHash('sha256').update(await fs.readFile(fileURLToPath(import.meta.url))).digest('hex');
  if (manifestSequence === 0) report.scriptSha256 = scriptSha256;
  else assert.equal(scriptSha256, report.scriptSha256, 'The actual QA recipe changed during execution.');
  report.sourceManifestFormat = 'relative-path-sha256-map-v1';
  report.sourceManifestFiles = { start: 'source-manifest-start.json', end: 'source-manifest-end.json' };
  // Hash sequentially: the original asset collection is about 1.5 GB; evidence
  // must cover it without retaining the entire collection in process memory.
  for (const path of files) manifest[path] = createHash('sha256').update(await fs.readFile(join(root, path))).digest('hex');
  for (const name of ['furniture-atlas.png', 'service-front-atlas.png', 'ship-front-atlas.png', 'surface-details-atlas.png', 'annex-stations-front-atlas.png', 'dropship-hangar-side.png'])
    assert.ok(manifest[`assets/openai/hub/props/v139/${name}`], `Required V139 original asset missing: ${name}`);
  report.sourceFiles = files.length;
  report.sourceAssetFiles = assets.length;
  report.v139AssetFiles = assets.filter(path => path.startsWith('assets/openai/hub/props/v139/')).sort();
  await fs.writeFile(join(output, `source-manifest-${++manifestSequence === 1 ? 'start' : 'end'}.json`), JSON.stringify(manifest, null, 2));
  return manifest;
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
      health: h.player.health, shockHits: h.player.shockHits }, camera: { ...(annex ? h.annexCameraV71 : h.camera) },
    snapshot: Object.fromEntries(Object.entries(snapshot).filter(([key]) => /119|134|136|137|138|139|presentation|depth|authored/i.test(key))), snapshotKeys: Object.keys(snapshot),
    architecture: { roomId: room?.id, viewport: room?.viewport ? { ...room.viewport } : null,
      world: room?.world ? { ...room.world } : null, station: annex?.station ? structuredClone(annex.station) : null,
      admittedNativeStation: Boolean(annex?.propPlacementV139), activeAnnexAssetsReady: snapshot.activeAnnexAssetsReadyV71 ?? null,
      activeAnnexAssetCount: annex ? h.annexImagesV71?.get(annex.id)?.size ?? 0 : null },
    station: h.nearestAnnexStationV71?.()?.annexId || null,
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
async function inspectDropship(label) {
  const inHangar = await page.evaluate(() => {
    const h = globalThis.__ATF_HUB__;
    return !h.currentAnnexV71?.() && h.currentRoom()?.id === 'dropship-hangar';
  });
  if (!inHangar) return null;
  const art = HUB_DROPSHIP_HANGAR_ART_V139;
  await page.waitForFunction(({ actorId, asset }) => {
    const h = globalThis.__ATF_HUB__, image = h.hubLifeImagesV136?.get(asset);
    return h.getSnapshot().hubRoomLifeV136?.vehicles.some(vehicle => vehicle.actorId === actorId && vehicle.asset === asset)
      && image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
  }, { actorId: art.actorId, asset: art.asset });
  const proof = await page.evaluate(art => {
    const h = globalThis.__ATF_HUB__, image = h.hubLifeImagesV136.get(art.asset);
    const placement = h.getSnapshot().hubRoomLifeV136.vehicles.find(vehicle => vehicle.actorId === art.actorId);
    const canvas = document.createElement('canvas'); canvas.width = art.source.w; canvas.height = art.source.h;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, art.source.x, art.source.y, art.source.w, art.source.h, 0, 0, art.source.w, art.source.h);
    const pixels = context.getImageData(0, 0, art.source.w, art.source.h).data;
    const measuredSupports = art.landingSupports.map(support => {
      let last = -1, lastRowOpaquePixels = 0;
      for (let y = 0; y < art.source.h; y++) {
        let count = 0;
        for (let x = support.x0; x < support.x1; x++) if (pixels[(y * art.source.w + x) * 4 + 3] >= 192) count++;
        if (count) { last = y; lastRowOpaquePixels = count; }
      }
      return { id: support.id, alphaThreshold: 192, footSourceY: last + 1, lastRowOpaquePixels };
    });
    return { placement, image: { src: image.src, width: image.naturalWidth, height: image.naturalHeight, complete: image.complete }, measuredSupports };
  }, art);
  const sourceSha256 = createHash('sha256').update(await fs.readFile(join(root, art.asset.slice(1)))).digest('hex');
  assert.equal(sourceSha256, art.sha256); assert.equal(art.admitted, true);
  assert.equal(new URL(proof.image.src).pathname, art.asset);
  assert.equal(proof.image.complete, true); assert.equal(proof.image.width, art.width); assert.equal(proof.image.height, art.height);
  const p = proof.placement;
  assert.equal(p.asset, art.asset); assert.equal(p.actorId, art.actorId); assert.equal(p.view, 'strict-side');
  assert.equal(p.projection, 'strict-side-elevation'); assert.deepEqual(p.source, art.source);
  const scale = p.renderBounds.w / p.source.w;
  assert.equal(p.renderBounds.w, 720); assert.ok(Math.abs(scale - p.renderBounds.h / p.source.h) < 1e-8);
  assert.ok(Math.abs(scale - p.scaleX) < 1e-8); assert.ok(Math.abs(scale - p.scaleY) < 1e-8);
  assert.equal(p.supportY, 624); assert.equal(p.opaqueFoot.y, 624); assert.equal(p.landingSupports.length, 2);
  for (const measured of proof.measuredSupports) {
    const declared = art.landingSupports.find(support => support.id === measured.id);
    const painted = p.landingSupports.find(support => support.id === measured.id);
    assert.ok(declared && painted); assert.ok(measured.lastRowOpaquePixels > 0);
    assert.equal(measured.footSourceY, declared.footSourceY);
    assert.equal(measured.lastRowOpaquePixels, declared.lastRowOpaquePixels);
    assert.equal(painted.y, 624);
    assert.ok(Math.abs(p.renderBounds.y + measured.footSourceY * scale - painted.y) < 1e-8);
    assert.ok(Math.abs(painted.x0 - p.renderBounds.x - declared.x0 * scale) < 1e-8);
    assert.ok(Math.abs(painted.x1 - p.renderBounds.x - declared.x1 * scale) < 1e-8);
  }
  const evidence = { label, sourceSha256, ...proof };
  (report.dropshipEvidence ||= []).push(evidence); return evidence;
}
async function capture(name) {
  await page.waitForFunction(() => {
    const h = globalThis.__ATF_HUB__, snapshot = h?.getSnapshot(), life = snapshot?.hubRoomLifeV136?.current;
    const annex = h.currentAnnexV71?.();
    const images = annex && h.annexImagesV71?.get(annex.id);
    const annexReady = images instanceof Map && images.size > 0 && snapshot.activeAnnexAssetsReadyV71 === images.size
      && [...images.values()].every(image => image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
    return life?.furnishingV137?.pendingImageRoles.length === 0 && life.workstationDetailsV139?.pending?.length === 0
      && (!annex || annexReady
        && (!annex.propPlacementV139 || snapshot.hubAnnexNativePlacementV139?.painted === true));
  });
  const dropship = await inspectDropship(name);
  const state = await observation(), bytes = await page.locator('#hub-canvas').screenshot({ path: join(output, name + '.png') }), png = rgbaPng(bytes);
  const item = { name, file: name + '.png', sha256: createHash('sha256').update(bytes).digest('hex'), width: png.width, height: png.height, state,
    dropship, pixels: pixelMetrics(png), doorRegions: state.doors.filter(d => Math.abs(d.x - state.camera.x - 640) < 750).map(d => {
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
  const projection = getHubRoomProjectionV139(capture.state.annex || capture.state.room);
  assert.equal(current.presentationMode, projection.mode, `${capture.name}: the actual whole-room projection must follow its admitted furniture kit.`);
  if (projection.mode === '2d') for (const layer of current.layers) { assert.equal(layer.factor, 0); assert.equal(layer.drift, 0); }
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
  const bridgeMode = getHubRoomProjectionV139('bridge').mode;
  assert.equal(first.presentationMode, bridgeMode);
  assert.ok(Math.abs(end.state.camera.x - start.state.camera.x) > 200);
  if (bridgeMode === '2.5d') {
    assert.equal(new Set(second.layers.map(l => l.factor)).size, 3);
    for (let i = 0; i < 3; i++) {
      assert.ok(second.layers[i].factor > 0);
      assert.ok(Math.abs(second.layers[i].drift - first.layers[i].drift - (end.state.camera.x - start.state.camera.x) * second.layers[i].factor) < 1e-6);
    }
  } else for (const layer of [...first.layers, ...second.layers]) {
    assert.equal(layer.factor, 0); assert.equal(layer.drift, 0);
  }
  report.checks.push(bridgeMode === '2.5d'
    ? 'Three actually drawn bridge planes move at distinct camera speeds after real keyboard displacement.'
    : 'The complete frontal bridge retains three stationary wall planes after real keyboard and camera displacement.');
  const closed = end.state.snapshot.hubBulkheadDepthV134?.doors.find(d => d.centerX === 1280);
  const open = report.captures.find(c => c.name === '04-bulkhead-opening').state.snapshot.hubBulkheadDepthV134?.doors.find(d => d.centerX === 1280);
  assert.ok(closed && open);
  assert.equal(closed.projection, bridgeMode === '2d' ? 'orthographic-transverse-profile' : 'transverse-depth-cutaway');
  if (bridgeMode === '2.5d') assert.ok(closed.rear.x < closed.near.x && closed.rear.floorY < closed.near.floorY);
  else {
    assert.equal(closed.near.x - closed.rear.x, 16); assert.equal(closed.rear.floorY, closed.near.floorY);
    assert.equal(closed.rear.topY, closed.near.topY); assert.equal(open.foregroundWidth, 3);
  }
  assert.ok(closed.leafHeight > 190); assert.ok(open.leafHeight < .1);
  assert.ok(open.foregroundWidth < end.state.player.w);
  assert.ok(open.drawnPhases.includes('back') && open.drawnPhases.includes('front'));
  report.checks.push('The separating bulkhead follows the complete compartment projection: its closed vertical leaf retracts above the real crossing and leaves a narrow jamb in front of actors.');
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
      const idleX = annex.entranceSide === 'west' ? annex.entranceLocalX + annex.entrance.w / 2 + 30
        : annex.entranceLocalX - annex.entrance.w / 2 - 44 - 30;
      Object.assign(state, { activeAnnexId: id, lastAnnexId: id, annexPositionX: Math.round(idleX), annexPositionY: 532,
        annexClimbing: false, returnContext: { deckId: annex.parentDeck, roomId: annex.parentRoomId, x: save.hub.positionX, facing: 1 } });
      state.annexes[id].visited = true; state.visitedAnnexIds.push(id); save.hub.commercialV71 = state;
    }
    await importSave(save);
    if (id === 'personal-refuge') {
      const door = await page.evaluate(id => ({ ...globalThis.__ATF_HUB__.getParentAnnexDoorV71(id).bounds }), id);
      await walkTo(door.x + door.w / 2 - 22); await page.keyboard.press('KeyE');
      await page.waitForFunction(id => globalThis.__ATF_HUB__.currentAnnexV71?.()?.id === id && !globalThis.__ATF_HUB__.annexTransitionV71, id, { timeout: 12000 });
    }
    const actual = await observation(), station = actual.architecture.station.bounds;
    await walkTo(Math.round(station.x + station.w + 10));
    assert.equal((await observation()).station, id, `${id}: the actual runtime station must remain physically approachable.`);
    assert.equal((await observation()).annex, id); await capture(`annex-${id}`);
    report.checks.push(`${id}: native annex production composition rendered; refuge uses its real physical entrance.`);
    const width = actual.architecture.world.width;
    if (width > 1280) {
      await walkTo(100); const west = await capture(`annex-${id}-far-west`);
      await walkTo(width - 144); const east = await capture(`annex-${id}-far-east`);
      assert.equal(west.state.annex, id); assert.equal(east.state.annex, id);
      assert.ok(west.state.camera.x < 80); assert.ok(east.state.camera.x > width - 1280 - 80);
      assert.ok(east.state.player.x - west.state.player.x > width - 310);
      report.checks.push(`${id}: actual floor travel exposes both far west and far east architecture, doors and furnishing through the native camera, without damage or actor mutation.`);
    }
  }
  if (expectV134) await verifyCandidate();
  await compareBaseline();
  if (expectV134) {
    const sourceAfter = await sourceManifest(); report.sourceSignatureAtEnd = createHash('sha256').update(JSON.stringify(sourceAfter)).digest('hex');
    report.sourceChangedFiles = Object.keys(sourceAfter).filter(path => sourceBefore[path] !== sourceAfter[path]);
    assert.deepEqual(report.sourceChangedFiles, []); assert.equal(report.sourceSignatureAtStart, report.sourceSignatureAtEnd);
    report.checks.push('All production JS, every original asset, presentation HTML/CSS and the service worker retain the same source signature throughout the complete recipe.');
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
