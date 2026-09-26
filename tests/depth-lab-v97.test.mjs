import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DEPTH_LAB_ZONES_V97 as zones, DEPTH_LAB_ACTORS_V97 as actors, DEPTH_LAB_ASSETS_V97 as assets,
  createDepthLabStateV97 as create, projectDepthLabV97 as project, unprojectDepthLabV97 as unproject,
  stepDepthLabV97 as step, sortDepthLabV97 as sort, depthLabParallaxV97 as parallax } from '../src/depth-lab-model-v97.js';
import { getSpecialOperationV67 } from '../src/special-operations-v67.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(root + path, 'utf8');
const viewport = { width: 900, height: 620 };
test('depth laboratory zones reference real operations without changing their delivery status', () => {
  assert.equal(zones.length, 4);
  assert.ok(zones.some(z => z.operationId === 'cargo-brutal'));
  assert.ok(zones.some(z => z.operationId === 'hive-world'));
  for (const z of zones) { assert.ok(getSpecialOperationV67(z.operationId)); assert.equal(z.prototypeOnly, true); assert.equal(z.playableDlc, false); assert.equal(z.layers.length, 3); }
  assert.equal(getSpecialOperationV67('hive-world').implementationStatus, 'missing');
});
test('all original scene layers and dedicated witness files exist, with reviewed native dimensions', () => {
  assert.equal(assets.length, 11);
  for (const path of assets) assert.ok(existsSync(root + path.slice(1)), path);
  for (const a of actors) { const png = readFileSync(root + a.path.slice(1)); assert.equal(png.readUInt32BE(16), a.width); assert.equal(png.readUInt32BE(20), a.height); }
  const receipt = JSON.parse(read('docs/references/v97-batch-050/generation-enemy-081-albino-siege-royal.json'));
  assert.equal(createHash('sha256').update(readFileSync(root + actors[1].path.slice(1))).digest('hex'), receipt.output.sha256);
});
test('perspective consistently reduces scale, foot position and lateral spread toward the background', () => {
  const near = project({ x: 1400, depth: 0 }, viewport), far = project({ x: 1400, depth: 1 }, viewport);
  assert.ok(near.scale > far.scale); assert.ok(near.y > far.y); assert.ok(near.x > far.x);
  assert.ok(far.y > 0 && near.y < viewport.height);
});
test('2D comparison uses identical positions and scale regardless of depth', () => {
  const near = project({ x: 1400, depth: 0 }, viewport, '2d'), far = project({ x: 1400, depth: 1 }, viewport, '2d');
  assert.equal(near.x, far.x); assert.equal(near.y, far.y); assert.equal(near.scale, far.scale);
});
test('ground picking inverts perspective for all depths and cameras', () => {
  for (const camera of [0, 1120, 2400]) for (const depth of [0, .2, .5, .9, 1]) {
    const original = { x: 1300, depth }, p = project(original, viewport, '2.5d', camera), roundtrip = unproject(p, viewport, '2.5d', camera);
    assert.ok(Math.abs(original.x - roundtrip.x) < 1e-8); assert.ok(Math.abs(depth - roundtrip.depth) < 1e-8);
  }
});
test('flat ground picking preserves the hidden depth for an honest mode toggle', () => {
  const picked = unproject({ x: 450, y: 0 }, viewport, '2d', 1000, .72); assert.equal(picked.x, 1000); assert.equal(picked.depth, .72);
});
test('movement is bounded, immutable, diagonal-normalized and protected against frame jumps', () => {
  const s = create(), original = { ...s }, next = step(s, { x: 1, depth: 1 }, 1000), straight = step(s, { x: 1 }, .05);
  assert.deepEqual(s, original); assert.ok(next.x < straight.x); assert.ok(next.x > s.x); assert.ok(next.depth > s.depth);
  assert.equal(step({ ...s, x: 2400, depth: 1 }, { x: 1, depth: 1 }, .05).x, 2400);
  assert.equal(step({ ...s, x: 0, depth: 0 }, { x: -1, depth: -1 }, .05).depth, 0);
  assert.deepEqual(step(s, { x: 1 }, NaN), s);
});
test('pause freezes demo, keyboard and camera; manual movement cancels demo', () => {
  const s = { ...create(), paused: true, demo: true, camera: 0 }; assert.deepEqual(step(s, { x: 1 }, .05), s);
  const moved = step({ ...s, paused: false }, { x: 1 }, .05); assert.equal(moved.demo, false);
});
test('near objects paint last and occlusion toggle does not mutate input objects', () => {
  const objects = [{ id: 'player', kind: 'actor', depth: .8 }, { id: 'crate', kind: 'prop', depth: .4 }];
  assert.deepEqual(sort(objects).map(o => o.id), ['player', 'crate']);
  assert.deepEqual(sort(objects, '2.5d', false).map(o => o.id), ['crate', 'player']);
  assert.equal(objects[0].id, 'player');
});
test('parallax rates are ordered and disabled strength means no offset', () => {
  const offsets = ['far', 'mid', 'foreground'].map(layer => Math.abs(parallax(1400, layer, 900)));
  assert.ok(offsets[0] < offsets[1] && offsets[1] < offsets[2]); assert.equal(Math.abs(parallax(1400, 'mid', 900, 0)), 0);
});
test('standalone module import graph cannot read or write game storage or boot campaign engines', () => {
  const seen = new Set();
  function visit(path) {
    if (seen.has(path)) return; seen.add(path); const text = read(path);
    assert.doesNotMatch(text, /\b(?:localStorage|sessionStorage|indexedDB|SaveSystem|GameEngine|serviceWorker)\b|import\([^)]*save|document\.cookie|fetch\s*\(/, path);
    for (const match of text.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)) visit('src/' + match[1]);
  }
  visit('src/depth-lab-v97.js'); assert.equal(seen.size, 3);
  const html = read('depth-lab-v97.html'); assert.equal([...html.matchAll(/<script/g)].length, 1);
  assert.match(html, /aucune sauvegarde/); assert.match(html, /pas de modèles 3D/); assert.match(html, /DLC jouables ici/);
});
test('controls expose responsive touch, keyboard, errors and lifecycle cleanup contracts', () => {
  const html = read('depth-lab-v97.html'), runtime = read('src/depth-lab-v97.js'), css = read('depth-lab-v97.css');
  for (const id of ['zone-select', 'actor-select', 'x-range', 'depth-range', 'parallax-range', 'pause-button', 'reset-button', 'load-error']) assert.ok(html.includes(`id="${id}"`));
  assert.equal([...html.matchAll(/data-move=/g)].length, 4); assert.equal([...html.matchAll(/tabindex="0"/g)].length, 2);
  assert.match(runtime, /pointercancel/); assert.match(runtime, /visibilitychange/); assert.match(runtime, /lifetime\.abort\(\)/); assert.match(runtime, /cancelAnimationFrame/);
  assert.match(css, /max-width:560px/); assert.match(css, /min-height:46px/);
});
