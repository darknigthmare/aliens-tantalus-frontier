import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { XENO_TRIALS_SPRITE_ATLASES_V189 as atlases, XENO_TRIALS_SPRITE_REFERENCES_V189 as refs,
  XENO_TRIALS_PRIMARY_ACTIONS_V189 as primary, XENO_TRIALS_MOTION_FRAME_IDS_V189 as motionIds,
  XENO_TRIALS_COMBAT_FRAME_IDS_V189 as combatIds, createXenoTrialsSpriteAtlasV189 as create,
  getXenoTrialsSpriteAtlasV189 as get, sampleXenoTrialsSpriteAtlasV189 as sample,
  getXenoTrialsSpriteLayoutV189 as layout, getXenoTrialsSpriteEnvelopeV189 as envelope,
  requestXenoTrialsSpriteAtlasV189 as request, drawXenoTrialsSpriteAtlasV189 as draw } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 as oldAtlases, getXenoTrialsSpriteAtlasV188 as oldGet,
  sampleXenoTrialsSpriteAtlasV188 as oldSample } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRenderMetricsV110 as metrics, createXenoTrialsCameraV119 as camera } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_ATTACKS_V96 as attacks, createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const actor = (id = 'warrior', extra = {}) => ({ id, hp: 200, x: 500, y: 0, vy: 0, facing: 1, stun: 0, hitFlash: 0, guard: false, ...extra });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
// Declared contract fixture only: no rendered artwork or image acceptance is
// inferred from these synthetic rectangles. Real PNG proofs are separate.
const fixture = (id = 'warrior', kind = 'motion') => {
  const ids = kind === 'motion' ? motionIds : combatIds;
  return create({ fighterId: id, profileId: refs[id].profileId, sourcePose: refs[id], kind,
    reviewStatus: 'accepted-drawn-atlas', identityVerified: true, alphaVerified: true, anchorsVerified: true,
    wholeBodyVerified: true, canonExact: false, fullLocomotion: false, fullProne: kind === 'combat',
    movementCoverage: kind === 'motion' ? 'eight-step-loop-two-air-poses' : 'two-step-combat-keys',
    primaryAction: kind === 'motion' ? null : primary[id], alphaBoundsThreshold: 16, cutEdgeAlphaMax: 1,
    supportAlphaMin: 128, lowAlphaMassFraction: 0, provenance: { generation: 'Explicit synthetic contract fixture', reference: 'Contract tests only' },
    texture: { path: `/assets/openai/sprites/xeno-trials-v189/${id}-${kind}-sheet.png`, sha256: '1'.repeat(64), width: 500, height: 200, facing: 1 },
    referenceHeight: 80, frames: ids.map((id, i) => ({ id, rect: [(i % 5) * 100, Math.floor(i / 5) * 100, 100, 100],
      alphaBounds: id.startsWith('air-') ? [10, 10, 90, 70] : id === 'ko-ground' ? [10, 65, 90, 90] : [10, 10, 90, 90],
      anchor: [55, 90], ...(kind === 'motion' ? { pelvis: [55, 50] } : {}), supports: id.startsWith('air-') ? [] : [[50, 89]] })) });
};

test('eight admitted sheets add exactly eighty bounded drawn poses while the forty V188 poses remain separate', () => {
  assert.equal(atlases.length, 8); assert.equal(atlases.flatMap(a => a.frames).length, 80);
  assert.deepEqual(atlases.filter(a => a.kind === 'motion').map(a => a.fighterId).sort(), ['prowler', 'runner', 'spitter', 'warrior']);
  assert.deepEqual(atlases.filter(a => a.kind === 'combat').map(a => a.fighterId).sort(), ['burster', 'crusher-acm', 'queen', 'ravager']);
  assert.equal(new Set(atlases.map(a => a.texture.sha256)).size, 8);
  for (const a of atlases) {
    assert.equal(a.canonExact, false); assert.equal(a.fullLocomotion, false);
    assert.equal(sha(readFileSync(new URL(`..${a.sourcePose.path}`, import.meta.url))), a.sourcePose.sha256);
    assert.deepEqual(a.frames.map(f => f.id), a.kind === 'motion' ? motionIds : combatIds);
  }
});

test('contract enforces identity, anatomical attack, fixed scope, crop boundaries and airborne roots', () => {
  for (const id of ['warrior', 'runner', 'prowler', 'spitter']) assert.ok(fixture(id));
  for (const id of Object.keys(primary)) assert.ok(fixture(id, 'combat'));
  const cases = [d => { d.fighterId = 'queen'; }, d => { d.fullLocomotion = true; }, d => { d.canonExact = true; },
    d => { d.sourcePose.sha256 = '0'.repeat(64); }, d => { d.frames[8].supports = [[50, 69]]; },
    d => { d.frames[8].anchor[1] = 70; }, d => { d.frames[0].supports = []; },
    d => { d.frames[1].rect = [...d.frames[0].rect]; }, d => { d.frames[0].alphaBounds[0] = 0; },
    d => { d.frames[0].rect[0] = -1; }, d => { d.texture.sha256 = 'bad'; }, d => { d.frames.pop(); }];
  for (const mutate of cases) { const d = structuredClone(fixture()); mutate(d); assert.throws(() => create(d), /Invalid Trials sprite atlas V189/); }
  const crusher = structuredClone(fixture('crusher-acm', 'combat')); crusher.primaryAction = 'foreclaw'; assert.throws(() => create(crusher), /anatomical primary action/);
  assert.equal(get(actor('warrior'), { ...art('warrior'), path: '/substituted.png' }), null);
});

test('eight-step sampler uses signed travelled distance with continuous periodic wrapping and a fixed reduced-motion key', () => {
  const atlas = fixture(), f = actor(), m = metrics(f.id), cycle = m.visibleHeight * .66;
  for (const loops of [-3, -1, 0, 1, 9]) for (let index = 0; index < 8; index++) {
    const distance = cycle * (loops + (index + .25) / 8), before = structuredClone(f);
    const a = sample(atlas, f, { moving: true, distance, metrics: m, timeSeconds: 0 });
    assert.equal(a.frame.id, `walk-${index}`); assert.deepEqual(f, before);
    assert.equal(sample(atlas, f, { moving: true, distance, metrics: m, timeSeconds: 10000 }).frame.id, a.frame.id);
    assert.equal(sample(atlas, f, { moving: true, distance, metrics: m, reducedMotion: true }).frame.id, 'walk-0');
  }
  assert.equal(sample(atlas, f, { moving: true, metrics: m }), null);
  assert.equal(sample(atlas, f, { moving: false, distance: 10, metrics: m }), null);
  for (const extra of [{ hp: 0 }, { attack: { kind: 'light', age: 0 } }, { guard: true }, { stun: .2 }, { hitFlash: .2 }])
    assert.equal(sample(atlas, { ...f, ...extra }, { moving: true, distance: 10, metrics: m }), null);
  assert.equal(sample(atlas, f, { cue: { state: 'hurt' }, moving: true, distance: 10, metrics: m }), null);
});

test('air sampler follows real y/vy, never invents a ground support and hands landing back to the grounded renderers', () => {
  for (const id of ['warrior', 'runner', 'prowler', 'spitter']) {
    const a = fixture(id), m = metrics(id), f = actor(id, { y: 90, vy: 200 });
    assert.equal(sample(a, f).frame.id, 'air-rise'); f.vy = 0; assert.equal(sample(a, f).frame.id, 'air-fall');
    f.vy = -200; assert.equal(sample(a, f, { reducedMotion: true }).frame.id, 'air-fall');
    const frame = sample(a, f).frame, first = layout(a, frame, m, { x: f.x, y: 450 - f.y, facing: 1 });
    const raised = layout(a, frame, m, { x: f.x, y: 450 - (f.y + 25), facing: 1 });
    near(first.bounds.bottom - raised.bounds.bottom, 25); assert.ok(first.bounds.bottom < 450 - f.y); assert.deepEqual(first.supports, []);
    const mirror = layout(a, frame, m, { x: f.x, y: 450 - f.y, facing: -1 });
    near(first.bounds.left + mirror.bounds.right, f.x * 2); near(first.bounds.right + mirror.bounds.left, f.x * 2); near(first.scale, mirror.scale);
    f.y = 0; f.vy = 0; assert.equal(sample(a, f), null);
    assert.equal(sample(a, f, { moving: true, distance: 0, metrics: m }).frame.id, 'walk-0');
  }
});

test('native jump and displacement select the motion keys without advancing or changing the engine', () => {
  const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', introSeconds: 0, roundSeconds: 30 });
  const a = fixture(), m = metrics('warrior'), seen = new Set(); let distance = 0, last = match.fighters[0].x;
  for (let tick = 0; tick < 180; tick++) {
    stepXenoTrialsMatchV96(match, 1 / 120, { right: true, jump: tick === 10 }, {});
    const f = match.fighters[0]; distance += f.x - last; last = f.x;
    const before = JSON.stringify(match), key = sample(a, f, { moving: true, distance, metrics: m });
    assert.equal(JSON.stringify(match), before); if (key) seen.add(key.frame.id);
  }
  assert.ok(seen.has('air-rise')); assert.ok(seen.has('air-fall')); assert.ok([...seen].some(id => id.startsWith('walk-')));
});

test('four combat samplers keep anatomy-specific primary windows separate from acid, ram and other specials', () => {
  for (const id of Object.keys(primary)) {
    const a = fixture(id, 'combat'), f = actor(id), spec = attacks.heavy;
    for (const [age, key] of [[0, 'attack-windup'], [spec.startup, 'attack-impact'], [spec.startup + spec.active, 'attack-recovery']]) {
      f.attack = { kind: 'heavy', age }; assert.equal(sample(a, f, { spec }).frame.id, key);
    }
    for (const kind of ['special', 'super']) { f.attack = { kind, age: 0 }; assert.equal(sample(a, f, { spec }), null); }
    f.attack = null; f.hp = 0; assert.equal(sample(a, f, { cue: { state: 'ko', progress: .2 } }).frame.id, 'ko-fall');
    assert.equal(sample(a, f, { cue: { state: 'ko', progress: 1 } }).frame.id, 'ko-ground');
    const idle = layout(a, a.frames[0], metrics(id), { x: 500, y: 450 }), corpse = layout(a, a.frames[9], metrics(id), { x: 500, y: 450 });
    near(idle.scale, corpse.scale); assert.ok(corpse.bounds.bottom - corpse.bounds.top < (idle.bounds.bottom - idle.bounds.top) * .5);
  }
});

test('forty original V188 drawn poses remain frozen and available for all fallback states', () => {
  assert.equal(oldAtlases.length, 4); assert.equal(oldAtlases.flatMap(a => a.frames).length, 40);
  for (const a of oldAtlases) {
    assert.equal(sha(readFileSync(new URL(`..${a.texture.path}`, import.meta.url))), a.texture.sha256);
    const f = actor(a.fighterId); assert.equal(oldGet(f, art(f.id)), a);
    assert.equal(oldSample(a, f).frame.id, 'idle'); f.hp = 0; assert.equal(oldSample(a, f).frame.id, 'ko-ground');
    assert.ok(Object.isFrozen(a.frames));
  }
});

function png(texture) {
  const bytes = readFileSync(new URL(`..${texture.path}`, import.meta.url));
  assert.equal(sha(bytes), texture.sha256); assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.deepEqual([width, height], [texture.width, texture.height]); assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let at = 8; at < bytes.length;) { const size = bytes.readUInt32BE(at); assert.ok(at + size + 12 <= bytes.length);
    if (bytes.toString('ascii', at + 4, at + 8) === 'IDAT') chunks.push(bytes.subarray(at + 8, at + 8 + size)); at += size + 12; }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * 4, data = Buffer.alloc(stride * height);
  assert.equal(raw.length, (stride + 1) * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) { const row = y * stride, start = y * (stride + 1), filter = raw[start]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) { const a = x >= 4 ? data[row + x - 4] : 0, b = y ? data[row + x - stride] : 0, c = y && x >= 4 ? data[row + x - stride - 4] : 0;
      data[row + x] = (raw[start + x + 1] + (filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a + b) / 2) : paeth(a, b, c))) & 255; } }
  return { width, height, alpha: (x, y) => data[(y * width + x) * 4 + 3] };
}

for (const atlas of atlases) test(`${atlas.fighterId} ${atlas.kind}: real RGBA pixels preserve full crops, opaque supports and exact anatomical roots`, () => {
  const bitmap = png(atlas.texture); let total = 0, low = 0, empty = 0; const unique = new Set();
  for (let y = 0; y < bitmap.height; y++) for (let x = 0; x < bitmap.width; x++) { const a = bitmap.alpha(x, y); total += a; if (a <= 16) low += a; if (!a) empty++; }
  near(low / total, atlas.lowAlphaMassFraction); assert.ok(empty > bitmap.width * bitmap.height * .4);
  for (const frame of atlas.frames) {
    const [sx, sy, w, h] = frame.rect, mask = Buffer.alloc(w * h); let left = w, top = h, right = 0, bottom = 0, edge = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = bitmap.alpha(sx + x, sy + y); mask[y * w + x] = a;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = Math.max(edge, a);
      if (a > 16) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); }
    }
    assert.deepEqual([left, top, right, bottom], frame.alphaBounds); assert.ok(edge <= 1); unique.add(sha(mask));
    for (const p of frame.supports) { assert.ok(bitmap.alpha(sx + p[0], sy + p[1]) >= 128); assert.ok(bottom - p[1] <= 4); }
    if (atlas.kind === 'motion') assert.ok(bitmap.alpha(sx + frame.pelvis[0], sy + frame.pelvis[1]) >= 128);
    if (frame.id.startsWith('air-')) {
      assert.deepEqual(frame.supports, []); near(frame.anchor[1] - frame.pelvis[1], atlas.frames[0].anchor[1] - atlas.frames[0].pelvis[1]);
      assert.ok(frame.anchor[1] > bottom, 'Extended air feet remain above their anatomical ground projection, even immediately before landing');
    } else assert.equal(frame.anchor[1], bottom);
  }
  assert.equal(unique.size, 10, 'Ten distinct drawn poses, not duplicated masks');
});

test('admitted draw dispatch uses exact native crops and keeps unsupported states available to V188', async () => {
  const images = new Map(atlases.map(a => [a.texture.path, { complete: true, naturalWidth: a.texture.width, naturalHeight: a.texture.height }]));
  for (const a of atlases) {
    const f = actor(a.fighterId), m = metrics(f.id), calls = [], translations = [], ctx = { save() {}, restore() {}, translate(...p) { translations.push(p); }, scale() {}, drawImage(...p) { calls.push(p); } };
    const opts = { moving: true, distance: m.visibleHeight * .66 * .27, metrics: m };
    const before = structuredClone(f), result = draw(ctx, f, art(f.id), images, opts); assert.ok(result); assert.deepEqual(f, before);
    assert.equal(result.spriteAtlasV189.sha256, a.texture.sha256); assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(1, 5), sample(a, f, opts).frame.rect); assert.deepEqual(translations[0], [f.x, 450]);
    assert.equal(draw(ctx, f, art(f.id), new Map(), opts), null); assert.equal(draw(ctx, f, art(f.id), images, { ...opts, blocked: true }), null);
    if (a.kind === 'motion') {
      f.y = .001; f.vy = -1; const airborne = draw(ctx, f, art(f.id), images, opts);
      assert.equal(airborne.spriteAtlasV189.frameId, 'air-fall'); assert.equal(airborne.spriteAtlasV189.grounded, false); assert.ok(airborne.bounds.bottom < 450);
      assert.deepEqual(airborne.supports, []); f.y = 0; f.vy = 0;
      assert.equal(draw(ctx, f, art(f.id), images, { metrics: m }), null); assert.ok(oldSample(oldGet(f, art(f.id)), f));
    }
    const pending = new Map(); let loads = 0;
    const load = async () => { loads++; return images.get(a.texture.path); };
    const first = request(pending, f, art(f.id), load), second = request(pending, f, art(f.id), load); assert.equal(first, second); assert.equal(await first, true); assert.equal(loads, 1);
    assert.equal(await request(new Map(), f, art(f.id), async () => ({ width: 1, height: 1 })), false);
    const stale = new Map(); let active = true;
    assert.equal(await request(stale, f, art(f.id), async () => { active = false; return images.get(a.texture.path); }, () => active), false); assert.equal(stale.size, 0);
  }
});

test('camera union contains every admitted frame in both facings while retaining all V188 attack and KO envelopes', () => {
  const subjects = atlases.map((a, index) => actor(a.fighterId, { x: 100 + index * 100, facing: index % 2 ? -1 : 1 }));
  const before = structuredClone(subjects), view = camera(subjects, { width: 1000, height: 560 }, { envelope: f => envelope(f, art(f.id), metrics(f.id)) }).getState();
  for (const f of subjects) {
    const a = get(f, art(f.id)), e = envelope(f, art(f.id), metrics(f.id)); assert.ok(e);
    for (const frame of a.frames) {
      const b = layout(a, frame, metrics(f.id), { x: f.x, y: 450, facing: f.facing }).bounds;
      assert.ok(b.left * view.zoom + view.translateX >= 19); assert.ok(b.right * view.zoom + view.translateX <= 981);
      assert.ok(b.top * view.zoom + view.translateY >= 99); assert.ok(b.bottom * view.zoom + view.translateY < 560);
      const mirror = layout(a, frame, metrics(f.id), { x: f.x, y: 450, facing: -f.facing }).bounds;
      near(b.left + mirror.right, f.x * 2); near(b.right + mirror.left, f.x * 2);
    }
  }
  assert.deepEqual(subjects, before);
});
