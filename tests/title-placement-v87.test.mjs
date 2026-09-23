import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  TITLE_SCENE_PLACEMENTS_V87, TITLE_PLANET_EFFECT_REGISTRATION_V87,
  buildTitleSceneModelV79, chooseTitleScenePlacementV87
} from '../src/title-scene-catalog-v79.js';
import { TITLE_SCENE_READY_BY_ID_V79 } from '../src/title-scene-assets-v79.js';
import { TitleSceneControllerV79 } from '../src/title-scene-v79.js';

class Element {
  constructor(ownerDocument) {
    Object.assign(this, { ownerDocument, dataset: {}, hidden: false, children: [], attributes: new Map(),
      listeners: new Map(), style: { values: new Map(), setProperty(k,v) { this.values.set(k,v); } } });
  }
  setAttribute(key, value) { this.attributes.set(key, value); }
  getAttribute(key) { return this.attributes.get(key); }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}
function surface(random) {
  const document = { createElement: () => new Element(document) };
  const root = new Element(document), fallback = new Element(document);
  root.parentElement = new Element(document);
  let listener;
  const media = { matches: false, addEventListener(type, callback) { listener = callback; } };
  const controller = new TitleSceneControllerV79({ root, fallback, random, supportsScene: () => true, matchMedia: () => media });
  return { root, controller, media, changeMotion: () => listener() };
}
const save = () => ({ worldId: 'world-01-acheron-lv-426', settings: { quality: 'high', reducedMotion: false } });

test('les trois placements sont bornés, sans répétition immédiate ni biais de graine de sauvegarde', () => {
  assert.deepEqual(TITLE_SCENE_PLACEMENTS_V87, ['starboard', 'center', 'port']);
  assert.deepEqual([0, .5, .999].map(value => chooseTitleScenePlacementV87(null, () => value)), TITLE_SCENE_PLACEMENTS_V87);
  for (const previous of TITLE_SCENE_PLACEMENTS_V87) {
    for (const sample of [0, .5, 1, NaN, Infinity, -100, 100]) {
      const chosen = chooseTitleScenePlacementV87(previous, () => sample);
      assert.ok(TITLE_SCENE_PLACEMENTS_V87.includes(chosen));
      assert.notEqual(chosen, previous);
    }
  }
  assert.equal(chooseTitleScenePlacementV87(null, () => { throw Error('random unavailable'); }), 'starboard');
});

test('le tirage est effectué une seule fois par entrée, jamais par rendu/options/préférence OS', () => {
  let calls = 0;
  const { root, controller, media, changeMotion } = surface(() => { calls++; return 0; });
  const state = save(), original = structuredClone(state);
  controller.show(state);
  assert.equal(controller.getSnapshot().placementId, 'starboard');
  const firstChildren = root.children;
  controller.show(structuredClone(state));
  assert.equal(root.children, firstChildren);
  assert.equal(calls, 1);
  controller.show({ ...state, settings: { quality: 'low' } });
  assert.equal(controller.getSnapshot().placementId, 'starboard');
  media.matches = true;
  changeMotion();
  assert.equal(controller.getSnapshot().mode, 'static');
  assert.equal(controller.getSnapshot().placementId, 'starboard');
  assert.equal(calls, 1);
  controller.hide();
  controller.show(state);
  assert.equal(controller.getSnapshot().placementId, 'center');
  assert.equal(root.dataset.placement, 'center');
  assert.equal(calls, 2);
  assert.deepEqual(state, original);
});

test('le détour par les options reprend la composition, puis une vraie entrée tire à nouveau', () => {
  let calls = 0;
  const { controller } = surface(() => { calls++; return 0; });
  controller.show(save());
  controller.hide();
  controller.preservePlacementOnNextShowV87();
  controller.show({ ...save(), settings: { reducedMotion: true } });
  assert.equal(controller.getSnapshot().placementId, 'starboard');
  assert.equal(calls, 1);
  controller.hide();
  controller.show(save());
  assert.equal(controller.getSnapshot().placementId, 'center');
  assert.equal(calls, 2);
  controller.hide();
  controller.preservePlacementOnNextShowV87();
  controller.clearPlacementPreservationV87();
  controller.show(save());
  assert.equal(calls, 3);
});

test('le changement explicite de planète garde le cadrage de la visite courante', () => {
  const { controller } = surface(() => .999);
  controller.show(save());
  assert.equal(controller.getSnapshot().placementId, 'port');
  controller.show({ ...save(), presentation: { titleScene: { presetId: 'ember-quarantine' } } });
  assert.equal(controller.getSnapshot().presetId, 'ember-quarantine');
  assert.equal(controller.getSnapshot().placementId, 'port');
  const model = buildTitleSceneModelV79(save(), { placementId: '../invalid' });
  assert.equal(model.placementId, 'starboard');
});

test('le halo peint reste dans la profondeur de la planète et possède sa vraie registration 1600x900', async () => {
  const registration = TITLE_PLANET_EFFECT_REGISTRATION_V87['vfx-03-scan-sweep'];
  const asset = TITLE_SCENE_READY_BY_ID_V79['vfx-03-scan-sweep'];
  const png = await readFile(asset.src.slice(1));
  assert.equal(png.readUInt32BE(16), registration.sourceWidth);
  assert.equal(png.readUInt32BE(20), registration.sourceHeight);
  assert.deepEqual(registration, { x: 441, y: 147, size: 640, sourceWidth: 1600, sourceHeight: 900 });
  for (const presetId of ['frontier-night', 'storm-terminator', 'ember-quarantine']) {
    const model = buildTitleSceneModelV79({ presentation: { titleScene: { presetId } } });
    const halo = model.layers.find(layer => layer.assetId === 'vfx-03-scan-sweep');
    const planet = model.layers.find(layer => layer.renderer === 'image' && layer.role === 'planet');
    assert.equal(halo.planetAnchor, true);
    assert.equal(halo.sphereRegistration, registration);
    assert.ok(halo.depth > planet.depth);
    assert.ok(halo.depth < model.layers.find(layer => layer.renderer === 'image' && layer.role === 'orbitals').depth);
    for (const layer of model.layers.filter(layer => ['planet', 'atmosphere', 'clouds'].includes(layer.role))) {
      assert.equal(layer.planetAnchor, true, layer.id);
    }
    assert.equal(model.layers.find(layer => layer.id === 'sensor-sweep').planetAnchor, true);
  }
});

test('les coordonnées du point central et l’échelle du halo sont identiques à celles du disque planétaire', () => {
  const { controller, root } = surface(() => .5);
  controller.show(save());
  const halo = root.children.find(layer => layer.dataset.assetId === 'vfx-03-scan-sweep');
  assert.equal(halo.dataset.planetAnchor, 'true');
  const style = halo.style.values;
  const left = parseFloat(style.get('--title-art-left-v87')), top = parseFloat(style.get('--title-art-top-v87'));
  const width = parseFloat(style.get('--title-art-width-v87')), height = parseFloat(style.get('--title-art-height-v87'));
  assert.equal(left + 761 / 1600 * width, 50);
  assert.equal(top + 467 / 900 * height, 50);
  assert.equal(640 / 1600 * width, 100);
  assert.equal(640 / 900 * height, 100);
  assert.equal(width / height, 1600 / 900);
});

test('le halo partage les variables de cadre, sans balayage géométrique, pour tous les breakpoints', async () => {
  const css = await readFile('title-scene-v79.css', 'utf8');
  assert.match(css, /\[data-planet-anchor='true'\]\s*\{[^}]*inset: var\(--planet-top-v79\) var\(--planet-right-v79\) auto auto;[^}]*width: var\(--planet-size-v79\);[^}]*height: var\(--planet-size-v79\);[^}]*transform: none;/);
  for (const placement of ['center', 'port']) {
    assert.equal(css.split(`[data-placement='${placement}']`).length - 1, 3);
  }
  for (const keyframes of ['title-sweep-v79', 'title-sweep-reduced-v79']) {
    const animation = css.slice(css.indexOf('@keyframes ' + keyframes)).split('\n}\n')[0];
    assert.doesNotMatch(animation, /transform|translate|rotate|scale/);
  }
  assert.match(css, /\[data-mode='static'\] \.title-scene-layer-v79\s*\{[^}]*animation-play-state: paused !important/);
  assert.match(css, /\.title-screen\[data-title-scene-v79='ready'\] \.title-screen-copy\s*\{[^}]*rgba\(1, 4, 4, \.92\)/);
  assert.match(css, /rgba\(1, 4, 4, \.62\) 35%/);
});
