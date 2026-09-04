import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import {
  ALPHA_BRAVO_CONSOLE_SHEET_V69,
  alphaBravoVisualRuntimeReportV69,
  resolveAlphaBravoConsoleCellV69
} from '../src/alpha-bravo-visuals-v69.js';

const EXPECTED_SHA256 = '6b78cfd57a2daadd761d069ba714ed37be375932ca23fa1c6a9ec9fb1c30a327';

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
  const chunks = [];
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
    } else if (type === 'IDAT') chunks.push(data);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  assert.equal(bitDepth, 8);
  assert.equal(colorType, 6, 'atlas V69 attendu en RGBA');
  assert.equal(interlace, 0);
  const packed = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const pixels = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = packed[sourceOffset++];
    const rowOffset = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = packed[sourceOffset + x];
      const left = x >= 4 ? pixels[rowOffset + x - 4] : 0;
      const above = y ? pixels[rowOffset - stride + x] : 0;
      const upperLeft = y && x >= 4 ? pixels[rowOffset - stride + x - 4] : 0;
      if (filter === 0) pixels[rowOffset + x] = raw;
      else if (filter === 1) pixels[rowOffset + x] = (raw + left) & 255;
      else if (filter === 2) pixels[rowOffset + x] = (raw + above) & 255;
      else if (filter === 3) pixels[rowOffset + x] = (raw + Math.floor((left + above) / 2)) & 255;
      else if (filter === 4) pixels[rowOffset + x] = (raw + paeth(left, above, upperLeft)) & 255;
      else assert.fail(`filtre PNG non pris en charge: ${filter}`);
    }
    sourceOffset += stride;
  }
  return { width, height, pixels };
}

test('la plaque OpenAI V69 est une vraie grille RGBA 4x2, transparente et immuable', async () => {
  const bytes = await readFile(`.${ALPHA_BRAVO_CONSOLE_SHEET_V69.path}`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), EXPECTED_SHA256);
  const decoded = decodeRgbaPng(bytes);
  assert.equal(decoded.width, 1024);
  assert.equal(decoded.height, 512);
  let transparent = 0;
  let hiddenRgb = 0;
  for (let index = 0; index < decoded.pixels.length; index += 4) {
    if (decoded.pixels[index + 3] !== 0) continue;
    transparent += 1;
    if (decoded.pixels[index] || decoded.pixels[index + 1] || decoded.pixels[index + 2]) hiddenRgb += 1;
  }
  assert.ok(transparent > decoded.width * decoded.height * 0.55);
  assert.equal(hiddenRgb, 0);

  const hashes = new Set();
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const cellBytes = [];
      let occupied = 0;
      let guardLeak = 0;
      for (let localY = 0; localY < 256; localY += 1) {
        for (let localX = 0; localX < 256; localX += 1) {
          const x = column * 256 + localX;
          const y = row * 256 + localY;
          const start = (y * decoded.width + x) * 4;
          const rgba = decoded.pixels.subarray(start, start + 4);
          cellBytes.push(...rgba);
          if (!rgba[3]) continue;
          occupied += 1;
          if (localX < 10 || localX >= 246 || localY < 10 || localY >= 246) guardLeak += 1;
        }
      }
      assert.ok(occupied > 10_000, `console vide ${column},${row}`);
      assert.equal(guardLeak, 0, `fuite de cellule ${column},${row}`);
      hashes.add(createHash('sha256').update(Buffer.from(cellBytes)).digest('hex'));
    }
  }
  assert.equal(hashes.size, 8, 'les huit états doivent être visuellement distincts');
});

test('le registre V69 mappe exactement les deux consoles et leurs quatre états', () => {
  assert.deepEqual(alphaBravoVisualRuntimeReportV69(), { schema: 69, sheets: 1, cells: 8, distinctCells: 8, runtimeReady: true });
  assert.deepEqual(resolveAlphaBravoConsoleCellV69('alpha', 'available'), { column: 0, row: 0 });
  assert.deepEqual(resolveAlphaBravoConsoleCellV69('alpha', 'working'), { column: 2, row: 0 });
  assert.deepEqual(resolveAlphaBravoConsoleCellV69('bravo', 'complete'), { column: 3, row: 1 });
  assert.equal(resolveAlphaBravoConsoleCellV69('charlie', 'working'), null);
});

test('le worker précache le registre et la plaque de consoles V69', async () => {
  const worker = await readFile('sw.js', 'utf8');
  assert.match(worker, /\/src\/alpha-bravo-visuals-v69\.js/);
  assert.match(worker, /\/assets\/openai\/sprites\/normalized\/props\/alpha-bravo-task-consoles-atlas-v69\.png/);
});
