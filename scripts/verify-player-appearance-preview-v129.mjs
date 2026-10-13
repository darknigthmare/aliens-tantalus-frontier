import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { WEAPONS } from '../src/content-core-v50.js';
import { PLAYER_APPEARANCE_PRESETS_V129, PLAYER_APPEARANCE_SLOTS_V126,
  normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129 } from '../src/player-colonial-art-v129.js';
import { PLAYER_APPEARANCE_PREVIEW_MODES_V128, createPlayerAppearancePreviewV126 } from '../src/player-appearance-preview-v126.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pistol = WEAPONS.find(weapon => weapon.name === 'M4A3 Service Pistol');
const flush = () => new Promise(resolve => setImmediate(resolve));
const appearanceOf = preset => normalizePlayerAppearanceV126({ schema: 126, slots: preset.slots });
const pngs = new Map(), opaqueRectangles = new Set();
const colonialByPath = new Map(PLAYER_COLONIAL_RIG_ASSETS_V129.map(asset => [asset.path, asset]));

function png(source) {
  if (pngs.has(source)) return pngs.get(source);
  const bytes = fs.readFileSync(path.join(root, source.slice(1)));
  assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
  const image = { bytes, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (colonialByPath.has(source)) {
    assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
    const chunks = [];
    for (let offset = 8; offset < bytes.length;) {
      const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
      if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
      offset += length + 12;
    }
    const raw = inflateSync(Buffer.concat(chunks)), stride = image.width * 4;
    assert.equal(raw.length, image.height * (stride + 1));
    const rgba = Buffer.alloc(image.height * stride);
    const paeth = (a, b, c) => {
      const value = a + b - c, da = Math.abs(value - a), db = Math.abs(value - b), dc = Math.abs(value - c);
      return da <= db && da <= dc ? a : db <= dc ? b : c;
    };
    for (let y = 0; y < image.height; y++) {
      const row = y * stride, rawRow = y * (stride + 1), filter = raw[rawRow];
      assert.ok(filter <= 4);
      for (let x = 0; x < stride; x++) {
        const left = x >= 4 ? rgba[row + x - 4] : 0;
        const up = y ? rgba[row + x - stride] : 0;
        const upperLeft = y && x >= 4 ? rgba[row + x - stride - 4] : 0;
        rgba[row + x] = raw[rawRow + 1 + x] + (filter === 0 ? 0 : filter === 1 ? left
          : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, upperLeft));
      }
    }
    image.rgba = rgba;
  }
  pngs.set(source, image);
  return image;
}

function hasOpaquePixels(source, rectangle) {
  const image = png(source), key = `${source}:${rectangle.join(',')}`;
  if (!image.rgba || opaqueRectangles.has(key)) return true;
  const [left, top, width, height] = rectangle;
  for (let y = Math.ceil(top); y < top + height; y++) {
    for (let x = Math.ceil(left); x < left + width; x++) {
      if (image.rgba[(y * image.width + x) * 4 + 3] >= 32) {
        opaqueRectangles.add(key); return true;
      }
    }
  }
  return false;
}

function environment(t, { pending = false, decoding = false, wrongSize = null } = {}) {
  const originals = new Map(['Image', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const frames = new Map(), images = [];
  let time = 100, serial = 0;
  class PreviewImage {
    constructor() {
      this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0;
      this.listeners = new Map(); this.srcValue = ''; this.decoded = null;
      if (decoding) this.decode = () => new Promise(resolve => { this.decoded = resolve; });
      images.push(this);
    }
    set src(value) { this.srcValue = value; if (!pending) this.finish(); }
    get src() { return this.srcValue; }
    addEventListener(type, callback) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(callback);
    }
    removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
    finish() {
      const source = png(this.src);
      this.complete = true; this.naturalWidth = source.width; this.naturalHeight = source.height;
      if (wrongSize?.(this.src)) this.naturalWidth += 1;
      this.onload?.();
      for (const callback of [...(this.listeners.get('load') || [])]) callback();
      this.decoded?.();
    }
  }
  for (const [key, value] of Object.entries({ Image: PreviewImage, performance: { now: () => time },
    requestAnimationFrame: callback => { const id = ++serial; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id) })) Object.defineProperty(globalThis, key,
    { configurable: true, writable: true, value });
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { images, frames, advance(milliseconds) {
    time += milliseconds; const callbacks = [...frames.values()]; frames.clear();
    for (const callback of callbacks) callback(time);
  }, get listeners() { return images.reduce((sum, image) => sum
    + [...image.listeners.values()].reduce((count, callbacks) => count + callbacks.size, 0), 0); } };
}

function canvas() {
  const state = { draws: [], clears: 0, depth: 0 }, stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  const point = (x, y) => ({ x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5] });
  const transform = (a, b, c, d, e, f) => {
    const m = matrix;
    matrix = [m[0] * a + m[2] * b, m[1] * a + m[3] * b,
      m[0] * c + m[2] * d, m[1] * c + m[3] * d,
      m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]];
  };
  const ctx = {
    save() { stack.push([...matrix]); state.depth++; },
    restore() { matrix = stack.pop(); state.depth--; assert.ok(state.depth >= 0); },
    clearRect() { state.clears++; state.draws = []; },
    drawImage(image, ...args) {
      const [x, y, w, h] = args.length === 8 ? args.slice(4) : args;
      state.draws.push({ src: image.src, args, matrix: [...matrix],
        corners: [point(x, y), point(x + w, y), point(x + w, y + h), point(x, y + h)] });
    },
    fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, clip() {},
    translate(x, y) { transform(1, 0, 0, 1, x, y); }, scale(x, y) { transform(x, 0, 0, y, 0, 0); }, transform
  };
  return { width: 360, height: 320, dataset: {}, state, getContext: () => ctx };
}

function verifyComposition(preview, stage, selected, label) {
  const state = preview.getSnapshot();
  assert.equal(state.ready, true, `${label}: ${state.reason}`);
  assert.deepEqual(state.effectiveSlots, selected.slots, label);
  assert.equal(state.images.limit, 12);
  assert.ok(state.images.retained <= state.images.limit, label);
  assert.equal(state.images.loading, 0); assert.equal(state.images.failed, 0);
  assert.equal(stage.state.depth, 0);
  for (const slot of PLAYER_APPEARANCE_SLOTS_V126) {
    const layers = state.layers.filter(layer => layer.slot === slot.id), itemId = selected.slots[slot.id];
    if (itemId === null) assert.equal(layers.length, 0, `${label}/${slot.id}`);
    else {
      assert.ok(layers.length > 0, `${label}/${slot.id}`);
      assert.ok(layers.every(layer => layer.itemId === itemId), `${label}/${slot.id}`);
    }
  }
  assert.equal(state.layers.filter(layer => layer.slot === 'legs').length, 7, `${label}: pelvis and six leg parts`);
  assert.equal(state.layers.filter(layer => layer.slot === 'arms').length, 6, `${label}: two articulated arms and hands`);
  assert.equal(state.layers.find(layer => layer.id === 'bare-head').imageKey, 'playerHeadBackPartsV126',
    'Film equipment preserves the operator’s existing face.');
  for (const draw of stage.state.draws) {
    assert.equal(draw.args.length, 8);
    const [x, y, width, height] = draw.args, image = png(draw.src);
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0
      && x + width <= image.width && y + height <= image.height,
    `${label}: source rectangle must fit the actual ${image.width}×${image.height} PNG ${draw.src}`);
    assert.ok(hasOpaquePixels(draw.src, draw.args.slice(0, 4)), `${label}: a selected part must contain actual opaque PNG pixels.`);
    assert.ok(draw.matrix.every(Number.isFinite));
    assert.ok(Math.abs(draw.matrix[0] * draw.matrix[3] - draw.matrix[1] * draw.matrix[2]) > 1e-12);
    for (const corner of draw.corners) assert.ok(corner.x >= 10 && corner.x <= 350 && corner.y >= 5 && corner.y <= 314,
      `${label}: ${path.basename(draw.src)} outside preview: ${JSON.stringify(corner)}`);
  }
  return state;
}

test('V129 preview art keeps all five exact native PNG dimensions, alpha channels and committed hashes', () => {
  assert.equal(PLAYER_COLONIAL_RIG_ASSETS_V129.length, 5);
  assert.deepEqual(PLAYER_COLONIAL_RIG_ASSETS_V129.map(asset => [asset.kind, asset.sourceWidth, asset.sourceHeight]), [
    ['torso-right', 1086, 1448], ['torso-left', 1086, 1448], ['arms', 1254, 1254],
    ['legs', 1254, 1254], ['head-back', 1536, 1024]
  ]);
  for (const asset of PLAYER_COLONIAL_RIG_ASSETS_V129) {
    const image = png(asset.path);
    assert.equal(image.width, asset.sourceWidth); assert.equal(image.height, asset.sourceHeight);
    assert.equal(createHash('sha256').update(image.bytes).digest('hex'), asset.sha256);
    assert.ok(image.rgba.some((value, index) => index % 4 === 3 && value === 0), 'Independent parts retain transparent gaps.');
    assert.ok(image.rgba.some((value, index) => index % 4 === 3 && value > 200), 'The atlas contains visible art.');
  }
});

// Four Node scenarios cover 112 distinct compositions: 4 costumes × 14 modes
// × 2 authored facings. Each runs the production compositor and checks the
// actual RGBA source rectangles, not a stand-in image or a garment ID alone.
for (const preset of PLAYER_APPEARANCE_PRESETS_V129) {
  test(`V129 ${preset.name}: all 14 reduced-motion poses and both authored sides draw complete selected pieces`, async t => {
    const env = environment(t), stage = canvas(), selected = appearanceOf(preset), before = structuredClone(selected);
    const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, weaponDescriptor: pistol, reducedMotion: true });
    t.after(() => preview.dispose());
    assert.equal(await preview.ready, true);
    for (const mode of PLAYER_APPEARANCE_PREVIEW_MODES_V128) {
      assert.equal(preview.setAnimation(mode.id), mode.id); await flush();
      for (const facing of [-1, 1]) {
        preview.setFacing(facing);
        const label = `${preset.id}/${mode.id}/${facing}`;
        const state = verifyComposition(preview, stage, selected, label);
        assert.equal(state.layers.find(layer => layer.slot === 'torso').imageKey,
          facing < 0 ? 'playerColonialTorsoLeftV129' : 'playerColonialTorsoRightV129');
        assert.equal(state.layers.find(layer => layer.slot === 'helmet').imageKey, 'playerColonialHeadBackV129');
        if (mode.transit || mode.action) assert.equal(state.weaponId, null, `${label}: working or transit hands cannot keep a firearm.`);
        const draws = structuredClone(stage.state.draws);
        env.advance(9000); preview.setFacing(facing);
        assert.deepEqual(stage.state.draws, draws, `${label}: reduced motion fixes the pose and all of its pieces.`);
        assert.equal(preview.getSnapshot().timeSeconds, state.timeSeconds);
        assert.equal(env.frames.size, 0);
      }
    }
    assert.deepEqual(selected, before);
    assert.equal(env.images.filter(image => colonialByPath.has(image.src)).length, 5,
      'Both authored torso views stay ready without reloading their PNG on every turn.');
    preview.dispose();
    assert.equal(preview.getSnapshot().images.retained, 0);
    assert.equal(env.frames.size, 0); assert.equal(env.listeners, 0);
  });
}

test('V129 mixed film and historical pieces preserve every selected slot through all preview actions and transit', async t => {
  const env = environment(t);
  const variants = [
    { helmet: 'helmet-hudson-v129', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
      arms: 'arms-smartgunner-v129', legs: 'legs-uscm-v129', back: 'back-radio-v126' },
    { helmet: 'helmet-patrol-v126', mask: null, torso: 'torso-hicks-v129',
      arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-shoulder-lamp-v129' },
    { helmet: null, mask: 'mask-rebreather-v126', torso: 'torso-smartgunner-v129',
      arms: 'arms-uscm-v129', legs: 'legs-marine-v126', back: null }
  ];
  for (const [index, slots] of variants.entries()) {
    const selected = normalizePlayerAppearanceV126({ schema: 126, slots }), stage = canvas();
    const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, reducedMotion: true, weaponDescriptor: pistol });
    try {
      assert.equal(await preview.ready, true);
      for (const mode of PLAYER_APPEARANCE_PREVIEW_MODES_V128) {
        preview.setAnimation(mode.id); await flush();
        for (const facing of [-1, 1]) {
          preview.setFacing(facing);
          verifyComposition(preview, stage, selected, `mixed-${index}/${mode.id}/${facing}`);
        }
      }
    } finally { preview.dispose(); }
    assert.equal(env.frames.size, 0);
  }
});

test('V129 sparse colonial selections load only the relevant clothing PNGs within the 12-image preview limit', async t => {
  const env = environment(t);
  for (const fixture of [
    { slots: { helmet: 'helmet-hicks-v129' }, expected: ['head-back'] },
    { slots: { arms: 'arms-smartgunner-v129' }, expected: ['arms'] },
    { slots: { legs: 'legs-uscm-v129' }, expected: ['legs'] },
    { slots: { torso: 'torso-hudson-v129' }, expected: ['torso-left', 'torso-right'] },
    { slots: { back: 'back-smartgun-harness-v129' }, expected: ['head-back'] }
  ]) {
    const selected = normalizePlayerAppearanceV126(); Object.assign(selected.slots, fixture.slots);
    const stage = canvas(), preview = createPlayerAppearancePreviewV126(stage,
      { appearance: selected, weaponDescriptor: pistol, reducedMotion: true });
    try {
      assert.equal(await preview.ready, true);
      for (const animation of ['idle', 'medical', 'climb-up', 'walk', 'reload']) {
        preview.setAnimation(animation); await flush();
        const state = verifyComposition(preview, stage, selected, `sparse/${animation}`);
        const colonial = state.images.assets.map(asset => colonialByPath.get(asset.path)?.kind).filter(Boolean).sort();
        assert.deepEqual(colonial, [...fixture.expected].sort());
      }
    } finally { preview.dispose(); }
  }
  assert.equal(env.listeners, 0); assert.equal(env.frames.size, 0);
});

test('V129 late native leg completion satisfies the latest walk selection without reviving cancelled death or ladder previews', async t => {
  const env = environment(t, { pending: true }), stage = canvas(), statuses = [];
  const selected = appearanceOf(PLAYER_APPEARANCE_PRESETS_V129[2]);
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, animation: 'death',
    weaponDescriptor: pistol, onStatus: status => statuses.push(status) });
  t.after(() => preview.dispose());
  const legs = env.images.find(image => image.src.endsWith('/uscm-legs-v129.png'));
  assert.ok(legs);
  preview.setAnimation('climb-down'); preview.setAnimation('walk'); preview.setFacing(-1);
  for (const image of env.images) if (image !== legs) image.finish();
  await flush();
  assert.equal(stage.state.draws.length, 0, 'A complete torso/head/arm set still waits for its actual leg image.');
  assert.equal(preview.getSnapshot().ready, false); assert.equal(env.frames.size, 0);
  assert.equal(env.images.filter(image => image.src === legs.src).length, 1);
  legs.finish(); await flush();
  assert.equal(await preview.ready, false, 'The initial death request was cancelled, not fulfilled by the new pose.');
  const state = verifyComposition(preview, stage, selected, 'late-walk');
  assert.equal(state.animation, 'walk'); assert.equal(state.facing, -1);
  assert.equal(state.transitKind, null); assert.equal(state.previewActor, null);
  assert.equal(state.locomotion.mode, 'walk');
  assert.equal(statuses.filter(status => status.ready).length, 1);
  assert.equal(env.frames.size, 1); assert.equal(env.listeners, 0);
  env.advance(240); assert.equal(preview.getSnapshot().animation, 'walk');
  preview.dispose();
  assert.equal(env.frames.size, 0); assert.equal(preview.getSnapshot().images.retained, 0);
});

test('V129 wrong native side dimensions fail the whole selected outfit instead of stretching a cached image', async t => {
  const env = environment(t, { wrongSize: source => source.endsWith('/uscm-torso-left-v129.png') });
  const stage = canvas(), selected = appearanceOf(PLAYER_APPEARANCE_PRESETS_V129[1]);
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, animation: 'aim', facing: -1,
    reducedMotion: true, weaponDescriptor: pistol });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, false);
  assert.equal(stage.state.draws.length, 0);
  assert.equal(preview.getSnapshot().effectiveSlots, null);
  assert.equal(preview.getSnapshot().images.failed, 1);
  assert.equal(env.frames.size, 0);
  assert.deepEqual(selected, appearanceOf(PLAYER_APPEARANCE_PRESETS_V129[1]));
});

test('V129 closing a pending five-page costume decode settles readiness and blocks every late callback and draw', async t => {
  const env = environment(t, { pending: true, decoding: true }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: appearanceOf(PLAYER_APPEARANCE_PRESETS_V129[3]),
    animation: 'reload', weaponDescriptor: pistol, onStatus: status => statuses.push(status) });
  await flush();
  assert.equal(env.images.filter(image => colonialByPath.has(image.src)).length, 5);
  preview.dispose(); assert.equal(await preview.ready, false);
  const before = { clears: stage.state.clears, statusCount: statuses.length };
  for (const image of env.images) image.finish();
  await flush(); preview.setFacing(-1); preview.setAnimation('climb-up'); env.advance(3000);
  assert.equal(stage.state.clears, before.clears); assert.equal(statuses.length, before.statusCount);
  assert.equal(preview.getSnapshot().images.retained, 0);
  assert.equal(env.frames.size, 0); assert.equal(env.listeners, 0);
});
