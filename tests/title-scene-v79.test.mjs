import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  TITLE_SCENE_FALLBACK_V79,
  TITLE_SCENE_LAYER_ROLES_V79,
  TITLE_SCENE_MODES_V79,
  TITLE_SCENE_PRESETS_V79,
  TITLE_SCENE_WORLD_PRESETS_V79,
  buildTitleSceneModelV79,
  getTitleSceneRuntimeAssetsV79,
  resolveTitleSceneModeV79,
  resolveTitleScenePresetV79,
  sanitizeTitleScenePresentationV79,
  validateTitleSceneCatalogV79
} from '../src/title-scene-catalog-v79.js';
import { TITLE_SCENE_READY_ASSETS_V79 } from '../src/title-scene-assets-v79.js';
import { TitleSceneControllerV79, supportsTitleSceneV79 } from '../src/title-scene-v79.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

const baseSave = (patch = {}) => ({
  profile: 1,
  createdAt: 1700000000000,
  worldId: 'world-001',
  levelSeedId: 'level-001',
  settings: { quality: 'high', reducedMotion: false },
  ...patch
});

test('le catalogue V79 couvre chaque rôle avec les 18 bitmaps acceptés et leurs fallbacks procéduraux', async () => {
  const manifest = JSON.parse(await readFile('docs/references/v79-title-scene-production/asset-manifest.json', 'utf8'));
  const manifestById = new Map(manifest.slots.map((slot) => [slot.id, slot]));
  const integrated = manifest.slots.filter((slot) => slot.status === 'integrated');
  const missing = manifest.slots.filter((slot) => slot.status === 'missing');
  assert.equal(manifest.release, 'V79');
  assert.equal(manifest.runtimeAcceptance, 'integrated-only');
  assert.equal(integrated.length, 18);
  assert.equal(missing.length, 35);
  assert.deepEqual(validateTitleSceneCatalogV79(), { ok: true, failures: [] });
  assert.equal(TITLE_SCENE_PRESETS_V79.length, 3);
  for (const preset of TITLE_SCENE_PRESETS_V79) {
    const roles = new Set(preset.layers.map((layer) => layer.role));
    assert.deepEqual([...roles].sort(), [...TITLE_SCENE_LAYER_ROLES_V79].sort());
    assert.equal(preset.layers.some((layer) => layer.renderer === 'procedural'), true);
    assert.equal(preset.layers.some((layer) => layer.renderer === 'image'), true);
  }
  assert.equal(TITLE_SCENE_READY_ASSETS_V79.length, 18);
  assert.equal(new Set(TITLE_SCENE_READY_ASSETS_V79.map((asset) => asset.runtimeId)).size, 18);
  assert.deepEqual(
    [...getTitleSceneRuntimeAssetsV79()].sort(),
    TITLE_SCENE_READY_ASSETS_V79.map((asset) => asset.src).sort()
  );
  for (const asset of TITLE_SCENE_READY_ASSETS_V79) {
    assert.equal(asset.status, 'ready');
    const slot = manifestById.get(asset.id);
    assert.equal(slot?.status, 'integrated', `${asset.id}: statut manifeste`);
    assert.equal(slot?.runtimeId, asset.runtimeId, `${asset.id}: runtimeId`);
    assert.equal(slot?.sha256, asset.sha256, `${asset.id}: hash manifeste`);
    assert.equal(`/${slot?.file}`, asset.src, `${asset.id}: chemin manifeste`);
    const bytes = await readFile(asset.src.slice(1));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.id);
  }
  const runtimePaths = new Set(getTitleSceneRuntimeAssetsV79());
  assert.equal(missing.some((slot) => runtimePaths.has(`/${slot.file}`)), false);
  assert.equal(TITLE_SCENE_FALLBACK_V79.src, '/assets/openai/ui/title/tantalus-frontier-title-background-v61.png');
  await access(TITLE_SCENE_FALLBACK_V79.src.slice(1));
});

test('la sélection de preset est stable par sauvegarde et différencie les profils', () => {
  const save = baseSave();
  assert.equal(resolveTitleScenePresetV79(save).id, resolveTitleScenePresetV79(structuredClone(save)).id);
  const profilePresets = new Set([1, 2, 3].map((profile) => resolveTitleScenePresetV79(baseSave({ profile })).id));
  assert.equal(profilePresets.size, 3);
  assert.equal(resolveTitleScenePresetV79(baseSave({
    presentation: { titleScene: { presetId: 'storm-terminator', seed: 'captured-orbit' } }
  })).id, 'storm-terminator');
  for (const [worldId, presetId] of Object.entries(TITLE_SCENE_WORLD_PRESETS_V79)) {
    assert.equal(resolveTitleScenePresetV79(baseSave({ worldId })).id, presetId);
  }
  assert.equal(resolveTitleScenePresetV79(baseSave({
    worldId: 'world-10-ceto',
    presentation: { titleScene: { presetId: 'ember-quarantine' } }
  })).id, 'ember-quarantine');
});

test('les modes full, reduced et static respectent qualité, sauvegarde et préférence OS', () => {
  assert.equal(resolveTitleSceneModeV79(baseSave()), TITLE_SCENE_MODES_V79.FULL);
  assert.equal(resolveTitleSceneModeV79(baseSave({ settings: { quality: 'low', reducedMotion: false } })), TITLE_SCENE_MODES_V79.REDUCED);
  assert.equal(resolveTitleSceneModeV79(baseSave({ settings: { quality: 'high', reducedMotion: true } })), TITLE_SCENE_MODES_V79.STATIC);
  assert.equal(resolveTitleSceneModeV79(baseSave({
    presentation: { titleScene: { motionMode: 'static' } }
  })), TITLE_SCENE_MODES_V79.STATIC);
  assert.equal(resolveTitleSceneModeV79(baseSave(), { prefersReducedMotion: true }), TITLE_SCENE_MODES_V79.STATIC);

  const full = buildTitleSceneModelV79(baseSave());
  const reduced = buildTitleSceneModelV79(baseSave({ settings: { quality: 'low', reducedMotion: false } }));
  const frozen = buildTitleSceneModelV79(baseSave(), { prefersReducedMotion: true });
  assert.ok(full.layers.length > reduced.layers.length);
  assert.ok(reduced.layers.length > frozen.layers.length);
  assert.deepEqual([...new Set(frozen.layers.map((layer) => layer.role))].sort(), [...TITLE_SCENE_LAYER_ROLES_V79].sort());
});

test('le choix de scène explicite survit à la migration et les valeurs inconnues sont rejetées', () => {
  assert.deepEqual(createDefaultSave(1).presentation.titleScene, { presetId: null, motionMode: null, seed: null });
  const selected = migrateSave({
    ...createDefaultSave(2),
    presentation: { titleScene: { presetId: 'storm-terminator', motionMode: 'reduced', seed: '  ceto-save  ' } }
  }, 2);
  assert.deepEqual(selected.presentation.titleScene, { presetId: 'storm-terminator', motionMode: 'reduced', seed: 'ceto-save' });
  assert.deepEqual(sanitizeTitleScenePresentationV79({ presetId: '../missing.png', motionMode: 'hyper', seed: '' }), {
    presetId: null,
    motionMode: null,
    seed: null
  });
});

class FakeElement {
  constructor(ownerDocument = null) {
    this.ownerDocument = ownerDocument;
    this.parentElement = null;
    this.dataset = {};
    this.hidden = false;
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
    this.style = { values: new Map(), setProperty: (key, value) => this.style.values.set(key, value) };
  }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return key === 'src' ? this.src || null : this.attributes.get(key) || null; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
}

const fakeSurface = () => {
  const documentRef = { createElement: () => new FakeElement(documentRef) };
  const title = new FakeElement(documentRef);
  const root = new FakeElement(documentRef);
  const fallback = new FakeElement(documentRef);
  root.parentElement = title;
  fallback.parentElement = title;
  fallback.src = TITLE_SCENE_FALLBACK_V79.src;
  return { documentRef, title, root, fallback };
};

test('le contrôleur compose les couches, réagit au reduced motion et suspend les animations hors titre', () => {
  const surface = fakeSurface();
  let motionListener = null;
  const media = {
    matches: false,
    addEventListener: (type, listener) => { if (type === 'change') motionListener = listener; },
    removeEventListener: () => { motionListener = null; }
  };
  const scene = new TitleSceneControllerV79({
    root: surface.root,
    fallback: surface.fallback,
    supportsScene: () => true,
    matchMedia: () => media
  });

  let snapshot = scene.show(baseSave());
  assert.equal(snapshot.status, 'ready');
  assert.equal(snapshot.mode, 'full');
  assert.equal(snapshot.roles.length, TITLE_SCENE_LAYER_ROLES_V79.length);
  assert.equal(surface.root.children.length, snapshot.layerCount);
  assert.equal(surface.fallback.hidden, true);
  assert.equal(surface.title.dataset.titleSceneV79, 'ready');

  media.matches = true;
  motionListener();
  snapshot = scene.getSnapshot();
  assert.equal(snapshot.mode, 'static');
  assert.equal(surface.root.dataset.mode, 'static');

  scene.hide();
  assert.equal(surface.root.dataset.active, 'false');
  scene.show(baseSave({ settings: { quality: 'low', reducedMotion: false } }));
  assert.equal(scene.getSnapshot().mode, 'static');
  scene.dispose();
  assert.equal(scene.getSnapshot().status, 'disposed');
  assert.equal(surface.fallback.hidden, false);
  assert.equal(motionListener, null);
});

test('un bitmap chargé remplace uniquement son fallback et une erreur conserve le procédural sans écran vide', () => {
  const surface = fakeSurface();
  const scene = new TitleSceneControllerV79({
    root: surface.root,
    fallback: surface.fallback,
    supportsScene: () => true,
    matchMedia: () => ({ matches: false })
  });
  scene.show(baseSave({
    worldId: 'world-01-acheron-lv-426',
    presentation: { titleScene: { presetId: 'frontier-night' } }
  }));

  const bitmap = (id) => surface.root.children.find((layer) => layer.dataset.assetId === id);
  const procedural = (id) => surface.root.children.find((layer) => layer.dataset.layerId === id);
  const space = bitmap('space-01-deep-frontier');
  const planet = bitmap('planet-01-acheron');
  assert.ok(space);
  assert.ok(planet);
  assert.equal(procedural('deep-space').hidden, false);
  assert.equal(procedural('frontier-world').hidden, false);

  space.children[0].listeners.get('load')();
  assert.equal(space.dataset.assetStatus, 'ready');
  assert.equal(procedural('deep-space').hidden, true);
  assert.equal(procedural('deep-space').dataset.overridden, 'true');

  planet.children[0].listeners.get('error')();
  assert.equal(planet.hidden, true);
  assert.equal(procedural('frontier-world').hidden, false);
  assert.equal(surface.root.dataset.degraded, 'true');
  assert.equal(surface.fallback.hidden, true);
  assert.equal(scene.getSnapshot().readyAssetCount, 1);
  assert.equal(scene.getSnapshot().missingAssetCount, 1);
});

test('un navigateur sans gradients conserve le bitmap V61 et ne laisse pas une scène vide', () => {
  const surface = fakeSurface();
  const scene = new TitleSceneControllerV79({ root: surface.root, fallback: surface.fallback, supportsScene: () => false });
  const snapshot = scene.show(baseSave());
  assert.equal(snapshot.status, 'css-unsupported');
  assert.equal(snapshot.fallbackVisible, true);
  assert.equal(surface.root.hidden, true);
  assert.equal(surface.title.dataset.titleSceneV79, 'fallback');
  assert.equal(supportsTitleSceneV79({ CSS: { supports: () => true } }), true);
  assert.equal(supportsTitleSceneV79({}), false);
});

test('le shell V80 conserve la scène titre V79, son build et son responsive dédié', async () => {
  const [html, app, controller, css, build, worker] = await Promise.all([
    readFile('index.html', 'utf8'),
    readFile('src/app.js', 'utf8'),
    readFile('src/title-screen-v61.js', 'utf8'),
    readFile('title-scene-v79.css', 'utf8'),
    readFile('scripts/build.mjs', 'utf8'),
    readFile('sw.js', 'utf8')
  ]);
  assert.match(html, /href="\/title-scene-v79\.css"/u);
  assert.match(html, /id="title-scene-v79"[^>]+aria-hidden="true"[^>]+hidden/u);
  assert.match(html, /id="title-background-fallback-v61"[^>]+tantalus-frontier-title-background-v61\.png/u);
  assert.match(app, /import \{ TitleSceneControllerV79 \} from '\.\/title-scene-v79\.js'/u);
  assert.match(app, /scene: titleSceneV79/u);
  assert.match(controller, /this\.scene\?\.show\?\.\(save\)/u);
  assert.match(controller, /this\.scene\?\.hide\?\.\(\)/u);
  assert.match(build, /'title-scene-v79\.css'/u);
  for (const path of ['/title-scene-v79.css', '/src/title-scene-v79.js', '/src/title-scene-catalog-v79.js', '/src/title-scene-assets-v79.js']) assert.ok(worker.includes(`'${path}'`));
  assert.match(html, /ALIENS: TANTALUS FRONTIER v81/u);
  assert.match(html, /VERSION 81\.0\.0/u);
  assert.match(worker, /atf-v81-proving-ground-shell-1/u);
  assert.match(css, /@media \(max-width: 760px\)/u);
  assert.match(css, /@media \(max-height: 620px\) and \(orientation: landscape\)/u);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/u);
  assert.match(css, /\[data-renderer='image'\]\[data-role='planet'\]/u);
  for (const role of TITLE_SCENE_LAYER_ROLES_V79) assert.match(css, new RegExp(`title-scene-layer-v79--${role}`, 'u'));
});
