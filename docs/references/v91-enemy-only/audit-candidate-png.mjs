// Read-only candidate audit. PNG unfiltering follows the existing
// tests/placeables-visual-v86.test.mjs decoder; no image encoder or file writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';

function decodeRgbaPng(bytes) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length >= 33, 'Missing PNG bytes');
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Invalid PNG signature');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'IHDR must be first');
  assert.equal(bytes.readUInt32BE(8), 13, 'Invalid IHDR size');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0 && width * height <= 64_000_000, 'Invalid or excessive dimensions');
  assert.equal(bytes[24], 8, 'Only 8-bit PNG supported');
  assert.equal(bytes[25], 6, 'Only RGBA PNG supported; no implied alpha conversion');
  assert.equal(bytes[26], 0, 'Unsupported PNG compression');
  assert.equal(bytes[27], 0, 'Unsupported PNG filter method');
  assert.equal(bytes[28], 0, 'Interlaced PNG not supported');
  const chunks = []; let offset = 8, ended = false;
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    assert.ok(offset + size + 12 <= bytes.length, `Truncated ${type} chunk`);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
    if (type === 'IEND') { ended = true; break; }
  }
  assert.ok(ended && chunks.length, 'Missing IEND or IDAT');
  const stride = width * 4, expected = height * (stride + 1);
  const packed = inflateSync(Buffer.concat(chunks), { maxOutputLength: expected });
  assert.equal(packed.length, expected, 'Unexpected decompressed size');
  const pixels = Buffer.alloc(stride * height); let source = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = packed[source++]; assert.ok(filter <= 4, 'Invalid PNG row filter');
    for (let x = 0; x < stride; x += 1) {
      const pos = y * stride + x, a = x >= 4 ? pixels[pos - 4] : 0;
      const b = y ? pixels[pos - stride] : 0, c = y && x >= 4 ? pixels[pos - stride - 4] : 0;
      const add = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
      pixels[pos] = (packed[source + x] + add) & 255;
    }
    source += stride;
  }
  return { width, height, pixels };
}

export function auditPngBuffer(bytes) {
  const { width, height, pixels } = decodeRgbaPng(bytes);
  let alphaMin = 255, alphaMax = 0, alpha0 = 0, alpha1to254 = 0, alpha255 = 0;
  let minX = width, minY = height, maxX = -1, maxY = -1, alphaAtLeast16 = 0;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const a = pixels[(y * width + x) * 4 + 3];
    alphaMin = Math.min(alphaMin, a); alphaMax = Math.max(alphaMax, a);
    if (a === 0) alpha0 += 1; else if (a === 255) alpha255 += 1; else alpha1to254 += 1;
    if (a >= 16) {
      alphaAtLeast16 += 1;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  // Coordinates are zero-based, with right/bottom EXCLUSIVE, matching Canvas crops.
  const bboxAlphaAtLeast16 = maxX < 0 ? null : [minX, minY, maxX + 1, maxY + 1];
  return {
    width, height, format: 'RGBA8 non-interlaced', bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'), totalPixels: width * height,
    alphaMin, alphaMax, alpha0, alpha1to254, alpha255, alphaAtLeast16,
    bboxConvention: '[left, top, rightExclusive, bottomExclusive], zero-based',
    bboxAlphaAtLeast16,
    bboxSize: bboxAlphaAtLeast16 ? { width: maxX - minX + 1, height: maxY - minY + 1 } : null,
    marginsAlphaAtLeast16: bboxAlphaAtLeast16 ? { left: minX, top: minY, right: width - maxX - 1, bottom: height - maxY - 1 } : null
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const paths = process.argv.slice(2);
  if (!paths.length) {
    console.error('Usage: node docs/references/v91-enemy-only/audit-candidate-png.mjs <candidate.png> [other.png ...]');
    process.exitCode = 1;
  } else {
    const reports = [];
    for (const path of paths) {
      try { reports.push({ path: resolve(path), ...auditPngBuffer(await readFile(path)) }); }
      catch (error) { reports.push({ path: resolve(path), error: error.message }); process.exitCode = 1; }
    }
    console.log(JSON.stringify(reports, null, 2));
  }
}
