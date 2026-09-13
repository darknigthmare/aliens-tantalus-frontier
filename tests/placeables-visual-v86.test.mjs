import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { PLACEABLE_VISUAL_PROFILES_V86 as PROFILES, resolvePlaceableDrawSpecV86 as resolveSpec, drawPlaceablesV86, drawPlaceableHudV86 } from '../src/placeables-visual-v86.js';
import { PLACEABLE_CATALOG_V86 } from '../src/placeables-state-v86.js';

const item = (profile = PROFILES[0], patch = {}) => ({ instanceId: `qa-${profile.kind}`, catalogId: profile.catalogId, kind: profile.kind, status: 'deployed', onGround: true, x: 100, y: 200, ...profile.physicalSize, facing: 1, health: 100, maxHealth: 100, ammo: 150, maxAmmo: 150, armed: true, duration: 30, ...patch });
const fakeImage = () => ({ complete: true, naturalWidth: 512, naturalHeight: 512 });
function fixture(instances = PROFILES.map(profile => item(profile))) {
  return { canvas: { width: 1280, height: 720 }, images: new Map(PROFILES.map(profile => [profile.imageKey, fakeImage()])), placeablesV86: { schema: 86, instances }, placeablePreviewsV86: new Map(), placeableTasksV86: new Map() };
}
function context() {
  const calls = [], target = { measureText: text => ({ width: text.length * 6 }) };
  return { calls, ctx: new Proxy(target, { get: (object, key) => key in object ? object[key] : (...args) => calls.push([key, ...args]), set: (object, key, value) => { object[key] = value; calls.push(['set', key, value]); return true; } }) };
}
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.000001, `${a} != ${b}`);

// Same PNG unfiltering contract as the existing V70 art tests, kept local so
// this renderer test does not import another test suite or write QA images.
function decodePng(bytes) {
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = []; let offset = 8;
  while (offset + 12 <= bytes.length) { const size = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8); if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + size)); offset += size + 12; if (type === 'IEND') break; }
  const packed = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = Buffer.alloc(stride * height); let source = 0;
  const paeth = (a, b, c) => { const p = a + b - c, d = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)]; return d[0] <= d[1] && d[0] <= d[2] ? a : d[1] <= d[2] ? b : c; };
  for (let y = 0; y < height; y += 1) { const filter = packed[source++]; assert.ok(filter <= 4); for (let x = 0; x < stride; x += 1) { const pos = y * stride + x, a = x >= 4 ? pixels[pos - 4] : 0, b = y ? pixels[pos - stride] : 0, c = y && x >= 4 ? pixels[pos - stride - 4] : 0; const add = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter]; pixels[pos] = (packed[source + x] + add) & 255; } source += stride; }
  return { width, height, pixels };
}

test('V86 binds only the four existing dedicated equipment identities; no barricade substitute', () => {
  assert.deepEqual(PROFILES.map(profile => profile.kind), ['sentry','cryo-trap','shock-trap','containment']);
  assert.ok(Object.isFrozen(PROFILES) && PROFILES.every(profile => Object.isFrozen(profile.contacts) && Object.isFrozen(profile.bounds[0])));
  assert.equal(PROFILES.filter(profile => profile.limitedView).length, 2);
  assert.ok(PROFILES.every(profile => profile.path.includes('/normalized/tools/') && !profile.path.includes('ua-571')));
});

for (const profile of PROFILES) test(`V86 real PNG remains unchanged and every measured contact matches alpha: ${profile.kind}`, async () => {
  const bytes = await readFile(new URL(`..${profile.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), profile.sha256, 'existing bitmap changed; re-audit anchors before updating receipt');
  const { width, height, pixels } = decodePng(bytes); assert.deepEqual([width, height], [512, 512]);
  let clear = 0; const hashes = [];
  for (let frame = 0; frame < 4; frame += 1) {
    const box = [256, 256, 0, 0], alpha = [];
    for (let y = 0; y < 256; y += 1) for (let x = 0; x < 256; x += 1) { const a = pixels[((Math.floor(frame / 2) * 256 + y) * width + frame % 2 * 256 + x) * 4 + 3]; alpha.push(a); if (a === 0) clear += 1; if (a <= 16) continue; box[0] = Math.min(box[0], x); box[1] = Math.min(box[1], y); box[2] = Math.max(box[2], x + 1); box[3] = Math.max(box[3], y + 1); }
    assert.deepEqual(box, profile.bounds[frame]); assert.equal(profile.contacts[frame], box[3]);
    assert.ok(Math.min(box[0], box[1], 256 - box[2], 256 - box[3]) >= 16);
    hashes.push(createHash('sha256').update(Buffer.from(alpha)).digest('hex'));
  }
  assert.ok(clear / (width * height) > 0.6); assert.equal(new Set(hashes).size, 4);
});

test('V86 every drawn pose reaches its physical ground plane in both facings without anisotropic scale', () => {
  for (const profile of PROFILES) for (const facing of [-1,1]) for (const patch of [{}, { status: 'carried' }, { firingClockV86: 0.1 }, { status: 'spent', armed: false, duration: 0 }, { status: 'destroyed' }]) {
    const source = item(profile, { facing, ...patch }), spec = resolveSpec(source);
    close(spec.visible.y + spec.visible.h, source.y + source.h); close(spec.sprite.w, spec.sprite.h);
    assert.equal(spec.scale, profile.scale); assert.equal(spec.flip, facing !== profile.nativeFacing);
    assert.ok(spec.visible.x >= source.x - 1 && spec.visible.x + spec.visible.w <= source.x + source.w + 1);
    assert.ok(spec.visible.y >= source.y - 1);
  }
});

test('V86 only the native-left portable sentry receives the local facing compensation', () => {
  assert.equal(resolveSpec(item(PROFILES[0])).flip, true);
  assert.equal(resolveSpec(item(PROFILES[0], { facing: -1 })).flip, false);
  for (const profile of PROFILES.slice(1)) assert.equal(resolveSpec(item(profile)).flip, false);
});

test('V86 all twelve allowlisted catalogue identities retain their grade while sharing exactly four authored profiles', () => {
  assert.equal(PLACEABLE_CATALOG_V86.length, 12);
  for (const definition of PLACEABLE_CATALOG_V86) {
    const profile = PROFILES.find(profile => profile.kind === definition.kind), spec = resolveSpec(item(profile, { catalogId: definition.catalogId }));
    assert.equal(spec.sourceCatalogId, definition.catalogId); assert.equal(spec.profile, profile);
    assert.equal(spec.sharedVariant, definition.catalogId !== profile.catalogId);
    assert.deepEqual(profile.physicalSize, { w: definition.w, h: definition.h });
  }
  assert.equal(resolveSpec(item(PROFILES[0], { catalogId: 'equipment-050-cryo-mine-field' })), null, 'no modulo alias or invented suffix');
});

test('V86 pose selection is driven by actual state, never animation time or a deployment idle loop', () => {
  assert.equal(resolveSpec(item()).frame, 1);
  assert.equal(resolveSpec(item(PROFILES[0], { firingClockV86: 0.1 })).frame, 2);
  assert.equal(resolveSpec(item(PROFILES[0], { status: 'spent', ammo: 0 })).frame, 1, 'empty turret must not turn into a folded case');
  assert.equal(resolveSpec(item(PROFILES[0], { status: 'destroyed' })).frame, 1);
  assert.equal(resolveSpec(item(PROFILES[1], { status: 'spent', armed: false })).frame, 3);
  assert.equal(resolveSpec(item(PROFILES[2], { armed: false })).frame, 3);
  assert.equal(resolveSpec(item(PROFILES[3], { duration: 0 })).frame, 2, 'closed container retains deployed feet');
  assert.equal(resolveSpec(item(), { packed: true }).frame, 0);
  assert.equal(resolveSpec(item(PROFILES[0], { status: 'carried' }), { preview: true }).frame, 1);
});

test('V86 rejects unknown identities, kind mismatches, malformed coordinates and absent status', () => {
  for (const patch of [{ catalogId: 'B03' }, { kind: 'containment' }, { x: NaN }, { y: Infinity }, { w: 0 }, { h: -1 }, { h: 1025 }, { status: 'magic' }]) assert.equal(resolveSpec(item(PROFILES[0], patch)), null);
  assert.equal(resolveSpec(null), null);
});

test('V86 deployed objects use four real bitmaps and do not draw replacement debug rectangles', () => {
  const engine = fixture(), before = JSON.stringify(engine.placeablesV86), { ctx, calls } = context();
  const report = drawPlaceablesV86(engine, ctx);
  assert.equal(report.drawn, 4); assert.equal(report.limitedView, 2); assert.deepEqual(report.missing, []);
  assert.equal(calls.filter(call => call[0] === 'drawImage').length, 4);
  assert.equal(calls.filter(call => call[0] === 'strokeRect').length, 0);
  assert.equal(JSON.stringify(engine.placeablesV86), before);
});

test('V86 carried inventory is invisible until a genuine deploy task; progress never advances gameplay', () => {
  const carried = item(PROFILES[0], { status: 'carried' }), engine = fixture([carried]);
  assert.equal(drawPlaceablesV86(engine, context().ctx).drawn, 0);
  engine.placeableTasksV86.set('player', { ...carried, type: 'deploy', elapsed: 1.25, duration: 2.5 });
  const before = JSON.stringify([...engine.placeableTasksV86]), { ctx, calls } = context(), report = drawPlaceablesV86(engine, ctx);
  assert.equal(report.drawn, 1); assert.equal(report.tasks, 1);
  const draw = calls.find(call => call[0] === 'drawImage'); assert.deepEqual(draw.slice(2, 6), [0, 0, 256, 256]);
  assert.ok(calls.some(call => call[0] === 'fillText' && call[1] === 'INSTALLATION 50 %'));
  assert.equal(JSON.stringify([...engine.placeableTasksV86]), before); assert.equal(carried.status, 'carried');
});

test('V86 spent legacy stock without on-ground evidence never materializes at the level origin', () => {
  const source = item(PROFILES[1], { status: 'spent', x: 0, y: 0, onGround: false });
  assert.equal(drawPlaceablesV86(fixture([source]), context().ctx).drawn, 0);
  delete source.onGround; assert.equal(drawPlaceablesV86(fixture([source]), context().ctx).drawn, 0);
  source.onGround = true; assert.equal(drawPlaceablesV86(fixture([source]), context().ctx).drawn, 1);
});

test('V86 recovery annotates the existing deployed bitmap without drawing a second object', () => {
  const source = item(), engine = fixture([source]); engine.placeableTasksV86.set('player', { ...source, type: 'recover', elapsed: 1, duration: 2 });
  const { ctx, calls } = context(), report = drawPlaceablesV86(engine, ctx);
  assert.equal(report.drawn, 1); assert.equal(report.tasks, 1); assert.equal(calls.filter(call => call[0] === 'drawImage').length, 1);
  assert.ok(calls.some(call => call[0] === 'fillText' && call[1] === 'RÉCUPÉRATION 50 %'));
});

test('V86 preview uses a real bitmap plus honest footprint and supplied cone geometry/refusal reason', () => {
  const engine = fixture([]), preview = { ...item(), valid: false, reason: 'Passage de porte occupé', range: 620, halfAngleRadians: Math.PI / 3 };
  engine.placeablePreviewsV86.set('player', preview); const { ctx, calls } = context(), report = drawPlaceablesV86(engine, ctx);
  assert.equal(report.previews, 1); assert.equal(calls.filter(call => call[0] === 'drawImage').length, 1);
  assert.deepEqual(calls.find(call => call[0] === 'strokeRect').slice(1), [preview.x, preview.y, preview.w, preview.h]);
  assert.deepEqual(calls.find(call => call[0] === 'arc').slice(1), [preview.x + preview.w / 2, preview.y + 8, 620, -Math.PI / 3, Math.PI / 3]);
  assert.ok(calls.some(call => call[0] === 'fillText' && call[1] === preview.reason));
});

test('V86 no invented range cone for traps or unspecified reach', () => {
  const engine = fixture([]); engine.placeablePreviewsV86.set('player', { ...item(PROFILES[1]), valid: true });
  const { ctx, calls } = context(); drawPlaceablesV86(engine, ctx); assert.equal(calls.some(call => call[0] === 'arc'), false);
});

test('V86 destroyed equipment remains visible with honest offline warning instead of fabricated wreck animation', () => {
  const engine = fixture([item(PROFILES[0], { status: 'destroyed', health: 0 })]), { ctx, calls } = context();
  assert.equal(drawPlaceablesV86(engine, ctx).drawn, 1);
  assert.ok(calls.some(call => call[0] === 'fillText' && call[1] === 'HORS SERVICE'));
  assert.ok(calls.some(call => call[0] === 'set' && call[1] === 'globalAlpha' && call[2] === 0.5));
});

test('V86 refuses missing/wrong-size images without a generic bitmap or debug-box substitution', () => {
  const engine = fixture([item()]); engine.images.set(PROFILES[0].imageKey, { complete: true, naturalWidth: 1024, naturalHeight: 1024 });
  const { ctx, calls } = context(), result = drawPlaceablesV86(engine, ctx);
  assert.equal(result.drawn, 0); assert.deepEqual(result.missing, [PROFILES[0].catalogId]);
  assert.equal(calls.some(call => call[0] === 'drawImage' || call[0] === 'strokeRect'), false);
});

test('V86 missing global Image is safe in headless tests; malformed tasks cannot create objects', () => {
  const previous = globalThis.Image; try {
    delete globalThis.Image; const engine = fixture([item()]); engine.images.clear();
    assert.equal(drawPlaceablesV86(engine, context().ctx).drawn, 0);
    engine.placeableTasksV86.set('player', { type: 'deploy', instanceId: 'unknown', elapsed: 1, duration: 2 });
    assert.equal(drawPlaceablesV86(engine, context().ctx).tasks, 0);
  } finally { if (previous === undefined) delete globalThis.Image; else globalThis.Image = previous; }
});

test('V86 optional caption is only present during a validly identified placement preview', () => {
  const engine = fixture(), { ctx, calls } = context(); assert.deepEqual(drawPlaceableHudV86(engine, ctx), []);
  engine.placeablePreviewsV86.set('player', { ...item(), valid: false, reason: 'Support absent' });
  assert.deepEqual(drawPlaceableHudV86(engine, ctx), ['Support absent']); assert.ok(calls.some(call => call[0] === 'fillText' && call[1] === 'Support absent'));
  assert.deepEqual(drawPlaceablesV86(null, null), { drawn: 0, previews: 0, tasks: 0, missing: [], limitedView: 0 });
});
