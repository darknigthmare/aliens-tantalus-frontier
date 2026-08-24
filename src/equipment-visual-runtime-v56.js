const EQUIPMENT_CATALOG_BASE_COUNT_V56 = 30;
const EQUIPMENT_CATALOG_RECORD_COUNT_V56 = 106;

export const EQUIPMENT_SHEET_GRID_V56 = Object.freeze({
  width: 512,
  height: 512,
  columns: 2,
  rows: 2,
  cellWidth: 256,
  cellHeight: 256
});

export const EQUIPMENT_SHEET_STATES_V56 = Object.freeze([
  Object.freeze({ id: 'packed', column: 0, row: 0 }),
  Object.freeze({ id: 'ready', column: 1, row: 0 }),
  Object.freeze({ id: 'use', column: 0, row: 1 }),
  Object.freeze({ id: 'spent', column: 1, row: 1 })
]);

const DEFAULT_EQUIPMENT_STATE_FRAMES_V56 = Object.freeze(Object.fromEntries(
  EQUIPMENT_SHEET_STATES_V56.map((state) => [state.id, state])
));

const profile = ({
  baseNumber,
  name,
  canonicalName = name,
  file,
  referenceStatus,
  referenceScope = 'authored-visible-angles',
  sheetId = `equipment.${file.replace(/-use-sheet\.png$/, '')}.use`,
  imageKey = `equipmentV56:${baseNumber}`,
  path = `/assets/openai/sprites/normalized/tools/${file}`,
  rawPath = `/assets/openai/sprites/tools/${file}`,
  contractId = 'TOOL_EQUIPMENT_2X2',
  grid = EQUIPMENT_SHEET_GRID_V56,
  clipSet = 'equipment-use-v56',
  pivot = 'equipment-center',
  hitbox = 'equipment-pickup',
  renderWidth = 72,
  renderHeight = 72,
  stateFrames = DEFAULT_EQUIPMENT_STATE_FRAMES_V56,
  manifestAlias = false
}) => Object.freeze({
  baseNumber,
  catalogId: `equipment-${String(baseNumber).padStart(3, '0')}`,
  name,
  canonicalName,
  sheetId,
  imageKey,
  path,
  rawPath,
  contractId,
  width: grid.width,
  height: grid.height,
  columns: grid.columns,
  rows: grid.rows,
  cellWidth: grid.cellWidth,
  cellHeight: grid.cellHeight,
  clipSet,
  pivot,
  hitbox,
  renderWidth,
  renderHeight,
  stateFrames: Object.freeze({ ...stateFrames }),
  manifestAlias,
  referenceStatus,
  referenceScope,
  identityVerified: true
});

// Only visually accepted, normalized files enter the runtime registry. Cutting
// Torch intentionally aliases the existing weapon atlas and is counted once.
export const EQUIPMENT_VISUAL_PROFILES_V56 = Object.freeze([
  profile({
    baseNumber: 1,
    name: 'Motion Tracker',
    canonicalName: 'M314 Motion Tracker',
    file: 'm314-motion-tracker-use-sheet.png',
    referenceStatus: 'CANON_REFERENCE_LICENSED_MULTIANGLE',
    referenceScope: 'licensed-multi-angle'
  }),
  profile({
    baseNumber: 2,
    name: 'Access Tuner',
    canonicalName: 'Security Access Tuner',
    file: 'security-access-tuner-use-sheet.png',
    referenceStatus: 'CANON_REFERENCE_VISIBLE_ANGLES',
    referenceScope: 'documented-front-angles'
  }),
  profile({
    baseNumber: 3,
    name: 'Maintenance Jack',
    file: 'maintenance-jack-use-sheet.png',
    referenceStatus: 'CANON_REFERENCE_VISIBLE_ANGLES',
    referenceScope: 'documented-side-angles'
  }),
  profile({
    baseNumber: 4,
    name: 'Cutting Torch',
    file: 'cutting-torch-action-sheet.png',
    referenceStatus: 'CANON_REFERENCE',
    referenceScope: 'licensed-dedicated-action-sheet',
    sheetId: 'weapon.cutting-torch.action',
    imageKey: 'weaponV56:29',
    path: '/assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png',
    rawPath: '/assets/openai/sprites/weapons/cutting-torch-action-sheet.png',
    contractId: 'WEAPON_TOOL_4X4',
    grid: Object.freeze({ width: 1024, height: 1024, columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 }),
    clipSet: 'weapon-action-v56',
    pivot: 'weapon-grip',
    hitbox: 'weapon-pickup',
    renderWidth: 64,
    renderHeight: 52,
    stateFrames: Object.freeze({
      packed: Object.freeze({ id: 'packed', column: 0, row: 0, frame: 0 }),
      ready: Object.freeze({ id: 'ready', column: 1, row: 0, frame: 1 }),
      use: Object.freeze({ id: 'use', column: 0, row: 1, frame: 4 }),
      spent: Object.freeze({ id: 'spent', column: 0, row: 3, frame: 12 })
    }),
    manifestAlias: true
  }),
  profile({ baseNumber: 5, name: 'Flashlight', file: 'flashlight-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 6, name: 'Medkit', file: 'medkit-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 7, name: 'Trauma Kit', file: 'trauma-kit-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 8, name: 'Rebreather', file: 'rebreather-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({
    baseNumber: 9,
    name: 'M3 Personnel Armor',
    file: 'm3-personnel-armor-use-sheet.png',
    referenceStatus: 'CANON_REFERENCE',
    referenceScope: 'licensed-multi-angle'
  }),
  profile({
    baseNumber: 10,
    name: 'APE Suit',
    canonicalName: 'APEsuit Mk.3 (Aliens: Fireteam Elite)',
    file: 'apesuit-mk3-use-sheet.png',
    referenceStatus: 'CANON_REFERENCE_VISIBLE_ANGLES',
    referenceScope: 'official-promotional-front-three-quarter-angles'
  }),
  profile({ baseNumber: 11, name: 'Pressure Suit', file: 'pressure-suit-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 12, name: 'Hazmat Suit', file: 'hazmat-suit-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 13, name: 'Welding Kit', file: 'welding-kit-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 14, name: 'Portable Battery', file: 'portable-battery-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 15, name: 'Seismic Surveyor', file: 'seismic-surveyor-use-sheet.png', referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 16, name: 'Pathogen Scanner', file: 'pathogen-scanner-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 17, name: 'Neuro-Link Helmet', file: 'neuro-link-helmet-use-sheet.png', referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 18, name: 'ATARAX Control Rig', file: 'atarax-control-rig-use-sheet.png', referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 19, name: 'Ripper Xenoarmor', file: 'ripper-xenoarmor-use-sheet.png', referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 20, name: 'Portable Sentry', file: 'portable-sentry-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 21, name: 'Ammo Satchel', file: 'ammo-satchel-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 22, name: 'Drone Controller', file: 'drone-controller-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 23, name: 'Signal Jammer', file: 'signal-jammer-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 24, name: 'Cryo Mine', file: 'cryo-mine-use-sheet.png', referenceStatus: 'PROJECT_ORIGINAL' }),
  profile({ baseNumber: 25, name: 'Incinerator Fuel Pack', file: 'incinerator-fuel-pack-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 26, name: 'Electroshock Trap', file: 'electroshock-trap-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 27, name: 'Catch Pole', file: 'catch-pole-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 28, name: 'Portable Quarantine', file: 'portable-quarantine-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 29, name: 'Synthetic Repair Kit', file: 'synthetic-repair-kit-use-sheet.png', referenceStatus: 'PROJECT_ADAPTATION' }),
  profile({ baseNumber: 30, name: 'Colony Beacon', file: 'colony-beacon-use-sheet.png', referenceStatus: 'PROJECT_ORIGINAL' })
]);

export const EQUIPMENT_VISUAL_BLOCKED_V56 = Object.freeze([]);
export const EQUIPMENT_VISUAL_BASE_COUNT_V56 = EQUIPMENT_VISUAL_PROFILES_V56.length;
export const EQUIPMENT_VISUAL_DEDICATED_ATLAS_COUNT_V56 = EQUIPMENT_VISUAL_PROFILES_V56
  .filter((entry) => !entry.manifestAlias).length;
export const EQUIPMENT_VISUAL_ASSETS_V56 = Object.freeze(Object.fromEntries(
  EQUIPMENT_VISUAL_PROFILES_V56.map((entry) => [entry.imageKey, entry.path])
));

const byBaseNumber = new Map(EQUIPMENT_VISUAL_PROFILES_V56.map((entry) => [entry.baseNumber, entry]));
const bySheetId = new Map(EQUIPMENT_VISUAL_PROFILES_V56.map((entry) => [entry.sheetId, entry]));
const byName = new Map(EQUIPMENT_VISUAL_PROFILES_V56.flatMap((entry) => [
  [entry.name, entry],
  [entry.canonicalName, entry]
]));

const catalogNumber = (source = {}) => {
  const match = String(source.id || '').match(/^equipment-(\d{3})-/);
  return match ? Number(match[1]) : 0;
};

const baseIdentityStatus = (entry) => entry.referenceStatus === 'CANON_REFERENCE_VISIBLE_ANGLES'
  ? 'canon-visible-angle'
  : entry.referenceStatus.startsWith('CANON_REFERENCE')
    ? 'exact'
    : entry.referenceStatus === 'PROJECT_ORIGINAL' ? 'project-original' : 'project-adaptation';

export function resolveEquipmentVisualProfileV56(source = {}) {
  const sourceId = String(source.id || '').trim();
  if (sourceId && !/^equipment-\d{3}-/.test(sourceId)) return null;
  const direct = bySheetId.get(String(source.sheetId || '').trim());
  const number = catalogNumber(source);
  if (number > EQUIPMENT_CATALOG_RECORD_COUNT_V56) return null;

  const baseNumber = number ? ((number - 1) % EQUIPMENT_CATALOG_BASE_COUNT_V56) + 1 : 0;
  const baseName = String(source.name || '').split(/\s+—\s+/u)[0].trim();
  const named = byName.get(baseName);
  const entry = direct || (baseNumber ? byBaseNumber.get(baseNumber) : named);
  if (!entry) return null;
  if (!direct && baseName && (!named || named.baseNumber !== entry.baseNumber)) return null;

  const exact = Boolean(
    direct
    || (!number && (baseName === entry.name || baseName === entry.canonicalName))
    || number === entry.baseNumber
  );
  const sourceName = String(source.name || '').trim();
  const matchedName = [entry.name, entry.canonicalName].find((candidate) => sourceName.startsWith(candidate));
  const variantSuffix = matchedName ? sourceName.slice(matchedName.length) : '';
  const identityStatus = exact ? baseIdentityStatus(entry) : 'authored-family';
  return Object.freeze({
    ...entry,
    catalogNumber: number || entry.baseNumber,
    displayName: `${entry.canonicalName}${variantSuffix}`,
    exact,
    identityStatus,
    identityVerified: exact,
    canonExact: exact
      && entry.referenceStatus.startsWith('CANON_REFERENCE')
      && entry.referenceStatus !== 'CANON_REFERENCE_VISIBLE_ANGLES',
    turnaroundExact: exact && entry.referenceScope === 'licensed-multi-angle',
    approximate: !exact,
    fallbackReason: exact
      ? null
      : `Le grade de catalogue réutilise la plaque validée de ${entry.name}; aucune finition propre à ce grade n'est dessinée.`
  });
}

export function resolveEquipmentVisualStateV56(source = {}) {
  const entry = resolveEquipmentVisualProfileV56(source);
  if (!entry) return null;
  const stateId = source.spent || source.empty || source.folded ? 'spent'
    : source.using || source.deployed ? 'use'
      : source.ready || source.equipped ? 'ready'
        : 'packed';
  return Object.freeze({
    sheetId: entry.sheetId,
    imageKey: entry.imageKey,
    stateId,
    frame: entry.stateFrames[stateId] || null
  });
}
