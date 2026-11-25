// Production entry/draw/boarding/resume run unchanged. Browser APIs and Canvas
// are declared observation hosts; independent native Canvas QA reviews pixels.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { buildLegacyMissionV131, LEGACY_CAMPAIGNS_V131 } from '../src/legacy-operations-v131.js';
import { host, prepare } from './engine-host-v188.mjs';
import { MANTA_ART_V188 as ART, mantaArtReadyV188, preloadMantaArtV188,
  mantaArtFitV188, drawMantaArtV188 } from '../src/manta-art-v188.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
const readyImage = (extra = {}) => ({ complete: true, naturalWidth: ART.width,
  naturalHeight: ART.height, src: ART.path, ...extra });

function recordingContext({ throws = false } = {}) {
  const calls = [], stack = [];
  const state = { fillStyle: '#old-fill', strokeStyle: '#old-stroke', lineWidth: 7,
    font: '19px serif', globalAlpha: .75, matrix: [1, 0, 0, 1, 13, 17] };
  const initial = structuredClone(state);
  const ctx = new Proxy({
    save() { calls.push(['save']); stack.push(structuredClone(state)); },
    restore() { calls.push(['restore']); assert.ok(stack.length); Object.assign(state, stack.pop()); },
    translate(x, y) { calls.push(['translate', x, y]); const m = state.matrix; m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; },
    scale(x, y) { calls.push(['scale', x, y]); const m = state.matrix; m[0] *= x; m[1] *= x; m[2] *= y; m[3] *= y; },
    drawImage(image, ...args) { calls.push(['image', image.src, ...args]); if (throws) throw Error('declared Canvas failure'); },
    fillRect(...args) { calls.push(['fillRect', ...args]); },
    strokeRect(...args) { calls.push(['strokeRect', ...args]); },
    fillText(...args) { calls.push(['fillText', ...args]); }
  }, { get: (target, key) => key in target ? target[key] : state[key],
    set: (_, key, value) => { calls.push(['set', key, value]); state[key] = value; return true; } });
  return { ctx, calls, balanced() { assert.equal(stack.length, 0); assert.deepEqual(state, initial); } };
}

function pendingImages() {
  const requests = [];
  class Image extends EventTarget {
    complete = false; naturalWidth = 0; naturalHeight = 0;
    set src(value) { this._src = value; requests.push(this); }
    get src() { return this._src; }
    finish(success = true) {
      this.complete = true; this.naturalWidth = success ? ART.width : 0; this.naturalHeight = success ? ART.height : 0;
      this.dispatchEvent(new Event(success ? 'load' : 'error'));
    }
  }
  return { Image, requests };
}

function productionHost(t) {
  const names = ['Image', 'document', 'addEventListener', 'removeEventListener', 'dispatchEvent',
    'requestAnimationFrame', 'cancelAnimationFrame'];
  const prior = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const browser = host(), NativeImage = globalThis.Image, requests = [], engines = [];
  let frames = 0;
  globalThis.requestAnimationFrame = () => ++frames;
  globalThis.Image = class extends NativeImage {
    set src(path) {
      if (path !== ART.path) { super.src = path; return; }
      this._src = path; this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; requests.push(this);
    }
    get src() { return super.src; }
    finish(success = true) {
      this.complete = true; this.naturalWidth = success ? ART.width : 0; this.naturalHeight = success ? ART.height : 0;
      this.dispatchEvent(new Event(success ? 'load' : 'error'));
    }
  };
  t.after(() => {
    for (const engine of engines) engine.stop();
    for (const [name, descriptor] of prior) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
  });
  return { ...browser, requests, get frames() { return frames; }, async start(kind = 'abyss', engine = null, resumeState = null) {
    const campaign = LEGACY_CAMPAIGNS_V131.find(entry => entry.kind === kind);
    const options = { campaign, world: WORLDS.find(entry => entry.id === campaign.worldId), weapon: WEAPONS[0],
      enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 131, resumeState };
    options.missionLevel = buildLegacyMissionV131({ ...options, levelSeeds: LEVEL_SEEDS });
    if (!engine) { engine = new GameEngine(browser.canvas); engines.push(engine); }
    engine.start(options); await prepare(engine); return engine;
  } };
}

// Frozen observation of the R (232693f1) procedural body. Its fallback must
// preserve every colour, rectangle, label and Canvas save/restore operation.
const baselineDraw = body => [
  ['save'], ['set', 'fillStyle', '#236579'], ['fillRect', body.x, body.y, body.w, body.h],
  ['set', 'strokeStyle', '#92cbd9'], ['set', 'lineWidth', 3], ['strokeRect', body.x, body.y, body.w, body.h],
  ['set', 'fillStyle', '#b4e3dd'], ['fillRect', body.x + 28, body.y + 16, 72, 32],
  ['set', 'font', '11px monospace'], ['fillText', 'MANTA · PROTOTYPE', body.x, body.y - 12], ['restore']
];

test('MANTA source preserves the entire native PNG and its declared original-design identity', () => {
  const bytes = readFileSync(new URL('..' + ART.path, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), ART.sha256);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [ART.width, ART.height]);
  assert.deepEqual(ART.sourceRect, [0, 0, ART.width, ART.height]);
  assert.deepEqual(ART.anchor, [ART.width / 2, ART.height / 2]);
  assert.equal(ART.sourceFacing, 1); assert.equal(ART.canonExact, false); assert.equal(ART.animationStatus, 'static-hull');
});

test('MANTA admission rejects foreign ownership, incomplete/incorrect images and invalid geometry', t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', { value: { origin: 'https://manta.test' }, configurable: true });
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'location', previous); else delete globalThis.location; });
  for (const source of [ART.path, `https://manta.test${ART.path}`]) assert.equal(mantaArtReadyV188(readyImage({ src: source })), true);
  for (const extra of [{ complete: false }, { naturalWidth: 0 }, { naturalWidth: ART.width + 1 },
    { naturalHeight: ART.height - 1 }, { src: '/assets/not-manta.png' }, { src: `https://foreign.test${ART.path}` },
    { src: ART.path + '?old=1' }, { src: ART.path + '#other' }, { src: 'data:image/png;base64,AAAA' },
    { src: ART.path, currentSrc: '/assets/another-owner.png' }]) assert.equal(mantaArtReadyV188(readyImage(extra)), false);
  const body = { x: 390, y: 410, w: 180, h: 86, active: true };
  for (const changed of [{ x: NaN }, { y: Infinity }, { w: 0 }, { h: -1 }]) assert.equal(mantaArtFitV188({ ...body, ...changed }), null);
  const draw = recordingContext();
  assert.equal(drawMantaArtV188(draw.ctx, new Map(), body), false); assert.deepEqual(draw.calls, []); draw.balanced();
});

test('MANTA preload shares pending/ready requests and retries errors only on explicit re-entry', () => {
  const { Image, requests } = pendingImages(), images = new Map();
  preloadMantaArtV188(images, { ImageCtor: Image }); const first = images.get(ART.imageKey);
  preloadMantaArtV188(images, { ImageCtor: Image }); assert.equal(requests.length, 1);
  first.finish(false); assert.equal(requests.length, 1); assert.equal(mantaArtReadyV188(first), false);
  preloadMantaArtV188(images, { ImageCtor: Image }); const second = images.get(ART.imageKey);
  assert.equal(requests.length, 2); assert.notEqual(first, second);
  first.finish(true); assert.equal(images.get(ART.imageKey), second, 'A late old request cannot replace the current image.');
  second.finish(); assert.equal(mantaArtReadyV188(second), true);
  preloadMantaArtV188(images, { ImageCtor: Image }); assert.equal(requests.length, 2);
  images.set(ART.imageKey, readyImage({ src: '/assets/foreign.png' }));
  preloadMantaArtV188(images, { ImageCtor: Image }); assert.equal(requests.length, 3);
});

test('MANTA draw contains the complete source uniformly, mirrors about the body centre and restores Canvas state', () => {
  const images = new Map([[ART.imageKey, readyImage()]]);
  for (const facing of [1, -1]) {
    const body = { active: true, x: 390, y: 410, w: 180, h: 86, facing }, before = structuredClone(body);
    const fit = mantaArtFitV188(body), draw = recordingContext();
    near(fit.x, 480); near(fit.y, 453); near(fit.scale, 86 / 868);
    assert.ok(fit.width <= 180 && fit.height <= 86); near(fit.width / fit.height, 1813 / 868);
    assert.equal(drawMantaArtV188(draw.ctx, images, body), true);
    assert.deepEqual(draw.calls.find(call => call[0] === 'translate'), ['translate', 480, 453]);
    assert.deepEqual(draw.calls.find(call => call[0] === 'scale'), ['scale', fit.scale * facing, fit.scale]);
    assert.deepEqual(draw.calls.find(call => call[0] === 'image').slice(2), [0, 0, 1813, 868, -906.5, -434, 1813, 868]);
    draw.balanced(); assert.deepEqual(body, before);
  }
  const failed = recordingContext({ throws: true });
  assert.throws(() => drawMantaArtV188(failed.ctx, images, { active: true, x: 0, y: 0, w: 180, h: 86 }), /declared Canvas/);
  failed.balanced();
});

test('MANTA production start loads only in abyss, and every unavailable image retains the R fallback', async t => {
  const browser = productionHost(t), engine = await browser.start('broodstorm');
  assert.equal(browser.requests.length, 0);
  await browser.start('abyss', engine); assert.equal(browser.requests.length, 1);
  const pending = browser.requests[0], snapshot = JSON.stringify(engine.captureResumeState());
  for (const image of [pending, null, readyImage({ src: '/assets/foreign.png' }), readyImage({ naturalHeight: 1 })]) {
    engine.images.set(ART.imageKey, image); const draw = recordingContext(); engine.drawVehicle(draw.ctx);
    assert.deepEqual(draw.calls, baselineDraw(engine.vehicle)); draw.balanced();
    assert.equal(JSON.stringify(engine.captureResumeState()), snapshot);
  }
  engine.images.set(ART.imageKey, pending); await browser.start('abyss', engine);
  assert.equal(browser.requests.length, 1, 'Re-entering shares the pending load.');
  const frames = browser.frames; pending.finish(); assert.equal(browser.frames, frames);
  const draw = recordingContext(); engine.drawVehicle(draw.ctx); draw.balanced();
  assert.equal(draw.calls.filter(call => call[0] === 'image').length, 1);
  assert.equal(draw.calls.filter(call => call[0] === 'fillRect').length, 0);
  await browser.start('abyss', engine); assert.equal(browser.requests.length, 1);
  await browser.start('broodstorm', engine);
  browser.draws.length = 0; engine.drawVehicle(browser.ctx);
  assert.ok(browser.draws.length); assert.ok(browser.draws.every(draw => draw.path !== ART.path));
});

test('MANTA failed/late loads cannot restart a loop or alter a different native chapter', async t => {
  const browser = productionHost(t), engine = await browser.start(); const first = browser.requests[0];
  first.finish(false); assert.equal(browser.requests.length, 1);
  engine.drawVehicle(recordingContext().ctx); assert.equal(browser.requests.length, 1);
  await browser.start('abyss', engine); assert.equal(browser.requests.length, 2);
  const second = browser.requests[1]; await browser.start('nostromo', engine);
  const snapshot = JSON.stringify(engine.captureResumeState()), frames = browser.frames;
  first.finish(); second.finish();
  assert.equal(browser.frames, frames); assert.equal(browser.requests.length, 2);
  assert.equal(JSON.stringify(engine.captureResumeState()), snapshot);
  assert.equal(engine.legacyMissionV131.kind, 'nostromo');
});

test('MANTA art does not move native boarding exits, weapon origin, hull or resume data', async t => {
  const browser = productionHost(t), engine = await browser.start(); browser.requests[0].finish();
  engine.player.x = engine.vehicle.x - 45; engine.player.y = engine.vehicle.y;
  assert.equal(engine.toggleVehicle(), true); assert.equal(engine.player.inVehicle, true);
  assert.deepEqual([engine.vehicle.x, engine.vehicle.y, engine.vehicle.w, engine.vehicle.h], [390, 410, 180, 86]);
  for (const facing of [1, -1]) {
    engine.vehicle.facing = facing; engine.pinLegacyDriverV131();
    const before = JSON.stringify(engine.captureResumeState()), origin = engine.resolvePlayerMuzzleV124(engine.player, { x: facing, y: 0 });
    for (let i = 0; i < 3; i++) engine.drawVehicle(recordingContext().ctx);
    assert.equal(JSON.stringify(engine.captureResumeState()), before);
    near(origin.pivotX, 480); near(origin.pivotY, 438); near(origin.x, 480 + 62 * facing); near(origin.y, 438);
    assert.deepEqual(engine.resolvePlayerMuzzleV124(engine.player, { x: facing, y: 0 }), origin);
  }
  const resume = engine.captureResumeState(); assert.equal(engine.applyResumeState(resume).applied, true);
  assert.equal(engine.player.inVehicle, true); assert.equal(engine.vehicle.hull, 260);
  assert.equal(engine.toggleVehicle(), true);
  near(engine.player.x + engine.player.w / 2, engine.vehicle.x - 20);
  near(engine.player.y + engine.player.h / 2, engine.vehicle.y + engine.vehicle.h / 2);
  assert.equal(engine.legacyMissionV131.oxygen, 100); assert.equal(engine.legacyMissionV131.battery, 100);
});
