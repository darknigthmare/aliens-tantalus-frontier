import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { drawXenoTrialsArenaLayersV119 } from '../src/xeno-trials-arena-layers-v119.js';
import { drawXenoTrialsAcidV152 } from '../src/xeno-trials-acid-pools-v152.js';
import { createXenoTrialsOptionalImagesV205, getXenoTrialsProjectileImageV205,
  drawXenoTrialsProjectileV205, drawXenoTrialsHazardImageV205, drawXenoTrialsAcidPoolImagesV205,
  drawXenoTrialsAcidDropV205, drawXenoTrialsDetonationV205, drawXenoTrialsFlameConeV205,
  XENO_TRIALS_PROJECTILE_IMAGES_V205 as projectiles, XENO_TRIALS_EFFECT_IMAGES_V205 as effects,
  XENO_TRIALS_STAGE_BACKDROPS_V205 as backdrops, XENO_TRIALS_STAGE_FLOORS_V205 as floors } from '../src/xeno-trials-visual-assets-v205.js';

// Canvas, decoded dimensions, DOM and RAF are declared host doubles. The
// production controller/engine run unchanged; no running match state is injected.
const image = path => ({ path, naturalWidth: 400, naturalHeight: 200 });
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function context() {
  const calls = [];
  const ctx = new Proxy({ globalAlpha: 1, calls, measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])) });
  return ctx;
}
function host({ failure = false, stageId = 'containment-deck', playerId = 'spitter' } = {}) {
  const ctx = context(), loads = [], queue = new Map(); let serial = 0, time = 0;
  const target = extras => ({ addEventListener() {}, removeEventListener() {}, ...extras });
  const document = target({ hidden: false, hasFocus: () => true });
  const canvas = target({ getContext: () => ctx, setAttribute() {}, focus() { document.activeElement = this; } });
  document.activeElement = canvas;
  const runtime = createXenoTrialsRuntimeV96({ canvas, document, window: target({}),
    config: { playerId, opponentId: 'warrior', stageId, seed: 251, difficulty: 'easy', roundSeconds: 120 },
    audioEnabled: false,
    loadImage: async path => { loads.push(path); if (failure && path.includes('/xeno-trials-v205/')) throw new Error('Declared optional-image failure'); return image(path); },
    requestAnimationFrame: fn => { queue.set(++serial, fn); return serial; }, cancelAnimationFrame: id => queue.delete(id) });
  const frames = (count = 1) => {
    for (let i = 0; i < count; i++) {
      time += 1000 / 120; const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(fn => fn(time));
    }
  };
  return { runtime, ctx, loads, frames, queue,
    async start() { assert.equal(await runtime.start(), true); runtime.skipSequence();
      for (let i = 0; i < 1600 && runtime.getState().presentation.blocksSimulation; i++) frames();
      assert.equal(runtime.getState().presentation.blocksSimulation, false); } };
}

test('the three historical simulation IDs acquire only their own selected backdrop', async () => {
  assert.deepEqual(Object.keys(backdrops), ['containment-deck', 'reactor-ring', 'hive-vault']);
  for (const [id, path] of Object.entries(backdrops)) {
    const stage = XENO_TRIALS_STAGES_V96.find(value => value.id === id);
    assert.equal(stage.backdrop, path);
    const h = host({ stageId: id }); await h.start();
    assert.equal(h.runtime.getState().stageVisual, 'backdrop-ready');
    assert.deepEqual(h.loads.filter(value => value.includes('/xeno-trials-v205/')), [path]);
    const draw = h.ctx.calls.find(([kind, value]) => kind === 'drawImage' && value.path === path);
    assert.ok(draw);
    const floorFill = h.ctx.calls.slice(h.ctx.calls.indexOf(draw)).find(row => row[0] === 'fillRect'
      && row[1] === 0 && row[2] > 0 && row[3] === 1000 && row[2] + row[4] === 560);
    assert.ok(floorFill);
    assert.equal(draw[3] + draw[5] * floors[id], floorFill[2], 'generated contact edge follows the same camera floor as the native floor');
    assert.equal(draw[4] / draw[5], 2, 'backdrop is not stretched');
    const withImage = context(), withoutImage = context(), camera = { center: 500, floor: 450 };
    drawXenoTrialsArenaLayersV119(withImage, stage, new Map([[path, image(path)]]), camera);
    drawXenoTrialsArenaLayersV119(withoutImage, stage, new Map(), camera);
    assert.equal(withImage.calls.some(row => row[0] === 'strokeRect'), false, 'fallback architecture does not obscure the generated scenery');
    assert.ok(withoutImage.calls.some(row => row[0] === 'strokeRect'), 'fallback architecture survives a missing image');
    h.runtime.stop();
  }
});

test('optional images load on demand once, reject foreign paths, and ignore completion after stop', async () => {
  const images = new Map(), loads = []; let alive = true, ready = 0, resolve;
  const get = createXenoTrialsOptionalImagesV205(images, path => { loads.push(path); return new Promise(done => { resolve = done; }); }, () => alive, () => ready++);
  assert.equal(loads.length, 0);
  assert.equal(get('/assets/unrelated.png'), null);
  assert.equal(get('/assets/openai/xeno-trials-v205/characters/grid-heavy-impact.png'), null);
  assert.equal(get(projectiles['pulse-bolt']), null);
  get(projectiles['pulse-bolt']); await settle(); assert.deepEqual(loads, [projectiles['pulse-bolt']]);
  resolve(image(projectiles['pulse-bolt'])); await settle();
  assert.equal(get(projectiles['pulse-bolt']).path, projectiles['pulse-bolt']); assert.equal(ready, 1);
  get(effects['steam-jet']); await settle(); alive = false; resolve(image(effects['steam-jet'])); await settle();
  assert.equal(images.has(effects['steam-jet']), false); assert.equal(ready, 1);
});

test('a failed or undecodable optional image is not requested every frame', async () => {
  for (const returned of [null, { naturalWidth: 0, naturalHeight: 300 }, new Error('unavailable')]) {
    let attempts = 0;
    const get = createXenoTrialsOptionalImagesV205(new Map(), async () => { attempts++; if (returned instanceof Error) throw returned; return returned; }, () => true);
    for (let n = 0; n < 3; n++) { assert.equal(get(projectiles['aimed-acid']), null); await settle(); }
    assert.equal(attempts, 1);
  }
});

test('projectiles preserve source aspect and rotate with actual upward/leftward motion without writes', () => {
  for (const [vx, vy] of [[300, 140], [-300, 140], [-300, -140], [300, -140]]) {
    const projectile = Object.freeze({ x: 200, y: 80, vx, vy, direction: Math.sign(vx), style: 'acid', signatureIdV147: 'pathogen-queen-acid-cluster', radiusV147: 7 });
    const ctx = context(); assert.equal(drawXenoTrialsProjectileV205(ctx, projectile, image), true);
    assert.equal(ctx.calls.find(([kind]) => kind === 'rotate')[1], Math.atan2(-vy, vx));
    const draw = ctx.calls.find(([kind]) => kind === 'drawImage');
    assert.equal(draw[8] / draw[9], 2); assert.equal(draw[1].path, projectiles['acid-cluster']);
  }
  assert.equal(getXenoTrialsProjectileImageV205({ style: 'unknown' }), null);
  assert.equal(drawXenoTrialsProjectileV205(context(), { style: 'pulse', x: 2, y: 3 }, () => null), false);
});

test('reviewed alpha frames remove padding without stretching or reusing a frame for changed dimensions', () => {
  const projectile = Object.freeze({ x: 200, y: 80, style: 'pulse', direction: 1 });
  const ctx = context();
  drawXenoTrialsProjectileV205(ctx, projectile, path => ({ path, naturalWidth: 2172, naturalHeight: 724 }));
  const draw = ctx.calls.find(([kind]) => kind === 'drawImage');
  assert.deepEqual(draw.slice(2, 6), [420, 232, 1345, 270]);
  assert.ok(Math.abs(draw[8] / draw[9] - draw[4] / draw[5]) < 1e-12);
  assert.equal(draw[8], 48);
  const changed = context(); drawXenoTrialsProjectileV205(changed, projectile, image);
  assert.deepEqual(changed.calls.find(([kind]) => kind === 'drawImage').slice(2, 6), [0, 0, 400, 200]);
  const pool = context();
  drawXenoTrialsAcidPoolImagesV205(pool, { tick: 24, acidPoolsV152: [{ left: 200, right: 288, height: 6, armedTick: 24, expiresTick: 360 }] },
    path => ({ path, naturalWidth: 2172, naturalHeight: 724 }));
  const puddle = pool.calls.find(([kind]) => kind === 'drawImage');
  assert.equal(puddle[8], 88, 'corrected acid artwork spans the native pool width despite its transparent margins');
  assert.ok(puddle[9] > 3 && puddle[9] <= 6, 'the visible pool remains within the native six-pixel height');
});

test('hazard overlays occur only in the native active area and acid pools only after arming', () => {
  const zone = Object.freeze({ left: 200, right: 320, bottom: 0, top: 150 });
  const ctx = context(), requested = [], get = path => { requested.push(path); return image(path); };
  assert.equal(drawXenoTrialsHazardImageV205(ctx, { phase: 'warning', kind: 'steam', zones: [zone] }, get), false);
  assert.equal(requested.length, 0);
  for (const kind of ['steam', 'cryo', 'arc', 'debris', 'corrosive'])
    assert.equal(drawXenoTrialsHazardImageV205(ctx, Object.freeze({ phase: 'active', kind, zones: [zone] }), get), true);
  assert.ok(ctx.calls.some(row => row[0] === 'rect' && row.slice(1).join() === '200,300,120,150'));
  const pool = Object.freeze({ left: 200, right: 288, height: 6, armedTick: 24, expiresTick: 360 });
  assert.equal(drawXenoTrialsAcidPoolImagesV205(ctx, { tick: 23, acidPoolsV152: [pool] }, get), 0);
  assert.equal(drawXenoTrialsAcidPoolImagesV205(ctx, { tick: 24, acidPoolsV152: [pool] }, get), 1);
  assert.equal(drawXenoTrialsAcidPoolImagesV205(ctx, { tick: 360, acidPoolsV152: [pool] }, get), 0);
});

test('native acid drop rendering keeps its fallback and pool warnings while fitting the four-by-six footprint', () => {
  const match = Object.freeze({ tick: 10,
    acidDropsV152: Object.freeze([Object.freeze({ x: 200, y: 70 })]),
    acidPoolsV152: Object.freeze([Object.freeze({ left: 300, right: 388, height: 6, armedTick: 24, expiresTick: 360 })]) });
  const withImage = context(), fallback = context();
  const renderDrop = (ctx, drop, floor) => drawXenoTrialsAcidDropV205(ctx, drop,
    path => ({ path, naturalWidth: 1024, naturalHeight: 1536 }), floor);
  drawXenoTrialsAcidV152(withImage, match, { floor: 450 }, true, renderDrop);
  drawXenoTrialsAcidV152(fallback, match, { floor: 450 }, true, (ctx, drop, floor) => drawXenoTrialsAcidDropV205(ctx, drop, () => null, floor));
  const sprite = withImage.calls.find(row => row[0] === 'drawImage');
  assert.ok(sprite[8] <= 4 && sprite[9] === 6);
  assert.equal(sprite[6] + sprite[8] / 2, 200); assert.equal(sprite[7] + sprite[9] / 2, 380);
  assert.ok(fallback.calls.some(row => row[0] === 'fillRect' && row.slice(1).join() === '198,377,4,6'));
  const warnings = ctx => ctx.calls.filter(row => row[0] === 'strokeRect');
  assert.deepEqual(warnings(withImage), warnings(fallback)); assert.equal(warnings(withImage).length, 1);
});

test('detonation art uses only an existing live event and stays inside its native expanding radius', () => {
  const effect = Object.freeze({ kind: 'detonation', x: 200, y: 80, radius: 170, life: .2 });
  const ctx = context(); assert.equal(drawXenoTrialsDetonationV205(ctx, effect, image), true);
  assert.deepEqual(ctx.calls.find(row => row[0] === 'arc').slice(1, 4), [200, 370, 85]);
  assert.ok(ctx.calls.some(row => row[0] === 'clip'));
  for (const bad of [{ ...effect, kind: 'warning' }, { ...effect, life: 0 }, { ...effect, life: .4 }])
    assert.equal(drawXenoTrialsDetonationV205(context(), bad, () => { throw new Error('inactive event must not request an image'); }), false);
});

test('Trials flame art is active-only, clipped to the shared native cone, and follows the committed attack direction', () => {
  const fighter = Object.freeze({ y: 30, facing: 1, attack: Object.freeze({ kind: 'special', facing: -1, age: .5 }) });
  const body = Object.freeze({ left: 100, right: 140, height: 100 }), spec = Object.freeze({ startup: .4, active: .56, reach: 190 });
  const ctx = context(); assert.equal(drawXenoTrialsFlameConeV205(ctx, fighter, body, spec, image), true);
  assert.deepEqual(ctx.calls.find(row => row[0] === 'translate').slice(1), [100, 365]);
  assert.deepEqual(ctx.calls.find(row => row[0] === 'scale').slice(1), [-1, 1]);
  assert.ok(ctx.calls.some(row => row[0] === 'lineTo' && row[1] === 190 && row[2] === 12 + 190 * .22));
  assert.ok(ctx.calls.some(row => row[0] === 'clip'));
  for (const age of [.39, 1.1])
    assert.equal(drawXenoTrialsFlameConeV205(context(), { ...fighter, attack: { ...fighter.attack, age } }, body, spec,
      () => { throw new Error('windup and recovery must not request flame art'); }), false);
});

for (const [playerId, paths, retreat] of [
  ['spitter', [projectiles['aimed-acid']], true],
  ['drive-v123-fte-pathogen-queen-right-v13', [projectiles['acid-cluster'], projectiles['acid-drop'], effects['acid-pool']], true],
  ['synth-incinerator', [effects['synth-flame-cone']], false],
  ['synth-detonator', [effects.detonation], false]
]) test(`${playerId}: native special inputs render lazy art while image failure preserves the same combat`, async () => {
  const success = host({ playerId }), fallback = host({ playerId, failure: true });
  await success.start(); await fallback.start();
  for (const h of [success, fallback]) {
    if (retreat) { h.runtime.setInput('left', true); h.frames(80); h.runtime.setInput('left', false); }
    h.runtime.setInput('special', true);
  }
  for (let i = 0; i < 240; i++) { success.frames(); fallback.frames(); await settle(); }
  for (const path of paths) {
    assert.ok(success.loads.includes(path), path);
    assert.ok(success.ctx.calls.some(([kind, value]) => kind === 'drawImage' && value.path === path), path);
    assert.equal(fallback.ctx.calls.some(([kind, value]) => kind === 'drawImage' && value.path === path), false, path);
  }
  const a = success.runtime.getState(), b = fallback.runtime.getState();
  assert.equal(a.tick, b.tick); assert.equal(a.phase, b.phase); assert.deepEqual(a.fighters, b.fighters);
  assert.equal(b.paused, false); assert.equal(b.stageVisual, 'procedural-fallback');
  for (const h of [success, fallback]) { h.runtime.stop(); assert.equal(h.queue.size, 0); }
});
