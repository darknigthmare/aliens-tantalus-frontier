import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  MISSION_LEVEL_LAYER_FILES_V52,
  MISSION_LEVEL_ZONE_LAYER_FILES_V57,
  MISSION_LEVEL_ZONE_LAYER_FILES_V58,
  resolveMissionLevelLayerFilesV57,
  resolveMissionLevelLayerFilesV58
} from '../src/game-v52-level-runtime.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fileForPublicPath = (publicPath) => resolve(repoRoot, publicPath.replace(/^\//, ''));

function pngHeader(publicPath) {
  const file = fileForPublicPath(publicPath);
  assert.equal(existsSync(file), true, `${publicPath}: bitmap absent`);
  const source = readFileSync(file);
  assert.equal(source.subarray(1, 4).toString('ascii'), 'PNG', `${publicPath}: signature PNG`);
  return {
    width: source.readUInt32BE(16),
    height: source.readUInt32BE(20),
    bitDepth: source[24],
    colorType: source[25]
  };
}

test('V58 ajoute six salles coloniales avec trois plans indépendants sans réécrire V57', () => {
  assert.equal(Object.keys(MISSION_LEVEL_ZONE_LAYER_FILES_V57).length, 2);
  assert.equal(MISSION_LEVEL_ZONE_LAYER_FILES_V57['colony-multiroute'], undefined);
  assert.equal(
    resolveMissionLevelLayerFilesV57('colony-multiroute', 'colony-approach'),
    MISSION_LEVEL_LAYER_FILES_V52['colony-multiroute']
  );

  const colony = MISSION_LEVEL_ZONE_LAYER_FILES_V58['colony-multiroute'];
  const zoneIds = [
    'colony-approach',
    'colony-habitat',
    'colony-civic',
    'colony-utility',
    'colony-security',
    'colony-landing'
  ];
  assert.deepEqual(Object.keys(colony), zoneIds);

  for (const zoneId of zoneIds) {
    const layers = colony[zoneId];
    assert.equal(resolveMissionLevelLayerFilesV58('colony-multiroute', zoneId), layers);
    assert.deepEqual(Object.keys(layers), ['far', 'mid', 'foreground']);
    for (const [kind, publicPath] of Object.entries(layers)) {
      assert.match(publicPath, new RegExp(`/colony-multiroute/${zoneId}-${kind}\\.png$`));
      const header = pngHeader(publicPath);
      assert.deepEqual([header.width, header.height, header.bitDepth], [1600, 900, 8], `${zoneId}:${kind}: format`);
      assert.equal(header.colorType, kind === 'far' ? 2 : 6, `${zoneId}:${kind}: RGB opaque pour far, RGBA pour la parallaxe`);
    }
  }
});

test('le registre V58 couvre 18 zones et 54 bitmaps uniques avec un fallback explicite', () => {
  const assets = Object.values(MISSION_LEVEL_ZONE_LAYER_FILES_V58)
    .flatMap((zones) => Object.values(zones))
    .flatMap((layers) => Object.values(layers));
  assert.equal(assets.length, 54);
  assert.equal(new Set(assets).size, 54);
  assert.equal(
    resolveMissionLevelLayerFilesV58('colony-multiroute', 'colony-unknown'),
    MISSION_LEVEL_LAYER_FILES_V52['colony-multiroute']
  );
  assert.equal(resolveMissionLevelLayerFilesV58('unknown-template', 'colony-approach'), null);
});
