export const VEHICLE_ACCESS_DURATION_V59 = 0.58;
export const VEHICLE_ACCESS_SECURE_DURATION_V59 = 0.52;

export const SQUAD_VEHICLE_ACCESS_V60 = Object.freeze({
  schema: 60,
  openingDuration: VEHICLE_ACCESS_DURATION_V59,
  closingDuration: VEHICLE_ACCESS_SECURE_DURATION_V59,
  traversalDuration: 0.46,
  approachTimeout: 7,
  approachSpeed: 205,
  queueSpacing: 58,
  contactRadius: 18,
  verticalTolerance: 54,
  maxJumpRise: 170,
  maxSafeDrop: 220
});

const squadSocket = (rearInset, baseline = 1) => Object.freeze({
  edge: 'rear',
  rearInset,
  baseline
});

const contract = (baseSheetId, accessSheetId, vehicleId, subject, socket) => Object.freeze({
  schema: 59,
  baseSheetId,
  accessSheetId,
  vehicleId,
  subject,
  squadSocket: socket,
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
    'M577 Armored Personnel Carrier',
    squadSocket(0.1)
  ),
  contract(
    'vehicle.m577-command-apc.action',
    'vehicle.m577-command-apc.access-damage',
    'vehicle-002-m577-command-apc',
    'M577 Command APC',
    squadSocket(0.1)
  ),
  contract(
    'vehicle.p5000-powered-work-loader.action',
    'vehicle.p5000-powered-work-loader.access-damage',
    'vehicle-007-p-5000-powered-work-loader',
    'P-5000 Powered Work Loader',
    squadSocket(0.42)
  ),
  contract(
    'vehicle.ud4l-cheyenne-dropship.action',
    'vehicle.ud4l-cheyenne-dropship.access-damage',
    'vehicle-009-ud-4l-cheyenne-dropship',
    'UD-4L Cheyenne Dropship',
    squadSocket(0.16)
  )
]);

const contractBySheet = new Map(VEHICLE_ACCESS_CONTRACTS_V59.flatMap((entry) => [
  [entry.baseSheetId, entry],
  [entry.accessSheetId, entry]
]));
const contractByVehicleId = new Map(VEHICLE_ACCESS_CONTRACTS_V59.map((entry) => [entry.vehicleId, entry]));

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
  const squadAccess = vehicle.squadAccessRuntime;
  if (squadAccess?.phase === 'opening' || squadAccess?.phase === 'sequencing') {
    return { sheetId: access.accessSheetId, clipId: access.clips.entering };
  }
  if (squadAccess?.phase === 'closing') {
    return {
      sheetId: access.accessSheetId,
      clipId: squadAccess.mode === 'boarding' ? access.clips.secured : access.clips.exiting
    };
  }
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

export function resolveSquadVehicleAccessSocketV60(vehicle = {}, baseSheetId = '') {
  const access = resolveVehicleAccessContractV59(baseSheetId)
    || contractByVehicleId.get(String(vehicle.id || ''))
    || null;
  const definition = access?.squadSocket || squadSocket(0.08);
  const facing = Number(vehicle.facing) < 0 ? -1 : 1;
  const width = Math.max(1, Number(vehicle.w) || 190);
  const height = Math.max(1, Number(vehicle.h) || 104);
  const x = (Number(vehicle.x) || 0) + width * (facing > 0 ? definition.rearInset : 1 - definition.rearInset);
  const vehicleBottom = (Number(vehicle.y) || 0) + height * definition.baseline;
  return Object.freeze({
    schema: 60,
    x,
    bottom: vehicleBottom,
    outward: facing > 0 ? -1 : 1,
    inward: facing > 0 ? 1 : -1,
    source: access ? access.vehicleId : 'generic-rear-socket',
    anchor: 'vehicle-bottom',
    supported: Boolean(access)
  });
}

export function createSquadVehicleAccessRuntimeV60({ mode, crewIds, socket } = {}) {
  if (!['boarding', 'disembarking'].includes(mode)) throw new TypeError(`Unsupported squad vehicle access mode: ${String(mode)}`);
  const queue = [...new Set((Array.isArray(crewIds) ? crewIds : []).filter((id) => typeof id === 'string' && id))];
  if (!queue.length) return null;
  if (!socket || !Number.isFinite(Number(socket.x)) || !Number.isFinite(Number(socket.bottom))) {
    throw new TypeError('A finite squad vehicle access socket is required');
  }
  return {
    schema: 60,
    mode,
    phase: 'opening',
    elapsed: 0,
    currentCrewId: null,
    queue,
    completed: [],
    skipped: [],
    socket: { ...socket }
  };
}

export function snapshotSquadVehicleAccessRuntimeV60(runtime) {
  if (!runtime || runtime.schema !== 60) return null;
  return {
    schema: 60,
    mode: runtime.mode,
    phase: runtime.phase,
    elapsed: Math.max(0, Number(runtime.elapsed) || 0),
    currentCrewId: typeof runtime.currentCrewId === 'string' ? runtime.currentCrewId : null,
    queue: [...new Set((Array.isArray(runtime.queue) ? runtime.queue : []).filter((id) => typeof id === 'string' && id))],
    completed: [...new Set((Array.isArray(runtime.completed) ? runtime.completed : []).filter((id) => typeof id === 'string' && id))],
    skipped: [...new Set((Array.isArray(runtime.skipped) ? runtime.skipped : []).filter((id) => typeof id === 'string' && id))],
    socket: runtime.socket ? {
      x: Number(runtime.socket.x) || 0,
      bottom: Number(runtime.socket.bottom) || 0,
      outward: Number(runtime.socket.outward) < 0 ? -1 : 1,
      inward: Number(runtime.socket.inward) < 0 ? -1 : 1,
      source: String(runtime.socket.source || 'generic-rear-socket'),
      anchor: String(runtime.socket.anchor || 'vehicle-bottom'),
      supported: Boolean(runtime.socket.supported)
    } : null
  };
}
