import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import {
  SHIP_ANIMAL_ATLASES_V87, SHIP_ANIMAL_CLIPS_V87, resolveShipAnimalFrameV87,
  isShipAnimalAtlasReadyV87, drawShipAnimalV87
} from '../src/ship-animal-art-v87.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const fakeImage = atlas => ({ complete: true, naturalWidth: 1536, naturalHeight: 1024, src: atlas.path });
function recorder() {
  const calls = [];
  const ctx = Object.fromEntries(['save', 'restore', 'translate', 'scale', 'drawImage'].map(name =>
    [name, (...args) => calls.push([name, ...args])]));
  return { calls, ctx };
}

// Read-only RGBA PNG unfiltering, matching the established local art-test contract.
function decodePng(bytes) {
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = []; let offset = 8;
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + size));
    offset += size + 12; if (type === 'IEND') break;
  }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = Buffer.alloc(stride * height);
  assert.equal(packed.length, (stride + 1) * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c; };
  let source = 0;
  for (let y = 0; y < height; y++) {
    const filter = packed[source++]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const pos = y * stride + x, a = x >= 4 ? pixels[pos - 4] : 0, b = y ? pixels[pos - stride] : 0;
      const c = y && x >= 4 ? pixels[pos - stride - 4] : 0;
      pixels[pos] = (packed[source + x] + [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter]) & 255;
    }
    source += stride;
  }
  return { width, height, pixels };
}

function alphaComponents({ width, height, pixels }, threshold = 8) {
  const labels = new Int32Array(width * height), queue = new Int32Array(width * height), components = [];
  let label = 0;
  for (let pixel = 0; pixel < labels.length; pixel++) {
    if (labels[pixel] || pixels[pixel * 4 + 3] < threshold) continue;
    label += 1; labels[pixel] = label; queue[0] = pixel;
    let head = 0, tail = 1, minX = width, minY = height, maxX = 0, maxY = 0;
    while (head < tail) {
      const current = queue[head++], x = current % width, y = Math.floor(current / width);
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dy) || x + dx < 0 || x + dx >= width || y + dy < 0 || y + dy >= height) continue;
        const next = current + dy * width + dx;
        if (!labels[next] && pixels[next * 4 + 3] >= threshold) { labels[next] = label; queue[tail++] = next; }
      }
    }
    if (tail >= 300) components.push({ label, count: tail, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  components.sort((a, b) => Math.floor(a.y / 256) - Math.floor(b.y / 256) || a.x - b.x);
  return { labels, components };
}

test('art identities are explicit, immutable and report the reduced Brume coverage honestly', () => {
  assert.deepEqual(Object.keys(SHIP_ANIMAL_ATLASES_V87), ['animal-moka', 'animal-brume', 'animal-luciole']);
  const cat = SHIP_ANIMAL_ATLASES_V87['animal-moka'], dog = SHIP_ANIMAL_ATLASES_V87['animal-brume'];
  assert.deepEqual(cat.coverage, { totalAuthored: 32, runtimeSafe: 32, excludedFrames: [], fluidityCertified: false });
  assert.deepEqual(dog.coverage, { totalAuthored: 32, runtimeSafe: 30, excludedFrames: [10, 11], fluidityCertified: false });
  assert.deepEqual(dog.clips.idle.frames, [8, 9]); assert.equal(dog.clips.idle.fps, 2);
  assert.match(dog.clips.idle.review, /needs-regeneration/);
  assert.ok(dog.frames[10].exclusionReason && dog.frames[11].exclusionReason);
  assert.ok(Object.isFrozen(SHIP_ANIMAL_ATLASES_V87) && Object.isFrozen(SHIP_ANIMAL_CLIPS_V87));
  assert.ok(Object.values(SHIP_ANIMAL_ATLASES_V87).every(atlas => Object.isFrozen(atlas) && Object.isFrozen(atlas.frames)
    && atlas.frames.every(Object.isFrozen) && Object.isFrozen(atlas.clips) && Object.isFrozen(atlas.coverage)));
  assert.equal(cat.worldScale, 0.20); assert.equal(dog.worldScale, 0.30);
});

for (const atlas of Object.values(SHIP_ANIMAL_ATLASES_V87)) {
  test(`${atlas.animalId}: runtime-safe rectangles are disjoint, inside the image and have ground pivots`, () => {
    assert.equal(atlas.frames.length, 32);
    for (const frame of atlas.frames) {
      assert.ok([frame.x, frame.y, frame.w, frame.h].every(Number.isInteger));
      assert.ok(frame.x >= 0 && frame.y >= 0 && frame.w > 0 && frame.h > 0);
      assert.ok(frame.x + frame.w <= atlas.width && frame.y + frame.h <= atlas.height);
      assert.ok(frame.pivotX > 0 && frame.pivotX < frame.w);
      assert.ok(frame.pivotY > 0 && frame.pivotY < frame.h && frame.h - frame.pivotY <= 12);
      for (const other of atlas.frames) if (other.index !== frame.index && frame.safe && other.safe) assert.equal(overlaps(frame, other), false,
        `crop overlap between ${frame.index}/${other.index}`);
    }
    assert.ok(atlas.frames.some(frame => frame.x < frame.index % 8 * 192 || frame.x + frame.w > (frame.index % 8 + 1) * 192),
      'the real crops intentionally do not use a fixed-width cell grid');
    const used = new Set(Object.values(atlas.clips).flatMap(clip => clip.frames));
    assert.equal(used.size, atlas.coverage.runtimeSafe);
    assert.ok([...used].every(index => atlas.frames[index].safe));
  });

  test(`${atlas.animalId}: actual PNG hash, alpha components, feet and absence of neighboring silhouettes are verified`, async () => {
    const bytes = await readFile(new URL(`..${atlas.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), atlas.sha256, 'atlas changed: review frames again');
    const image = decodePng(bytes);
    assert.deepEqual([image.width, image.height], [1536, 1024]);
    let transparent = 0, nearlyTransparent = 0;
    for (let pixel = 0; pixel < image.width * image.height; pixel++) {
      const alpha = image.pixels[pixel * 4 + 3];
      if (alpha === 0) transparent++;
      if (alpha < 8) nearlyTransparent++;
    }
    // Luciole has denser authored silhouettes and alpha1–4 background fringe.
    // Retain the legacy zero-alpha gate; verify the new PNG's reviewed density
    // plus actual silhouette isolation below instead of modifying its pixels.
    assert.ok(transparent > image.width * image.height * (atlas.animalId === 'animal-luciole' ? .58 : .6));
    assert.ok(nearlyTransparent > image.width * image.height * .6);
    const { components, labels } = alphaComponents(image);
    assert.equal(components.length, 32);
    const majorLabels = new Set(components.map(component => component.label));
    for (const frame of atlas.frames.filter(frame => frame.safe)) {
      const body = components[frame.index];
      assert.ok(body.x > 0 && body.y > 0 && body.x + body.w < image.width && body.y + body.h < image.height,
        `pose ${frame.index} must not be truncated by the atlas boundary`);
      assert.ok(frame.x <= body.x && frame.y <= body.y && frame.x + frame.w >= body.x + body.w
        && frame.y + frame.h >= body.y + body.h, `pose ${frame.index} must preserve its complete alpha>=8 body`);
      let contactPixels = 0;
      const footY = frame.y + frame.pivotY;
      for (let y = frame.y; y < frame.y + frame.h; y++) for (let x = frame.x; x < frame.x + frame.w; x++) {
        const index = y * image.width + x, label = labels[index];
        if (majorLabels.has(label)) assert.equal(label, body.label, `neighbor fragment in pose ${frame.index} at ${x},${y}`);
        if (y < footY && y >= footY - 3 && image.pixels[index * 4 + 3] >= 128) contactPixels++;
      }
      assert.ok(contactPixels >= 3, `pose ${frame.index} paw/body support must meet visible alpha`);
    }
    if (atlas.animalId === 'animal-brume') {
      assert.ok(overlaps(components[10], components[11]), 'the excluded pair must retain the original overlap evidence');
      assert.equal(image.pixels[(335 * image.width + 577) * 4 + 3] <= 15, true);
    }
    if (atlas.animalId === 'animal-luciole') {
      assert.ok(overlaps(components[18], components[19]), 'retain unsafe eating-frame evidence');
      assert.deepEqual(atlas.coverage.excludedFrames, [18, 19]);
      assert.deepEqual(atlas.clips.eat.frames, [16, 17, 20, 21, 22, 23]);
      assert.equal(atlas.coverage.runtimeSafe, 30);
      assert.equal(atlas.coverage.fluidityCertified, false);
      assert.match(atlas.clips.eat.review, /needs-regeneration/);
      // The torso anchor, not alternating contact feet, remains fixed in a walk.
      for (const frame of atlas.frames.slice(0, 8)) assert.equal(frame.x + frame.pivotX, frame.index * 192 + 100);
    }
  });

  test(`${atlas.animalId}: every runtime clip resolves only safe frames of that same identity`, () => {
    for (const [clipId, clip] of Object.entries(atlas.clips)) {
      const visited = new Set();
      for (let step = 0; step < clip.frames.length * 3; step++) {
        const result = resolveShipAnimalFrameV87(atlas.animalId, clipId, (step + 0.1) / clip.fps);
        assert.equal(result.atlas, atlas); assert.equal(result.clip, clip); assert.ok(result.frame.safe);
        assert.ok(clip.frames.includes(result.index)); visited.add(result.index);
      }
      assert.deepEqual([...visited], clip.frames);
    }
  });

  test(`${atlas.animalId}: sitDown and pet are one-shots that hold their final pose`, () => {
    for (const clipId of ['sitDown', 'pet']) {
      const clip = atlas.clips[clipId], duration = clip.frames.length / clip.fps;
      const initial = resolveShipAnimalFrameV87(atlas.animalId, clipId, 0);
      assert.equal(initial.index, clip.frames[0]); assert.equal(initial.complete, false);
      const lastDuring = resolveShipAnimalFrameV87(atlas.animalId, clipId, duration - 0.001);
      assert.equal(lastDuring.index, clip.frames.at(-1)); assert.equal(lastDuring.complete, false);
      for (const elapsed of [duration, duration + 1, 1000]) {
        const final = resolveShipAnimalFrameV87(atlas.animalId, clipId, elapsed);
        assert.equal(final.index, clip.frames.at(-1)); assert.equal(final.complete, true);
      }
    }
    const walk = atlas.clips.walk;
    assert.equal(resolveShipAnimalFrameV87(atlas.animalId, 'walk', walk.frames.length / walk.fps).index, 0);
    assert.equal(resolveShipAnimalFrameV87(atlas.animalId, 'sleep', 500).complete, false);
  });

  test(`${atlas.animalId}: draw uses nine-argument crops at fixed scale and mirrors around the same physical paw anchor`, () => {
    const image = fakeImage(atlas);
    for (const [clipId, clip] of Object.entries(atlas.clips)) for (let step = 0; step < clip.frames.length; step++) {
      for (const facing of [1, -1]) {
        const { calls, ctx } = recorder(), elapsed = (step + 0.1) / clip.fps;
        const sample = resolveShipAnimalFrameV87(atlas.animalId, clipId, elapsed);
        assert.equal(drawShipAnimalV87(ctx, image, { animalId: atlas.animalId, clipId, elapsed, x: 400, y: 610, facing }), true);
        assert.deepEqual(calls[0], ['save']); assert.deepEqual(calls[1], ['translate', 400, 610]);
        assert.deepEqual(calls[2], ['scale', facing, 1]); assert.deepEqual(calls.at(-1), ['restore']);
        const draw = calls.find(call => call[0] === 'drawImage').slice(1);
        assert.equal(draw.length, 9); assert.equal(draw[0], image);
        assert.deepEqual(draw.slice(1, 5), [sample.frame.x, sample.frame.y, sample.frame.w, sample.frame.h]);
        close(draw[7] / draw[3], atlas.worldScale); close(draw[8] / draw[4], atlas.worldScale);
        close(draw[5] + sample.frame.pivotX * atlas.worldScale, 0);
        close(draw[6] + sample.frame.pivotY * atlas.worldScale, 0);
      }
    }
  });
}

test('unknown identities, wrong clips, unready images and wrong-animal images never draw a substitute', () => {
  const cat = SHIP_ANIMAL_ATLASES_V87['animal-moka'], dog = SHIP_ANIMAL_ATLASES_V87['animal-brume'];
  const image = fakeImage(cat), options = { animalId: cat.animalId, x: 100, y: 610 };
  for (const animalId of ['animal-unknown', 'constructor', undefined]) assert.equal(resolveShipAnimalFrameV87(animalId), null);
  assert.equal(resolveShipAnimalFrameV87(cat.animalId, 'unknown'), null);
  for (const elapsed of [NaN, Infinity, -1, Number.MAX_VALUE, '1']) assert.equal(resolveShipAnimalFrameV87(cat.animalId, 'idle', elapsed), null);
  const { calls, ctx } = recorder();
  for (const invalid of [null, {}, { ...image, complete: false }, { ...image, naturalWidth: 1535 },
    { ...image, naturalHeight: 1023 }, fakeImage(dog), { ...image, src: '' }]) {
    assert.equal(isShipAnimalAtlasReadyV87(cat.animalId, invalid), false);
    assert.equal(drawShipAnimalV87(ctx, invalid, options), false);
  }
  for (const invalid of [null, {}, { ...options, x: NaN }, { ...options, y: Infinity },
    { ...options, facing: 0 }, { ...options, animalId: 'animal-unknown' }, { ...options, clipId: 'not-a-clip' }]) {
    assert.equal(drawShipAnimalV87(ctx, image, invalid), false);
  }
  assert.equal(drawShipAnimalV87({}, image, options), false);
  assert.equal(calls.length, 0);
  assert.equal(isShipAnimalAtlasReadyV87(cat.animalId, { ...image, src: `https://example.invalid${cat.path}?v=87` }), true);
});
