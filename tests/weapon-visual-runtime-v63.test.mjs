import assert from 'node:assert/strict';
import test from 'node:test';

import { WEAPONS } from '../src/content-core-v50.js';
import {
  ASSO_400_HARPOON_PROFILE_V63,
  WEAPON_VISUAL_ASSETS_NEW_V63,
  resolveWeaponVisualAnimationV63,
  resolveWeaponVisualProfileV63
} from '../src/weapon-visual-runtime-v63.js';

test('la Harpoon Gun Excel possède une identité ASSO-400 et une plaque V63 dédiée', () => {
  const weapon = WEAPONS.find((entry) => entry.id.startsWith('weapon-024-'));
  const profile = resolveWeaponVisualProfileV63(weapon);
  assert.equal(weapon.name, 'Harpoon Gun');
  assert.equal(profile.sheetId, 'weapon.asso-400-harpoon-gun.action.v63');
  assert.equal(profile.canonicalName, 'ASSO-400 Harpoon Grappling Gun');
  assert.deepEqual(profile.excelIds, ['ARM-0053']);
  assert.equal(profile.identityStatus, 'reference-reconstruction');
  assert.equal(profile.referenceStatus, 'CANON_REFERENCE_RECONSTRUCTION');
  assert.equal(WEAPON_VISUAL_ASSETS_NEW_V63[profile.imageKey], profile.path);
  assert.equal(profile.path, ASSO_400_HARPOON_PROFILE_V63.path);
});

test('les quatre états runtime utilisent la nouvelle plaque sans alias Sonic Harpoon', () => {
  const weapon = WEAPONS.find((entry) => entry.id.startsWith('weapon-024-'));
  assert.equal(resolveWeaponVisualAnimationV63(weapon).clipId, 'idle');
  assert.equal(resolveWeaponVisualAnimationV63({ ...weapon, firing: true }).clipId, 'action');
  assert.equal(resolveWeaponVisualAnimationV63({ ...weapon, reloading: true }).clipId, 'reload');
  assert.equal(resolveWeaponVisualAnimationV63({ ...weapon, inspecting: true }).clipId, 'service');
  assert.notEqual(resolveWeaponVisualProfileV63(weapon).sheetId, 'weapon.sonic-harpoon.action');
});
