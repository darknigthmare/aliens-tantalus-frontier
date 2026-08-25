export const VEHICLE_ACCESS_DURATION_V59 = 0.58;
export const VEHICLE_ACCESS_SECURE_DURATION_V59 = 0.52;

const contract = (baseSheetId, accessSheetId, vehicleId, subject) => Object.freeze({
  schema: 59,
  baseSheetId,
  accessSheetId,
  vehicleId,
  subject,
  pivot: 'vehicle-ground',
  grid: 'v50-4x4',
  clips: Object.freeze({
    entering: 'access-open',
    secured: 'secure-occupied',
    exiting: 'exit-close',
    destroyed: 'critical-wreck'
  })
});

export const VEHICLE_ACCESS_CONTRACTS_V59 = Object.freeze([
  contract(
    'vehicle.m577-apc.action',
    'vehicle.m577-apc.access-damage',
    'vehicle-001-m577-armored-personnel-carrier',
    'M577 Armored Personnel Carrier'
  ),
  contract(
    'vehicle.m577-command-apc.action',
    'vehicle.m577-command-apc.access-damage',
    'vehicle-002-m577-command-apc',
    'M577 Command APC'
  ),
  contract(
    'vehicle.p5000-powered-work-loader.action',
    'vehicle.p5000-powered-work-loader.access-damage',
    'vehicle-007-p-5000-powered-work-loader',
    'P-5000 Powered Work Loader'
  ),
  contract(
    'vehicle.ud4l-cheyenne-dropship.action',
    'vehicle.ud4l-cheyenne-dropship.access-damage',
    'vehicle-009-ud-4l-cheyenne-dropship',
    'UD-4L Cheyenne Dropship'
  )
]);

const contractBySheet = new Map(VEHICLE_ACCESS_CONTRACTS_V59.flatMap((entry) => [
  [entry.baseSheetId, entry],
  [entry.accessSheetId, entry]
]));

const fallbackIdleClipByBaseSheet = new Map([
  ['vehicle.m577-apc.action', 'idle'],
  ['vehicle.m577-command-apc.action', 'command-idle'],
  ['vehicle.p5000-powered-work-loader.action', 'idle'],
  ['vehicle.ud4l-cheyenne-dropship.action', 'hangar']
]);

export function resolveVehicleAccessContractV59(baseSheetId) {
  return contractBySheet.get(String(baseSheetId || '')) || null;
}

export function resolveVehicleAccessAnimationV59(vehicle = {}, baseSheetId = '') {
  const access = resolveVehicleAccessContractV59(baseSheetId);
  if (!access) return null;
  if (vehicle.destroyed === true || (Number(vehicle.maxHull) > 0 && Number(vehicle.hull) <= 0)) {
    return { sheetId: access.accessSheetId, clipId: access.clips.destroyed };
  }
  const phase = vehicle.accessTransition?.phase;
  if (phase === 'entering') return { sheetId: access.accessSheetId, clipId: access.clips.entering };
  if (phase === 'exiting') return { sheetId: access.accessSheetId, clipId: access.clips.exiting };
  if (vehicle.occupied && Number(vehicle.accessSecureClock) > 0) {
    return { sheetId: access.accessSheetId, clipId: access.clips.secured };
  }
  return null;
}

export function resolveVehicleAccessFallbackV59(vehicle = {}, sheetId = '') {
  const access = resolveVehicleAccessContractV59(sheetId);
  if (!access) return null;
  const destroyed = vehicle.destroyed === true
    || (Number(vehicle.maxHull) > 0 && Number(vehicle.hull) <= 0);
  return {
    sheetId: access.baseSheetId,
    clipId: destroyed ? 'damage' : fallbackIdleClipByBaseSheet.get(access.baseSheetId) || 'idle'
  };
}

export function createVehicleAccessTransitionV59(actorRole, phase) {
  if (!['player', 'coop'].includes(actorRole)) throw new TypeError(`Unsupported vehicle actor role: ${String(actorRole)}`);
  if (!['entering', 'exiting'].includes(phase)) throw new TypeError(`Unsupported vehicle access phase: ${String(phase)}`);
  return {
    schema: 59,
    actorRole,
    phase,
    elapsed: 0,
    duration: VEHICLE_ACCESS_DURATION_V59
  };
}
