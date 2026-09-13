export const EXCEL_SOURCE_V61 = Object.freeze({
  localSource: null,
  publicAsset: null,
  sha256: null,
  sheets: 19,
  globalEntities: 2363,
  thematicEntities: 2929
});

const weapon = (runtimeId, excelIds, identityStatus, artStatus = 'dedicated-sheet-required') => Object.freeze({
  runtimeId,
  excelIds: Object.freeze(excelIds),
  identityStatus,
  artStatus
});

export const EXCEL_WEAPON_BRIDGE_V61 = Object.freeze([
  weapon('weapon-008-m39-submachine-gun', ['ARM-0027'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-009-m42a-scope-rifle', ['ARM-0039'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-010-m6b-rocket-launcher', ['ARM-0026'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-011-m83-sadar', ['ARM-0022'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-012-m5-rpg', ['ARM-0025'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-013-m94-impact-grenade', ['ARM-0031'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-017-f44aa-pulse-rifle', ['ARM-0072', 'ARM-0073'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-018-type-88-heavy-assault-rifle', ['ARM-0104'], 'exact-id-linked', 'dedicated-sheet-ready'),
  weapon('weapon-019-ak-4047-pulse-rifle', ['ARM-0156'], 'linked-name-alias', 'dedicated-sheet-ready'),
  weapon('weapon-024-harpoon-gun', ['ARM-0053'], 'exact-id-linked'),
  weapon('weapon-016-heavy-pulse-rifle', ['ARM-0006', 'ARM-0273', 'ARM-0292'], 'ambiguous-canon-candidate'),
  weapon('weapon-025-plasma-rifle', ['ARM-0130', 'ARM-0159', 'ARM-0160', 'ARM-0216', 'ARM-0246'], 'ambiguous-canon-candidate'),
  weapon('weapon-020-es-4-electroshock-pistol', [], 'absent-from-excel'),
  weapon('weapon-023-compound-bow', [], 'absent-from-excel')
]);

export const EXCEL_VEHICLE_BRIDGE_V61 = Object.freeze([
  Object.freeze({
    runtimeId: 'vehicle-003-m570-armored-personnel-carrier',
    excelIds: Object.freeze([]),
    identityStatus: 'absent-from-excel',
    artStatus: 'blocked-exact-sprite-required'
  }),
  Object.freeze({
    runtimeId: 'vehicle-006-m292-combat-buggy',
    excelIds: Object.freeze(['VEH-0242']),
    identityStatus: 'exact-id-linked-insufficient-views',
    artStatus: 'blocked-exact-sprite-required'
  }),
  Object.freeze({
    runtimeId: 'vehicle-011-ad-19cd-dropship',
    excelIds: Object.freeze(['VEH-0206']),
    identityStatus: 'variant-mismatch-ad-19-4-vs-ad-19d',
    artStatus: 'blocked-exact-sprite-required'
  })
]);

const weaponByRuntimeId = new Map(EXCEL_WEAPON_BRIDGE_V61.map((entry) => [entry.runtimeId, entry]));
const vehicleByRuntimeId = new Map(EXCEL_VEHICLE_BRIDGE_V61.map((entry) => [entry.runtimeId, entry]));

export const getExcelWeaponBridgeV61 = (runtimeId) => weaponByRuntimeId.get(runtimeId) || null;
export const getExcelVehicleBridgeV61 = (runtimeId) => vehicleByRuntimeId.get(runtimeId) || null;
