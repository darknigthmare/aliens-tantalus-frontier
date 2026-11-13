import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INTRO_SESSION_KEY_V188, INTRO_TIMING_V188, introModeV188, collectTitleImageUrlsV188, preloadImagesV188, playIntroV188 } from '../src/intro-sequence-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const memory = (initial = {}) => { const data = { ...initial }; return { getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = String(value); }, data }; };
const fakeTarget = () => { const listeners = []; return { listeners, addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }),
  removeEventListener: (type, fn) => { const index = listeners.findIndex(entry => entry.type === type && entry.fn === fn); if (index >= 0) listeners.splice(index, 1); } }; };
const fakeOverlay = () => ({ ...fakeTarget(), dataset: {}, removed: false, remove() { this.removed = true; } });
const instantTimer = (fn) => { queueMicrotask(fn); return 0; };

test('intro: full credit once per session, then the short fade', () => {
  assert.equal(introModeV188(memory()), 'full');
  assert.equal(introModeV188(memory({ [INTRO_SESSION_KEY_V188]: '1' })), 'short');
  assert.equal(introModeV188({ getItem: () => { throw new Error('blocked'); } }), 'full');
  assert.ok(INTRO_TIMING_V188.full.hold > INTRO_TIMING_V188.short.hold && INTRO_TIMING_V188.maxWait <= 8000);
});

test('intro: collects every title bitmap (img and CSS backgrounds) and never waits forever', async () => {
  const element = (tagName, extra = {}) => ({ tagName, hidden: false, ...extra });
  const nodes = [element('IMG', { src: '/a.png' }), element('IMG', { src: '/hidden.png', hidden: true }), element('DIV', { bg: 'url("/b.png"), linear-gradient(red, blue)' }), element('DIV', { bg: 'url(data:image/png;base64,xx)' })];
  const root = { tagName: 'SECTION', querySelectorAll: () => nodes };
  assert.deepEqual(collectTitleImageUrlsV188(root, node => ({ backgroundImage: node.bg || 'none' })), ['/a.png', '/b.png']);
  const never = { set src(_) {} };
  assert.equal(await preloadImagesV188(['/slow.png'], { timeout: 5, createImage: () => never }), null, 'timeout wins');
  const ok = { set src(_) { queueMicrotask(() => this.onload()); } };
  assert.deepEqual(await preloadImagesV188(['/x.png'], { timeout: 1000, createImage: () => ok }), ['/x.png']);
});

test('intro: prepares the title underneath, swallows keys, remembers the session and removes itself', async () => {
  const overlay = fakeOverlay(), target = fakeTarget(), storage = memory(); let prepared = 0;
  const phases = [];
  const run = playIntroV188({ overlay, target, storage, setTimer: (fn, ms) => { phases.push(overlay.dataset.phase); return instantTimer(fn, ms); },
    prepareTitle: () => { prepared += 1; }, titleRoot: null });
  assert.equal(prepared, 1); assert.equal(overlay.dataset.mode, 'full');
  const key = target.listeners.find(entry => entry.type === 'keydown');
  assert.equal(key.capture, true, 'capture phase, before the title menu handler');
  let stopped = false; key.fn({ type: 'keydown', key: 'Enter', preventDefault() {}, stopImmediatePropagation() { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(await run, 'skipped');
  assert.equal(overlay.removed, true); assert.equal(storage.data[INTRO_SESSION_KEY_V188], '1');
  assert.equal(target.listeners.length, 0, 'input released'); assert.equal(overlay.listeners.length, 0);
  const second = fakeOverlay();
  assert.equal(await playIntroV188({ overlay: second, target: fakeTarget(), storage, setTimer: instantTimer }), 'complete');
  assert.equal(second.dataset.mode, 'short'); assert.equal(second.removed, true);
});

test('intro: wired before the first paint and onto the title screen', () => {
  const html = read('index.html'), css = read('styles.css'), app = read('src/app.js'), sw = read('sw.js'), early = read('src/intro-boot-v188.js');
  assert.ok(html.indexOf('<script src="/src/intro-boot-v188.js"></script>') < html.indexOf('<link rel="stylesheet" href="/styles.css">'), 'pre-paint flag');
  assert.match(html, /<body>\s*<div id="intro-v188" class="intro-v188"/);
  assert.match(html, /<span class="intro-v188__by">A fan game by<\/span><span class="intro-v188__name">Darknigthmare<\/span>/);
  for (const rule of [/html\[data-intro-v188="short"\] \.intro-v188__credit/, /\.intro-v188\[data-phase="fade"\] \{ opacity: 0; pointer-events: none; \}/,
    /\.intro-v188\[data-phase="fade"\] \.intro-v188__credit/, /html\[data-intro-stars-v188="ready"\] \.intro-v188__stars \{ opacity: 1; \}/, /intro-v188-failsafe 1s ease 14s forwards/]) assert.match(css, rule);
  for (const star of ['stars-01-distant-field.png', 'stars-02-near-sparks.png']) { assert.match(early, new RegExp(star)); assert.match(css, new RegExp(star)); }
  assert.match(app, /void playIntroV188\(\{ overlay: byId\('intro-v188'\), titleRoot: titleScreen\.root,/);
  assert.match(app, /prepareTitle: \(\) => \{ byId\('boot'\)\.remove\(\); showTitleScreen\(\); \}/);
  assert.match(app, /byId\('intro-v188'\)\?\.remove\(\);\n  byId\('boot'\)\.innerHTML/, 'a boot error is never hidden behind the credit');
  for (const file of ['/src/intro-sequence-v188.js', '/src/intro-boot-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
});
