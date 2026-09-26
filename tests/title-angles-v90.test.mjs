import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { TITLE_SHIP_ANGLE_ASSETS_V88 } from '../src/title-scene-angle-assets-v88.js';
import { buildTitleSceneModelV79, chooseTitleShipAngleV88, getTitleSceneRuntimeAssetsV79, getTitleSceneShipAnglesV88, validateTitleShipAngleV88 } from '../src/title-scene-catalog-v79.js';
import { inspectPng } from '../scripts/audit-title-assets-v79.mjs';

const assets = TITLE_SHIP_ANGLE_ASSETS_V88.filter(a => a.id.endsWith('-v90'));
test('V90 admits exactly four independently reviewed native views, excluding the painted SULACO and unverified underside', async () => {
  assert.equal(assets.length, 4);
  assert.deepEqual(assets.map(a => [a.shipId, a.angleId]), [['uss-sulaco', 'rear-quarter'], ['narcissus', 'front-quarter'], ['narcissus', 'side-quarter'], ['uscss-nostromo', 'front-quarter']]);
  assert.equal(new Set(assets.map(a => a.sha256)).size, 4);
  assert.deepEqual((await readdir('assets/openai/ui/title/v90/orbitals')).sort(), assets.map(a => a.src.split('/').at(-1)).sort());
  assert.ok(assets.every(a => !/underside|sulaco-front/.test(a.src)));
});

for (const asset of assets) test(`${asset.id}: exact native bytes, bounded proportional registration and explicit V90 alpha exception`, async () => {
  // Registry records the reviewed provider hash; a duplicate private bitmap is not a portable fixture.
  const bytes = await readFile(asset.src.slice(1));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(validateTitleShipAngleV88(asset), true);
  const png = inspectPng(bytes);
  assert.equal(png.width, 1536); assert.equal(png.height, 1024); assert.equal(png.colorType, 6); assert.equal(png.bitDepth, 8);
  assert.equal(png.alphaMin, 0); assert.equal(png.alphaMax, 254);
  assert.equal(png.opaqueBorderRatio, 0); assert.equal(png.opaqueNearWhiteBorderRatio, 0);
  assert.ok(png.visibleRatio > .25 && png.visibleRatio < .6);
  // Generator-native hidden RGB is retained; this is NOT the older strict V87 gate.
  assert.ok(png.hiddenRgbRatio > .4 && png.hiddenRgbRatio < .52);
  assert.deepEqual(asset.hullRegistration, { x:0, y:0, width:1536, height:1024, sourceWidth:1536, sourceHeight:1024 });
  assert.equal(asset.fidelityStatus, 'fan-made-reference-reviewed'); assert.equal(asset.canonExact, false);
  assert.equal(asset.provenance.pixelPolicy, 'native-unchanged'); assert.ok(asset.provenance.referenceUrls.length > 0);
  assert.equal(asset.namePlate, null, 'old side marking must not be projected onto the new view');
  assert.ok(getTitleSceneRuntimeAssetsV79().includes(asset.src));
});

test('V90 registry cannot mix namespaces or silently upgrade reconstruction to canon-exact', () => {
  for (const patch of [{ runtimeId: 'title.v88.ship.uss-sulaco.rear-quarter' }, { src: '/assets/openai/ui/title/v88/orbitals/any.png' },
    { canonExact: true }, { fidelityStatus: 'unreviewed' }, { provenance: { generator: 'integrated-imagegen', pixelPolicy: 'retouched' } }]) {
    assert.equal(validateTitleShipAngleV88({ ...assets[0], ...patch }), false);
  }
});

test('every admitted camera keeps ship identity, context, native proportion and save untouched through all presets and placements', () => {
  for (const asset of assets) for (const presetId of ['frontier-night', 'storm-terminator', 'ember-quarantine']) for (const placementId of ['starboard', 'center', 'port']) {
    const save = { presentation: { titleScene: { shipId: asset.shipId, shipName: 'TANTALUS', presetId } } }, before = structuredClone(save);
    const model = buildTitleSceneModelV79(save, { shipAngleAssetId: asset.id, placementId });
    assert.equal(model.shipId, asset.shipId); assert.equal(model.shipAngleId, asset.angleId); assert.equal(model.placementId, placementId);
    const ships = model.layers.filter(layer => layer.role === 'orbitals'); assert.equal(ships.length, 1);
    assert.equal(ships[0].assetSrc, asset.src); assert.equal(ships[0].hullRegistration.width / ships[0].hullRegistration.height, 1.5);
    assert.equal(ships[0].namePlate, null); assert.equal(model.sceneContext.viewpoint, 'exterior'); assert.equal(model.sceneContext.debris, null);
    assert.deepEqual(save, before);
    assert.notEqual(chooseTitleShipAngleV88(asset.shipId, asset.id, () => .5), asset.id);
  }
  assert.equal(getTitleSceneShipAnglesV88('narcissus').length, 3);
  for (const id of ['ud4l-cheyenne', 'usm-auriga', 'prometheus']) assert.equal(getTitleSceneShipAnglesV88(id).length, 1);
});
