export const ALPHA_BRAVO_CONSOLE_SHEET_V69 = Object.freeze({
  id: 'prop.alpha-bravo-task-consoles.v69',
  imageKey: 'alphaBravoTaskConsolesV69',
  path: '/assets/openai/sprites/normalized/props/alpha-bravo-task-consoles-atlas-v69.png',
  columns: 4,
  rows: 2,
  cellWidth: 256,
  cellHeight: 256,
  guard: 10,
  provenance: 'OpenAI ImageGen + deterministic checker cleanup',
  originalProjectAsset: true,
  canonExact: false,
  releaseReady: true
});

export const ALPHA_BRAVO_CONSOLE_ROWS_V69 = Object.freeze({
  alpha: 0,
  bravo: 1
});

export const ALPHA_BRAVO_CONSOLE_COLUMNS_V69 = Object.freeze({
  available: 0,
  idle: 0,
  reserved: 1,
  working: 2,
  complete: 3,
  completed: 3
});

export function resolveAlphaBravoConsoleCellV69(teamId, state = 'available') {
  const row = ALPHA_BRAVO_CONSOLE_ROWS_V69[String(teamId || '').trim().toLowerCase()];
  const column = ALPHA_BRAVO_CONSOLE_COLUMNS_V69[String(state || '').trim().toLowerCase()];
  if (!Number.isInteger(row) || !Number.isInteger(column)) return null;
  return Object.freeze({ column, row });
}

export function alphaBravoVisualRuntimeReportV69() {
  const cells = [];
  for (const teamId of Object.keys(ALPHA_BRAVO_CONSOLE_ROWS_V69)) {
    for (const state of ['available', 'reserved', 'working', 'complete']) {
      cells.push(resolveAlphaBravoConsoleCellV69(teamId, state));
    }
  }
  return Object.freeze({
    schema: 69,
    sheets: 1,
    cells: cells.length,
    distinctCells: new Set(cells.map(({ column, row }) => `${column}:${row}`)).size,
    runtimeReady: Boolean(ALPHA_BRAVO_CONSOLE_SHEET_V69.releaseReady)
  });
}
