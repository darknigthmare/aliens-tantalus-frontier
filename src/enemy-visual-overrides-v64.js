const exactOverride = ({
  archetype,
  spriteKey,
  sheetId,
  path,
  hitboxId,
  width,
  height,
  baseProfileId,
  continuity,
  excelIds,
  referenceUrls
}) => Object.freeze({
  archetype,
  spriteKey,
  sheetId,
  path,
  hitboxId,
  renderSize: Object.freeze({ width, height }),
  renderWidth: width,
  renderHeight: height,
  sourceFacing: 1,
  identityStatus: 'exact',
  approximate: false,
  fallbackReason: null,
  baseProfileId,
  catalogProfileId: baseProfileId,
  wave: 'v64',
  referenceLocked: true,
  referenceStatus: 'CANON_REFERENCE',
  canonExact: true,
  continuity,
  excelIds: Object.freeze(excelIds),
  referenceUrls: Object.freeze(referenceUrls)
});

export const ENEMY_VISUAL_OVERRIDES_V64 = Object.freeze({
  Newborn: exactOverride({
    archetype: 'Newborn',
    spriteKey: 'newbornV64',
    sheetId: 'enemy.newborn.action.v64',
    path: '/assets/openai/sprites/normalized/enemies/newborn-action-sheet-v64.png',
    hitboxId: 'newborn-tall',
    width: 150,
    height: 184,
    baseProfileId: 'enemy-569-newborn',
    continuity: 'Alien Resurrection (1997)',
    excelIds: ['CAS-0037', 'RAC-0040'],
    referenceUrls: ['https://necaonline.com/2019/02/alien-resurrection-7-scale-action-figure-deluxe-newborn/']
  }),
  Offspring: exactOverride({
    archetype: 'Offspring',
    spriteKey: 'offspringV64',
    sheetId: 'enemy.offspring.action.v64',
    path: '/assets/openai/sprites/normalized/enemies/offspring-action-sheet-v64.png',
    hitboxId: 'offspring-tall',
    width: 144,
    height: 190,
    baseProfileId: 'enemy-570-offspring',
    continuity: 'Alien: Romulus (2024)',
    excelIds: ['CAS-0038', 'RAC-0041'],
    referenceUrls: ['https://www.legacyefx.com/alien-romulus']
  }),
  Predalien: exactOverride({
    archetype: 'Predalien',
    spriteKey: 'predalienV64',
    sheetId: 'enemy.predalien.action.v64',
    path: '/assets/openai/sprites/normalized/enemies/predalien-action-sheet-v64.png',
    hitboxId: 'predalien-large',
    width: 205,
    height: 165,
    baseProfileId: 'enemy-571-predalien',
    continuity: 'Aliens vs. Predator: Requiem (2007)',
    excelIds: ['CAS-0036'],
    referenceUrls: [
      'https://necaonline.com/2011/03/just-in-time-for-halloween-the-hybrid/',
      'https://designstudiopress.com/products/avp-requiem'
    ]
  })
});

export const ENEMY_VISUAL_OVERRIDE_ARCHETYPES_V64 = Object.freeze(
  Object.keys(ENEMY_VISUAL_OVERRIDES_V64)
);

export const ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V64 = Object.freeze(
  Object.values(ENEMY_VISUAL_OVERRIDES_V64).map((entry) => entry.baseProfileId)
);

const BY_ID = new Map(
  Object.values(ENEMY_VISUAL_OVERRIDES_V64).map((entry) => [entry.baseProfileId, entry])
);

export function resolveEnemyVisualOverrideV64(source = {}) {
  const profileId = typeof source === 'object' && source !== null
    ? String(source.id ?? '').trim()
    : '';
  if (profileId && BY_ID.has(profileId)) return BY_ID.get(profileId);
  const name = typeof source === 'string'
    ? source.trim()
    : String(source?.archetype ?? source?.name ?? '').trim();
  return ENEMY_VISUAL_OVERRIDES_V64[name] ?? null;
}
