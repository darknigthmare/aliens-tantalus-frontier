const profile = ({ baseNumber, name, sheetId, file, width, height, category = 'firearm', referenceStatus = 'CANON_REFERENCE' }) => Object.freeze({
  baseNumber,
  catalogId: `weapon-${String(baseNumber).padStart(3, '0')}`,
  name,
  sheetId,
  imageKey: `weaponV56:${baseNumber}`,
  path: `/assets/openai/sprites/normalized/weapons/${file}`,
  rawPath: `/assets/openai/sprites/weapons/${file}`,
  clipSet: 'weapon-action-v56',
  pivot: 'weapon-grip',
  hitbox: 'weapon-pickup',
  width,
  height,
  category,
  referenceStatus,
  identityVerified: true
});

export const WEAPON_VISUAL_PROFILES_V56 = Object.freeze([
  profile({ baseNumber: 1, name: 'M41A Pulse Rifle', sheetId: 'weapon.m41a-pulse-rifle.action', file: 'm41a-pulse-rifle-action-sheet.png', width: 126, height: 72 }),
  profile({ baseNumber: 2, name: 'M41A2 Pulse Rifle', sheetId: 'weapon.m41a2-pulse-rifle.action', file: 'm41a2-pulse-rifle-action-sheet.png', width: 126, height: 72 }),
  profile({ baseNumber: 3, name: 'M4A3 Service Pistol', sheetId: 'weapon.m4a3-service-pistol.action', file: 'm4a3-service-pistol-action-sheet.png', width: 72, height: 48 }),
  profile({ baseNumber: 4, name: 'VP70 Combat Pistol', sheetId: 'weapon.vp70-combat-pistol.action', file: 'vp70-combat-pistol-action-sheet.png', width: 72, height: 48 }),
  profile({ baseNumber: 5, name: 'M56 Smartgun', sheetId: 'weapon.m56-smartgun.action', file: 'm56-smartgun-action-sheet.png', width: 148, height: 84 }),
  profile({ baseNumber: 6, name: 'M240 Incinerator Unit', sheetId: 'weapon.m240-incinerator-unit.action', file: 'm240-incinerator-unit-action-sheet.png', width: 132, height: 76 }),
  profile({ baseNumber: 7, name: 'M37A2 Pump Shotgun', sheetId: 'weapon.m37a2-pump-shotgun.action', file: 'm37a2-pump-shotgun-action-sheet.png', width: 124, height: 68 }),
  profile({ baseNumber: 14, name: 'M40 HEDP Grenade', sheetId: 'weapon.m40-hedp-grenade.action', file: 'm40-hedp-grenade-action-sheet.png', width: 46, height: 34, category: 'throwable' }),
  profile({ baseNumber: 15, name: 'UA 571-C Sentry Gun', sheetId: 'weapon.ua-571c-sentry-gun.action', file: 'ua-571c-sentry-gun-action-sheet.png', width: 112, height: 92, category: 'deployable' }),
  profile({ baseNumber: 21, name: '.357 Magnum Revolver', sheetId: 'weapon.magnum-357-revolver.action', file: '357-magnum-revolver-action-sheet.png', width: 76, height: 50 }),
  profile({ baseNumber: 22, name: 'Bolt Gun', sheetId: 'weapon.bolt-gun.action', file: 'bolt-gun-action-sheet.png', width: 132, height: 78 }),
  profile({ baseNumber: 26, name: 'Combi-Stick', sheetId: 'weapon.combi-stick.action', file: 'combi-stick-action-sheet.png', width: 150, height: 46, category: 'melee' }),
  profile({ baseNumber: 27, name: 'Smart Disc', sheetId: 'weapon.smart-disc.action', file: 'smart-disc-action-sheet.png', width: 66, height: 66, category: 'throwable' }),
  profile({ baseNumber: 28, name: 'Wrist Blades', sheetId: 'weapon.wrist-blades.action', file: 'wrist-blades-action-sheet.png', width: 82, height: 56, category: 'melee' }),
  profile({ baseNumber: 29, name: 'Cutting Torch', sheetId: 'weapon.cutting-torch.action', file: 'cutting-torch-action-sheet.png', width: 64, height: 52, category: 'tool' }),
  profile({ baseNumber: 30, name: 'Maintenance Jack', sheetId: 'weapon.maintenance-jack.action', file: 'maintenance-jack-action-sheet.png', width: 82, height: 58, category: 'tool' }),
  profile({ baseNumber: 31, name: 'Fire Axe', sheetId: 'weapon.fire-axe.action', file: 'fire-axe-action-sheet.png', width: 88, height: 64, category: 'melee' }),
  profile({ baseNumber: 32, name: 'Combat Knife', sheetId: 'weapon.combat-knife.action', file: 'combat-knife-action-sheet.png', width: 58, height: 38, category: 'melee' }),
  profile({ baseNumber: 33, name: 'Stun Baton', sheetId: 'weapon.stun-baton.action', file: 'stun-baton-action-sheet.png', width: 72, height: 46, category: 'melee' }),
  profile({ baseNumber: 34, name: 'Sonic Harpoon', sheetId: 'weapon.sonic-harpoon.action', file: 'sonic-harpoon-action-sheet.png', width: 128, height: 72, referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 35, name: 'Neuro-Link Disruptor', sheetId: 'weapon.neuro-link-disruptor.action', file: 'neuro-link-disruptor-action-sheet.png', width: 104, height: 62, referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 36, name: 'Ripper Acid Projector', sheetId: 'weapon.ripper-acid-projector.action', file: 'ripper-acid-projector-action-sheet.png', width: 132, height: 78, referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 37, name: 'Reef Caster', sheetId: 'weapon.reef-caster.action', file: 'reef-caster-action-sheet.png', width: 120, height: 70, referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 38, name: 'Foundry Nailgun', sheetId: 'weapon.foundry-nailgun.action', file: 'foundry-nailgun-action-sheet.png', width: 108, height: 66, referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 39, name: 'Cryo Lance', sheetId: 'weapon.cryo-lance.action', file: 'cryo-lance-action-sheet.png', width: 126, height: 72, category: 'tool', referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 40, name: 'Pathogen Containment Projector', sheetId: 'weapon.pathogen-containment-projector.action', file: 'pathogen-containment-projector-action-sheet.png', width: 130, height: 76, category: 'tool', referenceStatus: 'PROJECT_ORIGINAL' })
]);

export const WEAPON_VISUAL_BASE_COUNT_V56 = WEAPON_VISUAL_PROFILES_V56.length;
export const WEAPON_VISUAL_ASSETS_V56 = Object.freeze(Object.fromEntries(
  WEAPON_VISUAL_PROFILES_V56.map((entry) => [entry.imageKey, entry.path])
));

const byBaseNumber = new Map(WEAPON_VISUAL_PROFILES_V56.map((entry) => [entry.baseNumber, entry]));
const bySheetId = new Map(WEAPON_VISUAL_PROFILES_V56.map((entry) => [entry.sheetId, entry]));
const byName = new Map(WEAPON_VISUAL_PROFILES_V56.map((entry) => [entry.name, entry]));

const catalogNumber = (source = {}) => {
  const match = String(source.id || '').match(/^weapon-(\d{3})-/);
  return match ? Number(match[1]) : 0;
};

export function resolveWeaponVisualProfileV56(source = {}) {
  const direct = bySheetId.get(String(source.sheetId || '').trim());
  const number = catalogNumber(source);
  const baseNumber = number ? ((number - 1) % 40) + 1 : 0;
  const baseName = String(source.name || '').split(' - ')[0].trim();
  const entry = direct || byBaseNumber.get(baseNumber) || byName.get(baseName);
  if (!entry) return null;
  const exact = Boolean(direct || (number > 0 && number <= 40) || (!number && baseName === entry.name));
  return Object.freeze({
    ...entry,
    catalogNumber: number || entry.baseNumber,
    exact,
    identityStatus: exact
      ? (entry.referenceStatus === 'CANON_REFERENCE' ? 'exact' : 'project-original')
      : 'authored-family',
    canonExact: exact && entry.referenceStatus === 'CANON_REFERENCE',
    approximate: !exact,
    fallbackReason: exact ? null : `The catalog variant reuses the verified ${entry.name} base silhouette; variant-specific finish is not drawn separately.`
  });
}

export function resolveWeaponVisualAnimationV56(source = {}) {
  const entry = resolveWeaponVisualProfileV56(source);
  if (!entry) return null;
  const clipId = source.reloading ? 'reload'
    : source.firing || source.attacking || source.using ? 'action'
      : source.jammed || source.inspecting || source.damaged ? 'service'
        : 'idle';
  return Object.freeze({ sheetId: entry.sheetId, clipId, imageKey: entry.imageKey });
}
