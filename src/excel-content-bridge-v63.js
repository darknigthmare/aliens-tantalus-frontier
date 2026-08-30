import {
  EXCEL_SOURCE_V61,
  EXCEL_VEHICLE_BRIDGE_V61,
  EXCEL_WEAPON_BRIDGE_V61
} from './excel-content-bridge-v61.js';

export const EXCEL_SOURCE_V63 = EXCEL_SOURCE_V61;

export const EXCEL_WEAPON_BRIDGE_V63 = Object.freeze(EXCEL_WEAPON_BRIDGE_V61.map((entry) => (
  entry.runtimeId === 'weapon-024-harpoon-gun'
    ? Object.freeze({
        ...entry,
        artStatus: 'dedicated-sheet-ready',
        sheetId: 'weapon.asso-400-harpoon-gun.action.v63',
        referenceStatus: 'CANON_REFERENCE_RECONSTRUCTION'
      })
    : entry
)));

export const EXCEL_VEHICLE_BRIDGE_V63 = EXCEL_VEHICLE_BRIDGE_V61;

const weaponByRuntimeId = new Map(EXCEL_WEAPON_BRIDGE_V63.map((entry) => [entry.runtimeId, entry]));
const vehicleByRuntimeId = new Map(EXCEL_VEHICLE_BRIDGE_V63.map((entry) => [entry.runtimeId, entry]));

export const getExcelWeaponBridgeV63 = (runtimeId) => weaponByRuntimeId.get(runtimeId) || null;
export const getExcelVehicleBridgeV63 = (runtimeId) => vehicleByRuntimeId.get(runtimeId) || null;
