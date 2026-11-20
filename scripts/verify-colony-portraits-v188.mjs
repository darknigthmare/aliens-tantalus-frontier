import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COLONY_PORTRAITS_V188, getColonyPortraitV188, drawColonyPortraitV188 } from '../src/colony-portraits-v188.js';
import { getPlaceholderPortraitV188 } from '../src/placeholder-portraits-v188.js';
import { setDialogueSpeakerPortraitV168 } from '../src/npc-dialogue-portraits-v168.js';
import { CINEMATICS_V188, CinematicPlayerV188, drawCinematicFrameV188 } from '../src/story-cinematics-v188.js';

function context() {
  const draws = [], calls = [];
  return new Proxy({ draws, calls, imageSmoothingEnabled: false }, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (key === 'measureText') return value => ({ width: String(value).length * 8 });
      if (key === 'drawImage') return (...args) => draws.push(args);
      return (...args) => calls.push([key, ...args]);
    }
  });
}
const loaded = profile => ({ complete: true, naturalWidth: profile.sourceWidth,
  naturalHeight: profile.sourceHeight, src: profile.source });

function portraitDom() {
  const ctx = context(), events = new Map(), attributes = {};
  const canvas = { width: 0, height: 0, hidden: true, dataset: {}, setAttribute() {}, getContext: () => ctx };
  const container = { dataset: {}, classList: { add() {} }, setAttribute: (name, value) => { attributes[name] = value; },
    querySelector() { return this.child || null; }, appendChild(child) { this.child = child; } };
  const document = { documentElement: { dataset: {} }, createElement: () => canvas };
  const image = { complete: false, naturalWidth: 0, naturalHeight: 0, currentSrc: '', style: {},
    parentElement: container, ownerDocument: document, classList: { remove() {} }, setAttribute() {},
    addEventListener(name, fn) { if (!events.has(name)) events.set(name, new Set()); events.get(name).add(fn); },
    removeEventListener(name, fn) { events.get(name)?.delete(fn); },
    get src() { return this._src || ''; },
    set src(value) { this._src = value; this.complete = false; this.currentSrc = ''; },
    load(profile) {
      this.complete = true; this.naturalWidth = profile.sourceWidth; this.naturalHeight = profile.sourceHeight;
      this.currentSrc = this.src; for (const fn of [...events.get('load') || []]) fn();
    },
    fail() { for (const fn of [...events.get('error') || []]) fn(); },
    listeners: name => [...events.get(name) || []]
  };
  return { image, canvas, ctx, container, document, attributes };
}

test('each resident resolves by its existing speaker identity to its own immutable native PNG', () => {
  assert.equal(COLONY_PORTRAITS_V188.length, 3);
  assert.equal(new Set(COLONY_PORTRAITS_V188.map(profile => profile.source)).size, 3);
  for (const profile of COLONY_PORTRAITS_V188) {
    assert.ok(Object.isFrozen(profile));
    assert.equal(getColonyPortraitV188(profile.id), profile);
    assert.equal(getColonyPortraitV188(profile.name.toLowerCase()), profile);
    assert.equal(getColonyPortraitV188(profile.name.normalize('NFD').replace(/\p{M}/gu, '')), profile);
    assert.equal(getColonyPortraitV188(profile.fallbackId), profile);
    assert.equal(profile.sign, getPlaceholderPortraitV188(profile.name).sign);
    const png = readFileSync(new URL('..' + profile.source, import.meta.url));
    assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(png.readUInt32BE(16), profile.sourceWidth);
    assert.equal(png.readUInt32BE(20), profile.sourceHeight);
    assert.equal(png[25], 6, 'RGBA PNG source; native render QA separately checks transparent pixels');
  }
  assert.equal(getColonyPortraitV188('Mara Vega'), null);
  assert.equal(getColonyPortraitV188('Contact inconnu'), null);
});

test('resident art fits square, mobile, tall and wide frames without distortion or crossing their bounds', () => {
  for (const profile of COLONY_PORTRAITS_V188)
    for (const [x, y, width, height] of [[0, 0, 384, 384], [74, 500, 80, 80], [7.25, 13.5, 44, 44], [0, 0, 180, 540], [0, 0, 640, 180]]) {
      const ctx = context(), image = loaded(profile);
      const result = drawColonyPortraitV188(ctx, image, profile, { x, y, width, height });
      assert.ok(result); assert.equal(result.scaleX, result.scaleY);
      assert.equal(ctx.draws.length, 1); assert.equal(ctx.draws[0][0], image);
      assert.deepEqual(ctx.draws[0].slice(1, 5), [0, 0, profile.sourceWidth, profile.sourceHeight]);
      assert.ok(result.target.x >= x && result.target.y >= y);
      assert.ok(result.target.x + result.target.w <= x + width + 1e-8);
      assert.ok(result.target.y + result.target.h <= y + height + 1e-8);
      assert.deepEqual(ctx.calls.filter(call => call[0] === 'rect'), [['rect', x, y, width, height]]);
      assert.equal(ctx.calls.filter(call => call[0] === 'save').length, ctx.calls.filter(call => call[0] === 'restore').length);
      assert.equal(ctx.calls.some(call => ['fillRect', 'clearRect', 'fillText', 'putImageData'].includes(call[0])), false);
    }
});

test('wrong identities, unfinished loads and wrong raster sizes cannot paint a resident frame', () => {
  const profile = COLONY_PORTRAITS_V188[0], ctx = context();
  for (const image of [null, { ...loaded(profile), complete: false }, { ...loaded(profile), naturalWidth: 1 },
    { ...loaded(profile), src: COLONY_PORTRAITS_V188[1].source }, { ...loaded(profile), currentSrc: '/wrong.png' }])
    assert.equal(drawColonyPortraitV188(ctx, image, profile), null);
  assert.equal(drawColonyPortraitV188(ctx, loaded(profile), { ...profile }), null);
  assert.equal(drawColonyPortraitV188(ctx, loaded(profile), profile, { width: Infinity }), null);
  assert.equal(ctx.draws.length, 0);
});

test('dialogue loading and failure keep the same residents readable, then exact PNG replaces their fallback', () => {
  for (const profile of COLONY_PORTRAITS_V188) {
    const d = portraitDom(); setDialogueSpeakerPortraitV168(d.image, { name: profile.name });
    assert.equal(d.image.src, profile.source); assert.equal(d.image.hidden, true); assert.equal(d.canvas.hidden, false);
    assert.equal(d.container.dataset.dialoguePortraitStateV168, 'loading');
    assert.equal(d.container.dataset.dialoguePortraitFallbackV188, 'placeholder-portrait');
    assert.equal(d.attributes['aria-label'], `Portrait de ${profile.name}`);
    assert.equal(d.ctx.draws.length, 0);
    d.image.fail(); assert.equal(d.container.dataset.dialoguePortraitStateV168, 'fallback');
    assert.equal(d.canvas.hidden, false); assert.equal(d.image.hidden, true);
    setDialogueSpeakerPortraitV168(d.image, { name: profile.name }); d.image.load(profile);
    assert.equal(d.container.dataset.dialoguePortraitStateV168, 'ready');
    assert.equal(d.container.dataset.dialoguePortraitKindV168, 'colony-portrait');
    assert.equal(d.container.dataset.dialoguePortraitFallbackV188, '');
    assert.equal(d.ctx.draws.length, 1); assert.equal(d.canvas.hidden, false); assert.equal(d.image.hidden, true);
  }
});

test('late images cannot replace a newer speaker, and explicit crew or painted identities keep precedence', () => {
  const d = portraitDom(), [wren, ferro] = COLONY_PORTRAITS_V188;
  setDialogueSpeakerPortraitV168(d.image, { name: wren.name }); const oldLoad = d.image.listeners('load');
  setDialogueSpeakerPortraitV168(d.image, { name: ferro.name }); d.image.load(ferro);
  for (const fn of oldLoad) fn();
  assert.equal(d.ctx.draws.length, 1); assert.equal(d.ctx.draws[0][0].src, ferro.source);
  setDialogueSpeakerPortraitV168(d.image, { name: 'Contact inconnu' });
  for (const fn of oldLoad) fn();
  assert.equal(d.ctx.draws.length, 1); assert.equal(d.canvas.hidden, true);
  assert.equal(d.container.dataset.dialoguePortraitKindV168, 'initials');
  setDialogueSpeakerPortraitV168(d.image, { name: wren.name, crewId: 'crew-06-rook' });
  assert.match(d.image.src, /rook-locomotion-sheet/);
  const source = '/assets/openai/ui/dialogue/mara-vega-operations-v61.png';
  setDialogueSpeakerPortraitV168(d.image, { name: wren.name, paintedSource: source });
  assert.equal(d.image.src, source); assert.equal(d.container.dataset.dialoguePortraitKindV168, 'painted-portrait');
});

test('all colour-blind modes keep the authored identity and a shape-based primitive on load failure', () => {
  for (const profile of COLONY_PORTRAITS_V188) for (const mode of ['off', 'protanopia', 'deuteranopia', 'tritanopia']) {
    const d = portraitDom(); d.document.documentElement.dataset.colorblindV188 = mode;
    setDialogueSpeakerPortraitV168(d.image, { name: profile.name }); d.image.load(profile);
    assert.equal(d.ctx.draws.length, 1); assert.equal(d.container.dataset.dialoguePortraitStateV168, 'ready');
    setDialogueSpeakerPortraitV168(d.image, { name: profile.name }); d.image.fail();
    assert.equal(d.canvas.hidden, false); assert.equal(d.container.dataset.dialoguePortraitFallbackV188, 'placeholder-portrait');
  }
});

test('real cinematic preload and lower-third draw consume each resident PNG and preserve the existing cache', () => {
  const requests = [];
  class ImageFixture {
    set src(source) { this._src = source; requests.push(source); }
    get src() { return this._src; }
  }
  const player = new CinematicPlayerV188({ ImageCtor: ImageFixture });
  for (const [index, id] of ['cin-p3-wren', 'cin-p3-ferro', 'cin-doyenne'].entries()) {
    const profile = COLONY_PORTRAITS_V188[index]; player.preload(id); player.preload(id);
    assert.equal(requests.filter(source => source === profile.source).length, 1);
    const images = { [profile.source]: loaded(profile) }, ctx = context();
    let start = 0, time = null;
    for (const shot of CINEMATICS_V188[id].shots) {
      if (getColonyPortraitV188(shot.line?.speaker) === profile) { time = start + shot.seconds * .5; break; }
      start += shot.seconds;
    }
    assert.notEqual(time, null); drawCinematicFrameV188(ctx, id, time, { images, reducedMotion: true });
    const draw = ctx.draws.find(args => args[0] === images[profile.source]); assert.ok(draw, id);
    assert.deepEqual(draw.slice(1), [0, 0, profile.sourceWidth, profile.sourceHeight, 74, 540, 80, 80]);
  }
});
