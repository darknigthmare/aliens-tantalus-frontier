import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

/** Read-only native RGBA verification. No resizing, keying or alpha cleanup. */
export function auditWeaponPngV120(path) {
  const bytes = readFileSync(path);
  if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw new Error('Not a PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  if (bytes[24] !== 8 || bytes[25] !== 6 || bytes[28] !== 0)
    throw new Error('Expected non-interlaced 8-bit native RGBA');
  const chunks = [];
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
    if (type === 'IEND') break;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4;
  if (packed.length !== (stride + 1) * height) throw new Error('Unexpected decoded length');
  const pixels = Buffer.alloc(stride * height);
  let source = 0;
  for (let y = 0; y < height; y++) {
    const filter = packed[source++], row = y * stride;
    if (filter > 4) throw new Error('Unexpected PNG filter');
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[row + x - 4] : 0;
      const above = y ? pixels[row - stride + x] : 0;
      const upperLeft = y && x >= 4 ? pixels[row - stride + x - 4] : 0;
      const predictor = filter === 1 ? left : filter === 2 ? above
        : filter === 3 ? Math.floor((left + above) / 2) : filter === 4 ? paeth(left, above, upperLeft) : 0;
      pixels[row + x] = (packed[source + x] + predictor) & 255;
    }
    source += stride;
  }
  const bounds = [width, height, 0, 0];
  let transparentPixels = 0, lowAlphaPixels = 0, edgeAlphaMax = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const alpha = pixels[(y * width + x) * 4 + 3];
    if (alpha === 0) transparentPixels++;
    else if (alpha < 16) lowAlphaPixels++;
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
      edgeAlphaMax = Math.max(edgeAlphaMax, alpha);
    if (alpha >= 16) {
      bounds[0] = Math.min(bounds[0], x); bounds[1] = Math.min(bounds[1], y);
      bounds[2] = Math.max(bounds[2], x + 1); bounds[3] = Math.max(bounds[3], y + 1);
    }
  }
  return {
    path: String(path), sha256: createHash('sha256').update(bytes).digest('hex'),
    width, height, alphaBoundsThreshold: 16, alphaBounds: bounds,
    transparentPixels, lowAlphaPixels, edgeAlphaMax, pixelEdits: false,
    pixelAlpha: (x, y) => pixels[(y * width + x) * 4 + 3]
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  for (const path of process.argv.slice(2)) {
    const { pixelAlpha, ...receipt } = auditWeaponPngV120(path);
    console.log(JSON.stringify(receipt));
  }
}
