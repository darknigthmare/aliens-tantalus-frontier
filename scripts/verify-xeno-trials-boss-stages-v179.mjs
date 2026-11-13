import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_BOSS_STAGES_V179 as additions, getXenoTrialsBossStageV179 } from '../src/xeno-trials-boss-stages-v179.js';
import { XENO_TRIALS_STAGES_V96 as stages } from '../src/xeno-trials-data-v96.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96, normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { getXenoTrialsStageMotionV147, getXenoTrialsStageCueV149 } from '../src/xeno-trials-stage-motion-v147.js';
import { drawXenoTrialsArenaLayersV119 } from '../src/xeno-trials-arena-layers-v119.js';

const oldIds = ['containment-deck', 'reactor-ring', 'hive-vault', 'tantalus-bridge', 'tantalus-cargo', 'planet-surface'];
const file = path => readFileSync(new URL(`..${path}`, import.meta.url));

test('forty appended settings preserve all six historical stages and use distinct real image bytes', () => {
  assert.deepEqual(stages.slice(0, 6).map(stage => stage.id), oldIds);
  assert.equal(additions.length, 40);
  // V190 appends corporate settings; this historical contract still owns the
  // exact first forty-six entries and every V179 image/physics assertion below.
  assert.deepEqual(stages.slice(6, 46), additions);
  assert.equal(new Set(stages.slice(0, 46).map(stage => stage.id)).size, 46);
  assert.deepEqual(stages.slice(46).map(stage => stage.id), [
    'xt190-adjudication-vault', 'xt190-specimen-transfer', 'xt190-executive-gallery', 'xt190-evidence-stack'
  ]);
  assert.equal(new Set(additions.map(stage => stage.backdrop)).size, 40);
  const hashes = new Set();
  for (const stage of additions) {
    const bytes = file(stage.backdrop);
    assert.ok(bytes.length > 10000, stage.backdrop);
    if (stage.backdrop.endsWith('.png')) assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    else { assert.equal(bytes.subarray(0, 4).toString(), 'RIFF'); assert.equal(bytes.subarray(8, 12).toString(), 'WEBP'); }
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
    assert.equal(getXenoTrialsBossStageV179(stage.id), stage);
    assert.ok(Object.isFrozen(stage));
    assert.equal(stage.assetStatus, 'existing-project-backdrop');
    assert.equal(stage.canonExact, false); assert.equal(stage.affectsCombat, false);
  }
  assert.equal(hashes.size, 40);
  assert.equal(getXenoTrialsBossStageV179('constructor'), null);
});

function eventTarget(extra = {}) {
  const handlers = new Map();
  return Object.assign({ addEventListener(key, fn) { if (!handlers.has(key)) handlers.set(key, new Set()); handlers.get(key).add(fn); },
    removeEventListener(key, fn) { handlers.get(key)?.delete(fn); },
    count() { return [...handlers.values()].reduce((sum, values) => sum + values.size, 0); } }, extra);
}
function runtimeHost(stageId, failBackdrop = false) {
  const calls = [], paths = [], queue = new Map(); let serial = 0;
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get(object, key) { return object[key] ?? ((...args) => calls.push([key, ...args])); } });
  const win = eventTarget(), doc = eventTarget({ hidden: false, hasFocus: () => true });
  const canvas = eventTarget({ width: 800, height: 600, tagName: 'CANVAS', getContext: () => ctx,
    setAttribute() {}, closest: () => null, focus() { doc.activeElement = this; } });
  doc.activeElement = canvas;
  const backdrop = getXenoTrialsBossStageV179(stageId).backdrop;
  const runtime = createXenoTrialsRuntimeV96({ canvas, window: win, document: doc,
    config: { playerId: 'warrior', opponentId: 'runner', stageId, seed: 179 },
    // DOM, RAF and image decoding are host doubles; actual local image bytes
    // and their signatures are checked above, not claimed as browser decoding.
    loadImage: async path => { paths.push(path); if (path === backdrop && failBackdrop) throw new Error('fixture backdrop failure');
      return { naturalWidth: 1600, naturalHeight: 900, path }; },
    requestAnimationFrame: fn => { queue.set(++serial, fn); return serial; },
    cancelAnimationFrame: id => queue.delete(id) });
  return { runtime, paths, calls, queue, win, doc, canvas };
}

for (const stage of additions) test(`${stage.id}: native ticket, save normalization, runtime selection and scenery animation`, async () => {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { stageId: stage.id });
  assert.equal(ticket.applied, true); assert.equal(ticket.config.stageId, stage.id);
  assert.equal(normalizeXenoTrialsProgressV96(JSON.parse(JSON.stringify(ticket.state))).pending.config.stageId, stage.id);
  const match = createXenoTrialsMatchV96(ticket.config);
  assert.equal(match.config.stageId, stage.id);
  const h = runtimeHost(stage.id); assert.equal(await h.runtime.start(), true);
  assert.equal(h.runtime.getState().config.stageId, stage.id);
  assert.equal(h.runtime.getState().stageVisual, 'backdrop-ready');
  assert.deepEqual(h.paths.filter(path => additions.some(s => s.backdrop === path)), [stage.backdrop]);
  assert.ok(h.calls.some(call => call[0] === 'drawImage' && call[1]?.path === stage.backdrop));
  const motion = getXenoTrialsStageMotionV147(stage.id, 120);
  assert.equal(motion.kind, getXenoTrialsStageMotionV147(stage.motionBaseStageId, 120).kind);
  assert.equal(getXenoTrialsStageMotionV147(stage.id, 120, true).time, 0);
  const cue = getXenoTrialsStageCueV149(stage.id, { phase: 'match-over', result: { winner: 'player' } });
  assert.equal(cue.terminal, true); assert.equal(cue.outcome, 'player'); assert.ok(cue.kind);
  h.runtime.stop(); assert.equal(h.queue.size, 0); assert.equal(h.win.count() + h.doc.count(), 0);
  assert.deepEqual([h.canvas.width, h.canvas.height], [800, 600]);
});

test('an optional new scenery failure keeps the selected arena and legal procedural fallback', async () => {
  const stage = additions[0], h = runtimeHost(stage.id, true);
  assert.equal(await h.runtime.start(), true);
  assert.equal(h.runtime.getState().config.stageId, stage.id);
  assert.equal(h.runtime.getState().stageVisual, 'procedural-fallback');
  assert.equal(h.runtime.getState().fighters[0].id, 'warrior');
  h.runtime.stop();
});

test('the forty scenery skins never alter the physical match or its deterministic outcome', () => {
  function run(stageId) {
    const match = createXenoTrialsMatchV96({ playerId: 'warrior', opponentId: 'runner', stageId, seed: 179,
      introSeconds: 0, roundSeconds: 30 });
    for (let tick = 0; tick < 120 * 180 && !match.result; tick++) stepXenoTrialsMatchV96(match, 1 / 120, {});
    assert.ok(match.result, stageId);
    const { stageId: ignored, ...result } = match.result;
    return { result, fighters: match.fighters };
  }
  const baseline = run(oldIds[0]);
  for (const stage of additions) assert.deepEqual(run(stage.id), baseline, stage.id);
});

test('new backdrops render behind the same visible floor without mutating a selected stage', () => {
  const stage = additions[1], before = JSON.stringify(stage), calls = [];
  const ctx = new Proxy({}, { get: (o, key) => o[key] ?? ((...args) => calls.push([key, ...args])) });
  drawXenoTrialsArenaLayersV119(ctx, stage, new Map([[stage.backdrop, { naturalWidth: 1600, naturalHeight: 900 }]]), { floor: 450, center: 600 });
  assert.equal(JSON.stringify(stage), before);
  const backdrop = calls.findIndex(call => call[0] === 'drawImage');
  const floor = calls.findIndex(call => call[0] === 'fillRect' && call[1] === 0 && call[2] === 450 && call[3] === 1000 && call[4] === 110);
  assert.ok(backdrop >= 0 && floor > backdrop);
  assert.equal(calls.filter(call => call[0] === 'save').length, calls.filter(call => call[0] === 'restore').length);
});
