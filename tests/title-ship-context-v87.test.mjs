import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TITLE_SHIP_ASSETS_V87 } from '../src/title-scene-assets-v79.js';
import { buildTitleSceneModelV79, getTitleSceneShipOptionsV87, sanitizeTitleScenePresentationV79, sanitizeTitleShipNameV87 } from '../src/title-scene-catalog-v79.js';
import { TitleSceneControllerV79 } from '../src/title-scene-v79.js';
import { createDefaultSave, migrateSave } from '../src/save.js';

const doc = () => ({ createElement() { return {
  dataset: {}, children: [], style: { values: new Map(), setProperty(key, value) { this.values.set(key, value); } },
  setAttribute() {}, addEventListener() {}, append(child) { this.children.push(child); }
}; } });
test('chaque modèle prêt est sélectionnable seul, indépendamment de planète/mode/cadrage', () => {
  const options = getTitleSceneShipOptionsV87();
  assert.equal(options.length, TITLE_SHIP_ASSETS_V87.length);
  assert.ok(options.length >= 4);
  for (const asset of TITLE_SHIP_ASSETS_V87) {
    for (const presetId of ['frontier-night', 'storm-terminator', 'ember-quarantine']) {
      for (const motionMode of ['full', 'reduced', 'static']) {
        const model = buildTitleSceneModelV79({ presentation: { titleScene: { presetId, motionMode, shipId: asset.shipId } } }, { placementId: 'port' });
        assert.equal(model.shipId, asset.shipId);
        assert.equal(model.presetId, presetId);
        assert.equal(model.placementId, 'port');
        const ships = model.layers.filter(layer => layer.role === 'orbitals');
        assert.equal(ships.length, 1);
        assert.equal(ships[0].renderer, 'image');
        assert.equal(ships[0].assetSrc, asset.src);
        assert.equal(model.layers.some(layer => layer.role === 'traffic' || layer.assetId === 'vfx-01-ion-exhaust'), false);
      }
    }
  }
});

test('le contexte vaisseau/nom traverse la vraie migration sans élargir les identifiants autorisés', () => {
  const configured = createDefaultSave(1);
  configured.presentation.titleScene = { presetId: 'frontier-night', shipId: 'uss-sulaco', shipName: '  Sulaco  ' };
  const migrated = migrateSave(configured, 1);
  assert.equal(migrated.presentation.titleScene.shipId, 'uss-sulaco');
  assert.equal(migrated.presentation.titleScene.shipName, 'SULACO');
  assert.equal(buildTitleSceneModelV79(migrated).shipName, 'SULACO');
  assert.equal(buildTitleSceneModelV79({ presentation: { titleScene: { presetId: 'frontier-night' } } }).shipName, 'TANTALUS');
  const bad = sanitizeTitleScenePresentationV79({ shipId: '../../secret', shipName: '<img onerror=alert(1)>' });
  assert.equal(Object.hasOwn(bad, 'shipId'), false);
  assert.equal(Object.hasOwn(bad, 'shipName'), false);
  assert.equal(sanitizeTitleShipNameV87('A'.repeat(25)), null);
  assert.equal(sanitizeTitleShipNameV87('Étoile  7'), 'ETOILE 7');
  assert.equal(sanitizeTitleShipNameV87('USS / HACK'), null);
  assert.equal(getTitleSceneShipOptionsV87().find(option => option.shipId === 'uss-sulaco').canRename, true);
  assert.equal(getTitleSceneShipOptionsV87().find(option => option.shipId === 'narcissus').canRename, false);
});

test('le marquage est un texte DOM contenu dans le vrai panneau de la coque et suit son échelle', () => {
  const controller = new TitleSceneControllerV79({ matchMedia: null });
  for (const name of ['TANTALUS', 'SULACO', 'A'.repeat(24)]) {
    const model = buildTitleSceneModelV79({ presentation: { titleScene: { shipId: 'uss-sulaco', shipName: name } } });
    const layer = model.layers.find(entry => entry.role === 'orbitals');
    const element = controller.createLayer(layer, doc());
    assert.equal(element.children.length, 2);
    const [image, marking] = element.children;
    assert.equal(image.src, layer.assetSrc);
    assert.equal(marking.textContent, name);
    assert.equal(marking.className, 'title-ship-marking-v87');
    const values = marking.style.values;
    const registration = layer.hullRegistration, plate = layer.namePlate;
    assert.equal(parseFloat(values.get('left')), (plate.x - registration.x) / registration.width * 100);
    assert.equal(parseFloat(values.get('top')), (plate.y - registration.y) / registration.height * 100);
    assert.ok(parseFloat(values.get('left')) + parseFloat(values.get('width')) <= 100);
    assert.ok(parseFloat(values.get('top')) + parseFloat(values.get('height')) <= 100);
    const font = Number(values.get('--ship-name-font-v87')) * registration.width / 100;
    assert.ok(font * name.length * .85 <= plate.width + 1e-8);
    assert.ok(font <= plate.height * .78 + 1e-8);
    assert.equal(Number(element.style.values.get('--ship-ratio-v87')), registration.width / registration.height);
  }
});

test('chaque cadrage de vaisseau garde le ratio et les dimensions réellement mesurées du PNG', async () => {
  const controller = new TitleSceneControllerV79({ matchMedia: null });
  for (const asset of TITLE_SHIP_ASSETS_V87) {
    const bytes = await readFile(asset.src.slice(1));
    assert.equal(bytes.readUInt32BE(16), asset.hullRegistration.sourceWidth);
    assert.equal(bytes.readUInt32BE(20), asset.hullRegistration.sourceHeight);
    const model = buildTitleSceneModelV79({ presentation: { titleScene: { shipId: asset.shipId } } });
    const layer = model.layers.find(entry => entry.role === 'orbitals');
    const rendered = controller.createLayer(layer, doc());
    const scaleX = parseFloat(rendered.style.values.get('--ship-image-width-v87')) * asset.hullRegistration.width / asset.hullRegistration.sourceWidth;
    const scaleY = parseFloat(rendered.style.values.get('--ship-image-height-v87')) * asset.hullRegistration.height / asset.hullRegistration.sourceHeight;
    assert.equal(scaleX, 100);
    assert.equal(scaleY, 100);
    assert.equal(rendered.children.filter(child => child.className === 'title-ship-marking-v87').length, asset.namePlate ? 1 : 0);
  }
});
