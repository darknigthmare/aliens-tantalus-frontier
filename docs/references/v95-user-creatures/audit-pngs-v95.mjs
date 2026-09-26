// Read-only PNG measurement: this module has no encoder and never writes files.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function decode(bytes) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length >= 45, 'Missing PNG bytes');
  assert.ok(bytes.subarray(0, 8).equals(signature), 'Invalid PNG signature');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'IHDR must be first');
  assert.equal(bytes.readUInt32BE(8), 13, 'Invalid IHDR size');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0 && width * height <= 64_000_000, 'Invalid or excessive dimensions');
  assert.deepEqual([...bytes.subarray(24, 29)], [8, 6, 0, 0, 0], 'Requires native RGBA8 non-interlaced PNG; no alpha conversion');
  const chunks = []; let offset = 8, ended = false;
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    assert.ok(offset + size + 12 <= bytes.length, `Truncated ${type} chunk`);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + size));
    offset += size + 12;
    if (type === 'IEND') { assert.equal(size, 0); ended = true; break; }
  }
  assert.ok(ended && chunks.length, 'Missing IEND or IDAT');
  assert.equal(offset, bytes.length, 'Unexpected bytes after IEND');
  const stride = width * 4, expected = height * (stride + 1);
  const packed = inflateSync(Buffer.concat(chunks), { maxOutputLength: expected });
  assert.equal(packed.length, expected, 'Unexpected decompressed size');
  const pixels = Buffer.alloc(stride * height); let source = 0;
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = packed[source++]; assert.ok(filter <= 4, 'Invalid PNG row filter');
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x, a = x >= 4 ? pixels[i - 4] : 0;
      const b = y ? pixels[i - stride] : 0, c = y && x >= 4 ? pixels[i - stride - 4] : 0;
      const add = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : paeth(a, b, c);
      pixels[i] = (packed[source + x] + add) & 255;
    }
    source += stride;
  }
  return { width, height, pixels };
}

export function auditPngBufferV95(bytes) {
  const { width, height, pixels } = decode(bytes);
  const thresholds = [1, 16, 128, 255];
  const bounds = thresholds.map(() => [width, height, -1, -1]);
  const counts = [0, 0, 0, 0], histogram = new Array(256).fill(0);
  let alphaMin = 255, alphaMax = 0, bodyAlphaSum = 0, alphaWeightedX = 0, alphaWeight = 0;
  const edgeBand = { fraction: 0.08, nonzeroPixels: 0, visiblePixels: 0, maxAlpha: 0 };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const alpha = pixels[(y * width + x) * 4 + 3]; histogram[alpha]++;
    alphaMin = Math.min(alphaMin, alpha); alphaMax = Math.max(alphaMax, alpha);
    for (let t = 0; t < thresholds.length; t++) if (alpha >= thresholds[t]) {
      counts[t]++; const b = bounds[t]; b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], y);
    }
    if (alpha >= 128) bodyAlphaSum += alpha;
    if (alpha >= 16) { alphaWeightedX += (x + 0.5) * alpha; alphaWeight += alpha; }
    if (x < width * 0.08 || x >= width * 0.92 || y < height * 0.08 || y >= height * 0.92) {
      if (alpha > 0) edgeBand.nonzeroPixels++;
      if (alpha >= 16) edgeBand.visiblePixels++;
      edgeBand.maxAlpha = Math.max(edgeBand.maxAlpha, alpha);
    }
  }
  const boxes = bounds.map(b => b[2] < 0 ? null : [b[0], b[1], b[2] + 1, b[3] + 1]);
  const visible = boxes[1];
  const margins = visible ? { left: visible[0], top: visible[1], right: width - visible[2], bottom: height - visible[3] } : null;
  const marginFractions = margins ? { left: margins.left / width, top: margins.top / height, right: margins.right / width, bottom: margins.bottom / height } : null;
  return {
    width, height, sourceWidth: width, sourceHeight: height, format: 'RGBA8 non-interlaced', bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'), totalPixels: width * height,
    alphaMin, alphaMax, alpha0: histogram[0], alpha1to254: width * height - histogram[0] - histogram[255], alpha255: histogram[255],
    transparentFraction: histogram[0] / (width * height), alphaAtLeast16: counts[1], alphaAtLeast128: counts[2],
    meanBodyAlphaAtLeast128: counts[2] ? bodyAlphaSum / counts[2] : null,
    bboxConvention: '[left, top, rightExclusive, bottomExclusive], zero-based',
    bboxAlphaNonzero: boxes[0], bboxAlphaAtLeast16: visible, alphaBounds: visible, bboxAlphaAtLeast128: boxes[2], bboxAlpha255: boxes[3],
    marginsAlphaAtLeast16: margins, marginFractionsAlphaAtLeast16: marginFractions,
    visiblePadding5Percent: !!marginFractions && Object.values(marginFractions).every(value => value >= 0.05),
    visiblePadding8Percent: !!marginFractions && Object.values(marginFractions).every(value => value >= 0.08),
    outer8PercentBand: edgeBand,
    pivotCandidates: visible ? {
      // Suggestions only: tails, weapons and airborne subjects require visual selection.
      visibleBoundsBottomCenter: { x: (visible[0] + visible[2]) / (2 * width), y: visible[3] / height },
      alphaWeightedBottom: { x: alphaWeightedX / alphaWeight / width, y: visible[3] / height },
      canvasBottomCenter: { x: 0.5, y: 1 },
      status: 'measurement-only-requires-visual-ground-contact-review'
    } : null
  };
}

export async function auditPngFileV95(path) { return { path: resolve(path), ...auditPngBufferV95(await readFile(path)) }; }

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const paths = process.argv.slice(2);
  if (!paths.length) { console.error('Usage: node docs/references/v95-user-creatures/audit-pngs-v95.mjs <candidate.png> [other.png ...]'); process.exitCode = 1; }
  else {
    const reports = [];
    for (const path of paths) {
      try { reports.push(await auditPngFileV95(path)); }
      catch (error) { reports.push({ path: resolve(path), error: error.message }); process.exitCode = 1; }
    }
    console.log(JSON.stringify(reports, null, 2));
  }
}
