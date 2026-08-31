import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { V65_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v65.js';
import { READY_ENEMY_PROFILE_REGISTRY_V66 } from '../src/enemy-profile-registry-v66.js';
import {
  ENEMY_PROFILE_REGISTRY_V65,
  READY_ENEMY_PROFILE_REGISTRY_V65,
  V65_ENEMY_PROFILE_SPRITE_SHEETS,
  buildEnemyProfileRegistryV65,
  buildEnemyProfileSpriteSheetsV65,
  resolveEnemyProfileVisualFromRegistryV65
} from '../src/enemy-profile-registry-v65.js';
import { resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';

const catalog = Object.freeze([
  Object.freeze({
    id: 'enemy-fixture-a',
    name: 'Armored Fixture A',
    modifier: 'Armored',
    biology: 'xenomorph',
    caste: 'drone',
    behavior: 'stalk',
    encounterWorldIds: ['world-a'],
    habitats: ['hive'],
    provenance: 'systemic-variant'
  }),
  Object.freeze({
    id: 'enemy-fixture-b',
    name: 'Fixture B',
    modifier: 'Standard',
    biology: 'human',
    caste: 'security',
    behavior: 'guard',
    encounterWorldIds: ['world-b'],
    habitats: ['ship'],
    provenance: 'licensed-reference'
  })
]);

const asset = (profileId, path) => Object.freeze({
  profileId,
  path,
  spriteKey: profileId === 'enemy-fixture-b' ? 'seegsonSecurityV56' : 'xenoDrone',
  pivot: profileId === 'enemy-fixture-b' ? 'humanoid-feet' : 'creature-ground',
  hitbox: profileId === 'enemy-fixture-b' ? 'npc-standing' : 'xenomorph-standing',
  renderWidth: 156,
  renderHeight: 124,
  sourceFacing: 1,
  identityStatus: 'source-locked-adaptation',
  referenceStatus: 'CANON_REFERENCE',
  provider: 'openai-imagegen',
  promptId: 'v65-fixture-prompt',
  referenceUrls: ['https://example.com/primary-reference']
});

const facehuggerCatalog = Object.freeze([
  Object.freeze({ ...catalog[0], id: 'enemy-fixture-facehugger', name: 'Facehugger', modifier: 'Standard', caste: 'facehugger' }),
  Object.freeze({ ...catalog[0], id: 'enemy-fixture-albino-facehugger', name: 'Albino Facehugger', modifier: 'Albino', caste: 'facehugger' })
]);
const facehuggerAsset = Object.freeze({
  ...asset(facehuggerCatalog[0].id, '/assets/openai/sprites/normalized/enemy-profiles-v65/fixture-facehugger.webp'),
  spriteKey: 'facehugger',
  clipSet: 'facehugger-action-v65',
  grid: Object.freeze({ columns: 4, rows: 8, cellWidth: 256, cellHeight: 256 })
});

test('le gate accepte les 32 poses Facehugger en 4x8 et conserve le clipset dédié', () => {
  for (const source of [facehuggerAsset, { ...facehuggerAsset, grid: undefined }]) {
    const registry = buildEnemyProfileRegistryV65(facehuggerCatalog, [source]);
    const visual = resolveEnemyProfileVisualFromRegistryV65(facehuggerCatalog[0], registry);
    const sheet = buildEnemyProfileSpriteSheetsV65(registry)[visual.sheetId];
    assert.equal(registry[0].ready, true);
    assert.equal(visual.spriteKey, 'facehugger');
    assert.equal(sheet.clipSet, 'facehugger-action-v65');
    assert.equal(sheet.assetFormat, 'webp-rgba-1024x2048');
    assert.deepEqual(
      { columns: sheet.columns, rows: sheet.rows, cellWidth: sheet.cellWidth, cellHeight: sheet.cellHeight },
      { columns: 4, rows: 8, cellWidth: 256, cellHeight: 256 }
    );
  }
});

test('le gate refuse une grille incompatible avec le clipset annoncé', () => {
  const incompatible = [
    { ...facehuggerAsset, grid: { columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 } },
    { ...facehuggerAsset, clipSet: 'enemy-action-v56' },
    { ...facehuggerAsset, grid: { columns: 4, rows: 8, cellWidth: 128, cellHeight: 256 } }
  ];
  for (const source of incompatible) {
    assert.throws(() => buildEnemyProfileRegistryV65(facehuggerCatalog, [source]), /grille incompatible/);
  }
});

for (const clipSet of ['enemy-action-v999', 'constructor', 'toString', '__proto__']) {
  test(`le gate refuse le clipset inconnu ${clipSet}`, () => {
    assert.throws(
      () => buildEnemyProfileRegistryV65(facehuggerCatalog, [{ ...facehuggerAsset, clipSet }]),
      /clipSet non pris en charge/
    );
  });
}

test('accepter la plaque Facehugger standard ne valide pas implicitement ses variantes', () => {
  const registry = buildEnemyProfileRegistryV65(facehuggerCatalog, [facehuggerAsset]);
  const variant = registry[1];
  assert.equal(registry.filter((profile) => profile.ready).length, 1);
  assert.equal(Object.keys(buildEnemyProfileSpriteSheetsV65(registry)).length, 1);
  assert.equal(variant.archetype, registry[0].archetype);
  assert.equal(variant.ready, false);
  assert.equal(variant.assetStatus, 'pending-art');
  assert.equal(variant.asset, null);
  for (const source of [facehuggerCatalog[1], facehuggerCatalog[1].id, facehuggerCatalog[1].name]) {
    assert.equal(resolveEnemyProfileVisualFromRegistryV65(source, registry), null);
  }
});

test('le registre V65 est généré depuis les 571 profils ENEMIES sans déclarer prêt un art absent', () => {
  assert.equal(ENEMY_PROFILE_REGISTRY_V65.length, ENEMIES.length);
  assert.equal(ENEMY_PROFILE_REGISTRY_V65.length, 571);
  assert.equal(READY_ENEMY_PROFILE_REGISTRY_V65.length, V65_READY_ENEMY_PROFILE_ASSETS.length);
  assert.equal(
    ENEMY_PROFILE_REGISTRY_V65.filter((profile) => profile.ready).length,
    Object.keys(V65_ENEMY_PROFILE_SPRITE_SHEETS).length
  );
  for (const profile of ENEMY_PROFILE_REGISTRY_V65) {
    assert.equal(profile.assetStatus, profile.ready ? 'ready' : 'pending-art');
    if (!profile.ready) assert.equal(profile.asset, null);
  }
});

test('une plaque acceptée produit un sheet 4x4 et un profil visuel dédié sans changer le spriteKey de gameplay', () => {
  const registry = buildEnemyProfileRegistryV65(catalog, [asset('enemy-fixture-a', '/assets/openai/sprites/normalized/enemy-profiles-v65/enemy-fixture-a.webp')]);
  const sheets = buildEnemyProfileSpriteSheetsV65(registry);
  const visual = resolveEnemyProfileVisualFromRegistryV65(catalog[0], registry);
  const sheet = sheets[visual.sheetId];

  assert.equal(registry[0].archetype, 'Fixture A');
  assert.equal(registry[0].ready, true);
  assert.equal(registry[1].ready, false);
  assert.equal(visual.profileId, 'enemy-fixture-a');
  assert.equal(visual.spriteKey, 'xenoDrone');
  assert.equal(visual.approximate, false);
  assert.equal(visual.provenance.provider, 'openai-imagegen');
  assert.deepEqual(
    { columns: sheet.columns, rows: sheet.rows, cellWidth: sheet.cellWidth, cellHeight: sheet.cellHeight },
    { columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 }
  );
  assert.equal(sheet.profileId, 'enemy-fixture-a');
  assert.equal(sheet.id, 'enemy.profile.enemy-fixture-a.v65');
  assert.equal(sheet.assetFormat, 'webp-rgba-1024');
  assert.equal(sheet.path.endsWith('.webp'), true);
  assert.equal(resolveEnemyProfileVisualFromRegistryV65(catalog[1], registry), null);
});

test('SPRITE_SHEETS et resolveEnemyVisualProfile exposent automatiquement chaque entrée V65 prête', () => {
  for (const profile of READY_ENEMY_PROFILE_REGISTRY_V65) {
    assert.equal(SPRITE_SHEETS[profile.asset.sheetId]?.profileId, profile.profileId);
    const source = ENEMIES.find((enemy) => enemy.id === profile.profileId);
    assert.equal(resolveEnemyVisualProfile(source).sheetId, profile.asset.sheetId);
  }
  assert.equal(Object.keys(SPRITE_SHEETS).length, 195 + READY_ENEMY_PROFILE_REGISTRY_V65.length + READY_ENEMY_PROFILE_REGISTRY_V66.length);
});

test('le gate de registre rejette les profils inconnus, doublons, plaques partagées et provenance non OpenAI', () => {
  assert.throws(
    () => buildEnemyProfileRegistryV65(catalog, [asset('enemy-inconnu', '/assets/openai/sprites/normalized/enemy-profiles-v65/unknown.webp')]),
    /profil ENEMIES inconnu/
  );
  assert.throws(() => buildEnemyProfileRegistryV65([catalog[0], catalog[0]], []), /Profil ennemi V65 dupliqué/);
  const sharedPath = '/assets/openai/sprites/normalized/enemy-profiles-v65/shared.webp';
  assert.throws(
    () => buildEnemyProfileRegistryV65(catalog, [asset('enemy-fixture-a', sharedPath), asset('enemy-fixture-b', sharedPath)]),
    /réemployée/
  );
  assert.throws(
    () => buildEnemyProfileRegistryV65(catalog, [{ ...asset('enemy-fixture-a', sharedPath), provider: 'unknown' }]),
    /provider OpenAI requis/
  );
  assert.throws(
    () => buildEnemyProfileRegistryV65(catalog, [asset('enemy-fixture-a', '/assets/openai/sprites/normalized/enemy-profiles-v65/not-runtime.png')]),
    /WebP RGBA 1024/
  );
});
