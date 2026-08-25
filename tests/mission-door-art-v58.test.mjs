import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

import {
  MISSION_DOOR_ART_V58,
  MISSION_DOOR_ATLAS_GRID_V58,
  MISSION_DOOR_ATLAS_V58,
  resolveMissionDoorArtV58
} from '../src/mission-door-art-v58.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const paeth = (left, above, upperLeft) => {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const diagonalDistance = Math.abs(estimate - upperLeft);
  return leftDistance <= aboveDistance && leftDistance <= diagonalDistance
    ? left : aboveDistance <= diagonalDistance ? above : upperLeft;
};

async function decodeRgbaPng(file) {
  const png = await readFile(file);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'signature PNG');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8, 'atlas 8 bits');
  assert.equal(colorType, 6, 'atlas RGBA');
  assert.equal(interlace, 0, 'atlas non entrelacé');
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const filtered = inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(stride * height);
  let source = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = filtered[source++];
    const row = y * stride;
    const previous = row - stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = filtered[source++];
      const left = x >= bytesPerPixel ? pixels[row + x - bytesPerPixel] : 0;
      const above = y > 0 ? pixels[previous + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[previous + x - bytesPerPixel] : 0;
      const predictor = filter === 0 ? 0
        : filter === 1 ? left
        : filter === 2 ? above
        : filter === 3 ? Math.floor((left + above) / 2)
        : filter === 4 ? paeth(left, above, upperLeft)
        : Number.NaN;
      assert.ok(Number.isFinite(predictor), `filtre PNG ${filter} supporté`);
      pixels[row + x] = (raw + predictor) & 255;
    }
  }
  return { width, height, pixels, stride };
}

function cellEvidence(atlas, column, row, cellWidth, cellHeight) {
  const hash = createHash('sha256');
  let occupied = 0;
  for (let y = row * cellHeight; y < (row + 1) * cellHeight; y += 1) {
    const start = y * atlas.stride + column * cellWidth * 4;
    const scanline = atlas.pixels.subarray(start, start + cellWidth * 4);
    hash.update(scanline);
    for (let x = 3; x < scanline.length; x += 4) if (scanline[x] > 8) occupied += 1;
  }
  return { hash: hash.digest('hex'), occupied };
}

test('l’atlas V58 normalise quatre familles de portes sur huit cellules fixes', async () => {
  assert.deepEqual(MISSION_DOOR_ATLAS_GRID_V58, {
    width: 2048, height: 2048, columns: 2, rows: 4,
    cellWidth: 1024, cellHeight: 512, closedColumn: 0, openColumn: 1
  });
  const atlasPath = path.join(ROOT, MISSION_DOOR_ATLAS_V58.slice(1));
  assert.ok(existsSync(atlasPath));
  const atlas = await decodeRgbaPng(atlasPath);
  assert.deepEqual([atlas.width, atlas.height], [2048, 2048]);
  const cellEvidenceSet = [];
  for (let row = 0; row < 4; row += 1) {
    const closed = cellEvidence(atlas, 0, row, 1024, 512);
    const open = cellEvidence(atlas, 1, row, 1024, 512);
    assert.ok(closed.occupied > 25_000, `porte fermée ligne ${row} occupée`);
    assert.ok(open.occupied > 25_000, `porte ouverte ligne ${row} occupée`);
    assert.notEqual(closed.hash, open.hash, `états fermé/ouvert ligne ${row} distincts`);
    cellEvidenceSet.push(closed.hash, open.hash);
  }
  assert.equal(new Set(cellEvidenceSet).size, 8, 'huit cellules visuellement distinctes');
  assert.equal(Object.keys(MISSION_DOOR_ART_V58).length, 4);
  for (const [visualRole, profile] of Object.entries(MISSION_DOOR_ART_V58)) {
    const closed = resolveMissionDoorArtV58({ visualRole, open: false, progress: 0 });
    const open = resolveMissionDoorArtV58({ visualRole, open: true, progress: 1 });
    assert.equal(closed.row, open.row);
    assert.deepEqual(closed.sourceBounds, open.sourceBounds, `${visualRole}: cadre identique`);
    assert.equal(open.source.x - closed.source.x, 1024, `${visualRole}: paire horizontale`);
    assert.equal(closed.source.y, open.source.y);
    assert.equal(closed.source.w, open.source.w);
    assert.equal(closed.source.h, open.source.h);
  }
});

test('le rôle absent revient au sas intérieur sans heuristique de nom ou d’index', () => {
  const profile = resolveMissionDoorArtV58({ id: 'porte-inconnue', progress: 0 });
  assert.equal(profile.visualRole, 'ship-bulkhead');
  assert.equal(profile.row, 0);
  assert.equal(profile.column, 0);
});
