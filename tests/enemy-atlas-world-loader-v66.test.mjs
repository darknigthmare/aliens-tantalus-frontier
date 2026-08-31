import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { EnemyAtlasLRUV65, getEnemyAtlasSheetsForWorldV66 } from '../src/enemy-atlas-loader-v65.js';
import { buildEnemyProfileRegistryV66 } from '../src/enemy-profile-registry-v66.js';

const ids = ['enemy-001-ovomorph', 'enemy-003-chestburster', 'enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner'];
const assets = ids.map((profileId) => ({ profileId, path: `/assets/openai/sprites/normalized/enemy-profiles-v66/${profileId}.webp`, spriteKey: profileId.endsWith('ovomorph') ? 'ovomorph' : 'drone', clipSet: profileId.endsWith('ovomorph') ? 'ovomorph-cycle-v66' : 'enemy-action-v66', pivot: 'creature-ground', hitbox: 'xeno-tall', renderWidth: 128, renderHeight: 128, sourceFacing: 1, identityStatus: 'source-locked-adaptation', referenceStatus: 'CANON_REFERENCE_ADAPTATION', identityVerified: true, reviewStatus: 'accepted', provider: 'openai-imagegen', promptId: 'synthetic-loader-fixture', referenceUrls: ['https://example.com/fixture'], canonExact: false }));
const registryV66 = buildEnemyProfileRegistryV66(ENEMIES.map((enemy) => ({ ...enemy, encounterWorldIds: [ids.indexOf(enemy.id) >= 0 && ids.indexOf(enemy.id) < 3 ? 'fixture-a' : 'fixture-b'] })), assets);

class FixtureImage {
  static requests = [];
  constructor() { this.complete = false; this.naturalWidth = 0; }
  set src(path) { this._src = path; FixtureImage.requests.push(path); queueMicrotask(() => { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 2048; this.onload?.(); }); }
}

test('un monde charge seulement ses profilsV66acceptés et jamais toutlecatalogue571', async () => {
  FixtureImage.requests = [];
  const loader = new EnemyAtlasLRUV65({ ImageCtor: FixtureImage });
  assert.equal(registryV66.length, 571);
  assert.equal(FixtureImage.requests.length, 0);
  const result = await loader.preloadWorld('fixture-a', { registryV65: [], registryV66 });
  assert.equal(result.selectedSheets.length, 3);
  assert.equal(FixtureImage.requests.length, 3);
  assert.deepEqual(FixtureImage.requests, assets.slice(0, 3).map((asset) => asset.path));
  await loader.preloadWorld('fixture-a', { registryV65: [], registryV66 });
  assert.equal(FixtureImage.requests.length, 3, 'les chargements identiques sont dédupliqués');
  await loader.preloadWorld('fixture-b', { registryV65: [], registryV66 });
  assert.equal(FixtureImage.requests.length, 5);
  assert.equal(loader.snapshot().ready, 5);
  assert.equal(loader.snapshot().maxEntries, 12);
});

test('un monde inconnu ou un registre entièrement pending ne charge aucun candidat', async () => {
  const pending = buildEnemyProfileRegistryV66(ENEMIES, []);
  assert.deepEqual(getEnemyAtlasSheetsForWorldV66('', { registryV65: [], registryV66 }), []);
  assert.deepEqual(getEnemyAtlasSheetsForWorldV66('missing-world', { registryV65: [], registryV66 }), []);
  assert.deepEqual(getEnemyAtlasSheetsForWorldV66(ENEMIES[0].encounterWorldIds[0], { registryV65: [], registryV66: pending }), []);
});
