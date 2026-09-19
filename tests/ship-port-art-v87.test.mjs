import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { PORT_ART_V87, PORT_PROP_RECTS_V87, isPortArtReadyV87, resolvePortVendorFrameV87,
  drawPortVendorV87, getPortPropBoundsV87, drawPortPropV87 } from '../src/ship-port-art-v87.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
const imageFor = kind => ({ complete: true, naturalWidth: 1536, naturalHeight: 1024, src: PORT_ART_V87[kind].path });
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function recorder() {
  const calls = [];
  return { calls, ctx: Object.fromEntries(['save', 'restore', 'translate', 'scale', 'drawImage'].map(name =>
    [name, (...args) => calls.push([name, ...args])])) };
}

// Read-only PNG decoding: verify real pixels rather than accepting a manifest.
function decodePng(bytes) {
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  let offset = 8; const chunks = [];
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

function alphaComponents({ width, height, pixels }) {
  const labels = new Int32Array(width * height), queue = new Int32Array(width * height), components = [];
  let label = 0;
  for (let pixel = 0; pixel < labels.length; pixel++) {
    if (labels[pixel] || pixels[pixel * 4 + 3] < 8) continue;
    label++; labels[pixel] = label; queue[0] = pixel;
    let head = 0, tail = 1, minX = width, minY = height, maxX = 0, maxY = 0;
    while (head < tail) {
      const current = queue[head++], x = current % width, y = Math.floor(current / width);
      minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dy) || x + dx < 0 || x + dx >= width || y + dy < 0 || y + dy >= height) continue;
        const next = current + dy * width + dx;
        if (!labels[next] && pixels[next * 4 + 3] >= 8) { labels[next] = label; queue[tail++] = next; }
      }
    }
    if (tail >= 300) components.push({ label, count: tail, x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  return { labels, components };
}

const decoded = new Map();
async function realAsset(kind) {
  if (!decoded.has(kind)) decoded.set(kind, (async () => {
    const definition = PORT_ART_V87[kind], bytes = await readFile(new URL(`..${definition.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), definition.sha256, 'Image changed: inspect alpha and pivots again');
    const image = decodePng(bytes);
    assert.deepEqual([image.width, image.height], [definition.width, definition.height]);
    return { ...image, ...alphaComponents(image) };
  })());
  return decoded.get(kind);
}

test('port assets are immutable, distinct, and do not claim certified walking animation', () => {
  assert.notEqual(PORT_ART_V87.vendor.path, PORT_ART_V87.props.path);
  const verifyFrozen = value => {
    if (!value || typeof value !== 'object') return;
    assert.equal(Object.isFrozen(value), true); Object.values(value).forEach(verifyFrozen);
  };
  verifyFrozen(PORT_ART_V87); verifyFrozen(PORT_PROP_RECTS_V87);
  assert.equal(PORT_ART_V87.vendor.referenceHeight, 92);
  assert.equal(PORT_ART_V87.vendor.worldScale, .4);
  assert.deepEqual(PORT_ART_V87.vendor.coverage, { authoredPoses: 16, runtimePoses: 8, fluidityCertified: false, walkRuntimeEnabled: false });
  assert.deepEqual(PORT_ART_V87.vendor.clips.walk.frames, [8,9,10,11,12,13,14,15]);
  assert.equal(PORT_ART_V87.vendor.clips.walk.runtimeEnabled, false);
});

for (const kind of ['vendor', 'props']) {
  test(`${kind}: actual PNG bodies are wholly inside unique crops, without another sprite or white background`, async () => {
    const asset = await realAsset(kind), majorLabels = new Set(asset.components.map(component => component.label));
    const crops = kind === 'vendor' ? PORT_ART_V87.vendor.frames : Object.entries(PORT_PROP_RECTS_V87).map(([id, rect]) =>
      ({ id, x: rect[0], y: rect[1], w: rect[2] - rect[0], h: rect[3] - rect[1] }));
    assert.equal(asset.components.length, crops.length);
    const claimed = new Set();
    let transparent = 0;
    for (let pixel = 0; pixel < asset.width * asset.height; pixel++) if (asset.pixels[pixel * 4 + 3] === 0) transparent++;
    assert.ok(transparent > asset.width * asset.height * .4);
    for (const crop of crops) {
      assert.ok([crop.x,crop.y,crop.w,crop.h].every(Number.isInteger));
      assert.ok(crop.x > 0 && crop.y > 0 && crop.x + crop.w < asset.width && crop.y + crop.h < asset.height);
      const bodies = asset.components.filter(body => overlaps(crop, body));
      assert.equal(bodies.length, 1, `crop ${crop.index ?? crop.id} contains exactly its own body`);
      const body = bodies[0]; assert.equal(claimed.has(body.label), false); claimed.add(body.label);
      assert.ok(crop.x <= body.x && crop.y <= body.y && crop.x + crop.w >= body.x + body.w && crop.y + crop.h >= body.y + body.h);
      let grounded = 0;
      for (let y = crop.y; y < crop.y + crop.h; y++) for (let x = crop.x; x < crop.x + crop.w; x++) {
        const pixel = y * asset.width + x, label = asset.labels[pixel];
        if (majorLabels.has(label)) assert.equal(label, body.label, 'No neighboring silhouette may be sampled');
        if (kind === 'vendor' && y < crop.y + crop.pivotY && y >= crop.y + crop.pivotY - 4 && asset.pixels[pixel * 4 + 3] >= 128) grounded++;
      }
      if (kind === 'vendor') {
        assert.ok(grounded >= 3); assert.ok(crop.pivotX > 0 && crop.pivotX < crop.w);
        assert.ok(crop.pivotY > 0 && crop.pivotY < crop.h && crop.h - crop.pivotY <= 4);
      }
      for (const other of crops) if (other !== crop) assert.equal(overlaps(crop, other), false);
    }
    assert.equal(claimed.size, crops.length);
  });
}

test('real idle body has 92px reference height and measured support at its feet', async () => {
  const asset = await realAsset('vendor'), frame = PORT_ART_V87.vendor.frames[0];
  const body = asset.components.find(component => overlaps(frame, component));
  close(body.h * PORT_ART_V87.vendor.worldScale, 92);
  close((frame.y + frame.pivotY - body.y) * PORT_ART_V87.vendor.worldScale, 91.6);
  assert.ok(frame.w < 384 / 3, 'tight crop must remove distant weak alpha specks');
});

test('props use measured independent extents instead of a destructive grid', () => {
  assert.deepEqual(Object.keys(PORT_PROP_RECTS_V87), ['door','terminal','counter','gate','shelf','carrier','dockingClamp','lamp']);
  assert.ok(PORT_PROP_RECTS_V87.door[2] > 384);
  assert.ok(PORT_PROP_RECTS_V87.counter[0] < 768 && PORT_PROP_RECTS_V87.counter[2] > 768);
  assert.ok(PORT_PROP_RECTS_V87.dockingClamp[0] < 768 && PORT_PROP_RECTS_V87.dockingClamp[2] > 768);
});

test('runtime vendor resolves only idle and conversation poses, with an explicit reduced-motion pose', () => {
  for (const talking of [false, true]) {
    const clipId = talking ? 'talk' : 'idle', clip = PORT_ART_V87.vendor.clips[clipId], visited = new Set();
    for (let step = 0; step < 20; step++) {
      const sample = resolvePortVendorFrameV87({ talking, time: (step + .1) / clip.fps });
      assert.equal(sample.clipId, clipId); visited.add(sample.index); assert.ok(sample.index < 8);
      assert.equal(resolvePortVendorFrameV87({ talking, time: step, reducedMotion: true }).index, clip.frames[0]);
    }
    assert.deepEqual([...visited], clip.frames);
  }
  for (const time of [-1, NaN, Infinity, Number.MAX_VALUE, '1']) assert.equal(resolvePortVendorFrameV87({ time }), null);
  for (const invalid of [{ talking: 'yes' }, { reducedMotion: 1 }]) assert.equal(resolvePortVendorFrameV87(invalid), null);
});

test('vendor 9-argument draws preserve identity, world scale, ground and mirrored facing', () => {
  const image = imageFor('vendor');
  for (const talking of [false, true]) for (const facing of [-1, 1]) for (let step = 0; step < 8; step++) {
    const options = { x: 520, feetY: 624, talking, facing, time: step * .33 }, { calls, ctx } = recorder();
    const sample = resolvePortVendorFrameV87(options);
    assert.equal(drawPortVendorV87(ctx, image, options), true);
    assert.deepEqual(calls.slice(0, 3), [['save'], ['translate', 520, 624], ['scale', facing, 1]]);
    assert.deepEqual(calls.at(-1), ['restore']);
    const draw = calls.find(call => call[0] === 'drawImage').slice(1), frame = sample.frame;
    assert.equal(draw.length, 9); assert.equal(draw[0], image);
    assert.deepEqual(draw.slice(1,5), [frame.x,frame.y,frame.w,frame.h]);
    close(draw[7] / draw[3], .4); close(draw[8] / draw[4], .4);
    close(draw[5] + frame.pivotX * .4, 0); close(draw[6] + frame.pivotY * .4, 0);
  }
});

test('vendor drawing restores its canvas even on a draw exception', () => {
  const { calls, ctx } = recorder(); ctx.drawImage = () => { throw new Error('draw failed'); };
  assert.throws(() => drawPortVendorV87(ctx, imageFor('vendor'), { x: 500, feetY: 624 }), /draw failed/);
  assert.deepEqual(calls.at(-1), ['restore']);
});

test('all props fit width/bottom or a containing rectangle without aspect distortion', () => {
  for (const [kind, rect] of Object.entries(PORT_PROP_RECTS_V87)) {
    const ratio = (rect[2] - rect[0]) / (rect[3] - rect[1]);
    const fromWidth = getPortPropBoundsV87(kind, { x: 600, width: 120, bottom: 624 });
    assert.equal(fromWidth.x, 600); assert.equal(fromWidth.w, 120); close(fromWidth.y + fromWidth.h, 624);
    close(fromWidth.w / fromWidth.h, ratio);
    for (const box of [{ x: 50, y: 70, w: 800, h: 100 }, { x: 50, y: 70, w: 100, h: 800 }]) {
      const fitted = getPortPropBoundsV87(kind, box);
      assert.ok(fitted.w <= box.w + 1e-8 && fitted.h <= box.h + 1e-8);
      close(fitted.x + fitted.w / 2, box.x + box.w / 2); close(fitted.y + fitted.h, box.y + box.h);
      close(fitted.w / fitted.h, ratio);
    }
    const { calls, ctx } = recorder(), image = imageFor('props');
    assert.equal(drawPortPropV87(ctx, image, kind, { x: 600, width: 120, bottom: 624 }), true);
    assert.equal(calls.length, 1); const draw = calls[0].slice(1);
    assert.equal(draw.length, 9); assert.equal(draw[0], image);
    assert.deepEqual(draw.slice(1,5), [rect[0],rect[1],rect[2]-rect[0],rect[3]-rect[1]]);
    assert.deepEqual(draw.slice(5), [fromWidth.x,fromWidth.y,fromWidth.w,fromWidth.h]);
  }
});

test('wrong identity, unloaded assets, invalid geometry and inherited keys never draw a substitute', () => {
  const { calls, ctx } = recorder(), vendor = imageFor('vendor'), props = imageFor('props');
  const options = { x: 500, feetY: 624 }, bounds = { x: 500, width: 80, bottom: 624 };
  for (const [kind, image] of [['vendor',vendor], ['props',props]]) {
    assert.equal(isPortArtReadyV87(kind, { ...image, src: `https://example.invalid${image.src}?v=87` }), true);
    for (const invalid of [null, {}, { ...image, complete: false }, { ...image, naturalWidth: 1535 },
      { ...image, naturalHeight: 1023 }, { ...image, src: '/assets/openai/ship-animals/v87/moka-atlas.png' }, { ...image, src: '' },
      { ...image, currentSrc: '/wrong-file.png' }, imageFor(kind === 'vendor' ? 'props' : 'vendor')]) {
      assert.equal(isPortArtReadyV87(kind, invalid), false);
      assert.equal(kind === 'vendor' ? drawPortVendorV87(ctx, invalid, options) : drawPortPropV87(ctx, invalid, 'counter', bounds), false);
    }
  }
  for (const bad of [null, {}, { ...options, x: NaN }, { ...options, feetY: Infinity }, { ...options, facing: 0 }, { ...options, time: -1 }])
    assert.equal(drawPortVendorV87(ctx, vendor, bad), false);
  for (const bad of [null, {}, { ...bounds, x: NaN }, { ...bounds, width: 0 }, { ...bounds, width: -1 },
    { ...bounds, bottom: Infinity }, { x: 0, y: 0, w: 20, h: -1 }, { x: 0, y: 0, w: '20', h: 10 }]) {
    assert.equal(getPortPropBoundsV87('counter', bad), null); assert.equal(drawPortPropV87(ctx, props, 'counter', bad), false);
  }
  for (const key of ['unknown','constructor','__proto__']) {
    assert.equal(isPortArtReadyV87(key, vendor), false); assert.equal(getPortPropBoundsV87(key, bounds), null);
    assert.equal(drawPortPropV87(ctx, props, key, bounds), false);
  }
  assert.equal(drawPortVendorV87({}, vendor, options), false); assert.equal(drawPortPropV87({}, props, 'counter', bounds), false);
  assert.equal(calls.length, 0);
});
