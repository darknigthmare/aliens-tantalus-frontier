export const VEHICLE_DEPLOYMENT_BLOCKED = 'BLOCKED_EXACT_SPRITE_REQUIRED';

const blockedVisualStatus = (vehicle) => String(vehicle?.visualStatus || '').startsWith('BLOCKED_');

export function getVehicleDeploymentGateV60(vehicle = null) {
  if (!vehicle) return Object.freeze({ ready: false, status: 'NO_VEHICLE_SELECTED', reason: 'Aucun véhicule sélectionné.' });
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
