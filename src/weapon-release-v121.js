import { WEAPON_NATIVE_PROFILES_V121 } from './weapon-native-visuals-v121.js';
import { WEAPON_CATALOG_ADDITIONS_V121 } from './weapon-catalog-additions-v121.js';
import { WEAPON_NATIVE_EXTRA_PROFILES_V121,WEAPON_CATALOG_EXTRA_V121 } from './weapon-native-extra-v121.js';
import { isEquipmentAdmittedV121 } from './equipment-release-v121.js';

export const ADMITTED_WEAPON_PROFILES_V121 = Object.freeze(
  [...WEAPON_NATIVE_PROFILES_V121,...WEAPON_NATIVE_EXTRA_PROFILES_V121].filter(isEquipmentAdmittedV121));
export const ADMITTED_WEAPON_ASSETS_V121 = Object.freeze(Object.fromEntries(
  ADMITTED_WEAPON_PROFILES_V121.map(profile=>[profile.imageKey,profile.path])));
const byId = new Map();
const byAlias = new Map();
for (const profile of ADMITTED_WEAPON_PROFILES_V121) {
  for (const id of profile.catalogIds) {
    const number=Number(id.match(/^weapon-(\d{3})-/)[1]);
    byId.set(id,{profile,number});byId.set(`weapon-${String(number).padStart(3,'0')}`,{profile,number});
  }
  for (const alias of [profile.name,profile.canonicalName,profile.imageKey]) byAlias.set(alias,profile);
}
export const ADMITTED_WEAPON_ADDITIONS_V121 = Object.freeze(
  [...WEAPON_CATALOG_ADDITIONS_V121,...WEAPON_CATALOG_EXTRA_V121].filter(entry=>byId.has(entry.id)));
export function resolveAdmittedWeaponProfileV121(source={}) {
  if (!source || typeof source!=='object' || Array.isArray(source)) return null;
  const id=String(source.id||'').trim();let profile,number;
  if (id) { const binding=byId.get(id);if (!binding) return null;({profile,number}=binding); }
  else {
    const aliases=[source.name,source.canonicalName,source.imageKey].filter(Boolean).map(value=>String(value).trim());
    if (!aliases.length) return null;const matches=aliases.map(alias=>byAlias.get(alias));
    if (matches.some(value=>!value) || new Set(matches).size!==1) return null;
    profile=matches[0];number=profile.baseNumber;
  }
  return Object.freeze({...profile,catalogNumber:number,exact:true,authoredFamily:number!==profile.baseNumber});
}
