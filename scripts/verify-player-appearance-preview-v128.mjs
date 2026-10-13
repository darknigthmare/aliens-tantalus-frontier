import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDefaultSave } from '../src/save.js';
import { WEAPONS } from '../src/content-core-v50.js';
import { normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { playerAppearancePanelHtmlV126 } from '../src/player-appearance-ui-v126.js';
import {
  PLAYER_APPEARANCE_PREVIEW_MODES_V128, getPlayerAppearancePreviewModesV128,
  normalizePlayerAppearancePreviewAnimationV128, samplePlayerAppearancePreviewV128,
  createPlayerAppearancePreviewV126
} from '../src/player-appearance-preview-v126.js';
import { advancePlayerTransitStateV128, resolvePlayerTransitRigV128 } from '../src/player-transit-rig-v128.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pistol = WEAPONS.find(weapon => weapon.name === 'M4A3 Service Pistol');
const transitModes = PLAYER_APPEARANCE_PREVIEW_MODES_V128.filter(mode => mode.transit);
const flush = () => new Promise(resolve => setImmediate(resolve));
const copy = value => JSON.parse(JSON.stringify(value));
const selectedAppearance = () => normalizePlayerAppearanceV126({ schema: 126, slots: {
  helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
  arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126'
} });

function environment(t, { pending = false, decoding = false, failure = null } = {}) {
  const originals = new Map(['Image', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const frames = new Map(), images = [];
  let serial = 0, time = 100;
  class PreviewImage {
    constructor() {
      this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0;
      this.listeners = new Map(); this.srcValue = ''; this.decoded = null;
      if (decoding) this.decode = () => new Promise(resolve => { this.decoded = resolve; });
      images.push(this);
    }
    set src(value) { this.srcValue = value; if (!pending) this.finish(!failure?.(value)); }
    get src() { return this.srcValue; }
    addEventListener(type, callback) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(callback);
    }
    removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
    finish(success = true) {
      this.complete = true;
      if (success) {
        const bytes = fs.readFileSync(path.join(root, this.src.slice(1)));
        assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
        this.naturalWidth = bytes.readUInt32BE(16); this.naturalHeight = bytes.readUInt32BE(20);
      }
      const type = success ? 'load' : 'error';
      this[`on${type}`]?.();
      for (const callback of [...(this.listeners.get(type) || [])]) callback();
      this.decoded?.();
    }
  }
  for (const [key, value] of Object.entries({ Image: PreviewImage, performance: { now: () => time },
    requestAnimationFrame: callback => { const id = ++serial; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id) })) Object.defineProperty(globalThis, key,
    { configurable: true, writable: true, value });
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { images, frames,
    advance(milliseconds) {
      time += milliseconds;
      const queued = [...frames.values()]; frames.clear();
      for (const callback of queued) callback(time);
    },
    get listeners() { return images.reduce((sum, image) => sum + [...image.listeners.values()]
      .reduce((total, callbacks) => total + callbacks.size, 0), 0); }
  };
}

function canvas() {
  const state = { draws: [], fills: [], clears: 0, depth: 0 }, stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  const point = (x, y) => ({ x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5] });
  const transform = (a, b, c, d, e, f) => {
    const m = matrix;
    matrix = [m[0] * a + m[2] * b, m[1] * a + m[3] * b,
      m[0] * c + m[2] * d, m[1] * c + m[3] * d,
      m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]];
  };
  const ctx = {
    save() { stack.push([...matrix]); state.depth++; },
    restore() { matrix = stack.pop(); state.depth--; assert.ok(state.depth >= 0); },
    clearRect() { state.clears++; state.draws = []; state.fills = []; },
    drawImage(image, ...args) {
      const [x, y, w, h] = args.length === 8 ? args.slice(4) : args;
      state.draws.push({ src: image.src, args,
        corners: [point(x, y), point(x + w, y), point(x + w, y + h), point(x, y + h)] });
    },
    fillRect(x, y, width, height) { state.fills.push({ x, y, width, height, matrix: [...matrix] }); },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, stroke() {}, clip() {},
    translate(x, y) { transform(1, 0, 0, 1, x, y); },
    scale(x, y) { transform(x, 0, 0, y, 0, 0); }, transform
  };
  return { width: 360, height: 320, dataset: {}, state, getContext: () => ctx };
}

test('fourteen labelled modes retain weapon admission and expose the five new gestures to both operators', () => {
  assert.equal(PLAYER_APPEARANCE_PREVIEW_MODES_V128.length, 14);
  assert.deepEqual(transitModes.map(mode => mode.id), ['climb-up', 'climb-down', 'downed', 'death', 'revive']);
  assert.equal(getPlayerAppearancePreviewModesV128().filter(mode => mode.available).length, 12);
  assert.equal(normalizePlayerAppearancePreviewAnimationV128('reload'), 'idle');
  assert.equal(normalizePlayerAppearancePreviewAnimationV128('invented'), 'idle');
  assert.ok(getPlayerAppearancePreviewModesV128(pistol).every(mode => mode.available));
  const save = createDefaultSave(), before = copy(save);
  save.strategy.currentOperation = { id: 'preview-only' };
  for (const owner of ['player', 'coop']) {
    for (const mode of transitModes) {
      const html = playerAppearancePanelHtmlV126(save, { owner, animation: mode.id });
      assert.match(html, /<label[^>]+for="player-appearance-animation-v127"/);
      assert.match(html, new RegExp(`<option value="${mode.id}" selected>${mode.label}</option>`));
      assert.equal((html.match(/<option /g) || []).length, 14);
      assert.doesNotMatch(html, /<select[^>]* disabled/);
    }
  }
  delete save.strategy.currentOperation;
  delete before.strategy.currentOperation;
  assert.deepEqual(save, before);
});

test('preview samples use real ladder and casualty inputs without borrowing the held weapon or mutating appearance', () => {
  const appearance = selectedAppearance(), before = copy(appearance), weaponBefore = copy(pistol);
  for (const mode of transitModes) {
    const a = samplePlayerAppearancePreviewV128({ animation: mode.id, appearance,
      weaponDescriptor: pistol, facing: -1, timeSeconds: mode.fixedTime });
    const b = samplePlayerAppearancePreviewV128({ animation: mode.id, appearance,
      weaponDescriptor: pistol, facing: -1, timeSeconds: mode.fixedTime });
    assert.deepEqual(a, b);
    assert.equal(a.transit, true);
    assert.equal(a.profile, null);
    assert.equal(a.actor.weaponMode, 'unarmed');
    assert.equal(a.actor.fieldActionV124, undefined);
    assert.equal(a.actor.tacticalReload, undefined);
    if (mode.id.startsWith('climb')) {
      assert.equal(a.actor.climbing, true);
      assert.equal(a.actor.grounded, false);
      assert.ok(a.ladder.top < a.actor.y && a.ladder.bottom > a.actor.y + a.actor.h);
      assert.equal(Math.sign(a.actor.vy), mode.id === 'climb-up' ? -1 : 1);
    } else if (mode.id === 'downed') {
      assert.equal(a.actor.alive, false); assert.equal(a.actor.downed, true);
    } else if (mode.id === 'death') {
      assert.equal(a.actor.alive, false); assert.equal(a.actor.downed, false);
    } else assert.equal(a.actor.alive, true);
    a.actor.appearanceV126.slots.mask = null;
  }
  assert.deepEqual(appearance, before);
  assert.deepEqual(pistol, weaponBefore);
});

test('only observed changes animate the collapse and recovery; a stopped ladder pose holds every contact', () => {
  const atStart = samplePlayerAppearancePreviewV128({ animation: 'downed', timeSeconds: 0 });
  const later = samplePlayerAppearancePreviewV128({ animation: 'downed', timeSeconds: 9 });
  assert.equal(atStart.transitState.observed, false);
  assert.equal(atStart.transitState.phase, 'settled');
  assert.equal(later.transitState.progress, 1);
  const falling = samplePlayerAppearancePreviewV128({ animation: 'death', timeSeconds: .15 });
  const settled = samplePlayerAppearancePreviewV128({ animation: 'death', timeSeconds: .9 });
  assert.equal(falling.transitState.observed, true);
  assert.ok(falling.transitState.progress > 0 && falling.transitState.progress < 1);
  assert.equal(settled.transitState.phase, 'settled');
  const rising = samplePlayerAppearancePreviewV128({ animation: 'revive', timeSeconds: .15 });
  const upright = samplePlayerAppearancePreviewV128({ animation: 'revive', timeSeconds: .9 });
  assert.equal(rising.transitState.kind, 'revive');
  assert.equal(upright.transitState.kind, null);
  assert.equal(resolvePlayerTransitRigV128(upright).reason, 'no-active-transit');

  const climbing = samplePlayerAppearancePreviewV128({ animation: 'climb-up', timeSeconds: .55 });
  const actor = { ...climbing.actor, vy: 0 };
  const context = climbing.transitState.context, ladder = climbing.ladder;
  const firstState = advancePlayerTransitStateV128(climbing.transitState, actor, 1, { context, ladder });
  const secondState = advancePlayerTransitStateV128(firstState, actor, 12, { context, ladder });
  const first = resolvePlayerTransitRigV128({ actor, ladder, transitState: firstState, timeSeconds: 1 });
  const second = resolvePlayerTransitRigV128({ actor, ladder, transitState: secondState, timeSeconds: 12 });
  assert.equal(first.phase, 'holding');
  assert.deepEqual(second.contacts, first.contacts);
  assert.deepEqual(second.legs, first.legs);
  assert.deepEqual(second.arms, first.arms);
});

test('each transit preview draws the selected six-part outfit with empty hands and a bounded image cache', async t => {
  const env = environment(t), stage = canvas(), appearance = selectedAppearance();
  const preview = createPlayerAppearancePreviewV126(stage, { appearance, weaponDescriptor: pistol });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, true);
  for (const mode of transitModes) {
    assert.equal(preview.setAnimation(mode.id), mode.id);
    await flush(); env.advance(mode.fixedTime * 1000);
    const state = preview.getSnapshot();
    assert.equal(state.ready, true, `${mode.id}: ${state.reason}`);
    assert.equal(state.animation, mode.id);
    assert.deepEqual(state.effectiveSlots, appearance.slots);
    assert.equal(state.weaponId, null);
    assert.equal(state.actionKind, null);
    assert.equal(state.images.loading, 0);
    assert.ok(state.images.retained <= 8, `${mode.id}: ${state.images.retained}`);
    assert.ok(stage.state.draws.some(draw => /rig-v128/.test(draw.src)), mode.id);
    assert.equal(stage.state.depth, 0);
    assert.equal(env.frames.size, 1);
    assert.equal(stage.dataset.appearanceAnimationV127, mode.id);
  }
});

test('the drawn ladder rungs use the actual world contact grid and the repeat does not displace the operator', async t => {
  const env = environment(t), stage = canvas();
  const preview = createPlayerAppearancePreviewV126(stage, { animation: 'climb-up', appearance: selectedAppearance() });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, true);
  const before = preview.getSnapshot();
  const rungs = stage.state.fills.filter(fill => fill.width === 26 && fill.height === 3);
  assert.ok(rungs.length >= 5);
  for (const rung of rungs) {
    const center = rung.y + 1;
    assert.equal((center - before.previewLadder.top - 11) % 22, 0);
  }
  env.advance(2000);
  const repeated = preview.getSnapshot();
  assert.deepEqual(repeated.previewActor, before.previewActor);
  assert.deepEqual(repeated.arms, before.arms);
  preview.setFacing(-1);
  const mirrored = preview.getSnapshot();
  assert.equal(mirrored.timeSeconds, repeated.timeSeconds);
  assert.equal(mirrored.transitPhase, repeated.transitPhase);
  assert.equal(mirrored.previewActor.y, repeated.previewActor.y);
  assert.equal(env.frames.size, 1);
});

test('each reduced-motion transit is a stable inspectable pose and schedules no RAF', async t => {
  const env = environment(t), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selectedAppearance(), animation: 'climb-up',
    reducedMotion: true, onStatus: status => statuses.push(status) });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, true);
  for (const mode of transitModes) {
    preview.setAnimation(mode.id); await flush();
    const before = preview.getSnapshot();
    assert.equal(before.ready, true, mode.id);
    env.advance(12000); preview.setFacing(before.facing);
    const after = preview.getSnapshot();
    assert.deepEqual(after.arms, before.arms);
    assert.deepEqual(after.previewActor, before.previewActor);
    assert.equal(after.transitProgress, before.transitProgress);
    assert.equal(after.timeSeconds, before.timeSeconds);
    assert.equal(env.frames.size, 0);
    assert.match(statuses.at(-1).message, /Pose fixe/);
  }
});

test('a missing segmented-leg image rejects transit and ordinary poses before drawing any garment', async t => {
  const env = environment(t, { failure: source => /rig-v128/.test(source) }), stage = canvas();
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selectedAppearance(), animation: 'climb-up' });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, false);
  assert.equal(stage.state.draws.length, 0);
  assert.equal(env.frames.size, 0);
  preview.setAnimation('idle'); await flush();
  assert.equal(preview.getSnapshot().ready, false);
  assert.equal(preview.getSnapshot().images.assets.some(asset => /rig-v128/.test(asset.path)), true,
    'V129 uses the same separated legs for ordinary locomotion.');
  assert.equal(stage.state.draws.length, 0, 'A missing leg page cannot leave an otherwise clothed half-body.');
  assert.equal(env.frames.size, 0);
});

test('leaving a loading transit cannot restore its limbs, listeners or animation after a later selection', async t => {
  const env = environment(t, { pending: true }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selectedAppearance(), animation: 'death',
    onStatus: status => statuses.push(status) });
  const legImage = env.images.find(image => /rig-v128/.test(image.src));
  assert.ok(legImage);
  preview.setAnimation('climb-up'); preview.setAnimation('walk');
  assert.equal(preview.getSnapshot().images.assets.some(asset => /rig-v128/.test(asset.path)), true);
  assert.deepEqual(env.images.filter(image => /rig-v128/.test(image.src)), [legImage],
    'Walking retains the same pending leg page instead of decoding it a second time.');
  for (const image of env.images) image.finish();
  await flush();
  assert.equal(await preview.ready, false);
  assert.equal(preview.getSnapshot().animation, 'walk');
  assert.equal(preview.getSnapshot().ready, true);
  assert.equal(stage.state.draws.some(draw => /rig-v128/.test(draw.src)), true);
  assert.equal(preview.getSnapshot().transitKind, null, 'Late transit completion cannot reinstall its old pose.');
  assert.ok(preview.getSnapshot().previewLadder == null, 'The walking preview has no stale ladder.');
  assert.equal(preview.getSnapshot().locomotion.mode, 'walk');
  assert.equal(statuses.filter(status => status.ready).length, 1);
  assert.equal(env.listeners, 0);
  assert.equal(env.frames.size, 1);
  preview.dispose();
  assert.equal(preview.getSnapshot().images.retained, 0);
  assert.equal(env.frames.size, 0);
});

test('closing an unresolved transit decode settles ready and suppresses every late status and draw', async t => {
  const env = environment(t, { pending: true, decoding: true }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { animation: 'revive', appearance: selectedAppearance(),
    onStatus: status => statuses.push(status) });
  await flush(); preview.dispose();
  assert.equal(await preview.ready, false);
  const before = { clears: stage.state.clears, statuses: statuses.length };
  for (const image of env.images) image.finish();
  await flush();
  preview.setAnimation('death'); preview.setFacing(-1); env.advance(5000);
  assert.equal(stage.state.clears, before.clears);
  assert.equal(statuses.length, before.statuses);
  assert.equal(env.frames.size, 0);
  assert.equal(env.listeners, 0);
});

test('all five transit gestures fit the preview throughout their cycle and in both directions', async t => {
  const env = environment(t);
  for (const appearance of [normalizePlayerAppearanceV126(), selectedAppearance()]) {
    for (const mode of transitModes) {
      const stage = canvas(), preview = createPlayerAppearancePreviewV126(stage, { animation: mode.id, appearance });
      assert.equal(await preview.ready, true, mode.id);
      try {
        let elapsed = 0;
        for (const phase of [0, .1, .3, .55, .9, 1.3, 2.2]) {
          env.advance((phase - elapsed) * 1000); elapsed = phase;
          for (const facing of [-1, 1]) {
            preview.setFacing(facing);
            assert.equal(preview.getSnapshot().ready, true, `${mode.id}/${phase}/${facing}`);
            for (const draw of stage.state.draws) for (const corner of draw.corners) {
              assert.ok(corner.x >= 10 && corner.x <= 350 && corner.y >= 5 && corner.y <= 314,
                `${mode.id}/${phase}/${facing} ${path.basename(draw.src)} outside frame ${JSON.stringify(corner)}`);
            }
          }
        }
      } finally { preview.dispose(); }
    }
  }
  assert.equal(env.frames.size, 0);
});
