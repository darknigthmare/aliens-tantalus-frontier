import test from 'node:test';
import assert from 'node:assert/strict';
import { spriteImageDimensions } from './helpers/sprite-image-dimensions.mjs';

// Minimal encoded headers are sufficient here: this helper reads dimensions,
// while the production-art audit is responsible for decoding actual pixels.
function pngHeader(width, height) {
  const bytes = Buffer.alloc(33);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  bytes.writeUInt32BE(13, 8);
  bytes.write('IHDR', 12, 'ascii');
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  bytes[24] = 8;
  bytes[25] = 6;
  return bytes;
}

function chunk(type, payload) {
  const bytes = Buffer.alloc(8 + payload.length + (payload.length & 1));
  bytes.write(type, 0, 'ascii');
  bytes.writeUInt32LE(payload.length, 4);
  payload.copy(bytes, 8);
  return bytes;
}

function webp(...chunks) {
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(body.length + 4, 4);
  header.write('WEBP', 8, 'ascii');
  return Buffer.concat([header, body]);
}

function lossless(width, height) {
  const payload = Buffer.alloc(5);
  payload[0] = 0x2f;
  // The alpha flag must not leak into the 14-bit height value.
  payload.writeUInt32LE(((width - 1) | ((height - 1) << 14) | 0x10000000) >>> 0, 1);
  return chunk('VP8L', payload);
}

function extended(width, height) {
  const payload = Buffer.alloc(10);
  payload[0] = 0x10;
  payload.writeUIntLE(width - 1, 4, 3);
  payload.writeUIntLE(height - 1, 7, 3);
  return chunk('VP8X', payload);
}

test('PNG dimensions come from the big-endian IHDR bytes', () => {
  for (const [width, height] of [[1024, 2048], [257, 513]]) {
    assert.deepEqual(spriteImageDimensions(pngHeader(width, height)), { width, height });
  }
});

test('lossless VP8L dimensions decode the packed 14-bit fields and plus-one offsets', () => {
  for (const [width, height] of [[1, 1], [1024, 2048], [16384, 16384]]) {
    assert.deepEqual(spriteImageDimensions(webp(lossless(width, height))), { width, height });
  }
});

test('extended VP8X dimensions decode little-endian 24-bit canvas values', () => {
  for (const [width, height] of [[1, 1], [1024, 2048], [65537, 16777216]]) {
    assert.deepEqual(spriteImageDimensions(webp(extended(width, height))), { width, height });
  }
});

test('WebP skips unrecognized chunks including their odd-length padding', () => {
  const bytes = webp(chunk('JUNK', Buffer.from([1, 2, 3])), extended(1024, 2048));
  assert.deepEqual(spriteImageDimensions(bytes), { width: 1024, height: 2048 });
});

test('lossy VP8 keyframe dimensions exclude the scaling flags', () => {
  const payload = Buffer.alloc(10);
  Buffer.from([0x9d, 0x01, 0x2a]).copy(payload, 3);
  payload.writeUInt16LE(0xc000 | 112, 6);
  payload.writeUInt16LE(0x4000 | 72, 8);
  assert.deepEqual(spriteImageDimensions(webp(chunk('VP8 ', payload))), { width: 112, height: 72 });
});

test('truncated PNG dimension fields and a missing IHDR are rejected', () => {
  const valid = pngHeader(1024, 2048);
  for (let size = 0; size < 24; size += 1) {
    assert.throws(() => spriteImageDimensions(valid.subarray(0, size)), `PNG prefix of ${size} bytes`);
  }
  const missingIhdr = Buffer.from(valid);
  missingIhdr.write('IDAT', 12, 'ascii');
  assert.throws(() => spriteImageDimensions(missingIhdr), /PNG without IHDR/);
});

test('WebP chunks whose declared body exceeds available bytes are rejected', () => {
  const vp8x = webp(extended(1024, 2048));
  assert.throws(() => spriteImageDimensions(vp8x.subarray(0, vp8x.length - 1)), /Truncated WebP chunk/);
  const vp8l = webp(lossless(1024, 2048));
  // Remove the alignment byte and an actual payload byte, not only padding.
  assert.throws(() => spriteImageDimensions(vp8l.subarray(0, vp8l.length - 2)), /Truncated WebP chunk/);
  const oversized = webp(chunk('JUNK', Buffer.alloc(2)));
  oversized.writeUInt32LE(0xffffffff, 16);
  assert.throws(() => spriteImageDimensions(oversized), /Truncated WebP chunk/);
});

test('unsupported formats and WebP chunks without supported dimension headers are rejected', () => {
  for (const bytes of [Buffer.alloc(0), Buffer.from('not an image'), Buffer.from('RIFF0000WAVE')]) {
    assert.throws(() => spriteImageDimensions(bytes), /Unsupported sprite image format/);
  }
  const invalidLossless = Buffer.alloc(5);
  invalidLossless[0] = 0x30;
  for (const bytes of [
    webp(),
    webp(chunk('JUNK', Buffer.from([1, 2, 3]))),
    webp(chunk('VP8L', invalidLossless)),
    webp(chunk('VP8X', Buffer.alloc(9))),
    webp(chunk('VP8 ', Buffer.alloc(10)))
  ]) {
    assert.throws(() => spriteImageDimensions(bytes), /WebP without a supported dimension chunk/);
  }
});
