export const CARGO_BRUTAL_PROPS_SHEET_V67 = Object.freeze({
  id: 'prop.cargo-brutal.atlas.v67',
  imageKey: 'cargoBrutalPropsV67',
  path: '/assets/openai/sprites/normalized/props/cargo-brutal-props-atlas-v67.png',
  columns: 4,
  rows: 2,
  cellWidth: 256,
  cellHeight: 256,
  guard: 16,
  sourceFacing: 1,
  identityVerified: true,
  releaseReady: true
});

export const CARGO_BRUTAL_SURVIVORS_SHEET_V67 = Object.freeze({
  id: 'npc.cargo-brutal-survivors.v67',
  imageKey: 'cargoSurvivorsV67',
  path: '/assets/openai/sprites/normalized/npcs/cargo-survivors-shaw-ruiz-kessler-v67.png',
  columns: 4,
  rows: 3,
  cellWidth: 256,
  cellHeight: 256,
  guard: 16,
  sourceFacing: 1,
  identityVerified: true,
  releaseReady: true
});

export const CARGO_BRUTAL_VISUAL_REGISTRY_V67 = Object.freeze({
  [CARGO_BRUTAL_PROPS_SHEET_V67.id]: CARGO_BRUTAL_PROPS_SHEET_V67,
  [CARGO_BRUTAL_SURVIVORS_SHEET_V67.id]: CARGO_BRUTAL_SURVIVORS_SHEET_V67
});

export const CARGO_BRUTAL_PROP_CELLS_V67 = Object.freeze({
  'cargo-block-alpha': Object.freeze({ column: 0, row: 0 }),
  'cargo-block-bravo': Object.freeze({ column: 1, row: 0 }),
  'cargo-block-charlie': Object.freeze({ column: 2, row: 0 }),
  'core-off': Object.freeze({ column: 3, row: 0 }),
  'core-on': Object.freeze({ column: 0, row: 1 }),
  'coupler-off': Object.freeze({ column: 1, row: 1 }),
  'coupler-on': Object.freeze({ column: 2, row: 1 }),
  'convoy-capsule': Object.freeze({ column: 3, row: 1 })
});

export const CARGO_BRUTAL_SURVIVOR_ROWS_V67 = Object.freeze({
  'cargo-survivor-shaw': 0,
  'cargo-survivor-ruiz': 1,
  'cargo-survivor-kessler': 2
});

export function resolveCargoBrutalSurvivorFrameV67(actor = {}) {
  const row = CARGO_BRUTAL_SURVIVOR_ROWS_V67[actor.id];
  if (!Number.isInteger(row)) return null;
  if (actor.alive === false || actor.downed === true) return Object.freeze({ row, column: 2, action: 'downed' });
  if (actor.hurtClock > 0 || actor.action === 'hurt' || actor.action === 'brace') return Object.freeze({ row, column: 2, action: 'hurt' });
  if (actor.action === 'evacuation' || actor.action === 'run') return Object.freeze({ row, column: 3, action: 'evacuation' });
  if (actor.action === 'walk') return Object.freeze({ row, column: 1, action: 'walk' });
  return Object.freeze({ row, column: 0, action: actor.action === 'secured' ? 'secured' : 'waiting' });
}

export function cargoBrutalVisualRuntimeReportV67() {
  const sheets = Object.values(CARGO_BRUTAL_VISUAL_REGISTRY_V67);
  const invalid = sheets.filter((entry) => (
    !entry.id
    || !entry.imageKey
    || !entry.path
    || entry.columns * entry.cellWidth <= 0
    || entry.rows * entry.cellHeight <= 0
    || entry.guard < 0
    || entry.guard * 2 >= Math.min(entry.cellWidth, entry.cellHeight)
  )).map((entry) => entry.id);
  return Object.freeze({
    schema: 67,
    sheets: sheets.length,
    runtimeReady: sheets.filter((entry) => entry.releaseReady && entry.identityVerified).length,
    invalid: Object.freeze(invalid)
  });
}
