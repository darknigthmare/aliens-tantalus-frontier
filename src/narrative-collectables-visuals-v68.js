export const QZ17_COLLECTABLES_SHEET_V68 = Object.freeze({
  id: 'prop.qz17-narrative-collectables.v68',
  imageKey: 'qz17NarrativeCollectablesV68',
  path: '/assets/openai/sprites/normalized/props/qz17-narrative-collectables-atlas-v68.png',
  columns: 2,
  rows: 2,
  cellWidth: 512,
  cellHeight: 512,
  guard: 16,
  provenance: 'OpenAI ImageGen + deterministic chroma-key normalization',
  originalProjectAsset: true,
  releaseReady: true
});

export const QZ17_COLLECTABLE_CELLS_V68 = Object.freeze({
  'qz17-pda-loading-chief': Object.freeze({ column: 0, row: 0 }),
  'qz17-email-logistics-denial': Object.freeze({ column: 1, row: 0 }),
  'qz17-black-box-forklift': Object.freeze({ column: 0, row: 1 }),
  'qz17-cargo-seal-fragment': Object.freeze({ column: 1, row: 1 })
});

export function resolveQz17CollectableCellV68(id) {
  return QZ17_COLLECTABLE_CELLS_V68[String(id || '').trim()] || null;
}

export function qz17CollectableVisualReportV68() {
  const cells = Object.values(QZ17_COLLECTABLE_CELLS_V68);
  const distinct = new Set(cells.map(({ column, row }) => `${column}:${row}`));
  const invalid = cells.filter(({ column, row }) => (
    !Number.isInteger(column)
    || !Number.isInteger(row)
    || column < 0
    || row < 0
    || column >= QZ17_COLLECTABLES_SHEET_V68.columns
    || row >= QZ17_COLLECTABLES_SHEET_V68.rows
  )).length;
  return Object.freeze({
    schema: 68,
    cells: cells.length,
    distinctCells: distinct.size,
    invalid,
    runtimeReady: Boolean(QZ17_COLLECTABLES_SHEET_V68.releaseReady && !invalid && distinct.size === cells.length)
  });
}
