export const VEHICLE_DEPLOYMENT_BLOCKED = 'BLOCKED_EXACT_SPRITE_REQUIRED';
export const VEHICLE_DEPLOYMENT_ATLAS_REQUIRED_V122 = 'BLOCKED_MISSION_ATLAS_REQUIRED';

const blockedVisualStatus = (vehicle) => String(vehicle?.visualStatus || '').startsWith('BLOCKED_');

export function getVehicleDeploymentGateV60(vehicle = null) {
  if (!vehicle) return Object.freeze({ ready: false, status: 'NO_VEHICLE_SELECTED', reason: 'Aucun véhicule sélectionné.' });
  // A reviewed inspection image does not create a physical mission sprite.
  // Keep the historical canon blocks authoritative and procurement untouched.
  if (!blockedVisualStatus(vehicle) && vehicle.missionAtlasStatus === 'not-created') return Object.freeze({
    ready: false,
    status: VEHICLE_DEPLOYMENT_ATLAS_REQUIRED_V122,
    visualStatus: String(vehicle.visualStatus || ''),
    reason: 'Atlas d’action de mission requis avant affectation et pilotage ; plaque d’inspection consultable au catalogue.'
  });
  if (!blockedVisualStatus(vehicle)) return Object.freeze({ ready: true, status: 'READY', reason: null });
  return Object.freeze({
    ready: false,
    status: VEHICLE_DEPLOYMENT_BLOCKED,
    visualStatus: String(vehicle.visualStatus),
    reason: 'Plaque canonique exacte requise avant affectation et pilotage.'
  });
}

export function isVehicleDeploymentReadyV60(vehicle) {
  return getVehicleDeploymentGateV60(vehicle).ready;
}

export function resolveReadyVehicleIdV60(requestedId, inventoryIds = [], catalog = []) {
  const owned = new Set(Array.isArray(inventoryIds) ? inventoryIds : []);
  const byId = new Map((Array.isArray(catalog) ? catalog : []).map((vehicle) => [vehicle.id, vehicle]));
  const requested = byId.get(requestedId);
  if (requested && owned.has(requestedId) && isVehicleDeploymentReadyV60(requested)) return requestedId;
  const candidates = [...owned];
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const candidate = byId.get(candidates[index]);
    if (candidate && isVehicleDeploymentReadyV60(candidate)) return candidate.id;
  }
  return null;
}
