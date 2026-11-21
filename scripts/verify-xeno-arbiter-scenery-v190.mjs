import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ARBITER_SCENERY_V190 as scenes, getArbiterSceneryV190 as scene,
  getArbiterSceneryAssetsV190 as assets, requestArbiterSceneryV190 as request,
  drawArbiterBackdropV190 as rear, drawArbiterForegroundV190 as front } from '../src/xeno-arbiter-scenery-v190.js';

// Declared Image and Canvas host doubles. Real PNG signatures/alpha/admission
// are covered by the stage-art suite; gameplay QA verifies actual loaded draws.
class ImageHost {
  static created = [];
  constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; ImageHost.created.push(this); }
  load() { this.complete = true; this.naturalWidth = 1254; this.naturalHeight = 1254; this.onload?.(); }
  fail() { this.complete = true; this.onerror?.(); }
}
const image = () => ({ complete: true, naturalWidth: 1254, naturalHeight: 1254 });
function context() {
  const calls = [];
  return new Proxy({ calls }, { get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])) });
}
const campaign = 'special-arbiter-02-gallery';

test('five interior chapters reuse exactly four atlas paths; dock chapter and unrelated missions retain native scenery', () => {
  assert.equal(scenes.length, 5); assert.equal(new Set(scenes.map(entry => entry.path)).size, 4);
  assert.deepEqual(scenes.map(entry => [entry.campaignId, entry.stageId]), [
    ['special-arbiter-02-gallery', 'xt190-executive-gallery'],
    ['special-arbiter-03-custody', 'xt190-executive-gallery'],
    ['special-arbiter-04-arbitration', 'xt190-adjudication-vault'],
    ['special-arbiter-05-isolation', 'xt190-evidence-stack'],
    ['special-arbiter-06-local', 'xt190-specimen-transfer']
  ]);
  for (const entry of scenes) {
    assert.equal(scene(entry.campaignId), entry); assert.deepEqual(assets(entry.campaignId), [entry.path]);
    assert.equal(entry.width, 1280); assert.equal(entry.height, 720); assert.equal(entry.groundY, 570);
    assert.equal(entry.canonExact, false); assert.equal(entry.affectsGameplay, false); assert.ok(Object.isFrozen(entry));
  }
  for (const id of ['special-arbiter-01-freight', 'constructor', '__proto__', null, 'special-c12-horde']) {
    const ctx = context(); assert.equal(scene(id), null); assert.deepEqual(assets(id), []);
    assert.equal(rear(ctx, id, new Map()), null); assert.equal(front(ctx, id, new Map()), null); assert.deepEqual(ctx.calls, []);
  }
});

test('one optional native-style Image request is shared, resolves on real load callback, and reuses a decoded map entry', async () => {
  const map = new Map(), before = ImageHost.created.length;
  const a = request(map, campaign, { ImageCtor: ImageHost });
  const b = request(map, campaign, { ImageCtor: ImageHost }); assert.equal(a, b);
  assert.equal(ImageHost.created.length, before + 1); assert.equal(map.size, 1);
  const pending = map.get(a.path); assert.equal(pending.src, a.path); assert.equal(pending.decoding, 'async');
  pending.load(); assert.equal(await a.ready, true); assert.equal(pending.onload, null); assert.equal(pending.onerror, null);
  assert.equal(await request(map, campaign, { ImageCtor: ImageHost }).ready, true);
  assert.equal(ImageHost.created.length, before + 1);
  a.cancel(); assert.equal(map.size, 0);
});

test('optional failures clean both handlers and map, return false and admit a fresh retry only when explicitly requested', async () => {
  const map = new Map(), a = request(map, campaign, { ImageCtor: ImageHost }), failed = map.get(a.path);
  failed.fail(); assert.equal(await a.ready, false); assert.equal(failed.onload, null); assert.equal(failed.onerror, null); assert.equal(map.size, 0);
  const b = request(map, campaign, { ImageCtor: ImageHost }); assert.notEqual(map.get(b.path), failed);
  b.cancel(); assert.equal(await b.ready, false);
  for (const ImageCtor of [undefined, null, () => ({}), class { constructor() { throw Error('declared constructor failure'); } }]) {
    const failed = request(new Map(), campaign, { ImageCtor }); assert.equal(await failed.ready, false);
  }
});

test('cancelling an unresolved image resolves immediately; saved late callbacks never recreate an image or retain listeners', async () => {
  const map = new Map(), a = request(map, campaign, { ImageCtor: ImageHost }), pending = map.get(a.path), late = pending.onload;
  a.cancel(); assert.equal(await a.ready, false); assert.equal(map.size, 0); assert.equal(pending.onload, null); assert.equal(pending.onerror, null);
  pending.complete = true; pending.naturalWidth = 1254; pending.naturalHeight = 1254; late();
  assert.equal(map.size, 0); assert.equal(await a.ready, false);
});

test('a stopped generation and a replaced map entry cannot receive the old image completion', async () => {
  let active = true; const map = new Map(), a = request(map, campaign, { ImageCtor: ImageHost, isActive: () => active });
  const pending = map.get(a.path); active = false; pending.load(); assert.equal(await a.ready, false); assert.equal(map.size, 0);
  const b = request(map, campaign, { ImageCtor: ImageHost }), old = map.get(b.path), replacement = image(); map.set(b.path, replacement);
  old.load(); assert.equal(await b.ready, false); assert.equal(map.get(b.path), replacement);
  b.cancel(); assert.equal(map.get(b.path), replacement);
  const before = ImageHost.created.length;
  assert.equal(await request(map, campaign, { ImageCtor: ImageHost, isActive: () => false }).ready, false);
  assert.equal(ImageHost.created.length, before);
});

for (const entry of scenes) test(`${entry.campaignId}: actual draw receipts select far/middle before bodies and near plane strictly below physical feet`, () => {
  const map = new Map([[entry.path, image()]]), camera = { x: 364, y: 0 }, beforeCamera = structuredClone(camera), ctx = context();
  const back = rear(ctx, entry.campaignId, map, camera), nearCtx = context(), near = front(nearCtx, entry.campaignId, map, camera);
  assert.equal(back.loaded, true); assert.equal(back.proceduralFallback, false); assert.equal(back.floorScreen, 570);
  assert.deepEqual(back.drawnPlanes.map(plane => plane.id), ['far', 'middle']);
  assert.deepEqual(near.drawnPlanes.map(plane => plane.id), ['foreground']);
  assert.deepEqual(back.drawnPlanes.map(plane => plane.sourceRect), [[0, 0, 1254, 418], [0, 418, 1254, 418]]);
  assert.deepEqual(near.drawnPlanes[0].sourceRect, [0, 836, 1254, 418]);
  assert.deepEqual(back.clip, { x: 0, y: 0, width: 1280, height: 570 });
  assert.deepEqual(near.clip, { x: 0, y: 578, width: 1280, height: 142 });
  for (const [receipt, canvas] of [[back, ctx], [near, nearCtx]]) {
    const draws = canvas.calls.filter(call => call[0] === 'drawImage');
    assert.equal(draws.length, receipt.drawnPlanes.reduce((sum, plane) => sum + plane.tiles, 0));
    assert.ok(draws.every(call => call.length === 10));
    assert.equal(canvas.calls.filter(call => call[0] === 'save').length, canvas.calls.filter(call => call[0] === 'restore').length);
    for (const plane of receipt.drawnPlanes) {
      assert.ok(plane.tiles <= 2); assert.equal(plane.destination.xPositions.length, plane.tiles);
      assert.ok(Math.abs(plane.destination.width / plane.destination.height - 3) < 1e-12);
      assert.ok(plane.destination.xPositions[0] <= 0);
      assert.ok(plane.destination.xPositions.at(-1) + plane.destination.width >= 1280);
    }
    assert.equal(JSON.parse(JSON.stringify(receipt)).path, entry.path); assert.equal(receipt.affectsGameplay, false);
    assert.ok(Object.isFrozen(receipt) && Object.isFrozen(receipt.drawnPlanes));
  }
  assert.deepEqual(camera, beforeCamera); assert.equal(map.size, 1);
});

test('native camera movement changes the submitted image destinations without changing aspect, crops or world floor', () => {
  const entry = scenes[0], map = new Map([[entry.path, image()]]);
  const a = rear(context(), campaign, map, { x: 0, y: 0 }), b = rear(context(), campaign, map, { x: 600, y: 25 });
  assert.equal(a.floorWorld, 570); assert.equal(b.floorWorld, 570); assert.equal(b.floorScreen, 545);
  assert.notDeepEqual(a.drawnPlanes[0].destination.xPositions, b.drawnPlanes[0].destination.xPositions);
  assert.notEqual(a.drawnPlanes[0].parallax, a.drawnPlanes[1].parallax);
  assert.deepEqual(a.drawnPlanes.map(plane => plane.sourceRect), b.drawnPlanes.map(plane => plane.sourceRect));
  assert.equal(front(context(), campaign, map, { y: 25 }).clip.y, 553);
  for (const x of [-1e7, 0, 960, 1e7]) {
    const receipt = rear(context(), campaign, map, { x });
    assert.ok(receipt.drawnPlanes.every(plane => plane.tiles <= 2));
  }
});

test('loading, bad dimensions and absent images keep opaque interior fallback instead of calling exterior imagery', () => {
  for (const bad of [undefined, {}, { complete: false, naturalWidth: 1254, naturalHeight: 1254 },
    { complete: true, naturalWidth: 0, naturalHeight: 1254 }, { complete: true, naturalWidth: 1254, naturalHeight: 1253 }]) {
    const ctx = context(), nearCtx = context(), map = new Map([[scenes[0].path, bad]]);
    const back = rear(ctx, campaign, map), near = front(nearCtx, campaign, map);
    assert.equal(back.loaded, false); assert.equal(back.proceduralFallback, true); assert.deepEqual(back.drawnPlanes, []);
    assert.equal(near.loaded, false); assert.equal(near.proceduralFallback, true); assert.deepEqual(near.drawnPlanes, []);
    assert.ok(ctx.calls.some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === 0 && call[3] === 1280 && call[4] === 720));
    assert.ok(!ctx.calls.some(call => call[0] === 'drawImage')); assert.ok(!nearCtx.calls.some(call => call[0] === 'drawImage'));
    assert.deepEqual(near.clip, { x: 0, y: 578, width: 1280, height: 142 });
  }
});

test('scenery has no wall clock, timer, animation loop, mission-state mutation or serialized image ownership', () => {
  const source = readFileSync(new URL('../src/xeno-arbiter-scenery-v190.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Date\.(?:now|parse)|performance\.now|Math\.random|setInterval\s*\(|setTimeout\s*\(|requestAnimationFrame\s*\(/);
  assert.doesNotMatch(source, /captureResumeState|applyResumeState|\.mission\s*=|\.player\s*=/);
  const map = new Map([[scenes[0].path, image()]]), a = context(), b = context();
  rear(a, campaign, map, { x: 360 }, { reducedMotion: true, elapsed: 10 });
  rear(b, campaign, map, { x: 360 }, { reducedMotion: true, elapsed: 99 });
  assert.deepEqual(a.calls, b.calls);
});
