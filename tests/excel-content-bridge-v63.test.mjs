import assert from 'node:assert/strict';
import test from 'node:test';

import {
  EXCEL_WEAPON_BRIDGE_V63,
  getExcelWeaponBridgeV63
} from '../src/excel-content-bridge-v63.js';

test('V63 ferme le gap Harpoon Gun sans débloquer les identités ambiguës', () => {
  const harpoon = getExcelWeaponBridgeV63('weapon-024-harpoon-gun');
  assert.equal(harpoon.artStatus, 'dedicated-sheet-ready');
  assert.equal(harpoon.sheetId, 'weapon.asso-400-harpoon-gun.action.v63');
  for (const runtimeId of [
    'weapon-016-heavy-pulse-rifle',
    'weapon-025-plasma-rifle',
    'weapon-020-es-4-electroshock-pistol',
    'weapon-023-compound-bow'
  ]) {
    assert.equal(getExcelWeaponBridgeV63(runtimeId).artStatus, 'dedicated-sheet-required');
  }
  assert.equal(EXCEL_WEAPON_BRIDGE_V63.length, 14);
});
