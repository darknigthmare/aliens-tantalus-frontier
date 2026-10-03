import { WEAPON_NATIVE_PROFILES_V122, resolveNativeWeaponProfileV122 } from './weapon-native-weapons-v122.js';
import { WEAPON_CATALOG_ADDITIONS_V122 } from './weapon-catalog-weapons-v122.js';
import { isEquipmentAdmittedV122 } from './equipment-release-v122.js';

// Candidate metadata alone is insufficient: the independent byte/dimension
// admission must match before the catalogue or render consumers can use it.
export const ADMITTED_WEAPON_PROFILES_V122 = Object.freeze(WEAPON_NATIVE_PROFILES_V122.filter(isEquipmentAdmittedV122));
export const ADMITTED_WEAPON_ASSETS_V122 = Object.freeze(Object.fromEntries(
  ADMITTED_WEAPON_PROFILES_V122.map(profile => [profile.imageKey, profile.path])));
const admittedIds = new Set(ADMITTED_WEAPON_PROFILES_V122.flatMap(profile => profile.catalogIds));
export const ADMITTED_WEAPON_ADDITIONS_V122 = Object.freeze(WEAPON_CATALOG_ADDITIONS_V122.filter(entry => admittedIds.has(entry.id)));
export function resolveAdmittedWeaponProfileV122(source) {
  const profile = resolveNativeWeaponProfileV122(source);
  if (!profile || !isEquipmentAdmittedV122(profile)) return null;
  return Object.freeze({ ...profile, catalogNumber: profile.baseNumber, exact: true, authoredFamily: false });
}
