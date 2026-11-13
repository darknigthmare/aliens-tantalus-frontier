import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TITLE_VFX_V188, createRandomV188, createDustV188, stepDustV188, scheduleLightningV188, lightningIntensityV188, scheduleEntryV188, titleVfxPlanetV188, TitleVfxV188 } from '../src/title-vfx-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('title VFX: deterministic randomness, wrapping dust and bounded storms', () => {
  const a = createRandomV188(7), b = createRandomV188(7);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  const dust = createDustV188(TITLE_VFX_V188.dust.high, createRandomV188(1));
  assert.equal(dust.length, 46); assert.equal(createDustV188(TITLE_VFX_V188.dust.low, createRandomV188(1)).length, 22);
  for (let index = 0; index < 4000; index += 1) stepDustV188(dust, 0.1);
  assert.ok(dust.every(mote => mote.x >= -0.02 && mote.x <= 1.02 && mote.y >= -0.02 && mote.y <= 1.02), 'dust stays on screen');
  const random = createRandomV188(3);
  for (let index = 0; index < 200; index += 1) {
    const storm = scheduleLightningV188(100, random), first = storm.pulses[0].at;
    assert.ok(first >= 100 + TITLE_VFX_V188.lightning.minGap && first <= 100 + TITLE_VFX_V188.lightning.maxGap);
    assert.ok(storm.pulses.length >= 2 && storm.pulses.length <= 4 && Math.hypot(storm.x, storm.y) <= 0.72, 'inside the disc');
    assert.equal(lightningIntensityV188(storm, first - 0.01), 0, 'dark between storms');
    assert.ok(lightningIntensityV188(storm, first + 0.01) > 0.3);
    const entry = scheduleEntryV188(100, random);
    assert.ok(entry.at >= 109 && entry.at <= 119 && entry.depth < 1, 'entries are rare and inside the limb');
  }
  assert.equal(lightningIntensityV188(null, 1), 0);
});

test('title VFX: lightning only on a storm planet; nothing without a planet', () => {
  const layer = (role, assetId) => ({ dataset: { role, assetId } });
  const planet = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 400, height: 400 }) };
  const scene = storm => ({ querySelector: () => planet, querySelectorAll: () => [layer('atmosphere', storm ? 'atmosphere-02-acheron-storm' : 'atmosphere-01-ceto-cyan')] });
  assert.deepEqual(titleVfxPlanetV188(scene(true)), { cx: 300, cy: 250, r: 188, storm: true });
  assert.equal(titleVfxPlanetV188(scene(false)).storm, false);
  assert.equal(titleVfxPlanetV188({ querySelector: () => null }), null);
});

test('title VFX: runs only while the title is shown, stops when it is hidden', () => {
  let frames = 0, cancelled = 0;
  const screen = { hidden: true }, canvas = { width: 0, height: 0, getContext: () => ({ clearRect() {} }) };
  const vfx = new TitleVfxV188({ screen, scene: null, canvas, document: { hidden: false, addEventListener() {} }, matchMedia: () => ({ matches: false }),
    requestFrame: () => { frames += 1; return frames; }, cancelFrame: () => { cancelled += 1; } });
  assert.equal(vfx.frame, null, 'hidden title: no loop');
  screen.hidden = false; vfx.sync(); assert.equal(frames, 1); assert.equal(vfx.dust.length, 46);
  screen.hidden = true; vfx.sync(); assert.equal(cancelled, 1); assert.equal(vfx.frame, null);
  const low = new TitleVfxV188({ screen: { hidden: false }, canvas, getQuality: () => 'low', document: { hidden: false, addEventListener() {} }, requestFrame: () => 1, cancelFrame() {} });
  assert.equal(low.dust.length, 22);
});

test('title VFX: wired into the title screen, behind the ship and under the menu copy', () => {
  const html = read('index.html'), css = read('styles.css'), app = read('src/app.js'), sw = read('sw.js'), source = read('src/title-vfx-v188.js');
  assert.match(html, /id="title-scene-v79"[^>]*><\/div>\n\s*<canvas id="title-vfx-v188" class="title-vfx-v188" aria-hidden="true"><\/canvas>\n\s*<div class="title-crt-v188" aria-hidden="true"><\/div>/);
  assert.match(css, /\.title-scene-v79 > \.title-vfx-v188--planet \{ z-index: 42; \}/, 'between clouds (39) and the ship (47)');
  assert.match(css, /\.title-vfx-v188 \{ mix-blend-mode: screen; \}/);
  assert.match(app, /const titleVfxV188 = new TitleVfxV188\(\{ screen: byId\('title-screen'\), scene: byId\('title-scene-v79'\), canvas: byId\('title-vfx-v188'\)/);
  assert.match(source, /if \(back && this\.scene && back\.parentNode !== this\.scene\) this\.scene\.appendChild/, 'survives scene re-renders');
  assert.match(source, /drawPlanetEffects\(ctx, ratio, sceneRect, still\) \{\n    const planet = this\.planet; if \(!planet \|\| still\) return;/, 'no flashes under reduced motion');
  assert.ok(sw.includes("'/src/title-vfx-v188.js'"));
  assert.match(html, /<p class="title-build">DARKNIGTHMARE<br>/, 'the owner’s handle');
});
