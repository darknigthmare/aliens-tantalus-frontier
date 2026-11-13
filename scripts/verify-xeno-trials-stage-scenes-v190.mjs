import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_STAGES_V96 as stages } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_BOSS_STAGES_V179 as historical } from '../src/xeno-trials-boss-stages-v179.js';
import { XENO_TRIALS_CORPORATE_STAGES_V190 as corporate, XENO_TRIALS_STAGE_ENRICHMENTS_V190 as enriched,
  XENO_TRIALS_STAGE_EVENT_KINDS_V190 as kinds, getXenoTrialsStageSceneV190 as scene,
  getXenoTrialsCorporateStageV190 as corporateStage, getXenoTrialsStageAssetsV190 as assets,
  getXenoTrialsStageAtlasPlanesV190 as planes, getXenoTrialsStageViewV190 as view } from '../src/xeno-trials-stage-scenes-v190.js';
import { getXenoTrialsStageAtlasLayoutV190 as layout, drawXenoTrialsStageRearV190 as rear,
  drawXenoTrialsStageFrontV190 as front } from '../src/xeno-trials-stage-scenes-render-v190.js';
import { createXenoTrialsMatchV96 as create, getXenoTrialsSnapshotV96 as snapshot,
  stepXenoTrialsMatchV96 as step } from '../src/xeno-trials-engine-v96.js';
import { beginXenoTrialsV96 as begin, createXenoTrialsProgressV96 as progress,
  normalizeXenoTrialsProgressV96 as normalize } from '../src/xeno-trials-progress-v96.js';

// Canvas and image objects below are explicitly host doubles. Actual PNG
// dimensions/alpha/decoding belong to art admission and native browser QA.
function context() {
  const calls = [];
  return new Proxy({ calls }, { get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args])) });
}
const image = { naturalWidth: 1254, naturalHeight: 1254 };
const all = [...historical, ...corporate];

test('forty existing settings keep exact order/data; four corporate settings append without replacing IDs', () => {
  assert.equal(enriched.length, 40); assert.equal(corporate.length, 4); assert.equal(stages.slice(0, 50).length, 50);
  assert.deepEqual(stages.slice(6, 46), historical); assert.deepEqual(stages.slice(46, 50), corporate);
  assert.deepEqual(enriched.map(entry => entry.stageId), historical.map(stage => stage.id));
  assert.equal(new Set(stages.slice(0, 50).map(stage => stage.id)).size, 50);
  assert.equal(new Set(enriched.map(entry => entry.architecture)).size, 40);
  assert.equal(new Set(corporate.map(stage => stage.backdrop)).size, 4);
  for (const stage of corporate) {
    assert.equal(corporateStage(stage.id), stage); assert.equal(stage.canonExact, false);
    assert.equal(stage.affectsCombat, false); assert.equal(assets(stage.id)[0], stage.backdrop);
  }
  for (const bad of ['constructor', '__proto__', '', null]) {
    assert.equal(scene(bad), null); assert.equal(view(bad), null); assert.equal(corporateStage(bad), null);
    assert.deepEqual(assets(bad), []); assert.deepEqual(planes(bad, image), []);
  }
});

for (const stage of all) test(`${stage.id}: bounded rear events, specific sightlines, pause/reduced-motion reproducibility`, () => {
  const a = view(stage.id, { center: 500, floor: 450 }, 720), b = view(stage.id, { center: 900, floor: 450 }, 720);
  const profile = scene(stage.id); assert.equal(profile.events.length, 2);
  assert.notEqual(profile.events[0].kind, profile.events[1].kind);
  assert.ok(profile.events.every(event => kinds.includes(event.kind)));
  assert.equal(a.fixtureOffsetX, -0); assert.equal(b.fixtureOffsetX, -400 * profile.fixtureParallax);
  assert.equal(b.foregroundOffsetX, -400 * profile.foregroundParallax);
  assert.ok(Math.abs(b.foregroundOffsetX) > Math.abs(b.fixtureOffsetX));
  for (let i = 0; i < 2; i++) {
    assert.ok(Math.abs((b.events[i].x - a.events[i].x) + 400 * profile.eventParallax) < 1e-9);
    assert.ok(a.events[i].progress >= 0 && a.events[i].progress <= 1);
    assert.equal(a.events[i].affectsCombat, false);
    const event = profile.events[i], tick = (event.periodTicks - event.offsetTicks) % event.periodTicks;
    const started = view(stage.id, {}, tick + 1).events[i];
    assert.equal(started.active, true); assert.ok(started.progress > 0);
    assert.equal(view(stage.id, {}, tick + event.durationTicks + 1).events[i].active, false);
  }
  assert.deepEqual(a, view(stage.id, { center: 500, floor: 450 }, 720));
  assert.deepEqual(view(stage.id, {}, 720, { reducedMotion: true }), view(stage.id, {}, 9800, { reducedMotion: true }));
  assert.equal(view(stage.id, {}, 200, { phase: 'match-over' }).events.some(event => event.active), false);
  assert.equal(view(stage.id, {}, 200, { phase: 'intro' }).events.some(event => event.active), false);
  assert.equal(a.frontClip.y, a.floor + 8); assert.equal(a.frontClip.height + a.frontClip.y, 560);
  assert.ok(Object.isFrozen(a) && Object.isFrozen(a.events) && Object.isFrozen(a.events[0]));
});

test('corporate atlas source bands preserve aspect, select each row exactly once and tile at most twice', () => {
  for (const stage of corporate) for (const size of [[1254, 1254], [1536, 1536], [1800, 1200]]) {
    const list = planes(stage.id, { naturalWidth: size[0], naturalHeight: size[1] });
    assert.deepEqual(list.map(plane => plane.sy), [0, size[1] / 3, size[1] * 2 / 3]);
    assert.ok(list.every(plane => plane.sw === size[0] && plane.sh === size[1] / 3));
    for (const plane of list) for (const center of [-1e6, 0, 500, 1e6]) {
      const position = layout(plane, { center, floor: 453.6 });
      assert.ok(Math.abs(position.width / position.height - plane.sw / plane.sh) < 1e-12);
      assert.ok(position.tiles.length <= 2);
      assert.ok(position.tiles[0] <= 0 && position.tiles.at(-1) + position.width >= 1000);
    }
  }
  for (const bad of [null, {}, { naturalWidth: 0, naturalHeight: 900 }, { naturalWidth: Infinity, naturalHeight: 900 }])
    assert.deepEqual(planes(corporate[0].id, bad), []);
  assert.equal(layout(null), null);
});

for (const stage of all) test(`${stage.id}: actual Canvas receipts are bounded, no foreground body occlusion or gameplay mutation`, () => {
  const match = create({ stageId: stage.id, playerId: 'queen', opponentId: 'runner', seed: 190 });
  const before = snapshot(match), camera = { center: 670, floor: 453.6 }, beforeCamera = structuredClone(camera);
  const profile = scene(stage.id), map = new Map([[stage.backdrop, image]]), ctx = context();
  const event = profile.events[0], tick = (event.periodTicks - event.offsetTicks) % event.periodTicks + event.durationTicks / 2;
  const receipt = rear(ctx, stage, map, camera, tick);
  assert.equal(receipt.replacesArena, profile.replacesArena); assert.ok(receipt.drawnEvents.includes(event.id));
  assert.ok(ctx.calls.some(call => call[0] === 'rect' && call[4] === camera.floor));
  const submitted = ctx.calls.filter(call => call[0] === 'drawImage');
  assert.equal(receipt.drawnPlanes.length, profile.replacesArena ? 2 : 0);
  assert.equal(submitted.length, receipt.drawnPlanes.reduce((sum, plane) => sum + plane.tiles, 0));
  for (const call of submitted) assert.equal(call.length, 10, 'Every atlas draw explicitly selects its source row.');
  assert.ok(ctx.calls.length < 180, `Bounded rear draw calls: ${ctx.calls.length}`);
  assert.equal(ctx.calls.filter(call => call[0] === 'save').length, ctx.calls.filter(call => call[0] === 'restore').length);
  const near = context(), nearReceipt = front(near, stage, map, camera, tick);
  assert.deepEqual(near.calls.find(call => call[0] === 'rect'), ['rect', 0, camera.floor + 8, 1000, 560 - camera.floor - 8]);
  assert.equal(nearReceipt.drawnPlanes.length, profile.replacesArena ? 1 : 0);
  assert.ok(near.calls.filter(call => call[0] === 'drawImage').every(call => call[3] === image.naturalHeight * 2 / 3));
  assert.ok(near.calls.length < 40);
  assert.deepEqual(snapshot(match), before); assert.deepEqual(camera, beforeCamera);
  const missing = rear(context(), stage, new Map(), camera, tick);
  assert.deepEqual(missing.drawnPlanes, []); assert.equal(missing.proceduralFallback, profile.replacesArena);
});

test('all four new stage tickets survive JSON normalization and retain the common physical combat result', () => {
  const run = stageId => {
    const match = create({ stageId, playerId: 'warrior', opponentId: 'runner', introSeconds: 0, seed: 190, roundSeconds: 30 });
    for (let i = 0; i < 120 * 180 && !match.result; i++) step(match, 1 / 120, { light: i % 65 < 2, right: i % 260 < 80 });
    assert.ok(match.result);
    const result = structuredClone(match.result); delete result.stageId;
    return { result, fighters: match.fighters };
  };
  const baseline = run('containment-deck');
  for (const stage of corporate) {
    const ticket = begin(progress(), { stageId: stage.id });
    assert.equal(ticket.applied, true); assert.equal(ticket.config.stageId, stage.id);
    assert.equal(normalize(JSON.parse(JSON.stringify(ticket.state))).pending.config.stageId, stage.id);
    assert.deepEqual(run(stage.id), baseline);
  }
});

test('scenery owns no wall clock, gameplay inputs, damage, timers or independent animation loop', () => {
  for (const file of ['xeno-trials-stage-scenes-v190.js', 'xeno-trials-stage-scenes-render-v190.js']) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /Date\.(?:now|parse)|performance\.now|Math\.random|setInterval\s*\(|setTimeout\s*\(|requestAnimationFrame\s*\(/);
  }
  const stage = corporate[0], map = new Map([[stage.backdrop, image]]);
  const a = context(), b = context();
  rear(a, stage, map, { center: 600 }, 720, { reducedMotion: true });
  rear(b, stage, map, { center: 600 }, 9000, { reducedMotion: true });
  assert.deepEqual(a.calls, b.calls);
});
