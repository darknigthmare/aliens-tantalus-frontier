import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// These eleven named host fixtures exercise every event kind and an uneven
// three-row image. They are not product stages, admitted PNGs or native games.
// Production modules are evaluated verbatim except their leaf data import,
// replaced here with explicitly declared fixtures while art is produced.
const kinds = ['airlock-cycle', 'coolant-plume', 'reactor-conduit', 'freight-transit',
  'containment-scan', 'shuttle-approach', 'orbital-transit', 'storm-front',
  'rain-curtain', 'ash-drift', 'sand-drift', 'spore-drift', 'hive-movement',
  'bioluminescent-pulse', 'archive-scan', 'furnace-embers', 'ocean-swell',
  'snow-drift', 'searchlight-sweep', 'rail-transit', 'water-drip'];
const fixtures = Array.from({ length: 11 }, (_, n) => ({ id: `xt192-declared-host-fixture-${n}`,
  label: 'Declared host fixture', background: '#101b21', accent: '#80b8c0', floor: '#22313a',
  backdrop: `/declared-host-fixture-${n}.png`,
  atlasV192: { width: 701, height: 503, sha256: 'a'.repeat(64), sourceRects: [[0, 0, 701, 167], [0, 167, 701, 168], [0, 335, 701, 168]] },
  sceneV192: { seed: n + 1, architecture: n % 2 ? 'planet-exterior-outlook' : 'hive-biomechanical-bay',
    eventKinds: [kinds[n * 2], kinds[n * 2 + 1] || 'archive-scan'], anchors: [.18, .82] } }));
const scenesSource = readFileSync(new URL('../src/xeno-trials-franchise-stage-scenes-v192.js', import.meta.url), 'utf8');
const rendererSource = readFileSync(new URL('../src/xeno-trials-franchise-stage-render-v192.js', import.meta.url), 'utf8');
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
async function fixtureModules(data = fixtures, iconicData = [], referencedData = []) {
  const source = scenesSource
    .replace("import { XENO_TRIALS_FRANCHISE_STAGES_V192 } from './xeno-trials-franchise-stages-v192.js';",
      `const XENO_TRIALS_FRANCHISE_STAGES_V192 = ${JSON.stringify(data)};`)
    .replace("import { XENO_TRIALS_ORIGINAL_ARENAS_V193 } from './xeno-trials-original-arenas-v193.js';",
      'const XENO_TRIALS_ORIGINAL_ARENAS_V193 = [];')
    .replace("import { XENO_TRIALS_ICONIC_STAGES_V194 } from './xeno-trials-iconic-stages-v194.js';",
      `const XENO_TRIALS_ICONIC_STAGES_V194 = ${JSON.stringify(iconicData)};`)
    .replace("import { XENO_TRIALS_REFERENCED_STAGES_V196 } from './xeno-trials-referenced-stages-v196.js';",
      `const XENO_TRIALS_REFERENCED_STAGES_V196 = ${JSON.stringify(referencedData)};`);
  assert.notEqual(source, scenesSource, 'Only the declared stage data imports are replaced.');
  const url = moduleUrl(source), scene = await import(url);
  const render = await import(moduleUrl(rendererSource.replace("'./xeno-trials-franchise-stage-scenes-v192.js'", JSON.stringify(url))));
  return { ...scene, ...render };
}
function context() {
  const calls = [], drawOpacities = [];
  return new Proxy({ calls, drawOpacities, drawImage(...args) { drawOpacities.push(this.globalAlpha); calls.push(['drawImage', ...args]); } },
    { get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])) });
}
const image = { naturalWidth: 701, naturalHeight: 503, complete: true };
const mod = await fixtureModules();

for (const stage of fixtures) test(`${stage.id}: fixture schedules submit truthful bounded crops and matching cosmetic events`, () => {
  const profile = mod.getXenoTrialsFranchiseStageSceneV192(stage.id), map = new Map([[stage.backdrop, image]]), camera = { center: 732, floor: 453.6 };
  const before = JSON.stringify({ stage, camera }), seen = new Set();
  assert.equal(profile.replacesArena, true); assert.equal(profile.affectsCombat, false);
  for (const event of profile.events) {
    const tick = (event.periodTicks - event.offsetTicks) % event.periodTicks + Math.floor(event.durationTicks / 2);
    const ctx = context(), rear = mod.drawXenoTrialsFranchiseStageRearV192(ctx, stage, map, camera, tick);
    assert.equal(rear.renderTick, tick); assert.ok(rear.drawnEvents.includes(event.id));
    assert.equal(rear.eventReceipts.find(receipt => receipt.id === event.id).kind, event.kind); seen.add(event.kind);
    assert.equal(rear.drawnPlanes.length, 2); assert.equal(rear.proceduralFallback, false);
    assert.ok(ctx.calls.length < 230, `Bounded rear calls: ${ctx.calls.length}`);
    assert.equal(ctx.calls.filter(call => call[0] === 'save').length, ctx.calls.filter(call => call[0] === 'restore').length);
    assert.ok(ctx.calls.some(call => call[0] === 'rect' && call[2] === 0 && call[4] === camera.floor));
    const submissions = ctx.calls.filter(call => call[0] === 'drawImage');
    assert.equal(submissions.length, rear.drawnPlanes.reduce((sum, plane) => sum + plane.tiles, 0));
    assert.ok(rear.drawnPlanes.every(plane => plane.drawn && plane.renderTick === tick && plane.path === stage.backdrop
      && plane.expectedSourceSha256 === stage.atlasV192.sha256 && plane.sourceIdentity === 'admitted-registry-expected-sha256'));
    assert.ok(submissions.every(call => call.length === 10 && call[3] < 335));
    const near = context(), front = mod.drawXenoTrialsFranchiseStageFrontV192(near, stage, map, camera, tick);
    assert.equal(front.drawnPlanes.length, 1); assert.equal(front.drawnPlanes[0].id, 'foreground');
    assert.deepEqual(near.calls.find(call => call[0] === 'rect'), ['rect', 0, camera.floor + 8, 1000, 560 - camera.floor - 8]);
    assert.ok(near.calls.filter(call => call[0] === 'drawImage').every(call => call[3] === 335));
    assert.ok(near.calls.length < 45);
    assert.equal(rear.events.find(item => item.id === event.id).affectsCombat, false);
    assert.equal(mod.getXenoTrialsFranchiseStageViewV192(stage.id, camera, tick + event.durationTicks).events.find(item => item.id === event.id).active, false);
  }
  assert.deepEqual(seen, new Set(profile.events.map(event => event.kind)));
  assert.equal(JSON.stringify({ stage, camera }), before);
});

test('fixture source bands and camera tiling preserve aspect across extreme pans without gaps or unbounded work', () => {
  const stage = fixtures[0], list = mod.getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, image);
  assert.deepEqual(list.map(plane => [plane.sy, plane.sh]), [[0, 167], [167, 168], [335, 168]]);
  assert.equal(list.reduce((sum, plane) => sum + plane.sh, 0), 503);
  assert.deepEqual(list.map(plane => plane.parallax), [.035, .28, mod.getXenoTrialsFranchiseStageSceneV192(stage.id).foregroundParallax]);
  for (const plane of list) for (const center of [-1e8, -5000, 500, 5000, 1e8]) {
    const layout = mod.getXenoTrialsFranchiseStageAtlasLayoutV192(plane, { center, floor: 454 });
    assert.ok(Math.abs(layout.width / layout.height - plane.sw / plane.sh) < 1e-12);
    assert.ok(layout.tiles.length <= 2); assert.ok(layout.tiles[0] <= 0 && layout.tiles.at(-1) + layout.width >= 1000);
  }
  for (const bad of [null, {}, { sw: NaN, sh: 10, parallax: .1 }, { sw: 100, sh: 0, parallax: .1 }])
    assert.equal(mod.getXenoTrialsFranchiseStageAtlasLayoutV192(bad), null);
});

test('fixture admission rejects undecoded, foreign-size, invalid and overlapping crops rather than minting drawn receipts', async () => {
  const stage = fixtures[0];
  for (const bad of [null, {}, { naturalWidth: 0, naturalHeight: 503 }, { naturalWidth: 701, naturalHeight: 502 }, { ...image, complete: false }]) {
    assert.deepEqual(mod.getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, bad), []);
    const ctx = context(), receipt = mod.drawXenoTrialsFranchiseStageRearV192(ctx, stage, new Map([[stage.backdrop, bad]]), {}, 300);
    assert.equal(receipt.proceduralFallback, true); assert.deepEqual(receipt.drawnPlanes, []);
    assert.equal(ctx.calls.filter(call => call[0] === 'drawImage').length, 0);
  }
  const substituted = mod.drawXenoTrialsFranchiseStageRearV192(context(), { ...stage, backdrop: '/foreign.png' }, new Map([['/foreign.png', image]]), {}, 300);
  assert.deepEqual(substituted.drawnPlanes, []); assert.equal(substituted.proceduralFallback, true);
  for (const atlas of [{ ...stage.atlasV192, sha256: 'invented' }, { ...stage.atlasV192, sourceRects: [[0, 0, 701, 300], [0, 200, 701, 135], [0, 335, 701, 168]] },
    { ...stage.atlasV192, sourceRects: [[0, 0, 701, 167], [0, 167, 702, 168], [0, 335, 701, 168]] }]) {
    const fixture = { ...stage, atlasV192: atlas }, m = await fixtureModules([fixture]);
    assert.deepEqual(m.getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, image), []);
  }
  const noRects = { ...stage, atlasV192: { ...stage.atlasV192, sourceRects: undefined } }, m = await fixtureModules([noRects]);
  assert.deepEqual(m.getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, image).map(p => [p.sy, p.sh]), [[0, 167], [167, 168], [335, 168]]);
});

test('fixture reduced motion fixes visible scenery while keeping actual draw ticks truthful; pause uses the unchanged match tick', () => {
  const stage = fixtures[0], images = new Map([[stage.backdrop, image]]), camera = { center: 710, floor: 454 };
  for (const kind of ['Rear', 'Front']) {
    const draw = mod[`drawXenoTrialsFranchiseStage${kind}V192`], a = context(), b = context();
    const ar = draw(a, stage, images, camera, 300, { reducedMotion: true }), br = draw(b, stage, images, camera, 9000, { reducedMotion: true });
    assert.deepEqual(a.calls, b.calls); assert.equal(ar.motionTick, 0); assert.equal(br.motionTick, 0);
    assert.equal(ar.renderTick, 300); assert.equal(br.renderTick, 9000);
    const paused = context(); assert.deepEqual(draw(paused, stage, images, camera, 300), draw(context(), stage, images, camera, 300));
  }
  for (const phase of ['intro', 'round-over', 'match-over']) assert.equal(mod.getXenoTrialsFranchiseStageViewV192(stage.id, camera, 300, { phase }).events.some(event => event.active), false);
  assert.equal(mod.getXenoTrialsFranchiseStageViewV192(stage.id, camera, NaN).renderTick, 0);
});

test('fixture view has five distinct relative depths and unknown/legacy IDs receive no new draw', () => {
  const stage = fixtures[0], a = mod.getXenoTrialsFranchiseStageViewV192(stage.id, { center: 500 }, 300), b = mod.getXenoTrialsFranchiseStageViewV192(stage.id, { center: 900 }, 300);
  const profile = mod.getXenoTrialsFranchiseStageSceneV192(stage.id), planes = mod.getXenoTrialsFranchiseStageAtlasPlanesV192(stage.id, image);
  assert.equal(new Set([planes[0].parallax, planes[1].parallax, profile.fixtureParallax, profile.eventParallax, planes[2].parallax]).size, 5);
  assert.equal(b.fixtureOffsetX - a.fixtureOffsetX, -400 * profile.fixtureParallax);
  assert.ok(Math.abs(b.events[0].x - a.events[0].x + 400 * profile.eventParallax) < 1e-9);
  for (const id of ['containment-deck', 'xt190-adjudication-vault', 'xt179-hangar', '', null, '__proto__', 'constructor']) {
    assert.equal(mod.getXenoTrialsFranchiseStageSceneV192(id), null); assert.equal(mod.getXenoTrialsFranchiseStageViewV192(id), null);
    assert.deepEqual(mod.getXenoTrialsFranchiseStageAssetsV192(id), []);
    assert.equal(mod.drawXenoTrialsFranchiseStageRearV192(context(), { id }, new Map()), null);
    assert.equal(mod.drawXenoTrialsFranchiseStageFrontV192(context(), { id }, new Map()), null);
  }
  assert.deepEqual(mod.XENO_TRIALS_FRANCHISE_STAGE_EVENT_KINDS_V192, kinds);
});

test('scene source owns no wall clock, random state, input, damage or animation loop', () => {
  for (const source of [scenesSource, rendererSource]) {
    assert.doesNotMatch(source, /Date\.(?:now|parse)|performance\.now|Math\.random|setInterval\s*\(|setTimeout\s*\(|requestAnimationFrame\s*\(/);
    assert.doesNotMatch(source, /(?:fighter|match)\.(?:hp|x|y|paused|tick)\s*=/);
  }
});

const iconic = {
  ...fixtures[0], id: 'xt194-declared-iconic-fixture', stageRevision: 194,
  backdrop: '/declared-iconic-base.png',
  atlasV192: { width: 701, height: 503, sha256: 'a'.repeat(64), sourceRects: [[0, 0, 701, 321], [0, 329, 701, 174]] },
  propsV194: { path: '/declared-iconic-props.png', width: 900, height: 600,
    sha256: 'b'.repeat(64), rect: [0, 0, 900, 600] }
};
const propsImage = { naturalWidth: 900, naturalHeight: 600, complete: true };
const iconicMod = await fixtureModules([], [iconic]);
const iconicImages = new Map([[iconic.backdrop, image], [iconic.propsV194.path, propsImage]]);

test('V196 retains the independent texture routing, camera motion and draw order of V194', async () => {
  const referenced = { ...iconic, id: 'xt196-declared-reference-fixture', stageRevision: 196 };
  const renderer = await fixtureModules([], [iconic], [referenced]);
  assert.deepEqual(renderer.getXenoTrialsFranchiseStageAssetsV192(referenced.id), [referenced.backdrop, referenced.propsV194.path]);
  for (const camera of [{ center: 482, floor: 450 }, { center: 527, floor: 439 }]) {
    for (const images of [iconicImages, new Map([[iconic.backdrop, image]])]) {
      for (const drawStage of [renderer.drawXenoTrialsFranchiseStageRearV192, renderer.drawXenoTrialsFranchiseStageFrontV192]) {
        const oldCanvas = context(), newCanvas = context();
        const previous = drawStage(oldCanvas, iconic, images, camera, 333);
        const current = drawStage(newCanvas, referenced, images, camera, 333);
        assert.equal(current.revision, 196);
        assert.deepEqual(newCanvas.calls, oldCanvas.calls);
        assert.deepEqual(newCanvas.drawOpacities, oldCanvas.drawOpacities);
        assert.deepEqual(current.drawnPlanes, previous.drawnPlanes.map(plane => ({ ...plane, stageId: referenced.id })));
      }
    }
  }
  for (const center of [150, 850]) {
    const previous = context(), current = context();
    const [oldPlane] = renderer.drawXenoTrialsFranchiseStageFrontV192(previous, iconic, iconicImages, { center }, 333).drawnPlanes;
    const [newPlane] = renderer.drawXenoTrialsFranchiseStageFrontV192(current, referenced, iconicImages, { center }, 333).drawnPlanes;
    assert.deepEqual(newPlane.destination, oldPlane.destination);
    assert.equal(newPlane.tiles, 2);
    assert.ok(!previous.calls.some(([name]) => name === 'scale'));
    const { width, xPositions } = newPlane.destination;
    const reflectedX = xPositions[center < 500 ? 0 : 1];
    const transform = current.calls.findIndex(([name]) => name === 'translate');
    assert.deepEqual(current.calls.slice(transform, transform + 2), [['translate', reflectedX + width, 0], ['scale', -1, 1]]);
    assert.equal(current.calls[transform + 2][0], 'drawImage');
    assert.equal(current.calls[transform + 2][6], 0);
    assert.deepEqual(current.calls[transform + 3], ['restore']);
  }
});

test('V194 Canvas submissions draw the admitted middle plate once at native opacity between the two base crops', () => {
  const camera = { center: 510, floor: 450 }, rear = context(), foreground = context(), tick = 333;
  const rearView = iconicMod.drawXenoTrialsFranchiseStageRearV192(rear, iconic, iconicImages, camera, tick);
  const frontView = iconicMod.drawXenoTrialsFranchiseStageFrontV192(foreground, iconic, iconicImages, camera, tick);
  assert.equal(rearView.revision, 194); assert.equal(frontView.revision, 194);
  const planes = [...rearView.drawnPlanes, ...frontView.drawnPlanes];
  assert.deepEqual(planes.map(plane => plane.id), ['far', 'middle', 'foreground']);
  assert.deepEqual(planes.map(plane => plane.path), [iconic.backdrop, iconic.propsV194.path, iconic.backdrop]);
  assert.deepEqual(planes.map(plane => plane.expectedSourceSha256),
    [iconic.atlasV192.sha256, iconic.propsV194.sha256, iconic.atlasV192.sha256]);
  assert.deepEqual(planes.map(plane => plane.sourceRect), [
    iconic.atlasV192.sourceRects[0], iconic.propsV194.rect, iconic.atlasV192.sourceRects[1]
  ]);
  assert.deepEqual(planes.map(plane => plane.parallax), [.065, .42, 1.18]);
  assert.ok(planes.every(plane => plane.drawn && plane.renderTick === tick && plane.opacity === 1));
  assert.deepEqual(rear.calls.filter(call => call[0] === 'drawImage').map(call => call[1]),
    [...Array(planes[0].tiles).fill(image), propsImage]);
  const baseDraw = rear.calls.findLastIndex(call => call[0] === 'drawImage' && call[1] === image);
  const propsDraw = rear.calls.findIndex(call => call[0] === 'drawImage' && call[1] === propsImage);
  assert.ok(rearView.eventReceipts.some(event => event.kind === 'airlock-cycle'));
  assert.ok(rear.calls.slice(baseDraw + 1, propsDraw).some(call => call[0] === 'strokeRect'),
    'V194 draws the distant airlock after the base and before the alpha props.');
  assert.ok([...rear.drawOpacities, ...foreground.drawOpacities].every(opacity => opacity === 1));
  assert.deepEqual(foreground.calls.find(call => call[0] === 'rect'), ['rect', 0, 458, 1000, 102]);
  assert.equal(planes[1].tiles, 1);
  assert.equal(planes[1].destination.y + planes[1].destination.height, camera.floor);
  assert.equal(planes[1].destination.width / planes[1].destination.height, propsImage.naturalWidth / propsImage.naturalHeight);
});

test('V194 camera positions separate the five depths and never repeat the props plate', () => {
  const tick = 335, cameraA = { center: 482, floor: 450 }, cameraB = { center: 527, floor: 450 };
  const draw = camera => [
    iconicMod.drawXenoTrialsFranchiseStageRearV192(context(), iconic, iconicImages, camera, tick),
    iconicMod.drawXenoTrialsFranchiseStageFrontV192(context(), iconic, iconicImages, camera, tick)
  ];
  const [rearA, frontA] = draw(cameraA), [rearB, frontB] = draw(cameraB), pan = cameraB.center - cameraA.center;
  const profile = iconicMod.getXenoTrialsFranchiseStageSceneV192(iconic.id);
  const planesA = [...rearA.drawnPlanes, ...frontA.drawnPlanes], planesB = [...rearB.drawnPlanes, ...frontB.drawnPlanes];
  assert.equal(new Set([...planesA.map(plane => plane.parallax), profile.fixtureParallax, profile.eventParallax]).size, 5);
  for (const [index, plane] of planesA.entries()) {
    assert.ok(Math.abs(planesB[index].destination.xPositions[0] - plane.destination.xPositions[0] + pan * plane.parallax) < 1e-9);
  }
  assert.ok(Math.abs(rearB.fixtureOffsetX - rearA.fixtureOffsetX + pan * profile.fixtureParallax) < 1e-9);
  assert.ok(Math.abs(rearB.events[0].x - rearA.events[0].x + pan * profile.eventParallax) < 1e-9);
});

test('V194 missing, unready, wrong-size or out-of-bounds props retain both base crops without a false receipt', async () => {
  const camera = { center: 500, floor: 450 };
  const variants = [
    [iconicMod, iconic, undefined], [iconicMod, iconic, { ...propsImage, complete: false }],
    [iconicMod, iconic, { ...propsImage, naturalWidth: propsImage.naturalWidth + 1 }]
  ];
  const bad = { ...iconic, propsV194: { ...iconic.propsV194, rect: [1, 0, 900, 600] } };
  variants.push([await fixtureModules([], [bad]), bad, propsImage]);
  for (const [renderer, stage, props] of variants) {
    const map = new Map([[stage.backdrop, image], [stage.propsV194.path, props]]), rear = context(), front = context();
    const draw = kind => renderer[`drawXenoTrialsFranchiseStage${kind}V192`](kind === 'Rear' ? rear : front, stage, map, camera, 335);
    const rearView = draw('Rear'), frontView = draw('Front');
    assert.equal(rearView.proceduralFallback, false); assert.equal(frontView.proceduralFallback, false);
    assert.deepEqual([...rearView.drawnPlanes, ...frontView.drawnPlanes].map(plane => plane.id), ['far', 'foreground']);
    assert.ok([...rear.calls, ...front.calls].filter(call => call[0] === 'drawImage').every(call => call[1] === image));
  }
});

// Real catalog integration below uses admitted runtime data and the real
// controller, with declared Canvas/Image/RAF host doubles. It does not decode
// PNG pixels and is not reported as Chromium or human gameplay evidence.
function target(extra = {}) {
  const listeners = new Map();
  return Object.assign({ addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
    emit(type, event = {}) { for (const fn of [...(listeners.get(type) || [])]) fn({ preventDefault() {}, stopPropagation() {}, ...event }); },
    count() { return [...listeners.values()].reduce((sum, values) => sum + values.size, 0); } }, extra);
}
async function runtimeHost(stageId, missing = false, configuration = {}) {
  const { createXenoTrialsRuntimeV96 } = await import('../src/xeno-trials-runtime-v96.js');
  const { XENO_TRIALS_FRANCHISE_STAGES_V192: stages } = await import('../src/xeno-trials-franchise-stages-v192.js');
  const { XENO_TRIALS_ICONIC_STAGES_V194: iconicStages } = await import('../src/xeno-trials-iconic-stages-v194.js');
  const byPath = new Map(stages.map(stage => [stage.backdrop, stage.atlasV192]));
  for (const stage of iconicStages) {
    byPath.set(stage.backdrop, stage.atlasV192);
    byPath.set(stage.propsV194.path, stage.propsV194);
  }
  const window = target(), document = target({ hidden: false, hasFocus: () => true });
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }), createLinearGradient: () => ({ addColorStop() {} }) }, { get: (object, key) => object[key] ?? (() => {}) });
  const canvas = target({ tagName: 'CANVAS', width: 1000, height: 560, getContext: () => ctx, setAttribute() {}, focus() { document.activeElement = this; }, closest: () => null });
  document.activeElement = canvas;
  const queue = new Map(), loads = []; let serial = 0, time = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window, document,
    config: { stageId, playerId: 'warrior', opponentId: 'queen', difficulty: 'easy', seed: 192, roundSeconds: 120, ...configuration },
    loadImage: async path => {
      loads.push(path); const atlas = byPath.get(path);
      if (atlas) {
        if (missing === true || path === missing) throw new Error('Declared missing optional stage texture');
        return { naturalWidth: atlas.width, naturalHeight: atlas.height, complete: true };
      }
      try { const b = readFileSync(new URL(`..${path}`, import.meta.url)); if (b.subarray(1, 4).toString() === 'PNG') return { naturalWidth: b.readUInt32BE(16), naturalHeight: b.readUInt32BE(20), complete: true }; } catch { /* Declared old non-PNG decode double. */ }
      return { naturalWidth: 1024, naturalHeight: 1024, complete: true };
    }, requestAnimationFrame: callback => { queue.set(++serial, callback); return serial; }, cancelAnimationFrame: id => queue.delete(id) });
  const frames = (n = 1) => { for (let i = 0; i < n; i++) { time += 1000 / 120; const callbacks = [...queue.values()]; queue.clear(); callbacks.forEach(callback => callback(time)); } };
  assert.equal(await runtime.start(), true); runtime.skipSequence();
  for (let i = 0; i < 1600 && runtime.getState().presentation.blocksSimulation; i++) frames();
  frames(2);
  return { runtime, frames, loads, queue, window, document, canvas };
}

test('actual fifty-stage catalog has bounded real-runtime dispatch and loads only the selected new atlas per match', async () => {
  const { XENO_TRIALS_FRANCHISE_STAGES_V192: stages } = await import('../src/xeno-trials-franchise-stages-v192.js');
  const { getXenoTrialsFranchiseStageAtlasPlanesV192: planes } = await import('../src/xeno-trials-franchise-stage-scenes-v192.js');
  assert.equal(stages.length, 50);
  for (const stage of stages) {
    const image = { naturalWidth: stage.atlasV192.width, naturalHeight: stage.atlasV192.height, complete: true };
    assert.equal(planes(stage.id, image).length, 3, stage.id);
  }
  for (const media of ['film', 'series', 'game', 'comic', 'novel']) {
    const stage = stages.find(stage => stage.media === media); assert.ok(stage, media);
    const h = await runtimeHost(stage.id), state = h.runtime.getState(), rear = state.stageSceneV192.rear, front = state.stageSceneV192.front;
    assert.equal(state.config.stageId, stage.id); assert.equal(rear.stageId, stage.id); assert.equal(front.stageId, stage.id);
    assert.equal(state.stageSceneV190.rear, null); assert.equal(state.stageSceneV190.front, null);
    assert.equal(rear.drawnPlanes.length, 2); assert.equal(front.drawnPlanes.length, 1);
    assert.deepEqual(h.loads.filter(path => stages.some(item => item.backdrop === path)), [stage.backdrop]);
    assert.ok(rear.drawnPlanes.every(receipt => receipt.renderTick === state.tick));
    h.runtime.pause(); const paused = h.runtime.getState(); h.frames(60); assert.deepEqual(h.runtime.getState(), paused);
    h.runtime.stop(); assert.equal(h.queue.size, 0); assert.equal(h.window.count(), 0); assert.equal(h.canvas.count(), 0);
  }
});

test('actual new-stage optional texture failure preserves native simulation and publishes no false atlas draw', async () => {
  const { XENO_TRIALS_FRANCHISE_STAGES_V192: stages } = await import('../src/xeno-trials-franchise-stages-v192.js');
  const h = await runtimeHost(stages[0].id, true), state = h.runtime.getState();
  assert.equal(state.stageSceneV192.rear.proceduralFallback, true); assert.deepEqual(state.stageSceneV192.rear.drawnPlanes, []);
  assert.deepEqual(state.stageSceneV192.front.drawnPlanes, []); assert.equal(state.paused, false);
  const tick = state.tick; h.frames(30); assert.ok(h.runtime.getState().tick > tick); h.runtime.stop();
});

test('real V194 runtime loads only the selected stage base and props and tolerates a missing prop file', async () => {
  const { XENO_TRIALS_ICONIC_STAGES_V194: iconicStages } = await import('../src/xeno-trials-iconic-stages-v194.js');
  assert.equal(iconicStages.length, 8);
  const stage = iconicStages[0];
  for (const missing of [false, stage.propsV194.path]) {
    const h = await runtimeHost(stage.id, missing), match = h.runtime.getState();
    assert.deepEqual(h.loads.filter(path => path.startsWith('/assets/openai/stages/xeno-trials-v194/')),
      [stage.backdrop, stage.propsV194.path]);
    assert.deepEqual(match.stageSceneV192.rear.drawnPlanes.map(plane => plane.id), missing ? ['far'] : ['far', 'middle']);
    assert.deepEqual(match.stageSceneV192.front.drawnPlanes.map(plane => plane.id), ['foreground']);
    h.frames(30);
    assert.ok(h.runtime.getState().tick > match.tick);
    assert.equal(h.runtime.getState().paused, false);
    h.runtime.stop();
  }
});


test('native next-round focus preserves the earned transition while an external focus still pauses', async () => {
  const { XENO_TRIALS_FRANCHISE_STAGES_V192: stages } = await import('../src/xeno-trials-franchise-stages-v192.js');
  const h = await runtimeHost(stages.find(stage => stage.id === 'xt192-sevastopol-lorenz-systech').id, false, { playerId: 'queen', opponentId: 'boiler', roundsToWin: 2, seed: 96006, roundSeconds: 99, introSeconds: 0, holdRoundTransition: true });
  const { getXenoTrialsBodyGapV105: bodyGap } = await import('../src/xeno-trials-geometry-v105.js');
  let lastHeavy = -1000, lastLight = -1000;
  for (let frame = 0; frame < 18000 && h.runtime.getState().phase === 'active'; frame++) {
    const state = h.runtime.getState(), [player, opponent] = state.fighters, gap = bodyGap(player, opponent);
    h.runtime.setInput('right', gap > 35 && opponent.x > player.x);
    h.runtime.setInput('left', gap > 35 && opponent.x < player.x);
    const heavy = gap < 125 && !player.attack && player.stun <= 0 && state.tick - lastHeavy >= 180 && player.stamina >= 25;
    const light = !heavy && gap < 125 && !player.attack && player.stun <= 0 && state.tick - lastLight >= 180 && state.tick - lastHeavy >= 75 && player.stamina >= 12;
    h.runtime.setInput('heavy', heavy); h.runtime.setInput('light', light);
    if (heavy) lastHeavy = state.tick; if (light) lastLight = state.tick;
    h.frames();
  }
  const earned = h.runtime.getState();
  assert.equal(earned.phase, 'round-over', 'An ordinary native fight must earn the round; no result/HP/tick is assigned.');
  assert.equal(earned.roundWinner, 'player', JSON.stringify({ tick: earned.tick, hp: earned.fighters.map(f => f.hp), attacks: earned.fighters.map(f => f.stats) })); assert.equal(earned.wins.player, 1);
  const next = { tagName: 'BUTTON', closest(selector) { return selector.includes('[data-xt="next"]') ? this : null; } };
  h.document.activeElement = next; h.document.emit('focusin', { target: next });
  assert.equal(h.runtime.getState().paused, false, 'Focusing the real round transition must not add a pause over its click.');
  assert.equal(h.runtime.nextRound(), true); assert.equal(h.runtime.getState().round, earned.round + 1);
  assert.equal(h.runtime.getState().paused, false); assert.equal(h.runtime.getState().wins.player, 1);
  const external = { tagName: 'BUTTON', closest() { return null; } };
  h.document.activeElement = external; h.document.emit('focusin', { target: external });
  assert.equal(h.runtime.getState().paused, true, 'A genuinely external focus must retain the safety pause.');
  const tick = h.runtime.getState().tick; h.frames(60); assert.equal(h.runtime.getState().tick, tick);
  assert.equal(h.runtime.nextRound(), false, 'An actual pause still protects the round transition.');
  h.runtime.stop(); assert.equal(h.queue.size, 0); assert.equal(h.document.count(), 0);
});
