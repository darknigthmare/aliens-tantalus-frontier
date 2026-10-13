import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { WEAPONS } from '../src/content-core-v50.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, drawPlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, resolvePlayerTransitRigV128, drawPlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_ACTION_PROP_ASSETS_V127, resolvePlayerActionRigV127, drawPlayerActionRigV127 } from '../src/player-action-rig-v127.js';
import { resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { PLAYER_APPEARANCE_PRESETS_V129, normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { PLAYER_APPEARANCE_PREVIEW_MODES_V128, samplePlayerAppearancePreviewV128 } from '../src/player-appearance-preview-v126.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129, PLAYER_COLONIAL_REFERENCES_V129, PLAYER_COLONIAL_TORSOS_V129,
  PLAYER_COLONIAL_ARM_PARTS_V129, PLAYER_COLONIAL_LEG_DEFINITIONS_V129, PLAYER_COLONIAL_HELMETS_V129,
  PLAYER_COLONIAL_BACKS_V129 } from '../src/player-colonial-art-v129.js';

const repository = fileURLToPath(new URL('../', import.meta.url));
const descriptor = WEAPONS[0], weapon = resolveHeldWeaponProfileV125(descriptor);
const assets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128, ...PLAYER_ACTION_PROP_ASSETS_V127, ...PLAYER_COLONIAL_RIG_ASSETS_V129, weapon];
const images = new Map(assets.map(asset => [asset.imageKey,
  { complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
const colonialAssets = new Map(PLAYER_COLONIAL_RIG_ASSETS_V129.map(asset => [asset.kind, asset]));
const close = (a, b, label = '', tolerance = 1e-6) => assert.ok(Math.abs(a - b) <= tolerance, `${label}: ${a} != ${b}`);
const pointClose = (a, b, label = '') => { close(a.x, b.x, `${label}.x`); close(a.y, b.y, `${label}.y`); };
const transform = (m, p) => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
const inverse = (m, p) => { const det = m.a * m.d - m.b * m.c; return {
  x: (m.d * (p.x - m.e) - m.c * (p.y - m.f)) / det,
  y: (-m.b * (p.x - m.e) + m.a * (p.y - m.f)) / det }; };

// Read the original committed RGBA data. Neither this decoder nor the tests
// create, edit, normalize, recolor or resample any costume image.
const pngs = new Map();
function png(asset) {
  if (pngs.has(asset.imageKey)) return pngs.get(asset.imageKey);
  const bytes = readFileSync(resolve(repository, `.${asset.path}`));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(width, asset.sourceWidth); assert.equal(height, asset.sourceHeight);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.subarray(offset + 4, offset + 8).toString() === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = Buffer.alloc(stride * height);
  assert.equal(raw.length, (stride + 1) * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) {
    const row = y * stride, source = y * (stride + 1), filter = raw[source]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const l = x >= 4 ? pixels[row + x - 4] : 0, u = y ? pixels[row + x - stride] : 0,
        ul = y && x >= 4 ? pixels[row + x - stride - 4] : 0;
      pixels[row + x] = (raw[source + 1 + x] + (filter === 0 ? 0 : filter === 1 ? l : filter === 2 ? u
        : filter === 3 ? Math.floor((l + u) / 2) : paeth(l, u, ul))) & 255;
    }
  }
  const result = { width, height, pixels, alpha(p) { const x = Math.round(p.x), y = Math.round(p.y);
    return x < 0 || x >= width || y < 0 || y >= height ? 0 : pixels[(y * width + x) * 4 + 3]; } };
  pngs.set(asset.imageKey, result); return result;
}
function alphaAt(layer, worldPoint) {
  const local = inverse(layer.matrix, worldPoint), r = layer.sourceRect;
  if (local.x < r.x || local.x >= r.x + r.width || local.y < r.y || local.y >= r.y + r.height) return 0;
  return png(layer.asset).alpha(local);
}
function components(image) {
  if (image.components) return image.components;
  const { width, height, pixels } = image, count = width * height;
  const labels = new Uint32Array(count), queue = new Uint32Array(count); let id = 0;
  for (let start = 0; start < count; start++) {
    if (labels[start] || pixels[start * 4 + 3] < 128) continue;
    id++; let head = 0, tail = 1; queue[0] = start; labels[start] = id;
    while (head < tail) {
      const at = queue[head++], x = at % width;
      for (const next of [x ? at - 1 : -1, x + 1 < width ? at + 1 : -1,
        at >= width ? at - width : -1, at + width < count ? at + width : -1]) {
        if (next < 0 || labels[next] || pixels[next * 4 + 3] < 128) continue;
        labels[next] = id; queue[tail++] = next;
      }
    }
  }
  image.components = labels; return labels;
}
const entries = [
  ...Object.entries(PLAYER_COLONIAL_TORSOS_V129).flatMap(([itemId, views]) => Object.entries(views)
    .flatMap(([facing, poses]) => Object.entries(poses).map(([pose, entry]) => ({ key: `${itemId}/${facing}/${pose}`, ...entry })))),
  ...Object.entries(PLAYER_COLONIAL_ARM_PARTS_V129).flatMap(([itemId, sides]) => Object.entries(sides)
    .flatMap(([side, parts]) => Object.entries(parts).map(([name, part]) => ({ key: `${itemId}/${side}/${name}`, asset: colonialAssets.get('arms'), part })))),
  ...Object.entries(PLAYER_COLONIAL_LEG_DEFINITIONS_V129).flatMap(([itemId, entry]) => [
    { key: `${itemId}/pelvis`, asset: entry.asset, part: entry.parts.pelvis },
    ...['near', 'far'].flatMap(side => Object.entries(entry.parts[side])
      .map(([name, part]) => ({ key: `${itemId}/${side}/${name}`, asset: entry.asset, part })))
  ]),
  ...[PLAYER_COLONIAL_HELMETS_V129, PLAYER_COLONIAL_BACKS_V129].flatMap(registry => Object.entries(registry)
    .flatMap(([itemId, views]) => Object.entries(views).map(([side, entry]) => ({ key: `${itemId}/${side}`, ...entry }))))
];
function host() {
  const calls = [], stack = [], ctx = { save() { stack.push(1); }, restore() { assert.ok(stack.pop()); },
    transform(...values) { assert.ok(values.every(Number.isFinite)); }, drawImage(...args) { calls.push(args); },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {} };
  return { ctx, calls, stack };
}
function renderPreset(preset, mode, facing = 1, time = mode.fixedTime, surface = 'mission', selectedImages = images) {
  const appearance = normalizePlayerAppearanceV126({ schema: 126, slots: preset.slots });
  const sample = samplePlayerAppearancePreviewV128({ appearance, animation: mode.id,
    timeSeconds: time, facing, weaponDescriptor: descriptor });
  const options = { actor: sample.actor, appearance, images: selectedImages, timeSeconds: sample.timeSeconds, surface };
  const decorate = bodyRig => resolvePlayerLocomotionRigV129({ ...options, bodyRig,
    legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129 }).bodyRig;
  const transit = sample.transit ? resolvePlayerTransitRigV128({ ...options,
    ladder: sample.ladder, transitState: sample.transitState, legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129 }) : null;
  const action = sample.action ? resolvePlayerActionRigV127({ ...options,
    weaponDescriptor: descriptor, decorateBodyRigV129: decorate }) : null;
  const body = transit?.bodyRig || action?.bodyRig || decorate(resolvePlayerBodyRigV125(options));
  const draw = host(); let result, weaponPose;
  if (transit?.eligible) result = drawPlayerTransitRigV128(draw.ctx, { transitRig: transit, appearance, images: selectedImages });
  else if (action?.eligible) result = drawPlayerActionRigV127(draw.ctx, { actionRig: action, appearance, images: selectedImages });
  else {
    weaponPose = sample.profile ? getHeldWeaponPoseV125({ actor: sample.actor, descriptor, bodyRig: body,
      timeSeconds: sample.timeSeconds, surface }) : null;
    result = drawPlayerModularRigV126(draw.ctx, { bodyRig: body, appearance, images: selectedImages,
      ...(weaponPose ? { weaponPose, drawWeapon() {} } : {}) });
  }
  return { sample, body, result, action, transit, draw, weaponPose };
}
const allRenders = () => PLAYER_APPEARANCE_PRESETS_V129.flatMap(preset => [-1, 1].flatMap(facing =>
  PLAYER_APPEARANCE_PREVIEW_MODES_V128.map(mode => ({ key: `${preset.id}/${facing}/${mode.id}`,
    preset, facing, mode, ...renderPreset(preset, mode, facing) }))));
let rendered;
const renders = () => rendered ||= allRenders();

test('five original PNGs match their native dimensions, RGBA format, hashes and declared provenance', () => {
  assert.equal(PLAYER_COLONIAL_RIG_ASSETS_V129.length, 5);
  assert.equal(new Set(PLAYER_COLONIAL_RIG_ASSETS_V129.map(asset => asset.sha256)).size, 5);
  for (const asset of PLAYER_COLONIAL_RIG_ASSETS_V129) {
    const image = png(asset); let transparent = 0, opaque = 0;
    for (let n = 3; n < image.pixels.length; n += 4) { transparent += image.pixels[n] === 0; opaque += image.pixels[n] >= 220; }
    assert.ok(transparent > image.width * image.height * .12, `${asset.kind}: actual transparency`);
    assert.ok(opaque > image.width * image.height * .08, `${asset.kind}: actual garment pixels`);
    assert.equal(asset.exact, false); assert.equal(asset.sourceWork, 'Aliens (1986)');
    assert.equal(asset.provenance, 'film-reference-adaptation');
    assert.ok(asset.path.startsWith('/assets/openai/sprites/player/colonial-v129/'));
  }
  assert.ok(PLAYER_COLONIAL_REFERENCES_V129.some(source => source.kind === 'screen-used-prop-collection'));
  assert.ok(PLAYER_COLONIAL_REFERENCES_V129.some(source => source.kind.includes('replica')));
  assert.ok(PLAYER_COLONIAL_REFERENCES_V129.some(source => source.kind === 'licensed-neca-figure'));
});

test('every measured source rectangle stays native and excludes a neighboring garment silhouette', () => {
  assert.equal(entries.length, 68);
  for (const { key, asset, part } of entries) {
    const image = png(asset), r = part.source;
    assert.ok([r.x, r.y, r.width, r.height].every(Number.isFinite), key);
    assert.ok(r.x >= 0 && r.y >= 0 && r.width > 0 && r.height > 0
      && r.x + r.width <= image.width && r.y + r.height <= image.height, key);
    const labels = components(image), counts = new Map();
    for (let y = Math.ceil(r.y); y < r.y + r.height; y++) for (let x = Math.ceil(r.x); x < r.x + r.width; x++) {
      const id = labels[y * image.width + x]; if (id) counts.set(id, (counts.get(id) || 0) + 1);
    }
    const ordered = [...counts.values()].sort((a, b) => b - a), total = ordered.reduce((a, b) => a + b, 0);
    assert.ok(total > 400, `${key}: meaningful garment pixels`);
    // Antialiasing specks and intentionally detached fasteners may remain;
    // another sleeve/boot/helmet silhouette must not enter this source cut.
    assert.ok((ordered[1] || 0) < Math.max(32, total * .015), `${key}: second silhouette ${ordered[1]} / ${total}`);
  }
});

test('all measured limb attachment anchors sit on opaque cloth, skin, armor or boot pixels', () => {
  for (const { key, asset, part } of entries.filter(entry => entry.key.startsWith('arms-') || entry.key.startsWith('legs-'))) {
    const image = png(asset);
    for (const [name, anchor] of Object.entries(part)) {
      if (name === 'source' || !anchor || !Number.isFinite(anchor.x) || !Number.isFinite(anchor.y)) continue;
      assert.ok(image.alpha(anchor) >= 220, `${key}/${name}: opaque joint ${anchor.x},${anchor.y}`);
    }
  }
});

test('all four costume selections render through the fourteen actual preview modes in both directions', () => {
  assert.equal(renders().length, 112);
  for (const item of renders()) {
    assert.equal(item.result.drawn, true, `${item.key}: ${item.result.reason}`);
    assert.equal(item.draw.stack.length, 0, item.key); assert.ok(item.draw.calls.length >= 16, item.key);
    assert.deepEqual(item.result.effectiveSlots, item.preset.slots, item.key);
    assert.equal(item.result.layers.filter(layer => layer.slot === 'legs').length, 7, item.key);
    assert.equal(item.result.layers.filter(layer => layer.slot === 'arms').length, 6, item.key);
    assert.ok(item.result.layers.filter(layer => layer.slot === 'legs').every(layer =>
      layer.asset.imageKey === colonialAssets.get('legs').imageKey), item.key);
    assert.ok(item.result.layers.filter(layer => layer.slot === 'arms').every(layer =>
      layer.asset.imageKey === colonialAssets.get('arms').imageKey), item.key);
    assert.equal(item.body.pivot.x, item.sample.actor.x + item.sample.actor.w / 2, item.key);
    assert.equal(item.body.pivot.y, item.sample.actor.y + item.sample.actor.h, item.key);
  }
});

test('real overlapping pixels close every hip, knee, ankle, elbow and wrist in the composed poses', () => {
  for (const item of renders()) {
    const layers = item.result.layers, legs = item.transit?.legs || item.body.locomotionV129.legs;
    for (const side of ['near', 'far']) {
      const leg = legs[side], arm = item.result.arms[side];
      for (const [a, b, point] of [
        ['pelvis', `${side}-thigh`, leg.hip], [`${side}-thigh`, `${side}-shin`, leg.knee],
        [`${side}-shin`, `${side}-boot`, leg.ankle], [`${side}-upper`, `${side}-fore`, arm.elbow],
        [`${side}-fore`, `${side}-hand`, arm.wrist]
      ]) {
        for (const id of [a, b]) {
          const layer = layers.find(entry => entry.id === id);
          assert.ok(alphaAt(layer, point) >= 220, `${item.key}/${id}: actual opaque overlap`);
        }
      }
      const upper = layers.find(entry => entry.id === `${side}-upper`);
      assert.ok(alphaAt(upper, arm.shoulder) >= 220, `${item.key}/${side}: opaque shoulder root`);
    }
  }
});

const opaquePoints = new Map();
function sourceOpaquePixels(layer) {
  const r = layer.sourceRect, key = `${layer.imageKey}/${r.x}/${r.y}/${r.width}/${r.height}`;
  if (opaquePoints.has(key)) return opaquePoints.get(key);
  const image = png(layer.asset), points = [];
  for (let y = r.y; y < r.y + r.height; y++) for (let x = r.x; x < r.x + r.width; x++) {
    if (image.pixels[(y * image.width + x) * 4 + 3] >= 220) points.push(x, y);
  }
  const result = new Float32Array(points); opaquePoints.set(key, result); return result;
}
test('planted soles coincide with the lowest transformed opaque boot pixels rather than an interior pivot', () => {
  let contacts = 0;
  for (const item of renders()) {
    const detail = item.transit?.eligible ? item.transit : item.body.locomotionV129;
    for (const side of ['near', 'far']) {
      const foot = detail.contacts.feet[side]; if (!foot.planted) continue;
      const layer = item.result.layers.find(entry => entry.id === `${side}-boot`), pixels = sourceOpaquePixels(layer);
      const m = layer.matrix; let bottom = -Infinity;
      for (let n = 0; n < pixels.length; n += 2) bottom = Math.max(bottom, m.b * pixels[n] + m.d * pixels[n + 1] + m.f);
      // Native pixel sampling leaves < 0.08 canonical px, far below one
      // displayed pixel. The former interior pivots penetrated by up to 1.04.
      close(bottom, foot.point.y, `${item.key}/${side}: physical sole`, item.body.scale * .08);
      pointClose(transform(m, PLAYER_COLONIAL_LEG_DEFINITIONS_V129[item.preset.slots.legs].parts[side].boot.sole), foot.point);
      contacts++;
    }
  }
  assert.ok(contacts > 140);
});

test('torso lettering and directional head/back art use separately authored views without reflection', () => {
  for (const item of renders()) {
    for (const id of ['torso', 'helmet', 'back']) {
      const layer = item.result.layers.find(entry => entry.id === id); assert.ok(layer, `${item.key}/${id}`);
      const det = layer.matrix.a * layer.matrix.d - layer.matrix.b * layer.matrix.c;
      assert.ok(det > 0, `${item.key}/${id}: native orientation retained`);
      if (id === 'torso') assert.equal(layer.asset.imageKey,
        colonialAssets.get(item.facing < 0 ? 'torso-left' : 'torso-right').imageKey, item.key);
    }
  }
  // Limb textures deliberately remain shared right/left art. Their near/far
  // role and geometry still differ; tiny arm insignia are not certified type.
});

test('a missing costume page fails before painting while actor, pose and saved selection remain intact', () => {
  const mode = PLAYER_APPEARANCE_PREVIEW_MODES_V128.find(mode => mode.id === 'aim');
  for (const preset of PLAYER_APPEARANCE_PRESETS_V129) for (const asset of PLAYER_COLONIAL_RIG_ASSETS_V129) {
    const facing = asset.kind === 'torso-left' ? -1 : 1;
    const complete = renderPreset(preset, mode, facing), unavailable = new Map(images); unavailable.delete(asset.imageKey);
    const missing = renderPreset(preset, mode, facing, mode.fixedTime, 'mission', unavailable);
    assert.equal(missing.result.drawn, false, `${preset.id}/${asset.kind}`);
    assert.equal(missing.draw.calls.length, 0); assert.equal(missing.draw.stack.length, 0);
    assert.deepEqual(missing.body.shoulders, complete.body.shoulders);
    assert.deepEqual(missing.body.matrix, complete.body.matrix);
    assert.deepEqual(missing.body.locomotionV129.legs, complete.body.locomotionV129.legs);
    assert.deepEqual(missing.sample.actor, complete.sample.actor);
    assert.deepEqual(missing.weaponPose, complete.weaponPose);
  }
});
