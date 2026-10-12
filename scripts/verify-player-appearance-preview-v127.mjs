import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WEAPONS } from '../src/content-core-v50.js';
import { createDefaultSave } from '../src/save.js';
import { normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { playerAppearancePanelHtmlV126 } from '../src/player-appearance-ui-v126.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import {
  PLAYER_APPEARANCE_PREVIEW_MODES_V127, getPlayerAppearancePreviewModesV127,
  normalizePlayerAppearancePreviewAnimationV127, samplePlayerAppearancePreviewV127,
  createPlayerAppearancePreviewV126
} from '../src/player-appearance-preview-v126.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const clone = value => JSON.parse(JSON.stringify(value));
const pistol = WEAPONS.find(weapon => weapon.name === 'M4A3 Service Pistol');
const knife = WEAPONS.find(weapon => weapon.name === 'Combat Knife');
const profile = resolveHeldWeaponProfileV125(pistol);
const flush = () => new Promise(resolve => setImmediate(resolve));

function environment(t, { pending = false, decoding = false, failure = null } = {}) {
  const originals = new Map(['Image', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame']
    .map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const frames = new Map(), images = [], cancelled = [];
  let serial = 0, time = 100;
  class PreviewImage {
    constructor() {
      this.complete = false;
      this.naturalWidth = 0;
      this.naturalHeight = 0;
      this.listeners = new Map();
      this.srcValue = '';
      this.decoded = null;
      if (decoding) this.decode = () => new Promise(resolve => { this.decoded = resolve; });
      images.push(this);
    }
    set src(value) {
      this.srcValue = value;
      if (!pending) this.finish(!failure?.(value));
    }
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
        this.naturalWidth = bytes.readUInt32BE(16);
        this.naturalHeight = bytes.readUInt32BE(20);
      }
      const type = success ? 'load' : 'error';
      this[`on${type}`]?.();
      for (const callback of [...(this.listeners.get(type) || [])]) callback();
      this.decoded?.();
    }
  }
  const globals = {
    Image: PreviewImage, performance: { now: () => time },
    requestAnimationFrame: callback => { const id = ++serial; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => { cancelled.push(id); frames.delete(id); }
  };
  for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key,
    { configurable: true, writable: true, value });
  t.after(() => {
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { images, frames, cancelled,
    advance(milliseconds) {
      time += milliseconds;
      const queued = [...frames.values()];
      frames.clear();
      for (const callback of queued) callback(time);
    },
    get time() { return time; },
    get listeners() { return images.reduce((sum, image) => sum + [...image.listeners.values()]
      .reduce((total, callbacks) => total + callbacks.size, 0), 0); }
  };
}

function canvas() {
  const state = { draws: [], clears: 0, depth: 0 };
  const ctx = {
    save() { state.depth++; }, restore() { state.depth--; assert.ok(state.depth >= 0); },
    clearRect() { state.clears++; state.draws = []; },
    drawImage(image, ...args) { state.draws.push({ src: image.src, args }); },
    fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, closePath() {},
    stroke() {}, clip() {}, translate() {}, scale() {}, transform() {}
  };
  return { width: 360, height: 320, dataset: {}, state, getContext: () => ctx };
}

const selectedAppearance = () => normalizePlayerAppearanceV126({ schema: 126, slots: {
  helmet: null, mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
  arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126'
} });

function assertReady(preview, selected) {
  const state = preview.getSnapshot();
  assert.equal(state.ready, true, state.reason);
  assert.deepEqual(state.effectiveSlots, selected.slots);
  assert.ok(state.arms.near.reachError < 1e-5);
  assert.ok(state.arms.far.reachError < 1e-5);
  return state;
}

test('preview admits only actual weapon identities and distinguishes unarmed from non-reloadable choices', () => {
  const unarmed = getPlayerAppearancePreviewModesV127();
  assert.equal(unarmed.filter(mode => mode.available).length, 7);
  assert.equal(normalizePlayerAppearancePreviewAnimationV127('aim', { id: 'invented-weapon', path: profile.path }), 'idle');
  assert.equal(normalizePlayerAppearancePreviewAnimationV127('reload', knife), 'idle');
  const noReload = getPlayerAppearancePreviewModesV127(knife).find(mode => mode.id === 'reload');
  assert.equal(noReload.unavailableLabel, 'non rechargeable');
  assert.equal(normalizePlayerAppearancePreviewAnimationV127('reload', pistol), 'reload');
  assert.equal(normalizePlayerAppearancePreviewAnimationV127('<script>', pistol), 'idle');
  assert.equal(getPlayerAppearancePreviewModesV127(pistol).every(mode => mode.available), true);
});

test('presentation samples are independent of input appearance and maintain real reload identity without a transaction', () => {
  const selected = selectedAppearance(), before = clone(selected), descriptorBefore = clone(pistol);
  const a = samplePlayerAppearancePreviewV127({ appearance: selected, animation: 'reload', weaponDescriptor: pistol,
    timeSeconds: 1.4, facing: -1 });
  const b = samplePlayerAppearancePreviewV127({ appearance: selected, animation: 'reload', weaponDescriptor: pistol,
    timeSeconds: 1.4, facing: -1 });
  assert.equal(a.profile.weaponId, pistol.id);
  assert.equal(a.actor.tacticalReload.weaponKey, pistol.id);
  assert.equal(a.actor.reloading, true);
  assert.deepEqual(a, b);
  assert.notEqual(a.actor, b.actor);
  a.actor.appearanceV126.slots.mask = null;
  a.actor.ammo = 999;
  assert.deepEqual(selected, before);
  assert.deepEqual(pistol, descriptorBefore);
  const rest = samplePlayerAppearancePreviewV127({ animation: 'reload', weaponDescriptor: pistol, timeSeconds: 2.7 });
  assert.equal(rest.actor.reloading, false);
  assert.equal(rest.actor.tacticalReload.phase, 'ready');
});

test('the labelled native animation selector survives owner/facing changes and remains usable while equipment is locked', () => {
  const save = createDefaultSave();
  save.strategy.currentOperation = { id: 'preview-only' };
  const html = playerAppearancePanelHtmlV126(save, { owner: 'coop', facing: -1, animation: 'medical', weaponDescriptor: pistol });
  assert.match(html, /<label[^>]+for="player-appearance-animation-v127"/);
  assert.match(html, /<select id="player-appearance-animation-v127" data-appearance-animation-v127>/);
  assert.match(html, /<option value="medical" selected>Soins<\/option>/);
  assert.match(html, /data-appearance-facing-v126="-1" aria-pressed="true"/);
  const select = html.match(/<select[^>]*>([\s\S]*?)<\/select>/)[1];
  assert.equal((select.match(/<option /g) || []).length, PLAYER_APPEARANCE_PREVIEW_MODES_V127.length);
  assert.doesNotMatch(select, / disabled/);
  assert.match(html, /data-appearance-reset-v126="coop" disabled/);
  const unarmed = playerAppearancePanelHtmlV126(save, { animation: 'reload', weaponDescriptor: null });
  assert.match(unarmed, /<option value="idle" selected>/);
  assert.match(unarmed, /<option value="reload" disabled>Rechargement · arme requise<\/option>/);
  assert.doesNotMatch(html, /animations de soins, d’outils et de transit gardent leur tenue dédiée/);
});

test('all nine preview poses use the actual modular compositor, selected clothing and bounded scene images', async t => {
  const env = environment(t), stage = canvas(), selected = selectedAppearance();
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, weaponDescriptor: pistol });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, true);
  for (const mode of PLAYER_APPEARANCE_PREVIEW_MODES_V127) {
    assert.equal(preview.setAnimation(mode.id), mode.id);
    await flush();
    env.advance(mode.fixedTime * 1000);
    const state = assertReady(preview, selected);
    assert.equal(stage.dataset.appearanceAnimationV127, mode.id);
    assert.equal(state.animation, mode.id);
    assert.ok(state.images.retained <= 8, `${mode.id}: ${state.images.retained}`);
    assert.equal(state.images.loading, 0);
    assert.equal(stage.state.depth, 0);
    if (mode.armed) {
      assert.equal(state.weaponId, pistol.id);
      assert.equal(stage.state.draws.filter(draw => draw.src === profile.path).length, 1);
    } else {
      assert.equal(state.weaponId, null);
      assert.equal(stage.state.draws.some(draw => draw.src === profile.path), false);
    }
    if (mode.action) assert.ok(state.actionKind, mode.id);
    if (mode.id === 'crouch') assert.equal(state.stance, 'crouched');
  }
  assert.equal(env.frames.size, 1);
});

test('walk progression and facing share one clock, and mirroring a reload preserves its current phase', async t => {
  const env = environment(t), stage = canvas(), selected = selectedAppearance();
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, weaponDescriptor: pistol, animation: 'walk' });
  t.after(() => preview.dispose());
  await preview.ready;
  const first = assertReady(preview, selected);
  env.advance(340);
  const walked = assertReady(preview, selected);
  assert.notEqual(walked.bodyFrame, first.bodyFrame);
  assert.equal(walked.gait, 'walk');
  preview.setFacing(-1);
  const mirrored = assertReady(preview, selected);
  assert.equal(mirrored.timeSeconds, walked.timeSeconds);
  assert.equal(mirrored.bodyFrame, walked.bodyFrame);
  assert.ok(Math.abs(mirrored.arms.near.hand.x + walked.arms.near.hand.x - 44) < 1e-6);
  preview.setAnimation('reload');
  await flush();
  env.advance(1400);
  const reloading = assertReady(preview, selected);
  assert.ok(reloading.reloadProgress > .5 && reloading.reloadProgress < .7);
  preview.setFacing(1);
  const turned = assertReady(preview, selected);
  assert.equal(turned.reloadPhase, reloading.reloadPhase);
  assert.equal(turned.reloadProgress, reloading.reloadProgress);
  assert.equal(env.frames.size, 1);
});

test('reduced motion shows a useful fixed work phase and never schedules animation frames', async t => {
  const env = environment(t), stage = canvas(), selected = selectedAppearance(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { appearance: selected, weaponDescriptor: pistol,
    animation: 'reload', reducedMotion: true, onStatus: result => statuses.push(result) });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, true);
  const reloading = assertReady(preview, selected);
  assert.ok(reloading.reloadProgress > .5 && reloading.reloadProgress < .7);
  assert.notEqual(reloading.reloadPhase, 'reach');
  env.advance(8000);
  preview.setFacing(-1);
  assert.equal(preview.getSnapshot().reloadProgress, reloading.reloadProgress);
  preview.setAnimation('medical');
  await flush();
  const medical = assertReady(preview, selected);
  assert.equal(medical.actionPhase, 'work');
  assert.ok(medical.actionProgress > .5 && medical.actionProgress < .7);
  assert.equal(env.frames.size, 0);
  assert.match(statuses.at(-1).message, /Pose fixe/);
});

test('dispose cancels the single RAF, releases cache callbacks and makes all old controls inert', async t => {
  const env = environment(t), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { weaponDescriptor: pistol, onStatus: status => statuses.push(status) });
  await preview.ready;
  const before = { clears: stage.state.clears, count: statuses.length, animation: preview.getSnapshot().animation };
  assert.equal(env.frames.size, 1);
  preview.dispose();
  preview.dispose();
  assert.equal(env.frames.size, 0);
  assert.equal(env.cancelled.length, 1);
  assert.equal(preview.getSnapshot().images.retained, 0);
  assert.equal(preview.getSnapshot().ready, false);
  assert.equal(env.images.every(image => image.onload === null && image.onerror === null), true);
  preview.setAnimation('medical');
  preview.setFacing(-1);
  env.advance(5000);
  assert.equal(stage.state.clears, before.clears);
  assert.equal(statuses.length, before.count);
  assert.equal(preview.getSnapshot().animation, before.animation);
});

test('disposing incomplete event-based images settles ready and detaches every load/error listener', async t => {
  const env = environment(t, { pending: true }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { weaponDescriptor: pistol, onStatus: status => statuses.push(status) });
  assert.ok(env.listeners > 0);
  preview.dispose();
  assert.equal(await preview.ready, false);
  assert.equal(env.listeners, 0);
  const count = statuses.length, clears = stage.state.clears;
  for (const image of env.images) image.finish();
  await flush();
  assert.equal(statuses.length, count);
  assert.equal(stage.state.clears, clears);
  assert.equal(env.frames.size, 0);
});

test('disposing an unresolved decode also settles ready without a late status or animation', async t => {
  const env = environment(t, { pending: true, decoding: true }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { weaponDescriptor: pistol, onStatus: status => statuses.push(status) });
  await flush();
  preview.dispose();
  assert.equal(await preview.ready, false);
  const count = statuses.length;
  for (const image of env.images) image.finish();
  await flush();
  assert.equal(statuses.length, count);
  assert.equal(env.frames.size, 0);
});

test('rapid animation changes cannot restore a stale prop or publish an old selection after image load', async t => {
  const env = environment(t, { pending: true }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { weaponDescriptor: pistol, animation: 'medical',
    onStatus: status => statuses.push(status) });
  preview.setAnimation('interact');
  preview.setAnimation('melee');
  const retained = preview.getSnapshot().images.assets;
  assert.equal(retained.some(asset => /medkit|access-tuner/.test(asset.path)), false);
  for (const image of env.images) image.finish();
  await flush();
  assert.equal(await preview.ready, false);
  assert.equal(preview.getSnapshot().animation, 'melee');
  assert.equal(stage.dataset.appearanceReadyV126, 'true');
  assert.equal(statuses.filter(status => status.ready).length, 1);
  assert.equal(env.listeners, 0);
  assert.equal(env.frames.size, 1);
  preview.dispose();
});

test('an unavailable weapon image never replaces the held weapon and still permits unarmed clothing inspection', async t => {
  const env = environment(t, { failure: source => source === profile.path }), stage = canvas(), statuses = [];
  const preview = createPlayerAppearancePreviewV126(stage, { weaponDescriptor: pistol, animation: 'aim',
    onStatus: status => statuses.push(status) });
  t.after(() => preview.dispose());
  assert.equal(await preview.ready, false);
  assert.equal(preview.getSnapshot().reason, 'weapon-image-unavailable');
  assert.equal(stage.state.draws.length, 0);
  assert.match(statuses.at(-1).message, /Les autres postures restent accessibles/);
  assert.equal(env.frames.size, 0);
  preview.setAnimation('idle');
  await flush();
  assert.equal(preview.getSnapshot().ready, true);
  assert.equal(stage.state.draws.some(draw => draw.src === profile.path), false);
  assert.equal(env.frames.size, 1);
});
