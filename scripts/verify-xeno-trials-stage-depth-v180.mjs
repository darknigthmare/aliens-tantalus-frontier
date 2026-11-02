import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_BOSS_STAGES_V179 as stages } from '../src/xeno-trials-boss-stages-v179.js';
import { XENO_TRIALS_STAGE_DEPTH_V180 as depths, getXenoTrialsStageDepthV180 as depth,
  getXenoTrialsStageAssetsV180 as assets, getXenoTrialsStageDepthViewV180 as view,
  getXenoTrialsStageLayerLayoutV180 as layout, drawXenoTrialsStageDepthRearV180 as rear,
  drawXenoTrialsStageDepthFrontV180 as front } from '../src/xeno-trials-stage-depth-v180.js';
import { drawXenoTrialsArenaLayersV119 as arena, drawXenoTrialsArenaOverlayV119 as overlay } from '../src/xeno-trials-arena-layers-v119.js';
import { createXenoTrialsMatchV96 as create, getXenoTrialsSnapshotV96 as snapshot } from '../src/xeno-trials-engine-v96.js';

function context() {
  const calls = [];
  return new Proxy({ calls, createRadialGradient: (...args) => { calls.push(['createRadialGradient', ...args]); return { addColorStop() {} }; } },
    { get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])) });
}
const images = stage => new Map(assets(stage.id).map(path => [path, { path, naturalWidth: 1600, naturalHeight: 900 }]));

test('forty scenery families preload 120 distinct existing images, not repeated single backdrops', () => {
  assert.equal(depths.length, 40);
  assert.equal(new Set(depths.flatMap(entry => entry.assets)).size, 120);
  const hashes = new Set();
  for (const entry of depths) {
    assert.equal(assets(entry.stageId), entry.assets);
    assert.equal(entry.layers.length, 3); assert.equal(new Set(entry.layers.map(layer => layer.parallax)).size, 3);
    assert.deepEqual(entry.layers.map(layer => layer.plane), ['behind-fighters', 'behind-fighters', 'below-feet']);
    assert.ok(Object.isFrozen(entry) && Object.isFrozen(entry.layers) && Object.isFrozen(entry.assets));
    for (const layer of entry.layers) {
      const bytes = readFileSync(new URL(`..${layer.path}`, import.meta.url));
      assert.ok(bytes.length > 10000, layer.path);
      if (layer.path.endsWith('.png')) assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      else { assert.equal(bytes.subarray(0, 4).toString(), 'RIFF'); assert.equal(bytes.subarray(8, 12).toString(), 'WEBP'); }
      hashes.add(createHash('sha256').update(bytes).digest('hex'));
    }
    assert.equal(entry.assetStatus, 'existing-project-layer-family'); assert.equal(entry.canonExact, false);
    assert.equal(entry.affectsCombat, false);
  }
  assert.equal(hashes.size, 120);
  assert.deepEqual(assets('constructor'), []); assert.equal(depth('constructor'), null); assert.equal(view('constructor'), null);
});

for (const stage of stages) test(`${stage.id}: different camera depths, phase light, reduced motion and bounded foreground`, () => {
  const a = view(stage.id, { center: 500, floor: 450 }, 120), b = view(stage.id, { center: 900, floor: 450 }, 120);
  assert.deepEqual(a.layers.map(layer => layer.offsetX), [-0, -0, -0]);
  assert.equal(new Set(b.layers.map(layer => layer.offsetX)).size, 3);
  for (let i = 0; i < 3; i++) assert.equal(b.layers[i].offsetX, -400 * a.layers[i].parallax);
  assert.ok(b.layers[2].offsetX < b.layers[1].offsetX && b.layers[1].offsetX < b.layers[0].offsetX);
  const reduced = { phase: 'round-over', phaseTime: .9, reducedMotion: true };
  assert.deepEqual(view(stage.id, { center: 900 }, 120, reduced), view(stage.id, { center: 900 }, 3000, reduced));
  assert.equal(view(stage.id, {}, 120).time, 1);
  assert.equal(view(stage.id, {}, 3000).time, 25);
  assert.notEqual(view(stage.id, {}, 120, { phase: 'intro' }).lightLevel, a.lightLevel);
  assert.notEqual(view(stage.id, {}, 120, { phase: 'match-over' }).lightLevel, a.lightLevel);
  assert.ok(Object.isFrozen(a) && Object.isFrozen(a.layers) && Object.isFrozen(a.foregroundClip));
  assert.equal(a.foregroundClip.y, a.floor + 8);
  assert.equal(a.foregroundClip.y + a.foregroundClip.height, 560);
  assert.equal(a.affectsCombat, false);
});

test('camera travel never stretches image aspect or leaves an empty horizontal image plane', () => {
  for (const size of [[1600, 900], [1774, 887], [1920, 720]]) {
    const image = { naturalWidth: size[0], naturalHeight: size[1] };
    for (const layer of depths[0].layers) for (const center of [-100000, -1000, 0, 500, 1500, 100000]) {
      const state = layout(layer, image, { center, floor: 450 });
      assert.ok(Math.abs(state.width / state.height - size[0] / size[1]) < 1e-12);
      assert.ok(state.tiles[0] <= 0);
      assert.ok(state.tiles.at(-1) + state.width >= 1000);
      assert.ok(state.tiles.length <= 2);
      for (const value of [state.width, state.height, state.y, ...state.tiles]) assert.ok(Number.isFinite(value));
    }
  }
  for (const image of [null, { naturalWidth: 0, naturalHeight: 900 }, { naturalWidth: Infinity, naturalHeight: 900 }, { naturalWidth: 1600, naturalHeight: NaN }])
    assert.equal(layout(depths[0].layers[0], image), null);
});

for (const stage of stages) test(`${stage.id}: native render layers keep fighter geometry clear and do not mutate gameplay`, () => {
  const camera = { center: 640, floor: 453.6 }, match = create({ stageId: stage.id, playerId: 'queen', opponentId: 'runner', seed: 180 });
  const before = snapshot(match), beforeCamera = structuredClone(camera), beforeDepth = JSON.stringify(depth(stage.id));
  const imageMap = images(stage), ctx = context();
  rear(ctx, stage, imageMap, camera, 120, { phase: 'active' });
  assert.ok(ctx.calls.some(call => call[0] === 'rect' && call[4] === camera.floor));
  const drawnRear = ctx.calls.filter(call => call[0] === 'drawImage').map(call => call[1].path);
  assert.ok(drawnRear.includes(assets(stage.id)[0]) && drawnRear.includes(assets(stage.id)[1]));
  assert.ok(!drawnRear.includes(assets(stage.id)[2]));
  const foreground = context(); front(foreground, stage, imageMap, camera, 120);
  assert.deepEqual(foreground.calls.find(call => call[0] === 'rect'), ['rect', 0, camera.floor + 8, 1000, 560 - camera.floor - 8]);
  assert.ok(foreground.calls.filter(call => call[0] === 'drawImage').every(call => call[1].path === assets(stage.id)[2]));
  const whole = context(); arena(whole, stage, imageMap, camera, 120);
  overlay(whole, stage, camera, 120, { images: imageMap });
  assert.ok(whole.calls.filter(call => call[0] === 'drawImage').some(call => call[1].path === assets(stage.id)[2]));
  assert.equal(whole.calls.filter(call => call[0] === 'save').length, whole.calls.filter(call => call[0] === 'restore').length);
  assert.deepEqual(snapshot(match), before); assert.deepEqual(camera, beforeCamera);
  assert.equal(JSON.stringify(depth(stage.id)), beforeDepth);
});

test('the real depth render changes with simulation time, freezes in reduced motion and preserves optional-image fallback', () => {
  const stage = stages[2], camera = { center: 540, floor: 450 }, imageMap = images(stage);
  const a = context(), b = context(), c = context(), d = context();
  rear(a, stage, imageMap, camera, 120); rear(b, stage, imageMap, camera, 240);
  assert.notDeepEqual(a.calls, b.calls);
  rear(c, stage, imageMap, camera, 120, { reducedMotion: true });
  rear(d, stage, imageMap, camera, 240, { reducedMotion: true });
  assert.deepEqual(c.calls, d.calls);
  const missingMiddle = images(stage); missingMiddle.delete(assets(stage.id)[1]);
  const fallback = context(); arena(fallback, stage, missingMiddle, camera, 120);
  assert.ok(fallback.calls.some(call => call[0] === 'drawImage' && call[1].path === stage.backdrop));
  const empty = context(); arena(empty, stage, new Map(), camera, 120);
  assert.ok(empty.calls.some(call => call[0] === 'strokeRect'));
  assert.ok(empty.calls.some(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === camera.floor));
});
