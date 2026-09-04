import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import {
  QZ17_COLLECTABLE_CELLS_V68,
  QZ17_COLLECTABLES_SHEET_V68,
  qz17CollectableVisualReportV68,
  resolveQz17CollectableCellV68
} from '../src/narrative-collectables-visuals-v68.js';

const paeth = (left, above, upperLeft) => {
  const prediction = left + above - upperLeft;
  const distances = [Math.abs(prediction - left), Math.abs(prediction - above), Math.abs(prediction - upperLeft)];
  return distances[0] <= distances[1] && distances[0] <= distances[2] ? left : distances[1] <= distances[2] ? above : upperLeft;
};

function decodeRgbaPng(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6, 'la planche de runtime doit être RGBA');
  assert.equal(interlace, 0);
  const packed = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = packed[sourceOffset++];
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = packed[sourceOffset + x];
      const left = x >= 4 ? pixels[rowOffset + x - 4] : 0;
      const above = y > 0 ? pixels[rowOffset - stride + x] : 0;
      const upperLeft = y > 0 && x >= 4 ? pixels[rowOffset - stride + x - 4] : 0;
      if (filter === 0) pixels[rowOffset + x] = raw;
      else if (filter === 1) pixels[rowOffset + x] = (raw + left) & 255;
      else if (filter === 2) pixels[rowOffset + x] = (raw + above) & 255;
      else if (filter === 3) pixels[rowOffset + x] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) pixels[rowOffset + x] = (raw + paeth(left, above, upperLeft)) & 255;
      else assert.fail(`filtre PNG ${filter} non pris en charge`);
    }
    sourceOffset += stride;
  }
  return { width, height, pixels };
}

test('la planche QZ-17 est immuable, transparente et isolée cellule par cellule', async () => {
  const bytes = await readFile(`.${QZ17_COLLECTABLES_SHEET_V68.path}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '59e10b44492cdaff95ef8826110a184b34002793f9d6a90cdfa9844f42e7a883');
  const decoded = decodeRgbaPng(bytes);
  assert.equal(decoded.width, 1024);
  assert.equal(decoded.height, 1024);
  let transparent = 0;
  let hiddenRgb = 0;
  let visibleMagenta = 0;
  for (let offset = 0; offset < decoded.pixels.length; offset += 4) {
    const [red, green, blue, alpha] = decoded.pixels.subarray(offset, offset + 4);
    if (alpha === 0) {
      transparent += 1;
      if (red || green || blue) hiddenRgb += 1;
    } else if (red >= 200 && blue >= 200 && green <= 80) visibleMagenta += 1;
  }
  assert.ok(transparent > decoded.width * decoded.height * 0.7);
  assert.equal(hiddenRgb, 0);
  assert.equal(visibleMagenta, 0);

  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      let opaque = 0;
      let guardLeak = 0;
      for (let localY = 0; localY < 512; localY += 1) {
        for (let localX = 0; localX < 512; localX += 1) {
          const x = column * 512 + localX;
          const y = row * 512 + localY;
          const alpha = decoded.pixels[(y * decoded.width + x) * 4 + 3];
          if (alpha > 0) opaque += 1;
          if (alpha > 0 && (localX < 16 || localX >= 496 || localY < 16 || localY >= 496)) guardLeak += 1;
        }
      }
      assert.ok(opaque > 10_000, `cellule ${column},${row} vide`);
      assert.equal(guardLeak, 0, `cellule ${column},${row} déborde dans la garde`);
    }
  }
});

test('le registre visuel mappe les quatre preuves QZ-17 sur quatre cellules distinctes', () => {
  assert.deepEqual(qz17CollectableVisualReportV68(), {
    schema: 68,
    cells: 4,
    distinctCells: 4,
    invalid: 0,
    runtimeReady: true
  });
  assert.equal(Object.keys(QZ17_COLLECTABLE_CELLS_V68).length, 4);
  assert.deepEqual(resolveQz17CollectableCellV68('qz17-pda-loading-chief'), { column: 0, row: 0 });
  assert.deepEqual(resolveQz17CollectableCellV68('qz17-cargo-seal-fragment'), { column: 1, row: 1 });
  assert.equal(resolveQz17CollectableCellV68('placeholder'), null);
});

test('le rapport art documente le master, les deux empreintes et le refus des faux médias', async () => {
  const report = await readFile('docs/V68_QZ17_ART_QA.md', 'utf8');
  assert.match(report, /59e10b44492cdaff95ef8826110a184b34002793f9d6a90cdfa9844f42e7a883/);
  assert.match(report, /1161105d13288a8105829b338192f99d3d205b380b5f564f372f9adcb4e2165c/);
  assert.match(report, /Aucun faux média audio ou vidéo/);
});
