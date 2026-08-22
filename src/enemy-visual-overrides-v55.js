const MODIFIER_PREFIXES = Object.freeze([
  'Acid-Blooded',
  'Cryo-Adapted',
  'Vacuum-Adapted',
  'Neuro-Linked',
  'Hive Guard',
  'Albino',
  'Armored',
  'Apex',
  'Juvenile',
  'Elder'
]);

export const ENEMY_VISUAL_OVERRIDE_IDENTITY_V55 = Object.freeze({
  exact: 'exact',
  family: 'authored-family'
});

const hitbox = (id, sizeClass, x, y, width, height) => Object.freeze({
  id,
  sizeClass,
  x,
  y,
  width,
  height
});

export const ENEMY_VISUAL_OVERRIDE_HITBOXES_V55 = Object.freeze({
  'ovomorph-small': hitbox('ovomorph-small', 'small', 82, 92, 92, 148),
  'chestburster-small': hitbox('chestburster-small', 'small', 54, 168, 148, 72),
  'spitter-medium': hitbox('spitter-medium', 'medium', 28, 132, 200, 108),
  'lurker-medium': hitbox('lurker-medium', 'medium', 32, 138, 192, 102),
  'praetorian-large': hitbox('praetorian-large', 'large', 44, 48, 168, 192),
  'crusher-large': hitbox('crusher-large', 'large', 24, 100, 216, 140),
  'carrier-large': hitbox('carrier-large', 'large', 30, 58, 196, 182),
  'ravager-large': hitbox('ravager-large', 'large', 38, 48, 180, 192)
});

const renderSize = (width, height) => Object.freeze({ width, height });

const override = ({
  archetype,
  spriteKey,
  sheetId,
  path,
  hitboxId,
  width,
  height,
  profileIds
}) => {
  const frozenProfileIds = Object.freeze([...profileIds]);
  const baseProfileId = frozenProfileIds[0];
  return Object.freeze({
    archetype,
    spriteKey,
    sheetId,
    path,
    hitboxId,
    hitbox: ENEMY_VISUAL_OVERRIDE_HITBOXES_V55[hitboxId],
    renderSize: renderSize(width, height),
    renderWidth: width,
    renderHeight: height,
    sourceFacing: 1,
    identityStatus: ENEMY_VISUAL_OVERRIDE_IDENTITY_V55.exact,
    approximate: false,
    fallbackReason: null,
    baseProfileId,
    catalogProfileId: baseProfileId,
    profileIds: frozenProfileIds
  });
};

export const ENEMY_VISUAL_OVERRIDES_V55 = Object.freeze({
  Praetorian: override({
    archetype: 'Praetorian',
    spriteKey: 'xenoPraetorian',
    sheetId: 'enemy.xenomorph-praetorian.action',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-praetorian-action-sheet.png',
    hitboxId: 'praetorian-large',
    width: 196,
    height: 150,
    profileIds: [
      'enemy-007-praetorian',
      'enemy-059-albino-praetorian',
      'enemy-111-armored-praetorian',
      'enemy-163-acid-blooded-praetorian',
      'enemy-215-cryo-adapted-praetorian',
      'enemy-267-vacuum-adapted-praetorian',
      'enemy-319-hive-guard-praetorian',
      'enemy-371-apex-praetorian',
      'enemy-423-juvenile-praetorian',
      'enemy-475-elder-praetorian',
      'enemy-527-neuro-linked-praetorian'
    ]
  }),
  Spitter: override({
    archetype: 'Spitter',
    spriteKey: 'xenoSpitter',
    sheetId: 'enemy.xenomorph-spitter.action',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-spitter-action-sheet.png',
    hitboxId: 'spitter-medium',
    width: 176,
    height: 104,
    profileIds: [
      'enemy-010-spitter',
      'enemy-062-albino-spitter',
      'enemy-114-armored-spitter',
      'enemy-166-acid-blooded-spitter',
      'enemy-218-cryo-adapted-spitter',
      'enemy-270-vacuum-adapted-spitter',
      'enemy-322-hive-guard-spitter',
      'enemy-374-apex-spitter',
      'enemy-426-juvenile-spitter',
      'enemy-478-elder-spitter',
      'enemy-530-neuro-linked-spitter'
    ]
  }),
  Ovomorph: override({
    archetype: 'Ovomorph',
    spriteKey: 'ovomorph',
    sheetId: 'enemy.ovomorph.cycle',
    path: '/assets/openai/sprites/normalized/enemies/ovomorph-cycle-sheet.png',
    hitboxId: 'ovomorph-small',
    width: 92,
    height: 122,
    profileIds: [
      'enemy-001-ovomorph',
      'enemy-053-albino-ovomorph',
      'enemy-105-armored-ovomorph',
      'enemy-157-acid-blooded-ovomorph',
      'enemy-209-cryo-adapted-ovomorph',
      'enemy-261-vacuum-adapted-ovomorph',
      'enemy-313-hive-guard-ovomorph',
      'enemy-365-apex-ovomorph',
      'enemy-417-juvenile-ovomorph',
      'enemy-469-elder-ovomorph',
      'enemy-521-neuro-linked-ovomorph'
    ]
  }),
  Chestburster: override({
    archetype: 'Chestburster',
    spriteKey: 'chestburster',
    sheetId: 'enemy.chestburster.action',
    path: '/assets/openai/sprites/normalized/enemies/chestburster-action-sheet.png',
    hitboxId: 'chestburster-small',
    width: 104,
    height: 52,
    profileIds: [
      'enemy-003-chestburster',
      'enemy-055-albino-chestburster',
      'enemy-107-armored-chestburster',
      'enemy-159-acid-blooded-chestburster',
      'enemy-211-cryo-adapted-chestburster',
      'enemy-263-vacuum-adapted-chestburster',
      'enemy-315-hive-guard-chestburster',
      'enemy-367-apex-chestburster',
      'enemy-419-juvenile-chestburster',
      'enemy-471-elder-chestburster',
      'enemy-523-neuro-linked-chestburster'
    ]
  }),
  Crusher: override({
    archetype: 'Crusher',
    spriteKey: 'xenoCrusher',
    sheetId: 'enemy.xenomorph-crusher.action',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-crusher-action-sheet.png',
    hitboxId: 'crusher-large',
    width: 216,
    height: 132,
    profileIds: [
      'enemy-009-crusher',
      'enemy-061-albino-crusher',
      'enemy-113-armored-crusher',
      'enemy-165-acid-blooded-crusher',
      'enemy-217-cryo-adapted-crusher',
      'enemy-269-vacuum-adapted-crusher',
      'enemy-321-hive-guard-crusher',
      'enemy-373-apex-crusher',
      'enemy-425-juvenile-crusher',
      'enemy-477-elder-crusher',
      'enemy-529-neuro-linked-crusher'
    ]
  }),
  Lurker: override({
    archetype: 'Lurker',
    spriteKey: 'xenoLurker',
    sheetId: 'enemy.xenomorph-lurker.action',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-lurker-action-sheet.png',
    hitboxId: 'lurker-medium',
    width: 174,
    height: 92,
    profileIds: [
      'enemy-011-lurker',
      'enemy-063-albino-lurker',
      'enemy-115-armored-lurker',
      'enemy-167-acid-blooded-lurker',
      'enemy-219-cryo-adapted-lurker',
      'enemy-271-vacuum-adapted-lurker',
      'enemy-323-hive-guard-lurker',
      'enemy-375-apex-lurker',
      'enemy-427-juvenile-lurker',
      'enemy-479-elder-lurker',
      'enemy-531-neuro-linked-lurker'
    ]
  }),
  Carrier: override({
    archetype: 'Carrier',
    spriteKey: 'xenoCarrier',
    sheetId: 'enemy.xenomorph-carrier.action',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-carrier-action-sheet.png',
    hitboxId: 'carrier-large',
    width: 198,
    height: 144,
    profileIds: [
      'enemy-012-carrier',
      'enemy-064-albino-carrier',
      'enemy-116-armored-carrier',
      'enemy-168-acid-blooded-carrier',
      'enemy-220-cryo-adapted-carrier',
      'enemy-272-vacuum-adapted-carrier',
      'enemy-324-hive-guard-carrier',
      'enemy-376-apex-carrier',
      'enemy-428-juvenile-carrier',
      'enemy-480-elder-carrier',
      'enemy-532-neuro-linked-carrier'
    ]
  }),
  Ravager: override({
    archetype: 'Ravager',
    spriteKey: 'xenoRavager',
    sheetId: 'enemy.xenomorph-ravager.action',
    path: '/assets/openai/sprites/normalized/enemies/xenomorph-ravager-action-sheet.png',
    hitboxId: 'ravager-large',
    width: 202,
    height: 158,
    profileIds: [
      'enemy-013-ravager',
      'enemy-065-albino-ravager',
      'enemy-117-armored-ravager',
      'enemy-169-acid-blooded-ravager',
      'enemy-221-cryo-adapted-ravager',
      'enemy-273-vacuum-adapted-ravager',
      'enemy-325-hive-guard-ravager',
      'enemy-377-apex-ravager',
      'enemy-429-juvenile-ravager',
      'enemy-481-elder-ravager',
      'enemy-533-neuro-linked-ravager'
    ]
  })
});

export const ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V55 = Object.freeze(Object.keys(ENEMY_VISUAL_OVERRIDES_V55));

const familyReuse = (entry, catalogProfileId, label = catalogProfileId) => Object.freeze({
  ...entry,
  catalogProfileId,
  identityStatus: ENEMY_VISUAL_OVERRIDE_IDENTITY_V55.family,
  approximate: true,
  fallbackReason: `La plaque exacte de l'archétype ${entry.archetype} est réemployée pour ${label}; le modifier systémique n'a pas de dessin distinct.`
});

export const ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55 = Object.freeze(Object.fromEntries(
  Object.values(ENEMY_VISUAL_OVERRIDES_V55).flatMap((entry) => (
    entry.profileIds.map((profileId, index) => [
      profileId,
      index === 0 ? entry : familyReuse(entry, profileId)
    ])
  ))
));

export const ENEMY_VISUAL_OVERRIDE_PROFILE_IDS_V55 = Object.freeze(Object.keys(
  ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55
));

export const ENEMY_VISUAL_OVERRIDE_PROFILE_COUNT_V55 = ENEMY_VISUAL_OVERRIDE_PROFILE_IDS_V55.length;
export const ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V55 = Object.freeze(
  Object.values(ENEMY_VISUAL_OVERRIDES_V55).map((entry) => entry.baseProfileId)
);
export const ENEMY_VISUAL_OVERRIDE_EXACT_PROFILE_COUNT_V55 = ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V55.length;
export const ENEMY_VISUAL_OVERRIDE_FAMILY_PROFILE_COUNT_V55 =
  ENEMY_VISUAL_OVERRIDE_PROFILE_COUNT_V55 - ENEMY_VISUAL_OVERRIDE_EXACT_PROFILE_COUNT_V55;

export function resolveEnemyVisualOverrideV55(source = {}) {
  const profileId = typeof source === 'object' && source !== null
    ? String(source.id ?? '').trim()
    : '';
  if (profileId && ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55[profileId]) {
    return ENEMY_VISUAL_OVERRIDE_BY_PROFILE_ID_V55[profileId];
  }

  const rawName = typeof source === 'string'
    ? source.trim()
    : String(source?.archetype ?? source?.name ?? '').trim();
  if (!rawName) return null;
  if (ENEMY_VISUAL_OVERRIDES_V55[rawName]) return ENEMY_VISUAL_OVERRIDES_V55[rawName];

  for (const prefix of MODIFIER_PREFIXES) {
    const marker = `${prefix} `;
    if (!rawName.startsWith(marker)) continue;
    const archetype = rawName.slice(marker.length).trim();
    const entry = ENEMY_VISUAL_OVERRIDES_V55[archetype];
    return entry ? familyReuse(entry, profileId || null, rawName) : null;
  }
  return null;
}
