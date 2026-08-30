import {
  WEAPON_VISUAL_ASSETS_ALL_V61,
  WEAPON_VISUAL_PROFILES_ALL_V61,
  resolveWeaponVisualProfileV61
} from './weapon-visual-runtime-v61.js';

export const ASSO_400_HARPOON_PROFILE_V63 = Object.freeze({
  baseNumber: 24,
  catalogId: 'weapon-024',
  name: 'Harpoon Gun',
  canonicalName: 'ASSO-400 Harpoon Grappling Gun',
  sheetId: 'weapon.asso-400-harpoon-gun.action.v63',
  imageKey: 'weaponV63:24',
  path: '/assets/openai/sprites/normalized/weapons/asso-400-harpoon-gun-action-sheet-v63.png',
  rawPath: '/assets/openai/sprites/weapons/asso-400-harpoon-gun-action-sheet-v63.png',
  clipSet: 'weapon-action-v56',
  pivot: 'weapon-grip',
  hitbox: 'weapon-pickup',
  width: 132,
  height: 74,
  category: 'grappling',
  excelIds: Object.freeze(['ARM-0053']),
  referenceStatus: 'CANON_REFERENCE_RECONSTRUCTION',
  identityVerified: true,
  release: 'v63'
});

export const WEAPON_VISUAL_PROFILES_NEW_V63 = Object.freeze([
  ASSO_400_HARPOON_PROFILE_V63
]);

export const WEAPON_VISUAL_PROFILES_ALL_V63 = Object.freeze([
  ...WEAPON_VISUAL_PROFILES_ALL_V61,
  ...WEAPON_VISUAL_PROFILES_NEW_V63
]);

export const WEAPON_VISUAL_ASSETS_NEW_V63 = Object.freeze({
  [ASSO_400_HARPOON_PROFILE_V63.imageKey]: ASSO_400_HARPOON_PROFILE_V63.path
});

export const WEAPON_VISUAL_ASSETS_ALL_V63 = Object.freeze({
  ...WEAPON_VISUAL_ASSETS_ALL_V61,
  ...WEAPON_VISUAL_ASSETS_NEW_V63
});

export const WEAPON_VISUAL_NEW_COUNT_V63 = WEAPON_VISUAL_PROFILES_NEW_V63.length;
export const WEAPON_VISUAL_BASE_COUNT_V63 = WEAPON_VISUAL_PROFILES_ALL_V63.length;

const catalogNumber = (source = {}) => {
  const match = String(source.id || '').match(/^weapon-(\d{3})-/);
  return match ? Number(match[1]) : 0;
};

export function resolveWeaponVisualProfileV63(source = {}) {
  const number = catalogNumber(source);
  const baseNumber = number ? ((number - 1) % 40) + 1 : 0;
  const baseName = String(source.name || '').split(' - ')[0].split(' — ')[0].trim();
  const sheetId = String(source.sheetId || '').trim();
  const exact = sheetId === ASSO_400_HARPOON_PROFILE_V63.sheetId
    || baseNumber === ASSO_400_HARPOON_PROFILE_V63.baseNumber
    || (!number && ['Harpoon Gun', 'ASSO-400 Harpoon Grappling Gun'].includes(baseName));
  if (!exact) return resolveWeaponVisualProfileV61(source);
  return Object.freeze({
    ...ASSO_400_HARPOON_PROFILE_V63,
    catalogNumber: number || ASSO_400_HARPOON_PROFILE_V63.baseNumber,
    exact: true,
    identityStatus: 'reference-reconstruction',
    canonExact: false,
    approximate: true,
    fallbackReason: 'Reconstruction originale fidèle au prop ASSO-400 documenté dans Alien et à la réplique de continuité fabriquée pour Aliens; aucun fichier officiel n’est copié.'
  });
}

export function resolveWeaponVisualAnimationV63(source = {}) {
  const entry = resolveWeaponVisualProfileV63(source);
  if (!entry) return null;
  const clipId = source.reloading ? 'reload'
    : source.firing || source.attacking || source.using ? 'action'
      : source.jammed || source.inspecting || source.damaged ? 'service'
        : 'idle';
  return Object.freeze({ sheetId: entry.sheetId, clipId, imageKey: entry.imageKey });
}
