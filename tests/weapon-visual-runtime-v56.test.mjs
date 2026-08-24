import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { WEAPONS } from '../src/content-core-v50.js';
import {
  WEAPON_VISUAL_ASSETS_V56,
  WEAPON_VISUAL_BASE_COUNT_V56,
  WEAPON_VISUAL_PROFILES_V56,
  resolveWeaponVisualProfileV56
} from '../src/weapon-visual-runtime-v56.js';

const localUrl = (webPath) => new URL(`..${webPath}`, import.meta.url);
const baseNumber = (source) => ((Number(source.id.slice('weapon-'.length, 'weapon-000'.length)) - 1) % 40) + 1;

function pngHeader(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25]
  };
}

test('le registre armes V56 ne précharge que les 26 plaques réellement prêtes', async () => {
  assert.equal(WEAPON_VISUAL_BASE_COUNT_V56, 26);
  assert.equal(WEAPON_VISUAL_PROFILES_V56.length, 26);
  assert.equal(Object.keys(WEAPON_VISUAL_ASSETS_V56).length, 26);
  assert.equal(new Set(WEAPON_VISUAL_PROFILES_V56.map((entry) => entry.path)).size, 26);

  for (const profile of WEAPON_VISUAL_PROFILES_V56) {
    const [raw, normalized] = await Promise.all([
      readFile(localUrl(profile.rawPath)),
      readFile(localUrl(profile.path))
    ]);
    const rawHeader = pngHeader(raw);
    const expectedRawHeader = profile.baseNumber === 1
      ? { width: 1254, height: 1254, bitDepth: 8, colorType: 2 }
      : { width: 1024, height: 1024, bitDepth: 8, colorType: 6 };
    assert.deepEqual(rawHeader, expectedRawHeader, `${profile.name} source`);
    assert.deepEqual(pngHeader(normalized), { width: 1024, height: 1024, bitDepth: 8, colorType: 6 }, profile.name);
  }
});

test('les sept armes projet B10 prêtes, Pathogen inclus, restent déclarées originales', () => {
  assert.deepEqual(
    WEAPON_VISUAL_PROFILES_V56.filter((entry) => entry.baseNumber >= 34).map((entry) => entry.baseNumber),
    [34, 35, 36, 37, 38, 39, 40]
  );
  for (const number of [34, 35, 36, 37, 38, 39, 40]) {
    const source = WEAPONS.find((entry) => baseNumber(entry) === number);
    const visual = resolveWeaponVisualProfileV56(source);
    assert.ok(visual, `base ${number}`);
    assert.equal(visual.referenceStatus, 'PROJECT_ORIGINAL', `base ${number}`);
  }
});

test('Pathogen Containment Projector résout sa plaque 4x4 validée sans 404', async () => {
  const source = WEAPONS.find((entry) => baseNumber(entry) === 40);
  const visual = resolveWeaponVisualProfileV56(source);
  assert.ok(visual);
  assert.equal(visual.name, 'Pathogen Containment Projector');
  assert.equal(visual.sheetId, 'weapon.pathogen-containment-projector.action');
  assert.equal(visual.path, '/assets/openai/sprites/normalized/weapons/pathogen-containment-projector-action-sheet.png');
  assert.equal(visual.rawPath, '/assets/openai/sprites/weapons/pathogen-containment-projector-action-sheet.png');
  assert.equal(visual.referenceStatus, 'PROJECT_ORIGINAL');
  assert.deepEqual(pngHeader(await readFile(localUrl(visual.path))), {
    width: 1024,
    height: 1024,
    bitDepth: 8,
    colorType: 6
  });
});
