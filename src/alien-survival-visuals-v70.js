export const ALIEN_SURVIVAL_SYSTEMS_ATLAS_PATH_V70 = '/assets/openai/sprites/normalized/props/alien-survival-systems-atlas-v70.png';

export const ALIEN_SURVIVAL_SYSTEMS_GRID_V70 = Object.freeze({
  width: 1024,
  height: 512,
  columns: 4,
  rows: 2,
  cellWidth: 256,
  cellHeight: 256,
  guard: 8
});

const cleanText = (value) => String(value ?? '').trim();
const cleanSha256 = (value) => {
  const normalized = cleanText(value).toLowerCase();
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null;
};

const normalizeProvenance = (candidate) => {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  const provider = cleanText(candidate.provider);
  const sourceAsset = cleanText(candidate.sourceAsset);
  if (!provider || !sourceAsset) return null;
  return Object.freeze({
    provider,
    sourceAsset,
    ...(cleanText(candidate.pipeline) ? { pipeline: cleanText(candidate.pipeline) } : {}),
    ...(cleanText(candidate.promptId) ? { promptId: cleanText(candidate.promptId) } : {}),
    ...(cleanText(candidate.productionEventId) ? { productionEventId: cleanText(candidate.productionEventId) } : {})
  });
};

/**
 * Creates the immutable runtime sheet contract for the distributed asset.
 * Public metadata identifies this registry and the shipped bitmap, not source-production records.
 */
export function createAlienSurvivalSystemsSheetV70({
  contractId = '',
  expectedSha256 = '',
  metadataPath = '',
  provenance = null
} = {}) {
  const normalizedContractId = cleanText(contractId);
  const normalizedSha256 = cleanSha256(expectedSha256);
  const normalizedMetadataPath = cleanText(metadataPath);
  const normalizedProvenance = normalizeProvenance(provenance);
  const releaseReady = Boolean(normalizedContractId && normalizedSha256 && normalizedMetadataPath && normalizedProvenance);
  return Object.freeze({
    schema: 70,
    id: 'prop.alien-survival-systems.v70',
    imageKey: 'alienSurvivalSystemsV70',
    path: ALIEN_SURVIVAL_SYSTEMS_ATLAS_PATH_V70,
    ...ALIEN_SURVIVAL_SYSTEMS_GRID_V70,
    contractId: normalizedContractId || null,
    expectedSha256: normalizedSha256,
    metadataPath: normalizedMetadataPath || null,
    provenance: normalizedProvenance,
    originalProjectAsset: true,
    canonExact: false,
    assetStatus: releaseReady ? 'ready' : 'pending-art-acceptance',
    releaseReady
  });
}

export const ALIEN_SURVIVAL_SYSTEMS_SHEET_V70 = createAlienSurvivalSystemsSheetV70({
  contractId: 'alien-survival-systems-atlas-v70',
  expectedSha256: '6f3d8d37c38d6528609e870adb815f550c4d98f998379e42dc49a4046a8ce366',
  metadataPath: 'src/alien-survival-visuals-v70.js',
  provenance: {
    provider: 'OpenAI ImageGen',
    sourceAsset: 'assets/openai/sprites/normalized/props/alien-survival-systems-atlas-v70.png'
  }
});

export const ALIEN_SURVIVAL_SYSTEM_CELL_ORDER_V70 = Object.freeze([
  'power-distributor-off',
  'life-support-powered',
  'security-powered',
  'cctv-powered',
  'pressure-valve',
  'cctv-console',
  'airlock-welding',
  'self-destruct-armed'
]);

const ALIEN_SURVIVAL_SYSTEM_CELL_ALIASES_V70 = Object.freeze({
  'breaker-off': 'power-distributor-off',
  'breaker-life-support': 'life-support-powered',
  'breaker-security': 'security-powered',
  'breaker-cctv': 'cctv-powered',
  'welded-seam': 'airlock-welding'
});

export const ALIEN_SURVIVAL_SYSTEM_CELLS_V70 = Object.freeze(Object.fromEntries(
  ALIEN_SURVIVAL_SYSTEM_CELL_ORDER_V70.map((id, index) => [id, Object.freeze({
    id,
    column: index % ALIEN_SURVIVAL_SYSTEMS_GRID_V70.columns,
    row: Math.floor(index / ALIEN_SURVIVAL_SYSTEMS_GRID_V70.columns)
  })])
));

export const ALIEN_SURVIVAL_REUSED_ASSETS_V70 = Object.freeze({
  'welding-kit': Object.freeze({
    id: 'welding-kit',
    imageKey: 'equipmentV56:13',
    sheetId: 'equipment.welding-kit.use',
    path: '/assets/openai/sprites/normalized/tools/welding-kit-use-sheet.png',
    contractId: 'TOOL_EQUIPMENT_2X2',
    state: 'use',
    purpose: 'airlock-welding'
  }),
  'portable-battery': Object.freeze({
    id: 'portable-battery',
    imageKey: 'equipmentV56:14',
    sheetId: 'equipment.portable-battery.use',
    path: '/assets/openai/sprites/normalized/tools/portable-battery-use-sheet.png',
    contractId: 'TOOL_EQUIPMENT_2X2',
    state: 'use',
    purpose: 'emergency-power'
  }),
  'pressure-suit': Object.freeze({
    id: 'pressure-suit',
    imageKey: 'equipmentV56:11',
    sheetId: 'equipment.pressure-suit.use',
    path: '/assets/openai/sprites/normalized/tools/pressure-suit-use-sheet.png',
    contractId: 'TOOL_EQUIPMENT_2X2',
    state: 'ready',
    purpose: 'vacuum-protection'
  }),
  'pressure-airlock': Object.freeze({
    id: 'pressure-airlock',
    imageKey: 'missionDoorStatesV58',
    sheetId: 'mission-door-states-v58',
    path: '/assets/openai/metroidvania/props/mission-door-states-v58.png',
    contractId: 'MISSION_DOOR_ATLAS_V58',
    visualRole: 'pressure-airlock',
    purpose: 'pressure-isolation'
  }),
  'acid-floor-hazard': Object.freeze({
    id: 'acid-floor-hazard',
    imageKey: 'acid',
    sheetId: 'mission-hazard-acid',
    path: '/assets/openai/metroidvania/props/acid-floor-hazard.png',
    contractId: 'MISSION_HAZARD_PROP_V51',
    purpose: 'persistent-acid-pool'
  })
});

export function resolveAlienSurvivalSystemCellV70(id) {
  const normalizedId = cleanText(id).toLowerCase();
  const resolvedId = ALIEN_SURVIVAL_SYSTEM_CELL_ALIASES_V70[normalizedId] || normalizedId;
  return ALIEN_SURVIVAL_SYSTEM_CELLS_V70[resolvedId] || null;
}

export function resolveAlienSurvivalReusedAssetV70(id) {
  return ALIEN_SURVIVAL_REUSED_ASSETS_V70[cleanText(id).toLowerCase()] || null;
}

export function alienSurvivalVisualRuntimeReportV70(sheet = ALIEN_SURVIVAL_SYSTEMS_SHEET_V70) {
  const cells = Object.values(ALIEN_SURVIVAL_SYSTEM_CELLS_V70);
  const distinctCells = new Set(cells.map(({ column, row }) => `${column}:${row}`)).size;
  const invalidCells = cells.filter(({ column, row }) => (
    !Number.isInteger(column)
    || !Number.isInteger(row)
    || column < 0
    || row < 0
    || column >= ALIEN_SURVIVAL_SYSTEMS_GRID_V70.columns
    || row >= ALIEN_SURVIVAL_SYSTEMS_GRID_V70.rows
  )).length;
  const missingReleaseMetadata = Object.freeze([
    !sheet?.contractId ? 'contractId' : null,
    !sheet?.expectedSha256 ? 'expectedSha256' : null,
    !sheet?.metadataPath ? 'metadataPath' : null,
    !sheet?.provenance ? 'provenance' : null
  ].filter(Boolean));
  return Object.freeze({
    schema: 70,
    sheets: 1,
    cells: cells.length,
    distinctCells,
    invalidCells,
    reusedAssets: Object.keys(ALIEN_SURVIVAL_REUSED_ASSETS_V70).length,
    missingReleaseMetadata,
    runtimeReady: Boolean(
      sheet?.releaseReady
      && cells.length === ALIEN_SURVIVAL_SYSTEMS_GRID_V70.columns * ALIEN_SURVIVAL_SYSTEMS_GRID_V70.rows
      && distinctCells === cells.length
      && invalidCells === 0
    )
  });
}
