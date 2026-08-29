import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { WEAPONS } from '../src/content-core-v50.js';
import {
  WEAPON_VISUAL_ASSETS_NEW_V61,
  WEAPON_VISUAL_BASE_COUNT_V61,
  WEAPON_VISUAL_NEW_COUNT_V61,
  WEAPON_VISUAL_PROFILES_NEW_V61,
  resolveWeaponVisualProfileV61
} from '../src/weapon-visual-runtime-v61.js';

const localUrl = (webPath) => new URL(`..${webPath}`, import.meta.url);

function pngHeader(buffer) {
  assert.deepEqual([...buffer.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25]
  };
}

test('V61 ajoute neuf armes Excel comme vraies plaques 4x4 raw et normalisées', async () => {
  assert.equal(WEAPON_VISUAL_NEW_COUNT_V61, 9);
  assert.equal(WEAPON_VISUAL_BASE_COUNT_V61, 35);
  assert.equal(Object.keys(WEAPON_VISUAL_ASSETS_NEW_V61).length, 9);
  assert.deepEqual(WEAPON_VISUAL_PROFILES_NEW_V61.map((entry) => entry.baseNumber), [8, 9, 10, 11, 12, 13, 17, 18, 19]);
  for (const profile of WEAPON_VISUAL_PROFILES_NEW_V61) {
    const [raw, normalized] = await Promise.all([
      readFile(localUrl(profile.rawPath)),
      readFile(localUrl(profile.path))
    ]);
    assert.deepEqual(pngHeader(raw), { width: 1024, height: 1024, bitDepth: 8, colorType: 6 }, `${profile.name} raw`);
    assert.deepEqual(pngHeader(normalized), { width: 1024, height: 1024, bitDepth: 8, colorType: 6 }, `${profile.name} normalized`);
  }
});

test('les neuf armes V61 résolvent leurs identités Excel sans fallback de famille', () => {
  const m39 = resolveWeaponVisualProfileV61(WEAPONS.find((entry) => entry.id.startsWith('weapon-008-')));
  const m42a = resolveWeaponVisualProfileV61(WEAPONS.find((entry) => entry.id.startsWith('weapon-009-')));
  assert.equal(m39.sheetId, 'weapon.m39-submachine-gun.action');
  assert.equal(m39.identityStatus, 'exact');
  assert.equal(m39.canonExact, true);
  assert.deepEqual(m39.excelIds, ['ARM-0027']);
  assert.equal(m42a.sheetId, 'weapon.m42a-scope-rifle.action');
  assert.equal(m42a.identityStatus, 'reference-reconstruction');
  assert.equal(m42a.canonExact, false);
  assert.deepEqual(m42a.excelIds, ['ARM-0039']);
  for (const [prefix, sheetId, excelIds, category, status, canonExact] of [
    ['weapon-010-', 'weapon.m6b-rocket-launcher.action', ['ARM-0026'], 'launcher', 'reference-reconstruction', false],
    ['weapon-011-', 'weapon.m83-sadar.action', ['ARM-0022'], 'launcher', 'reference-reconstruction', false],
    ['weapon-012-', 'weapon.m5-rpg.action', ['ARM-0025'], 'launcher', 'reference-reconstruction', false],
    ['weapon-013-', 'weapon.m94-impact-grenade.action', ['ARM-0031'], 'launcher', 'exact', true],
    ['weapon-017-', 'weapon.f44aa-pulse-rifle.action', ['ARM-0072', 'ARM-0073'], 'firearm', 'exact', true],
    ['weapon-018-', 'weapon.type-88-heavy-assault-rifle.action', ['ARM-0104'], 'firearm', 'reference-adaptation', false],
    ['weapon-019-', 'weapon.ak-4047-pulse-rifle.action', ['ARM-0156'], 'firearm', 'exact', true]
  ]) {
    const visual = resolveWeaponVisualProfileV61(WEAPONS.find((entry) => entry.id.startsWith(prefix)));
    assert.equal(visual.sheetId, sheetId);
    assert.equal(visual.identityStatus, status);
    assert.equal(visual.canonExact, canonExact);
    assert.deepEqual(visual.excelIds, excelIds);
    assert.equal(visual.category, category);
  }
});

test('les variantes catalogue des neuf familles restent explicitement des finitions de famille', () => {
  const variants = [48, 49, 50, 51, 52, 53, 57, 58, 59].map((number) =>
    resolveWeaponVisualProfileV61(WEAPONS.find((entry) => entry.id.startsWith(`weapon-${String(number).padStart(3, '0')}-`)))
  );
  for (const visual of variants) {
    assert.equal(visual.exact, false);
    assert.equal(visual.identityStatus, 'authored-family');
    assert.match(visual.fallbackReason, /variant/i);
  }
});
