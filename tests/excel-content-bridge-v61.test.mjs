import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EXCEL_SOURCE_V61,
  EXCEL_VEHICLE_BRIDGE_V61,
  EXCEL_WEAPON_BRIDGE_V61,
  getExcelVehicleBridgeV61,
  getExcelWeaponBridgeV61
} from '../src/excel-content-bridge-v61.js';

test('the versioned Excel source has a stable checksum and coverage counts', () => {
  assert.match(EXCEL_SOURCE_V61.sha256, /^[A-F0-9]{64}$/);
  assert.equal(EXCEL_SOURCE_V61.sheets, 19);
  assert.equal(EXCEL_SOURCE_V61.globalEntities, 2363);
  assert.equal(EXCEL_SOURCE_V61.thematicEntities, 2929);
});

test('the fourteen missing weapon families are linked or explicitly unresolved', () => {
  assert.equal(EXCEL_WEAPON_BRIDGE_V61.length, 14);
  assert.equal(EXCEL_WEAPON_BRIDGE_V61.filter((entry) => entry.identityStatus === 'exact-id-linked').length, 9);
  assert.equal(EXCEL_WEAPON_BRIDGE_V61.filter((entry) => entry.identityStatus === 'linked-name-alias').length, 1);
  assert.equal(EXCEL_WEAPON_BRIDGE_V61.filter((entry) => entry.identityStatus === 'ambiguous-canon-candidate').length, 2);
  assert.equal(EXCEL_WEAPON_BRIDGE_V61.filter((entry) => entry.identityStatus === 'absent-from-excel').length, 2);
  assert.deepEqual(getExcelWeaponBridgeV61('weapon-008-m39-submachine-gun').excelIds, ['ARM-0027']);
  assert.equal(getExcelWeaponBridgeV61('weapon-008-m39-submachine-gun').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-009-m42a-scope-rifle').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-010-m6b-rocket-launcher').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-011-m83-sadar').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-012-m5-rpg').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-013-m94-impact-grenade').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-017-f44aa-pulse-rifle').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-018-type-88-heavy-assault-rifle').artStatus, 'dedicated-sheet-ready');
  assert.equal(getExcelWeaponBridgeV61('weapon-019-ak-4047-pulse-rifle').artStatus, 'dedicated-sheet-ready');
  assert.equal(EXCEL_WEAPON_BRIDGE_V61.filter((entry) => entry.artStatus === 'dedicated-sheet-required').length, 5);
});

test('the three blocked vehicle chassis remain honest about reference sufficiency', () => {
  assert.equal(EXCEL_VEHICLE_BRIDGE_V61.length, 3);
  assert.equal(EXCEL_VEHICLE_BRIDGE_V61.every((entry) => entry.artStatus === 'blocked-exact-sprite-required'), true);
  assert.deepEqual(getExcelVehicleBridgeV61('vehicle-006-m292-combat-buggy').excelIds, ['VEH-0242']);
  assert.equal(getExcelVehicleBridgeV61('unknown'), null);
});
