import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildSupplementalSpriteManifestV66, validateSupplementalAssetsV66 } from '../scripts/sync-sprite-manifest-v66.mjs';
import { ENEMY_PROFILE_REGISTRY_V66 } from '../src/enemy-profile-registry-v66.js';

test('le manifest supplémentaire conserveV64 et expose seulement les profils prêts réellement branchés', async () => {
  const before = await readFile('assets/openai/sprites/manifest.json', 'utf8');
  const manifest = buildSupplementalSpriteManifestV66();
  const readyProfiles = ENEMY_PROFILE_REGISTRY_V66.filter((profile) => profile.ready);
  const readyCount = readyProfiles.length;
  assert.equal(manifest.atlasCount, 1 + readyCount);
  assert.equal(manifest.cellCount, 32 + readyProfiles.reduce((total, profile) =>
    total + profile.asset.grid.columns * profile.asset.grid.rows, 0));
  assert.equal(manifest.supplemental, true);
  assert.equal(manifest.baseRelease, 'v64');
  assert.equal(manifest.sheets.filter((sheet) => sheet.wave === 'v66').length,
    readyProfiles.filter((profile) => profile.asset.wave === 'v66').length);
  assert.equal(manifest.sheets.filter((sheet) => sheet.wave === 'v81').length, 2);
  assert.ok(manifest.sheets.every((sheet) => sheet.files.normalizedStatus === 'ready' && sheet.canonExact === false));
  assert.deepEqual(await validateSupplementalAssetsV66(manifest), { checked: 1 + readyCount, missing: [] });
  assert.equal(await readFile('assets/openai/sprites/manifest.json', 'utf8'), before);
});

test('un profil déclaréprêt mais absentdu vrai registre runtime échoue fermé', () => {
  assert.throws(() => buildSupplementalSpriteManifestV66({ spriteSheets: {} }), /not wired to runtime/);
});
