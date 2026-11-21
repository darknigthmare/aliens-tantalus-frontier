import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { XENO_TRIALS_SPRITE_ATLASES_V188 as atlases, XENO_TRIALS_SPRITE_FRAME_IDS_V188 as ids,
  createXenoTrialsSpriteAtlasV188 as create, getXenoTrialsSpriteAtlasV188 as get,
  sampleXenoTrialsSpriteAtlasV188 as sample, getXenoTrialsSpriteLayoutV188 as layout,
  requestXenoTrialsSpriteAtlasV188 as request, drawXenoTrialsSpriteAtlasV188 as draw,
  getXenoTrialsSpriteEnvelopeV188 as envelope } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsArtV96 as art, getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRenderMetricsV110 as metrics, createXenoTrialsCameraV119 as camera } from '../src/xeno-trials-scale-v110.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsReactionObserverV186 } from '../src/xeno-trials-reactions-v186.js';

const actor = (id = 'warrior', extra = {}) => ({ id, x: 500, y: 0, hp: 220, stun: 0, guard: false, facing: 1, ...extra });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const image = atlas => ({ complete: true, naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height });
const store = () => new Map(atlases.map(atlas => [atlas.texture.path, image(atlas)]));
const context = () => { const calls = [], transforms = [], stack = []; return { calls, transforms, stack, ctx: {
  save() { stack.push(1); }, restore() { assert.ok(stack.pop()); }, translate(...args) { transforms.push(args); },
  scale(...args) { transforms.push(args); }, drawImage(...args) { calls.push(args); } } }; };

// Decode actual shipped RGBA bytes. Browser/Canvas stubs below exercise dispatch;
// they are separate from this pixel proof and the native browser recipe.
function png(texture) {
  const bytes = readFileSync(new URL(`..${texture.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), texture.sha256);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.deepEqual([width, height], [texture.width, texture.height]);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let at = 8; at < bytes.length;) {
    const size = bytes.readUInt32BE(at); assert.ok(at + size + 12 <= bytes.length);
    if (bytes.toString('ascii', at + 4, at + 8) === 'IDAT') chunks.push(bytes.subarray(at + 8, at + 8 + size));
    at += size + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * 4, data = Buffer.alloc(stride * height);
  assert.equal(raw.length, (stride + 1) * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) {
    const row = y * stride, start = y * (stride + 1), filter = raw[start]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? data[row + x - 4] : 0, b = y ? data[row + x - stride] : 0, c = y && x >= 4 ? data[row + x - stride - 4] : 0;
      data[row + x] = (raw[start + x + 1] + (filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : paeth(a, b, c))) & 255;
    }
  }
  return { width, height, alpha: (x, y) => data[(y * width + x) * 4 + 3] };
}

test('four source-bound sheets admit exactly forty separately drawn key poses and explicit fidelity limits', () => {
  assert.equal(atlases.length, 4); assert.equal(atlases.flatMap(a => a.frames).length, 40);
  assert.equal(new Set(atlases.map(a => a.texture.sha256)).size, 4);
  for (const atlas of atlases) {
    assert.deepEqual(atlas.frames.map(f => f.id), ids); assert.equal(atlas.canonExact, false);
    assert.equal(atlas.fullLocomotion, false); assert.equal(atlas.fullProne, true);
    assert.equal(atlas.profileId, definition(atlas.fighterId).profileId);
    const original = readFileSync(new URL(`..${atlas.sourcePose.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'), atlas.sourcePose.sha256);
    assert.ok(Object.isFrozen(atlas.frames[0].anchor)); assert.ok(get(actor(atlas.fighterId), art(atlas.fighterId)));
  }
});

for (const atlas of atlases) test(`${atlas.fighterId}: real PNG alpha bounds, full silhouettes and ground supports match all ten crops`, () => {
  const bitmap = png(atlas.texture); let totalAlpha = 0, lowAlpha = 0, transparent = 0;
  for (let y = 0; y < bitmap.height; y++) for (let x = 0; x < bitmap.width; x++) {
    const a = bitmap.alpha(x, y); totalAlpha += a; if (a <= 16) lowAlpha += a; if (!a) transparent++;
  }
  assert.ok(transparent > bitmap.width * bitmap.height * .45); near(lowAlpha / totalAlpha, atlas.lowAlphaMassFraction);
  const unique = new Set();
  for (const frame of atlas.frames) {
    const [sx, sy, w, h] = frame.rect; let left = w, top = h, right = 0, bottom = 0, edgeMax = 0;
    const digest = createHash('sha256');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = bitmap.alpha(sx + x, sy + y); digest.update(Buffer.from([a]));
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edgeMax = Math.max(edgeMax, a);
      if (a > atlas.alphaBoundsThreshold) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); }
    }
    assert.deepEqual([left, top, right, bottom], frame.alphaBounds, frame.id); assert.ok(edgeMax <= atlas.cutEdgeAlphaMax, frame.id);
    assert.equal(frame.anchor[1], bottom); unique.add(digest.digest('hex'));
    for (const [x, y] of frame.supports) { assert.ok(bitmap.alpha(sx + x, sy + y) >= atlas.supportAlphaMin); assert.ok(bottom - y <= 4); }
  }
  assert.equal(unique.size, 10, 'No repeated idle bitmap masquerades as another key pose');
  const prone = atlas.frames[9], idle = atlas.frames[0];
  assert.ok(prone.alphaBounds[3] - prone.alphaBounds[1] < (idle.alphaBounds[3] - idle.alphaBounds[1]) * .65, 'Final KO is a genuinely lower drawn silhouette');
});

test('strict atlas contract rejects source substitution, clipping, overlap, missing poses and unreviewed claims', () => {
  const invalid = [
    d => { d.sourcePose.sha256 = '0'.repeat(64); }, d => { d.profileId = 'different'; },
    d => { d.texture.path = '/assets/unreviewed.png'; }, d => { d.texture.sha256 = 'invalid'; },
    d => { d.identityVerified = false; }, d => { d.canonExact = true; }, d => { d.alphaBoundsThreshold = 0; },
    d => { d.frames.pop(); }, d => { d.frames[1].id = 'idle'; }, d => { d.frames[0].rect[0] = -1; },
    d => { d.frames[0].alphaBounds[0] = 0; }, d => { d.frames[1].rect = [...d.frames[0].rect]; },
    d => { d.frames[0].anchor[1] = 0; }, d => { d.frames[0].supports = []; }, d => { d.referenceHeight *= 2; }
  ];
  for (const mutate of invalid) { const value = structuredClone(atlases[0]); mutate(value); assert.throws(() => create(value), /Invalid Trials sprite atlas/); }
  const ordered = structuredClone(atlases[0]); ordered.sourcePose = Object.fromEntries(Object.entries(ordered.sourcePose).reverse()); assert.ok(create(ordered));
});

test('light and heavy drawings follow actual startup, active and recovery boundaries without actor mutation', () => {
  for (const atlas of atlases) for (const kind of ['light', 'heavy']) {
    const spec = XENO_TRIALS_ATTACKS_V96[kind], f = actor(atlas.fighterId, { attack: { kind, age: 0, facing: -1 } });
    for (const [age, expected] of [[0, 'attack-windup'], [spec.startup - 1e-9, 'attack-windup'], [spec.startup, 'attack-impact'],
      [spec.startup + spec.active, 'attack-recovery'], [spec.startup + spec.active + spec.recovery - 1e-9, 'attack-recovery']]) {
      f.attack.age = age; const before = structuredClone(f); assert.equal(sample(atlas, f, { spec }).frame.id, expected); assert.deepEqual(f, before);
    }
    f.attack.age = spec.startup + spec.active + spec.recovery; assert.equal(sample(atlas, f, { spec }), null);
    for (const kind of ['special', 'super', 'acid']) { f.attack.kind = kind; f.attack.age = 0; assert.equal(sample(atlas, f, { spec }), null); }
    f.attack = null; assert.equal(sample(atlas, f).frame.id, 'idle');
  }
});

test('walk contacts use displacement, and reduced motion, guard, damage and KO select supported drawings', () => {
  for (const atlas of atlases) {
    const f = actor(atlas.fighterId), m = metrics(f.id), opts = { moving: true, distance: 0, metrics: m };
    assert.equal(sample(atlas, f, opts).frame.id, 'walk-a');
    assert.equal(sample(atlas, f, { ...opts, distance: m.visibleHeight * .33 * 1.1 }).frame.id, 'walk-b');
    assert.equal(sample(atlas, f, { ...opts, timeSeconds: 9999 }).frame.id, 'walk-a');
    assert.equal(sample(atlas, f, { ...opts, reducedMotion: true }).frame.id, 'idle');
    f.guard = true; assert.equal(sample(atlas, f).frame.id, 'guard');
    assert.equal(sample(atlas, f, { cue: { state: 'hurt', progress: .5 } }).frame.id, 'hit-recoil');
    f.hp = 0; assert.equal(sample(atlas, f, { cue: { state: 'ko', progress: .1 } }).frame.id, 'ko-fall');
    assert.equal(sample(atlas, f, { cue: { state: 'ko', progress: .8 } }).frame.id, 'ko-ground');
    assert.equal(sample(atlas, f, { cue: { state: 'ko', progress: .1 }, reducedMotion: true }).frame.id, 'ko-ground');
    f.y = 2; assert.equal(sample(atlas, f), null); f.y = 0; assert.equal(sample(atlas, f, { blocked: true }), null);
  }
});

test('all states retain one physical scale, mirrored anchors and an honest lower prone body', () => {
  for (const atlas of atlases) {
    const m = metrics(atlas.fighterId), visible = [];
    for (const frame of atlas.frames) {
      const a = layout(atlas, frame, m, { x: 500, y: 450, facing: 1 }), b = layout(atlas, frame, m, { x: 500, y: 450, facing: -1 });
      near(a.scale, m.visibleHeight / atlas.referenceHeight); near(b.scale, a.scale); near(a.bounds.bottom, 450);
      near(a.bounds.left + b.bounds.right, 1000); near(a.bounds.right + b.bounds.left, 1000);
      a.supports.forEach((p, i) => { near(p[0] + b.supports[i][0], 1000); near(p[1], b.supports[i][1]); assert.ok(p[1] <= 450 && p[1] >= 450 - 4 * a.scale); });
      visible.push(a.bounds.bottom - a.bounds.top);
    }
    near(visible[0], m.visibleHeight); assert.ok(visible[9] < visible[0] * .65);
  }
});

test('native renderer draws a single measured crop, locks attack facing and preserves all fallback paths', () => {
  const images = store();
  for (const atlas of atlases) {
    const f = actor(atlas.fighterId, { attack: { kind: 'heavy', age: 0, facing: -1 } }), c = context(), a = art(f.id), m = metrics(f.id);
    const result = draw(c.ctx, f, a, images, { metrics: m, spec: XENO_TRIALS_ATTACKS_V96.heavy, x: 500, y: 450, facing: 1 });
    assert.equal(result.spriteAtlasV188.frameId, 'attack-windup'); assert.equal(c.calls.length, 1); assert.equal(c.stack.length, 0);
    assert.deepEqual(c.transforms, [[500, 450], [-1, 1]]); assert.deepEqual(c.calls[0].slice(1, 5), atlas.frames[3].rect);
    for (const wrong of [{ ...a, path: '/wrong.png' }, { ...a, id: 'other' }, { ...a, sourceWidth: 1 }]) assert.equal(draw(c.ctx, f, wrong, images, { metrics: m }), null);
    assert.equal(draw(c.ctx, f, a, new Map(), { metrics: m }), null); assert.equal(draw(c.ctx, f, a, images, { metrics: m, blocked: true }), null);
    assert.equal(get(actor('queen'), art('queen')), null);
    assert.equal(get({ ...f, profileId: 'wrong' }, a), null);
  }
});

test('image loading is deduplicated and refuses wrong dimensions, failed decodes and stale runtimes', async () => {
  const atlas = atlases[0], f = actor(atlas.fighterId), a = art(f.id), images = new Map(); let calls = 0, finish;
  const load = path => { calls++; assert.equal(path, atlas.texture.path); return new Promise(resolve => { finish = resolve; }); };
  const first = request(images, f, a, load), second = request(images, f, a, load); assert.equal(first, second);
  await Promise.resolve(); finish(image(atlas)); assert.equal(await first, true); assert.equal(calls, 1); assert.equal(await request(images, f, a, load), true);
  assert.equal(await request(new Map(), f, a, async () => ({ ...image(atlas), naturalWidth: 1 })), false);
  assert.equal(await request(new Map(), f, a, async () => { throw Error('decode'); }), false);
  const stale = new Map(); let active = true;
  assert.equal(await request(stale, f, a, async () => { active = false; return image(atlas); }, () => active), false); assert.equal(stale.size, 0);
});

test('a deterministic native engine strike reaches all three drawn phases and its actual receiving reaction', () => {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0, roundSeconds: 30 });
  const seen = new Set(), atlas = atlases.find(a => a.fighterId === 'warrior'), observe = createXenoTrialsReactionObserverV186();
  for (let step = 0; step < 1200; step++) {
    stepXenoTrialsMatchV96(match, 1 / 120, match.phase === 'active' ? { right: true, heavy: step % 110 === 0 } : {}, {});
    const result = sample(atlas, match.fighters[0], { spec: XENO_TRIALS_ATTACKS_V96.heavy }); if (result) seen.add(result.frame.id);
    const receiving = sample(atlases.find(a => a.fighterId === 'runner'), match.fighters[1], { cue: observe(match, match.fighters[1]) });
    if (receiving) seen.add('runner/' + receiving.frame.id);
  }
  for (const id of ['attack-windup', 'attack-impact', 'attack-recovery']) assert.ok(seen.has(id), id);
  assert.ok(match.fighters[0].stats.damage > 0);
  assert.ok(seen.has('runner/hit-recoil'));
});

test('camera union fits every drawn tail/KO while the default historical camera stays byte-for-byte equivalent', () => {
  const actors = [actor('warrior', { x: 60 }), actor('runner', { x: 940, facing: -1 })], before = structuredClone(actors);
  const lookup = f => envelope(f, art(f.id), metrics(f.id));
  assert.deepEqual(camera(actors).getState(), camera(actors, undefined, { envelope: () => null }).getState());
  const view = camera(actors, { width: 1000, height: 560 }, { envelope: lookup }).getState();
  for (const f of actors) for (const frame of get(f, art(f.id)).frames) {
    const b = layout(get(f, art(f.id)), frame, metrics(f.id), { x: f.x, y: 450 - f.y, facing: f.facing }).bounds;
    assert.ok(b.left * view.zoom + view.translateX >= 19); assert.ok(b.right * view.zoom + view.translateX <= 981);
    assert.ok(b.top * view.zoom + view.translateY >= 99); assert.ok(b.bottom * view.zoom + view.translateY <= 560);
  }
  assert.deepEqual(actors, before);
});
