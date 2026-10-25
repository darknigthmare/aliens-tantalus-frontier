import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { NPC_MATTE_APERTURES_V164 } from '../src/npc-matte-aperture-data-v164.js';
import { repairNpcMatteAperturePixelsV164 } from '../src/npc-matte-apertures-v164.js';

// The native RGBA decoder is the same bounded PNG reader used by the V134
// verifier. No image files or source pixels are rewritten by this test.
function decodePng(path) {
  const bytes = readFileSync(new URL(`..${path}`, import.meta.url));
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let at = 8; at < bytes.length;) {
    const size = bytes.readUInt32BE(at);
    assert.ok(at + size + 12 <= bytes.length);
    if (bytes.subarray(at + 4, at + 8).toString() === 'IDAT') chunks.push(bytes.subarray(at + 8, at + 8 + size));
    at += size + 12;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4, data = Buffer.alloc(stride * height);
  assert.equal(packed.length, (stride + 1) * height);
  const paeth = (a, b, c) => {
    const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const row = y * stride, source = y * (stride + 1), filter = packed[source]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? data[row + x - 4] : 0, up = y ? data[row + x - stride] : 0;
      const ul = y && x >= 4 ? data[row + x - stride - 4] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, ul);
      data[row + x] = (packed[source + x + 1] + prediction) & 255;
    }
  }
  return { data, width, height };
}

const accepted = new Map([
  ['npc.maksim-orlov.locomotion', { sha: 'cfde33f66024ff7962c6ab250e6962fec4ef9e157af2f20d748adf6c385c6f94', pixels: 396, frames: [0, 1, 2, 3] }],
  ['npc.inez-harlow.locomotion', { sha: 'dd0e93df51e4240ac0a91e2cee6d2b824688afaee88f12a0e86c7ea7e1ed0a92', pixels: 463, frames: [0, 1, 2, 3] }],
  ['npc.asha-mbaye.locomotion', { sha: 'a9cfe2c6df338f0a3c1f743cb936914460c0126b560687785c156b12ce1614c7', pixels: 500, frames: [0, 1, 2, 3] }],
  ['npc.mara-vega.locomotion', { sha: 'b74106a299e1d48fc7acb160940a54285faf405f7e60bd6293203db5f6d4ac35', pixels: 225, frames: [0, 1, 3, 12] }],
]);
const decoded = new Map();
function sourceFor(policy) {
  if (!decoded.has(policy.path)) decoded.set(policy.path, decodePng(policy.path));
  return decoded.get(policy.path);
}
function admittedPixels(policy) {
  const pixels = new Set();
  for (const frame of policy.frames) for (const region of frame.regions) for (const [y, x0, x1] of region.runs) {
    for (let x = x0; x < x1; x++) {
      const pixel = y * policy.width + x;
      assert.ok(!pixels.has(pixel), `A pixel is admitted twice: ${policy.id}, ${x}, ${y}`);
      pixels.add(pixel);
    }
  }
  return pixels;
}
function visibleCellBounds(data, width, index) {
  const ox = (index % 4) * 256, oy = Math.floor(index / 4) * 256;
  let left = 256, top = 256, right = 0, bottom = 0;
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    if (data[((oy + y) * width + ox + x) * 4 + 3] > 32) {
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
    }
  }
  return right ? [left, top, right, bottom] : null;
}

test('only the four reviewed source atlases and their 1,584 exact opaque pocket pixels are admitted', () => {
  assert.equal(NPC_MATTE_APERTURES_V164.length, 4);
  assert.equal(new Set(NPC_MATTE_APERTURES_V164.map(p => p.id)).size, 4);
  assert.equal(new Set(NPC_MATTE_APERTURES_V164.map(p => p.path)).size, 4);
  let total = 0, frames = 0;
  for (const policy of NPC_MATTE_APERTURES_V164) {
    const expected = accepted.get(policy.id); assert.ok(expected, policy.id);
    assert.equal(policy.sourceSha256, expected.sha);
    assert.equal(createHash('sha256').update(readFileSync(new URL(`..${policy.path}`, import.meta.url))).digest('hex'), expected.sha);
    assert.deepEqual([policy.width, policy.height], [1024, 1024]);
    assert.deepEqual(policy.frames.map(f => f.index), expected.frames);
    assert.deepEqual(policy.reviewedFrames, policy.id.includes('mara-vega') ? [0, 1, 2, 3, 12] : [0, 1, 2, 3]);
    const source = sourceFor(policy); assert.deepEqual([source.width, source.height], [1024, 1024]);
    for (const frame of policy.frames) for (const region of frame.regions) {
      const ox = (frame.index % 4) * 256, oy = Math.floor(frame.index / 4) * 256;
      const bytes = []; let count = 0;
      const [left, top, right, bottom] = region.bboxCellLocal;
      assert.ok(left >= 0 && top >= 0 && right <= 256 && bottom <= 256 && left < right && top < bottom);
      for (const run of region.runs) {
        assert.equal(run.length, 3); assert.ok(run.every(Number.isInteger));
        const [y, x0, x1] = run;
        assert.ok(y >= oy + top && y < oy + bottom && x0 >= ox + left && x1 <= ox + right && x0 < x1);
        for (let x = x0; x < x1; x++) {
          const at = (y * policy.width + x) * 4;
          assert.equal(source.data[at + 3], 255, 'Every newly transparent pixel must be one of the reviewed opaque source pixels.');
          bytes.push(...source.data.subarray(at, at + 4)); count++;
        }
      }
      assert.equal(count, region.pixelCount);
      assert.equal(Buffer.from(bytes).toString('hex'), region.expectedRgbaHex);
    }
    assert.equal(admittedPixels(policy).size, expected.pixels);
    assert.equal(policy.maskedPixels, expected.pixels); total += expected.pixels; frames += policy.frames.length;
  }
  assert.equal(total, 1584); assert.equal(frames, 16);
});

test('real PNG repairs change only admitted alpha bytes, retaining all RGB, clothing and 64 cell silhouettes/soles', () => {
  let verifiedCells = 0, inezWhiteUniformPixels = 0;
  for (const policy of NPC_MATTE_APERTURES_V164) {
    const source = sourceFor(policy), original = new Uint8ClampedArray(source.data), allowed = admittedPixels(policy);
    const repaired = repairNpcMatteAperturePixelsV164(source, policy);
    assert.equal(repaired.status, 'corrected'); assert.equal(repaired.alphaChanged, true);
    assert.equal(repaired.changedPixels, policy.maskedPixels); assert.notEqual(repaired.data, source.data);
    assert.deepEqual(source.data, Buffer.from(original), 'The admitted PNG data is immutable.');
    for (let pixel = 0; pixel < source.width * source.height; pixel++) {
      const at = pixel * 4;
      for (let c = 0; c < 3; c++) if (repaired.data[at + c] !== original[at + c]) assert.fail(`Source RGB changed: ${policy.id}, pixel ${pixel}`);
      assert.equal(repaired.data[at + 3], allowed.has(pixel) ? 0 : original[at + 3], `${policy.id}, pixel ${pixel}`);
      if (policy.id.includes('inez-harlow') && !allowed.has(pixel) && original[at + 3] >= 224
        && Math.min(original[at], original[at + 1], original[at + 2]) >= 224) inezWhiteUniformPixels++;
    }
    for (let cell = 0; cell < 16; cell++) {
      assert.deepEqual(visibleCellBounds(repaired.data, source.width, cell), visibleCellBounds(original, source.width, cell), `${policy.id}, cell ${cell}`);
      verifiedCells++;
    }
    if (policy.id.includes('mara-vega')) {
      for (let y = 0; y < 256; y++) {
        const at = (y * source.width + 512) * 4;
        assert.equal(Buffer.compare(Buffer.from(repaired.data.subarray(at, at + 1024)), source.data.subarray(at, at + 1024)), 0,
          'Reviewed Mara cell 2 has no pocket and must remain exact.');
      }
    }
  }
  assert.equal(verifiedCells, 64);
  assert.ok(inezWhiteUniformPixels > 100, 'The white medical uniform is material, not a global chroma key.');
});

test('unknown art, invalid geometry and malformed input are rejected without changing source bytes', () => {
  const policy = NPC_MATTE_APERTURES_V164[0], source = sourceFor(policy), before = new Uint8ClampedArray(source.data);
  for (const input of [null, {}, { ...source, width: 1 }, { ...source, height: 1 }, { ...source, data: new Uint8Array(1) }]) {
    assert.equal(repairNpcMatteAperturePixelsV164(input, policy), null);
  }
  assert.equal(repairNpcMatteAperturePixelsV164(source, null), null);
  assert.equal(repairNpcMatteAperturePixelsV164(source, { ...policy, path: '/assets/unreviewed-white-uniform.png' }), null);
  assert.deepEqual(source.data, Buffer.from(before));
});

test('a one-byte source-signature mismatch refuses the entire repair instead of partially removing a pocket', () => {
  const policy = NPC_MATTE_APERTURES_V164[0], source = sourceFor(policy), data = new Uint8ClampedArray(source.data);
  const pixel = [...admittedPixels(policy)][0]; data[pixel * 4] ^= 1;
  const before = new Uint8ClampedArray(data);
  const result = repairNpcMatteAperturePixelsV164({ ...source, data }, policy);
  assert.equal(result.status, 'source-pixels-mismatch'); assert.equal(result.changedPixels, 0); assert.equal(result.data, data);
  assert.deepEqual(data, before);
});

function fakeDocument({ transform, unreadable = false } = {}) {
  const calls = { reads: 0, writes: 0, draws: 0 };
  const document = {
    createElement(tag) {
      assert.equal(tag, 'canvas');
      const canvas = { width: 0, height: 0 };
      let drawn;
      const context = {
        drawImage(image) { drawn = image; calls.draws++; },
        getImageData(x, y, width, height) {
          calls.reads++;
          if (unreadable) throw new Error('The browser denied canvas pixel access.');
          const path = drawn?.currentSrc || drawn?.src;
          const policy = NPC_MATTE_APERTURES_V164.find(p => p.path === path);
          const rgba = drawn?.__rgba || sourceFor(policy).data;
          const data = new Uint8ClampedArray(rgba);
          transform?.(data);
          assert.equal(data.length, width * height * 4);
          return { data, width, height };
        },
        putImageData(pixels) { canvas.__rgba = new Uint8ClampedArray(pixels.data); calls.writes++; },
      };
      canvas.getContext = () => context;
      return canvas;
    },
  };
  return { document, calls };
}
async function withDocument(options, callback) {
  const previous = globalThis.document, mock = fakeDocument(options);
  globalThis.document = mock.document;
  try { return await callback(mock); } finally { globalThis.document = previous; }
}
const freshRuntime = label => import(`../src/npc-matte-apertures-v164.js?verify-${label}`);
const nativeImage = policy => Object.freeze({ src: policy.path, complete: true, naturalWidth: policy.width, naturalHeight: policy.height });

test('native Images keep their source and geometry while repeated draws share one alpha-corrected drawable', async () => {
  const runtime = await freshRuntime('shared-drawable'), policy = NPC_MATTE_APERTURES_V164[0];
  await withDocument({}, async ({ calls }) => {
    const native = nativeImage(policy), before = { ...native };
    const drawable = runtime.resolveHumanSpriteDrawableV164(native);
    assert.notEqual(drawable, native);
    for (let frame = 0; frame < 120; frame++) assert.equal(runtime.resolveHumanSpriteDrawableV164(native), drawable);
    assert.equal(runtime.resolveHumanSpriteDrawableV164(nativeImage(policy)), drawable, 'The same source path shares one prepared image.');
    const stable = { ...calls };
    assert.ok(stable.reads > 0 && stable.writes > 0);
    for (const pixel of admittedPixels(policy)) assert.equal(drawable.__rgba[pixel * 4 + 3], 0);
    assert.deepEqual(native, before);
    const snapshot = runtime.getNpcMatteApertureSnapshotV164();
    assert.equal(snapshot.preparations, 1); assert.equal(snapshot.cacheHits, 121);
    assert.equal(snapshot.drawRequests, 122); assert.equal(snapshot.correctedDrawRequests, 122);
    assert.equal(snapshot.changedPixels, policy.maskedPixels); assert.equal(snapshot.failures, 0);
    snapshot.assets[0].maskedFrames.push(999);
    assert.ok(!runtime.getNpcMatteApertureSnapshotV164().assets[0].maskedFrames.includes(999),
      'Read-only diagnostics cannot expose the retained cache frame array for mutation.');
    assert.deepEqual(calls, stable, 'Later frames do not repeat pixel readback or upload.');
  });
});

test('the complete admitted atlas working set stays within four images and 16 MiB; unknown and unready images cannot grow it', async () => {
  const runtime = await freshRuntime('cache-budget');
  assert.equal(runtime.NPC_MATTE_RUNTIME_POLICY_V164.cacheEntries, 4);
  assert.equal(runtime.NPC_MATTE_RUNTIME_POLICY_V164.cacheBytes, 16 * 1024 * 1024);
  await withDocument({}, async ({ calls }) => {
    for (const policy of NPC_MATTE_APERTURES_V164) {
      runtime.resolveHumanSpriteDrawableV164(nativeImage(policy));
      const snapshot = runtime.getNpcMatteApertureSnapshotV164();
      assert.ok(snapshot.retainedEntries <= 4); assert.ok(snapshot.retainedBytes <= 16 * 1024 * 1024);
    }
    const snapshot = runtime.getNpcMatteApertureSnapshotV164(), stable = { ...calls };
    assert.equal(snapshot.retainedEntries, 4); assert.equal(snapshot.retainedBytes, 16 * 1024 * 1024);
    assert.equal(snapshot.preparations, 4); assert.equal(snapshot.changedPixels, 1584);
    for (let index = 0; index < 32; index++) {
      const unknown = Object.freeze({ src: `/assets/unreviewed-uniform-${index}.png`, complete: true, naturalWidth: 1024, naturalHeight: 1024 });
      assert.equal(runtime.resolveHumanSpriteDrawableV164(unknown), unknown);
    }
    const policy = NPC_MATTE_APERTURES_V164[0];
    for (const patch of [{ complete: false }, { naturalWidth: 1 }, { naturalHeight: 1 }]) {
      const image = Object.freeze({ ...nativeImage(policy), ...patch });
      assert.equal(runtime.resolveHumanSpriteDrawableV164(image), image, 'A stale ready-cache entry cannot admit an unready native Image.');
    }
    assert.deepEqual(calls, stable);
    assert.equal(runtime.getNpcMatteApertureSnapshotV164().retainedEntries, 4);
    assert.equal(runtime.getNpcMatteApertureSnapshotV164().retainedBytes, 16 * 1024 * 1024);
  });
});

test('mismatched source pixels and unreadable browser canvases fall back without producing transparent clothing', async () => {
  const policy = NPC_MATTE_APERTURES_V164[0], pixel = [...admittedPixels(policy)][0], source = sourceFor(policy);
  const mismatchRuntime = await freshRuntime('drawable-mismatch');
  await withDocument({ transform(data) { data[pixel * 4] = source.data[pixel * 4] ^ 1; } }, async ({ calls }) => {
    const native = nativeImage(policy), drawable = mismatchRuntime.resolveHumanSpriteDrawableV164(native);
    assert.notEqual(drawable.__rgba?.[pixel * 4 + 3], 0);
    const stable = { ...calls };
    for (let frame = 0; frame < 30; frame++) assert.equal(mismatchRuntime.resolveHumanSpriteDrawableV164(native), drawable);
    assert.deepEqual(calls, stable);
    const snapshot = mismatchRuntime.getNpcMatteApertureSnapshotV164();
    assert.equal(snapshot.preparations, 0); assert.equal(snapshot.sourceMismatches, 1); assert.equal(snapshot.changedPixels, 0);
    assert.equal(snapshot.assets[0].sourceSignatureMatched, false); assert.equal(snapshot.assets[0].correctedDrawable, false);
  });
  const unreadableRuntime = await freshRuntime('unreadable-canvas');
  await withDocument({ unreadable: true }, async ({ calls }) => {
    const native = nativeImage(policy), drawable = unreadableRuntime.resolveHumanSpriteDrawableV164(native), stable = { ...calls };
    for (let frame = 0; frame < 30; frame++) assert.equal(unreadableRuntime.resolveHumanSpriteDrawableV164(native), drawable);
    assert.deepEqual(calls, stable, 'A failed browser preparation is retained rather than retried each frame.');
    const snapshot = unreadableRuntime.getNpcMatteApertureSnapshotV164();
    assert.equal(snapshot.failures, 1); assert.equal(snapshot.preparations, 0); assert.equal(snapshot.changedPixels, 0);
    assert.equal(snapshot.retainedBytes, 0);
  });
});

function portraitImage() {
  const listeners = new Map();
  return {
    src: '', currentSrc: '', complete: false, naturalWidth: 1024, naturalHeight: 1024,
    className: 'crew-portrait', alt: 'Existing crew portrait',
    style: { objectFit: 'cover', width: '200px', imageRendering: 'pixelated' },
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(handler);
    },
    removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    handlers(type) { return [...(listeners.get(type) || [])]; },
    emit(type) { for (const handler of [...(listeners.get(type) || [])]) handler(); },
  };
}
function maskPixels(mask) {
  const prefix = 'url("data:image/svg+xml,';
  assert.ok(mask.startsWith(prefix) && mask.endsWith('")'));
  const svg = decodeURIComponent(mask.slice(prefix.length, -2));
  assert.match(svg, /viewBox="0 0 1024 1024"/); assert.match(svg, /fill-rule="evenodd"/);
  const rectangles = [...svg.matchAll(/M(\d+) (\d+)H(\d+)V(\d+)H(\d+)Z/g)];
  assert.ok(rectangles.length > 1); assert.deepEqual(rectangles[0].slice(1).map(Number), [0, 0, 1024, 1024, 0]);
  const pixels = new Set();
  for (const rectangle of rectangles.slice(1)) {
    const [x0, y0, x1, y1, close] = rectangle.slice(1).map(Number);
    assert.equal(close, x0); assert.equal(y1, y0 + 1); assert.ok(x1 > x0);
    for (let x = x0; x < x1; x++) {
      const pixel = y0 * 1024 + x; assert.ok(!pixels.has(pixel)); pixels.add(pixel);
    }
  }
  return pixels;
}

test('portrait loading keeps the original img/src/CSS and masks exactly the admitted holes, with stale-load and non-NPC reset protection', async () => {
  const runtime = await freshRuntime('portrait-lifecycle'), [first, second] = NPC_MATTE_APERTURES_V164;
  await withDocument({}, async () => {
    const image = portraitImage();
    assert.equal(runtime.setNpcPortraitSourceV164(image, first.path), true);
    const staleLoad = image.handlers('load')[0]; assert.ok(staleLoad);
    assert.equal(image.src, first.path); assert.equal(image.style.maskImage, '');
    assert.equal(runtime.setNpcPortraitSourceV164(image, second.path), true);
    const currentLoad = image.handlers('load')[0]; assert.notEqual(currentLoad, staleLoad);
    assert.equal(image.handlers('load').length, 1); assert.equal(image.handlers('error').length, 1);
    image.complete = true; image.currentSrc = first.path;
    staleLoad(); image.emit('load'); assert.equal(image.style.maskImage, '', 'A late old response cannot apply its mask to the next portrait.');
    image.currentSrc = second.path; image.emit('load');
    assert.deepEqual(maskPixels(image.style.maskImage), admittedPixels(second));
    assert.equal(image.style.webkitMaskImage, image.style.maskImage);
    assert.equal(image.style.maskMode, 'alpha'); assert.equal(image.style.maskSize, '100% 100%');
    assert.equal(image.style.maskRepeat, 'no-repeat'); assert.equal(image.src, second.path);
    assert.equal(image.style.objectFit, 'cover'); assert.equal(image.style.width, '200px'); assert.equal(image.style.imageRendering, 'pixelated');
    assert.equal(image.className, 'crew-portrait'); assert.equal(image.alt, 'Existing crew portrait');
    assert.equal(image.handlers('load').length, 0); assert.equal(image.handlers('error').length, 0);
    const mask = image.style.maskImage; staleLoad(); assert.equal(image.style.maskImage, mask);
    assert.equal(runtime.setNpcPortraitSourceV164(image, '/assets/another-dialogue-portrait.png'), false);
    assert.equal(image.src, '/assets/another-dialogue-portrait.png');
    for (const key of ['maskImage', 'webkitMaskImage', 'maskSize', 'webkitMaskSize', 'maskMode', 'maskRepeat', 'webkitMaskRepeat']) assert.equal(image.style[key], '');
    staleLoad(); currentLoad(); assert.equal(image.style.maskImage, '', 'Reusing the img for non-NPC art invalidates every previous callback.');
    assert.equal(runtime.getNpcMatteApertureSnapshotV164().domCorrections, 1);
  });
});

test('wrong-size, failed and source-mismatched portraits preserve their source and remain unmasked', async () => {
  const policy = NPC_MATTE_APERTURES_V164[0], source = sourceFor(policy), pixel = [...admittedPixels(policy)][0];
  const runtime = await freshRuntime('portrait-fallbacks');
  await withDocument({ transform(data) { data[pixel * 4] = source.data[pixel * 4] ^ 1; } }, async () => {
    const wrongSize = portraitImage(); wrongSize.complete = true; wrongSize.naturalWidth = 1;
    assert.equal(runtime.setNpcPortraitSourceV164(wrongSize, policy.path), true);
    assert.equal(wrongSize.style.maskImage, ''); assert.equal(wrongSize.src, policy.path);
    assert.equal(wrongSize.handlers('load').length, 0); assert.equal(wrongSize.handlers('error').length, 0);
    const failed = portraitImage(); runtime.setNpcPortraitSourceV164(failed, policy.path); failed.emit('error');
    assert.equal(failed.handlers('load').length, 0); assert.equal(failed.handlers('error').length, 0);
    assert.equal(failed.style.maskImage, ''); assert.equal(failed.src, policy.path);
    const mismatch = portraitImage(); mismatch.complete = true;
    assert.equal(runtime.setNpcPortraitSourceV164(mismatch, policy.path), true);
    assert.equal(mismatch.style.maskImage, ''); assert.equal(mismatch.src, policy.path);
    const snapshot = runtime.getNpcMatteApertureSnapshotV164();
    assert.equal(snapshot.sourceMismatches, 1); assert.equal(snapshot.domCorrections, 0); assert.equal(snapshot.domFallbacks, 3);
  });
});
