import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { TITLE_SPHERE_REGISTRATION_V87, TITLE_SCENE_READY_ASSETS_V79 } from '../src/title-scene-assets-v79.js';
import { buildTitleSceneModelV79 } from '../src/title-scene-catalog-v79.js';
import { TitleSceneControllerV79 } from '../src/title-scene-v79.js';

test('seven unchanged spherical PNGs carry square measured registrations, not stretched texture bounds', async () => {
  assert.equal(Object.keys(TITLE_SPHERE_REGISTRATION_V87).length, 7);
  for (const [id, registration] of Object.entries(TITLE_SPHERE_REGISTRATION_V87)) {
    const asset = TITLE_SCENE_READY_ASSETS_V79.find(a => a.id === id);
    const bytes = await readFile(asset.src.slice(1));
    assert.equal(bytes.readUInt32BE(16), registration.sourceSize);
    assert.equal(bytes.readUInt32BE(20), registration.sourceSize);
    assert.ok(registration.size > 750 && registration.size <= 1024);
    assert.ok(registration.x >= 0 && registration.y >= 0);
    assert.ok(registration.x + registration.size <= 1024 && registration.y + registration.size <= 1024);
    assert.equal(asset.sphereRegistration, registration);
    assert.ok(Object.isFrozen(registration));
  }
});

test('real title controller maps each source limb to one normalized square without changing atlas bytes', () => {
  const controller = new TitleSceneControllerV79({ matchMedia: null });
  const documentRef = { createElement: () => ({
    dataset: {}, style: { values: new Map(), setProperty(k,v) { this.values.set(k,v); } },
    setAttribute() {}, addEventListener() {}, append() {}
  }) };
  for (const presetId of ['frontier-night', 'storm-terminator', 'ember-quarantine']) {
    const model = buildTitleSceneModelV79({ presentation: { titleScene: { presetId } } });
    for (const layer of model.layers.filter(l => l.sphereRegistration)) {
      const element = controller.createLayer(layer, documentRef);
      const r = layer.sphereRegistration;
      const left = parseFloat(element.style.values.get('--title-art-left-v87'));
      const top = parseFloat(element.style.values.get('--title-art-top-v87'));
      const size = parseFloat(element.style.values.get('--title-art-size-v87'));
      assert.ok(Math.abs(left + (r.x + r.size / 2) / r.sourceSize * size - 50) < 1e-10);
      assert.ok(Math.abs(top + (r.y + r.size / 2) / r.sourceSize * size - 50) < 1e-10);
      assert.ok(Math.abs(r.size / r.sourceSize * size - 100) < 1e-10);
    }
  }
});

test('transport and shuttle stay distinct authored actors and exhaust stays behind its owner', () => {
  for (const presetId of ['frontier-night', 'storm-terminator', 'ember-quarantine']) {
    const model = buildTitleSceneModelV79({ presentation: { titleScene: { presetId } } });
    const images = model.layers.filter(l => l.renderer === 'image');
    const ship = images.filter(l => l.assetId === 'orbitals-01-tantalus-transport');
    const shuttle = images.filter(l => l.assetId === 'traffic-01-utility-shuttle');
    assert.equal(ship.length, 1);
    assert.equal(shuttle.length, 1);
    assert.notEqual(ship[0].assetSrc, shuttle[0].assetSrc);
    const exhaust = images.find(l => l.assetId === 'vfx-01-ion-exhaust');
    assert.ok(exhaust.depth < ship[0].depth);
    assert.ok(exhaust.depth > images.find(l => l.role === 'planet').depth);
  }
});

test('CSS locks projected spherical art and prevents 3D culling and fullscreen secondary ships', async () => {
  const css = await readFile('title-scene-v79.css', 'utf8');
  assert.doesNotMatch(css, /backface-visibility:\s*hidden/);
  assert.match(css, /backface-visibility:\s*visible/);
  assert.doesNotMatch(css, /rotate\(360deg\)/);
  assert.match(css, /@keyframes title-cloud-light-v87\s*\{\s*from \{ opacity: \.12; \}\s*to \{ opacity: \.18; \}/);
  assert.match(css, /data-asset-id='traffic-01-utility-shuttle'\]\s*\{[^}]*width: 16vw;/);
  assert.match(css, /data-asset-id='debris-01-wreck-field'\]\s*\{[^}]*width: 54vw;/);
  assert.match(css, /data-asset-id='vfx-01-ion-exhaust'\] > img\s*\{[^}]*transform: translate\(68%, -4%\) scale\(1\.08\);/);
  assert.match(css, /@media \(max-width: 760px\)\s*\{\s*\.title-scene-v79\[data-preset\]/);
  assert.match(css, /@media \(max-height: 620px\) and \(orientation: landscape\)\s*\{\s*\.title-scene-v79\[data-preset\]/);
});
