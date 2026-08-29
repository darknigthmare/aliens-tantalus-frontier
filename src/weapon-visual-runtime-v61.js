import {
  WEAPON_VISUAL_ASSETS_V56,
  WEAPON_VISUAL_PROFILES_V56,
  resolveWeaponVisualProfileV56
} from './weapon-visual-runtime-v56.js';

const profile = ({
  baseNumber,
  name,
  sheetId,
  file,
  width,
  height,
  category = 'firearm',
  excelIds,
  referenceStatus
}) => Object.freeze({
  baseNumber,
  catalogId: `weapon-${String(baseNumber).padStart(3, '0')}`,
  name,
  sheetId,
  imageKey: `weaponV61:${baseNumber}`,
  path: `/assets/openai/sprites/normalized/weapons/${file}`,
  rawPath: `/assets/openai/sprites/weapons/${file}`,
  clipSet: 'weapon-action-v56',
  pivot: 'weapon-grip',
  hitbox: 'weapon-pickup',
  width,
  height,
  category,
  excelIds: Object.freeze(excelIds),
  referenceStatus,
  identityVerified: true,
  release: 'v61'
});

export const WEAPON_VISUAL_PROFILES_NEW_V61 = Object.freeze([
  profile({
    baseNumber: 8,
    name: 'M39 Submachine Gun',
    sheetId: 'weapon.m39-submachine-gun.action',
    file: 'm39-submachine-gun-action-sheet.png',
    width: 104,
    height: 60,
    excelIds: ['ARM-0027'],
    referenceStatus: 'CANON_REFERENCE'
  }),
  profile({
    baseNumber: 9,
    name: 'M42A Scope Rifle',
    sheetId: 'weapon.m42a-scope-rifle.action',
    file: 'm42a-scope-rifle-action-sheet.png',
    width: 142,
    height: 70,
    excelIds: ['ARM-0039'],
    referenceStatus: 'CANON_REFERENCE_RECONSTRUCTION'
  }),
  profile({
    baseNumber: 10,
    name: 'M6B Rocket Launcher',
    sheetId: 'weapon.m6b-rocket-launcher.action',
    file: 'm6b-rocket-launcher-action-sheet.png',
    width: 150,
    height: 82,
    category: 'launcher',
    excelIds: ['ARM-0026'],
    referenceStatus: 'CANON_REFERENCE_RECONSTRUCTION'
  }),
  profile({
    baseNumber: 11,
    name: 'M83 SADAR',
    sheetId: 'weapon.m83-sadar.action',
    file: 'm83-sadar-action-sheet.png',
    width: 148,
    height: 82,
    category: 'launcher',
    excelIds: ['ARM-0022'],
    referenceStatus: 'CANON_REFERENCE_RECONSTRUCTION'
  }),
  profile({
    baseNumber: 12,
    name: 'M5 RPG',
    sheetId: 'weapon.m5-rpg.action',
    file: 'm5-rpg-action-sheet.png',
    width: 146,
    height: 80,
    category: 'launcher',
    excelIds: ['ARM-0025'],
    referenceStatus: 'CANON_REFERENCE_RECONSTRUCTION'
  }),
  profile({
    baseNumber: 13,
    name: 'M94 Impact Grenade',
    sheetId: 'weapon.m94-impact-grenade.action',
    file: 'm94-impact-grenade-action-sheet.png',
    width: 150,
    height: 72,
    category: 'launcher',
    excelIds: ['ARM-0031'],
    referenceStatus: 'CANON_REFERENCE'
  }),
  profile({
    baseNumber: 17,
    name: 'F44AA Pulse Rifle',
    sheetId: 'weapon.f44aa-pulse-rifle.action',
    file: 'f44aa-pulse-rifle-action-sheet.png',
    width: 128,
    height: 72,
    excelIds: ['ARM-0072', 'ARM-0073'],
    referenceStatus: 'CANON_REFERENCE'
  }),
  profile({
    baseNumber: 18,
    name: 'Type 88 Heavy Assault Rifle',
    sheetId: 'weapon.type-88-heavy-assault-rifle.action',
    file: 'type-88-heavy-assault-rifle-action-sheet.png',
    width: 138,
    height: 76,
    excelIds: ['ARM-0104'],
    referenceStatus: 'CANON_REFERENCE_ADAPTATION'
  }),
  profile({
    baseNumber: 19,
    name: 'AK-4047 Pulse Rifle',
    sheetId: 'weapon.ak-4047-pulse-rifle.action',
    file: 'ak-4047-pulse-rifle-action-sheet.png',
    width: 128,
    height: 72,
    excelIds: ['ARM-0156'],
    referenceStatus: 'CANON_REFERENCE'
  })
]);

export const WEAPON_VISUAL_PROFILES_ALL_V61 = Object.freeze([
  ...WEAPON_VISUAL_PROFILES_V56,
  ...WEAPON_VISUAL_PROFILES_NEW_V61
]);

export const WEAPON_VISUAL_ASSETS_NEW_V61 = Object.freeze(Object.fromEntries(
  WEAPON_VISUAL_PROFILES_NEW_V61.map((entry) => [entry.imageKey, entry.path])
));

export const WEAPON_VISUAL_ASSETS_ALL_V61 = Object.freeze({
  ...WEAPON_VISUAL_ASSETS_V56,
  ...WEAPON_VISUAL_ASSETS_NEW_V61
});

export const WEAPON_VISUAL_NEW_COUNT_V61 = WEAPON_VISUAL_PROFILES_NEW_V61.length;
export const WEAPON_VISUAL_BASE_COUNT_V61 = WEAPON_VISUAL_PROFILES_ALL_V61.length;

const byBaseNumber = new Map(WEAPON_VISUAL_PROFILES_NEW_V61.map((entry) => [entry.baseNumber, entry]));
const bySheetId = new Map(WEAPON_VISUAL_PROFILES_NEW_V61.map((entry) => [entry.sheetId, entry]));
const byName = new Map(WEAPON_VISUAL_PROFILES_NEW_V61.map((entry) => [entry.name, entry]));

const catalogNumber = (source = {}) => {
  const match = String(source.id || '').match(/^weapon-(\d{3})-/);
  return match ? Number(match[1]) : 0;
};

export function resolveWeaponVisualProfileV61(source = {}) {
  const direct = bySheetId.get(String(source.sheetId || '').trim());
  const number = catalogNumber(source);
  const baseNumber = number ? ((number - 1) % 40) + 1 : 0;
  const baseName = String(source.name || '').split(' - ')[0].trim();
  const entry = direct || byBaseNumber.get(baseNumber) || byName.get(baseName);
  if (!entry) return resolveWeaponVisualProfileV56(source);
  const exact = Boolean(direct || (number > 0 && number <= 40) || (!number && baseName === entry.name));
  const reconstructed = entry.referenceStatus === 'CANON_REFERENCE_RECONSTRUCTION';
  const adapted = entry.referenceStatus === 'CANON_REFERENCE_ADAPTATION';
  const qualified = reconstructed || adapted;
  return Object.freeze({
    ...entry,
    catalogNumber: number || entry.baseNumber,
    exact,
    identityStatus: exact
      ? reconstructed ? 'reference-reconstruction' : adapted ? 'reference-adaptation' : 'exact'
      : 'authored-family',
    canonExact: exact && !qualified,
    approximate: !exact || qualified,
    fallbackReason: exact
      ? reconstructed
        ? 'Silhouette originale reconstruite depuis les références techniques disponibles; aucun turntable officiel complet n’est revendiqué.'
        : adapted
          ? 'Silhouette canonique conservée avec une finition de terrain UPP explicitement adaptée; cette faction n’est pas revendiquée comme variante canonique officielle.'
        : null
      : `The catalog variant reuses the verified ${entry.name} base silhouette; variant-specific finish is not drawn separately.`
  });
}

export function resolveWeaponVisualAnimationV61(source = {}) {
  const entry = resolveWeaponVisualProfileV61(source);
  if (!entry) return null;
  const clipId = source.reloading ? 'reload'
    : source.firing || source.attacking || source.using ? 'action'
      : source.jammed || source.inspecting || source.damaged ? 'service'
        : 'idle';
  return Object.freeze({ sheetId: entry.sheetId, clipId, imageKey: entry.imageKey });
}
