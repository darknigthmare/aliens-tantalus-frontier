import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MISSION_LEVEL_LAYER_FILES_V52,
  MISSION_LEVEL_ZONE_LAYER_FILES_V56,
  MISSION_LEVEL_ZONE_LAYER_FILES_V57,
  resolveMissionLevelLayerFilesV56,
  resolveMissionLevelLayerFilesV57
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

test('V57 ajoute des triplets planète réels sans réécrire le contrat historique V56', () => {
  assert.deepEqual(Object.keys(MISSION_LEVEL_ZONE_LAYER_FILES_V56), ['ship-interior-vertical']);
  assert.equal(resolveMissionLevelLayerFilesV56('planet-exterior', 'planet-approach'), MISSION_LEVEL_LAYER_FILES_V52['planet-exterior']);

  const planet = MISSION_LEVEL_ZONE_LAYER_FILES_V57['planet-exterior'];
  assert.ok(planet['planet-approach']);
  assert.ok(planet['planet-surface']);
  assert.ok(planet['planet-ridge']);
  assert.ok(planet['planet-caves']);
  assert.ok(planet['planet-ruins']);
  assert.ok(planet['planet-evac']);
  assert.equal(MISSION_LEVEL_ZONE_LAYER_FILES_V57['ship-interior-vertical'], MISSION_LEVEL_ZONE_LAYER_FILES_V56['ship-interior-vertical']);

  for (const zoneId of ['planet-approach', 'planet-surface', 'planet-ridge', 'planet-caves', 'planet-ruins', 'planet-evac']) {
    const layers = planet[zoneId];
    assert.equal(resolveMissionLevelLayerFilesV57('planet-exterior', zoneId), layers);
    assert.deepEqual(Object.keys(layers), ['far', 'mid', 'foreground']);
    for (const [kind, publicPath] of Object.entries(layers)) {
      assert.match(publicPath, new RegExp(`/planet-exterior/${zoneId}-${kind}\\.png$`));
      const header = pngHeader(publicPath);
      assert.deepEqual([header.width, header.height, header.bitDepth], [1600, 900, 8], `${zoneId}:${kind}: format`);
      assert.equal(header.colorType, kind === 'far' ? 2 : 6, `${zoneId}:${kind}: RGB opaque pour far, RGBA pour la parallaxe`);
    }
  }
});

test('le résolveur V57 conserve un fallback explicite uniquement pour une zone inconnue', () => {
  assert.equal(
    resolveMissionLevelLayerFilesV57('planet-exterior', 'planet-unknown'),
    MISSION_LEVEL_LAYER_FILES_V52['planet-exterior']
  );
  assert.equal(resolveMissionLevelLayerFilesV57('unknown-template', 'planet-approach'), null);
});
