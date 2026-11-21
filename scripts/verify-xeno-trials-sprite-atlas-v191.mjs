import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { XENO_TRIALS_SPRITE_ATLASES_V191 as atlases, XENO_TRIALS_SPRITE_REFERENCES_V191 as refs,
  XENO_TRIALS_PRIMARY_ACTIONS_V191 as primary, XENO_TRIALS_SPECIAL_ACTIONS_V191 as special,
  XENO_TRIALS_COMBAT_FRAME_IDS_V191 as combatIds, XENO_TRIALS_SPECIAL_FRAME_IDS_V191 as specialIds,
  createXenoTrialsSpriteAtlasV191 as create, getXenoTrialsSpriteAtlasV191 as get,
  sampleXenoTrialsSpriteAtlasV191 as sample, getXenoTrialsSpriteLayoutV191 as layout,
  getXenoTrialsSpriteEnvelopeV191 as envelope, requestXenoTrialsSpriteAtlasV191 as request,
  drawXenoTrialsSpriteAtlasV191 as draw } from '../src/xeno-trials-sprite-atlas-v191.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 as previous } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 as original } from '../src/xeno-trials-sprite-atlas-v188.js';
import { getXenoTrialsArtV96 as art, getXenoTrialsFighterV96 as definition } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRenderMetricsV110 as metrics, createXenoTrialsCameraV119 as camera } from '../src/xeno-trials-scale-v110.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { XENO_TRIALS_ATTACKS_V96 as attacks, createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const actor = (id = 'defender', extra = {}) => ({ id, hp: 200, x: 500, y: 0, vy: 0, facing: 1,
  stun: 0, hitFlash: 0, guard: false, ...extra });
const specFor = id => getXenoTrialsAttackV147(definition(id), 'special', attacks.special);

// Synthetic rectangles below exercise the contract and sampler only. They are
// not PNG acceptance, image decoding, rendered artwork or native play receipts.
const fixture = (id = 'defender', kind = 'combat') => {
  const specialKind = kind === 'special', ids = specialKind ? specialIds : combatIds;
  return create({ fighterId: id, profileId: refs[id].profileId, sourcePose: refs[id], kind,
    reviewStatus: 'accepted-drawn-atlas', identityVerified: true, alphaVerified: true,
    anchorsVerified: true, wholeBodyVerified: true, canonExact: false, fullLocomotion: false,
    fullProne: !specialKind, movementCoverage: specialKind ? 'ten-special-attack-keys' : 'two-step-combat-keys',
    primaryAction: specialKind ? special[id] : primary[id],
    ...(specialKind ? { calibrationFrameId: 'special-windup-0', calibrationBasis: 'neutral-preparation-key' } : {}),
    alphaBoundsThreshold: 16, cutEdgeAlphaMax: 1, supportAlphaMin: 128, lowAlphaMassFraction: 0,
    provenance: { generation: 'Declared synthetic contract fixture', reference: 'No art acceptance implied' },
    texture: { path: `/assets/openai/sprites/xeno-trials-v191/${id}-${kind}-sheet.png`,
      sha256: '1'.repeat(64), width: 500, height: 200, facing: 1 }, referenceHeight: 80,
    frames: ids.map((frameId, index) => {
      const free = specialKind && id === 'prowler' && frameId.startsWith('special-active-');
      return { id: frameId, rect: [index % 5 * 100, Math.floor(index / 5) * 100, 100, 100],
        alphaBounds: free ? [10, 10, 90, 60] : frameId === 'ko-ground' ? [10, 60, 90, 90] : [10, 10, 90, 90],
        anchor: [55, free ? 80 : 90], supports: free ? [] : [[50, 89]],
        ...(specialKind ? { pelvis: [55, free ? 40 : 50], supportMode: free ? 'free' : 'grounded' } : {}) };
    }) });
};

test('eight admitted V191 sheets add forty combat and forty distinct special keys without rewriting the 120 previous Trials poses', () => {
  assert.equal(atlases.length, 8); assert.equal(atlases.flatMap(a => a.frames).length, 80);
  assert.deepEqual(atlases.filter(a => a.kind === 'combat').map(a => a.fighterId).sort(), ['chrysalis', 'defender', 'smasher', 'user-brute']);
  assert.deepEqual(atlases.filter(a => a.kind === 'special').map(a => a.fighterId).sort(), ['prowler', 'runner', 'spitter', 'warrior']);
  assert.equal(new Set(atlases.map(a => a.texture.sha256)).size, 8);
  assert.equal([...original, ...previous].flatMap(a => a.frames).length, 120);
  for (const a of [...original, ...previous]) assert.equal(sha(readFileSync(new URL(`..${a.texture.path}`, import.meta.url))), a.texture.sha256);
  for (const a of atlases) {
    assert.equal(a.canonExact, false); assert.equal(a.fullLocomotion, false);
    assert.deepEqual(a.frames.map(f => f.id), a.kind === 'combat' ? combatIds : specialIds);
    assert.equal(sha(readFileSync(new URL(`..${a.sourcePose.path}`, import.meta.url))), a.sourcePose.sha256);
  }
});

test('contract refuses profile borrowing, false choreography scope, cut silhouettes, fake supports and invented airborne Runners', () => {
  for (const id of Object.keys(primary)) assert.ok(fixture(id));
  for (const id of Object.keys(special)) assert.ok(fixture(id, 'special'));
  const mutations = [d => { d.profileId = refs.warrior.profileId; }, d => { d.kind = 'motion'; },
    d => { d.canonExact = true; }, d => { d.fullLocomotion = true; }, d => { d.fullProne = false; },
    d => { d.primaryAction = 'acid'; }, d => { d.frames[0].alphaBounds[0] = 0; },
    d => { d.frames[1].rect = [...d.frames[0].rect]; }, d => { d.frames[0].supports = []; },
    d => { d.sourcePose.sha256 = '0'.repeat(64); }, d => { d.texture.facing = -1; },
    d => { d.cutEdgeAlphaMax = 2; }, d => { d.lowAlphaMassFraction = .008; }];
  for (const mutate of mutations) { const data = structuredClone(fixture()); mutate(data); assert.throws(() => create(data), /Invalid Trials sprite atlas V191/); }
  for (const mutate of [d => { d.calibrationBasis = 'attack-extent'; }, d => { d.frames[0].pelvis[0]--; },
    d => { d.frames[3].anchor[1]--; }, d => { d.frames[3].supports = [[50, 59]]; },
    d => { d.frames[6].supportMode = 'free'; }]) {
    const data = structuredClone(fixture('prowler', 'special')); mutate(data); assert.throws(() => create(data), /Invalid Trials sprite atlas V191/);
  }
  const runner = structuredClone(fixture('runner', 'special')); runner.frames[3].supportMode = 'free'; runner.frames[3].supports = [];
  assert.throws(() => create(runner), /native airborne action/);
  assert.equal(get(actor('user-brute'), { ...art('user-brute'), sourceFacing: 1 }), null);
  assert.equal(get(actor(), { ...art('defender'), path: '/unreviewed.png' }), null);
});

test('four combat samplers follow accepted primary windows, real distance, guard, recoil and supported KO without substituting a special', () => {
  for (const id of Object.keys(primary)) {
    const a = fixture(id), f = actor(id), m = metrics(id);
    assert.equal(sample(a, f).frame.id, 'idle');
    for (const [distance, frame] of [[m.visibleHeight * .33 * .2, 'walk-a'], [m.visibleHeight * .33 * 1.2, 'walk-b']])
      assert.equal(sample(a, f, { moving: true, distance, metrics: m }).frame.id, frame);
    assert.equal(sample(a, f, { moving: true, distance: 10, metrics: m, reducedMotion: true }).frame.id, 'idle');
    f.guard = true; assert.equal(sample(a, f).frame.id, 'guard'); f.guard = false;
    assert.equal(sample(a, f, { cue: { state: 'hurt' } }).frame.id, 'hit-recoil');
    for (const kind of ['light', 'heavy']) {
      const spec = attacks[kind];
      for (const [age, frame] of [[0, 'attack-windup'], [spec.startup, 'attack-impact'], [spec.startup + spec.active, 'attack-recovery']]) {
        f.attack = { kind, age }; assert.equal(sample(a, f, { spec }).frame.id, frame);
      }
    }
    for (const kind of ['special', 'super']) { f.attack = { kind, age: 0 }; assert.equal(sample(a, f, { spec: attacks.special }), null); }
    f.attack = null; f.y = .01; assert.equal(sample(a, f), null); f.y = 0; f.hp = 0;
    assert.equal(sample(a, f, { cue: { state: 'ko', progress: .2 } }).frame.id, 'ko-fall');
    assert.equal(sample(a, f, { cue: { state: 'ko', progress: 1 } }).frame.id, 'ko-ground');
    const idle = layout(a, a.frames[0], m, { x: 500, y: 450 }), prone = layout(a, a.frames[9], m, { x: 500, y: 450 });
    near(idle.scale, prone.scale); near(prone.bounds.bottom, 450);
    assert.ok(prone.bounds.bottom - prone.bounds.top < idle.bounds.bottom - idle.bounds.top);
  }
});

test('special keys divide the actual startup, active and recovery windows without an independent animation clock', () => {
  for (const id of Object.keys(special)) {
    const a = fixture(id, 'special'), spec = specFor(id), f = actor(id), seen = new Set();
    for (const [phase, start, duration, count] of [['windup', 0, spec.startup, 3], ['active', spec.startup, spec.active, 3],
      ['recovery', spec.startup + spec.active, spec.recovery, 4]]) {
      for (let index = 0; index < count; index++) {
        f.attack = { kind: 'special', age: start + duration * (index + .25) / count, facing: 1 };
        f.y = id === 'prowler' && phase === 'active' ? 20 : 0;
        const before = structuredClone(f), selected = sample(a, f, { spec, timeSeconds: 0 });
        assert.equal(selected.frame.id, `special-${phase}-${index}`); seen.add(selected.frame.id);
        assert.deepEqual(f, before);
        assert.equal(sample(a, f, { spec, timeSeconds: 100000 }).frame.id, selected.frame.id);
        assert.equal(sample(a, f, { spec, reducedMotion: true }).frame.id, `special-${phase}-0`);
      }
    }
    assert.equal(seen.size, 10);
    f.y = 0; f.attack = { kind: 'special', age: spec.startup + spec.active + spec.recovery };
    assert.equal(sample(a, f, { spec }), null);
    for (const extra of [{ hp: 0 }, { guard: true }, { stun: .1 }, { hitFlash: .1 }])
      assert.equal(sample(a, { ...f, attack: { kind: 'special', age: 0 }, ...extra }, { spec }), null);
    for (const kind of ['light', 'heavy', 'super']) assert.equal(sample(a, { ...f, attack: { kind, age: 0 } }, { spec }), null);
    assert.equal(sample(a, { ...f, attack: { kind: 'special', age: 0 } }, { spec, cue: { state: 'hurt' } }), null);
    assert.equal(sample(a, { ...f, attack: { kind: 'special', age: 0 } }, { spec, blocked: true }), null);
  }
});

test('native Prowler leap owns its free feet and returns through honest fallback after landing; native Runner never receives an invented jump', () => {
  for (const id of ['prowler', 'runner']) {
    const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'queen', introSeconds: 0, roundSeconds: 30 });
    const a = fixture(id, 'special'), seen = new Set(); let accepted = false, free = false, groundedActiveFallback = false;
    for (let tick = 0; tick < 260; tick++) {
      stepXenoTrialsMatchV96(match, 1 / 120, { special: tick === 0 }, {});
      const f = match.fighters[0], spec = specFor(id), before = JSON.stringify(match), selected = sample(a, f, { spec });
      assert.equal(JSON.stringify(match), before);
      if (f.attack?.kind === 'special') accepted = true;
      if (selected) { seen.add(selected.frame.id); if (selected.frame.supportMode === 'free') { free = true; assert.ok(f.y > 0); assert.deepEqual(selected.frame.supports, []); } }
      if (id === 'runner') { assert.equal(f.y, 0); if (selected) assert.equal(selected.frame.supportMode, 'grounded'); }
      if (id === 'prowler' && f.y === 0 && f.attack?.age >= spec.startup && f.attack?.age < spec.startup + spec.active)
        { assert.equal(selected, null); groundedActiveFallback = true; }
    }
    assert.equal(accepted, true); assert.equal(seen.size, 10);
    assert.equal(free, id === 'prowler'); if (id === 'prowler') assert.equal(groundedActiveFallback, true);
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

for (const atlas of atlases) test(`${atlas.fighterId} ${atlas.kind}: real PNG pixels keep all ten crops, opaque contacts and anatomical roots`, () => {
  const bitmap = png(atlas.texture); let total = 0, low = 0, transparent = 0; const masks = new Set();
  for (let y = 0; y < bitmap.height; y++) for (let x = 0; x < bitmap.width; x++) {
    const alpha = bitmap.alpha(x, y); total += alpha; if (alpha <= 16) low += alpha; if (!alpha) transparent++;
  }
  near(low / total, atlas.lowAlphaMassFraction); assert.ok(transparent > bitmap.width * bitmap.height * .35);
  for (const frame of atlas.frames) {
    const [sx, sy, width, height] = frame.rect; let left = width, top = height, right = 0, bottom = 0, edge = 0;
    const mask = Buffer.alloc(width * height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const alpha = bitmap.alpha(sx + x, sy + y); mask[y * width + x] = alpha;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) edge = Math.max(edge, alpha);
      if (alpha > 16) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); }
    }
    assert.deepEqual([left, top, right, bottom], frame.alphaBounds); assert.ok(edge <= 1); masks.add(sha(mask));
    for (const p of frame.supports) { assert.ok(bitmap.alpha(sx + p[0], sy + p[1]) >= 128); assert.ok(bottom - p[1] <= 4); }
    if (atlas.kind === 'special') assert.ok(bitmap.alpha(sx + frame.pelvis[0], sy + frame.pelvis[1]) >= 128);
    if (frame.supportMode === 'free') {
      assert.equal(atlas.fighterId, 'prowler'); assert.deepEqual(frame.supports, []); assert.ok(frame.anchor[1] > bottom);
      near(frame.anchor[1] - frame.pelvis[1], atlas.frames[0].anchor[1] - atlas.frames[0].pelvis[1]);
    } else near(frame.anchor[1], bottom);
  }
  assert.equal(masks.size, 10);
});

test('draw dispatch returns only the actual crop receipt, keeps locked attack facing and rejects missing or substituted sheets', () => {
  const images = new Map(atlases.map(a => [a.texture.path, { complete: true, naturalWidth: a.texture.width, naturalHeight: a.texture.height }]));
  for (const a of atlases) {
    const spec = a.kind === 'special' ? specFor(a.fighterId) : attacks.heavy;
    const f = actor(a.fighterId, { facing: -1, attack: { id: 41, kind: a.kind === 'special' ? 'special' : 'heavy', age: spec.startup * .4, facing: 1 } });
    const m = metrics(f.id), calls = [], transforms = [], ctx = { save() {}, restore() {}, translate() {},
      scale(...values) { transforms.push(values); }, drawImage(...values) { calls.push(values); } };
    const before = structuredClone(f), receipt = draw(ctx, f, art(f.id), images, { tick: 77, spec, metrics: m, facing: -1 });
    assert.deepEqual(f, before); assert.ok(receipt); assert.equal(receipt.spriteAtlasV191.sha256, a.texture.sha256);
    assert.deepEqual(calls[0].slice(1, 5), sample(a, f, { spec }).frame.rect); assert.deepEqual(transforms[0], [1, 1]);
    assert.equal(receipt.spriteAtlasV191.drawn, true); assert.deepEqual(receipt.spriteAtlasV191.sourceRect, calls[0].slice(1, 5));
    assert.equal(receipt.spriteAtlasV191.attackId, 41); near(receipt.spriteAtlasV191.attackAge, f.attack.age);
    assert.equal(receipt.spriteAtlasV191.renderTick, 77); assert.equal(receipt.spriteAtlasV191.imageWidth, a.texture.width);
    assert.equal(receipt.spriteAtlasV191.imageHeight, a.texture.height); assert.equal(receipt.spriteAtlasV191.referencePath, a.sourcePose.path);
    assert.equal(receipt.spriteAtlasV191.referenceSha256, a.sourcePose.sha256);
    assert.equal(draw(ctx, f, art(f.id), new Map(), { spec, metrics: m }), null);
    assert.equal(draw(ctx, f, art(f.id), images, { spec, metrics: m, blocked: true }), null);
    const invalid = new Map(images); invalid.set(a.texture.path, { complete: true, naturalWidth: 1, naturalHeight: 1 });
    assert.equal(draw(ctx, f, art(f.id), invalid, { spec, metrics: m }), null);
  }
});

test('loading deduplicates exact sheets and never installs a late, failed or incorrectly decoded bitmap', async () => {
  for (const a of atlases) {
    const f = actor(a.fighterId), decoded = { complete: true, naturalWidth: a.texture.width, naturalHeight: a.texture.height }, images = new Map(); let loads = 0;
    const loader = async () => { loads++; return decoded; };
    const first = request(images, f, art(f.id), loader), second = request(images, f, art(f.id), loader);
    assert.equal(first, second); assert.equal(await first, true); assert.equal(loads, 1);
    assert.equal(await request(new Map(), f, art(f.id), async () => ({ width: 1, height: 1 })), false);
    assert.equal(await request(new Map(), f, art(f.id), async () => { throw new Error('Declared loader failure'); }), false);
    const stale = new Map(); let active = true;
    assert.equal(await request(stale, f, art(f.id), async () => { active = false; return decoded; }, () => active), false); assert.equal(stale.size, 0);
  }
});

test('camera envelopes include every new drawing and every inherited motion/KO key without changing species scale or facing', () => {
  const subjects = atlases.map((a, i) => actor(a.fighterId, { x: 100 + i * 100, facing: i % 2 ? -1 : 1 }));
  const before = structuredClone(subjects), view = camera(subjects, { width: 1000, height: 560 },
    { envelope: f => envelope(f, art(f.id), metrics(f.id)) }).getState();
  for (const f of subjects) {
    const a = get(f, art(f.id)), e = envelope(f, art(f.id), metrics(f.id)); assert.ok(e);
    for (const frame of a.frames) {
      const b = layout(a, frame, metrics(f.id), { x: f.x, y: 450, facing: f.facing }).bounds;
      const mirror = layout(a, frame, metrics(f.id), { x: f.x, y: 450, facing: -f.facing }).bounds;
      near(b.left + mirror.right, f.x * 2); near(b.right + mirror.left, f.x * 2);
      assert.ok(b.left * view.zoom + view.translateX >= 19); assert.ok(b.right * view.zoom + view.translateX <= 981);
      assert.ok(b.top * view.zoom + view.translateY >= 99); assert.ok(b.bottom * view.zoom + view.translateY < 560);
    }
  }
  assert.deepEqual(subjects, before);
});
