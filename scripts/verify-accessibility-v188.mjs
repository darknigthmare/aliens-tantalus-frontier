import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COLORBLIND_MODES_V188, COLORBLIND_MATRICES_V188, normalizeColorblindV188, normalizeTextScaleV188,
  KEY_ACTIONS_V188, defaultKeyBindingsV188, normalizeKeyBindingsV188, buildKeyTranslationV188, installKeyRemapV188,
  soundCaptionV188, CAPTIONED_SOUNDS_V188 } from '../src/accessibility-v188.js';
import { AUDIO_CUE_IDS_V188 } from '../src/audio-cues-v188.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('colour-blind modes and text sizes are bounded and migrate additively', () => {
  assert.deepEqual(COLORBLIND_MODES_V188, ['off', 'protanopia', 'deuteranopia', 'tritanopia']);
  for (const mode of COLORBLIND_MODES_V188.slice(1)) assert.equal(COLORBLIND_MATRICES_V188[mode].trim().split(/\s+/).length, 20);
  assert.equal(normalizeColorblindV188('x'), 'off'); assert.equal(normalizeTextScaleV188(2), 1); assert.equal(normalizeTextScaleV188('1.3'), 1.3);
  const base = createDefaultSave().settings;
  assert.equal(base.colorblindV188, 'off'); assert.equal(base.textScaleV188, 1); assert.deepEqual(base.keyBindingsV188, defaultKeyBindingsV188());
  const old = migrateSave({ schema: 52, settings: {} }).settings;
  assert.equal(old.colorblindV188, 'off'); assert.deepEqual(old.keyBindingsV188, defaultKeyBindingsV188());
  assert.equal(migrateSave({ schema: 52, settings: { colorblindV188: 'tritanopia', textScaleV188: 1.15 } }).settings.textScaleV188, 1.15);
});

test('bindings are unique, invalid codes fall back and conflicts never duplicate a key', () => {
  assert.equal(KEY_ACTIONS_V188.length, 14);
  assert.deepEqual(normalizeKeyBindingsV188({ jump: 'NotAKey' }), defaultKeyBindingsV188());
  const swapped = normalizeKeyBindingsV188({ jump: 'KeyJ', fire: 'Space' });
  assert.equal(swapped.jump, 'KeyJ'); assert.equal(swapped.fire, 'Space');
  const conflict = normalizeKeyBindingsV188({ jump: 'KeyF' });
  const codes = Object.values(conflict).filter(Boolean); assert.equal(new Set(codes).size, codes.length);
  assert.equal(conflict.fire, null, 'fire must be rebound when its key was taken');
  assert.deepEqual([...buildKeyTranslationV188(swapped)], [['KeyJ', 'Space'], ['Space', 'KeyF'], ['KeyF', null]]);
  assert.equal(buildKeyTranslationV188(defaultKeyBindingsV188()).size, 0);
});

test('the capture layer re-dispatches the expected code, swallows moved keys and ignores text inputs', () => {
  class FakeKeyboardEvent extends Event { constructor(type, init) { super(type, init); Object.assign(this, { code: init.code, key: init.key, repeat: init.repeat }); } }
  const target = new EventTarget(); let bindings = { jump: 'KeyJ' }; const seen = [];
  installKeyRemapV188(target, () => bindings, { KeyboardEventCtor: FakeKeyboardEvent });
  target.addEventListener('keydown', event => seen.push(event.code));
  const press = (code, extra = {}) => target.dispatchEvent(Object.assign(new FakeKeyboardEvent('keydown', { code, cancelable: true }), extra));
  press('KeyJ'); press('Space'); press('KeyA');
  assert.deepEqual(seen, ['Space', 'KeyA'], 'J acts as jump, the old Space is swallowed, A unchanged');
  seen.length = 0; const field = { tagName: 'INPUT' };
  const event = new FakeKeyboardEvent('keydown', { code: 'KeyJ' }); Object.defineProperty(event, 'target', { value: field });
  target.dispatchEvent(event); assert.deepEqual(seen, ['KeyJ'], 'typing in a field is never remapped');
  bindings = null; seen.length = 0; press('Space'); assert.deepEqual(seen, ['Space'], 'reset restores defaults live');
});

test('important sounds have captions in both languages', () => {
  for (const id of CAPTIONED_SOUNDS_V188) {
    assert.ok(AUDIO_CUE_IDS_V188.includes(id), id);
    assert.match(soundCaptionV188(id, 'fr'), /^\[.+\]$/); assert.match(soundCaptionV188(id, 'en'), /^\[.+\]$/);
  }
  assert.ok(CAPTIONED_SOUNDS_V188.includes('cry-queen') && CAPTIONED_SOUNDS_V188.includes('alarm-general'));
  assert.equal(soundCaptionV188('step-metal'), null, 'footsteps are not captioned');
});

test('settings, CSS and app wire every option', () => {
  const html = read('index.html'), css = read('styles.css'), app = read('src/app.js');
  for (const id of ['setting-colorblind-v188', 'setting-text-scale-v188', 'setting-key-bindings-v188']) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotMatch(css, /url\(#atf-cb-/, 'no simulation filter on screen');
  assert.match(css, /--atf-text-scale-v188/);
  assert.match(app, /installKeyRemapV188\(globalThis/); assert.match(app, /applyAccessibilityV188\(settings\)/);
  assert.match(app, /soundCaptionV188\(cueV188/);
});

import { SIGNAL_PALETTE_V188, SIGNAL_GROUPS_V188, signalColorV188 } from '../src/colorblind-palette-v188.js';
const rgb = hex => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
const simulate = (matrix, color) => { const m = matrix.trim().split(/\s+/).map(Number); return [0, 1, 2].map(row => m[row * 5] * color[0] + m[row * 5 + 1] * color[1] + m[row * 5 + 2] * color[2]); };
const distance = (a, b) => Math.hypot(...a.map((value, index) => value - b[index]));

test('colour-blind palette: off keeps the original colours, every mode keeps state signals apart', () => {
  const doc = mode => ({ documentElement: { dataset: { colorblindV188: mode } } });
  assert.equal(signalColorV188('door-locked', doc('off')), '#d04f47');
  assert.equal(signalColorV188('door-locked', doc('deuteranopia')), '#d55e00');
  assert.throws(() => signalColorV188('nope', doc('off')));
  for (const group of SIGNAL_GROUPS_V188) for (const mode of COLORBLIND_MODES_V188.slice(1)) {
    const pairs = group.flatMap((a, index) => group.slice(index + 1).map(b => [a, b]));
    for (const [a, b] of pairs) {
      const safe = distance(simulate(COLORBLIND_MATRICES_V188[mode], rgb(SIGNAL_PALETTE_V188[a][1])), simulate(COLORBLIND_MATRICES_V188[mode], rgb(SIGNAL_PALETTE_V188[b][1])));
      const before = distance(simulate(COLORBLIND_MATRICES_V188[mode], rgb(SIGNAL_PALETTE_V188[a][0])), simulate(COLORBLIND_MATRICES_V188[mode], rgb(SIGNAL_PALETTE_V188[b][0])));
      assert.ok(safe >= 0.4 && safe > before, `${mode} ${a}/${b}: ${safe.toFixed(3)} vs ${before.toFixed(3)}`);
    }
  }
  for (const [file, token] of [['src/game-v51-runtime.js', 'door-locked'], ['src/game.js', 'door-open'], ['src/hub-v51-runtime.js', 'hub-door-open'],
    ['src/hub-bulkhead-depth-v134.js', 'bulkhead-locked'], ['src/bioforge-runtime-v80.js', 'bioforge-door-locked'],
    ['src/archive-relay-presentation-v160.js', 'relay-door-closed'], ['src/player-control-v124.js', 'guide-blocked']]) assert.match(read(file), new RegExp(`signalColorV188\\(.*'${token}'`), file);
});
