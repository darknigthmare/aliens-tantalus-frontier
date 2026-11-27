import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_STAGES_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, nextXenoTrialsRoundV96, stepXenoTrialsMatchV96, XENO_TRIALS_ARENA_V96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsStageEventsV211, drawXenoTrialsStageEventsV211, XENO_TRIALS_STAGE_EVENT_PROFILES_V211 } from '../src/xeno-trials-stage-events-v211.js';

const arena = XENO_TRIALS_ARENA_V96;
const stage = XENO_TRIALS_STAGES_V96.find(entry => entry.id === 'containment-deck');

test('the sixteen V146 arena rows bind to sixteen native rooms without ghost stages', () => {
  const plan = JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/xeno-trials-plan-v146.json', import.meta.url)));
  const profiles = XENO_TRIALS_STAGE_EVENT_PROFILES_V211;
  assert.deepEqual(profiles.map(value => value.planId), plan.tables['10_Arenes'].rows.map(row => row[0]));
  assert.equal(new Set(profiles.map(value => value.stageId)).size, 16);
  for (const { stageId } of profiles) {
    const match = createXenoTrialsMatchV96({ stageId });
    assert.equal(match.config.stageId, stageId);
    assert.equal(match.stageHazardsV188, undefined);
    assert.equal(createXenoTrialsStageEventsV211(stageId, match, arena)().affectsCombat, false);
  }
});

test('actual damage beside a boundary only affects its local scenery during the current round', () => {
  const match = createXenoTrialsMatchV96({ stageId: stage.id, playerId: 'warrior', opponentId: 'runner', introSeconds: 0 });
  const observe = createXenoTrialsStageEventsV211(stage.id, match, arena);
  // Explicit placement fixture. The engine accepts the attack, damage and events.
  match.fighters[0].x = arena.left + 120;
  match.fighters[1].x = arena.left + 42;
  for (let frame = 0; frame < 45 && !match.events.some(event => event.type === 'hit'); frame++)
    stepXenoTrialsMatchV96(match, 1 / 120, { heavy: frame === 0 }, {});
  const hit = match.events.find(event => event.type === 'hit');
  assert.ok(hit?.damage >= 20);
  const engineBefore = structuredClone(match);
  const impact = observe();
  assert.equal(impact.impact?.id, hit.id);
  assert.deepEqual(impact.degraded, ['left']);
  assert.equal(match.stageHazardsV188, undefined);
  assert.deepEqual(match, engineBefore);
  assert.deepEqual(observe(), impact);
  assert.equal(observe({ reducedMotion: true }).impact, null);

  for (let frame = 0; frame < 28; frame++) stepXenoTrialsMatchV96(match, 1 / 120, {}, {});
  assert.equal(observe().impact, null);
  assert.deepEqual(observe().degraded, ['left']);
  // The existing round transition clears the decoration and consumes old hits.
  match.phase = 'round-over';
  assert.equal(nextXenoTrialsRoundV96(match), true);
  assert.deepEqual(observe().degraded, []);
  assert.equal(observe().impact, null);
  assert.deepEqual(createXenoTrialsStageEventsV211(stage.id, match, arena)().degraded, []);
});

test('normal runtime paints rear fixtures through presentation and keeps them frozen on pause', async () => {
  const clips = [];
  const ctx = new Proxy({ globalAlpha: 1, rect: (...args) => clips.push(args),
    measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} })
  }, { get: (object, key) => object[key] ?? (() => {}) });
  const document = { hidden: false, hasFocus: () => true };
  const canvas = { width: 1000, height: 560, getContext: () => ctx, focus() { document.activeElement = this; } };
  const queued = new Map();
  let id = 0, time = 0;
  const runtime = createXenoTrialsRuntimeV96({ canvas, document, window: {}, config: { stageId: stage.id },
    loadImage: async () => ({ complete: true, naturalWidth: 1024, naturalHeight: 1024 }),
    requestAnimationFrame: callback => { queued.set(++id, callback); return id; },
    cancelAnimationFrame: id => queued.delete(id) });
  const frames = count => {
    for (let frame = 0; frame < count; frame++) {
      time += 1000 / 60;
      const current = [...queued.values()];
      queued.clear();
      for (const callback of current) callback(time);
    }
  };
  try {
    assert.equal(await runtime.start(), true);
    const initial = runtime.getState().stageEventsV211;
    assert.equal(initial.phase, 'introduction');
    assert.equal(initial.opening, 0);
    assert.equal(initial.moving, false);
    frames(300);
    const countdown = runtime.getState();
    assert.equal(countdown.stageEventsV211.phase, 'introduction');
    assert.ok(countdown.stageEventsV211.opening > 0);
    assert.equal(countdown.tick, 0);
    frames(60);
    const active = runtime.getState();
    assert.equal(active.stageEventsV211.phase, 'combat');
    assert.equal(active.stageEventsV211.tick, active.tick);
    assert.equal(active.stageHazardViewV188, null);
    assert.equal(runtime.pause(), true);
    const before = runtime.getState().stageEventsV211;
    frames(90);
    assert.deepEqual(runtime.getState().stageEventsV211, before);
    assert.ok(clips.some(([x, y, width, height]) => x === 0 && y === 0 && width === 1000 && height < 560));
  } finally { runtime.stop(); }
});

test('intermission and terminal dressing closes steadily and never replays a result pulse', () => {
  const match = createXenoTrialsMatchV96({ stageId: stage.id, introSeconds: 0 });
  const observe = createXenoTrialsStageEventsV211(stage.id, match, arena);
  match.phase = 'round-over';
  match.phaseTime = .9;
  assert.equal(observe().opening, .5);
  assert.equal(observe({ reducedMotion: true }).opening, 0);
  match.phase = 'match-over';
  const result = observe();
  assert.equal(result.phase, 'result');
  assert.equal(result.opening, 0);
  assert.equal(result.moving, false);
  assert.equal(result.time, 0);
  assert.equal(result.impact, null);
  const paint = view => {
    const calls = [];
    const ctx = new Proxy({}, { get: (_object, key) => (...args) => calls.push([key, ...args]) });
    drawXenoTrialsStageEventsV211(ctx, stage, { center: 500, floor: 450 }, view);
    return calls;
  };
  match.tick += 240;
  assert.deepEqual(paint(observe()), paint(result));
});

test('reactor horde opens the east shutter for the first wave and keeps a steady east-only reduced-motion cue', () => {
  const stageId = 'reactor-ring';
  const activityV119 = { branch: 'horde', id: 'xth213-reactor-switchback' };
  const match = createXenoTrialsMatchV96({ activityV119, introSeconds: 0 });
  const observe = createXenoTrialsStageEventsV211(stageId, match, arena);
  const introduction = { phase: 'countdown', durationMs: 1000, elapsedMs: 750, blocksSimulation: true };
  assert.deepEqual(observe({ presentation: introduction }).gates, {
    left: { status: 'locked', opening: 0 }, right: { status: 'armed', opening: .6 }
  });
  assert.deepEqual(observe().gates, { left: { status: 'locked', opening: 0 }, right: { status: 'open', opening: 1 } });
  assert.ok(match.events.filter(event => event.type === 'horde-spawn-v180').every(event => event.gateV213 === 'right'));

  const stage = XENO_TRIALS_STAGES_V96.find(entry => entry.id === stageId);
  const draw = (view, center) => {
    const rectangles = [];
    const ctx = new Proxy({ fillRect(x, y, width, height) { rectangles.push({ x, y, width, height }); } },
      { get: (object, key) => object[key] ?? (() => {}) });
    drawXenoTrialsStageEventsV211(ctx, stage, { center, floor: 450 }, view);
    return rectangles;
  };
  const staticView = observe({ reducedMotion: true });
  assert.deepEqual(staticView.gates, { left: { status: 'locked', opening: 0 }, right: { status: 'open', opening: 0 } });
  const lamps = (rects, side) => rects.filter(rect => rect.width === 4 && rect.height === 3 && side(rect.x));
  const reduced = draw(staticView, 500);
  assert.equal(lamps(reduced, x => x < 500).length, 0);
  assert.equal(lamps(reduced, x => x > 500).length, 3);
  const shifted = draw(staticView, 650);
  assert.deepEqual(lamps(shifted, x => x > 500).map(lamp => lamp.x), lamps(reduced, x => x > 500).map(lamp => lamp.x - 27));
  assert.deepEqual(observe({ reducedMotion: true }), staticView);
});
