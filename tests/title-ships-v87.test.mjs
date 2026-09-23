import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { TITLE_SHIP_ASSETS_V87, TITLE_SCENE_READY_ASSETS_V79, TITLE_SCENE_READY_BY_ID_V79,
  TITLE_RETIRED_ASSET_IDS_V87 } from '../src/title-scene-assets-v79.js';
import { sanitizeTitleScenePresentationV79, sanitizeTitleShipNameV87,
  buildTitleSceneModelV79, getTitleSceneShipOptionsV87 } from '../src/title-scene-catalog-v79.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { inspectPng } from '../scripts/audit-title-assets-v79.mjs';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

const ids = ['uss-sulaco', 'uscss-nostromo', 'narcissus', 'ud4l-cheyenne', 'usm-auriga', 'prometheus'];
const root = new URL('../assets/openai/ui/title/v87/orbitals/', import.meta.url);
const files = new Map(ids.map(id => [id, readFile(new URL(`${id}-reference-v87.png`, root))]));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const lookup = id => {
  const asset = TITLE_SHIP_ASSETS_V87.find(entry => entry.shipId === id);
  assert.ok(asset, `registry must contain ${id}, not merely a file on disk`);
  return asset;
};

// Read-only PNG unfiltering, following the existing art tests. No pixels are rewritten.
// Alpha16 is the established visible-silhouette threshold; alpha1 noise is not opaque hull.
function silhouette(bytes) {
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), chunks = [];
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  let cursor = 8;
  while (cursor + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(cursor), type = bytes.toString('ascii', cursor + 4, cursor + 8);
    assert.ok(cursor + size + 12 <= bytes.length);
    if (type === 'IDAT') chunks.push(bytes.subarray(cursor + 8, cursor + 8 + size));
    cursor += size + 12; if (type === 'IEND') break;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = Buffer.alloc(stride * height);
  assert.equal(packed.length, (stride + 1) * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p-a), db = Math.abs(p-b), dc = Math.abs(p-c);
    return da <= db && da <= dc ? a : db <= dc ? b : c; };
  let source = 0, minX = width, minY = height, maxX = -1, maxY = -1, edgeAlphaMax = 0;
  for (let y = 0; y < height; y++) {
    const filter = packed[source++]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const position = y * stride + x, a = x >= 4 ? pixels[position-4] : 0, b = y ? pixels[position-stride] : 0;
      const c = y && x >= 4 ? pixels[position-stride-4] : 0;
      pixels[position] = (packed[source+x] + [0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter]) & 255;
    }
    source += stride;
    for (let x = 0; x < width; x++) {
      const alpha = pixels[(y*width+x)*4+3];
      if (alpha >= 16) { minX = Math.min(minX,x); minY = Math.min(minY,y); maxX = Math.max(maxX,x); maxY = Math.max(maxY,y); }
      if (x === 0 || y === 0 || x === width-1 || y === height-1) edgeAlphaMax = Math.max(edgeAlphaMax,alpha);
    }
  }
  return { edgeAlphaMax, margins: { left:minX, top:minY, right:width-maxX-1, bottom:height-maxY-1 } };
}

test('V87 exposes exactly the six distinct registered native PNGs, without rewriting the V79 inventory', async () => {
  assert.deepEqual(TITLE_SHIP_ASSETS_V87.map(asset => asset.shipId).sort(), [...ids].sort());
  assert.equal(new Set(TITLE_SHIP_ASSETS_V87.map(asset => asset.src)).size, 6);
  assert.equal(new Set(TITLE_SHIP_ASSETS_V87.map(asset => asset.sha256)).size, 6);
  assert.deepEqual((await readdir(root)).sort(), ids.map(id => `${id}-reference-v87.png`).sort());
  assert.equal(Object.isFrozen(TITLE_SHIP_ASSETS_V87), true);
  assert.equal(TITLE_SCENE_READY_ASSETS_V79.length, 18);
  assert.ok(TITLE_SCENE_READY_ASSETS_V79.every(asset => asset.src.startsWith('/assets/openai/ui/title/v79/')));
  for (const id of TITLE_RETIRED_ASSET_IDS_V87) {
    assert.ok(TITLE_SCENE_READY_ASSETS_V79.some(asset => asset.id === id), `historical source remains ${id}`);
    assert.equal(getTitleSceneShipOptionsV87().some(option => option.assetId === id), false);
  }
});

for (const id of ids) test(`${id}: exact hash/dimensions, bounded visible hull, native alpha and no opaque white border`, async () => {
  const asset = lookup(id), bytes = await files.get(id), stats = inspectPng(bytes), shape = silhouette(bytes);
  assert.equal(asset.src, `/assets/openai/ui/title/v87/orbitals/${id}-reference-v87.png`);
  assert.equal(sha256(bytes), asset.sha256); assert.equal(asset.status, 'ready'); assert.equal(asset.role, 'orbitals');
  assert.equal(Object.isFrozen(asset), true); assert.equal(TITLE_SCENE_READY_BY_ID_V79[asset.id], asset);
  assert.equal(stats.width, asset.sourceWidth); assert.equal(stats.height, asset.sourceHeight);
  assert.equal(stats.colorType, 6); assert.equal(stats.bitDepth, 8); assert.equal(stats.interlace, 0);
  assert.equal(stats.alphaMin, 0); assert.equal(stats.alphaMax, 255);
  assert.ok(stats.visibleRatio >= .2 && stats.visibleRatio <= .6, `${id} visible fraction ${stats.visibleRatio}`);
  assert.equal(stats.opaqueBorderRatio, 0); assert.equal(stats.opaqueNearWhiteBorderRatio, 0);
  // Explicit exception for tiny hidden-RGB residue in accepted native ImageGen output.
  // This threshold is not a claim of lossless canon fidelity or zero-RGB transparency.
  assert.ok(stats.hiddenRgbRatio <= .001, `${id} hidden RGB ${stats.hiddenRgbRatio}`);
  assert.ok(shape.edgeAlphaMax < 16, `${id} visible silhouette touches canvas edge at alpha ${shape.edgeAlphaMax}`);
  for (const [edge, margin] of Object.entries(shape.margins)) assert.ok(margin > 0, `${id} clipped ${edge}`);
  assert.deepEqual(asset.hullRegistration, { x:0, y:0, width:stats.width, height:stats.height,
    sourceWidth:stats.width, sourceHeight:stats.height });
});

test('Sulaco/Tantalus name plate is source-bounded and only this registered hull exposes renaming', () => {
  const asset = lookup('uss-sulaco'), plate = asset.namePlate;
  assert.deepEqual(plate, { x:1300, y:403, width:275, height:44 });
  assert.equal(asset.defaultShipName, 'TANTALUS');
  assert.ok(plate.x >= 0 && plate.y >= 0 && plate.width > 0 && plate.height > 0);
  assert.ok(plate.x+plate.width <= asset.sourceWidth && plate.y+plate.height <= asset.sourceHeight);
  assert.equal(Object.isFrozen(plate), true);
  assert.deepEqual(getTitleSceneShipOptionsV87().filter(option => option.canRename).map(option => option.shipId), ['uss-sulaco']);
  for (const id of ids) {
    const model = buildTitleSceneModelV79({ presentation: { titleScene: { shipId:id, shipName:'TANTALUS V-87' } } });
    assert.equal(model.shipId, id);
    const ship = model.layers.find(layer => layer.renderer === 'image' && layer.role === 'orbitals');
    assert.equal(ship.assetId, lookup(id).id);
    assert.equal(model.shipName, id === 'uss-sulaco' ? 'TANTALUS V-87' : null);
  }
});

test('actual save migration preserves every shipId and normalized name without changing campaign state', () => {
  for (const id of ids) {
    const raw = createDefaultSave(2), original = structuredClone(raw);
    raw.presentation.titleScene = { presetId:'frontier-night', motionMode:'static', seed:'ship-seed', shipId:id, shipName:'  Tàntalus V-87  ' };
    let restored = migrateSave(JSON.parse(JSON.stringify(raw)), 2);
    assert.equal(restored.presentation.titleScene.shipId, id);
    assert.equal(restored.presentation.titleScene.shipName, 'TANTALUS V-87');
    for (const key of ['galaxy','strategy','crew','player','statistics','hub','bioforgeV80'])
      assert.deepEqual(restored[key], original[key], `${id} does not mutate ${key}`);
    for (let cycle=0; cycle<3; cycle++) {
      const next = migrateSave(JSON.parse(JSON.stringify(restored)), 2);
      assert.deepEqual(next.presentation, restored.presentation); restored = next;
    }
    assert.equal(raw.presentation.titleScene.shipName, '  Tàntalus V-87  ', 'source not mutated');
  }
});

test('presentation sanitation refuses unknown assets and HTML/URLs/oversize names; no new campaign grant', () => {
  for (const shipId of ['unknown', '../uss-sulaco', 'https://example.com/ship.png', '<img src=x>', {}, 7]) {
    const safe = sanitizeTitleScenePresentationV79({ shipId });
    assert.equal(Object.hasOwn(safe, 'shipId'), false);
  }
  for (const shipName of ['<img src=x onerror=alert(1)>', '<b>TANTALUS</b>', 'javascript:alert(1)',
    'https://example.com', 'A'.repeat(25), '', {}, 1, 'TANTALUS\u0000']) {
    assert.equal(sanitizeTitleShipNameV87(shipName), null);
    const raw = createDefaultSave(); raw.presentation.titleScene = { shipId:'uss-sulaco', shipName };
    const before = structuredClone(raw.strategy), restored = migrateSave(raw, raw.profile);
    assert.equal(Object.hasOwn(restored.presentation.titleScene, 'shipName'), false);
    assert.equal(restored.presentation.titleScene.shipId, 'uss-sulaco');
    assert.deepEqual(restored.strategy, before);
  }
  assert.equal(sanitizeTitleShipNameV87("  O'Bríen-7  "), "O'BRIEN-7");
  assert.equal(sanitizeTitleShipNameV87('A'.repeat(24)), 'A'.repeat(24));
});

test('source build filter includes native ship runtime assets without needing private V79 source receipts', () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const id of ids) assert.equal(filter(fileURLToPath(new URL(`${id}-reference-v87.png`, root))), true);
  for (const path of ['src/title-scene-assets-v79.js','src/title-scene-catalog-v79.js','src/title-scene-v79.js','src/bioforge-physical-state-v87.js'])
    assert.equal(filter(fileURLToPath(new URL(`../${path}`, import.meta.url))), true);
});
